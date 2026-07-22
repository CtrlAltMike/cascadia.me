# Cascadia Field Maps + NowWePlan Integration Plan

**Status:** decision-ready plan
**Date:** 2026-07-20
**Scope:** add a public field-map source finder to Cascadia.me and a subscription-free public-domain map store on NowWePlan.com without weakening either product's role or Cascadia's trust promises.

## Executive Decision

Build **Cascadia Field Maps** as a public source-finding and field-readiness surface on Cascadia.me. Sell eligible maps through a public NowWePlan storefront as one-time purchases. A buyer must not need a NowWePlan subscription, and guest checkout should be the default path.

The sale rule is strict: an exact map artifact is eligible only when the rights record establishes that it is in the public domain for the intended sale and delivery territories, contains no excluded third-party copyrighted layer, and is the latest publisher edition at the time of the catalog check. Commercial-reuse permission alone does not satisfy a public-domain-only policy.

Avenza is excluded completely. The project will not use Avenza as a source, marketplace, vendor, app handoff, compatibility target, QR scheme, authoring tool, review service, delivery channel, customer recommendation, or fallback. A buyer's independent software choices are outside the product, and NowWePlan documentation will not direct them to Avenza.

The product boundary should be:

| Surface | Owns |
| --- | --- |
| **Cascadia.me** | public official-source discovery, regional interpretation, map-use guidance, source freshness, licensing notes, free printable preparation baseline, and transparent links to live conditions |
| **NowWePlan.com** | public map catalog, one-time guest checkout, delivery and receipts, plus optional private continuity for subscribers or account holders |
| **Map inventory** | exact public-domain government map artifacts and rights-clean bundles; no commercial map-company content, styling, trail compilation, tiles, or derivative work |

This is an extension of the relationship already implemented across the Cascadia guides, workbook, Signals, and Field Stories. Cascadia helps a reader understand and assemble public information. NowWePlan sells and delivers the verified map artifact and, separately, can help an account holder keep work alive over time. Purchase and subscription are independent.

## What Changes From the Earlier Map-Commerce Plan

| Earlier proposal | Revised decision |
| --- | --- |
| Launch a generic `/maps/` commerce pillar | Launch a clearly differentiated **Field Map Finder**; avoid confusion with the existing Regional Hazard Atlas |
| Add email capture to Cascadia | Do not create a second relationship database in the MVP |
| Put checkout on Cascadia or a generic external store | Put public product pages and one-time checkout on NowWePlan; do not require a subscription |
| Build a future Cascadia readiness membership | Remove this; continuity and recurring planning belong to NowWePlan |
| Put checklists, saved resources, and recurring updates in map packs | Keep the public baseline on Cascadia; put owned tasks, review dates, and reminders in NowWePlan |
| Treat one PDF as the product | Build a sheet-level catalog, then offer rights-clean regional bundles from eligible sheets |
| Expand immediately across Washington, Oregon, and B.C. | Define a versioned Cascadia boundary and prove complete grid coverage; B.C. sales remain blocked under a literal public-domain-only rule unless an eligible source is found |
| Describe the feature as “official trail maps” | Use “official map sources”; a source can be official while an individual route or trail record may be incomplete, old, or outside that publisher's authority |

The free finder remains the trust and discovery layer. The NowWePlan store is a separate transaction surface, not a subscription gate around the finder.

## Existing Contract to Preserve

The current Cascadia implementation establishes these promises:

- Cascadia remains public, printable, and useful without an account.
- NowWePlan is optional and is described as a private continuity layer.
- A map purchase on NowWePlan does not require a subscription or planning account.
- Cascadia does not transfer workbook answers, Signals locations, or checklist state.
- Official alerts and instructions take priority when conditions change.
- Cascadia carries no advertising or affiliate links.
- Reader support follows usefulness rather than urgency.
- The guides, workbook, and Atlas remain public; preparedness information does not move behind a paywall.

The map feature must pass all eight tests. Directly selling a verified public-domain map is not the same as advertising or an affiliate link, but the official free source, rights status, latest-edition check, safety checks, and core instructions must remain visible.

Every paid product page should say, in substance:

