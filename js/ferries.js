/* ============================================================
   Cascadia.me — Ferries Underway
   Lazy-loads MapLibre and draws current Washington State Ferries
   vessel positions from the first-party conditions feed.
   ============================================================ */

(function () {
  const page = document.querySelector('[data-ferries]');
  if (!page) return;

  const MAPLIBRE_VERSION = '5.24.0';
  const MAPLIBRE_JS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
  const MAPLIBRE_CSS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
  const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const FERRIES_ENDPOINT = document.querySelector('meta[name="cascadia-ferries-endpoint"]')?.content;
  const OFFICIAL_VESSELWATCH = 'https://wsdot.com/ferries/vesselwatch/';
  const REFRESH_MS = 30 * 1000;
  const AGE_TICK_MS = 10 * 1000;
  // Core service area: Tacoma to the San Juan Islands.
  const SERVICE_VIEW_BOUNDS = [[-123.15, 47.24], [-122.24, 48.66]];
  const MAX_BOUNDS = [[-124.6, 46.5], [-121.2, 49.5]];

  const ROUTE_NAMES = {
    'sea-bi': 'Seattle – Bainbridge Island',
    'sea-br': 'Seattle – Bremerton',
    'ed-king': 'Edmonds – Kingston',
    'muk-cl': 'Mukilteo – Clinton',
    'f-v-s': 'Fauntleroy – Vashon – Southworth',
    'pt-key': 'Port Townsend – Coupeville',
    'pd-tal': 'Point Defiance – Tahlequah',
    'ana-sj': 'Anacortes – San Juan Islands',
    'ana-sid': 'Anacortes – Sidney B.C.',
  };

  // Approximate dock reference points, not navigation marks.
  const TERMINALS = [
    { name: 'Seattle (Colman Dock)', coordinates: [-122.3396, 47.6023] },
    { name: 'Bainbridge Island', coordinates: [-122.5111, 47.6229] },
    { name: 'Bremerton', coordinates: [-122.6247, 47.5623] },
    { name: 'Edmonds', coordinates: [-122.3829, 47.813] },
    { name: 'Kingston', coordinates: [-122.4966, 47.7964] },
    { name: 'Mukilteo', coordinates: [-122.3, 47.9495] },
    { name: 'Clinton', coordinates: [-122.3513, 47.9748] },
    { name: 'Fauntleroy', coordinates: [-122.3963, 47.5231] },
    { name: 'Vashon Island', coordinates: [-122.4641, 47.5106] },
    { name: 'Southworth', coordinates: [-122.4956, 47.513] },
    { name: 'Point Defiance', coordinates: [-122.5142, 47.3059] },
    { name: 'Tahlequah', coordinates: [-122.507, 47.333] },
    { name: 'Port Townsend', coordinates: [-122.7595, 48.1125] },
    { name: 'Coupeville', coordinates: [-122.6727, 48.1592] },
    { name: 'Anacortes', coordinates: [-122.6793, 48.5071] },
    { name: 'Lopez Island', coordinates: [-122.8834, 48.5709] },
    { name: 'Shaw Island', coordinates: [-122.9296, 48.5838] },
    { name: 'Orcas Island', coordinates: [-122.9431, 48.5974] },
    { name: 'Friday Harbor', coordinates: [-123.0138, 48.5353] },
    { name: 'Sidney B.C.', coordinates: [-123.3968, 48.6431], note: 'International route suspended' },
  ];

  const COLOR_UNDERWAY = '#2f5a43';
  const COLOR_UNDERWAY_STALE = '#7d8f85';
  const COLOR_DOCKED = '#53656b';
  const COLOR_CREAM = '#fbf7ee';
  const COLOR_INK = '#063b5c';

  const mapNode = page.querySelector('#cascadia-ferries-map');
  const panel = page.querySelector('.atlas-panel');
  const placeholder = page.querySelector('[data-ferries-placeholder]');
  const loadButton = page.querySelector('[data-ferries-load]');
  const statusNode = page.querySelector('[data-ferries-status]');
  const summaryNodes = Array.from(page.querySelectorAll('[data-ferries-summary]'));
  const checkedNode = page.querySelector('[data-ferries-checked]');
  const listNode = page.querySelector('[data-ferries-list]');
  const listCountNode = page.querySelector('[data-ferries-record-count]');
  const refreshButton = page.querySelector('[data-ferries-refresh]');
  const resetViewButton = page.querySelector('[data-ferries-reset-view]');
  const sourceListNode = document.querySelector('[data-ferries-source-list]');
  const sourceStateNodes = Array.from(document.querySelectorAll('[data-ferries-source-state]'));
  const sourceIndicators = Array.from(document.querySelectorAll('[data-ferries-source-indicator]'));
  const toggles = Array.from(page.querySelectorAll('[data-ferries-layer]'));

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection?.saveData === true;

  let map = null;
  let initPromise = null;
  let mapReady = false;
  let refreshTimer = null;
  let ageTimer = null;
  let hasVesselData = false;
  let lastFetchedAt = 0;
  let fetchController = null;
  const statuses = { map: 'loading', vessels: 'loading' };

  function setStatus(key, message, state) {
    statuses[key] = state;
    if (message && statusNode) statusNode.textContent = message;
    syncIndicator();
  }

  function syncIndicator() {
    const states = Object.values(statuses);
    let aggregate = 'available';
    let label = 'Live feed connected';
    if (states.includes('error')) {
      aggregate = 'unavailable';
      label = 'Feed unavailable';
    } else if (states.includes('partial')) {
      aggregate = 'partial';
      label = 'Feed degraded';
    } else if (states.includes('loading')) {
      aggregate = 'loading';
      label = 'Checking the feed';
    }
    sourceIndicators.forEach((node) => node.setAttribute('data-state', aggregate));
    sourceStateNodes.forEach((node) => { node.textContent = label; });
  }

  /* ---------- formatting helpers ---------- */

  const pacificClock = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (error) {
      return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  })();

  function formatClock(iso) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return `${pacificClock.format(date)} PT`;
  }

  function formatAge(iso, nowMs) {
    if (!iso) return null;
    const parsed = Date.parse(iso);
    if (!Number.isFinite(parsed)) return null;
    const seconds = Math.max(0, Math.round(((nowMs ?? Date.now()) - parsed) / 1000));
    if (seconds < 20) return 'just now';
    if (seconds < 90) return `${seconds} sec ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 90) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return `${hours} hr ago`;
  }

  function routeName(props) {
    if (props.route && ROUTE_NAMES[props.route]) return ROUTE_NAMES[props.route];
    if (props.departingTerminal && props.arrivingTerminal) {
      return `${props.departingTerminal} – ${props.arrivingTerminal}`;
    }
    return 'Route not reported';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- data ---------- */

  async function fetchFerries() {
    if (!FERRIES_ENDPOINT) throw new Error('The ferries feed is not configured.');
    fetchController?.abort();
    fetchController = new AbortController();
    const timeout = window.setTimeout(() => fetchController.abort(), 12_000);
    try {
      const response = await fetch(FERRIES_ENDPOINT, {
        signal: fetchController.signal,
        headers: { accept: 'application/json' },
      });
      const body = await response.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        throw new Error(`The ferries feed returned ${response.status}.`);
      }
      return body;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function loadVessels(manual) {
    if (manual && refreshButton) refreshButton.disabled = true;
    try {
      const data = await fetchFerries();
      lastFetchedAt = Date.now();
      renderSources(data);

      const features = Array.isArray(data?.vessels?.features) ? data.vessels.features : null;
      if (features) {
        hasVesselData = true;
        if (mapReady) {
          map.getSource('ferries-vessels')?.setData({ type: 'FeatureCollection', features });
        }
        renderVesselList(features, data.checkedAt);
        renderSummary(data);
      }

      const source = Array.isArray(data.sources) ? data.sources[0] : null;
      if (source?.status === 'available' && features) {
        setStatus('vessels', `Tracking ${features.length} in-service ${features.length === 1 ? 'vessel' : 'vessels'}.`, 'available');
      } else if (source?.status === 'not_configured') {
        setStatus('vessels', 'The vessel feed is not connected yet. Use the official VesselWatch link below.', 'partial');
      } else {
        setStatus('vessels', 'The vessel feed did not answer. Recent positions may be missing.', hasVesselData ? 'partial' : 'error');
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      renderSources(null);
      setStatus('vessels', 'The vessel feed is unreachable. Use the official VesselWatch link below.', hasVesselData ? 'partial' : 'error');
    } finally {
      if (manual && refreshButton) refreshButton.disabled = false;
      renderCheckedAge();
    }
  }

  function renderSummary(data) {
    const summary = data?.summary;
    const text = summary && Number.isFinite(summary.vesselCount)
      ? `${summary.underwayCount} underway · ${summary.atDockCount} at the dock`
      : '';
    summaryNodes.forEach((node) => { node.textContent = text; });
  }

  function renderCheckedAge() {
    if (!checkedNode) return;
    if (!lastFetchedAt) {
      checkedNode.textContent = '';
      return;
    }
    const age = formatAge(new Date(lastFetchedAt).toISOString());
    checkedNode.textContent = age ? `Checked ${age}.` : '';
  }

  function renderSources(data) {
    if (!sourceListNode) return;
    sourceListNode.innerHTML = '';
    const sources = Array.isArray(data?.sources) ? data.sources : [];

    if (!sources.length) {
      const item = document.createElement('li');
      item.dataset.state = 'error';
      item.textContent = 'The first-party ferries feed could not be reached.';
      sourceListNode.appendChild(item);
      return;
    }

    sources.forEach((source) => {
      const item = document.createElement('li');
      const presentation = {
        available: { label: 'Available', state: 'ready' },
        unavailable: { label: 'Unavailable', state: 'error' },
        not_configured: { label: 'Not connected yet', state: 'partial' },
      }[source.status] || { label: 'Unknown', state: 'partial' };
      item.dataset.state = presentation.state;
      const updated = source.updatedAt ? ` Latest position ${formatAge(source.updatedAt)}.` : '';
      item.textContent = `${source.label}: ${presentation.label}. ${source.recordCount || 0} vessels reported.${updated}`;
      sourceListNode.appendChild(item);
    });
  }

  function vesselListText(props, nowMs) {
    const parts = [];
    parts.push(props.underway ? 'Underway' : 'At the dock');
    const name = routeName(props);
    const leg = props.underway && props.departingTerminal && props.arrivingTerminal
      ? `${props.departingTerminal} → ${props.arrivingTerminal}`
      : null;
    // Skip the route name when the current leg already spells it out.
    if (!leg || !(name.includes(props.departingTerminal) && name.includes(props.arrivingTerminal))) {
      parts.push(name);
    }
    if (leg) parts.push(leg);
    if (props.underway && Number.isFinite(props.speedKnots)) {
      const heading = props.headingCardinal ? ` ${props.headingCardinal}` : '';
      parts.push(`${props.speedKnots} kn${heading}`);
    }
    const eta = props.underway ? formatClock(props.etaAt) : null;
    if (eta) parts.push(`ETA ${eta}`);
    const departs = !props.underway ? formatClock(props.scheduledDepartureAt) : null;
    if (departs) parts.push(`scheduled ${departs}`);
    const age = formatAge(props.updatedAt, nowMs);
    if (age) parts.push(`position ${age}`);
    return parts.join(' · ');
  }

  function renderVesselList(features, checkedAt) {
    if (!listNode) return;
    listNode.innerHTML = '';
    const nowMs = Date.parse(checkedAt || '') || Date.now();

    if (!features.length) {
      const item = document.createElement('li');
      item.textContent = 'No in-service vessels are reporting positions right now.';
      listNode.appendChild(item);
      if (listCountNode) listCountNode.textContent = 'None reported';
      return;
    }

    features.forEach((feature) => {
      const props = feature.properties || {};
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = props.name || 'WSF vessel';
      item.appendChild(name);
      item.appendChild(document.createTextNode(` — ${vesselListText(props, nowMs)}`));
      listNode.appendChild(item);
    });

    if (listCountNode) {
      listCountNode.textContent = `${features.length} ${features.length === 1 ? 'vessel' : 'vessels'}`;
    }
  }

  /* ---------- map ---------- */

  function loadStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error('The map stylesheet could not load.'));
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    if (window.maplibregl) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error('The map library could not load.'));
      document.head.appendChild(script);
    });
  }

  function themeStyle(style) {
    if (!style || !Array.isArray(style.layers)) return style;

    style.layers.forEach((layer) => {
      const id = String(layer.id || '').toLowerCase();
      layer.paint = layer.paint || {};

      if (layer.type === 'background') {
        layer.paint['background-color'] = '#eee5d3';
      }

      if (layer.type === 'fill') {
        if (/ocean|marine|sea/.test(id)) {
          layer.paint['fill-color'] = '#4a9fac';
          layer.paint['fill-opacity'] = 0.98;
        } else if (/water|lake|river|reservoir/.test(id)) {
          layer.paint['fill-color'] = '#68b9b9';
          layer.paint['fill-opacity'] = 0.96;
        } else if (/ice|glacier|snow/.test(id)) {
          layer.paint['fill-color'] = '#e8eef0';
          layer.paint['fill-opacity'] = 0.94;
        } else if (/sand|beach|dune/.test(id)) {
          layer.paint['fill-color'] = '#dfcda7';
          layer.paint['fill-opacity'] = 0.8;
        } else if (/wetland|marsh/.test(id)) {
          layer.paint['fill-color'] = '#94b2a1';
          layer.paint['fill-opacity'] = 0.78;
        } else if (/park|wood|forest|grass|scrub|national/.test(id)) {
          layer.paint['fill-color'] = '#96aa88';
          layer.paint['fill-opacity'] = 0.82;
        } else if (/building/.test(id)) {
          layer.paint['fill-color'] = '#d0c2aa';
          layer.paint['fill-opacity'] = 0.52;
        } else if (/land|earth/.test(id)) {
          layer.paint['fill-color'] = '#eee5d3';
        }
      }

      if (layer.type === 'fill-extrusion' && /building/.test(id)) {
        layer.layout = layer.layout || {};
        layer.layout.visibility = 'none';
      }

      if (layer.type === 'line') {
        if (/water|river|stream|canal/.test(id)) {
          layer.paint['line-color'] = '#2faab3';
          layer.paint['line-opacity'] = 0.92;
        } else if (/road|bridge|tunnel|path|rail/.test(id)) {
          layer.paint['line-color'] = '#baa98f';
          layer.paint['line-opacity'] = 0.7;
        } else if (/boundary|admin/.test(id)) {
          layer.paint['line-color'] = '#78766a';
          layer.paint['line-opacity'] = 0.5;
        }
      }

      if (layer.type === 'symbol') {
        if (layer.paint['text-color'] !== undefined) {
          layer.paint['text-color'] = COLOR_INK;
        }
        if (layer.paint['text-halo-color'] !== undefined) {
          layer.paint['text-halo-color'] = COLOR_CREAM;
          layer.paint['text-halo-width'] = 1.35;
        }
        if (/poi|airport|transit/.test(id)) {
          layer.layout = layer.layout || {};
          layer.layout.visibility = 'none';
        }
      }
    });

    return style;
  }

  async function getMapStyle() {
    try {
      const response = await fetch(OPENFREEMAP_STYLE, { signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error(`style returned ${response.status}`);
      return themeStyle(await response.json());
    } catch (error) {
      return OPENFREEMAP_STYLE;
    }
  }

  function ensureVesselImage() {
    if (map.hasImage('ferries-vessel')) return;

    // A north-pointing hull outline, rotated per vessel heading.
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#ffffff';
    context.lineWidth = 6;
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(40, 8);
    context.quadraticCurveTo(58, 26, 56, 46);
    context.lineTo(54, 64);
    context.quadraticCurveTo(40, 72, 26, 64);
    context.lineTo(24, 46);
    context.quadraticCurveTo(22, 26, 40, 8);
    context.closePath();
    context.fill();
    context.stroke();
    map.addImage('ferries-vessel', context.getImageData(0, 0, canvas.width, canvas.height), {
      pixelRatio: 2,
      sdf: true,
    });
  }

  function terminalsGeojson() {
    return {
      type: 'FeatureCollection',
      features: TERMINALS.map((terminal) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: terminal.coordinates },
        properties: {
          kind: 'wsf-terminal',
          name: terminal.name,
          note: terminal.note || null,
        },
      })),
    };
  }

  function addFerryLayers() {
    ensureVesselImage();

    map.addSource('ferries-terminals', { type: 'geojson', data: terminalsGeojson() });
    map.addSource('ferries-vessels', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      promoteId: 'id',
    });

    map.addLayer({
      id: 'ferries-terminal-points',
      type: 'circle',
      source: 'ferries-terminals',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.6, 10, 4.2, 13, 5.5],
        'circle-color': COLOR_CREAM,
        'circle-stroke-color': COLOR_INK,
        'circle-stroke-width': 1.4,
        'circle-opacity': 0.95,
      },
    });

    map.addLayer({
      id: 'ferries-terminal-labels',
      type: 'symbol',
      source: 'ferries-terminals',
      minzoom: 8.6,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.15],
        'text-anchor': 'top',
        'text-font': ['Noto Sans Regular'],
      },
      paint: {
        'text-color': COLOR_INK,
        'text-halo-color': COLOR_CREAM,
        'text-halo-width': 1.3,
      },
    });

    map.addLayer({
      id: 'ferries-vessel-halo',
      type: 'circle',
      source: 'ferries-vessels',
      filter: ['==', ['get', 'underway'], true],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 9, 10, 13, 13, 19],
        'circle-color': COLOR_CREAM,
        'circle-opacity': ['case', ['==', ['get', 'stale'], true], 0.35, 0.78],
        'circle-stroke-color': COLOR_UNDERWAY,
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.35,
      },
    });

    map.addLayer({
      id: 'ferries-vessel-docked',
      type: 'circle',
      source: 'ferries-vessels',
      filter: ['==', ['get', 'underway'], false],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 4, 10, 6, 13, 8.5],
        'circle-color': COLOR_DOCKED,
        'circle-opacity': ['case', ['==', ['get', 'stale'], true], 0.45, 0.92],
        'circle-stroke-color': COLOR_CREAM,
        'circle-stroke-width': 1.6,
      },
    });

    map.addLayer({
      id: 'ferries-vessel-icons',
      type: 'symbol',
      source: 'ferries-vessels',
      filter: ['==', ['get', 'underway'], true],
      layout: {
        'icon-image': 'ferries-vessel',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 7, 0.5, 10, 0.72, 13, 1],
        'icon-rotate': ['coalesce', ['get', 'heading'], 0],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': ['case', ['==', ['get', 'stale'], true], COLOR_UNDERWAY_STALE, COLOR_UNDERWAY],
        'icon-halo-color': COLOR_CREAM,
        'icon-halo-width': 1.1,
      },
    });

    map.addLayer({
      id: 'ferries-vessel-labels',
      type: 'symbol',
      source: 'ferries-vessels',
      minzoom: 9.4,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11.5,
        'text-offset': [0, 1.35],
        'text-anchor': 'top',
        'text-font': ['Noto Sans Regular'],
      },
      paint: {
        'text-color': ['case', ['==', ['get', 'underway'], true], COLOR_UNDERWAY, COLOR_DOCKED],
        'text-halo-color': COLOR_CREAM,
        'text-halo-width': 1.35,
      },
    });
  }

  function toggleState(layerKey) {
    const input = toggles.find((toggle) => toggle.dataset.ferriesLayer === layerKey);
    return input ? input.checked : true;
  }

  function syncLayerVisibility() {
    if (!mapReady) return;
    const underwayOn = toggleState('underway');
    const dockedOn = toggleState('docked');
    const terminalsOn = toggleState('terminals');

    const visibility = (on) => (on ? 'visible' : 'none');
    [['ferries-vessel-halo', underwayOn], ['ferries-vessel-icons', underwayOn], ['ferries-vessel-docked', dockedOn], ['ferries-terminal-points', terminalsOn], ['ferries-terminal-labels', terminalsOn]]
      .forEach(([id, on]) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility(on));
      });

    if (map.getLayer('ferries-vessel-labels')) {
      if (underwayOn && dockedOn) {
        map.setFilter('ferries-vessel-labels', null);
        map.setLayoutProperty('ferries-vessel-labels', 'visibility', 'visible');
      } else if (underwayOn || dockedOn) {
        map.setFilter('ferries-vessel-labels', ['==', ['get', 'underway'], underwayOn]);
        map.setLayoutProperty('ferries-vessel-labels', 'visibility', 'visible');
      } else {
        map.setLayoutProperty('ferries-vessel-labels', 'visibility', 'none');
      }
    }
  }

  function vesselPopupHtml(props) {
    const lines = [`<h4>${escapeHtml(props.name || 'WSF vessel')}</h4>`];
    lines.push(`<p class="ferries-popup-route">${escapeHtml(routeName(props))}</p>`);

    if (props.underway) {
      const speed = Number.isFinite(Number(props.speedKnots)) ? `${props.speedKnots} knots` : 'Speed not reported';
      const heading = props.headingCardinal ? ` · heading ${escapeHtml(props.headingCardinal)}` : '';
      lines.push(`<p><strong>${escapeHtml(speed)}</strong>${heading}</p>`);

      const crossing = [];
      if (props.departingTerminal) {
        const left = formatClock(props.leftDockAt);
        crossing.push(`Departed ${escapeHtml(props.departingTerminal)}${left ? ` ${escapeHtml(left)}` : ''}`);
      }
      if (props.arrivingTerminal) {
        const eta = formatClock(props.etaAt);
        crossing.push(`${eta ? `ETA ${escapeHtml(props.arrivingTerminal)} ${escapeHtml(eta)}` : `Heading to ${escapeHtml(props.arrivingTerminal)}`}`);
      }
      if (crossing.length) lines.push(`<p>${crossing.join(' · ')}</p>`);
    } else {
      const dock = props.departingTerminal ? ` at ${escapeHtml(props.departingTerminal)}` : '';
      lines.push(`<p><strong>At the dock</strong>${dock}</p>`);
      const departs = formatClock(props.scheduledDepartureAt);
      if (departs) {
        const toward = props.arrivingTerminal ? ` for ${escapeHtml(props.arrivingTerminal)}` : '';
        lines.push(`<p>Scheduled to depart ${escapeHtml(departs)}${toward}.</p>`);
      }
    }

    const age = formatAge(props.updatedAt);
    if (age) lines.push(`<p>Position reported ${escapeHtml(age)}.</p>`);
    lines.push('<p>Positions and ETAs can lag the water. For awareness, not navigation.</p>');
    lines.push(`<p><a href="${OFFICIAL_VESSELWATCH}" target="_blank" rel="noopener">Official WSF VesselWatch</a></p>`);
    return lines.join('');
  }

  function terminalPopupHtml(props) {
    const note = props.note && props.note !== 'null' ? props.note : null;
    const lines = [`<h4>${escapeHtml(props.name || 'WSF terminal')}</h4>`];
    lines.push('<p>Washington State Ferries terminal · approximate dock reference.</p>');
    if (note) lines.push(`<p>${escapeHtml(note)}.</p>`);
    lines.push('<p><a href="https://wsdot.wa.gov/travel/washington-state-ferries/schedules" target="_blank" rel="noopener">Official sailing schedules</a></p>');
    return lines.join('');
  }

  function wireMapInteractions() {
    const popup = new window.maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '18rem',
    });

    const clickable = ['ferries-vessel-icons', 'ferries-vessel-halo', 'ferries-vessel-docked', 'ferries-terminal-points'];

    map.on('click', (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: clickable.filter((id) => map.getLayer(id)) });
      const feature = features[0];
      if (!feature) return;
      const props = feature.properties || {};
      const html = props.kind === 'wsf-terminal' ? terminalPopupHtml(props) : vesselPopupHtml(normalizeProps(props));
      popup.setLngLat(feature.geometry.coordinates).setHTML(html).addTo(map);
    });

    map.on('mousemove', (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: clickable.filter((id) => map.getLayer(id)) });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
  }

  // queryRenderedFeatures serializes nested values and stringifies booleans/nulls.
  function normalizeProps(props) {
    const parsed = { ...props };
    ['underway', 'atDock', 'stale', 'inService'].forEach((key) => {
      parsed[key] = parsed[key] === true || parsed[key] === 'true';
    });
    ['speedKnots', 'heading'].forEach((key) => {
      const value = Number(parsed[key]);
      parsed[key] = Number.isFinite(value) ? value : null;
    });
    ['etaAt', 'leftDockAt', 'scheduledDepartureAt', 'updatedAt', 'headingCardinal', 'departingTerminal', 'arrivingTerminal', 'route'].forEach((key) => {
      if (parsed[key] === 'null' || parsed[key] === undefined) parsed[key] = null;
    });
    return parsed;
  }

  function fitServiceArea(animate) {
    if (!map) return;
    map.fitBounds(SERVICE_VIEW_BOUNDS, {
      padding: 34,
      duration: animate && !prefersReducedMotion?.matches ? 650 : 0,
    });
  }

  async function initFerriesMap() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        if (loadButton) {
          loadButton.disabled = true;
          loadButton.textContent = 'Loading map';
        }
        setStatus('map', 'Loading the map.', 'loading');

        await Promise.all([loadStylesheet(MAPLIBRE_CSS), loadScript(MAPLIBRE_JS)]);
        const style = await getMapStyle();

        map = new window.maplibregl.Map({
          container: mapNode,
          style,
          bounds: SERVICE_VIEW_BOUNDS,
          fitBoundsOptions: { padding: 34 },
          minZoom: 6,
          maxZoom: 15,
          maxBounds: MAX_BOUNDS,
          cooperativeGestures: true,
          attributionControl: false,
        });

        map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');
        map.addControl(new window.maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('The map took too long to load.')), 15_000);
          map.once('load', () => {
            window.clearTimeout(timeout);
            resolve();
          });
          map.once('error', (event) => {
            window.clearTimeout(timeout);
            reject(new Error(event?.error?.message || 'The map style could not load.'));
          });
        });

        addFerryLayers();
        wireMapInteractions();
        mapReady = true;
        panel?.classList.add('is-loaded');
        if (placeholder) placeholder.hidden = true;
        mapNode.querySelector('.maplibregl-ctrl-attrib')?.removeAttribute('open');
        setStatus('map', 'Map loaded.', 'available');
        syncLayerVisibility();

        await loadVessels();
        scheduleRefresh();
        startAgeTicker();
      } catch (error) {
        mapReady = false;
        if (map) {
          try {
            map.remove();
          } catch (removeError) {
            // A partially constructed map may not support full cleanup.
          }
          map = null;
        }
        if (placeholder) placeholder.hidden = false;
        if (loadButton) {
          loadButton.hidden = false;
          loadButton.disabled = false;
          loadButton.textContent = 'Try loading again';
        }
        setStatus('map', 'The map could not load. Check your connection and try again.', 'error');
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  }

  /* ---------- refresh loop ---------- */

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(async () => {
      if (document.hidden) return;
      await loadVessels();
      scheduleRefresh();
    }, REFRESH_MS);
  }

  function startAgeTicker() {
    window.clearInterval(ageTimer);
    ageTimer = window.setInterval(() => {
      if (!document.hidden) renderCheckedAge();
    }, AGE_TICK_MS);
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden || !mapReady) return;
    if (Date.now() - lastFetchedAt > REFRESH_MS) {
      await loadVessels();
    }
    scheduleRefresh();
  });

  /* ---------- dialogs ---------- */

  function wireDialog(dialog, openButtons, closeButtons) {
    if (!dialog) return;
    let returnFocus = null;

    const closeDialog = () => {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        returnFocus?.focus();
      }
    };

    openButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (dialog.open) return;
        returnFocus = button;
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      });
    });

    closeButtons.forEach((button) => button.addEventListener('click', closeDialog));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', () => {
      returnFocus?.focus();
    });
  }

  /* ---------- wiring ---------- */

  function initControlSheet() {
    const controlSheet = page.querySelector('.atlas-control-sheet');
    if (!controlSheet) return;
    const mobileQuery = window.matchMedia('(max-width: 960px)');
    const applyViewportState = (event) => {
      controlSheet.open = !event.matches;
    };
    applyViewportState(mobileQuery);
    mobileQuery.addEventListener?.('change', applyViewportState);
  }

  initControlSheet();

  loadButton?.addEventListener('click', () => {
    initFerriesMap().catch(() => {});
  });

  refreshButton?.addEventListener('click', () => {
    loadVessels(true).then(scheduleRefresh);
  });

  resetViewButton?.addEventListener('click', () => fitServiceArea(true));

  toggles.forEach((toggle) => toggle.addEventListener('change', syncLayerVisibility));

  wireDialog(
    document.querySelector('[data-ferries-sources]'),
    Array.from(document.querySelectorAll('[data-ferries-sources-open]')),
    Array.from(document.querySelectorAll('[data-ferries-sources-close]'))
  );
  wireDialog(
    document.querySelector('[data-ferries-caveats]'),
    Array.from(document.querySelectorAll('[data-ferries-caveats-open]')),
    Array.from(document.querySelectorAll('[data-ferries-caveats-close]'))
  );

  syncIndicator();

  if (saveData) {
    if (loadButton) loadButton.hidden = false;
    setStatus('map', 'Data saver is on, so the map is waiting for you to load it.', 'loading');
  } else {
    initFerriesMap().catch(() => {});
  }
})();
