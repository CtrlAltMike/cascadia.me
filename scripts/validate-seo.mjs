#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sitePages } from './site-pages.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '..');
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function matchContent(document, selector) {
  return document.match(selector)?.[1];
}

function metaByName(document, name) {
  return matchContent(document, new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'));
}

function metaByProperty(document, property) {
  return matchContent(document, new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"`, 'i'));
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function localAssetFromAbsoluteUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname !== 'cascadia.me' && url.hostname !== 'www.cascadia.me') return null;
    return decodeURIComponent(url.pathname).replace(/^\/+/, '');
  } catch {
    return null;
  }
}

function structuredData(document, relativePath) {
  const entries = [];
  for (const match of document.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      entries.push(JSON.parse(match[1]));
    } catch {
      assert(false, `${relativePath}: invalid JSON-LD`);
    }
  }
  return entries;
}

function collectSchemaTypes(entries) {
  const types = new Set();
  const visit = (entry) => {
    if (!entry || typeof entry !== 'object') return;
    if (entry['@type']) {
      const values = Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']];
      values.forEach((value) => types.add(value));
    }
    if (Array.isArray(entry['@graph'])) entry['@graph'].forEach(visit);
  };
  entries.forEach(visit);
  return types;
}

function schemaNodes(entries) {
  return entries.flatMap((entry) => Array.isArray(entry?.['@graph']) ? entry['@graph'] : [entry]);
}

function localPageTarget(relativePage, rawValue) {
  if (!rawValue || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(rawValue)) return null;
  const [pathname] = rawValue.split(/[?#]/, 1);
  if (!pathname) return null;
  let target = pathname.startsWith('/')
    ? pathname.slice(1)
    : path.normalize(path.join(path.dirname(relativePage), pathname));
  if (!path.extname(target)) target = path.join(target, 'index.html');
  return target;
}

const indexablePages = sitePages.filter((page) => page.path !== '404.html');
const titles = new Map();
const descriptions = new Map();
const pageGraph = new Map();

for (const page of sitePages) {
  const document = read(page.path);
  const title = decodeHtml(matchContent(document, /<title>([^<]*)<\/title>/i));
  const description = metaByName(document, 'description');
  const canonical = matchContent(document, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = metaByName(document, 'robots') ?? '';
  const headings = [...document.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const schemas = structuredData(document, page.path);
  const schemaTypes = collectSchemaTypes(schemas);
  const primarySchema = schemaNodes(schemas).find((entry) => {
    const types = Array.isArray(entry?.['@type']) ? entry['@type'] : [entry?.['@type']];
    return page.schemaType && types.includes(page.schemaType);
  });

  assert(/<html\s+lang="en-US">/i.test(document), `${page.path}: missing canonical language`);
  assert(title === page.title, `${page.path}: title differs from the page registry`);
  assert(description === page.description, `${page.path}: description differs from the page registry`);
  assert(canonical === page.canonical, `${page.path}: canonical differs from the page registry`);
  assert(headings.length >= 1, `${page.path}: page has no h1`);

  if (titles.has(title)) assert(false, `${page.path}: duplicate title also used by ${titles.get(title)}`);
  if (descriptions.has(description)) assert(false, `${page.path}: duplicate description also used by ${descriptions.get(description)}`);
  titles.set(title, page.path);
  descriptions.set(description, page.path);

  if (page.path === '404.html') {
    assert(/\bnoindex\b/i.test(robots), '404.html: custom error page must remain noindex');
    assert(/\bfollow\b/i.test(robots), '404.html: custom error page should allow link following');
    continue;
  }

  assert(/\bindex\b/i.test(robots) && !/\bnoindex\b/i.test(robots), `${page.path}: indexable page has an invalid robots directive`);
  assert(/\bfollow\b/i.test(robots), `${page.path}: indexable page should allow link following`);
  assert(/\bmax-image-preview:large\b/i.test(robots), `${page.path}: large image previews are not enabled`);

  assert(metaByProperty(document, 'og:site_name') === 'Cascadia.me', `${page.path}: missing Open Graph site name`);
  assert(Boolean(metaByProperty(document, 'og:type')), `${page.path}: missing Open Graph type`);
  assert(Boolean(metaByProperty(document, 'og:title')), `${page.path}: missing Open Graph title`);
  assert(Boolean(metaByProperty(document, 'og:description')), `${page.path}: missing Open Graph description`);
  assert(metaByProperty(document, 'og:url') === canonical, `${page.path}: Open Graph URL differs from canonical`);
  assert(Boolean(metaByName(document, 'twitter:card')), `${page.path}: missing Twitter card type`);
  assert(Boolean(metaByName(document, 'twitter:title')), `${page.path}: missing Twitter title`);
  assert(Boolean(metaByName(document, 'twitter:description')), `${page.path}: missing Twitter description`);

  const openGraphImage = metaByProperty(document, 'og:image');
  const twitterImage = metaByName(document, 'twitter:image');
  assert(Boolean(openGraphImage), `${page.path}: missing representative Open Graph image`);
  assert(Boolean(twitterImage), `${page.path}: missing representative Twitter image`);
  if (openGraphImage) {
    const localAsset = localAssetFromAbsoluteUrl(openGraphImage);
    assert(Boolean(localAsset), `${page.path}: Open Graph image must use a canonical Cascadia.me URL`);
    if (localAsset) assert(fs.existsSync(path.join(root, localAsset)), `${page.path}: Open Graph image does not exist: ${localAsset}`);
  }
  if (twitterImage) {
    const localAsset = localAssetFromAbsoluteUrl(twitterImage);
    assert(Boolean(localAsset), `${page.path}: Twitter image must use a canonical Cascadia.me URL`);
    if (localAsset) assert(fs.existsSync(path.join(root, localAsset)), `${page.path}: Twitter image does not exist: ${localAsset}`);
  }

  assert(schemas.length >= 1, `${page.path}: indexable page has no structured data`);
  if (page.schemaType) {
    assert(schemaTypes.has(page.schemaType), `${page.path}: missing registered schema type ${page.schemaType}`);
    if (primarySchema?.url) {
      assert(primarySchema.url === canonical, `${page.path}: primary structured-data URL differs from canonical`);
    }
    if (primarySchema?.inLanguage) {
      assert(primarySchema.inLanguage === 'en-US', `${page.path}: primary structured-data language differs from the document`);
    }
  }

  for (const match of document.matchAll(/<img\b([^>]*)>/gi)) {
    const attributes = match[1];
    assert(/\balt="[^"]*"/i.test(attributes), `${page.path}: image is missing alt text`);
    assert(/\bwidth="\d+"/i.test(attributes) && /\bheight="\d+"/i.test(attributes), `${page.path}: image is missing intrinsic dimensions`);
  }
  for (const match of document.matchAll(/<picture\b[\s\S]*?<\/picture>/gi)) {
    assert(/<img\b[^>]*\bsrc="[^"]+"/i.test(match[0]), `${page.path}: picture element is missing a crawlable fallback image`);
  }

  const localLinks = [...document.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)]
    .map((match) => localPageTarget(page.path, match[1]))
    .filter(Boolean);
  pageGraph.set(page.path, [...new Set(localLinks)]);
}

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
const expectedUrls = indexablePages.map((page) => page.canonical);
assert(sitemapUrls.length === new Set(sitemapUrls).size, 'sitemap.xml: duplicate URLs');
for (const url of expectedUrls) assert(sitemapUrls.includes(url), `sitemap.xml: missing canonical URL ${url}`);
for (const url of sitemapUrls) assert(expectedUrls.includes(url), `sitemap.xml: URL is not an indexable registered page: ${url}`);
assert(!sitemapUrls.includes('https://cascadia.me/404.html'), 'sitemap.xml: noindex 404 page must not be listed');
assert(sitemapDates.length === sitemapUrls.length, 'sitemap.xml: every URL should have one lastmod date');
for (const date of sitemapDates) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)), `sitemap.xml: invalid lastmod date ${date}`);
}

