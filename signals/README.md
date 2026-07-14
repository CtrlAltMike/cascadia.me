# Cascadia Signals

Signals is a permanent Cascadia.me beta surface. It is linked from the primary navigation and remains explicitly separate from the Atlas.

## What it provides

- A viewport-aware directory of durable emergency alerts, services, support, transportation, hazards, and preparedness resources—not a live incident map.
- Federal, state, tribal, county/regional, city, and community listings that can overlap without implying a single administrative hierarchy.
- Zoom- and viewport-dependent applicability: broad views include broad and local resources, while local views retain every higher-level service that applies there.
- Final clusters and coincident listing markers fan out into individually selectable points; the temporary arrangement clears when the map moves or the directory changes.
- Optional state/province, county/regional-district, city, NWS office, ECCC public forecast-zone, and tribal-reference overlays that never control whether a directory listing appears. NWS and ECCC geography have separate controls and map colors; selecting either kind of weather-service perimeter reveals its name and official source.
- Tribal nations as sovereign publishers alongside federal, state, county/regional, and local/community sources.
- Selection-based perimeter highlighting when a defensible applicability geometry exists; listings remain available without invented geometry when it does not.
- A mandatory beta acknowledgment on every page load.
- Printable filtered lists and shareable rich-text lists that retain source URLs.
- A formatted, scrollable view of the current filtered list, grouped by authority level and sorted by role and name with clickable official sources.
- On-demand postal lookup: five-digit U.S. ZIPs resolve to 2020 Census ZCTAs, while Canadian entries resolve only to the first three characters using 2021 Statistics Canada census forward sortation areas.
- A location-specific **Start here** stack that appears after postal lookup. It includes every applicable local enrollment action plus the best-fit weather, hazard, transportation, and support actions. Area-level matches remain explicitly approximate until the visitor confirms a point.
- A private, versioned preparedness checklist stored only in the visitor's browser. It stores opaque keys derived from stable resource IDs plus timestamps, never postal codes, coordinates, or named places; clearing and location-free text export are explicit controls. Existing named-ID keys migrate automatically.

## Authority registry

`authority-data.js` is the inspectable local registry for the expanded alert layer. As reviewed on 2026-07-14, it contains:

- all 39 Washington county alert sources listed by Washington Emergency Management Division;
- all 36 Oregon county enrollment routes listed by OR-Alert;
- all 27 B.C. regional districts, linked to each district's official alert or emergency page;
- the city-specific systems explicitly listed by Washington EMD, plus verified Portland, Vancouver, Victoria, and Kamloops sources;
- provincial, federal-weather, wildfire-information, and First Nations support records whose roles are kept distinct from local evacuation authority.

Every expanded record identifies an authority role, source registry or direct source, review date, and a jurisdiction coverage key. Alertable, Everbridge, Voyent Alert!, CodeRED, and similar products are treated as delivery channels—not as the public authority.

Every one of the original 142 records, plus DriveBC and 211 British Columbia added during actionability QA, has a required `primaryAction` with an accepted action type, verb-led label, direct HTTPS destination, and deterministic priority. The general official-information URL remains separate when it differs from the action destination. Optional operational fields—such as confirmed delivery channels, opt-in status, phone contact, languages, accessibility information, or offline fallback—are shown only when sourced; missing values are not inferred. The current registry has verified delivery-channel metadata on 141 of 144 records, opt-in status on 128, cost information on 56, phone contacts on 8, offline fallbacks on 42, language information on 2, and accessibility information on 1. These counts describe documented fields, not universal service availability.

The B.C. records follow the province's documented division of responsibility: a local government or First Nation is the authorized local alerting authority and normally requests a community BC Emergency Alert; provincial emergency-management staff transmit it. EmergencyInfoBC amplifies verified notices. Environment Canada and wildfire agencies publish hazard/incident information but do not become the default local evacuation authority.

## Data boundary

U.S. state, county, and municipal boundaries come from Census TIGERweb. B.C. province, regional-district, and selected municipal boundaries come from the Province of British Columbia legal administrative-boundary service. NWS County Warning Areas come from the official NOAA reference layer. B.C. public forecast zones come from Environment and Climate Change Canada’s official Public Standard Forecast Zones collection—the geography used for most public forecasts, warnings, watches, advisories, and special weather statements. Selected U.S. reservation/trust-land examples come from Census TIGERweb as optional legal/statistical reference geography.

