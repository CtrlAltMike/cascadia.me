// Cascadia Signals permanent beta application.
const REGION_BOUNDS = [-139.2, 41.7, -114, 60.1];
const EMPTY_COLLECTION = { type: "FeatureCollection", features: [] };
const RESOURCE_CLUSTER_MAX_ZOOM = 10;
const CENSUS_STATE_COUNTY = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer";
const CENSUS_PLACES = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer";
const CENSUS_TRIBAL = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/AIANNHA/MapServer";
const CENSUS_ZCTA = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/PUMA_TAD_TAZ_UGA_ZCTA/MapServer/1";
const NOAA_CWA = "https://mapservices.weather.noaa.gov/static/rest/services/nws_reference_maps/nws_reference_map/MapServer/1";
const ECCC_FORECAST_ZONES = "https://api.weather.gc.ca/collections/public-standard-forecast-zones";
const BC_LEGAL_ADMIN = "https://delivery.maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_legal_admin_boundaries/MapServer";
const STATCAN_FSA = "https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Digital_boundary_files/MapServer/14";

const publisherLabels = {
  federal: "Federal",
  tribal: "Tribal nation",
  state: "State / province",
  county: "County / regional",
  local: "City / community"
};

const publisherColors = {
  federal: "#255f6a",
  tribal: "#8a6542",
  state: "#61725b",
  county: "#c9903e",
  local: "#b85635"
};

const categoryLabels = {
  alerts: "Alerts",
  emergency: "Emergency management",
  transport: "Transportation",
  hazards: "Weather & hazards",
  support: "Health & support",
  community: "Community readiness"
};

const familyLabels = {
  state: "State / province boundary",
  county: "County / regional boundary",
  city: "Municipal boundary",
  "forecast-us": "NWS forecast office area",
  "forecast-ca": "ECCC public forecast zone",
  "tribal-reference": "Tribal reference geography"
};

const groupOrder = ["Federal & regional", "State & statewide", "Tribal", "County & regional", "City & community"];

const coreResources = [
  {
    id: "fema-region-10",
    name: "FEMA Region 10",
    organization: "Federal Emergency Management Agency",
    publisher: "federal",
    group: "Federal & regional",
    place: "Washington and Oregon",
    categories: ["emergency", "support", "community"],
    summary: "Regional FEMA contacts, disaster assistance, preparedness, and recovery information for the Pacific Northwest.",
    url: "https://www.fema.gov/about/regions/region-10",
    coverageKeys: ["state-wa", "state-or"],
    fallbackBounds: REGION_BOUNDS,
    coverageNote: "Applies across Washington and Oregon within FEMA Region 10.",
    point: [-122.205, 47.76]
  },
  {
    id: "nws-seattle",
    name: "National Weather Service — Seattle",
    organization: "NOAA / National Weather Service",
    publisher: "federal",
    group: "Federal & regional",
    place: "Western Washington",
    categories: ["alerts", "hazards"],
    summary: "Official forecasts, warnings, watches, weather briefings, and local hazard information for western Washington.",
    url: "https://www.weather.gov/sew/",
    coverageKeys: ["nws-sew"],
    fallbackBounds: [-125.2, 46.8, -120.8, 49.15],
    coverageNote: "Applies within the Seattle NWS County Warning Area.",
    point: [-122.54, 47.667]
  },
  {
    id: "nws-portland",
    name: "National Weather Service — Portland",
    organization: "NOAA / National Weather Service",
    publisher: "federal",
    group: "Federal & regional",
    place: "Northwest Oregon and southwest Washington",
    categories: ["alerts", "hazards"],
    summary: "Official forecasts, warnings, watches, weather briefings, and local hazard information for the lower Columbia region.",
    url: "https://www.weather.gov/pqr/",
    coverageKeys: ["nws-pqr"],
    fallbackBounds: [-125.1, 43.3, -120.8, 46.4],
    coverageNote: "Applies within the Portland NWS County Warning Area.",
    point: [-122.847, 45.097]
  },
  {
    id: "nws-medford",
    name: "National Weather Service — Medford",
    organization: "NOAA / National Weather Service",
    publisher: "federal",
    group: "Federal & regional",
    place: "Southern Oregon and northern California",
    categories: ["alerts", "hazards"],
    summary: "Official forecasts, warnings, watches, and hazard information for southern Oregon and neighboring areas.",
    url: "https://www.weather.gov/mfr/",
    coverageKeys: ["nws-mfr"],
    fallbackBounds: [-125, 41.7, -119.7, 44.5],
    coverageNote: "Applies within the Medford NWS County Warning Area.",
    point: [-122.02, 42.478]
  },
  {
    id: "usgs-cvo",
    name: "Cascades Volcano Observatory",
    organization: "U.S. Geological Survey",
    publisher: "federal",
    group: "Federal & regional",
    place: "Cascade Range",
    categories: ["alerts", "hazards", "community"],
    summary: "Volcano status, monitoring, hazard science, and preparedness information for Cascade volcanoes.",
    url: "https://www.usgs.gov/observatories/cvo",
    coverageKeys: [],
    fallbackBounds: [-125.1, 40.8, -118.2, 49.15],
    coverageNote: "Regional relevance is broad; Signals does not substitute a single perimeter for volcano-specific hazard maps.",
    point: [-122.59, 45.62]
  },
  {
    id: "pnsn",
    name: "Pacific Northwest Seismic Network",
    organization: "University of Washington and University of Oregon",
    publisher: "local",
    group: "Federal & regional",
    place: "Pacific Northwest",
    categories: ["alerts", "hazards", "community"],
    summary: "Earthquake information, seismic monitoring, ShakeAlert education, and regional preparedness resources.",
    url: "https://pnsn.org/",
    coverageKeys: [],
    fallbackBounds: REGION_BOUNDS,
    coverageNote: "Regional network relevance; no single service perimeter is asserted here.",
    point: [-122.31, 47.654]
  },
  {
    id: "wa-emd-alerts",
    name: "Washington alerts and warnings",
    organization: "Washington Emergency Management Division",
    publisher: "state",
    group: "State & statewide",
    place: "Washington",
    categories: ["alerts", "emergency", "community"],
    summary: "State guidance to emergency alert systems, local opt-in notifications, weather warnings, and other official channels.",
    url: "https://mil.wa.gov/alerts",
    coverageKeys: ["state-wa"],
    fallbackBounds: [-125.2, 45.5, -116.7, 49.15],
    coverageNote: "Statewide starting point; many subscriptions are administered locally.",
    point: [-122.89, 47.04]
  },
  {
    id: "wsdot-alerts",
    name: "WSDOT travel alerts",
    organization: "Washington State Department of Transportation",
    publisher: "state",
    group: "State & statewide",
    place: "Washington",
    categories: ["alerts", "transport"],
    summary: "Email, text, and app notifications for highway travel alerts, ferries, passes, and selected routes.",
    url: "https://wsdot.wa.gov/travel/sign-wsdot-travel-alerts",
    coverageKeys: ["state-wa"],
    fallbackBounds: [-125.2, 45.5, -116.7, 49.15],
    coverageNote: "Statewide transportation resource.",
    point: [-122.9, 47.04]
  },
  {
    id: "wa-dnr-wildfire",
    name: "Washington Wildfire Portal",
    organization: "Washington Department of Natural Resources",
    publisher: "state",
    group: "State & statewide",
    place: "Washington",
    categories: ["alerts", "emergency", "hazards"],
    summary: "State wildfire information, incident links, restrictions, smoke resources, and readiness guidance.",
    url: "https://dnr.wa.gov/wildfire-resources/current-wildfire-incident-information/wildfire-portal",
    coverageKeys: ["state-wa"],
    fallbackBounds: [-125.2, 45.5, -116.7, 49.15],
    coverageNote: "Statewide wildfire information resource.",
    point: [-122.91, 47.04]
  },
  {
    id: "wa-211",
    name: "Washington 211",
    organization: "Washington 211",
    publisher: "local",
    group: "State & statewide",
    place: "Washington",
    categories: ["support", "community"],
    summary: "Statewide connections to health and human services, housing, food, crisis support, and disaster-related assistance.",
    url: "https://wa211.org/",
    coverageKeys: ["state-wa"],
    fallbackBounds: [-125.2, 45.5, -116.7, 49.15],
    coverageNote: "Statewide support directory and helpline.",
    point: [-122.9, 47.05]
  },
  {
    id: "oregon-oem",
    name: "Oregon Department of Emergency Management",
    organization: "Oregon Department of Emergency Management",
    publisher: "state",
    group: "State & statewide",
    place: "Oregon",
    categories: ["emergency", "community", "hazards"],
    summary: "State emergency-management information, preparedness guidance, hazard resources, and links to local partners.",
    url: "https://www.oregon.gov/oem/Pages/default.aspx",
    coverageKeys: ["state-or"],
    fallbackBounds: [-125.2, 41.7, -116.4, 46.4],
    coverageNote: "Statewide emergency-management resource.",
    point: [-123.03, 44.94]
  },
  {
    id: "or-alert",
    name: "OR-Alert",
    organization: "Oregon Department of Emergency Management",
    publisher: "state",
    group: "State & statewide",
    place: "Oregon",
    categories: ["alerts", "emergency", "community"],
    summary: "A statewide gateway for finding and registering with participating local emergency notification systems.",
    url: "https://oralert.gov/",
    coverageKeys: ["state-or"],
    fallbackBounds: [-125.2, 41.7, -116.4, 46.4],
    coverageNote: "Statewide gateway; enrollment and alert coverage vary by participating local jurisdiction.",
    point: [-123.04, 44.94]
  },
  {
    id: "tripcheck",
    name: "TripCheck",
    organization: "Oregon Department of Transportation",
    publisher: "state",
    group: "State & statewide",
    place: "Oregon",
    categories: ["alerts", "transport"],
    summary: "Official road conditions, closures, incidents, cameras, weather, and travel information for Oregon highways.",
    url: "https://tripcheck.com/",
    coverageKeys: ["state-or"],
    fallbackBounds: [-125.2, 41.7, -116.4, 46.4],
    coverageNote: "Statewide transportation resource.",
    point: [-123.05, 44.94]
  },
  {
    id: "oregon-211",
    name: "211info",
    organization: "211info",
    publisher: "local",
    group: "State & statewide",
    place: "Oregon",
    categories: ["support", "community"],
    summary: "Connections to health, housing, food, utilities, crisis, and other community services across Oregon.",
    url: "https://www.211info.org/",
    coverageKeys: ["state-or"],
    fallbackBounds: [-125.2, 41.7, -116.4, 46.4],
    coverageNote: "Statewide support directory and helpline.",
    point: [-122.68, 45.52]
  },
  {
    id: "grand-ronde-emergency",
    name: "Grand Ronde Emergency Services",
    organization: "Confederated Tribes of the Grand Ronde Community of Oregon",
    publisher: "tribal",
    group: "Tribal",
    place: "Grand Ronde and Willamina area",
    categories: ["emergency", "support", "community"],
    summary: "Tribal fire, emergency medical, hazardous-materials, and emergency-management services for the Grand Ronde and Willamina area.",
    url: "https://www.grandronde.org/government/emergency-services/",
    coverageKeys: [],
    fallbackBounds: [-123.78, 44.88, -123.38, 45.18],
    coverageNote: "The official page names its service area, but Signals does not equate that area with a Census reservation boundary.",
    point: [-123.61, 45.06]
  },
  {
    id: "alert-king-county",
    name: "ALERT King County",
    organization: "King County Emergency Management",
    publisher: "county",
    group: "County & regional",
    place: "King County, Washington",
    categories: ["alerts", "emergency"],
    summary: "Opt-in regional notifications by text, email, or phone for emergencies and important public information.",
    url: "https://kingcounty.gov/en/dept/executive-services/health-safety/safety-injury-prevention/emergency-preparedness/alert-king-county",
    coverageKeys: ["county-wa-king"],
    fallbackBounds: [-122.55, 47.08, -120.85, 47.82],
    coverageNote: "Applies within King County; notification availability can vary by event and location.",
    point: [-122.33, 47.6]
  },
  {
    id: "king-county-oem",
    name: "King County Emergency Management",
    organization: "King County",
    publisher: "county",
    group: "County & regional",
    place: "King County, Washington",
    categories: ["emergency", "community", "hazards"],
    summary: "County preparedness, hazards, response coordination, public education, and emergency-management contacts.",
    url: "https://kingcounty.gov/ready",
    coverageKeys: ["county-wa-king"],
    fallbackBounds: [-122.55, 47.08, -120.85, 47.82],
    coverageNote: "King County government resource.",
    point: [-122.33, 47.6]
  },
  {
    id: "king-county-ems",
    name: "King County Emergency Medical Services",
    organization: "Public Health — Seattle & King County",
    publisher: "county",
    group: "County & regional",
    place: "King County, Washington",
    categories: ["emergency", "support", "community"],
    summary: "Regional EMS system information, community response programs, training, and emergency medical service contacts.",
    url: "https://kingcounty.gov/en/dept/dph/health-safety/health-centers-programs-services/emergency-medical-services",
    coverageKeys: ["county-wa-king"],
    fallbackBounds: [-122.55, 47.08, -120.85, 47.82],
    coverageNote: "King County regional EMS resource; call 911 for an active emergency.",
    point: [-122.32, 47.6]
  },
  {
    id: "alert-seattle",
    name: "AlertSeattle",
    organization: "Seattle Office of Emergency Management",
    publisher: "local",
    group: "City & community",
    place: "Seattle, Washington",
    categories: ["alerts", "emergency"],
    summary: "Free opt-in notifications about emergencies and disruptions by text, email, voice call, and other channels.",
    url: "https://seattle.gov/emergency-management/prepare/alert-seattle",
    coverageKeys: ["city-wa-seattle"],
    fallbackBounds: [-122.46, 47.48, -122.22, 47.75],
    coverageNote: "City-focused alert system; some Seattle utility customers outside city limits may also receive relevant notices.",
    point: [-122.33, 47.61]
  },
  {
    id: "seattle-oem",
    name: "Seattle Office of Emergency Management",
    organization: "City of Seattle",
    publisher: "local",
    group: "City & community",
    place: "Seattle, Washington",
    categories: ["emergency", "hazards", "community"],
    summary: "City emergency plans, hazards, preparedness guidance, training, and response information.",
    url: "https://www.seattle.gov/emergency-management",
    coverageKeys: ["city-wa-seattle"],
    fallbackBounds: [-122.46, 47.48, -122.22, 47.75],
    coverageNote: "City of Seattle emergency-management resource.",
    point: [-122.332, 47.61]
  },
  {
    id: "seattle-hubs",
    name: "Seattle Community Emergency Hubs",
    organization: "Seattle community volunteers and Office of Emergency Management",
    publisher: "local",
    group: "City & community",
    place: "Seattle neighborhoods",
    categories: ["support", "community", "emergency"],
    summary: "Neighborhood-based preparedness and post-disaster communication sites organized by community volunteers.",
    url: "https://www.seattle.gov/emergency-management/prepare/prepare-your-neighborhood",
    coverageKeys: ["city-wa-seattle"],
    fallbackBounds: [-122.46, 47.48, -122.22, 47.75],
    coverageNote: "Seattle neighborhood resource; hub readiness and activation are locally organized.",
    point: [-122.35, 47.62]
  }
];

