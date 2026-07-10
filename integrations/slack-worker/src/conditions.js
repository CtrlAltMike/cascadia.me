const CACHE_SECONDS = 120;
const SOURCE_TIMEOUT_MS = 9_000;
const MAX_SOURCE_BYTES = 6 * 1024 * 1024;
const FIRE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const STALE_SOURCE_MS = 24 * 60 * 60 * 1000;
const PNW_US_BOUNDS = [-125.2, 42, -116.4, 49.1];
const CASCADIA_BOUNDS = [-128.4, 39.7, -115.6, 52.6];
const BC_CASCADIA_BOUNDS = [-128.4, 48, -115.6, 52.6];
const HECTARES_TO_ACRES = 2.47105;
const ACTIVE_BC_FIRE_STATUSES = new Set([
  "being held",
  "fire of note",
  "out of control",
  "under control",
]);

const WFIGS_INCIDENTS =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query";
const WFIGS_PERIMETERS =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query";
const BCWS_ACTIVE_FIRES =
  "https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query";
const BCWS_FIRE_PERIMETERS =
  "https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0/query";
const CHELAN_EVACUATIONS =
  "https://services6.arcgis.com/kL9uP9rflLEjUDsy/arcgis/rest/services/Emergency_Management_Layers_View/FeatureServer/2/query";
const NWS_ALERTS = "https://api.weather.gov/alerts/active?area=WA";
const WSDOT_ALERTS =
  "https://wsdot.wa.gov/traffic/api/HighwayAlerts/HighwayAlertsREST.svc/GetAlertsAsJson";

const SOURCE_DEFINITIONS = {
  fires: {
    id: "nifc-fires",
    label: "NIFC current fire incidents",
    url: "https://www.nifc.gov/fire-information/maps",
  },
  perimeters: {
    id: "nifc-perimeters",
    label: "NIFC current fire perimeters",
    url: "https://www.nifc.gov/fire-information/maps",
  },
  bcFires: {
    id: "bcws-fires",
    label: "BC Wildfire Service current fire incidents",
    url: "https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation",
  },
  bcPerimeters: {
    id: "bcws-perimeters",
    label: "BC Wildfire Service current fire perimeters",
    url: "https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation",
  },
  alerts: {
    id: "nws-alerts",
    label: "National Weather Service alerts",
    url: "https://www.weather.gov/alerts",
  },
  evacuations: {
    id: "chelan-evacuations",
    label: "Chelan County evacuation zones",
    url: "https://www.co.chelan.wa.us/emergency-management/pages/active-emergencies",
  },
  roads: {
    id: "wsdot-highway-alerts",
    label: "WSDOT highway alerts",
    url: "https://wsdot.wa.gov/traffic/api/",
  },
};

const COUNTY_EVACUATION_SOURCES = {
  Chelan: {
    name: "Chelan County Emergency Management",
    url: "https://www.co.chelan.wa.us/emergency-management/pages/active-emergencies",
  },
  Kittitas: {
    name: "Kittitas County Emergency Management",
    url: "https://www.co.kittitas.wa.us/sheriff/emergency.aspx",
  },
  Okanogan: {
    name: "Okanogan County Emergency Management",
    url: "https://www.okanogancounty.gov/1861/ACTIVE-INCIDENTS",
  },
};

const RELEVANT_NWS_EVENTS = new Set([
  "Red Flag Warning",
  "Fire Weather Watch",
  "Extreme Fire Danger",
  "Flood Watch",
  "Flood Warning",
  "Flash Flood Warning",
  "Winter Storm Watch",
  "Winter Storm Warning",
  "Blizzard Warning",
  "Ice Storm Warning",
  "High Wind Warning",
]);

export async function handleConditionsRequest(request, env, ctx) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL("/conditions?schema=1", request.url), { method: "GET" });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const payload = await buildConditions(env);
    const status = payload.availableSources > 0 ? 200 : 503;
    const response = conditionsJsonResponse(payload, status, env);

    if (cache && status === 200) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (error) {
    console.error(JSON.stringify({
      event: "conditions_unhandled_error",
      error: error instanceof Error ? error.message : String(error),
    }));
    return conditionsJsonResponse({ error: "conditions_temporarily_unavailable" }, 503, env, 30);
  }
}

export function conditionsPreflightResponse(env) {
  return new Response(null, {
    status: 204,
    headers: conditionsHeaders(env, 0),
  });
}

