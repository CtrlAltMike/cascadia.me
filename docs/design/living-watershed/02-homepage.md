# Living Watershed Homepage: The Prologue

**Status:** Phase 2 implemented and verified

**Date:** July 11, 2026

**Scope:** Revised path, Phase 2

The homepage is now the prologue to Living Watershed rather than a routing surface made from short modules.

Its central statement is:

> **Preparedness isn't about fear. It's about care.**

The page speaks from within Cascadia, gives the reader room to remain with an idea, and uses the existing artwork as large narrative plates. Guide routes, household tools, sources, support, and the Atlas remain accessible without interrupting the reading.

## Editorial outcome

The Phase 1 constitution now appears as the opening belief rather than a trust slogan near the bottom of the page.

The homepage restores:

- The founder's reason for making Cascadia.me
- Preparedness as care for people, place, animals, and ordinary life
- The frustration with sterile brochures and bunker culture
- A clear distinction between truthful authorship and invented authority
- Regional scope from northern California through Oregon and Washington into southern British Columbia
- Honest separation between the bioregion, guide coverage, and Atlas context
- The explicit promise that Cascadia.me supplements rather than replaces local emergency management

The unsupported “real experience” claim is not restored. The copy instead names real geology, real weather, established safety guidance, linked official public information, and the limits of what those sources can tell a household.

## Reading sequence

The page moves through six connected parts:

1. **Belief and place** — the hero pairs the care statement with the connected-watershed illustration.
2. **Authorial prologue** — three connected paragraphs explain why the site exists and how the founder's family preparation began.
3. **The regional system** — sustained prose and one full-width panorama join geology, water, weather, fire, infrastructure, and household life.
4. **Illustrated table of contents** — four substantial entries help readers recognize whether each chapter belongs to their place or household.
5. **Household continuity** — prose and the neighbor illustration frame preparation around the life a household actually has.
6. **Author, sources, and limits** — one quiet note replaces the former trust-card grid and closing CTA band.

This sequence is a reading rhythm, not six reusable homepage modules.

## Structures retired

The Phase 2 implementation removes:

- Both hero buttons
- Four clickable lens cards
- The numbered Read / Recognize / Act strip
- Four action-slogan guide rows
- The neighbor checklist and paired buttons
- Three trust cards
- The dark two-button closing band
- The repeated “next calm action” language

The number of reveal-animation targets falls from 24 to two. Only the two large interior plates reveal on entry; prose is immediately readable.

Ordinary continuation uses text links. The main reading experience contains no utility controls.

## Artwork preservation

No artwork was generated, replaced, recolored, redrawn, renamed, overwritten, or removed.

The page retains:

- assets/living-watershed/home-hero in PNG and WebP
- assets/living-watershed/home-lenses-fire in PNG and WebP
- assets/living-watershed/home-neighbors in PNG and WebP
- assets/living-watershed/home-social in JPEG and PNG metadata roles

The dormant assets/living-watershed/home-lenses PNG and WebP composition remains unchanged as a locked alternate under the Artwork Register.

The Fire-inclusive connected landscape is no longer split into four CSS background crops. It appears as one accessible, uncropped image with a caption. The neighbor composition also appears uncropped as a full-width plate with an adjacent caption. The opening watershed illustration runs uninterrupted. Descriptive alt text supports accessibility without adding visible disclaimers to artwork.

## Visual and reading implementation

- Newsreader carries the sustained narrative at approximately 18–21 pixels with a 42–46 rem reading measure.
- Inter remains the language of navigation, captions, source notes, and controls.
- Major sections use warm reading fields, thin rules, and generous transitions rather than card grids.
- Desktop section pauses are capped at 6.25rem, with interior transitions capped at 4rem around artwork and continuation passages; whitespace supports the reading rhythm without becoming an empty field of its own.
- The hero retains its cream-to-landscape composition on desktop and reflows to copy and uninterrupted artwork on narrow screens.
- The table of contents uses four border-separated editorial entries with real headings and explicit links.
- Full-width plates preserve their natural aspect ratios instead of using destructive fixed-height crops.
- Print retains the illustrations and prose while removing navigation, feedback, and the footer.

## Landing-page focus

The live-condition ticker and its integration hooks were removed from the landing page after Phase 2 review. The opening illustration now leads directly into the authorial prologue. Readers looking for current conditions continue to use the Regional Hazard Atlas and the linked official-source directory; the shared live-condition system remains available to other site surfaces.

## Geographic and trust language

The homepage distinguishes two scopes:

- **Regional story:** northern California through Oregon and Washington into southern British Columbia
- **Guide and Atlas context:** stated by the relevant chapter or map layer

The author note states that local evacuation orders, weather warnings, road closures, utility notices, and Tribal, First Nation, municipal, or regional-district instructions take precedence over Cascadia.me summaries.

It also states:

- Cascadia.me is written and maintained in Washington State.
- Safety guidance is checked against linked official and scientific sources.
- Cascadia.me is independent and is not endorsed by those agencies.
- The site has no ads or affiliate links.

ReadyPlan remains absent.

## Accessibility and responsive verification

The completed page has:

- One H1
- Five H2 section headings
- Four H3 guide-chapter headings
- A working skip link
- Semantic section labels
- A navigation landmark for the table of contents
- Full alt text for every content illustration, with adjacent captions where they add information
- A working mobile menu
- No intentional horizontal overflow

Browser proofs were completed at:

- 1170 × 800 desktop
- 820 × 900 tablet
- 390 × 844 phone
- 320 × 700 narrow phone

At both phone widths, document width and viewport width remain equal. The hero, table of contents, illustrations, author note, navigation, and footer reflow without horizontal scrolling. The browser console returned no warnings or errors at the tested widths.

## Files changed

- index.html — metadata, structured data, and the complete homepage prologue
- css/living-watershed-home.css — replacement home-only reading and responsive system
- js/conditions.js — retained as shared infrastructure but no longer loaded by the homepage
- js/animations.js — explicit Seasonal note labeling
- sitemap.xml — homepage modification date
- this production record and the project status documents

No shared guide or Atlas layout was changed in Phase 2.

## Phase 3 handoff

Earthquake is next. It should inherit:

- The care-led authorial relationship
- Sustained prose as the chapter spine
- Large locked illustrations as narrative plates
- A compact emergency-reference path rather than an interface-first page
- Distinct regional and household detail
- The current factual, safety, accessibility, and provenance guardrails

It should not inherit the homepage composition or become another universal template.