const coreRoleLabels = {
  "fema-region-10": "Federal preparedness and recovery support",
  "nws-seattle": "Weather warning issuer",
  "nws-portland": "Weather warning issuer",
  "nws-medford": "Weather warning issuer",
  "usgs-cvo": "Volcano hazard information",
  pnsn: "Earthquake information network",
  "wa-emd-alerts": "Official alert-system directory",
  "wsdot-alerts": "Transportation alert issuer",
  "wa-dnr-wildfire": "Wildfire incident information",
  "wa-211": "Community support directory",
  "oregon-oem": "State emergency-management source",
  "or-alert": "Official local-alert router",
  tripcheck: "Transportation incident information",
  "oregon-211": "Community support directory"
};

const resources = [
  ...coreResources.filter((resource) => !["alert-king-county", "alert-seattle"].includes(resource.id)),
  ...(window.SIGNALS_AUTHORITY_RECORDS || [])
].map((resource) => ({
  authorityRole: resource.authorityRole || coreRoleLabels[resource.id] || (
    resource.categories.includes("alerts") ? "Official information source" : "Preparedness and support source"
  ),
  rolePriority: resource.rolePriority || 5,
  verifiedOn: resource.verifiedOn || "Prototype source review",
  sourceTier: resource.sourceTier || "official-direct",
  ...resource
}));

const DIRECTORY_UPDATED_ON = "2026-07-14";
const DIRECTORY_UPDATED_LABEL = formatDirectoryDate(DIRECTORY_UPDATED_ON);

const coverageStore = new Map();
const sourceState = {
  "census-jurisdictions": "checking",
  "bc-jurisdictions": "checking",
  noaa: "checking",
  "eccc-forecast": "checking",
  "census-tribal": "checking"
};

const filtersForm = document.querySelector("#filters");
const searchInput = document.querySelector("#source-search");
const postalLookupForm = document.querySelector("#postal-lookup");
const postalInput = document.querySelector("#postal-code");
const postalSubmit = document.querySelector("#postal-submit");
const postalResult = document.querySelector("#postal-result");
const postalStatus = document.querySelector("#postal-status");
const postalJurisdictions = document.querySelector("#postal-jurisdictions");
const postalActions = document.querySelector(".postal-actions");
const confirmPostalPointButton = document.querySelector("#confirm-postal-point");
const resultList = document.querySelector("#result-list");
const resultCount = document.querySelector("#result-count");
const resultsContext = document.querySelector("#results-context");
const viewportCount = document.querySelector("#viewport-count");
const scaleLabel = document.querySelector("#scale-label");
const perimeterStatus = document.querySelector("#perimeter-status");
const overlaySummary = document.querySelector("#overlay-summary");
const recordCard = document.querySelector("#record-card");
const serviceAreaCard = document.querySelector("#service-area-card");
const mapLoading = document.querySelector("#map-loading");
const viewDialog = document.querySelector("#view-dialog");
const shareDialog = document.querySelector("#share-dialog");
const perimeterDialog = document.querySelector("#perimeter-dialog");
const betaDialog = document.querySelector("#beta-dialog");

let map;
let mapReady = false;
let selectedResourceId = null;
let selectedServiceAreaKey = null;
let visibleResources = [];
let locationSelection = null;
let awaitingMapConfirmation = false;
let initialPostalRestoreAttempted = false;
let spiderfyActive = false;
let mapFeatureClickHandled = false;

function validateAuthorityRegistry() {
  const registryRecords = window.SIGNALS_AUTHORITY_RECORDS || [];
  const meta = window.SIGNALS_AUTHORITY_META;
  const ids = new Set();
  const errors = [];
  registryRecords.forEach((resource) => {
    if (!resource.id || ids.has(resource.id)) errors.push(`Duplicate or missing id: ${resource.id || "(missing)"}`);
    ids.add(resource.id);
    if (!/^https:\/\//.test(resource.url || "")) errors.push(`Non-HTTPS URL: ${resource.id}`);
    if (!resource.coverageKeys?.length) errors.push(`Missing coverage key: ${resource.id}`);
    if (!resource.authorityRole || !resource.sourceRegistry || !resource.verifiedOn) errors.push(`Missing provenance fields: ${resource.id}`);
  });
  if (meta) {
    Object.keys(meta.expected).forEach((key) => {
      if (meta.expected[key] !== meta.actual[key]) errors.push(`${key}: expected ${meta.expected[key]}, found ${meta.actual[key]}`);
    });
  } else {
    errors.push("Registry metadata unavailable");
  }
  const status = document.querySelector('[data-authority-registry="status"]');
  if (status) {
    status.dataset.state = errors.length ? "error" : "ready";
    status.textContent = errors.length ? `${errors.length} integrity issue${errors.length === 1 ? "" : "s"}` : `${registryRecords.length} official records checked`;
  }
  if (errors.length) console.warn("Signals authority registry integrity:", errors);
  return errors;
}

function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function centerOfBounds(bbox) {
  return bbox ? [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2] : null;
}

function boundsIntersect(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

function pointInBounds(point, bounds) {
  return point[0] >= bounds[0] && point[0] <= bounds[2] && point[1] >= bounds[1] && point[1] <= bounds[3];
}

function segmentIntersects(a, b, c, d) {
  const cross = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const onSegment = (p, q, r) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0])
    && Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
  const d1 = cross(a, b, c);
  const d2 = cross(a, b, d);
  const d3 = cross(c, d, a);
  const d4 = cross(c, d, b);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return (d1 === 0 && onSegment(a, c, b)) || (d2 === 0 && onSegment(a, d, b))
    || (d3 === 0 && onSegment(c, a, d)) || (d4 === 0 && onSegment(c, b, d));
}

function polygonIntersectsBounds(rings, bounds) {
  const corners = [[bounds[0], bounds[1]], [bounds[2], bounds[1]], [bounds[2], bounds[3]], [bounds[0], bounds[3]]];
  const edges = corners.map((corner, index) => [corner, corners[(index + 1) % corners.length]]);
  for (const ring of rings) {
    if (ring.some((point) => pointInBounds(point, bounds))) return true;
    for (let index = 0; index < ring.length - 1; index += 1) {
      if (edges.some(([start, end]) => segmentIntersects(ring[index], ring[index + 1], start, end))) return true;
    }
  }
  return corners.some((corner) => pointInRing(corner, rings[0]) && !rings.slice(1).some((hole) => pointInRing(corner, hole)));
}

function featureIntersectsBounds(feature, bounds) {
  const geometry = feature?.geometry;
  if (!geometry) return false;
  if (geometry.type === "Polygon") return polygonIntersectsBounds(geometry.coordinates, bounds);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some((polygon) => polygonIntersectsBounds(polygon, bounds));
  return boundsIntersect(featureBounds(feature), bounds);
}

function featureBounds(feature) {
  const points = [];
  function visit(value) {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      points.push(value);
      return;
    }
    value.forEach(visit);
  }
  visit(feature?.geometry?.coordinates);
  if (!points.length) return null;
  return points.reduce(
    (bbox, point) => [
      Math.min(bbox[0], point[0]),
      Math.min(bbox[1], point[1]),
      Math.max(bbox[2], point[0]),
      Math.max(bbox[3], point[1])
    ],
    [Infinity, Infinity, -Infinity, -Infinity]
  );
}

