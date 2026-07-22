# Cascadia.me shared site frame

These fragments are the canonical source for production-page chrome:

- `head.html` controls font loading, favicons, and the shared foundation styles.
- `header.html` controls the skip link, wordmark, primary navigation, and active state.
- `footer.html` controls the shared footer and section-aware current-page state.
- `styles.html` loads the final frame stylesheet after every page-specific stylesheet.

Run `node scripts/sync-site-frame.mjs --write` after changing a fragment. The release gate runs the same script with `--check` and fails if any production page has drifted.

Production pages remain complete static HTML. The shared frame is generated before release, so navigation, accessibility, indexing, and local `file://` previews do not depend on client-side JavaScript.
