/* ============================================================
   Cascadia.me — Regional Hazard Atlas
   Lazy-loads MapLibre, OpenFreeMap, and bounded public data.
   ============================================================ */

(function () {
  const atlas = document.querySelector('[data-atlas]');
  if (!atlas) return;

  const MAPLIBRE_VERSION = '5.24.0';
  const MAPLIBRE_JS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
  const MAPLIBRE_CSS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
  const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const USGS_QUAKES = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
  const NIFC_FIRES = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/InteragencyFirePerimeterHistory_All_Years_View/FeatureServer/0/query';
  const FEMA_FLOODS = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query';
  const CASCADIA_BOUNDS = [[-128.4, 39.7], [-115.6, 52.6]];
  const FLOOD_MIN_ZOOM = 5.1;
  const FLOOD_PAGE_SIZE = 240;
  const QUAKE_WINDOWS = {
    '30d': {
      label: 'last 30 days',
      note: 'Recent searches can include smaller quakes.',
      startDays: 30,
      minMagnitude: 2.5,
      orderby: 'time',
      limit: '1000',
    },
    '1y': {
      label: 'last year',
      note: 'Last-year searches can include smaller quakes.',
      startDays: 365,
      minMagnitude: 2.5,
      orderby: 'time',
      limit: '1500',
    },
    '2000': {
      label: 'since 2000',
      note: 'Since-2000 searches use M3.5+ minimum to avoid capped results.',
      starttime: '2000-01-01',
      minMagnitude: 3.5,
      orderby: 'time',
      limit: '1500',
    },
    '1900': {
      label: 'since 1900',
      note: 'Historical searches use M5.0+ minimum to stay readable.',
      starttime: '1900-01-01',
      minMagnitude: 5,
      orderby: 'magnitude',
      limit: '1000',
    },
  };
  const FIRE_BASE_YEAR = 2000;
  const FIRE_BASE_ACRES = 10000;

  const mapNode = atlas.querySelector('#cascadia-atlas-map');
  const panel = atlas.querySelector('.atlas-panel');
  const statusNode = atlas.querySelector('[data-atlas-status]');
  const loadingNote = atlas.querySelector('[data-atlas-loading-note]');
  const loadButton = atlas.querySelector('[data-atlas-load]');
  const toggles = Array.from(atlas.querySelectorAll('[data-atlas-layer]'));
  const quakeWindowControl = atlas.querySelector('[data-atlas-quake-window]');
  const quakeMagnitudeControl = atlas.querySelector('[data-atlas-quake-min-mag]');
  const quakeMagnitudeOutput = atlas.querySelector('[data-atlas-quake-mag-output]');
  const quakeFilterNote = atlas.querySelector('[data-atlas-quake-note]');
  const quakeSummary = atlas.querySelector('[data-atlas-quake-summary]');
  const fireSummary = atlas.querySelector('[data-atlas-fire-summary]');
  const fireYearControl = atlas.querySelector('[data-atlas-fire-year]');
  const fireYearOutput = atlas.querySelector('[data-atlas-fire-year-output]');
  const fireAcresControl = atlas.querySelector('[data-atlas-fire-acres]');
  const statusItems = new Map(
    Array.from(atlas.querySelectorAll('[data-atlas-status-key]')).map((item) => [item.dataset.atlasStatusKey, item])
  );
  const statusParts = new Map();
  const loadingStatuses = new Set();
  const loadedLayers = new Set();

  let map = null;
  let initPromise = null;
  let mapLoadPromise = null;
  const quakeCache = new Map();
  let loadedQuakeKey = null;
  let fireCollection = null;
  let loadedFireKey = null;
  let floodAbort = null;
  let lastFloodKey = '';
  let moveTimer = null;

  function setStatus(key, message, state) {
    statusParts.set(key, message);
    if (statusItems.has(key)) {
      statusItems.get(key).textContent = message;
    }
    statusNode.textContent = message;
    if (state === 'loading' || message.startsWith('Loading ')) {
      loadingStatuses.add(key);
    } else {
      loadingStatuses.delete(key);
    }
    syncLoadingState();
    if (state) {
      statusNode.dataset.state = state;
    } else {
      delete statusNode.dataset.state;
    }
  }

  function syncLoadingState() {
    if (!loadingNote) return;
    loadingNote.hidden = loadingStatuses.size === 0;
  }

  function setLayerControlState(disabled) {
    toggles.forEach((input) => {
      input.disabled = disabled;
    });
  }

  function loadStylesheet(href) {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Could not load ${href}`));
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    if (window.maplibregl) return Promise.resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.appendChild(script);
    });
  }

  function buildUrl(base, params) {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  function recentDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  function formatMagnitude(value) {
    return `M${Number(value).toFixed(1)}+`;
  }

  function formatAcres(value) {
    return Number(value).toLocaleString();
  }

  function updateOutput(output, value) {
    if (!output) return;
    output.textContent = value;
    output.value = value;
    output.setAttribute('aria-label', value);
  }

  function getQuakeWindow() {
    const key = quakeWindowControl ? quakeWindowControl.value : '1900';
    const windowConfig = QUAKE_WINDOWS[key] || QUAKE_WINDOWS['1900'];
    return { id: key in QUAKE_WINDOWS ? key : '1900', ...windowConfig };
  }

  function getQuakeFilter() {
    const windowConfig = getQuakeWindow();
    const rawMagnitude = quakeMagnitudeControl ? Number(quakeMagnitudeControl.value) : windowConfig.minMagnitude;
    const magnitude = Math.max(windowConfig.minMagnitude, Number.isFinite(rawMagnitude) ? rawMagnitude : windowConfig.minMagnitude);

    if (quakeMagnitudeControl) {
      quakeMagnitudeControl.min = String(windowConfig.minMagnitude);
      quakeMagnitudeControl.value = String(magnitude);
    }

    return {
      key: `${windowConfig.id}|${magnitude.toFixed(1)}`,
      label: `${formatMagnitude(magnitude)} ${windowConfig.label}`,
      magnitude,
      window: windowConfig,
    };
  }

  function quakeParams(filter) {
    const params = {
      minmagnitude: String(filter.magnitude),
      orderby: filter.window.orderby,
      limit: filter.window.limit,
    };
    if (filter.window.startDays) {
      params.starttime = recentDate(filter.window.startDays);
    } else if (filter.window.starttime) {
      params.starttime = filter.window.starttime;
    }
    return params;
  }

  function syncQuakeSummary() {
    const filter = getQuakeFilter();
    if (quakeSummary) {
      quakeSummary.textContent = filter.label;
    }
    updateOutput(quakeMagnitudeOutput, formatMagnitude(filter.magnitude));
    if (quakeFilterNote) {
      quakeFilterNote.textContent = filter.window.note;
    }
  }

  function getFireFilter() {
    const rawYear = fireYearControl ? Number(fireYearControl.value) : FIRE_BASE_YEAR;
    const year = Math.max(FIRE_BASE_YEAR, Number.isFinite(rawYear) ? Math.round(rawYear) : FIRE_BASE_YEAR);
    const rawAcres = fireAcresControl ? Number(fireAcresControl.value) : FIRE_BASE_ACRES;
    const acres = Math.max(FIRE_BASE_ACRES, Number.isFinite(rawAcres) ? rawAcres : FIRE_BASE_ACRES);

    return {
      key: `${year}|${acres}`,
      year,
      acres,
      label: `${formatAcres(acres)}+ acres since ${year}`,
    };
  }

  function syncFireSummary() {
    const filter = getFireFilter();
    updateOutput(fireYearOutput, String(filter.year));
    if (fireSummary) {
      fireSummary.textContent = filter.label;
    }
  }

  function themeStyle(style) {
    if (!style || !Array.isArray(style.layers)) return style;

    style.layers.forEach((layer) => {
      const id = String(layer.id || '').toLowerCase();
      layer.paint = layer.paint || {};

      if (layer.type === 'background') {
        layer.paint['background-color'] = '#e7dfcf';
      }

      if (layer.type === 'fill') {
        if (/water|ocean|lake|river|reservoir/.test(id)) {
          layer.paint['fill-color'] = '#7ea4ad';
          layer.paint['fill-opacity'] = 0.94;
        } else if (/park|wood|forest|landcover|grass|scrub|national/.test(id)) {
          layer.paint['fill-color'] = '#b9c4a8';
          layer.paint['fill-opacity'] = 0.74;
        } else if (/building/.test(id)) {
          layer.paint['fill-color'] = '#d8ccb7';
          layer.paint['fill-opacity'] = 0.58;
        } else if (/land|earth/.test(id)) {
          layer.paint['fill-color'] = '#e7dfcf';
        }
      }

      if (layer.type === 'line') {
        if (/water|river|stream|canal/.test(id)) {
          layer.paint['line-color'] = '#4f8aa0';
          layer.paint['line-opacity'] = 0.88;
        } else if (/road|bridge|tunnel|path|rail/.test(id)) {
          layer.paint['line-color'] = '#b9ac93';
          layer.paint['line-opacity'] = 0.76;
        } else if (/boundary|admin/.test(id)) {
          layer.paint['line-color'] = '#8d816c';
          layer.paint['line-opacity'] = 0.58;
        }
      }

      if (layer.type === 'symbol') {
        if (layer.paint['text-color'] !== undefined) {
          layer.paint['text-color'] = '#2f2b25';
        }
        if (layer.paint['text-halo-color'] !== undefined) {
          layer.paint['text-halo-color'] = '#efe7d7';
          layer.paint['text-halo-width'] = 1.15;
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
      const style = await fetchJson(OPENFREEMAP_STYLE);
      return themeStyle(style);
    } catch (error) {
      return OPENFREEMAP_STYLE;
    }
  }

  function atlasReferenceGeojson() {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'region-fill', name: 'Approximate Cascadian bioregion focus' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-124.7, 40.1],
              [-126.4, 43.3],
              [-128.0, 49.4],
              [-124.7, 51.9],
              [-120.0, 51.4],
              [-116.5, 49.2],
              [-116.6, 44.4],
              [-119.2, 40.0],
              [-124.7, 40.1],
            ]],
          },
        },
        {
          type: 'Feature',
          properties: { kind: 'region-line', name: 'Approximate Cascadian bioregion focus' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-124.7, 51.9],
              [-120.0, 51.4],
              [-116.5, 49.2],
              [-116.6, 44.4],
              [-119.2, 40.0],
              [-124.7, 40.1],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { kind: 'subduction', name: 'Cascadia Subduction Zone, approximate offshore trace' },
          geometry: {
            type: 'LineString',
            coordinates: [
              [-128.0, 50.2],
              [-127.0, 48.6],
              [-125.7, 46.5],
              [-124.7, 44.3],
              [-124.2, 42.3],
              [-124.0, 40.4],
            ],
          },
        },
      ],
    };
  }

  function floodCorridorGeojson() {
    const corridors = [
      {
        name: 'Skagit River corridor',
        coordinates: [[-122.57, 48.45], [-122.34, 48.42], [-122.17, 48.45], [-121.95, 48.52], [-121.74, 48.54], [-121.47, 48.54], [-121.2, 48.53]],
      },
      {
        name: 'Stillaguamish River corridor',
        coordinates: [[-122.34, 48.17], [-122.17, 48.18], [-121.95, 48.2], [-121.74, 48.25], [-121.6, 48.27]],
      },
      {
        name: 'Nooksack River corridor',
        coordinates: [[-122.72, 48.84], [-122.54, 48.86], [-122.35, 48.86], [-122.15, 48.88], [-121.93, 48.9], [-121.72, 48.88]],
      },
      {
        name: 'Snohomish and Skykomish corridor',
        coordinates: [[-122.25, 47.96], [-122.08, 47.98], [-121.9, 47.9], [-121.73, 47.86], [-121.52, 47.85]],
      },
      {
        name: 'Chehalis River corridor',
        coordinates: [[-124.0, 46.95], [-123.72, 46.9], [-123.42, 46.78], [-123.1, 46.72], [-122.86, 46.68]],
      },
      {
        name: 'Cowlitz River corridor',
        coordinates: [[-123.06, 46.14], [-122.82, 46.16], [-122.58, 46.22], [-122.34, 46.31], [-122.08, 46.44]],
      },
      {
        name: 'Lower Columbia corridor',
        coordinates: [[-124.05, 46.25], [-123.68, 46.22], [-123.28, 46.18], [-122.86, 45.9], [-122.53, 45.56], [-121.95, 45.62], [-121.43, 45.68]],
      },
      {
        name: 'Willamette Valley corridor',
        coordinates: [[-123.22, 44.03], [-123.1, 44.4], [-122.93, 44.68], [-122.83, 45.02], [-122.72, 45.32], [-122.67, 45.52]],
      },
      {
        name: 'Fraser River corridor',
        coordinates: [[-123.2, 49.12], [-122.9, 49.12], [-122.58, 49.15], [-122.2, 49.17], [-121.82, 49.18], [-121.42, 49.19]],
      },
    ];

    return {
      type: 'FeatureCollection',
      features: corridors.map((corridor) => ({
        type: 'Feature',
        properties: { name: corridor.name, type: 'Flood-prone river corridor' },
        geometry: { type: 'LineString', coordinates: corridor.coordinates },
      })),
    };
  }

  function addReferenceLayers() {
    if (map.getSource('atlas-reference')) return;

    map.addSource('atlas-reference', {
      type: 'geojson',
      data: atlasReferenceGeojson(),
    });

    map.addLayer({
      id: 'atlas-region-fill',
      type: 'fill',
      source: 'atlas-reference',
      filter: ['==', ['get', 'kind'], 'region-fill'],
      paint: {
        'fill-color': '#4a7a5e',
        'fill-opacity': 0.04,
      },
    });

    map.addLayer({
      id: 'atlas-region-line',
      type: 'line',
      source: 'atlas-reference',
      filter: ['==', ['get', 'kind'], 'region-line'],
      paint: {
        'line-color': '#756f5c',
        'line-opacity': 0.56,
        'line-width': 1.4,
        'line-dasharray': [2, 2],
      },
    });

    map.addLayer({
      id: 'atlas-subduction-line',
      type: 'line',
      source: 'atlas-reference',
      filter: ['==', ['get', 'kind'], 'subduction'],
      paint: {
        'line-color': '#c66b2e',
        'line-opacity': 0.68,
        'line-width': 1.8,
        'line-dasharray': [1, 1.25],
      },
    });
  }

  function ensureFloodCorridors() {
    if (map.getSource('atlas-flood-corridors')) return;

    map.addSource('atlas-flood-corridors', {
      type: 'geojson',
      data: floodCorridorGeojson(),
    });

    map.addLayer({
      id: 'atlas-flood-corridor-glow',
      type: 'line',
      source: 'atlas-flood-corridors',
      paint: {
        'line-color': '#3f7890',
        'line-opacity': 0.18,
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 7, 7, 16, 10, 26],
        'line-blur': 5,
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    });

    map.addLayer({
      id: 'atlas-flood-corridor-line',
      type: 'line',
      source: 'atlas-flood-corridors',
      paint: {
        'line-color': '#2f667c',
        'line-opacity': 0.56,
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.6, 7, 3.4, 10, 6],
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
    });
  }

  function fitCascadia() {
    const isSmall = window.matchMedia('(max-width: 768px)').matches;
    map.fitBounds(CASCADIA_BOUNDS, {
      padding: isSmall ? 22 : { top: 44, right: 44, bottom: 34, left: 44 },
      duration: 0,
    });
  }

  async function initAtlas() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        setLayerControlState(true);
        if (loadButton) {
          loadButton.disabled = true;
          loadButton.textContent = 'Loading map';
        }
        setStatus('map', 'Loading atlas map.', '');

        await Promise.all([
          loadStylesheet(MAPLIBRE_CSS),
          loadScript(MAPLIBRE_JS),
        ]);

        const style = await getMapStyle();

        map = new window.maplibregl.Map({
          container: mapNode,
          style,
          center: [-121.8, 46.0],
          zoom: 4.6,
          minZoom: 3.2,
          maxZoom: 12,
          cooperativeGestures: true,
          attributionControl: false,
        });

        map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: false }), 'bottom-right');
        map.addControl(new window.maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        mapLoadPromise = new Promise((resolve) => {
          map.once('load', resolve);
        });

        await mapLoadPromise;
        panel.classList.add('is-loaded');
        if (loadButton) loadButton.hidden = true;
        setLayerControlState(false);

        addReferenceLayers();
        fitCascadia();
        wireMapInteractions();
        setStatus('map', 'Map loaded.', 'ready');

        await syncCheckedLayers();
      } catch (error) {
        setLayerControlState(false);
        if (loadButton) {
          loadButton.disabled = false;
          loadButton.textContent = 'Try loading again';
        }
        setStatus('map', 'The atlas could not load. Check your connection and try again.', 'error');
        throw error;
      }
    })();

    return initPromise;
  }

  async function syncCheckedLayers() {
    for (const toggle of toggles) {
      const layer = toggle.dataset.atlasLayer;
      if (toggle.checked) {
        await loadLayerSafely(layer);
        setLayerVisibility(layer, true);
      } else {
        setLayerVisibility(layer, false);
      }
    }
  }

  function setLayerVisibility(layer, visible) {
    const visibility = visible ? 'visible' : 'none';
    const ids = {
      earthquakes: ['atlas-quake-rings', 'atlas-quake-points'],
      fires: ['atlas-fire-fill', 'atlas-fire-line'],
      floods: ['atlas-flood-corridor-glow', 'atlas-flood-corridor-line', 'atlas-flood-fill', 'atlas-flood-line-halo', 'atlas-flood-line'],
    }[layer] || [];

    ids.forEach((id) => {
      if (map && map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visibility);
      }
    });
  }

  async function ensureLayer(layer) {
    if (!map) await initAtlas();

    if (layer === 'earthquakes') return ensureEarthquakes();
    if (layer === 'fires') return ensureFires();
    if (layer === 'floods') return ensureFloods();

    return Promise.resolve();
  }

  async function loadLayerSafely(layer) {
    try {
      await ensureLayer(layer);
    } catch (error) {
      const labels = {
        earthquakes: 'Earthquakes',
        fires: 'Wildfires',
        floods: 'Flood zones',
      };
      setStatus(layer, `${labels[layer] || 'Layer'} could not load.`, 'error');
    }
  }

  async function ensureEarthquakes() {
    const filter = getQuakeFilter();
    if (loadedQuakeKey === filter.key && loadedLayers.has('earthquakes')) return;

    syncQuakeSummary();
    setStatus('earthquakes', `Loading USGS ${filter.label}.`, '');
    const url = buildUrl(USGS_QUAKES, {
      format: 'geojson',
      minlatitude: '39',
      maxlatitude: '53',
      minlongitude: '-132',
      maxlongitude: '-116',
      ...quakeParams(filter),
    });

    const data = quakeCache.has(filter.key) ? quakeCache.get(filter.key) : await fetchJson(url);
    if (!quakeCache.has(filter.key)) {
      quakeCache.set(filter.key, data);
    }
    data.features = (data.features || []).filter((feature) => {
      const coords = feature.geometry && feature.geometry.coordinates;
      return Array.isArray(coords) && Number.isFinite(coords[0]) && Number.isFinite(coords[1]);
    });

    if (map.getSource('atlas-earthquakes')) {
      map.getSource('atlas-earthquakes').setData(data);
    } else {
      map.addSource('atlas-earthquakes', {
        type: 'geojson',
        data,
      });
    }

    if (!map.getLayer('atlas-quake-rings')) {
      map.addLayer({
        id: 'atlas-quake-rings',
        type: 'circle',
        source: 'atlas-earthquakes',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['to-number', ['get', 'mag']], 2.5, 3, 4, 6, 5, 10, 6, 16, 7.6, 30],
          'circle-color': 'rgba(61, 58, 54, 0)',
          'circle-stroke-color': '#c66b2e',
          'circle-stroke-opacity': 0.42,
          'circle-stroke-width': 1.5,
        },
      });
    }

    if (!map.getLayer('atlas-quake-points')) {
      map.addLayer({
        id: 'atlas-quake-points',
        type: 'circle',
        source: 'atlas-earthquakes',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['to-number', ['get', 'mag']], 2.5, 2, 4, 3.5, 5, 5, 6, 8, 7.6, 12],
          'circle-color': '#c66b2e',
          'circle-opacity': 0.86,
          'circle-stroke-color': '#f5e6cc',
          'circle-stroke-width': 1.1,
        },
      });
    }

    loadedQuakeKey = filter.key;
    loadedLayers.add('earthquakes');
    setStatus('earthquakes', `Earthquakes: ${data.features.length} USGS ${filter.label}.`, 'ready');
  }

  async function ensureFires() {
    const filter = getFireFilter();
    syncFireSummary();

    if (!fireCollection) {
      setStatus('fires', `Loading NIFC ${formatAcres(FIRE_BASE_ACRES)}+ acre perimeters since ${FIRE_BASE_YEAR}.`, '');
      const url = buildUrl(NIFC_FIRES, {
        f: 'geojson',
        where: `FIRE_YEAR >= ${FIRE_BASE_YEAR} AND GIS_ACRES >= ${FIRE_BASE_ACRES}`,
        geometry: '-125,40,-116,53',
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        outSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: 'INCIDENT,FIRE_YEAR,GIS_ACRES,AGENCY',
        returnGeometry: 'true',
        orderByFields: 'GIS_ACRES DESC',
        resultRecordCount: '1000',
        maxAllowableOffset: '0.04',
        geometryPrecision: '4',
      });

      const data = await fetchJson(url);
      fireCollection = {
        type: 'FeatureCollection',
        properties: data.properties || {},
        features: dedupeFireFeatures(data.features || []),
      };
    }

    if (loadedFireKey === filter.key && loadedLayers.has('fires')) return;

    const data = {
      type: 'FeatureCollection',
      properties: fireCollection.properties || {},
      features: filterFireFeatures(fireCollection.features, filter),
    };

    if (map.getSource('atlas-fires')) {
      map.getSource('atlas-fires').setData(data);
    } else {
      map.addSource('atlas-fires', {
        type: 'geojson',
        data,
      });
    }

    if (!map.getLayer('atlas-fire-fill')) {
      map.addLayer({
        id: 'atlas-fire-fill',
        type: 'fill',
        source: 'atlas-fires',
        paint: {
          'fill-color': '#b85c32',
          'fill-opacity': 0.32,
        },
      });
    }

    if (!map.getLayer('atlas-fire-line')) {
      map.addLayer({
        id: 'atlas-fire-line',
        type: 'line',
        source: 'atlas-fires',
        paint: {
          'line-color': '#9f4b2c',
          'line-opacity': 0.82,
          'line-width': 1.2,
        },
      });
    }

    loadedFireKey = filter.key;
    loadedLayers.add('fires');
    const capped = data.properties && data.properties.exceededTransferLimit ? ' capped' : '';
    setStatus('fires', `Wildfires: ${data.features.length}${capped} NIFC ${formatAcres(filter.acres)}+ acre perimeters since ${filter.year}.`, 'ready');
  }

  function filterFireFeatures(features, filter) {
    return features.filter((feature) => {
      const props = feature.properties || {};
      const year = Number(props.FIRE_YEAR);
      const acres = Number(props.GIS_ACRES);
      return Number.isFinite(year)
        && Number.isFinite(acres)
        && year >= filter.year
        && acres >= filter.acres;
    });
  }

  function dedupeFireFeatures(features) {
    const seen = new Set();
    return features.filter((feature) => {
      if (!feature.geometry) return false;
      const props = feature.properties || {};
      const incident = String(props.INCIDENT || 'unknown').trim().toLowerCase();
      const year = String(props.FIRE_YEAR || '').trim();
      const key = `${incident}-${year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function ensureFloods() {
    if (!map) return;

    ensureFloodCorridors();

    const zoom = map.getZoom();
    if (zoom < FLOOD_MIN_ZOOM) {
      setEmptyFloodSource();
      setStatus('floods', 'Floods: river corridors shown; FEMA zones load as you zoom in.', '');
      return;
    }

    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest().toFixed(4),
      bounds.getSouth().toFixed(4),
      bounds.getEast().toFixed(4),
      bounds.getNorth().toFixed(4),
    ].join(',');
    const floodPlan = floodFetchPlan(zoom);
    const floodKey = `${bbox}|${Math.round(zoom * 10)}|${floodPlan.maxPages}|${floodPlan.maxAllowableOffset}`;
    if (floodKey === lastFloodKey && loadedLayers.has('floods')) return;
    lastFloodKey = floodKey;

    if (floodAbort) floodAbort.abort();
    floodAbort = new AbortController();

    setStatus('floods', 'Loading FEMA zones for this view.', '');

    try {
      const data = await fetchFloodPages(bbox, floodPlan, floodAbort.signal);
      upsertFloodSource(data);
      loadedLayers.add('floods');
      const capped = data.properties && data.properties.exceededTransferLimit ? ' capped' : '';
      setStatus('floods', `Floods: ${data.features.length}${capped} FEMA areas in view, plus river corridors.`, 'ready');
    } catch (error) {
      if (error.name === 'AbortError') return;
      setStatus('floods', 'FEMA flood zones could not load.', 'error');
    }
  }

  function floodFetchPlan(zoom) {
    if (zoom >= 7.4) {
      return { maxPages: 5, maxAllowableOffset: '0.003', geometryPrecision: '5' };
    }

    if (zoom >= 6.2) {
      return { maxPages: 3, maxAllowableOffset: '0.008', geometryPrecision: '5' };
    }

    return { maxPages: 1, maxAllowableOffset: '0.02', geometryPrecision: '4' };
  }

  async function fetchFloodPages(bbox, plan, signal) {
    const features = [];
    let properties = {};
    let stoppedOnCap = false;

    for (let page = 0; page < plan.maxPages; page += 1) {
      const url = buildUrl(FEMA_FLOODS, {
        f: 'geojson',
        where: "SFHA_TF = 'T'",
        geometry: bbox,
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        outSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: 'FLD_ZONE,ZONE_SUBTY,SFHA_TF',
        returnGeometry: 'true',
        resultOffset: String(page * FLOOD_PAGE_SIZE),
        resultRecordCount: String(FLOOD_PAGE_SIZE),
        maxAllowableOffset: plan.maxAllowableOffset,
        geometryPrecision: plan.geometryPrecision,
      });

      const data = await fetchJson(url, { signal });
      const pageFeatures = (data.features || []).filter((feature) => feature.geometry);
      features.push(...pageFeatures);
      properties = { ...properties, ...(data.properties || {}) };
      stoppedOnCap = Boolean(data.properties && data.properties.exceededTransferLimit);

      if (pageFeatures.length < FLOOD_PAGE_SIZE || !stoppedOnCap) {
        stoppedOnCap = false;
        break;
      }
    }

    return {
      type: 'FeatureCollection',
      properties: { ...properties, exceededTransferLimit: stoppedOnCap },
      features,
    };
  }

  function emptyFeatureCollection() {
    return { type: 'FeatureCollection', features: [] };
  }

  function setEmptyFloodSource() {
    if (map.getSource('atlas-floods')) {
      map.getSource('atlas-floods').setData(emptyFeatureCollection());
    } else {
      upsertFloodSource(emptyFeatureCollection());
    }
    loadedLayers.delete('floods');
  }

  function upsertFloodSource(data) {
    if (map.getSource('atlas-floods')) {
      map.getSource('atlas-floods').setData(data);
      return;
    }

    map.addSource('atlas-floods', {
      type: 'geojson',
      data,
    });

    map.addLayer({
      id: 'atlas-flood-fill',
      type: 'fill',
      source: 'atlas-floods',
      paint: {
        'fill-color': '#2f6f88',
        'fill-opacity': 0.42,
      },
    });

    map.addLayer({
      id: 'atlas-flood-line-halo',
      type: 'line',
      source: 'atlas-floods',
      paint: {
        'line-color': '#f4ead8',
        'line-opacity': 0.82,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 2.4, 8, 3.6, 11, 5],
      },
    });

    map.addLayer({
      id: 'atlas-flood-line',
      type: 'line',
      source: 'atlas-floods',
      paint: {
        'line-color': '#173f51',
        'line-opacity': 0.92,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1.1, 8, 1.7, 11, 2.4],
      },
    });
  }

  function wireMapInteractions() {
    const popup = new window.maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '18rem',
    });

    map.on('click', (event) => {
      const feature = firstAtlasFeature(event.point);
      if (!feature) return;

      const html = renderFeaturePopup(feature);
      if (!html) return;

      popup
        .setLngLat(event.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    map.on('mousemove', (event) => {
      map.getCanvas().style.cursor = firstAtlasFeature(event.point) ? 'pointer' : '';
    });

    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('moveend', () => {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        const floodToggle = toggles.find((input) => input.dataset.atlasLayer === 'floods');
        if (floodToggle && floodToggle.checked) {
          ensureFloods();
        }
      }, 240);
    });
  }

  function firstAtlasFeature(point) {
    const layers = ['atlas-quake-points', 'atlas-fire-fill', 'atlas-flood-fill', 'atlas-flood-corridor-line']
      .filter((id) => map.getLayer(id));
    if (!layers.length) return null;
    return map.queryRenderedFeatures(point, { layers })[0] || null;
  }

  function renderFeaturePopup(feature) {
    if (!feature || !feature.layer) return '';
    if (feature.layer.id === 'atlas-quake-points') return quakePopup(feature.properties || {});
    if (feature.layer.id === 'atlas-fire-fill') return firePopup(feature.properties || {});
    if (feature.layer.id === 'atlas-flood-fill') return floodPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-flood-corridor-line') return floodCorridorPopup(feature.properties || {});
    return '';
  }

  function quakePopup(props) {
    const mag = Number(props.mag);
    const depth = Array.isArray(props.coordinates) ? props.coordinates[2] : null;
    const time = props.time ? new Date(Number(props.time)).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) : 'Date unavailable';

    return [
      `<h4>${escapeHtml(props.title || 'Earthquake')}</h4>`,
      `<p>${Number.isFinite(mag) ? `Magnitude ${mag.toFixed(1)}` : 'Magnitude unavailable'} · ${escapeHtml(time)}</p>`,
      depth ? `<p>Depth ${Number(depth).toFixed(1)} km</p>` : '',
    ].join('');
  }

  function firePopup(props) {
    const acres = Number(props.GIS_ACRES);
    return [
      `<h4>${escapeHtml(props.INCIDENT || 'Wildfire perimeter')}</h4>`,
      `<p>${escapeHtml(props.FIRE_YEAR || 'Year unavailable')} · ${Number.isFinite(acres) ? `${Math.round(acres).toLocaleString()} acres` : 'Acreage unavailable'}</p>`,
      props.AGENCY ? `<p>${escapeHtml(props.AGENCY)}</p>` : '',
    ].join('');
  }

  function floodPopup(props) {
    const zone = props.FLD_ZONE ? `Zone ${props.FLD_ZONE}` : 'Flood hazard zone';
    return [
      `<h4>${escapeHtml(zone)}</h4>`,
      `<p>${escapeHtml(props.ZONE_SUBTY || 'FEMA Special Flood Hazard Area')}</p>`,
    ].join('');
  }

  function floodCorridorPopup(props) {
    return [
      `<h4>${escapeHtml(props.name || 'Flood-prone river corridor')}</h4>`,
      '<p>Flood-prone river corridor. This is a planning cue, not live inundation depth.</p>',
    ].join('');
  }

  function initIntroModal() {
    const dialog = document.querySelector('[data-atlas-intro]');
    if (!dialog) return;

    const closeButton = dialog.querySelector('[data-atlas-intro-close]');
    const closeDialog = () => {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    };

    closeButton?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });

    window.setTimeout(() => {
      if (dialog.open) return;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }, 120);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function observeAtlas() {
    if (!('IntersectionObserver' in window)) {
      initAtlas();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          initAtlas();
        }
      });
    }, { rootMargin: '280px 0px' });

    observer.observe(atlas);
  }

  if (loadButton) {
    loadButton.addEventListener('click', () => {
      initAtlas();
    });
  }

  toggles.forEach((input) => {
    input.addEventListener('change', async () => {
      await initAtlas();
      const layer = input.dataset.atlasLayer;
      if (input.checked) {
        await loadLayerSafely(layer);
        setLayerVisibility(layer, true);
      } else {
        setLayerVisibility(layer, false);
      }
    });
  });

  async function applyFilteredLayer(layer) {
    if (layer === 'earthquakes') syncQuakeSummary();
    if (layer === 'fires') syncFireSummary();

    const toggle = toggles.find((input) => input.dataset.atlasLayer === layer);
    if (!toggle || !toggle.checked) return;

    await initAtlas();
    await loadLayerSafely(layer);
    setLayerVisibility(layer, true);
  }

  if (fireYearControl) {
    const currentYear = new Date().getFullYear();
    fireYearControl.max = String(Math.max(currentYear, FIRE_BASE_YEAR));
  }

  quakeWindowControl?.addEventListener('change', () => {
    applyFilteredLayer('earthquakes');
  });

  quakeMagnitudeControl?.addEventListener('input', () => {
    syncQuakeSummary();
  });

  quakeMagnitudeControl?.addEventListener('change', () => {
    applyFilteredLayer('earthquakes');
  });

  fireYearControl?.addEventListener('input', () => {
    syncFireSummary();
  });

  fireYearControl?.addEventListener('change', () => {
    applyFilteredLayer('fires');
  });

  fireAcresControl?.addEventListener('change', () => {
    applyFilteredLayer('fires');
  });

  syncQuakeSummary();
  syncFireSummary();
  setLayerControlState(false);
  initIntroModal();
  observeAtlas();
})();
