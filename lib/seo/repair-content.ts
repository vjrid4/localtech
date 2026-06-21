import type { CityData } from "./cities";
import { getCityBySlug, CITIES } from "./cities";

// ── Deterministic hash ────────────────────────────────────────────────────────
export function cityHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], slug: string, offset = 0): T {
  return arr[(cityHash(slug + offset) % arr.length + arr.length) % arr.length];
}

// ── Service metadata ──────────────────────────────────────────────────────────
export type ServiceType = "mobile" | "tv" | "laptop" | "appliance" | "mixer" | "fan" | "geyser" | "water-purifier" | "microwave" | "washing-machine" | "refrigerator" | "ac" | "cctv";

export const SERVICES: Record<ServiceType, {
  label: string;
  shortLabel: string;
  deviceLabel: string;
  emoji: string;
  priceRange: string;
  issues: Array<{ emoji: string; name: string; time: string }>;
}> = {
  mobile: {
    label: "Mobile Phone Repair",
    shortLabel: "Mobile Repair",
    deviceLabel: "phone",
    emoji: "📱",
    priceRange: "₹799 – ₹12,000",
    issues: [
      { emoji: "💔", name: "Cracked Screen", time: "1–3 hrs" },
      { emoji: "🔋", name: "Battery Replacement", time: "30–60 min" },
      { emoji: "⚡", name: "Charging Port", time: "45–90 min" },
      { emoji: "📸", name: "Camera Module", time: "1–2 hrs" },
      { emoji: "💧", name: "Water Damage", time: "2–6 hrs" },
      { emoji: "📶", name: "Software / IMEI", time: "1–3 hrs" },
    ],
  },
  tv: {
    label: "TV Repair",
    shortLabel: "TV Repair",
    deviceLabel: "TV",
    emoji: "📺",
    priceRange: "₹800 – ₹6,500",
    issues: [
      { emoji: "🖥️", name: "Screen Lines / Patches", time: "2–4 hrs" },
      { emoji: "🔌", name: "No Power", time: "1–3 hrs" },
      { emoji: "📡", name: "No Signal / HDMI", time: "1–2 hrs" },
      { emoji: "🔊", name: "Audio Problems", time: "1–2 hrs" },
      { emoji: "🌐", name: "Smart TV / Wi-Fi Issues", time: "1–2 hrs" },
      { emoji: "🎮", name: "Remote Sensor / Board", time: "1–2 hrs" },
    ],
  },
  laptop: {
    label: "Laptop Repair",
    shortLabel: "Laptop Repair",
    deviceLabel: "laptop",
    emoji: "💻",
    priceRange: "₹499 – ₹9,500",
    issues: [
      { emoji: "💔", name: "Screen Replacement", time: "2–4 hrs" },
      { emoji: "🔋", name: "Battery Replacement", time: "30–60 min" },
      { emoji: "⌨️", name: "Keyboard / Trackpad", time: "1–3 hrs" },
      { emoji: "🌡️", name: "Overheating / Fan", time: "1–2 hrs" },
      { emoji: "💾", name: "HDD to SSD Upgrade", time: "1–2 hrs" },
      { emoji: "🔌", name: "Charging Port / DC Jack", time: "1–3 hrs" },
    ],
  },
  appliance: {
    label: "Home Appliance Repair",
    shortLabel: "Appliance Repair",
    deviceLabel: "appliance",
    emoji: "🏠",
    priceRange: "₹350 – ₹4,500",
    issues: [
      { emoji: "❄️", name: "Refrigerator Not Cooling", time: "2–5 hrs" },
      { emoji: "🌡️", name: "AC Not Cooling", time: "1–3 hrs" },
      { emoji: "👕", name: "Washing Machine", time: "2–4 hrs" },
      { emoji: "🍳", name: "Microwave / OTG", time: "1–3 hrs" },
      { emoji: "💨", name: "Geyser / Water Heater", time: "1–2 hrs" },
      { emoji: "🔊", name: "Mixer / Grinder", time: "1–2 hrs" },
    ],
  },
  mixer: {
    label: "Mixer Grinder Repair",
    shortLabel: "Mixer Repair",
    deviceLabel: "mixer grinder",
    emoji: "🌀",
    priceRange: "₹199 – ₹1,500",
    issues: [
      { emoji: "⚡", name: "Motor Not Starting", time: "30–60 min" },
      { emoji: "🔊", name: "Unusual Noise / Vibration", time: "30–60 min" },
      { emoji: "💧", name: "Jar Leaking", time: "15–30 min" },
      { emoji: "🔧", name: "Blade / Coupler Broken", time: "30–45 min" },
      { emoji: "🔌", name: "Switch / Wire Fault", time: "30–60 min" },
      { emoji: "♨️", name: "Overheating / Burning Smell", time: "1–2 hrs" },
    ],
  },
  fan: {
    label: "Ceiling Fan Repair",
    shortLabel: "Fan Repair",
    deviceLabel: "ceiling fan",
    emoji: "💨",
    priceRange: "₹199 – ₹1,200",
    issues: [
      { emoji: "🐌", name: "Fan Running Slow", time: "30–60 min" },
      { emoji: "🔇", name: "Fan Not Starting", time: "30–60 min" },
      { emoji: "🔊", name: "Noise / Wobbling", time: "30–60 min" },
      { emoji: "📡", name: "Remote / BLDC Control", time: "30–60 min" },
      { emoji: "🔌", name: "Capacitor / Regulator", time: "30–45 min" },
      { emoji: "🔧", name: "Blade / Bearing Replacement", time: "45–90 min" },
    ],
  },
  geyser: {
    label: "Geyser / Water Heater Repair",
    shortLabel: "Geyser Repair",
    deviceLabel: "geyser",
    emoji: "🚿",
    priceRange: "₹249 – ₹2,500",
    issues: [
      { emoji: "❄️", name: "Not Heating Water", time: "1–2 hrs" },
      { emoji: "💧", name: "Water Leakage", time: "1–3 hrs" },
      { emoji: "⚡", name: "Thermostat / Element Failure", time: "1–2 hrs" },
      { emoji: "🔌", name: "No Power / Tripping MCB", time: "30–60 min" },
      { emoji: "♨️", name: "Overheating", time: "1–2 hrs" },
      { emoji: "🔧", name: "Anode Rod / Inlet Valve", time: "1–2 hrs" },
    ],
  },
  "water-purifier": {
    label: "Water Purifier Repair",
    shortLabel: "RO Repair",
    deviceLabel: "water purifier",
    emoji: "💧",
    priceRange: "₹299 – ₹3,500",
    issues: [
      { emoji: "💧", name: "Low / No Water Output", time: "1–2 hrs" },
      { emoji: "🔊", name: "Unusual Taste / Odour", time: "1–2 hrs" },
      { emoji: "💦", name: "Leaking from Tank", time: "1–2 hrs" },
      { emoji: "⚡", name: "Pump Not Working", time: "1–3 hrs" },
      { emoji: "🔧", name: "Filter / Membrane Change", time: "45–90 min" },
      { emoji: "📊", name: "TDS Meter / Indicator", time: "30–60 min" },
    ],
  },
  microwave: {
    label: "Microwave Oven Repair",
    shortLabel: "Microwave Repair",
    deviceLabel: "microwave oven",
    emoji: "📦",
    priceRange: "₹349 – ₹3,000",
    issues: [
      { emoji: "⚡", name: "Not Heating", time: "1–3 hrs" },
      { emoji: "🔌", name: "Not Turning On", time: "30–60 min" },
      { emoji: "🔊", name: "Unusual Noise", time: "1–2 hrs" },
      { emoji: "💡", name: "Interior Light / Display", time: "30–60 min" },
      { emoji: "🚪", name: "Door / Latch Problem", time: "30–90 min" },
      { emoji: "⏱️", name: "Turntable / Motor", time: "1–2 hrs" },
    ],
  },
  "washing-machine": {
    label: "Washing Machine Repair",
    shortLabel: "Washing Machine Repair",
    deviceLabel: "washing machine",
    emoji: "👕",
    priceRange: "₹399 – ₹4,000",
    issues: [
      { emoji: "💧", name: "Not Draining Water", time: "1–3 hrs" },
      { emoji: "🔊", name: "Excessive Noise / Vibration", time: "1–2 hrs" },
      { emoji: "⚡", name: "Not Starting / Power Issues", time: "30–60 min" },
      { emoji: "🔧", name: "Drum / Bearing Fault", time: "2–5 hrs" },
      { emoji: "💦", name: "Water Leakage", time: "1–3 hrs" },
      { emoji: "📺", name: "Display / Control Panel", time: "1–2 hrs" },
    ],
  },
  refrigerator: {
    label: "Refrigerator Repair",
    shortLabel: "Refrigerator Repair",
    deviceLabel: "refrigerator",
    emoji: "❄️",
    priceRange: "₹499 – ₹5,000",
    issues: [
      { emoji: "❄️", name: "Not Cooling Properly", time: "2–5 hrs" },
      { emoji: "🧊", name: "Ice Maker / Defrost", time: "2–4 hrs" },
      { emoji: "💧", name: "Water Leaking Inside", time: "1–3 hrs" },
      { emoji: "🔊", name: "Loud Noise / Vibration", time: "1–3 hrs" },
      { emoji: "💡", name: "Interior Light / Display", time: "30–60 min" },
      { emoji: "🔧", name: "Compressor / Gas Refill", time: "3–6 hrs" },
    ],
  },
  ac: {
    label: "AC Repair & Service",
    shortLabel: "AC Repair",
    deviceLabel: "air conditioner",
    emoji: "❄️",
    priceRange: "₹499 – ₹6,000",
    issues: [
      { emoji: "❄️", name: "AC Not Cooling", time: "1–3 hrs" },
      { emoji: "💧", name: "Water Dripping / Leaking", time: "1–2 hrs" },
      { emoji: "🔊", name: "Noise from Indoor Unit", time: "1–2 hrs" },
      { emoji: "🌡️", name: "Gas Recharge / Refill", time: "1–2 hrs" },
      { emoji: "⚡", name: "Compressor / PCB Fault", time: "2–5 hrs" },
      { emoji: "🧹", name: "AC Deep Cleaning / Service", time: "1–2 hrs" },
    ],
  },
  cctv: {
    label: "CCTV Installation & Repair",
    shortLabel: "CCTV Repair",
    deviceLabel: "CCTV camera",
    emoji: "📷",
    priceRange: "₹499 – ₹8,000",
    issues: [
      { emoji: "📷", name: "No Video / Blank Screen", time: "1–3 hrs" },
      { emoji: "🌙", name: "Night Vision Not Working", time: "1–2 hrs" },
      { emoji: "💾", name: "DVR / NVR Issue", time: "1–3 hrs" },
      { emoji: "🌐", name: "Remote / App Access", time: "1–2 hrs" },
      { emoji: "🔌", name: "Power / Cable Fault", time: "30–90 min" },
      { emoji: "📡", name: "New Camera Installation", time: "2–4 hrs" },
    ],
  },
};

