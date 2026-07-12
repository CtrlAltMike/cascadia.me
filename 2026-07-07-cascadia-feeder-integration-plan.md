# Cascadia.me Feeder Integration Plan

**Status:** planning
**Date:** 2026-07-07
**Scope:** Add ReadyPlan integration to Cascadia.me without disrupting an older, already-trusted free guide site.

## How to Use This Plan When Moved

This document is intended to be usable after it is copied into the actual Cascadia.me build directory. Assume the working directory is the Cascadia site root, not the ReadyPlan repo and not `model-fyi`.

Before editing, inspect the real local file structure. Expected files in the copied snapshot were:

- `index.html`
- `guides.html`
- `build-your-kit.html`
- `approach.html`
- `earthquake.html`
- `wildfire.html`
- `flooding.html`
- `winter-storm.html`
- `atlas.html`
- `css/base.css`
- `css/components.css`
- `js/nav.js`
- `js/kits.js`

If the live build directory uses templates, partials, or a static-site generator, edit the source templates/components instead of generated HTML.

Useful discovery commands:

```bash
find . -maxdepth 3 -type f
grep -RIn "ReadyPlan\|readyplan\|Start a ReadyPlan\|living household plan" .
grep -RIn "ko-fi\|Support\|Build Your Kit\|nav-links\|site-header" .
```

## ReadyPlan Contract

Cascadia should link to ReadyPlan with absolute URLs:

```text
https://readyplan.me/start?src=cascadia
https://readyplan.me/start?src=cascadia&scenario=earthquake
https://readyplan.me/start?src=cascadia&scenario=wildfire
https://readyplan.me/start?src=cascadia&scenario=flooding
https://readyplan.me/start?src=cascadia&scenario=winter
```

ReadyPlan should show Cascadia/Pacific Northwest source copy on arrival. If ReadyPlan does not yet do that, feeder links can be staged but final QA should include the ReadyPlan arrival page.

## Goal

Cascadia should continue to work as a standalone Pacific Northwest preparedness guide. The ReadyPlan integration should be a light bridge at first, not a full redesign.

Best frame:

> Use Cascadia for calm regional guidance. Use ReadyPlan when you want the checklist to stay alive for your household.

## Current State

- Cascadia predates ReadyPlan.
- It currently has no ReadyPlan references in the copied source.
- It uses a support/donation model and existing guide/kit/atlas navigation.
- The site's trust comes from regional specificity and non-commercial tone.

## Strategy

Do not retrofit Cascadia aggressively before ReadyPlan can stand alone. Add Tier-1 links and a small explanatory bridge first. Use SanAndreas as the copy/UX model after it is tuned.

## Workstream 1: Light ReadyPlan Bridge

Add a minimal, clearly optional ReadyPlan path.

### Tasks

- Preserve Cascadia's current free navigation and support/donation path.
- Add one nav or footer ReadyPlan link only if it does not crowd current navigation; footer is safer for the first pass.
- Add one contextual CTA to major guide pages:
  - earthquake
  - wildfire
  - flooding
  - winter storm
  - build-your-kit
- Suggested copy:
  - "Turn this guide into a living household plan."
  - "ReadyPlan tracks quantities, reminders, and shared supplies."
- Link to `/start?src=cascadia&scenario=<id>` where scenario is clear.
- Use full absolute URLs to `https://readyplan.me/start?...`; do not rely on relative paths from Cascadia.
- If a reusable nav/footer component exists, update that component. If pages are standalone HTML, update carefully and consistently.

### Acceptance Criteria

- Cascadia still feels free and editorial, not newly commercial.
- ReadyPlan CTAs are visible but not dominant.
- Each linked guide lands in ReadyPlan with the correct scenario preselected.

## Workstream 2: "Paper First, Living Plan Later" Section

Borrow the SanAndreas concept, localized to the Pacific Northwest.

### Tasks

- Add a short section to homepage or `build-your-kit.html`:
  - free guides remain complete
  - print/checklist path remains available
  - ReadyPlan maintains the list over time
- Emphasize PNW overlapping hazards:
  - earthquake
  - wildfire
  - flooding
  - winter storm
  - outage if represented

### Acceptance Criteria

- The ReadyPlan relationship is understandable without reading ReadyPlan's homepage.
- The copy does not imply Cascadia guidance is incomplete without paying.
- The section uses Cascadia voice, not generic SaaS language.
- Existing Ko-fi/support copy remains intact unless explicitly removed in a separate task.

## Workstream 3: Scenario Mapping

Define Cascadia to ReadyPlan scenario IDs.

### Proposed Mapping

| Cascadia page | ReadyPlan scenario |
| --- | --- |
| `earthquake.html` | `earthquake` |
| `wildfire.html` | `wildfire` |
| `flooding.html` | `flooding` |
| `winter-storm.html` | `winter` |
| `build-your-kit.html` | no scenario or default PNW bundle |

### Acceptance Criteria

- Every deep link uses a scenario ID ReadyPlan recognizes.
- Kit page link does not over-prescribe one scenario unless the user selected one.
- ReadyPlan source copy says Cascadia/Pacific Northwest correctly.

## Workstream 4: Future Data Migration

Do not scrape guide prose into ReadyPlan.

### Tasks

- Inventory current Cascadia kit/checklist content.
- Look for structured kit data in `js/kits.js` or equivalent local files.
- Identify structured items that overlap with ReadyPlan library.
- Decide whether ReadyPlan becomes canonical for shared kit data.
- Keep Cascadia editorial prose separate from item data.

### Acceptance Criteria

- The migration path preserves Cascadia's editorial voice.
- ReadyPlan item data is not manually duplicated in fragile HTML snippets.
- Future updates can be proposed to ReadyPlan users without rewriting guide pages by hand.

## Recommended Sequence

1. Complete ReadyPlan standalone homepage and source intake.
2. Add Cascadia source-specific `/start` copy if needed.
3. Add one ReadyPlan bridge section to Cascadia.
4. Add guide-level deep links.
5. Later: structured content inventory and migration.

## Local Verification

Use the site's existing verification if present. If there is no build system, serve the static directory locally and inspect at least:

- `/`
- `/guides`
- `/build-your-kit`
- `/earthquake`
- `/wildfire`
- `/flooding`
- `/winter-storm`
- `/approach`

For each changed page, verify:

- existing guide/support navigation still works
- ReadyPlan links use `src=cascadia`
- scenario links use the mapping above
- no copy suggests Cascadia is incomplete without ReadyPlan
- no visual crowding in the header on desktop or mobile nav

## Non-Goals

- Do not redesign Cascadia now.
- Do not remove Ko-fi/support links as part of the first bridge.
- Do not add ReadyPlan CTAs to every paragraph or guide card.
- Do not gate Cascadia guides or checklists.
