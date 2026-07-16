import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "public", "stories");
const outputDirectory = path.join(root, "stories");
const buildDate = "2026-07-15";

const stories = [
  {
    slug: "level-three",
    source: "level-three-a-cascadia-story.md",
    region: "Fire country",
    accent: "fire",
    summary: "A horsewoman, her son, and her father meet an east wind with different plans."
  },
  {
    slug: "overnight-lows",
    source: "overnight-lows-a-cascadia-story.md",
    region: "Rain shadow",
    accent: "sun",
    summary: "A water operator reads an island’s lake, its meters, and the people behind them."
  },
  {
    slug: "inventory",
    source: "inventory-a-cascadia-story.md",
    region: "Earthquake country",
    accent: "camas",
    summary: "An inventory specialist discovers what preparedness can—and cannot—hold."
  },
  {
    slug: "the-list",
    source: "the-list-a-cascadia-story.md",
    region: "Earthquake country",
    accent: "spruce",
    summary: "A family’s unfinished refrigerator list becomes a map of the street around them."
  },
  {
    slug: "the-rounds",
    source: "the-rounds-a-cascadia-story.md",
    region: "Ice country",
    accent: "glacial",
    summary: "A home-health aide carries a county’s most important map in a spiral binder."
  },
  {
    slug: "crest",
    source: "crest-a-cascadia-story.md",
    region: "River country",
    accent: "river",
    summary: "A young family learns that the river’s history is a diary, not a promise."
  }
];

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderInline(value) {
  const links = [];
  let rendered = value.replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g, (_, label, href) => {
    const token = `@@FIELDSTORYLINK${links.length}@@`;
    links.push(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`);
    return token;
  });
  rendered = escapeHtml(rendered)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  links.forEach((link, index) => {
    rendered = rendered.replace(`@@FIELDSTORYLINK${index}@@`, link);
  });
  return rendered;
}

function parseStory(markdown, metadata) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const title = lines.find((line) => line.startsWith("# "))?.slice(2).trim();
  const subtitleLine = lines.find((line) => /^\*[^*].*\*$/.test(line.trim()));
  const subtitle = subtitleLine?.trim().slice(1, -1);
  const sourceHeading = lines.findIndex((line) => line === "## Factual source notes");
  if (!title || !subtitle || sourceHeading === -1) {
    throw new Error(`Missing title, subtitle, or source notes in ${metadata.source}`);
  }

  const chapterLines = lines.slice(0, sourceHeading);
  const chapters = [];
  let current = null;
  chapterLines.forEach((line) => {
    const chapterMatch = line.match(/^## (\d+)$/);
    if (chapterMatch) {
      current = { number: Number(chapterMatch[1]), paragraphs: [] };
      chapters.push(current);
      return;
    }
    if (!current || !line.trim() || line === "---" || line.startsWith("# ") || line.startsWith("**Fiction.**") || line === subtitleLine) return;
    current.paragraphs.push(line.trim());
  });

  const sourceLines = lines.slice(sourceHeading + 1).filter((line) => line.trim());
  const sourceIntroduction = sourceLines.find((line) => !line.startsWith("- ")) || "";
  const sources = sourceLines.filter((line) => line.startsWith("- ")).map((line) => line.slice(2));
  const bodyText = chapters.flatMap((chapter) => chapter.paragraphs).join(" ").replace(/\*|— end —/g, "");
  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 230));

  return { ...metadata, title, subtitle, chapters, sourceIntroduction, sources, wordCount, readingMinutes };
}

function head({ title, description, canonical, type = "website", schema }) {
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Michael Hendrick">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="#fbf7ee">
  <meta name="cascadia-feedback-endpoint" content="https://cascadia-slack-alerts.mike-551.workers.dev/feedback">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="Cascadia.me">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://cascadia.me/assets/living-watershed/home-social.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="https://cascadia.me/assets/living-watershed/home-social.jpg">
  <script>document.documentElement.classList.add('js');</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&amp;display=swap">
  <link rel="icon" href="../favicon.svg?v=3" type="image/svg+xml" sizes="any">
  <link rel="icon" href="../favicon.ico?v=3">
  <link rel="stylesheet" href="../css/base.css?v=20260715-stories4">
  <link rel="stylesheet" href="../css/components.css?v=20260715-stories4">
  <link rel="stylesheet" href="../css/living-watershed-surfaces.css?v=20260715-stories4">
  <link rel="stylesheet" href="../css/field-stories.css?v=20260715-stories4">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function header() {
  return `<header class="site-header">
    <nav class="nav-inner" aria-label="Primary navigation">
      <a href="../index.html" class="nav-logo" aria-label="Cascadia.me home">Cascadia<span>.me</span></a>
      <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false" aria-controls="site-nav-links">
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
        <span class="nav-toggle-bar"></span>
      </button>
      <ul class="nav-links" id="site-nav-links">
        <li><a href="../guides.html">Guides</a></li>
        <li><a href="../build-your-kit.html">Build Your Kit</a></li>
        <li><a href="../atlas.html">Atlas</a></li>
        <li><a href="../signals/">Signals</a></li>
        <li><a href="./" class="active" aria-current="page">Field Stories</a></li>
        <li><a href="../approach.html">The Approach</a></li>
        <li><a href="https://ko-fi.com/mikehen" target="_blank" rel="noopener">Support</a></li>
      </ul>
    </nav>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <h3>Cascadia<span>.me</span></h3>
          <p>An illustrated field guide for people who live here.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Guides</h4>
            <ul>
              <li><a href="../earthquake.html">Earthquake</a></li>
              <li><a href="../wildfire.html">Wildfire</a></li>
              <li><a href="../flooding.html">Flooding</a></li>
              <li><a href="../winter-storm.html">Winter Storm</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="../atlas.html">Regional Hazard Atlas</a></li>
              <li><a href="../signals/">Signals</a></li>
              <li><a href="./">Field Stories</a></li>
              <li><a href="../build-your-kit.html">Build Your Kit</a></li>
              <li><a href="../approach.html">The Approach</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Cascadia.me</p>
        <p class="seasonal-footer"></p>
      </div>
    </div>
  </footer>`;
}

function commonScripts({ story = false } = {}) {
  return `${story ? '<script src="../js/field-stories.js?v=20260715-stories4"></script>\n  ' : ""}<script src="../js/share.js"></script>
  <script src="../js/nav.js?v=20260715-stories4"></script>
  <script src="../js/animations.js?v=20260715-stories4"></script>
  <script src="../js/feedback.js?v=20260715-stories4"></script>
  <!-- Cloudflare Web Analytics --><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "342fced3e6ce4fbe9aa256b78d1d4599"}'></script><!-- End Cloudflare Web Analytics -->`;
}

function collectionSchema(parsedStories) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://cascadia.me/stories/#webpage",
    url: "https://cascadia.me/stories/",
    name: "Field Stories",
    description: "Original fiction about preparedness, crisis, care, and community across the Cascadia bioregion.",
    inLanguage: "en-US",
    dateModified: buildDate,
    author: { "@type": "Person", name: "Michael Hendrick" },
    hasPart: parsedStories.map((story) => ({
      "@type": "ShortStory",
      name: story.title,
      url: `https://cascadia.me/stories/${story.slug}.html`,
      genre: "Preparedness fiction"
    }))
  };
}