// ── Pricing ───────────────────────────────────────────────────────────────────
export interface PriceRow {
  brand: string;
  screen: string;
  battery: string;
  port: string;
}

export function getPricing(priceIndex: number): PriceRow[] {
  const p = priceIndex;
  const fmt = (min: number, max: number) =>
    `₹${Math.round(min * p).toLocaleString("en-IN")} – ₹${Math.round(max * p).toLocaleString("en-IN")}`;
  return [
    { brand: "iPhone 15 / 15 Pro", screen: fmt(4500, 12000), battery: fmt(1299, 1799), port: `₹${Math.round(699 * p)}` },
    { brand: "iPhone 13 / 14", screen: fmt(2800, 7500), battery: fmt(999, 1499), port: `₹${Math.round(649 * p)}` },
    { brand: "iPhone 12 and older", screen: fmt(1800, 4500), battery: fmt(899, 1299), port: `₹${Math.round(549 * p)}` },
    { brand: "Samsung Galaxy S24/S23", screen: fmt(2500, 5500), battery: fmt(849, 1499), port: `₹${Math.round(549 * p)}` },
    { brand: "Samsung Galaxy A54/A35", screen: fmt(1200, 2800), battery: fmt(649, 999), port: `₹${Math.round(449 * p)}` },
    { brand: "OnePlus 11/12 / Nothing Phone", screen: fmt(1800, 3800), battery: fmt(749, 1199), port: `₹${Math.round(449 * p)}` },
    { brand: "Xiaomi / Redmi Note series", screen: fmt(799, 1800), battery: fmt(499, 799), port: `₹${Math.round(349 * p)}` },
    { brand: "Realme / OPPO / Vivo", screen: fmt(749, 1600), battery: fmt(449, 749), port: `₹${Math.round(349 * p)}` },
  ];
}

