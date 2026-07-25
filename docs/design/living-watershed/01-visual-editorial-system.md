# Living Watershed Visual and Editorial System

**Status:** Working specification, version 0.6 — Phase 6 regional instrument proof

**Date:** July 11, 2026

**Scope:** Shared system for every Cascadia.me page, guide, live instrument, illustration, household tool, and future ReadyPlan bridge

> **Brand and voice authority:** The network relationship, message hierarchy, cadence, contractions, empathy, and humor are now governed by the [Resilience Network Brand Platform](../../resilience-network-brand-platform.md) and [Resilience Network Voice Guide](../../resilience-network-voice-guide.md). This document continues to govern the Living Watershed visual system and Cascadia-specific composition. Where its earlier campaign or voice language conflicts with the newer canonical documents, the newer direction governs.

This document translates the approved Living Watershed direction into repeatable editorial, visual, operational, safety, accessibility, and provenance decisions.

It should be read with [Living Watershed: An Illustrated Cascadian Reader](00-site-path.md) and the locked [Artwork Register](artwork-register.md). Earlier page-production notes describe the version 0.4 implementation. Where they conflict with this document, this document governs the next phase.

The system should be judged by four questions:

1. Does this sound as though it was written here, for people who live here?
2. Does care—not fear, compliance, or consumption—motivate the reader?
3. Do the prose and artwork allow someone to settle in without hiding urgent action?
4. Are consequential claims, live data, uncertainty, and limits represented honestly?

## 1. Editorial constitution

> **Preparedness isn't about fear.**
>
> It's about care. You prepare because you have people to protect, a place worth defending, a life you want to keep. Every emergency kit is an act of imagination—a story about a future that hasn't happened yet, told by someone who decided to take it seriously.
>
> Most preparedness resources are either frightening or boring. Government brochures with all the warmth of a DMV waiting room. Survivalist forums that assume you want to live in a bunker. I built this site because I wanted something that treated me like an adult—honest about the risks, specific to where I live, and genuinely useful.
>
> Cascadia.me offers clear guidance for neighbors across the Cascadia bioregion, grounded in real geology, real weather, established safety guidance, and official public information—and candid about what those sources know, what they cannot know, and what still depends on where you live.

This is the site's governing belief, not one block of marketing copy. It determines the relationship between the author and reader, the rhythm of the pages, the role of the artwork, the treatment of evidence, and the boundary with ReadyPlan.

## 2. Product and editorial character

Cascadia.me is an **illustrated Cascadian reader with live instruments and a household workbook**.

It has an authorial point of view. It is specific to the bioregion, attentive to ordinary life, and respectful of the reader's ability to understand complexity.

It is not:

- A disaster-news feed
- A survivalist brand
- A generic emergency-management portal
- A collection of shopping lists
- A dashboard whose density implies authority
- An interface made from slogans, cards, metrics, and calls to action
- A subscription funnel

It combines five qualities:

1. **Cascadian** — terrain, water, weather, ecology, infrastructure, settlement, and community are part of the voice rather than decorative scenery.
2. **Human** — preparedness protects ordinary life, relationships, animals, routines, and the ability to remain connected.
3. **Explanatory** — sustained prose and illustration reveal how a physical system behaves.
4. **Operational** — urgent instructions, live information, and household tools remain easy to reach without governing every page.
5. **Trustworthy** — observation, forecast, history, planning, composites, illustration, and uncertainty remain visibly distinct.

Government agencies provide evidence and authoritative instructions. Cascadia.me does not imitate their prose or their publication architecture. It provides regional context, interpretation, memory, and a humane path into action.

## 3. Design and editorial principles

### Care before fear

Preparedness is motivated by attachment and responsibility. Do not use catastrophe, shame, or inadequacy to produce action. Do not imply that the reader is late, negligent, or avoiding a duty; invite them through relevance, curiosity, and care.

### Place and people before peril

Begin with ordinary regional life and the physical landscape, not destruction. A floodplain, dry foothill, plate boundary, ice-loaded canopy, ferry route, dark house, animal carrier, or neighbor at the door can teach more than spectacle.

### Continuity before fragments

Prose is the spine of a page. Headings, labels, metrics, cards, buttons, and bands may interrupt it only for immediate safety, genuinely live information, necessary orientation, or a real change of task.

### Safety without surrendering the story

A person who needs an immediate instruction can reach it immediately. A person who comes to understand the place is allowed to read without being interrupted every few paragraphs.

### Calm is not vague—and it is not a short-copy rule

Use direct verbs, concrete thresholds, and honest uncertainty. Calm comes from the relationship with the reader, not from reducing every idea to a slogan.

