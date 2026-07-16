import crypto from "node:crypto";
import { loadSignalsRegistry } from "./registry-loader.mjs";

const ACTION_TYPES = new Set(["enroll", "monitor-weather", "monitor-hazard", "transport", "support", "prepare"]);
const DELIVERY_CHANNELS = new Set(["app", "chat", "computer", "email", "mobile alert", "phone", "radio", "smart speaker", "television", "text", "web"]);
const COVERAGE_TRACK_STATUSES = new Set(["in-progress", "complete"]);
const COVERAGE_FINDING_STATUSES = new Set(["dedicated-record", "confirmed-shared-system", "official-referral"]);
const COVERAGE_REVIEW_OUTCOMES = new Set([...COVERAGE_FINDING_STATUSES, "no-public-source-confirmed", "official-site-unavailable"]);
const COVERAGE_REVIEW_TRACKS = new Set(["municipality", "indigenous-government"]);
const COVERAGE_REVIEW_METHODS = new Set(["manual-official-source-review", "official-homepage-link", "official-sitemap-entry", "official-site-and-sitemap-scan", "official-site-referral-check", "official-site-fetch", "official-roster-no-website"]);
const HTTPS = /^https:\/\//;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const { records, authorityMeta, coverageAudit, coverageReview, actionReview } = loadSignalsRegistry();
const errors = [];
const ids = new Set();
const VERB_LED_ACTION = /^(Check|Find|Learn|Monitor|Review|Set up|Sign up)\b/;

function reviewSnapshot(batchRecords) {
  return batchRecords
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((record) => [
      record.id,
      record.primaryAction.type,
      record.primaryAction.label,
      record.primaryAction.url,
      record.coverageNote,
      record.startHereEligible === false ? "start-here-withheld" : "start-here-eligible"
    ].join("\t"))
    .join("\n");
}

for (const record of records) {
  if (!record.id || ids.has(record.id)) errors.push(`Duplicate or missing id: ${record.id || "(missing)"}`);
  ids.add(record.id);
  for (const field of ["name", "organization", "publisher", "group", "place", "summary", "authorityRole", "coverageNote", "sourceRegistry", "sourceTier"]) {
    if (!record[field]) errors.push(`${record.id}: missing ${field}`);
  }
  if (!Array.isArray(record.categories) || !record.categories.length) errors.push(`${record.id}: missing categories`);
  if (!Array.isArray(record.coverageKeys) || !record.coverageKeys.length) errors.push(`${record.id}: missing coverageKeys`);
  if (!HTTPS.test(record.url || "")) errors.push(`${record.id}: invalid official URL`);
  if (!HTTPS.test(record.registryUrl || "")) errors.push(`${record.id}: invalid registry URL`);
  if (!DATE.test(record.verifiedOn || "")) errors.push(`${record.id}: invalid verifiedOn date`);
  const action = record.primaryAction;
  if (!action || !ACTION_TYPES.has(action.type)) errors.push(`${record.id}: invalid primary action type`);
  if (!action?.label || !VERB_LED_ACTION.test(action.label) || action.label.length > 100) errors.push(`${record.id}: primary action label must be concise and verb-led`);
  if (!HTTPS.test(action?.url || "")) errors.push(`${record.id}: invalid primary action URL`);
  if (!Number.isFinite(action?.priority) || action.priority < 0) errors.push(`${record.id}: invalid primary action priority`);
  for (const field of ["deliveryChannels", "languages"]) {
    if (record[field] !== undefined && (!Array.isArray(record[field]) || !record[field].length)) errors.push(`${record.id}: ${field} must be a non-empty array when present`);
  }
  if (Array.isArray(record.deliveryChannels)) {
    for (const channel of record.deliveryChannels) {
      if (!DELIVERY_CHANNELS.has(channel)) errors.push(`${record.id}: unsupported delivery channel: ${channel}`);
    }
  }
  if (record.optInRequired !== undefined && typeof record.optInRequired !== "boolean") errors.push(`${record.id}: optInRequired must be a boolean when present`);
  for (const field of ["cost", "phone", "offlineFallback"]) {
    if (record[field] !== undefined && (typeof record[field] !== "string" || !record[field].trim())) errors.push(`${record.id}: ${field} must be a non-empty string when present`);
  }
  if (record.accessibilityUrl !== undefined && !HTTPS.test(record.accessibilityUrl)) errors.push(`${record.id}: invalid accessibility URL`);
}

