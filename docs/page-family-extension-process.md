# Extending a Cascadia.me page family

This is the required process for adding a page to an existing family or introducing a genuinely new page family. Read it together with [the canonical design-system reference](2026-07-22-cascadia-design-system-canonical.md) before changing templates, shared chrome, stylesheet ownership, or the page registry.

## 1. Reuse before extending

Start by identifying the closest existing family in `scripts/site-pages.mjs`.

- `home`: the editorial landing page.
- `guide-library`: the illustrated guide index.
- `guide`: the five hazard guides.
- `workbook`: the interactive household workbook.
- `instrument`: Atlas and Signals.
- `story-library`: the Field Stories shelf.
- `story`: an individual Field Story.
- `about`, `faq`, and `not-found`: supporting information surfaces.

Use an existing family when the new page can share its structure, content hierarchy, responsive behavior, and interaction model. A different illustration, accent color, or subject is not a reason to create a family.

Create a new family only when the page needs a durable structural or interaction contract that the existing families cannot express cleanly. Record that reason in the change description.

## 2. Register the page first

`scripts/site-pages.mjs` is the source of truth for production pages and their shared assets. Add the page definition there before hand-building shared markup.

Every entry must declare:

- `path`
- `family`
- `styleFamily`
- `navSection`
- `footerItem`
- `skip`
- `title`
- `description`
- `canonical`
- `schemaType`, when applicable

Add page-specific styles and scripts through `siteAssetCatalog`, then assign them through the registry. Keep cache versions in `siteCacheVersions`; do not place one-off version strings in page markup.

If the family itself is new, add its name to the allowed family set in `scripts/validate-design-system.mjs` and add a family-specific structural assertion. The assertion should identify the markup or behavior that makes the family distinct.

Every indexable page must also preserve the search contract enforced by `scripts/validate-seo.mjs`: a unique title and description, a self-referencing canonical URL, index/follow directives, representative Open Graph and Twitter metadata, crawlable image fallbacks, structured data matching the visible page, and inclusion in `sitemap.xml`. Keep the custom 404 page `noindex,follow` and out of the sitemap.

## 3. Preserve stylesheet ownership

The cascade has three layers:

1. `css/base.css` and `css/components.css` provide foundations and broadly reusable components.
2. Page-family styles provide the family’s distinctive layout and interactions.
3. `css/design-system.css` and `css/site-frame.css` load last and own canonical tokens, primitives, navigation, footer, and sharing behavior.

Page-family CSS must:

- be scoped beneath the family’s body or root class;
- use canonical custom properties where an appropriate token exists;
- keep selectors as specific as the family contract requires, but no more;
- include its responsive and print behavior beside the component it modifies;
- preserve visible focus, 44-pixel touch targets, reduced-motion behavior, and readable contrast.

Page-family CSS must not redefine:

- `.site-header`, `.nav-inner`, `.nav-logo`, `.nav-links`, or `.nav-toggle`;
- `.site-footer` or its shared columns and branding;
- `.share-button`, `.nav-share-btn`, `.floating-share-btn`, or the shared dialog;
- global typography, spacing, color, elevation, or focus tokens.

When a useful rule appears in two families, decide whether it is a true shared primitive. Move it to the common layer only after confirming that its semantics and responsive behavior are identical.

## 4. Use generated frame blocks

The shared metadata, head, page styles, styles, header, footer, page scripts, and shared scripts are generated blocks. Do not hand-edit content between `site-frame:*:start` and `site-frame:*:end` comments.

After changing the registry or shared templates, run:

```sh
node scripts/sync-site-frame.mjs --write
```

Then inspect the generated diff. Generated changes should match the registry change and nothing else.

## 5. Meet the family’s markup contract

Use semantic landmarks, a unique `main` target, a working skip link, one page-level heading, and descriptive link and control names.

For illustrated editorial pages, use the shared `illustrated-hero`, `illustrated-hero__media`, and `illustrated-hero__content` primitives. For map-led tools, use the `instrument-page` contract. New primitives belong in `css/design-system.css`; family-specific composition belongs in the family stylesheet.

All HTTP(S) links leaving Cascadia.me open in a separate tab and include `rel="noopener"`. The site-frame synchronizer applies this policy, and the design-system and browser validators enforce it. Internal Cascadia.me links remain in the current tab.

Do not infer that a desktop layout will collapse correctly. Define and test the reading order, overflow behavior, controls, overlays, and fixed elements at mobile widths.

## 6. Extend regression coverage

Add the new page to an existing representative test or add a focused test in `tests/site-interactions.spec.mjs`. A new family needs both desktop and mobile coverage for:

- the shared header, menu, share dialog, footer, and skip link;
- horizontal overflow and primary content visibility;
- its defining interaction or layout contract;
- keyboard operation and focus restoration where controls open or dismiss UI;
- overlays staying inside the visible instrument or viewport.

Map-led pages also require exercised message overlays and representative layer controls. Do not treat a successfully initialized map as sufficient coverage.

## 7. Validate before handoff

Run the complete release gate:

```sh
npm run validate
git diff --check
```

The gate checks generated frame drift, registry, design-system and SEO contracts, local targets, stylesheet structure, sitemap coverage, internal crawl depth, and browser behavior in desktop and mobile Chromium.

If CSS changed, compare representative pages before and after at both viewport sizes. Review the family being changed plus Home, Guides, Atlas, Signals, Field Stories, and an individual story when shared CSS is involved.

Before committing, verify that:

- only intended page and asset registry entries changed;
- cache versions changed for modified production assets;
- no family stylesheet acquired shared-frame ownership;
- no console or page errors appeared;
- no desktop or mobile overflow was introduced;
- print and reduced-motion behavior remain usable.