### Richness without noise

Illustration may be abundant and prose may be substantial. Interface hierarchy stays spare. Use purposeful fields, plates, captions, and quiet reference areas rather than collections of floating cards.

### Every image has a job

An image may locate, explain, rehearse, restore agency, create attachment to place, or give the reader time to pause and look. Decoration detached from the surrounding meaning does not justify its weight.

### Evidence from institutions; voice from here

Consequential claims and official instructions come from traceable sources. Context and explanation should still sound like a knowledgeable Cascadian neighbor speaking adult to adult.

### The public safety layer stays public

Live conditions, official sources, urgent actions, and core safety guidance are never gated by a subscription.

### Relationships cross boundaries

Wind, smoke, water, geology, and weather do not stop at political borders. Jurisdictional differences matter for warnings and services, but the interface should not present them as physical boundaries.

## 4. Color system

These implementation colors may be adjusted slightly during browser proofs for contrast and reproduction. Their roles and overall direction remain fixed.

| Token | Hex | Primary role |
|---|---:|---|
| Warm Cream 50 | #FBF7EE | Primary reading surface |
| Warm Cream 100 | #F2E9D7 | Secondary surface and illustration paper |
| Ocean 900 | #063B5C | Headlines, primary actions, navigation |
| Ocean 700 | #075A78 | Links, observed conditions, map controls |
| Glacial 500 | #2FAAB3 | Water, movement, live information |
| Glacial on Ocean | #45B6BE | Small Glacial labels on Ocean fields |
| Camas 600 | #65529A | Geology, atmosphere, forecast, and planning context |
| Salmon Coral 600 | #C44737 | Urgent action and active-hazard emphasis |
| Sunlight 400 | #E8B934 | Thresholds, caution, warmth, and energy |
| Spruce 700 | #2F5A43 | Preparedness, stability, recovery, and ecology |
| Basalt 900 | #232D31 | Decisive action fields |
| Rain Cloud 300 | #C9D3DA | Weather fields and secondary dividers |
| Watershed Line | #D8CFBC | Borders, contour lines, and quiet separation |

### Semantic rules

- Ocean is the stable brand anchor.
- Glacial means observed, flowing, connected, or currently measured.
- Camas means modeled, geological, atmospheric, historical, or planning-oriented.
- Coral means act, stop, evacuate, or pay immediate attention. Use it in small, decisive quantities.
- Sunlight means caution, threshold, stored energy, or warmth. It does not mean safety.
- Spruce means readiness, continuity, recovery, or a verified positive state.
- Basalt creates decisive reference zones and should not dominate ordinary reading.

Color never carries status alone. Every status also needs a text label, icon, shape, or position. “No active orders” is not styled as “safe.” Missing data is never given a reassuring color.

## 5. Typography and reading architecture

### Working type families

- **Display and editorial prose:** Newsreader, with Georgia as fallback
- **Interface, concise instruction, and source apparatus:** Inter, with the system sans-serif stack as fallback
- **Data:** Inter with tabular numerals

Long-form narrative may use Newsreader more extensively than the version 0.4 implementation. Inter remains the language of controls, live states, official-source details, and concise safety references.

### Type roles

| Role | Desktop target | Mobile target | Guidance |
|---|---:|---:|---|
| Guide display title | 72–104 px | 46–60 px | Tight leading; short titles |
| Homepage statement | 64–88 px | 42–54 px | Deliberate line breaks, not a slogan stack |
| Section title | 36–48 px | 30–38 px | Marks a genuine chapter change |
| Subsection title | 25–32 px | 23–28 px | Used sparingly |
| Narrative body | 18–21 px | 18–20 px | Comfortable serif reading |
| Explanatory body | 17–19 px | 17–18 px | Serif or sans according to context |
| Metadata | 13–15 px | 13–14 px | Quiet field-note treatment |
| Utility label | 12–13 px | 12–13 px | Uppercase; 0.08–0.12 em tracking |

### Typography rules

- Keep sustained reading measure between 42 and 48 rem.
- Allow connected paragraphs to develop an idea; there is no short-copy ceiling for lead or narrative prose.
- Do not insert a heading after every paragraph or small group of facts.
- Use large serif type for place, process, memory, and human meaning.
- Use sans-serif type for status, source, time, controls, and compact safety instructions.
- Do not place essential copy over complex illustration.
- Reserve all caps for short utility labels and recognized action commands.
- Use numerals consistently and place units next to values.
- Never shrink text to preserve a desktop composition on mobile; reflow the composition.
- A poetic heading must be followed by literal, immediately understandable copy.

