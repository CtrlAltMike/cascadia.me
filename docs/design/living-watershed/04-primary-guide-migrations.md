# Living Watershed Primary Chapters

**Status:** Phase 4 complete

**Revision status:** Version 0.5 production record

**Date:** July 11, 2026

**Scope:** Wildfire, Flooding, and Winter Storm

Phase 4 turns the three remaining primary hazards into individual chapters of the Living Watershed reader. Earthquake supplies the shared editorial and visual grammar, but not a template. Each chapter now has its own clock, setting, narrative pressure, and way of helping a household think.

All existing Living Watershed artwork remains locked and present. The factual, safety, accessibility, source, and data-state corrections from the earlier implementation remain governing constraints.

## The chapter family

The four principal guides share only what makes them recognizably part of one book:

- A landscape-scale opening led by place and physical process
- Sustained Newsreader prose at a comfortable measure
- An early emergency bypass that does not take over the chapter
- One clearly disclosed composite household account
- Large household and process plates within the reading sequence
- Practical decisions embedded in connected passages
- A concise reference section and direct official-source handoff
- Public life-safety guidance with inert ReadyPlan capability seams

They do not share a mandatory action triad, module count, metadata strip, or fixed section order. `css/living-watershed-primary-chapters.css` provides the family resemblance without forcing the same editorial choreography onto each subject.

## Three distinct movements

### Wildfire: direction and a narrowing margin

Wildfire moves from seasonal landscape to departure. Wind, dry fuel, terrain, smoke, roads, and official notices continually change the meaning of time. Its household account is about leaving while choices still exist; its process passage explains ember movement and the home ignition zone; its final movement includes smoke, heat, return, and the years in which burned ground remains part of the watershed.

The chapter keeps urgency directional rather than theatrical. An evacuation order governs. A Red Flag Warning is not an order. A perimeter is a time-stamped observation, not a spread forecast. Household work never delays departure.

### Flooding: accumulation and thresholds

Flooding begins upstream. It follows snow, rain, tributaries, forecast points, culverts, low roads, and the ground around a particular home. Its household account is organized around a written threshold that creates an earlier choice; its process passage follows water through a basin; its return passage treats contamination, utilities, structures, insurance, and records as part of the event rather than an afterthought.

The chapter distinguishes river flooding from flash flooding. A gauge is one point, not a property-depth or arrival-time clock. A household threshold can prompt earlier movement, but it never replaces an official warning, order, or instruction. No one enters floodwater to judge a road or reach a utility control.

### Winter Storm: duration and interdependence

Winter Storm starts inside a household before moving outward to the atmospheric process. Warmth, power, medicine, water, roads, ferries, animals, and agreed check-ins become one system during a long interruption. Its central account is intentionally imperfect: preparation reduces strain, but it does not make the weather or infrastructure predictable.

The chapter treats carbon monoxide as the urgent hazard within a slower event. Generators and outdoor-rated equipment stay outside and away from openings; only indoor-approved heat is used indoors. Medical power and safe relocation are addressed before a household is already cold or isolated. A neighbor check-in is an agreement, not an invitation to take unsafe travel or welfare-check risks.

## Data contracts

### Wildfire: live conditions stay in the Atlas

Wildfire does not mount the `data-current-conditions` guide strip. The page moves directly from the immediate-reference bypass into the illustrated chapter; connected regional conditions remain in the Atlas and in the original official sources linked from the guide.

The Atlas view remains partial and carries these operational limits:

- Connected fire-weather alerts are Washington-only.
- Chelan County is the only connected live evacuation-polygon source.
- Kittitas and Okanogan County records are official-link handoffs.
- B.C. and Oregon evacuation polygons are not connected.
- Northern California is outside the connected feed.

The interface never translates an empty, stale, or failed response into “normal,” “safe,” “no active orders,” or “all clear.” Issuing agencies remain the decision source.

### Flooding: no synthesized live conditions

Flooding does not mount the conditions renderer. The site does not yet have a credible cross-border set of river observations, forecasts, precipitation, road conditions, alerts, and evacuations. The chapter explains how to find the forecast point, basin authority, road authority, and local warning source that actually govern a decision.

No unconnected “Rising,” “Heavy,” “Watch,” or update-time value appears.

### Winter Storm: no synthesized live conditions

