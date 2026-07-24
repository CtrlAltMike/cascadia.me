import { expect, test } from '@playwright/test';
import { sitePages } from '../scripts/site-pages.mjs';

const shareMessage = 'I thought this Cascadia.me guide might be useful. It offers preparedness information relevant to the Pacific Northwest.';

async function preventThirdPartyDependencies(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/, (route) => route.abort());
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth
  }));
  expect(overflow.document).toBeLessThanOrEqual(1);
  expect(overflow.body).toBeLessThanOrEqual(1);
}

test.describe('shared site frame', () => {
  test.beforeEach(async ({ page }) => {
    await preventThirdPartyDependencies(page);
  });

  test('share dialog opens, carries the common message, and restores focus', async ({ page }) => {
    await page.goto('/');
    const share = page.getByRole('button', { name: 'Share this page' });
    await share.click();

    const dialog = page.getByRole('dialog', { name: 'Add a note' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox')).toHaveValue(shareMessage);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(share).toBeFocused();
  });

  test('mobile menu opens, closes with Escape, and returns focus', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile navigation contract');
    await page.goto('/guides.html');

    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Atlas' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('Build Your Kit opens NowWePlan in a separate tab', async ({ page }) => {
    await page.goto('/build-your-kit.html');
    const link = page.getByRole('link', { name: /Start a living household plan/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /(?:^|\s)noopener(?:\s|$)/);
  });
});

test.describe('representative page interactions', () => {
  test.beforeEach(async ({ page }) => {
    await preventThirdPartyDependencies(page);
  });

  test('Field Stories shelf and story frontispiece remain usable', async ({ page }) => {
    await page.goto('/stories/');
    await expect(page.locator('.field-story-entry')).toHaveCount(9);
    await expectNoHorizontalOverflow(page);

    await page.goto('/stories/inventory.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Inventory' })).toBeVisible();
    await expect(page.locator('.field-story-frontispiece')).toBeVisible();
    await expect(page.locator('#chapter-1')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('Atlas planning controls disclose their available layers', async ({ page }) => {
    await page.goto('/atlas.html');
    const sheet = page.locator('.atlas-control-sheet');
    if (!(await sheet.evaluate((element) => element.open))) {
      await sheet.locator(':scope > summary').click();
    }
    const planning = page.locator('[data-atlas-family="planning"]');
    await planning.scrollIntoViewIfNeeded();
    await planning.locator(':scope > summary').click();
    await expect(planning).toHaveAttribute('open', '');
    await expect(planning.getByText('Historical fires', { exact: true })).toBeVisible();
    await expect(planning.getByText('Flood planning', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('Signals postal message overlay stays legible inside the map stage', async ({ page }) => {
    await page.route('**/MapServer/1/query**', async (route) => {
      const requestUrl = decodeURIComponent(route.request().url());
      if (!requestUrl.includes("ZCTA5='98040'")) {
        await route.fulfill({ json: { type: 'FeatureCollection', features: [] } });
        return;
      }
      await route.fulfill({
        json: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: { ZCTA5: '98040', GEOID: '98040', NAME: '98040' },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-122.28, 47.52],
                [-122.18, 47.52],
                [-122.18, 47.62],
                [-122.28, 47.62],
                [-122.28, 47.52]
              ]]
            }
          }]
        }
      });
    });
    await page.goto('/signals/');

    const gate = page.getByRole('dialog', { name: 'Please read this before continuing.' });
    await gate.getByRole('checkbox').check();
    await gate.getByRole('button', { name: 'Okay' }).click();
    await expect(gate).toBeHidden();

    await page.getByLabel('Find a place').fill('98040');
    await page.getByRole('button', { name: 'Find', exact: true }).click();
    const result = page.locator('#postal-result');
    await expect(result).toBeVisible();
    await expect(page.locator('#postal-match-title')).toContainText('ZIP 98040');
    await expect(page.locator('#postal-status')).not.toBeEmpty();

    const bounds = await page.evaluate(() => {
      const stage = document.querySelector('.map-stage').getBoundingClientRect();
      const result = document.querySelector('#postal-result').getBoundingClientRect();
      return { stage, result };
    });
    expect(bounds.result.left).toBeGreaterThanOrEqual(bounds.stage.left);
    expect(bounds.result.right).toBeLessThanOrEqual(bounds.stage.right + 1);
    expect(bounds.result.top).toBeGreaterThanOrEqual(bounds.stage.top);
    expect(bounds.result.bottom).toBeLessThanOrEqual(bounds.stage.bottom + 1);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('production-page CSS and frame smoke test', () => {
  test.beforeEach(async ({ page }) => {
    await preventThirdPartyDependencies(page);
  });

  test('every registered page loads its local styles without overflow or runtime errors', async ({ page }) => {
    test.setTimeout(90_000);

    for (const sitePage of sitePages) {
      const pageErrors = [];
      const recordPageError = (error) => pageErrors.push(error.message);
      page.on('pageerror', recordPageError);

      await page.goto(`/${sitePage.path}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);

      const health = await page.evaluate(() => {
        const localStyles = [...document.styleSheets]
          .filter((sheet) => sheet.href && new URL(sheet.href).origin === window.location.origin)
          .map((sheet) => {
            try {
              return {
                href: sheet.href,
                readable: true,
                ruleCount: sheet.cssRules.length
              };
            } catch {
              return {
                href: sheet.href,
                readable: false,
                ruleCount: 0
              };
            }
          });
        const skipLink = document.querySelector('a[class$="skip-link"], a.skip-link');
        const skipTarget = skipLink?.getAttribute('href');
        const invalidExternalLinks = [...document.querySelectorAll('a[href^="http://"], a[href^="https://"]')]
          .filter((link) => !['cascadia.me', 'www.cascadia.me'].includes(new URL(link.href).hostname.toLowerCase()))
          .filter((link) => link.target !== '_blank' || !link.relList.contains('noopener'))
          .map((link) => link.href);

        return {
          localStyles,
          hasHeader: Boolean(document.querySelector('.site-header')),
          hasMain: Boolean(document.querySelector('main')),
          hasSkipTarget: Boolean(skipTarget && document.querySelector(skipTarget)),
          invalidExternalLinks,
          documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          bodyOverflow: document.body.scrollWidth - document.body.clientWidth
        };
      });

      expect(health.hasHeader, `${sitePage.path}: shared header`).toBe(true);
      expect(health.hasMain, `${sitePage.path}: main landmark`).toBe(true);
      expect(health.hasSkipTarget, `${sitePage.path}: skip-link target`).toBe(true);
      expect(health.invalidExternalLinks, `${sitePage.path}: external-link policy`).toEqual([]);
      expect(health.localStyles.length, `${sitePage.path}: local stylesheet count`).toBeGreaterThanOrEqual(4);
      expect(
        health.localStyles.filter((style) => !style.readable || style.ruleCount === 0),
        `${sitePage.path}: unreadable or empty local stylesheets`
      ).toEqual([]);
      expect(health.documentOverflow, `${sitePage.path}: document horizontal overflow`).toBeLessThanOrEqual(1);
      expect(health.bodyOverflow, `${sitePage.path}: body horizontal overflow`).toBeLessThanOrEqual(1);
      expect(pageErrors, `${sitePage.path}: uncaught runtime errors`).toEqual([]);

      page.off('pageerror', recordPageError);
    }
  });
});
