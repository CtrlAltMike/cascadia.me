const mainSkip = Object.freeze({
  className: 'surface-skip-link',
  href: '#main-content',
  text: 'Skip to main content'
});

const guideSkip = Object.freeze({
  className: 'lw-skip-link',
  href: '#main-content',
  text: 'Skip to main content'
});

const storySkip = Object.freeze({
  className: 'surface-skip-link',
  href: '#story-text',
  text: 'Skip to the story'
});

export const siteCacheVersions = Object.freeze({
  designSystem: '20260725-phase3',
  frame: '20260725-home-nav',
  frameHardening: '20260723-frame-hardening',
  mission: '20260725-phase3',
  capability: '20260725-capability',
  fieldTool: '20260725-event-inserts',
  approach: '20260712-approach3',
  guidesHero: '20260722-guides-hero',
  faqHero: '20260721-hero3',
  kit: '20260716-nowweplan',
  guideEditorial: '20260716-editorial',
  primaryGuides: '20260725-phase4',
  volcanoEditorial: '20260716-volcano-edit',
  fieldStories: '20260723-story-frontispieces2',
  storyShelf: '20260722-book-lift6',
  atlas: '20260723-wind-arrows',
  atlasStyle: '20260725-phase4',
  signalsAuthority: '20260714-actionability',
  signalsBoundary: '20260714',
  signalsApp: '20260725-official-first'
});

