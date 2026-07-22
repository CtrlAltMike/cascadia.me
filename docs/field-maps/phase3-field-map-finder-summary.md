# Phase 3 Field Map Finder Summary

**Status:** Approved July 21, 2026
**Completed:** 2026-07-21
**Scope:** Free Cascadia Field Map Finder; no store, checkout, paid inventory, or account continuity

## Result

Phase 3 adds a public, list-first Field Maps surface that finishes the official-source task without payment, an account, browser location, or a commercial map service.

| Public route | Purpose |
| --- | --- |
| [`/field-maps/`](../../field-maps/index.html) | Defines the map jobs, product boundary, source families, and free public path |
| [`/field-maps/olympic-peninsula/`](../../field-maps/olympic-peninsula/index.html) | Provides the first regional proof with reviewed park, terrain, vehicle-access, land-manager, and live-status routes |
| [`/field-maps/offline-field-guide/`](../../field-maps/offline-field-guide/index.html) | Provides an eight-step offline method and printable preparation worksheet |

## Olympic Peninsula proof

The regional page separates three official source families rather than presenting one map as authoritative for every job:

- **National Park Service:** Olympic park, wilderness, and brochure maps for recreation and park context.
- **U.S. Geological Survey:** free US Topo GeoPDFs for terrain and printed reference, including three exact 2023 examples verified in Phase 2.
- **USDA Forest Service:** the official 2024 Olympic Motor Vehicle Use Maps for legal motor-vehicle designations.

Every record shows the official cost, best use, format, offline method, edition or publisher status, Cascadia review date, rights status, paid availability, direct official route, and a visible limitation.

The page links changing conditions back to Olympic National Park, Olympic National Forest, WSDOT, Washington State Ferries, NOAA, and the National Weather Service. The durable map is never presented as a closure, weather, tide, permit, passability, or safety report.

## Exact-file and commerce boundary

The Phase 2 demonstration sheets—Cape Flattery, Mount Olympus, and Port Angeles—are linked directly from their official USGS files. Their public-domain exact-file screens passed, but sale and delivery territory review remains incomplete.

Therefore:

- paid availability is displayed as **none**;
- there is no NowWePlan store link or product handoff;
- no file is represented as sale-enabled;
- no Phase 4 store, checkout, delivery, entitlement, or subscription work has started.

## Site integration

Field Maps is linked contextually from:

- the Atlas introduction;
- the Signals introduction;
- the Guides continuation section;
- the Earthquake and Wildfire source sections;
- one homepage companion paragraph; and
- the sitewide Explore footer.

The primary navigation remains unchanged. The sitemap includes all three public routes.

## Presentation and access

The implementation uses the existing Cascadia typography, warm-paper palette, and editorial hierarchy while keeping Field Maps list-first. It adds:

- responsive layouts without an interactive map dependency;
- one `h1`, skip navigation, semantic landmarks, explicit labels, and unique IDs on each new page;
- structured metadata and canonical URLs;
- a dedicated 1200 × 630 social-preview image;
- print rules for pages, source records, steps, links, and the worksheet;
- a small print-only interaction with no stored state.

The social asset was generated once with the built-in image generator, then resized and compressed for the site. The final prompt requested an editorial Pacific Northwest coastal/topographic card with the exact text “CASCADIA FIELD MAPS” and “Official sources. Offline ready.” and prohibited logos, app UI, route claims, commercial-provider styling, extra text, and watermarks.

## Validation

Run:

```sh
python3 -B scripts/field-maps/validate-phase3-site.py
node --check js/field-maps.js
```

The Phase 3 validator passed on July 21, 2026. It checks:

- all three required pages and assets;
- titles, descriptions, canonicals, JSON-LD, one `h1`, and unique IDs;
- every internal page link and fragment;
- social-image metadata;
- print support;
- sitemap registration;
- contextual entry points;
- the absence of Field Maps from primary navigation;
- the absence of commercial map-provider names and premature store/planning handoffs from the new pages.

All three pages also parse successfully with the repository's available HTML parser. The JavaScript syntax check and `git diff --check` pass.

## Approval gate

Phase 3 was approved on July 21, 2026. Phase 4 may proceed under its own review gate.