> This source map is in the public domain and is also available without charge from its official publisher. A NowWePlan purchase pays for current-edition verification, organized discovery, dependable delivery, and support. NowWePlan did not create the source map and does not claim exclusive rights in it.

## Naming and Information Architecture

### Recommended public name

**Cascadia Field Maps**
Descriptor: **Official map sources for trails, terrain, access, and offline use.**

“Field Maps” distinguishes the new surface from:

- **Atlas:** selected hazard reports, observations, forecasts, historical records, and planning layers.
- **Signals:** the agencies and public programs responsible for a place.
- **Guides:** hazard interpretation and household decisions.
- **NowWePlan:** private, persistent household action.

### Recommended URL

```text
/field-maps/
```

Use a specific URL rather than `/maps/` in the pilot. “Maps” is too broad beside an established Atlas and map-based Signals product.

### Pilot IA

```text
/field-maps/
  index.html                         # finder landing page
  olympic-peninsula/
    index.html                       # first regional proof
  north-cascades/
    index.html                       # second region after proof
  offline-field-guide/
    index.html                       # durable use guidance
```

Do not add an eighth global navigation item for the pilot. Introduce Field Maps contextually from:

- Atlas: “Looking for a navigation or recreation map?”
- Signals: “Looking for trail, terrain, or access maps?”
- relevant guide source sections
- one homepage companion link after the regional page is complete
- the footer

After evidence of repeat use, decide whether to create a broader “Maps” navigation parent for Atlas and Field Maps. That is a later IA decision, not an MVP prerequisite.

## The Three-Layer User Journey

```text
Cascadia Field Maps
    public source discovery and field-use guidance
        |
        +--> Official publisher
        |      map download, current edition, closure, road, fire, and weather status
        |
        +--> NowWePlan Maps
               one-time map or bundle purchase; no subscription required
                   |
                   +--> Guest delivery
                   |      receipt and download without a planning subscription
                   |
                   +--> Optional NowWePlan planning
                          owners, dates, reminders, saved preparation, and practice
```

No layer should impersonate another:

- Cascadia must not become the publisher of changing official conditions.
- NowWePlan must not be required to obtain the public sources.
- A subscription must not be required to view products, purchase, receive, or re-download within the stated delivery period.
- A paid map must not be presented as proprietary, the only complete source, or the safe option.

## MVP Content Model

Each regional page should answer a job, not merely list map vendors.

1. **What are you trying to do?** Trail/recreation, terrain/topography, vehicle access, land manager boundaries, or offline backup.
2. **Who publishes the relevant source?** Include the publisher's jurisdiction and authority.
3. **What format is available?** Web map, PDF, GeoPDF, app-delivered map, print purchase, or data download.
4. **Can it work offline?** State the actual preparation required before leaving service.
5. **How current is it?** Show the source edition when available and Cascadia's own review date separately.
6. **What does it not establish?** A map may not prove that a trail, road, bridge, campsite, or route is open or safe.
7. **What must be checked live?** Link directly to the responsible closure, road, fire, weather, or park source.
8. **How can the work be kept?** Offer one optional NowWePlan handoff after the free path is complete.

### Source-card fields

```json
{
  "source_id": "usgs-topo",
  "publisher": "U.S. Geological Survey",
  "title": "USGS Topographic Maps",
  "jurisdiction": "United States",
  "coverage": ["olympic-peninsula"],
  "jobs": ["terrain", "print", "offline"],
  "official_url": "",
  "download_url": "",
  "formats": ["GeoPDF", "GeoTIFF", "web"],
  "official_cost": "free",
  "edition_or_update": "",
  "publisher_product_id": "",
  "publisher_published_at": "",
  "cascadia_reviewed_at": "2026-07-20",
  "latest_edition_checked_at": "2026-07-20",
  "source_checksum_sha256": "",
  "licence_name": "",
  "licence_url": "",
  "rights_class": "unknown",
  "public_domain_territories": [],
  "sale_status": "blocked-unreviewed",
  "required_attribution": "",
  "third_party_rights": "",
  "live_status_url": "",
  "limitations": ""
}
```

