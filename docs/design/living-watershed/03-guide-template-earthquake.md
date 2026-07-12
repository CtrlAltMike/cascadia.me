# Living Watershed Earthquake: Chapter One

**Status:** Phase 3 complete; canonical long-form guide proof

**Date:** July 11, 2026

**Scope:** Revision path item 3

Earthquake is the first guide rebuilt under the version 0.5 editorial constitution. It replaces the version 0.4 stack of repeated bands, cards, micro-headings, and calls to action with an illustrated chapter that can be read continuously. It also preserves a short, early path for someone who needs the safety instructions immediately.

This page is a proof of editorial rhythm, not a template whose section count or sentences should be copied into the other hazards.

## Outcome

The finished chapter now does four things at once:

1. It begins with the coast, the plate boundary, and ordinary regional life rather than a statistic.
2. It keeps Drop, Cover, and Hold On and the mapped-tsunami-zone branch immediately reachable.
3. It gives the reader a sustained composite household account, a geological explanation, local-ground distinctions, and practical preparation in connected prose.
4. It ends with a concise quick reference and primary official sources without turning the whole chapter into a brochure.

The governing promise remains:

> Protect life first. Understand the place. Make the next useful action easier.

## Chapter sequence

The production page follows this subject-specific reading path:

1. **Regional opening** — Cape Mendocino to Vancouver Island, with the locked landscape-and-plate-boundary hero.
2. **Emergency bypass** — Drop, Cover, and Hold On; body adaptations; the natural-warning branch for a mapped tsunami hazard zone.
3. **The ground beneath the familiar** — the offshore boundary, the region's other earthquake sources, and a field note on prediction and early warning.
4. **An ordinary room, interrupted** — one disclosed composite household account about a renter, a partner separated by a bridge, an older parent using a walker, familiar objects, aftershocks, one useful message, and a neighbor agreement.
5. **A coast slowly changing shape** — the Juan de Fuca plate system, the 1700 event, the locked process plate, and the carefully bounded 2025 USGS probability.
6. **Why place changes the experience** — amplification, liquefaction, construction, official local maps, and the distinction between the coast and a mapped tsunami hazard zone.
7. **Make the first useful actions easier** — connected household decisions about rooms, water, medicine, medical power, gas, sanitation, communication, animals, cost, and gradual preparation.
8. **A care-centered conclusion** — preparedness as added agency and attention, not invulnerability.
9. **Earthquake quick reference** — while it is shaking, when it stops, and ahead of time.
10. **Sources** — science and warning, regional guidance, ground and local maps, and after-event health guidance.

## What carries forward

Future primary guides should inherit standards, not phrases:

- A reading path and a compact reference path coexist.
- Prose is the spine; headings mark genuine changes in subject.
- A large hero establishes place and physical process.
- A household scene carries one disclosed composite narrative.
- A process plate explains a relationship that prose alone would make abstract.
- Practical guidance is embedded where the reader understands why it matters.
- A field note appears only when a distinction or source limit changes understanding.
- The urgent reference remains public, early, concise, and printable.
- Primary sources, geographic limits, and review date remain visible.

The following are not reusable requirements:

- Ten sections
- The Earthquake heading pattern
- A three-part action band for every hazard
- Before / During / After as the narrative spine
- The same composite-household structure
- The same pace, sentence shapes, or household tensions
- An identical quick-reference layout

Wildfire, Flooding, and Winter Storm must each be recognizable without their titles.

## Narrative truth

The composite account is disclosed once, where it begins. Its people and scene are created from established preparedness guidance and common regional conditions; they are not presented as reports about identifiable residents or a specific earthquake.

The story deliberately avoids exact addresses, times, orders, losses, injuries, quotations, and resolved outcomes. It may use names, relationships, ordinary objects, a bridge, rented housing, mobility equipment, and neighbor agreements because those details help the reader recognize household decisions without manufacturing lived authority.

Every safety action inside the scene remains supported by the source apparatus. Artwork is allowed to function as artwork. Routine captions do not announce that an illustration is illustrative; a special label is reserved for a visual that could reasonably be mistaken for a live map, official data product, or documentary record.

## Factual spine retained and clarified

