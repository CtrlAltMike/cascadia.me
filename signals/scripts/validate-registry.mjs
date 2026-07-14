import crypto from "node:crypto";
import { loadSignalsRegistry } from "./registry-loader.mjs";

const ACTION_TYPES = new Set(["enroll", "monitor-weather", "monitor-hazard", "transport", "support", "prepare"]);
const DELIVERY_CHANNELS = new Set(["app", "chat", "computer", "email", "mobile alert", "phone", "radio", "smart speaker", "television", "text", "web"]);
const COVERAGE_TRACK_STATUSES = new Set(["in-progress", "complete"]);
const COVERAGE_FINDING_STATUSES = new Set(["dedicated-record", "confirmed-shared-system", "official-referral"]);
const HTTPS = /^https:\/\//;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const { records, authorityMeta, coverageAudit, actionReview } = loadSignalsRegistry();
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

if (records.length !== 144) errors.push(`Expected 144 records, found ${records.length}`);
if (authorityMeta?.schemaVersion !== 2) errors.push("Authority registry schemaVersion must be 2");
for (const [key, expected] of Object.entries(authorityMeta?.expected || {})) {
  if (authorityMeta.actual?.[key] !== expected) errors.push(`${key}: expected ${expected}, found ${authorityMeta.actual?.[key]}`);
}
if (coverageAudit?.schemaVersion !== 2) errors.push("Coverage audit schemaVersion must be 2");
if (!DATE.test(coverageAudit?.reviewedOn || "")) errors.push("Coverage audit requires a review date");
if (!coverageAudit?.methodology?.reviewRule || !coverageAudit?.methodology?.countRule) errors.push("Coverage audit methodology is incomplete");
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
    const countFields = ["rosterCount", "dedicatedRecordCount", "confirmedSharedSystemCount", "officialReferralCount", "reviewedGovernmentCount", "remainingIndependentReview"];
    if (countFields.some((field) => !Number.isInteger(baseline[field]) || baseline[field] < 0)) errors.push(`Coverage audit has invalid baseline counts: ${track}/${baseline.region}`);
    if (baseline.rosterCount !== rosterCountByRegion.get(baseline.region)) errors.push(`Coverage audit baseline disagrees with its roster: ${track}/${baseline.region}`);
    if (baseline.reviewedGovernmentCount + baseline.remainingIndependentReview !== baseline.rosterCount) errors.push(`Coverage audit baseline does not reconcile: ${track}/${baseline.region}`);
    if (baseline.dedicatedRecordCount + baseline.confirmedSharedSystemCount + baseline.officialReferralCount !== baseline.reviewedGovernmentCount) errors.push(`Coverage audit review categories do not reconcile: ${track}/${baseline.region}`);
  });
}

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
console.log(JSON.stringify({ records: records.length, uniqueIds: ids.size, reviewedRecords: reviewedIds.size, actionCounts, errors }, null, 2));
if (errors.length) process.exitCode = 1;
