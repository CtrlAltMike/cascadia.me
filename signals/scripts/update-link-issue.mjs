import fs from "node:fs";

const reportPath = process.argv[2] || "signals-link-report.json";
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
if (!token || !repository) throw new Error("GITHUB_TOKEN and GITHUB_REPOSITORY are required");
const [owner, repo] = repository.split("/");
const title = "[Signals] Repeated official-link failures";
const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json"
};

async function github(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

const issues = await github(`/repos/${owner}/${repo}/issues?state=open&per_page=100`);
const existing = issues.find((issue) => !issue.pull_request && issue.title === title);
if (!report.confirmedFailures.length) {
  if (existing) {
    await github(`/repos/${owner}/${repo}/issues/${existing.number}/comments`, { method: "POST", body: JSON.stringify({ body: "The weekly Signals check found no links failing for two consecutive runs. Closing this maintenance issue; no public listings were changed automatically." }) });
    await github(`/repos/${owner}/${repo}/issues/${existing.number}`, { method: "PATCH", body: JSON.stringify({ state: "closed" }) });
  }
  process.exit(0);
}

const rows = report.confirmedFailures.map((failure) => {
  const records = [...new Set(failure.references.map((reference) => reference.id))].join(", ");
  return `| ${failure.status || "network"} | ${records} | ${failure.url} |`;
}).join("\n");
const body = `The following official Signals URLs failed during two consecutive weekly checks. They require manual confirmation before any directory edit. Signals has not hidden or downgraded them automatically.\n\n| Result | Records | URL |\n|---|---|---|\n${rows}\n\nLast checked: ${report.checkedAt}\n\nManual-review responses such as authentication, bot blocking, and rate limiting are retained in the workflow artifact and are not classified as broken.`;
if (existing) {
  await github(`/repos/${owner}/${repo}/issues/${existing.number}`, { method: "PATCH", body: JSON.stringify({ body }) });
} else {
  await github(`/repos/${owner}/${repo}/issues`, { method: "POST", body: JSON.stringify({ title, body }) });
}
