import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('../../', import.meta.url);
export const contract = JSON.parse(fs.readFileSync(new URL('docs/signals-reviews/2026-11-17-integration-contract.json', root)));
const baseline = JSON.parse(fs.readFileSync(new URL('docs/signals-reviews/2026-11-16-record-review.json', root)));
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);

// These are composition checks, not new source evidence. Original ledgers stay
// byte-identical. Undo only exact declared changes to compare each old snapshot.
export function assertIntegratedRecords(records) {
  assert.equal(records.length, 147);
  assert.equal(new Set(records.map(record => record.id)).size, 147);
  const projected = clone(records);
  for (const correction of contract.corrections) {
    const record = projected.find(item => item.id === correction.recordId);
    assert.ok(record, correction.recordId);
    for (const field of correction.fields) {
      assert.equal(Object.hasOwn(record, field.key), field.afterPresent);
      if (field.afterPresent) assert.deepEqual(record[field.key], field.after);
      if (field.beforePresent) record[field.key] = clone(field.before);
      else delete record[field.key];
    }
  }
  for (const old of baseline.records) {
    const record = projected.find(item => item.id === old.recordId);
    assert.equal(record.verifiedOn, old.priorVerifiedOn);
    // JSON field order is part of the original seals. Restoring deleted fields
    // can change order, so reconstruct it from the unchanged original loader.
    const ordered = Object.fromEntries((contract.baselineFieldOrder[record.id] || Object.keys(record)).map(key => [key, record[key]]));
    assert.deepEqual(Object.keys(record).sort(), Object.keys(ordered).sort());
    assert.equal(hash(JSON.stringify(ordered)), old.recordSnapshotSha256, record.id);
  }
}

export function recordsAtReviewedStage(records, stage) {
  assertIntegratedRecords(records);
  const projected = clone(records);
  for (const correction of contract.corrections.filter(item => item.stage !== stage)) {
    const record = projected.find(item => item.id === correction.recordId);
    for (const field of correction.fields) {
      if (field.beforePresent) record[field.key] = clone(field.before);
      else delete record[field.key];
    }
    const keys = contract.baselineFieldOrder[record.id];
    const ordered = Object.fromEntries(keys.filter(key => Object.hasOwn(record, key)).map(key => [key, record[key]]));
    Object.assign(ordered, Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key))));
    projected[projected.findIndex(item => item.id === record.id)] = ordered;
  }
  return projected;
}

export function assertPreservedFile(path, expectedHistoricalHash) {
  const actual = hash(fs.readFileSync(new URL(path, root)));
  if (path === 'signals/authority-data.js') {
    assert.equal(expectedHistoricalHash, contract.authorityFile.baselineSha256);
    assert.equal(actual, contract.authorityFile.integratedSha256);
  } else assert.equal(actual, expectedHistoricalHash);
}

export function assertEvidenceUnchanged() {
  for (const [path, expected] of Object.entries(contract.evidenceFiles)) {
    assert.equal(hash(fs.readFileSync(new URL(path, root))), expected, path);
  }
}
