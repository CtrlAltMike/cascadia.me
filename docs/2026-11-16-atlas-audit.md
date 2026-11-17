# Atlas audit, November 16, 2026

Status: **partial, not a completed editorial review**. Based on published main `e12e6c3`. No production files, review dates, or deployments changed. Preserve the July 25 review and overdue disclosure until the outstanding checks below are completed.

## Source and coverage inventory

Code inspected: `js/atlas.js`, `integrations/slack-worker/src/{conditions,wind,forecast-wind}.js`, Atlas HTML and Worker tests.

| Layer/feed | Implemented contract and geographic scope | Freshness / limitations |
| --- | --- | --- |
| Basemap | MapLibre 5.24.0 from unpkg; OpenFreeMap liberty style | External runtime/style availability still needs browser verification. Not a hazard feed. |
| USGS earthquake catalog | FDSN GeoJSON, 39–53 N / 132–116 W; selectable 30-day, year, since-2000 and since-1900 windows; M2.5/M3.5/M5 floors | Limits 1,000/1,500; results cached by filter for page lifetime. No TTL, automatic refresh or cap warning. Historical catalogs are not a complete hazard assessment. |
| NIFC historical fire perimeters | InteragencyFirePerimeterHistory_All_Years_View; year/acre filters | History, not active incident data. UI discloses upstream transfer cap. Live schema/year completeness unverified. |
| FEMA NFHL | MapServer layer 28, viewport query from zoom 5.1; 240-row pages | U.S. mapped flood hazard polygons, not current flooding and not Canadian coverage. UI discloses cap. Nine handmade river corridors are schematic context, not official flood boundaries. |
| Volcano references | 16 fixed reference points, southern B.C. through Lassen; NRCan/USGS and local hazard-map links | Static planning references, not live volcanic alert status or evacuation polygons. Individual links/coordinates still need full official-source review. |
| WFIGS incidents | Current wildfire incidents, WA/OR only, bounding box -125.2,42,-116.4,49.1; not extinguished; modified/discovered within 30 days | 500 requested rows, no pagination/cap disclosure. Features use 24-hour staleness threshold. |
| WFIGS perimeters | Same WA/OR filters and 30-day window | 500 rows; no truncation disclosure; perimeter timestamps may differ from incident timestamps. |
| BCWS active fires | Current UTC year's records; southern B.C. bounding box -128.4,48,-115.6,52.6; local active-status allowlist | 1,000 rows; no cap disclosure. No per-record modification field in requested contract; source timestamp can be null. Carryover fires from prior calendar years are excluded. |
| BCWS perimeters | Same year/coverage/status filters; latest version selected per fire | 1,000 rows; selection happens after fetch, so truncation could affect latest-version choice. |
| NWS alerts | `alerts/active?area=WA`; 11 selected fire/flood/winter/high-wind event types | Not all Washington alerts, and no Oregon/California/Canadian alerts. API supports the chosen state filter and requires the user agent supplied by this code. |
| Chelan evacuation polygons | County layer 2; PublicInfo='2' AND Status='2'; bounded county area | 100 rows, no cap disclosure. Kittitas/Okanogan are official-link-only, not mapped evacuation feeds. Other counties absent. Numeric status semantics still require official layer metadata verification. |
| WSDOT highway alerts | Optional access-code source; first 300 records | Actual deployed secret/configuration unverified. No comprehensive region-wide road information; no truncation disclosure. |
| BCWS station wind | Latest four pages of 100 hourly records, then regional filter/deduplication | Bounded sample, not all stations. Rejects >12-hour readings; >2 hours marked stale. Provincial newest 400 records can exclude regional stations. |
| NOAA METAR wind | Aviation Weather Center GeoJSON, regional station observations | Rejects >4-hour readings; >2 hours marked stale. Point observations, not continuous surface field. Official API documents worldwide coverage and query/rate limits. |
| ECCC forecast wind | GeoMet RDPS 10 km, 10 m wind speed/direction WMS; capabilities-derived model times; raster and point endpoints | Forecast, not observed wind or fire/smoke movement. Official documentation now calls RDPS a component of GDPS at 10 km over North America. Existing RDPS layer identifiers need live capabilities verification before changing them. |

## Cache and failure behavior

- Conditions Worker caches successful aggregate responses for 120 seconds; browser refresh is five minutes while visible/enabled.
- Wind Worker cache and browser refresh are 15 minutes.
- Forecast metadata and tiles cache 30 minutes, point results 15 minutes; browser metadata refresh 30 minutes.
- Conditions requests have a nine-second timeout and two attempts. Source failures are independently reported; aggregate is HTTP 503 only when none available. Optional unconfigured WSDOT counts as degraded.
- Wind sources fail independently. Browser layer loader hides a layer on a rejected refresh rather than silently retaining a successful-looking old layer.
- `checkedAt` is retrieval time, not proof of source observation freshness.

