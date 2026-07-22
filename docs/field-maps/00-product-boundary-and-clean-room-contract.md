# Cascadia Map Products: Product Boundary and Clean-Room Contract

**Status:** Approved July 21, 2026
**Date:** July 21, 2026
**Applies to:** Cascadia Atlas, Cascadia Signals, Cascadia Field Maps, NowWePlan Maps, optional NowWePlan planning, and paid map inventory
**Authority:** Implements Phase 0 of the approved revised sequence and is subordinate to [`../2026-07-20-cascadia-field-maps-nowweplan-plan.md`](../2026-07-20-cascadia-field-maps-nowweplan-plan.md).

## Decision

Cascadia has three distinct public map-related products. They may share an editorial design system, but they do not share a product job, data contract, or evidentiary role.

1. **Regional Hazard Atlas** compares selected current reports, observations, forecasts, historical records, and planning layers.
2. **Cascadia Signals** identifies the public authorities, programs, and official sources that may apply to a place.
3. **Cascadia Field Maps** helps a reader find and assess official map sources for terrain, trails, access, land management, print, and offline use.

NowWePlan has two separate roles outside Cascadia:

1. **NowWePlan Maps** may sell and deliver exact, eligible public-domain government map artifacts through one-time purchases that do not depend on a subscription.
2. **Optional NowWePlan planning** may save owners, dates, reminders, and preparation only after a person deliberately begins a private plan.

Field Maps is a list-first source finder in its MVP. It does not require an interactive map, location permission, an account, or NowWePlan. The official free source remains the primary path.

## Approved Phase 0 Interpretations

The following interpretations were approved with the revised plan on July 21, 2026:

- Field Maps has no interactive-map requirement in the MVP.
- Browser geolocation is deferred across Atlas, Signals, and Field Maps during the approved program. Locality, ZIP, or postal search may be considered where the product job requires it.
- The prohibition on OpenStreetMap-derived and commercial map material governs Field Maps inventory research, coverage validation, paid artifacts, and derivative work. It does not require removing properly attributed OpenStreetMap or OpenFreeMap basemaps from the separately governed Atlas or Signals products.
- Field Maps Phases 0 through 3 precede the approved Atlas and Signals visual work.
- Every later phase has its own review gate. Approval of this contract does not authorize Phase 1 automatically.

## Product Ownership Matrix

| Surface | Public job | Canonical information | Persistence | Location behavior | Commerce | Must not become |
| --- | --- | --- | --- | --- | --- | --- |
| **Atlas** | Compare hazard reports, observations, forecasts, historical records, and planning context | Connected official feeds and documented public datasets, each retaining its own time and limitations | No private household or route state | No browser geolocation in the approved program; a later locality search may change only the public map view | None | An official alerting authority, route planner, inventory validator, or safety prediction |
| **Signals** | Find the responsible public authority, program, enrollment route, or official source for a place | The Signals authority registry, official rosters, official boundaries, and explicit applicability notes | Checklist keys may remain in the browser; postal areas, confirmed points, and named locations are not stored as checklist state | Existing on-demand ZIP/FSA lookup and user-confirmed points remain approximate and browser-local unless intentionally shared | None | A live incident map, inferred service-boundary engine, or replacement for local instructions |
| **Field Maps** | Find and understand official map sources for a map job | Structured Field Maps source register backed by official publisher records | None in the MVP | No live location permission; regional browsing and semantic source filters must work without a canvas | Links may lead to a separate eligible NowWePlan product only after the free path is complete | A route planner, trail popularity product, commercial map catalog, or required checkout path |
| **NowWePlan Maps** | Sell and deliver exact eligible artifacts as a convenience | Its own order, entitlement, delivery, and artifact-version records, synchronized to approved eligibility decisions | Order and delivery records only as required for the transaction and promised support | No Cascadia location state is transferred | One-time guest purchase; subscription independent | A subscription gate, claim of map authorship, or exclusive source |
| **Optional NowWePlan planning** | Keep private owners, dates, reminders, and review practices | User-created private plan state | Only after deliberate user action and under NowWePlan's privacy contract | No Cascadia location, route, or checklist state is transferred automatically | Optional and separate from purchase and delivery | A prerequisite for free sources, purchase, download, or re-download rights |
| **Paid map inventory** | Exact sellable files and rights-clean bundles | Exact official publisher file, stable publisher ID, checksum, edition, rights record, territories, verification date, and replacement history | Versioned operational records | No route or customer-location data | Only artifacts that pass the strict gate | An adaptation, traced derivative, private-company compilation, or rights assumption |

## Shared Design Boundary

Atlas, Signals, and Field Maps may share:

- Cascadia typography, color tokens, spacing, focus treatment, target sizes, and editorial voice;
- card, disclosure, status, freshness, source, limitation, and print patterns;
- general interaction principles such as clear hierarchy, map-first composition where a map is the product, synchronized selection, progressive disclosure, and responsive sheets;
- accessibility and failure-resilience practices.

They must not share by implication:

- a claim that a source accepted by Atlas or Signals is eligible paid inventory;
- map coordinates, viewport state, postal state, selected routes, or checklists across products;
- one combined source registry whose records silently acquire different meanings;
- commercial map styling, tracks, annotations, difficulty ratings, route descriptions, coverage assertions, or geographic validation in Field Maps inventory work.

Screenshots of commercial mapping products may inform generic interaction analysis for Atlas and Signals. They may not be traced, reproduced, or treated as source data, reference geography, coverage evidence, validation evidence, or an artifact design template for Field Maps or paid inventory.

## Clean-Room Zones

### Zone A — Atlas and Signals interactive maps

Atlas and Signals may use properly licensed and attributed mapping libraries, basemaps, and public datasets appropriate to their existing public jobs. Their sources and styling remain governed by their own data, attribution, accessibility, and resilience contracts.

Zone A material is not evidence that an artifact is current, official for a field-map job, public domain, territorially sellable, complete, or free of third-party rights. It cannot populate an inventory eligibility decision automatically.

### Zone B — Free Field Maps discovery

The free finder may describe and link official publisher sources regardless of whether they are sellable, provided it states the source's actual rights class and does not redistribute a file without permission.

Field Maps source facts must come from official publisher pages, catalogs, APIs, files, or documented government records. Regional prose and semantic filters may organize those facts. The source list must remain usable without JavaScript, a map canvas, a tile service, an account, or location permission.

An open-government-licensed or Crown-copyrighted source may appear in the free finder. It remains blocked from sale under the strict public-domain-only policy unless the policy is explicitly changed through a new product class and legal review.

### Zone C — Inventory eligibility and coverage validation

Only allowlisted official publisher catalogs, official grid or product indexes, exact official source files, and authoritative rights records may establish inventory eligibility or coverage.

Zone C excludes:

- every Avenza product, listing, file, link, format promise, tool, service, or compatibility claim;
- private or commercial map-company products, tiles, catalogs, tracks, annotations, rankings, route descriptions, or compilations;
- OpenStreetMap-derived maps or data under ODbL;
- Esri, Mapbox, Google, Apple, or other proprietary tiles or consumer-map content;
- scans, traces, redraws, or derivatives of excluded material;
- a government artifact whose collar, metadata, imagery, roads, marks, or other components retain excluded third-party copyright;
- assumptions based on price, download availability, commercial-reuse permission, or an open licence.

An artifact remains blocked until the exact file, edition, source URL, checksum, collar, metadata, component rights, public-domain authority, and intended sale territories pass review. Ambiguity is a blocked state, not an editorial judgment call.

### Zone D — NowWePlan delivery

NowWePlan may deliver an eligible government source map only in the exact reviewed form. The source map is not watermarked, restyled, redrawn, or presented as NowWePlan authorship.

Bundle indexes, receipts, delivery instructions, disclaimers, and support documents remain separate files or pages. They may identify the included artifacts and checksums without altering the artifacts themselves. Agency seals and marks are not used as storefront branding, and no endorsement is implied.

## Canonical Records and File Separation

The intended Cascadia records are:

```text
docs/field-maps/
  00-product-boundary-and-clean-room-contract.md
  source-register.md
  editorial-template.md
  product-eligibility.md
  coverage-boundary.geojson
  coverage-matrix.csv
```

The source register will be canonical for repeated Field Maps source facts and rights classifications. Regional HTML may contain editorial interpretation but must not independently fork official URLs, edition facts, or licensing decisions.

Atlas data adapters, Signals registries, Field Maps source records, and NowWePlan commerce records remain separate. Cross-references use stable public IDs and explicit transformations; no registry inherits another registry's evidentiary status.

NowWePlan's internal inventory and order records are owned by the NowWePlan implementation, not by the Cascadia static site. Cascadia may publish the approved public eligibility explanation and link to a product, but it is not the purchase-entitlement database.

## Cross-Domain Data Contract

The first Field Maps handoff is a context-only link.

Allowed parameters are:

```text
src=cascadia
entry=field-maps
region=<approved-public-region-slug>
scenario=<recognized-public-scenario-id>
pack=<approved-public-pack-slug>
```

`scenario` is used only when the reader arrived from a genuine hazard context. A region is not a scenario. `pack` is added only after a public product exists.

The handoff must not contain or transfer automatically:

- exact coordinates or map pins;
- ZIP codes, FSAs, or other postal selections;
- a selected trail, intended route, or route text;
- travel or departure dates;
- household names, roles, contact details, or assignments;
- accessibility, care, medical, animal, equipment, or capability needs;
- Signals checklist state or completion timestamps;
- workbook values, free-text answers, or analytics identifiers intended for profile matching.