// ── Intro variants ─────────────────────────────────────────────────────────────
const MOBILE_INTROS = [
  (city: string) =>
    `Cracked screens and dead batteries are the two most common reasons people in ${city} lose a day of productivity. LocalTech's certified technicians fix both — at your home, office, or café — usually within 90 minutes of arrival.`,
  (city: string) =>
    `Most phone repairs in ${city} don't need a service centre. A cracked screen, worn battery, or faulty port can be fixed doorstep by a verified LocalTech technician with OEM-grade parts and a 30-day warranty.`,
  (city: string) =>
    `${city}'s repair shops vary wildly in quality and honesty. LocalTech removes the guesswork — every technician is background-verified, every quote is written before work starts, and every repair carries a 30-day parts warranty.`,
  (city: string) =>
    `The average phone repair in ${city} takes under two hours when you don't have to travel. LocalTech sends a certified technician to wherever you are — bringing tools, parts, and a warranty card.`,
  (city: string) =>
    `Phone repair in ${city} used to mean haggling over prices at a local shop. LocalTech publishes transparent prices, sends a verified tech to your door, and backs every repair with a 30-day warranty. No surprises.`,
];

const TV_INTROS = [
  (city: string) =>
    `A TV breakdown in ${city} usually happens at the worst possible moment. LocalTech's certified TV technicians diagnose the fault at your home and carry common parts — most repairs are done in a single visit.`,
  (city: string) =>
    `Carrying a flat-screen TV to a service centre in ${city} is neither practical nor necessary. LocalTech sends a verified technician to your home with the tools and parts for panel, board, and smart-TV repairs.`,
  (city: string) =>
    `TV repairs in ${city} done at home by a LocalTech technician avoid transport damage and the uncertainty of leaving your set at an unknown shop. You watch the repair happen — and get a 30-day warranty in writing.`,
  (city: string) =>
    `From 32-inch budget TVs to 75-inch OLED panels, LocalTech's ${city} technicians handle all brands and all fault types — no-power, screen lines, HDMI issues, and smart-TV software faults — at your doorstep.`,
  (city: string) =>
    `Most TV faults in ${city} are diagnosed in under 20 minutes by an experienced technician. LocalTech puts that expertise at your door — background-verified, with a written quote before any part is touched.`,
];

