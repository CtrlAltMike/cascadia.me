# Living Watershed Household Workbook

**Status:** Phase 5 complete

**Revision status:** Version 0.5 production record

**Date:** July 11, 2026

**Scope:** Build Your Kit

Phase 5 turns Build Your Kit from a capability dashboard into a public household workbook. The page begins with an ordinary day rather than an imagined disaster or a store aisle. Objects remain useful, but only in relation to the people who can find, carry, power, open, understand, and share them.

The working question remains:

> Can this household still do what matters when an ordinary system is unavailable?

The answer is not one ideal container, family form, budget, duration, or route. The workbook makes room for renters, apartments, rural and island communities, disability, medical power, caregiving, children, pets, service animals, transit, ferries, cost, shared storage, and specific neighbor agreements.

## Editorial movement

The page now reads as one connected practical essay:

1. **Begin with an ordinary day.** Notice water, medicine, routes, school, work, animals, buildings, and support before discussing supplies.
2. **Put the household on paper.** Use the locked household scene as a turning point between observation and planning.
3. **Notice what the house quietly does.** Follow water, warmth, power, food, sanitation, medication, and equipment through the home.
4. **Leave and reconnect.** Join alerts, contacts, meeting places, routes, transport, documents, care, animals, buildings, and neighbors into one movement.
5. **Try one ordinary interruption.** Use a safe tabletop or mild-condition rehearsal that begins with what already works.
6. **Add duration gradually.** Make one day work, reach a three-day milestone, then build toward the goal used by the local authority.
7. **Change the timing, not the household.** Hand off to the four primary hazard chapters without turning them into product lists.
8. **Use four working sheets.** Type locally before printing or print blank pages and write by hand.

The earlier three-cell orientation band, nine identical question/test rows, depth tiles, hazard cards, visible implementation note, and “weak link” framing are gone.

## Stable capability contract

The root contract remains unchanged:

- `data-readyplan-scope="household-capabilities"`
- `data-readyplan-version="1"`

The nine public seams remain stable:

| Capability | Household outcome | Stable hook |
|---|---|---|
| Water | People and animals can drink, prepare food, and meet hygiene needs while supply is interrupted | `household-water` |
| Safe warmth | The household can remain warm without creating a fire or carbon-monoxide hazard | `safe-warmth` |
| Light and critical power | Essential light, communication, mobility, medical, refrigeration, and charging needs have tested paths | `critical-power` |
| Communication | Official information, household contacts, meeting points, and an out-of-area relay remain reachable | `communication` |
| Mobility and evacuation | People, animals, medication, assistive devices, identification, and transport can move with enough time | `mobility-evacuation` |
| Food and sanitation | The household can eat familiar food and manage hygiene and waste without ordinary utilities | `food-sanitation` |
| Medication and medical devices | Medication, storage, power, consumables, suppliers, instructions, and relocation thresholds are known | `medication-medical-devices` |
| Children, care, pets, and service animals | Pickup, daily care, accessible communication, service-animal needs, and animal transport belong to the main plan | `pets-dependents` |
| Neighbor support | Check-ins and help are specific, mutual, consent-based, bounded, and safe | `neighbor-support` |

The attributes remain inert. No ReadyPlan runtime, empty widget, subscription prompt, or implementation copy appears on the public page.

## Four public working pages

The workbook restores practical printable utility without reconnecting the obsolete catalogue renderer in `js/kits.js`.

1. **The ordinary day** — people, locations, care, animals, work/school/building constraints, existing redundancies, and the next dependency to address
2. **Home continuity** — water, safe warmth, critical power, food, sanitation, medication, equipment, and early relocation thresholds
3. **Leave and reconnect** — official sources, household message, meeting places, out-of-area contact, routes, transport, departure load, and neighbor agreements
4. **Rehearse and add time** — one safe exercise, what already worked, one adjustment, ownership, review date, and the gradual duration table

The sheets use native labeled text fields, text areas, and checkboxes. JavaScript provides only the print action and temporary textarea expansion so long responses are not clipped on paper. The instructions remain present and the sheets remain usable if JavaScript fails.

## Privacy boundary

Cascadia.me does not save or transmit workbook entries. Fields have no names, form action, submission path, storage call, analytics event, or ReadyPlan binding. The site writes no workbook state to restore after a reload.

