/**
 * Malevolent Shrine Register
 * Plain JavaScript frontend for Cloudflare Pages.
 *
 * Required Cloudflare backend routes:
 *   POST /api/login
 *   GET  /api/orders
 *   POST /api/orders
 *   POST /api/fulfill
 *   POST /api/discord
 */

const API = Object.freeze({
  login: "/api/login",
  orders: "/api/orders",
  fulfill: "/api/fulfill",
  discord: "/api/discord",
});

const EMPLOYEE_BADGE_KEY =
  "malevolent_shrine_employee_badge";

const CATALOG_RAW = [
  [
    "explosives",
    "💣",
    "EXPLOSIVES",
    [
      ["Claymore", 10940],
      ["EGD-5 Frag Grenade", 2740],
      ["6-M7 Frag Grenade", 2740],
      ["Landmine", 2740],
      ["IED (Plastic + Dets)", 13680],
      ["Plastic Explosive", 13680],
      ["Po-X Vial", 2740],
      ["40mm Po-X Grenade", 5470],
      ["40mm Explosive Grenade", 5470],
      ["M79 Grenade Launcher", 17100],
    ],
  ],
  [
    "snipers",
    "🎯",
    "SNIPERS / DMRs",
    [
      ["VS-89", 13680],
      ["VSD (Wood)", 13680],
      ["VSD (Black)", 13680],
      ["VSD (Polymer)", 13680],
      ["DMR", 13680],
      ["CR-550 Savanna", 13680],
      ["CR-527 (Wood)", 10260],
      ["CR-527 (Black)", 10260],
      ["CR-527 (Green)", 10260],
      ["M70 Tundra (Wood)", 13680],
      ["M70 Tundra (Black)", 13680],
      ["M70 Tundra (Green)", 13680],
      ["Blaze", 13680],
      ["Mosin 91/30 (Green)", 10260],
      ["Mosin 91/30 (Black)", 10260],
      ["Mosin 91/30 (Wood)", 10260],
      ["SK 59/66 (Green)", 10260],
      ["SK 59/66 (Black)", 10260],
      ["SK 59/66 (Wood)", 10260],
    ],
  ],
  [
    "assault",
    "🔫",
    "ASSAULT RIFLES",
    [
      ["AUR AX", 10260],
      ["M4-A1 (Green)", 10260],
      ["M4-A1 (Black)", 10260],
      ["M16-A2", 10260],
      ["LAR", 10260],
      ["SVAL", 10260],
      ["VSS", 10260],
      ["KA-M", 10260],
      ["KA-101 (Green)", 10260],
      ["KA-101 (Black)", 10260],
      ["KA-74 (Green)", 10260],
      ["KA-74 (Black)", 10260],
      ["KAS-74U", 10260],
      ["SCR-17 (Tan)", 15,000],
      ["SCR-17 (Black)", 15,000],
    ],
  ],
  [
    "smg",
    "🔫",
    "SMGs / SHOTGUNS",
    [
      ["Bizon", 6840],
      ["Vikhr", 6840],
      ["R12 Shotgun", 6840],
      ["Vaiga + 20RD Drum", 6840],
    ],
  ],
  [
    "handguns",
    "🔫",
    "HANDGUNS",
    [
      ["Engraved Kolt 1911", 3430],
      ["Mk2", 3430],
      ["Pink Derringer (.357)", 3430],
      ["Revolver (.357)", 3430],
      ["Mlock-91", 3430],
      ["Deagle (Gold)", 3430],
      ["Deagle (Silver)", 3430],
      ["P1", 3430],
      ["CR-75", 3430],
      ["FX-45", 3430],
    ],
  ],
  [
    "misc_weapons",
    "🏹",
    "MISC WEAPONS",
    [
      ["Crossbow (Green Camo)", 313],
      ["Crossbow (Brown Camo)", 313],
      ["Crossbow (Black)", 313],
      ["Crossbow (Wood)", 313],
    ],
  ],
  [
    "melee",
    "🔪",
    "MELEE",
    [
      ["Kitchen Knife", 156],
      ["Hunting Knife", 156],
      ["Combat Knife", 156],
      ["Machete (Crude)", 156],
      ["Machete (Oriental)", 156],
      ["Kukri", 156],
      ["M4A1 Bayonet", 156],
      ["KA Bayonet", 156],
      ["SK 59/66 Bayonet", 156],
      ["Mosin Bayonet", 156],
      ["Fange", 156],
      ["Baseball Bat (Barbed)", 156],
      ["Baseball Bat (Nailed)", 156],
      ["Baseball Bat (Tactical)", 156],
      ["Baseball Bat (Festive)", 156],
      ["Hockey Stick", 156],
      ["Baton", 500],
      ["Mace", 156],
      ["Brass Knuckles (Men at Arms)", 3,000],
    ],
  ],
  [
    "optics",
    "🔭",
    "OPTICS",
    [
      ["Combat Sight", 1370],
      ["Mini Sight", 1370],
      ["Baraka Sight", 1370],
      ["Kobra / RVN Sight", 1370],
      ["Handgun Scope", 1370],
      ["PU Scope", 1370],
      ["ACOG 4x32", 1370],
      ["ACOG 6x48", 1370],
      ["PSO-1-1 Scope", 1370],
      ["PO4x34 Scope", 1370],
      ["NV-PVS4 Scope", 1370],
      ["1PN51 Scope", 1370],
      ["Marksman Scope", 1370],
      ["Hunting Scope", 1370],
      ["Long Range Scope", 1370],
      ["Holo Sight (Tan)", 3,500],
      ["Holo Sight (Black)", 3,500],
    ],
  ],
  [
    "attachments",
    "🛠️",
    "ATTACHMENTS",
    [
      ["Universal Flashlight", 156],
      ["Plastic Bottle Suppressor", 1370],
      ["Pistol Suppressor", 1370],
      ["Standardized Suppressor", 1370],
      ["Normalized Suppressor", 1370],
      ["Mosin Compensator", 1370],
      ["KA Wooden Handguard", 1370],
      ["KA Rail Handguard", 1370],
      ["M4-A1 Rail Handguard", 1370],
      ["KA Buttstock (Wood)", 1370],
      ["KA Buttstock (Polymer)", 1370],
      ["LAR Buttstock (Lightweight)", 1370],
      ["LAR Buttstock (Polymer)", 1370],
      ["M4 Buttstock (CQB)", 1370],
      ["M4 Buttstock (MP)", 1370],
      ["SCR Buttstock", 2,500], 
      ["SCR Precision Buttstock", 3,500],
    ],
  ],
  [
    "ammo",
    "💥",
    "AMMO / MAGAZINES",
    [
      [".308 Win Rounds", 1370],
      [".357 Rounds", 1370],
      ["Bolt", 79],
      ["5RD CR-527 Mag", 2740],
      ["5RD SSG82 Mag", 2740],
      ["9RD Deagle Mag", 2740],
      ["10RD VS-89 Mag", 2740],
      ["10RD VSD Mag", 2740],
      ["10RD VSS Mag", 2740],
      ["10RD CR-550 Mag", 2740],
      ["15RD FX-45 Mag", 2740],
      ["15RD CR-75 Mag", 2740],
      ["15RD MLOCK-91 Mag", 2740],
      ["20RD DMR Mag", 2740],
      ["20RD LAR Mag", 2740],
      ["30RD VIKHR Mag", 2740],
      ["45RD KA-74 Mag", 2740],
      ["KA-101 Mag (Green)", 2740],
      ["KA-101 Mag (Black)", 2740],
      ["60RD Coupled Mag", 2740],
      ["64RD Bizon Mag", 2740],
      ["75RD KA-M Drum Mag", 2740],
      ["Vaiga Mag", 2740],
      ["Standard Magazines", 2740],
      ["Drum Magazines", 2740],
      ["20RD SCR-17 Magazine", 3,500],
    ],
  ],
  [
    "medical",
    "🩹",
    "MEDICAL & SURVIVAL",
    [
      ["Bandage", 220],
      ["Duct Tape", 391],
      ["Sewing Kit", 781],
      ["Leather Sewing Kit", 781],
      ["Multi-Vitamins", 440],
      ["IV Saline Bag", 760],
      ["Charcoal Tablets", 220],
      ["Chlorine Tablets", 220],
      ["Tetracycline Pills", 440],
      ["Codeine Pills", 1090],
      ["Morphine Auto-Injector", 1090],
      ["Po-X Antidote", 760],
      ["Full Medical Treatment", 20000],
    ],
  ],
  [
    "food",
    "🍖",
    "FOOD / WATER",
    [
      ["Canned Bacon", 79],
      ["Powdered Milk", 563],
      ["Rice", 563],
      ["Cereal", 86],
      ["Candy Cane", 79],
      ["Canteen", 925],
      ["Glass Bottle", 63],
      ["Plastic Bottle", 63],
      ["Filtering Bottle", 313],
      ["Water Refill", 0],
    ],
  ],
  [
    "grill",
    "🥩",
    "GRILL / TIKI",
    [
      ["Steak", 313],
      ["Shrimp", 625],
      ["Fish", 469],
      ["Peppers", 125],
      ["Mushrooms (Food)", 125],
      ["Coconut Vodka", 375],
      ["Beer", 250],
      ["Soda", 125],
    ],
  ],
  [
    "special",
    "🌿",
    "SPECIAL ITEMS",
    [
      ["Weed", 141],
      ["Weed Seeds", 156],
      ["Mushrooms (Drug)", 125],
      ["Cocaine", 563],
    ],
  ],
  [
    "farming",
    "🌱",
    "FARMING SUPPLIES",
    [
      ["Tomato Seeds", 100],
      ["Zucchini Seeds", 100],
      ["Pepper Seeds", 100],
      ["Pumpkin Seeds", 100],
      ["Disinfectant Spray", 100],
      ["Hoe", 781],
      ["Garden Lime", 790],
    ],
  ],
  [
    "building",
    "🏕️",
    "BUILDING / TENTS",
    [
      ["Car Tent", 2344],
      ["Large Tent", 2344],
      ["Medium Tent", 1563],
      ["Flag", 3125],
      ["Armband", 781],
    ],
  ],
  [
    "storage",
    "📦",
    "STORAGE",
    [
      ["Sea Chest", 2344],
      ["Wooden Crate", 313],
      ["Barrel", 1563],
    ],
  ],
  [
    "tools",
    "⚒️",
    "TOOLS & SUPPLIES",
    [
      ["Shovel", 781],
      ["Stones (32)", 2344],
      ["Hatchet", 781],
      ["Sledgehammer", 1563],
      ["Pickaxe", 781],
      ["Pliers", 391],
      ["Hacksaw", 781],
      ["Handsaw", 781],
      ["Nails (Box)", 235],
      ["Sharpening Stone", 156],
      ["Metal Wire", 469],
      ["Barbed Wire", 781],
      ["Rope", 156],
      ["3-Dial Lock", 781],
      ["4-Dial Lock", 1563],
      ["Chainsaw", 781],
      ["Generator", 313],
      ["Generator Accessories", 1563],
    ],
  ],
  [
    "wood",
    "🪵",
    "WOOD & SHEET METAL",
    [
      ["Sheet Metal (Stack)", 7813],
      ["Logs (per log)", 313],
      ["Planks (Stack)", 781],
      [
        "Full Truck Load (Truck Not Included)",
        23438,
      ],
      [
        "Full Truck w/ Sheet Metal (Truck Not Included)",
        31250,
      ],
    ],
  ],
  [
    "headgear",
    "🎩",
    "HEADGEAR",
    [
      ["Bandana", 925],
      ["Baseball Cap", 925],
      ["Beanie", 925],
      ["Beret", 925],
      ["Boonie Hat", 925],
      ["Budenovka", 925],
      ["Cowboy Hat", 925],
      ["Fox Headdress", 1840],
      ["Bear Headdress", 2200],
      ["Military Cap (BDU)", 2,500],
      ["Military Cap (Desert)", 2,500],
      ["Morozka", 925],
      ["NBC Hood", 2200],
      ["Santa Hat", 925],
      ["Shemagh", 925],
      ["Sherpa Hat", 925],
      ["Snowstorm Ushanka", 1840],
      ["Witch Hood", 925],
      ["Leaf Crown", 925],
      ["Zmiovka", 925],
      ["Flat Cap", 925],
    ],
  ],
  [
    "helmets",
    "⛑️",
    "HELMETS",
    [
      ["Assault Helmet", 2200],
      ["Ballistic Helmet", 2200],
      ["Camouflage Helmet", 2200],
      ["Enduro Helmet", 1840],
      ["Flight Helmet", 2200],
      ["Motorbike Helmet", 1840],
      ["Tactical Helmet", 2200],
      ["Welder Helmet", 925],
      ["Assault Helmet Visor", 925],
      ["Enduro Helmet Mouthpiece", 925],
      ["Enduro Helmet Visor", 925],
      ["T65 Helmet (Olive)", 4,000],
      ["T65 Helmet (Tan)", 4,000],
    ],
  ],
  [
    "face",
    "🎭",
    "FACE COVERINGS",
    [
      ["Ski Mask", 925],
      ["Balaclava", 925],
      ["Gas Mask", 2200],
      ["NBC Respirator", 2200],
      ["Combat Gas Mask", 2200],
      ["Carnival Mask", 925],
      ["Mime Mask", 925],
      ["Payday Masks", 925],
      ["Santa Beard", 925],
    ],
  ],
  [
    "eyewear",
    "🕶️",
    "EYEWEAR",
    [
      ["Aviator Sunglasses", 925],
      ["Casual Sunglasses", 925],
      ["Classic Glasses", 925],
      ["Head Torch", 925],
      ["NVG Headstrap", 2200],
      ["Slim Glasses", 925],
      ["Tactical Goggles", 1840],
      ["Ski Goggles", 925],
      ["Night Vision Goggles (NVG)", 2200],
    ],
  ],
  [
    "tops",
    "🧥",
    "TOPS / JACKETS",
    [
      ["Field Jacket", 2200],
      ["Leather Jacket", 2200],
      ["Down Jacket", 2200],
      ["Hiking Jacket", 2200],
      ["Heavy Labor Coat", 1840],
      ["Pilot Jacket", 2200],
      ["Hunting Jacket", 2200],
      ["BDU Jacket", 2200],
      ["Combat Jacket", 2200],
      ["Bushlat Jacket", 2200],
      ["Bomber Jacket", 2200],
      ["Patrol Jacket", 2200],
      ["Firefighter Jacket", 2200],
      ["Raincoat", 1840],
      ["NBC Jacket", 2200],
      ["CUU Jacket", 2200],
      ["Hoodie", 1840],
      ["Mens Suit Jacket", 1840],
      ["Navy Uniform Jacket", 2200],
      ["OMK Jacket", 2200],
      ["Paramedic Jacket", 2200],
      ["Quilted Jacket", 2200],
      ["Shirt", 1840],
      ["Sweater", 1840],
      ["T-Shirt", 1840],
      ["Tactical Shirt", 1840],
      ["Telnyashka", 1840],
      ["Lab Coat", 1840],
      ["Tracksuit Jacket", 1840],
      ["Women's Suit Jacket", 1840],
      ["Military Sweater", 2200],
      ["Military Winter Coat", 2940],
    ],
  ],
  [
    "gloves",
    "🧤",
    "GLOVES",
    [
      ["Ski Gloves", 925],
      ["NBC Gloves", 2200],
      ["Combat Gloves", 2200],
      ["Fingerless Gloves", 925],
      ["Padded Gloves", 925],
      ["Tactical Gloves", 2200],
      ["Wool Gloves", 925],
    ],
  ],
  [
    "vests",
    "🦺",
    "VESTS & ARMOR",
    [
      ["Assault Vest", 2200],
      ["Ballistic Vest", 2940],
      ["Chest Holster", 925],
      ["Chestplate", 7330],
      ["Field Vest", 2200],
      ["Plate Carrier", 7330],
      ["Plate Carrier (Desert)", 10,000],
      ["Stab Vest", 1840],
      ["Tactical Vest", 2200],
      ["Hunter Vest", 2200],
      ["Utility Buttpack", 925],
      ["Holster", 925],
      ["Pouches", 925],
    ],
  ],
  [
    "ghillie",
    "🌿",
    "GHILLIE GEAR",
    [
      ["Ghillie Hood", 925],
      ["Ghillie Suit", 4380],
      ["Ghillie Shrug", 925],
      ["Ghillie Cloak", 925],
      ["Ghillie Rifle Wrap", 925],
    ],
  ],
  [
    "belts",
    "👜",
    "BELTS & ACCESSORIES",
    [
      ["Hip Pack", 1840],
      ["Tactical Belt", 1840],
      ["Canteen (Belt)", 925],
      ["Sheath", 925],
    ],
  ],
  [
    "pants",
    "👖",
    "PANTS / LEGWEAR",
    [
      ["Hunter Pants", 2200],
      ["Leather Pants", 2200],
      ["NBC Pants", 2200],
      ["Patrol Pants", 2200],
      ["Paramedic Pants", 2200],
      ["Firefighter Pants", 2200],
      ["BDU Pants", 2200],
      ["Capri Pants", 1840],
      ["Cargo Pants", 2200],
      ["Combat Pants", 2200],
      ["CUU Pants", 2200],
      ["Denim Shorts", 1840],
      ["Denim Skirt", 1840],
      ["Jeans", 1840],
      ["Navy Uniform Pants", 2200],
      ["OMK Pants", 2200],
      ["Suit Pants", 1840],
      ["Tracksuit Pants", 1840],
    ],
  ],
  [
    "footwear",
    "👟",
    "FOOTWEAR",
    [
      ["NBC Boots", 2200],
      ["Wellies", 1840],
      ["Hiking Boots", 1840],
      ["Assault Boots", 2200],
      ["Athletic Shoes", 1840],
      ["Dress Shoes", 1840],
      ["Flat Shoes", 1840],
      ["Hunter Boots", 2200],
      ["Jungle Boots", 2200],
      ["Running Shoes", 1840],
      ["Sneakers", 1840],
      ["Trail Shoes", 1840],
      ["Working Boots", 1840],
      ["Military Winter Boots", 2200],
      ["Fur Boots", 2200],
    ],
  ],
  [
    "backpacks",
    "🎒",
    "BACKPACKS & BAGS",
    [
      ["Combat Backpack", 2200],
      ["Assault Backpack", 2200],
      ["Drybag Backpack", 1840],
      ["Hunter Backpack", 2200],
      ["Army Pouch", 1840],
      ["Long Haul Backpack", 2200],
      ["Field Backpack", 2200],
      ["Hiking Backpack", 2200],
      ["Leather Duffle Bag", 1840],
      ["Mountain Backpack", 2200],
      ["Tactical Backpack", 2200],
      ["Combat Backpack (Desert)", 4000],
    ],
  ],
  [
    "vehicles",
    "🚘",
    "VEHICLES",
    [
      ["Cargo Truck", 24000],
      ["Humvee", 16000],
      ["Olga", 12000],
      ["ADA", 12000],
      ["Gunter", 14000],
      ["Sarka", 12000],
      ["Truck / Humvee Tire", 1563],
      ["Car Tire", 781],
      ["Truck / Humvee Door or Hood", 1563],
      ["Car Door or Hood", 781],
      ["Truck Battery", 781],
      ["Car Battery", 781],
      ["All Vehicle Radiators", 781],
      ["Spark Plug", 391],
      ["Vehicle Tools", 156],
      ["Tire Repair Kit", 313],
      ["Blow Torch", 781],
    ],
  ],
  [
    "misc",
    "🧰",
    "MISC ITEMS",
    [
      ["Egg", 9375],
      ["Binoculars", 156],
      ["Lock Pick", 156],
      ["Rangefinder", 156],
      ["Handcuffs", 156],
      ["Burlap Sack", 79],
      ["Map", 156],
      ["Compass", 156],
      ["Fishing Rod", 235],
      ["Radio", 156],
      ["Field Radio", 156],
      ["Batteries", 125],
      ["Lighter", 63],
      ["Teddy Bear", 250],
      ["Pots", 100],
      ["Frying Pan", 100],
    ],
  ],
  [
    "services",
    "💀",
    "SPECIAL SERVICES",
    [
      ["Ashley Fistfight", 1000],
      ["Ashley Leg Break", 5000],
      ["Ashley Unconscious", 10000],
      ["Kidnap", 50000],
      ["Murder", 100000],
    ],
  ],
];

