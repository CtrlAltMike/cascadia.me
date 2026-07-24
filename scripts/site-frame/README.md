# Cascadia.me shared site frame

These fragments are the canonical source for production-page chrome:

- `../site-pages.mjs` is the canonical inventory of production paths, page families, metadata, navigation ownership, footer state, and skip-link behavior.
- `head.html` controls font loading, favicons, and the shared foundation styles.
- `header.html` controls the skip link, wordmark, primary navigation, active state, and static share control.
- `footer.html` controls the shared footer and section-aware current-page state.
- `styles.html` loads the canonical design system and final frame stylesheet after every page-specific stylesheet.
- `scripts.html` controls the shared behavior scripts loaded by every production page.

Run `node scripts/sync-site-frame.mjs --write` after changing a fragment or manifest frame field. The release gate runs the same script with `--check` and fails if any production page has drifted or is missing from the manifest.

Production pages remain complete static HTML. The shared frame is generated before release, so navigation, accessibility, indexing, and local `file://` previews do not depend on client-side JavaScript.

Page-family stylesheets may style their own content, but must not redefine the header, primary navigation, share control, or footer. Those elements are owned by `css/site-frame.css`; the design-system validator rejects new page-family shadow rules.