## 6. Layout and spatial system

### Grid

- Desktop: 12-column grid, maximum working canvas of 90 rem
- Tablet: 6-column grid
- Mobile: 4-column grid with 16–20 px outer gutters
- Sustained reading column: 42–48 rem
- Caption and field-note column: 18–28 rem
- Base spacing unit: 8 px
- Primary chapter spacing: 72–112 px desktop; 48–80 px mobile

### Structural rules

- Prefer full-width plates, continuous reading fields, and intentional editorial splits over floating cards.
- Illustration meets prose at purposeful edges and may span beyond the reading column.
- A page should offer stretches of uninterrupted reading.
- Cards are reserved for genuinely independent tools or choices, not for breaking one argument into small pieces.
- Metadata is quiet unless time, source health, or official authority makes it urgent.
- Calls to action occur at natural task changes and remain rare.
- Ordinary continuation never needs a button.
- Borders are thin and quiet. Corners are square or only slightly rounded.
- Mobile order preserves narrative continuity while keeping a compact urgent reference reachable.
- Long pages use meaningful chapter landmarks, not a heading for every screenful.

### The emergency bypass

A guide may include one compact “If this is happening now” rail near the opening. It provides the few immediate actions and the relevant official route without forcing all readers through an interface-first page.

The bypass:

- Is short enough to read under pressure
- Does not summarize the whole guide
- Uses a recognized action sequence only when the hazard genuinely supports one
- Links to live or local authority information when appropriate
- Remains understandable without color, imagery, or motion

### Atlas constraints

- The map is the primary content, not a background for controls.
- On desktop, the map receives at least 65% of the available workspace width.
- On mobile, the map receives at least 52% of the initial viewport height before the control sheet.
- Mobile controls use a bottom sheet or a clearly separated panel that does not permanently cover the map.
- Header, ticker, map, controls, attribution, and source status fit without accidental horizontal overflow.
- The initial map remains usable at browser zoom up to 200%.

## 7. Locked artwork and illustration system

The complete baseline is recorded in the [Artwork Register](artwork-register.md): 27 production compositions represented by 89 files, plus six approved concept boards.

Every baseline work is retained.

- Do not delete, rename, overwrite, regenerate, replace, redraw, recolor, or destructively crop it without explicit owner approval.
- Preserve source masters, optimized formats, responsive compositions, and social compositions together.
- New exports are additive and receive new filenames.
- Responsive layout may reposition or non-destructively mask an image only when its subject and meaning remain intact.
- The currently dormant home-lenses composition remains a locked alternate.
- Before completing a phase, verify the presence and continued role of every affected composition.

### Visual character

Production illustration combines:

- Hand-painted regional relief-map sensibility
- Gouache, watercolor, or screen-print clarity
- Fine topographic contours and directional flow lines
- Recognizable native vegetation, waterways, terrain, roads, and settlement patterns
- Selective sectional or cutaway views when explaining physical processes
- Bold color with visible paper and natural-material texture

It should not resemble stock photography, cinematic disaster art, glossy 3D rendering, or a generic national-park poster.

### Image roles

1. **Terrain panorama** — establishes place, scale, season, and physical process.
2. **Process plate** — explains geology, hydrology, weather, fire behavior, or infrastructure.
3. **Preparedness still life** — shows useful objects in lived context rather than as a shopping catalog.
4. **Household scene** — carries a grounded human narrative.
5. **Instrument view** — supports maps, gauges, wind fields, and source status.
6. **Atmospheric plate** — creates attachment, memory, pacing, or a pause in the reading experience.

### Editorial use of artwork

- Prose should lead naturally into a plate.
- A caption should add observation, explanation, or human meaning rather than repeat the preceding paragraph.
- The passage after an image should continue something the image revealed.
- A process plate may use adjacent HTML labels or a long description when needed.
- Household artwork remains interpretive; it is not evidence that a depicted event or person exists.

### Production rules

- The six concept boards remain approved references, not production page artwork.
- Existing production illustrations contain no live values or essential interface text.
- Preserve documented focal areas when positioning an image.
- Do not depict a specific historical event as though an illustration were documentary evidence.
- Captions add meaning and alt text describes visible content. A routine artwork disclaimer is unnecessary; identify a visual only when it could reasonably be mistaken for a live map, official data product, or documentary record.
- A visual may simplify geography to explain a process but must not reverse or materially misstate it.
- People are ordinary residents making ordinary decisions; avoid heroic rescue staging.
- Do not generate or imitate Indigenous formline, weaving, carving, regalia, masks, ceremonial objects, or generalized “tribal” patterning.
- Reuse the locked artwork baseline. Additive artwork requires explicit approval.

