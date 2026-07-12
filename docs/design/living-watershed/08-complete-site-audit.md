# Phase 8: Complete-site binding and audit

**Status:** Completed July 12, 2026

Phase 8 binds the finished Living Watershed work into one site. It does not introduce another visual direction. Every existing illustration remains locked; the work here removes end-to-end seams, tightens source and geographic truth, and makes the live instrument usable beyond a pointer-driven map.

## Editorial binding

- The homepage now acts as the prologue instead of repeating the Guides page. Its four chapter entries are short, distinct connective passages with one link each; Guides retains the fuller table of contents.
- Guides no longer repeats one “Start here / This chapter” construction four times. Earthquake begins in the room, Wildfire at the dry edge of the year, Flooding upstream and out of sight, and Winter Storm with one Pacific system becoming several kinds of weather.
- The homepage keeps the personal founding impulse without duplicating the full Approach origin story.
- The four composite disclosures and households no longer read as one stamped template. Each remains explicitly non-documentary while preserving the assigned household artwork, safety constraints, and human detail.
- Wildfire’s live opening uses ordinary coverage language; the exact technical inventory remains in Sources.
- Winter Storm’s urgent reference no longer behaves like a three-link navigation bar or repeat the same Atlas/source links later.
- One redundant workbook preview link and one repetitive Earthquake caption were removed or rewritten so the surrounding passages can continue without a needless task change.

## Trust, source, and geographic audit

- Current-report source labels now state their actual scope: Washington/Oregon fires, southern-B.C. fires, selected Washington NWS alerts, and Chelan County mapped evacuation areas.
- An unconfigured WSDOT feed now makes the Atlas state partial instead of healthy. The status names the missing road connection in ordinary language.
- The Atlas source dialog states that northern California is outside the current-report feed even though the wider regional map and Earthquake chapter extend there.
- Earthquake now attributes the Pachena Bay tsunami oral history directly to Huu-ay-aht First Nations. Wildfire attributes its cultural-burning passage directly to the Confederated Tribes of Siletz Indians and their Oregon fire-ecology curriculum.
- The broken homepage Coverage and data limits fragment now lands on a real Approach heading.
- Visible review dates, JSON-LD modification dates, cache tokens, and sitemap dates are aligned to July 12, 2026.

## Accessibility and resilience

- Atlas now includes a collapsed, keyboard-readable list of discrete records currently rendered in the viewport. It refreshes after pan, zoom, layer, and data changes and limits the expanded list to forty records plus a remaining-count note.
- Forecast wind now has a non-pointer path: a reader can pan the map with the keyboard and request the model value at the map center. The response names latitude, longitude, speed, direction, valid time, resolution, and the terrain limitation.
- The Atlas has a no-JavaScript handoff to direct regional official sources.
- Escape closes the mobile menu and returns focus to its toggle.
- Reduced-motion preference keeps the mobile header visible and disables its slide transition.
- Scroll-reveal content remains visible if its enhancement script fails.
- The feedback character counter no longer announces every keystroke to assistive technology.
- Hover, warning, and error colors meet normal-text contrast on the warm backgrounds.
- Mobile workbook text fields and Atlas selects use a 16-pixel minimum to avoid focus zoom on iOS.

## Validation record

- Browser reading sweep: all ten root pages at 1280 CSS pixels and 390 CSS pixels.
- Narrow-phone sweep: Homepage, Guides, Build Your Kit, Atlas, and Approach at 320 CSS pixels.
- No horizontal page overflow at any tested width.
- Desktop navigation exposes the full link row; mobile navigation exposes the toggle; Escape focus return verified in the browser.
- Atlas live runtime verified with partial source state, scoped coverage, a populated viewport record index, forecast-wind loading, and a successful keyboard-requested map-center value.
- Browser console: no warnings or errors during the final Atlas runtime check.
- JavaScript syntax: all site, Worker source, and Worker test files pass `node --check`.
- Worker tests: conditions, observed wind, and forecast wind pass.
- HTML audit: unique IDs, local files, fragments, image alternatives and dimensions, JSON-LD, and external-link safety pass across all ten root pages.
- CSS brace balance, sitemap XML, and `git diff --check` pass.
- ReadyPlan hooks remain inert. Public guidance, working sheets, live context, and official sources remain usable without an account or subscription.

## Artwork preservation

- 89 production raster files remain under `assets/living-watershed`.
- Six concept boards remain under `docs/design/living-watershed/concepts`.
- All 95 locked files remain present; no Phase 8 artwork file was edited, renamed, regenerated, recolored, replaced, or deleted.
- Deterministic SHA-256 fingerprint of the sorted 95-file locked collection: `bcf11d21ea8652b06d5b0e67597b856ab421d68fecb413e20c9503170bfcb5d6`.

## Remaining boundary

There is no unfinished Living Watershed production phase. ReadyPlan widgets remain a later integration only when the private modules and their public/private handoffs are ready. Cascadia.me remains complete and public without them.
