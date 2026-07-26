import { expect, test } from '@playwright/test';
import { sitePages } from '../scripts/site-pages.mjs';

const shareMessage = 'I found this Cascadia.me page useful. It explains practical choices for living with interruptions in the Pacific Northwest and keeps the official sources close.';

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
    const home = page.locator('.nav-links > li:first-child > a');
    await expect(home).toHaveCount(1);
    await expect(home).toHaveText('Home');
    await expect(home).toHaveAttribute('aria-current', 'page');

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
    await page.goto('/place.html');

    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Home', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Find Official Help' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('mobile feedback stays compact and clear of urgent paths', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile feedback contract');

    await page.goto('/first-moves.html');
    await expect(page.locator('.feedback-widget')).toBeHidden();

    await page.goto('/signals/');
    await expect(page.locator('.feedback-widget')).toBeHidden();

    await page.goto('/people-nearby.html');
    const launcher = page.getByRole('button', { name: 'Open feedback form' });
    await expect(launcher).toBeVisible();
    await expect(launcher).toContainText('Feedback');
    expect(await launcher.evaluate((element) => getComputedStyle(element.closest('.feedback-widget')).position)).toBe('relative');
    expect(await page.locator('.feedback-widget + .site-footer').count()).toBe(1);

    await launcher.click();
    await expect(page.getByRole('dialog', { name: 'Share feedback' })).toBeVisible();
  });

  test('NowWePlan links show the temporary launch dialog and restore focus', async ({ page, context }) => {
    await page.goto('/household-workbook.html');
    const link = page.getByRole('link', { name: /Start a living household plan/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /(?:^|\s)noopener(?:\s|$)/);
    const pageCount = context.pages().length;
    await link.click();

    const dialog = page.getByRole('dialog', { name: 'Now We Plan is coming soon' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('keeping owners, agreements, review dates, and practice alive');
    expect(context.pages()).toHaveLength(pageCount);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();
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

  test('revised public spine and neighborhood field tools are usable', async ({ page }, testInfo) => {
    for (const path of ['/', '/place.html', '/first-moves.html', '/keep-life-going.html', '/building.html', '/people-nearby.html', '/constitution.html']) {
      await page.goto(path);
      await expect(page.locator('main .mission-hero__actions')).toHaveCount(0);
    }

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Keep everyday life moving.' })).toBeVisible();
    const routeGrid = page.locator('.mission-route-grid');
    const routes = routeGrid.locator('.mission-route');
    await expect(routes).toHaveCount(6);
    const capabilityGrid = page.locator('.mission-card-grid');
    const capabilityCards = capabilityGrid.locator('.mission-card');
    await expect(capabilityCards).toHaveCount(6);
    await expect(capabilityCards.first().locator('.mission-card__link')).toHaveCount(1);

    const typeScale = await page.evaluate(() => ({
      hero: Number.parseFloat(getComputedStyle(document.querySelector('.mission-hero h1')).fontSize),
      section: Number.parseFloat(getComputedStyle(document.querySelector('.mission-section__heading h2')).fontSize),
      card: Number.parseFloat(getComputedStyle(document.querySelector('.mission-route h3')).fontSize)
    }));
    expect(typeScale.hero).toBeGreaterThan(typeScale.section);
    expect(typeScale.section).toBeGreaterThan(typeScale.card);
    expect(typeScale.hero).toBeLessThanOrEqual(92);
    expect(typeScale.section).toBeLessThanOrEqual(54.5);
    expect(typeScale.card).toBeLessThanOrEqual(33.6);

    const routePadding = await routes.evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`;
    }));
    expect(new Set(routePadding).size).toBe(1);

    if (!testInfo.project.name.startsWith('mobile')) {
      const gridGap = await routeGrid.evaluate((element) => Number.parseFloat(getComputedStyle(element).columnGap));
      expect(gridGap).toBeGreaterThanOrEqual(12);
      const capabilityGap = await capabilityGrid.evaluate((element) => Number.parseFloat(getComputedStyle(element).columnGap));
      expect(capabilityGap).toBeGreaterThanOrEqual(12);

      const firstRoute = routes.first();
      await firstRoute.hover();
      await expect.poll(() => firstRoute.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      const firstCapability = capabilityCards.first();
      await firstCapability.hover();
      await expect.poll(() => firstCapability.evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await expect(routes.first()).toHaveCSS('transition-duration', '0s');
      await expect(capabilityCards.first()).toHaveCSS('transition-duration', '0s');
    }

    await expectNoHorizontalOverflow(page);

    await page.goto('/people-nearby.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Start with one person.' })).toBeVisible();
    await expect(page.locator('.mission-hero img')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/neighborhood-inventory.html');
    await expect(page.locator('.field-sheet')).toHaveCount(4);
    const screenNote = page.locator('.field-tool-screen-note');
    if (test.info().project.name.startsWith('mobile')) {
      await expect(screenNote).toBeVisible();
    } else {
      await expect(screenNote).toBeHidden();
    }
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(screenNote).toBeHidden();
    await expect(page.locator('.field-sheet').first()).toBeVisible();

    await page.goto('/event-inserts.html');
    await expect(page.locator('.field-sheet')).toHaveCount(5);
    await expect(page.getByRole('heading', { level: 2, name: 'Earthquake and tsunami' })).toBeVisible();
    await expect(page.locator('.field-tool-intro')).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test('linked cards make their next action visible without animating reference cards', async ({ page }, testInfo) => {
    await page.goto('/place.html');
    const placeCards = page.locator('.mission-card-grid .mission-card');
    await expect(placeCards).toHaveCount(6);
    await expect(placeCards.locator('.mission-card__link')).toHaveCount(6);
    await placeCards.nth(3).click({ position: { x: 20, y: 20 } });
    await expect(page).toHaveURL(/\/movement\.html$/);

    await page.goto('/building.html');
    const buildingFacts = page.locator('.building-page .mission-card-grid .mission-card');
    await expect(buildingFacts).toHaveCount(4);
    await expectNoHorizontalOverflow(page);

    await page.goto('/people-nearby.html');
    const peopleRoutes = page.locator('.people-page .mission-route-grid .mission-route');
    await expect(peopleRoutes).toHaveCount(4);
    await expectNoHorizontalOverflow(page);

    await page.goto('/water.html');
    const nextMoves = page.locator('.capability-section[aria-labelledby="together-title"] .capability-card');
    await expect(nextMoves).toHaveCount(3);
    await expectNoHorizontalOverflow(page);

    await page.goto('/wildfire.html');
    const specificityCards = page.locator('.chapter-specificity-card');
    await expect(specificityCards).toHaveCount(5);
    await expectNoHorizontalOverflow(page);

    if (!testInfo.project.name.startsWith('mobile')) {
      await page.goto('/place.html');
      const placeGrid = page.locator('.mission-card-grid');
      expect(await placeGrid.evaluate((element) => Number.parseFloat(getComputedStyle(element).columnGap))).toBeGreaterThanOrEqual(12);
      await placeCards.first().hover();
      await expect.poll(() => placeCards.first().evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      await page.goto('/building.html');
      const buildingGrid = page.locator('.building-page .mission-card-grid');
      expect(await buildingGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(2);
      await buildingFacts.first().hover();
      await expect(buildingFacts.first()).toHaveCSS('transform', 'none');

      await page.goto('/people-nearby.html');
      const peopleGrid = page.locator('.people-page .mission-route-grid');
      expect(await peopleGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(2);
      await peopleRoutes.first().hover();
      await expect.poll(() => peopleRoutes.first().evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      await page.goto('/water.html');
      await nextMoves.first().hover();
      await expect.poll(() => nextMoves.first().evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      await page.goto('/wildfire.html');
      await specificityCards.first().hover();
      await expect.poll(() => specificityCards.first().evaluate((element) => getComputedStyle(element).transform)).not.toBe('none');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload();
      await expect(specificityCards.first()).toHaveCSS('transition-duration', '0s');
    }
  });

  test('primary guidance stays usable when images and fonts fail', async ({ page }) => {
    await page.route(/\.(?:avif|gif|jpe?g|png|svg|webp|woff2?)(?:\?.*)?$/i, (route) => route.abort());

    await page.goto('/place.html', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: 'Your address sits inside a system.' })).toBeVisible();
    const references = page.getByRole('navigation', { name: 'Regional hazard references' });
    await expect(references).toBeVisible();
    await expect(references.getByRole('link')).toHaveCount(5);
    await expectNoHorizontalOverflow(page);

    await page.goto('/first-moves.html', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1, name: "Some decisions shouldn't wait." })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('the neighborhood packet remains complete without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await preventThirdPartyDependencies(page);
    await page.goto('/neighborhood-inventory.html');
    await expect(page.locator('.field-sheet')).toHaveCount(4);
    await expect(page.getByRole('heading', { level: 2, name: 'Status, needs, and offers' })).toBeVisible();
    await page.goto('/event-inserts.html');
    await expect(page.locator('.field-sheet')).toHaveCount(5);
    await expect(page.getByRole('heading', { level: 2, name: 'Volcanic ash' })).toBeVisible();
    await context.close();
  });

  test('building guidance and hazard decision spines remain usable', async ({ page }) => {
    await page.goto('/building.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Ask a better question about the place you live.' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Get the facts the next person will ask for.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'USGS explanation of property-specific assessment' })).toBeVisible();
    await expect(page.locator('.mission-step')).toHaveCount(4);
    expect(await page.locator('.mission-step').evaluateAll((steps) => steps.every((step) => step.children.length === 1))).toBe(true);
    await expect(page.locator('.mission-section__support')).toContainText("A permit sticker isn't thrilling.");
    await expectNoHorizontalOverflow(page);

    for (const hazard of ['earthquake', 'wildfire', 'flooding', 'winter-storm', 'volcano']) {
      await page.goto(`/${hazard}.html`);
      await expect(page.locator('.chapter-specificity-card')).toHaveCount(5);
      await expect(page.locator('.chapter-specificity a[href="building.html"]')).toBeVisible();
      await expect(page.locator('.chapter-specificity a[href="signals/"]')).toBeVisible();
      await expect(page.locator('.chapter-specificity a[href="keep-life-going.html"]')).toBeVisible();
      await expect(page.locator('.chapter-specificity a[href="recovery.html"]')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('Signals keeps direct official starting points without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await preventThirdPartyDependencies(page);
    await page.goto('/signals/');
    await expect(page.getByLabel('Signals directory limits')).toBeVisible();
    const direct = page.getByRole('navigation', { name: 'Direct official starting points' });
    await expect(direct).toBeVisible();
    await expect(direct.getByRole('link')).toHaveCount(6);
    await expectNoHorizontalOverflow(page);
    await context.close();
  });

  test('moved pages keep old addresses useful', async ({ page }) => {
    await page.goto('/household-workbook.html');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Begin with an ordinary day');
    await expectNoHorizontalOverflow(page);

    const response = await page.request.get('/build-your-kit.html');
    const handoff = await response.text();
    expect(handoff).toContain('<meta name="robots" content="noindex,follow">');
    expect(handoff).toContain('<meta http-equiv="refresh" content="0; url=household-workbook.html">');
    expect(handoff).toContain('href="household-workbook.html">Open the Household Workbook</a>');

    const guidesResponse = await page.request.get('/guides.html');
    const guidesHandoff = await guidesResponse.text();
    expect(guidesHandoff).toContain('<meta name="robots" content="noindex,follow">');
    expect(guidesHandoff).toContain('<meta http-equiv="refresh" content="0; url=place.html">');
    expect(guidesHandoff).toContain('href="place.html">Open Know Your Place</a>');
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

    await expect(page.getByLabel('Signals directory limits')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Direct official starting points' })).toBeVisible();
    const resultGroups = page.locator('details.result-group');
    await expect(resultGroups.first()).toBeVisible();
    expect(await resultGroups.evaluateAll((groups) => groups.every((group) => !group.open))).toBe(true);
    await resultGroups.first().locator(':scope > summary').click();
    await expect(resultGroups.first()).toHaveAttribute('open', '');
    await expect(resultGroups.first().locator('.result-item').first()).toBeVisible();

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

  test('every indexable page loads its local styles without overflow or runtime errors', async ({ page }) => {
    test.setTimeout(90_000);

    for (const sitePage of sitePages) {
      if (sitePage.indexable === false) continue;
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
