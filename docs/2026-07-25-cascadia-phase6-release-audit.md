# Cascadia.me Phase 6 release audit

**Status:** Complete and ready for publication

**Date:** July 25, 2026
**Plan:** [Cascadia.me mission revision plan](2026-07-25-cascadia-mission-revision-plan.md)

## Migration

- `guides.html` is now a non-indexable handoff to `place.html`.
- `build-your-kit.html` remains a non-indexable handoff to `household-workbook.html`.
- The five hazard pages keep their existing public addresses as stable regional references.
- Internal links no longer point to `guides.html`.
- Redirect handoffs are excluded from the sitemap and declare the replacement page as canonical.
- GitHub Pages cannot issue server-level 301 or 308 responses from this repository. The handoffs use immediate HTML refresh, visible links, canonical replacements, and `noindex,follow`. See [URL migration](url-migration.md).

## Public-positioning check

The release validator now rejects:

- links from an indexable page to the retired Guides address;
- “five-hazard,” “Cascadia Guides,” and “choose a guide/hazard” positioning on indexable pages;
- missing visible review dates on substantive pages.

Retired guidebook-only CSS, motion hooks, cache keys, and registry assets were removed.

## Official-source and review-date check

- All 217 unique external links in registered production pages were reviewed.
- Two outdated official destinations were replaced:
  - Environment and Climate Change Canada weather alerts now use `https://weather.gc.ca/?layers=alerts`.
  - Oregon wildfire information now uses the Oregon State Fire Marshal wildfire landing page.
- Automated requests that were refused by government or agency bot controls were checked against the corresponding official site or current official search result.
- Every indexable substantive page has a visible review date.

## Reachability check

The release suite covers:

- desktop and mobile layouts;
- print layouts for the neighborhood packet and event inserts;
- JavaScript-disabled neighborhood tools and Signals starting points;
- missing images and fonts on the primary public path;
- all registered indexable pages for local stylesheet failures, runtime errors, external-link attributes, and horizontal overflow.

Manual visual review was completed for `place.html` at 1440 × 900 and 390 × 844, plus a 390 × 844 pass with images and fonts blocked. The page remains readable and action-first in the degraded state.

## Voice read-through

The public spine, capability pages, household workbook, governance pages, and hazard handoffs were read for kitchen-table cadence. The pass:

- restored contractions where uncontracted phrasing sounded computed;
- retained uncontracted, direct wording for consequential safety instructions;
- shortened a mild joke on the building page;
- corrected an awkward sanitation sentence;
- replaced a remaining description of Cascadia.me as a “preparedness resource” with “a practical planning and interpretation resource”;
- removed repeated burden-heavy framing from production copy and established an emotional-load budget in the canonical voice guide;
- renamed the public “Keep Life Going” section to the shorter “Keep Going” while preserving its stable URL.

## Release gate

`npm run validate` passes:

- shared-frame synchronization;
- design-system contracts across 48 production pages;
- SEO contracts across 48 production pages and 45 indexable sitemap URLs;
- 26 browser tests across desktop and mobile, with two expected desktop skips for mobile-only contracts.

`git diff --check` also passes.