const CATEGORIES = CATALOG_RAW.map(
  ([id, icon, label, rawItems]) => ({
    id,
    icon,
    label,
    items: rawItems.map(([name, price]) => ({
      name,
      price,
    })),
  }),
);

const PRICE_BY_NAME = Object.fromEntries(
  CATEGORIES.flatMap((category) =>
    category.items.map((item) => [
      item.name,
      item.price,
    ]),
  ),
);

const EMPLOYEE_COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#e91e63",
];

const savedEmployeeBadge =
  sessionStorage.getItem(EMPLOYEE_BADGE_KEY) || "";

const state = {
  mode: savedEmployeeBadge
    ? "employee"
    : "customer",

  employeeBadge: savedEmployeeBadge,

  screen: savedEmployeeBadge
    ? "orders"
    : "browse",

  orders: {},
  cart: {},
  activeCategory: CATEGORIES[0]?.id || "",
  search: "",
  customerName: "",
  site:"",
  notes: "",
  submitStatus: null,
  selectedOrderId: null,
  fulfillTarget: null,
  fulfillQuantity: 1,
  loginError: "",
  loadingOrders: false,
};

const root = document.getElementById("root");

if (!root) {
  throw new Error(
    'Missing <div id="root"></div> in index.html.',
  );
}