function currentViewportBounds() {
  if (!mapReady) return REGION_BOUNDS;
  const bounds = map.getBounds();
  return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
}

function registerCoverage(key, feature, family, label, sourceUrl, sourceLabel) {
  const normalized = {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      ...feature.properties,
      key,
      family,
      label,
      sourceUrl,
      sourceLabel
    }
  };
  coverageStore.set(key, { feature: normalized, bbox: featureBounds(normalized), family, label, sourceUrl, sourceLabel });
}

function registerCachedBcProvinceCoverage() {
  const feature = window.SIGNALS_BC_PROVINCE_BOUNDARY;
  if (!feature?.geometry || !featureBounds(feature)) return false;
  registerCoverage(
    "province-bc",
    feature,
    "state",
    "British Columbia",
    `${BC_LEGAL_ADMIN}/25`,
    "Province of British Columbia · official local snapshot"
  );
  return true;
}

function validateEcccForecastCollection(collection) {
  if (!Array.isArray(collection?.features)) throw new Error("ECCC forecast response did not contain features");
  const expectedCount = Number(window.SIGNALS_BC_FORECAST_ZONES_META?.expectedCount) || 52;
  const features = collection.features.filter((feature) => String(feature.properties?.PROVINCE_C || "").split(",").includes("BC"));
  const codes = features.map((feature) => String(feature.properties?.CLC || "").trim()).filter(Boolean);
  const uniqueCodes = new Set(codes);
  const invalidFeatures = features.filter((feature) => !feature.properties?.CLC
    || !feature.properties?.NAME
    || feature.properties?.USAGE !== "PubStdZone"
    || feature.properties?.DEPICTN !== "hybrid"
    || !["Polygon", "MultiPolygon"].includes(feature.geometry?.type)
    || !featureBounds(feature));
  if (features.length < expectedCount) throw new Error(`Expected at least ${expectedCount} B.C. forecast zones; received ${features.length}`);
  if (uniqueCodes.size !== features.length) throw new Error("ECCC forecast-zone CLC codes were missing or duplicated");
  if (invalidFeatures.length) throw new Error(`${invalidFeatures.length} ECCC forecast zones had invalid metadata or geometry`);
  const versions = [...new Set(features.map((feature) => feature.properties.version).filter(Boolean))];
  if (versions.length !== 1) throw new Error("ECCC forecast zones had missing or mixed package versions");
  return { features, version: versions[0] };
}

function registerEcccForecastCoverage(collection, sourceLabel) {
  const validated = validateEcccForecastCollection(collection);
  validated.features.forEach((feature) => {
    const code = String(feature.properties.CLC);
    registerCoverage(
      `eccc-zone-${slugify(code)}`,
      feature,
      "forecast-ca",
      `ECCC ${feature.properties.NAME}`,
      ECCC_FORECAST_ZONES,
      sourceLabel
    );
  });
  return { count: validated.features.length, version: validated.version };
}

function registerCachedEcccForecastCoverage() {
  try {
    return registerEcccForecastCoverage(
      window.SIGNALS_BC_FORECAST_ZONES,
      "Environment and Climate Change Canada / Meteorological Service of Canada · official local snapshot"
    );
  } catch (error) {
    console.warn("Signals cached ECCC forecast geometry:", error);
    return null;
  }
}

async function fetchArcGis(url, where, outFields = "*", maxAllowableOffset = "0.002") {
  const endpoint = new URL(`${url}/query`);
  endpoint.searchParams.set("where", where);
  endpoint.searchParams.set("outFields", outFields);
  endpoint.searchParams.set("returnGeometry", "true");
  endpoint.searchParams.set("outSR", "4326");
  endpoint.searchParams.set("geometryPrecision", "5");
  endpoint.searchParams.set("maxAllowableOffset", maxAllowableOffset);
  endpoint.searchParams.set("f", "geojson");
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Geometry request failed (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data.features)) throw new Error("Geometry response did not contain features");
  return data.features.filter((feature) => feature.geometry);
}

function ringArea(ring) {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return area + (point[0] * next[1]) - (next[0] * point[1]);
  }, 0) / 2;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const currentPoint = ring[index];
    const previousPoint = ring[previous];
    const crosses = (currentPoint[1] > point[1]) !== (previousPoint[1] > point[1])
      && point[0] < ((previousPoint[0] - currentPoint[0]) * (point[1] - currentPoint[1])) / (previousPoint[1] - currentPoint[1]) + currentPoint[0];
    if (crosses) inside = !inside;
  }
  return inside;
}

function geometryPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function polygonContainsPoint(polygon, point) {
  return Boolean(polygon?.[0])
    && pointInRing(point, polygon[0])
    && !polygon.slice(1).some((hole) => pointInRing(point, hole));
}

function featureContainsPoint(feature, point) {
  return geometryPolygons(feature?.geometry).some((polygon) => polygonContainsPoint(polygon, point));
}

function ringsIntersect(first, second) {
  for (let firstIndex = 0; firstIndex < first.length - 1; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < second.length - 1; secondIndex += 1) {
      if (segmentIntersects(first[firstIndex], first[firstIndex + 1], second[secondIndex], second[secondIndex + 1])) return true;
    }
  }
  return false;
}

function polygonsIntersect(first, second) {
  if (first.some((firstRing) => second.some((secondRing) => ringsIntersect(firstRing, secondRing)))) return true;
  if (first[0]?.some((point) => polygonContainsPoint(second, point))) return true;
  return Boolean(second[0]?.some((point) => polygonContainsPoint(first, point)));
}

function featuresIntersect(first, second) {
  const firstBbox = featureBounds(first);
  const secondBbox = featureBounds(second);
  if (!firstBbox || !secondBbox || !boundsIntersect(firstBbox, secondBbox)) return false;
  const firstPolygons = geometryPolygons(first.geometry);
  const secondPolygons = geometryPolygons(second.geometry);
  return firstPolygons.some((firstPolygon) => secondPolygons.some((secondPolygon) => polygonsIntersect(firstPolygon, secondPolygon)));
}

function esriPolygonToGeoJson(geometry) {
  const rings = geometry?.rings?.filter((ring) => ring.length >= 4) || [];
  if (!rings.length) return null;
  let outers = rings.filter((ring) => ringArea(ring) < 0);
  let holes = rings.filter((ring) => ringArea(ring) >= 0);
  if (!outers.length) {
    outers = rings;
    holes = [];
  }
  const polygons = outers.map((ring) => [ring]);
  holes.forEach((hole) => {
    const polygonIndex = outers.findIndex((outer) => pointInRing(hole[0], outer));
    if (polygonIndex >= 0) polygons[polygonIndex].push(hole);
    else polygons.push([hole]);
  });
  return polygons.length === 1
    ? { type: "Polygon", coordinates: polygons[0] }
    : { type: "MultiPolygon", coordinates: polygons };
}

function fetchArcGisJsonp(url, where, outFields = "*", maxAllowableOffset = "0.01") {
  return new Promise((resolve, reject) => {
    const callbackName = `signalsArcGis${Date.now()}${Math.random().toString(36).slice(2)}`;
    const endpoint = new URL(`${url}/query`);
    endpoint.searchParams.set("where", where);
    endpoint.searchParams.set("outFields", outFields);
    endpoint.searchParams.set("returnGeometry", "true");
    endpoint.searchParams.set("outSR", "4326");
    endpoint.searchParams.set("geometryPrecision", "5");
    endpoint.searchParams.set("maxAllowableOffset", maxAllowableOffset);
    endpoint.searchParams.set("f", "json");
    endpoint.searchParams.set("callback", callbackName);
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => finish(new Error("B.C. geometry request timed out")), 20000);
    function finish(error, value) {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
      if (error) reject(error); else resolve(value);
    }
    window[callbackName] = (data) => {
      if (data?.error) return finish(new Error(data.error.message || "B.C. geometry service error"));
      const features = (data?.features || []).map((feature) => ({
        type: "Feature",
        properties: feature.attributes || {},
        geometry: esriPolygonToGeoJson(feature.geometry)
      })).filter((feature) => feature.geometry);
      finish(null, features);
    };
    script.onerror = () => finish(new Error("B.C. geometry script could not load"));
    script.src = endpoint.toString();
    document.head.append(script);
  });
}

async function fetchArcGisJsonpWithRetry(url, where, outFields = "*", maxAllowableOffset = "0.01") {
  try {
    return await fetchArcGisJsonp(url, where, outFields, maxAllowableOffset);
  } catch (firstError) {
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    try {
      return await fetchArcGisJsonp(url, where, outFields, maxAllowableOffset);
    } catch (secondError) {
      secondError.cause = firstError;
      throw secondError;
    }
  }
}

function markSource(name, state, label) {
  sourceState[name] = state;
  const element = document.querySelector(`[data-perimeter-source="${name}"]`);
  if (element) {
    element.dataset.state = state;
    element.textContent = label;
  }
  const states = Object.values(sourceState);
  if (states.every((value) => value === "ready")) {
    perimeterStatus.dataset.state = "ready";
    perimeterStatus.lastChild.textContent = "Geometry ready";
  } else if (states.some((value) => value === "error" || value === "partial")) {
    perimeterStatus.dataset.state = "partial";
    perimeterStatus.lastChild.textContent = "Geometry partial";
  } else {
    perimeterStatus.dataset.state = "checking";
    perimeterStatus.lastChild.textContent = "Checking geometry";
  }
}

async function loadJurisdictionGeometry() {
  try {
    const waCities = ["Aberdeen", "Bainbridge Island", "Marysville", "Puyallup", "Redmond", "Seattle", "Snoqualmie", "Sumner", "Tacoma"];
    const quotedCities = waCities.map((name) => `'${name.replaceAll("'", "''")}'`).join(",");
    const [states, counties, cities] = await Promise.all([
      fetchArcGis(`${CENSUS_STATE_COUNTY}/0`, "STATE IN ('53','41')", "STATE,STUSAB,BASENAME,NAME,GEOID"),
      fetchArcGis(`${CENSUS_STATE_COUNTY}/1`, "STATE IN ('53','41')", "STATE,COUNTY,BASENAME,NAME,GEOID", "0.004"),
      fetchArcGis(`${CENSUS_PLACES}/4`, `(STATE='53' AND BASENAME IN (${quotedCities})) OR (STATE='41' AND BASENAME='Portland')`, "STATE,BASENAME,NAME,GEOID", "0.001")
    ]);
    const stateSource = `${CENSUS_STATE_COUNTY}/0`;
    states.forEach((feature) => {
      const abbreviation = String(feature.properties.STUSAB || "").toLowerCase();
      if (abbreviation === "wa" || abbreviation === "or") {
        registerCoverage(`state-${abbreviation}`, feature, "state", feature.properties.NAME, stateSource, "U.S. Census TIGERweb");
      }
    });
    counties.forEach((feature) => {
      const region = String(feature.properties.STATE) === "53" ? "wa" : String(feature.properties.STATE) === "41" ? "or" : null;
      const name = feature.properties.BASENAME || feature.properties.NAME;
      if (region && name) registerCoverage(`county-${region}-${slugify(name)}`, feature, "county", `${name} County`, `${CENSUS_STATE_COUNTY}/1`, "U.S. Census TIGERweb");
    });
    cities.forEach((feature) => {
      const region = String(feature.properties.STATE) === "53" ? "wa" : String(feature.properties.STATE) === "41" ? "or" : null;
      const name = feature.properties.BASENAME || feature.properties.NAME;
      if (region && name) registerCoverage(`city-${region}-${slugify(name)}`, feature, "city", name, `${CENSUS_PLACES}/4`, "U.S. Census TIGERweb");
    });
    const expectedCountyCount = 75;
    const mappedCountyCount = [...coverageStore.keys()].filter((key) => key.startsWith("county-wa-") || key.startsWith("county-or-")).length;
    if (!["state-wa", "state-or"].every((key) => coverageStore.has(key)) || mappedCountyCount !== expectedCountyCount) {
      throw new Error(`Expected ${expectedCountyCount} counties; mapped ${mappedCountyCount}`);
    }
    markSource("census-jurisdictions", cities.length >= 10 ? "ready" : "partial", `${mappedCountyCount} counties · ${cities.length} cities`);
  } catch (error) {
    console.warn("Signals jurisdiction geometry:", error);
    markSource("census-jurisdictions", "error", "Unavailable");
  }
}

