const WIND_CACHE_SECONDS = 15 * 60;
const SOURCE_TIMEOUT_MS = 9_000;
const MAX_SOURCE_BYTES = 4 * 1024 * 1024;
const BCWS_PAGE_COUNT = 4;
const BCWS_PAGE_SIZE = 100;
const FRESH_OBSERVATION_MS = 2 * 60 * 60 * 1000;
const MAX_BCWS_AGE_MS = 12 * 60 * 60 * 1000;
const MAX_METAR_AGE_MS = 4 * 60 * 60 * 1000;
const KNOTS_TO_KMH = 1.852;
const CASCADIA_BOUNDS = [-128.4, 39.7, -115.6, 52.6];

const BCWS_HOURLIES = "https://bcwsapi.nrs.gov.bc.ca/wfwx-datamart-api/v1/hourlies";
const AVIATION_WEATHER_METARS = "https://aviationweather.gov/api/data/metar";

const WIND_SOURCES = {
  bcws: {
    id: "bcws-weather-stations",
    label: "BC Wildfire Service weather stations",
    url: "https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation/fire-weather",
  },
  metar: {
    id: "noaa-metar-stations",
    label: "NOAA aviation weather stations",
    url: "https://aviationweather.gov/data/api/",
  },
};

export async function handleWindRequest(request, env, ctx) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL("/conditions/wind?schema=1", request.url), { method: "GET" });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  try {
    const payload = await buildWindConditions();
    const status = payload.availableSources > 0 ? 200 : 503;
    const response = windJsonResponse(payload, status, env);

    if (cache && status === 200) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (error) {
    console.error(JSON.stringify({
      event: "wind_unhandled_error",
      error: error instanceof Error ? error.message : String(error),
    }));
    return windJsonResponse({ error: "wind_temporarily_unavailable" }, 503, env, 60);
  }
}

export function windPreflightResponse(env) {
  return new Response(null, {
    status: 204,
    headers: windHeaders(env, 0),
  });
}

