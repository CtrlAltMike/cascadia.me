import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('targeted review preserves full-review dates and scopes fresh checks', async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/, route => route.abort());
  await page.goto('/');
  await expect(page.locator('.mission-review')).toContainText('Homepage reviewed July 25, 2026');
  await expect(page.locator('.mission-review')).toContainText('their own review dates');
  await page.goto('/signals/');
  await expect(page.locator('.directory-freshness')).toContainText('review is overdue');
  await expect(page.locator('#directory-last-updated')).toHaveAttribute('datetime', '2026-07-15');
  await expect(page.locator('.signals-direct')).toContainText('not a review of every directory record');
  await expect(page.locator('.signals-direct a')).toHaveCount(6);
  await page.goto('/earthquake.html');
  await expect(page.locator('.eq-review-line')).toContainText('Full guide reviewed July 25, 2026');
  await expect(page.locator('.eq-review-line')).toContainText('Targeted source check November 16, 2026');
  await expect(page.locator('#earthquake-after-title + ul')).toContainText('after any felt earthquake');
  await expect(page.locator('#tsunami-route')).toContainText('any size or length');
  await expect(page.locator('a[href="https://www.usgs.gov/publications/earthquake-probabilities-and-hazards-us-pacific-northwest"]')).toHaveCount(2);
});

test('Oregon roster link repair does not redate historical audits', () => {
  for (const path of ['signals/coverage-review.json', 'signals/coverage-audit.json']) {
    const text = readFileSync(path, 'utf8');
    expect(JSON.parse(text).reviewedOn).toBe('2026-07-14');
    expect(text).toContain('https://sos.oregon.gov/blue-book/government/Pages/about-city.aspx');
    expect(text).not.toContain('https://sos.oregon.gov/blue-book/Pages/local/cities/about.aspx');
  }
});
