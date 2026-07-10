import assert from "node:assert/strict";
import { buildWindConditions } from "../src/wind.js";
import worker from "../src/index.js";

const NOW = new Date("2026-07-10T09:30:00.000Z");

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "last-modified": "Fri, 10 Jul 2026 09:20:00 GMT",
    },
  });
}

function fixtureFetch(url) {
  const requestUrl = new URL(url);

  if (requestUrl.hostname === "bcwsapi.nrs.gov.bc.ca") {
    assert.equal(requestUrl.searchParams.get("pageRowCount"), "100");
    assert.equal(requestUrl.searchParams.get("orderBy"), "weatherTimestamp,desc");
    const pageNumber = Number(requestUrl.searchParams.get("pageNumber"));
    return Promise.resolve(jsonResponse({
      collection: pageNumber === 0 ? [
        {
          recordType: "ACTUAL",
          stationName: "MOUNTAIN PASS",
          stationCode: "1001",
          weatherTimestamp: "2026071001",
          windSpeed: 20,
          windDirection: 270,
          windGust: 35,
          temperature: 18,
          relativeHumidity: 24,
          elevation: 1400,
          geometry: { type: "Point", coordinates: [-121.2, 50.3] },
        },
        {
          recordType: "ACTUAL",
          stationName: "VALLEY FLOOR",
          stationCode: "1002",
          weatherTimestamp: "2026070920",
          windSpeed: 8,
          windDirection: 180,
          windGust: null,
          temperature: 16,
          relativeHumidity: 35,
          elevation: 400,
          geometry: { type: "Point", coordinates: [-120.8, 50.1] },
        },
        {
          recordType: "ACTUAL",
          stationName: "TOO OLD",
          stationCode: "1003",
          weatherTimestamp: "2026070900",
          windSpeed: 10,
          windDirection: 90,
          geometry: { type: "Point", coordinates: [-121, 50] },
        },
      ] : [],
    }));
  }

  if (requestUrl.hostname === "aviationweather.gov") {
    assert.equal(requestUrl.searchParams.get("bbox"), "39.7,-128.4,52.6,-115.6");
    assert.equal(requestUrl.searchParams.get("format"), "geojson");
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-122.31, 47.45] },
          properties: {
            id: "KSEA",
            site: "Seattle-Tacoma International, WA, US",
            obsTime: "2026-07-10T09:00:00.000Z",
            wdir: 310,
            wspd: 10,
            wgst: 18,
            temp: 17,
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-123.18, 49.19] },
          properties: {
            id: "CYVR",
            site: "Vancouver, BC, CA",
            obsTime: "2026-07-10T09:00:00.000Z",
            wdir: "VRB",
            wspd: 4,
          },
        },
      ],
    }));
  }

  return Promise.reject(new Error(`Unexpected URL: ${url}`));
}

const payload = await buildWindConditions({ fetchImpl: fixtureFetch, now: NOW });
assert.equal(payload.schemaVersion, 1);
assert.equal(payload.availableSources, 2);
assert.equal(payload.degraded, false);
assert.equal(payload.summary.stationCount, 3);
assert.equal(payload.summary.freshStationCount, 2);
assert.equal(payload.summary.staleStationCount, 1);
assert.equal(payload.observations.features.some((feature) => feature.properties.stationName === "TOO OLD"), false);
assert.equal(payload.observations.features.some((feature) => feature.properties.stationCode === "CYVR"), false);

const mountain = payload.observations.features.find((feature) => feature.properties.stationCode === "1001");
assert.equal(mountain.properties.observedAt, "2026-07-10T09:00:00.000Z");
assert.equal(mountain.properties.directionCardinal, "W");
assert.equal(mountain.properties.bearing, 90);
assert.equal(mountain.properties.stale, false);

const sea = payload.observations.features.find((feature) => feature.properties.stationCode === "KSEA");
assert.equal(Math.round(sea.properties.speedKmh), 19);
assert.equal(Math.round(sea.properties.gustKmh), 33);

const originalFetch = globalThis.fetch;
globalThis.fetch = fixtureFetch;
try {
  const response = await worker.fetch(
    new Request("https://conditions.example/conditions/wind"),
    {},
    { waitUntil() {} }
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /max-age=900/);
  const routedPayload = await response.json();
  assert.equal(routedPayload.schemaVersion, 1);
  assert.equal(routedPayload.availableSources, 2);

  const preflight = await worker.fetch(
    new Request("https://conditions.example/conditions/wind", { method: "OPTIONS" }),
    {},
    { waitUntil() {} }
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, OPTIONS");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("wind tests passed");