injectStyles();
render();
startOrderPolling();
function injectStyles() {
  const style = document.createElement("style");

  style.textContent = `
    @import url("https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Share+Tech+Mono&display=swap");

    :root {
      color-scheme: dark;
      font-family: "Share Tech Mono", monospace;
      background: #0a0a0a;
      color: #c8b89a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html,
    body,
    #root {
      min-height: 100%;
    }

    body {
      background:
        radial-gradient(
          circle at top,
          rgba(100, 0, 0, 0.12),
          transparent 38%
        ),
        #0a0a0a;
      color: #c8b89a;
      overflow-x: hidden;
    }

    button,
    input,
    textarea,
    select {
      font: inherit;
    }

    button {
      -webkit-tap-highlight-color: transparent;
    }

    button,
    input,
    textarea {
      border-radius: 0;
    }

    ::selection {
      background: #8b0000;
      color: #ffffff;
    }

    ::-webkit-scrollbar {
      width: 5px;
      height: 5px;
    }

    ::-webkit-scrollbar-track {
      background: #111111;
    }

    ::-webkit-scrollbar-thumb {
      background: #8b0000;
    }

    .app {
      min-height: 100vh;
      background: transparent;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding: 10px 14px;
      background: rgba(13, 13, 13, 0.97);
      border-bottom: 1px solid #222222;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
    }

    .brand-wrap {
      min-width: 155px;
    }

    .brand {
      color: #cc2200;
      font-family: "Oswald", sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 3px;
      line-height: 1;
    }

    .brand-subtitle {
      margin-top: 5px;
      color: #555555;
      font-size: 8px;
      letter-spacing: 2px;
    }

    .badge-line {
      margin-top: 4px;
      color: #777777;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .nav {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      flex-wrap: wrap;
    }

    .divider {
      width: 1px;
      height: 17px;
      margin: 0 2px;
      background: #2a2a2a;
    }

    .tab {
      padding: 8px 10px;
      color: #5b5b5b;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-family: "Oswald", sans-serif;
      font-size: 11px;
      letter-spacing: 1px;
      white-space: nowrap;
      cursor: pointer;
      transition:
        color 0.12s ease,
        border-color 0.12s ease,
        background 0.12s ease;
    }

    .tab:hover {
      color: #aaaaaa;
      background: #111111;
    }

    .tab.on {
      color: #ff5555;
      border-bottom-color: #8b0000;
    }

    .count-pill {
      display: inline-block;
      min-width: 18px;
      margin-left: 4px;
      padding: 1px 5px;
      color: #ffffff;
      background: #8b0000;
      border-radius: 2px;
      text-align: center;
      font-size: 9px;
    }

    .inp {
      width: 100%;
      padding: 11px 12px;
      color: #d1c2a8;
      background: #101010;
      border: 1px solid #292929;
      outline: none;
      resize: vertical;
      font-family: "Share Tech Mono", monospace;
      font-size: 12px;
      transition:
        border-color 0.12s ease,
        background 0.12s ease;
    }

    .inp:hover {
      border-color: #3a3a3a;
    }

    .inp:focus {
      background: #121212;
      border-color: #8b0000;
      box-shadow: 0 0 0 1px rgba(139, 0, 0, 0.25);
    }

    .inp::placeholder {
      color: #3b3b3b;
    }

    textarea.inp {
      min-height: 85px;
      line-height: 1.5;
    }

    .lbl {
      display: block;
      margin-bottom: 6px;
      color: #666666;
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .red-btn,
    .ghost-btn,
    .danger-btn,
    .ctrl-btn,
    .cat-btn,
    .item-btn {
      cursor: pointer;
      transition:
        background 0.12s ease,
        border-color 0.12s ease,
        color 0.12s ease,
        opacity 0.12s ease,
        transform 0.08s ease;
    }

    .red-btn:active,
    .ghost-btn:active,
    .danger-btn:active,
    .ctrl-btn:active,
    .cat-btn:active,
    .item-btn:active {
      transform: scale(0.98);
    }

    .red-btn {
      padding: 11px 16px;
      color: #ffffff;
      background: #8b0000;
      border: 1px solid #a40000;
      font-family: "Oswald", sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .red-btn:hover:not(:disabled) {
      background: #aa0000;
      border-color: #cc2200;
    }

    .red-btn:disabled {
      opacity: 0.35;
      cursor: default;
    }

    .ghost-btn {
      padding: 8px 12px;
      color: #666666;
      background: #0d0d0d;
      border: 1px solid #292929;
      font-family: "Oswald", sans-serif;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .ghost-btn:hover:not(:disabled) {
      color: #bbbbbb;
      background: #151515;
      border-color: #555555;
    }

    .ghost-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .danger-btn {
      padding: 8px 12px;
      color: #ff5555;
      background: #160000;
      border: 1px solid #590000;
      font-family: "Oswald", sans-serif;
      font-size: 11px;
      letter-spacing: 1px;
    }

    .danger-btn:hover:not(:disabled) {
      color: #ffffff;
      background: #8b0000;
      border-color: #bb0000;
    }

    .ctrl-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex: 0 0 28px;
      color: #c8b89a;
      background: #171717;
      border: 1px solid #343434;
      font-size: 14px;
      line-height: 1;
    }

    .ctrl-btn:hover:not(:disabled) {
      color: #ffffff;
      background: #8b0000;
      border-color: #8b0000;
    }

    .ctrl-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .card {
      margin-bottom: 10px;
      padding: 14px;
      background: rgba(13, 13, 13, 0.95);
      border: 1px solid #202020;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.18);
      transition: border-color 0.12s ease;
    }

    .card:hover {
      border-color: #303030;
    }

    .notice-error {
      margin-bottom: 12px;
      padding: 10px 12px;
      color: #ff5555;
      background: #150000;
      border: 1px solid #750000;
      font-size: 11px;
      line-height: 1.45;
    }

    .notice-success {
      margin-bottom: 12px;
      padding: 10px 12px;
      color: #42dc7b;
      background: #001608;
      border: 1px solid #175f31;
      font-size: 11px;
      line-height: 1.45;
    }

    .notice-info {
      margin-bottom: 12px;
      padding: 10px 12px;
      color: #c8b89a;
      background: #101010;
      border: 1px solid #333333;
      font-size: 11px;
      line-height: 1.45;
    }

    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 18px;
      background:
        radial-gradient(
          circle at center,
          rgba(139, 0, 0, 0.15),
          transparent 48%
        ),
        #080808;
    }

    .login-card {
      width: 100%;
      max-width: 340px;
      padding: 24px;
      background: rgba(10, 10, 10, 0.97);
      border: 1px solid #292929;
      box-shadow:
        0 0 40px rgba(0, 0, 0, 0.75),
        0 0 30px rgba(139, 0, 0, 0.08);
    }

    .login-icon {
      margin-bottom: 8px;
      text-align: center;
      font-size: 38px;
      filter: drop-shadow(0 0 9px rgba(180, 0, 0, 0.35));
    }

    .login-title {
      margin-bottom: 5px;
      color: #cc2200;
      text-align: center;
      font-family: "Oswald", sans-serif;
      font-size: 23px;
      font-weight: 700;
      letter-spacing: 3px;
    }

    .login-subtitle {
      margin-bottom: 28px;
      color: #4d4d4d;
      text-align: center;
      font-size: 10px;
      letter-spacing: 2px;
    }

    .login-actions {
      display: grid;
      gap: 8px;
      margin-top: 18px;
    }

    .browse-layout {
      flex: 1;
      min-height: 0;
      display: flex;
      overflow: hidden;
    }

    .category-panel {
      width: 150px;
      flex: 0 0 150px;
      overflow-y: auto;
      padding: 5px 0 16px;
      background: rgba(12, 12, 12, 0.96);
      border-right: 1px solid #1e1e1e;
    }

    .cat-btn {
      width: 100%;
      padding: 7px 10px 7px 12px;
      color: #5d5d5d;
      background: none;
      border: none;
      border-left: 2px solid transparent;
      text-align: left;
      font-size: 10px;
      line-height: 1.5;
    }

    .cat-btn:hover {
      color: #c8b89a;
      background: #111111;
      border-left-color: #4a4a4a;
    }

    .cat-btn.active {
      color: #ff5555;
      background: #130b0b;
      border-left-color: #8b0000;
    }

    .category-label {
      display: block;
    }

    .category-total {
      display: block;
      margin-top: 1px;
      color: #8b0000;
      font-size: 8px;
    }

    .items-panel {
      flex: 1;
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .search-wrap {
      padding: 9px 10px;
      background: rgba(10, 10, 10, 0.96);
      border-bottom: 1px solid #1e1e1e;
    }

    .item-grid {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns:
        repeat(auto-fill, minmax(190px, 1fr));
      gap: 4px;
      align-content: start;
      padding: 9px;
    }

    .search-group {
      grid-column: 1 / -1;
      margin-top: 8px;
    }

    .search-group:first-child {
      margin-top: 0;
    }

    .search-group-title {
      margin-bottom: 5px;
      padding-bottom: 4px;
      color: #555555;
      border-bottom: 1px solid #202020;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .search-group-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fill, minmax(190px, 1fr));
      gap: 4px;
    }

    .item-btn {
      position: relative;
      width: 100%;
      min-height: 39px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
      padding: 8px 10px;
      color: #c8b89a;
      background: #111111;
      border: 1px solid #292929;
      text-align: left;
      font-size: 11px;
      overflow: hidden;
    }

    .item-btn:hover {
      color: #ffffff;
      background: #191919;
      border-color: #8b0000;
    }

    .item-btn.in-cart {
      color: #ff7070;
      background: #1b0c0c;
      border-color: #8b0000;
    }

    .item-btn.in-cart::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 3px;
      background: #8b0000;
    }

    .item-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-price {
      flex-shrink: 0;
      color: #666666;
      font-size: 10px;
      white-space: nowrap;
    }

    .item-btn:hover .item-price,
    .item-btn.in-cart .item-price {
      color: #b98585;
    }

    .qty-badge {
      display: inline-block;
      min-width: 21px;
      padding: 2px 5px;
      color: #ffffff;
      background: #8b0000;
      border-radius: 2px;
      text-align: center;
      font-size: 10px;
    }

    .bottom-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      background: rgba(13, 13, 13, 0.98);
      border-top: 1px solid #8b0000;
      box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.3);
    }

    .bottom-total-label {
      color: #555555;
      font-size: 9px;
      letter-spacing: 2px;
    }

    .money {
      color: #ff4b4b;
      font-family: "Oswald", sans-serif;
      font-size: 19px;
      font-weight: 600;
    }

    .page-scroll {
      flex: 1;
      width: 100%;
      overflow-y: auto;
      padding: 15px;
    }

    .page-narrow {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }

    .section-title {
      margin-bottom: 14px;
      color: #616161;
      font-family: "Oswald", sans-serif;
      font-size: 12px;
      letter-spacing: 2px;
    }

    .section-subtitle {
      margin: -7px 0 16px;
      color: #3e3e3e;
      font-size: 9px;
      line-height: 1.5;
      letter-spacing: 1px;
    }

    .empty-state {
      padding: 65px 15px;
      color: #303030;
      text-align: center;
      font-size: 12px;
      line-height: 1.7;
    }

    .empty-icon {
      display: block;
      margin-bottom: 9px;
      font-size: 30px;
      opacity: 0.35;
    }

    .cart-row,
    .fulfill-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #1d1d1d;
    }

    .cart-row:last-child,
    .fulfill-row:last-child {
      border-bottom: none;
    }

    .cart-name {
      flex: 1;
      min-width: 0;
      font-size: 11px;
      line-height: 1.35;
    }

    .unit-price {
      width: 72px;
      color: #5b5b5b;
      text-align: right;
      font-size: 10px;
    }

    .line-price {
      width: 85px;
      color: #c8b89a;
      text-align: right;
      font-size: 11px;
    }

    .quantity-controls {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .quantity-number {
      min-width: 25px;
      text-align: center;
      font-size: 11px;
    }

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 7px 0;
      border-bottom: 1px solid #1c1c1c;
      font-size: 11px;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-label {
      color: #555555;
    }

    .summary-value {
      color: #c8b89a;
      text-align: right;
    }

    .order-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .order-number {
      color: #ff5555;
      font-family: "Oswald", sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .order-customer {
      margin-top: 4px;
      color: #c8b89a;
      font-size: 11px;
    }

    .order-meta {
      margin-top: 4px;
      color: #525252;
      font-size: 9px;
      line-height: 1.5;
    }

    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .tag {
      display: inline-block;
      padding: 3px 7px;
      border-radius: 2px;
      font-family: "Oswald", sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      white-space: nowrap;
    }

    .tag-pending {
      color: #c9bb38;
      background: #1a1900;
      border: 1px solid #4d4800;
    }

    .tag-active {
      color: #27b9c9;
      background: #00191c;
      border: 1px solid #00424a;
    }

    .tag-done {
      color: #33cf6f;
      background: #001a0a;
      border: 1px solid #005322;
    }

    .progress-bar {
      height: 7px;
      margin: 8px 0;
      overflow: hidden;
      background: #1b1b1b;
      border: 1px solid #242424;
      border-radius: 3px;
    }

    .progress-fill {
      height: 100%;
      background:
        linear-gradient(
          90deg,
          #650000,
          #b00000
        );
      transition: width 0.3s ease;
    }

    .progress-fill.done {
      background:
        linear-gradient(
          90deg,
          #075e27,
          #2ecc71
        );
    }

    .progress-text {
      color: #565656;
      font-size: 9px;
    }

    .chip-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;
    }

    .emp-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      color: #aaaaaa;
      background: #111111;
      border: 1px solid #292929;
      border-radius: 2px;
      font-size: 10px;
    }

    .emp-dot {
      width: 7px;
      height: 7px;
      flex: 0 0 7px;
      border-radius: 50%;
    }

    .detail-list {
      margin-top: 10px;
      border-top: 1px solid #1f1f1f;
    }

    .detail-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 9px 0;
      border-bottom: 1px solid #1d1d1d;
      font-size: 11px;
    }

    .detail-name {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .detail-data {
      color: #666666;
      text-align: right;
      white-space: nowrap;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.87);
      backdrop-filter: blur(4px);
    }

    .modal {
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 21px;
      background: #0d0d0d;
      border: 1px solid #353535;
      box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.8),
        0 0 35px rgba(139, 0, 0, 0.08);
    }

    .modal-title {
      margin-bottom: 6px;
      color: #ff5555;
      font-family: "Oswald", sans-serif;
      font-size: 17px;
      letter-spacing: 2px;
    }

    .modal-subtitle {
      margin-bottom: 18px;
      color: #555555;
      font-size: 10px;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 7px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .num-input {
      width: 86px;
      padding: 9px 10px;
      color: #c8b89a;
      background: #111111;
      border: 1px solid #2e2e2e;
      outline: none;
      text-align: center;
      font-size: 14px;
    }

    .num-input:focus {
      border-color: #8b0000;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      min-height: 150px;
      color: #555555;
      font-size: 11px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #222222;
      border-top-color: #8b0000;
      border-radius: 50%;
      animation: shrine-spin 0.7s linear infinite;
    }

    @keyframes shrine-spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 760px) {
      .topbar {
        align-items: flex-start;
      }

      .brand-wrap {
        width: 100%;
      }

      .nav {
        width: 100%;
        justify-content: flex-start;
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 1px;
      }

      .tab {
        flex: 0 0 auto;
      }
    }

    @media (max-width: 620px) {
      .category-panel {
        width: 112px;
        flex-basis: 112px;
      }

      .cat-btn {
        padding-left: 8px;
        padding-right: 5px;
        font-size: 9px;
      }

      .item-grid,
      .search-group-grid {
        grid-template-columns: 1fr;
      }

      .unit-price {
        display: none;
      }

      .line-price {
        width: 72px;
      }

      .page-scroll {
        padding: 10px;
      }

      .card {
        padding: 12px;
      }

      .bottom-total {
        padding: 9px 10px;
      }

      .money {
        font-size: 17px;
      }

      .modal {
        padding: 17px;
      }
    }

    @media (max-width: 420px) {
      .category-panel {
        width: 96px;
        flex-basis: 96px;
      }

      .cat-btn {
        padding: 7px 4px 7px 6px;
        font-size: 8px;
      }

      .category-total {
        font-size: 7px;
      }

      .item-btn {
        padding: 9px 8px;
      }

      .cart-row,
      .fulfill-row {
        gap: 5px;
      }

      .ctrl-btn {
        width: 26px;
        height: 26px;
        flex-basis: 26px;
      }

      .line-price {
        width: 62px;
        font-size: 10px;
      }
    }
  `;

  document.head.appendChild(style);
}
function render() {
  if (
    state.mode === "employee" &&
    !state.employeeBadge
  ) {
    root.innerHTML = renderEmployeeLogin();
    return;
  }

  root.innerHTML = renderApp();
}