export async function buildConditions(env = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const fetchImpl = options.fetchImpl || fetch;
  const tasks = [
    ["fires", () => fetchCurrentFires(fetchImpl, now)],
    ["perimeters", () => fetchCurrentPerimeters(fetchImpl, now)],
    ["bcFires", () => fetchCurrentBcFires(fetchImpl, now)],
    ["bcPerimeters", () => fetchCurrentBcPerimeters(fetchImpl, now)],
    ["alerts", () => fetchNwsAlerts(fetchImpl)],
    ["evacuations", () => fetchChelanEvacuations(fetchImpl)],
  ];

  if (env.WSDOT_ACCESS_CODE) {
    tasks.push(["roads", () => fetchWsdotAlerts(fetchImpl, env.WSDOT_ACCESS_CODE)]);
  }

  const settled = await Promise.allSettled(tasks.map(([, run]) => run()));
  const collections = {
    fires: emptyFeatureCollection(),
    perimeters: emptyFeatureCollection(),
    bcFires: emptyFeatureCollection(),
    bcPerimeters: emptyFeatureCollection(),
    alerts: emptyFeatureCollection(),
    evacuations: emptyFeatureCollection(),
    roads: emptyFeatureCollection(),
  };
  const sources = [];

  settled.forEach((result, index) => {
    const [key] = tasks[index];
    const definition = SOURCE_DEFINITIONS[key];

    if (result.status === "fulfilled") {
      collections[key] = result.value.collection;
      sources.push({
        ...definition,
        status: "available",
        recordCount: result.value.collection.features.length,
        updatedAt: result.value.updatedAt,
      });
      return;
    }

    console.warn(JSON.stringify({
      event: "conditions_source_unavailable",
      source: key,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    }));
    sources.push({
      ...definition,
      status: "unavailable",
      recordCount: 0,
      updatedAt: null,
    });
  });

  if (!env.WSDOT_ACCESS_CODE) {
    sources.push({
      ...SOURCE_DEFINITIONS.roads,
      status: "not_configured",
      recordCount: 0,
      updatedAt: null,
    });
  }

  collections.fires = mergeFeatureCollections(collections.fires, collections.bcFires);
  collections.perimeters = mergeFeatureCollections(collections.perimeters, collections.bcPerimeters);
  delete collections.bcFires;
  delete collections.bcPerimeters;

  const unavailableSources = sources.filter((source) => source.status === "unavailable").length;
  const availableSources = sources.filter((source) => source.status === "available").length;

  return {
    schemaVersion: 1,
    checkedAt: now.toISOString(),
    cacheSeconds: CACHE_SECONDS,
    region: {
      label: "Cascadia pilot: British Columbia, Washington, and Oregon",
      bounds: CASCADIA_BOUNDS,
    },
    availableSources,
    degraded: unavailableSources > 0,
    summary: {
      fireCount: collections.fires.features.length,
      perimeterCount: collections.perimeters.features.length,
      evacuationCount: collections.evacuations.features.length,
      weatherAlertCount: collections.alerts.features.length,
      roadAlertCount: collections.roads.features.length,
    },
    sources,
    evacuationCoverage: buildEvacuationCoverage(sources),
    ...collections,
  };
}

