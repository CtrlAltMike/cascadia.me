/* ============================================================
   Cascadia.me — Cascadia Atlas
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
  const CONDITIONS_ENDPOINT = document.querySelector('meta[name="cascadia-conditions-endpoint"]')?.content;
  const WIND_ENDPOINT = document.querySelector('meta[name="cascadia-wind-endpoint"]')?.content;
  const FORECAST_WIND_ENDPOINT = document.querySelector('meta[name="cascadia-forecast-wind-endpoint"]')?.content;
  const CASCADIA_BOUNDS = [[-128.4, 39.7], [-115.6, 52.6]];
  const LIVE_REFRESH_MS = 5 * 60 * 1000;
  const WIND_REFRESH_MS = 15 * 60 * 1000;
  const FORECAST_REFRESH_MS = 30 * 60 * 1000;
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
  const VOLCANO_REFERENCES = [
    { id: 'meager', name: 'Mount Meager volcanic complex', jurisdiction: 'British Columbia', coordinates: [-123.50, 50.63], mapUrl: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/volcano', sourceUrl: 'https://chis.nrcan.gc.ca/volcano-volcan/can-vol-en.php' },
    { id: 'cayley', name: 'Mount Cayley volcanic field', jurisdiction: 'British Columbia', coordinates: [-123.29, 50.12], mapUrl: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/volcano', sourceUrl: 'https://chis.nrcan.gc.ca/volcano-volcan/can-vol-en.php' },
    { id: 'garibaldi', name: 'Mount Garibaldi', jurisdiction: 'British Columbia', coordinates: [-123.00, 49.85], mapUrl: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/volcano', sourceUrl: 'https://chis.nrcan.gc.ca/volcano-volcan/can-vol-en.php' },
    { id: 'baker', name: 'Mount Baker', jurisdiction: 'Washington', coordinates: [-121.81, 48.78], mapUrl: 'https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/volcanoes-and-lahars', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-baker' },
    { id: 'glacier-peak', name: 'Glacier Peak', jurisdiction: 'Washington', coordinates: [-121.11, 48.11], mapUrl: 'https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/volcanoes-and-lahars', sourceUrl: 'https://www.usgs.gov/volcanoes/glacier-peak' },
    { id: 'rainier', name: 'Mount Rainier', jurisdiction: 'Washington', coordinates: [-121.76, 46.85], mapUrl: 'https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/volcanoes-and-lahars', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-rainier' },
    { id: 'st-helens', name: 'Mount St. Helens', jurisdiction: 'Washington', coordinates: [-122.19, 46.19], mapUrl: 'https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/volcanoes-and-lahars', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-st-helens' },
    { id: 'adams', name: 'Mount Adams', jurisdiction: 'Washington', coordinates: [-121.49, 46.20], mapUrl: 'https://dnr.wa.gov/washington-geological-survey/geologic-hazards-and-environment/volcanoes-and-lahars', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-adams' },
    { id: 'hood', name: 'Mount Hood', jurisdiction: 'Oregon', coordinates: [-121.70, 45.37], mapUrl: 'https://www.oregon.gov/dogami/hazvu/pages/index.aspx', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-hood' },
    { id: 'jefferson', name: 'Mount Jefferson', jurisdiction: 'Oregon', coordinates: [-121.80, 44.67], mapUrl: 'https://www.oregon.gov/dogami/hazvu/pages/index.aspx', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-jefferson' },
    { id: 'three-sisters', name: 'Three Sisters', jurisdiction: 'Oregon', coordinates: [-121.77, 44.10], mapUrl: 'https://www.oregon.gov/dogami/hazvu/pages/index.aspx', sourceUrl: 'https://www.usgs.gov/volcanoes/three-sisters' },
    { id: 'newberry', name: 'Newberry Volcano', jurisdiction: 'Oregon', coordinates: [-121.23, 43.72], mapUrl: 'https://www.oregon.gov/dogami/hazvu/pages/index.aspx', sourceUrl: 'https://www.usgs.gov/volcanoes/newberry' },
    { id: 'crater-lake', name: 'Crater Lake / Mount Mazama', jurisdiction: 'Oregon', coordinates: [-122.11, 42.94], mapUrl: 'https://www.oregon.gov/dogami/hazvu/pages/index.aspx', sourceUrl: 'https://www.usgs.gov/volcanoes/crater-lake' },
    { id: 'medicine-lake', name: 'Medicine Lake Volcano', jurisdiction: 'California', coordinates: [-121.55, 41.61], mapUrl: 'https://www.usgs.gov/data/california-volcano-locations-threat-rank-and-hazard-zones', sourceUrl: 'https://www.usgs.gov/volcanoes/medicine-lake' },
    { id: 'shasta', name: 'Mount Shasta', jurisdiction: 'California', coordinates: [-122.19, 41.41], mapUrl: 'https://www.usgs.gov/data/california-volcano-locations-threat-rank-and-hazard-zones', sourceUrl: 'https://www.usgs.gov/volcanoes/mount-shasta' },
    { id: 'lassen', name: 'Lassen volcanic center', jurisdiction: 'California', coordinates: [-121.51, 40.49], mapUrl: 'https://www.usgs.gov/data/california-volcano-locations-threat-rank-and-hazard-zones', sourceUrl: 'https://www.usgs.gov/volcanoes/lassen-volcanic-center' },
  ];
  const WIND_SPEED_COLOR = [
    'step', ['to-number', ['coalesce', ['get', 'speedKmh'], 0]],
    '#081d78',
    20, '#183fd2',
    40, '#08bfe0',
    60, '#75c947',
    80, '#ff8c00',
    100, '#b00000',
  ];
  const SOURCE_LABEL_OVERRIDES = {
    'nifc-fires': 'WA/OR current fire incidents',
    'nifc-perimeters': 'WA/OR current fire perimeters',
    'bcws-fires': 'Southern B.C. current fire incidents',
    'bcws-perimeters': 'Southern B.C. current fire perimeters',
    'nws-alerts': 'Selected Washington NWS alerts',
    'chelan-evacuations': 'Chelan County mapped evacuation areas',
  };

  const mapNode = atlas.querySelector('#cascadia-atlas-map');
  const panel = atlas.querySelector('.atlas-panel');
  const statusNode = atlas.querySelector('[data-atlas-status]');
  const loadingNote = document.querySelector('[data-atlas-loading-note]');
  const loadButton = atlas.querySelector('[data-atlas-load]');
  const resetLayersButton = atlas.querySelector('[data-atlas-reset-layers]');
  const resetViewButtons = Array.from(atlas.querySelectorAll('[data-atlas-reset-view]'));
  const controlSheet = atlas.querySelector('.atlas-control-sheet');
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
  const forecastOffsetControl = atlas.querySelector('[data-atlas-forecast-offset]');
  const forecastNote = atlas.querySelector('[data-atlas-forecast-note]');
  const windKey = atlas.querySelector('[data-atlas-wind-key]');
  const windKeyObserved = atlas.querySelector('[data-atlas-wind-key-observed]');
  const windKeyForecast = atlas.querySelector('[data-atlas-wind-key-forecast]');
  const forecastKeyTime = atlas.querySelector('[data-atlas-forecast-key-time]');
  const sourceStateNodes = Array.from(document.querySelectorAll('[data-atlas-source-state]'));
  const sourceIndicators = Array.from(document.querySelectorAll('[data-atlas-source-indicator]'));
  const familyCounts = Array.from(atlas.querySelectorAll('[data-atlas-family-count]'));
  const activeCountNode = atlas.querySelector('[data-atlas-active-count]');
  const legendCountNode = atlas.querySelector('[data-atlas-legend-count]');
  const legendItems = Array.from(atlas.querySelectorAll('[data-legend-layer]'));
  const legendFamilies = Array.from(atlas.querySelectorAll('[data-legend-family]'));
  const layerOptionPanels = Array.from(atlas.querySelectorAll('[data-atlas-layer-options]'));
  const sourcePanels = Array.from(document.querySelectorAll('[data-atlas-source-panel]'));
  const sourceLists = new Map(
    Array.from(document.querySelectorAll('[data-atlas-source-list]')).map((list) => [list.dataset.atlasSourceList, list])
  );
  const evacuationCoverageNode = document.querySelector('[data-atlas-evacuation-coverage]');
  const recordIndexCountNode = atlas.querySelector('[data-atlas-record-count]');
  const recordIndexList = atlas.querySelector('[data-atlas-record-list]');
  const centerForecastPanel = atlas.querySelector('[data-atlas-center-forecast]');
  const centerForecastButton = atlas.querySelector('[data-atlas-center-forecast-read]');
  const centerForecastOutput = atlas.querySelector('[data-atlas-center-forecast-output]');
  const statusItems = new Map(
    Array.from(document.querySelectorAll('[data-atlas-status-key]')).map((item) => [item.dataset.atlasStatusKey, item])
  );
  const statusParts = new Map();
  const layerStates = new Map();
  const legendAvailability = new Map();
  const loadingStatuses = new Set();
  const loadedLayers = new Set();

  let map = null;
  let initPromise = null;
  let mapLoadPromise = null;
  let mapResizeObserver = null;
  let mapResizeFrame = null;
  let mapLoadTimeout = null;
  const quakeCache = new Map();
  let loadedQuakeKey = null;
  let liveConditionsData = null;
  let liveConditionsPromise = null;
  let liveLoadedAt = 0;
  let windData = null;
  let windPromise = null;
  let windLoadedAt = 0;
  let forecastData = null;
  let forecastPromise = null;
  let forecastLoadedAt = 0;
  let activeForecast = null;
  let forecastPointAbort = null;
  let fireCollection = null;
  let firePromise = null;
  let loadedFireKey = null;
  let floodAbort = null;
  let lastFloodKey = '';
  let moveTimer = null;
  let recordIndexTimer = null;
  let centerForecastAbort = null;

  function setStatus(key, message, state) {
    const normalizedState = state || (message.startsWith('Loading ') ? 'loading' : 'ready');
    statusParts.set(key, message);
    layerStates.set(key, normalizedState);
    if (statusItems.has(key)) {
      const item = statusItems.get(key);
      item.textContent = message;
      item.dataset.state = normalizedState;
    }
    if (statusNode) statusNode.textContent = message;
    if (normalizedState === 'loading') {
      loadingStatuses.add(key);
    } else {
      loadingStatuses.delete(key);
    }
    syncLoadingState();
    if (statusNode) statusNode.dataset.state = normalizedState;
    syncControlPresentation();
  }

  function syncLoadingState() {
    if (!loadingNote) return;
    loadingNote.hidden = loadingStatuses.size === 0;
  }

  function toggleForLayer(layer) {
    return toggles.find((input) => input.dataset.atlasLayer === layer);
  }

  function sourceAggregate() {
    const enabledKeys = toggles.filter((input) => input.checked).map((input) => input.dataset.atlasLayer);
    const states = ['map', ...enabledKeys].map((key) => layerStates.get(key) || 'loading');
    if (states.some((state) => state === 'error')) return { state: 'issue', label: 'Source issue' };
    if (states.some((state) => state === 'loading')) return { state: 'loading', label: 'Checking sources' };
    if (states.some((state) => state === 'partial')) return { state: 'partial', label: 'Partial coverage' };
    if (states.every((state) => state === 'ready')) {
      return { state: 'available', label: enabledKeys.length ? 'Sources available' : 'Map available' };
    }
    return { state: 'loading', label: 'Checking sources' };
  }

  function syncControlPresentation() {
    const familyLayers = {
      current: ['live', 'wind'],
      forecast: ['forecast-wind'],
      planning: ['earthquakes', 'fires', 'floods', 'volcanoes'],
    };

    toggles.forEach((input) => {
      const layer = input.dataset.atlasLayer;
      const row = atlas.querySelector(`[data-atlas-toggle-row="${layer}"]`);
      const stateNode = atlas.querySelector(`[data-atlas-layer-state="${layer}"]`);
      const state = input.checked ? (layerStates.get(layer) || 'loading') : 'off';
      const stateLabels = {
        off: 'Off',
        loading: 'Checking',
        ready: 'On',
        partial: 'Partial',
        error: 'Issue',
      };
      if (row) row.dataset.state = state;
      if (stateNode) stateNode.textContent = stateLabels[state] || 'On';
      if (state === 'error') {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }

      if (statusItems.has(layer)) {
        statusItems.get(layer).hidden = !input.checked;
      }
    });

    layerOptionPanels.forEach((panelNode) => {
      const toggle = toggleForLayer(panelNode.dataset.atlasLayerOptions);
      panelNode.hidden = !toggle?.checked;
    });

    sourcePanels.forEach((sourcePanel) => {
      const toggle = toggleForLayer(sourcePanel.dataset.atlasSourcePanel);
      sourcePanel.hidden = !toggle?.checked;
    });

    familyCounts.forEach((node) => {
      const layers = familyLayers[node.dataset.atlasFamilyCount] || [];
      const count = layers.filter((layer) => toggleForLayer(layer)?.checked).length;
      node.textContent = `${count} on`;
    });

    const activeCount = toggles.filter((input) => input.checked).length;
    if (activeCountNode) activeCountNode.textContent = `${activeCount} active`;

    legendItems.forEach((item) => {
      const requiredRecord = item.dataset.legendRequires;
      const hasRequiredRecord = !requiredRecord || legendAvailability.get(requiredRecord) !== false;
      const layerFailed = layerStates.get(item.dataset.legendLayer) === 'error';
      item.hidden = !toggleForLayer(item.dataset.legendLayer)?.checked || !hasRequiredRecord || layerFailed;
    });
    legendFamilies.forEach((family) => {
      family.hidden = !Array.from(family.querySelectorAll('[data-legend-layer]')).some((item) => !item.hidden);
    });
    const legendCount = legendItems.filter((item) => !item.hidden).length;
    if (legendCountNode) legendCountNode.textContent = `${legendCount} key${legendCount === 1 ? '' : 's'}`;

    const observedWindVisible = Boolean(toggleForLayer('wind')?.checked && layerStates.get('wind') !== 'error');
    const forecastWindVisible = Boolean(toggleForLayer('forecast-wind')?.checked && layerStates.get('forecast-wind') !== 'error');
    if (windKey) windKey.hidden = !observedWindVisible && !forecastWindVisible;
    if (windKeyObserved) windKeyObserved.hidden = !observedWindVisible;
    if (windKeyForecast) windKeyForecast.hidden = !forecastWindVisible;

    const aggregate = sourceAggregate();
    sourceStateNodes.forEach((node) => {
      node.textContent = aggregate.label;
    });
    sourceIndicators.forEach((indicator) => {
      indicator.dataset.state = aggregate.state;
    });

    queueVisibleRecordIndexUpdate();
  }

  function queueVisibleRecordIndexUpdate() {
    if (!recordIndexList || !recordIndexCountNode) return;
    clearTimeout(recordIndexTimer);
    recordIndexTimer = setTimeout(syncVisibleRecordIndex, 80);
  }

  function visibleRecordLayerIds() {
    if (!map) return [];
    return [
      'atlas-wind-observation-arrows',
      'atlas-live-fire-points',
      'atlas-live-road-points',
      'atlas-live-evac-fill',
      'atlas-live-perimeter-fill',
      'atlas-live-alert-fill',
      'atlas-quake-points',
      'atlas-fire-fill',
      'atlas-flood-fill',
      'atlas-flood-corridor-line',
      'atlas-volcano-points',
    ].filter((id) => map.getLayer(id));
  }

  function visibleRecordKey(feature, text) {
    const props = feature.properties || {};
    const layer = feature.layer?.id || 'record';
    const identity = props.id
      || props.GlobalID
      || props.OBJECTID
      || props.stationId
      || props.irwinId
      || props.fireNumber
      || props.title
      || props.name
      || props.INCIDENT
      || props.incidentName
      || props.FLD_ZONE
      || text;
    return `${layer}:${identity}`;
  }

  function visibleRecordText(feature) {
    const html = renderFeaturePopup(feature);
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return Array.from(wrapper.children)
      .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join(' · ');
  }

  function syncVisibleRecordIndex() {
    if (!recordIndexList || !recordIndexCountNode) return;

    const forecastAvailable = Boolean(toggleForLayer('forecast-wind')?.checked && activeForecast && map);
    if (centerForecastPanel) centerForecastPanel.hidden = !forecastAvailable;

    if (!map) {
      recordIndexCountNode.textContent = 'Waiting';
      const item = document.createElement('li');
      item.textContent = 'Load the Atlas to read visible records.';
      recordIndexList.replaceChildren(item);
      return;
    }

    const layers = visibleRecordLayerIds();
    if (!layers.length) {
      recordIndexCountNode.textContent = forecastAvailable ? 'Model field' : '0 records';
      const item = document.createElement('li');
      item.textContent = forecastAvailable
        ? 'No discrete records are active. Use the forecast control below to read the model at the map center.'
        : 'No discrete map records are active in this view.';
      recordIndexList.replaceChildren(item);
      return;
    }

    try {
      const unique = new Map();
      map.queryRenderedFeatures(undefined, { layers }).forEach((feature) => {
        const text = visibleRecordText(feature);
        if (!text) return;
        const key = visibleRecordKey(feature, text);
        if (!unique.has(key)) unique.set(key, text);
      });

      const records = Array.from(unique.values()).sort((left, right) => left.localeCompare(right));
      recordIndexCountNode.textContent = `${records.length} record${records.length === 1 ? '' : 's'}`;
      const items = records.slice(0, 40).map((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
      });
      if (records.length > 40) {
        const item = document.createElement('li');
        item.textContent = `${records.length - 40} additional records are visible. Zoom or pan to narrow the list.`;
        items.push(item);
      }
      if (!items.length) {
        const item = document.createElement('li');
        item.textContent = forecastAvailable
          ? 'No discrete records are visible. Use the forecast control below to read the model at the map center.'
          : 'No records from the active layers are visible in this map view.';
        items.push(item);
      }
      recordIndexList.replaceChildren(...items);
    } catch (_error) {
      recordIndexCountNode.textContent = 'Unavailable';
      const item = document.createElement('li');
      item.textContent = 'Visible records could not be summarized. Source status and data notes remain available.';
      recordIndexList.replaceChildren(item);
    }
  }

  function sourceStatusLabel(status) {
    return {
      available: 'Available',
      partial: 'Partial',
      unavailable: 'Unavailable',
      not_configured: 'Not configured',
      official_link_only: 'Official link only',
    }[status] || 'Status not reported';
  }

  function initControlSheet() {
    if (!controlSheet) return;
    const mobileQuery = window.matchMedia('(max-width: 960px)');
    const applyViewportState = (event) => {
      controlSheet.open = !event.matches;
    };
    applyViewportState(mobileQuery);
    mobileQuery.addEventListener?.('change', applyViewportState);
  }

  function renderSourceRecords(key, sources, checkedAt) {
    const list = sourceLists.get(key);
    if (!list) return;
    list.replaceChildren();

    if (!Array.isArray(sources) || sources.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No source detail was returned.';
      list.append(item);
      return;
    }

    sources.forEach((source) => {
      const item = document.createElement('li');
      const label = SOURCE_LABEL_OVERRIDES[source.id]
        || (typeof source.label === 'string' ? source.label : 'Public source');
      const link = document.createElement(source.url?.startsWith('https://') ? 'a' : 'span');
      link.textContent = label;
      if (link.tagName === 'A') {
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
      }
      const meta = document.createElement('span');
      const count = source.recordCount === null || source.recordCount === ''
        ? NaN
        : Number(source.recordCount);
      const countText = Number.isFinite(count) ? ` · ${count.toLocaleString()} record${count === 1 ? '' : 's'}` : '';
      const updateText = source.updatedAt ? ` · updated ${formatPopupDate(source.updatedAt)}` : '';
      meta.textContent = ` — ${sourceStatusLabel(source.status)}${countText}${updateText}`;
      item.append(link, meta);
      list.append(item);
    });

    if (checkedAt) {
      const item = document.createElement('li');
      item.textContent = `Feed checked ${formatPopupDate(checkedAt)}.`;
      list.append(item);
    }
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

      if (layer.type === 'raster') {
        layer.paint['raster-saturation'] = -0.38;
        layer.paint['raster-contrast'] = 0.08;
        layer.paint['raster-brightness-min'] = 0.14;
        layer.paint['raster-brightness-max'] = 0.92;
      }

      if (layer.type === 'hillshade') {
        layer.paint['hillshade-shadow-color'] = '#315342';
        layer.paint['hillshade-highlight-color'] = '#fff9ec';
        layer.paint['hillshade-accent-color'] = '#65529a';
        layer.paint['hillshade-exaggeration'] = 0.28;
      }

      if (layer.type === 'fill-extrusion' && /building/.test(id)) {
        layer.layout = layer.layout || {};
        layer.layout.visibility = 'none';
      }

      if (layer.type === 'line') {
        if (/water|river|stream|canal/.test(id)) {
          layer.paint['line-color'] = '#2faab3';
          layer.paint['line-opacity'] = 0.92;
        } else if (/contour|terrain/.test(id)) {
          layer.paint['line-color'] = '#536f62';
          layer.paint['line-opacity'] = 0.28;
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
          layer.paint['text-color'] = '#063b5c';
        }
        if (layer.paint['text-halo-color'] !== undefined) {
          layer.paint['text-halo-color'] = '#fbf7ee';
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
        'fill-color': '#2f5a43',
        'fill-opacity': 0.04,
      },
    });

    map.addLayer({
      id: 'atlas-region-line',
      type: 'line',
      source: 'atlas-reference',
      filter: ['==', ['get', 'kind'], 'region-line'],
      paint: {
        'line-color': '#2f5a43',
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
        'line-color': '#65529a',
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
        'line-color': '#2faab3',
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
        'line-color': '#075a78',
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

  function observeMapSize() {
    if (!('ResizeObserver' in window) || mapResizeObserver) return;

    mapResizeObserver = new ResizeObserver(() => {
      if (!map) return;
      window.cancelAnimationFrame(mapResizeFrame);
      mapResizeFrame = window.requestAnimationFrame(() => {
        map?.resize();
      });
    });
    mapResizeObserver.observe(panel);
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
        setStatus('map', 'Loading atlas map.', 'loading');

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

        map.addControl(new window.maplibregl.NavigationControl({
          showCompass: !window.matchMedia('(max-width: 640px)').matches,
          visualizePitch: false,
        }), 'bottom-right');
        map.addControl(new window.maplibregl.AttributionControl({ compact: true }), 'bottom-left');

        mapLoadPromise = new Promise((resolve, reject) => {
          map.once('load', () => {
            window.clearTimeout(mapLoadTimeout);
            resolve();
          });
          map.once('error', (event) => {
            window.clearTimeout(mapLoadTimeout);
            reject(new Error(event?.error?.message || 'The map style could not load.'));
          });
          mapLoadTimeout = window.setTimeout(() => {
            reject(new Error('The map took too long to load.'));
          }, 15_000);
        });

        await mapLoadPromise;
        panel.classList.add('is-loaded');
        if (loadButton) loadButton.hidden = true;
        setLayerControlState(false);

        addReferenceLayers();
        fitCascadia();
        observeMapSize();
        mapNode.querySelector('.maplibregl-ctrl-attrib')?.removeAttribute('open');
        wireMapInteractions();
        setStatus('map', 'Map loaded.', 'ready');

        await syncCheckedLayers();
      } catch (error) {
        window.clearTimeout(mapLoadTimeout);
        mapLoadTimeout = null;
        setLayerControlState(false);
        panel.classList.remove('is-loaded');
        if (map) {
          try {
            map.remove();
          } catch (removeError) {
            // A partially constructed map may not support full cleanup.
          }
        }
        map = null;
        mapLoadPromise = null;
        if (loadButton) {
          loadButton.disabled = false;
          loadButton.textContent = 'Try loading again';
        }
        setStatus('map', 'The atlas could not load. Check your connection and try again.', 'error');
        initPromise = null;
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
      } else {
        setLayerVisibility(layer, false);
      }
    }
  }

  function setLayerVisibility(layer, visible) {
    const visibility = visible ? 'visible' : 'none';
    const ids = {
      live: [
        'atlas-live-alert-fill',
        'atlas-live-alert-line',
        'atlas-live-perimeter-fill',
        'atlas-live-perimeter-line',
        'atlas-live-evac-fill',
        'atlas-live-evac-line',
        'atlas-live-fire-points',
        'atlas-live-road-points',
      ],
      wind: ['atlas-wind-observation-halo', 'atlas-wind-observation-arrows', 'atlas-wind-observation-labels'],
      'forecast-wind': ['atlas-forecast-wind-speed'],
      earthquakes: ['atlas-quake-rings', 'atlas-quake-points'],
      fires: ['atlas-fire-fill', 'atlas-fire-line'],
      floods: ['atlas-flood-corridor-glow', 'atlas-flood-corridor-line', 'atlas-flood-fill', 'atlas-flood-line-halo', 'atlas-flood-line'],
      volcanoes: ['atlas-volcano-halo', 'atlas-volcano-points'],
    }[layer] || [];

    ids.forEach((id) => {
      if (map && map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visibility);
      }
    });
  }

  async function ensureLayer(layer) {
    if (!map) await initAtlas();

    if (layer === 'live') return ensureLiveConditions();
    if (layer === 'wind') return ensureWindObservations();
    if (layer === 'forecast-wind') return ensureForecastWind();
    if (layer === 'earthquakes') return ensureEarthquakes();
    if (layer === 'fires') return ensureFires();
    if (layer === 'floods') return ensureFloods();
    if (layer === 'volcanoes') return ensureVolcanoes();

    return Promise.resolve();
  }

  async function loadLayerSafely(layer) {
    try {
      await ensureLayer(layer);
      const enabled = Boolean(toggleForLayer(layer)?.checked);
      setLayerVisibility(layer, enabled);
      syncControlPresentation();
      return enabled;
    } catch (error) {
      const labels = {
        live: 'Current conditions',
        wind: 'Observed wind',
        'forecast-wind': 'Forecast wind',
        earthquakes: 'Earthquakes',
        fires: 'Historical wildfires',
        floods: 'Flood zones',
        volcanoes: 'Volcano references',
      };
      setStatus(layer, `${labels[layer] || 'Layer'} could not load.`, 'error');
      setLayerVisibility(layer, false);
      return false;
    }
  }

  async function ensureLiveConditions() {
    if (!CONDITIONS_ENDPOINT) {
      throw new Error('Current conditions endpoint is not configured');
    }

    const isFresh = liveConditionsData && Date.now() - liveLoadedAt < LIVE_REFRESH_MS;
    if (isFresh) {
      renderLiveConditions(liveConditionsData);
      return;
    }

    setStatus('live', 'Loading current official conditions.', 'loading');
    if (!liveConditionsPromise) {
      liveConditionsPromise = fetchJson(CONDITIONS_ENDPOINT)
        .then((data) => {
          liveConditionsData = data;
          liveLoadedAt = Date.now();
          return data;
        })
        .finally(() => {
          liveConditionsPromise = null;
        });
    }

    const data = await liveConditionsPromise;
    renderLiveConditions(data);
  }

  function renderLiveConditions(data) {
    const perimeters = mapFeatureCollection(data.perimeters);
    const firePoints = mapFeatureCollection(data.fires);
    const collections = {
      alerts: mapFeatureCollection(data.alerts),
      perimeters,
      evacuations: mapFeatureCollection(data.evacuations),
      fires: addPerimeterFallbackFirePoints(firePoints, perimeters),
      roads: mapFeatureCollection(data.roads),
    };

    setGeoJsonSource('atlas-live-alerts', collections.alerts);
    setGeoJsonSource('atlas-live-perimeters', collections.perimeters);
    setGeoJsonSource('atlas-live-evacuations', collections.evacuations);
    setGeoJsonSource('atlas-live-fires', collections.fires);
    setGeoJsonSource('atlas-live-roads', collections.roads);
    addLiveConditionLayers();

    loadedLayers.add('live');
    renderSourceRecords('live', data.sources, data.checkedAt);
    if (evacuationCoverageNode) {
      const coverage = Array.isArray(data.evacuationCoverage) ? data.evacuationCoverage : [];
      const mapped = coverage.filter((entry) => entry.mode === 'live_polygons').map((entry) => entry.county);
      const linkOnly = coverage.filter((entry) => entry.mode === 'official_link').map((entry) => entry.county);
      const parts = [];
      if (mapped.length) parts.push(`Mapped evacuation polygons: ${mapped.join(', ')}.`);
      if (linkOnly.length) parts.push(`Official-link-only evacuation coverage: ${linkOnly.join(', ')}.`);
      evacuationCoverageNode.textContent = parts.join(' ') || 'Evacuation coverage detail was not returned.';
    }
    const summary = data.summary || {};
    const fireCount = Number(summary.fireCount) || 0;
    const alertCount = Number(summary.weatherAlertCount) || 0;
    const evacuationCount = Number(summary.evacuationCount) || 0;
    const roadCount = Number(summary.roadAlertCount) || 0;
    legendAvailability.set('live-fire', fireCount + (Number(summary.perimeterCount) || 0) > 0);
    legendAvailability.set('live-evac', evacuationCount > 0);
    legendAvailability.set('live-weather', alertCount > 0);
    legendAvailability.set('live-roads', roadCount > 0);
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const unavailableCount = sources.filter((source) => source.status === 'unavailable').length;
    const roadNotConfigured = sources.some((source) => source.id === 'wsdot-highway-alerts' && source.status === 'not_configured');
    const coverageNotes = [];
    if (unavailableCount) {
      coverageNotes.push(`${unavailableCount} source${unavailableCount === 1 ? ' is' : 's are'} temporarily unavailable.`);
    }
    if (roadNotConfigured) coverageNotes.push('WSDOT road alerts are not connected.');
    if (data.degraded && !coverageNotes.length) coverageNotes.push('Some source coverage is incomplete.');
    const partial = Boolean(data.degraded || coverageNotes.length);
    const coverage = coverageNotes.length ? ` ${coverageNotes.join(' ')}` : '';
    setStatus(
      'live',
      `Current conditions: ${fireCount} fire records, ${evacuationCount} evacuation area${evacuationCount === 1 ? '' : 's'}, ${alertCount} priority weather alert${alertCount === 1 ? '' : 's'}.${coverage}`,
      partial ? 'partial' : 'ready'
    );
  }

  async function ensureWindObservations() {
    if (!WIND_ENDPOINT) {
      throw new Error('Wind observations endpoint is not configured');
    }

    const isFresh = windData && Date.now() - windLoadedAt < WIND_REFRESH_MS;
    if (isFresh) {
      renderWindObservations(windData);
      return;
    }

    setStatus('wind', 'Loading recent wind station observations.', 'loading');
    if (!windPromise) {
      windPromise = fetchJson(WIND_ENDPOINT)
        .then((data) => {
          windData = data;
          windLoadedAt = Date.now();
          return data;
        })
        .finally(() => {
          windPromise = null;
        });
    }

    const data = await windPromise;
    renderWindObservations(data);
  }

  function renderWindObservations(data) {
    const observations = mapFeatureCollection(data.observations);
    observations.features = observations.features.map((feature) => {
      const speed = Number(feature.properties?.speedKmh);
      return {
        ...feature,
        properties: {
          ...(feature.properties || {}),
          speedLabel: Number.isFinite(speed) ? `${Math.round(speed)} km/h` : '',
        },
      };
    });
    setGeoJsonSource('atlas-wind-observations', observations);
    addWindObservationLayers();

    loadedLayers.add('wind');
    renderSourceRecords('wind', data.sources, data.checkedAt);
    const summary = data.summary || {};
    const stationCount = Number(summary.stationCount) || 0;
    const staleCount = Number(summary.staleStationCount) || 0;
    const ageNote = staleCount
      ? ` ${staleCount} older observation${staleCount === 1 ? ' is' : 's are'} shown faintly.`
      : '';
    const degraded = data.degraded ? ' One observation source is temporarily unavailable.' : '';
    setStatus(
      'wind',
      `Observed wind: ${stationCount} recent station report${stationCount === 1 ? '' : 's'} across Cascadia.${ageNote}${degraded}`,
      data.degraded ? 'partial' : 'ready'
    );
  }

  function addWindObservationLayers() {
    ensureWindArrowImage();

    if (!map.getLayer('atlas-wind-observation-halo')) {
      map.addLayer({
        id: 'atlas-wind-observation-halo',
        type: 'circle',
        source: 'atlas-wind-observations',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'speedKmh'], 0]],
            0, 3,
            40, 3.75,
            80, 4.5,
          ],
          'circle-color': WIND_SPEED_COLOR,
          'circle-opacity': ['case', ['boolean', ['get', 'stale'], false], 0.3, 0.9],
          'circle-stroke-color': '#fbf7ee',
          'circle-stroke-opacity': ['case', ['boolean', ['get', 'stale'], false], 0.3, 0.92],
          'circle-stroke-width': 1.5,
        },
      });
    }

    if (!map.getLayer('atlas-wind-observation-arrows')) {
      map.addLayer({
        id: 'atlas-wind-observation-arrows',
        type: 'symbol',
        source: 'atlas-wind-observations',
        layout: {
          'icon-image': 'atlas-wind-arrow',
          'icon-size': [
            'interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'speedKmh'], 0]],
            0, 0.78,
            30, 0.88,
            60, 0.98,
            100, 1.08,
          ],
          'icon-rotate': ['to-number', ['get', 'bearing']],
          'icon-rotation-alignment': 'map',
          'icon-pitch-alignment': 'map',
          // Station observations are the layer's primary marks. Keep them
          // visible when denser basemap and speed-label tiers enter at
          // higher zooms; the optional speed labels still declutter.
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-padding': 6,
        },
        paint: {
          'icon-color': WIND_SPEED_COLOR,
          'icon-halo-color': '#fbf7ee',
          'icon-halo-width': 0.75,
          'icon-opacity': ['case', ['boolean', ['get', 'stale'], false], 0.34, 0.96],
        },
      });
    }

    if (!map.getLayer('atlas-wind-observation-labels')) {
      map.addLayer({
        id: 'atlas-wind-observation-labels',
        type: 'symbol',
        source: 'atlas-wind-observations',
        minzoom: 6.2,
        layout: {
          'text-field': ['get', 'speedLabel'],
          'text-size': 11,
          'text-anchor': 'top',
          'text-offset': [0, 1.85],
          'text-allow-overlap': false,
          'text-padding': 3,
        },
        paint: {
          'text-color': '#063b5c',
          'text-halo-color': '#fbf7ee',
          'text-halo-width': 2,
          'text-opacity': ['case', ['boolean', ['get', 'stale'], false], 0.32, 0.92],
        },
      });
    }
  }

  function ensureWindArrowImage() {
    if (map.hasImage('atlas-wind-arrow')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#ffffff';
    context.lineWidth = 10;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(40, 42);
    context.lineTo(40, 18);
    context.stroke();
    context.beginPath();
    context.moveTo(40, 4);
    context.lineTo(60, 26);
    context.lineTo(48, 23);
    context.lineTo(40, 31);
    context.lineTo(32, 23);
    context.lineTo(20, 26);
    context.closePath();
    context.fill();
    map.addImage('atlas-wind-arrow', context.getImageData(0, 0, canvas.width, canvas.height), {
      pixelRatio: 2,
      sdf: true,
    });
  }

  async function ensureForecastWind() {
    if (!FORECAST_WIND_ENDPOINT) {
      throw new Error('Forecast wind endpoint is not configured');
    }

    const isFresh = forecastData && Date.now() - forecastLoadedAt < FORECAST_REFRESH_MS;
    if (isFresh) {
      renderForecastWind(forecastData);
      return;
    }

    setStatus('forecast-wind', 'Loading forecast wind guidance.', 'loading');
    if (!forecastPromise) {
      forecastPromise = fetchJson(FORECAST_WIND_ENDPOINT)
        .then((data) => {
          forecastData = data;
          forecastLoadedAt = Date.now();
          return data;
        })
        .finally(() => {
          forecastPromise = null;
        });
    }

    const data = await forecastPromise;
    renderForecastWind(data);
  }

  function renderForecastWind(data) {
    const model = data?.model;
    if (!model?.validAt || !model?.runAt || !data.tileTemplateBase) {
      throw new Error('Forecast wind metadata was incomplete');
    }

    const validAt = selectedForecastTime(model);
    const tileUrl = `${data.tileTemplateBase}?time=${encodeURIComponent(validAt)}&run=${encodeURIComponent(model.runAt)}`;
    const source = map.getSource('atlas-forecast-wind');
    if (source) {
      source.setTiles([tileUrl]);
    } else {
      map.addSource('atlas-forecast-wind', {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        maxzoom: 9,
        attribution: 'Forecast wind: Environment and Climate Change Canada RDPS',
      });
    }

    if (!map.getLayer('atlas-forecast-wind-speed')) {
      const firstBasemapSymbol = map.getStyle()?.layers?.find((layer) => layer.type === 'symbol' && !layer.id.startsWith('atlas-'))?.id;
      map.addLayer({
        id: 'atlas-forecast-wind-speed',
        type: 'raster',
        source: 'atlas-forecast-wind',
        paint: {
          'raster-opacity': 0.24,
          'raster-fade-duration': 240,
          'raster-resampling': 'linear',
          'raster-contrast': 0.18,
          'raster-saturation': 0.16,
        },
      }, firstBasemapSymbol);
    }

    activeForecast = {
      validAt,
      runAt: model.runAt,
      pointEndpoint: data.pointEndpoint,
      sourceName: model.sourceName,
      sourceUrl: model.sourceUrl,
    };
    renderSourceRecords('forecast-wind', [{
      label: model.sourceName || 'Environment and Climate Change Canada',
      url: model.sourceUrl,
      status: 'available',
      recordCount: null,
      updatedAt: model.runAt,
    }], data.checkedAt);
    loadedLayers.add('forecast-wind');
    const validLabel = formatPopupDate(validAt);
    const runLabel = formatPopupDate(model.runAt);
    if (forecastNote) {
      forecastNote.textContent = `Valid ${validLabel}. Model run ${runLabel}. Select the shaded map for a point value, or use Visible map records to read the map center.`;
    }
    if (forecastKeyTime) forecastKeyTime.textContent = `Valid ${validLabel}.`;
    setStatus(
      'forecast-wind',
      `Forecast wind: ${model.name || 'RDPS'} ${model.resolutionKm || 10} km guidance valid ${validLabel}.`,
      'ready'
    );
  }

  function selectedForecastTime(model) {
    const offsetHours = Math.max(0, Number(forecastOffsetControl?.value) || 0);
    const base = Date.parse(model.validAt);
    const through = Date.parse(model.validThrough || '');
    let selected = base + offsetHours * 60 * 60 * 1000;
    if (Number.isFinite(through)) selected = Math.min(selected, through);
    return new Date(selected).toISOString().replace('.000Z', 'Z');
  }

  function mapFeatureCollection(collection) {
    return {
      type: 'FeatureCollection',
      features: Array.isArray(collection?.features)
        ? collection.features.filter((feature) => feature?.type === 'Feature' && feature.geometry)
        : [],
    };
  }

  function addPerimeterFallbackFirePoints(pointCollection, perimeterCollection) {
    const features = [...pointCollection.features];
    const represented = new Set(features.map((feature) => fireFeatureIdentity(feature)).filter(Boolean));

    perimeterCollection.features.forEach((feature) => {
      const identity = fireFeatureIdentity(feature);
      if (identity && represented.has(identity)) return;

      const coordinates = geometryBoundsCenter(feature.geometry);
      if (!coordinates) return;

      const properties = feature.properties || {};
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
        properties: {
          ...properties,
          kind: 'wildfire',
          status: properties.stale ? 'reported' : 'current',
          derivedFromPerimeter: true,
        },
      });
      if (identity) represented.add(identity);
    });

    return { type: 'FeatureCollection', features };
  }

  function fireFeatureIdentity(feature) {
    const properties = feature?.properties || {};
    const id = String(properties.id || '').trim().toLowerCase();
    if (id) return `id:${id}`;
    const name = String(properties.name || '').trim().toLowerCase();
    const source = String(properties.sourceName || '').trim().toLowerCase();
    return name ? `name:${source}:${name}` : '';
  }

  function geometryBoundsCenter(geometry) {
    if (!geometry || !Array.isArray(geometry.coordinates)) return null;
    let minLongitude = Infinity;
    let minLatitude = Infinity;
    let maxLongitude = -Infinity;
    let maxLatitude = -Infinity;

    function visit(coordinates) {
      if (!Array.isArray(coordinates)) return;
      if (coordinates.length >= 2 && Number.isFinite(Number(coordinates[0])) && Number.isFinite(Number(coordinates[1]))) {
        const longitude = Number(coordinates[0]);
        const latitude = Number(coordinates[1]);
        minLongitude = Math.min(minLongitude, longitude);
        minLatitude = Math.min(minLatitude, latitude);
        maxLongitude = Math.max(maxLongitude, longitude);
        maxLatitude = Math.max(maxLatitude, latitude);
        return;
      }
      coordinates.forEach(visit);
    }

    visit(geometry.coordinates);
    if (![minLongitude, minLatitude, maxLongitude, maxLatitude].every(Number.isFinite)) return null;
    return [(minLongitude + maxLongitude) / 2, (minLatitude + maxLatitude) / 2];
  }

  function setGeoJsonSource(id, data) {
    if (map.getSource(id)) {
      map.getSource(id).setData(data);
      return;
    }
    map.addSource(id, { type: 'geojson', data });
  }

  function addLiveConditionLayers() {
    if (!map.getLayer('atlas-live-alert-fill')) {
      map.addLayer({
        id: 'atlas-live-alert-fill',
        type: 'fill',
        source: 'atlas-live-alerts',
        paint: {
          'fill-color': [
            'match', ['get', 'kind'],
            'fire-weather', '#e8b934',
            'flood-weather', '#2faab3',
            'winter-weather', '#65529a',
            '#53656b',
          ],
          'fill-opacity': 0.14,
        },
      });
    }

    if (!map.getLayer('atlas-live-alert-line')) {
      map.addLayer({
        id: 'atlas-live-alert-line',
        type: 'line',
        source: 'atlas-live-alerts',
        paint: {
          'line-color': [
            'match', ['get', 'kind'],
            'fire-weather', '#9b6e12',
            'flood-weather', '#075a78',
            'winter-weather', '#65529a',
            '#53656b',
          ],
          'line-opacity': 0.86,
          'line-width': 1.6,
          'line-dasharray': [2, 1.5],
        },
      });
    }

    if (!map.getLayer('atlas-live-perimeter-fill')) {
      map.addLayer({
        id: 'atlas-live-perimeter-fill',
        type: 'fill',
        source: 'atlas-live-perimeters',
        paint: {
          'fill-color': '#c44737',
          'fill-opacity': 0.2,
        },
      });
    }

    if (!map.getLayer('atlas-live-perimeter-line')) {
      map.addLayer({
        id: 'atlas-live-perimeter-line',
        type: 'line',
        source: 'atlas-live-perimeters',
        paint: {
          'line-color': '#8e3027',
          'line-opacity': 0.9,
          'line-width': 1.8,
        },
      });
    }

    if (!map.getLayer('atlas-live-evac-fill')) {
      map.addLayer({
        id: 'atlas-live-evac-fill',
        type: 'fill',
        source: 'atlas-live-evacuations',
        paint: {
          'fill-color': [
            'match', ['to-number', ['get', 'level']],
            1, '#e8b934',
            2, '#d47b2f',
            3, '#c44737',
            4, '#65529a',
            '#c44737',
          ],
          'fill-opacity': 0.42,
        },
      });
    }

    if (!map.getLayer('atlas-live-evac-line')) {
      map.addLayer({
        id: 'atlas-live-evac-line',
        type: 'line',
        source: 'atlas-live-evacuations',
        paint: {
          'line-color': '#762820',
          'line-opacity': 0.96,
          'line-width': 2.2,
        },
      });
    }

    if (!map.getLayer('atlas-live-fire-points')) {
      map.addLayer({
        id: 'atlas-live-fire-points',
        type: 'circle',
        source: 'atlas-live-fires',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['to-number', ['coalesce', ['get', 'acres'], 0]],
            0, 4.5,
            1000, 7,
            10000, 10,
            50000, 14,
          ],
          'circle-color': [
            'match', ['get', 'status'],
            'contained', '#697f6e',
            'reported', '#e8b934',
            '#c44737',
          ],
          'circle-opacity': 0.9,
          'circle-stroke-color': '#fbf7ee',
          'circle-stroke-width': 1.4,
        },
      });
    }

    if (!map.getLayer('atlas-live-road-points')) {
      map.addLayer({
        id: 'atlas-live-road-points',
        type: 'circle',
        source: 'atlas-live-roads',
        paint: {
          'circle-radius': 5.5,
          'circle-color': '#075a78',
          'circle-opacity': 0.92,
          'circle-stroke-color': '#e5f4f3',
          'circle-stroke-width': 1.5,
        },
      });
    }
  }

  async function ensureEarthquakes() {
    const filter = getQuakeFilter();
    if (loadedQuakeKey === filter.key && loadedLayers.has('earthquakes')) return;

    syncQuakeSummary();
    setStatus('earthquakes', `Loading USGS ${filter.label}.`, 'loading');
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
    if (getQuakeFilter().key !== filter.key || !toggleForLayer('earthquakes')?.checked) return;
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
          'circle-color': 'rgba(101, 82, 154, 0)',
          'circle-stroke-color': '#65529a',
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
          'circle-color': '#65529a',
          'circle-opacity': 0.86,
          'circle-stroke-color': '#f2e9d7',
          'circle-stroke-width': 1.1,
        },
      });
    }

    loadedQuakeKey = filter.key;
    loadedLayers.add('earthquakes');
    setStatus('earthquakes', `Earthquakes: ${data.features.length} USGS ${filter.label}.`, 'ready');
  }

  async function ensureVolcanoes() {
    if (loadedLayers.has('volcanoes')) return;

    setStatus('volcanoes', 'Loading regional volcano reference locations.', 'loading');
    const data = {
      type: 'FeatureCollection',
      features: VOLCANO_REFERENCES.map((volcano) => ({
        type: 'Feature',
        id: volcano.id,
        geometry: { type: 'Point', coordinates: volcano.coordinates },
        properties: {
          id: volcano.id,
          name: volcano.name,
          jurisdiction: volcano.jurisdiction,
          mapUrl: volcano.mapUrl,
          sourceUrl: volcano.sourceUrl,
        },
      })),
    };

    map.addSource('atlas-volcanoes', { type: 'geojson', data });
    map.addLayer({
      id: 'atlas-volcano-halo',
      type: 'circle',
      source: 'atlas-volcanoes',
      paint: {
        'circle-radius': 11,
        'circle-color': 'rgba(152, 81, 57, 0.09)',
        'circle-stroke-color': 'rgba(152, 81, 57, 0.36)',
        'circle-stroke-width': 1,
      },
    });
    map.addLayer({
      id: 'atlas-volcano-points',
      type: 'circle',
      source: 'atlas-volcanoes',
      paint: {
        'circle-radius': 5.5,
        'circle-color': '#985139',
        'circle-opacity': 0.94,
        'circle-stroke-color': '#fbf7ee',
        'circle-stroke-width': 1.5,
      },
    });

    renderSourceRecords('volcanoes', [
      { id: 'usgs-cvo', label: 'USGS Cascades Volcano Observatory', url: 'https://www.usgs.gov/observatories/cvo', status: 'available', recordCount: 10 },
      { id: 'usgs-calvo', label: 'USGS California Volcano Observatory', url: 'https://www.usgs.gov/observatories/calvo/about-california-volcano-observatory', status: 'available', recordCount: 3 },
      { id: 'nrcan-volcanoes', label: 'Natural Resources Canada volcano information', url: 'https://chis.nrcan.gc.ca/volcano-volcan/can-vol-en.php', status: 'available', recordCount: 3 },
    ], '2026-07-15T12:00:00-07:00');
    loadedLayers.add('volcanoes');
    setStatus('volcanoes', `Volcano references: ${data.features.length} summits and volcanic centers. Open a point for official mapping.`, 'ready');
  }

  async function ensureFires() {
    let filter = getFireFilter();
    syncFireSummary();

    if (!fireCollection) {
      setStatus('fires', `Loading NIFC ${formatAcres(FIRE_BASE_ACRES)}+ acre perimeters since ${FIRE_BASE_YEAR}.`, 'loading');
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

      if (!firePromise) {
        firePromise = fetchJson(url)
          .then((data) => {
            fireCollection = {
              type: 'FeatureCollection',
              properties: data.properties || {},
              features: dedupeFireFeatures(data.features || []),
            };
          })
          .finally(() => {
            firePromise = null;
          });
      }
      await firePromise;
    }

    if (!toggleForLayer('fires')?.checked) return;
    filter = getFireFilter();
    syncFireSummary();

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
      const currentFirePointLayer = map.getLayer('atlas-live-fire-points') ? 'atlas-live-fire-points' : undefined;
      map.addLayer({
        id: 'atlas-fire-fill',
        type: 'fill',
        source: 'atlas-fires',
        paint: {
          'fill-color': '#c44737',
          'fill-opacity': 0.32,
        },
      }, currentFirePointLayer);
    }

    if (!map.getLayer('atlas-fire-line')) {
      const currentFirePointLayer = map.getLayer('atlas-live-fire-points') ? 'atlas-live-fire-points' : undefined;
      map.addLayer({
        id: 'atlas-fire-line',
        type: 'line',
        source: 'atlas-fires',
        paint: {
          'line-color': '#8e3027',
          'line-opacity': 0.82,
          'line-width': 1.2,
        },
      }, currentFirePointLayer);
    }

    loadedFireKey = filter.key;
    loadedLayers.add('fires');
    const capped = data.properties && data.properties.exceededTransferLimit ? ' capped' : '';
    setStatus('fires', `Historical wildfires: ${data.features.length}${capped} NIFC ${formatAcres(filter.acres)}+ acre perimeters since ${filter.year}.`, 'ready');
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
      setStatus('floods', 'Floods: river corridors shown; FEMA zones load as you zoom in.', 'ready');
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

    setStatus('floods', 'Loading FEMA zones for this view.', 'loading');

    try {
      const data = await fetchFloodPages(bbox, floodPlan, floodAbort.signal);
      if (!toggleForLayer('floods')?.checked) return;
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
        'fill-color': '#075a78',
        'fill-opacity': 0.42,
      },
    });

    map.addLayer({
      id: 'atlas-flood-line-halo',
      type: 'line',
      source: 'atlas-floods',
      paint: {
        'line-color': '#fbf7ee',
        'line-opacity': 0.82,
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 2.4, 8, 3.6, 11, 5],
      },
    });

    map.addLayer({
      id: 'atlas-flood-line',
      type: 'line',
      source: 'atlas-floods',
      paint: {
        'line-color': '#063b5c',
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
      if (!feature) {
        const forecastToggle = toggles.find((input) => input.dataset.atlasLayer === 'forecast-wind');
        if (forecastToggle?.checked && activeForecast) {
          showForecastPointPopup(event.lngLat, popup);
        }
        return;
      }

      const html = renderFeaturePopup(feature);
      if (!html) return;

      forecastPointAbort?.abort();

      popup
        .setLngLat(event.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    map.on('mousemove', (event) => {
      const forecastToggle = toggles.find((input) => input.dataset.atlasLayer === 'forecast-wind');
      map.getCanvas().style.cursor = firstAtlasFeature(event.point)
        ? 'pointer'
        : forecastToggle?.checked ? 'crosshair' : '';
    });

    map.on('mouseleave', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('moveend', () => {
      queueVisibleRecordIndexUpdate();
      clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        const floodToggle = toggles.find((input) => input.dataset.atlasLayer === 'floods');
        if (floodToggle && floodToggle.checked) {
          loadLayerSafely('floods');
        }
      }, 240);
    });

    window.setInterval(() => {
      const liveToggle = toggles.find((input) => input.dataset.atlasLayer === 'live');
      if (liveToggle?.checked && !document.hidden) {
        loadLayerSafely('live');
      }
    }, LIVE_REFRESH_MS);

    window.setInterval(() => {
      const windToggle = toggles.find((input) => input.dataset.atlasLayer === 'wind');
      if (windToggle?.checked && !document.hidden) {
        loadLayerSafely('wind');
      }
    }, WIND_REFRESH_MS);

    window.setInterval(() => {
      const forecastToggle = toggles.find((input) => input.dataset.atlasLayer === 'forecast-wind');
      if (forecastToggle?.checked && !document.hidden) {
        loadLayerSafely('forecast-wind');
      }
    }, FORECAST_REFRESH_MS);
  }

  async function showForecastPointPopup(lngLat, popup) {
    if (!activeForecast?.pointEndpoint) return;

    forecastPointAbort?.abort();
    forecastPointAbort = new AbortController();
    popup
      .setLngLat(lngLat)
      .setHTML('<h4>Forecast wind</h4><p>Loading model guidance for this point.</p>')
      .addTo(map);

    const url = new URL(activeForecast.pointEndpoint);
    url.searchParams.set('lat', String(lngLat.lat));
    url.searchParams.set('lon', String(lngLat.lng));
    url.searchParams.set('time', activeForecast.validAt);
    url.searchParams.set('run', activeForecast.runAt);

    try {
      const data = await fetchJson(url.toString(), { signal: forecastPointAbort.signal });
      popup.setHTML(forecastPointPopup(data));
    } catch (error) {
      if (error.name === 'AbortError') return;
      popup.setHTML('<h4>Forecast wind unavailable</h4><p>The model value for this point could not be retrieved. Try again shortly.</p>');
    }
  }

  async function readForecastAtMapCenter() {
    if (!centerForecastOutput) return;
    if (!map || !activeForecast?.pointEndpoint) {
      centerForecastOutput.textContent = 'Forecast guidance is not ready yet.';
      return;
    }

    centerForecastAbort?.abort();
    centerForecastAbort = new AbortController();
    centerForecastOutput.textContent = 'Loading the model value at the map center.';
    const center = map.getCenter();
    const url = new URL(activeForecast.pointEndpoint);
    url.searchParams.set('lat', String(center.lat));
    url.searchParams.set('lon', String(center.lng));
    url.searchParams.set('time', activeForecast.validAt);
    url.searchParams.set('run', activeForecast.runAt);

    try {
      const data = await fetchJson(url.toString(), { signal: centerForecastAbort.signal });
      const speed = Number(data.speedKmh);
      const direction = Number(data.directionDegrees);
      const windFrom = data.directionCardinal || (Number.isFinite(direction) ? `${Math.round(direction)}°` : 'an unreported direction');
      const windToward = Number.isFinite(direction) ? cardinalDirectionLabel((direction + 180) % 360) : '';
      const valid = data.validAt ? ` Valid ${formatPopupDate(data.validAt)}.` : '';
      const latitude = `${Math.abs(center.lat).toFixed(2)}° ${center.lat >= 0 ? 'N' : 'S'}`;
      const longitude = `${Math.abs(center.lng).toFixed(2)}° ${center.lng >= 0 ? 'E' : 'W'}`;
      centerForecastOutput.textContent = `At ${latitude}, ${longitude}: ${Number.isFinite(speed) ? `${Math.round(speed)} km/h` : 'speed not reported'}, from ${windFrom}${windToward ? ` toward ${windToward}` : ''}.${valid} ${Number(data.resolutionKm) || 10} km model guidance; nearby terrain can produce different wind.`;
    } catch (error) {
      if (error.name === 'AbortError') return;
      centerForecastOutput.textContent = 'The model value at the map center could not be retrieved. Try again shortly.';
    }
  }

  function firstAtlasFeature(point) {
    const layers = [
      'atlas-wind-observation-arrows',
      'atlas-wind-observation-halo',
      'atlas-live-fire-points',
      'atlas-live-road-points',
      'atlas-live-evac-fill',
      'atlas-live-perimeter-fill',
      'atlas-live-alert-fill',
      'atlas-quake-points',
      'atlas-fire-fill',
      'atlas-flood-fill',
      'atlas-flood-corridor-line',
      'atlas-volcano-points',
      'atlas-volcano-halo',
    ]
      .filter((id) => map.getLayer(id));
    if (!layers.length) return null;
    return map.queryRenderedFeatures(point, { layers })[0] || null;
  }

  function renderFeaturePopup(feature) {
    if (!feature || !feature.layer) return '';
    if (feature.layer.id === 'atlas-wind-observation-arrows' || feature.layer.id === 'atlas-wind-observation-halo') {
      return windObservationPopup(feature.properties || {});
    }
    if (feature.layer.id === 'atlas-live-fire-points') return liveFirePopup(feature.properties || {});
    if (feature.layer.id === 'atlas-live-road-points') return roadAlertPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-live-evac-fill') return evacuationPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-live-perimeter-fill') return livePerimeterPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-live-alert-fill') return weatherAlertPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-quake-points') return quakePopup(feature.properties || {});
    if (feature.layer.id === 'atlas-fire-fill') return firePopup(feature.properties || {});
    if (feature.layer.id === 'atlas-flood-fill') return floodPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-flood-corridor-line') return floodCorridorPopup(feature.properties || {});
    if (feature.layer.id === 'atlas-volcano-points' || feature.layer.id === 'atlas-volcano-halo') return volcanoPopup(feature.properties || {});
    return '';
  }

  function liveFirePopup(props) {
    const acres = props.acres === null || props.acres === '' ? NaN : Number(props.acres);
    const containment = props.containment === null || props.containment === '' ? NaN : Number(props.containment);
    const location = [props.city || '', props.county ? `${props.county} County` : '', props.state || ''].filter(Boolean).join(', ');
    return [
      `<h4>${escapeHtml(props.name || 'Current wildfire')}</h4>`,
      location ? `<p>${escapeHtml(location)}</p>` : '',
      `<p>${Number.isFinite(acres) ? `${Math.round(acres).toLocaleString()} acres` : 'Acreage not reported'} · ${Number.isFinite(containment) ? `${Math.round(containment)}% contained` : 'Containment not reported'}</p>`,
      props.stageOfControl ? `<p>Stage of control: ${escapeHtml(props.stageOfControl)}</p>` : '',
      props.derivedFromPerimeter ? '<p>Marker placed from the reported perimeter because a separate incident point was unavailable.</p>' : '',
      props.updatedAt ? `<p>Updated ${escapeHtml(formatPopupDate(props.updatedAt))}</p>` : '',
      popupSourceLink(props.evacuationSourceUrl || props.sourceUrl, props.evacuationSourceUrl ? 'Official evacuation source' : 'Official fire source'),
    ].join('');
  }

  function windObservationPopup(props) {
    const speed = Number(props.speedKmh);
    const gust = props.gustKmh === null || props.gustKmh === '' ? NaN : Number(props.gustKmh);
    const direction = Number(props.direction);
    const windFrom = props.directionCardinal || (Number.isFinite(direction) ? `${Math.round(direction)}°` : 'an unreported direction');
    const bearing = Number(props.bearing);
    const windToward = Number.isFinite(bearing) ? cardinalDirectionLabel(bearing) : '';
    return [
      `<h4>${escapeHtml(props.stationName || 'Wind observation')}</h4>`,
      `<p class="atlas-wind-reading"><strong>${Number.isFinite(speed) ? `${Math.round(speed)} km/h` : 'Speed not reported'}</strong><span>From ${escapeHtml(windFrom)}${windToward ? ` &rarr; toward ${escapeHtml(windToward)}` : ''}</span></p>`,
      Number.isFinite(gust) ? `<p>Gusting to ${Math.round(gust)} km/h.</p>` : '',
      props.observedAt ? `<p>Observed ${escapeHtml(formatObservationAge(props.observedAt))} · ${escapeHtml(formatPopupDate(props.observedAt))}</p>` : '',
      '<p>Station observation, not a continuous wind field or forecast. Nearby terrain can produce very different wind.</p>',
      popupSourceLink(props.sourceUrl, 'Official observation source'),
    ].join('');
  }

  function forecastPointPopup(data) {
    const speed = Number(data.speedKmh);
    const direction = Number(data.directionDegrees);
    const windFrom = data.directionCardinal || (Number.isFinite(direction) ? `${Math.round(direction)}°` : 'an unreported direction');
    const windToward = Number.isFinite(direction) ? cardinalDirectionLabel((direction + 180) % 360) : '';
    return [
      '<h4>Forecast wind</h4>',
      `<p class="atlas-wind-reading"><strong>${Number.isFinite(speed) ? `${Math.round(speed)} km/h` : 'Speed not reported'}</strong><span>From ${escapeHtml(windFrom)}${windToward ? ` &rarr; toward ${escapeHtml(windToward)}` : ''}</span></p>`,
      data.validAt ? `<p>Valid ${escapeHtml(formatPopupDate(data.validAt))} · Model run ${escapeHtml(formatPopupDate(data.runAt))}</p>` : '',
      `<p>${Number(data.resolutionKm) || 10} km model guidance, not an observation or a prediction of fire or smoke movement. The model smooths mountain terrain; local wind and gusts can differ sharply.</p>`,
      popupSourceLink(data.sourceUrl, 'Official forecast source'),
    ].join('');
  }

  function cardinalDirectionLabel(direction) {
    if (!Number.isFinite(direction)) return '';
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return labels[Math.round((((direction % 360) + 360) % 360) / 45) % labels.length];
  }

  function livePerimeterPopup(props) {
    const acres = props.acres === null || props.acres === '' ? NaN : Number(props.acres);
    return [
      `<h4>${escapeHtml(props.name || 'Current fire perimeter')}</h4>`,
      `<p>${Number.isFinite(acres) ? `${Math.round(acres).toLocaleString()} mapped acres` : 'Mapped acreage not reported'}</p>`,
      props.updatedAt ? `<p>Perimeter updated ${escapeHtml(formatPopupDate(props.updatedAt))}</p>` : '',
      '<p>Perimeters can lag changing fire conditions.</p>',
      popupSourceLink(props.sourceUrl, 'Official fire source'),
    ].join('');
  }

  function evacuationPopup(props) {
    return [
      `<h4>${escapeHtml(props.label || 'Evacuation area')}</h4>`,
      `<p>${escapeHtml(props.incidentName || 'Chelan County incident')}</p>`,
      Number(props.level) >= 3 ? '<p><strong>Leave now and follow official instructions.</strong></p>' : '',
      props.updatedAt ? `<p>Updated ${escapeHtml(formatPopupDate(props.updatedAt))}</p>` : '',
      popupSourceLink(props.sourceUrl, 'Official evacuation source'),
    ].join('');
  }

  function weatherAlertPopup(props) {
    return [
      `<h4>${escapeHtml(props.event || 'Weather alert')}</h4>`,
      props.headline ? `<p>${escapeHtml(props.headline)}</p>` : '',
      props.area ? `<p>${escapeHtml(props.area)}</p>` : '',
      props.endsAt ? `<p>Ends ${escapeHtml(formatPopupDate(props.endsAt))}</p>` : '',
      popupSourceLink(props.sourceUrl, 'Official weather alert'),
    ].join('');
  }

  function roadAlertPopup(props) {
    return [
      `<h4>${escapeHtml(props.event || 'Highway alert')}</h4>`,
      `<p>${escapeHtml(props.headline || props.road || 'WSDOT alert')}</p>`,
      props.updatedAt ? `<p>Updated ${escapeHtml(formatPopupDate(props.updatedAt))}</p>` : '',
      popupSourceLink(props.sourceUrl, 'Official road source'),
    ].join('');
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

  function volcanoPopup(props) {
    return [
      `<h4>${escapeHtml(props.name || 'Volcano reference')}</h4>`,
      props.jurisdiction ? `<p>${escapeHtml(props.jurisdiction)}</p>` : '',
      '<p>Reference location only—not a hazard zone, ash forecast, closure, or current status.</p>',
      popupSourceLink(props.mapUrl, 'Official hazard information and maps'),
      popupSourceLink(props.sourceUrl, 'Official volcano science'),
      '<p><a href="volcano.html">Read the Cascadia.me Volcano guide</a></p>',
    ].join('');
  }

  function popupSourceLink(value, label) {
    if (typeof value !== 'string' || !value.startsWith('https://')) return '';
    return `<p><a href="${escapeHtml(value)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></p>`;
  }

  function formatPopupDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'time not reported';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function formatObservationAge(value) {
    const timestamp = Date.parse(value || '');
    if (!Number.isFinite(timestamp)) return 'at an unreported time';
    const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
    if (minutes < 60) return minutes <= 1 ? 'just now' : `${minutes} minutes ago`;
    return `${Math.round(minutes / 60)} hours ago`;
  }

  function wireDialog(dialog, openButtons, closeButtons) {
    if (!dialog || openButtons.length === 0) return;
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

  function initSourceModal() {
    const dialog = document.querySelector('[data-atlas-sources]');
    wireDialog(
      dialog,
      Array.from(atlas.querySelectorAll('[data-atlas-sources-open]')),
      Array.from(dialog?.querySelectorAll('[data-atlas-sources-close]') || [])
    );
  }

  function initCaveatsModal() {
    const dialog = document.querySelector('[data-atlas-caveats]');
    wireDialog(
      dialog,
      Array.from(atlas.querySelectorAll('[data-atlas-caveats-open]')),
      Array.from(dialog?.querySelectorAll('[data-atlas-caveats-close]') || [])
    );
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
      initAtlas().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          initAtlas().catch(() => {});
        }
      });
    }, { rootMargin: '280px 0px' });

    observer.observe(atlas);
  }

  if (loadButton) {
    loadButton.addEventListener('click', () => {
      initAtlas().catch(() => {});
    });
  }

  centerForecastButton?.addEventListener('click', () => {
    readForecastAtMapCenter();
  });

  toggles.forEach((input) => {
    input.addEventListener('change', async () => {
      const layer = input.dataset.atlasLayer;
      syncControlPresentation();
      if (input.checked) {
        try {
          await initAtlas();
          await loadLayerSafely(layer);
        } catch (error) {
          setStatus(layer, 'Layer waiting for the map to become available.', 'error');
        }
      } else {
        setLayerVisibility(layer, false);
        if (layer === 'forecast-wind') forecastPointAbort?.abort();
        if (layer === 'floods') {
          floodAbort?.abort();
          lastFloodKey = '';
        }
      }
      syncControlPresentation();
    });
  });

  async function applyFilteredLayer(layer) {
    if (layer === 'earthquakes') syncQuakeSummary();
    if (layer === 'fires') syncFireSummary();

    const toggle = toggles.find((input) => input.dataset.atlasLayer === layer);
    if (!toggle || !toggle.checked) return;

    try {
      await initAtlas();
      await loadLayerSafely(layer);
    } catch (error) {
      setStatus(layer, 'Layer waiting for the map to become available.', 'error');
    }
  }

  resetLayersButton?.addEventListener('click', async () => {
    toggles.forEach((input) => {
      input.checked = input.dataset.atlasLayer === 'live';
      setLayerVisibility(input.dataset.atlasLayer, input.checked);
    });
    if (forecastOffsetControl) forecastOffsetControl.value = '0';
    if (quakeWindowControl) quakeWindowControl.value = '1900';
    if (quakeMagnitudeControl) quakeMagnitudeControl.value = '5';
    if (fireYearControl) fireYearControl.value = String(FIRE_BASE_YEAR);
    if (fireAcresControl) fireAcresControl.value = String(FIRE_BASE_ACRES);
    atlas.querySelectorAll('.atlas-refine').forEach((refine) => {
      refine.open = false;
    });
    syncQuakeSummary();
    syncFireSummary();
    floodAbort?.abort();
    forecastPointAbort?.abort();
    lastFloodKey = '';
    atlas.querySelectorAll('[data-atlas-family]').forEach((family) => {
      family.open = family.dataset.atlasFamily === 'current';
    });
    syncControlPresentation();
    try {
      await initAtlas();
      await loadLayerSafely('live');
    } catch (error) {
      setStatus('live', 'Current reports are waiting for the map to become available.', 'error');
    }
  });

  resetViewButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await initAtlas();
        fitCascadia();
      } catch (error) {
        setStatus('map', 'The regional view is unavailable until the map loads.', 'error');
      }
    });
  });

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

  forecastOffsetControl?.addEventListener('change', () => {
    applyFilteredLayer('forecast-wind');
  });

  syncQuakeSummary();
  syncFireSummary();
  setLayerControlState(false);
  initControlSheet();
  syncControlPresentation();
  initSourceModal();
  initCaveatsModal();
  observeAtlas();
})();
