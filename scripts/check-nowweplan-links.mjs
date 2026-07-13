// Validates Cascadia's NowWePlan feeder-link contract.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowedScenarios = new Set(["earthquake", "wildfire", "flooding", "winter"]);
const activeTextExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".txt",
  ".webmanifest",
  ".xml",
  ".yaml",
  ".yml",
]);
const historicalLegacyFiles = new Set([
  "2026-07-07-cascadia-feeder-integration-plan.md",
  "docs/design/living-watershed/00-site-path.md",
  "docs/design/living-watershed/01-visual-editorial-system.md",
  "docs/design/living-watershed/02-homepage.md",
  "docs/design/living-watershed/03-guide-template-earthquake.md",
  "docs/design/living-watershed/04-primary-guide-migrations.md",
  "docs/design/living-watershed/05-atlas.md",
  "docs/design/living-watershed/06-household-capabilities.md",
  "docs/design/living-watershed/07-remaining-surfaces.md",
  "docs/design/living-watershed/08-complete-site-audit.md",
  "docs/design/living-watershed/README.md",
]);
const legacyBrand = new RegExp(["ready", "plan"].join(""), "i");
const expected = new Map([
  ["index.html", "https://nowweplan.com/start?src=cascadia"],
  ["build-your-kit.html", "https://nowweplan.com/start?src=cascadia"],
  ["earthquake.html", "https://nowweplan.com/start?src=cascadia&scenario=earthquake"],
  ["wildfire.html", "https://nowweplan.com/start?src=cascadia&scenario=wildfire"],
  ["flooding.html", "https://nowweplan.com/start?src=cascadia&scenario=flooding"],
  ["winter-storm.html", "https://nowweplan.com/start?src=cascadia&scenario=winter"],
]);

async function textFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await textFiles(absolute)));
    if (
      entry.isFile() &&
      (activeTextExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name === "CNAME")
    ) {
      files.push(absolute);
    }
  }
  return files;
}

const errors = [];
const linksByFile = new Map();
const publishableTextFiles = await textFiles(root);

for (const file of publishableTextFiles.filter((candidate) => candidate.endsWith(".html"))) {
  const relative = path.relative(root, file);
  const html = await readFile(file, "utf8");
  const links = [...html.matchAll(/href=["'](https?:\/\/nowweplan\.com\/start(?:\?[^"']*)?)["']/g)].map(
    (match) => match[1].replaceAll("&amp;", "&")
  );
  if (links.length > 0) linksByFile.set(relative, links);

  for (const link of links) {
    const url = new URL(link);
    const parameterNames = [...url.searchParams.keys()];
    if (url.origin !== "https://nowweplan.com" || url.pathname !== "/start") {
      errors.push(`${relative}: unexpected NowWePlan destination ${link}`);
    }
    if (url.searchParams.get("src") !== "cascadia") {
      errors.push(`${relative}: NowWePlan link must use src=cascadia`);
    }
    if (parameterNames.some((name) => name !== "src" && name !== "scenario")) {
      errors.push(`${relative}: NowWePlan links may contain only src and scenario`);
    }
    const scenario = url.searchParams.get("scenario");
    if (scenario && !allowedScenarios.has(scenario)) {
      errors.push(`${relative}: unsupported NowWePlan scenario ${scenario}`);
    }
  }
}

for (const file of publishableTextFiles) {
  const relative = path.relative(root, file);
  const content = await readFile(file, "utf8");
  if (historicalLegacyFiles.has(relative)) {
    if (!content.includes("Historical naming note") || !content.includes("renamed NowWePlan.com")) {
      errors.push(`${relative}: historical record is missing the NowWePlan rename notice`);
    }
    continue;
  }

  const match = legacyBrand.exec(content);
  if (match) {
    const line = content.slice(0, match.index).split("\n").length;
    errors.push(`${relative}:${line}: active source contains the legacy brand`);
  }
}

for (const [file, links] of linksByFile) {
  const expectedLink = expected.get(file);
  if (!expectedLink) {
    errors.push(`${file}: unexpected NowWePlan link placement`);
  } else if (links.length !== 1 || links[0] !== expectedLink) {
    errors.push(`${file}: expected exactly ${expectedLink}`);
  }
}

for (const [file, link] of expected) {
  if (!linksByFile.has(file)) errors.push(`${file}: missing ${link}`);
}

if (errors.length > 0) {
  throw new Error(`NowWePlan link contract failed:\n${errors.join("\n")}`);
}

const linkCount = [...linksByFile.values()].reduce((total, links) => total + links.length, 0);
console.log(`Validated ${linkCount} NowWePlan links across ${linksByFile.size} Cascadia pages.`);