Use explicit controlled values for `rights_class`:

- `public-domain-us`
- `public-domain-confirmed-territories`
- `open-government-licensed`
- `copyrighted-third-party`
- `unknown`

Use separate controlled values for `sale_status`:

- `eligible`
- `paused-new-edition-check`
- `blocked-open-licence-not-public-domain`
- `blocked-third-party-copyright`
- `blocked-territory`
- `blocked-stale`
- `blocked-unreviewed`

“Available to download,” “free,” and “commercial reuse permitted” are not equivalent to public domain. A map is not sellable until the exact file, edition, collar, embedded metadata, component sources, and sale territories pass review.

## Source and Licensing Gate

Create one source register before page production. The register should cover both the source itself and each exact artifact proposed for a paid pack.

At minimum record:

- exact dataset or map title
- exact publisher product or sheet ID
- source owner and URL
- geography and map job
- source-file URL and SHA-256 checksum
- edition, publication date, revision date, and update cadence
- date the latest available publisher edition was checked
- free/paid status at the official source
- public-domain authority and applicable territory
- licence name and version when the artifact is not public domain
- public-domain, open-licence, copyrighted, and unknown components
- collar and embedded-metadata review
- third-party copyright statement review
- attribution language
- third-party data, marks, logos, or imagery
- warranty or reliance disclaimer
- owner of the internal review and review date
- sale status and reason

### Verified starting points

