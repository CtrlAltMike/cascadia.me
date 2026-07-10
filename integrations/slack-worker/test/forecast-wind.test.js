import assert from "node:assert/strict";
import { buildForecastMetadata, tileMercatorBbox } from "../src/forecast-wind.js";
import worker from "../src/index.js";

function isoHour(date) {
  const copy = new Date(date);
  copy.setUTCMinutes(0, 0, 0);
  return copy.toISOString().replace(".000Z", "Z");
}

const VALID_AT = isoHour(new Date());
const RUN_AT = isoHour(new Date(Date.parse(VALID_AT) - 6 * 60 * 60 * 1000));
const VALID_FROM = isoHour(new Date(Date.parse(RUN_AT) + 60 * 60 * 1000));
const VALID_THROUGH = isoHour(new Date(Date.parse(RUN_AT) + 48 * 60 * 60 * 1000));

function textResponse(body, contentType = "application/json") {
  return new Response(body, {
    status: 200,
    headers: { "content-type": contentType },
  });
}

function fixtureFetch(url) {
  const requestUrl = new URL(url);
  assert.equal(requestUrl.hostname, "geo.weather.gc.ca");
  const requestType = requestUrl.searchParams.get("REQUEST");

  if (requestType === "GetCapabilities") {
    assert.equal(requestUrl.searchParams.get("LAYERS"), "RDPS_10km_WindSpeed_10m");
    return Promise.resolve(textResponse(`
      <Layer>
        <Dimension name="time" units="ISO8601" default="${VALID_AT}" nearestValue="0">${VALID_FROM}/${VALID_THROUGH}/PT1H</Dimension>
        <Dimension name="reference_time" units="ISO8601" default="${RUN_AT}" multipleValues="1">${RUN_AT}/${RUN_AT}/PT6H</Dimension>
      </Layer>
    `, "application/xml"));
  }

  if (requestType === "GetMap") {
    assert.equal(requestUrl.searchParams.get("LAYERS"), "RDPS_10km_WindSpeed_10m");
    assert.equal(requestUrl.searchParams.get("STYLES"), "WINDSPEEDKMH-LINEAR");
    assert.equal(requestUrl.searchParams.get("SRS"), "EPSG:3857");
    assert.equal(requestUrl.searchParams.get("TIME"), VALID_AT);
    assert.equal(requestUrl.searchParams.get("DIM_REFERENCE_TIME"), RUN_AT);
    assert.equal(requestUrl.searchParams.get("BBOX").split(",").length, 4);
    return Promise.resolve(new Response(new Uint8Array([137, 80, 78, 71]), {
      status: 200,
      headers: { "content-type": "image/png" },
    }));
  }

  if (requestType === "GetFeatureInfo") {
    const layer = requestUrl.searchParams.get("LAYERS");
    const value = layer === "RDPS_10km_WindSpeed_10m" ? 5.5 : 270;
    return Promise.resolve(textResponse(JSON.stringify({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.01, 47.61] },
        properties: {
          value,
          time: VALID_AT,
          dim_reference_time: RUN_AT,
        },
      }],
    })));
  }

  return Promise.reject(new Error(`Unexpected URL: ${url}`));
}

const metadata = await buildForecastMetadata({ fetchImpl: fixtureFetch });
assert.equal(metadata.id, "eccc-rdps-10km-10m-wind");
assert.equal(metadata.validAt, VALID_AT);
assert.equal(metadata.runAt, RUN_AT);
assert.equal(metadata.validThrough, VALID_THROUGH);
assert.equal(metadata.resolutionKm, 10);

const world = tileMercatorBbox(0, 0, 0);
assert.ok(Math.abs(world[0] + 20_037_508.342789244) < 0.001);
assert.ok(Math.abs(world[3] - 20_037_508.342789244) < 0.001);

const originalFetch = globalThis.fetch;
globalThis.fetch = fixtureFetch;
try {
  const metadataResponse = await worker.fetch(
    new Request("https://conditions.example/conditions/wind/forecast"),
    {},
    { waitUntil() {} }
  );
  assert.equal(metadataResponse.status, 200);
  const routedMetadata = await metadataResponse.json();
  assert.equal(routedMetadata.model.validAt, VALID_AT);
  assert.equal(routedMetadata.tileTemplateBase, "https://conditions.example/conditions/wind/forecast/tiles/{z}/{x}/{y}.png");

  const tileUrl = new URL("https://conditions.example/conditions/wind/forecast/tiles/4/2/5.png");
  tileUrl.searchParams.set("time", VALID_AT);
  tileUrl.searchParams.set("run", RUN_AT);
  const tileResponse = await worker.fetch(
    new Request(tileUrl),
    {},
    { waitUntil() {} }
  );
  assert.equal(tileResponse.status, 200);
  assert.equal(tileResponse.headers.get("content-type"), "image/png");
  assert.equal(tileResponse.headers.get("x-forecast-source"), "ECCC-RDPS");

  const pointUrl = new URL("https://conditions.example/conditions/wind/forecast/point");
  pointUrl.searchParams.set("lat", "47.6");
  pointUrl.searchParams.set("lon", "-122");
  pointUrl.searchParams.set("time", VALID_AT);
  pointUrl.searchParams.set("run", RUN_AT);
  const pointResponse = await worker.fetch(
    new Request(pointUrl),
    {},
    { waitUntil() {} }
  );
  assert.equal(pointResponse.status, 200);
  const point = await pointResponse.json();
  assert.equal(Math.round(point.speedKmh), 20);
  assert.equal(point.directionDegrees, 270);
  assert.equal(point.directionCardinal, "W");

  const invalidPoint = new URL(pointUrl);
  invalidPoint.searchParams.set("lat", "70");
  const invalidPointResponse = await worker.fetch(
    new Request(invalidPoint),
    {},
    { waitUntil() {} }
  );
  assert.equal(invalidPointResponse.status, 400);

  const preflight = await worker.fetch(
    new Request("https://conditions.example/conditions/wind/forecast", { method: "OPTIONS" }),
    {},
    { waitUntil() {} }
  );
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-methods"), "GET, OPTIONS");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("forecast wind tests passed");
