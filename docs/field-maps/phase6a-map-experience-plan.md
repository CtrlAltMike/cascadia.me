# Phase 6A — polished Field Maps experience

**Status:** implemented for the Olympic Peninsula regional proof

**Date:** 2026-07-21

**Scope:** improve public map discovery without changing the approved source, privacy, or commerce boundaries.

## Outcome

The Olympic Peninsula page now provides an optional interactive geographic view synchronized with the existing official-source records. It applies the useful interaction patterns seen in mature mapping products while preserving Cascadia's own editorial and trust model:

- the map and results remain visible together on larger screens;
- mobile uses a compact, expandable results sheet over the map;
- search and map-job filters reduce the source list and map features together;
- selecting a source in either place updates the other;
- layers can be turned off without hiding the underlying source records;
- the current filter and selection are represented in the URL;
- cartography is deliberately subordinate to publisher, purpose, and limitation text.

## Product boundary

This phase does not turn Cascadia into a route planner or live conditions service.

- The three source points are representative regional starting points, not routes, precise offices, access points, legal boundaries, or current locations.
- The three sheet outlines come from the verified Phase 2 USGS artifact records and coverage matrix.
- The raster reference map is the official USGS Topo service from The National Map.
- No commercial map tiles, commercial catalog content, private trail data, or user location are used.
- The page does not request geolocation or store map state in local or session storage.
- The semantic source list and complete official-source records remain usable if JavaScript, the map library, or the tile service is unavailable.
- Checkout remains closed. This phase does not change the approved NowWePlan handoff or authorize inventory expansion.

## Interaction contract

### Desktop

- Search and map-job filters appear above a map/results split view.
- A selected result is visually distinct and its corresponding point or verified sheet is emphasized.
- Clicking a map feature selects and frames the corresponding source record.
- Reset view restores the regional extent.

### Mobile

- The map stays visible as the primary geographic surface.
- Results begin in a compact sheet showing the selected record.
- The handle expands or collapses by tap, keyboard activation, or vertical swipe.
- Search or filter changes expand results so the effect is visible.

### Accessibility and resilience

- Filters and selections expose pressed state.
- The result count is announced as a polite status update.
- Keyboard users can operate the list, filters, layers, and map controls.
- Reduced-motion preferences remove interface transitions and map flight animation.
- A visible fallback explains map failure and keeps the official-source path available.
- Print output omits the interactive explorer and retains the full official-source records.

## Release gate

`scripts/field-maps/validate-phase6a-map-experience.py` protects the following invariants:

- all three approved source records and full-record anchors are present;
- exact verified sheet identifiers and bounds remain in the browser script;
- the official USGS tile endpoint remains the basemap;
- commercial tile endpoints, geolocation, and browser storage are absent;
- synchronized filters, selection, URL state, mobile sheet state, fallback, and print behavior remain wired.

## Acceptance

Phase 6A is complete when the release validator and existing Field Maps release gates pass, desktop and mobile interaction checks pass, the protected pull request merges, and the production page is verified. The existing U.S. catalog-expansion phase becomes Phase 6B and remains separately gated.
