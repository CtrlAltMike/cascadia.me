const FERRIES_CACHE_SECONDS = 15;
const SOURCE_TIMEOUT_MS = 9_000;
const MAX_SOURCE_BYTES = 2 * 1024 * 1024;
const FRESH_POSITION_MS = 5 * 60 * 1000;
const MAX_POSITION_AGE_MS = 60 * 60 * 1000;
// Salish Sea service area: Tacoma to the San Juan Islands and Sidney, B.C.
const SALISH_BOUNDS = [-123.9, 46.9, -121.9, 49.1];

const WSF_VESSEL_LOCATIONS = "https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations";

const FERRIES_SOURCE = {
  id: "wsf-vessel-locations",
  label: "Washington State Ferries vessel locations",
  url: "https://wsdot.com/ferries/vesselwatch/",
};

export async function handleFerriesRequest(request, env, ctx) {
  const cache = globalThis.caches?.default;
  const cacheKey = new Request(new URL("/conditions/ferries?schema=1", request.url), { method: "GET" });

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  try {
    const payload = await buildFerriesConditions(env);
    const status = payload.availableSources > 0 ? 200 : 503;
    const response = ferriesJsonResponse(payload, status, env);

    if (cache && status === 200) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (error) {
    console.error(JSON.stringify({
      event: "ferries_unhandled_error",
      error: error instanceof Error ? error.message : String(error),
    }));
    return ferriesJsonResponse({ error: "ferries_temporarily_unavailable" }, 503, env, 30);
  }
}

export function ferriesPreflightResponse(env) {
  return new Response(null, {
    status: 204,
    headers: ferriesHeaders(env, 0),
  });
}

export async function buildFerriesConditions(env = {}, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const fetchImpl = options.fetchImpl || fetch;
  const sources = [];
  let vessels = [];

  if (!env.WSDOT_ACCESS_CODE) {
    sources.push({
      ...FERRIES_SOURCE,
      status: "not_configured",
      recordCount: 0,
      updatedAt: null,
    });
  } else {
    try {
      const result = await fetchVesselLocations(fetchImpl, env.WSDOT_ACCESS_CODE, now);
      vessels = result.collection.features;
      sources.push({
        ...FERRIES_SOURCE,
        status: "available",
        recordCount: vessels.length,
        updatedAt: result.updatedAt,
      });
    } catch (error) {
      console.warn(JSON.stringify({
        event: "ferries_source_unavailable",
        source: FERRIES_SOURCE.id,
        error: error instanceof Error ? error.message : String(error),
      }));
      sources.push({
        ...FERRIES_SOURCE,
        status: "unavailable",
        recordCount: 0,
        updatedAt: null,
      });
    }
  }

  vessels.sort((left, right) => {
    if (left.properties.underway !== right.properties.underway) {
      return left.properties.underway ? -1 : 1;
    }
    return String(left.properties.name || "").localeCompare(String(right.properties.name || ""));
  });

  const underwayCount = vessels.filter((feature) => feature.properties.underway).length;
  const atDockCount = vessels.filter((feature) => feature.properties.atDock).length;
  const availableSources = sources.filter((source) => source.status === "available").length;

  return {
    schemaVersion: 1,
    checkedAt: now.toISOString(),
    cacheSeconds: FERRIES_CACHE_SECONDS,
    region: {
      label: "Washington State Ferries service area",
      bounds: SALISH_BOUNDS,
    },
    availableSources,
    degraded: availableSources === 0,
    summary: {
      vesselCount: vessels.length,
      underwayCount,
      atDockCount,
    },
    sources,
    vessels: featureCollection(vessels),
  };
}

async function fetchVesselLocations(fetchImpl, accessCode, now) {
  const url = new URL(WSF_VESSEL_LOCATIONS);
  url.searchParams.set("apiaccesscode", accessCode);

  const response = await fetchImpl(url.toString(), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`upstream returned ${response.status}`);

  const contentLength = Number(response.headers.get("content-length") || "0");
  if (contentLength > MAX_SOURCE_BYTES) {
    throw new Error("upstream response exceeded size limit");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("upstream returned an unexpected payload");
  }

  const features = data
    .map((record) => normalizeVessel(record, now))
    .filter(Boolean);

  return {
    collection: featureCollection(features),
    updatedAt: latestTimestamp(features),
  };
}

function normalizeVessel(record, now) {
  if (!record || record.InService !== true) return null;

  const longitude = finiteNumber(record.Longitude);
  const latitude = finiteNumber(record.Latitude);
  if (longitude === null || latitude === null) return null;
  if (!isWithinServiceArea([longitude, latitude])) return null;

  const updatedAt = parseWsfDate(record.TimeStamp);
  const ageMs = updatedAt === null ? null : now.getTime() - Date.parse(updatedAt);
  if (ageMs !== null && (ageMs < -10 * 60 * 1000 || ageMs > MAX_POSITION_AGE_MS)) return null;

  const atDock = record.AtDock === true;
  const heading = normalizedHeading(record.Heading);
  const speedKnots = finiteNumber(record.Speed);
  const routeAbbrev = Array.isArray(record.OpRouteAbbrev)
    ? cleanText(record.OpRouteAbbrev[0], 24)
    : cleanText(record.OpRouteAbbrev, 24);

  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [longitude, latitude] },
    properties: {
      id: `wsf-${finiteNumber(record.VesselID) ?? cleanText(record.VesselName, 40) ?? "vessel"}`,
      kind: "wsf-vessel",
      name: cleanText(record.VesselName, 60) || "WSF vessel",
      mmsi: finiteNumber(record.Mmsi),
      route: routeAbbrev ? routeAbbrev.toLowerCase() : null,
      departingTerminal: cleanText(record.DepartingTerminalName, 60),
      departingTerminalAbbrev: cleanText(record.DepartingTerminalAbbrev, 12),
      arrivingTerminal: cleanText(record.ArrivingTerminalName, 60),
      arrivingTerminalAbbrev: cleanText(record.ArrivingTerminalAbbrev, 12),
      speedKnots: speedKnots === null ? null : Math.round(speedKnots * 10) / 10,
      heading,
      headingCardinal: heading === null ? null : cardinalDirection(heading),
      inService: true,
      atDock,
      underway: !atDock,
      leftDockAt: parseWsfDate(record.LeftDock),
      etaAt: parseWsfDate(record.Eta),
      etaBasis: cleanText(record.EtaBasis, 200),
      scheduledDepartureAt: parseWsfDate(record.ScheduledDeparture),
      positionNumber: finiteNumber(record.VesselPositionNum),
      updatedAt,
      stale: ageMs !== null && ageMs > FRESH_POSITION_MS,
      sourceName: "Washington State Ferries",
      sourceUrl: FERRIES_SOURCE.url,
    },
  };
}