const LAPTOP_INTROS = [
  (city: string) =>
    `A laptop out of action in ${city} means lost work hours, not just inconvenience. LocalTech's certified technicians come to your office or home with common parts — screens, batteries, keyboards — and fix most issues in one visit.`,
  (city: string) =>
    `Laptop repairs in ${city} done at service centres often mean a 3–7 day wait. LocalTech cuts that to hours — a verified technician at your desk, a written quote, and a 30-day warranty on parts and labour.`,
  (city: string) =>
    `${city}'s growing tech workforce can't afford laptop downtime. LocalTech provides doorstep repair with certified technicians who carry parts for all major brands — Dell, HP, Lenovo, MacBook, Asus — and fix most faults same day.`,
  (city: string) =>
    `Whether your laptop has a shattered screen, a swollen battery, or an overheating fan, LocalTech's ${city} technicians diagnose and fix it at your location — no need to back up data and hand over the device to a stranger.`,
  (city: string) =>
    `Laptop repair in ${city} shouldn't involve a week-long service centre visit. LocalTech gets a verified, insured technician to your address — typically within 3 hours of booking — with parts for the most common repairs.`,
];

const APPLIANCE_INTROS = [
  (city: string) =>
    `A fridge that stops cooling or a washing machine that won't drain in ${city} means calling someone you don't know from a pamphlet. LocalTech's verified appliance technicians carry ID, have background checks, and give you a written quote first.`,
  (city: string) =>
    `Appliance repair in ${city} is often opaque on pricing. LocalTech changes that — transparent rate cards, verified technicians, and a 30-day warranty so you're not calling again next week for the same fault.`,
  (city: string) =>
    `From AC servicing to refrigerator gas refill, LocalTech covers all major appliance repair needs in ${city}. Every technician has been skills-tested and carries the tools for a same-day fix.`,
  (city: string) =>
    `Home appliance faults in ${city} often get worse if ignored. LocalTech's same-day service gets a certified technician to your home before a small issue becomes a costly replacement.`,
  (city: string) =>
    `${city}'s summer heat makes a functioning AC non-negotiable. LocalTech's appliance technicians cover AC service, gas refill, and board-level repairs — all at your home, with upfront pricing and a written warranty.`,
];