B.C. province, regional-district, and municipal requests are retried and handled independently. A temporary failure in one boundary tier no longer suppresses successfully returned province geometry; the geometry ledger reports a partial result when only some tiers are available. The province outline also has a local snapshot retrieved from the official B.C. service on 2026-07-14, so this foundational outline is immediately available while live geometry refreshes.

The 52 B.C. ECCC public forecast zones also have a local snapshot retrieved from the official GeoMet OGC API on 2026-07-14. Signals validates the live or cached collection for unique Canadian Locator Codes, names, polygon geometry, B.C. coverage, and the expected minimum zone count before registering it. The overlay shows durable zone boundaries only; it does not imply that an alert is currently active.

Legal geometry is a geographic index, not automatic proof of service coverage. This matters especially in B.C., where a regional district may serve rural electoral areas while member municipalities operate their own emergency programs. Each record's applicability note controls the interpretation. Enrollment records whose confirmed operating area is narrower than the available regional geometry remain in the full directory but are withheld from **Start here** until finer service geometry is available. A tribal or treaty-land reference shape is never presented as ancestral territory or emergency-service coverage.

Postal lookup follows the same rule. A ZCTA or FSA selects every mapped service area that intersects it and is labeled approximate. Because postal geography can cross jurisdictions, the visitor can confirm a precise point inside the postal outline; Signals then retains only services whose mapped areas contain that point. The lookup is performed on demand in the browser and is not stored. Shared views retain only the five-digit ZIP or three-character FSA, plus a user-confirmed map point when present.

The county/regional-district baseline is complete for the three requested regions. Municipality and Indigenous-government audits are active, quantified research tracks rather than an implied-complete directory. The municipal baselines are 281 incorporated places in Washington, 241 in Oregon, and 161 in B.C.; 9, 216, and 18 respectively now have an official dedicated-system, shared-system, referral, or directory-routing finding. The remaining independent reviews are 272, 25, and 143. Oregon's 25-item gap means an incorporated city's normalized name was absent from the official OR-Alert search data on the review date; it does not mean ZIP routing or an alert service is unavailable.

The Indigenous-government baselines are 29 federally recognized Tribes in Washington, 9 in Oregon, and 204 First Nations in B.C. The audit currently records 0, 3, and 7 government-specific findings respectively, leaving 29, 6, and 197 independent reviews. The B.C.-wide First Nations’ Emergency Services Society record remains a support resource and is not counted as a Nation-specific alert authority. Signals contains no current-incident feed and no hand-drawn incident perimeters.

`coverage-audit.json` keeps municipal and Indigenous-government research as independent ledgers tied to official government rosters. Its reconciled baselines, named shared-service findings, exact-name directory gaps, sources, and review dates are machine-validated. A municipality contained by a county or regional district is never assumed to use that government's alert system. A Tribe or First Nation is never assigned an alert authority from reservation, trust-land, treaty, ancestral-territory, or regional geometry.

## Validation and freshness

Run `node signals/scripts/validate-registry.mjs` to check record count, unique IDs, verb-led action types and URLs, provenance, review dates, coverage keys, optional metadata shapes, the coverage-audit contract, and the confirmed editorial review in `action-review.json`. The review file lists every current record in exactly one evidence batch and seals its action URL, label, applicability note, and Start Here eligibility with a SHA-256 snapshot. Any later editorial change fails validation until the affected batch is reviewed and re-sealed.

The GitHub workflow runs the registry validator on Signals pull requests and pushes. Its weekly/manual job also checks deduplicated action, information, registry, accessibility, official-roster, and coverage-evidence URLs with Node's built-in networking. Responses caused by authentication, bot protection, unsupported methods, or rate limiting are classified for manual review. A maintenance issue is opened only after the same URL fails two consecutive runs. Link results never hide a listing or advance its manual verification date automatically.

## Local preview

Serve the repository over HTTP and open `/signals/`. No build step is required.