function renderCollection(parsedStories) {
  const description = "Original fiction about preparedness, crisis, care, and community across the Cascadia bioregion, with factual source notes for every story.";
  const entries = parsedStories.map((story, index) => `
          <li class="field-story-entry field-story-entry-${story.accent}">
            <div class="field-story-entry-mark" aria-hidden="true">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <i></i>
            </div>
            <div class="field-story-entry-heading">
              <p>${escapeHtml(story.region)} · Fiction</p>
              <h2><a href="${story.slug}.html">${escapeHtml(story.title)}</a></h2>
            </div>
            <div class="field-story-entry-copy">
              <p>${escapeHtml(story.summary)}</p>
              <div class="field-story-entry-meta">
                <span>${story.chapters.length} chapters</span>
                <span>About ${story.readingMinutes} minutes</span>
              </div>
              <a class="field-story-read" href="${story.slug}.html" aria-label="Read ${escapeHtml(story.title)}">Read the story <span aria-hidden="true">→</span></a>
            </div>
          </li>`).join("");

  return `<!DOCTYPE html>
<html lang="en-US">
<head>${head({
    title: "Field Stories | Cascadia.me",
    description,
    canonical: "https://cascadia.me/stories/",
    schema: collectionSchema(parsedStories)
  })}
</head>
<body class="lw-surface-page field-stories-page field-stories-library">
  <a class="surface-skip-link" href="#main-content">Skip to main content</a>
  ${header()}
  <main id="main-content">
    <header class="field-stories-hero" aria-labelledby="field-stories-title">
      <div class="surface-container field-stories-hero-layout">
        <div class="field-stories-hero-title">
          <p class="surface-eyebrow">Original fiction</p>
          <h1 id="field-stories-title">Field<br><em>Stories</em></h1>
        </div>
        <div class="field-stories-hero-copy">
          <p class="field-stories-deck">Stories for the moments when a list is not enough.</p>
          <p>Kits and checklists matter. Stories let us rehearse something facts alone cannot: what a decision feels like before certainty arrives, and how ordinary skills become care under pressure.</p>
          <p>Every story here is fiction. The people, places, and events are invented or composed; factual sources appear after the final page.</p>
        </div>
      </div>
      <div class="field-stories-contour" aria-hidden="true"><span></span><span></span><span></span></div>
    </header>

    <section class="field-stories-shelf" aria-labelledby="shelf-title">
      <div class="surface-container">
        <h2 class="sr-only" id="shelf-title">Field Stories</h2>
        <ol class="field-story-list">${entries}
        </ol>
      </div>
    </section>

    <aside class="field-stories-coda" aria-labelledby="coda-title">
      <div class="surface-container field-stories-coda-layout">
        <div>
          <p class="surface-eyebrow">When you need facts first</p>
          <h2 id="coda-title">Start with the source for your place.</h2>
        </div>
        <div>
          <p>If conditions are changing now, follow current official information. Signals can help you find the responsible publisher. If you are preparing ahead, begin with the guide closest to your place or household.</p>
          <p><a href="../signals/">Open Signals <span aria-hidden="true">→</span></a> <a href="../guides.html">Open the Guides <span aria-hidden="true">→</span></a></p>
        </div>
      </div>
    </aside>
  </main>
  ${footer()}
  ${commonScripts()}
</body>
</html>`;
}

