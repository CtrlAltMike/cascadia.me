import { test, expect } from '@playwright/test';
import { loadSignalsRegistry } from '../signals/scripts/registry-loader.mjs';
import { assertIntegratedRecords, assertEvidenceUnchanged, contract } from './helpers/integration-contract.mjs';

test('integrated candidate permits only the eight exact scoped amendments and preserves evidence', () => {
  assertEvidenceUnchanged();
  assertIntegratedRecords(loadSignalsRegistry().records);
  expect(Object.fromEntries(contract.corrections.map(c => [c.recordId, c.fields.map(f => f.key).sort()]))).toEqual({
    'wsdot-alerts': ['summary'], 'king-county-ems': ['summary'], 'oregon-oem': ['editorialReview'],
    'alert-wa-cowlitz-county': ['deliveryChannels', 'optInRequired', 'summary'],
    'alert-wa-yakima-county': ['deliveryChannels', 'optInRequired', 'summary'],
    'alert-wa-king-county': ['url'], 'alert-wa-kitsap-county': ['url'],
    'alert-or-malheur-county': ['primaryAction', 'url']
  });
});

test('integration projection cannot conceal unrelated changes or redating', () => {
  for (const [id, field, value] of [
    ['oregon-oem', 'verifiedOn', '2026-11-17'],
    ['wsdot-alerts', 'summary', 'Unreviewed'],
    ['alert-or-malheur-county', 'coverageNote', 'Expanded'],
    ['fema-region-10', 'summary', 'Unreviewed']
  ]) {
    const records = structuredClone(loadSignalsRegistry().records);
    records.find(record => record.id === id)[field] = value;
    expect(() => assertIntegratedRecords(records)).toThrow();
  }
});