## 8. Iconography and diagram language

- Use simple single-weight line icons with strong silhouettes.
- Pair action icons with both a text command and a meaningful field.
- Maintain at least 24 px icon size for utility use and 40–56 px for urgent reference use.
- Use contour lines for terrain, streamlines for movement, stacked strata for geology, concentric rings for an event location, and arrows only when direction matters.
- Icons remain understandable without color.
- Do not borrow culturally specific forms as decorative shorthand.

## 9. Motion

Motion communicates continuity, not urgency.

- The conditions ticker moves smoothly right to left at roughly 24–32 px per second.
- The official-feed caveat appears once in each complete ticker cycle.
- Duplicate ticker content only as needed for a seamless loop; do not create audible or focus-order duplication.
- Pause the ticker on hover or keyboard focus.
- Under reduced-motion preferences, replace continuous movement with a static readable line or manual sequence.
- Wind, water, and weather paths may drift subtly over 12–24 seconds.
- Avoid pulsing alerts, shaking controls, rapid counters, parallax that interferes with reading, or motion behind dense prose.
- Standard interface transitions complete in 180–300 ms.

## 10. Reading and reference components

These are available editorial forms, not slots that every page must fill.

### Chapter opening

A substantial illustrated opening establishes place, subject, emotional weather, and the reason to keep reading. Metadata and a primary action appear only when they are truly necessary at that point.

### Continuous passage

Several connected paragraphs develop one idea without interruption. The surrounding layout should not manufacture visual variety at the cost of comprehension.

### Illustrated plate

A large image deepens the passage. It receives a useful caption and enough space to be examined.

### Composite household narrative

A sustained, clearly disclosed human story shows ordinary routines, constraints, relationships, and a consequential decision. It is not a list of ideal actions disguised as a character.

### Explanatory passage

Prose and a process plate explain the regional mechanism, local variation, and practical consequence.

### Field note

A quiet aside holds metadata, a definition, a source limitation, a geographic distinction, or a closely related observation. It does not compete with the main narrative.

### Emergency bypass

The compact urgent reference described above. It exists for immediate access, not as the page's visual identity.

### Live instrument

Current conditions, observed data, forecast, or official orders appear only when the feed meaningfully changes a decision. Source health and recency remain visible.

### Source notes

Substantive pages end with a reviewed date, primary official sources, and a short maintenance note. Inline citations remain available when the location of evidence matters.

### Household workbook

Explanatory chapters lead into questions, tests, inventories, and printable tools. A product is one way to achieve a capability, not the organizing principle.

## 11. Operational component rules

### Site frame

The quiet wordmark, restrained navigation, cream surface, and thin boundary orient without competing with the page title or artwork.

### Conditions ticker

The ticker is an ambient site-wide signal. It may include current summaries, source health, seasonal reminders, and the official-feed caveat. It is not a breaking-news ribbon or a substitute for the Atlas.

### Conditions summary

When a guide genuinely benefits from live information, the summary may include:

- One plain-language condition
- A small number of decision-relevant signals
- Update recency
- Source identity or source access
- A route to the Atlas or issuing authority

It must distinguish unavailable, not reported, stale, forecast, and affirmatively none active.

### Recognized immediate actions

Use an action triad only when it is genuine to the hazard or established by authoritative guidance. Drop / Cover / Hold On remains. Other guides may use a single threshold, a sequence, a checklist, or no action band at all.

### Data limits and caveats

Limitations remain consistently named and easy to reach. Explain source timing, spatial resolution, model uncertainty, coverage, cross-border differences, and interpretation in ordinary language.

### ReadyPlan bridge

A bridge is absent until the integration exists. It follows complete public guidance, states plainly what will be saved, and never interrupts live conditions or urgent action.

## 12. Editorial voice

### The speaker

Cascadia.me speaks as a knowledgeable neighbor who lives here:

- Informed but not institutional
- Cascadian and geographically observant
- Warm without manufacturing intimacy
- Adult to adult
- Comfortable with sustained explanation
- Candid about uncertainty
- Attentive to ordinary routines, constraints, and neighbors
- Never survivalist, heroic, patronizing, or falsely authoritative

### Voice rules

