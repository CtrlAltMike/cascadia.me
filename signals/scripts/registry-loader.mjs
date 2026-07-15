import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const signalsDirectory = path.resolve(scriptDirectory, "..");

function loadAuthorityRecords() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(signalsDirectory, "authority-data.js"), "utf8"), context);
  return {
    records: context.window.SIGNALS_AUTHORITY_RECORDS || [],
    meta: context.window.SIGNALS_AUTHORITY_META || null
  };
}

function loadCoreRecords() {
  const source = fs.readFileSync(path.join(signalsDirectory, "app.js"), "utf8");
  const start = source.indexOf("const coreResources = [");
  const end = source.indexOf("const resources = [", start);
  if (start < 0 || end < 0) throw new Error("Unable to locate the Signals core resource declarations");
  const context = {
    REGION_BOUNDS: [-139.2, 40.8, -114, 60.1],
    result: null
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}\nresult = { coreResources, coreRecordDetails, CORE_VERIFIED_ON };`, context);
  const { coreResources, coreRecordDetails, CORE_VERIFIED_ON } = context.result;
  return coreResources
    .filter((resource) => !["alert-king-county", "alert-seattle"].includes(resource.id))
    .map((resource) => ({
      ...resource,
      ...coreRecordDetails[resource.id],
      rolePriority: coreRecordDetails[resource.id]?.primaryAction.priority || 5,
      sourceRegistry: "Direct official source",
      registryUrl: resource.url,
      sourceTier: "official-direct",
      verifiedOn: CORE_VERIFIED_ON
    }));
}

export function loadSignalsRegistry() {
  const authority = loadAuthorityRecords();
  return {
    records: [...loadCoreRecords(), ...authority.records],
    authorityMeta: authority.meta,
    coverageAudit: JSON.parse(fs.readFileSync(path.join(signalsDirectory, "coverage-audit.json"), "utf8")),
    coverageReview: JSON.parse(fs.readFileSync(path.join(signalsDirectory, "coverage-review.json"), "utf8")),
    actionReview: JSON.parse(fs.readFileSync(path.join(signalsDirectory, "action-review.json"), "utf8"))
  };
}
