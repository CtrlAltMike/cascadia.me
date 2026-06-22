# Slack Integration and Traffic Plan

## Integration shape

Use a small Cloudflare Worker as the boundary between public services and Slack:

1. Ko-fi calls the Worker when a donation happens.
2. Cascadia.me optionally sends a tiny first-party traffic beacon to the Worker.
3. The Worker posts donation alerts and daily traffic summaries into Slack.

This avoids exposing Slack webhook URLs in the static GitHub Pages site.

## Channels

- `#ko-fi-donations`: donation alerts from Ko-fi
- `#cascadia-traffic`: daily traffic summary, top pages, referrers, and UTM sources

## Deployment artifact

Worker source lives in:

```text
integrations/slack-worker/
```

The site-side beacon helper lives at:

```text
js/traffic.js
```

It does nothing until a page includes this in `<head>`:

```html
<meta name="cascadia-traffic-endpoint" content="https://cascadia-slack-alerts.mike-551.workers.dev/traffic">
```

And this near the existing footer scripts:

```html
<script src="js/traffic.js"></script>
```

## Ethical traffic loops

These sites are about disaster preparedness, so the goal should be useful discovery, not urgency bait.

1. Publish evergreen, practical pages that answer specific household questions.
2. Use share links around completed guides and printable checklists.
3. Track UTM-tagged links for calm distribution channels: local groups, neighborhood associations, emergency-prep talks, librarians, and public-interest newsletters.
4. Watch the Slack traffic digest for pages that already help people, then improve those pages first.
5. Keep Ko-fi asks tied to value received, not fear.
6. Avoid disaster-news chasing unless a page directly helps people make safer decisions.

## First experiments

Use simple UTM links and watch `#cascadia-traffic` for one week:

```text
https://cascadia.me/build-your-kit.html?utm_source=nextdoor&utm_medium=community&utm_campaign=kit-checklist
https://cascadia.me/earthquake.html?utm_source=library&utm_medium=resource-list&utm_campaign=pnw-preparedness
https://cascadia.me/wildfire.html?utm_source=local-newsletter&utm_medium=email&utm_campaign=summer-readiness
```

The useful signal is not raw volume. Look for pages that people keep sharing or returning to, then make those pages more printable, clearer, and easier to pass along.
