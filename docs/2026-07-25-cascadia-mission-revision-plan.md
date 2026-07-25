# Cascadia.me Mission Revision Plan

**Status:** Proposed implementation plan
**Date:** July 25, 2026
**Mission:** Prepare for consequences, not for causes
**Brand authority:** [The Resilience Network Brand Platform](resilience-network-brand-platform.md)
**Voice authority:** [The Resilience Network Voice Guide](resilience-network-voice-guide.md)

## 1. The change

Cascadia.me already contains much of the new philosophy. It treats preparedness as care, respects official authority, includes neighbors and household constraints, and avoids survivalist aesthetics. The problem is structural: the public site still asks readers to choose among five hazards.

The revision should make Cascadia.me the network's regional expression of a different idea:

> Understand the place. Prepare for the interruptions that recur across hazards. Know the few moments when the cause still matters. Make recovery and connection part of the work.

This is a substantial editorial and information-architecture rebuild. It does not require a wholesale visual rebrand: the established Living Watershed typography, color, and reading rhythm remain strong foundations. Illustrations are not locked to the current set. Keep, refresh, replace, or create them anew according to the job of the revised page.

## 2. The reader relationship

Every revised surface should pass two tests:

> Would someone actually say this across a kitchen table?

> Would you say it this way to someone you care about who is already carrying a lot?

The site should recognize before it instructs. It should use contractions, concrete language, natural cadence, and occasional dry humor when the subject is low stakes. It should never require the reader to adopt a preparedness identity or respond to a rallying cry.

The intended movement is:

1. Recognition
2. Orientation
3. Choice
4. Support
5. Release

The reader should be able to understand something, do one useful thing, and stop.

## 3. Proposed public architecture

The logo remains the route to Home. The primary navigation becomes:

1. **Know Your Place**
2. **First Moves**
3. **Keep Life Going**
4. **Recovery**
5. **People Nearby**
6. **Field Stories**

**Find Official Help** becomes a persistent utility action leading to Signals. Atlas belongs within Know Your Place. NowWePlan remains an optional continuity layer after complete public guidance.

These labels are working names. Before implementation, test them aloud in sentences such as:

- "I found it under Keep Life Going."
- "Check First Moves."
- "Signals is where I found the official source."

If a label sounds like a campaign or internal taxonomy, revise it.

## 4. New and revised page system

### 4.1 Home

**Current:** Hazard-led prologue and five-guide routing.
**New job:** Recognize ordinary Cascadian life and route readers by the question they brought.

The opening should not begin with a universal slogan. It should begin with a recognizable place, routine, or interruption and establish the site's usefulness in natural language.

The page should provide clear routes for:

- something is happening now;
- what happens at this address;
- the first action;
- a building question;
- keeping an essential function working;
- making recovery easier;
- making an arrangement with another person.

Review the existing landscape and neighbor artwork against the new opening. Keep what still carries the meaning, refresh what can be made more useful, and replace or create new work where the cause-led composition no longer fits. The current guide montage should not remain the principal organizing device.

### 4.2 Know Your Place

**Proposed canonical path:** `/place.html`
**Page family:** Reuse the illustrated library structure unless implementation proves a distinct contract is necessary.

This hub explains Cascadia as a connected system of land, water, weather, infrastructure, settlement, and public authority.

It should lead to:

- regional history and "find the mark";
- Atlas;
- local hazard references;
- building questions;
- routes and official authorities;
- likely regional recovery constraints.

The current `guides.html` should redirect permanently after the new destination is established. If hosting cannot provide a true HTTP redirect, keep a minimal noindex handoff page and document the limitation.

### 4.3 First Moves

**Proposed canonical path:** `/first-moves.html`
**Page family:** A compact reference hub using existing illustrated primitives.

This is the primary hazard-specific surface. It contains only what must be known without research or deliberation:

- immediate protective action;
- natural warning or official warning;
- the route question, where applicable;
- the responsible official source;
- visible review date.

It must work without JavaScript, print cleanly, remain legible without images, and avoid humor.

### 4.4 Local hazard references

Retain the established paths and search value:

- `earthquake.html`
- `wildfire.html`
- `flooding.html`
- `winter-storm.html`
- `volcano.html`

Refactor every page around the narrow places where cause matters:

1. What this process does in Cascadia
2. What to do first
3. What it may do to a building
4. What it may do to a route
5. Who holds local authority
6. Which recurring consequences to prepare for
7. What recovery may look like

Remove duplicated all-purpose household guidance. Link those needs to Keep Life Going.

Each hazard page keeps its distinct editorial temperament. Shared structure should not produce repeated openings, slogans, or section language.

### 4.5 Keep Life Going

**Proposed canonical path:** `/keep-life-going.html`
**Page family:** New `capability` family.

This is the practical center of the revised site. It organizes around ordinary functions:

- safe water;
- sanitation;
- safe temperature;
- clean air;
- light and information;
- food and medication;
- communication;
- money and documents;
- movement;
- animals and dependents;
- staying in place;
- leaving quickly;
- reconnecting after separation.

The hub may group closely related subjects, but search and sideways arrival require focused pages for substantial reader questions.

#### Capability-page contract

Every capability page should contain:

1. The ordinary function being protected
2. Why the action is harder or more variable than a checklist suggests
3. The smallest useful starting point
4. Ways to build when time, space, and money allow
5. Options for renters and households with limited private capacity
6. What can be shared, borrowed, or arranged with another person
7. What depends on public systems or professional help
8. What changes during a prolonged interruption
9. Sources, limitations, and visible review date
10. One optional adjacent move

This is a semantic contract, not a repeated verbal template.

#### Initial priority pages

Build these first because they carry the greatest amount of existing workbook content and cross-hazard value:

1. Water
2. Sanitation
3. Temperature
4. Air
5. Food and medication
6. Communication and reconnecting
7. Money and documents
8. Staying or leaving

Complete the remaining topics before treating the mission migration as finished.

### 4.6 Understand Your Building

**Proposed canonical path:** `/building.html`
**Page family:** Existing guide family unless a repeated diagnostic-question interaction requires a new contract.

The page should help readers ask better questions about:

- age and construction;
- ground and siting;
- dominant local failure modes;
- established mitigation;
- renter and owner boundaries;
- multifamily and manufactured housing;
- insurance implications;
- qualified professional assessment.

It must not diagnose a building remotely.

Suggested voice:

> You don't need to be an engineer. You need enough information to ask one a better question.

Use this only if it remains natural in the finished context; it is not a required headline.

### 4.7 Household workbook

**Current:** `build-your-kit.html`
**Proposed canonical path:** `/household-workbook.html`

Retain the existing workbook's strongest material: begin with an ordinary day, identify what cannot safely stop, plan for separation, and test one interruption.

Remove "kit" as the primary metaphor. Equipment remains one possible answer to a household function, not the definition of preparation.

The workbook should:

- remain complete without NowWePlan;
- remain printable;
- avoid storing private entries;
- offer a clear starting point without demanding completion;
- connect to capability pages for explanation;
- connect to NowWePlan only as an optional maintenance tool.

Permanently redirect `build-your-kit.html` when the replacement launches.

### 4.8 Recovery

**Proposed canonical path:** `/recovery.html`
**Page family:** Begin as a substantial guide; split into a library only when the content justifies it.

The opening idea:

> Recovery is often a series of ordinary problems made harder.

Cover:

- housing and displacement;
- water and wastewater restoration;
- work and school;
- insurance, records, and claims;
- contractors, materials, and price movement;
- transportation and access;
- medical continuity;
- businesses and neighbors who may not return;
- institutional interventions households cannot replace.

Do not hurry difficult material toward inspiration. Offer practical reductions in friction without implying that recovery can be controlled privately.

### 4.9 People Nearby

**Proposed canonical path:** `/people-nearby.html`
**Page family:** Existing guide structure for the hub, supported by a new paper-first `field-tool` family for the inventory and post-event working sheets.

This section has two jobs that should remain visibly distinct:

1. Help people make a few consent-based arrangements before an event.
2. Help the people who are present form a useful, temporary picture after an event.

The second job is underreported and should become a defining contribution of Cascadia.me. It is not a promise that neighbors will replace emergency services. It is a method for noticing what has happened, matching safe help to immediate needs, recording what is known, and passing better information to the responsible authorities or an established community hub.

Recognize that some readers have good reasons not to rely on neighbors. Do not present connection as a moral test.

Mild humor may acknowledge the awkwardness of beginning:

> You don't need a committee or a clipboard. A name, a phone number, and a short conversation will do.

#### Before an event: make a small agreement

