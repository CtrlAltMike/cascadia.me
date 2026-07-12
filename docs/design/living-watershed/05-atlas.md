# Living Watershed Regional Hazard Atlas

**Status:** Phase 6 complete

**Revision status:** Version 0.6 production record

**Date:** July 11, 2026

**Scope:** Regional Hazard Atlas

Phase 6 restores the Atlas to the economy of the approved concept board while preserving the data honesty developed in the first implementation. The Atlas remains a regional instrument, not a guide chapter, dashboard, or decorative map.

Its governing sequence is:

1. Start with connected official reports.
2. Add station observations when individual reported points help.
3. Add forecast guidance when model time and scale help.
4. Add historical or planning context when the question is about what happened before or what may be exposed.

The six layer switches were never the central density problem. The problem was that every switch carried an essay, every dependent filter remained visible, inactive state was repeated as source status, and all possible legend symbols occupied the map at once. Phase 6 replaces that flat exposure with progressive disclosure.

## Canonical control surface

There is one control DOM for desktop and mobile. It is never cloned.

The layer families are:

- **Current & observed** — Current reports and Observed wind
- **Forecast guidance** — Forecast wind
- **Historical & planning** — Earthquake records, Historical fires, and Flood planning

Current & observed opens by default. Forecast and Historical & planning remain collapsed until requested. Each family summary shows its active count. Each layer row carries a concise title, literal subtitle, switch state, loading state, partial state, or issue state.

The default desktop rail fits all three family summaries, the two current rows, and the source footer without making the reader traverse the former 1,900-pixel control document.

## Contextual settings

Settings now belong to the layer they modify:

- Forecast time appears only while Forecast wind is on.
- Earthquake time window and minimum magnitude appear beneath Earthquake records.
- Historical-fire year and minimum size appear beneath Historical fires.
- Flood planning explains its zoom-dependent FEMA behavior through status rather than a detached filter block.

The main Reset action restores Current reports as the only active layer, returns all filters to their documented defaults, closes refinement disclosures, and restores the three-family resting state. Reset view separately restores the Cascadia extent.

## Source state

Control state and source state are no longer presented as though they were the same thing.

Layer state follows this visible sequence:

`off → checking → on / partial / issue`

The aggregate source state uses conservative precedence:

`issue → checking → partial → available`

Inactive layers do not appear as failed or unavailable sources. The source dialog lists only the map and enabled layers, preserves Available, Partial, Unavailable, Not configured, and Official link only as distinct terms, and supplies direct official links where the connected feed returns them.

For current reports, the dialog now exposes the worker's source-level records rather than reducing them to one count. It also states the evacuation-geometry boundary explicitly: connected polygons are currently available for Chelan County, while Kittitas and Okanogan are official-link-only coverage. Observed wind exposes its BCWS and NOAA/METAR source states. Forecast wind exposes the ECCC model source and model-run time.

The compact rail and mobile sheet show the aggregate state. Full provenance remains one deliberate action away.

## Contextual legend

The former permanent horizontal ribbon is gone. Legend is a compact map control that opens a bounded panel.

Only active and present symbols appear:

- Current fire, evacuation, weather, and road symbols are conditioned on returned record counts.
- Observed wind appears only while station observations are active.
- Forecast wind appears only while the model field is active and identifies the gradient as wind speed in kilometres per hour.
- Earthquake, historical fire, and flood-planning symbols appear only with their respective layers.
- Failed layers do not retain successful-looking legend keys.

Attribution and MapLibre navigation controls remain separate and reachable.

## Mobile control sheet

Mobile no longer uses `display: contents`, CSS order, or a decorative drag handle to imitate a bottom sheet.

The DOM and visual sequence is the concise Atlas orientation, the map, then the single layer sheet. The closed 64-pixel command row shows the active-layer count and source state. Opening it creates a bounded, internally scrolling sheet while leaving a portion of the map visible. It uses an explicit native disclosure; no unimplemented drag behavior is implied.