Winter Storm also remains intentionally inert. A regional status would overstate the current endpoint, which lacks complete ECCC alerts, road and ferry conditions, and participating utility outage feeds. The chapter hands readers to the Atlas for orientation and to official weather, road, ferry, emergency, and utility sources for current decisions.

No missing value is styled as calm, ordinary, or safe.

## Narrative truth

Each chapter contains one disclosed composite account. The names and details are invented from ordinary household constraints; they are not reporting, testimony, or a claim of lived disaster experience. The accounts exist to make decisions legible in the texture of regional life: a carrier and cane near a wet road, a departure plan shaped by an animal, a chosen warm room and a check-in agreement.

The disclosures use readable interface typography and remain near the accounts. The prose avoids perfect model households and leaves room for cost, disability, rented housing, animals, transport, work, caregiving, isolation, and imperfect preparation.

## Factual and safety spine

Consequential guidance was checked against current primary public sources in Washington, Oregon, British Columbia, Canada, and the United States. Phase 4 preserves these corrections:

- Do not delay a wildfire departure to pack, defend a home, or shut utilities; follow explicit local or utility instructions.
- Washington and Oregon evacuation levels and B.C. Alerts, Orders, and Tactical Evacuations are distinct systems; the exact local notice governs.
- Smoke planning must account for particle exposure and indoor heat together.
- Flash flooding can require immediate movement to higher ground; never wait for a route to be named and never cross floodwater.
- Utility controls are approached only from a dry, safe location and only when official or utility guidance supports it.
- Generators remain outdoors at least 20 ft / 6 m from the home, doors, windows, and vents, with exhaust pointed away.
- Grills, camp stoves, engines, vehicles, gas ovens, and gas ranges are not indoor heat sources.
- Travel during a winter storm depends on current official weather and road instructions, not merely on a road appearing open.
- Medical power, refrigerated medicine, mobility, accessible transport, animals, and agreed neighbor support stay in the main reading path.

## Artwork record

Phase 4 retains twelve production compositions represented by forty-four files:

- Wildfire: hero, household vignette, process plate, and social composition
- Flooding: hero, household vignette, process plate, and social composition
- Winter Storm: hero with a dedicated phone rendition, household vignette, process plate, and social composition

The hero establishes the physical setting. The household vignette carries the composite account. The process plate explains behavior that prose alone would make abstract. The social composition remains metadata rather than in-page decoration. No routine caption announces that artwork is “interpretive”; captions add useful meaning to the surrounding passage.

## Implementation

- `wildfire.html`, `flooding.html`, and `winter-storm.html` carry the `living-watershed-chapter-v2` article marker.
- `css/living-watershed-primary-chapters.css` is scoped to the Phase 4 body classes and contains the responsive, print, reference, and long-form reading treatments. Its original live-instrument selectors are now dormant because no chapter mounts that renderer.
- The legacy guide stylesheet remains loaded where existing shared chapter contracts still need it; Wildfire no longer loads the live-conditions renderer.
- No chapter depends on reveal animation for legibility.
- All urgent and source routes have keyboard-visible focus and at least a 44-pixel interactive target.
- ReadyPlan metadata remains inert. Nothing public is withheld or represented by an empty widget.

## Verification record

The completed family was checked at 1280, 820, 390, and 320 CSS-pixel widths in a real browser. The pages have one `h1`, logical headings, valid internal targets, no duplicate IDs, no horizontal overflow, and no console warnings or errors. The early emergency route remains within the opening mobile viewport and meets the target-size standard.

Wildfire, Flooding, and Winter Storm were confirmed to mount no synthetic live renderer. Wildfire retains a quiet Atlas handoff and its exact coverage limitations in Sources.

Responsive hero, household, and process assets loaded at their intended intrinsic dimensions when reached. The Winter Storm phone composition is used only at phone width, while tablets retain the landscape hero. Print treatment preserves the prose and artwork while flattening dark reference sections to legible paper output.

Source URLs, JSON-LD, local links, asset paths, CSS structure, JavaScript syntax, and the conditions worker tests form the final mechanical release gate.

## Phase 5 handoff

Build Your Kit is next. It should become the household workbook promised by these chapters: a place to turn routes, people, animals, medicine, mobility, warmth, water, power, communication, and support into a plan that fits an actual household. The workbook should preserve printable public tools and keep ReadyPlan as an optional future private-planning layer.