async function fetchCurrentFires(fetchImpl, now) {
  const url = arcgisQueryUrl(WFIGS_INCIDENTS, {
    where: "IncidentTypeCategory='WF' AND FireOutDateTime IS NULL AND (POOState='US-WA' OR POOState='US-OR')",
    outFields: [
      "IncidentName",
      "IncidentSize",
      "PercentContained",
      "FireDiscoveryDateTime",
      "ModifiedOnDateTime_dt",
      "POOCity",
      "POOCounty",
      "POOState",
      "IrwinID",
    ].join(","),
    resultRecordCount: "500",
  });
  const result = await fetchJson(fetchImpl, url, { accept: "application/geo+json" });
  const cutoff = now.getTime() - FIRE_WINDOW_MS;
  const features = validFeatures(result.data)
    .map((feature) => normalizeFireFeature(feature, now))
    .filter((feature) => {
      const properties = feature.properties;
      const latest = Date.parse(properties.updatedAt || properties.discoveredAt || "");
      return Number.isFinite(latest) && latest >= cutoff;
    })
    .sort(compareFireFeatures);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

async function fetchCurrentPerimeters(fetchImpl, now) {
  const url = arcgisQueryUrl(WFIGS_PERIMETERS, {
    where: "attr_IncidentTypeCategory='WF' AND attr_FireOutDateTime IS NULL AND (attr_POOState='US-WA' OR attr_POOState='US-OR')",
    outFields: [
      "poly_IncidentName",
      "poly_GISAcres",
      "poly_DateCurrent",
      "poly_PolygonDateTime",
      "poly_IRWINID",
      "attr_IncidentName",
      "attr_IncidentSize",
      "attr_PercentContained",
      "attr_ModifiedOnDateTime_dt",
    ].join(","),
    maxAllowableOffset: "0.00035",
    resultRecordCount: "500",
  });
  const result = await fetchJson(fetchImpl, url, { accept: "application/geo+json" });
  const cutoff = now.getTime() - FIRE_WINDOW_MS;
  const features = validFeatures(result.data)
    .map((feature) => normalizePerimeterFeature(feature, now))
    .filter((feature) => {
      const latest = Date.parse(feature.properties.updatedAt || "");
      return Number.isFinite(latest) && latest >= cutoff;
    });

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

async function fetchCurrentBcFires(fetchImpl, now) {
  const year = now.getUTCFullYear();
  const url = arcgisQueryUrl(BCWS_ACTIVE_FIRES, {
    // Status is deliberately not trusted as an upstream query filter. The
    // allowlist below fails closed if an out or unknown record is returned.
    where: `FIRE_YEAR = ${year}`,
    outFields: [
      "FIRE_YEAR",
      "IGNITION_DATE",
      "FIRE_STATUS",
      "FIRE_CENTRE",
      "ZONE",
      "CURRENT_SIZE",
      "INCIDENT_NAME",
      "FIRE_NUMBER",
      "FIRE_CAUSE",
      "GEOGRAPHIC_DESCRIPTION",
      "FIRE_URL",
      "FIRE_OF_NOTE_IND",
    ].join(","),
    resultRecordCount: "1000",
  }, BC_CASCADIA_BOUNDS);
  const result = await fetchJson(fetchImpl, url, { accept: "application/geo+json" });
  const features = validFeatures(result.data)
    .map(normalizeBcFireFeature)
    .filter(Boolean)
    .sort(compareFireFeatures);

  return {
    collection: featureCollection(features),
    updatedAt: result.lastModifiedAt,
  };
}

async function fetchCurrentBcPerimeters(fetchImpl, now) {
  const year = now.getUTCFullYear();
  const url = arcgisQueryUrl(BCWS_FIRE_PERIMETERS, {
    // Apply the same local allowlist used for points so a missed query clause
    // cannot put an extinguished fire back on the map.
    where: `FIRE_YEAR = ${year}`,
    outFields: [
      "FIRE_NUMBER",
      "VERSION_NUMBER",
      "FIRE_YEAR",
      "FIRE_SIZE_HECTARES",
      "TRACK_DATE",
      "LOAD_DATE",
      "FIRE_STATUS",
      "FIRE_URL",
    ].join(","),
    maxAllowableOffset: "0.00035",
    resultRecordCount: "1000",
  }, BC_CASCADIA_BOUNDS);
  const result = await fetchJson(fetchImpl, url, { accept: "application/geo+json" });
  const features = latestBcPerimeters(
    validFeatures(result.data)
      .map((feature) => normalizeBcPerimeterFeature(feature, now))
      .filter(Boolean)
  );

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

async function fetchChelanEvacuations(fetchImpl) {
  const url = arcgisQueryUrl(CHELAN_EVACUATIONS, {
    where: "PublicInfo='2' AND Status='2'",
    outFields: [
      "IncidentName",
      "TypeEng",
      "TypeSpn",
      "StartTime",
      "EndTime",
      "Status",
      "last_edited_date",
      "GlobalID",
    ].join(","),
    resultRecordCount: "100",
  }, [-121.25, 47.05, -119.7, 48.65]);
  const result = await fetchJson(fetchImpl, url, { accept: "application/geo+json" });
  const features = validFeatures(result.data).map(normalizeEvacuationFeature);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

async function fetchNwsAlerts(fetchImpl) {
  const result = await fetchJson(fetchImpl, NWS_ALERTS, {
    accept: "application/geo+json",
    "user-agent": "Cascadia.me conditions feed (https://cascadia.me/approach.html)",
  });
  const features = validFeatures(result.data)
    .filter((feature) => RELEVANT_NWS_EVENTS.has(feature.properties?.event))
    .map(normalizeNwsFeature)
    .sort(compareAlertFeatures);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

async function fetchWsdotAlerts(fetchImpl, accessCode) {
  const url = new URL(WSDOT_ALERTS);
  url.searchParams.set("AccessCode", accessCode);
  const result = await fetchJson(fetchImpl, url, { accept: "application/json" });
  const records = Array.isArray(result.data) ? result.data.slice(0, 300) : [];
  const features = records.map(normalizeRoadFeature).filter(Boolean);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features, "updatedAt") || result.lastModifiedAt,
  };
}

function normalizeFireFeature(feature, now) {
  const properties = feature.properties || {};
  const updatedAt = toIso(properties.ModifiedOnDateTime_dt);
  const discoveredAt = toIso(properties.FireDiscoveryDateTime);
  const containment = finiteNumber(properties.PercentContained);
  const countySource = COUNTY_EVACUATION_SOURCES[properties.POOCounty] || null;
  const stale = isStale(updatedAt || discoveredAt, now);

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(properties.IrwinID || feature.id),
      kind: "wildfire",
      name: cleanText(properties.IncidentName, 100) || "Unnamed fire",
      acres: finiteNumber(properties.IncidentSize),
      containment,
      city: cleanText(properties.POOCity, 80),
      county: cleanText(properties.POOCounty, 80),
      state: stateName(properties.POOState),
      discoveredAt,
      updatedAt,
      status: containment >= 100 ? "contained" : stale ? "reported" : "current",
      stale,
      sourceName: "NIFC WFIGS",
      sourceUrl: SOURCE_DEFINITIONS.fires.url,
      evacuationSourceName: countySource?.name || null,
      evacuationSourceUrl: countySource?.url || null,
    },
  };
}

function normalizePerimeterFeature(feature, now) {
  const properties = feature.properties || {};
  const updatedAt = latestIso([
    properties.poly_PolygonDateTime,
    properties.poly_DateCurrent,
    properties.attr_ModifiedOnDateTime_dt,
  ]);

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(properties.poly_IRWINID || feature.id),
      kind: "wildfire-perimeter",
      name: cleanText(properties.poly_IncidentName || properties.attr_IncidentName, 100) || "Fire perimeter",
      acres: finiteNumber(properties.poly_GISAcres ?? properties.attr_IncidentSize),
      containment: finiteNumber(properties.attr_PercentContained),
      updatedAt,
      stale: isStale(updatedAt, now),
      sourceName: "NIFC WFIGS",
      sourceUrl: SOURCE_DEFINITIONS.perimeters.url,
    },
  };
}

