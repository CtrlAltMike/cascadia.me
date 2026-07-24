#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSitePage, sitePages } from './site-pages.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const templateDirectory = path.join(scriptDirectory, 'site-frame');
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;

const excludedDirectories = new Set([
  '.git',
  '.github',
  '.playwright-cli',
  'Google',
  'assets',
  'css',
  'docs',
  'experiments',
  'integrations',
  'js',
  'output',
  'poc',
  'public',
  'scripts'
]);

const templates = Object.fromEntries(
  ['head', 'styles', 'header', 'footer', 'scripts'].map((name) => [
    name,
    fs.readFileSync(path.join(templateDirectory, `${name}.html`), 'utf8').trimEnd()
  ])
);

function collectHtmlFiles(directory, relativeDirectory = '') {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) continue;
      files.push(...collectHtmlFiles(
        path.join(directory, entry.name),
        path.join(relativeDirectory, entry.name)
      ));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(relativeDirectory, entry.name));
    }
  }
  return files.sort();
}

function pageValues(relativePath) {
  const page = getSitePage(relativePath);
  const depth = relativePath === '404.html' ? 0 : relativePath.split('/').length - 1;
  const prefix = relativePath === '404.html' ? '/' : '../'.repeat(depth);
  const section = page.navSection;
  const footer = page.footerItem;
  const state = (name) => section === name ? ' class="active" aria-current="page"' : '';
  const current = (name) => footer === name ? ' aria-current="page"' : '';
  return {
    prefix,
    homeHref: relativePath === '404.html' ? '/' : `${prefix}index.html`,
    skipClass: page.skip.className,
    skipHref: page.skip.href,
    skipText: page.skip.text,
    headerAccessory: page.headerAccessory === 'story-progress'
      ? '  <div class="story-reading-progress" aria-hidden="true"><span id="story-progress-bar"></span></div>'
      : '',
    homeState: state('home'),
    guidesState: state('guides'),
    kitState: state('kit'),
    atlasState: state('atlas'),
    signalsState: state('signals'),
    storiesState: state('stories'),
    earthquakeCurrent: current('earthquake'),
    wildfireCurrent: current('wildfire'),
    floodingCurrent: current('flooding'),
    winterCurrent: current('winter'),
    volcanoCurrent: current('volcano'),
    atlasCurrent: current('atlas'),
    signalsCurrent: current('signals'),
    storiesCurrent: current('stories'),
    kitCurrent: current('kit'),
    approachCurrent: current('approach'),
    faqCurrent: current('faq')
  };
}

