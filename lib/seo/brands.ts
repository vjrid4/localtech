import type { ServiceType } from "./repair-content";

export type Brand = {
  name: string;
  slug: string;
  services: ServiceType[];
  models?: string[];
  founded?: string;
  origin?: string;
};

export const BRANDS: Brand[] = [
  // ── Mobile ──────────────────────────────────────────────────────────────────
  {
    name: "Samsung",
    slug: "samsung",
    services: ["mobile", "tv", "refrigerator", "washing-machine", "ac", "microwave"],
    models: ["Galaxy S24", "Galaxy S23", "Galaxy A55", "Galaxy A35", "Galaxy M34", "Galaxy F55"],
    origin: "South Korea",
  },
  {
    name: "Apple",
    slug: "apple",
    services: ["mobile", "laptop"],
    models: ["iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "MacBook Air", "MacBook Pro"],
    origin: "USA",
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    services: ["mobile", "tv"],
    models: ["OnePlus 12", "OnePlus 11", "OnePlus Nord 4", "OnePlus Nord CE 4"],
    origin: "China",
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    services: ["mobile", "tv"],
    models: ["Redmi Note 13", "Redmi Note 12", "Mi 11X", "POCO F5", "POCO X6"],
    origin: "China",
  },
  {
    name: "Realme",
    slug: "realme",
    services: ["mobile"],
    models: ["Realme 12 Pro", "Realme 11 Pro", "Realme GT 6", "Realme Narzo 70"],
    origin: "China",
  },
  {
    name: "OPPO",
    slug: "oppo",
    services: ["mobile"],
    models: ["OPPO Reno 12", "OPPO Reno 11", "OPPO A79", "OPPO A78"],
    origin: "China",
  },
  {
    name: "Vivo",
    slug: "vivo",
    services: ["mobile"],
    models: ["Vivo V30", "Vivo V29", "Vivo Y200", "Vivo T3"],
    origin: "China",
  },
  {
    name: "Motorola",
    slug: "motorola",
    services: ["mobile"],
    models: ["Motorola Edge 50 Pro", "Motorola G84", "Motorola G73", "Motorola Edge 40"],
    origin: "USA",
  },
  {
    name: "Nokia",
    slug: "nokia",
    services: ["mobile"],
    models: ["Nokia G42", "Nokia G21", "Nokia C32", "Nokia C12"],
    origin: "Finland",
  },
  {
    name: "iQOO",
    slug: "iqoo",
    services: ["mobile"],
    models: ["iQOO 12", "iQOO 11", "iQOO Neo 9 Pro", "iQOO Z9"],
    origin: "China",
  },
  // ── TV ────────────────────────────────────────────────────────────────────
  {
    name: "LG",
    slug: "lg",
    services: ["tv", "refrigerator", "washing-machine", "ac", "microwave"],
    models: ["LG OLED C3", "LG QNED", "LG NanoCell", "LG UHD 4K", "LG Smart TV"],
    origin: "South Korea",
  },
  {
    name: "Sony",
    slug: "sony",
    services: ["tv"],
    models: ["Sony Bravia XR", "Sony Bravia A95L OLED", "Sony X90L", "Sony X80L"],
    origin: "Japan",
  },
  {
    name: "Panasonic",
    slug: "panasonic",
    services: ["tv"],
    models: ["Panasonic TH-55LX700DX", "Panasonic TH-43LX700DX", "Panasonic MX650"],
    origin: "Japan",
  },
  {
    name: "TCL",
    slug: "tcl",
    services: ["tv"],
    models: ["TCL C655", "TCL P735", "TCL S5400A", "TCL 43 inch Smart TV"],
    origin: "China",
  },
  {
    name: "VU",
    slug: "vu",
    services: ["tv"],
    models: ["VU GloLED", "VU 4K QLED", "VU 43 Smart TV", "VU Masterpiece"],
    origin: "India",
  },
  // ── Appliances ─────────────────────────────────────────────────────────────
  {
    name: "Whirlpool",
    slug: "whirlpool",
    services: ["washing-machine", "refrigerator", "ac", "microwave"],
    models: ["Whirlpool 360 Bloomwash", "Whirlpool IntelliFresh", "Whirlpool 1.5 Ton 3 Star"],
    origin: "USA",
  },
  {
    name: "IFB",
    slug: "ifb",
    services: ["washing-machine", "microwave"],
    models: ["IFB Senator Plus SX", "IFB 30 L Convection", "IFB Senorita ZX"],
    origin: "India",
  },
  {
    name: "Bosch",
    slug: "bosch",
    services: ["washing-machine"],
    models: ["Bosch WAJ24262IN", "Bosch WAT24469IN", "Bosch 6 kg Front Load"],
    origin: "Germany",
  },
  {
    name: "Haier",
    slug: "haier",
    services: ["washing-machine", "refrigerator", "ac"],
    models: ["Haier 7 kg Front Load", "Haier 265 L", "Haier 1.5 Ton 5 Star"],
    origin: "China",
  },
  {
    name: "Godrej",
    slug: "godrej",
    services: ["refrigerator", "washing-machine"],
    models: ["Godrej 236 L Double Door", "Godrej 7 kg Semi Automatic", "Godrej NXW 700 AS"],
    origin: "India",
  },
  // ── AC ──────────────────────────────────────────────────────────────────────
  {
    name: "Daikin",
    slug: "daikin",
    services: ["ac"],
    models: ["Daikin 1.5 Ton 5 Star", "Daikin ATKL50TV16W", "Daikin Inverter AC"],
    origin: "Japan",
  },
  {
    name: "Voltas",
    slug: "voltas",
    services: ["ac"],
    models: ["Voltas 1.5 Ton 5 Star", "Voltas Inverter AC", "Voltas Maha Adjustable"],
    origin: "India",
  },
  {
    name: "Blue Star",
    slug: "blue-star",
    services: ["ac"],
    models: ["Blue Star 1.5 Ton 5 Star", "Blue Star FS518IATU", "Blue Star 5 in 1"],
    origin: "India",
  },
  {
    name: "Carrier",
    slug: "carrier",
    services: ["ac"],
    models: ["Carrier 1.5 Ton 5 Star", "Carrier ESTER Neo", "Carrier Flexicool"],
    origin: "USA",
  },
  {
    name: "Hitachi",
    slug: "hitachi",
    services: ["ac"],
    models: ["Hitachi 1.5 Ton 5 Star", "Hitachi Kaze Plus", "Hitachi Frost Wash"],
    origin: "Japan",
  },
  // ── Mixer / Grinder ─────────────────────────────────────────────────────────
  {
    name: "Preethi",
    slug: "preethi",
    services: ["mixer"],
    models: ["Preethi Zodiac", "Preethi Blue Leaf", "Preethi Eco Twin", "Preethi Nitro"],
    origin: "India",
  },
  {
    name: "Butterfly",
    slug: "butterfly",
    services: ["mixer"],
    models: ["Butterfly Jet Elite", "Butterfly Spectra", "Butterfly Matchless"],
    origin: "India",
  },
  {
    name: "Bajaj",
    slug: "bajaj",
    services: ["mixer", "fan", "geyser"],
    models: ["Bajaj Rex", "Bajaj Pluto", "Bajaj GX 3", "Bajaj Platini PX97"],
    origin: "India",
  },
  {
    name: "Prestige",
    slug: "prestige",
    services: ["mixer"],
    models: ["Prestige Iris", "Prestige Stylo", "Prestige Delight", "Prestige Endura"],
    origin: "India",
  },
  {
    name: "Philips",
    slug: "philips",
    services: ["mixer", "fan"],
    models: ["Philips HL7756", "Philips HL7669", "Philips HL7505", "Philips 400W Mixer"],
    origin: "Netherlands",
  },
  {
    name: "Sujata",
    slug: "sujata",
    services: ["mixer"],
    models: ["Sujata Powermatic Plus", "Sujata Dynamix", "Sujata Supermix"],
    origin: "India",
  },
  // ── Fan ──────────────────────────────────────────────────────────────────────
  {
    name: "Atomberg",
    slug: "atomberg",
    services: ["fan"],
    models: ["Atomberg Renesa+", "Atomberg Studio+", "Atomberg Efficio+", "Atomberg Aris+"],
    origin: "India",
  },
  {
    name: "Orient",
    slug: "orient",
    services: ["fan"],
    models: ["Orient Aeroquiet", "Orient Electric i-Float", "Orient Apex-FX", "Orient Wendy"],
    origin: "India",
  },
  {
    name: "Havells",
    slug: "havells",
    services: ["fan", "geyser"],
    models: ["Havells Efficiencia Neo", "Havells Glaze", "Havells Stealth Air", "Havells Ambrose"],
    origin: "India",
  },
  {
    name: "Crompton",
    slug: "crompton",
    services: ["fan"],
    models: ["Crompton SilentPro", "Crompton Energion HS", "Crompton Aura Prime", "Crompton Avancer"],
    origin: "India",
  },
  {
    name: "Usha",
    slug: "usha",
    services: ["fan"],
    models: ["Usha Striker Galaxy", "Usha Aerostyle", "Usha Technix Gossamer", "Usha Bloom Daffodil"],
    origin: "India",
  },
  // ── Geyser ───────────────────────────────────────────────────────────────────
  {
    name: "Racold",
    slug: "racold",
    services: ["geyser"],
    models: ["Racold Pronto Neo", "Racold Eterno 5 Star", "Racold Omnis Pro", "Racold CDR 2.0"],
    origin: "Italy/India",
  },
  {
    name: "AO Smith",
    slug: "ao-smith",
    services: ["geyser", "water-purifier"],
    models: ["AO Smith HSE-SBS-025", "AO Smith EWS 25L", "AO Smith Propoint", "AO Smith Z9"],
    origin: "USA",
  },
  {
    name: "V-Guard",
    slug: "v-guard",
    services: ["geyser"],
    models: ["V-Guard Victo", "V-Guard Steamer", "V-Guard Sprinhot Plus", "V-Guard Pebble"],
    origin: "India",
  },
  // ── Water Purifier ───────────────────────────────────────────────────────────
  {
    name: "Kent",
    slug: "kent",
    services: ["water-purifier"],
    models: ["Kent Grand Plus", "Kent Pearl Plus", "Kent Ace Mineral", "Kent Maxx"],
    origin: "India",
  },
  {
    name: "Eureka Forbes",
    slug: "eureka-forbes",
    services: ["water-purifier"],
    models: ["Aquaguard Aura", "Aquaguard Delight", "Aquaguard Classic", "Aquaguard Nxt"],
    origin: "India",
  },
  {
    name: "HUL Pureit",
    slug: "hul-pureit",
    services: ["water-purifier"],
    models: ["Pureit Eco Water Saver", "Pureit Advanced Pro", "Pureit Vital Plus", "Pureit Classic G2"],
    origin: "India",
  },
  {
    name: "Livpure",
    slug: "livpure",
    services: ["water-purifier"],
    models: ["Livpure Glo Pro", "Livpure Smart Touch", "Livpure Touch 2000 Plus", "Livpure Bolt+"],
    origin: "India",
  },
  // ── Laptop ───────────────────────────────────────────────────────────────────
  {
    name: "Dell",
    slug: "dell",
    services: ["laptop"],
    models: ["Dell Inspiron 15", "Dell XPS 15", "Dell Vostro 3520", "Dell Latitude 3540"],
    origin: "USA",
  },
  {
    name: "HP",
    slug: "hp",
    services: ["laptop"],
    models: ["HP Pavilion 15", "HP Envy 15", "HP Victus 15", "HP ProBook 450"],
    origin: "USA",
  },
  {
    name: "Lenovo",
    slug: "lenovo",
    services: ["laptop"],
    models: ["Lenovo IdeaPad Slim 5", "Lenovo ThinkPad E15", "Lenovo Legion 5", "Lenovo V15"],
    origin: "China",
  },
  {
    name: "Asus",
    slug: "asus",
    services: ["laptop"],
    models: ["Asus VivoBook 15", "Asus ZenBook 14", "Asus ROG Strix G16", "Asus ExpertBook B1"],
    origin: "Taiwan",
  },
  {
    name: "Acer",
    slug: "acer",
    services: ["laptop"],
    models: ["Acer Aspire 5", "Acer Swift Go 14", "Acer Nitro V15", "Acer TravelMate B3"],
    origin: "Taiwan",
  },
  // ── CCTV ────────────────────────────────────────────────────────────────────
  {
    name: "Hikvision",
    slug: "hikvision",
    services: ["cctv"],
    models: ["Hikvision DS-2CD2T47G2", "Hikvision DS-7208HGHI", "Hikvision ColorVu"],
    origin: "China",
  },
  {
    name: "CP Plus",
    slug: "cp-plus",
    services: ["cctv"],
    models: ["CP Plus 2 MP Full HD", "CP Plus A4K Series", "CP Plus 4 Channel DVR"],
    origin: "India",
  },
  {
    name: "Dahua",
    slug: "dahua",
    services: ["cctv"],
    models: ["Dahua IPC-HDW2849H", "Dahua XVR5104H", "Dahua WizSense"],
    origin: "China",
  },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function getBrandsForService(service: ServiceType): Brand[] {
  return BRANDS.filter((b) => b.services.includes(service));
}

export const AP_TS_CITY_SLUGS = [
  "hyderabad", "visakhapatnam", "vijayawada", "guntur", "warangal", "tirupati",
  "nellore", "karimnagar", "rajahmundry", "kakinada",
  // Telangana additions
  "nizamabad", "khammam", "mahabubnagar", "nalgonda", "adilabad", "ramagundam",
  "mancherial", "siddipet", "sangareddy", "suryapet", "miryalaguda", "jagtial",
  "kothagudem", "bhongir", "sircilla", "kamareddy", "nirmal", "nagarkurnool",
  "wanaparthy", "gadwal", "zaheerabad", "vikarabad", "tandur", "jangaon",
  "mahabubabad", "peddapalli", "narsampet", "medak", "bodhan", "bellampally",
  "palvancha", "narayanpet",
  // Andhra Pradesh additions
  "kurnool", "anantapur", "kadapa", "ongole", "chittoor", "madanapalle",
  "kavali", "gudur", "eluru", "bhimavaram", "tanuku", "tadepalligudem",
  "machilipatnam", "gudivada", "tenali", "narasaraopet", "bapatla", "chirala",
  "nandyal", "adoni", "guntakal", "dharmavaram", "hindupur", "proddatur",
  "vizianagaram", "srikakulam", "bobbili", "amalapuram", "anakapalle",
  "narasapuram", "tadpatri", "palasa", "samalkot", "bheemunipatnam",
];