function normalizeBcFireFeature(feature) {
  const properties = feature.properties || {};
  const stageOfControl = cleanText(properties.FIRE_STATUS, 80);
  if (!isActiveBcFireStatus(stageOfControl)) {
    return null;
  }

  const hectares = finiteNumber(properties.CURRENT_SIZE);
  const fireNumber = cleanText(properties.FIRE_NUMBER, 80);
  const sourceUrl = safeHttpsUrl(properties.FIRE_URL) || SOURCE_DEFINITIONS.bcFires.url;

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(fireNumber || feature.id),
      kind: "wildfire",
      name: cleanText(properties.INCIDENT_NAME, 100) || fireNumber || "Unnamed B.C. fire",
      acres: hectares === null ? null : hectares * HECTARES_TO_ACRES,
      containment: null,
      city: cleanText(properties.GEOGRAPHIC_DESCRIPTION, 160),
      county: null,
      state: "British Columbia",
      fireCentre: cleanText(properties.FIRE_CENTRE, 100),
      zone: cleanText(properties.ZONE, 100),
      cause: cleanText(properties.FIRE_CAUSE, 80),
      stageOfControl,
      discoveredAt: toIso(properties.IGNITION_DATE),
      updatedAt: null,
      status: stageOfControl.toLowerCase() === "under control" ? "contained" : "current",
      stale: false,
      sourceName: "BC Wildfire Service",
      sourceUrl,
      evacuationSourceName: null,
      evacuationSourceUrl: null,
    },
  };
}

function normalizeBcPerimeterFeature(feature, now) {
  const properties = feature.properties || {};
  const stageOfControl = cleanText(properties.FIRE_STATUS, 80);
  if (!isActiveBcFireStatus(stageOfControl)) {
    return null;
  }

  const hectares = finiteNumber(properties.FIRE_SIZE_HECTARES);
  const fireNumber = cleanText(properties.FIRE_NUMBER, 80);
  const updatedAt = latestIso([properties.TRACK_DATE, properties.LOAD_DATE]);

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(fireNumber || feature.id),
      kind: "wildfire-perimeter",
      name: fireNumber ? `B.C. fire ${fireNumber}` : "B.C. fire perimeter",
      acres: hectares === null ? null : hectares * HECTARES_TO_ACRES,
      containment: null,
      stageOfControl,
      version: finiteNumber(properties.VERSION_NUMBER),
      updatedAt,
      stale: isStale(updatedAt, now),
      sourceName: "BC Wildfire Service",
      sourceUrl: safeHttpsUrl(properties.FIRE_URL) || SOURCE_DEFINITIONS.bcPerimeters.url,
    },
  };
}