The mobile sheet, map utilities, legend, source dialog, and caveat dialog remain usable at 320 CSS pixels. MapLibre bottom controls are raised above the closed sheet rather than covered by it.

## Map and dialog furniture

- The automatic “Read the map calmly” modal is removed. The interface earns calm through hierarchy instead of instructing the reader how to feel.
- Data notes remain voluntary and use a readable single-column explanation instead of small caveat cards.
- Source status is a dedicated dialog with a persistent close action, readable status rows, official links, and returned focus.
- Data notes have both a persistent close action and the closing action at the end.
- Reset view restores the regional extent; the compass continues to restore north.
- Popup close controls and map controls retain at least 44 CSS-pixel targets.

## Load and async discipline

Phase 6 corrects two trust-breaking edge cases in the former implementation.

1. The map placeholder now contains the retry control already expected by the script. A failed or timed-out map load clears the rejected initialization promise, removes a partial map, restores the placeholder, and permits a real retry.
2. Layer completion now rechecks the canonical switch before showing geometry. A slow request cannot make a layer reappear after it has been switched off. Failure hides the geometry and places an Issue state on the still-requested row.

Additional protections:

- Flood requests abort on switch-off.
- Flood completion rechecks the current switch before drawing.
- Earthquake responses are discarded when their filter key is no longer current.
- Historical-fire baseline fetching is shared, and the current filter is reapplied after the fetch resolves.
- Failed refreshes do not restyle prior geometry as current.

## Preserved data contract

Every endpoint, data adapter, popup distinction, source clock, and public/private boundary remains intact.

| Class | Examples | Production meaning |
|---|---|---|
| Current | Connected fire incidents and perimeters, evacuation polygons, weather alerts, configured road reports | Time-stamped connected reports with partial regional coverage |
| Observed | BCWS and NOAA/METAR wind stations | Individual station points, observation time, and stale distinction; not a continuous surface |
| Forecast | ECCC RDPS wind field and point query | 10 km regional model guidance with run and valid time; not observation or fire/smoke prediction |
| Historical / planning | USGS records, NIFC historical perimeters, generalized river corridors, FEMA flood zones | Filtered records and planning context; not a current condition or prediction |

The Atlas continues to explain that missing geometry is not proof of safety, fire perimeters are not spread forecasts, station wind is not terrain-resolved wind, the 10 km model smooths mountain terrain, FEMA coverage is U.S.-only where mapped, and official local instructions govern decisions.

## ReadyPlan boundary

The Atlas remains public situational awareness. It does not collect or save addresses, routes, medical information, household thresholds, or private plans. Future ReadyPlan integration may deliberately transfer a public observation into a private planning module, but no empty widget or subscription prompt appears here.

## Verification record

The production Atlas was checked at 1280, 961, 960, 640, 390, and 320 CSS-pixel widths.

- Desktop map share remains above the 65% map-first requirement.
- The default desktop layer rail does not require scrolling to discover any family.
- Mobile begins with the map and one compact layer command row.
- No tested width has page-level horizontal overflow.
- Primary controls and sheet rows retain at least 44 CSS-pixel targets.
- Forecast, observed-wind, earthquake, historical-fire, and flood-planning state transitions were exercised against their live adapters.
- Forecast time, earthquake filters, fire filters, source panels, contextual legend counts, Reset, and dialog focus return were exercised in the browser.
- Map and control runtime produced no warning or error console messages during the final pass.
- The exact six `data-atlas-layer` hooks and all existing endpoint metadata remain singular and unchanged.

Phase 8 resolved the remaining non-pointer gap with one collapsed text surface rather than more map chrome. Visible map records now lists discrete features rendered in the viewport, and Forecast wind offers a keyboard-requested model value at the map center with coordinates, time, direction, resolution, and terrain limits.

## Phase 7 handoff

Phase 7 completes the book around the finished prologue, chapters, workbook, and regional instrument. Guides becomes the illustrated table of contents; Approach becomes the author's note and evidence method; remaining utility surfaces join the same voice without being forced into chapter form.
