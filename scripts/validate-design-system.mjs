#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '..');
const excludedDirectories = new Set([
  '.git', '.github', '.playwright-cli', 'Google', 'assets', 'css', 'docs',
  'experiments', 'integrations', 'js', 'output', 'poc', 'public', 'scripts'
]);
const failures = [];

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

for (const relativePath of pages) {
  const document = read(relativePath);
  for (const block of ['head', 'styles', 'header', 'scripts']) {
    assert(count(document, `<!-- site-frame:${block}:start -->`) === 1, `${relativePath}: missing canonical ${block} start`);
    assert(count(document, `<!-- site-frame:${block}:end -->`) === 1, `${relativePath}: missing canonical ${block} end`);
  }
  if (relativePath !== '404.html') {
    assert(count(document, '<!-- site-frame:footer:start -->') === 1, `${relativePath}: missing canonical footer`);
  }
  assert(count(document, 'css/design-system.css') === 1, `${relativePath}: design-system.css must appear once`);
  assert(count(document, 'css/site-frame.css') === 1, `${relativePath}: site-frame.css must appear once`);
  assert(count(document, 'css/base.css?v=20260722-design-system') === 1, `${relativePath}: canonical base cache key is missing`);
  assert(count(document, 'css/components.css?v=20260722-design-system') === 1, `${relativePath}: canonical components cache key is missing`);
  assert(count(document, 'css/site-frame.css?v=20260722-design-system') === 1, `${relativePath}: canonical frame cache key is missing`);
  assert(/<body class="[^"]*\bsite-frame-page\b/.test(document), `${relativePath}: missing site-frame-page body class`);
  assert(count(document, 'class="share-button nav-share-btn"') === 1, `${relativePath}: static share control must appear once`);
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
assert(read('signals/index.html').includes('styles.css?v=20260722-design-system'), 'signals/index.html: stale instrument stylesheet cache key');
assert(read('atlas.html').includes('instrument-page'), 'atlas.html: missing shared instrument contract');
assert(read('atlas.html').includes('living-watershed-atlas.css?v=20260722-design-system'), 'atlas.html: stale instrument stylesheet cache key');
assert(read('atlas.html').includes('js/atlas.js?v=20260722-fire-markers'), 'atlas.html: stale Atlas script cache key');
assert(!read('css/living-watershed-atlas.css').includes('.living-watershed-atlas .nav-share-btn'), 'atlas stylesheet: mobile share-control exception remains');

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

const earthquake = read('earthquake.html');
assert(earthquake.includes('chapter--earthquake'), 'earthquake.html: missing shared hazard-family class');
assert(earthquake.includes('primary-chapter-page earthquake-chapter-page'), 'earthquake.html: missing shared hazard-family page contract');
assert(earthquake.includes('css/living-watershed-primary-chapters.css'), 'earthquake.html: missing shared hazard-family stylesheet');

const header = read('scripts/site-frame/header.html');
assert(header.includes('share-button nav-share-btn'), 'site-frame header: share control is not static');
assert(read('css/components.css').includes('@media (max-width: 1080px)'), 'components.css: navigation collapse point is not 1080px');
assert(read('css/site-frame.css').includes('@media (max-width: 1080px)'), 'site-frame.css: navigation collapse point is not 1080px');

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
