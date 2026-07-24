#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  siteAssetCatalog,
  siteCacheVersions,
  sitePages
} from './site-pages.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '..');
const excludedDirectories = new Set([
  '.git', '.github', '.playwright-cli', 'Google', 'assets', 'css', 'docs',
  'experiments', 'integrations', 'js', 'node_modules', 'output', 'playwright-report',
  'poc', 'public', 'scripts', 'test-results', 'tests'
]);
const failures = [];
const requiredPageFamilyReferences = [
  'docs/page-family-extension-process.md',
  'docs/2026-07-22-cascadia-design-system-canonical.md'
];

function collectHtml(directory, relativeDirectory = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) continue;
      files.push(...collectHtml(path.join(directory, entry.name), path.join(relativeDirectory, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(relativeDirectory, entry.name));
    }
  }
  return files.sort();
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function count(document, value) {
  return document.split(value).length - 1;
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const repositoryGuidance = read('AGENTS.md');
for (const reference of requiredPageFamilyReferences) {
  assert(
    repositoryGuidance.includes(reference),
    `AGENTS.md: page-family work must require reading ${reference}`
  );
  assert(
    fs.existsSync(path.join(root, reference)),
    `AGENTS.md: required page-family reference is missing: ${reference}`
  );
}

function decodeHtmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function structuredDataTypes(document, relativePath) {
  const types = new Set();
  for (const match of document.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const value = JSON.parse(match[1]);
      const visit = (entry) => {
        if (!entry || typeof entry !== 'object') return;
        if (entry['@type']) {
          for (const type of Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']]) types.add(type);
        }
        if (Array.isArray(entry['@graph'])) entry['@graph'].forEach(visit);
      };
      visit(value);
    } catch {
      assert(false, `${relativePath}: invalid JSON-LD`);
    }
  }
  return types;
}

function localTarget(relativePage, rawValue) {
  if (!rawValue || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(rawValue)) return null;
  const [pathname] = rawValue.split(/[?#]/, 1);
  if (!pathname) return null;
  let target = pathname.startsWith('/')
    ? pathname.slice(1)
    : path.join(path.dirname(relativePage), pathname);
  target = path.normalize(target);
  if (target.endsWith(path.sep) || !path.extname(target)) {
    const directory = path.join(root, target);
    if (fs.existsSync(directory) && fs.statSync(directory).isDirectory()) target = path.join(target, 'index.html');
  }
  return target;
}

const pages = collectHtml(root);
assert(pages.length === 23, `Expected 23 production pages, found ${pages.length}`);
assert(sitePages.length === pages.length, `Expected ${pages.length} page-manifest entries, found ${sitePages.length}`);

const pagePaths = new Set(pages);
const manifestPaths = new Set(sitePages.map((page) => page.path));
const manifestCanonicals = new Set(sitePages.map((page) => page.canonical));
assert(manifestPaths.size === sitePages.length, 'Page manifest contains duplicate paths');
assert(manifestCanonicals.size === sitePages.length, 'Page manifest contains duplicate canonical URLs');
for (const relativePath of pages) assert(manifestPaths.has(relativePath), `${relativePath}: missing from page manifest`);
for (const page of sitePages) assert(pagePaths.has(page.path), `${page.path}: manifest entry has no production page`);

const allowedFamilies = new Set(['about', 'faq', 'guide', 'guide-library', 'home', 'instrument', 'not-found', 'story', 'story-library', 'workbook']);
const allowedStyleFamilies = new Set(['atlas', 'guide', 'home', 'signals', 'surface']);
const allowedNavSections = new Set([null, 'atlas', 'guides', 'home', 'kit', 'signals', 'stories']);
const allowedFooterItems = new Set([null, 'approach', 'atlas', 'earthquake', 'faq', 'flooding', 'kit', 'signals', 'stories', 'volcano', 'wildfire', 'winter']);

for (const page of sitePages) {
  const document = read(page.path);
  const title = document.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = document.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = document.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

  assert(allowedFamilies.has(page.family), `${page.path}: unknown page family ${page.family}`);
  assert(allowedStyleFamilies.has(page.styleFamily), `${page.path}: unknown stylesheet family ${page.styleFamily}`);
  assert(allowedNavSections.has(page.navSection), `${page.path}: unknown navigation section ${page.navSection}`);
  assert(allowedFooterItems.has(page.footerItem), `${page.path}: unknown footer item ${page.footerItem}`);
  assert(page.skip && page.skip.className && page.skip.href && page.skip.text, `${page.path}: incomplete skip-link contract`);
  assert(title && decodeHtmlText(title) === page.title, `${page.path}: title differs from page manifest`);
  assert(description === page.description, `${page.path}: description differs from page manifest`);
  assert(canonical === page.canonical, `${page.path}: canonical URL differs from page manifest`);
  if (page.schemaType) {
    assert(structuredDataTypes(document, page.path).has(page.schemaType), `${page.path}: missing manifest schema type ${page.schemaType}`);
  }
}

for (const relativePath of pages) {
  const document = read(relativePath);
  for (const block of ['metadata', 'head', 'page-styles', 'styles', 'header', 'page-scripts', 'scripts']) {
    assert(count(document, `<!-- site-frame:${block}:start -->`) === 1, `${relativePath}: missing canonical ${block} start`);
    assert(count(document, `<!-- site-frame:${block}:end -->`) === 1, `${relativePath}: missing canonical ${block} end`);
  }
  if (relativePath !== '404.html') {
    assert(count(document, '<!-- site-frame:footer:start -->') === 1, `${relativePath}: missing canonical footer`);
  }
  assert(count(document, 'css/design-system.css') === 1, `${relativePath}: design-system.css must appear once`);
  assert(count(document, 'css/site-frame.css') === 1, `${relativePath}: site-frame.css must appear once`);
  assert(count(document, `css/base.css?v=${siteCacheVersions.designSystem}`) === 1, `${relativePath}: canonical base cache key is missing`);
  assert(count(document, `css/components.css?v=${siteCacheVersions.designSystem}`) === 1, `${relativePath}: canonical components cache key is missing`);
  assert(count(document, `css/site-frame.css?v=${siteCacheVersions.frame}`) === 1, `${relativePath}: canonical frame cache key is missing`);
  assert(/<body class="[^"]*\bsite-frame-page\b/.test(document), `${relativePath}: missing site-frame-page body class`);
  assert(count(document, 'class="share-button nav-share-btn"') === 1, `${relativePath}: static share control must appear once`);
  assert(count(document, `js/share.js?v=${siteCacheVersions.frame}`) === 1, `${relativePath}: canonical share helper cache key is missing`);
  for (const script of ['share', 'nav', 'animations', 'feedback']) {
    assert(count(document, `js/${script}.js`) === 1, `${relativePath}: ${script}.js must appear once`);
  }

  const ids = [...document.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert(duplicateIds.length === 0, `${relativePath}: duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);

  for (const match of document.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const target = localTarget(relativePath, match[1]);
    if (target) assert(fs.existsSync(path.join(root, target)), `${relativePath}: missing local target ${match[1]}`);
  }
  for (const match of document.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      const target = localTarget(relativePath, candidate.trim().split(/\s+/)[0]);
      if (target) assert(fs.existsSync(path.join(root, target)), `${relativePath}: missing srcset target ${candidate.trim()}`);
    }
  }

  for (const match of document.matchAll(/<a\b([^>]*\bhref="https?:\/\/[^"]+"[^>]*)>/gi)) {
    const attributes = match[1];
    const href = attributes.match(/\bhref="([^"]+)"/i)?.[1]?.replaceAll('&amp;', '&');
    if (!href) continue;
    let hostname;
    try {
      hostname = new URL(href).hostname.toLowerCase();
    } catch {
      assert(false, `${relativePath}: invalid external link ${href}`);
      continue;
    }
    if (hostname === 'cascadia.me' || hostname === 'www.cascadia.me') continue;
    const rel = attributes.match(/\brel="([^"]*)"/i)?.[1] ?? '';
    assert(/\btarget="_blank"/i.test(attributes), `${relativePath}: external link must open a new tab: ${href}`);
    assert(
      rel.split(/\s+/).some((value) => value.toLowerCase() === 'noopener'),
      `${relativePath}: external link must use rel="noopener": ${href}`
    );
  }
}

for (const page of sitePages) {
  const document = read(page.path);
  for (const assetId of [...page.assets.styles, ...page.assets.scripts]) {
    const asset = siteAssetCatalog[assetId];
    const expected = `${asset.path}${asset.version ? `?v=${asset.version}` : ''}`;
    assert(document.includes(expected), `${page.path}: missing registry-owned asset ${assetId}`);
  }
}

const designSystem = read('css/design-system.css');
for (const token of [
  '--cascadia-page-width', '--cascadia-reading-width', '--cascadia-focus-ring',
  '--cascadia-control-height', '--cascadia-type-hero-xl', '--cascadia-type-label'
]) {
  assert(designSystem.includes(token), `design-system.css: missing ${token}`);
}
for (const primitive of ['.illustrated-hero', '.illustrated-hero__media', '.illustrated-hero__content', '.instrument-page']) {
  assert(designSystem.includes(primitive), `design-system.css: missing ${primitive}`);
}
assert(designSystem.includes('.maplibregl-ctrl-attrib-button'), 'design-system.css: map attribution is missing the instrument touch-target contract');

for (const relativePath of ['css/base.css', 'css/components.css', 'js/nav.js']) {
  const source = read(relativePath);
  assert(!/(PREP\.SUPPLY|Bitter|Podium|Keel|Limn)/.test(source), `${relativePath}: retired design-system language remains`);
}
assert(!read('css/base.css').includes('.guide-hub-hero-heading'), 'css/base.css: stale Guides hero motion hook remains');

const signals = read('signals/styles.css');
assert(!/font-size:\s*(?:[0-9]|1[01])px/.test(signals), 'signals/styles.css: labels below 12px remain');
assert(count(signals, 'min-height: 44px') >= 7, 'signals/styles.css: canonical 44px control targets are missing');
assert(read('signals/index.html').includes('instrument-page'), 'signals/index.html: missing shared instrument contract');
assert(read('atlas.html').includes('instrument-page'), 'atlas.html: missing shared instrument contract');
assert(read('atlas.html').includes(`js/atlas.js?v=${siteCacheVersions.atlas}`), 'atlas.html: stale Atlas script cache key');
assert(!read('css/living-watershed-atlas.css').includes('.living-watershed-atlas .nav-share-btn'), 'atlas stylesheet: mobile share-control exception remains');
const atlasScript = read('js/atlas.js');
assert(atlasScript.includes("'icon-allow-overlap': true"), 'atlas script: observed-wind arrows can lose collision placement');
assert(atlasScript.includes("'icon-ignore-placement': true"), 'atlas script: observed-wind arrows can be displaced by label tiers');

const illustratedPages = [
  'index.html', 'guides.html', 'faq.html', 'build-your-kit.html', 'earthquake.html',
  'wildfire.html', 'flooding.html', 'winter-storm.html', 'volcano.html', 'stories/index.html'
];
for (const relativePath of illustratedPages) {
  const document = read(relativePath);
  assert(document.includes('illustrated-hero'), `${relativePath}: missing illustrated hero contract`);
  assert(document.includes('illustrated-hero__media'), `${relativePath}: missing illustrated hero media contract`);
  assert(document.includes('illustrated-hero__content'), `${relativePath}: missing illustrated hero content contract`);
}

const guideTaxonomyPages = [
  'index.html', 'guides.html', 'faq.html', 'earthquake.html', 'wildfire.html',
  'flooding.html', 'winter-storm.html', 'volcano.html'
];
const publicChapterLanguage = />[^<]*\bchapters?\b|content="[^"]*\bchapters?\b|"(?:description|text)":\s*"[^"]*\bchapters?\b/i;
for (const relativePath of guideTaxonomyPages) {
  assert(!publicChapterLanguage.test(read(relativePath)), `${relativePath}: public copy still describes a hazard guide as a chapter`);
}
const guidesPage = read('guides.html');
assert(!/>[^<]*\bguidebook\b|<title>[^<]*\bguidebook\b|"name":\s*"[^"]*\bguidebook\b/i.test(guidesPage), 'guides.html: public copy still presents the guide collection as one guidebook');

const earthquake = read('earthquake.html');
assert(earthquake.includes('chapter--earthquake'), 'earthquake.html: missing shared hazard-family class');
assert(earthquake.includes('primary-chapter-page earthquake-chapter-page'), 'earthquake.html: missing shared hazard-family page contract');
assert(earthquake.includes('css/living-watershed-primary-chapters.css'), 'earthquake.html: missing shared hazard-family stylesheet');

const header = read('scripts/site-frame/header.html');
assert(header.includes('share-button nav-share-btn'), 'site-frame header: share control is not static');
assert(!header.includes('ko-fi.com'), 'site-frame header: support link has returned to the primary task navigation');
for (const informationalLink of ['>The Approach</a>', '>FAQ</a>', '>Support this work</a>']) {
  assert(!header.includes(informationalLink), `site-frame header: ${informationalLink} has returned to primary task navigation`);
  assert(read('scripts/site-frame/footer.html').includes(informationalLink), `site-frame footer: ${informationalLink} is missing`);
}
assert(read('approach.html').includes('>Reader support</a>'), 'approach.html: contextual support disclosure is missing');
const shareScript = read('js/share.js');
for (const shareContract of ['Add a note', 'Note to accompany the shared link', 'Copy message + link', 'Copy link only', 'navigator.share']) {
  assert(shareScript.includes(shareContract), `share helper: missing ${shareContract}`);
}
for (const retiredShareLabel of ['A note to send along', 'Suggested message', 'Share this page</h2>']) {
  assert(!shareScript.includes(retiredShareLabel), `share helper: retired dialog label remains: ${retiredShareLabel}`);
}
assert(
  shareScript.includes('I thought this Cascadia.me guide might be useful. It offers preparedness information relevant to the Pacific Northwest.'),
  'share helper: canonical suggested message is missing'
);
assert(read('css/site-frame.css').includes('.share-dialog-card'), 'site-frame.css: shared share panel is missing');
assert(read('css/site-frame.css').includes('gap: clamp(1.1rem, 1.6vw, 1.75rem)'), 'site-frame.css: compact desktop navigation rhythm is missing');
assert(read('css/site-frame.css').includes('margin-left: clamp(0.5rem, 1vw, 1rem)'), 'site-frame.css: share-control separation is missing');
assert(read('css/components.css').includes('@media (max-width: 1080px)'), 'components.css: navigation collapse point is not 1080px');
assert(read('css/site-frame.css').includes('@media (max-width: 1080px)'), 'site-frame.css: navigation collapse point is not 1080px');

const retiredFrameOwners = new Map([
  ['css/living-watershed-home.css', '.home-page'],
  ['css/living-watershed-guide.css', '.living-watershed-page'],
  ['css/living-watershed-surfaces.css', '.lw-surface-page'],
  ['css/living-watershed-atlas.css', '.living-watershed-atlas'],
  ['signals/styles.css', '.signals-page']
]);
const retiredFrameRules = [
  '.site-header {', '.site-header.scrolled', '.nav-inner {', '.nav-logo {',
  '.nav-logo span {', '.nav-links {', '.nav-links a {', '.nav-toggle {',
  '.nav-share-btn {', '.share-button {', '.share-button:hover',
  '.floating-share-btn {', '.site-footer {', '.footer-inner {',
  '.footer-brand {', '.footer-brand h3 {', '.footer-col h4 {'
];
for (const [relativePath, owner] of retiredFrameOwners) {
  const source = read(relativePath);
  const lines = source.split('\n');
  for (const rule of retiredFrameRules) {
    assert(!lines.some((line) => line.startsWith(`${owner} ${rule}`)), `${relativePath}: shared-frame shadow rule remains: ${owner} ${rule}`);
  }
}

for (const removed of ['css/effects.css', 'js/conditions.js', 'js/kits.js']) {
  assert(!fs.existsSync(path.join(root, removed)), `${removed}: dead production asset still exists`);
}

const referencedStyles = new Set();
for (const relativePath of pages) {
  const document = read(relativePath);
  for (const match of document.matchAll(/<link[^>]+href="([^"]+\.css)(?:\?[^\"]*)?"/g)) {
    const target = localTarget(relativePath, match[1]);
    if (target) referencedStyles.add(target);
  }
}
for (const relativePath of referencedStyles) {
  const source = read(relativePath).replace(/\/\*[\s\S]*?\*\//g, '');
  const opens = count(source, '{');
  const closes = count(source, '}');
  assert(opens === closes, `${relativePath}: unbalanced CSS braces (${opens} open, ${closes} close)`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Design-system contracts validated across ${pages.length} production pages.`);
}
