import assert from "node:assert/strict";
import { buildConditions } from "../src/conditions.js";
import worker from "../src/index.js";

const NOW = new Date("2026-07-09T20:00:00.000Z");
const RECENT = Date.parse("2026-07-09T19:30:00.000Z");

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "last-modified": "Thu, 09 Jul 2026 19:30:00 GMT",
    },
  });
}

function fixtureFetch(url) {
  if (url.includes("WFIGS_Incident_Locations_Current")) {
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [-120.02, 46.95] },
        properties: {
          IncidentName: "RYEGRASS COULEE",
          IncidentSize: 800,
          PercentContained: 0,
          FireDiscoveryDateTime: RECENT,
          ModifiedOnDateTime_dt: RECENT,
          POOCounty: "Kittitas",
          POOState: "US-WA",
          IrwinID: "{FIRE-1}",
        },
      }],
    }));
  }

  if (url.includes("WFIGS_Interagency_Perimeters_Current")) {
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[-120.1, 46.9], [-120, 46.9], [-120, 47], [-120.1, 46.9]]],
        },
        properties: {
          poly_IncidentName: "RYEGRASS COULEE",
          poly_GISAcres: 800,
          poly_PolygonDateTime: RECENT,
          poly_IRWINID: "{FIRE-1}",
          attr_PercentContained: 0,
        },
      }],
    }));
  }

  if (url.includes("Emergency_Management_Layers_View")) {
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[[-120.3, 47.8], [-120.2, 47.8], [-120.2, 47.9], [-120.3, 47.8]]],
        },
        properties: {
          IncidentName: "NAVARRE COULEE",
          TypeEng: "3",
          StartTime: RECENT,
          last_edited_date: RECENT,
          GlobalID: "{EVAC-1}",
        },
      }],
    }));
  }

  if (url.includes("api.weather.gov")) {
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [{
        id: "https://api.weather.gov/alerts/alert-1",
        type: "Feature",
        geometry: null,
        properties: {
          event: "Red Flag Warning",
          severity: "Severe",
          urgency: "Expected",
          headline: "Red Flag Warning issued for Central Washington",
          areaDesc: "Kittitas County",
          sent: "2026-07-09T19:30:00.000Z",
          senderName: "NWS Pendleton OR",
        },
      }],
    }));
  }

  return Promise.reject(new Error(`Unexpected URL: ${url}`));
}

const payload = await buildConditions({}, { fetchImpl: fixtureFetch, now: NOW });
assert.equal(payload.schemaVersion, 1);
assert.equal(payload.availableSources, 4);
assert.equal(payload.degraded, false);
assert.equal(payload.summary.fireCount, 1);
assert.equal(payload.summary.perimeterCount, 1);
assert.equal(payload.summary.evacuationCount, 1);
assert.equal(payload.summary.weatherAlertCount, 1);
assert.equal(payload.summary.roadAlertCount, 0);
assert.equal(payload.fires.features[0].properties.name, "RYEGRASS COULEE");
assert.equal(payload.fires.features[0].properties.evacuationSourceName, "Kittitas County Emergency Management");
assert.equal(payload.evacuations.features[0].properties.label, "Level 3 — Go now");
assert.equal(payload.sources.find((source) => source.id === "wsdot-highway-alerts").status, "not_configured");

const degradedFetch = (url) => {
  if (url.includes("api.weather.gov")) {
    return Promise.resolve(new Response("Unavailable", { status: 503 }));
  }
  return fixtureFetch(url);
};
const degraded = await buildConditions({}, { fetchImpl: degradedFetch, now: NOW });
assert.equal(degraded.availableSources, 3);
assert.equal(degraded.degraded, true);
assert.equal(degraded.summary.fireCount, 1);
assert.equal(degraded.summary.weatherAlertCount, 0);

const originalFetch = globalThis.fetch;
globalThis.fetch = fixtureFetch;
try {
  const response = await worker.fetch(
    new Request("https://conditions.example/conditions"),
    {},
    { waitUntil() {} }
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("cache-control"), /max-age=120/);
  const routedPayload = await response.json();
  assert.equal(routedPayload.summary.fireCount, 1);

  const preflight = await worker.fetch(
    new Request("https://conditions.example/conditions", { method: "OPTIONS" }),
    {},
    { waitUntil() {} }
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, OPTIONS");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("conditions tests passed");