function normalizeEvacuationFeature(feature) {
  const properties = feature.properties || {};
  const level = Math.max(1, Math.min(4, Number(properties.TypeEng) || 1));
  const labels = {
    1: "Level 1 — Get ready",
    2: "Level 2 — Get set",
    3: "Level 3 — Go now",
    4: "Shelter in place",
  };

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(properties.GlobalID || feature.id),
      kind: "evacuation",
      incidentName: cleanText(properties.IncidentName, 100) || "Chelan County incident",
      county: "Chelan",
      level,
      label: labels[level],
      startsAt: toIso(properties.StartTime),
      endsAt: toIso(properties.EndTime),
      updatedAt: toIso(properties.last_edited_date),
      sourceName: "Chelan County Emergency Management",
      sourceUrl: SOURCE_DEFINITIONS.evacuations.url,
    },
  };
}

function normalizeNwsFeature(feature) {
  const properties = feature.properties || {};
  const event = cleanText(properties.event, 100) || "Weather alert";

  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      id: normalizeId(feature.id || properties.id),
      kind: weatherKind(event),
      event,
      severity: cleanText(properties.severity, 40),
      urgency: cleanText(properties.urgency, 40),
      headline: cleanText(properties.headline, 220) || event,
      area: cleanText(properties.areaDesc, 240),
      description: cleanText(properties.description, 360),
      instruction: cleanText(properties.instruction, 300),
      startsAt: toIso(properties.onset || properties.effective),
      endsAt: toIso(properties.ends || properties.expires),
      updatedAt: toIso(properties.sent),
      sourceName: cleanText(properties.senderName, 120) || "National Weather Service",
      sourceUrl: typeof feature.id === "string" ? feature.id : SOURCE_DEFINITIONS.alerts.url,
    },
  };
}

function normalizeRoadFeature(record) {
  const location = record?.StartRoadwayLocation;
  const latitude = finiteNumber(location?.Latitude);
  const longitude = finiteNumber(location?.Longitude);
  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [longitude, latitude] },
    properties: {
      id: String(record.AlertID || `${longitude},${latitude}`),
      kind: "road-alert",
      event: cleanText(record.EventCategory, 80) || "Highway alert",
      headline: cleanText(record.HeadlineDescription, 220) || "WSDOT highway alert",
      description: cleanText(record.ExtendedDescription, 360),
      county: cleanText(record.County, 80),
      road: cleanText(location.RoadName, 80),
      direction: cleanText(location.Direction, 50),
      priority: cleanText(record.Priority, 40),
      startsAt: toIso(record.StartTime),
      endsAt: toIso(record.EndTime),
      updatedAt: toIso(record.LastUpdatedTime),
      sourceName: "Washington State Department of Transportation",
      sourceUrl: "https://wsdot.com/Travel/Real-time/Map/",
    },
  };
}