function render(template, values) {
  return template.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Missing template value: ${key}`);
    return values[key];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceMarkedBlock(document, name, block) {
  const start = `<!-- site-frame:${name}:start -->`;
  const end = `<!-- site-frame:${name}:end -->`;
  if (!document.includes(start)) return null;
  const expression = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  return document.replace(expression, block.trim());
}

function installHead(document, block) {
  const marked = replaceMarkedBlock(document, 'head', block);
  if (marked !== null) return marked;

  const removableSharedLinks = [
    /[ \t]*<link[^>]+fonts\.googleapis\.com[^>]*>\r?\n/g,
    /[ \t]*<link[^>]+fonts\.gstatic\.com[^>]*>\r?\n/g,
    /[ \t]*<link[^>]+rel="icon"[^>]*>\r?\n/g,
    /[ \t]*<link[^>]+css\/base\.css[^>]*>\r?\n/g,
    /[ \t]*<link[^>]+css\/components\.css[^>]*>\r?\n/g
  ];
  let next = document;
  for (const expression of removableSharedLinks) next = next.replace(expression, '');
  const bootstrap = "  <script>document.documentElement.classList.add('js');</script>";
  if (!next.includes(bootstrap)) throw new Error('Missing document bootstrap script');
  return next.replace(bootstrap, `${bootstrap}\n  ${block.trim()}`);
}

function installStyles(document, block) {
  const marked = replaceMarkedBlock(document, 'styles', block);
  if (marked !== null) return marked;
  if (!document.includes('</head>')) throw new Error('Missing closing head element');
  return document.replace('</head>', `  ${block.trim()}\n</head>`);
}

function installHeader(document, block) {
  const marked = replaceMarkedBlock(document, 'header', block);
  if (marked !== null) return marked;
  const expression = /  <a class="[^"]*skip-link"[^>]*>[^<]*<\/a>[\s\S]*?  <\/header>/;
  if (!expression.test(document)) throw new Error('Missing shared skip link and header');
  return document.replace(expression, `  ${block.trim()}`);
}

function installFooter(document, block, relativePath) {
  if (relativePath === '404.html') return document;
  const marked = replaceMarkedBlock(document, 'footer', block);
  if (marked !== null) return marked;
  const expression = /  <footer class="site-footer">[\s\S]*?\n  <\/footer>/;
  if (!expression.test(document)) throw new Error('Missing shared site footer');
  return document.replace(expression, `  ${block.trim()}`);
}

function installScripts(document, block) {
  const marked = replaceMarkedBlock(document, 'scripts', block);
  if (marked !== null) return marked;

  const sharedScript = /[ \t]*<script[^>]+src="(?:\.\.\/|\/)*(?:js\/)?(?:share|nav|animations|feedback)\.js[^"\n]*"[^>]*><\/script>\r?\n?/g;
  const next = document.replace(sharedScript, '');
  if (!next.includes('</body>')) throw new Error('Missing closing body element');
  return next.replace('</body>', `  ${block.trim()}\n</body>`);
}

function installBodyMarker(document) {
  return document.replace(/<body class="([^"]*)">/, (_, classes) => {
    const names = classes.split(/\s+/).filter(Boolean);
    if (!names.includes('site-frame-page')) names.push('site-frame-page');
    return `<body class="${names.join(' ')}">`;
  });
}

function countOccurrences(document, value) {
  return document.split(value).length - 1;
}

function validateGenerated(document, relativePath) {
  const requiredBlocks = ['head', 'styles', 'header', 'scripts'];
  if (relativePath !== '404.html') requiredBlocks.push('footer');
  for (const name of requiredBlocks) {
    for (const boundary of ['start', 'end']) {
      const marker = `<!-- site-frame:${name}:${boundary} -->`;
      if (countOccurrences(document, marker) !== 1) {
        throw new Error(`Expected exactly one ${name} ${boundary} marker`);
      }
    }
  }

  if (!/<body class="[^"]*\bsite-frame-page\b/.test(document)) {
    throw new Error('Missing site-frame-page body marker');
  }
  if (countOccurrences(document, 'data-site-frame="header"') !== 1) {
    throw new Error('Expected exactly one canonical header');
  }
  if (relativePath !== '404.html' && countOccurrences(document, 'data-site-frame="footer"') !== 1) {
    throw new Error('Expected exactly one canonical footer');
  }
  if (countOccurrences(document, 'css/site-frame.css') !== 1) {
    throw new Error('Expected exactly one canonical frame stylesheet');
  }
  if (countOccurrences(document, 'css/design-system.css') !== 1) {
    throw new Error('Expected exactly one canonical design-system stylesheet');
  }
  for (const script of ['share', 'nav', 'animations', 'feedback']) {
    if (countOccurrences(document, `js/${script}.js`) !== 1) {
      throw new Error(`Expected exactly one canonical ${script} script`);
    }
  }
  if (countOccurrences(document, 'newsreader/v26/cY9AfjOCX1hbuyalUrK4397yjIJFJpc.woff2') !== 1) {
    throw new Error('Expected exactly one Newsreader preload');
  }
  if (/family=Inter[^\n]+family=Newsreader[^\n]+display=swap/.test(document)) {
    throw new Error('Legacy combined swap font request remains');
  }
  if (!/family=Newsreader[^\n]+display=block/.test(document)) {
    throw new Error('Newsreader must use the no-flash display strategy');
  }
  if (document.includes('{{')) {
    throw new Error('Unresolved site-frame template value');
  }

  const headerMatch = document.match(/<!-- site-frame:header:start -->([\s\S]*?)<!-- site-frame:header:end -->/);
  const activeCount = headerMatch ? countOccurrences(headerMatch[1], 'aria-current="page"') : 0;
  const expectedActiveCount = getSitePage(relativePath).navSection ? 1 : 0;
  if (activeCount !== expectedActiveCount) {
    throw new Error(`Expected ${expectedActiveCount} active primary navigation item, found ${activeCount}`);
  }
}

function generate(document, relativePath) {
  const values = pageValues(relativePath);
  let next = installHead(document, render(templates.head, values));
  next = installStyles(next, render(templates.styles, values));
  next = installHeader(next, render(templates.header, values));
  next = installFooter(next, render(templates.footer, values), relativePath);
  next = installScripts(next, render(templates.scripts, values));
  next = installBodyMarker(next);
  validateGenerated(next, relativePath);
  return next;
}

const htmlFiles = collectHtmlFiles(projectRoot);
const htmlPathSet = new Set(htmlFiles);
const manifestPathSet = new Set(sitePages.map((page) => page.path));
const missingFromManifest = htmlFiles.filter((relativePath) => !manifestPathSet.has(relativePath));
const missingFromProduction = sitePages.map((page) => page.path).filter((relativePath) => !htmlPathSet.has(relativePath));
if (missingFromManifest.length || missingFromProduction.length) {
  if (missingFromManifest.length) console.error(`Missing from page manifest: ${missingFromManifest.join(', ')}`);
  if (missingFromProduction.length) console.error(`Missing production pages: ${missingFromProduction.join(', ')}`);
  process.exit(1);
}
const changedFiles = [];
const failures = [];

for (const relativePath of htmlFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  const original = fs.readFileSync(absolutePath, 'utf8');
  try {
    const generated = generate(original, relativePath);
    if (generated !== original) {
      changedFiles.push(relativePath);
      if (writeMode) fs.writeFileSync(absolutePath, generated);
    }
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else if (checkMode && changedFiles.length) {
  console.error('Site frame drift detected in:');
  console.error(changedFiles.map((file) => `- ${file}`).join('\n'));
  console.error('Run: node scripts/sync-site-frame.mjs --write');
  process.exitCode = 1;
} else if (writeMode) {
  console.log(`Synchronized site frame across ${htmlFiles.length} pages (${changedFiles.length} updated).`);
} else {
  console.log(`Site frame is synchronized across ${htmlFiles.length} pages.`);
}
