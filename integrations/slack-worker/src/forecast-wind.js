const FORECAST_METADATA_CACHE_SECONDS = 30 * 60;
const FORECAST_TILE_CACHE_SECONDS = 30 * 60;
const FORECAST_POINT_CACHE_SECONDS = 15 * 60;
const SOURCE_TIMEOUT_MS = 10_000;
const MAX_CAPABILITIES_BYTES = 128 * 1024;
const MAX_FEATURE_INFO_BYTES = 64 * 1024;
const MAX_FORECAST_ZOOM = 9;
const WEB_MERCATOR_EXTENT = 20_037_508.342789244;
const METERS_PER_SECOND_TO_KMH = 3.6;
const CASCADIA_BOUNDS = [-128.4, 39.7, -115.6, 52.6];

const ECCC_GEOMET_WMS = "https://geo.weather.gc.ca/geomet";
const FORECAST_SOURCE_URL = "https://eccc-msc.github.io/open-data/msc-data/nwp_rdps/readme_rdps_en/";
const SPEED_LAYER = "RDPS_10km_WindSpeed_10m";
const SPEED_STYLE = "WINDSPEEDKMH-LINEAR";
const DIRECTION_LAYER = "RDPS_10km_WindDir_10m";
const DIRECTION_STYLE = "WDIR6-LINEAR";

export async function handleForecastMetadataRequest(request, env, ctx) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL("/conditions/wind/forecast?schema=2", request.url), { method: "GET" });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  try {
    const metadata = await buildForecastMetadata();
    const origin = new URL(request.url).origin;
    const response = forecastJsonResponse({
      schemaVersion: 1,
      checkedAt: new Date().toISOString(),
      cacheSeconds: FORECAST_METADATA_CACHE_SECONDS,
      model: metadata,
      tileTemplateBase: `${origin}/conditions/wind/forecast/tiles/{z}/{x}/{y}.png`,
      pointEndpoint: `${origin}/conditions/wind/forecast/point`,
    }, 200, env, FORECAST_METADATA_CACHE_SECONDS);

    if (cache) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  } catch (error) {
    console.error(JSON.stringify({
      event: "forecast_metadata_error",
      error: error instanceof Error ? error.message : String(error),
    }));
    return forecastJsonResponse({ error: "forecast_metadata_temporarily_unavailable" }, 503, env, 60);
  }
}

export async function handleForecastTileRequest(request, env, ctx, tile) {
  const url = new URL(request.url);
  const modelTimes = validatedModelTimes(url, new Date());
  if (!modelTimes || !validTile(tile)) {
    return forecastJsonResponse({ error: "invalid_forecast_tile_request" }, 400, env, 0);
  }

  const cache = globalThis.caches?.default;
  const cacheUrl = new URL(url);
  cacheUrl.searchParams.set("model", "rdps-10km");
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  try {
    const upstreamUrl = buildForecastTileUrl(tile, modelTimes);
    const upstream = await fetch(upstreamUrl, {
      headers: {
        accept: "image/png",
        "user-agent": "Cascadia.me forecast wind overlay (https://cascadia.me/approach.html)",
      },
      signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
    });
    const contentType = upstream.headers.get("content-type") || "";
    if (!upstream.ok || !contentType.startsWith("image/png") || !upstream.body) {
      throw new Error(`forecast tile upstream returned ${upstream.status} ${contentType}`);
    }

    const headers = forecastHeaders(env, FORECAST_TILE_CACHE_SECONDS);
    headers.set("content-type", "image/png");
    headers.set("x-forecast-source", "ECCC-RDPS");
    const response = new Response(upstream.body, { status: 200, headers });
    if (cache) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  } catch (error) {
    console.warn(JSON.stringify({
      event: "forecast_tile_error",
      tile,
      error: error instanceof Error ? error.message : String(error),
    }));
    return forecastJsonResponse({ error: "forecast_tile_temporarily_unavailable" }, 502, env, 30);
  }
}