function storySchema(story) {
  return {
    "@context": "https://schema.org",
    "@type": "ShortStory",
    "@id": `https://cascadia.me/stories/${story.slug}.html#story`,
    url: `https://cascadia.me/stories/${story.slug}.html`,
    name: story.title,
    description: story.summary,
    genre: ["Fiction", "Preparedness fiction", "Cascadian literature"],
    inLanguage: "en-US",
    isPartOf: { "@id": "https://cascadia.me/stories/#webpage" },
    author: { "@type": "Person", name: "Michael Hendrick" },
    publisher: { "@type": "Organization", name: "Cascadia.me", url: "https://cascadia.me/" },
    wordCount: story.wordCount,
    timeRequired: `PT${story.readingMinutes}M`,
    datePublished: buildDate,
    dateModified: buildDate
  };
}

function renderStory(story, index, parsedStories) {
  const chapterLinks = story.chapters.map((chapter, chapterIndex) => `
              <li><a href="#chapter-${chapter.number}"><span>${roman[chapterIndex]}</span><span>Chapter ${chapter.number}</span></a></li>`).join("");
  const chapters = story.chapters.map((chapter, chapterIndex) => {
    const paragraphs = chapter.paragraphs.map((paragraph) => {
      const isEnd = paragraph === "*— end —*";
      return `<p${isEnd ? ' class="story-end"' : ""}>${renderInline(paragraph)}</p>`;
    }).join("\n            ");
    return `<section class="story-chapter" id="chapter-${chapter.number}" aria-labelledby="chapter-${chapter.number}-title">
          <header class="story-chapter-heading">
            <p>Chapter</p>
            <h2 id="chapter-${chapter.number}-title"><span class="sr-only">Chapter </span>${roman[chapterIndex]}</h2>
          </header>
          <div class="story-prose">
            ${paragraphs}
          </div>
        </section>`;
  }).join("\n        ");

  const sourceItems = story.sources.map((source) => `<li>${renderInline(source)}</li>`).join("\n              ");
  const previous = parsedStories[(index - 1 + parsedStories.length) % parsedStories.length];
  const next = parsedStories[(index + 1) % parsedStories.length];
  const description = `${story.summary} An original work of fiction from Cascadia.me.`;

  return `<!DOCTYPE html>
<html lang="en-US">
<head>${head({
    title: `${story.title} — A Field Story | Cascadia.me`,
    description,
    canonical: `https://cascadia.me/stories/${story.slug}.html`,
    type: "article",
    schema: storySchema(story)
  })}