if (records.length !== 147) errors.push(`Expected 147 records, found ${records.length}`);
if (authorityMeta?.schemaVersion !== 2) errors.push("Authority registry schemaVersion must be 2");
for (const [key, expected] of Object.entries(authorityMeta?.expected || {})) {
  if (authorityMeta.actual?.[key] !== expected) errors.push(`${key}: expected ${expected}, found ${authorityMeta.actual?.[key]}`);
}
if (coverageAudit?.schemaVersion !== 3) errors.push("Coverage audit schemaVersion must be 3");
if (!DATE.test(coverageAudit?.reviewedOn || "")) errors.push("Coverage audit requires a review date");
if (!coverageAudit?.methodology?.reviewRule || !coverageAudit?.methodology?.countRule) errors.push("Coverage audit methodology is incomplete");
if (coverageAudit?.reviewLedger !== "coverage-review.json") errors.push("Coverage audit must identify its detailed review ledger");
for (const track of ["municipalities", "indigenousGovernments"]) {
  const value = coverageAudit?.tracks?.[track];
  if (!value?.policy || !COVERAGE_TRACK_STATUSES.has(value.status) || !Array.isArray(value.officialRosters) || value.officialRosters.length !== 3 || !Array.isArray(value.baselines) || value.baselines.length !== 3) errors.push(`Coverage audit track is incomplete: ${track}`);
  const rosterCountByRegion = new Map();
  value?.officialRosters?.forEach((roster) => {
    if (!HTTPS.test(roster.url || "")) errors.push(`Coverage audit has an invalid roster URL: ${track}/${roster.region}`);
    if (!Number.isInteger(roster.knownRosterCount) || roster.knownRosterCount <= 0) errors.push(`Coverage audit has an invalid roster count: ${track}/${roster.region}`);
    if (rosterCountByRegion.has(roster.region)) errors.push(`Coverage audit repeats a roster region: ${track}/${roster.region}`);
    rosterCountByRegion.set(roster.region, roster.knownRosterCount);
  });
  value?.baselines?.forEach((baseline) => {
    const countFields = ["rosterCount", "dedicatedRecordCount", "confirmedSharedSystemCount", "officialReferralCount", "noPublicSourceConfirmedCount", "officialSiteUnavailableCount", "reviewedGovernmentCount", "remainingIndependentReview"];
    if (countFields.some((field) => !Number.isInteger(baseline[field]) || baseline[field] < 0)) errors.push(`Coverage audit has invalid baseline counts: ${track}/${baseline.region}`);
    if (baseline.rosterCount !== rosterCountByRegion.get(baseline.region)) errors.push(`Coverage audit baseline disagrees with its roster: ${track}/${baseline.region}`);
    if (baseline.reviewedGovernmentCount + baseline.remainingIndependentReview !== baseline.rosterCount) errors.push(`Coverage audit baseline does not reconcile: ${track}/${baseline.region}`);
    if (baseline.dedicatedRecordCount + baseline.confirmedSharedSystemCount + baseline.officialReferralCount + baseline.noPublicSourceConfirmedCount + baseline.officialSiteUnavailableCount !== baseline.reviewedGovernmentCount) errors.push(`Coverage audit review categories do not reconcile: ${track}/${baseline.region}`);
    if (value.status === "complete" && baseline.remainingIndependentReview !== 0) errors.push(`Complete coverage track has remaining review: ${track}/${baseline.region}`);
  });
}