export async function handleForecastPointRequest(request, env, ctx) {
  const url = new URL(request.url);
  const modelTimes = validatedModelTimes(url, new Date());
  const point = validatedForecastPoint(url);
  if (!modelTimes || !point) {
    return forecastJsonResponse({ error: "invalid_forecast_point_request" }, 400, env, 0);
  }

  const cache = globalThis.caches?.default;
  const cacheUrl = new URL("/conditions/wind/forecast/point", request.url);
  cacheUrl.searchParams.set("lat", point.latitude.toFixed(2));
  cacheUrl.searchParams.set("lon", point.longitude.toFixed(2));
  cacheUrl.searchParams.set("time", modelTimes.validAt);
  cacheUrl.searchParams.set("run", modelTimes.runAt);
  cacheUrl.searchParams.set("model", "rdps-10km");
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  try {
    const [speed, direction] = await Promise.all([
      fetchForecastValue(SPEED_LAYER, SPEED_STYLE, point, modelTimes),
      fetchForecastValue(DIRECTION_LAYER, DIRECTION_STYLE, point, modelTimes),
    ]);
    const speedKmh = speed.value * METERS_PER_SECOND_TO_KMH;
    const directionDegrees = normalizedDirection(direction.value);
    if (!Number.isFinite(speedKmh) || directionDegrees === null) {
      throw new Error("forecast point returned invalid values");
    }

    const response = forecastJsonResponse({
      schemaVersion: 1,
      modelId: "eccc-rdps-10km-10m-wind",
      modelName: "ECCC RDPS",
      resolutionKm: 10,
      validAt: speed.validAt || modelTimes.validAt,
      runAt: speed.runAt || modelTimes.runAt,
      location: {
        latitude: speed.latitude ?? point.latitude,
        longitude: speed.longitude ?? point.longitude,
      },
      speedKmh,
      directionDegrees,
      directionCardinal: cardinalDirection(directionDegrees),
      sourceName: "Environment and Climate Change Canada",
      sourceUrl: FORECAST_SOURCE_URL,
    }, 200, env, FORECAST_POINT_CACHE_SECONDS);

    if (cache) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  } catch (error) {
    console.warn(JSON.stringify({
      event: "forecast_point_error",
      point,
      error: error instanceof Error ? error.message : String(error),
    }));
    return forecastJsonResponse({ error: "forecast_point_temporarily_unavailable" }, 502, env, 30);
  }
}

export function forecastPreflightResponse(env) {
  return new Response(null, {
    status: 204,
    headers: forecastHeaders(env, 0),
  });
}

export async function buildForecastMetadata(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const url = new URL(ECCC_GEOMET_WMS);
  url.searchParams.set("SERVICE", "WMS");
  url.searchParams.set("REQUEST", "GetCapabilities");
  url.searchParams.set("LAYERS", SPEED_LAYER);
  const response = await fetchImpl(url.toString(), {
    headers: {
      accept: "application/xml,text/xml",
      "user-agent": "Cascadia.me forecast wind metadata (https://cascadia.me/approach.html)",
    },
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`forecast metadata upstream returned ${response.status}`);

  const xml = await readBoundedResponseText(response, MAX_CAPABILITIES_BYTES);
  const time = parseDimension(xml, "time");
  const referenceTime = parseDimension(xml, "reference_time");
  if (!time || !referenceTime) {
    throw new Error("forecast metadata dimensions were missing");
  }

  return {
    id: "eccc-rdps-10km-10m-wind",
    name: "ECCC RDPS",
    description: "Regional deterministic 10 m forecast wind guidance",
    resolutionKm: 10,
    validAt: time.defaultValue,
    validFrom: time.start,
    validThrough: time.end,
    interval: time.interval,
    runAt: referenceTime.defaultValue,
    sourceName: "Environment and Climate Change Canada",
    sourceUrl: FORECAST_SOURCE_URL,
    coverage: {
      label: "Cascadia within the RDPS North American domain",
      bounds: CASCADIA_BOUNDS,
    },
    limitations: [
      "Forecast guidance, not an observation",
      "Terrain and local gusts can differ sharply from the 10 km model field",
      "Not a prediction of fire or smoke movement",
    ],
  };
}

function buildForecastTileUrl(tile, modelTimes) {
  const url = new URL(ECCC_GEOMET_WMS);
  const bbox = tileMercatorBbox(tile.z, tile.x, tile.y);
  const params = {
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    LAYERS: SPEED_LAYER,
    STYLES: SPEED_STYLE,
    SRS: "EPSG:3857",
    BBOX: bbox.join(","),
    WIDTH: "256",
    HEIGHT: "256",
    FORMAT: "image/png",
    TRANSPARENT: "TRUE",
    TIME: modelTimes.validAt,
    DIM_REFERENCE_TIME: modelTimes.runAt,
  };
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

async function fetchForecastValue(layer, style, point, modelTimes) {
  const url = new URL(ECCC_GEOMET_WMS);
  const halfSize = 0.04;
  const bbox = [
    point.longitude - halfSize,
    point.latitude - halfSize,
    point.longitude + halfSize,
    point.latitude + halfSize,
  ];
  const params = {
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    STYLES: style,
    SRS: "EPSG:4326",
    BBOX: bbox.join(","),
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    INFO_FORMAT: "application/json",
    TIME: modelTimes.validAt,
    DIM_REFERENCE_TIME: modelTimes.runAt,
  };
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      "user-agent": "Cascadia.me forecast wind point query (https://cascadia.me/approach.html)",
    },
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`forecast point upstream returned ${response.status}`);

  const text = await readBoundedResponseText(response, MAX_FEATURE_INFO_BYTES);
  const data = JSON.parse(text);
  const feature = Array.isArray(data?.features) ? data.features[0] : null;
  const value = finiteNumber(feature?.properties?.value);
  if (value === null) throw new Error("forecast point value was missing");
  const coordinates = Array.isArray(feature?.geometry?.coordinates) ? feature.geometry.coordinates : [];

  return {
    value,
    longitude: finiteNumber(coordinates[0]),
    latitude: finiteNumber(coordinates[1]),
    validAt: validIsoHour(feature?.properties?.time),
    runAt: validIsoHour(feature?.properties?.dim_reference_time),
  };
}

