import { expect, test } from '@playwright/test';

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
