import fs from 'node:fs';
import crypto from 'node:crypto';
import { test, expect } from '@playwright/test';
import { loadSignalsRegistry } from '../signals/scripts/registry-loader.mjs';

test('priority draft changes only approved prose and preserves audit files', () => {
  const ledger = JSON.parse(fs.readFileSync(new URL('../docs/signals-reviews/2026-11-17-priority-field-corrections.json', import.meta.url)));
  const { records } = loadSignalsRegistry();
  expect(records).toHaveLength(147);
  for (const record of records.filter(record => ledger.untouchedRecordHashes[record.id])) {
    expect(crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex')).toBe(ledger.untouchedRecordHashes[record.id]);
  }
  for (const before of ledger.beforeRecords) {
    const current = records.find(record => record.id === before.id);
    const allowed = ledger.productionCorrections.allowedFields[before.id];
    const changed = Object.keys(before).filter(key => JSON.stringify(before[key]) !== JSON.stringify(current[key]));
    expect(changed.sort()).toEqual([...allowed].sort());
    expect(Object.keys(current).sort()).toEqual(Object.keys(before).sort());
    for (const key of Object.keys(before).filter(key => !allowed.includes(key))) expect(current[key]).toEqual(before[key]);
  }
  for (const [path, hash] of Object.entries(ledger.preservedFiles)) {
    expect(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')).toBe(hash);
  }
  const wsdot = records.find(record => record.id === 'wsdot-alerts');
  expect(wsdot.summary).toContain('Text alerts are available only for Washington State Ferries');
  expect(wsdot.summary).toContain('ended August 31, 2026');
  expect(records.find(record => record.id === 'king-county-ems').summary).toContain('outside the City of Seattle');
});

test('priority prose is visible while Signals review remains overdue', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/, route => route.abort());
  await page.goto('/signals/?q=WSDOT');
  await expect(page.locator('.directory-freshness')).toContainText('review overdue');
  await expect(page.locator('#directory-last-updated')).toHaveAttribute('datetime', '2026-07-15');
  await expect(page.getByText('Email and app notifications for travel updates.', { exact: false })).toBeVisible();
  await expect(page.getByText('Text alerts are available only for Washington State Ferries.', { exact: false })).toBeVisible();
  await page.goto('/signals/?q=King%20County%20Emergency%20Medical');
  await expect(page.getByText('The county EMS Division manages the Medic One/EMS system outside the City of Seattle.', { exact: false })).toBeVisible();
});