const MIXER_INTROS = [
  (city: string) =>
    `A mixer grinder that stops mid-grind or runs too hot is a kitchen emergency. LocalTech's certified appliance technicians in ${city} repair all brands of mixer grinders at your home — motor faults, leaky jars, broken couplers — usually within the hour.`,
  (city: string) =>
    `Mixer grinder repair in ${city} doesn't need a service centre trip. LocalTech sends a verified technician to your kitchen with spare motors, blades, and jars for all major brands. Fixed price, 30-day warranty, doorstep.`,
];

const FAN_INTROS = [
  (city: string) =>
    `A slow ceiling fan in ${city}'s summer heat is more than an inconvenience. LocalTech's certified technicians diagnose and fix BLDC, ceiling, and exhaust fans at your home — capacitors, regulators, bearings, remotes — with same-day service.`,
  (city: string) =>
    `Fan repair in ${city} is done right when a verified technician comes to your home with parts. LocalTech covers all brands — Atomberg, Havells, Orient, Crompton — with a written quote before any work starts.`,
];

const GEYSER_INTROS = [
  (city: string) =>
    `A geyser that won't heat or leaks inside the wall is urgent. LocalTech's ${city} technicians are trained in electric and instant geysers, replacing heating elements, thermostats, and inlet valves — at your bathroom, same day.`,
  (city: string) =>
    `Geyser repair in ${city} by a LocalTech verified technician means a written quote and 30-day warranty. We cover Racold, AO Smith, V-Guard, Bajaj, Havells — all repaired at your home without removing the unit.`,
];

const RO_INTROS = [
  (city: string) =>
    `An RO that gives less water or smells off is a health concern, not just a convenience issue. LocalTech's ${city} water purifier technicians service Kent, Eureka Forbes, Pureit, Livpure — at your home, with genuine filter replacements.`,
  (city: string) =>
    `Water purifier service in ${city} by LocalTech includes filter change, membrane replacement, and pump repair — all at your kitchen, with documented work and a 30-day warranty on parts.`,
];

