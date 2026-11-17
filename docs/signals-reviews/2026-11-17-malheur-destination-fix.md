# Malheur destination-only correction

Prepared separately from PR #55. Not published.

The stored AlertSense enrollment page explicitly says it is no longer active:
https://public.alertsense.com/SignUp/?regionid=1021

The official sheriff page identifies Everbridge and directly links its replacement:
https://sheriff.malheurco.org/home/divisions/emergency-management/
https://member.everbridge.net/148882356961282/new

The record's information URL now points to the sheriff page; its enrollment action points to the sheriff-linked Everbridge URL. The vendor returned no readable enrollment body. Signup and delivery were not tested. No channels, cost, coverage, eligibility, or other unverified details were changed.

Historical record date (2026-07-14), historical action ledger, original batch seals, and coverage outcomes remain untouched. `action-url-amendments.json` records only this destination correction. The validator first checks that current URLs and historical verification date exactly match the amendment, then reconstructs only the old action URL for the original batch digest. All other sealed action and coverage fields still have to match the original seal. The record remains overdue for full review.

The asset cache version is changed through the site-page registry and the generated frame is synchronized. No shared worker or live deployment was touched.

## Validation

- Registry validator passes: 147 records and 925 historical coverage outcomes.
- Frame synchronization, design-system contracts, SEO contracts and `git diff --check` pass.
- Six focused URL-amendment and historical-record regression tests pass across desktop/mobile projects (these are data tests, not browser interaction tests).
- Full `npm run validate` attempted: eight data tests passed, 32 browser-dependent tests could not launch because Chromium is absent. Attempted official Playwright Chromium installation returned an invalid/truncated download. Browser release validation remains blocked, not passed.