if (coverageReview?.schemaVersion !== 1 || coverageReview?.status !== "complete" || !DATE.test(coverageReview?.reviewedOn || "")) {
  errors.push("Coverage review must use schemaVersion 1 and have complete status with a review date");
}
if (!coverageReview?.methodology?.scopeRule || !coverageReview?.methodology?.siteScan || !coverageReview?.methodology?.publicationRule) {
  errors.push("Coverage review methodology is incomplete");
}
if (!Array.isArray(coverageReview?.rosterScopes) || coverageReview.rosterScopes.length !== 6) errors.push("Coverage review must define six roster scopes");
const reviewScopeCounts = new Map();
for (const scope of coverageReview?.rosterScopes || []) {
  const key = `${scope.track}/${scope.region}`;
  if (!COVERAGE_REVIEW_TRACKS.has(scope.track) || reviewScopeCounts.has(key) || !Number.isInteger(scope.count) || scope.count <= 0 || !HTTPS.test(scope.url || "")) {
    errors.push(`Invalid coverage-review roster scope: ${key}`);
  }
  reviewScopeCounts.set(key, scope.count);
  if (scope.directoryUrl && !HTTPS.test(scope.directoryUrl)) errors.push(`Invalid coverage-review directory URL: ${key}`);
}
const auditTrackForReview = { municipality: "municipalities", "indigenous-government": "indigenousGovernments" };
for (const [key, count] of reviewScopeCounts) {
  const [reviewTrack, region] = key.split("/");
  const roster = coverageAudit?.tracks?.[auditTrackForReview[reviewTrack]]?.officialRosters?.find((item) => item.region === region);
  if (roster?.knownRosterCount !== count || coverageReview?.expectedCounts?.[key] !== count) errors.push(`Coverage-review scope disagrees with its official roster: ${key}`);
}
const detailedReviewKeys = new Set();
const detailedReviewCounts = new Map();
for (const group of coverageReview?.outcomeGroups || []) {
  const scopeKey = `${group.track}/${group.region}`;
  if (!reviewScopeCounts.has(scopeKey) || !COVERAGE_REVIEW_OUTCOMES.has(group.outcome) || !Array.isArray(group.entries) || group.count !== group.entries.length) {
    errors.push(`Invalid coverage-review outcome group: ${scopeKey}/${group.outcome || "(missing outcome)"}`);
    continue;
  }
  const countKey = `${scopeKey}/${group.outcome}`;
  if (detailedReviewCounts.has(countKey)) errors.push(`Repeated coverage-review outcome group: ${countKey}`);
  detailedReviewCounts.set(countKey, group.count);
  for (const entry of group.entries) {
    const entryKey = `${scopeKey}/${entry.government || "(missing government)"}`;
    if (!entry.government || detailedReviewKeys.has(entryKey)) errors.push(`Repeated or missing coverage-review government: ${entryKey}`);
    detailedReviewKeys.add(entryKey);
    const evidenceUrl = entry.evidenceUrl || entry.officialWebsite;
    if (!HTTPS.test(evidenceUrl || "")) errors.push(`Coverage-review entry lacks HTTPS evidence: ${entryKey}`);
    if (!COVERAGE_REVIEW_METHODS.has(entry.method)) errors.push(`Coverage-review entry has an invalid review method: ${entryKey}`);
    if (entry.serviceUrl && !/^(https?:\/\/|tel:)/.test(entry.serviceUrl)) errors.push(`Coverage-review entry has an invalid service URL: ${entryKey}`);
    if (entry.resourceIds !== undefined && (!Array.isArray(entry.resourceIds) || !entry.resourceIds.length || entry.resourceIds.some((id) => !ids.has(id)))) {
      errors.push(`Coverage-review entry references an invalid resource: ${entryKey}`);
    }
    if (["dedicated-record", "confirmed-shared-system"].includes(group.outcome) && !entry.resourceIds?.length) {
      errors.push(`Confirmed coverage-review entry lacks a Signals resource: ${entryKey}`);
    }
    if (group.outcome === "official-referral" && !entry.serviceUrl && !entry.resourceIds?.length) {
      errors.push(`Coverage-review referral lacks a service destination or Signals resource: ${entryKey}`);
    }
  }
}
for (const [scopeKey, expectedCount] of reviewScopeCounts) {
  const actualCount = [...detailedReviewKeys].filter((key) => key.startsWith(`${scopeKey}/`)).length;
  if (actualCount !== expectedCount || coverageReview?.counts?.[scopeKey]?.total !== expectedCount) errors.push(`Coverage-review entries do not reconcile: ${scopeKey}`);
  for (const outcome of COVERAGE_REVIEW_OUTCOMES) {
    const actual = detailedReviewCounts.get(`${scopeKey}/${outcome}`) || 0;
    if ((coverageReview?.counts?.[scopeKey]?.[outcome] || 0) !== actual) errors.push(`Coverage-review outcome count disagrees: ${scopeKey}/${outcome}`);
  }
  const [reviewTrack, region] = scopeKey.split("/");
  const baseline = coverageAudit?.tracks?.[auditTrackForReview[reviewTrack]]?.baselines?.find((item) => item.region === region);
  const baselineFields = {
    "dedicated-record": "dedicatedRecordCount",
    "confirmed-shared-system": "confirmedSharedSystemCount",
    "official-referral": "officialReferralCount",
    "no-public-source-confirmed": "noPublicSourceConfirmedCount",
    "official-site-unavailable": "officialSiteUnavailableCount"
  };
  for (const [outcome, field] of Object.entries(baselineFields)) {
    if (baseline?.[field] !== (detailedReviewCounts.get(`${scopeKey}/${outcome}`) || 0)) errors.push(`Coverage audit baseline disagrees with detailed review: ${scopeKey}/${outcome}`);
  }
}
if (detailedReviewKeys.size !== 925) errors.push(`Expected 925 detailed coverage-review entries, found ${detailedReviewKeys.size}`);

