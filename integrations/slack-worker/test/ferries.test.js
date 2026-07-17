import assert from "node:assert/strict";
import { buildFerriesConditions } from "../src/ferries.js";
import worker from "../src/index.js";

const NOW = new Date("2026-07-17T20:00:00.000Z");

function wsfDate(millis) {
  return `/Date(${millis}-0700)/`;
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const FIXTURE_VESSELS = [
  {
    VesselID: 32,
    VesselName: "Walla Walla",
    Mmsi: 366772980,
    DepartingTerminalID: 7,
    DepartingTerminalName: "Seattle",
    DepartingTerminalAbbrev: "P52",
    ArrivingTerminalID: 3,
    ArrivingTerminalName: "Bainbridge Island",
    ArrivingTerminalAbbrev: "BBI",
    Latitude: 47.605,
    Longitude: -122.435,
    Speed: 16.44,
    Heading: 280,
    InService: true,
    AtDock: false,
    LeftDock: wsfDate(NOW.getTime() - 8 * 60 * 1000),
    Eta: wsfDate(NOW.getTime() + 22 * 60 * 1000),
    EtaBasis: "Departed Seattle at 12:52pm, Heading to Bainbridge Island",
    ScheduledDeparture: wsfDate(NOW.getTime() - 10 * 60 * 1000),
    OpRouteAbbrev: ["SEA-BI"],
    VesselPositionNum: 1,
    TimeStamp: wsfDate(NOW.getTime() - 30 * 1000),
  },
  {
    VesselID: 25,
    VesselName: "Chimacum",
    DepartingTerminalName: "Bremerton",
    DepartingTerminalAbbrev: "BRE",
    ArrivingTerminalName: "Seattle",
    ArrivingTerminalAbbrev: "P52",
    Latitude: 47.5623,
    Longitude: -122.6247,
    Speed: 0.1,
    Heading: 0,
    InService: true,
    AtDock: true,
    LeftDock: null,
    Eta: null,
    EtaBasis: null,
    ScheduledDeparture: wsfDate(NOW.getTime() + 14 * 60 * 1000),
    OpRouteAbbrev: ["sea-br"],
    VesselPositionNum: 1,
    TimeStamp: wsfDate(NOW.getTime() - 45 * 1000),
  },
  {
    VesselID: 17,
    VesselName: "Kittitas",
    DepartingTerminalName: "Mukilteo",
    ArrivingTerminalName: "Clinton",
    Latitude: 47.96,
    Longitude: -122.33,
    Speed: 12.2,
    Heading: 45,
    InService: true,
    AtDock: false,
    OpRouteAbbrev: ["muk-cl"],
    TimeStamp: wsfDate(NOW.getTime() - 10 * 60 * 1000),
  },
  {
    VesselID: 2,
    VesselName: "Laid Up",
    Latitude: 47.58,
    Longitude: -122.36,
    Speed: 0,
    Heading: 0,
    InService: false,
    AtDock: true,
    TimeStamp: wsfDate(NOW.getTime() - 60 * 1000),
  },
  {
    VesselID: 3,
    VesselName: "Gone Quiet",
    Latitude: 47.51,
    Longitude: -122.49,
    Speed: 0,
    Heading: 120,
    InService: true,
    AtDock: false,
    TimeStamp: wsfDate(NOW.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    VesselID: 4,
    VesselName: "In The Yard",
    Latitude: 45.56,
    Longitude: -122.67,
    Speed: 0,
    Heading: 0,
    InService: true,
    AtDock: true,
    TimeStamp: wsfDate(NOW.getTime() - 60 * 1000),
  },
];

function fixtureFetch(url) {
  const requestUrl = new URL(url);
  assert.equal(requestUrl.hostname, "www.wsdot.wa.gov");
  assert.equal(requestUrl.pathname, "/ferries/api/vessels/rest/vessellocations");
  assert.equal(requestUrl.searchParams.get("apiaccesscode"), "test-code");
  return Promise.resolve(jsonResponse(FIXTURE_VESSELS));
}

const payload = await buildFerriesConditions(
  { WSDOT_ACCESS_CODE: "test-code" },
  { fetchImpl: fixtureFetch, now: NOW }
);

assert.equal(payload.schemaVersion, 1);
assert.equal(payload.availableSources, 1);
assert.equal(payload.degraded, false);
assert.equal(payload.cacheSeconds, 15);
assert.equal(payload.summary.vesselCount, 3);
assert.equal(payload.summary.underwayCount, 2);
assert.equal(payload.summary.atDockCount, 1);
assert.equal(payload.sources[0].id, "wsf-vessel-locations");
assert.equal(payload.sources[0].status, "available");
assert.equal(payload.sources[0].recordCount, 3);
assert.equal(payload.sources[0].updatedAt, new Date(NOW.getTime() - 30 * 1000).toISOString());

const names = payload.vessels.features.map((feature) => feature.properties.name);
assert.deepEqual(names, ["Kittitas", "Walla Walla", "Chimacum"]);
assert.equal(payload.vessels.features.some((feature) => feature.properties.name === "Laid Up"), false);
assert.equal(payload.vessels.features.some((feature) => feature.properties.name === "Gone Quiet"), false);
assert.equal(payload.vessels.features.some((feature) => feature.properties.name === "In The Yard"), false);

const wallaWalla = payload.vessels.features.find((feature) => feature.properties.name === "Walla Walla");
assert.equal(wallaWalla.properties.id, "wsf-32");
assert.equal(wallaWalla.properties.underway, true);
assert.equal(wallaWalla.properties.atDock, false);
assert.equal(wallaWalla.properties.stale, false);
assert.equal(wallaWalla.properties.route, "sea-bi");
assert.equal(wallaWalla.properties.speedKnots, 16.4);
assert.equal(wallaWalla.properties.heading, 280);
assert.equal(wallaWalla.properties.headingCardinal, "W");
assert.equal(wallaWalla.properties.departingTerminal, "Seattle");
assert.equal(wallaWalla.properties.arrivingTerminal, "Bainbridge Island");
assert.equal(wallaWalla.properties.etaAt, new Date(NOW.getTime() + 22 * 60 * 1000).toISOString());
assert.equal(wallaWalla.properties.leftDockAt, new Date(NOW.getTime() - 8 * 60 * 1000).toISOString());
assert.equal(wallaWalla.properties.updatedAt, new Date(NOW.getTime() - 30 * 1000).toISOString());
assert.deepEqual(wallaWalla.geometry.coordinates, [-122.435, 47.605]);

const chimacum = payload.vessels.features.find((feature) => feature.properties.name === "Chimacum");
assert.equal(chimacum.properties.underway, false);
assert.equal(chimacum.properties.atDock, true);
assert.equal(chimacum.properties.etaAt, null);
assert.equal(chimacum.properties.scheduledDepartureAt, new Date(NOW.getTime() + 14 * 60 * 1000).toISOString());

const kittitas = payload.vessels.features.find((feature) => feature.properties.name === "Kittitas");
assert.equal(kittitas.properties.stale, true);
assert.equal(kittitas.properties.underway, true);
assert.equal(kittitas.properties.headingCardinal, "NE");

const notConfigured = await buildFerriesConditions({}, {
  fetchImpl: () => Promise.reject(new Error("should not fetch")),
  now: NOW,
});
assert.equal(notConfigured.availableSources, 0);
assert.equal(notConfigured.degraded, true);
assert.equal(notConfigured.sources[0].status, "not_configured");
assert.equal(notConfigured.vessels.features.length, 0);

const upstreamDown = await buildFerriesConditions(
  { WSDOT_ACCESS_CODE: "test-code" },
  {
    fetchImpl: () => Promise.resolve(new Response("gateway error", { status: 502 })),
    now: NOW,
  }
);
assert.equal(upstreamDown.availableSources, 0);
assert.equal(upstreamDown.degraded, true);
assert.equal(upstreamDown.sources[0].status, "unavailable");

const upstreamOdd = await buildFerriesConditions(
  { WSDOT_ACCESS_CODE: "test-code" },
  {
    fetchImpl: () => Promise.resolve(jsonResponse({ Message: "A valid API Access Code must be supplied." })),
    now: NOW,
  }
);
assert.equal(upstreamOdd.sources[0].status, "unavailable");

const originalFetch = globalThis.fetch;
globalThis.fetch = fixtureFetch;
try {
  const response = await worker.fetch(
    new Request("https://conditions.example/conditions/ferries"),
    { WSDOT_ACCESS_CODE: "test-code" },
    { waitUntil() {} }
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /max-age=15/);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  const routedPayload = await response.json();
  assert.equal(routedPayload.schemaVersion, 1);
  assert.equal(routedPayload.availableSources, 1);

  const missingCode = await worker.fetch(
    new Request("https://conditions.example/conditions/ferries"),
    {},
    { waitUntil() {} }
  );
  assert.equal(missingCode.status, 503);
  const missingPayload = await missingCode.json();
  assert.equal(missingPayload.sources[0].status, "not_configured");

  const preflight = await worker.fetch(
    new Request("https://conditions.example/conditions/ferries", { method: "OPTIONS" }),
    {},
    { waitUntil() {} }
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, OPTIONS");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("ferries tests passed");
