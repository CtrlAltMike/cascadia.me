# Cascadia.me URL migration

## Hosting constraint

Cascadia.me is currently published as a static GitHub Pages site with `.nojekyll`. GitHub Pages does not provide a repository-level rule for returning a true HTTP `301` or `308` response.

Until the hosting layer changes, moved HTML routes use the safest available static fallback:

- `noindex,follow`;
- an immediate HTML refresh;
- a canonical link pointing to the replacement;
- a visible explanation and ordinary link;
- no sitemap entry;
- no internal links pointing to the moved route.

If a future host supports response-level redirects, these handoffs should become permanent HTTP redirects without changing their destinations.

## Current migrations

| Previous route | Replacement | Reason |
| --- | --- | --- |
| `/build-your-kit.html` | `/household-workbook.html` | The workbook is organized around ordinary household functions rather than the purchase of a kit. |
| `/guides.html` | `/place.html` | Regional hazard references now sit within Know Your Place instead of acting as the site’s primary five-hazard table of contents. |

The individual hazard routes remain stable:

- `/earthquake.html`
- `/wildfire.html`
- `/flooding.html`
- `/winter-storm.html`
- `/volcano.html`

Those URLs are useful inbound references and still contain the hazard-specific material that belongs at the first-minutes, building, route, and authority boundaries.