const MICROWAVE_INTROS = [
  (city: string) =>
    `A microwave that won't heat or has a faulty turntable disrupts daily cooking. LocalTech's ${city} technicians repair LG, Samsung, IFB, Whirlpool microwaves at your home — magnetron, door latch, PCB faults — same day.`,
  (city: string) =>
    `Microwave repair in ${city} by a LocalTech verified technician means you get a diagnosed, quoted, and fixed oven — without carrying it anywhere. 30-day warranty on all parts replaced.`,
];

const WM_INTROS = [
  (city: string) =>
    `A washing machine that won't drain or shakes violently is a load-bearing problem for any household. LocalTech's ${city} technicians repair fully automatic and semi-automatic machines — Samsung, LG, Whirlpool, IFB — at your home, same day.`,
  (city: string) =>
    `Washing machine repair in ${city} by LocalTech means a technician at your door with the right parts. No waiting for a service centre slot — drum, pump, PCB, or door seal faults are diagnosed and fixed with a written quote first.`,
];

const FRIDGE_INTROS = [
  (city: string) =>
    `A refrigerator that stops cooling in ${city}'s heat is an emergency. LocalTech's certified technicians handle compressor checks, gas refill, thermostat and defrost faults — at your kitchen, with upfront pricing and a 30-day warranty.`,
  (city: string) =>
    `Refrigerator repair in ${city} is faster with LocalTech — no carrying a 200kg appliance anywhere. Our verified technicians service Samsung, LG, Whirlpool, Godrej, Haier at your home with spare parts stocked for common models.`,
];

const AC_INTROS = [
  (city: string) =>
    `In ${city}'s peak summer, an AC that stops cooling isn't a convenience problem — it's a health issue. LocalTech's certified technicians handle gas refill, compressor check, PCB faults, and deep cleaning at your home, same day.`,
  (city: string) =>
    `AC repair and service in ${city} by LocalTech: a verified, insured technician at your home, a written estimate before work starts, and a 30-day warranty. We service Daikin, Voltas, Blue Star, Carrier, Hitachi, Samsung, LG.`,
];

const CCTV_INTROS = [
  (city: string) =>
    `A CCTV system that goes blind at night or loses remote access defeats its purpose. LocalTech's ${city} security camera technicians fix Hikvision, CP Plus, Dahua systems — camera faults, DVR/NVR issues, app connectivity — at your premises.`,
  (city: string) =>
    `CCTV repair and installation in ${city} by LocalTech's verified technicians: new camera installation, cable routing, DVR setup, and fault diagnosis — for home, shop, or office — with fixed pricing and a written warranty.`,
];

export function getIntroVariant(slug: string, cityName: string, service: ServiceType): string {
  const pools: Record<ServiceType, Array<(city: string) => string>> = {
    mobile: MOBILE_INTROS,
    tv: TV_INTROS,
    laptop: LAPTOP_INTROS,
    appliance: APPLIANCE_INTROS,
    mixer: MIXER_INTROS,
    fan: FAN_INTROS,
    geyser: GEYSER_INTROS,
    "water-purifier": RO_INTROS,
    microwave: MICROWAVE_INTROS,
    "washing-machine": WM_INTROS,
    refrigerator: FRIDGE_INTROS,
    ac: AC_INTROS,
    cctv: CCTV_INTROS,
  };
  const fn = pick(pools[service], slug);
  return fn(cityName);
}

// ── Testimonials ──────────────────────────────────────────────────────────────
interface Testimonial {
  name: string;
  device: string;
  stars: number;
  text: string;
}