function ferriesJsonResponse(body, status, env, cacheSeconds = FERRIES_CACHE_SECONDS) {
  const headers = ferriesHeaders(env, cacheSeconds);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function ferriesHeaders(env, cacheSeconds) {
  const headers = new Headers();
  headers.set("access-control-allow-origin", env.CONDITIONS_ALLOWED_ORIGIN || "*");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("cache-control", `public, max-age=${cacheSeconds}, stale-while-revalidate=45`);
  headers.set("x-content-type-options", "nosniff");
  return headers;
}

// WSF REST timestamps arrive as WCF JSON dates, e.g. "/Date(1657133343000-0700)/".
function parseWsfDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/\/Date\((-?\d+)(?:[+-]\d{4})?\)\//);
  if (!match) return null;
  const millis = Number(match[1]);
  return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
}

function isWithinServiceArea([longitude, latitude]) {
  const [west, south, east, north] = SALISH_BOUNDS;
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
}

function normalizedHeading(value) {
  const heading = finiteNumber(value);
  if (heading === null || heading < 0 || heading > 360) return null;
  return heading === 360 ? 0 : heading;
}

function cardinalDirection(heading) {
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(heading / 45) % labels.length];
}

function featureCollection(features) {
  return { type: "FeatureCollection", features };
}

function latestTimestamp(features) {
  const timestamps = features
    .map((feature) => Date.parse(feature.properties?.updatedAt || ""))
    .filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
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