- Begin with a place, person, process, or meaningful question—not a generic hazard slogan.
- Prefer concrete nouns, direct verbs, and recognizable regional detail.
- Explain why an instruction matters.
- Allow prose to carry nuance instead of forcing every idea into a command.
- Use second person for direct action, first person only for truthful authorship, and third person for disclosed composites.
- Avoid promising safety, certainty, or precision that a source cannot provide.
- Do not moralize about preparedness, evacuation, poverty, disability, housing, or recovery.
- Name cost, mobility, transportation, power dependence, pets, caregiving, language, and isolation as ordinary realities.
- Do not repeat a branded sentence merely to make pages feel related.
- Do not manufacture authority through fake testimony, invented survival experience, or claims to speak for a community.
- Intimacy comes from truthful authorship, recognizable place, ordinary life, and disclosed composite storytelling.

### Language examples

| Avoid | Prefer |
|---|---|
| “Identify two evacuation routes and establish a communication plan.” | “When smoke settles into a valley, the road you use every day can disappear before the fire reaches you. Choose two ways out now, and make sure everyone knows which one to take.” |
| “Recognize the signal. Take the next calm action.” repeated across pages | “A Red Flag Warning means the weather could support fast fire growth. It is not an evacuation order, but it is a good time to check the route, the fuel gauge, and the people who may need help leaving.” |
| “The routes water remembers.” as the whole explanation | “A floodplain is the path a river uses when its channel cannot hold the flow. Roads and fields may stay dry for years, then become part of the river again.” |
| “No active orders. You are safe.” | “Connected sources show no active evacuation order. Conditions can change quickly; check the local issuing authority before making a travel decision.” |
| “A prepared household has five days of supplies.” | “Begin with what would be hardest for your household to replace if roads, power, or tap water failed. Add capacity over time.” |
| “Winter tests whether you planned ahead.” | “A long outage is harder on households that depend on electric heat, refrigerated medicine, or powered mobility equipment. Planning begins by asking what cannot safely wait.” |
| “Mother Nature is unpredictable.” | “A regional forecast cannot show every ridge, drainage, or exposed road. Terrain can make conditions at your location very different.” |

## 13. Human narrative protocol

Each principal guide may contain one substantial composite household narrative. There is no universal word ceiling; the scene should be long enough to establish a person, place, relationship, constraint, and consequential decision.

Use this disclosure once, clearly and quietly:

> **Composite account:** The people and scene are created to illustrate sourced regional conditions and preparedness decisions. They are not reports about identifiable residents or a specific emergency.

Composite households may have names, routines, relationships, animals, jobs, familiar roads, and recognizable regional settings. They may encounter inconvenience, uncertainty, competing obligations, and unequal resources. They should not perform idealized preparedness.

A composite must not:

- Resemble eyewitness reporting or testimony
- Invent quotations attributed to real people
- Use precise event times, addresses, official orders, measurements, injuries, losses, or outcomes that imply a documented incident
- Claim a character survived or experienced a real emergency
- Turn one household choice into universal guidance
- Use suffering merely to create urgency

Real events may appear only with sources and clear separation from the composite. Every safety decision within the story remains evidence-backed.

Sensory detail may create recognition, attachment, and human presence. It must not manufacture fear.

## 14. Distinct guide personalities

The guides share evidence and safety standards, not verbal templates.

- **Earthquake:** geological, intimate, suddenly interrupted, attentive to ordinary rooms and the first minutes.
- **Wildfire:** seasonal, mobile, uncertain, attentive to smoke, wind, distance, animals, routes, and leaving before certainty.
- **Flooding:** cumulative and threshold-oriented, attentive to rain, gauges, low roads, familiar fields, and water returning to old paths.
- **Winter Storm:** slower and communal, attentive to darkness, warmth, medical power, fragile infrastructure, isolation, and neighbor care.

Repeated headings, slogans, action triads, capability counts, or paragraph constructions across guides trigger an editorial review. Each chapter should be identifiable without its title.

## 15. Truth and provenance model

Every consequential claim belongs to a visible class:

| Class | Required treatment |
|---|---|
| Live observation | Source, update time, and availability state |
| Forecast or model | Valid time, model or source, and uncertainty or resolution caveat |
| Official order | Issuing authority, effective time, and direct source |
| Historical fact | Source and date or event context |
| Evergreen guidance | Reviewing authority or source and reviewed date |
| Composite account | One clear disclosure |
| Artwork | No routine label; never presented as a live map, official data product, or documentary record |

### Data-state language

- **None active:** the connected source affirmatively reports no active item.
- **Not reported:** the source does not provide that field or jurisdiction.
- **Unavailable:** the source failed, timed out, or could not be checked.
- **Stale:** the last successful update is older than the defined threshold.
- **Forecast:** a modeled future state, not an observation.

The interface never transforms unavailable, missing, partial, or stale data into a reassuring state.