const indexablePaths = new Set(indexablePages.map((page) => page.path));
const incomingLinks = new Map(indexablePages.map((page) => [page.path, new Set()]));
for (const [source, targets] of pageGraph) {
  if (!indexablePaths.has(source)) continue;
  for (const target of targets) {
    if (indexablePaths.has(target)) incomingLinks.get(target).add(source);
  }
}
for (const page of indexablePages) {
  if (page.path !== 'index.html') {
    assert(incomingLinks.get(page.path).size > 0, `${page.path}: indexable page is orphaned`);
  }
}

const crawlDepth = new Map([['index.html', 0]]);
const queue = ['index.html'];
while (queue.length) {
  const source = queue.shift();
  for (const target of pageGraph.get(source) ?? []) {
    if (!indexablePaths.has(target) || crawlDepth.has(target)) continue;
    crawlDepth.set(target, crawlDepth.get(source) + 1);
    queue.push(target);
  }
}
for (const page of indexablePages) {
  assert(crawlDepth.has(page.path), `${page.path}: not reachable from the home page`);
  if (crawlDepth.has(page.path)) {
    assert(crawlDepth.get(page.path) <= 2, `${page.path}: more than two internal link steps from the home page`);
  }
}

const robots = read('robots.txt');
assert(/^User-agent:\s*\*$/im.test(robots), 'robots.txt: missing default user-agent group');
assert(/^Allow:\s*\/$/im.test(robots), 'robots.txt: production crawl is not explicitly allowed');
assert(/^Sitemap:\s*https:\/\/cascadia\.me\/sitemap\.xml$/im.test(robots), 'robots.txt: missing absolute sitemap declaration');

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`SEO contracts validated across ${sitePages.length} production pages and ${sitemapUrls.length} indexable sitemap URLs.`);
}