Offer manageable ways to begin:

- learn one name;
- exchange one reliable contact method;
- agree on a check-in method and a reasonable time;
- choose a safe meeting place and an alternate;
- identify an out-of-area contact;
- learn where an existing community hub, building plan, faith community, mutual-aid group, or local program already operates;
- ask what help someone would like, rather than assigning vulnerability to them;
- record only the skills, equipment, and help a person has volunteered to share.

#### After an event: organize the people who are here

Create a dedicated page at `/after-an-event.html`. It should open with personal safety, current official instructions, evacuation, and hazards that make gathering unsafe. When it is safe to organize, the page should support this sequence:

1. **Gather safely.** Use an established hub, building meeting place, or visible outdoor location that is away from known hazards.
2. **Name temporary roles.** A coordinator, scribe, official-information monitor, runner, and needs-and-resources matcher are enough to begin. These are jobs for the moment, not ranks.
3. **Build a common picture.** Record who is present, who has checked in, urgent needs, immediate hazards, blocked routes, utility failures, and current official information.
4. **Set priorities.** Life safety comes first. Then protect essential functions, reduce preventable harm, and connect people with the right official or professional help.
5. **Match needs and offers.** Ask what is needed now, what can be safely shared, who has relevant training, and what must wait for qualified responders.
6. **Assign the next useful work.** Record the task, owner, location, safety limit, and next check-in time.
7. **Pass information outward.** Summarize facts for 911 when reachable, local authorities, utilities, building management, community hubs, or trained response organizations. Do not crowd emergency channels with speculation.
8. **Recheck and hand off.** Update status, rotate people, record unresolved needs, and stop work that exceeds the group's training or safety.

The page should state plainly that no neighbor-led process authorizes entry into an unsafe structure, medical treatment beyond a person's training, utility work without knowledge and permission, ignoring an evacuation order, or presenting local notes as official information.

#### The questions people ask

Organize the post-event prompt set around decisions:

**Are we safe to gather?**

- What official instructions are current, and when were they issued?
- Is this location outside evacuation areas, unstable structures, fire, floodwater, downed lines, gas odor, smoke, ash, or another immediate hazard?
- Which routes are open enough to use, and which must be avoided?

**Who is accounted for?**

- Who is here?
- Who has reported that they are safe somewhere else?
- Who has not checked in?
- Who may be separated from a child, dependent, animal, caregiver, or household member?

**Who needs help that cannot safely wait?**

- Is anyone injured, trapped, missing, unable to communicate, or without essential medical power, refrigeration, mobility, or transportation?
- Who has already called or messaged the responsible service?
- What exact location and observable facts can be reported?

**What has changed nearby?**

- Are water, sanitation, electricity, heat or cooling, clean air, communications, roads, elevators, doors, and building access working?
- Where are fires, leaks, flooding, debris, unstable structures, or other visible hazards?
- Which observations are firsthand, and when were they made?

**What can people safely offer?**

- Who has relevant training and is willing to use it?
- What language, communication, caregiving, transport, radio, tool, power, shelter, food, water, or animal-care help has been offered?
- What limits come with the offer?

**What happens next?**

- What is the most useful safe action now?
- Who owns it?
- When will the group check again?
- What needs to be reported, requested, or handed off?

Avoid questions that turn the gathering into an intake bureaucracy. Ask only for information that changes a decision.

#### A neighborhood inventory

Build a public, printable `/neighborhood-inventory.html` tool with two clearly separated layers.

**Layer 1: the quiet-day inventory**

- the area or building included;
- primary and alternate meeting places;
- official alert and emergency-management sources;
- accessible routes, evacuation routes, and likely barriers;
- household or unit check-in preference, with explicit consent;
- help a person has asked for;
- skills, languages, equipment, space, transport, or supplies a person has volunteered to share;
- building systems, shutoffs, fire equipment, common storage, and responsible contacts;
- nearby organizations, businesses, hubs, and public resources;
- owner, access rules, last review date, and next review date.

**Layer 2: the event status board**

- date, time, place, event, and current official source;
- present, safe elsewhere, needs check, and unknown status;
- observed hazards and blocked routes;
- urgent needs and resource requests;
- available offers and their limits;
- task, owner, location, start time, next check-in, and status;
- messages sent to or received from authorities and established hubs;
- unresolved items and handoff notes.