const TESTIMONIAL_POOL: Array<(area: string) => Testimonial> = [
  (area) => ({
    name: "Rahul M.",
    device: "Samsung Galaxy A54",
    stars: 5,
    text: `Screen cracked after dropping it in ${area}. Technician arrived within 45 minutes, replaced the display in about an hour, and gave me a printed warranty card. Phone looks brand new.`,
  }),
  (area) => ({
    name: "Priya S.",
    device: "iPhone 14",
    stars: 5,
    text: `Battery was at 71% health and dying by afternoon. The tech came to my office in ${area}, swapped it in 40 minutes without touching my data. Quoted ₹1,200 upfront, that's exactly what I paid.`,
  }),
  (area) => ({
    name: "Arun K.",
    device: "OnePlus 11",
    stars: 5,
    text: `Charging port stopped working — phone only charged wirelessly. LocalTech tech fixed the port same day, came to my flat in ${area}. Charged fine ever since. 30-day warranty is reassuring.`,
  }),
  (area) => ({
    name: "Sneha R.",
    device: "Redmi Note 12",
    stars: 5,
    text: `Phone got wet in the rain near ${area}. Gave it to the LocalTech technician the same evening. They cleaned the board and replaced a blown component. Works completely fine now.`,
  }),
  (area) => ({
    name: "Vikram T.",
    device: "iPhone 13 Pro",
    stars: 5,
    text: `Back glass was shattered and Face ID was glitching. The repair tech came to my home in ${area}, used an OEM screen assembly, and confirmed Face ID was working before leaving. Solid experience.`,
  }),
  (area) => ({
    name: "Kavita L.",
    device: "Samsung Galaxy S23",
    stars: 4,
    text: `Camera module had autofocus issues. Tech diagnosed it in ${area} and ordered the part; came back next morning and fixed it. Only gripe is the one-day wait, but the repair itself was perfect.`,
  }),
  (area) => ({
    name: "Deepak N.",
    device: "Realme 11 Pro",
    stars: 5,
    text: `Speaker stopped working suddenly. Repair tech came to ${area} in under an hour, diagnosed a blown speaker, replaced it on the spot. Now it's louder than ever. Great value for money.`,
  }),
  (area) => ({
    name: "Anita P.",
    device: "Vivo V27",
    stars: 5,
    text: `Volume buttons had stopped responding. The technician came to my office near ${area}, replaced the side-button flex, and had the phone back to me in 50 minutes. Very professional.`,
  }),
];

export function getTestimonials(slug: string, city: CityData): Testimonial[] {
  const areaPool = city.areas;
  return [0, 1, 2].map((i) => {
    const fn = pick(TESTIMONIAL_POOL, slug + i);
    const area = pick(areaPool, slug + "area" + i);
    return fn(area);
  });
}

// ── FAQs ──────────────────────────────────────────────────────────────────────
export interface FAQ {
  q: string;
  a: string;
}

