# Cascadia Signals

Signals is a permanent Cascadia.me beta surface. It is linked from the primary navigation and remains explicitly separate from the Atlas.

## What it provides

- A viewport-aware directory of durable emergency alerts, services, support, transportation, hazards, and preparedness resources—not a live incident map.
- Federal, state, tribal, county/regional, city, and community listings that can overlap without implying a single administrative hierarchy.
- Zoom- and viewport-dependent applicability: broad views include broad and local resources, while local views retain every higher-level service that applies there.
- Final clusters and coincident listing markers fan out into individually selectable points; the temporary arrangement clears when the map moves or the directory changes.
- Optional state/province, county/regional-district, city, NWS forecast-office, and tribal-reference overlays that never control whether a directory listing appears.
- Tribal nations as sovereign publishers alongside federal, state, county/regional, and local/community sources.
- Selection-based perimeter highlighting when a defensible applicability geometry exists; listings remain available without invented geometry when it does not.
- A mandatory beta acknowledgment on every page load.
- Printable filtered lists and shareable rich-text lists that retain source URLs.
- A formatted, scrollable view of the current filtered list, grouped by authority level and sorted by role and name with clickable official sources.
- On-demand postal lookup: five-digit U.S. ZIPs resolve to 2020 Census ZCTAs, while Canadian entries resolve only to the first three characters using 2021 Statistics Canada census forward sortation areas.

## Authority registry

`authority-data.js` is the inspectable local registry for the expanded alert layer. As reviewed on 2026-07-13, it contains:

- all 39 Washington county alert sources listed by Washington Emergency Management Division;
- all 36 Oregon county enrollment routes listed by OR-Alert;
- all 27 B.C. regional districts, linked to each district's official alert or emergency page;
- the city-specific systems explicitly listed by Washington EMD, plus verified Portland, Vancouver, Victoria, and Kamloops sources;
- provincial, federal-weather, wildfire-information, and First Nations support records whose roles are kept distinct from local evacuation authority.

Every expanded record identifies an authority role, source registry or direct source, review date, and a jurisdiction coverage key. Alertable, Everbridge, Voyent Alert!, CodeRED, and similar products are treated as delivery channels—not as the public authority.

The B.C. records follow the province's documented division of responsibility: a local government or First Nation is the authorized local alerting authority and normally requests a community BC Emergency Alert; provincial emergency-management staff transmit it. EmergencyInfoBC amplifies verified notices. Environment Canada and wildfire agencies publish hazard/incident information but do not become the default local evacuation authority.

## Data boundary

U.S. state, county, and municipal boundaries come from Census TIGERweb. B.C. province, regional-district, and selected municipal boundaries come from the Province of British Columbia legal administrative-boundary service. NWS County Warning Areas come from the official NOAA reference layer. Selected U.S. reservation/trust-land examples come from Census TIGERweb as optional legal/statistical reference geography.

B.C. province, regional-district, and municipal requests are retried and handled independently. A temporary failure in one boundary tier no longer suppresses successfully returned province geometry; the geometry ledger reports a partial result when only some tiers are available. The province outline also has a local snapshot retrieved from the official B.C. service on 2026-07-14, so this foundational outline is immediately available while live geometry refreshes.

Legal geometry is a geographic index, not automatic proof of service coverage. This matters especially in B.C., where a regional district may serve rural electoral areas while member municipalities operate their own emergency programs. Each record's applicability note controls the interpretation. A tribal or treaty-land reference shape is never presented as ancestral territory or emergency-service coverage.

Postal lookup follows the same rule. A ZCTA or FSA selects every mapped service area that intersects it and is labeled approximate. Because postal geography can cross jurisdictions, the visitor can confirm a precise point inside the postal outline; Signals then retains only services whose mapped areas contain that point. The lookup is performed on demand in the browser and is not stored. Shared views retain only the five-digit ZIP or three-character FSA, plus a user-confirmed map point when present.

The county/regional-district baseline is complete for the three requested regions, but a comprehensive Nation-by-Nation and municipality-by-municipality authority audit remains separate work. The interface says so through coverage notes rather than filling gaps with inferred jurisdictions. Signals contains no current-incident feed and no hand-drawn incident perimeters.

## Local preview

Serve the repository over HTTP and open `/signals/`. No build step is required.