The useful public artifact is a short packet, not one enormous form:

1. a neighborhood or building map;
2. an opt-in people, skills, and resources sheet;
3. a post-event status and needs board;
4. an action and handoff log;
5. event-specific inserts where the questions materially change.

At minimum, the sheets should make these fields easy to scan:

| Sheet | Fields |
| --- | --- |
| Quiet-day people and resources | Household or unit label; preferred check-in; help requested; voluntary skills or resources; contact route; consent date; review date |
| Event status | Time; location; firsthand observation; people affected; immediate need; source or reporter; next check |
| Needs and offers | Need or request; location; urgency; matched offer; limits; owner; status |
| Action and handoff | Task; owner; safety limit; start time; next check-in; message or authority handoff; result |

For example, an event-status line might read: "10:20 / Oak and Fourth / Tree blocks east lane / Accessible route needed / Reported by two people at the site / Check again at 10:40." It records an observable fact and the next decision. It does not turn a rumor into a map symbol.

Everything must work on paper, in poor light, with no network, and without requiring a preexisting formal group.

#### Regional and event-specific layers

Keep a common post-event core, then add short Cascadia-specific modules:

- **Earthquake and tsunami:** strong-shaking evacuation, fire and gas, damaged buildings, liquefaction, bridges, slopes, and coastal routes;
- **Wildfire:** evacuation status, smoke, road access, animals, separated households, reentry, and structure status;
- **Flood and landslide:** moving or contaminated water, slope movement, isolated properties, wells and septic systems, and safe access;
- **Winter storm and extreme temperature:** heat, power-dependent medical needs, fallen trees, inaccessible roads, carbon monoxide, and welfare checks;
- **Volcanic ash:** air quality, roof loading, water protection, machinery, travel, and cleanup guidance.

Event modules must point to current official instructions and must never become competing alert products.

#### Privacy and consent

A neighborhood inventory can become a map of vulnerability if it is careless. The public tool and any digital version must:

- collect the minimum information needed for an agreed purpose;
- make participation and every offer of help voluntary;
- distinguish "has asked for help" from assumptions about age, disability, health, or capacity;
- avoid storing diagnoses, medication lists, immigration status, financial information, spare-key locations, alarm details, or detailed supply holdings;
- define who may see the information, where it is kept, and when it is reviewed or destroyed;
- allow a person to change or withdraw their information;
- keep live-event notes factual, time-stamped, and short-lived;
- avoid publishing household-level information on a public map.

#### Cascadia.me and NowWePlan

Cascadia.me should provide the complete explanation, printable packet, regional modules, privacy rules, and links to local programs. A reader must be able to organize without creating an account or sharing personal information.

NowWePlan is well suited to the optional continuity layer:

- invite participants and record consent;
- keep owners, review dates, alternates, and practice reminders current;
- produce a local printable packet;
- maintain versions for a block, apartment building, school community, workplace, faith community, or rural area;
- activate an event-specific status board;
- record tasks, check-ins, requests, offers, and handoffs;
- expire or archive incident information after the group no longer needs it.

NowWePlan must not present itself as incident command, an official alert source, a dispatch service, a medical record, or a public directory of vulnerable households. Local guidance and paper export remain complete without it.

### 4.10 Atlas

**Path:** Keep `atlas.html`.
**Family:** Keep `instrument`.

Reposition Atlas as a tool for seeing how a place connects:

- current reports;
- observed and forecast conditions;
- historical events;
- planning layers;
- terrain and regional systems.

The instrument must remain explicit about what it cannot establish. It does not issue instructions or diagnose an address.

Review the title "Regional Hazard Atlas." "Cascadia Atlas" may better support the new architecture without narrowing the tool to hazard spectacle.

### 4.11 Signals

**Path:** Keep `/signals/`.
**Public role:** Find Official Help.

Prioritize:

- responsible agencies;
- alert registration;
- current official instructions;
- transportation and utility sources;
- health and support services.

The map is a locating aid, not the product's identity.

Provide a useful static directory and explanation when JavaScript or external map dependencies fail. Review the current entry gate: informed caution is necessary, but it should not make the reader accept a product disclaimer before reaching official sources.

### 4.12 Field Stories

**Paths:** Keep the collection and all story paths.
**Families:** Keep `story-library` and `story`.

Audit each story against the constitutional fiction standard:

- fiction clearly labeled;
- suffering never the attraction;
- preparation helps without eliminating loss;
- mutual aid and ordinary capability emerge naturally;
- practical guidance remains outside the narrative;
- factual notes carry sources and a visible review date.

Remove any afterword that makes NowWePlan the payoff. A local source or relevant public guide comes first.

### 4.13 Approach, governance, and FAQ

#### `approach.html`

Rewrite around:

- why the network exists;
- who is speaking;
- how evidence is handled;
- the authority boundary;
- money and commercial independence;
- illustration and fiction;
- review schedules;
- corrections;
- the relationship with NowWePlan.

#### New governance surfaces

Publish:

- the finalized Constitution;
- amendment log;
- correction log;
- review and currency policy.

Do not publish constitutional placeholders such as `[DATE]` or `[name]`.

#### `faq.html`

Rebuild around actual reader questions. Avoid using FAQ as a storage area for concepts the main architecture failed to explain.

### 4.14 404

Update routes, search language, and recommendations. Keep it minimal and `noindex,follow`.

## 5. Shared framework work

### 5.1 Page registry

Extend `scripts/site-pages.mjs` with durable fields such as:

- `pageRole`
- `journeyStage`
- `reviewedOn`
- `reviewDue`
- `evidenceClasses`
- `liveOverrideEligible`
- `redirectFrom`, if the deployment system can enforce it

Register every new page before generating shared markup.

The People Nearby work adds these explicit registry entries:

- `/people-nearby.html` - `guide`
- `/after-an-event.html` - `field-tool`
- `/neighborhood-inventory.html` - `field-tool`

### 5.2 Generated frame

Update `scripts/site-frame/` for:

- new navigation;
- revised footer;
- Find Official Help utility;
- visible review dates;
- evidence/source treatment;
- live-event override;
- revised share language.

Do not hand-edit generated frame blocks in production HTML.

### 5.3 Live-event override

Create a small manually controlled source of truth, for example `scripts/site-status.mjs`, containing:

- active state;
- geographic scope;
- responsible authority;
- official URL;
- plain-language label;
- published time;
- expiry time;
- verification owner.

When active, the site must route readers to current official instruction before its own evergreen material.

Suggested relationship:

> You don't need to sort through this alone. [Authority] has the current instructions for [place].

Do not use humor. Do not summarize an order more strongly or weakly than the issuing authority.

### 5.4 Currency and evidence

Every substantive page needs:

- visible review date;
- defined review cadence;
- source identity;
- distinction among official instruction, established guidance, evidence, history, planning, interpretation, and fiction;
- an open correction path.

Anything pointing to official sources, routes, thresholds, or programs needs scheduled verification.

### 5.5 Sharing and NowWePlan

Replace the universal share message in `js/share.js` with page-appropriate language or a neutral default.

Revise `js/nowweplan-gate.js` so the temporary description reflects the network role: NowWePlan keeps plans, owners, agreements, review dates, and practice alive. It should not imply that Cascadia.me is incomplete without it.

For People Nearby, the bridge may offer to keep a consent-based inventory current, produce a paper packet, and open an event-specific working board. It must explain retention, access, export, and deletion before collecting household information.

## 6. Design work

Retain:

- Newsreader and Inter;
- the established Cascadian palette;
- generous reading width and rhythm;
- existing instrument grammar;
- the strongest illustrated editorial conventions when they still serve the revised content.

Illustrations may be retained, refreshed, replaced, or created anew. Make the decision page by page. Editorial fit, clarity, accessibility, and regional specificity matter more than preserving the current asset set.

Shift emphasis:

- ordinary rooms, routes, records, utilities, and relationships at the top level;
- cause-specific spectacle lower in the architecture;
- equipment shown in use rather than arranged as identity;
- recovery represented through domestic and civic life;
- diagrams used to clarify dependencies and time.

For People Nearby, show the modest places where coordination actually happens: an apartment lobby, a folding table, a park, a building entrance, a community room, a handwritten map, or a few people comparing notes. Avoid command-center theater, heroic volunteer imagery, uniforms used as borrowed authority, and crowds arranged as proof of community.

Create diagram and worksheet art for:

- the difference between a quiet-day inventory and a live status board;
- a neighborhood map with meeting places, routes, barriers, and official connections;
- the flow from observation to task to handoff;
- event-specific question modules.