async function fetchJson(fetchImpl, url, headers) {
  const response = await fetchImpl(url.toString(), {
    headers,
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`upstream returned ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > MAX_SOURCE_BYTES) {
    throw new Error("upstream response exceeded size limit");
  }

  const data = await response.json();
  if (!Array.isArray(data) && data?.error) {
    throw new Error("upstream returned an API error");
  }

  return {
    data,
    lastModifiedAt: toIso(response.headers.get("last-modified") || response.headers.get("date")),
  };
}

function arcgisQueryUrl(base, extraParams, bounds = PNW_US_BOUNDS) {
  const url = new URL(base);
  const params = {
    f: "geojson",
    geometry: bounds.join(","),
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "true",
    outSR: "4326",
    ...extraParams,
  };
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function buildEvacuationCoverage(sources) {
  const chelan = sources.find((source) => source.id === SOURCE_DEFINITIONS.evacuations.id);
  return [
    {
      county: "Chelan",
      mode: "live_polygons",
      status: chelan?.status || "unavailable",
      sourceName: COUNTY_EVACUATION_SOURCES.Chelan.name,
      sourceUrl: COUNTY_EVACUATION_SOURCES.Chelan.url,
    },
    {
      county: "Kittitas",
      mode: "official_link",
      status: "official_link_only",
      sourceName: COUNTY_EVACUATION_SOURCES.Kittitas.name,
      sourceUrl: COUNTY_EVACUATION_SOURCES.Kittitas.url,
    },
    {
      county: "Okanogan",
      mode: "official_link",
      status: "official_link_only",
      sourceName: COUNTY_EVACUATION_SOURCES.Okanogan.name,
      sourceUrl: COUNTY_EVACUATION_SOURCES.Okanogan.url,
    },
  ];
}

function conditionsJsonResponse(body, status, env, cacheSeconds = CACHE_SECONDS) {
  const headers = conditionsHeaders(env, cacheSeconds);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function conditionsHeaders(env, cacheSeconds) {
  const headers = new Headers();
  headers.set("access-control-allow-origin", env.CONDITIONS_ALLOWED_ORIGIN || "*");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("cache-control", `public, max-age=${cacheSeconds}, stale-while-revalidate=300`);
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

function compareFireFeatures(left, right) {
  const leftStatus = left.properties.status === "current" ? 0 : left.properties.status === "reported" ? 1 : 2;
  const rightStatus = right.properties.status === "current" ? 0 : right.properties.status === "reported" ? 1 : 2;
  if (leftStatus !== rightStatus) return leftStatus - rightStatus;

  const leftContained = left.properties.containment ?? 50;
  const rightContained = right.properties.containment ?? 50;
  if (leftContained !== rightContained) return leftContained - rightContained;

  return (right.properties.acres || 0) - (left.properties.acres || 0);
}

function compareAlertFeatures(left, right) {
  const severity = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
  return (severity[left.properties.severity] ?? 4) - (severity[right.properties.severity] ?? 4);
}

function weatherKind(event) {
  if (/fire/i.test(event)) return "fire-weather";
  if (/flood/i.test(event)) return "flood-weather";
  if (/winter|blizzard|ice/i.test(event)) return "winter-weather";
  return "weather-alert";
}

function validFeatures(data) {
  return Array.isArray(data?.features)
    ? data.features.filter((feature) => feature && feature.type === "Feature")
    : [];
}

function mergeFeatureCollections(...collections) {
  return featureCollection(collections.flatMap((collection) => validFeatures(collection)));
}

function latestBcPerimeters(features) {
  const latestByFire = new Map();
  for (const feature of features) {
    const key = feature.properties?.id || "";
    const existing = latestByFire.get(key);
    if (!existing || compareBcPerimeterVersions(feature, existing) > 0) {
      latestByFire.set(key, feature);
    }
  }
  return [...latestByFire.values()];
}

function compareBcPerimeterVersions(left, right) {
  const leftVersion = left.properties?.version ?? -1;
  const rightVersion = right.properties?.version ?? -1;
  if (leftVersion !== rightVersion) return leftVersion - rightVersion;

  const leftUpdated = Date.parse(left.properties?.updatedAt || "");
  const rightUpdated = Date.parse(right.properties?.updatedAt || "");
  return (Number.isFinite(leftUpdated) ? leftUpdated : -1)
    - (Number.isFinite(rightUpdated) ? rightUpdated : -1);
}

function featureCollection(features) {
  return { type: "FeatureCollection", features };
}

function emptyFeatureCollection() {
  return featureCollection([]);
}

function latestTimestamp(features, propertyName) {
  return latestIso(features.map((feature) => feature.properties?.[propertyName]));
}

function latestIso(values) {
  const timestamps = values
    .map(toIso)
    .filter(Boolean)
    .map((value) => Date.parse(value))
    .filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
}

function toIso(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const dotNet = value.match(/\/Date\((-?\d+)/);
    if (dotNet) return new Date(Number(dotNet[1])).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeId(value) {
  return String(value || "")
    .replace(/[{}]/g, "")
    .toLowerCase()
    .slice(0, 180);
}

function cleanText(value, limit) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, limit) : null;
}

function isActiveBcFireStatus(value) {
  return typeof value === "string" && ACTIVE_BC_FIRE_STATUSES.has(value.toLowerCase());
}

function safeHttpsUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function stateName(value) {
  return { "US-WA": "Washington", "US-OR": "Oregon" }[value] || cleanText(value, 40);
}

function isStale(value, now) {
  const timestamp = Date.parse(value || "");
  return !Number.isFinite(timestamp) || now.getTime() - timestamp > STALE_SOURCE_MS;
}
