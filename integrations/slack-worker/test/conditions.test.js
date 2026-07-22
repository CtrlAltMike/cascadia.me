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

  if (url.includes("BCWS_ActiveFires_PublicView")) {
    const requestUrl = new URL(url);
    assert.equal(requestUrl.searchParams.get("where"), "FIRE_YEAR = 2026");
    assert.doesNotMatch(requestUrl.searchParams.get("where"), /FIRE_STATUS/i);
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-121.45, 50.72] },
          properties: {
            FIRE_YEAR: 2026,
            FIRE_STATUS: "Out of Control",
            IGNITION_DATE: RECENT,
            CURRENT_SIZE: 500,
            INCIDENT_NAME: "CAYOOSE CREEK",
            FIRE_NUMBER: "K70001",
            GEOGRAPHIC_DESCRIPTION: "west of Lillooet",
            FIRE_URL: "https://wildfiresituation.nrs.gov.bc.ca/incidents?fireYear=2026&incidentNumber=K70001",
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-121.55, 50.75] },
          properties: {
            FIRE_YEAR: 2026,
            FIRE_STATUS: "Out",
            IGNITION_DATE: RECENT,
            CURRENT_SIZE: 20,
            INCIDENT_NAME: "CLOSED FIRE",
            FIRE_NUMBER: "K70002",
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-121.35, 50.68] },
          properties: {
            FIRE_YEAR: 2026,
            FIRE_STATUS: "New",
            IGNITION_DATE: RECENT,
            CURRENT_SIZE: 4,
            INCIDENT_NAME: "MARBLE CANYON",
            FIRE_NUMBER: "K70003",
            GEOGRAPHIC_DESCRIPTION: "near Pavilion",
          },
        },
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-121.62, 50.81] },
          properties: {
            FIRE_YEAR: 2026,
            FIRE_STATUS: "Under Control",
            IGNITION_DATE: RECENT,
            CURRENT_SIZE: 12,
            INCIDENT_NAME: "PAVILION LAKE",
            FIRE_NUMBER: "K70004",
            GEOGRAPHIC_DESCRIPTION: "near Pavilion Lake",
          },
        },
      ],
    }));
  }

  if (url.includes("BCWS_FirePerimeters_PublicView")) {
    const requestUrl = new URL(url);
    assert.equal(requestUrl.searchParams.get("where"), "FIRE_YEAR = 2026");
    assert.doesNotMatch(requestUrl.searchParams.get("where"), /FIRE_STATUS/i);
    const geometry = {
      type: "Polygon",
      coordinates: [[[-121.5, 50.7], [-121.4, 50.7], [-121.4, 50.8], [-121.5, 50.7]]],
    };
    return Promise.resolve(jsonResponse({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry,
          properties: {
            FIRE_NUMBER: "K70001",
            VERSION_NUMBER: 1,
            FIRE_YEAR: 2026,
            FIRE_SIZE_HECTARES: 480,
            TRACK_DATE: RECENT - 60_000,
            FIRE_STATUS: "Out of Control",
          },
        },
        {
          type: "Feature",
          geometry,
          properties: {
            FIRE_NUMBER: "K70001",
            VERSION_NUMBER: 2,
            FIRE_YEAR: 2026,
            FIRE_SIZE_HECTARES: 500,
            TRACK_DATE: RECENT,
            FIRE_STATUS: "Out of Control",
          },
        },
        {
          type: "Feature",
          geometry,
          properties: {
            FIRE_NUMBER: "K70002",
            VERSION_NUMBER: 1,
            FIRE_YEAR: 2026,
            FIRE_SIZE_HECTARES: 20,
            TRACK_DATE: RECENT,
            FIRE_STATUS: "Out",
          },
        },
      ],
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
assert.equal(payload.availableSources, 6);
assert.equal(payload.degraded, true);
assert.equal(payload.summary.fireCount, 4);
assert.equal(payload.summary.perimeterCount, 2);
assert.equal(payload.summary.evacuationCount, 1);
assert.equal(payload.summary.weatherAlertCount, 1);
assert.equal(payload.summary.roadAlertCount, 0);
assert.equal(payload.fires.features[0].properties.name, "RYEGRASS COULEE");
assert.equal(payload.fires.features[0].properties.evacuationSourceName, "Kittitas County Emergency Management");
assert.equal(payload.fires.features.some((feature) => feature.properties.name === "CLOSED FIRE"), false);
assert.equal(payload.fires.features.find((feature) => feature.properties.name === "CAYOOSE CREEK").properties.stageOfControl, "Out of Control");
assert.equal(payload.fires.features.find((feature) => feature.properties.name === "MARBLE CANYON").properties.stageOfControl, "New");
assert.equal(payload.fires.features.find((feature) => feature.properties.name === "PAVILION LAKE").properties.stageOfControl, "Under Control");
assert.equal(payload.perimeters.features.filter((feature) => feature.properties.sourceName === "BC Wildfire Service").length, 1);
assert.equal(payload.perimeters.features.find((feature) => feature.properties.sourceName === "BC Wildfire Service").properties.version, 2);
assert.equal(payload.evacuations.features[0].properties.label, "Level 3 — Go now");
assert.equal(payload.sources.find((source) => source.id === "wsdot-highway-alerts").status, "not_configured");
assert.equal(payload.sources.find((source) => source.id === "nifc-fires").label, "WA/OR current fire incidents");
assert.equal(payload.sources.find((source) => source.id === "bcws-fires").label, "Southern B.C. current fire incidents");
assert.equal(payload.sources.find((source) => source.id === "nws-alerts").label, "Selected Washington NWS alerts");

let transientNifcAttempts = 0;
const transientNifcFetch = (url) => {
  if (url.includes("WFIGS_Incident_Locations_Current")) {
    transientNifcAttempts += 1;
    if (transientNifcAttempts === 1) {
      return Promise.resolve(new Response("Temporarily unavailable", { status: 503 }));
    }
  }
  return fixtureFetch(url);
};
const recovered = await buildConditions({}, { fetchImpl: transientNifcFetch, now: NOW });
assert.equal(transientNifcAttempts, 2);
assert.equal(recovered.sources.find((source) => source.id === "nifc-fires").status, "available");
assert.equal(recovered.fires.features.some((feature) => feature.properties.sourceName === "NIFC WFIGS"), true);

const degradedFetch = (url) => {
  if (url.includes("api.weather.gov")) {
    return Promise.resolve(new Response("Unavailable", { status: 503 }));
  }
  return fixtureFetch(url);
};
const degraded = await buildConditions({}, { fetchImpl: degradedFetch, now: NOW });
assert.equal(degraded.availableSources, 5);
assert.equal(degraded.degraded, true);
assert.equal(degraded.summary.fireCount, 4);
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
  assert.equal(routedPayload.summary.fireCount, 4);

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
