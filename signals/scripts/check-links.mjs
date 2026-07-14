import fs from "node:fs";
import { loadSignalsRegistry } from "./registry-loader.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (!value.startsWith("--")) return pairs;
  pairs.push([value.slice(2), values[index + 1] && !values[index + 1].startsWith("--") ? values[index + 1] : true]);
  return pairs;
}, []));
const outputPath = args.output || "signals-link-report.json";
const statePath = args.state || ".signals-link-state.json";
const previousPath = args.previous || statePath;
const REVIEW_STATUSES = new Set([401, 403, 405, 429]);
const { records, coverageAudit } = loadSignalsRegistry();
const urlMap = new Map();

function addUrl(url, reference, manualReviewOnFailure = false) {
  if (!url) return;
  const entry = urlMap.get(url) || { url, references: [] };
  entry.references.push(reference);
  if (manualReviewOnFailure) entry.manualReviewOnFailure = true;
  urlMap.set(url, entry);
}

for (const record of records) {
  for (const [kind, url] of [["action", record.primaryAction.url], ["information", record.url], ["registry", record.registryUrl], ["accessibility", record.accessibilityUrl]]) {
    addUrl(url, { id: record.id, kind }, record.linkCheckManualReviewUrls?.includes(url));
  }
}

for (const [trackName, track] of Object.entries(coverageAudit?.tracks || {})) {
  for (const roster of track.officialRosters || []) {
    addUrl(roster.url, { id: `${trackName}:${roster.region}`, kind: "coverage-roster" });
  }
  for (const gap of track.directoryGaps || []) {
    addUrl(gap.sourceUrl, { id: `${trackName}:${gap.region}`, kind: "coverage-directory" });
    addUrl(gap.officialRosterSourceUrl, { id: `${trackName}:${gap.region}`, kind: "coverage-roster-data" });
  }
  for (const finding of [...(track.confirmedSharedSystems || []), ...(track.findings || [])]) {
    addUrl(finding.sourceUrl, { id: `${trackName}:${finding.government}`, kind: "coverage-evidence" });
  }
}

async function check(entry) {
  const started = Date.now();
  try {
    const response = await fetch(entry.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: "text/html,application/xhtml+xml,application/json;q=0.8,*/*;q=0.5",
        Range: "bytes=0-2048",
        "User-Agent": "Cascadia-Signals-Link-Check/1.0 (+https://cascadia.me/signals/)"
      }
    });
    await response.body?.cancel();
    const classification = response.status >= 200 && response.status < 400
      ? "reachable"
      : REVIEW_STATUSES.has(response.status)
        ? "manual-review"
        : "failure";
    return { ...entry, classification, status: response.status, finalUrl: response.url, elapsedMs: Date.now() - started };
  } catch (error) {
    return {
      ...entry,
      classification: entry.manualReviewOnFailure ? "manual-review" : "failure",
      status: null,
      error: error.message,
      manualReviewReason: entry.manualReviewOnFailure ? "Official page is known to block or fail non-browser automated requests; manually reviewed." : undefined,
      elapsedMs: Date.now() - started
    };
  }
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await callback(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

let previousFailures = [];
try {
  previousFailures = JSON.parse(fs.readFileSync(previousPath, "utf8")).failures || [];
} catch {}

const checked = await mapConcurrent([...urlMap.values()], 8, check);
const failures = checked.filter((item) => item.classification === "failure").map((item) => item.url);
const previousSet = new Set(previousFailures);
const confirmedFailures = checked.filter((item) => item.classification === "failure" && previousSet.has(item.url));
const report = {
  checkedAt: new Date().toISOString(),
  totals: {
    urls: checked.length,
    reachable: checked.filter((item) => item.classification === "reachable").length,
    manualReview: checked.filter((item) => item.classification === "manual-review").length,
    failures: failures.length,
    confirmedFailures: confirmedFailures.length
  },
  confirmedFailures,
  manualReview: checked.filter((item) => item.classification === "manual-review"),
  failures: checked.filter((item) => item.classification === "failure"),
  results: checked
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(statePath, `${JSON.stringify({ checkedAt: report.checkedAt, failures }, null, 2)}\n`);
console.log(JSON.stringify(report.totals, null, 2));