const municipalitySystems = coverageAudit?.tracks?.municipalities?.confirmedSharedSystems || [];
const indigenousFindings = coverageAudit?.tracks?.indigenousGovernments?.findings || [];
const coverageFindings = [
  ...municipalitySystems.map((item) => ({ ...item, status: "confirmed-shared-system", track: "municipalities" })),
  ...indigenousFindings.map((item) => ({ ...item, track: "indigenousGovernments" }))
];
const coverageFindingKeys = new Set();
for (const item of coverageFindings) {
  const key = `${item.track}\t${item.region}\t${item.government}`;
  if (!item.government || coverageFindingKeys.has(key)) errors.push(`Coverage audit repeats or omits a government: ${key}`);
  coverageFindingKeys.add(key);
  if (!COVERAGE_FINDING_STATUSES.has(item.status)) errors.push(`Coverage audit has an invalid finding status: ${key}`);
  if (!HTTPS.test(item.sourceUrl || "") || !DATE.test(item.reviewedOn || "")) errors.push(`Coverage audit finding lacks source provenance: ${key}`);
  if (item.resourceId && !ids.has(item.resourceId)) errors.push(`Coverage audit references an unknown resource: ${item.resourceId}`);
}
for (const gap of coverageAudit?.tracks?.municipalities?.directoryGaps || []) {
  if (!HTTPS.test(gap.sourceUrl || "") || !HTTPS.test(gap.officialRosterSourceUrl || "") || !DATE.test(gap.reviewedOn || "")) errors.push(`Coverage directory gap lacks source provenance: ${gap.region || "(unknown region)"}`);
  if (!Array.isArray(gap.governments) || gap.count !== gap.governments.length || new Set(gap.governments).size !== gap.governments.length) errors.push(`Coverage directory gap does not reconcile: ${gap.region || "(unknown region)"}`);
}
for (const item of coverageAudit?.tracks?.indigenousGovernments?.supportResources || []) {
  if (!ids.has(item.resourceId) || !item.scope) errors.push(`Coverage support resource is invalid: ${item.resourceId || "(missing resource)"}`);
}

if (actionReview?.schemaVersion !== 1 || actionReview?.status !== "confirmed" || !DATE.test(actionReview?.reviewedOn || "")) {
  errors.push("Action review must use schemaVersion 1 and have confirmed status with a review date");
}
const reviewedIds = new Set();
for (const batch of actionReview?.batches || []) {
  if (!batch.id || batch.status !== "confirmed" || !DATE.test(batch.reviewedOn || "") || !batch.method) {
    errors.push(`Invalid action-review batch: ${batch.id || "(missing id)"}`);
  }
  if (!Array.isArray(batch.evidenceUrls) || !batch.evidenceUrls.length || batch.evidenceUrls.some((url) => !HTTPS.test(url))) {
    errors.push(`${batch.id || "(missing batch)"}: action-review evidence URLs are incomplete`);
  }
  if (!Array.isArray(batch.recordIds) || !batch.recordIds.length) {
    errors.push(`${batch.id || "(missing batch)"}: action-review record IDs are incomplete`);
    continue;
  }
  const batchRecords = [];
  for (const id of batch.recordIds) {
    if (reviewedIds.has(id)) errors.push(`${id}: appears in more than one action-review batch`);
    reviewedIds.add(id);
    const record = records.find((candidate) => candidate.id === id);
    if (!record) errors.push(`${id}: action review references an unknown record`);
    else batchRecords.push(record);
  }
  const digest = crypto.createHash("sha256").update(reviewSnapshot(batchRecords)).digest("hex");
  if (digest !== batch.snapshotSha256) errors.push(`${batch.id}: action-review snapshot changed; re-review this batch`);
}
for (const record of records) {
  if (!reviewedIds.has(record.id)) errors.push(`${record.id}: missing confirmed action review`);
}
for (const item of actionReview?.manualReviewUrls || []) {
  if (!HTTPS.test(item.url || "") || item.status !== "confirmed" || !DATE.test(item.reviewedOn || "") || !item.evidence) {
    errors.push(`Invalid manual URL review: ${item.url || "(missing URL)"}`);
  }
}

const actionCounts = Object.fromEntries([...ACTION_TYPES].map((type) => [type, records.filter((record) => record.primaryAction.type === type).length]));
const coverageOutcomes = Object.fromEntries([...COVERAGE_REVIEW_OUTCOMES].map((outcome) => [outcome, [...detailedReviewCounts.entries()].filter(([key]) => key.endsWith(`/${outcome}`)).reduce((total, [, count]) => total + count, 0)]));
console.log(JSON.stringify({ records: records.length, uniqueIds: ids.size, reviewedRecords: reviewedIds.size, actionCounts, coverageReviewEntries: detailedReviewKeys.size, coverageOutcomes, errors }, null, 2));
if (errors.length) process.exitCode = 1;
