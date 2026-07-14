/*
 * Cascadia Signals alert-authority registry.
 *
 * Grain: one record per official enrollment/information source and jurisdiction.
 * Vendors such as Everbridge, Alertable, Voyent Alert!, CodeRED, and Genasys are
 * delivery channels; the named public agency remains the authority/publisher.
 * Verified against the official registries and agency pages on 2026-07-14.
 */
(function buildSignalsAuthorityRegistry() {
  const VERIFIED_ON = "2026-07-14";
  const WA_REGISTRY = "https://mil.wa.gov/alerts";
  const OR_REGISTRY = "https://oralert.gov/";
  const BC_GUIDELINES = "https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/emergency-preparedness-response-recovery/local-government/bc_emergency_alert_guidelines_for_fn-lgs.pdf";

  const slugify = (value) => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const waCounties = [
    ["Adams", "https://www.co.adams.wa.us/AlertCenter.aspx"],
    ["Asotin", "https://co.asotin.wa.us/List.aspx"],
    ["Benton", "https://www.benton2.org/codered-emergency-alerts"],
    ["Chelan", "https://member.everbridge.net/406411280384261/login"],
    ["Clallam", "https://www.clallamcountywa.gov/1336/Alerts-and-Incidents"],
    ["Clark", "https://member.everbridge.net/453003085616336/login"],
    ["Columbia", "https://www.columbiaco.com/478/CodeRED-Notification-System"],
    ["Cowlitz", "https://www.co.cowlitz.wa.us/702/Public-Alerts"],
    ["Douglas", "https://member.everbridge.net/307455233884601/login"],
    ["Ferry", "https://member.everbridge.net/index/453003085618872#/signup"],
    ["Franklin", "https://franklinem.org/codered/"],
    ["Garfield", "https://www.garfieldcountywa.gov/em", "https://garfieldcounty-wa.myfreealerts.com"],
    ["Grant", "https://local.nixle.com/grant-county-sheriffs-office/"],
    ["Grays Harbor", "https://www.smart911.com/smart911/ref/reg.action?pa=graysharbor"],
    ["Island", "https://www.islandcountywa.gov/464/Alerts-Warnings"],
    ["Jefferson", "https://www.co.jefferson.wa.us/1066/Alerts-Warnings"],
    ["King", "https://www.kingcounty.gov/depts/emergency-management/alert-king-county.aspx"],
    ["Kitsap", "https://kcowa.us/alert"],
    ["Kittitas", "https://member.everbridge.net/337829242601599/login"],
    ["Klickitat", "https://www.smart911.com/smart911/ref/login.action?pa=klickitatco"],
    ["Lewis", "https://lewiscountywa.gov/departments/emergency-management/lewis-county-alert/"],
    ["Lincoln", "https://www.co.lincoln.wa.us/list.aspx"],
    ["Mason", "https://member.everbridge.net/77860777754837/login"],
    ["Okanogan", "https://www.okanogancounty.gov/408/What-is-Okanogan-County-Alerts"],
    ["Pacific", "https://pacificcountyemalerts.genasys.com/portal/en"],
    ["Pend Oreille", "https://www.pendoreilleco.org/emergency-management"],
    ["Pierce", "https://www.piercecountywa.gov/ALERT", "https://member.everbridge.net/index/453003085611267"],
    ["San Juan", "https://public.alertsense.com/SignUp/?regionid=1213"],
    ["Skagit", "https://www.skagitcounty.net/Departments/EmergencyManagement/skagitready.htm"],
    ["Skamania", "https://signup.hyper-reach.com/hyper_reach/sign_up_page_2/?id=45528"],
    ["Snohomish", "https://snohomishcountywa.gov/620/Public-Alert-Resources"],
    ["Spokane", "https://www.spokanecounty.org/3007/Alert-Spokane"],
    ["Stevens", "https://secure.hyper-reach.com/comsignupw.jsp?id=41001"],
    ["Thurston", "https://www.thurstoncountywa.gov/departments/emergency-management/emergency-information/alert-and-notification"],
    ["Wahkiakum", "https://www.co.wahkiakum.wa.us/198/Emergency-Management"],
    ["Walla Walla", "https://member.everbridge.net/index/892807736724315#/signup"],
    ["Whatcom", "https://public.alertsense.com/SignUp/?regionid=1189"],
    ["Whitman", "https://member.everbridge.net/index/3531635643383919#/signup"],
    ["Yakima", "https://www.yakimacounty.us/2222/Alert-Yakima"]
  ];

  const orCounties = [
    ["Baker", "https://member.everbridge.net/index/747122446041093"],
    ["Benton", "https://member.everbridge.net/index/453003085613276"],
    ["Clackamas", "https://member.everbridge.net/index/892807736729067#/signup"],
    ["Clatsop", "https://member.everbridge.net/1772417038942600/login"],
    ["Columbia", "https://member.everbridge.net/453003085613334/login"],
    ["Coos", "https://member.everbridge.net/index/892807736724057"],
    ["Crook", "https://member.everbridge.net/index/892807736723739#/signup"],
    ["Curry", "https://member.everbridge.net/892807736723773/login"],
    ["Deschutes", "https://member.everbridge.net/892807736723736/login"],
    ["Douglas", "https://member.everbridge.net/index/802098027429896"],
    ["Gilliam", "https://member.everbridge.net/892807736724035/login"],
    ["Grant", "https://member.everbridge.net/825462649520134/login"],
    ["Harney", "https://member.everbridge.net/index/819965091381301"],
    ["Hood River", "https://member.everbridge.net/892807736721762/login"],
    ["Jackson", "https://member.everbridge.net/76864345342052/login"],
    ["Jefferson", "https://member.everbridge.net/index/892807736724035"],
    ["Josephine", "https://member.everbridge.net/1332612387832182/home"],
    ["Klamath", "https://member.everbridge.net/index/730354893717522"],
    ["Lake", "https://member.everbridge.net/996436707639298/login"],
    ["Lane", "https://member.everbridge.net/337829242601799/login"],
    ["Lincoln", "https://member.everbridge.net/892807736721689/login"],
    ["Linn", "https://oralert.gov/linn-county/index.html"],
    ["Malheur", "https://public.alertsense.com/SignUp/?regionid=1021"],
    ["Marion", "https://member.everbridge.net/892807736721950/login"],
    ["Morrow", "https://member.everbridge.net/index/835495693123586"],
    ["Multnomah", "https://member.everbridge.net/453003085612905/login"],
    ["Polk", "https://member.everbridge.net/892807736721950/login"],
    ["Sherman", "https://member.everbridge.net/index/892807736724035"],
    ["Tillamook", "https://member.everbridge.net/453003085611895/login"],
    ["Umatilla", "https://member.everbridge.net/index/2590041373147145"],
    ["Union", "https://member.everbridge.net/index/964001114619905"],
    ["Wallowa", "https://member.everbridge.net/index/964001114619923"],
    ["Wasco", "https://member.everbridge.net/453003085612392/login"],
    ["Washington", "https://member.everbridge.net/index/910125044858893"],
    ["Wheeler", "https://member.everbridge.net/index/892807736724035"],
    ["Yamhill", "https://member.everbridge.net/index/892807736727638"]
  ];

  const waCities = [
    ["Aberdeen", "https://www.aberdeenwa.gov/notifyme"],
    ["Bainbridge Island", "https://www.bainbridgewa.gov/1322/Emergency-alerts-and-notification", { deliveryChannels: ["app", "email", "text", "phone"], cost: "Free" }],
    ["Marysville", "https://www.marysvillewa.gov/1218/Marysville-Alerts", { deliveryChannels: ["email", "text", "phone"], cost: "Free", languages: ["English", "Spanish"] }],
    ["Puyallup", "https://alertspuyallup.org/", { deliveryChannels: ["email", "text", "phone"] }],
    ["Redmond", "https://www.redmond.gov/506/Emergency-Alerts", { deliveryChannels: ["app", "email", "text", "phone"] }],
    ["Seattle", "https://alert.seattle.gov/", { deliveryChannels: ["email", "text", "phone"], cost: "Free", primaryAction: { type: "enroll", label: "Sign up for Seattle emergency alerts", url: "https://alert.seattle.gov/signin/", priority: 5 } }],
    ["Snoqualmie", "https://www.snoqualmiewa.gov/551/Alerts"],
    ["Sumner", "https://sumnerwa.gov/sumner-alert/"],
    ["Tacoma", "https://tacoma.gov/government/departments/fire/tacomas-emergency-notification-system/", { deliveryChannels: ["email", "text", "phone"], phone: "253-404-3736", offlineFallback: "Call 911 for an immediate threat to life or safety." }]
  ];

  const bcRegionalDistricts = [
    ["Alberni-Clayoquot", "https://www.acrd.bc.ca/emergency_alerts", "Regional system includes Port Alberni and participating First Nations; local programs may also publish instructions.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["Bulkley-Nechako", "https://www.rdbn.bc.ca/departments/protective-services/Public-Alerting-System", "Regional alert source; verify the location selected in Voyent Alert! and follow municipal or First Nation instructions where applicable.", undefined, { deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true }],
    ["Capital", "https://www.crd.ca/programs-services/fire-emergency", "Regional coordination and electoral-area programs; municipalities in the capital region maintain their own emergency programs.", undefined, { primaryAction: { type: "prepare", label: "Find your Capital Region emergency program", url: "https://www.crd.ca/programs-services/fire-emergency", priority: 30 }, deliveryChannels: ["web"], optInRequired: false }],
    ["Cariboo", "https://www.cariboord.ca/emergency-protective-services/emergency-preparedness/emergency-notification-system/", "Regional emergency notification system for participating communities; location-specific instructions remain authoritative.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["Central Coast", "https://www.ccrd.ca/services/emergency-management/", "Regional emergency information for CCRD services and communities; First Nations remain distinct governments and alert authorities.", "https://www.ccrd.ca/services/emergency-management/public-alerting-and-notification/", { deliveryChannels: ["email"], optInRequired: true, offlineFallback: "CCRD may also use telephone, VHF or local radio, local television, social media, or door-to-door notification when needed." }],
    ["Central Kootenay", "https://www.rdck.ca/development-community-sustainability-services/emergency/emergencynotification/", "Regional mass notification and official evacuation information; some municipalities may also publish local instructions.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free", phone: "250-352-7701" }],
    ["Central Okanagan", "https://www.coemergency.ca/subscribe", "Regional emergency program for Kelowna, West Kelowna, Lake Country, Peachland, Westbank First Nation, and the Central Okanagan electoral areas.", undefined, { deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true }],
    ["Columbia-Shuswap", "https://www.csrd.bc.ca/alertable", "Alertable spans the CSRD emergency programs; Golden and Revelstoke administer their area programs under regional agreements.", undefined, { deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true }],
    ["Comox Valley", "https://www.comoxvalleyrd.ca/services/emergency-management/emergency-notification-system", "Joint notification lists for electoral areas, Courtenay, Comox, Cumberland, and K’ómoks First Nation; subscribe to each relevant community.", "https://cvrd.connectrocket.com/", { deliveryChannels: ["text", "phone"], optInRequired: true }],
    ["Cowichan Valley", "https://emcowichan.ca/", "Cowichan Alert serves the nine electoral areas and four municipalities in the regional emergency program; participating First Nations remain distinct authorities."],
    ["East Kootenay", "https://www.rdek.bc.ca/departments/protectiveservices/emergencyinfo/evacuation_notification_system/", "The regional evacuation notification system covers municipalities, rural areas, and participating First Nations across the East Kootenay.", undefined, { deliveryChannels: ["app", "text", "phone"], optInRequired: true }],
    ["Fraser Valley", "https://www.fvrd.ca/EN/main/services/emergency-management/emergency-notifications.html", "FVRD emergency notifications cover its eight electoral areas; member municipalities maintain local emergency programs.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone", "smart speaker"], optInRequired: true, cost: "Free", linkCheckManualReviewUrls: ["https://www.fvrd.ca/EN/main/services/emergency-management/emergency-notifications.html"] }],
    ["Fraser-Fort George", "https://www.rdffg.ca/PAS", "Public Alerting System covers RD electoral areas, Prince George, and Mackenzie; McBride and Valemount use separate local sources.", "https://rdffg.connectrocket.com/", { startHereEligible: false, deliveryChannels: ["email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["Kitimat-Stikine", "https://www.rdks.bc.ca/emergency_services", "RDKS issues instructions for its rural electoral areas; Terrace, Kitimat, and other municipalities are primarily responsible inside city boundaries.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free", phone: "250-615-6100" }],
    ["Kootenay Boundary", "https://emergency.rdkb.com/", "Regional emergency portal and evacuation-notification signup; follow any municipal or First Nation instructions that apply to your location."],
    ["Metro Vancouver", "https://metrovancouver.org/services/emergency-management", "Regional coordination source. Metro Vancouver member municipalities are the primary local alert authorities inside city boundaries.", "https://metrovancouver.org/services/emergency-management", { primaryAction: { type: "prepare", label: "Review Metro Vancouver emergency coordination", url: "https://metrovancouver.org/services/emergency-management", priority: 30 }, deliveryChannels: ["web"], optInRequired: false }],
    ["Mount Waddington", "https://www.rdmw.bc.ca/services/emergency-management/", "Regional emergency-management source for North Island communities; municipal and First Nation programs may also apply.", undefined, { primaryAction: { type: "prepare", label: "Review Mount Waddington emergency guidance", url: "https://www.rdmw.bc.ca/services/emergency-management/", priority: 30 }, deliveryChannels: ["web"], optInRequired: false }],
    ["Nanaimo", "https://rdn.bc.ca/emergency-communications", "RDN Voyent Alert! covers the RDN electoral areas and District of Lantzville; other municipalities maintain separate local sources.", "https://rdn.bc.ca/rdn-alerts", { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["North Coast", "https://www.ncrdbc.com/services/public-safety/emergency-alerts", "North Coast Regional District alert source; municipalities and First Nations may maintain separate local channels.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["North Okanagan", "https://www.rdno.ca/alertable", "RDNO Alertable instructions are for Electoral Areas B–F; neighbouring municipalities maintain their own emergency programs or Alertable locations.", undefined, { startHereEligible: false, deliveryChannels: ["app"], optInRequired: true, cost: "Free" }],
    ["Okanagan-Similkameen", "https://www.rdos.bc.ca/newsandevents/notifications/", "RDOS routine and emergency notifications; member municipalities and syilx communities may issue separate local instructions.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true }],
    ["Peace River", "https://www.prrd.bc.ca/emergency-services/emergency-alerts-and-evacuations/", "NEBC Alerts is used by the PRRD and municipal partners; register addresses and follow the named issuing authority on each notice.", undefined, { deliveryChannels: ["app"], optInRequired: true, phone: "250-784-3200" }],
    ["qathet", "https://qathet.ca/services/emergency-services/", "Regional emergency program includes Powell River and works in collaboration with Tla’amin Nation.", "https://www.getrave.ca/smart911/ref/reg.action?pa=qathetrd", { deliveryChannels: ["email", "text", "phone"], optInRequired: true, phone: "604-485-2260" }],
    ["Squamish-Lillooet", "https://www.slrd.bc.ca/emergency-program/preparedness/slrd-emergency-notification", "SLRD Alert covers electoral areas; Squamish, Whistler, Pemberton, and Lillooet require their own municipal alert registrations.", undefined, { startHereEligible: false, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["Strathcona", "https://www.srd.ca/services/emergency-program/alerts-notifications", "The regional Alertable service covers participating SRD communities; alerts are geographically targeted.", undefined, { startHereEligible: false, deliveryChannels: ["email", "text", "phone"], optInRequired: true, cost: "Free", phone: "250-830-6702", offlineFallback: "A person without internet access can call the Strathcona Emergency Program at 250-830-6702 or have someone register on their behalf." }],
    ["Sunshine Coast", "https://www.scrd.ca/emergency-alerts/", "The integrated Sunshine Coast Emergency Program covers the regional district, Gibsons, Sechelt, and the shíshálh Nation Government District.", "https://www.scrd.ca/alert-system/", { deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["Thompson-Nicola", "https://eoc.tnrd.ca/", "TNRD source for areas outside municipal boundaries; Kamloops and other municipalities may operate separate alert systems.", undefined, { startHereEligible: false }]
  ];

  // Official legal-boundary extents, rounded to 0.001 degree, provide a
  // degraded-mode spatial index if the live B.C. geometry service is offline.
  const bcRegionalBounds = {
    "Alberni-Clayoquot": [-126.711, 48.625, -124.539, 49.609],
    "Bulkley-Nechako": [-128.477, 52.987, -123.28, 56],
    Capital: [-124.503, 48.225, -123.009, 49.016],
    Cariboo: [-126.651, 50.876, -120.14, 53.54],
    "Central Coast": [-129.448, 51, -125.344, 53.304],
    "Central Kootenay": [-118.497, 49.001, -116.027, 51.065],
    "Central Okanagan": [-120.06, 49.671, -118.797, 50.235],
    "Columbia-Shuswap": [-119.711, 50.402, -116.255, 52.494],
    "Comox Valley": [-125.551, 49.405, -124.481, 49.921],
    "Cowichan Valley": [-124.87, 48.433, -123.323, 49.154],
    "East Kootenay": [-116.797, 48.999, -114.054, 51.334],
    "Fraser Valley": [-123.005, 49, -120.811, 50.151],
    "Fraser-Fort George": [-124.028, 52.177, -118.195, 55.992],
    "Kitimat-Stikine": [-133.07, 51.608, -126.638, 59],
    "Kootenay Boundary": [-119.377, 49, -117.466, 49.83],
    "Metro Vancouver": [-123.715, 49.002, -122.408, 49.57],
    "Mount Waddington": [-129.448, 49.909, -125.202, 52.049],
    Nanaimo: [-124.968, 48.98, -123.43, 49.476],
    "North Coast": [-133.226, 51, -129.027, 54.739],
    "North Okanagan": [-119.764, 49.812, -118.163, 50.937],
    "Okanagan-Similkameen": [-121.1, 49, -119.175, 49.912],
    "Peace River": [-127.739, 53.799, -120.001, 58.028],
    qathet: [-124.992, 49.365, -123.731, 50.862],
    "Squamish-Lillooet": [-124.01, 49.483, -121.627, 51.21],
    Strathcona: [-127.99, 49.478, -123.685, 51.327],
    "Sunshine Coast": [-124.284, 49.297, -123.247, 50.367],
    "Thompson-Nicola": [-122.676, 49.61, -118.788, 52.877]
  };

  const citySupplements = [
    ["or", "Portland", "City of Portland emergency information", "https://www.portland.gov/emergency", "Joint City of Portland and Multnomah County PublicAlerts information and preparedness source.", { primaryAction: { type: "enroll", label: "Sign up for Portland-area PublicAlerts", url: "https://www.publicalerts.org/signup", priority: 5 }, deliveryChannels: ["email", "text", "phone"], optInRequired: true, cost: "Free" }],
    ["bc", "Kamloops", "Kamloops emergency alerts", "https://www.kamloops.ca/public-safety/emergency-management/emergency-preparedness/emergency-alerts-orders", "City-issued alerts use Voyent Alert!; TNRD and Tk’emlúps te Secwépemc issue separately for their jurisdictions.", { primaryAction: { type: "enroll", label: "Sign up for Kamloops emergency alerts", url: "https://www.kamloops.ca/public-safety/emergency-preparedness/emergency-alerts-orders/emergency-alert-notifications", priority: 5 }, deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free", linkCheckManualReviewUrls: ["https://www.kamloops.ca/public-safety/emergency-management/emergency-preparedness/emergency-alerts-orders"] }],
    ["bc", "Vancouver", "Vancouver Alertable", "https://vancouver.ca/home-property-development/alertable-public-alerting-system.aspx", "City of Vancouver local emergency alerts and safety instructions.", { deliveryChannels: ["app", "computer", "smart speaker"], optInRequired: true, cost: "Free", languages: ["English", "30+ in-app machine translations"], accessibilityUrl: "https://vancouver.ca/home-property-development/alertable-public-alerting-system.aspx", offlineFallback: "Emergency crews may also use door-knocking; monitor official City channels if the app is unavailable." }],
    ["bc", "Victoria", "Vic-Alert", "https://www.victoria.ca/community-culture/safety-wellbeing/emergency-preparedness/stay-informed", "City of Victoria emergency notifications for local fires, evacuations, gas leaks, and other safety threats.", { deliveryChannels: ["app", "email", "text", "phone"], optInRequired: true, cost: "Free", phone: "250-920-3373" }]
  ];

  // Tight degraded-mode extents prevent one city from appearing across an
  // entire state or province while the official municipal geometry loads.
  const cityFallbackBounds = {
    "wa-aberdeen": [-123.9, 46.9, -123.7, 47.1],
    "wa-bainbridge-island": [-122.65, 47.53, -122.45, 47.75],
    "wa-marysville": [-122.3, 47.95, -122.1, 48.15],
    "wa-puyallup": [-122.4, 47.08, -122.2, 47.28],
    "wa-redmond": [-122.2, 47.55, -121.95, 47.75],
    "wa-seattle": [-122.46, 47.48, -122.22, 47.75],
    "wa-snoqualmie": [-121.95, 47.45, -121.7, 47.65],
    "wa-sumner": [-122.3, 47.1, -122.15, 47.3],
    "wa-tacoma": [-122.58, 47.15, -122.35, 47.35],
    "or-portland": [-122.84, 45.42, -122.47, 45.66],
    "bc-kamloops": [-120.55, 50.55, -120.15, 50.85],
    "bc-vancouver": [-123.3, 49.19, -123.02, 49.33],
    "bc-victoria": [-123.5, 48.38, -123.25, 48.55]
  };

  const countyRecords = (rows, region, registryUrl, registryName) => rows.map(([name, url, actionUrl = url]) => ({
    id: `alert-${region}-${slugify(name)}-county`,
    name: `${name} County emergency alerts`,
    organization: `${name} County`,
    publisher: "county",
    group: "County & regional",
    place: `${name} County, ${region === "wa" ? "Washington" : "Oregon"}`,
    categories: ["alerts", "emergency", "community"],
    authorityRole: "Primary local alert enrollment",
    rolePriority: 1,
    summary: `Official enrollment or alert-information source for ${name} County. The public agency—not its notification vendor—controls local use of this channel.`,
    url,
    registryUrl,
    sourceRegistry: registryName,
    sourceTier: "official-registry",
    verifiedOn: VERIFIED_ON,
    primaryAction: {
      type: "enroll",
      label: `Set up ${name} County alerts`,
      url: actionUrl,
      priority: 10
    },
    deliveryChannels: region === "wa" ? ["email", "text"] : ["app", "email", "text"],
    optInRequired: true,
    ...(region === "or" ? {
      cost: "Free",
      offlineFallback: "Monitor local television or radio if internet or mobile service is unavailable; call 911 for an immediate threat to life or safety."
    } : {}),
    coverageKeys: [`county-${region}-${slugify(name)}`],
    fallbackBounds: region === "wa" ? [-125.2, 45.5, -116.7, 49.15] : [-125.2, 41.7, -116.4, 46.4],
    coverageNote: `Applies within ${name} County. Incorporated cities may also operate supplemental systems; follow the issuing agency named in each alert.`
  }));

  const cityRecords = [
    ...waCities.map(([name, url, operational = {}]) => ["wa", name, `${name} emergency alerts`, url, `City-specific alert source listed by Washington Emergency Management. It supplements the county system for ${name}.`, operational]),
    ...citySupplements
  ].map(([region, name, recordName, url, note, operational = {}]) => ({
    id: `alert-${region}-${slugify(name)}-city`,
    name: recordName,
    organization: `City of ${name}`,
    publisher: "local",
    group: "City & community",
    place: `${name}, ${region === "wa" ? "Washington" : region === "or" ? "Oregon" : "British Columbia"}`,
    categories: ["alerts", "emergency", "community"],
    authorityRole: "City alert source",
    rolePriority: 1,
    summary: `Official city source for localized emergency notifications, instructions, and preparedness information in ${name}.`,
    url,
    registryUrl: region === "wa" ? WA_REGISTRY : url,
    sourceRegistry: region === "wa" ? "Washington Emergency Management Division local opt-in directory" : "Direct official city source",
    sourceTier: region === "wa" ? "official-registry" : "official-direct",
    verifiedOn: VERIFIED_ON,
    primaryAction: {
      type: "enroll",
      label: `Set up ${name} emergency alerts`,
      url,
      priority: 5
    },
    ...(region === "wa" ? { deliveryChannels: ["email", "text"], optInRequired: true } : {}),
    coverageKeys: [`city-${region}-${slugify(name)}`],
    fallbackBounds: cityFallbackBounds[`${region}-${slugify(name)}`],
    coverageNote: note,
    ...operational
  }));

  const bcRecords = bcRegionalDistricts.map(([name, url, coverageNote, actionUrl = url, operational = {}]) => ({
    id: `alert-bc-${slugify(name)}-regional`,
    name: `${name} emergency alerts`,
    organization: `${name === "qathet" ? "qathet" : name} Regional District`,
    publisher: "county",
    group: "County & regional",
    place: `${name} Regional District, British Columbia`,
    categories: ["alerts", "emergency", "community", "support"],
    authorityRole: "Regional/local alert authority",
    rolePriority: 1,
    summary: "Official regional emergency information or opt-in notification source. In B.C., the responsible local government or First Nation requests a community BC Emergency Alert; the province transmits it.",
    url,
    registryUrl: BC_GUIDELINES,
    sourceRegistry: "Direct official regional source + B.C. Emergency Alert Guidelines",
    sourceTier: "official-direct",
    verifiedOn: VERIFIED_ON,
    primaryAction: {
      type: "enroll",
      label: `Sign up for ${name} emergency alerts`,
      url: actionUrl,
      priority: 15
    },
    coverageKeys: [`regional-bc-${slugify(name)}`],
    fallbackBounds: bcRegionalBounds[name],
    fallbackGeometry: "official-bbox",
    coverageNote,
    ...operational
  }));

  const jurisdictionRecords = [
    ...countyRecords(waCounties, "wa", WA_REGISTRY, "Washington Emergency Management Division local opt-in directory"),
    ...countyRecords(orCounties, "or", OR_REGISTRY, "OR-Alert official jurisdiction directory"),
    ...bcRecords,
    ...cityRecords
  ];

  const regionalRoleRecords = [
    {
      id: "fness-emergency-management",
      name: "First Nations’ Emergency Services Society",
      organization: "First Nations’ Emergency Services Society of British Columbia",
      publisher: "tribal",
      group: "Tribal",
      place: "First Nations in British Columbia",
      categories: ["emergency", "support", "community", "hazards"],
      authorityRole: "First Nation emergency-management support",
      rolePriority: 5,
      summary: "Preparedness, wildfire, emergency-management, and recovery support for B.C. First Nations. Each First Nation remains a distinct government and may maintain its own alert channels.",
      url: "https://www.fness.bc.ca/core-programs/all-hazard-response/",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "Direct First Nations service source + B.C. guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "support",
        label: "Find First Nations emergency-management support",
        url: "https://www.fness.bc.ca/core-programs/all-hazard-response/",
        priority: 20
      },
      deliveryChannels: ["web"],
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Province-wide support relevance only. This is not a substitute for the alert source of the First Nation whose lands or community are affected."
    },
    {
      id: "nws-spokane",
      name: "National Weather Service — Spokane",
      organization: "NOAA / National Weather Service",
      publisher: "federal",
      group: "Federal & regional",
      place: "Eastern Washington and north Idaho",
      categories: ["alerts", "hazards"],
      authorityRole: "Weather warning issuer",
      rolePriority: 4,
      summary: "Official forecasts, warnings, watches, and hazard briefings for eastern Washington, including Okanogan County and Winthrop.",
      url: "https://www.weather.gov/otx/",
      registryUrl: "https://www.weather.gov/",
      sourceRegistry: "NOAA / National Weather Service",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-weather",
        label: "Monitor NWS Spokane weather alerts",
        url: "https://www.weather.gov/otx/",
        priority: 10
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["nws-otx"],
      fallbackBounds: [-121.2, 45.8, -116.4, 49.15],
      coverageNote: "Applies within the Spokane NWS County Warning Area. NWS issues weather warnings; local authorities issue evacuation instructions."
    },
    {
      id: "nws-pendleton",
      name: "National Weather Service — Pendleton",
      organization: "NOAA / National Weather Service",
      publisher: "federal",
      group: "Federal & regional",
      place: "Central and northeast Oregon, southeast Washington",
      categories: ["alerts", "hazards"],
      authorityRole: "Weather warning issuer",
      rolePriority: 4,
      summary: "Official forecasts, warnings, watches, and hazard briefings for central and northeast Oregon and southeast Washington.",
      url: "https://www.weather.gov/pdt/",
      registryUrl: "https://www.weather.gov/",
      sourceRegistry: "NOAA / National Weather Service",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-weather",
        label: "Monitor NWS Pendleton weather alerts",
        url: "https://www.weather.gov/pdt/",
        priority: 10
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["nws-pdt"],
      fallbackBounds: [-122.2, 43.2, -117, 47.1],
      coverageNote: "Applies within the Pendleton NWS County Warning Area. NWS issues weather warnings; local authorities issue evacuation instructions."
    },
    {
      id: "nws-boise",
      name: "National Weather Service — Boise",
      organization: "NOAA / National Weather Service",
      publisher: "federal",
      group: "Federal & regional",
      place: "Southeast Oregon and southwest Idaho",
      categories: ["alerts", "hazards"],
      authorityRole: "Weather warning issuer",
      rolePriority: 4,
      summary: "Official forecasts, warnings, watches, and hazard briefings for southeast Oregon and southwest Idaho.",
      url: "https://www.weather.gov/boi/",
      registryUrl: "https://www.weather.gov/",
      sourceRegistry: "NOAA / National Weather Service",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-weather",
        label: "Monitor NWS Boise weather alerts",
        url: "https://www.weather.gov/boi/",
        priority: 10
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["nws-boi"],
      fallbackBounds: [-119.2, 41.7, -114.2, 45.3],
      coverageNote: "Applies within the Boise NWS County Warning Area. NWS issues weather warnings; local authorities issue evacuation instructions."
    },
    {
      id: "bc-emergency-alert",
      name: "BC Emergency Alert",
      organization: "B.C. Ministry of Emergency Management and Climate Readiness",
      publisher: "state",
      group: "State & statewide",
      place: "British Columbia",
      categories: ["alerts", "emergency"],
      authorityRole: "Intrusive-alert transmitter",
      rolePriority: 2,
      summary: "Province-wide broadcast system for compatible phones, television, and radio. A local government or First Nation normally requests a community alert; provincial staff transmit it.",
      url: "https://www2.gov.bc.ca/gov/content/safety/public-safety/emergency-alerts",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "B.C. Emergency Alert Guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "prepare",
        label: "Learn how BC Emergency Alert reaches you",
        url: "https://www2.gov.bc.ca/gov/content/safety/public-safety/emergency-alerts",
        priority: 10
      },
      deliveryChannels: ["mobile alert", "television", "radio"],
      optInRequired: false,
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Province-wide delivery capability. It does not replace municipal, regional-district, or First Nation subscriptions and official channels."
    },
    {
      id: "emergency-info-bc",
      name: "EmergencyInfoBC",
      organization: "Government of British Columbia",
      publisher: "state",
      group: "State & statewide",
      place: "British Columbia",
      categories: ["alerts", "emergency", "support", "hazards"],
      authorityRole: "Official alert aggregator",
      rolePriority: 3,
      summary: "24/7 provincial source that republishes and amplifies verified evacuation alerts, orders, and emergency information issued by local authorities and First Nations.",
      url: "https://www.emergencyinfobc.gov.bc.ca/",
      registryUrl: "https://www.emergencyinfobc.gov.bc.ca/",
      sourceRegistry: "Direct provincial source",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-hazard",
        label: "Monitor EmergencyInfoBC alerts",
        url: "https://www.emergencyinfobc.gov.bc.ca/",
        priority: 5
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Province-wide official aggregator; the record identifies the local authority that issued each listed alert or order."
    },
    {
      id: "environment-canada-bc-alerts",
      name: "Environment Canada weather alerts — B.C.",
      organization: "Environment and Climate Change Canada",
      publisher: "federal",
      group: "Federal & regional",
      place: "British Columbia",
      categories: ["alerts", "hazards"],
      authorityRole: "Weather warning issuer",
      rolePriority: 4,
      summary: "Official weather watches, warnings, and statements for British Columbia. Weather alerts do not by themselves identify the local evacuation authority.",
      url: "https://weather.gc.ca/index_e.html?alertTableFilterProv=BC",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "Environment and Climate Change Canada + B.C. guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-weather",
        label: "Monitor Environment Canada weather alerts",
        url: "https://weather.gc.ca/index_e.html?alertTableFilterProv=BC",
        priority: 10
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Applies across B.C. weather forecast regions; consult the responsible local authority for evacuation instructions."
    },
    {
      id: "bc-wildfire-service",
      name: "BC Wildfire Service",
      organization: "Government of British Columbia",
      publisher: "state",
      group: "State & statewide",
      place: "British Columbia",
      categories: ["hazards", "emergency", "community"],
      authorityRole: "Wildfire incident information",
      rolePriority: 4,
      summary: "Official wildfire status, response, bans, restrictions, and incident information. Evacuation alerts and orders normally come from the responsible local authority or First Nation.",
      url: "https://wildfiresituation.nrs.gov.bc.ca/map",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "Direct provincial source + B.C. guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
      primaryAction: {
        type: "monitor-hazard",
        label: "Monitor the B.C. wildfire situation",
        url: "https://wildfiresituation.nrs.gov.bc.ca/map",
        priority: 10
      },
      deliveryChannels: ["web"],
      optInRequired: false,
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Province-wide wildfire information source, not a universal local evacuation authority."
    }
  ];

  window.SIGNALS_AUTHORITY_RECORDS = [...regionalRoleRecords, ...jurisdictionRecords];
  window.SIGNALS_AUTHORITY_META = {
    verifiedOn: VERIFIED_ON,
    schemaVersion: 2,
    expected: { waCounties: 39, orCounties: 36, bcRegionalDistricts: 27 },
    actual: {
      waCounties: waCounties.length,
      orCounties: orCounties.length,
      bcRegionalDistricts: bcRegionalDistricts.length,
      citySupplements: cityRecords.length
    },
    sources: { WA_REGISTRY, OR_REGISTRY, BC_GUIDELINES }
  };
})();