### Source relationship

- Consequential claims link to primary official or scientific sources whenever available.
- Local authority instructions override regional generalization.
- Source notes explain coverage and maintenance without turning the prose into a trust ledger.
- Cascadia.me explicitly supplements rather than replaces local emergency management.

## 16. Page archetypes

### Homepage: prologue

The homepage normally contains:

1. A sustained illustrated opening rooted in the editorial constitution
2. A connected account of land, water, weather, and fire
3. The existing artwork used as narrative plates
4. An illustrated table of contents for the guides
5. A neighbor-centered passage about preparation as care
6. The ambient conditions ticker and a meaningful route to the Atlas
7. A route to the household workbook
8. A quiet route to the author’s note and support

This is a reading sequence, not eight mandatory visual modules.

### Hazard guide: illustrated chapter

A guide normally contains:

- A regional opening and hero plate
- A compact emergency bypass
- Sustained explanation of the place and physical system
- One substantial disclosed composite account
- The existing process and household artwork integrated as plates
- Practical guidance woven through the chapter
- A concise reference section, checklist, or time sequence when useful
- Household continuity, connected hazards, recovery, and neighbors
- Sources, review date, limitations, illustration disclosure, and local authority

The sequence changes according to the hazard. Live conditions appear only when they contribute meaningful decision information.

### Atlas: live regional instrument

The Atlas retains a map-first workspace, visibly separating current observation, forecast, official orders, history, and planning. Controls remain concise because the user is operating an instrument. Explanations and field notes use the Cascadia.me voice.

### Build Your Kit: household workbook

The page uses sustained explanatory chapters, capability questions, realistic tests, practical inventories, a communication plan, and printable tools. It treats products as possible means, not preparedness itself.

### The Approach: author's note and evidence method

The Approach begins with why the site exists and the author's relationship with the reader. It then explains sources, maintenance, limitations, composite accounts, generated imagery, cultural grounding, accessibility, independence, public/private boundaries, and support.

### Guides index: table of contents

The index helps readers recognize their place, household, and relevant chapter. It uses art, short summaries, and meaningful cross-connections without becoming a card catalog.

## 17. Accessibility and resilience

- Target WCAG 2.2 AA for interface text and controls.
- Preserve full meaning without color, motion, or imagery.
- Use visible keyboard focus on every palette field.
- Minimum interactive target: 44 by 44 CSS pixels.
- Never bake essential text or live values into an image.
- Alt text describes an image's informational purpose rather than every decorative contour.
- Complex process illustrations receive adjacent explanation or long description.
- At 200% zoom, reading content remains in one column without horizontal scrolling.
- Critical guidance remains available when live feeds, scripts, web fonts, or imagery fail.
- The emergency bypass appears early in keyboard and document order without forcing visual dominance.
- Print versions preserve prose, captions, practical guidance, sources, and reviewed dates; artwork remains represented with sensible ink use.
- Accessibility, medical power, mobility, transportation, cost, caregiving, and animals belong in the main narrative and tools.

## 18. Image performance budget

Rich imagery must remain usable on constrained connections during emergencies.

- Retain responsive WebP and conventional fallback renditions already present in the artwork register.
- Target no more than 350 KB for a mobile hero rendition.
- Keep total above-the-fold image transfer near or below 600 KB on mobile where practical.
- Lazy-load noncritical plates.
- Reserve image dimensions to prevent layout shift.
- Do not ship the 1536 × 1024 concept boards as production page artwork.
- Test with slow network conditions and disabled cache.
- Optimization may create additive derivatives; it may not overwrite or remove locked files.

## 19. Cultural and geographic integrity

- Treat Living Watershed as an ecological and editorial framework, not as a claimed Indigenous teaching.
- Cite a Nation, Tribe, First Nation, or Indigenous-led organization by its own name when using its information.
- Use Indigenous place names only when spelling, context, and attribution are authoritative.
- Do not use acknowledgments as decorative copy or substitute them for substantive sourcing and relationships.
- Do not imitate culturally specific art, pattern, language, or ceremony.
- Verify species, landforms, river direction, seasonal conditions, infrastructure, and geographic relationships shown in explanatory material.
- Cross-border pages include relevant United States, Canadian, provincial, state, Tribal, First Nation, county, regional-district, and local sources as appropriate.
- Decide and state the site's northern and southern geographic scope consistently.

## 20. ReadyPlan boundary

Cascadia.me guidance may later connect to a personal plan without changing the public page's meaning.

Possible future transitions include:

- Add this action to my plan
- Assign this to someone in my household
- Set a seasonal review
- Record a destination or decision threshold
- Save a household capability

