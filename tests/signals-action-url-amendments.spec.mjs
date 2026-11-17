import fs from 'node:fs';
import crypto from 'node:crypto';
import { test, expect } from '@playwright/test';
import { loadSignalsRegistry } from '../signals/scripts/registry-loader.mjs';
import { applyActionUrlAmendments } from '../signals/scripts/action-url-amendments.mjs';
const ledger = JSON.parse(fs.readFileSync(new URL('../signals/action-url-amendments.json', import.meta.url)));
const snapshot = rows => rows.slice().sort((a,b)=>a.id.localeCompare(b.id)).map(r=>[
  r.id,r.primaryAction.type,r.primaryAction.label,r.primaryAction.url,r.coverageNote,
  r.startHereEligible === false ? 'start-here-withheld' : 'start-here-eligible'
].join('\t')).join('\n');
test('Malheur URL correction retains overdue review and original action seals', () => {
  const { records, actionReview } = loadSignalsRegistry();
  const fixed = records.find(r => r.id === 'alert-or-malheur-county');
  expect(fixed.primaryAction.url).toBe('https://member.everbridge.net/148882356961282/new');
  expect(fixed.url).toBe('https://sheriff.malheurco.org/home/divisions/emergency-management/');
  expect(fixed.verifiedOn).toBe('2026-07-14');
  const result = applyActionUrlAmendments(records, ledger);
  expect(result.errors).toEqual([]);
  expect(actionReview.reviewedOn).toBe('2026-07-15');
  for (const batch of actionReview.batches) {
    const rows = result.records.filter(r=>batch.recordIds.includes(r.id));
    expect(crypto.createHash('sha256').update(snapshot(rows)).digest('hex')).toBe(batch.snapshotSha256);
  }
});
test('URL amendments reject drift, duplicates and freshness inflation', () => {
  const { records } = loadSignalsRegistry();
  for (const patch of [{actionUrl:'https://example.com/'},{informationUrl:'https://example.com/'},
    {priorVerifiedOn:'2026-11-17'},{recordId:'missing'},{evidenceUrls:[]},
    {recordReviewStatus:'complete'},{checkedOn:'invalid'}]) {
    const altered = { ...ledger, amendments:[{...ledger.amendments[0],...patch}] };
    expect(applyActionUrlAmendments(records, altered).errors.length).toBeGreaterThan(0);
  }
  expect(applyActionUrlAmendments(records,{...ledger,amendments:[...ledger.amendments,...ledger.amendments]}).errors.length).toBeGreaterThan(0);
});