export async function buildWindConditions(options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const fetchImpl = options.fetchImpl || fetch;
  const tasks = [
    ["bcws", () => fetchBcwsObservations(fetchImpl, now)],
    ["metar", () => fetchMetarObservations(fetchImpl, now)],
  ];
  const settled = await Promise.allSettled(tasks.map(([, run]) => run()));
  const sources = [];
  const observations = [];

  settled.forEach((result, index) => {
    const [key] = tasks[index];
    const definition = WIND_SOURCES[key];

    if (result.status === "fulfilled") {
      observations.push(...result.value.collection.features);
      sources.push({
        ...definition,
        status: "available",
        recordCount: result.value.collection.features.length,
        updatedAt: result.value.updatedAt,
      });
      return;
    }

    console.warn(JSON.stringify({
      event: "wind_source_unavailable",
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

  observations.sort((left, right) => {
    if (left.properties.stale !== right.properties.stale) {
      return left.properties.stale ? 1 : -1;
    }
    return (right.properties.speedKmh || 0) - (left.properties.speedKmh || 0);
  });

  const staleStationCount = observations.filter((feature) => feature.properties.stale).length;
  const availableSources = sources.filter((source) => source.status === "available").length;
  const unavailableSources = sources.length - availableSources;

  return {
    schemaVersion: 1,
    checkedAt: now.toISOString(),
    cacheSeconds: WIND_CACHE_SECONDS,
    region: {
      label: "Cascadia",
      bounds: CASCADIA_BOUNDS,
    },
    availableSources,
    degraded: unavailableSources > 0,
    summary: {
      stationCount: observations.length,
      freshStationCount: observations.length - staleStationCount,
      staleStationCount,
    },
    sources,
    observations: featureCollection(observations),
  };
}

async function fetchBcwsObservations(fetchImpl, now) {
  const requests = Array.from({ length: BCWS_PAGE_COUNT }, (_, pageNumber) => {
    const url = new URL(BCWS_HOURLIES);
    url.searchParams.set("pageNumber", String(pageNumber));
    url.searchParams.set("pageRowCount", String(BCWS_PAGE_SIZE));
    url.searchParams.set("orderBy", "weatherTimestamp,desc");
    return fetchBoundedJson(fetchImpl, url, { accept: "application/json" });
  });
  const pages = await Promise.all(requests);
  const records = pages.flatMap((page) => Array.isArray(page.data?.collection) ? page.data.collection : []);
  const latestByStation = new Map();

  for (const record of records) {
    if (record?.recordType !== "ACTUAL") continue;
    const stationCode = cleanText(record.stationCode, 40);
    const observedAt = parseBcwsTimestamp(record.weatherTimestamp);
    if (!stationCode || !observedAt) continue;

    const existing = latestByStation.get(stationCode);
    if (!existing || Date.parse(observedAt) > Date.parse(existing.observedAt)) {
      latestByStation.set(stationCode, { record, observedAt });
    }
  }

  const features = [...latestByStation.values()]
    .map(({ record, observedAt }) => normalizeBcwsObservation(record, observedAt, now))
    .filter(Boolean);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features),
  };
}

async function fetchMetarObservations(fetchImpl, now) {
  const [west, south, east, north] = CASCADIA_BOUNDS;
  const url = new URL(AVIATION_WEATHER_METARS);
  url.searchParams.set("bbox", [south, west, north, east].join(","));
  url.searchParams.set("format", "geojson");
  url.searchParams.set("hours", "3");
  const result = await fetchBoundedJson(fetchImpl, url, {
    accept: "application/geo+json",
    "user-agent": "Cascadia.me wind observations (https://cascadia.me/approach.html)",
  });
  const features = validFeatures(result.data)
    .map((feature) => normalizeMetarObservation(feature, now))
    .filter(Boolean);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features) || result.lastModifiedAt,
  };
}

function normalizeBcwsObservation(record, observedAt, now) {
  const coordinates = validPointCoordinates(record.geometry?.coordinates);
  const direction = normalizedDirection(record.windDirection);
  const speedKmh = finiteNumber(record.windSpeed);
  if (!coordinates || !isWithinCascadia(coordinates) || direction === null || speedKmh === null) return null;

  const ageMs = now.getTime() - Date.parse(observedAt);
  if (ageMs < -30 * 60 * 1000 || ageMs > MAX_BCWS_AGE_MS) return null;

  return windFeature(coordinates, {
    id: `bcws-${cleanText(record.stationCode, 40)}`,
    stationName: cleanText(record.stationName, 100) || `BCWS station ${record.stationCode}`,
    stationCode: cleanText(record.stationCode, 40),
    observedAt,
    speedKmh,
    gustKmh: finiteNumber(record.windGust),
    direction,
    temperatureC: finiteNumber(record.temperature),
    relativeHumidity: finiteNumber(record.relativeHumidity),
    elevationM: finiteNumber(record.elevation),
    stale: ageMs > FRESH_OBSERVATION_MS,
    sourceName: "BC Wildfire Service",
    sourceUrl: WIND_SOURCES.bcws.url,
  });
}

function normalizeMetarObservation(feature, now) {
  const properties = feature.properties || {};
  const coordinates = validPointCoordinates(feature.geometry?.coordinates);
  const direction = normalizedDirection(properties.wdir);
  const speedKnots = finiteNumber(properties.wspd);
  const observedAt = toIso(properties.obsTime);
  if (!coordinates || !isWithinCascadia(coordinates) || direction === null || speedKnots === null || !observedAt) return null;

  const ageMs = now.getTime() - Date.parse(observedAt);
  if (ageMs < -30 * 60 * 1000 || ageMs > MAX_METAR_AGE_MS) return null;

  const gustKnots = finiteNumber(properties.wgst);
  return windFeature(coordinates, {
    id: `metar-${cleanText(properties.id, 40)}`,
    stationName: cleanText(properties.site, 120) || cleanText(properties.id, 40) || "Aviation weather station",
    stationCode: cleanText(properties.id, 40),
    observedAt,
    speedKmh: speedKnots * KNOTS_TO_KMH,
    gustKmh: gustKnots === null ? null : gustKnots * KNOTS_TO_KMH,
    direction,
    temperatureC: finiteNumber(properties.temp),
    relativeHumidity: null,
    elevationM: null,
    stale: ageMs > FRESH_OBSERVATION_MS,
    sourceName: "NOAA Aviation Weather Center",
    sourceUrl: WIND_SOURCES.metar.url,
  });
}

function windFeature(coordinates, properties) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties: {
      ...properties,
      kind: "wind-observation",
      directionCardinal: cardinalDirection(properties.direction),
      // Source direction is where wind comes from; the map arrow shows travel.
      bearing: (properties.direction + 180) % 360,
    },
  };
}

async function fetchBoundedJson(fetchImpl, url, headers) {
  const response = await fetchImpl(url.toString(), {
    headers,
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`upstream returned ${response.status}`);

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

function windJsonResponse(body, status, env, cacheSeconds = WIND_CACHE_SECONDS) {
  const headers = windHeaders(env, cacheSeconds);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function windHeaders(env, cacheSeconds) {
  const headers = new Headers();
  headers.set("access-control-allow-origin", env.CONDITIONS_ALLOWED_ORIGIN || "*");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("cache-control", `public, max-age=${cacheSeconds}, stale-while-revalidate=900`);
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

function parseBcwsTimestamp(value) {
  const match = typeof value === "string" && value.match(/^(\d{4})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour] = match;
  // BCWS documents returned hourly timestamps in fixed Pacific Standard Time.
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) + 8);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function validFeatures(data) {
  return Array.isArray(data?.features)
    ? data.features.filter((feature) => feature && feature.type === "Feature")
    : [];
}

function validPointCoordinates(value) {
  if (!Array.isArray(value) || value.length < 2) return null;
  const longitude = finiteNumber(value[0]);
  const latitude = finiteNumber(value[1]);
  if (longitude === null || latitude === null) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return [longitude, latitude];
}

function isWithinCascadia([longitude, latitude]) {
  const [west, south, east, north] = CASCADIA_BOUNDS;
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
}

function normalizedDirection(value) {
  const direction = finiteNumber(value);
  if (direction === null || direction < 0 || direction > 360) return null;
  return direction === 360 ? 0 : direction;
}

function cardinalDirection(direction) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(direction / 45) % labels.length];
}

function featureCollection(features) {
  return { type: "FeatureCollection", features };
}

function latestTimestamp(features) {
  const timestamps = features
    .map((feature) => Date.parse(feature.properties?.observedAt || ""))
    .filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
}

function toIso(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function cleanText(value, limit) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, limit) : null;
}