function canonicalBcRegionalName(feature) {
  const abbreviation = feature.properties.ADMIN_AREA_ABBREVIATION;
  const byAbbreviation = {
    RDAC: "Alberni-Clayoquot", RDBN: "Bulkley-Nechako", CAPRD: "Capital", CRD: "Cariboo",
    CCRD: "Central Coast", RDCK: "Central Kootenay", RDCO: "Central Okanagan", CSRD: "Columbia-Shuswap",
    CMXRD: "Comox Valley", CVRD: "Cowichan Valley", RDEK: "East Kootenay", FVRD: "Fraser Valley",
    RDFFG: "Fraser-Fort George", RDKS: "Kitimat-Stikine", RDKB: "Kootenay Boundary", MVRD: "Metro Vancouver",
    RDMW: "Mount Waddington", RDN: "Nanaimo", NCRD: "North Coast", RDNO: "North Okanagan",
    RDOS: "Okanagan-Similkameen", PRRD: "Peace River", qRD: "qathet", SLRD: "Squamish-Lillooet",
    STRD: "Strathcona", SCRD: "Sunshine Coast", TNRD: "Thompson-Nicola"
  };
  return byAbbreviation[abbreviation] || null;
}

async function loadBcJurisdictionGeometry() {
  try {
    const cityWhere = "ADMIN_AREA_ABBREVIATION IN ('Vancouver','Victoria','Kamloops')";
    const [provinceResult, regionsResult, citiesResult] = await Promise.allSettled([
      fetchArcGisJsonpWithRetry(`${BC_LEGAL_ADMIN}/25`, "1=1", "ADMIN_AREA_NAME,ADMIN_AREA_ABBREVIATION,LGL_ADMIN_AREA_ID", "0.01"),
      fetchArcGisJsonpWithRetry(`${BC_LEGAL_ADMIN}/16`, "ADMIN_AREA_ABBREVIATION <> 'Stikine Region'", "ADMIN_AREA_NAME,ADMIN_AREA_ABBREVIATION,LGL_ADMIN_AREA_ID", "0.01"),
      fetchArcGisJsonpWithRetry(`${BC_LEGAL_ADMIN}/18`, cityWhere, "ADMIN_AREA_NAME,ADMIN_AREA_ABBREVIATION,LGL_ADMIN_AREA_ID", "0.001")
    ]);
    const province = provinceResult.status === "fulfilled" ? provinceResult.value : [];
    const regions = regionsResult.status === "fulfilled" ? regionsResult.value : [];
    const cities = citiesResult.status === "fulfilled" ? citiesResult.value : [];
    [provinceResult, regionsResult, citiesResult].forEach((result) => {
      if (result.status === "rejected") console.warn("Signals B.C. geometry source:", result.reason);
    });

    if (province[0]) registerCoverage("province-bc", province[0], "state", "British Columbia", `${BC_LEGAL_ADMIN}/25`, "Province of British Columbia");
    regions.forEach((feature) => {
      const name = canonicalBcRegionalName(feature);
      if (name) registerCoverage(`regional-bc-${slugify(name)}`, feature, "county", `${name} Regional District`, `${BC_LEGAL_ADMIN}/16`, "Province of British Columbia");
    });
    cities.forEach((feature) => {
      const name = feature.properties.ADMIN_AREA_ABBREVIATION;
      if (name) registerCoverage(`city-bc-${slugify(name)}`, feature, "city", name, `${BC_LEGAL_ADMIN}/18`, "Province of British Columbia");
    });
    const mappedRegionCount = [...coverageStore.keys()].filter((key) => key.startsWith("regional-bc-")).length;
    const provinceReady = coverageStore.has("province-bc");
    const provinceLive = province.length > 0;
    const allReady = provinceReady && mappedRegionCount === 27 && cities.length === 3;
    const anyReady = provinceReady || mappedRegionCount > 0 || cities.length > 0;
    if (!anyReady) {
      markSource("bc-jurisdictions", "error", "Unavailable");
      return;
    }
    const provinceLabel = provinceLive ? "Province live" : provinceReady ? "Province cached" : "Province unavailable";
    markSource("bc-jurisdictions", allReady ? "ready" : "partial", `${provinceLabel} · ${mappedRegionCount} districts · ${cities.length} cities`);
  } catch (error) {
    console.warn("Signals B.C. jurisdiction geometry:", error);
    markSource("bc-jurisdictions", "error", "Unavailable");
  }
}

async function loadNoaaGeometry() {
  try {
    const expectedCodes = ["sew", "otx", "pqr", "pdt", "mfr", "boi"];
    const features = await fetchArcGis(NOAA_CWA, "CWA IN ('SEW','OTX','PQR','PDT','MFR','BOI')", "CWA,WFO,CITYSTATE", "0.004");
    features.forEach((feature) => {
      const code = String(feature.properties.cwa || feature.properties.CWA || "").toLowerCase();
      if (!code) return;
      const cityState = feature.properties.citystate || feature.properties.CITYSTATE || code.toUpperCase();
      registerCoverage(`nws-${code}`, feature, "forecast-us", `NWS ${cityState}`, NOAA_CWA, "NOAA / National Weather Service");
    });
    if (!expectedCodes.every((code) => coverageStore.has(`nws-${code}`))) {
      throw new Error("One or more expected NWS areas were absent");
    }
    markSource("noaa", "ready", `${expectedCodes.length} areas ready`);
  } catch (error) {
    console.warn("Signals NOAA geometry:", error);
    markSource("noaa", "error", "Unavailable");
  }
}

async function loadEcccForecastGeometry() {
  const cached = [...coverageStore.keys()].filter((key) => key.startsWith("eccc-zone-")).length;
  try {
    const endpoint = new URL(`${ECCC_FORECAST_ZONES}/items`);
    endpoint.searchParams.set("f", "json");
    endpoint.searchParams.set("limit", "500");
    endpoint.searchParams.set("filter", "properties.PROVINCE_C=BC");
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`ECCC forecast-zone request failed (${response.status})`);
    const result = registerEcccForecastCoverage(
      await response.json(),
      "Environment and Climate Change Canada / Meteorological Service of Canada"
    );
    markSource("eccc-forecast", "ready", `${result.count} B.C. zones · v${result.version}`);
  } catch (error) {
    console.warn("Signals ECCC forecast geometry:", error);
    const version = window.SIGNALS_BC_FORECAST_ZONES_META?.version;
    markSource("eccc-forecast", cached ? "partial" : "error", cached ? `${cached} cached zones${version ? ` · v${version}` : ""}` : "Unavailable");
  }
}

async function loadTribalReferenceGeometry() {
  const where = "BASENAME LIKE '%Grand Ronde%' OR BASENAME LIKE '%Quinault%' OR BASENAME LIKE '%Yakama%'";
  try {
    const results = await Promise.allSettled([
      fetchArcGis(`${CENSUS_TRIBAL}/2`, where, "BASENAME,NAME,GEOID"),
      fetchArcGis(`${CENSUS_TRIBAL}/3`, where, "BASENAME,NAME,GEOID")
    ]);
    const features = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    features.forEach((feature, index) => {
      const name = feature.properties.NAME || feature.properties.BASENAME || `Tribal reference ${index + 1}`;
      const geoid = feature.properties.GEOID || index;
      registerCoverage(`tribal-reference-${geoid}-${index}`, feature, "tribal-reference", name, CENSUS_TRIBAL, "U.S. Census TIGERweb");
    });
    if (!features.length) throw new Error("No tribal reference features were returned");
    markSource("census-tribal", results.some((result) => result.status === "rejected") ? "partial" : "ready", `${features.length} areas ready`);
  } catch (error) {
    console.warn("Signals tribal reference geometry:", error);
    markSource("census-tribal", "error", "Unavailable");
  }
}

function normalizePostalLookup(value) {
  const compact = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  const zipMatch = compact.match(/^(\d{5})(?:-\d{4})?$/);
  if (zipMatch) {
    const code = zipMatch[1];
    const numericCode = Number(code);
    if (numericCode < 97000 || numericCode > 99499) {
      throw new Error("The current ZIP lookup covers Washington and Oregon.");
    }
    return {
      type: "zcta",
      code,
      label: `ZIP ${code}`,
      where: `ZCTA5='${code}'`,
      source: CENSUS_ZCTA,
      outFields: "ZCTA5,GEOID,NAME",
      sourceLabel: "U.S. Census 2020 ZCTA",
      wasReduced: compact.length > 5
    };
  }

  const canadianPattern = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ](?:\d[ABCEGHJ-NPRSTVWXYZ]\d)?$/;
  if (canadianPattern.test(compact)) {
    const code = compact.slice(0, 3);
    if (!code.startsWith("V")) throw new Error("The current Canadian lookup covers British Columbia.");
    return {
      type: "fsa",
      code,
      label: `FSA ${code}`,
      where: `CFSAUID='${code}'`,
      source: STATCAN_FSA,
      outFields: "CFSAUID,PRUID,PRNAME",
      sourceLabel: "Statistics Canada 2021 census FSA",
      wasReduced: compact.length > 3
    };
  }

  throw new Error("Enter a five-digit ZIP or a Canadian postal code such as V6B 1A1.");
}

function combinePostalFeatures(features) {
  if (features.length === 1) return features[0];
  const polygons = features.flatMap((feature) => geometryPolygons(feature.geometry));
  return {
    type: "Feature",
    properties: features[0]?.properties || {},
    geometry: { type: "MultiPolygon", coordinates: polygons }
  };
}

function setPostalSourceStatus(state, label) {
  const sourceStatus = document.querySelector("#postal-source-status");
  if (!sourceStatus) return;
  sourceStatus.dataset.state = state;
  sourceStatus.textContent = label;
}

function coverageMatchesLocation(coverage, selection = locationSelection) {
  if (!coverage || !selection) return false;
  if (selection.mode === "point") return featureContainsPoint(coverage.feature, selection.point);
  return featuresIntersect(coverage.feature, selection.feature);
}