</head>
<body class="lw-surface-page field-stories-page field-story-page field-story-${story.accent}">
  <a class="surface-skip-link" href="#story-text">Skip to the story</a>
  <div class="story-reading-progress" aria-hidden="true"><span id="story-progress-bar"></span></div>
  ${header()}
  <main id="main-content">
    <article class="field-story" aria-labelledby="story-title">
      <header class="field-story-masthead">
        <div class="field-story-masthead-wash" aria-hidden="true"></div>
        <div class="surface-container field-story-masthead-layout">
          <div class="field-story-masthead-copy">
            <p class="surface-eyebrow">Field Story · Fiction</p>
            <h1 id="story-title">${escapeHtml(story.title)}</h1>
            <p class="field-story-subtitle">${escapeHtml(story.subtitle)}</p>
          </div>
          <dl class="field-story-folio">
            <div><dt>Form</dt><dd>Original fiction</dd></div>
            <div><dt>Length</dt><dd>${story.chapters.length} chapters · about ${story.readingMinutes} minutes</dd></div>
            <div><dt>Grounding</dt><dd>Factual sources follow the story</dd></div>
          </dl>
        </div>
      </header>

      <div class="surface-container story-body-layout" id="story-text">
        <aside class="story-rail" aria-label="Story navigation">
          <div class="story-rail-inner">
            <a class="story-rail-back" href="./"><span aria-hidden="true">←</span> Field Stories</a>
            <p class="story-rail-label">In this story</p>
            <ol>${chapterLinks}
              <li><a href="#factual-sources"><span>§</span><span>Factual sources</span></a></li>
            </ol>
            <p class="story-rail-status" id="story-progress-label" aria-live="polite">Beginning</p>
          </div>
        </aside>

        <div class="story-reading-column">${chapters}
        </div>
      </div>

      <aside class="story-sources" id="factual-sources" aria-labelledby="sources-title">
        <div class="surface-container story-sources-layout">
          <div>
            <p class="surface-eyebrow">Outside the fiction</p>
            <h2 id="sources-title">Factual source notes</h2>
          </div>
          <div class="story-sources-copy">
            <p>${renderInline(story.sourceIntroduction)}</p>
            <ul>
              ${sourceItems}
            </ul>
          </div>
        </div>
      </aside>

      <nav class="story-afterword" aria-label="Continue through Field Stories">
        <a href="${previous.slug}.html"><span>Previous story</span><strong>${escapeHtml(previous.title)}</strong></a>
        <a href="./"><span>All Field Stories</span><strong>Return to the shelf</strong></a>
        <a href="${next.slug}.html"><span>Next story</span><strong>${escapeHtml(next.title)}</strong></a>
      </nav>
    </article>
  </main>

  <dialog class="story-gate" id="story-gate" aria-labelledby="story-gate-title" aria-describedby="story-gate-description">
    <div class="story-gate-mark" aria-hidden="true"><span></span>Before you read</div>
    <h2 id="story-gate-title">Stories ask something different of us.</h2>
    <div class="story-gate-copy" id="story-gate-description">
      <p>Stories can teach what checklists cannot: how ordinary decisions feel when time narrows, and how people move through moments of crisis and catharsis.</p>
      <p><strong>This story may contain fear, grief, and loss.</strong> Read when you have room for it. You can pause or leave at any time. If you need practical guidance now, use the <a href="../guides.html">Guides</a> or <a href="../signals/">Signals</a> instead.</p>
    </div>
    <form method="dialog" id="story-gate-form">
      <label class="story-acknowledgment">
        <input type="checkbox" id="story-gate-ack" autofocus>
        <span><strong>I understand</strong> that Field Stories are fiction and may be emotionally difficult to read.</span>
      </label>
      <div class="story-gate-actions">
        <a href="index.html">Not now</a>
        <button type="submit" id="story-gate-begin" value="acknowledged" disabled>Begin reading</button>
      </div>
    </form>
  </dialog>

  ${footer()}
  ${commonScripts({ story: true })}
</body>
</html>`;
}

await mkdir(outputDirectory, { recursive: true });
const parsedStories = [];
for (const metadata of stories) {
  const markdown = await readFile(path.join(sourceDirectory, metadata.source), "utf8");
  parsedStories.push(parseStory(markdown, metadata));
}

await writeFile(path.join(outputDirectory, "index.html"), renderCollection(parsedStories));
for (const [index, story] of parsedStories.entries()) {
  await writeFile(path.join(outputDirectory, `${story.slug}.html`), renderStory(story, index, parsedStories));
}

console.log(`Built ${parsedStories.length} Field Stories in ${path.relative(root, outputDirectory)}/`);
parsedStories.forEach((story) => console.log(`${story.title}: ${story.wordCount} words, ${story.readingMinutes} minutes, ${story.chapters.length} chapters`));