- The January 26, 1700 Cascadia event is described as an estimated magnitude 8.7–9.2 event and tied to several classes of evidence.
- The 2025 USGS 10–15% estimate is identified as the chance of an approximately magnitude-9 full-margin rupture in the next 50 years, not the chance of every damaging regional earthquake.
- The descending system includes the Juan de Fuca, Gorda, and Explorer plates.
- Early warning is described as detection after an earthquake begins; it may provide seconds to tens of seconds before strong shaking and may arrive late or not at all near the source.
- Tsunami guidance uses “mapped tsunami hazard zone” and includes natural warnings and the local posted route. It does not treat every coast or shoreline as the same decision context.
- Gas guidance does not encourage routine shutoff. The reader leaves for safety when gas is suspected, avoids flames and switches, follows local utility guidance, and understands that a professional normally restores service.
- Carbon-monoxide, water, sanitation, disability, mobility, medication, medical power, renters, animals, transportation, and gradual supply-building remain in the main guidance.
- Earthquake prediction, early warning, instrument detection, probability, amplification, and liquefaction remain distinct concepts.

The source set includes USGS, ShakeAlert, Earthquakes Canada, U.S. Tsunami Warning Centers, Earthquake Country Alliance, CDC, California Geological Survey and Cal OES, Washington DNR and Emergency Management, Oregon DOGAMI and OEM, and PreparedBC.

## Artwork preservation

All four assigned Earthquake compositions retain production roles and no baseline asset was altered:

- `assets/living-watershed/earthquake/earthquake-hero.jpg` — regional opening and plate-boundary hero
- `assets/living-watershed/earthquake/earthquake-vignette.png` — the ordinary household rehearsal
- `assets/living-watershed/earthquake/earthquake-process.png` — the coast-to-Cascades process plate
- `assets/living-watershed/earthquake/earthquake-social.jpg` — social metadata

The optimized derivatives and masters remain locked beside those active files. The phone treatment reflows the hero copy above an uncropped view of the artwork rather than hiding the physical process behind text.

## Production contract

The Chapter One implementation is isolated from the unrevised Phase 4 guides.

- Body opt-in: `.earthquake-chapter-page`
- Article root: `.lw-guide--chapter.eq-chapter`
- Chapter marker: `data-guide-template="living-watershed-chapter-v2"`
- Chapter stylesheet: `css/living-watershed-earthquake.css`
- Shared site contracts retained: `.site-header`, `.nav-inner`, `.nav-toggle`, `.nav-links`, `#site-nav-links`, and `.seasonal-footer`
- Emergency target: `#earthquake-now`
- Printable reference target: `#earthquake-reference`
- Inert future integration scope: `[data-readyplan-scope="earthquake"]`

The page does not depend on reveal animation for access to prose. It does not mount a live-conditions strip because earthquakes cannot be forecast and an instrument detection is not a statement of current safety.

ReadyPlan hooks remain metadata only. No empty widget, subscription prompt, or implementation language appears in the reading experience. Core safety guidance and sources remain public.

## Verification record

Verified in the local production page on July 11, 2026:

- Exactly one page `h1`, a logical heading sequence, one labeled primary navigation, and a working skip target
- No duplicate IDs, missing internal targets, or horizontal overflow
- No script-hidden prose or reveal dependency
- Three in-page illustrations loading at their full intrinsic dimensions when reached
- The early safety link visible in the first viewport at 1280 × 720 and 390 × 844
- A minimum 44-pixel early-action target on the phone layout
- Long-form body text at approximately 20.4 pixels desktop and 18.56 pixels phone
- One-column quick-reference and source layouts at the 820-pixel breakpoint
- No browser-console warnings or errors at desktop, phone, geology-plate, or intermediate-breakpoint views
- Print rules retain the prose and artwork, flatten dark fields, and remove site navigation and support controls
- All 95 locked baseline files still present; no baseline artwork modified in this phase

## Phase 4 handoff

Phase 4 should begin by reading each remaining guide's original copy, current safety corrections, sources, and artwork as one subject. Do not start by cloning Earthquake markup.

- **Wildfire** should carry season, dryness, wind, smoke, distance, and the hard choice to leave before certainty arrives. Live information belongs where it changes that choice.
- **Flooding** should follow accumulation, thresholds, river memory, familiar roads changing character, and moving before the route closes.
- **Winter Storm** should slow down around darkness, warmth, medical power, fragile infrastructure, isolation, and the ordinary work of checking on another household.

The family resemblance comes from the Living Watershed palette, typography, artwork roles, evidence discipline, source handling, accessibility, and care-centered voice. The chapters themselves must remain individual.
