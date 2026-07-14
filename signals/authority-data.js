/*
 * Cascadia Signals alert-authority registry.
 *
 * Grain: one record per official enrollment/information source and jurisdiction.
 * Vendors such as Everbridge, Alertable, Voyent Alert!, CodeRED, and Genasys are
 * delivery channels; the named public agency remains the authority/publisher.
 * Verified against the official registries and agency pages on 2026-07-13.
 */
(function buildSignalsAuthorityRegistry() {
  const VERIFIED_ON = "2026-07-13";
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
    ["Cowlitz", "https://signup.hyper-reach.com/hyper_reach/sign_up_page_2/?id=99002"],
    ["Douglas", "https://member.everbridge.net/307455233884601/login"],
    ["Ferry", "https://member.everbridge.net/index/453003085618872#/signup"],
    ["Franklin", "https://franklinem.org/codered/"],
    ["Garfield", "https://www.co.garfield.wa.us/sheriff"],
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
    ["Pierce", "https://www.co.pierce.wa.us/921/Pierce-County-ALERT"],
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
    ["Aberdeen", "https://aberdeenwa.gov/portal?portalpage=notifications?tab=alerts"],
    ["Bainbridge Island", "https://www.bainbridgewa.gov/1322/Emergency-Notification"],
    ["Marysville", "https://www.marysvillewa.gov/1218/Marysville-Alerts"],
    ["Puyallup", "https://alertspuyallup.org/"],
    ["Redmond", "https://www.redmond.gov/506/Emergency-Alerts"],
    ["Seattle", "https://alert.seattle.gov/"],
    ["Snoqualmie", "https://www.snoqualmiewa.gov/551/Alerts"],
    ["Sumner", "https://sumnerwa.gov/sumner-alert/"],
    ["Tacoma", "https://tacoma.gov/government/departments/fire/tacomas-emergency-notification-system/"]
  ];

  const bcRegionalDistricts = [
    ["Alberni-Clayoquot", "https://www.acrd.bc.ca/emergency_alerts", "Regional system includes Port Alberni and participating First Nations; local programs may also publish instructions."],
    ["Bulkley-Nechako", "https://www.rdbn.bc.ca/departments/protective-services/Public-Alerting-System", "Regional alert source; verify the location selected in Voyent Alert! and follow municipal or First Nation instructions where applicable."],
    ["Capital", "https://www.crd.ca/programs-services/fire-emergency", "Regional coordination and electoral-area programs; municipalities in the capital region maintain their own emergency programs."],
    ["Cariboo", "https://www.cariboord.ca/emergency-protective-services/emergency-preparedness/emergency-notification-system/", "Regional emergency notification system for participating communities; location-specific instructions remain authoritative."],
    ["Central Coast", "https://www.ccrd.ca/services/emergency-management/", "Regional emergency information for CCRD services and communities; First Nations remain distinct governments and alert authorities."],
    ["Central Kootenay", "https://www.rdck.ca/development-community-sustainability-services/emergency/emergencynotification/", "Regional mass notification and official evacuation information; some municipalities may also publish local instructions."],
    ["Central Okanagan", "https://www.cordemergency.ca/", "Regional emergency program for Kelowna, West Kelowna, Lake Country, Peachland, Westbank First Nation, and the Central Okanagan electoral areas."],
    ["Columbia-Shuswap", "https://www.csrd.bc.ca/alertable", "Alertable spans the CSRD emergency programs; Golden and Revelstoke administer their area programs under regional agreements."],
    ["Comox Valley", "https://www.comoxvalleyrd.ca/services/emergency-management/emergency-notification-system", "Joint notification lists for electoral areas, Courtenay, Comox, Cumberland, and K’ómoks First Nation; subscribe to each relevant community."],
    ["Cowichan Valley", "https://cvrd.ca/services/emergency-management/", "Regional emergency-management source; municipalities and First Nations may issue or supplement local instructions."],
    ["East Kootenay", "https://www.rdek.bc.ca/departments/protectiveservices/emergencyinfo/evacuation_notification_system/", "The regional evacuation notification system covers municipalities, rural areas, and participating First Nations across the East Kootenay."],
    ["Fraser Valley", "https://www.fvrd.ca/EN/main/services/emergency-management/emergency-operations-centre-eoc.html", "FVRD emergency information primarily covers electoral areas; member municipalities maintain local emergency programs."],
    ["Fraser-Fort George", "https://www.rdffg.ca/PAS", "Public Alerting System covers RD electoral areas, Prince George, and Mackenzie; McBride and Valemount use separate local sources."],
    ["Kitimat-Stikine", "https://www.rdks.bc.ca/emergency_services", "RDKS issues instructions for its rural electoral areas; Terrace, Kitimat, and other municipalities are primarily responsible inside city boundaries."],
    ["Kootenay Boundary", "https://emergency.rdkb.com/", "Regional emergency portal and evacuation-notification signup; follow any municipal or First Nation instructions that apply to your location."],
    ["Metro Vancouver", "https://metrovancouver.org/services/emergency-management", "Regional coordination source. Metro Vancouver member municipalities are the primary local alert authorities inside city boundaries."],
    ["Mount Waddington", "https://www.rdmw.bc.ca/services/emergency-management/", "Regional emergency-management source for North Island communities; municipal and First Nation programs may also apply."],
    ["Nanaimo", "https://rdn.bc.ca/emergency-communications", "RDN Voyent Alert! is shared with participating municipalities; choose every community relevant to where you live, work, or travel."],
    ["North Coast", "https://www.ncrdbc.com/services/public-safety", "Regional public-safety and emergency-alert source; municipalities and First Nations may maintain separate local channels."],
    ["North Okanagan", "https://www.rdno.ca/alertable", "RDNO Alertable instructions are for Electoral Areas B–F; neighbouring municipalities maintain their own emergency programs or Alertable locations."],
    ["Okanagan-Similkameen", "https://www.rdos.bc.ca/newsandevents/notifications/", "RDOS routine and emergency notifications; member municipalities and syilx communities may issue separate local instructions."],
    ["Peace River", "https://www.prrd.bc.ca/emergency-services/emergency-alerts-and-evacuations/", "NEBC Alerts is used by the PRRD and municipal partners; register addresses and follow the named issuing authority on each notice."],
    ["qathet", "https://qathet.ca/services/emergency-services/", "Regional emergency program includes Powell River and works in collaboration with Tla’amin Nation."],
    ["Squamish-Lillooet", "https://www.slrd.bc.ca/emergency-program/preparedness/slrd-emergency-notification", "SLRD Alert covers electoral areas; Squamish, Whistler, Pemberton, and Lillooet require their own municipal alert registrations."],
    ["Strathcona", "https://www.srd.ca/services/emergency-program/alerts-notifications", "The regional Alertable service covers participating SRD communities; alerts are geographically targeted."],
    ["Sunshine Coast", "https://www.scrd.ca/emergency-alerts/", "Regional emergency alert source using Voyent Alert!; local and shíshálh Nation instructions may also apply."],
    ["Thompson-Nicola", "https://eoc.tnrd.ca/", "TNRD source for areas outside municipal boundaries; Kamloops and other municipalities may operate separate alert systems."]
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
    ["or", "Portland", "City of Portland emergency information", "https://www.portland.gov/emergency", "Joint City of Portland and Multnomah County PublicAlerts information and preparedness source."],
    ["bc", "Kamloops", "Kamloops emergency alerts", "https://www.kamloops.ca/public-safety/emergency-management/emergency-preparedness/emergency-alerts-orders", "City-issued alerts use Voyent Alert!; TNRD and Tk’emlúps te Secwépemc issue separately for their jurisdictions."],
    ["bc", "Vancouver", "Vancouver Alertable", "https://vancouver.ca/home-property-development/alertable-public-alerting-system.aspx", "City of Vancouver local emergency alerts and safety instructions."],
    ["bc", "Victoria", "Vic-Alert", "https://www.victoria.ca/community-culture/safety-wellbeing/emergency-preparedness/stay-informed", "City of Victoria emergency notifications for local fires, evacuations, gas leaks, and other safety threats."]
  ];

  const countyRecords = (rows, region, registryUrl, registryName) => rows.map(([name, url]) => ({
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
    coverageKeys: [`county-${region}-${slugify(name)}`],
    fallbackBounds: region === "wa" ? [-125.2, 45.5, -116.7, 49.15] : [-125.2, 41.7, -116.4, 46.4],
    coverageNote: `Applies within ${name} County. Incorporated cities may also operate supplemental systems; follow the issuing agency named in each alert.`
  }));

  const cityRecords = [
    ...waCities.map(([name, url]) => ["wa", name, `${name} emergency alerts`, url, `City-specific alert source listed by Washington Emergency Management. It supplements the county system for ${name}.`]),
    ...citySupplements
  ].map(([region, name, recordName, url, note]) => ({
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
    coverageKeys: [`city-${region}-${slugify(name)}`],
    fallbackBounds: region === "wa" ? [-125.2, 45.5, -116.7, 49.15] : region === "or" ? [-125.2, 41.7, -116.4, 46.4] : [-139.2, 48.2, -114, 60.1],
    coverageNote: note
  }));

  const bcRecords = bcRegionalDistricts.map(([name, url, coverageNote]) => ({
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
    coverageKeys: [`regional-bc-${slugify(name)}`],
    fallbackBounds: bcRegionalBounds[name],
    fallbackGeometry: "official-bbox",
    coverageNote
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
      url: "https://www.fness.bc.ca/core-programs/emergency-management",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "Direct First Nations service source + B.C. guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
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
      url: "https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/emergency-alerts",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "B.C. Emergency Alert Guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
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
      url: "https://weather.gc.ca/warnings/index_e.html?prov=bc",
      registryUrl: BC_GUIDELINES,
      sourceRegistry: "Environment and Climate Change Canada + B.C. guidelines",
      sourceTier: "official-direct",
      verifiedOn: VERIFIED_ON,
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
      coverageKeys: ["province-bc"],
      fallbackBounds: [-139.2, 48.2, -114, 60.1],
      coverageNote: "Province-wide wildfire information source, not a universal local evacuation authority."
    }
  ];

  window.SIGNALS_AUTHORITY_RECORDS = [...regionalRoleRecords, ...jurisdictionRecords];
  window.SIGNALS_AUTHORITY_META = {
    verifiedOn: VERIFIED_ON,
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