export const siteAssetCatalog = Object.freeze({
  surface: Object.freeze({ kind: 'style', path: 'css/living-watershed-surfaces.css', version: siteCacheVersions.frameHardening }),
  guide: Object.freeze({ kind: 'style', path: 'css/living-watershed-guide.css', version: siteCacheVersions.frameHardening }),
  home: Object.freeze({ kind: 'style', path: 'css/living-watershed-home.css', version: siteCacheVersions.frameHardening }),
  mission: Object.freeze({ kind: 'style', path: 'css/living-watershed-mission.css', version: siteCacheVersions.mission }),
  capability: Object.freeze({ kind: 'style', path: 'css/living-watershed-capability.css', version: siteCacheVersions.capability }),
  fieldTool: Object.freeze({ kind: 'style', path: 'css/living-watershed-field-tool.css', version: siteCacheVersions.fieldTool }),
  atlasStyle: Object.freeze({ kind: 'style', path: 'css/living-watershed-atlas.css', version: siteCacheVersions.atlasStyle }),
  signalsStyle: Object.freeze({ kind: 'style', path: 'signals/styles.css', version: siteCacheVersions.signalsApp }),
  approachPhase7: Object.freeze({ kind: 'style', path: 'css/living-watershed-phase7.css', version: siteCacheVersions.approach }),
  guidesPhase7: Object.freeze({ kind: 'style', path: 'css/living-watershed-phase7.css', version: siteCacheVersions.guidesHero }),
  faq: Object.freeze({ kind: 'style', path: 'css/faq.css', version: siteCacheVersions.faqHero }),
  kit: Object.freeze({ kind: 'style', path: 'css/living-watershed-kit.css', version: siteCacheVersions.kit }),
  primaryGuides: Object.freeze({ kind: 'style', path: 'css/living-watershed-primary-chapters.css', version: siteCacheVersions.primaryGuides }),
  earthquake: Object.freeze({ kind: 'style', path: 'css/living-watershed-earthquake.css', version: siteCacheVersions.guideEditorial }),
  volcano: Object.freeze({ kind: 'style', path: 'css/living-watershed-volcano.css', version: siteCacheVersions.volcanoEditorial }),
  fieldStories: Object.freeze({ kind: 'style', path: 'css/field-stories.css', version: siteCacheVersions.fieldStories }),
  maplibreStyle: Object.freeze({ kind: 'style', path: 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css', external: true }),
  maplibreScript: Object.freeze({ kind: 'script', path: 'https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js', external: true, defer: true }),
  atlasScript: Object.freeze({ kind: 'script', path: 'js/atlas.js', version: siteCacheVersions.atlas }),
  workbookScript: Object.freeze({ kind: 'script', path: 'js/household-workbook.js' }),
  storyScript: Object.freeze({ kind: 'script', path: 'js/field-stories.js', version: '20260715-stories5' }),
  storyShelfScript: Object.freeze({ kind: 'script', path: 'js/field-stories-shelf.js', version: siteCacheVersions.storyShelf }),
  signalsAuthority: Object.freeze({ kind: 'script', path: 'signals/authority-data.js', version: siteCacheVersions.signalsAuthority, defer: true }),
  signalsProvince: Object.freeze({ kind: 'script', path: 'signals/bc-province-boundary.js', version: siteCacheVersions.signalsBoundary, defer: true }),
  signalsForecast: Object.freeze({ kind: 'script', path: 'signals/bc-forecast-zones.js', version: siteCacheVersions.signalsBoundary, defer: true }),
  signalsApp: Object.freeze({ kind: 'script', path: 'signals/app.js', version: siteCacheVersions.signalsApp, defer: true })
});

const pageDefinitions = [
  {
    path: '404.html',
    family: 'not-found',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'Page not found | Cascadia.me',
    description: 'This Cascadia.me page was not found. Return home or choose the practical question you came to answer.',
    canonical: 'https://cascadia.me/404.html',
    schemaType: null
  },
  {
    path: 'after-an-event.html',
    family: 'field-tool',
    styleFamily: 'field-tool',
    navSection: 'people',
    footerItem: 'after-event',
    skip: mainSkip,
    title: 'After an Event: Organize the People Who Are Here | Cascadia.me',
    description: 'A paper-first Cascadia field guide for gathering safely, accounting for people, recording needs and offers, assigning work, and handing facts to official responders.',
    canonical: 'https://cascadia.me/after-an-event.html',
    schemaType: 'HowTo'
  },
  {
    path: 'approach.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: 'approach',
    skip: mainSkip,
    title: 'About Cascadia.me: Why It Exists and How the Work Is Checked',
    description: 'Why Cascadia.me prepares for consequences, how the work is checked, what its limits are, and which public rules govern it.',
    canonical: 'https://cascadia.me/approach.html',
    schemaType: 'AboutPage'
  },
  {
    path: 'atlas.html',
    family: 'instrument',
    styleFamily: 'atlas',
    navSection: 'place',
    footerItem: 'atlas',
    skip: {
      className: 'atlas-skip-link',
      href: '#main-content',
      text: 'Skip to the Atlas'
    },
    title: 'Cascadia Atlas: See How a Place Connects | Cascadia.me',
    description: 'Compare current reports, observed and forecast conditions, historical events, terrain, and planning layers across Cascadia without treating a regional map as local instruction.',
    canonical: 'https://cascadia.me/atlas.html',
    schemaType: 'WebPage'
  },
  {
    path: 'building.html',
    family: 'guide',
    styleFamily: 'surface',
    navSection: 'place',
    footerItem: null,
    skip: mainSkip,
    title: 'Understand Your Building in Cascadia | Cascadia.me',
    description: 'Learn which building, site, ownership, insurance, and professional-assessment questions can make hazard guidance more useful at a particular home.',
    canonical: 'https://cascadia.me/building.html',
    schemaType: 'WebPage'
  },
  {
    path: 'constitution.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'The Resilience Network Constitution | Cascadia.me',
    description: 'The twelve binding rules that govern Cascadia.me, NowWePlan.com, HurricaneCoast.me, and SanAndreas.me.',
    canonical: 'https://cascadia.me/constitution.html',
    schemaType: 'DigitalDocument'
  },
  {
    path: 'amendments.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'Constitution Amendments | Cascadia.me',
    description: 'The public version history and amendment log for the Resilience Network Constitution.',
    canonical: 'https://cascadia.me/amendments.html',
    schemaType: 'WebPage'
  },
  {
    path: 'corrections.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'Corrections | Cascadia.me',
    description: 'How Cascadia.me receives, checks, corrects, and records material errors.',
    canonical: 'https://cascadia.me/corrections.html',
    schemaType: 'WebPage'
  },
  {
    path: 'first-moves.html',
    family: 'guide-library',
    styleFamily: 'surface',
    navSection: 'first',
    footerItem: 'first',
    skip: mainSkip,
    title: 'First Moves During an Emergency in Cascadia | Cascadia.me',
    description: 'Immediate protective actions, natural warnings, route questions, and official-source handoffs for earthquakes, tsunamis, wildfire, flooding, winter storms, and volcanic activity.',
    canonical: 'https://cascadia.me/first-moves.html',
    schemaType: 'WebPage'
  },
  {
    path: 'build-your-kit.html',
    family: 'handoff',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'The Household Workbook Has Moved | Cascadia.me',
    description: 'The Cascadia.me household workbook now lives at household-workbook.html.',
    canonical: 'https://cascadia.me/household-workbook.html',
    schemaType: null,
    indexable: false,
    redirectTo: 'household-workbook.html'
  },
  {
    path: 'event-inserts.html',
    family: 'field-tool',
    styleFamily: 'field-tool',
    navSection: 'people',
    footerItem: 'inventory',
    skip: mainSkip,
    title: 'Cascadia Event Inserts: Printable Working Sheets | Cascadia.me',
    description: 'Five printable neighborhood inserts for earthquakes and tsunamis, wildfire, flood and landslide, winter and temperature events, and volcanic ash.',
    canonical: 'https://cascadia.me/event-inserts.html',
    schemaType: 'WebPage'
  },
  {
    path: 'earthquake.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'place',
    footerItem: 'earthquake',
    skip: guideSkip,
    title: 'Earthquake Preparedness in Cascadia | Cascadia.me',
    description: 'An illustrated, place-based guide to earthquakes in Cascadia: protect yourself during shaking, understand the region\'s geology, and prepare a household plan that fits your life.',
    canonical: 'https://cascadia.me/earthquake.html',
    schemaType: 'WebPage'
  },
  {
    path: 'faq.html',
    family: 'faq',
    styleFamily: 'surface',
    navSection: null,
    footerItem: 'faq',
    skip: mainSkip,
    title: 'Frequently Asked Questions | Cascadia.me',
    description: 'Plain-language answers about Cascadia, bioregions, systems thinking, preparedness, how to use Cascadia.me, and the optional NowWePlan planning layer.',
    canonical: 'https://cascadia.me/faq.html',
    schemaType: 'FAQPage'
  },
  {
    path: 'flooding.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'place',
    footerItem: 'flooding',
    skip: guideSkip,
    title: 'Flood Preparedness in Cascadia | Cascadia.me',
    description: 'An illustrated, place-based Cascadian guide to flooding: understand local water signals, move before floodwater reaches a route, and return carefully after water recedes.',
    canonical: 'https://cascadia.me/flooding.html',
    schemaType: 'WebPage'
  },
  {
    path: 'guides.html',
    family: 'guide-library',
    styleFamily: 'surface',
    navSection: 'place',
    footerItem: null,
    skip: mainSkip,
    title: 'Cascadia Guides | Cascadia.me',
    description: 'An illustrated table of contents for Cascadia.me’s place-based guides to earthquakes, wildfire, flooding, winter storms, and volcanoes.',
    canonical: 'https://cascadia.me/guides.html',
    schemaType: 'CollectionPage'
  },
  {
    path: 'household-workbook.html',
    family: 'workbook',
    styleFamily: 'guide',
    navSection: 'keep-life',
    footerItem: 'kit',
    skip: guideSkip,
    title: 'The Household Workbook | Cascadia.me',
    description: 'A public, printable household preparedness workbook for Cascadia: map daily needs, make home systems more resilient, plan how to leave and reconnect, and test one ordinary interruption at a time.',
    canonical: 'https://cascadia.me/household-workbook.html',
    schemaType: 'WebPage'
  },
  {
    path: 'index.html',
    family: 'home',
    styleFamily: 'home',
    navSection: 'home',
    footerItem: null,
    skip: {
      className: 'home-skip-link',
      href: '#main-content',
      text: 'Skip to main content'
    },
    title: 'Understand Your Place. Make the Next Hard Day Easier. | Cascadia.me',
    description: 'Understand what Cascadia can do, make ordinary life less brittle, find official help, and organize with the people nearby before and after an interruption.',
    canonical: 'https://cascadia.me/',
    schemaType: 'WebPage'
  },
  {
    path: 'keep-life-going.html',
    family: 'guide-library',
    styleFamily: 'surface',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep Life Going Through an Interruption | Cascadia.me',
    description: 'Practical Cascadia guidance for water, sanitation, temperature, clean air, food, medication, communication, documents, movement, animals, staying, and leaving.',
    canonical: 'https://cascadia.me/keep-life-going.html',
    schemaType: 'CollectionPage'
  },
  {
    path: 'animals-and-dependents.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep Care Going When the Routine Moves | Cascadia.me',
    description: 'Plan food, water, medication, transport, identification, care authority, and backup people for animals and dependents.',
    canonical: 'https://cascadia.me/animals-and-dependents.html',
    schemaType: 'WebPage'
  },
  {
    path: 'clean-air.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Make One Room Easier to Breathe In | Cascadia.me',
    description: 'Reduce smoke and particle exposure indoors, understand filtration limits, and know when cleaner public air is the safer option.',
    canonical: 'https://cascadia.me/clean-air.html',
    schemaType: 'WebPage'
  },
  {
    path: 'communication.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Plan for Separation, Not Constant Contact | Cascadia.me',
    description: 'Choose contacts, meeting places, low-bandwidth messages, and a practical way to reconnect when people are apart.',
    canonical: 'https://cascadia.me/communication.html',
    schemaType: 'WebPage'
  },
  {
    path: 'food-and-medication.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Protect What Needs Cold, Timing, or Replacement | Cascadia.me',
    description: 'Keep essential food and medication usable through outages, access disruptions, flooding, and changing temperature.',
    canonical: 'https://cascadia.me/food-and-medication.html',
    schemaType: 'WebPage'
  },
  {
    path: 'light-and-information.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep One Light and One Trusted Source Working | Cascadia.me',
    description: 'Maintain safe lighting, backup power, alerts, and verified information without depending on one device or network.',
    canonical: 'https://cascadia.me/light-and-information.html',
    schemaType: 'WebPage'
  },
  {
    path: 'money-and-documents.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Make the Next Office Easier | Cascadia.me',
    description: 'Keep identity, insurance, account, property, benefit, and medical records findable without carrying every original.',
    canonical: 'https://cascadia.me/money-and-documents.html',
    schemaType: 'WebPage'
  },
  {
    path: 'movement.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Fit the Route to the Person | Cascadia.me',
    description: 'Plan accessible routes, transport, mobility equipment, assistance, and alternatives for staying or leaving.',
    canonical: 'https://cascadia.me/movement.html',
    schemaType: 'WebPage'
  },
  {
    path: 'sanitation.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep Waste Separate and Hands Clean | Cascadia.me',
    description: 'Protect toilet use, handwashing, menstrual care, diapers, and waste handling when water or sewer service stops.',
    canonical: 'https://cascadia.me/sanitation.html',
    schemaType: 'WebPage'
  },
  {
    path: 'staying-or-leaving.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Prepare for Both Until One Is Clearly Right | Cascadia.me',
    description: 'Use current orders and conditions to decide whether to stay or leave, with routes, destinations, transport, and household needs ready.',
    canonical: 'https://cascadia.me/staying-or-leaving.html',
    schemaType: 'WebPage'
  },
  {
    path: 'temperature.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep People Safely Warm or Cool | Cascadia.me',
    description: 'Plan for safe indoor temperature, power-dependent needs, heat, cold, and a timely move to a safer place.',
    canonical: 'https://cascadia.me/temperature.html',
    schemaType: 'WebPage'
  },
  {
    path: 'neighborhood-inventory.html',
    family: 'field-tool',
    styleFamily: 'field-tool',
    navSection: 'people',
    footerItem: 'inventory',
    skip: mainSkip,
    title: 'Neighborhood Inventory: A Printable Working Packet | Cascadia.me',
    description: 'A consent-based, printable neighborhood packet with a quiet-day inventory, event status board, needs-and-offers sheet, and action and handoff log.',
    canonical: 'https://cascadia.me/neighborhood-inventory.html',
    schemaType: 'WebPage'
  },
  {
    path: 'people-nearby.html',
    family: 'guide',
    styleFamily: 'surface',
    navSection: 'people',
    footerItem: 'people',
    skip: mainSkip,
    title: 'People Nearby: Before and After an Emergency | Cascadia.me',
    description: 'Make one useful arrangement before an interruption, then help the people who are present build a safe, factual picture afterward.',
    canonical: 'https://cascadia.me/people-nearby.html',
    schemaType: 'WebPage'
  },
  {
    path: 'place.html',
    family: 'guide-library',
    styleFamily: 'surface',
    navSection: 'place',
    footerItem: 'place',
    skip: mainSkip,
    title: 'Know Your Place in Cascadia | Cascadia.me',
    description: 'Understand how land, water, weather, buildings, routes, infrastructure, and public authority connect where you live in the Cascadia bioregion.',
    canonical: 'https://cascadia.me/place.html',
    schemaType: 'CollectionPage'
  },
  {
    path: 'recovery.html',
    family: 'guide',
    styleFamily: 'surface',
    navSection: 'recovery',
    footerItem: 'recovery',
    skip: mainSkip,
    title: 'Recovery: Make the Long Aftermath Easier | Cascadia.me',
    description: 'Practical orientation for housing, records, insurance, work, school, medical continuity, transportation, contractors, and community recovery after a major interruption.',
    canonical: 'https://cascadia.me/recovery.html',
    schemaType: 'WebPage'
  },
  {
    path: 'review-policy.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'Review Policy | Cascadia.me',
    description: 'How often Cascadia.me checks substantive pages, official links, routes, instructions, and live-source boundaries.',
    canonical: 'https://cascadia.me/review-policy.html',
    schemaType: 'WebPage'
  },
  {
    path: 'signals/index.html',
    family: 'instrument',
    styleFamily: 'signals',
    navSection: 'signals',
    footerItem: 'signals',
    skip: {
      className: 'skip-link',
      href: '#explorer',
      text: 'Skip to Signals'
    },
    title: 'Find Official Help in Cascadia | Cascadia Signals',
    description: 'Find responsible agencies, alert registration, current official instructions, transportation, utilities, health, and support sources across Cascadia.',
    canonical: 'https://cascadia.me/signals/',
    schemaType: 'WebPage'
  },
  {
    path: 'stories/chafe-gear.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Chafe Gear — A Field Story | Cascadia.me',
    description: 'A harbour manager follows a year’s quiet work toward the weather it was meant to meet. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/chafe-gear.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/crest.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Crest — A Field Story | Cascadia.me',
    description: 'A young family learns that the river’s history is a diary, not a promise. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/crest.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/eruption.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Eruption — A Field Story | Cascadia.me',
    description: 'Three friends enter a watched landscape with maps, math, and one dangerous assumption. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/eruption.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/index.html',
    family: 'story-library',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: mainSkip,
    title: 'Field Stories | Cascadia.me',
    description: 'Original fiction about preparedness, crisis, care, and community across the Cascadia bioregion, with factual source notes for every story.',
    canonical: 'https://cascadia.me/stories/',
    schemaType: 'CollectionPage'
  },
  {
    path: 'stories/inventory.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Inventory — A Field Story | Cascadia.me',
    description: 'An inventory specialist discovers what preparedness can—and cannot—hold. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/inventory.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/level-three.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Level Three — A Field Story | Cascadia.me',
    description: 'A horsewoman, her son, and her father meet an east wind with different plans. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/level-three.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/natural-warning.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Natural Warning — A Field Story | Cascadia.me',
    description: 'A coastal emergency coordinator inherits an old warning—and the responsibility to carry it forward. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/natural-warning.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/overnight-lows.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'Overnight Lows — A Field Story | Cascadia.me',
    description: 'A water operator reads an island’s lake, its meters, and the people behind them. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/overnight-lows.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/the-list.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'The List — A Field Story | Cascadia.me',
    description: 'A family’s unfinished refrigerator list becomes a map of the street around them. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/the-list.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'stories/the-rounds.html',
    family: 'story',
    styleFamily: 'surface',
    navSection: 'stories',
    footerItem: 'stories',
    skip: storySkip,
    headerAccessory: 'story-progress',
    title: 'The Rounds — A Field Story | Cascadia.me',
    description: 'A home-health aide carries a county’s most important map in a spiral binder. An original work of fiction from Cascadia.me.',
    canonical: 'https://cascadia.me/stories/the-rounds.html',
    schemaType: 'ShortStory'
  },
  {
    path: 'volcano.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'place',
    footerItem: 'volcano',
    skip: guideSkip,
    title: 'Volcano Preparedness in Cascadia | Cascadia.me',
    description: 'A calm, place-based guide to Cascade volcanoes: learn whether a valley, the wind, or regional systems connect your household to volcanic hazards, then plan for evacuation or ashfall.',
    canonical: 'https://cascadia.me/volcano.html',
    schemaType: 'WebPage'
  },
  {
    path: 'wildfire.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'place',
    footerItem: 'wildfire',
    skip: guideSkip,
    title: 'Wildfire Preparedness in Cascadia | Cascadia.me',
    description: 'An illustrated, place-based Cascadian guide to wildfire: leave with time, read official information clearly, prepare for smoke, and reduce household ignition pathways.',
    canonical: 'https://cascadia.me/wildfire.html',
    schemaType: 'WebPage'
  },
  {
    path: 'winter-storm.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'place',
    footerItem: 'winter',
    skip: guideSkip,
    title: 'Winter Storm Preparedness in Cascadia | Cascadia.me',
    description: 'An illustrated, place-based Cascadian guide to winter storms and outages: keep warmth safe, protect essential power, read local conditions, and help neighbors without entering danger.',
    canonical: 'https://cascadia.me/winter-storm.html',
    schemaType: 'WebPage'
  },
  {
    path: 'water.html',
    family: 'capability',
    styleFamily: 'capability',
    navSection: 'keep-life',
    footerItem: 'keep-life',
    skip: mainSkip,
    title: 'Keep Water Available During an Interruption | Cascadia.me',
    description: 'Start with the water your household can store, lift, reach, and safely use, then build toward longer interruptions and shared or public options.',
    canonical: 'https://cascadia.me/water.html',
    schemaType: 'WebPage'
  }
];

const styleFamilyAssets = Object.freeze({
  surface: ['surface'],
  guide: ['guide'],
  home: ['home'],
  capability: ['capability'],
  'field-tool': ['fieldTool'],
  atlas: ['atlasStyle'],
  signals: ['maplibreStyle', 'signalsStyle']
});

const pageAssetOverrides = Object.freeze({
  'after-an-event.html': { styles: ['mission'] },
  'amendments.html': { styles: ['mission'] },
  'approach.html': { styles: ['approachPhase7'] },
  'atlas.html': { scripts: ['atlasScript'] },
  'building.html': { styles: ['mission'] },
  'constitution.html': { styles: ['mission'] },
  'corrections.html': { styles: ['mission'] },
  'event-inserts.html': { styles: ['mission'] },
  'earthquake.html': { styles: ['primaryGuides', 'earthquake'] },
  'faq.html': { styles: ['faq'] },
  'flooding.html': { styles: ['primaryGuides'] },
  'first-moves.html': { styles: ['mission'] },
  'guides.html': { styles: ['guidesPhase7'] },
  'household-workbook.html': { styles: ['kit'], scripts: ['workbookScript'] },
  'index.html': { styles: ['mission'] },
  'keep-life-going.html': { styles: ['mission'] },
  'neighborhood-inventory.html': { styles: ['mission'] },
  'people-nearby.html': { styles: ['mission'] },
  'place.html': { styles: ['mission'] },
  'recovery.html': { styles: ['mission'] },
  'review-policy.html': { styles: ['mission'] },
  'signals/index.html': {
    scripts: ['maplibreScript', 'signalsAuthority', 'signalsProvince', 'signalsForecast', 'signalsApp']
  },
  'stories/index.html': { styles: ['fieldStories'], scripts: ['storyShelfScript'] },
  'volcano.html': { styles: ['primaryGuides', 'volcano'] },
  'wildfire.html': { styles: ['primaryGuides'] },
  'winter-storm.html': { styles: ['primaryGuides'] }
});

function assetsForPage(page) {
  const overrides = pageAssetOverrides[page.path] || {};
  const styles = [
    ...(styleFamilyAssets[page.styleFamily] || []),
    ...(overrides.styles || []),
    ...(page.family === 'story' ? ['fieldStories'] : [])
  ];
  const scripts = [
    ...(overrides.scripts || []),
    ...(page.family === 'story' ? ['storyScript'] : [])
  ];
  return Object.freeze({
    styles: Object.freeze(styles),
    scripts: Object.freeze(scripts)
  });
}

export const sitePages = Object.freeze(pageDefinitions.map((definition) => Object.freeze({
  ...definition,
  assets: assetsForPage(definition)
})));

export const sitePageByPath = new Map(sitePages.map((page) => [page.path, page]));

export function getSitePage(relativePath) {
  const page = sitePageByPath.get(relativePath);
  if (!page) throw new Error(`Page is missing from scripts/site-pages.mjs: ${relativePath}`);
  return page;
}
