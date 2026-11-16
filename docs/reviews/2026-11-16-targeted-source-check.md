# Targeted source check: November 16, 2026

This is a bounded maintenance patch, not a full guide or directory review.
Historical July review dates and the review-policy adoption date remain intact.

## Verified sources and changes

- Oregon Secretary of State: https://sos.oregon.gov/blue-book/government/Pages/about-city.aspx states 241 incorporated cities. Replace the obsolete `Pages/local/cities/about.aspx` reference in both coverage JSON files. Do not change historical roster counts, outcomes, or audit dates.
- NOAA: https://www.tsunami.gov/?lang=en&page=tsunamiFAQ supports immediate evacuation following natural warnings, and moving to high ground or inland after any felt earthquake on a beach or near the water, as soon as safe. Clarify the earthquake guide's action panel, tsunami section, and quick reference.
- USGS: https://www.usgs.gov/publications/earthquake-probabilities-and-hazards-us-pacific-northwest supports the existing 10–15% approximate magnitude-9 full-margin probability over 50 years. Point both fact-sheet links to this accessible official publication record. The older full-text endpoint returned 403 during checking; this does not prove it is universally broken.
- Washington EMD: https://mil.wa.gov/earthquake supports Drop, Cover, and Hold On.
- NRCan: https://www.earthquakescanada.nrcan.gc.ca/eew-asp/faq-en.php supports the existing early-warning limits.
- USGS: https://www.usgs.gov/faqs/can-you-predict-earthquakes supports the existing distinction between probability and prediction.
- CDC: https://www.cdc.gov/earthquakes/safety/stay-safe-after-an-earthquake.html supports the existing aftershock, damaged-building, gas-safety, and communication guidance. This check did not cover every linked after-event source.

Six prominent Signals starting-point links loaded during this check:

- https://mil.wa.gov/alerts
- https://www.oregon.gov/oem/pages/default.aspx
- https://www.caloes.ca.gov/
- https://www.emergencyinfobc.gov.bc.ca/
- https://www.weather.gov/alerts
- https://weather.gc.ca/?layers=alerts

Label this link check separately from the full directory review, which is overdue under the monthly review policy. Homepage wording distinguishes its own review date from linked-guide dates. No live incident information was copied into the site.

## Scope excluded

No full review of the 147 Signals records, 925 historical coverage outcomes, local maps, geology/history citations, or other guides. No CSS, shared-frame, policy-adoption date, publishing configuration, or generated block changes.

## Validation

Passed: Signals registry (147 records and 925 coverage outcomes, no errors), Signals JavaScript syntax, shared frame (48 pages), design-system contracts, SEO contracts, and git diff whitespace check.

Added regression tests for scoped review wording, the tsunami clarification, official USGS links, and preserved historical audit dates. The non-browser test passed on both configured projects. Browser tests were blocked before page loading: the bundled Chromium download was invalid and installed Chromium could not create its process-singleton socket (`Operation not permitted`). A full release-suite pass and desktop/mobile visual review are still required in a working browser environment before merge or deployment.

This patch is isolated from the older cloud task. Reconcile that task's unpublished changes and current main before merging. No deployment is authorized by this patch's preparation.