function matchedPostalJurisdictions(selection = locationSelection) {
  if (!selection) return [];
  const order = { state: 0, county: 1, city: 2 };
  return [...coverageStore.values()]
    .filter((coverage) => Object.prototype.hasOwnProperty.call(order, coverage.family) && coverageMatchesLocation(coverage, selection))
    .sort((first, second) => order[first.family] - order[second.family] || first.label.localeCompare(second.label));
}

function updatePostalMap() {
  if (!mapReady) return;
  const areaSource = map.getSource("postal-area");
  const pointSource = map.getSource("postal-point");
  if (areaSource) {
    areaSource.setData(locationSelection?.feature || EMPTY_COLLECTION);
  }
  if (pointSource) {
    pointSource.setData(locationSelection?.point ? {
      type: "Feature",
      properties: { label: locationSelection.label },
      geometry: { type: "Point", coordinates: locationSelection.point }
    } : EMPTY_COLLECTION);
  }
}

function renderPostalResult() {
  if (!locationSelection) return;
  const jurisdictions = matchedPostalJurisdictions();
  const countyMatches = jurisdictions.filter((coverage) => coverage.family === "county");
  const cityMatches = jurisdictions.filter((coverage) => coverage.family === "city");
  const ambiguous = locationSelection.mode === "area" && (countyMatches.length > 1 || cityMatches.length > 1);

  postalResult.hidden = false;
  postalResult.dataset.state = locationSelection.mode === "point" ? "confirmed" : ambiguous ? "ambiguous" : "matched";
  document.querySelector("#postal-match-title").textContent = `${locationSelection.label} · ${locationSelection.mode === "point" ? "map point confirmed" : "approximate census area"}`;

  if (awaitingMapConfirmation) {
    postalStatus.textContent = "Click your exact location inside the highlighted postal area. The point stays in this browser unless you intentionally share the view.";
  } else if (locationSelection.mode === "point") {
    postalStatus.textContent = "Services now match the point you chose, rather than every jurisdiction touched by the postal area.";
  } else if (ambiguous) {
    postalStatus.textContent = "This postal area overlaps multiple mapped service jurisdictions. Choose an exact spot before relying on the local portion of the list.";
  } else {
    postalStatus.textContent = "This is an approximate postal area. Choose an exact spot for a more precise jurisdiction match.";
  }

  if (locationSelection.wasReduced) {
    postalStatus.textContent += locationSelection.type === "fsa"
      ? " Only the first three characters were sent to the lookup source."
      : " The ZIP+4 suffix was not sent to the lookup source.";
  }

  postalJurisdictions.textContent = jurisdictions.length
    ? `Mapped jurisdictions: ${jurisdictions.map((coverage) => coverage.label).join(" · ")}`
    : "Mapped jurisdiction boundaries are still loading or unavailable; the broader directory remains visible.";
  postalActions.hidden = false;
  confirmPostalPointButton.disabled = !mapReady;
  confirmPostalPointButton.textContent = locationSelection.mode === "point" ? "Change exact spot" : "Choose exact spot on map";
}

function showPostalError(message) {
  postalResult.hidden = false;
  postalResult.dataset.state = "error";
  document.querySelector("#postal-match-title").textContent = "Postal area not matched";
  postalStatus.textContent = message;
  postalJurisdictions.textContent = "Try another Washington, Oregon, or British Columbia code, or locate the place directly on the map.";
  postalActions.hidden = true;
}

function fitPostalSelection() {
  if (!mapReady || !locationSelection?.bbox) return;
  map.fitBounds(
    [[locationSelection.bbox[0], locationSelection.bbox[1]], [locationSelection.bbox[2], locationSelection.bbox[3]]],
    { padding: { top: 96, right: 62, bottom: 62, left: 62 }, maxZoom: 10.5, duration: 700 }
  );
}

function discardLocationSelection() {
  locationSelection = null;
  awaitingMapConfirmation = false;
  selectedResourceId = null;
  recordCard.hidden = true;
  if (mapReady) map.getCanvas().style.cursor = "";
  updatePostalMap();
  updateSelectedArea();
}

function clearLocationSelection() {
  discardLocationSelection();
  postalInput.value = "";
  postalResult.hidden = true;
  postalResult.removeAttribute("data-state");
  renderDirectory();
  postalInput.focus();
}

async function runPostalLookup({ restoredPoint = null } = {}) {
  let lookup;
  try {
    lookup = normalizePostalLookup(postalInput.value);
  } catch (error) {
    discardLocationSelection();
    renderDirectory();
    showPostalError(error.message);
    return;
  }

  discardLocationSelection();
  renderDirectory();
  postalResult.hidden = false;
  postalResult.dataset.state = "loading";
  document.querySelector("#postal-match-title").textContent = `Looking up ${lookup.label}`;
  postalStatus.textContent = "Requesting official postal-area geometry…";
  postalJurisdictions.textContent = "";
  postalActions.hidden = true;
  postalSubmit.disabled = true;
  setPostalSourceStatus("checking", "Looking up…");

  try {
    const features = await fetchArcGis(lookup.source, lookup.where, lookup.outFields, "0.0005");
    if (!features.length) throw new Error("No matching census postal area was returned.");
    const feature = combinePostalFeatures(features);
    const bbox = featureBounds(feature);
    if (!bbox) throw new Error("The postal source returned no usable geometry.");

    if (lookup.type === "fsa" && String(feature.properties.PRUID) !== "59") {
      throw new Error("That FSA is outside British Columbia.");
    }
    const loadedStates = [coverageStore.get("state-wa"), coverageStore.get("state-or")].filter(Boolean);
    if (lookup.type === "zcta" && loadedStates.length === 2 && !loadedStates.some((coverage) => featuresIntersect(coverage.feature, feature))) {
      throw new Error("That ZIP area is outside Washington and Oregon.");
    }

    const validRestoredPoint = Array.isArray(restoredPoint)
      && restoredPoint.length === 2
      && restoredPoint.every(Number.isFinite)
      && featureContainsPoint(feature, restoredPoint);
    locationSelection = {
      ...lookup,
      feature,
      bbox,
      mode: validRestoredPoint ? "point" : "area",
      point: validRestoredPoint ? restoredPoint : null
    };
    postalInput.value = lookup.code;
    setPostalSourceStatus("ready", lookup.type === "zcta" ? "Census ZCTA matched" : "Statistics Canada FSA matched");
    updatePostalMap();
    renderDirectory();
    renderPostalResult();
    fitPostalSelection();
  } catch (error) {
    console.warn("Signals postal lookup:", error);
    discardLocationSelection();
    renderDirectory();
    setPostalSourceStatus("error", "Lookup unavailable");
    showPostalError(error.message || "The official postal-area source is temporarily unavailable.");
  } finally {
    postalSubmit.disabled = false;
  }
}

function beginPostalPointConfirmation() {
  if (!locationSelection || !mapReady) return;
  awaitingMapConfirmation = true;
  locationSelection.mode = "area";
  locationSelection.point = null;
  map.getCanvas().style.cursor = "crosshair";
  updatePostalMap();
  renderDirectory();
  renderPostalResult();
}

function confirmPostalPoint(point) {
  if (!awaitingMapConfirmation || !locationSelection) return;
  if (!featureContainsPoint(locationSelection.feature, point)) {
    postalStatus.textContent = `That point is outside ${locationSelection.label}. Click inside the highlighted postal area, or clear the lookup.`;
    return;
  }
  awaitingMapConfirmation = false;
  locationSelection.mode = "point";
  locationSelection.point = point;
  map.getCanvas().style.cursor = "";
  updatePostalMap();
  renderDirectory();
  renderPostalResult();
}

function restorePostalSelectionFromUrl() {
  if (initialPostalRestoreAttempted) return;
  initialPostalRestoreAttempted = true;
  const params = new URLSearchParams(location.search);
  const code = params.get("pc");
  if (!code) return;
  postalInput.value = code;
  const pin = params.get("pin")?.split(",").map(Number);
  runPostalLookup({ restoredPoint: pin?.length === 2 ? pin : null });
}

function resourceBounds(resource) {
  const exact = resource.coverageKeys.map((key) => coverageStore.get(key)?.bbox).filter(Boolean);
  return exact.length ? exact : resource.fallbackBounds ? [resource.fallbackBounds] : [];
}

function resourceAppliesToViewport(resource, viewport) {
  const exact = resource.coverageKeys.map((key) => coverageStore.get(key)).filter(Boolean);
  if (exact.length) return exact.some((coverage) => boundsIntersect(coverage.bbox, viewport) && featureIntersectsBounds(coverage.feature, viewport));
  return resourceBounds(resource).some((bbox) => boundsIntersect(bbox, viewport));
}

function resourceAppliesToLocation(resource) {
  const exact = resource.coverageKeys.map((key) => coverageStore.get(key)).filter(Boolean);
  if (exact.length) return exact.some((coverage) => coverageMatchesLocation(coverage));
  const fallback = resourceBounds(resource);
  if (locationSelection.mode === "point") return fallback.some((bbox) => pointInBounds(locationSelection.point, bbox));
  return fallback.some((bbox) => boundsIntersect(bbox, locationSelection.bbox));
}

function filteredResources() {
  const search = searchInput.value.trim().toLowerCase();
  const publishers = new Set(checkedValues("publisher"));
  const categories = new Set(checkedValues("category"));
  const viewport = currentViewportBounds();
  return resources.filter((resource) => {
    const searchText = [resource.name, resource.organization, resource.place, resource.summary, resource.coverageNote, resource.authorityRole, resource.sourceRegistry, ...resource.categories.map((item) => categoryLabels[item])].join(" ").toLowerCase();
    return publishers.has(resource.publisher)
      && resource.categories.some((category) => categories.has(category))
      && (!search || searchText.includes(search))
      && (locationSelection ? resourceAppliesToLocation(resource) : resourceAppliesToViewport(resource, viewport));
  });
}

function describeViewport() {
  if (locationSelection?.mode === "point") return `the confirmed map point in ${locationSelection.label}`;
  if (locationSelection) return `the approximate ${locationSelection.label} postal area`;
  if (!mapReady) return "the initial Cascadia view";
  const zoom = map.getZoom();
  if (zoom >= 9) return "this local map view";
  if (zoom >= 7) return "this county-scale map view";
  if (zoom >= 5.3) return "this state-scale map view";
  return "this regional map view";
}

function updateFilterSummaries() {
  const publisherCount = checkedValues("publisher").length;
  const categoryCount = checkedValues("category").length;
  const overlayCount = checkedValues("overlay").length;
  document.querySelector("[data-publisher-summary]").textContent = publisherCount === 5 ? "All" : `${publisherCount} selected`;
  document.querySelector("[data-category-summary]").textContent = categoryCount === 6 ? "All" : `${categoryCount} selected`;
  overlaySummary.textContent = overlayCount ? `${overlayCount} visible` : "None";
}

function visibleResourcesForGroup(groupName) {
  return visibleResources
    .filter((resource) => resource.group === groupName)
    .sort((a, b) => a.rolePriority - b.rolePriority || a.name.localeCompare(b.name));
}