This mission revision supersedes the earlier requirement to preserve every existing illustration unchanged.

## 7. Style-family decision

Reuse existing families wherever their structure and interaction already fit:

- `home`
- `guide-library`
- `guide`
- `workbook`
- `instrument`
- `story-library`
- `story`
- `about`
- `faq`
- `not-found`

Add two new families:

- `capability`
- `field-tool`

The capability family is justified by a durable contract the current hazard guides do not express cleanly: ordinary function, starting point, ways to build, household constraints, shared/public layers, prolonged interruption, and adjacent consequence.

Its stylesheet must remain scoped to the family and must not take ownership of shared navigation, footer, sharing, typography, or global tokens.

The field-tool family is justified by a different durable contract: paper-first use, a bounded working area, clear timestamps and source fields, writable rows, repeatable status categories, event-specific inserts, print assembly, and a useful no-JavaScript state. It is not a generic form system and should not absorb the household workbook unless their interaction and print contracts genuinely converge.

The People Nearby hub remains an existing guide. The inventory, status board, and action log use `field-tool`. If a later NowWePlan implementation becomes stateful, it should share the information model without turning the public pages into account-dependent software.

## 8. Search and URL migration

Preserve high-value hazard URLs. Introduce clearer canonical paths for the former guide hub and kit workbook.

For every changed URL:

1. Provide a true permanent redirect where hosting permits.
2. Update canonical URL, metadata, structured data, social images, and sitemap.
3. Update all internal links.
4. Keep redirects out of the sitemap.
5. Test old inbound links.
6. Avoid duplicate indexable content.

New pages must remain reachable from Home within two internal link steps unless a documented search strategy requires otherwise.

## 9. Validation changes

Update `scripts/validate-design-system.mjs`:

- remove the fixed expectation of 23 pages;
- add the `capability` family and its structural assertion;
- add the `field-tool` family and assertions for print structure, timestamps, source labeling, writable space, and no-JavaScript usefulness;
- update allowed nav and footer values;
- validate review-date fields;
- validate the live-event contract;
- remove obsolete assumptions about guide order and hazard-led navigation;
- preserve frame, hero, instrument, accessibility, and external-link rules.

Update `scripts/validate-seo.mjs`:

- validate new canonicals and redirects;
- preserve unique titles and descriptions;
- preserve structured-data accuracy;
- require sitemap membership for indexable pages;
- preserve crawl-depth and orphan checks;
- validate last-modified dates against the new review process.

Update `tests/site-interactions.spec.mjs`:

- desktop and mobile navigation;
- representative capability page;
- household workbook;
- first-moves reference;
- live-event override and focus behavior;
- neighborhood inventory and post-event field tools in screen, print, and JavaScript-disabled states;
- privacy and data-minimization copy for any optional NowWePlan bridge;
- Atlas and Signals fallbacks;
- print-critical content;
- Field Stories;
- sharing;
- NowWePlan gate;
- every registered page smoke test.

## 10. Implementation sequence

### Phase 0: Resolve governance

- Finalize Constitution date, author, and canonical text.
- Decide whether the existing Markdown constitution or supplied PDF is the publication source.
- Name the live-event and scheduled-review owners.
- Confirm hosting support for permanent redirects.

**Exit:** No governance placeholders or unresolved authority ownership.

### Phase 1: Build the editorial foundation

- Adopt the Brand Platform and Voice Guide.
- Add registry fields for roles, review dates, and evidence.
- Build review, correction, and live-event infrastructure.
- Update shared navigation, footer, sharing, and validation contracts.

**Exit:** The framework can support every new page without one-off metadata or shared-frame edits.

### Phase 2: Replace the public spine

- Rewrite Home.
- Build Know Your Place.
- Build First Moves.
- Build the Keep Life Going hub.
- Build Recovery and People Nearby.
- Build the After an Event page and the printable neighborhood inventory packet.

**Exit:** A reader can understand the new mission without entering a hazard page, and a group can form a safe, useful post-event picture without creating an account.

### Phase 3: Build practical depth

- Build the capability family.
- Publish the first eight priority capability pages.
- Migrate and rename the household workbook.
- Add the first event-specific People Nearby inserts.
- Complete the remaining capability topics.

**Exit:** Regional guidance is complete without NowWePlan.

### Phase 4: Refactor regional specificity

- Refactor all five hazard pages.
- Build Understand Your Building.
- Reposition Atlas.
- Rework Signals around official-source discovery.