NowWePlan creates private planning state only after the person deliberately begins planning there. A purchase may create the transaction and delivery records required to fulfill the order, but purchase does not create a planning subscription or private household plan.

Any future cross-domain state transfer requires a separately approved versioned data contract, explicit consent, retention rules, privacy-copy changes on both domains, and a non-transfer fallback.

## Location and Local State

- Field Maps requests no browser location permission in the MVP and stores no region, route, or source-selection history as identity-bearing state.
- Atlas receives no browser-geolocation feature during the approved program. A later public locality search may restore only a public viewport unless separately approved.
- Signals retains its existing browser-local postal and confirmed-point behavior. Shared Signals views may contain the location fields the user deliberately chooses to share under the Signals contract; those fields are never forwarded to Field Maps or NowWePlan.
- The Signals checklist continues to store opaque resource keys and timestamps rather than locations. Field Maps does not read it.
- Analytics may record broad public region, map job, source ID, entry surface, and pack slug. They do not record coordinates, selected trails, route text, household fields, or sensitive capability needs.

## Free, Purchase, and Continuity Paths

These are three separate user choices:

1. **Free official source:** the primary path; complete enough to identify, assess, and obtain the official source without an account or purchase.
2. **One-time purchase:** an optional convenience for an exact eligible artifact whose free official source and public-domain status are disclosed beside the price.
3. **Private continuity:** an optional NowWePlan planning action, visually and functionally separate from purchase and download access.

A paid CTA follows the completed free task. It is not placed beside an urgent warning or described as safety, protection, readiness, exclusivity, or official endorsement. Lack or cancellation of a subscription never removes rights promised with a purchase.

## Navigation and Naming

- The public product name is **Cascadia Field Maps** and the pilot route is `/field-maps/`.
- The pilot receives contextual links from Atlas, Signals, relevant guides, the homepage after the regional proof, and the footer. It does not add an eighth global-navigation item.
- **NowWePlan** and `nowweplan.com` are the current public name and domain for new Field Maps handoffs.
- Older design and feeder records that say **ReadyPlan** or `readyplan.me` remain historical implementation records. They do not authorize new ReadyPlan-domain links and must not be copied into new Field Maps code or copy.
- A future umbrella navigation label such as “Maps” requires evidence of repeated Field Maps use and a separate information-architecture decision.

## Publication Gates

### Field Maps source gate

A source card may publish only when it identifies the publisher, map job, coverage, format, official cost, known edition or update state, Cascadia review date, limitations, official link, and actual rights or licence note.

### Paid artifact gate

An artifact may be offered for sale only when:

- it is the exact reviewed file from an official publisher;
- its checksum matches the eligibility record;
- its public-domain status is established for the intended sale and delivery territories;
- no excluded third-party component is present;
- it is the latest eligible publisher edition as of the displayed verification date;
- the official free source is displayed beside the price;
- delivery works without a subscription or planning account;
- the product does not depend on or recommend Avenza.

### Stop conditions

Publication or expansion pauses when a source cannot be reached, currency cannot be established, rights are ambiguous, a newer edition appears, a third-party component is found, live status is required to make the artifact useful, the free path is incomplete, purchase depends on a subscription, private state would cross domains, or maintenance load exceeds the value of the region.

## Change Control

The following changes require an explicit product-policy revision and approval before implementation:

- introducing browser geolocation to any of the three Cascadia map products;
- making an interactive map necessary to use Field Maps;
- broadening paid inventory beyond confirmed public-domain artifacts;
- using open-licensed Canadian artifacts as paid inventory;
- using OpenStreetMap, private-company, or commercial map material in inventory validation or artifact production;
- introducing any Avenza dependency, link, instruction, compatibility claim, or fallback;
- adding private cross-domain state transfer;
- making a purchase or delivery dependent on NowWePlan subscription state;
- adding a global Field Maps navigation item or merging Atlas and Field Maps under a new navigation parent.

## Phase 0 Exit Checklist

Phase 0 is complete only when this contract is approved and the following statements remain true:

- Atlas, Signals, Field Maps, NowWePlan Maps, optional planning, and inventory have distinct owners and jobs.
- The Field Maps clean-room boundary is explicit.
- Allowed and prohibited cross-domain data are explicit.
- Field Maps remains list-first, free-first, account-free, and location-permission-free in the MVP.
- OpenStreetMap/OpenFreeMap use in Atlas and Signals cannot be mistaken for inventory evidence.
- New Field Maps handoffs use NowWePlan naming and the context-only contract.
- No UI, catalog, inventory, checkout, or location feature was implemented during Phase 0.
- Phase 1 may proceed under this approved contract. Each later phase retains its own review gate.