function renderDirectory() {
  visibleResources = filteredResources();
  resultList.replaceChildren();

  groupOrder.forEach((groupName) => {
    const groupResources = visibleResourcesForGroup(groupName);
    if (!groupResources.length) return;
    const section = document.createElement("section");
    section.className = "result-group";
    const heading = document.createElement("h3");
    heading.textContent = groupName;
    section.append(heading);

    groupResources.forEach((resource) => {
      const item = document.createElement("article");
      item.className = "result-item";
      if (resource.id === selectedResourceId) item.dataset.selected = "true";

      const focus = document.createElement("button");
      focus.type = "button";
      focus.className = "result-focus";
      focus.dataset.resourceId = resource.id;
      focus.setAttribute("aria-label", `Show details for ${resource.name}`);
      focus.innerHTML = `
        <span class="result-swatch" style="--swatch:${publisherColors[resource.publisher]}" aria-hidden="true"></span>
        <span class="result-copy"><strong>${escapeHtml(resource.name)}</strong><span class="result-role">${escapeHtml(resource.authorityRole)}</span><small>${escapeHtml(resource.place)} · ${escapeHtml(resource.categories.map((category) => categoryLabels[category]).join(" · "))}</small></span>
        <span class="result-kind">${escapeHtml(publisherLabels[resource.publisher])}</span>`;
      focus.addEventListener("click", () => selectResource(resource.id));

      const link = document.createElement("a");
      link.className = "result-source-link";
      link.href = resource.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", `Open official resource for ${resource.name}`);
      link.textContent = "↗";
      item.append(focus, link);
      section.append(item);
    });
    resultList.append(section);
  });

  if (!visibleResources.length) {
    const empty = document.createElement("p");
    empty.className = "result-empty";
    empty.textContent = locationSelection
      ? "No listed resources match this location and filter combination. Try resetting the directory filters or clearing the postal lookup."
      : "No listed resources match this map view and filter combination. Try moving the map or resetting the directory filters.";
    resultList.append(empty);
  }

  const countText = `${visibleResources.length} ${visibleResources.length === 1 ? "resource" : "resources"}`;
  resultCount.textContent = countText;
  viewportCount.textContent = locationSelection ? `${countText} match this location` : `${countText} apply to this view`;
  resultsContext.textContent = locationSelection
    ? `Showing resources applicable to ${describeViewport()}. Postal geography locates the search; it does not define service authority.`
    : `Showing resources applicable to ${describeViewport()}. Optional outlines do not change this list.`;
  updateResourcePoints();
  if (locationSelection) renderPostalResult();
}

function renderViewDialog() {
  const viewRecords = document.querySelector("#view-records");
  viewRecords.replaceChildren();
  document.querySelector("#view-summary").textContent = `${visibleResources.length} ${visibleResources.length === 1 ? "resource" : "resources"} applicable to ${describeViewport()}. Directory last updated ${DIRECTORY_UPDATED_LABEL}. Grouped by authority level and sorted by role, then name.`;

  groupOrder.forEach((groupName) => {
    const groupResources = visibleResourcesForGroup(groupName);
    if (!groupResources.length) return;

    const section = document.createElement("section");
    section.className = "view-group";
    const heading = document.createElement("div");
    heading.className = "view-group-heading";
    const title = document.createElement("h3");
    title.textContent = groupName;
    const count = document.createElement("span");
    count.textContent = `${groupResources.length} ${groupResources.length === 1 ? "listing" : "listings"}`;
    heading.append(title, count);

    const list = document.createElement("div");
    list.className = "view-group-list";
    groupResources.forEach((resource) => {
      const article = document.createElement("article");
      article.className = "view-record";
      article.style.setProperty("--publisher-color", publisherColors[resource.publisher]);

      const recordHeading = document.createElement("div");
      recordHeading.className = "view-record-heading";
      const link = document.createElement("a");
      link.href = resource.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `${resource.name} ↗`;
      const publisher = document.createElement("span");
      publisher.textContent = publisherLabels[resource.publisher];
      recordHeading.append(link, publisher);

      const scope = document.createElement("p");
      scope.className = "view-record-scope";
      scope.textContent = `${resource.authorityRole} · ${resource.place}`;
      const summary = document.createElement("p");
      summary.className = "view-record-summary";
      summary.textContent = resource.summary;
      const coverage = document.createElement("p");
      coverage.className = "view-record-coverage";
      const coverageLabel = document.createElement("strong");
      coverageLabel.textContent = "Applies: ";
      coverage.append(coverageLabel, resource.coverageNote);

      const categories = document.createElement("div");
      categories.className = "view-record-categories";
      resource.categories.forEach((category) => {
        const tag = document.createElement("span");
        tag.textContent = categoryLabels[category];
        categories.append(tag);
      });
      article.append(recordHeading, scope, summary, coverage, categories);
      list.append(article);
    });

    section.append(heading, list);
    viewRecords.append(section);
  });

  if (!visibleResources.length) {
    const empty = document.createElement("p");
    empty.className = "view-empty";
    empty.textContent = "No resources match the current view and filters.";
    viewRecords.append(empty);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function formatDirectoryDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function renderDirectoryFreshness() {
  const time = document.querySelector("#directory-last-updated");
  if (!time) return;
  time.dateTime = DIRECTORY_UPDATED_ON;
  time.textContent = DIRECTORY_UPDATED_LABEL;
}

function sourceForResource(resource) {
  for (const key of resource.coverageKeys) {
    const coverage = coverageStore.get(key);
    if (coverage) return coverage;
  }
  return null;
}

function focusResourceCoverage(resource, coverage) {
  if (!mapReady || !coverage?.bbox) return;
  const maxZoom = coverage.family === "state" ? 4.25 : coverage.family === "city" ? 10 : coverage.family === "county" ? 7.25 : coverage.family.startsWith("forecast-") ? 5.75 : 8;
  map.fitBounds(
    [[coverage.bbox[0], coverage.bbox[1]], [coverage.bbox[2], coverage.bbox[3]]],
    { padding: { top: 92, right: 54, bottom: 54, left: 54 }, maxZoom, duration: 700 }
  );
}

function displayPointForResource(resource, coverage) {
  const exactCenter = centerOfBounds(coverage?.bbox);
  const provinceOffsets = {
    "fness-emergency-management": [-3, -0.5],
    "bc-emergency-alert": [-1.5, 1],
    "emergency-info-bc": [0, 1.4],
    "environment-canada-bc-alerts": [1.5, 1],
    "bc-wildfire-service": [3, -0.5]
  };
  const offset = resource.coverageKeys.length === 1 && resource.coverageKeys[0] === "province-bc"
    ? provinceOffsets[resource.id]
    : null;
  if (exactCenter && offset) return [exactCenter[0] + offset[0], exactCenter[1] + offset[1]];
  return exactCenter || resource.point || centerOfBounds(resource.fallbackBounds);
}

function closeServiceAreaDetails({ update = true } = {}) {
  if (!selectedServiceAreaKey && serviceAreaCard.hidden) return;
  selectedServiceAreaKey = null;
  serviceAreaCard.hidden = true;
  if (update) updateSelectedArea();
}

function selectServiceArea(feature) {
  const key = feature?.properties?.key;
  const coverage = coverageStore.get(key);
  if (!coverage || !["forecast-us", "forecast-ca"].includes(coverage.family)) return;
  closeResourceDetails({ rerender: false });
  selectedServiceAreaKey = key;
  const isCanadian = coverage.family === "forecast-ca";
  const identifier = isCanadian ? coverage.feature.properties.CLC : coverage.feature.properties.CWA || coverage.feature.properties.cwa;
  document.querySelector("#service-area-kicker").textContent = isCanadian ? "B.C. weather-service zone" : "U.S. weather-service area";
  document.querySelector("#service-area-title").textContent = coverage.label;
  document.querySelector("#service-area-summary").textContent = isCanadian
    ? "An ECCC public forecast zone used for most forecasts, warnings, watches, advisories, and special weather statements."
    : "A National Weather Service forecast-office area used to organize forecasts, warnings, and related weather services.";
  document.querySelector("#service-area-meta").innerHTML = `
    <dt>Boundary type</dt><dd>${escapeHtml(familyLabels[coverage.family])}</dd>
    <dt>Official source</dt><dd>${escapeHtml(coverage.sourceLabel)}</dd>
    ${identifier ? `<dt>Identifier</dt><dd>${escapeHtml(identifier)}</dd>` : ""}
    <dt>Alert status</dt><dd>No active alert is implied by this outline.</dd>`;
  document.querySelector("#service-area-source").href = coverage.sourceUrl;
  serviceAreaCard.hidden = false;
  updateSelectedArea();
}

function closeResourceDetails({ rerender = true } = {}) {
  if (!selectedResourceId && recordCard.hidden) return;
  selectedResourceId = null;
  recordCard.hidden = true;
  updateSelectedArea();
  if (rerender) renderDirectory();
}

function uniqueResourceFeatures(features) {
  const seen = new Set();
  return features.filter((feature) => {
    const id = feature.properties?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function spiderfyOffsets(count) {
  if (count <= 8) {
    const radius = Math.min(54, Math.max(36, 24 + count * 4));
    return Array.from({ length: count }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    });
  }

  let angle = 0;
  let legLength = 38;
  return Array.from({ length: count }, () => {
    angle += 27 / legLength;
    const offset = [Math.cos(angle) * legLength, Math.sin(angle) * legLength];
    legLength += (Math.PI * 2 * 5) / angle;
    return offset;
  });
}

function clearSpiderfy() {
  if (!mapReady) return;
  const legs = map.getSource("spider-legs");
  const points = map.getSource("spider-points");
  if (legs) legs.setData(EMPTY_COLLECTION);
  if (points) points.setData(EMPTY_COLLECTION);
  if (map.getLayer("resource-clusters")) map.setFilter("resource-clusters", ["has", "point_count"]);
  if (map.getLayer("resource-cluster-count")) map.setFilter("resource-cluster-count", ["has", "point_count"]);
  if (map.getLayer("resource-point")) map.setFilter("resource-point", ["!", ["has", "point_count"]]);
  spiderfyActive = false;
}

function spiderfyFeatures(features, centerCoordinates, { clusterId = null } = {}) {
  const uniqueFeatures = uniqueResourceFeatures(features);
  if (uniqueFeatures.length < 2) {
    const id = uniqueFeatures[0]?.properties?.id;
    if (id) selectResource(id);
    return;
  }

  const center = map.project(centerCoordinates);
  const offsets = spiderfyOffsets(uniqueFeatures.length);
  const spiderPoints = uniqueFeatures.map((feature, index) => {
    const coordinates = map.unproject([center.x + offsets[index][0], center.y + offsets[index][1]]).toArray();
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates },
      properties: { ...feature.properties }
    };
  });
  const spiderLegs = spiderPoints.map((feature) => ({
    type: "Feature",
    geometry: { type: "LineString", coordinates: [centerCoordinates, feature.geometry.coordinates] },
    properties: {}
  }));

  map.getSource("spider-legs").setData({ type: "FeatureCollection", features: spiderLegs });
  map.getSource("spider-points").setData({ type: "FeatureCollection", features: spiderPoints });

  if (clusterId !== null) {
    const clusterFilter = ["all", ["has", "point_count"], ["!=", ["get", "cluster_id"], Number(clusterId)]];
    map.setFilter("resource-clusters", clusterFilter);
    map.setFilter("resource-cluster-count", clusterFilter);
  } else {
    const ids = uniqueFeatures.map((feature) => feature.properties.id);
    map.setFilter("resource-point", [
      "all",
      ["!", ["has", "point_count"]],
      ["!", ["in", ["get", "id"], ["literal", ids]]]
    ]);
  }
  spiderfyActive = true;
}

function selectResource(id) {
  const resource = resources.find((item) => item.id === id);
  if (!resource) return;
  closeServiceAreaDetails({ update: false });
  selectedResourceId = id;
  document.querySelector("#card-kicker").textContent = `${publisherLabels[resource.publisher]} · ${resource.place}`;
  document.querySelector("#card-title").textContent = resource.name;
  document.querySelector("#card-summary").textContent = resource.summary;
  const exactCoverage = sourceForResource(resource);
  const geometryDescription = exactCoverage
    ? `${familyLabels[exactCoverage.family]} · ${exactCoverage.sourceLabel}`
    : "No verified perimeter shown";
  const meta = document.querySelector("#card-meta");
  meta.innerHTML = `
    <dt>Publisher</dt><dd>${escapeHtml(resource.organization)}</dd>
    <dt>Authority role</dt><dd>${escapeHtml(resource.authorityRole)}</dd>
    <dt>Directory scope</dt><dd>${escapeHtml(resource.place)}</dd>
    <dt>Applicability</dt><dd>${escapeHtml(resource.coverageNote)}</dd>
    <dt>Map geometry</dt><dd>${escapeHtml(geometryDescription)}</dd>
    <dt>Source review</dt><dd>${escapeHtml(resource.sourceRegistry || "Direct official source")} · ${escapeHtml(resource.verifiedOn)}</dd>`;
  const sourceLink = document.querySelector("#card-link");
  sourceLink.href = resource.url;
  const registryLink = document.querySelector("#card-registry-link");
  if (resource.registryUrl && resource.registryUrl !== resource.url) {
    registryLink.href = resource.registryUrl;
    registryLink.hidden = false;
  } else {
    registryLink.hidden = true;
  }
  const geometryLink = document.querySelector("#card-geometry-link");
  if (exactCoverage) {
    geometryLink.href = exactCoverage.sourceUrl;
    geometryLink.hidden = false;
  } else {
    geometryLink.hidden = true;
  }
  recordCard.hidden = false;
  updateSelectedArea();
  focusResourceCoverage(resource, exactCoverage);
  renderDirectory();
}

function updateScaleLabel() {
  if (!mapReady) return;
  const zoom = map.getZoom();
  scaleLabel.textContent = zoom >= 9 ? "Neighborhood context" : zoom >= 7 ? "County and city services" : zoom >= 5.3 ? "State and multi-county services" : "Regional resources";
}

function updateResourcePoints() {
  if (!mapReady || !map.getSource("resource-points")) return;
  clearSpiderfy();
  map.getSource("resource-points").setData({
    type: "FeatureCollection",
    features: visibleResources.map((resource) => {
      const exactCoverage = sourceForResource(resource);
      const expectsJurisdictionGeometry = resource.coverageKeys.some((key) => /^(province-bc|regional-bc-|county-|city-)/.test(key));
      if (expectsJurisdictionGeometry && !exactCoverage && resource.fallbackGeometry !== "official-bbox") return null;
      const coordinates = displayPointForResource(resource, exactCoverage);
      if (!coordinates) return null;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates },
        properties: {
          id: resource.id,
          name: resource.name,
          publisher: resource.publisher,
          color: publisherColors[resource.publisher]
        }
      };
    }).filter(Boolean)
  });
}