Rules:

- Do not show empty widgets before integration.
- Do not place subscription prompts in live conditions or the emergency bypass.
- Do not gate source links, official orders, or core safety guidance.
- State in ordinary language what will be saved and where.
- Avoid public-facing implementation terms such as metadata or integration seam.
- Cascadia.me must remain complete and useful without ReadyPlan.

## 21. Production workflow

For each page revision:

1. Re-read the editorial constitution and identify the page's role.
2. Establish the fact base, official sources, geographic scope, and retained safety corrections.
3. Identify the ordinary regional life, physical process, and human stakes particular to the subject.
4. Outline a narrative arc rather than a module stack.
5. Define one compact emergency or reference path.
6. Write sustained prose and, when appropriate, one disclosed composite account.
7. Map every locked illustration to a meaningful place in the reading sequence.
8. Write captions that deepen the surrounding passage.
9. Add practical guidance, live information, source notes, and tools without breaking continuity unnecessarily.
10. Review factual, geographic, cultural, accessibility, and composite-story integrity.
11. Implement responsive reading, reference, print, feed-failure, and image-performance behavior.
12. Verify the artwork register before considering the phase complete.

Do not begin by defining a universal action triad, hero metadata set, capability count, or fixed chapter order.

## 22. Definition of done

A Living Watershed page is ready when:

- It sounds as though it was written here, for people who live here.
- Care—not fear, compliance, or consumption—motivates the reader.
- The reader can move through several connected paragraphs without being reset by a card, slogan, metric strip, or call to action.
- Place and ordinary life are visible before spectacle.
- The subject has a voice and rhythm distinct from the other guides.
- Urgent instructions and official sources remain easy to reach.
- Live, forecast, historical, planning, composite, and illustrative material remain distinguishable.
- Missing or stale data cannot be mistaken for safe conditions.
- Every assigned artwork remains present and deepens the surrounding prose.
- Every call to action justifies interrupting the reader.
- Poetic language clarifies or enriches literal truth rather than replacing it.
- Composite details cannot be mistaken for reporting.
- The page respects disability, cost, housing, transport, caregiving, animals, and unequal resources.
- Mobile and print treatments preserve both reading continuity and urgent reference.
- Sources, review date, and consequential limitations are clear.
- Public life-safety guidance is complete without ReadyPlan.
- The prose could not be dropped unchanged into a generic federal brochure.

## 23. Phase 2 proof record

**Status:** Completed July 11, 2026. See [02-homepage.md](02-homepage.md) for the production and validation record.

The visual direction and artwork remained fixed. Phase 2 produced browser proofs for:

1. Long-form Newsreader body text at representative desktop and mobile measures
2. Hero-to-opening-prose transitions using the locked homepage art
3. Full-width plate, caption, and continuing-prose rhythm
4. The compact emergency bypass in document and keyboard order
5. A table-of-contents treatment that is not a card grid
6. CTA reduction and ordinary text-link behavior
7. Mobile reading continuity around large images
8. Print treatment for prose-rich pages and high-ink artwork

These proofs refine execution. They do not reopen the Living Watershed visual direction or artwork baseline.

## 24. Phase 3 proof record

**Status:** Completed July 11, 2026. See [03-guide-template-earthquake.md](03-guide-template-earthquake.md) for the production and validation record.

Earthquake proves that a principal guide can sustain an illustrated chapter while keeping an urgent reference path early and public. The page establishes:

1. A regional opening led by place and physical process
2. A compact Drop, Cover, and Hold On bypass before the long-form reading path
3. One substantial, clearly disclosed composite household account
4. Large household and process plates embedded in the narrative
5. Practical guidance carried by connected prose rather than repeated cards
6. Conservative distinctions among prediction, early warning, detection, probability, amplification, liquefaction, and mapped tsunami hazard zones
7. Responsive and print behavior that preserves both the artwork and the reference path
8. An isolated chapter stylesheet so the three unrevised primary guides remain stable until Phase 4

The proof establishes shared standards, not a universal chapter template. Phase 4 preserves the individual temperament of Wildfire, Flooding, and Winter Storm.

## 25. Phase 4 proof record

**Status:** Completed July 11, 2026. See [04-primary-guide-migrations.md](04-primary-guide-migrations.md) for the production and validation record.

The three remaining primary hazards prove that a visual family can remain coherent without flattening its subjects. The production chapters establish:

1. Wildfire as a directional story about changing conditions and a narrowing departure margin
2. Flooding as an accumulative story about basins, forecast points, thresholds, and routes
3. Winter Storm as a durational story about warmth, power, mobility, and interdependence
4. A compact urgent path whose size and contrast are suitable for decision-critical reading
5. Clearly disclosed composite accounts that include ordinary constraints without becoming perfect checklists
6. Live information only where the connected source contract supports it, with the exact coverage limits beside the instrument
7. Direct official-source handoffs where a regional synthesis would mislead
8. All twelve assigned compositions preserved in meaningful editorial roles across desktop, phone, and print

Phase 5 uses the same continuous reading grammar to turn Build Your Kit into a practical household workbook, not a product catalogue or a stack of capability cards.

## 26. Phase 5 proof record

**Status:** Completed July 11, 2026. See [06-household-capabilities.md](06-household-capabilities.md) for the production and validation record.

The household workbook proves that a practical tool can remain part of the illustrated reader. The production page establishes:

1. An ordinary day—not a disaster scenario or shopping trip—as the starting point
2. Sustained prose joining home systems, movement, care, animals, buildings, and neighbors
3. Nine stable capability anchors presented as lived systems rather than identical cards
4. Four public working sheets with native labeled fields and checkboxes
5. No site persistence or transmission of household entries, with candid browser, printer, and paper-copy limits
6. Safe rehearsals that never interrupt treatment, essential heat or power, alert reception, or safe travel
7. A gradual one-day, three-day, and local-goal progression that respects cost, storage, housing, and jurisdiction
8. All three assigned compositions preserved as the illustrated opening, household turning point, and social metadata

Phase 6 should refine the Atlas as a live regional instrument. It must remain map-led, clearly separate observations, forecasts, history, and planning data, and keep limitations close to the controls they qualify.

## 27. Phase 6 proof record

**Status:** Completed July 11, 2026. See [05-atlas.md](05-atlas.md) for the production and validation record.

The regional instrument proves that operational density can be reduced without erasing data distinctions. The production Atlas establishes:

1. One canonical control surface across desktop and mobile
2. Current, observed, forecast, historical, and planning classes preserved through progressive layer families
3. Dependent settings revealed only with the layer they modify
4. Layer state separated from aggregate source state
5. Returned source-level availability and evacuation-coverage boundaries exposed in a deliberate status dialog
6. A contextual legend that shows only active, present, and successfully rendered symbols
7. A real mobile disclosure sheet with matching DOM and visual order, explicit open/close behavior, and map context retained
8. A working map-load retry path plus protection against slow layers reappearing after switch-off

## 28. Phase 7 proof record

**Status:** Completed July 11, 2026. See [07-remaining-surfaces.md](07-remaining-surfaces.md) for the production and validation record.

The completed book establishes:

1. Guides as a semantic, illustrated table of contents rather than a signal-and-decision dashboard
2. The locked connected-landscape plate preserved at its intrinsic editorial ratio
3. Sustained place-and-household summaries for all four chapters, with ReadyPlan hooks preserved but no empty widgets
4. Approach led by truthful authorship, care, regional relationship, and the non-expert boundary
5. Observe / Interpret / Decide retained as the one compact evidence instrument
6. Source, uncertainty, composite-story, cultural-integrity, independence, and public/private boundaries carried through connected prose and a quiet appendix
7. Routine illustration disclaimers removed from reader-facing copy
8. Canonical footer, 404, feedback-consent, share-identity, metadata, and sitemap language aligned across the finished work

## 29. Phase 8 proof record

**Status:** Completed July 12, 2026. See [08-complete-site-audit.md](08-complete-site-audit.md) for the complete validation record.

The bound site establishes:

1. Homepage and Guides have complementary prologue and table-of-contents roles without repeated chapter copy or duplicate per-entry calls to action.
2. The four guide voices and composite households remain distinct while preserving every assigned visual and every safety constraint.
3. Atlas source names, partial states, geographic exclusions, and local-authority handoffs match actual connected coverage.
4. Nation-specific knowledge is attributed inline to the relevant Huu-ay-aht and Siletz sources rather than invoked generically.
5. A keyboard-readable Atlas record index and map-center forecast path provide non-pointer access without returning control clutter to the map.
6. Mobile navigation, reduced motion, script failure, feedback announcements, contrast, no-JavaScript guidance, and small-screen form controls have resilient paths.
7. Desktop, mobile, narrow-phone, Worker, syntax, link, fragment, metadata, CSS, sitemap, and runtime checks pass.
8. All 95 locked artwork files remain present and unchanged during Phase 8.

Living Watershed production is complete. ReadyPlan widgets remain a later integration when their private modules and explicit public/private handoffs are ready.