- [USGS topographic map copyright FAQ](https://www.usgs.gov/faqs/are-usgs-topographic-maps-copyrighted?items_per_page=6&page=1): USGS topographic maps are public domain except for specified US Topo third-party road or imagery cases. For a strict catalog, exclude rather than rely on the permission to redistribute those exception maps with retained notices.
- [USGS map currency FAQ](https://www.usgs.gov/faqs/how-current-are-us-topo-maps): US Topo follows a three-year production cycle, but feature currency varies with the underlying sources. Product copy must say “latest publisher edition, checked [date],” not make an unqualified “up to date” claim.
- [The National Map download and API guidance](https://www.usgs.gov/faqs/how-do-i-download-national-map-data-products): use the official catalog and TNM Access API to locate product versions rather than scraping a commercial map catalog.
- [USGS data-licensing guidance](https://www.usgs.gov/data-management/data-licensing): U.S. federal public-domain status is territorial and non-federal components can retain rights. The sale-territory field therefore cannot be omitted.
- [National Park Service map accuracy and rights guidance](https://www.nps.gov/subjects/gisandmapping/data-sources-and-accuracy.htm): NPS maps are public domain, but NPS warns that its general-reference maps are not for specialized backcountry navigation and are not legal boundary documents.
- [Forest Service map example and map roles](https://www.fs.usda.gov/r06/ochoco/maps-guides): free current Motor Vehicle Use Maps serve a different legal/navigation job from Forest Visitor and topographic maps.
- [Washington Geological Survey use and citation guidance](https://dnr.wa.gov/washington-geological-survey/publications-and-data/disclaimers-and-citation-guidelines): WGS materials can be reused commercially with citation, but this does not automatically cover every WA DNR recreation product or third-party layer.
- [Oregon GEO FAQ](https://www.oregon.gov/eis/geo/pages/faq.aspx): GEOHub data is free to use, with dataset-specific disclaimers and terms still requiring review.
- [Natural Resources Canada topographic maps](https://natural-resources.canada.ca/maps-tools-publications/maps/topographic-maps) and [basemaps](https://natural-resources.canada.ca/science-data/data-analysis/geospatial-data-tools-services/basemaps-canada): these can support the free B.C. finder, but Open Government Licence coverage does not make an artifact public domain.
- [Government of Canada Crown-copyright guidance](https://www.canada.ca/en/canadian-heritage/services/crown-copyright-request.html): maps prepared under Government of Canada control are generally Crown-copyrighted, and commercial reproduction requires the applicable permission or licence.
- [Open Government Licence – British Columbia](https://www2.gov.bc.ca/gov/content/data/policy-standards/data-policies/open-data/open-government-licence-bc): it allows commercial reuse for catalogue records that specify the licence, but copyright and licence conditions remain. Under a literal public-domain-only store rule, those records are not eligible for sale.
- [Recreation Sites and Trails B.C.](https://www2.gov.bc.ca/gov/content?id=F5F42615F5714F2698FD94D5D0579EF5): use its live site/trail, alert, closure, and warning surfaces as official handoffs; audit any underlying dataset separately before reuse.

This register is a publication control, not a legal opinion. Any ambiguity produces a blocked SKU. “Open government,” “royalty-free,” “commercial reuse,” or “available through a third-party marketplace” must never be normalized to `public-domain`.

### Strict public-domain and clean-room rules

Eligible inventory must come from an allowlisted official publisher catalog. Do not use a private map company's product as a source, reference layer, coverage model, validation layer, or visual template.

Exclude:

- paid or free commercial map-company products
- all Avenza products, store listings, hosted files, app links, custom URL schemes, publisher tools, and compatibility claims
- OpenStreetMap-derived maps or data under ODbL
- Esri, Mapbox, Google, Apple, or other proprietary tiles
- private trail-app tracks, annotations, difficulty ratings, route descriptions, or curated bundles
- scans of printed commercial maps or guidebooks
- government maps whose collars or metadata identify a third-party copyrighted component
- redraws or traced derivatives of any excluded source

Preserve an eligible government source map unmodified. Put NowWePlan receipts, instructions, bundle indexes, and disclaimers in separate files or pages rather than watermarking or restyling the map itself. Do not use agency seals or logos as storefront branding and do not imply endorsement.

### Current-edition rule

“Up to date” is not a durable map property. The operational promise should be:

> Latest publisher edition verified on [date]. Individual features may have different source dates. Check current official trail, road, closure, fire, weather, and access information before use.

For every sellable SKU:

1. query the official publisher catalog by stable product or sheet ID
2. select the newest eligible edition
3. download only from the official publisher
4. inspect the collar and embedded metadata for third-party rights
5. calculate and store a checksum
6. record publication and verification dates
7. pause the SKU if a later edition appears, the source check fails, or the publisher withdraws the artifact
8. re-enable the SKU only after the replacement file passes the full rights review

Historical maps may be offered only in a clearly separate historical collection. They must never be labeled current or mixed into the default current-map results.

### Geographic completeness rule

“Everywhere within Cascadia” requires a versioned boundary, not an informal region list.

- Adopt one documented Cascadia coverage polygon and version it.
- Intersect the polygon with the official USGS quadrangle index and any other eligible publisher indexes.
- Maintain a grid-coverage matrix: inside boundary, latest artifact, rights state, currency state, and store state.
- Do not claim complete coverage until every intersecting grid cell is either sellable or visibly identified as unavailable under the strict rights policy.
- Under the current strict rule, detailed B.C. maps can appear in the free finder but remain blocked from sale because open-government licensing is not public-domain status.

## Durable Versus Live Information

A field pack becomes unsafe and expensive to maintain if it freezes volatile status into a PDF.

### Appropriate durable content

- what each map type is for
- how to identify the publisher and edition
- how to download and test an offline map
- how to print to scale
- how to carry a paper backup
- map symbols and scale reminders linked to authoritative instruction
- QR/source index that resolves to a Cascadia-maintained redirect or source page
- blank route, turnaround, contact, and check fields
- “if cell service fails” practice prompt

### Keep live at the official source

- trail and road closures
- fire perimeters and restrictions
- weather and river conditions
- evacuation orders and routes
- permit and reservation status
- ferry and transit status
- bridge, campsite, and facility availability
- current legal motor-vehicle access

Every print or PDF artifact should carry an edition date, a “check again before leaving” panel, and direct official-source routes. Avoid claims such as “safe route,” “current route,” or “complete trail coverage.”

## NowWePlan Handoff Contract

### Recommended link

```text
https://nowweplan.com/start?src=cascadia&entry=field-maps&region=olympic-peninsula
```

Add `scenario=<recognized-id>` only when the reader came from a hazard-specific context. A field region is not itself a hazard scenario.

### Allowed handoff data

- `src=cascadia`
- `entry=field-maps`
- a broad, public region slug
- an existing recognized scenario ID when relevant
- a public pack slug after commerce exists

### Do not put in the URL or transfer automatically

- exact coordinates or map pin
- postal code
- selected trail or intended route
- travel dates
- household names or roles
- accessibility, care, medical, animal, or equipment needs
- Cascadia checklist state
- free-text answers

The first implementation should remain a context-only link. If cross-domain state transfer is ever proposed, it requires explicit consent, a data-contract version, retention rules, and a privacy-copy change on both products.

### Arrival behavior NowWePlan should support

For `entry=field-maps`, the arrival page should explain the relationship in the same restrained voice already used by Cascadia:

- the official sources remain available on Cascadia and from their publishers
- NowWePlan is optional
- NowWePlan can keep owners, dates, and review prompts
- live official information still comes first

A starter planning sequence may include:

1. confirm the authoritative map and current edition
2. save the offline map on every device that needs it
3. test it in airplane mode
4. print or carry a non-battery backup
5. confirm the land manager and official condition sources
6. set a pre-departure review date
7. assign who checks road, trail, weather, and fire status
8. practice locating the household or group without a network connection

NowWePlan should create persistent state only after the user chooses to begin there.

## CTA Hierarchy

The regional page should complete the free task before showing a conversion path.

1. **Primary:** Open the official map source.
2. **Secondary:** Read the free offline/print guidance.
3. **Purchase:** “Buy this verified edition on NowWePlan — one-time purchase, no subscription.”
4. **Continuity:** “Keep these checks current in NowWePlan,” shown separately from purchase.

Do not place the paid CTA beside an active warning, closure, or fear-based hazard message. Do not describe a purchase as protection, safety, or readiness itself.

## Commerce Model

### What can be sold

Sell exact eligible public-domain government map artifacts and bundles assembled only from eligible artifacts. The price is for discovery, latest-edition verification, organization, delivery, and support—not copyright exclusivity.

Candidate value:

- an individual current USGS quadrangle or other rights-cleared public-domain government map
- all eligible current sheets intersecting a named Cascadia region
- a complete eligible current-map bundle for the versioned Cascadia boundary
- stable naming, sheet indexing, checksums, and edition records
- a separate region index that points to the included unmodified maps
- digital delivery and a supported re-download window
- later, printing or weather-resistant physical fulfillment of the same verified artifacts

### What remains free

- every necessary official-source link
- what each source is for
- limitations and freshness notes
- live closure, fire, weather, road, and alert handoffs
- the offline preparation baseline
- the NowWePlan continuity handoff
- the official no-cost download URL for every paid public-domain artifact

### Do not build yet

- a Cascadia account
- a Cascadia membership
- a parallel reminder engine
- a separate map-plan database
- affiliate recommendations
- subscription-gated product pages, checkout, delivery, or re-download
- maps carrying open licences or commercial permissions that fall short of public domain
- value-added private-company maps or any derivative based on them
- printed inventory before one digital/print-on-demand test proves demand

### NowWePlan storefront contract

NowWePlan is the store. Recommended public routes:

```text
https://nowweplan.com/maps
https://nowweplan.com/maps/<region-or-sheet-slug>
https://nowweplan.com/maps/orders/<opaque-order-reference>
```

Requirements:

- Products and rights disclosures are public.
- Checkout is a one-time payment.
- Guest checkout is supported.
- No subscription trial, membership selection, or planning onboarding is inserted into the purchase path.
- Transactional email is used only for receipt, delivery, correction, and support unless the buyer separately consents to marketing.
- A buyer can receive the product without creating a planning account.
- Existing NowWePlan users may attach an order to their account after purchase, but this is optional.
- A post-purchase planning CTA is visually and functionally separate from download access.
- Canceling or lacking a NowWePlan subscription never removes rights already promised for a purchase.
- The storefront states the free official source beside the price and does not claim ownership of the source-map copyright.

## Technical Shape for the Static Site

The current Cascadia site is static HTML/CSS/JavaScript. Keep the first implementation compatible with that shape.

Suggested files:

```text
field-maps/
  index.html
  styles.css
  app.js
  source-data.js
  olympic-peninsula/index.html
  offline-field-guide/index.html
docs/field-maps/
  source-register.md
  editorial-template.md
  product-eligibility.md
  coverage-boundary.geojson
  coverage-matrix.csv
```

Use one structured source registry to render/filter repeated source facts. Keep regional editorial prose in HTML so it remains readable, indexable, and easy to review. Do not duplicate official URLs and licence facts independently across many pages.

The NowWePlan implementation should keep map commerce separate from subscription entitlements. A purchase entitlement is keyed to the order, not to subscription state. Its inventory service should retain the publisher ID, exact source URL, source checksum, edition date, verification date, rights decision, and replacement history for every delivered artifact.

### Required source display

Every rendered source card must show:

- publisher
- map job
- coverage
- format and official cost
- edition/update when known
- Cascadia review date
- limitations
- official-source link
- attribution/licence note when displayed or repackaged

### Accessibility and resilience

- The source list must work without the interactive filter.
- Do not make a map canvas the only navigation method.
- Use real links, headings, lists, and tables.
- Print output must preserve URLs or QR destinations and disclaimers.
- A third-party map, tile server, or script failure must not hide the official source list.
- Do not add live location permission to the MVP.
- Do not add an Avenza link, badge, format promise, import instruction, or fallback path.

## Analytics Without a Second Identity System

Measure utility and handoffs, not sensitive trip intent.

Suggested events:

- `field_map_source_opened`
- `field_map_offline_guide_opened`
- `field_map_nowweplan_handoff`
- `field_map_pack_interest`
- `field_map_pack_checkout_started`
- `field_map_pack_purchased`

Useful dimensions:

- broad region slug
- map job
- source ID
- entry surface
- pack slug

Do not log exact coordinates, selected trails, route text, household fields, or sensitive capability needs. Use the existing `src=cascadia` and `entry` attribution pattern at the domain boundary rather than cross-domain profile matching.

## Phased Build Plan

### Phase 0 — Store, rights, and geography contract

**Goal:** lock the clarified business rules before UI work.

- Approve NowWePlan as the public storefront and purchase-entitlement owner.
- Require one-time guest checkout with no subscription dependency.
- Adopt the strict public-domain-only sale rule.
- Define and version the Cascadia coverage boundary.
- Define sale territories and obtain appropriate legal review for any cross-border digital distribution.
- Confirm `entry=field-maps` and broad `region` handling for the separate optional planning path.
- Confirm that no private Cascadia state crosses the domain boundary.

**Exit:** signed-off product, entitlement, rights-classification, coverage, and handoff contracts.

### Phase 1 — Official catalog and coverage matrix

**Goal:** enumerate every map cell before claiming regional completeness.

- Create the source register and coverage matrix.
- Intersect the versioned Cascadia boundary with the USGS quadrangle index.
- Pull candidate products from The National Map official catalog or API.
- Identify the latest edition for every intersecting sheet.
- Record missing, historical-only, rights-blocked, and verification-blocked cells.
- Keep Canadian open-government sources in the free-finder register but mark them unsellable under the strict rule.

**Exit:** every cell in the coverage boundary has a visible catalog state and no unknown state is represented as sellable.

### Phase 2 — Artifact verification pipeline

**Goal:** make eligibility reproducible at the exact-file level.

- Download candidates only from official publisher URLs.
- Inspect every collar and embedded metadata record.
- Reject third-party copyrighted components even if redistribution with notice would otherwise be allowed.
- Store publisher ID, edition date, official URL, checksum, rights record, and verification date.
- Add a scheduled check for newer publisher editions and withdrawn files.
- Pause rather than sell when the check cannot establish current-edition status.

**Exit:** the pipeline can produce an auditable eligible/blocked decision and automatically pause superseded inventory.

### Phase 3 — Free Cascadia Field Map Finder

**Goal:** provide complete public discovery and transparent official-source access.

- Build `/field-maps/` and the offline field guide.
- Build the Olympic Peninsula regional proof.
- Show official free download, latest-edition check, rights class, limitations, and live-status links.
- Link contextually from Atlas, Signals, and relevant guides.
- Add sitemap, metadata, accessibility, and print support.

**Exit:** a reader can identify and obtain the official source without paying or creating an account.

### Phase 4 — Subscription-free NowWePlan map store

**Goal:** sell the same verified eligible artifacts through a clean one-time purchase path.

- Build public `/maps` catalog and product pages on NowWePlan.
- Show the public-domain disclosure and official free source beside each price.
- Implement guest checkout and order-based delivery.
- Keep map-purchase entitlements independent from subscription state.
- Send transactional delivery/receipt messages without marketing enrollment.
- Offer optional account linking and optional planning only after delivery access is established.
- Test non-user, free-account, subscribed, canceled, and never-subscribed purchase paths.

**Exit:** a person who has never subscribed can discover, buy, receive, and use a map without entering a subscription flow.

### Phase 5 — Pilot inventory

**Goal:** validate operations with a bounded, high-confidence catalog slice.

- Launch the latest eligible USGS sheets covering Olympic Peninsula.
- Offer individual sheets and one bundle assembled solely from those sheets.
- Keep source maps unmodified; deliver any bundle index separately.
- Test edition replacement, SKU pause, correction, refund, and support procedures.
- Measure whether buyers understand the free-source disclosure and the convenience being purchased.

**Exit:** rights, freshness, delivery, correction, and subscription independence are proven in production.

#### Phase 5B — public-content production preparation

Direct purchasing has been deliberately deferred. Phase 5B prepares the connected Cascadia and
NowWePlan public-content release while all products remain paused, unpriced, and unavailable for
checkout or delivery. Its live-state audit, controlled release order, approval boundary, and
rollback plan are recorded in
[`field-maps/phase5b-production-release-plan.md`](field-maps/phase5b-production-release-plan.md).
Phase 5B publication does not satisfy the Phase 5 commerce exit above.

### Phase 6A — Polished public map experience

**Goal:** apply mature map interaction patterns to the public Olympic Peninsula proof without weakening Cascadia's source or privacy boundaries.

- Add an optional map synchronized with the semantic official-source results.
- Keep search, map-job filters, selection, and visible map features in one state.
- Use a desktop map/results split and a compact, expandable mobile results sheet.
- Preserve useful URL state for filters and source selection.
- Use the official USGS Topo basemap, clearly labeled representative publisher points, and verified sheet bounds.
- Do not request location, store map state, or depend on the map for the free official-source task.
- Keep complete source records, no-script resilience, accessibility, reduced motion, and print support.

**Exit:** the interaction validator and desktop/mobile checks pass, the protected release merges, and production is verified.

The implementation and acceptance contract are recorded in
[`field-maps/phase6a-map-experience-plan.md`](field-maps/phase6a-map-experience-plan.md).

### Phase 6B — Complete eligible U.S. Cascadia coverage

**Goal:** reach every sellable cell within the U.S. portion of the adopted boundary.

- Expand by official grid rather than by commercial recreation-market regions.
- Add Washington and Oregon systematically, then any other U.S. area included by the adopted boundary.
- Publish coverage gaps and block reasons honestly.
- Add region bundles only after sheet-level completeness is verified.
- Keep all newer-edition checks running continuously.

**Exit:** every U.S. boundary cell is eligible and available or visibly blocked with a recorded reason.

### Phase 7 — B.C. free coverage and rights decision

**Goal:** cover B.C. editorially without mislabeling Crown-copyrighted material as public domain.

- Include official NRCan and B.C. sources in the free Field Map Finder.
- Label legacy, archived, current-service, and open-government-licensed products accurately.
- Do not sell an Open Government Licence artifact under the strict public-domain rule.
- If business policy later expands to “rights-cleared official maps,” create a separate product class, disclosure, attribution system, and legal review before any B.C. SKU is enabled.

**Exit:** B.C. is useful and complete as a free finder; paid availability remains truthful to the chosen rights policy.

## Release Checklist

### Cascadia

- Free source path is complete.
- Field Maps is distinguishable from Atlas and Signals.
- No affiliate links are introduced.
- No account, hidden data transfer, or location permission is introduced.
- All sources have publisher, role, freshness, limitations, and official links.
- Paid CTA follows rather than interrupts the free task.
- The Approach page remains true as written, or any policy change is made explicitly before launch.

### NowWePlan

- Public catalog and product pages do not require login.
- Checkout is one-time and guest-capable.
- Purchase and delivery do not require a subscription.
- Subscription cancellation cannot revoke a purchase entitlement.
- Transactional email does not enroll the buyer in marketing.
- The official free source is disclosed beside the price.
- `src=cascadia` and `entry=field-maps` are preserved.
- Region/scenario parameters are recognized rather than silently ignored.
- Arrival copy explains the relationship.
- No plan state is created without user action.
- No public map or safety information becomes account-gated.
- Privacy copy matches the actual transfer behavior.

### Paid artifact

- Every included source is confirmed public domain in the intended sale and delivery territories.
- No artifact contains a third-party copyrighted component.
- The exact file checksum matches the reviewed source record.
- The artifact is the latest publisher edition as of the displayed verification date.
- Product copy says “latest publisher edition” rather than making an unqualified currentness claim.
- Attribution and retained notices are present.
- Official logos or marks do not imply endorsement.
- Edition and review date are visible.
- Live status is not frozen and presented as current.
- “Check again before leaving” sources are direct and legible.
- Product support, delivery, refund, and correction paths exist.

## Success Metrics

Use evidence gates rather than the earlier arbitrary traffic and sales targets.

### Utility

- percentage of regional-page visits that open an official source
- offline-guide engagement
- source-link failure rate
- time required to review and maintain one region
- user success in naming the correct map for their job

### Continuity

- NowWePlan handoff rate after completion of the free task
- NowWePlan arrival completion rate for `entry=field-maps`
- percentage that set at least one owner or review date
- no unexpected transfer of location or household data

### Commerce

- individual-sheet and bundle conversion after viewing the free-source disclosure
- guest-checkout completion rate
- attempted subscription prompts in the purchase path: zero
- delivery success for buyers with no NowWePlan account
- refund/support rate
- edition-replacement and automatic-pause success rate
- catalog coverage: eligible, blocked, stale, and unknown cells
- evidence that buyers understand they are paying for verification, organization, delivery, and support rather than copyright exclusivity

## Stop Conditions

Pause expansion if any of the following occurs:

- the free page cannot tell a reader which source is authoritative for a job
- a paid-product source is anything other than confirmed public domain under the strict rule
- the collar or metadata identifies third-party copyright
- the latest-edition check is stale or cannot reach the publisher
- the pack requires volatile status to remain useful
- purchase or delivery becomes dependent on a NowWePlan subscription
- any source, sales, delivery, viewing, documentation, or support path depends on or recommends Avenza
- Cascadia and NowWePlan begin storing the same planning state
- the handoff requires passing private location or household data without an explicit new consent model
- product copy implies safety, official endorsement, or proprietary ownership of a government map
- ongoing review load exceeds the value of the region
- the only viable revenue depends on affiliate links or gating core preparedness guidance

## First Build Slice

The first build should produce only these five things:

1. the versioned Cascadia boundary and USGS coverage matrix
2. the strict public-domain artifact register and eligibility pipeline
3. the `/field-maps/` landing page and Olympic Peninsula regional proof
4. the public `/maps` product and guest-checkout contract on NowWePlan
5. the separate context-only NowWePlan planning contract for `entry=field-maps`

The first sellable inventory should be the latest eligible USGS sheets covering Olympic Peninsula, offered individually and as an unmodified-source bundle. Do not add a subscription requirement, private-company layer, or Canadian open-licensed artifact to this pilot.

## Recommendation

Proceed with **free Cascadia Field Map Finder + subscription-free NowWePlan public-domain map store + optional NowWePlan continuity**.

Cascadia should make the official path easier to find. NowWePlan should make an exact, verified current-edition artifact easy to buy and receive without a subscription, while remaining honest that the same public-domain source is available free from its publisher. Optional planning stays separate. B.C. can be fully represented in the free finder, but a literal public-domain-only sales policy cannot quietly relabel Crown-copyrighted, open-government-licensed maps as public domain.