function parseDimension(xml, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tagMatch = xml.match(new RegExp(`<Dimension\\b(?=[^>]*\\bname=["']${escapedName}["'])[^>]*>[^<]+<\\/Dimension>`, "i"));
  if (!tagMatch) return null;

  const tag = tagMatch[0];
  const defaultMatch = tag.match(/\bdefault=["']([^"']+)["']/i);
  const rangeMatch = tag.match(/>([^<]+)</);
  if (!defaultMatch || !rangeMatch) return null;

  const [start, end, interval] = rangeMatch[1].trim().split("/");
  const defaultValue = validIsoHour(defaultMatch[1]);
  if (!defaultValue || !validIsoHour(start) || !validIsoHour(end) || !interval) return null;
  return { defaultValue, start, end, interval };
}

async function readBoundedResponseText(response, maxBytes) {
  const declaredLength = Number(response.headers.get("content-length") || "0");
  if (declaredLength > maxBytes) throw new Error("upstream response exceeded size limit");

  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) throw new Error("upstream response exceeded size limit");
    chunks.push(value);
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function validatedModelTimes(url, now) {
  const validAt = validIsoHour(url.searchParams.get("time"));
  const runAt = validIsoHour(url.searchParams.get("run"));
  if (!validAt || !runAt) return null;

  const nowMs = now.getTime();
  const validMs = Date.parse(validAt);
  const runMs = Date.parse(runAt);
  const hour = 60 * 60 * 1000;
  if (validMs < nowMs - 24 * hour || validMs > nowMs + 60 * hour) return null;
  if (runMs < nowMs - 72 * hour || runMs > nowMs + 6 * hour) return null;
  if (validMs < runMs || validMs - runMs > 60 * hour) return null;
  return { validAt, runAt };
}

function validatedForecastPoint(url) {
  const latitude = finiteNumber(url.searchParams.get("lat"));
  const longitude = finiteNumber(url.searchParams.get("lon"));
  if (latitude === null || longitude === null) return null;
  const [west, south, east, north] = CASCADIA_BOUNDS;
  if (longitude < west || longitude > east || latitude < south || latitude > north) return null;
  return {
    latitude: Math.round(latitude * 100) / 100,
    longitude: Math.round(longitude * 100) / 100,
  };
}

function validTile(tile) {
  const z = Number(tile?.z);
  const x = Number(tile?.x);
  const y = Number(tile?.y);
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y)) return false;
  if (z < 0 || z > MAX_FORECAST_ZOOM) return false;
  const side = 2 ** z;
  return x >= 0 && x < side && y >= 0 && y < side;
}

export function tileMercatorBbox(z, x, y) {
  const side = 2 ** z;
  const tileSize = (2 * WEB_MERCATOR_EXTENT) / side;
  const minX = -WEB_MERCATOR_EXTENT + x * tileSize;
  const maxX = minX + tileSize;
  const maxY = WEB_MERCATOR_EXTENT - y * tileSize;
  const minY = maxY - tileSize;
  return [minX, minY, maxX, maxY];
}

function validIsoHour(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:00:00Z$/.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().replace(".000Z", "Z") : null;
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

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function forecastJsonResponse(body, status, env, cacheSeconds) {
  const headers = forecastHeaders(env, cacheSeconds);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function forecastHeaders(env, cacheSeconds) {
  const headers = new Headers();
  headers.set("access-control-allow-origin", env.CONDITIONS_ALLOWED_ORIGIN || "*");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("cache-control", `public, max-age=${cacheSeconds}, stale-while-revalidate=${Math.max(cacheSeconds, 60)}`);
  headers.set("x-content-type-options", "nosniff");
  return headers;
}