function renderEmployeeLogin() {
  return `
    <main class="login-shell">
      <section class="login-card">
        <div class="login-icon">⛩️</div>

        <div class="login-title">
          SHRINE
        </div>

        <div class="login-subtitle">
          EMPLOYEE ACCESS
        </div>

        <label
          class="lbl"
          for="badge-input"
        >
          BADGE NUMBER
        </label>

        <input
          id="badge-input"
          class="inp"
          style="margin-bottom:12px"
          autocomplete="username"
          placeholder="Enter your badge number..."
        />

        <label
          class="lbl"
          for="password-input"
        >
          PASSWORD
        </label>

        <input
          id="password-input"
          class="inp"
          type="password"
          autocomplete="current-password"
          placeholder="Enter employee password..."
        />

        ${
          state.loginError
            ? `
              <div
                class="notice-error"
                style="margin-top:12px"
              >
                ${escapeHtml(state.loginError)}
              </div>
            `
            : ""
        }

        <div class="login-actions">
          <button
            id="clock-in"
            class="red-btn"
            type="button"
          >
            CLOCK IN
          </button>

          <button
            class="ghost-btn"
            type="button"
            data-action="customer-view"
          >
            ← CUSTOMER VIEW
          </button>
        </div>
      </section>
    </main>
  `;
}

function renderApp() {
  return `
    <main class="app">
      ${renderHeader()}
      ${renderCurrentScreen()}

      ${
        state.fulfillTarget
          ? renderFulfillModal()
          : ""
      }
    </main>
  `;
}

function renderHeader() {
  const activeOrders = getSortedOrders().filter(
    (order) => order.status !== "complete",
  );

  const cartCount = getCartCount();

  const customerNavigation = `
    <button
      class="tab ${
        state.screen === "browse" ? "on" : ""
      }"
      type="button"
      data-screen="browse"
    >
      BROWSE
    </button>

    <button
      class="tab ${
        state.screen === "cart" ? "on" : ""
      }"
      type="button"
      data-screen="cart"
    >
      CART

      ${
        cartCount > 0
          ? `
            <span class="count-pill">
              ${cartCount}
            </span>
          `
          : ""
      }
    </button>

    <button
      class="tab ${
        state.screen === "submit" ? "on" : ""
      }"
      type="button"
      data-screen="submit"
    >
      SUBMIT
    </button>

    <span class="divider"></span>

    <button
      class="ghost-btn"
      type="button"
      style="padding:4px 10px;font-size:10px"
      data-action="employee-view"
    >
      EMPLOYEE →
    </button>
  `;

  const employeeNavigation = `
    <button
      class="tab ${
        state.screen === "orders" ||
        state.screen === "fulfill"
          ? "on"
          : ""
      }"
      type="button"
      data-screen="orders"
    >
      ORDERS

      ${
        activeOrders.length > 0
          ? `
            <span class="count-pill">
              ${activeOrders.length}
            </span>
          `
          : ""
      }
    </button>

    <button
      class="tab ${
        state.screen === "history" ? "on" : ""
      }"
      type="button"
      data-screen="history"
    >
      HISTORY
    </button>

    <span class="divider"></span>

    <button
      class="ghost-btn"
      type="button"
      style="padding:4px 10px;font-size:10px"
      data-action="sign-out"
    >
      SIGN OUT
    </button>
  `;

  return `
    <header class="topbar">
      <div class="brand-wrap">
        <div class="brand">
          ⛩️ MALEVOLENT SHRINE
        </div>

        <div class="brand-subtitle">
          REGISTER &amp; ORDER SYSTEM
        </div>

        ${
          state.employeeBadge
            ? `
              <div
                class="badge-line"
                style="
                  color:${employeeColor(
                    state.employeeBadge,
                  )}
                "
              >
                BADGE #${escapeHtml(
                  state.employeeBadge,
                )} — CLOCKED IN
              </div>
            `
            : ""
        }
      </div>

      <nav class="nav">
        ${
          state.mode === "customer"
            ? customerNavigation
            : employeeNavigation
        }
      </nav>
    </header>
  `;
}

function renderCurrentScreen() {
  if (state.mode === "employee") {
    if (state.screen === "history") {
      return renderHistory();
    }

    if (state.screen === "fulfill") {
      return renderOrderDetail();
    }

    return renderActiveOrders();
  }

  if (state.screen === "cart") {
    return renderCart();
  }

  if (state.screen === "submit") {
    return renderSubmit();
  }

  return renderBrowse();
}

