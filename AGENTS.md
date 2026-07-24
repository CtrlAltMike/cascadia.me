# Cascadia.me repository guidance

## Required reading for page-family work

Before adding, renaming, or materially restyling a page family—or adding a page-specific production stylesheet—read both:

1. `docs/page-family-extension-process.md`
2. `docs/2026-07-22-cascadia-design-system-canonical.md`

Follow the extension process in full. Reuse an existing family unless a new structural or interaction contract is necessary.

## Shared-framework sources of truth

- `scripts/site-pages.mjs` owns production pages, metadata, page families, assets, and cache versions.
- `scripts/site-frame/` owns generated shared header and footer markup.
- `css/design-system.css` owns canonical tokens and cross-family primitives.
- `css/site-frame.css` owns shared navigation, footer, and sharing UI.
- `scripts/sync-site-frame.mjs` generates the marked `site-frame:*` blocks.

Do not hand-edit generated frame blocks in HTML. Update their source, then run:

```sh
node scripts/sync-site-frame.mjs --write
```

## Required validation

For framework, registry, shared CSS, or page-family changes, run:

```sh
npm run validate
git diff --check
```

CSS changes also require desktop and mobile visual review of the affected family and representative shared-framework pages, as described in `docs/page-family-extension-process.md`.
