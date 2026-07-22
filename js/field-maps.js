(() => {
  "use strict";

  document.querySelectorAll("[data-print-page]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });

  const explorer = document.querySelector("[data-field-map-explorer]");
  if (!explorer) return;

  const MAPLIBRE_VERSION = "5.24.0";
  const MAPLIBRE_JS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`;
  const MAPLIBRE_CSS = `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`;
  const USGS_TOPO_TILES = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}";
  const REGIONAL_BOUNDS = [-124.95, 47.2, -122.55, 48.58];
  const MOBILE_QUERY = window.matchMedia("(max-width: 760px)");

  const mapNode = explorer.querySelector("[data-field-map-canvas]");
  const placeholder = explorer.querySelector("[data-field-map-placeholder]");
  const retryButton = explorer.querySelector("[data-field-map-retry]");
  const resetButton = explorer.querySelector("[data-field-map-reset]");
  const searchInput = explorer.querySelector("[data-field-map-search]");
  const filterButtons = Array.from(explorer.querySelectorAll("[data-field-map-job]"));
  const cards = Array.from(explorer.querySelectorAll("[data-field-map-source]"));
  const resultCount = explorer.querySelector("[data-field-map-result-count]");
  const emptyState = explorer.querySelector("[data-field-map-empty]");
  const resultList = explorer.querySelector("[data-field-map-results]");
  const resultSheet = explorer.querySelector("[data-field-map-sheet]");
  const sheetToggle = explorer.querySelector("[data-field-map-sheet-toggle]");
  const layerToggles = Array.from(explorer.querySelectorAll("[data-field-map-layer]"));
  const layerCount = explorer.querySelector("[data-field-map-layer-count]");

  const parseNumbers = (value, expected) => {
    const numbers = String(value || "").split(",").map(Number);
    return numbers.length === expected && numbers.every(Number.isFinite) ? numbers : null;
  };

  const sourceFeatures = {
    type: "FeatureCollection",
    features: cards.map((card) => ({
      type: "Feature",
      id: card.dataset.fieldMapSource,
      properties: {
        sourceId: card.dataset.fieldMapSource,
        title: card.querySelector("strong")?.textContent?.trim() || "Official source",
      },
      geometry: {
        type: "Point",
        coordinates: parseNumbers(card.dataset.fieldMapPoint, 2),
      },
    })).filter((feature) => feature.geometry.coordinates),
  };

  const verifiedSheets = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "usgs-us-topo-7165-20230817",
        properties: { sourceId: "terrain-maps", name: "Cape Flattery", edition: "2023" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-124.750015, 48.375005], [-124.625015, 48.375005],
            [-124.625015, 48.500005], [-124.750015, 48.500005],
            [-124.750015, 48.375005],
          ]],
        },
      },
      {
        type: "Feature",
        id: "usgs-us-topo-30739-20230818",
        properties: { sourceId: "terrain-maps", name: "Mount Olympus", edition: "2023" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-123.750015, 47.750005], [-123.625015, 47.750005],
            [-123.625015, 47.875005], [-123.750015, 47.875005],
            [-123.750015, 47.750005],
          ]],
        },
      },
      {
        type: "Feature",
        id: "usgs-us-topo-36018-20230815",
        properties: { sourceId: "terrain-maps", name: "Port Angeles", edition: "2023" },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-123.500015, 48.000006], [-123.375015, 48.000006],
            [-123.375015, 48.125006], [-123.500015, 48.125006],
            [-123.500015, 48.000006],
          ]],
        },
      },
    ],
  };

  const sourceBounds = new Map(
    cards.map((card) => [
      card.dataset.fieldMapSource,
      parseNumbers(card.dataset.fieldMapBounds, 4),
    ])
  );

  let map = null;
  let mapLoadTimeout = null;
  let initPromise = null;
  let selectedSource = "trail-maps";
  let activeJob = "all";
  let searchTerm = "";
  let visibleSourceIds = cards.map((card) => card.dataset.fieldMapSource);

  function loadStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", reject, { once: true });
      document.head.appendChild(link);
    });
  }

  function loadScript(src) {
    if (window.maplibregl) return Promise.resolve();
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function mapStyle() {
    return {
      version: 8,
      sources: {
        "usgs-topo": {
          type: "raster",
          tiles: [USGS_TOPO_TILES],
          tileSize: 256,
          attribution: '<a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">USGS The National Map</a>',
        },
        "field-map-sources": { type: "geojson", data: sourceFeatures },
        "verified-sheets": { type: "geojson", data: verifiedSheets },
      },
      layers: [
        {
          id: "usgs-topo",
          type: "raster",
          source: "usgs-topo",
          paint: { "raster-opacity": 0.9, "raster-saturation": -0.22 },
        },
        {
          id: "verified-sheets-fill",
          type: "fill",
          source: "verified-sheets",
          paint: { "fill-color": "#e2b449", "fill-opacity": 0.2 },
        },
        {
          id: "verified-sheets-line",
          type: "line",
          source: "verified-sheets",
          paint: { "line-color": "#9a561b", "line-width": 2, "line-dasharray": [2, 1.2] },
        },
        {
          id: "verified-sheets-selected",
          type: "line",
          source: "verified-sheets",
          filter: ["==", ["get", "sourceId"], "terrain-maps"],
          paint: { "line-color": "#bd4d3c", "line-width": 4 },
        },
        {
          id: "field-map-source-points",
          type: "circle",
          source: "field-map-sources",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "match", ["get", "sourceId"],
              "trail-maps", "#315f48",
              "terrain-maps", "#bd4d3c",
              "vehicle-access", "#123f51",
              "#237e89",
            ],
            "circle-stroke-color": "#fbf7ee",
            "circle-stroke-width": 3,
          },
        },
        {
          id: "field-map-source-selected",
          type: "circle",
          source: "field-map-sources",
          filter: ["==", ["get", "sourceId"], selectedSource],
          paint: {
            "circle-radius": 14,
            "circle-color": "rgba(255,255,255,0)",
            "circle-stroke-color": "#bd4d3c",
            "circle-stroke-width": 4,
          },
        },
      ],
    };
  }

  function setSheetState(expanded) {
    if (!resultSheet || !sheetToggle) return;
    resultSheet.dataset.sheetState = expanded ? "expanded" : "compact";
    sheetToggle.setAttribute("aria-expanded", String(expanded));
    const label = sheetToggle.querySelector(".sr-only");
    if (label) label.textContent = expanded ? "Collapse source results" : "Expand source results";
  }

  function updateUrl() {
    const url = new URL(window.location.href);
    const hashSource = url.hash.replace(/^#/, "");
    const hashSelectsDifferentSource = cards.some(
      (card) => card.dataset.fieldMapSource === hashSource && hashSource !== selectedSource
    );
    if (activeJob === "all") url.searchParams.delete("job");
    else url.searchParams.set("job", activeJob);
    if (selectedSource === "trail-maps" && !hashSelectsDifferentSource) url.searchParams.delete("source");
    else url.searchParams.set("source", selectedSource);
    if (searchTerm) url.searchParams.set("q", searchTerm);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function mapPadding() {
    return MOBILE_QUERY.matches
      ? { top: 72, right: 28, bottom: 245, left: 28 }
      : { top: 72, right: 72, bottom: 72, left: 72 };
  }

  function fitBounds(bounds, maxZoom = 9.5) {
    if (!map || !bounds) return;
    map.fitBounds(
      [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
      { padding: mapPadding(), maxZoom, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650 }
    );
  }

  function fitRegionalView() {
    fitBounds(REGIONAL_BOUNDS, 8.4);
  }

  function updateSelectedLayers() {
    if (!map?.getLayer("field-map-source-selected")) return;
    map.setFilter("field-map-source-selected", [
      "all",
      ["==", ["get", "sourceId"], selectedSource],
      ["in", ["get", "sourceId"], ["literal", visibleSourceIds]],
    ]);
    map.setFilter("verified-sheets-selected", [
      "all",
      ["==", ["get", "sourceId"], selectedSource],
      ["in", ["get", "sourceId"], ["literal", visibleSourceIds]],
    ]);
  }

  function selectSource(sourceId, options = {}) {
    const card = cards.find((item) => item.dataset.fieldMapSource === sourceId && !item.hidden);
    if (!card) return;

    selectedSource = sourceId;
    cards.forEach((item) => {
      const selected = item === card;
      item.classList.toggle("is-selected", selected);
      item.querySelector(".fm-result-select")?.setAttribute("aria-pressed", String(selected));
    });

    updateSelectedLayers();
    if (options.focusMap !== false) fitBounds(sourceBounds.get(sourceId));
    if (options.updateUrl !== false) updateUrl();

    if (options.fromMap && MOBILE_QUERY.matches) {
      setSheetState(false);
      if (resultList) resultList.scrollTop = Math.max(0, card.offsetTop - resultList.offsetTop - 8);
    }
  }

  function updateMapFilters() {
    if (!map?.getLayer("field-map-source-points")) return;
    const sourceFilter = ["in", ["get", "sourceId"], ["literal", visibleSourceIds]];
    map.setFilter("field-map-source-points", sourceFilter);
    map.setFilter("verified-sheets-fill", sourceFilter);
    map.setFilter("verified-sheets-line", sourceFilter);
    updateSelectedLayers();
  }

  function applyFilters(options = {}) {
    visibleSourceIds = [];
    cards.forEach((card) => {
      const jobs = (card.dataset.fieldMapJobs || "").split(/\s+/);
      const searchable = (card.dataset.fieldMapSearchText || "").toLowerCase();
      const matchesJob = activeJob === "all" || jobs.includes(activeJob);
      const matchesSearch = !searchTerm || searchable.includes(searchTerm.toLowerCase());
      const visible = matchesJob && matchesSearch;
      card.hidden = !visible;
      if (visible) visibleSourceIds.push(card.dataset.fieldMapSource);
    });

    const count = visibleSourceIds.length;
    if (resultCount) resultCount.textContent = `${count} ${count === 1 ? "source" : "sources"}`;
    if (emptyState) emptyState.hidden = count !== 0;

    filterButtons.forEach((button) => {
      const active = button.dataset.fieldMapJob === activeJob;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (count && !visibleSourceIds.includes(selectedSource)) {
      selectSource(visibleSourceIds[0], { updateUrl: false });
    } else {
      updateMapFilters();
    }

    if (options.updateUrl !== false) updateUrl();
  }

  function updateLayerVisibility() {
    if (!map) return;
    let enabled = 0;
    layerToggles.forEach((toggle) => {
      const visible = toggle.checked;
      if (visible) enabled += 1;
      const ids = toggle.dataset.fieldMapLayer === "sources"
        ? ["field-map-source-points", "field-map-source-selected"]
        : ["verified-sheets-fill", "verified-sheets-line", "verified-sheets-selected"];
      ids.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      });
    });
    if (layerCount) layerCount.textContent = `${enabled} on`;
  }

  function showMapError() {
    window.clearTimeout(mapLoadTimeout);
    explorer.classList.remove("is-map-ready");
    explorer.classList.add("has-map-error");
    if (placeholder) {
      placeholder.hidden = false;
      const title = placeholder.querySelector("strong");
      const note = placeholder.querySelector("span");
      if (title) title.textContent = "The optional map could not load";
      if (note) note.textContent = "Use the source results and full official records below, or try again.";
    }
    if (retryButton) retryButton.hidden = false;
  }

  function wireMapInteractions() {
    ["field-map-source-points", "verified-sheets-fill"].forEach((layerId) => {
      map.on("click", layerId, (event) => {
        const sourceId = event.features?.[0]?.properties?.sourceId;
        if (sourceId) selectSource(sourceId, { fromMap: true });
      });
      map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
    });
  }

  async function initMap() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      try {
        explorer.classList.remove("has-map-error");
        if (retryButton) retryButton.hidden = true;
        await Promise.all([loadStylesheet(MAPLIBRE_CSS), loadScript(MAPLIBRE_JS)]);

        map = new window.maplibregl.Map({
          container: mapNode,
          style: mapStyle(),
          center: [-123.75, 47.9],
          zoom: 6.25,
          minZoom: 5,
          maxZoom: 14,
          cooperativeGestures: true,
          attributionControl: false,
        });

        map.addControl(new window.maplibregl.NavigationControl({
          showCompass: !MOBILE_QUERY.matches,
          visualizePitch: false,
        }), "bottom-right");
        map.addControl(new window.maplibregl.AttributionControl({ compact: true }), "bottom-left");

        await new Promise((resolve, reject) => {
          map.once("load", resolve);
          mapLoadTimeout = window.setTimeout(() => reject(new Error("Map load timeout")), 15_000);
        });
        window.clearTimeout(mapLoadTimeout);

        explorer.classList.add("is-map-ready");
        if (placeholder) placeholder.hidden = true;
        wireMapInteractions();
        updateMapFilters();
        updateLayerVisibility();
        fitBounds(sourceBounds.get(selectedSource));
      } catch (error) {
        if (map) {
          try { map.remove(); } catch (removeError) { /* Partially loaded maps may not remove cleanly. */ }
        }
        map = null;
        initPromise = null;
        showMapError();
      }
    })();

    return initPromise;
  }

  cards.forEach((card) => {
    card.querySelector(".fm-result-select")?.addEventListener("click", () => {
      selectSource(card.dataset.fieldMapSource);
      if (MOBILE_QUERY.matches) setSheetState(false);
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeJob = button.dataset.fieldMapJob;
      applyFilters();
      if (MOBILE_QUERY.matches) setSheetState(true);
    });
  });

  searchInput?.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    applyFilters();
    if (MOBILE_QUERY.matches) setSheetState(true);
  });

  resetButton?.addEventListener("click", fitRegionalView);
  retryButton?.addEventListener("click", initMap);
  layerToggles.forEach((toggle) => toggle.addEventListener("change", updateLayerVisibility));
  let suppressSheetClick = false;
  sheetToggle?.addEventListener("click", () => {
    if (suppressSheetClick) return;
    setSheetState(resultSheet?.dataset.sheetState !== "expanded");
  });

  let dragStartY = null;
  sheetToggle?.addEventListener("pointerdown", (event) => {
    dragStartY = event.clientY;
    sheetToggle.setPointerCapture?.(event.pointerId);
  });
  sheetToggle?.addEventListener("pointerup", (event) => {
    if (dragStartY === null) return;
    const distance = event.clientY - dragStartY;
    dragStartY = null;
    if (Math.abs(distance) < 32) return;
    suppressSheetClick = true;
    setSheetState(distance < 0);
    window.requestAnimationFrame(() => { suppressSheetClick = false; });
  });
  sheetToggle?.addEventListener("pointercancel", () => { dragStartY = null; });

  explorer.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && MOBILE_QUERY.matches) setSheetState(false);
  });

  const initialUrl = new URL(window.location.href);
  const requestedJob = initialUrl.searchParams.get("job");
  const requestedSource = initialUrl.searchParams.get("source") || initialUrl.hash.replace(/^#/, "");
  const requestedSearch = initialUrl.searchParams.get("q") || "";
  if (filterButtons.some((button) => button.dataset.fieldMapJob === requestedJob)) activeJob = requestedJob;
  if (cards.some((card) => card.dataset.fieldMapSource === requestedSource)) selectedSource = requestedSource;
  if (requestedSearch && searchInput) {
    searchTerm = requestedSearch;
    searchInput.value = requestedSearch;
  }

  applyFilters({ updateUrl: false });
  selectSource(selectedSource, { updateUrl: false, focusMap: false });
  window.requestAnimationFrame(() => { initMap(); });
})();