function renderBrowse() {
  const query = state.search
    .trim()
    .toLowerCase();

  const filteredCategories = CATEGORIES.map(
    (category) => ({
      ...category,

      items: category.items.filter((item) => {
        if (!query) {
          return true;
        }

        return item.name
          .toLowerCase()
          .includes(query);
      }),
    }),
  ).filter(
    (category) => category.items.length > 0,
  );

  const activeItems = query
    ? []
    : filteredCategories.find(
        (category) =>
          category.id === state.activeCategory,
      )?.items || [];

  const itemMarkup = query
    ? filteredCategories
        .map(
          (category) => `
            <section class="search-group">
              <div class="search-group-title">
                ${category.icon}
                ${escapeHtml(category.label)}
              </div>

              <div class="search-group-grid">
                ${category.items
                  .map(renderItemButton)
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("")
    : activeItems
        .map(renderItemButton)
        .join("");

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  return `
    <section class="browse-layout">
      <aside class="category-panel">
        ${filteredCategories
          .map((category) => {
            const categoryCartTotal =
              category.items.reduce(
                (total, item) => {
                  const quantity =
                    state.cart[item.name] || 0;

                  return (
                    total +
                    item.price * quantity
                  );
                },
                0,
              );

            return `
              <button
                class="cat-btn ${
                  state.activeCategory ===
                    category.id && !query
                    ? "active"
                    : ""
                }"
                type="button"
                data-category="${escapeAttribute(
                  category.id,
                )}"
              >
                <span class="category-label">
                  ${category.icon}
                  ${escapeHtml(category.label)}
                </span>

                ${
                  categoryCartTotal > 0
                    ? `
                      <span class="category-total">
                        ${money(
                          categoryCartTotal,
                        )}
                      </span>
                    `
                    : ""
                }
              </button>
            `;
          })
          .join("")}
      </aside>

      <section class="items-panel">
        <div class="search-wrap">
          <input
            id="item-search"
            class="inp"
            value="${escapeAttribute(
              state.search,
            )}"
            placeholder="🔍  SEARCH ALL ITEMS..."
          />
        </div>

        <div class="item-grid">
          ${
            itemMarkup ||
            `
              <div
                class="empty-state"
                style="grid-column:1/-1"
              >
                <span class="empty-icon">
                  🔍
                </span>

                NO ITEMS FOUND
              </div>
            `
          }
        </div>

        ${
          cartTotal > 0
            ? `
              <footer class="bottom-total">
                <div>
                  <div class="bottom-total-label">
                    CURRENT ORDER
                  </div>

                  <div
                    style="
                      margin-top:3px;
                      color:#666;
                      font-size:10px;
                    "
                  >
                    ${cartCount} item${
                      cartCount === 1 ? "" : "s"
                    }
                  </div>
                </div>

                <div
                  style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                  "
                >
                  <span class="money">
                    ${money(cartTotal)}
                  </span>

                  <button
                    class="red-btn"
                    type="button"
                    style="
                      padding:7px 13px;
                      font-size:11px;
                    "
                    data-screen="submit"
                  >
                    SUBMIT →
                  </button>
                </div>
              </footer>
            `
            : ""
        }
      </section>
    </section>
  `;
}

function renderItemButton(item) {
  const quantity =
    state.cart[item.name] || 0;

  return `
    <button
      class="item-btn ${
        quantity > 0 ? "in-cart" : ""
      }"
      type="button"
      data-action="add-item"
      data-name="${escapeAttribute(item.name)}"
    >
      <span class="item-name">
        ${escapeHtml(item.name)}
      </span>

      <span class="item-price">
        ${money(item.price)}
      </span>

      ${
        quantity > 0
          ? `
            <span class="qty-badge">
              ×${quantity}
            </span>
          `
          : ""
      }
    </button>
  `;
}

function renderCart() {
  const cartEntries = Object.entries(
    state.cart,
  ).sort(([nameA], [nameB]) =>
    nameA.localeCompare(nameB),
  );

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return `
    <section
      style="
        flex:1;
        display:flex;
        flex-direction:column;
        overflow:hidden;
      "
    >
      <div class="page-scroll page-narrow">
        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:12px;
          "
        >
          <div
            class="section-title"
            style="margin-bottom:0"
          >
            YOUR CART
          </div>

          <button
            class="ghost-btn"
            type="button"
            data-action="clear-cart"
            ${cartCount > 0 ? "" : "disabled"}
          >
            CLEAR CART
          </button>
        </div>

        ${
          cartEntries.length > 0
            ? cartEntries
                .map(([name, quantity]) => {
                  const price =
                    PRICE_BY_NAME[name] || 0;

                  return `
                    <div class="cart-row">
                      <button
                        class="ctrl-btn"
                        type="button"
                        data-action="remove-item"
                        data-name="${escapeAttribute(
                          name,
                        )}"
                      >
                        −
                      </button>

                      <span class="qty-badge">
                        ×${quantity}
                      </span>

                      <span class="cart-name">
                        ${escapeHtml(name)}
                      </span>

                      <span class="unit-price">
                        ${money(price)}
                      </span>

                      <span class="line-price">
                        ${money(
                          price * quantity,
                        )}
                      </span>

                      <button
                        class="ctrl-btn"
                        type="button"
                        data-action="add-item"
                        data-name="${escapeAttribute(
                          name,
                        )}"
                      >
                        +
                      </button>
                    </div>
                  `;
                })
                .join("")
            : `
              <div class="empty-state">
                <span class="empty-icon">
                  🛒
                </span>

                YOUR CART IS EMPTY
              </div>
            `
        }
      </div>

      ${
        cartCount > 0
          ? `
            <footer class="bottom-total">
              <span
                style="
                  color:#555;
                  font-size:10px;
                "
              >
                ${cartCount} items ·
                ${cartEntries.length} unique
              </span>

              <div style="text-align:right">
                <div class="bottom-total-label">
                  TOTAL
                </div>

                <div
                  class="money"
                  style="font-size:20px"
                >
                  ${money(cartTotal)}
                </div>
              </div>
            </footer>
          `
          : ""
      }
    </section>
  `;
}

function renderSubmit() {
  if (state.submitStatus === "success") {
    return `
      <section
        class="page-scroll"
        style="max-width:560px"
      >
        <div
          style="
            padding:60px 20px;
            text-align:center;
          "
        >
          <div
            style="
              margin-bottom:12px;
              font-size:44px;
            "
          >
            ✅
          </div>

          <div
            style="
              margin-bottom:8px;
              color:#2ecc71;
              font-family:'Oswald',sans-serif;
              font-size:18px;
              letter-spacing:2px;
            "
          >
            ORDER SENT
          </div>

          <div
            style="
              margin-bottom:24px;
              color:#555;
              font-size:11px;
              line-height:1.6;
            "
          >
            Your order has been submitted to
            Malevolent Shrine. An employee can
            now view and fulfill it.
          </div>

          <button
            class="red-btn"
            type="button"
            data-action="new-order"
          >
            START NEW ORDER
          </button>
        </div>
      </section>
    `;
  }

  const cartEntries = Object.entries(
    state.cart,
  ).sort(([nameA], [nameB]) =>
    nameA.localeCompare(nameB),
  );

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  return `
    <section
      class="page-scroll"
      style="
        max-width:560px;
        margin:0 auto;
        padding:18px;
      "
    >
      <div class="section-title">
        PLACE YOUR ORDER
      </div>

      <div class="section-subtitle">
        Review the order, enter your in-game
        name, and submit it to the shrine.
      </div>

      ${
        cartCount === 0
          ? `
            <div class="notice-error">
              Your cart is empty. Add at least
              one item before submitting.
            </div>
          `
          : ""
      }

      ${
        cartCount > 0
          ? `
            <div
              class="card"
              style="margin-bottom:14px"
            >
              <div
                style="
                  margin-bottom:8px;
                  color:#444;
                  font-size:9px;
                  letter-spacing:2px;
                "
              >
                ORDER PREVIEW
              </div>

              <div
                style="
                  max-height:180px;
                  overflow-y:auto;
                "
              >
                ${cartEntries
                  .map(
                    ([name, quantity]) => `
                      <div
                        style="
                          display:flex;
                          justify-content:
                            space-between;
                          gap:10px;
                          padding:4px 0;
                          border-bottom:
                            1px solid #171717;
                          font-size:11px;
                        "
                      >
                        <span style="color:#888">
                          ×${quantity}
                          ${escapeHtml(name)}
                        </span>

                        <span style="color:#555">
                          ${money(
                            (PRICE_BY_NAME[name] ||
                              0) *
                              quantity,
                          )}
                        </span>
                      </div>
                    `,
                  )
                  .join("")}
              </div>

              <div
                style="
                  display:flex;
                  align-items:center;
                  justify-content:
                    space-between;
                  gap:12px;
                  margin-top:10px;
                  padding-top:9px;
                  border-top:1px solid #2a2a2a;
                "
              >
                <span
                  style="
                    color:#666;
                    font-family:
                      'Oswald',sans-serif;
                    font-size:11px;
                    letter-spacing:1px;
                  "
                >
                  TOTAL
                </span>

                <span
                  class="money"
                  style="font-size:16px"
                >
                  ${money(cartTotal)}
                </span>
              </div>
            </div>
          `
          : ""
      }

      <div style="margin-bottom">
        <label class="lbl">
          SITE LOCATION
        </label>

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:8px;
          "
        >
          <button
            type="button"
            class="${
              state.site === "cherno"
              ? "red-btn"
              : "ghost-btn"
            }"
            data-action="select-site"
            data-site="cherno"
          >
            Cherno
          </button>

          <button
          type="button"
          class="${
            state.site === "novo"
              ? "red-btn"
              : "ghost-btn"
          }"
          data-action="select-site"
          data-site="novo"
          >
            NOVO
          </button>
        </div>
        
        ${
          !state.site
            ?`
              <div
                style="
                  margin-top:7px;
                  color:#555;
                  font-size:9px;
                "
              >
                Select the location fulfilling your order.
              </div>
            `
            :""
        }
      </div>

      <div style="margin-bottom:13px">
        <label
          class="lbl"
          for="customer-name"
        >
          YOUR NAME / IGN
        </label>

        <input
          id="customer-name"
          class="inp"
          value="${escapeAttribute(
            state.customerName,
          )}"
          placeholder="Enter your in-game name..."
          maxlength="60"
        />
      </div>

      <div style="margin-bottom:13px">
        <label
          class="lbl"
          for="order-notes"
        >
          NOTES
        </label>

        <textarea
          id="order-notes"
          class="inp"
          rows="3"
          maxlength="500"
          placeholder="Meeting location, special request, or other details..."
        >${escapeHtml(state.notes)}</textarea>
      </div>

      ${
        state.submitStatus === "error"
          ? `
            <div class="notice-error">
              The order could not be submitted.
              Check the connection and try again.
            </div>
          `
          : ""
      }

      <button
        id="send-order"
        class="red-btn"
        type="button"
        style="width:100%;padding:13px"
        ${
          cartCount === 0 ||
          !state.customerName.trim() ||
          !state.site ||
          state.submitStatus === "sending"
            ? "disabled"
            : ""
        }
      >
        ${
          state.submitStatus === "sending"
            ? "SENDING ORDER..."
            : "⛩️ SEND ORDER TO SHRINE"
        }
      </button>
    </section>
  `;
}

function renderActiveOrders() {
  const activeOrders = getSortedOrders().filter(
    (order) => order.status !== "complete",
  );

  if (state.loadingOrders) {
    return `
      <section class="page-scroll">
        <div class="loading">
          <span class="spinner"></span>
          LOADING ORDERS...
        </div>
      </section>
    `;
  }

  return `
    <section class="page-scroll">
      <div class="section-title">
        ACTIVE ORDERS — ${activeOrders.length}
      </div>

      ${
        activeOrders.length > 0
          ? activeOrders
              .map(renderActiveOrderCard)
              .join("")
          : `
            <div class="empty-state">
              <span class="empty-icon">
                📋
              </span>

              NO ACTIVE ORDERS
            </div>
          `
      }
    </section>
  `;
}

function renderActiveOrderCard(order) {
  const stats = calculateOrderStats(order);

  const displayTotal =
    Number(order.grandTotal) ||
    stats.totalValue;

  return `
    <article
      class="card"
      style="cursor:pointer"
      data-action="open-order"
      data-order-id="${escapeAttribute(order.id)}"
    >
      <div class="order-header">
        <div>
          <div class="order-number">
            ORDER #${escapeHtml(
              String(order.id).slice(-8),
            )}
          </div>

          <div class="order-customer">
            ${escapeHtml(
              order.customerName || "Unknown",
            )}
          </div>

          <div
            style="
              margin-top:4px;
              color:#b77979;
              font-size:10px;
              letter-spacing:1px;
            "
          >
            📍 ${escapeHtml(
              String(order.site || "Not selected")
                .toUpperCase(),
            )}
          </div>

          <div class="order-meta">
            ${formatDate(order.createdAt)}
          </div>
        </div>

        <div style="text-align:right">
          <div
            class="money"
            style="font-size:15px"
          >
            ${money(displayTotal)}
          </div>

          <span
            class="tag ${
              order.status === "active"
                ? "tag-active"
                : "tag-pending"
            }"
          >
            ${
              order.status === "active"
                ? "IN PROGRESS"
                : "PENDING"
            }
          </span>
        </div>
      </div>

      <div class="progress-bar">
        <div
          class="progress-fill"
          style="
            width:${Math.min(
              100,
              stats.pct,
            )}%
          "
        ></div>
      </div>

      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:10px;
          margin-bottom:6px;
          color:#555;
          font-size:10px;
        "
      >
        <span>
          ${stats.pct.toFixed(0)}% fulfilled
        </span>

        <span>
          ${money(stats.filledValue)} /
          ${money(displayTotal)}
        </span>
      </div>

      ${renderEmployeeChips(
        stats.empBreakdown,
      )}

      ${
        order.notes
          ? `
            <div
              style="
                margin-top:8px;
                color:#555;
                font-size:10px;
                font-style:italic;
                line-height:1.5;
              "
            >
              📝 ${escapeHtml(order.notes)}
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderHistory() {
  const completedOrders = getSortedOrders().filter(
    (order) => order.status === "complete",
  );

  if (state.loadingOrders) {
    return `
      <section class="page-scroll">
        <div class="loading">
          <span class="spinner"></span>
          LOADING HISTORY...
        </div>
      </section>
    `;
  }

  return `
    <section class="page-scroll">
      <div class="section-title">
        COMPLETED ORDERS —
        ${completedOrders.length}
      </div>

      ${
        completedOrders.length > 0
          ? completedOrders
              .map(renderHistoryCard)
              .join("")
          : `
            <div class="empty-state">
              <span class="empty-icon">
                ✅
              </span>

              NO COMPLETED ORDERS
            </div>
          `
      }
    </section>
  `;
}

function renderHistoryCard(order) {
  const stats = calculateOrderStats(order);

  const displayTotal =
    Number(order.grandTotal) ||
    stats.totalValue;

  return `
    <article class="card">
      <div class="order-header">
        <div>
          <div class="order-number">
            ORDER #${escapeHtml(
              String(order.id).slice(-8),
            )}
          </div>

          <div class="order-customer">
            ${escapeHtml(
              order.customerName || "Unknown",
            )}
          </div>

          <div class="order-meta">
            Completed:
            ${formatDate(
              order.completedAt ||
                order.updatedAt ||
                order.createdAt,
            )}
          </div>
        </div>

        <div style="text-align:right">
          <div
            style="
              color:#2ecc71;
              font-family:'Oswald',sans-serif;
              font-size:15px;
            "
          >
            ${money(displayTotal)}
          </div>

          <span class="tag tag-done">
            COMPLETE
          </span>
        </div>
      </div>

      ${
        stats.empBreakdown.length > 0
          ? `
            <div style="margin-top:10px">
              <div
                style="
                  margin-bottom:6px;
                  color:#444;
                  font-size:9px;
                  letter-spacing:2px;
                "
              >
                EMPLOYEE BREAKDOWN
              </div>

              ${stats.empBreakdown
                .map(
                  (employee) => `
                    <div class="summary-row">
                      <span
                        class="emp-chip"
                        style="
                          border-color:
                            ${employeeColor(
                              employee.badge,
                            )};
                          color:
                            ${employeeColor(
                              employee.badge,
                            )};
                        "
                      >
                        <span
                          class="emp-dot"
                          style="
                            background:
                              ${employeeColor(
                                employee.badge,
                              )}
                          "
                        ></span>

                        Badge #${escapeHtml(
                          employee.badge,
                        )}
                      </span>

                      <span class="summary-value">
                        ${money(employee.earned)}
                        ·
                        ${employee.pct.toFixed(1)}%
                      </span>
                    </div>
                  `,
                )
                .join("")}
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderOrderDetail() {
  const storedOrder =
    state.orders[state.selectedOrderId];

  if (!storedOrder) {
    return `
      <section class="page-scroll">
        <button
          class="ghost-btn"
          type="button"
          data-screen="orders"
          style="margin-bottom:12px"
        >
          ← BACK TO ORDERS
        </button>

        <div class="notice-error">
          Order could not be found.
        </div>
      </section>
    `;
  }

  const order = {
    ...storedOrder,
    id: state.selectedOrderId,
  };

  const stats = calculateOrderStats(order);

  const displayTotal =
    Number(order.grandTotal) ||
    stats.totalValue;

  return `
    <section
      class="page-scroll"
      style="max-width:760px;margin:0 auto"
    >
      <button
        class="ghost-btn"
        type="button"
        data-screen="orders"
        style="margin-bottom:12px"
      >
        ← BACK TO ORDERS
      </button>

      <article class="card">
        <div class="order-header">
          <div>
            <div class="order-number">
              ORDER #${escapeHtml(
                String(order.id).slice(-8),
              )}
            </div>

            <div
              style="
                margin-top:5px;
                color:#c8b89a;
                font-family:'Oswald',sans-serif;
                font-size:18px;
              "
            >
              ${escapeHtml(
                order.customerName || "Unknown",
              )}
            </div>

            <div
              style="
                margin-top:5px;
                color:#b77979;
                font-size:10px;
                letter-spacing:1px;
              "
            >
              📍 DELIVERY SITE:
              ${escapeHtml(
                  String(order.site || "Not selected")
                    .toUpperCase(),
              )}
            </div>

            <div class="order-meta">
              ${formatDate(order.createdAt)}
            </div>
          </div>

          <div style="text-align:right">
            <div class="money">
              ${money(displayTotal)}
            </div>

            <div
              style="
                margin-top:4px;
                color:#555;
                font-size:10px;
              "
            >
              ${stats.pct.toFixed(0)}%
              fulfilled
            </div>
          </div>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill ${
              stats.pct >= 100 ? "done" : ""
            }"
            style="
              width:${Math.min(
                100,
                stats.pct,
              )}%
            "
          ></div>
        </div>

        ${
          order.notes
            ? `
              <div
                class="notice-info"
                style="
                  margin-top:12px;
                  margin-bottom:0;
                "
              >
                📝 ${escapeHtml(order.notes)}
              </div>
            `
            : ""
        }
      </article>

      <div class="section-title">
        ORDER ITEMS
      </div>

      ${(order.items || [])
        .map((item, itemIndex) => {
          const requestedQuantity =
            Number(item.qty || 0);

          const filledQuantity =
            getFilledQuantity(item);

          const remainingQuantity =
            Math.max(
              0,
              requestedQuantity -
                filledQuantity,
            );

          const price =
            Number(item.price) ||
            PRICE_BY_NAME[item.name] ||
            0;

          const itemValue =
            price * requestedQuantity;

          const itemPercentage =
            requestedQuantity > 0
              ? Math.min(
                  100,
                  (filledQuantity /
                    requestedQuantity) *
                    100,
                )
              : 0;

          return `
            <article class="card">
              <div
                class="fulfill-row"
                style="
                  padding:0;
                  border-bottom:none;
                "
              >
                <div
                  style="
                    flex:1;
                    min-width:0;
                  "
                >
                  <div
                    style="
                      color:#c8b89a;
                      font-size:12px;
                    "
                  >
                    ${escapeHtml(item.name)}
                  </div>

                  <div
                    style="
                      margin-top:4px;
                      color:#555;
                      font-size:10px;
                    "
                  >
                    Filled ${filledQuantity} /
                    ${requestedQuantity}
                    · ${money(itemValue)}
                  </div>

                  <div class="progress-bar">
                    <div
                      class="progress-fill ${
                        remainingQuantity === 0
                          ? "done"
                          : ""
                      }"
                      style="
                        width:${itemPercentage}%
                      "
                    ></div>
                  </div>

                  ${renderFulfillmentChips(
                    item.fulfillments || {},
                  )}
                </div>

                ${
                  remainingQuantity > 0 &&
                  order.status !== "complete"
                    ? `
                      <button
                        class="red-btn"
                        type="button"
                        style="
                          padding:7px 11px;
                          font-size:11px;
                        "
                        data-action="fulfill-item"
                        data-order-id="${escapeAttribute(
                          order.id,
                        )}"
                        data-item-index="${itemIndex}"
                      >
                        FILL
                      </button>
                    `
                    : `
                      <span class="tag tag-done">
                        DONE
                      </span>
                    `
                }
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderEmployeeChips(
  employeeBreakdown,
) {
  if (
    !Array.isArray(employeeBreakdown) ||
    employeeBreakdown.length === 0
  ) {
    return "";
  }

  return `
    <div class="chip-wrap">
      ${employeeBreakdown
        .map(
          (employee) => `
            <span
              class="emp-chip"
              style="
                border-color:
                  ${employeeColor(
                    employee.badge,
                  )};
                color:
                  ${employeeColor(
                    employee.badge,
                  )};
              "
            >
              <span
                class="emp-dot"
                style="
                  background:
                    ${employeeColor(
                      employee.badge,
                    )}
                "
              ></span>

              #${escapeHtml(employee.badge)}
              · ${money(employee.earned)}
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderFulfillmentChips(
  fulfillments,
) {
  const entries = Object.entries(
    fulfillments || {},
  );

  if (entries.length === 0) {
    return "";
  }

  return `
    <div class="chip-wrap">
      ${entries
        .map(([badge, quantity]) => {
          const numericQuantity =
            Number(quantity || 0);

          if (numericQuantity <= 0) {
            return "";
          }

          return `
            <span
              class="emp-chip"
              style="
                border-color:
                  ${employeeColor(badge)};
                color:
                  ${employeeColor(badge)};
              "
            >
              <span
                class="emp-dot"
                style="
                  background:
                    ${employeeColor(badge)}
                "
              ></span>

              #${escapeHtml(badge)}
              ×${numericQuantity}
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderFulfillModal() {
  const target = state.fulfillTarget;

  const order =
    state.orders[target.orderId];

  const item =
    order?.items?.[target.itemIndex];

  if (!order || !item) {
    return "";
  }

  const requestedQuantity =
    Number(item.qty || 0);

  const filledQuantity =
    getFilledQuantity(item);

  const remainingQuantity =
    Math.max(
      0,
      requestedQuantity -
        filledQuantity,
    );

  const selectedQuantity = Math.min(
    Math.max(
      1,
      Number(state.fulfillQuantity) || 1,
    ),
    remainingQuantity || 1,
  );

  const price =
    Number(item.price) ||
    PRICE_BY_NAME[item.name] ||
    0;

  return `
    <div
      class="modal-overlay"
      data-action="close-modal"
    >
      <section
        class="modal"
        data-modal-body
      >
        <div class="modal-title">
          FULFILL ITEM
        </div>

        <div class="modal-subtitle">
          Record how many units you are
          personally fulfilling.
        </div>

        <div
          style="
            margin-bottom:5px;
            color:#c8b89a;
            font-size:13px;
          "
        >
          ${escapeHtml(item.name)}
        </div>

        <div
          style="
            margin-bottom:16px;
            color:#555;
            font-size:10px;
            line-height:1.5;
          "
        >
          Already filled:
          ${filledQuantity} /
          ${requestedQuantity}

          <br />

          Remaining:
          ${remainingQuantity}
        </div>

        <label
          class="lbl"
          for="fulfill-qty"
        >
          QUANTITY FULFILLED NOW
        </label>

        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
            margin-bottom:16px;
          "
        >
          <button
            class="ctrl-btn"
            type="button"
            data-action="fulfill-minus"
          >
            −
          </button>

          <input
            id="fulfill-qty"
            class="num-input"
            type="number"
            min="1"
            max="${remainingQuantity}"
            value="${selectedQuantity}"
          />

          <button
            class="ctrl-btn"
            type="button"
            data-action="fulfill-plus"
          >
            +
          </button>

          <span
            style="
              color:#555;
              font-size:10px;
            "
          >
            of ${remainingQuantity}
          </span>
        </div>

        <div class="notice-info">
          Badge:
          #${escapeHtml(
            state.employeeBadge,
          )}

          <br />

          Fulfillment value:
          ${money(
            price * selectedQuantity,
          )}
        </div>

        <div class="modal-actions">
          <button
            class="ghost-btn"
            type="button"
            data-action="close-modal"
          >
            CANCEL
          </button>

          <button
            class="red-btn"
            type="button"
            data-action="confirm-fulfillment"
            ${
              remainingQuantity <= 0
                ? "disabled"
                : ""
            }
          >
            CONFIRM FULFILLMENT
          </button>
        </div>
      </section>
    </div>
  `;
}
root.addEventListener("click", async (event) => {
  const control = event.target.closest(
    "button, [data-action], [data-screen], [data-category]",
  );

  if (!control) {
    return;
  }

  if (control.id === "clock-in") {
    await employeeLogin();
    return;
  }

  if (control.id === "send-order") {
    await submitOrder();
    return;
  }

  const screen = control.dataset.screen;

  if (screen) {
    state.screen = screen;

    if (screen === "orders") {
      state.selectedOrderId = null;
      state.fulfillTarget = null;

      if (state.mode === "employee") {
        void loadOrders();
      }
    }

    render();
    return;
  }

  const categoryId = control.dataset.category;

  if (categoryId) {
    state.activeCategory = categoryId;
    state.search = "";
    render();
    return;
  }

  const action = control.dataset.action;

  if (!action) {
    return;
  }

  switch (action) {
    case "customer-view": {
      state.mode = "customer";
      state.loginError = "";
      state.screen = "browse";
      state.selectedOrderId = null;
      state.fulfillTarget = null;
      render();
      break;
    }

    case "employee-view": {
      state.mode = "employee";
      state.screen = state.employeeBadge
        ? "orders"
        : "login";

      state.loginError = "";
      render();

      if (state.employeeBadge) {
        void loadOrders({
          showLoading: true,
        });
      } else {
        queueMicrotask(() => {
          document
            .getElementById("badge-input")
            ?.focus();
        });
      }

      break;
    }

    case "sign-out": {
      await signOutEmployee();
      break;
    }

    case "select-site": {
      const selectedSite =
        control.dataset.site;

      if (
        selectedSite !== "cherno" &&
        selectedSite !== "novo"
      ) {
        return;
      }
      state.site = selectedSite;
      state.submitStatus= null;

      render();
      break;
    }

    case "add-item": {
      addItem(control.dataset.name);
      break;
    }

    case "remove-item": {
      removeItem(control.dataset.name);
      break;
    }

    case "clear-cart": {
      state.cart = {};
      state.submitStatus = null;
      render();
      break;
    }

    case "new-order": {
      state.submitStatus = null;
      state.screen = "browse";
      render();
      break;
    }

    case "open-order": {
      const orderId = control.dataset.orderId;

      if (
        !orderId ||
        !state.orders[orderId]
      ) {
        return;
      }

      state.selectedOrderId = orderId;
      state.screen = "fulfill";
      render();
      break;
    }

    case "fulfill-item": {
      openFulfillModal(
        control.dataset.orderId,
        Number(control.dataset.itemIndex),
      );

      break;
    }

    case "close-modal": {
      const clickedInsideModal =
        event.target.closest(
          "[data-modal-body]",
        );

      const clickedCloseButton =
        event.target.closest(
          'button[data-action="close-modal"]',
        );

      if (
        clickedInsideModal &&
        !clickedCloseButton
      ) {
        return;
      }

      state.fulfillTarget = null;
      state.fulfillQuantity = 1;
      render();
      break;
    }

    case "fulfill-minus": {
      state.fulfillQuantity = Math.max(
        1,
        Number(
          state.fulfillQuantity || 1,
        ) - 1,
      );

      render();
      break;
    }

    case "fulfill-plus": {
      adjustFulfillQuantity(1);
      break;
    }

    case "confirm-fulfillment": {
      await confirmFulfillment();
      break;
    }

    default:
      break;
  }
});

root.addEventListener("input", (event) => {
  const input = event.target;

  if (
    !(input instanceof HTMLInputElement) &&
    !(input instanceof HTMLTextAreaElement)
  ) {
    return;
  }

  if (input.id === "item-search") {
    state.search = input.value;
    render();

    queueMicrotask(() => {
      const replacement =
        document.getElementById(
          "item-search",
        );

      replacement?.focus();

      replacement?.setSelectionRange(
        state.search.length,
        state.search.length,
      );
    });

    return;
  }

  if (input.id === "customer-name") {
    state.customerName = input.value;

    const sendButton =
      document.getElementById(
        "send-order",
      );

    if (sendButton) {
      sendButton.disabled =
        !state.customerName.trim() ||
        !state.site ||
        getCartCount() === 0 ||
        state.submitStatus === "sending";
    }

    return;
  }

  if (input.id === "order-notes") {
    state.notes = input.value;
    return;
  }

  if (input.id === "badge-input") {
    input.value = input.value.replace(
      /\D/g,
      "",
    );

    state.loginError = "";
    return;
  }

  if (input.id === "password-input") {
    state.loginError = "";
    return;
  }

  if (input.id === "fulfill-qty") {
    const target = state.fulfillTarget;

    const order = target
      ? state.orders[target.orderId]
      : null;

    const item =
      order?.items?.[
        target?.itemIndex
      ];

    const remaining = item
      ? Math.max(
          1,
          Number(item.qty || 0) -
            getFilledQuantity(item),
        )
      : 1;

    state.fulfillQuantity = Math.min(
      remaining,
      Math.max(
        1,
        Number.parseInt(
          input.value,
          10,
        ) || 1,
      ),
    );
  }
});

root.addEventListener(
  "keydown",
  async (event) => {
    if (
      event.key === "Enter" &&
      (
        event.target.id ===
          "badge-input" ||
        event.target.id ===
          "password-input"
      )
    ) {
      event.preventDefault();
      await employeeLogin();
    }

    if (
      event.key === "Escape" &&
      state.fulfillTarget
    ) {
      state.fulfillTarget = null;
      state.fulfillQuantity = 1;
      render();
    }
  },
);

function addItem(name) {
  if (
    !name ||
    !(name in PRICE_BY_NAME)
  ) {
    return;
  }

  state.cart[name] =
    Number(state.cart[name] || 0) + 1;

  state.submitStatus = null;
  render();
}

function removeItem(name) {
  if (
    !name ||
    !state.cart[name]
  ) {
    return;
  }

  if (state.cart[name] > 1) {
    state.cart[name] -= 1;
  } else {
    delete state.cart[name];
  }

  state.submitStatus = null;
  render();
}

async function employeeLogin() {
  const badgeInput =
    document.getElementById(
      "badge-input",
    );

  const passwordInput =
    document.getElementById(
      "password-input",
    );

  const clockInButton =
    document.getElementById(
      "clock-in",
    );

  const badge =
    badgeInput?.value.trim() || "";

  const password =
    passwordInput?.value.trim() || "";

  if (!badge || !password) {
    state.loginError =
      "Enter your badge number and password.";

    render();
    return;
  }

  state.loginError = "";

  if (clockInButton) {
    clockInButton.disabled = true;

    clockInButton.textContent =
      "CLOCKING IN...";
  }

  try {
    const result = await requestJson(
      API.login,
      {
        method: "POST",

        body: {
          badge,
          password,
        },
      },
    );

    if (!result?.success) {
      throw new Error(
        result?.error ||
          "Employee login was not accepted.",
      );
    }

    state.employeeBadge = badge;
    state.mode = "employee";
    state.screen = "orders";
    state.loginError = "";

    sessionStorage.setItem(
      EMPLOYEE_BADGE_KEY,
      badge,
    );

    render();

    await loadOrders({
      showLoading: true,
    });
  } catch (error) {
    console.error(
      "Employee login failed:",
      error,
    );

    state.loginError =
      error instanceof Error
        ? error.message
        : "Could not reach the employee login service.";

    render();
  }
}

async function signOutEmployee() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    /*
     * The logout endpoint is optional.
     * The local employee session is still
     * cleared below.
     */
  }

  sessionStorage.removeItem(
    EMPLOYEE_BADGE_KEY,
  );

  state.mode = "customer";
  state.employeeBadge = "";
  state.screen = "browse";
  state.orders = {};
  state.selectedOrderId = null;
  state.fulfillTarget = null;
  state.fulfillQuantity = 1;
  state.loginError = "";
  state.loadingOrders = false;

  render();
}

async function submitOrder() {
  const customerName =
    state.customerName.trim();

  if (
    !customerName ||
    !state.site ||
    getCartCount() === 0
  ) {
    return;
  }

  state.submitStatus = "sending";
  render();

  const order = {
    clientRequestId:
      crypto.randomUUID?.() ||
      `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

    customerName,

    site: state.site,

    notes: state.notes.trim(),

    grandTotal: getCartTotal(),

    items: Object.entries(
      state.cart,
    ).map(([name, quantity]) => ({
      name,
      qty: Number(quantity),
      price: PRICE_BY_NAME[name] || 0,
      fulfillments: {},
    })),
  };

  try {
    const result = await requestJson(
      API.orders,
      {
        method: "POST",
        body: order,
      },
    );

    const returnedOrder =
      result?.order ||
      result?.data ||
      null;

    const orderId = String(
      result?.orderId ||
      result?.id ||
      returnedOrder?.id ||
      order.clientRequestId,
    );

    await sendNewOrderNotification({
      ...order,
      ...returnedOrder,
      id: orderId,
    });

    state.cart = {};
    state.customerName = "";
    state.site = "";
    state.notes = "";
    state.submitStatus = "success";

    render();
  } catch (error) {
    console.error(
      "Order submission failed:",
      error,
    );

    state.submitStatus = "error";
    render();
  }
}

function openFulfillModal(
  orderId,
  itemIndex,
) {
  const order =
    state.orders[orderId];

  const item =
    order?.items?.[itemIndex];

  if (!order || !item) {
    return;
  }

  const remaining = Math.max(
    0,
    Number(item.qty || 0) -
      getFilledQuantity(item),
  );

  if (remaining === 0) {
    return;
  }

  state.fulfillTarget = {
    orderId,
    itemIndex,
  };

  state.fulfillQuantity = 1;
  render();
}

function adjustFulfillQuantity(
  change,
) {
  const target =
    state.fulfillTarget;

  const order = target
    ? state.orders[target.orderId]
    : null;

  const item =
    order?.items?.[
      target?.itemIndex
    ];

  if (!item) {
    return;
  }

  const remaining = Math.max(
    1,
    Number(item.qty || 0) -
      getFilledQuantity(item),
  );

  state.fulfillQuantity = Math.min(
    remaining,
    Math.max(
      1,
      Number(
        state.fulfillQuantity || 1,
      ) + Number(change || 0),
    ),
  );

  render();
}

async function confirmFulfillment() {
  const target =
    state.fulfillTarget;

  const order = target
    ? state.orders[target.orderId]
    : null;

  const item =
    order?.items?.[
      target?.itemIndex
    ];

  if (
    !target ||
    !order ||
    !item ||
    !state.employeeBadge
  ) {
    return;
  }

  const remaining = Math.max(
    0,
    Number(item.qty || 0) -
      getFilledQuantity(item),
  );

  const quantity = Math.min(
    remaining,
    Math.max(
      1,
      Number(
        state.fulfillQuantity || 1,
      ),
    ),
  );

  if (quantity === 0) {
    return;
  }

  const confirmButton =
    document.querySelector(
      '[data-action="confirm-fulfillment"]',
    );

  if (confirmButton) {
    confirmButton.disabled = true;

    confirmButton.textContent =
      "SAVING...";
  }

  try {
    const result = await requestJson(
      API.fulfill,
      {
        method: "POST",

        body: {
          orderId: target.orderId,
          itemIndex:
            target.itemIndex,
          badge:
            state.employeeBadge,
          quantity,
        },
      },
    );

    if (result?.order) {
      const normalized =
        normalizeOrder(
          result.order,
          target.orderId,
        );

      state.orders[
        target.orderId
      ] = normalized;
    } else {
      await loadOrders();
    }

    const updatedOrder =
      state.orders[target.orderId] ||
      order;

    const updatedStats =
      calculateOrderStats(
        updatedOrder,
      );

    const value =
      (
        Number(item.price) ||
        PRICE_BY_NAME[item.name] ||
        0
      ) * quantity;

    await sendItemFulfilledNotification(
      order.site,
      target.orderId,
      order.customerName,
      state.employeeBadge,
      item.name,
      quantity,
      value,
    );

    if (
      updatedOrder.status ===
        "complete" ||
      updatedStats.pct >= 100
    ) {
      await sendOrderCompleteNotification(
        {
          ...updatedOrder,
          id: target.orderId,
        },
        updatedStats.empBreakdown,
      );
    }

    state.fulfillTarget = null;
    state.fulfillQuantity = 1;

    render();
  } catch (error) {
    console.error(
      "Fulfillment failed:",
      error,
    );

    window.alert(
      error instanceof Error
        ? error.message
        : "The fulfillment could not be saved.",
    );

    render();
  }
}

function startOrderPolling() {
  void loadOrders();

  window.setInterval(() => {
    void loadOrders();
  }, 5000);
}

async function loadOrders({
  showLoading = false,
} = {}) {
  if (
    state.mode !== "employee" ||
    !state.employeeBadge ||
    state.loadingOrders
  ) {
    return;
  }

  state.loadingOrders = true;

  let shouldRender =
    showLoading;

  if (showLoading) {
    render();
  }

  try {
    const payload =
      await requestJson(
        API.orders,
        {
          method: "GET",
        },
      );

    const nextOrders =
      normalizeOrdersPayload(
        payload,
      );

    const changed =
      JSON.stringify(
        nextOrders,
      ) !==
      JSON.stringify(
        state.orders,
      );

    state.orders = nextOrders;

    shouldRender =
      shouldRender || changed;

    if (
      state.selectedOrderId &&
      !state.orders[
        state.selectedOrderId
      ]
    ) {
      state.selectedOrderId =
        null;

      state.screen = "orders";
      shouldRender = true;
    }
  } catch (error) {
    console.error(
      "Could not load orders:",
      error,
    );

    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      sessionStorage.removeItem(
        EMPLOYEE_BADGE_KEY,
      );

      state.employeeBadge = "";
      state.orders = {};
      state.mode = "employee";
      state.screen = "login";

      state.loginError =
        "Your employee session expired. Clock in again.";

      shouldRender = true;
    }
  } finally {
    state.loadingOrders = false;

    if (shouldRender) {
      render();
    }
  }
}

class ApiError extends Error {
  constructor(
    message,
    status,
    payload = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function requestJson(
  url,
  {
    method = "GET",
    body,
  } = {},
) {
  const response = await fetch(
    url,
    {
      method,

      credentials:
        "same-origin",

      cache: "no-store",

      headers:
        body === undefined
          ? {
              Accept:
                "application/json",
            }
          : {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );

  const payload =
    await readJsonSafely(
      response,
    );

  if (
    !response.ok ||
    payload?.success === false
  ) {
    throw new ApiError(
      payload?.error ||
        payload?.message ||
        `Request failed with status ${response.status}.`,

      response.status,
      payload,
    );
  }

  return payload;
}

function normalizeOrdersPayload(
  payload,
) {
  const isEnvelope =
    payload &&
    typeof payload === "object" &&
    (
      "success" in payload ||
      "orders" in payload ||
      "data" in payload ||
      "results" in payload
    );

  const rawOrders =
    payload?.orders ??
    payload?.data ??
    payload?.results ??
    (isEnvelope ? [] : payload) ??
    {};

  if (Array.isArray(rawOrders)) {
    return Object.fromEntries(
      rawOrders
        .filter(Boolean)
        .map((order, index) => {
          const id = String(
            order.id ??
            order.orderId ??
            order.order_id ??
            index,
          );

          return [
            id,
            normalizeOrder(
              order,
              id,
            ),
          ];
        }),
    );
  }

  if (
    rawOrders &&
    typeof rawOrders === "object"
  ) {
    return Object.fromEntries(
      Object.entries(
        rawOrders,
      ).map(([id, order]) => [
        String(id),

        normalizeOrder(
          order,
          id,
        ),
      ]),
    );
  }

  return {};
}

function normalizeOrder(
  rawOrder,
  fallbackId,
) {
  const order =
    rawOrder &&
    typeof rawOrder === "object"
      ? rawOrder
      : {};

  const rawItems =
    parsePossibleJson(
      order.items ??
        order.items_json,
      [],
    );

  const items =
    Array.isArray(rawItems)
      ? rawItems.map(
          (rawItem) => {
            const item =
              rawItem &&
              typeof rawItem ===
                "object"
                ? rawItem
                : {};

            return {
              name: String(
                item.name ||
                "Unknown Item",
              ),

              qty: Number(
                item.qty ??
                item.quantity ??
                0,
              ),

              price: Number(
                item.price ??
                PRICE_BY_NAME[
                  item.name
                ] ??
                0,
              ),

              fulfillments:
                normalizeFulfillments(
                  parsePossibleJson(
                    item.fulfillments ??
                      item.fulfillments_json,

                    {},
                  ),
                ),
            };
          },
        )
      : [];

  return {
    ...order,

    id: String(
      order.id ??
      order.orderId ??
      order.order_id ??
      fallbackId,
    ),

    customerName: String(
      order.customerName ??
      order.customer_name ??
      "Unknown",
    ),

    site: String(
      order.site || "",
    ).toLowerCase(),

    notes: String(
      order.notes ?? "",
    ),

    grandTotal: Number(
      order.grandTotal ??
      order.grand_total ??
      0,
    ),

    status: String(
      order.status ||
      "pending",
    ).toLowerCase(),

    createdAt:
      order.createdAt ??
      order.created_at ??
      Date.now(),

    updatedAt:
      order.updatedAt ??
      order.updated_at ??
      null,

    completedAt:
      order.completedAt ??
      order.completed_at ??
      null,

    items,
  };
}

function normalizeFulfillments(
  value,
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {};
  }

  if (Array.isArray(value)) {
    return Object.fromEntries(
      value
        .filter(Boolean)
        .map((entry) => [
          String(
            entry.badge ??
            entry.employeeBadge ??
            entry.employee_badge ??
            "",
          ),

          Number(
            entry.quantity ??
            entry.qty ??
            0,
          ),
        ])
        .filter(
          ([badge, quantity]) =>
            badge &&
            quantity > 0,
        ),
    );
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(
        ([badge, quantity]) => [
          String(badge),
          Number(quantity || 0),
        ],
      )
      .filter(
        ([, quantity]) =>
          quantity > 0,
      ),
  );
}

function parsePossibleJson(
  value,
  fallback,
) {
  if (
    typeof value !== "string"
  ) {
    return value ?? fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function sendDiscord(site, payload) {
  try {
    const response = await fetch(
      API.discord, 
      {
        method: "POST",

        headers: {
          "Content-Type":
           "application/json",
        },

        credentials: "same-origin",
        
        body: JSON.stringify({
            site,
            payload,
        }),
      },
    );

    const result = 
      await readJsonSafely(response);

    if (
      !response.ok &&
     result?.success === false
    ) {
      console.error(
        "Discord notification failed:",
        results?.error ||
        `Status ${response.status}`,
      );

      return false;
    }

    console.log(
      `Discord notification sent to $(site).`,
    );

    return true;
  } catch (error) {
    console.error(
      "Discord notification failed:",
      error,
    );

    return false;
    }
  }



async function sendNewOrderNotification(
  order,
) {
  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const itemList = items
    .map(
      (item) =>
        `> **x${Number(
          item.qty || 0,
        )}** ` +
        `${item.name} — ` +
        `${money(
          Number(item.price || 0) *
          Number(item.qty || 0),
        )}`,
    )
    .join("\n")
    .slice(0, 1000);

  return sendDiscord(order.site, {
    embeds: [
      {
        title:
          "⛩️ NEW ORDER RECEIVED",

        color: 9109504,

        fields: [
          {
            name: "👤 Customer",

            value: String(
              order.customerName ||
              "Unknown",
            ).slice(0, 1024),

            inline: true,
          },

          {
            name: "📍 Site",

            value: String(
              order.site || "Not selected",
            ).toUpperCase(),
            
            inline:true,
          },

          {
            name: "💰 Total",

            value: money(
              order.grandTotal,
            ),

            inline: true,
          },

          {
            name: "📦 Items",

            value:
              `${items.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.qty || 0,
                  ),
                0,
              )} items`,

            inline: true,
          },

          {
            name: "🛒 Order",
            value: itemList || "—",
          },

          ...(
            order.notes
              ? [
                  {
                    name: "📝 Notes",

                    value: String(
                      order.notes,
                    ).slice(
                      0,
                      1024,
                    ),
                  },
                ]
              : []
          ),
        ],

        footer: {
          text:
            `Order ID: ${order.id} • ` +
            new Date()
              .toLocaleString(),
        },
      },
    ],
  });
}

async function sendOrderCompleteNotification(
  order,
  breakdown,
) {
  const employeeList =
    (breakdown || [])
      .map(
        (employee) =>
          `> **Badge #${employee.badge}** — ` +
          `${employee.pct.toFixed(1)}% — ` +
          `${money(employee.earned)}`,
      )
      .join("\n")
      .slice(0, 1024);

  return sendDiscord(order.site, {
    embeds: [
      {
        title:
          "✅ ORDER COMPLETE",

        color: 3066993,

        fields: [
          {
            name: "👤 Customer",

            value: String(
              order.customerName ||
              "Unknown",
            ).slice(0, 1024),

            inline: true,
          },

          {
            name:
              "💰 Order Total",

            value: money(
              order.grandTotal ||
              calculateOrderStats(
                order,
              ).totalValue,
            ),

            inline: true,
          },

          {
            name:
              "👥 Fulfilled By",

            value:
              employeeList || "—",
          },
        ],

        footer: {
          text:
            `Order ID: ${order.id} • ` +
            new Date()
              .toLocaleString(),
        },
      },
    ],
  });
}

async function sendItemFulfilledNotification(
  site,
  orderId,
  customerName,
  badge,
  itemName,
  quantity,
  value,
) {
  return sendDiscord(site, {
    embeds: [
      {
        title:
          "📦 ITEM FULFILLED",

        color: 15965202,

        fields: [
          {
            name: "Order",

            value: String(
              customerName ||
              "Unknown",
            ).slice(0, 1024),

            inline: true,
          },

          {
            name: "Badge",
            value: `#${badge}`,
            inline: true,
          },

          {
            name: "Item",

            value:
              `x${quantity} ${itemName} — ` +
              money(value),

            inline: false,
          },
        ],

        footer: {
          text:
            `Order ID: ${orderId}`,
        },
      },
    ],
  });
}

function calculateOrderStats(
  order,
) {
  let totalValue = 0;
  let filledValue = 0;

  const employeeValue = {};

  for (
    const item of
      order.items || []
  ) {
    const price = Number(
      item.price ??
      PRICE_BY_NAME[
        item.name
      ] ??
      0,
    );

    const quantity =
      Number(item.qty || 0);

    totalValue +=
      price * quantity;

    for (
      const [
        badge,
        fulfilledQuantity,
      ] of Object.entries(
        item.fulfillments || {},
      )
    ) {
      const safeQuantity =
        Math.max(
          0,
          Number(
            fulfilledQuantity || 0,
          ),
        );

      const value =
        price * safeQuantity;

      filledValue += value;

      employeeValue[badge] =
        Number(
          employeeValue[badge] ||
          0,
        ) + value;
    }
  }

  filledValue = Math.min(
    filledValue,
    totalValue,
  );

  const pct =
    totalValue > 0
      ? (
          filledValue /
          totalValue
        ) * 100
      : 0;

  const empBreakdown =
    Object.entries(
      employeeValue,
    )
      .map(
        ([badge, earned]) => ({
          badge,
          earned,

          pct:
            totalValue > 0
              ? (
                  earned /
                  totalValue
                ) * 100
              : 0,
        }),
      )
      .sort(
        (
          employeeA,
          employeeB,
        ) =>
          employeeB.earned -
          employeeA.earned,
      );

  return {
    totalValue,
    filledValue,
    pct,
    empBreakdown,
  };
}

function getFilledQuantity(
  item,
) {
  const fulfilled =
    Object.values(
      item.fulfillments || {},
    ).reduce(
      (sum, quantity) =>
        sum +
        Math.max(
          0,
          Number(quantity || 0),
        ),

      0,
    );

  return Math.min(
    fulfilled,
    Math.max(
      0,
      Number(item.qty || 0),
    ),
  );
}

function getSortedOrders() {
  return Object.entries(
    state.orders || {},
  )
    .map(([id, order]) => ({
      ...order,
      id,
    }))
    .sort(
      (orderA, orderB) =>
        timestampValue(
          orderB.createdAt,
        ) -
        timestampValue(
          orderA.createdAt,
        ),
    );
}

function getCartCount() {
  return Object.values(
    state.cart,
  ).reduce(
    (sum, quantity) =>
      sum +
      Number(quantity || 0),

    0,
  );
}

function getCartTotal() {
  return Object.entries(
    state.cart,
  ).reduce(
    (
      sum,
      [name, quantity],
    ) =>
      sum +
      Number(
        PRICE_BY_NAME[name] || 0,
      ) *
      Number(quantity || 0),

    0,
  );
}

function employeeColor(badge) {
  const text =
    String(badge || "0");

  let hash = 0;

  for (const character of text) {
    hash =
      (
        hash * 31 +
        character.charCodeAt(0)
      ) | 0;
  }

  const index =
    Math.abs(hash) %
    EMPLOYEE_COLORS.length;

  return EMPLOYEE_COLORS[index];
}

function money(value) {
  const amount =
    Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "$0";
  }

  return amount === 0
    ? "FREE"
    : `$${Math.round(
        amount,
      ).toLocaleString()}`;
}

function timestampValue(value) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    /^\d+$/.test(value)
  ) {
    return Number(value);
  }

  const parsed =
    new Date(value).getTime();

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

function formatDate(timestamp) {
  const value =
    timestampValue(timestamp);

  if (!value) {
    return "";
  }

  return new Date(
    value,
  ).toLocaleString();
}

async function readJsonSafely(
  response,
) {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

function escapeAttribute(value) {
  return escapeHtml(
    value,
  ).replaceAll(
    "`",
    "&#096;",
  );
}
