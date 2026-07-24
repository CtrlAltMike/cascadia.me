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

export const sitePages = Object.freeze([
  {
    path: '404.html',
    family: 'not-found',
    styleFamily: 'surface',
    navSection: null,
    footerItem: null,
    skip: mainSkip,
    title: 'Page not found | Cascadia.me',
    description: 'This Cascadia.me page was not found. Return to the guides, household workbook, Atlas, Signals, or Field Stories.',
    canonical: 'https://cascadia.me/404.html',
    schemaType: null
  },
  {
    path: 'approach.html',
    family: 'about',
    styleFamily: 'surface',
    navSection: null,
    footerItem: 'approach',
    skip: mainSkip,
    title: 'About Cascadia.me: Why It Exists and How the Work Is Checked',
    description: 'Why Cascadia.me exists, how the work is checked, what its maps can and cannot tell you, and when to follow local instructions.',
    canonical: 'https://cascadia.me/approach.html',
    schemaType: 'AboutPage'
  },
  {
    path: 'atlas.html',
    family: 'instrument',
    styleFamily: 'atlas',
    navSection: 'atlas',
    footerItem: 'atlas',
    skip: {
      className: 'atlas-skip-link',
      href: '#main-content',
      text: 'Skip to the Atlas'
    },
    title: 'Regional Hazard Atlas | Cascadia.me',
    description: 'Read current official conditions, observed and forecast wind, and historical and planning layers together across Cascadia.',
    canonical: 'https://cascadia.me/atlas.html',
    schemaType: 'WebPage'
  },
  {
    path: 'build-your-kit.html',
    family: 'workbook',
    styleFamily: 'guide',
    navSection: 'kit',
    footerItem: 'kit',
    skip: guideSkip,
    title: 'Build Your Kit: A Household Workbook | Cascadia.me',
    description: 'A public, printable household preparedness workbook for Cascadia: map daily needs, make home systems more resilient, plan how to leave and reconnect, and test one ordinary interruption at a time.',
    canonical: 'https://cascadia.me/build-your-kit.html',
    schemaType: 'WebPage'
  },
  {
    path: 'earthquake.html',
    family: 'guide',
    styleFamily: 'guide',
    navSection: 'guides',
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
    navSection: 'guides',
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
    navSection: 'guides',
    footerItem: null,
    skip: mainSkip,
    title: 'Cascadia Guides | Cascadia.me',
    description: 'An illustrated table of contents for Cascadia.me’s place-based guides to earthquakes, wildfire, flooding, winter storms, and volcanoes.',
    canonical: 'https://cascadia.me/guides.html',
    schemaType: 'CollectionPage'
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
    title: 'Pacific Northwest Preparedness & Live Hazard Atlas | Cascadia.me',
    description: 'An illustrated, place-based guide to earthquakes, wildfire, flooding, winter storms, and volcanoes in the Cascadia bioregion, with a live regional hazard Atlas.',
    canonical: 'https://cascadia.me/',
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
    title: 'Cascadia Signals | Official Alerts & Emergency Services Directory',
    description: 'Find place-aware official alert systems, emergency management agencies, transportation updates, hazard information, and support resources across Washington, Oregon, and British Columbia.',
    canonical: 'https://cascadia.me/signals/',
    schemaType: null
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
    navSection: 'guides',
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
    navSection: 'guides',
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
    navSection: 'guides',
    footerItem: 'winter',
    skip: guideSkip,
    title: 'Winter Storm Preparedness in Cascadia | Cascadia.me',
    description: 'An illustrated, place-based Cascadian guide to winter storms and outages: keep warmth safe, protect essential power, read local conditions, and help neighbors without entering danger.',
    canonical: 'https://cascadia.me/winter-storm.html',
    schemaType: 'WebPage'
  }
]);

export const sitePageByPath = new Map(sitePages.map((page) => [page.path, page]));

export function getSitePage(relativePath) {
  const page = sitePageByPath.get(relativePath);
  if (!page) throw new Error(`Page is missing from scripts/site-pages.mjs: ${relativePath}`);
  return page;
}