export function getFAQs(slug: string, city: CityData, service: ServiceType): FAQ[] {
  const svc = SERVICES[service];
  const universal: FAQ[] = [
    {
      q: `Is my data safe when you repair my ${svc.deviceLabel} in ${city.name}?`,
      a: `Yes. LocalTech technicians in ${city.name} are trained to never access personal data, photos, or accounts. For phone repairs, the technician only powers on the device to verify the repaired hardware works — they do not unlock it or browse files. You can also enable a screen lock before handing over the device.`,
    },
    {
      q: `Do you offer doorstep ${svc.shortLabel} in ${city.name}?`,
      a: `Yes — doorstep service is the default. A verified LocalTech technician comes to your home, office, or any address in ${city.name}. We cover all major areas including ${city.areas.slice(0, 4).join(", ")}, and more. Average response time is ${city.responseMinutes} minutes after booking.`,
    },
    {
      q: `What warranty do I get on ${svc.shortLabel} in ${city.name}?`,
      a: `Every repair by a LocalTech technician in ${city.name} carries a 30-day parts and labour warranty. If the same fault recurs within 30 days of the repair, we send a technician back at no extra charge. The warranty card is issued at the end of the repair visit.`,
    },
  ];

  const rotating: FAQ[] = [
    {
      q: `How long does screen replacement take in ${city.name}?`,
      a: `Most screen replacements in ${city.name} are completed in 60–90 minutes at your location. The technician carries common display assemblies for popular models. If your model needs a part order, you'll be informed upfront and a follow-up visit is scheduled within 24–48 hours.`,
    },
    {
      q: `Is it worth repairing a 3-year-old phone in ${city.name}?`,
      a: `Usually yes — if the hardware is functional and the repair cost is under 40% of replacement value. A ${city.name} LocalTech technician will give you an honest assessment. For an older flagship like a Samsung S20 or iPhone 11, a battery replacement (₹${Math.round(999 * city.priceIndex)}) gives another 2 years of performance.`,
    },
    {
      q: `Can you repair water-damaged phones in ${city.name}?`,
      a: `Yes. Bring the device in as dry as possible and book immediately — the faster the response, the better the chances of a full recovery. LocalTech technicians in ${city.name} perform board-level ultrasonic cleaning, component-level checks, and part replacement. Success rates are highest within 24 hours of exposure.`,
    },
    {
      q: `Do you use original parts for iPhone repair in ${city.name}?`,
      a: `For iPhones, LocalTech uses OEM-grade or Apple-sourced (where available) replacement parts in ${city.name}. The technician will confirm part grade before starting — you can choose between Grade-A OEM and original Apple service parts (where available). Grade-A OEM parts come with the standard 30-day warranty.`,
    },
    {
      q: `How much does mobile repair cost in ${city.name} compared to the manufacturer?`,
      a: `Authorised service centres charge 20–60% more for the same repair — and typically take 3–7 working days. LocalTech in ${city.name} offers the same quality parts at honest market rates, doorstep, same day. For example, an iPhone 13 battery at an Apple-authorised centre costs ₹2,500+; LocalTech charges ₹${Math.round(1100 * city.priceIndex)}.`,
    },
    {
      q: `Can I get a same-day repair in ${city.name}?`,
      a: `Yes — same-day repair is standard for common issues like screen cracks, battery replacement, and charging port repair in ${city.name}. Book before 4 PM and a technician will typically reach you within ${city.responseMinutes} minutes. Parts for popular models like iPhone, Samsung Galaxy A-series, and Redmi are carried in stock.`,
    },
    {
      q: `How do I track my repair in ${city.name}?`,
      a: `After booking, you'll receive a reference number. Visit localtech.in/track or reply to your booking SMS to get live updates — technician en route, repair started, repair complete. You'll also get a WhatsApp notification when your warranty card is issued.`,
    },
    {
      q: `What if the repair fails or the fault comes back in ${city.name}?`,
      a: `If the same fault recurs within 30 days of repair in ${city.name}, LocalTech sends a technician back at zero cost — no re-booking fee, no argument. If a replaced part is found to be defective, it will be replaced at no charge under the parts warranty.`,
    },
  ];

  // Pick 2 from rotating pool using hash
  const r1 = pick(rotating, slug + "faq1");
  const r2 = pick(rotating.filter((f) => f.q !== r1.q), slug + "faq2");

  return [...universal, r1, r2];
}

// ── Nearby links ───────────────────────────────────────────────────────────────
export function getNearbyLinks(slug: string): CityData[] {
  const city = getCityBySlug(slug);
  if (!city) return [];
  const results: CityData[] = [];
  if (city.nearbyCity) {
    const nearby = getCityBySlug(city.nearbyCity);
    if (nearby) results.push(nearby);
  }
  // Add 2 more same-tier cities
  const sameTier = CITIES.filter((c) => c.tier === city.tier && c.slug !== slug && c.slug !== city.nearbyCity);
  const extra = [pick(sameTier, slug + "nearby1"), pick(sameTier.filter((c) => c.slug !== pick(sameTier, slug + "nearby1").slug), slug + "nearby2")];
  return [...results, ...extra].slice(0, 4);
}
