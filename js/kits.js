/* ============================================================
   PREP.SUPPLY — Kit Supply Data & Rendering
   DIY kit-building data, no commerce. What you need, why, where.
   Owner: Limn
   ============================================================ */

(function() {
  'use strict';

  // === Supply Data ===
  // Each kit is organized by threat type and household size.
  // No prices — this is about empowering people to build their own.

  const KITS = {

    // ─── EARTHQUAKE ───
    earthquake: {
      id: 'earthquake',
      name: 'Earthquake Kit',
      description: 'What to have ready when the ground moves. Sized for the reality that municipal water, power, and roads may be out for days — especially west of the Cascades.',
      guides: ['earthquake'],
      tiers: {
        essential: {
          label: 'Essentials',
          forHousehold: '1–2 people',
          note: 'The minimum. If you do nothing else, do this.',
          supplies: [
            { item: 'Water', quantity: '6 gallons (1 gal/person/day × 3 days)', why: 'Municipal water runs through pipes in fill soil that liquefies in a quake. Expect days without tap water.', where: 'Fill from your own tap into clean food-grade containers. Or buy gallon jugs at any grocery store.', priority: 'critical' },
            { item: 'First aid kit', quantity: '1 comprehensive kit', why: 'ERs will be overwhelmed. You need to handle cuts, sprains, and minor injuries yourself for the first 24–72 hours.', where: 'Pharmacy or outdoor store. Look for one rated for 2+ people. Add any personal medications.', priority: 'critical' },
            { item: 'Flashlight + extra batteries', quantity: '1 per person', why: 'Power will be out. Your phone flashlight drains the battery you need for communication.', where: 'Hardware store. Headlamps are better — hands free. Avoid candles (gas leak risk after a quake).', priority: 'critical' },
            { item: 'Portable radio (battery or hand-crank)', quantity: '1', why: 'Cell towers may be down. AM/FM radio is how emergency broadcasts reach you.', where: 'Hardware store or online. Hand-crank models don\'t need batteries. NOAA weather band is a plus.', priority: 'critical' },
            { item: 'Phone charger + backup battery', quantity: '1 charger set + 1 power bank', why: 'Even when cell service is spotty, your phone is still your map, flashlight, contact list, and camera for damage documentation. A dead phone is a preventable problem.', where: 'Keep a wall charger, car charger, and a charged power bank with the kit. Recharge the power bank every few months.', priority: 'important' },
            { item: 'Whistle', quantity: '1 per person', why: 'If you\'re trapped, your voice gives out. A whistle carries and costs you almost no energy.', where: 'Any sporting goods or outdoor store. Attach one to each person\'s go-bag.', priority: 'critical' },
            { item: 'Non-perishable food', quantity: '3 days\' worth per person', why: 'Stores may be closed or inaccessible. Roads buckle. Supply chains stop.', where: 'Grocery store. Canned goods, dried fruit, nut butter, crackers, granola bars. Things you\'d actually eat.', priority: 'critical' },
            { item: 'Manual can openers', quantity: '2', why: 'Canned food is useless without one. Electric openers need power. Two is one, one is none — if your only opener breaks, your canned food becomes dead weight.', where: 'Kitchen supply or grocery store. Test both before they go in the kit. They\'re cheap; there\'s no reason not to have a spare.', priority: 'important' },
            { item: 'Wrench or pliers', quantity: '1', why: 'To shut off gas and water valves. Know where your shut-offs are before you need them.', where: 'Hardware store. A 12" adjustable wrench fits most residential gas valves.', priority: 'important' },
            { item: 'Dust masks', quantity: '2–4', why: 'Collapsed buildings throw dust, insulation, asbestos. Protect your lungs.', where: 'Hardware store. N95 or better.', priority: 'important' },
            { item: 'Plastic sheeting and duct tape', quantity: '1 roll each', why: 'Seal broken windows. Create a dry shelter. Improvise repairs.', where: 'Hardware store.', priority: 'important' },
            { item: 'Copies of important documents', quantity: '1 set in waterproof bag', why: 'If your house is damaged, you\'ll need IDs, insurance info, and emergency contacts. Digital copies on a USB drive too.', where: 'Photocopy or scan at home. Store in a zip-lock bag inside your kit.', priority: 'important' },
            { item: 'Water filtration', quantity: '1 filter or purification tablets', why: 'If stored water runs out, you\'ll need to source from lakes, streams, or rainwater — all potentially contaminated after a quake. Filtration turns available water into safe water.', where: 'Outdoor store. A pump filter (like Sawyer or LifeStraw) handles bacteria and protozoa. Purification tablets (iodine or chlorine dioxide) are lighter and cheaper. In a pinch, clear plastic bottles filled with water and left in direct sun for 6+ hours will kill most pathogens (SODIS method).', priority: 'important' },
            { item: 'Cash in small bills', quantity: '$100–200 in $5s, $10s, and $20s', why: 'ATMs and card readers need power and network. Cash works when nothing else does. Keep bills small — if all you have is $20s, everything you buy will cost you $20 because nobody is making change.', where: 'Your bank. Mix of $5s, $10s, and $20s. Store in a waterproof bag in your kit.', priority: 'important' },
            { item: 'Local maps', quantity: '1 regional map set', why: 'Road closures, bridge damage, and dead phones make navigation harder after a quake. Paper maps give you a fallback when screens and cell service fail.', where: 'AAA, bookstore, gas station, or printed map packets from home. Mark hospitals, meeting points, and likely routes out of your neighborhood.', priority: 'recommended' },
            { item: 'Work gloves', quantity: '1 pair per person', why: 'Broken glass, splintered wood, debris. Your hands are your most important tools.', where: 'Hardware store. Leather or heavy-duty synthetic.', priority: 'recommended' },
            { item: 'Warm layers and rain gear', quantity: '1 set per person', why: 'If you\'re outside after a quake — checking on neighbors, waiting for aftershocks to stop, sheltering in the yard — you need warmth. PNW weather doesn\'t pause for emergencies. Wool or synthetic layers, not cotton. A rain shell. Warm hat and gloves.', where: 'Your own closet or an outdoor store. Pack layers: base layer (wool or synthetic), insulating layer (fleece or down), waterproof shell. Cotton is useless when wet — and in the PNW, it will be wet.', priority: 'important' },
            { item: 'Sturdy shoes near your bed', quantity: '1 pair per person', why: 'Earthquakes happen at night. Broken glass covers every floor. You need shoes before you take a step.', where: 'Keep an old pair of hard-soled shoes under your bed or nightstand. Not slippers.', priority: 'recommended' }
          ]
        },
        complete: {
          label: 'Complete Kit',
          forHousehold: '3–5 people (family)',
          note: 'Everything above, plus comfort, communication, and enough supply depth for a larger household and longer outage.',
          supplies: [
            { item: 'Water', quantity: '15–25 gallons', why: 'For a family of 4–5, three days of water adds up fast. A gallon per person per day is the minimum — more if it\'s summer or you have young children.', where: 'Fill your own containers (camping jugs work well) or buy. A WaterBOB bathtub liner lets you store 100 gallons when you see a warning coming.', priority: 'critical' },
            { item: 'Prescription medications', quantity: '7-day supply, rotated', why: 'Pharmacies may be closed for a week. If someone in your household depends on daily medication, this is non-negotiable.', where: 'Ask your doctor for an emergency prescription. Many insurance plans cover a 90-day supply.', priority: 'critical' },
            { item: 'Infant/child supplies', quantity: 'As needed', why: 'Formula, diapers, wipes, comfort items. Children\'s needs don\'t pause for emergencies.', where: 'Keep a 5-day rotation of whatever your child needs. Store with the kit.', priority: 'critical' },
            { item: 'Pet food, water, medications, and carrier', quantity: '5-day supply if applicable', why: 'If you have pets, they are part of the household plan. Food, water, medications, waste supplies, and a way to transport them need to be packed before the shaking starts.', where: 'Keep a pet tote or bin with food, bowls, leash, carrier, medications, litter or waste bags, and a copy of vaccination records.', priority: 'important' },
            { item: 'Sleeping bags or warm blankets', quantity: '1 per person', why: 'No power means no heat. PNW nights get cold even in summer. If you need to shelter outside, warmth is survival.', where: 'Outdoor store or your own closet. Compact sleeping bags rated to 30°F work well.', priority: 'important' },
            { item: 'Clothing: full layering system per person', quantity: '1 set', why: 'If you evacuate, shelter outside, or your home loses heat, proper clothing is survival gear. The PNW is wet and cool even in summer. Hypothermia starts at surprisingly mild temperatures when you\'re wet, tired, and stressed.', where: 'Pack from your own closet: wool or synthetic base layer, fleece or down insulating layer, waterproof shell (jacket + pants), warm hat, gloves, extra socks (wool). No cotton. Rain gear is non-negotiable in the Pacific Northwest.', priority: 'important' },
            { item: 'Sanitation supplies', quantity: '1 kit', why: 'Toilets need water pressure. Without it, you need an alternative. Garbage bags, bucket, hand sanitizer, toilet paper.', where: 'Hardware store and grocery store. A 5-gallon bucket with a snap-on toilet seat lid costs about $20.', priority: 'important' },
            { item: 'Fire extinguisher', quantity: '1 (ABC type)', why: 'Gas leaks + sparks = fire risk. After a quake, small fires can become big ones when fire departments are overwhelmed.', where: 'Hardware store. Mount it in the kitchen or near the kit. Learn to use it before you need to.', priority: 'important' },
            { item: 'Family communication plan', quantity: '1 written plan, copies for everyone', why: 'Cell networks will be jammed or down entirely. Agree on meeting points, out-of-area contacts, and a plan for when you can\'t reach each other. Text messages often get through when voice calls don\'t — they use less bandwidth. Designate an out-of-area contact as a message relay (someone far enough away that their network isn\'t affected).', where: 'Sit down as a household and write it. Two meeting points — one near home, one farther out. One out-of-area contact everyone memorizes. Print a copy for each person\'s kit and post one on the fridge.', priority: 'critical' },
            { item: 'Books, games, comfort items', quantity: 'A few', why: 'Waiting is the hardest part, especially with children. Boredom and stress make everything worse. A deck of cards weighs nothing.', where: 'Your own shelves. Pack a favorite book, a deck of cards, coloring supplies for kids.', priority: 'recommended' }
          ]
        }
      }
    },

    // ─── WILDFIRE ───
    wildfire: {
      id: 'wildfire',
      name: 'Wildfire Evacuation Kit',
      description: 'When wildfire threatens, you may have minutes to leave. This kit lives by your door or in your vehicle — ready to grab.',
      guides: ['wildfire'],
      tiers: {
        essential: {
          label: 'Go-Bag Essentials',
          forHousehold: '1–2 people',
          note: 'This is a grab-and-go bag. It lives packed, by the door or in the car. You don\'t assemble it when the smoke appears.',
          supplies: [
            { item: 'N95 masks', quantity: '2–4', why: 'Wildfire smoke is particulate matter. It damages lungs fast, especially for children, elderly, and anyone with respiratory conditions.', where: 'Hardware store or pharmacy. N95 or P100. Not surgical masks — those don\'t filter smoke particles.', priority: 'critical' },
            { item: 'Important documents', quantity: '1 waterproof pouch', why: 'If your house burns, you need: insurance policy, IDs, passport, birth certificates, property deed, medication list. Originals or copies.', where: 'Photocopy everything. Put in a zip-lock inside a waterproof pouch. Also keep digital copies on a USB drive and in cloud storage.', priority: 'critical' },
            { item: 'Medications', quantity: '72-hour supply', why: 'You may not be able to return home or reach a pharmacy for days during an evacuation.', where: 'Keep a 3-day rotation in your go-bag. Set a phone reminder to refresh monthly.', priority: 'critical' },
            { item: 'Water', quantity: '1 gallon per person', why: 'Evacuation routes may be long. Shelters may be overwhelmed. Have water in the car.', where: 'Store sealed bottles in your vehicle. Replace every 6 months.', priority: 'critical' },
            { item: 'Phone charger (car + portable battery)', quantity: '1 each', why: 'Your phone is your lifeline — emergency alerts, evacuation maps, contact with family. Keep it charged.', where: 'Keep a car charger in the glovebox and a charged power bank in the go-bag.', priority: 'critical' },
            { item: 'Evacuation routes + alert setup', quantity: '1 printed route plan + phone alerts enabled', why: 'Wildfires move fast. You need primary and alternate routes, a destination, and more than one way to receive evacuation warnings before smoke is in your driveway.', where: 'Mark routes on a paper map. Save an out-of-area destination. Turn on county alerts, WEA, and FEMA app notifications before fire season.', priority: 'critical' },
            { item: 'Compact first aid kit', quantity: '1', why: 'Cuts, burns, and minor injuries are common during hurried evacuations and smoky roadside stops. You need basics with you, not back at home.', where: 'Pharmacy or outdoor store. A compact kit that fits in a go-bag is enough.', priority: 'important' },
            { item: 'Cash', quantity: '$200 in small bills', why: 'Power outages mean no card readers. Gas stations, motels, and stores along evacuation routes may be cash-only.', where: 'Bank. Small bills. Keep in the go-bag.', priority: 'important' },
            { item: 'Vehicle fuel plan', quantity: 'Keep tank at least half full in fire season', why: 'Evacuation orders often come with traffic, smoke, and closed stations. You do not want to be the person hunting for gas while everyone else is leaving town.', where: 'Treat half a tank as empty during wildfire season. Top off immediately when red-flag warnings or heavy smoke arrive.', priority: 'important' },
            { item: 'Flashlight or headlamp', quantity: '1 per person', why: 'You may leave at night, through smoke, or into a dark parking lot or shelter. A headlamp keeps your hands free for children, pets, and bags.', where: 'Hardware store or outdoor store. Pack spare batteries or choose a rechargeable model you already keep charged.', priority: 'important' },
            { item: 'Change of clothes (long layers)', quantity: '1 set per person', why: 'Smoke permeates everything. Clean clothes matter for your lungs and your sanity in a shelter. Long sleeves and long pants protect skin from ash and radiant heat during evacuation.', where: 'Pack from your closet. Long sleeves, long pants, closed-toe shoes. Include a warm layer — evacuation shelters can be cold, and you may be sleeping in your car.', priority: 'important' },
            { item: 'Toiletries', quantity: 'Travel-size basics', why: 'You may be in a shelter or motel for days. Basic hygiene maintains morale and health.', where: 'Drug store. Toothbrush, toothpaste, soap, deodorant. Compact.', priority: 'recommended' },
            { item: 'Photos and irreplaceable items', quantity: 'Pre-identified', why: 'You can\'t grab photo albums in nine minutes. Rosa and James learned this. Know what matters most, where it is, and what you\'ll take if you have 5 extra minutes. Scan and back up photos now — before fire season.', where: 'Walk through your house today. Identify 3 irreplaceable items. Know where they are. Keep digital backups of photos in cloud storage. What you can\'t digitize, move closer to the door.', priority: 'important' }
          ]
        },
        complete: {
          label: 'Extended Evacuation Kit',
          forHousehold: '3–5 people (family)',
          note: 'The go-bag plus enough to sustain your family if evacuation lasts a week or more.',
          supplies: [
            { item: 'All go-bag essentials above', quantity: 'Scaled for family', why: 'Start with the essentials. Then add depth.', where: 'See above.', priority: 'critical' },
            { item: 'Pet supplies', quantity: '3-day supply', why: 'Shelters may not accept pets. You may need to kennel or shelter separately. Food, leash, carrier, vaccination records.', where: 'Keep a pet go-bag next to yours. Include a photo of you with your pet for identification.', priority: 'critical' },
            { item: 'Cooler with ice packs', quantity: '1', why: 'For medications that need refrigeration, infant formula, or perishable food during a long drive.', where: 'Keep a small hard cooler and freeze-able ice packs ready. Throw in fridge items as you leave.', priority: 'important' },
            { item: 'Road maps (paper)', quantity: '1 state/regional', why: 'Cell service may be spotty on evacuation routes. GPS fails when towers are down or overwhelmed. Know your routes on paper.', where: 'Gas station, bookstore, or AAA. Mark your primary and alternate evacuation routes now.', priority: 'important' },
            { item: 'Children\'s comfort items', quantity: 'A few', why: 'A stuffed animal, a book, a game. Evacuation is terrifying for kids. Something familiar helps.', where: 'Let your child pick one comfort item for the go-bag. Rotate it if they grow attached to something new.', priority: 'recommended' }
          ]
        }
      }
    },

    // ─── WINTER STORM ───
    'winter-storm': {
      id: 'winter-storm',
      name: 'Winter Storm Kit',
      description: 'Power outages. Downed trees. Roads that don\'t get plowed for days. This kit is for riding it out at home when the grid goes down and nobody\'s coming to fix it quickly.',
      guides: ['winter-storm'],
      tiers: {
        essential: {
          label: 'Power Outage Essentials',
          forHousehold: '1–2 people',
          note: 'For when the power goes out and stays out. Assumes you\'re sheltering in place — not evacuating.',
          supplies: [
            { item: 'Heat source (non-electric)', quantity: '1', why: 'Electric heat stops when the power does. A woodstove, propane heater, or kerosene heater keeps one room livable. Without backup heat, indoor temperatures drop to outdoor temperatures within 12–18 hours in an uninsulated space.', where: 'If you have a woodstove, keep 2+ cords of dry wood split and covered. Propane heaters (indoor-rated only) are available at hardware stores. Never use outdoor propane or charcoal heaters inside — carbon monoxide kills.', priority: 'critical' },
            { item: 'Water', quantity: '6 gallons', why: 'If you\'re on a well with an electric pump, no power means no water. Municipal systems usually keep pressure during storms, but rural and island communities are vulnerable.', where: 'Fill containers from your own tap before storm season. A hand-pump well backup is the gold standard if you\'re rural.', priority: 'critical' },
            { item: 'Prescription medications', quantity: '7-day supply, rotated', why: 'Roads may be iced over and pharmacies may be closed for days. If someone in your home needs daily medication, you need the refill before the outage starts.', where: 'Ask your doctor and insurer about emergency refills or 90-day fills. Rotate the supply so it stays current.', priority: 'critical' },
            { item: 'Flashlights, headlamps, lanterns', quantity: '2–3 sources + batteries', why: 'PNW winter means dark by 4:30 PM. A multiday outage in December means 15+ hours of darkness per day.', where: 'Hardware store. LED lanterns last longest. Battery-powered, not candle — fire risk increases when people are using candles for days.', priority: 'critical' },
            { item: 'Non-perishable food (no-cook or camp-stove)', quantity: '5 days\' worth', why: 'Winter storms can isolate rural areas for 5+ days. If roads are blocked by trees and your driveway is impassable, you eat what you have.', where: 'Grocery store. Canned soups, peanut butter, crackers, dried fruit, jerky, oatmeal. If you have a camp stove or woodstove, you can cook — otherwise, plan for no-cook foods.', priority: 'critical' },
            { item: 'Manual can opener', quantity: '1', why: 'A lot of practical storm food comes in cans. If the power is out, the electric opener is decoration.', where: 'Kitchen aisle or grocery store. Test it before winter and keep a spare if you rely heavily on canned soup or chili.', priority: 'important' },
            { item: 'Battery or hand-crank radio', quantity: '1', why: 'Cell towers have battery backup for 4–8 hours. After that, radio is your connection to the outside.', where: 'Hardware store. NOAA weather band capability is important for storm tracking.', priority: 'critical' },
            { item: 'First aid kit', quantity: '1 comprehensive kit', why: 'Icy falls, chainsaw nicks, and minor burns happen when people are cold, tired, and improvising. Handle the routine injuries yourself so you don\'t have to drive icy roads for small problems.', where: 'Pharmacy or outdoor store. Make sure it includes bandages, gauze, pain relief, and blister care.', priority: 'important' },
            { item: 'Warm clothing layers + sleeping bags', quantity: '1 full set per person', why: 'Clothing is your first line of defense when the heat goes out. Layer wool or synthetic — never cotton, which loses all insulation when damp. Base layer (wool or synthetic long underwear), insulating layer (fleece, wool sweater, or down jacket), warm socks, hat, gloves. Sleeping bags rated to 20°F or lower for overnight when the house is in the 30s.', where: 'Outdoor store or your own closet. Wool is the PNW standard — warm when wet. Check sleeping bag ratings honestly: a 40°F bag in a 35°F house is a cold, miserable night.', priority: 'critical' },
            { item: 'Camp stove or cooking alternative', quantity: '1 + fuel', why: 'Hot food and hot drinks are morale. A camp stove lets you cook, boil water, and make coffee. That matters on day three.', where: 'Outdoor store. Propane camp stoves are simplest. Keep 2–3 fuel canisters. Use outdoors or with ventilation only.', priority: 'important' },
            { item: 'Chainsaw or bow saw', quantity: '1', why: 'Trees fall on driveways, roads, and power lines. If you\'re rural, nobody is clearing your road for days. You clear it yourself.', where: 'Hardware store. A bow saw is cheaper and doesn\'t need fuel. Know how to use whatever you buy before you need it.', priority: 'important' },
            { item: 'Ice melt / sand / kitty litter', quantity: '1–2 bags', why: 'Traction on walkways, porches, and the driveway keeps small slips from becoming big injuries when everything is frozen over.', where: 'Hardware store or feed store. Store it where you can reach it before the storm, not behind the mower in the shed.', priority: 'important' },
            { item: 'Pipe insulation / heat tape', quantity: 'As needed', why: 'Frozen pipes burst. A burst pipe in a house without power means water damage you can\'t stop. Insulate exposed pipes before winter.', where: 'Hardware store. Foam pipe insulation is cheap and easy to install. Heat tape needs power, so it\'s preventative, not emergency.', priority: 'recommended' },
            { item: 'Books, games, charged devices', quantity: 'A few', why: 'A five-day outage with nothing to do is its own kind of emergency. Especially with kids. Charge devices before the storm hits.', where: 'Your own shelves. A deck of cards, a cribbage board, a few good books. These matter more than you think.', priority: 'recommended' }
          ]
        },
        complete: {
          label: 'Extended Outage Kit',
          forHousehold: '3–5 people (family) or rural/island',
          note: 'For households that routinely face multiday outages. Goes beyond essentials into self-sufficiency.',
          supplies: [
            { item: 'Generator (portable)', quantity: '1 + fuel', why: 'A generator won\'t heat your house, but it\'ll run the well pump, charge devices, and keep the fridge alive. Prioritize critical circuits.', where: 'Hardware store. Size it for your critical loads (well pump is usually the biggest draw). Store fuel safely — not in the garage, not near heat sources. Run it outdoors only.', priority: 'important' },
            { item: 'Carbon monoxide detector (battery)', quantity: '1–2', why: 'Generators, propane heaters, and woodstoves all produce CO. Every winter, people die from CO poisoning during outages because they bring combustion indoors without ventilation.', where: 'Hardware store. Battery-operated. Test monthly. This is not optional if you\'re running any combustion heat source.', priority: 'critical' },
            { item: 'Smoke alarms with fresh batteries', quantity: '1 per level', why: 'Power outages push people toward candles, stoves, generators, and backup heat. That raises fire risk at exactly the moment firefighters are stretched thin.', where: 'Test existing alarms before winter and replace batteries annually. Install one on each level and outside sleeping areas if you do not already have them.', priority: 'important' },
            { item: 'Extra fuel (properly stored)', quantity: '10–20 gallons', why: 'Gas stations need power to pump. In a widespread outage, fuel runs out fast. Store what you\'ll need.', where: 'Fill approved gas cans before storm season. Store in a ventilated area away from the house. Rotate fuel every 6 months.', priority: 'important' },
            { item: 'Pet food, water, and cold-weather supplies', quantity: '5-day supply if applicable', why: 'Pets are just as stuck as you are when roads close. Food, medications, leashes, carriers, and bedding should already be gathered before the lights go out.', where: 'Pack a pet tote now. Include medications, bowls, leash, carrier, waste bags or litter, and an extra blanket.', priority: 'important' },
            { item: 'Neighbor check-in plan', quantity: '1 written list', why: 'Nora checked on Bill on day two. If she hadn\'t, his house was 41 degrees and dropping. Know who lives alone near you. Agree to check on each other.', where: 'Walk over and talk to your neighbors. Before winter. Exchange phone numbers. Agree on a check-in protocol. This costs nothing and saves lives.', priority: 'important' },
            { item: 'Vehicle emergency kit', quantity: '1 per vehicle: chains, jumper cables, ice scraper, blanket, snacks, water, charger, map, traction sand', why: 'If you have to drive in storm conditions, a stuck car becomes a survival problem fast. The car kit is what keeps a delay from becoming a rescue.', where: 'Build it before winter. Keep the gas tank as full as you can, store the kit in the trunk, and practice putting chains on in dry daylight.', priority: 'important' }
          ]
        }
      }
    },

    // ─── FLOODING ───
    flooding: {
      id: 'flooding',
      name: 'Flood Preparedness Kit',
      description: 'River flooding gives you hours of warning, not minutes. This kit is about using that time well — protecting what you can, moving what matters, and being ready to leave.',
      guides: ['flooding'],
      tiers: {
        essential: {
          label: 'Flood Essentials',
          forHousehold: '1–2 people',
          note: 'The basics for evacuation plus protecting your home when water is rising.',
          supplies: [
            { item: 'Waterproof bins (pre-packed)', quantity: '2–4 bins', why: 'Everything irreplaceable goes in sealed bins: documents, photos, hard drives, keepsakes. Pack them now. When the gauge hits flood stage, you move them to the truck and go.', where: 'Hardware store. Heavy-duty plastic bins with locking lids. Label them.', priority: 'critical' },
            { item: 'Flood insurance', quantity: '1 policy', why: 'Homeowner\'s insurance does not cover flood damage. NFIP or private flood insurance does. 30-day waiting period — buy before you need it.', where: 'Your insurance agent, or floodsmart.gov for NFIP.', priority: 'critical' },
            { item: 'Shutdown card (laminated)', quantity: '1', why: 'Taped to your breaker panel. Sequence: unplug, water off, gas off, breakers off. Under stress, you follow the card.', where: 'Write it yourself. Laminate at an office supply store.', priority: 'critical' },
            { item: 'USGS gauge bookmarked', quantity: '1 bookmark', why: 'The gauge for your nearest river tells you exactly when to act. Learn your flood stage number. Check it when heavy rain starts.', where: 'waterdata.usgs.gov — find the gauge closest to your property.', priority: 'critical' },
            { item: 'Evacuation routes + pet plan', quantity: '1 written household plan', why: 'Floods are safer when you leave early. Everyone in the house should know where you will go, how you will get there, and what happens with pets if the water rises overnight.', where: 'Practice the route before flood season. Pick a destination on higher ground and decide who handles pets, bins, medications, and shutoffs.', priority: 'critical' },
            { item: 'Rubber boots and waterproof gloves', quantity: '1 pair each per person', why: 'Floodwater is contaminated — sewage, chemicals, debris. Essential for re-entry and cleanup.', where: 'Hardware store. Knee-high rubber boots. Heavy-duty waterproof gloves.', priority: 'important' },
            { item: 'Pet carrier + pet supplies', quantity: '3-day supply if applicable', why: 'Many shelters and motels will not let you improvise pet care on the spot. A leash, carrier, food, water, and records let you leave early instead of scrambling for your animal at the last minute.', where: 'Use a dedicated pet go-bag with carrier, bowls, food, medications, leash, waste supplies, and a photo of you with your pet.', priority: 'important' },
            { item: 'NOAA weather radio or local alerts', quantity: '1 radio or phone alert setup', why: 'River gauges matter, but so do warnings, road closures, and evacuation orders. You need a backup source if power or cell service gets shaky.', where: 'Set up county alerts and keep a battery or hand-crank weather radio ready.', priority: 'important' },
            { item: 'Go-bag', quantity: '1 per person', why: 'Clothes for 3 days, medications, chargers, cash, toiletries. You may be evacuated for days. Same concept as the wildfire go-bag.', where: 'Assemble yourself. Keep it accessible.', priority: 'important' },
            { item: 'Water', quantity: '1 gallon per person per day for 3 days', why: 'Floods often cut power, contaminate water, and close stores. Even if you leave, having your own water makes shelters, motels, and traffic delays easier to handle.', where: 'Store sealed water jugs or bottles in an easy-to-load spot. Rotate them twice a year.', priority: 'important' },
            { item: 'Non-perishable food', quantity: '3 days\' worth per person', why: 'When roads are closed and businesses shut down, shelf-stable food buys you time and lets you leave without depending on the next open store.', where: 'Grocery store. Ready-to-eat food is best: bars, crackers, canned meals, nut butter, dried fruit.', priority: 'important' },
            { item: 'Cash in small bills', quantity: '$200 in $5s, $10s, $20s', why: 'Power outages along evacuation routes mean no card readers. Gas, food, and lodging may be cash-only.', where: 'Bank. Small bills — if all you have is $20s, everything costs $20.', priority: 'important' },
            { item: 'Cleaning and disinfecting supplies', quantity: '1 cleanup kit', why: 'Floodwater is filthy and cleanup starts fast. Gloves alone are not enough; you need bleach or disinfectant, buckets, sponges, and paper towels ready before the water recedes.', where: 'Hardware store or grocery store. Build a tote with disinfectant, bleach, scrub brush, sponges, paper towels, and heavy-duty trash bags.', priority: 'important' },
            { item: 'Sandbags', quantity: '20–40', why: 'Buy inches, not feet. Useful for diverting shallow water from doorways. Know their limits.', where: 'Many counties distribute free sand and bags before flood events. Check with your county EM office.', priority: 'recommended' }
          ]
        },
        complete: {
          label: 'Flood-Ready Household',
          forHousehold: '3–5 people (family)',
          note: 'Everything above plus documentation, recovery supplies, and the lesson every flood survivor learns: you can replace things, not memories.',
          supplies: [
            { item: 'Property documentation video', quantity: '1 walkthrough, updated annually', why: 'Film every room. Open drawers and closets. This is your insurance claim if the house floods. Before and after.', where: 'Your phone. Store in cloud AND on a portable drive in your go-bag.', priority: 'critical' },
            { item: 'Sump pump (portable)', quantity: '1', why: 'Gets water out of your basement faster than gravity. Battery-backup or generator-powered.', where: 'Hardware store. Size for your space. Test before you need it.', priority: 'important' },
            { item: 'Dehumidifier and box fans', quantity: '1 dehumidifier + 2–3 fans', why: 'Mold starts within 48 hours. Drying the house fast after the water recedes is critical.', where: 'Hardware store. If power is out, running a dehumidifier on a generator is a smart use of fuel.', priority: 'important' },
            { item: 'Contractor-grade garbage bags', quantity: '1 box', why: 'Everything below the water line that absorbed floodwater comes out: carpet, drywall, insulation. You need heavy bags.', where: 'Hardware store.', priority: 'important' },
            { item: 'N95 or P100 masks', quantity: 'Several per person', why: 'Mold, dust, and demolition debris show up quickly during flood cleanup. A mask is cheap insurance for your lungs.', where: 'Hardware store. Keep them sealed and dry until cleanup day.', priority: 'important' },
            { item: 'Pry bar and utility knife', quantity: '1 each', why: 'For removing waterlogged drywall, baseboards, and carpet. The faster you strip wet materials, the less mold.', where: 'Hardware store.', priority: 'recommended' },
            { item: 'Neighbor contact list', quantity: '1 written list', why: 'Tom warned the Ortegas at 5 AM. They had four hours they wouldn\'t have had. Know who lives near you, especially anyone new to the floodplain.', where: 'Walk over and introduce yourself. Before flood season.', priority: 'recommended' }
          ]
        }
      }
    }
  };

  // === Rendering Functions ===

  /**
   * Render a complete kit section with tier tabs and supply lists
   */
  function renderKit(kitId, containerId) {
    const kit = KITS[kitId];
    if (!kit) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const tiers = Object.entries(kit.tiers);
    let html = '';

    tiers.forEach(([tierId, tier], index) => {
      html += `
        <div class="kit-tier ${index === 0 ? 'active' : ''}" data-tier="${tierId}">
          <div class="kit-tier-header">
            <h3>${tier.label}</h3>
            <p class="text-muted text-sm">For ${tier.forHousehold}</p>
            <p class="kit-tier-note">${tier.note}</p>
          </div>
          <ol class="supply-list">
            ${tier.supplies.map(s => renderSupplyItem(s)).join('')}
          </ol>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Render a single supply item
   */
  function renderSupplyItem(supply) {
    return `
      <li class="supply-item">
        <span class="supply-priority ${supply.priority}">${supply.priority}</span>
        <div class="supply-details">
          <h5>${supply.item}</h5>
          <p class="supply-quantity"><strong>${supply.quantity}</strong></p>
          <p class="supply-why">${supply.why}</p>
          <p class="supply-where"><strong>Where to get it:</strong> ${supply.where}</p>
        </div>
      </li>
    `;
  }

  /**
   * Render the inline supply preview in a guide's supplies section
   * Shows only critical items with a link to the full kit page
   */
  function renderGuideSupplyPreview(kitId, containerId) {
    const kit = KITS[kitId];
    if (!kit) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // Get critical items from the essential tier
    const essentials = kit.tiers.essential;
    const criticalItems = essentials.supplies.filter(s => s.priority === 'critical');

    let html = `
      <p class="text-muted" style="margin-bottom: var(--space-4);">
        The critical items for your ${kit.name.toLowerCase()}. For the full list with sourcing details,
        see <a href="build-your-kit.html#${kitId}">Build Your Kit</a>.
      </p>
      <ol class="supply-list supply-list-preview">
        ${criticalItems.map(s => `
          <li class="supply-item">
            <span class="supply-priority critical">critical</span>
            <div class="supply-details">
              <h5>${s.item}</h5>
              <p class="supply-quantity"><strong>${s.quantity}</strong></p>
              <p class="supply-why">${s.why}</p>
            </div>
          </li>
        `).join('')}
      </ol>
      <div style="margin-top: var(--space-4);">
        <a href="build-your-kit.html#${kitId}" class="btn btn-outline">See the full list + where to find everything</a>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Print a kit as a clean checklist
   */
  function printKit(kitId) {
    const kit = KITS[kitId];
    if (!kit) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let allSupplies = '';
    Object.values(kit.tiers).forEach(tier => {
      allSupplies += `<h2 style="margin-top:2em;font-family:Bitter,Georgia,serif;">${tier.label} <span style="font-weight:normal;font-size:0.7em;color:#6b5e4f;">(${tier.forHousehold})</span></h2>`;
      allSupplies += '<table style="width:100%;border-collapse:collapse;margin-top:0.5em;">';
      allSupplies += '<tr style="border-bottom:2px solid #3d3a36;text-align:left;"><th style="padding:0.5em 0;">Item</th><th>Quantity</th><th>Priority</th><th style="width:20px;"></th></tr>';
      tier.supplies.forEach(s => {
        allSupplies += `<tr style="border-bottom:1px solid #e8e4de;">
          <td style="padding:0.5em 0.5em 0.5em 0;">${s.item}</td>
          <td style="padding:0.5em;font-size:0.9em;">${s.quantity}</td>
          <td style="padding:0.5em;font-size:0.85em;text-transform:uppercase;">${s.priority}</td>
          <td style="padding:0.5em;text-align:center;">&#9744;</td>
        </tr>`;
      });
      allSupplies += '</table>';
    });

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${kit.name} — Checklist</title>
      <style>
        body { font-family: Inter, -apple-system, sans-serif; font-size: 11pt; color: #3d3a36; max-width: 8in; margin: 0 auto; padding: 0.5in; }
        h1 { font-family: Bitter, Georgia, serif; font-size: 1.5em; margin-bottom: 0.25em; }
        .subtitle { color: #6b5e4f; margin-bottom: 1em; }
        .print-note { margin-top: 2em; padding-top: 0.75em; border-top: 1px solid #e8e4de; font-size: 0.8em; color: #6b5e4f; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>${kit.name}</h1>
      <p class="subtitle">${kit.description}</p>
      ${allSupplies}
      <p class="print-note">
        Your local emergency management office is the best source for area-specific guidance.
        Use this checklist as a supplemental starting point, not a substitute for local instructions.
      </p>
      <p class="print-note" style="margin-top:0.75em;">
        cascadia.me — Pacific Northwest Preparedness Guide
      </p>
      </body></html>`);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  /**
   * Print a family communication plan template
   */
  function printFamilyPlan() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Family Communication Plan — cascadia.me</title>
      <style>
        body { font-family: Inter, -apple-system, sans-serif; font-size: 11pt; color: #3d3a36; max-width: 8in; margin: 0 auto; padding: 0.5in; }
        h1 { font-family: Bitter, Georgia, serif; font-size: 1.5em; margin-bottom: 0.25em; }
        h2 { font-family: Bitter, Georgia, serif; font-size: 1.2em; margin-top: 1.5em; margin-bottom: 0.5em; }
        .subtitle { color: #6b5e4f; margin-bottom: 1.5em; }
        .field { border-bottom: 1px solid #6b5e4f; min-width: 200px; display: inline-block; margin: 0.25em 0; padding: 0.25em 0; }
        .field-wide { border-bottom: 1px solid #6b5e4f; display: block; margin: 0.5em 0; padding: 0.25em 0; min-height: 1.5em; }
        .row { margin: 0.75em 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 0.5em; }
        td, th { padding: 0.5em; border-bottom: 1px solid #e8e4de; text-align: left; }
        th { font-weight: 600; border-bottom: 2px solid #3d3a36; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>Family Communication Plan</h1>
      <p class="subtitle">Fill this out together. Print copies for each household member and keep one in your emergency kit.</p>

      <h2>Household members</h2>
      <table>
        <tr><th>Name</th><th>Phone</th><th>Usual location (weekday)</th></tr>
        <tr><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
      </table>

      <h2>Meeting points</h2>
      <div class="row"><strong>Near home:</strong> <span class="field-wide"></span></div>
      <div class="row"><strong>Farther away (if home is unsafe):</strong> <span class="field-wide"></span></div>

      <h2>Out-of-area contact (message relay)</h2>
      <p style="font-size:0.9em;color:#6b5e4f;">Someone far enough away that their network isn't affected. Everyone in the household should memorize this number.</p>
      <div class="row"><strong>Name:</strong> <span class="field">&nbsp;</span> <strong>Phone:</strong> <span class="field">&nbsp;</span></div>
      <div class="row"><strong>Relationship:</strong> <span class="field">&nbsp;</span></div>

      <h2>Important numbers</h2>
      <table>
        <tr><th>Contact</th><th>Number</th></tr>
        <tr><td>Doctor / pediatrician</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td>School / childcare</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td>Veterinarian</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td>Insurance company</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td>Gas/electric utility</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td>Nearest hospital</td><td><span class="field">&nbsp;</span></td></tr>
        <tr><td><span class="field">&nbsp;</span></td><td><span class="field">&nbsp;</span></td></tr>
      </table>

      <h2>Notes</h2>
      <p style="font-size:0.9em;color:#6b5e4f;">Special needs, medications, pet info, gas shutoff location, anything else everyone should know:</p>
      <div class="field-wide" style="min-height:4em;"></div>

      <p style="margin-top:2em;font-size:0.8em;color:#6b5e4f;border-top:1px solid #e8e4de;padding-top:0.5em;">
        cascadia.me — Pacific Northwest Preparedness Guide
      </p>
      </body></html>`);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  // === Expose API ===
  window.kits = {
    data: KITS,
    render: renderKit,
    renderPreview: renderGuideSupplyPreview,
    print: printKit,
    printFamilyPlan: printFamilyPlan
  };

})();