function updateOverlayAreas() {
  updateFilterSummaries();
  if (!mapReady || !map.getSource("overlay-areas")) return;
  const enabled = new Set(checkedValues("overlay"));
  const selectedCoverage = selectedServiceAreaKey ? coverageStore.get(selectedServiceAreaKey) : null;
  if (selectedCoverage && !enabled.has(selectedCoverage.family)) closeServiceAreaDetails();
  const features = [...coverageStore.values()]
    .filter((coverage) => enabled.has(coverage.family))
    .map((coverage) => coverage.feature);
  map.getSource("overlay-areas").setData({ type: "FeatureCollection", features });
}

function updateSelectedArea() {
  if (!mapReady || !map.getSource("selected-area")) return;
  const resource = resources.find((item) => item.id === selectedResourceId);
  const selectedServiceArea = selectedServiceAreaKey ? coverageStore.get(selectedServiceAreaKey)?.feature : null;
  const features = selectedServiceArea
    ? [selectedServiceArea]
    : resource
      ? resource.coverageKeys.map((key) => coverageStore.get(key)?.feature).filter(Boolean)
      : [];
  map.getSource("selected-area").setData({ type: "FeatureCollection", features });
}

function addMapDataLayers() {
  map.addSource("overlay-areas", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "overlay-fill",
    type: "fill",
    source: "overlay-areas",
    paint: {
      "fill-color": ["match", ["get", "family"], "state", "#61725b", "county", "#c9903e", "city", "#b85635", "forecast-us", "#255f6a", "forecast-ca", "#65529a", "tribal-reference", "#8a6542", "#61725b"],
      "fill-opacity": ["match", ["get", "family"], "state", 0.085, "forecast-ca", 0.045, "tribal-reference", 0.08, 0.055]
    }
  });
  map.addLayer({
    id: "overlay-state-halo",
    type: "line",
    source: "overlay-areas",
    filter: ["==", ["get", "family"], "state"],
    paint: {
      "line-color": "#fffdf8",
      "line-width": 5,
      "line-opacity": 0.78
    }
  });
  map.addLayer({
    id: "overlay-line",
    type: "line",
    source: "overlay-areas",
    paint: {
      "line-color": ["match", ["get", "family"], "state", "#4e624b", "county", "#b77a27", "city", "#a7452b", "forecast-us", "#1f5968", "forecast-ca", "#65529a", "tribal-reference", "#7a5637", "#4e624b"],
      "line-width": ["match", ["get", "family"], "state", 2.5, "city", 1.8, "forecast-us", 1.6, "forecast-ca", 1.3, 1.2],
      "line-opacity": ["match", ["get", "family"], "state", 0.98, 0.9],
      "line-dasharray": [2, 1.5]
    }
  });
  map.addLayer({
    id: "weather-service-area-hit",
    type: "fill",
    source: "overlay-areas",
    filter: ["in", ["get", "family"], ["literal", ["forecast-us", "forecast-ca"]]],
    paint: { "fill-color": "#ffffff", "fill-opacity": 0.01 }
  });

  map.addSource("postal-area", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "postal-area-fill",
    type: "fill",
    source: "postal-area",
    paint: { "fill-color": "#c9903e", "fill-opacity": 0.16 }
  });
  map.addLayer({
    id: "postal-area-line",
    type: "line",
    source: "postal-area",
    paint: { "line-color": "#9a6224", "line-width": 2.5 }
  });

  map.addSource("postal-point", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "postal-point",
    type: "circle",
    source: "postal-point",
    paint: {
      "circle-color": "#b85635",
      "circle-radius": 7,
      "circle-stroke-color": "#fffdf8",
      "circle-stroke-width": 3
    }
  });

  map.addSource("selected-area", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "selected-fill",
    type: "fill",
    source: "selected-area",
    paint: { "fill-color": "#c9903e", "fill-opacity": 0.14 }
  });
  map.addLayer({
    id: "selected-line",
    type: "line",
    source: "selected-area",
    paint: { "line-color": "#a64e2f", "line-width": 3 }
  });

  map.addSource("resource-points", {
    type: "geojson",
    data: EMPTY_COLLECTION,
    cluster: true,
    clusterRadius: 42,
    clusterMaxZoom: RESOURCE_CLUSTER_MAX_ZOOM
  });
  map.addLayer({
    id: "resource-clusters",
    type: "circle",
    source: "resource-points",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#153f47",
      "circle-radius": ["step", ["get", "point_count"], 17, 6, 20, 12, 24],
      "circle-stroke-color": "#fffdf8",
      "circle-stroke-width": 2
    }
  });
  map.addLayer({
    id: "resource-cluster-count",
    type: "symbol",
    source: "resource-points",
    filter: ["has", "point_count"],
    layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11 },
    paint: { "text-color": "#fffdf8" }
  });
  map.addLayer({
    id: "resource-point",
    type: "circle",
    source: "resource-points",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": 7,
      "circle-stroke-color": "#fffdf8",
      "circle-stroke-width": 2
    }
  });

  map.addSource("spider-legs", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "spider-legs",
    type: "line",
    source: "spider-legs",
    paint: {
      "line-color": "#9a6224",
      "line-width": 1.5,
      "line-opacity": 0.82
    }
  });
  map.addSource("spider-points", { type: "geojson", data: EMPTY_COLLECTION });
  map.addLayer({
    id: "spider-point",
    type: "circle",
    source: "spider-points",
    paint: {
      "circle-color": ["get", "color"],
      "circle-radius": 9,
      "circle-stroke-color": "#fffdf8",
      "circle-stroke-width": 3
    }
  });

  map.on("click", "weather-service-area-hit", (event) => {
    if (awaitingMapConfirmation) return;
    const feature = event.features?.[0];
    if (!feature) return;
    mapFeatureClickHandled = true;
    clearSpiderfy();
    selectServiceArea(feature);
  });
  map.on("mouseenter", "weather-service-area-hit", () => { map.getCanvas().style.cursor = awaitingMapConfirmation ? "crosshair" : "pointer"; });
  map.on("mouseleave", "weather-service-area-hit", () => { map.getCanvas().style.cursor = awaitingMapConfirmation ? "crosshair" : ""; });

  map.on("click", "resource-clusters", async (event) => {
    if (awaitingMapConfirmation) return;
    mapFeatureClickHandled = true;
    const feature = map.queryRenderedFeatures(event.point, { layers: ["resource-clusters"] })[0];
    if (!feature) return;
    closeServiceAreaDetails();
    closeResourceDetails({ rerender: false });
    clearSpiderfy();
    const source = map.getSource("resource-points");
    const clusterId = Number(feature.properties.cluster_id);
    try {
      const zoom = await source.getClusterExpansionZoom(clusterId);
      if (zoom > RESOURCE_CLUSTER_MAX_ZOOM) {
        const pointCount = Number(feature.properties.point_count);
        const leaves = await source.getClusterLeaves(clusterId, pointCount, 0);
        spiderfyFeatures(leaves, feature.geometry.coordinates, { clusterId });
        return;
      }
      const drillZoom = Math.min(map.getMaxZoom(), Math.max(zoom, map.getZoom() + 2));
      map.easeTo({ center: feature.geometry.coordinates, zoom: drillZoom, duration: 650 });
    } catch (error) {
      console.warn("Signals cluster expansion:", error);
      map.easeTo({ center: feature.geometry.coordinates, zoom: Math.min(map.getMaxZoom(), map.getZoom() + 2), duration: 650 });
    }
  });
  map.on("click", "resource-point", (event) => {
    if (awaitingMapConfirmation) return;
    mapFeatureClickHandled = true;
    const features = uniqueResourceFeatures(map.queryRenderedFeatures(event.point, { layers: ["resource-point"] }));
    if (features.length > 1) {
      closeResourceDetails({ rerender: false });
      clearSpiderfy();
      spiderfyFeatures(features, features[0].geometry.coordinates);
      return;
    }
    const id = features[0]?.properties?.id || event.features?.[0]?.properties?.id;
    if (id) selectResource(id);
  });
  map.on("click", "spider-point", (event) => {
    if (awaitingMapConfirmation) return;
    mapFeatureClickHandled = true;
    const id = event.features?.[0]?.properties?.id;
    if (id) selectResource(id);
  });
  ["resource-point", "resource-clusters", "spider-point"].forEach((layer) => {
    map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = awaitingMapConfirmation ? "crosshair" : "pointer"; });
    map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = awaitingMapConfirmation ? "crosshair" : ""; });
  });
  map.on("click", (event) => {
    if (mapFeatureClickHandled) {
      mapFeatureClickHandled = false;
      return;
    }
    if (awaitingMapConfirmation) {
      confirmPostalPoint([event.lngLat.lng, event.lngLat.lat]);
      return;
    }
    if (spiderfyActive) clearSpiderfy();
    closeServiceAreaDetails();
    closeResourceDetails();
  });
  map.on("movestart", clearSpiderfy);
}