**Exit:** Hazard specificity remains only where it improves safety, building decisions, routes, or authority.

### Phase 5: Complete the publication

- Audit Field Stories and factual notes.
- Rewrite Approach and FAQ.
- Publish Constitution, amendments, corrections, and review policy.
- Update 404, footer, social copy, and support language.

**Exit:** Every public surface belongs to the revised network.

### Phase 6: Migrate and release

- Install redirects.
- Update sitemap and social metadata.
- Run full validation.
- Compare desktop, mobile, print, JavaScript-disabled, and poor-connection behavior.
- Complete a voice read-through aloud.
- Verify official links and review dates.

**Exit:** No legacy route, headline, metadata description, or shared component describes Cascadia.me as a five-hazard preparedness guide.

## 11. Acceptance criteria

The revision is complete when:

1. The site is organized around place, recurring consequences, recovery, and connection.
2. Hazard pages remain available but no longer form the primary architecture.
3. Immediate actions and current official instructions are easier to reach than before.
4. Every substantive page carries a visible review date.
5. The site remains useful without images, maps, external feeds, or JavaScript.
6. Guidance includes renters, limited storage, cost, disability, medical power, transport, caregiving, animals, and isolation in the main path.
7. NowWePlan is optional and never the payoff for incomplete public guidance.
8. Copy passes the kitchen-table and carrying-a-lot tests.
9. Humor appears only where it improves a low-stakes passage.
10. Every page provides useful orientation without manufacturing fear or optimism.
11. All new and changed pages pass `npm run validate` and `git diff --check`.
12. CSS changes receive desktop and mobile visual review across the affected family and representative shared pages.
13. People Nearby distinguishes an opt-in quiet-day inventory from a time-stamped post-event status picture.
14. The post-event tools work on paper, without JavaScript, without an account, and without publishing household-level information.
15. Illustrations have been deliberately retained, refreshed, replaced, or newly commissioned according to the revised page's job.

## 12. First implementation package

The first build package should be deliberately broad enough to establish the new system:

1. Registry and validation changes
2. Shared navigation and footer
3. Live-event override
4. Review-date and evidence primitives
5. Rewritten Home
6. Know Your Place
7. First Moves
8. Keep Life Going hub
9. Water capability page
10. Recovery
11. People Nearby
12. After an Event
13. Neighborhood inventory packet
14. Redirect strategy

This package will prove the architecture, both new families, the shared framework, the voice, and the public/NowWePlan boundary before migrating the rest of the site.

## 13. Reference models for People Nearby

Use these as research inputs, not as copy templates:

- [Washington Emergency Management: Make a Community Plan](https://mil.wa.gov/neighborhoods) - community maps, contacts, skills, resources, meeting places, and local official connections.
- [Washington Emergency Management: Community Preparedness Guide](https://mil.wa.gov/asset/6852c3721b57b/2-Weeks-Ready-Community-Brochure-04-Press.pdf) - a compact state model for mapping households and identifying needs, skills, and resources.
- [Seattle Office of Emergency Management: Prepare Your Neighborhood](https://www.seattle.gov/emergency-management/prepare/prepare-your-neighborhood) - flexible neighborhood organization and Community Emergency Hubs.
- [Seattle SNAP: Preparing with Neighbors](https://www.seattle.gov/documents/departments/emergency/preparedness/snap/gettingorganized/snap%20booklet%20final%20for%20print%280%29.pdf) - meeting, care, first-aid, skills, equipment, household, apartment, and post-event task forms.
- [Seattle SNAP: Neighborhood Organization Quick Sheet](https://www.seattle.gov/documents/Departments/Emergency/Preparedness/SNAP/GettingOrganized/NEIGHBORHOODORGANIZATION-QUICKSHEET10-10.pdf) - temporary coordination, task assignment, communications, and damage summary.
- [FEMA CERT Basic Training](https://www.fema.gov/sites/default/files/2020-07/fema-cert_basic-training-participant-manual_01-01-2011.pdf) - continuous size-up: facts, hazards, capability, priorities, action, documentation, and reevaluation.
- [FEMA ICS forms](https://training.fema.gov/emiweb/is/icsresource/icsforms/) - reference patterns for check-in, assignments, messages, resource requests, and activity logs. Public neighborhood tools should remain much simpler.
