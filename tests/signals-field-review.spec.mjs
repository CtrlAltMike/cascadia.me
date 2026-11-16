import fs from 'node:fs';
import crypto from 'node:crypto';
import { test, expect } from '@playwright/test';
import { loadSignalsRegistry } from '../signals/scripts/registry-loader.mjs';

test('Signals field corrections preserve historical review dates and untouched records', () => {
  const { records } = loadSignalsRegistry();
  const ledger = JSON.parse(fs.readFileSync(new URL('../docs/signals-reviews/2026-11-16-record-review.json', import.meta.url)));
  const changed = new Set(ledger.productionCorrections.recordIds);
  const byId = Object.fromEntries(records.map(record => [record.id, record]));
  expect(ledger.records).toHaveLength(147);
  expect(ledger.records.filter(record => record.status === 'partial-source-review')).toHaveLength(10);
  expect(ledger.records.filter(record => record.status === 'pending')).toHaveLength(137);
  for (const baseline of ledger.records) {
    const current = byId[baseline.recordId];
    expect(current.verifiedOn).toBe(baseline.priorVerifiedOn);
    if (!changed.has(current.id)) {
      expect(crypto.createHash('sha256').update(JSON.stringify(current)).digest('hex')).toBe(baseline.recordSnapshotSha256);
    }
  }
  expect(byId['alert-wa-cowlitz-county'].summary).toContain('Voice or Voice & Text');
  for (const county of ['cowlitz', 'yakima']) {
    expect(byId[`alert-wa-${county}-county`].optInRequired).toBeUndefined();
    expect(byId[`alert-wa-${county}-county`].deliveryChannels).toContain('phone');
  }
  expect(records.filter(record => record.optInRequired !== undefined)).toHaveLength(129);
  expect(byId['alert-wa-king-county'].primaryAction.url).toBe('https://www.kingcounty.gov/depts/emergency-management/alert-king-county.aspx');
  expect(byId['alert-wa-kitsap-county'].primaryAction.url).toBe('https://kcowa.us/alert');
});
