// Exercise the production earthquake loader with a controlled clock and map boundary.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../js/atlas.js', import.meta.url), 'utf8');
const start = source.indexOf('  async function ensureEarthquakes()');
const end = source.indexOf('  async function ensureVolcanoes()', start);
assert.ok(start > 0 && end > start);
let now = Date.parse('2026-11-16T18:00:00Z');
let calls = 0;
let enabled = true;
let filter = { key: '30d|2.5', label: 'M2.5+ last 30 days', window: { limit: '2' } };
let status;
const context = vm.createContext({
  Date: { now: () => now }, Number, Array, Map, Set,
  LIVE_REFRESH_MS: 300000, USGS_QUAKES: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
  quakeCache: new Map(), loadedLayers: new Set(), loadedQuakeKey: null,
  getQuakeFilter: () => filter, syncQuakeSummary() {},
  setStatus: (...args) => { status = args; },
  buildUrl: () => 'https://earthquake.usgs.gov/fdsnws/event/1/query', quakeParams: () => ({}),
  toggleForLayer: () => ({ checked: enabled }),
  formatPopupDate: (time) => new Date(time).toISOString(),
  fetchJson: async () => { calls++; return { features: Array.from({ length: 2 }, () => ({ geometry: { coordinates: [-122, 47] } })) }; },
  map: { getSource: () => ({ setData() {} }), getLayer: () => true },
});
vm.runInContext(source.slice(start, end), context);
await context.ensureEarthquakes();
assert.equal(calls, 1);
assert.equal(status[2], 'partial');
assert.match(status[1], /Result limit reached/);
assert.match(status[1], /Checked/);
now += 299999;
await context.ensureEarthquakes();
assert.equal(calls, 1, 'fresh result reused');
now++;
await context.ensureEarthquakes();
assert.equal(calls, 2, 'expired same filter reloaded');
filter = { ...filter, key: '1y|2.5' };
await context.ensureEarthquakes();
assert.equal(calls, 3, 'different filter fetched');
filter = { ...filter, key: '30d|2.5' };
await context.ensureEarthquakes();
assert.equal(calls, 3, 'fresh prior filter reused');
enabled = false;
now += 300000;
status = null;
await context.ensureEarthquakes();
assert.equal(status[2], 'loading', 'disabled layer not rendered after response');
assert.match(source, /toggleForLayer\('earthquakes'\)\?\.checked && !document.hidden/);
console.log('Atlas earthquake freshness regression tests passed');

// Verify uncertainty and bounded coverage remain visible, not just in JSON.
function element(tag) {
  return { tagName: tag.toUpperCase(), children: [], textContent: '',
    append(...nodes) { this.children.push(...nodes); },
    replaceChildren() { this.children = []; } };
}
const list = element('ul');
context.sourceLists = new Map([['live', list]]);
context.SOURCE_LABEL_OVERRIDES = {};
context.document = { createElement: element };
context.sourceStatusLabel = (value) => value;
const renderStart = source.indexOf('  function renderSourceRecords(');
const renderEnd = source.indexOf('  function setLayerControlState(', renderStart);
vm.runInContext(source.slice(renderStart, renderEnd), context);
context.renderSourceRecords('live', [{ id: 'test', label: 'Test source', status: 'available', recordCount: 500, incomplete: true, updatedAt: null }], now);
assert.match(list.children[0].children[1].textContent, /source update time unknown/);
assert.match(list.children[0].children[1].textContent, /bounded results; coverage may be incomplete/);
assert.match(list.children[1].textContent, /Feed checked/);
console.log('Atlas source disclosure regression tests passed');

// The static release must remain compatible with the old Worker contract.
// These fixtures deliberately omit the new optional `incomplete` field. This
// verifies client compatibility, not the deployed Worker's identity or feeds.
const oldSources = [{ id: 'legacy-source', label: 'Legacy source', status: 'available', recordCount: 1, updatedAt: '2026-11-16T17:00:00Z' }];
context.renderSourceRecords('live', oldSources, now);
assert.match(list.children[0].children[1].textContent, /updated 2026-11-16T17:00:00.000Z/);
assert.doesNotMatch(list.children[0].children[1].textContent, /bounded results/);
const geojson = { type: 'FeatureCollection', features: [] };
context.mapFeatureCollection = value => value || geojson;
context.addPerimeterFallbackFirePoints = points => points;
const renderedSources = new Map();
context.setGeoJsonSource = (id, data) => renderedSources.set(id, data);
context.addLiveConditionLayers = () => {};
context.addWindObservationLayers = () => {};
context.evacuationCoverageNode = null;
context.legendAvailability = new Map();
let legacyStart = source.indexOf('  function renderLiveConditions(data)');
let legacyEnd = source.indexOf('  async function ensureWindObservations()', legacyStart);
vm.runInContext(source.slice(legacyStart, legacyEnd), context);
context.renderLiveConditions({ sources: oldSources, checkedAt: now, summary: { fireCount: 1 }, degraded: false });
assert.equal(status[0], 'live');
assert.equal(status[2], 'ready');
assert.equal(renderedSources.size, 5);
context.renderLiveConditions({ sources: [{ ...oldSources[0], incomplete: true }], checkedAt: now, summary: {}, degraded: false });
assert.equal(status[2], 'partial');
assert.match(status[1], /bounded results/);
legacyStart = source.indexOf('  function renderWindObservations(data)');
legacyEnd = source.indexOf('  function addWindObservationLayers()', legacyStart);
vm.runInContext(source.slice(legacyStart, legacyEnd), context);
context.renderWindObservations({ sources: oldSources, checkedAt: now, observations: geojson, summary: { stationCount: 1 }, degraded: false });
assert.equal(status[0], 'wind');
assert.equal(status[2], 'ready');
context.renderWindObservations({ sources: oldSources, checkedAt: now, observations: geojson, summary: {}, degraded: true });
assert.equal(status[2], 'partial');
assert.match(status[1], /coverage is incomplete/);
console.log('Atlas legacy Worker response compatibility tests passed');