function mapInitialView() {
  const params = new URLSearchParams(location.search);
  if (!["lng", "lat", "z"].every((key) => params.has(key))) return null;
  const lng = Number(params.get("lng"));
  const lat = Number(params.get("lat"));
  const zoom = Number(params.get("z"));
  if ([lng, lat, zoom].every(Number.isFinite)) return { center: [lng, lat], zoom };
  return null;
}

function initMap() {
  if (!window.maplibregl) {
    mapLoading.dataset.error = "true";
    mapLoading.innerHTML = "<p>The map library could not load. The directory remains available.</p>";
    renderDirectory();
    restorePostalSelectionFromUrl();
    return;
  }
  const restored = mapInitialView();
  map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors"
        }
      },
      layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.58, "raster-opacity": 0.82 } }]
    },
    center: restored?.center || [-123.4, 49.35],
    zoom: restored?.zoom || 3.65,
    minZoom: 2.8,
    maxZoom: 15,
    cooperativeGestures: true
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", () => {
    mapReady = true;
    addMapDataLayers();
    mapLoading.remove();
    updateScaleLabel();
    renderDirectory();
    updateOverlayAreas();
    updateSelectedArea();
    updatePostalMap();
    restorePostalSelectionFromUrl();
  });
  map.on("moveend", () => {
    updateScaleLabel();
    renderDirectory();
  });
  map.on("error", (event) => console.warn("Signals map:", event.error));
}

function restoreFiltersFromUrl() {
  const params = new URLSearchParams(location.search);
  const search = params.get("q");
  if (search) searchInput.value = search;
  ["publisher", "category", "overlay"].forEach((name) => {
    const key = name === "publisher" ? "p" : name === "category" ? "c" : "o";
    if (!params.has(key)) return;
    const selected = new Set(params.get(key).split(",").filter(Boolean));
    if (name === "overlay" && selected.has("forecast")) {
      selected.add("forecast-us");
      selected.add("forecast-ca");
    }
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = selected.has(input.value);
    });
  });
}

function shareableUrl() {
  const url = new URL(location.href);
  url.search = "";
  const search = searchInput.value.trim();
  if (search) url.searchParams.set("q", search);
  url.searchParams.set("p", checkedValues("publisher").join(","));
  url.searchParams.set("c", checkedValues("category").join(","));
  const overlays = checkedValues("overlay");
  if (overlays.length) url.searchParams.set("o", overlays.join(","));
  if (locationSelection) {
    url.searchParams.set("pc", locationSelection.code);
    if (locationSelection.mode === "point" && locationSelection.point) {
      url.searchParams.set("pin", locationSelection.point.map((coordinate) => coordinate.toFixed(5)).join(","));
    }
  }
  if (mapReady) {
    const center = map.getCenter();
    url.searchParams.set("lng", center.lng.toFixed(4));
    url.searchParams.set("lat", center.lat.toFixed(4));
    url.searchParams.set("z", map.getZoom().toFixed(2));
  }
  return url.toString();
}

function buildLinkedList() {
  const title = `Cascadia Signals — ${visibleResources.length} resources for ${describeViewport()}`;
  const freshness = `Directory last updated ${DIRECTORY_UPDATED_LABEL}.`;
  const htmlItems = visibleResources.map((resource) => `<li><a href="${escapeHtml(resource.url)}"><strong>${escapeHtml(resource.name)}</strong></a> — ${escapeHtml(resource.place)}<br><em>${escapeHtml(resource.authorityRole)}</em><br>${escapeHtml(resource.summary)}</li>`).join("");
  const plainItems = visibleResources.map((resource, index) => `${index + 1}. ${resource.name} — ${resource.place}\nRole: ${resource.authorityRole}\n${resource.summary}\n${resource.url}`).join("\n\n");
  return {
    html: `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(freshness)}</p><ol>${htmlItems}</ol><p>Shared from <a href="${escapeHtml(shareableUrl())}">${escapeHtml(shareableUrl())}</a></p>`,
    text: `${title}\n${freshness}\n\n${plainItems}\n\nFiltered map view: ${shareableUrl()}`
  };
}

async function copyLinkedList() {
  const list = buildLinkedList();
  const status = document.querySelector("#share-status");
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      const item = new ClipboardItem({
        "text/html": new Blob([list.html], { type: "text/html" }),
        "text/plain": new Blob([list.text], { type: "text/plain" })
      });
      await navigator.clipboard.write([item]);
      status.textContent = "Linked list copied. Paste it into email or a document to keep clickable URLs.";
      return;
    }
    await navigator.clipboard.writeText(list.text);
    status.textContent = "List copied with full resource URLs.";
  } catch (error) {
    console.warn("Signals copy:", error);
    status.textContent = "Copy was blocked by the browser. Try sharing the map view instead.";
  }
}

async function shareFilteredView() {
  const url = shareableUrl();
  const status = document.querySelector("#share-status");
  try {
    if (navigator.share) {
      await navigator.share({ title: "Cascadia Signals", text: `${visibleResources.length} emergency resources for this map view. Directory last updated ${DIRECTORY_UPDATED_LABEL}.`, url });
      status.textContent = "Map view shared.";
    } else {
      await navigator.clipboard.writeText(url);
      status.textContent = "Map-view link copied.";
    }
  } catch (error) {
    if (error.name !== "AbortError") status.textContent = "Sharing was unavailable in this browser.";
  }
}

function preparePrint() {
  const printRecords = document.querySelector("#print-records");
  printRecords.replaceChildren();
  visibleResources.forEach((resource) => {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    name.textContent = resource.name;
    const detail = document.createElement("span");
    detail.textContent = `${publisherLabels[resource.publisher]} · ${resource.authorityRole} · ${resource.place} — ${resource.summary}`;
    const link = document.createElement("a");
    link.href = resource.url;
    link.textContent = resource.url;
    item.append(name, detail, link);
    printRecords.append(item);
  });
  document.querySelector("#print-summary").textContent = `${visibleResources.length} resources applicable to ${describeViewport()}. Directory last updated ${DIRECTORY_UPDATED_LABEL}; printed ${new Date().toLocaleDateString()}.`;
  window.print();
}

function resetDirectoryFilters() {
  searchInput.value = "";
  document.querySelectorAll('input[name="publisher"], input[name="category"]').forEach((input) => { input.checked = true; });
  updateFilterSummaries();
  renderDirectory();
}

function clearOverlays() {
  document.querySelectorAll('input[name="overlay"]').forEach((input) => { input.checked = false; });
  updateOverlayAreas();
}

function initBetaGate() {
  const acknowledgment = document.querySelector("#beta-ack");
  const okay = document.querySelector("#beta-okay");
  acknowledgment.checked = false;
  okay.disabled = true;
  acknowledgment.addEventListener("change", () => { okay.disabled = !acknowledgment.checked; });
  betaDialog.addEventListener("cancel", (event) => event.preventDefault());
  document.querySelector("#beta-form").addEventListener("submit", (event) => {
    if (!acknowledgment.checked) event.preventDefault();
  });
  betaDialog.showModal();
}

filtersForm.addEventListener("input", (event) => {
  if (event.target.name === "overlay") {
    updateOverlayAreas();
    return;
  }
  updateFilterSummaries();
  renderDirectory();
});
postalLookupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runPostalLookup();
});
confirmPostalPointButton.addEventListener("click", beginPostalPointConfirmation);
document.querySelector("#clear-postal").addEventListener("click", clearLocationSelection);
document.querySelector("#reset-filters").addEventListener("click", resetDirectoryFilters);
document.querySelector("#clear-overlays").addEventListener("click", clearOverlays);
document.querySelector("#fit-region").addEventListener("click", () => map?.fitBounds([[REGION_BOUNDS[0], REGION_BOUNDS[1]], [REGION_BOUNDS[2], REGION_BOUNDS[3]]], { padding: 45 }));
document.querySelector("#view-list").addEventListener("click", () => {
  renderViewDialog();
  viewDialog.showModal();
});
document.querySelector("#print-list").addEventListener("click", preparePrint);
document.querySelector("#share-list").addEventListener("click", () => {
  document.querySelector("#share-summary").textContent = `${visibleResources.length} resources apply to ${describeViewport()}. Share the linked list or restore this exact map view.`;
  document.querySelector("#share-status").textContent = "";
  shareDialog.showModal();
});
document.querySelector("#copy-linked-list").addEventListener("click", copyLinkedList);
document.querySelector("#share-filtered-view").addEventListener("click", shareFilteredView);
document.querySelector("#show-perimeter-sources").addEventListener("click", () => perimeterDialog.showModal());
document.querySelector("#toggle-legend").addEventListener("click", () => {
  const legend = document.querySelector("#map-legend");
  legend.hidden = !legend.hidden;
  document.querySelector("#toggle-legend").setAttribute("aria-expanded", String(!legend.hidden));
});
document.querySelector("#close-legend").addEventListener("click", () => {
  document.querySelector("#map-legend").hidden = true;
  document.querySelector("#toggle-legend").setAttribute("aria-expanded", "false");
});
document.querySelector("#close-card").addEventListener("click", () => {
  closeResourceDetails();
});
document.querySelector("#close-service-area").addEventListener("click", () => {
  closeServiceAreaDetails();
});

restoreFiltersFromUrl();
renderDirectoryFreshness();
validateAuthorityRegistry();
registerCachedBcProvinceCoverage();
registerCachedEcccForecastCoverage();
updateFilterSummaries();
renderDirectory();
initMap();
initBetaGate();

Promise.allSettled([loadJurisdictionGeometry(), loadBcJurisdictionGeometry(), loadNoaaGeometry(), loadEcccForecastGeometry(), loadTribalReferenceGeometry()]).then(() => {
  updateOverlayAreas();
  updateSelectedArea();
  renderDirectory();
  if (locationSelection) renderPostalResult();
});