The page does not promise that a browser, extension, operating system, printer, or physical environment remembers nothing. It tells readers that browsers and printers may retain page or print history, to clear fields on shared devices, and to store paper copies with the same care as medication, contact, key, and pickup information.

ReadyPlan may later provide deliberate private saving, assignment, reminders, and review. That future service must not replace any public instruction or printable field.

## Safety corrections

Consequential guidance was checked against current primary public sources in Washington, Oregon, British Columbia, Canada, and the United States. The production page now keeps these distinctions beside the relevant household decision:

- Water quantity includes access, lifting, storage locations, rotation, people, pets, service animals, illness, heat, and local notices.
- A heat rehearsal is tabletop or brief and mild; medically necessary heat is never disabled for a test.
- A gas range or oven is never used to heat a home. Grills, charcoal devices, camp stoves, outdoor heaters, engines, and vehicles are never used in enclosed or partly enclosed spaces for any purpose.
- A portable generator remains outdoors at least 20 ft / 6 m from buildings and openings, with exhaust away and working CO alarms inside; it stays dry, cools before refueling, never backfeeds a wall outlet, and uses approved transfer equipment for a house connection.
- Medical devices are not disconnected to discover their runtime. Testing follows clinician, manufacturer, or supplier instructions.
- Food temperature clocks do not determine medication safety. Product labels and professional instructions govern medicine and equipment.
- Utility medical programs do not guarantee continuous service or first restoration.
- Evacuation alone is not a reason to shut off natural gas. A suspected leak means leaving without operating switches or using a phone indoors, then calling 911 and the utility from outside.
- A rehearsal never requires risky travel, unsafe weather, interrupted treatment, disabled essential power, or loss of every alert and emergency-call path.
- Service animals and pets have distinct planning needs and destination considerations.
- Disabled adults participate in defining their communication, medical, independence, support, and transportation needs; they are not treated as a generic dependent category.

## Duration and cost

Three days is described as an early milestone rather than a sufficient Cascadia endpoint. Washington and Oregon direct households toward two weeks. PreparedBC uses four litres of water per person per day and lists at least three days to one week of food.

The page begins with no-cost observation and agreement, uses existing regular-life items first, and treats gradual rotation as a practical way to add depth. It does not prescribe a spending amount, rank products, use affiliate links, or assume space for fourteen identical containers.

## Artwork record

All three locked household-capability compositions remain in production roles, represented by thirteen files:

- Landscape capability hero, including the 960-pixel derivative and dedicated phone rendition
- Household rehearsal scene at full editorial scale
- Social composition in page metadata

The hero connects the home to terrain, water, communication, health, animals, and neighboring households. The rehearsal scene carries the turn from reading to making a plan. Neither image carries a routine “interpretive illustration” label.

## Implementation

- `build-your-kit.html` contains the sustained reading path, nine stable capability anchors, four working sheets, source apparatus, and household privacy language.
- `css/living-watershed-kit.css` contains the scoped book/workbook design, responsive hero switch, form controls, internal table scrolling, paper treatment, and four-page print layout.
- `js/household-workbook.js` attaches the two print buttons and expands textareas for print, then restores their screen height.
- `js/kits.js` remains dormant and is not reconnected.
- No workbook content depends on reveal animation.

## Verification record

The screen workbook was checked at 1280, 820, 621, 620, 560, 390, and 320 CSS-pixel widths. The 620-pixel breakpoint selects the dedicated portrait hero; wider viewports retain the landscape composition. The page has no horizontal document overflow, while the final duration table scrolls within its own sheet on narrow screens.

The page has one `h1`, logical headings, unique IDs, valid internal targets, all nine capability hooks, valid JSON-LD, and no missing local assets. Print buttons, source links, check controls, and compact writing fields meet the 44-pixel target at narrow widths. Native field labels appear in the accessibility tree. Long answers wrap and expand for print. Test entries remain local to the page and clear on reload.

All 95 locked artwork files remain present; no baseline image was modified.

## Phase 6 handoff

The Atlas is next. Phase 6 should preserve its map-first data distinctions and current caveats while bringing its surrounding explanation, source status, controls, and physical scale into the same Living Watershed book. The Atlas remains an instrument rather than a chapter or workbook.