## Confirmed findings needing follow-up

1. **Source timestamp conflation:** conditions `fetchJson` uses `Last-Modified || Date` for `lastModifiedAt`. HTTP Date describes response generation, not the source record update. BCWS fire points and empty collections can consequently appear freshly updated without evidence. Remove the Date fallback and preserve unknown timestamps; test response-Date-only behavior.
2. **Undisclosed bounded current feeds:** current ArcGIS sources do not inspect `exceededTransferLimit` or paginate, while presenting source status as available. Add bounded pagination or explicit incomplete/capped metadata and UI disclosure. WSDOT's first-300 slice and BCWS station sample need similar transparency.
3. **Session-lifetime earthquake cache:** recent earthquake windows can remain unchanged indefinitely in an open tab; exact configured cap counts have no warning. Add cache expiry/check time and a bounded-results warning without implying real-time alert coverage.
4. **Conditions routed test is date-dependent:** test fixture NOW/RECENT are July 9, 2026, but the HTTP-route test uses the real clock. On November 16 the 30-day filter excludes the old U.S. incident and the assertion at line 278 fails (3 rather than 4 fires). Inject/freeze a test clock or generate suitable dynamic fixture timestamps. Do not relax production age filtering merely to pass the test.
5. **Documentation incomplete:** Worker README omits BCWS, observed wind, and forecast endpoint contracts. Bring it into line with code after live verification.

## Official evidence actually read

- https://earthquake.usgs.gov/fdsnws/event/1/ — FDSN query and count contract; recommends real-time GeoJSON feeds where appropriate. Custom historical queries remain a distinct use case.
- https://aviationweather.gov/data/api/ — METAR products, geographic coverage and bounded/rate-limited access.
- https://eccc-msc.github.io/open-data/msc-data/nwp_rdps/readme_rdps_en/ — about 10 km, North American coverage, four daily predictions, up to 84 hours; current GDPS-component wording.
- https://www.weather.gov/documentation/services-web-api — active state alert query, GeoJSON, cache-friendly API and required user agent.

These establish documented contracts, not successful live responses from every upstream.

## Verification and blockers

- Worker syntax checks: PASS.
- Wind fixture tests: PASS.
- Forecast wind fixture tests: PASS.
- Conditions fixture suite: FAIL at date-dependent routed assertion above; earlier injected-clock checks reach that point successfully.
- Live GETs of deployed `/conditions`, `/conditions/wind`, and `/conditions/wind/forecast?model=rdps-10km`: HTTP 403 from this execution environment. Web lookup fallback also could not access the conditions/wind endpoints. This is an access/verification blocker, **not evidence that public users see an outage**.
- FEMA live metadata unavailable through web lookup. Remaining ArcGIS schemas, operational dates, actual Worker deployment parity, station completeness, forecast tiles/point values, and browser rendering are not certified.
- No full release gate run: only a new audit document was added; no production code changed.

Completion requires live permitted access to all feeds and official metadata, remedies/tests for findings, and desktop/mobile failure-state QA. Until then, do not replace the overdue label with a current review date.

## Follow-up fixes prepared, not published

An isolated follow-up patch addresses findings 1–4 without changing editorial
review dates or certifying inaccessible live endpoints:

- Conditions and wind no longer use HTTP Date as source modification time.
  Source lists explicitly say when source update time is unknown, separately
  from feed retrieval time.
- Conditions propagate possible truncation from ArcGIS transfer-limit flags and
  requested row ceilings; WSDOT reports its local 300-record cutoff. The BCWS
  station source reports a full 400-record sample as potentially incomplete.
  Aggregate status and source lists disclose this without pretending a bounded
  sample is complete. Pagination and full-source completeness are not claimed.
- Earthquake cache expires after five minutes, with visible/enabled-page refresh
  on the existing five-minute timer. Status includes retrieval time and a warning
  at the configured result ceiling.
- The route fixture test freezes its Date clock to the fixture date, restoring it
  afterward. Production age filters are unchanged.
- Worker README now documents these boundaries and the wind/forecast endpoints.

Verification after the patch: all Worker syntax/conditions/wind/forecast tests
pass. New dependency-free tests execute the production earthquake-loader and
source-list functions with a controlled clock/map boundary: cache reuse, expiry,
filter changes, disabled-layer response, capped-results warning and unknown-date
presentation pass. The new test is included in `npm run validate`.

Site frame, design-system and SEO checks pass. Browser release checks were
attempted but Chromium's Playwright executable is absent in this workspace;
32 browser tests cannot launch, while two non-browser tests pass. This is not a
full release-gate pass or visual QA. No deployment or push performed. The static
Atlas script cache version is bumped; Worker code requires its own separately
authorized deployment to expose the new feed metadata. Live endpoint/schema and
operational-browser checks remain outstanding as described above.
