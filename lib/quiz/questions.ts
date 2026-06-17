/**
 * 60-question bank for the LocalTech technician skills quiz (T15).
 * Categories: display, battery/charging, camera, software/flashing,
 *             network/SIM, audio, water damage, customer service.
 *
 * correctIndex is NEVER sent to the client — it lives server-side only.
 * The start endpoint strips it before returning questions.
 */

export type Question = {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number; // 0 = A, 1 = B, 2 = C, 3 = D
};

export const QUESTIONS: Question[] = [
  // ── Display & Touch (10) ──────────────────────────────────────────────────
  {
    id: 0,
    category: "Display & Touch",
    question: "A Samsung Galaxy S-series shows a faint ghost image of the previous screen (burn-in). What is the most likely cause?",
    options: [
      "Faulty touch IC",
      "AMOLED screen burn-in from static content displayed for too long",
      "LCD backlight failure",
      "Loose display flex cable",
    ],
    correctIndex: 1,
  },
  {
    id: 1,
    category: "Display & Touch",
    question: "An iPhone 14 has no display output but the phone vibrates when called. What should you check first?",
    options: [
      "Battery voltage",
      "Display flex cable connector on the motherboard",
      "SIM slot pins",
      "Charging port",
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    category: "Display & Touch",
    question: "After replacing a OnePlus display, the screen shows correctly but touch is completely unresponsive. What is the most likely cause?",
    options: [
      "Wrong display model installed",
      "Touch IC on motherboard has failed",
      "Touch flex cable not fully seated in its connector",
      "Software needs a factory reset",
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    category: "Display & Touch",
    question: "A Realme phone shows dark spreading ink-like patches on the display after a drop. What type of damage is this?",
    options: [
      "AMOLED pixel burnout",
      "Backlight diffuser cracked",
      "LCD polariser damaged",
      "LCD crystal layer cracked — liquid crystal leaked between layers",
    ],
    correctIndex: 3,
  },
  {
    id: 4,
    category: "Display & Touch",
    question: "After a display replacement on a Xiaomi Redmi, the customer says colours look slightly warm/yellow compared to the original. What is the most likely cause?",
    options: [
      "Wrong colour profile in software",
      "Aftermarket display with different colour temperature than the original OEM panel",
      "Touch IC calibration error",
      "Charging port flex interference",
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    category: "Display & Touch",
    question: "What is the correct tool combination to safely remove an iPhone display with strong adhesive without cracking it?",
    options: [
      "Heat gun on high + flathead screwdriver",
      "Suction cup clamp (iSclack) + heated base + guitar picks",
      "Soldering iron tip to melt adhesive + spudger",
      "Only guitar picks — no heat required",
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    category: "Display & Touch",
    question: "A Vivo V-series phone has multiple thin vertical lines running across the entire screen. What does this typically indicate?",
    options: [
      "Faulty GPU on motherboard",
      "Broken display ribbon or damaged row/column drivers in the panel",
      "Touch IC failure",
      "Dead pixel cluster",
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    category: "Display & Touch",
    question: "When starting any internal phone repair, what should you ALWAYS do first to prevent accidental short circuits?",
    options: [
      "Disconnect the display flex cable",
      "Disconnect the battery connector from the motherboard",
      "Remove the SIM tray",
      "Power off via software first",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    category: "Display & Touch",
    question: "An AMOLED display on a Samsung shows a faint green tint at very low brightness (1–5%). The tint disappears above 20% brightness. What does this indicate?",
    options: [
      "Faulty display — needs replacement",
      "Normal AMOLED PWM behaviour at low duty cycle; different OLED batches vary",
      "Software corruption",
      "Backlight driver failure",
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    category: "Display & Touch",
    question: "A customer complains about 'ghost touch' — the phone registers touches with nobody touching it. What are the two most common causes?",
    options: [
      "Overheating CPU and Wi-Fi interference",
      "Digitiser damage or a swollen battery pushing against the screen from inside",
      "Software bug and wrong charger brand",
      "Earpiece speaker failure and dirty screen",
    ],
    correctIndex: 1,
  },

  // ── Battery & Charging (10) ───────────────────────────────────────────────
  {
    id: 10,
    category: "Battery & Charging",
    question: "A customer's phone charges very slowly even with the original adapter. What is the single most common physical cause and first thing to inspect?",
    options: [
      "Battery degraded below 80% health",
      "Charging port clogged with lint or debris",
      "Wrong wall socket voltage",
      "Display drawing too much power",
    ],
    correctIndex: 1,
  },
  {
    id: 11,
    category: "Battery & Charging",
    question: "A Xiaomi 12 Pro supports 120W HyperCharge but only charges at 18W even with the original adapter. The most likely culprit is:",
    options: [
      "Battery needs replacement",
      "Charging IC on the motherboard is damaged",
      "The USB-C cable is not a high-current (6A) cable",
      "Software bug — clear cache and try again",
    ],
    correctIndex: 2,
  },
  {
    id: 12,
    category: "Battery & Charging",
    question: "A customer brings in a phone with a visibly swollen (bloated) battery. What is the correct procedure?",
    options: [
      "Charge it fully — the swelling usually reduces once charged",
      "Pierce the battery casing to release the gas pressure safely",
      "Handle carefully without puncturing, store away from flammables, and replace immediately — do not charge",
      "Put it in the freezer for 30 minutes to stabilise before working on it",
    ],
    correctIndex: 2,
  },
  {
    id: 13,
    category: "Battery & Charging",
    question: "After replacing an iPhone 12 battery with a high-quality third-party battery, the Settings → Battery → Maximum Capacity shows 50% and a service warning appears. Why?",
    options: [
      "The battery is counterfeit and actually bad quality",
      "Apple uses a cryptographic pairing system — only genuine Apple or MFi-paired batteries report accurate health data",
      "The battery is not fully charged yet",
      "The phone software has a bug that clears capacity data",
    ],
    correctIndex: 1,
  },
  {
    id: 14,
    category: "Battery & Charging",
    question: "A phone charges only when the USB-C cable is held at a specific angle. You have already replaced the charging port flex with a new one and the problem persists. What should you investigate next?",
    options: [
      "Try a software update",
      "Charging IC (PMIC) or related solder joints on the motherboard",
      "Battery connector",
      "Speaker flex cable",
    ],
    correctIndex: 1,
  },
  {
    id: 15,
    category: "Battery & Charging",
    question: "What is the correct way to dispose of a dead lithium-ion battery in India?",
    options: [
      "Throw it in the regular dustbin",
      "Burn or incinerate it to prevent leakage",
      "Drop it at an authorised e-waste collection centre or brand take-back programme",
      "Bury it in soil away from water sources",
    ],
    correctIndex: 2,
  },
  {
    id: 16,
    category: "Battery & Charging",
    question: "Battery diagnostics show 95% health, but the customer says their phone dies in 2 hours. What is the most likely explanation?",
    options: [
      "The diagnostic tool is wrong — replace the battery",
      "A background app is consuming abnormal power (rogue app, location always-on, sync loops)",
      "The charging IC is failing",
      "The display brightness is too high",
    ],
    correctIndex: 1,
  },
  {
    id: 17,
    category: "Battery & Charging",
    question: "While charging, a phone becomes very hot near the TOP edge (not near the charging port). What does this suggest?",
    options: [
      "Normal — wireless charging coils are typically at the top",
      "The SoC or modem chip is overheating, possibly due to a background process or a hardware fault",
      "The battery is swelling",
      "The charging port flex is shorted",
    ],
    correctIndex: 1,
  },
  {
    id: 18,
    category: "Battery & Charging",
    question: "Which instrument is best suited to measure whether a battery can actually deliver its rated capacity (e.g., 5000 mAh)?",
    options: [
      "Digital multimeter (measure open-circuit voltage)",
      "Battery capacity tester/discharger (e.g. ZB2L3 or similar — applies a load and measures mAh delivered)",
      "Oscilloscope",
      "Thermal camera",
    ],
    correctIndex: 1,
  },
  {
    id: 19,
    category: "Battery & Charging",
    question: "A Realme phone shows 'Charging slowly' with the original 65W VOOC charger. Before opening the phone, the first diagnostic step is:",
    options: [
      "Check and clean the USB-C port for debris with a non-conductive tool",
      "Replace the battery",
      "Flash the firmware",
      "Test with a different wall socket only",
    ],
    correctIndex: 0,
  },

  // ── Camera (6) ────────────────────────────────────────────────────────────
  {
    id: 20,
    category: "Camera",
    question: "A customer's rear camera shows a dark blurry patch in one corner of every photo. The lens glass is intact. What is the most likely cause?",
    options: [
      "Dust or contamination inside the sealed camera module between elements",
      "Camera ISP (image signal processor) failure",
      "A software filter accidentally enabled",
      "Display issue affecting the camera preview",
    ],
    correctIndex: 0,
  },
  {
    id: 21,
    category: "Camera",
    question: "After a customer drops their phone, the OIS (optical image stabilisation) makes an audible rattling sound when shaken. What is the correct repair action?",
    options: [
      "Perform a software camera reset",
      "Carefully re-glue the lens module",
      "Replace the entire camera module — the OIS actuator magnet has detached",
      "The rattle is normal — OIS magnets can move slightly",
    ],
    correctIndex: 2,
  },
  {
    id: 22,
    category: "Camera",
    question: "After replacing the screen on an iPhone 13, the rear camera shows 'Camera Unavailable'. What was most likely damaged during the repair?",
    options: [
      "Battery connector",
      "Camera flex cable that runs close to the display assembly",
      "SIM card slot",
      "Speaker mesh",
    ],
    correctIndex: 1,
  },
  {
    id: 23,
    category: "Camera",
    question: "A phone camera app opens but freezes or crashes immediately. All other apps work correctly. The first check should be:",
    options: [
      "Replace the entire camera module",
      "Check for SD card corruption (camera saves there)",
      "Reseat the camera flex connector; also test by removing and reseating the connector",
      "Replace the rear glass",
    ],
    correctIndex: 2,
  },
  {
    id: 24,
    category: "Camera",
    question: "Several Xiaomi/Redmi models are known to produce a purple tint on camera images. The most reliable fix is:",
    options: [
      "Replace the camera sensor — it is cracked internally",
      "Update the phone firmware/MIUI — this is a known software-side colour tuning bug in affected batches",
      "Clean the lens",
      "Clear the camera app's cache only",
    ],
    correctIndex: 1,
  },
  {
    id: 25,
    category: "Camera",
    question: "A customer says their front selfie camera takes blurry photos even in bright light. The protective glass over the camera is clean. The most likely cause is:",
    options: [
      "The camera app needs updating",
      "The inner lens element of the selfie camera module is cracked or has fogged",
      "The face detection algorithm is disabled",
      "The phone is in 'low resolution' mode",
    ],
    correctIndex: 1,
  },

  // ── Software & Flashing (10) ──────────────────────────────────────────────
  {
    id: 26,
    category: "Software & Flashing",
    question: "A Samsung phone enters a bootloop after a failed OTA update. What is the safest first recovery step that avoids data loss?",
    options: [
      "Immediately open the phone and resolder the eMMC storage chip",
      "Boot into recovery mode and wipe cache partition (does NOT erase user data)",
      "Replace the battery",
      "Flash a full factory firmware immediately",
    ],
    correctIndex: 1,
  },
  {
    id: 27,
    category: "Software & Flashing",
    question: "What is 'EDL mode' (Emergency Download Mode) on Qualcomm-based Android devices?",
    options: [
      "A crash mode that requires motherboard replacement",
      "A low-level Qualcomm-specific mode that allows direct flash via QFIL/QPST even when the OS is unresponsive",
      "An extended diagnostic mode accessible from developer options",
      "An emergency low-battery saving mode",
    ],
    correctIndex: 1,
  },
  {
    id: 28,
    category: "Software & Flashing",
    question: "A phone boots to 'DM-verity corruption' or 'Your device is corrupt'. What does this error mean?",
    options: [
      "The physical NAND flash storage has failed",
      "The system partition has been modified — typically caused by rooting, installing unofficial ROMs, or corrupted OTA",
      "The battery is failing",
      "The display flex cable is damaged",
    ],
    correctIndex: 1,
  },
  {
    id: 29,
    category: "Software & Flashing",
    question: "What is ADB (Android Debug Bridge) primarily used for in a mobile repair context?",
    options: [
      "Measuring battery capacity",
      "Communicating between a PC and an Android device for debugging, sideloading APKs, pulling data, and sending commands",
      "Repairing physical solder joints",
      "Testing screen colour accuracy",
    ],
    correctIndex: 1,
  },
  {
    id: 30,
    category: "Software & Flashing",
    question: "Modifying, cloning, or changing the IMEI number of a mobile phone in India is:",
    options: [
      "Legal if the customer provides written consent",
      "Legal for personal use only",
      "A criminal offence under the Indian Wireless Telegraphy Act 1933 — can result in up to 3 years imprisonment and fine",
      "Only restricted for imported (foreign model) handsets",
    ],
    correctIndex: 2,
  },
  {
    id: 31,
    category: "Software & Flashing",
    question: "A Redmi Note phone is stuck on the 'Mi' logo and does not proceed to boot. The safest first step before flashing firmware is:",
    options: [
      "Flash full ROM immediately using Mi Flash Tool",
      "Boot into recovery and try wiping cache or performing a factory reset — this preserves data if cache is the cause",
      "Replace the battery",
      "Open the motherboard and reflow the CPU",
    ],
    correctIndex: 1,
  },
  {
    id: 32,
    category: "Software & Flashing",
    question: "'FRP lock' on an Android phone after a factory reset means:",
    options: [
      "Flash ROM Protection — the firmware is encrypted",
      "Factory Reset Protection — the device requires the previously synced Google account credentials before setup can continue",
      "Firmware Restoration Protocol — a recovery tool is needed",
      "Fast Recharge Protocol — a charging feature",
    ],
    correctIndex: 1,
  },
  {
    id: 33,
    category: "Software & Flashing",
    question: "Which file format does Samsung's Odin flash tool require for firmware files?",
    options: [
      ".zip",
      ".tar or .tar.md5",
      ".img",
      ".bin",
    ],
    correctIndex: 1,
  },
  {
    id: 34,
    category: "Software & Flashing",
    question: "An iPhone shows 'SIM Not Supported' or 'Invalid SIM'. Assuming the SIM card is valid and works in another phone, the most likely cause is:",
    options: [
      "SIM card slot pins are damaged",
      "The iPhone is carrier-locked and requires a network unlock from the original carrier",
      "iOS needs updating",
      "Battery is low",
    ],
    correctIndex: 1,
  },
  {
    id: 35,
    category: "Software & Flashing",
    question: "A customer asks you to root their phone 'to speed it up'. Your correct response is:",
    options: [
      "Root it — rooting always increases performance noticeably",
      "Explain that rooting voids warranty, exposes the phone to security risks, can brick the device, and may not improve performance; proceed only with informed written consent",
      "Refuse rooting under all circumstances, no exceptions",
      "Root it quietly without mentioning it to avoid confusing the customer",
    ],
    correctIndex: 1,
  },

  // ── Network & SIM (6) ────────────────────────────────────────────────────
  {
    id: 36,
    category: "Network & SIM",
    question: "A dual-SIM phone detects only one SIM after a drop. Both SIM cards and the tray are undamaged. What should you inspect?",
    options: [
      "Flash firmware to re-detect SIM",
      "SIM slot spring contacts / pins on the PCB for bent or broken pins",
      "Battery connector",
      "Display assembly",
    ],
    correctIndex: 1,
  },
  {
    id: 37,
    category: "Network & SIM",
    question: "A customer's phone shows 'SIM Card Failure'. You insert a different known-working SIM into the same slot and get the same error. The most likely cause is:",
    options: [
      "Network provider outage",
      "SIM slot contact pins on the motherboard are bent, corroded, or broken",
      "Software needs factory reset",
      "Battery below 10%",
    ],
    correctIndex: 1,
  },
  {
    id: 38,
    category: "Network & SIM",
    question: "What is the difference between a 'network unlock' and an 'FRP unlock'?",
    options: [
      "They are the same thing",
      "Network unlock removes a carrier restriction so any SIM works; FRP unlock bypasses the Google Factory Reset Protection account verification",
      "Network unlock is always illegal; FRP unlock is always legal",
      "Network unlock requires hardware modification; FRP is always software-only",
    ],
    correctIndex: 1,
  },
  {
    id: 39,
    category: "Network & SIM",
    question: "After replacing an iPhone screen, it shows 'Invalid SIM'. The SIM was fine before the repair. What likely happened?",
    options: [
      "The iOS version is outdated",
      "The SIM card was damaged when removed",
      "The NFC antenna or SIM antenna cable was disturbed or pinched during disassembly",
      "The battery needs replacement",
    ],
    correctIndex: 2,
  },
  {
    id: 40,
    category: "Network & SIM",
    question: "A customer's phone shows 5 signal bars but cannot make or receive any calls. What do you check first (without opening the phone)?",
    options: [
      "Replace the SIM card immediately",
      "Check call barring settings (outgoing call barring may be active) and confirm the SIM has calling balance",
      "Open the motherboard and inspect the RF chip",
      "Flash new firmware",
    ],
    correctIndex: 1,
  },
  {
    id: 41,
    category: "Network & SIM",
    question: "A phone shows 'No Service' consistently only in certain geographical areas while other phones on the same network work fine there. What does this indicate?",
    options: [
      "The phone's baseband chip has failed and needs replacement",
      "This is normal variation — network coverage depends on tower proximity and building penetration",
      "The SIM card has expired",
      "The motherboard has water damage",
    ],
    correctIndex: 1,
  },

  // ── Audio (6) ─────────────────────────────────────────────────────────────
  {
    id: 42,
    category: "Audio",
    question: "A phone plays audio fine through the loudspeaker but the person on the other end of a call cannot hear the customer (mic issue). How do you first diagnose this?",
    options: [
      "Replace the motherboard",
      "Open the Voice Recorder app and record a clip — if silent or very quiet, the primary mic is faulty or blocked by a case/debris",
      "Reseat the battery",
      "Check the charging port",
    ],
    correctIndex: 1,
  },
  {
    id: 43,
    category: "Audio",
    question: "A customer reports they cannot hear the other person during phone calls, but speakerphone works fine. What is the most likely faulty component?",
    options: [
      "Loudspeaker driver",
      "Earpiece speaker failure or earpiece mesh blocked by debris",
      "Volume button stuck on mute",
      "Baseband modem failure",
    ],
    correctIndex: 1,
  },
  {
    id: 44,
    category: "Audio",
    question: "After a water damage repair, the earpiece sounds muffled and distant. The earpiece speaker is new. What is the likely cause?",
    options: [
      "The new speaker is defective",
      "Earpiece mesh is clogged with mineral deposits left by the water — clean with a soft brush",
      "Software equaliser settings changed",
      "SIM tray is interfering with the earpiece",
    ],
    correctIndex: 1,
  },
  {
    id: 45,
    category: "Audio",
    question: "A phone produces buzzing, distorted audio at medium-to-high volume. You have already replaced the loudspeaker with a new one. What should you check next?",
    options: [
      "Battery capacity",
      "The speaker is not properly seated — vibrating against the frame due to missing adhesive or incorrect installation",
      "A software equaliser issue",
      "The charging port flex is loose",
    ],
    correctIndex: 1,
  },
  {
    id: 46,
    category: "Audio",
    question: "After replacing the charging port flex on a Realme phone, the microphone no longer works. What did you most likely damage?",
    options: [
      "Battery connector",
      "Microphone flex cable — it routes close to the charging port assembly and is often combined in one flex",
      "Display ribbon",
      "Camera module",
    ],
    correctIndex: 1,
  },
  {
    id: 47,
    category: "Audio",
    question: "What chemical solvent is recommended for cleaning corrosion and flux residue from a PCB during water damage repair?",
    options: [
      "Acetone (nail polish remover)",
      "Petrol or lighter fluid",
      "99% Isopropyl Alcohol (IPA) — safe for components, evaporates cleanly",
      "Tap water with mild soap",
    ],
    correctIndex: 2,
  },

  // ── Water Damage (6) ──────────────────────────────────────────────────────
  {
    id: 48,
    category: "Water Damage",
    question: "A phone is brought in immediately after falling in water and is still powering on. What is the FIRST thing you should do?",
    options: [
      "Try to charge it to see if it boots properly",
      "Power off immediately — do not charge; open the device, dry with IPA, clean PCB corrosion, allow to dry fully before powering on",
      "Flash new firmware to clear error codes",
      "Replace the battery before checking anything else",
    ],
    correctIndex: 1,
  },
  {
    id: 49,
    category: "Water Damage",
    question: "What is the most effective method for cleaning corrosion off a water-damaged motherboard?",
    options: [
      "Rinse under tap water and air dry",
      "Ultrasonic cleaner with PCB-safe solution, or scrubbing with 99% IPA and a soft anti-static brush, then rinse with fresh IPA",
      "Air dry in sunlight for 48 hours without cleaning",
      "Hair dryer on the highest heat setting for 10 minutes",
    ],
    correctIndex: 1,
  },
  {
    id: 50,
    category: "Water Damage",
    question: "Where is the Liquid Contact Indicator (LCI) located on most iPhone models?",
    options: [
      "Inside the camera module",
      "Inside the SIM card tray slot — it turns red/pink when wet",
      "Under the battery",
      "Behind the display",
    ],
    correctIndex: 1,
  },
  {
    id: 51,
    category: "Water Damage",
    question: "A customer says they put their water-damaged phone in a bag of uncooked rice for 3 days and it's 'fixed now'. What do you advise?",
    options: [
      "Rice is effective — if it boots normally it is permanently fixed",
      "Rice absorbs very little moisture and does not clean mineral deposits or corrosion; professional ultrasonic cleaning is required to prevent future failures",
      "Flash the firmware to erase any water-damage error logs",
      "Replace the display as a precaution",
    ],
    correctIndex: 1,
  },
  {
    id: 52,
    category: "Water Damage",
    question: "When using a heat gun to soften phone adhesive, what is the safe temperature range to avoid damaging display polarisers and battery?",
    options: [
      "300°C–400°C for 5 seconds",
      "150°C–200°C with constant slow movement, checking temperature with a thermometer or thermocouple",
      "Any temperature is fine if you use it quickly",
      "500°C for 1 second only",
    ],
    correctIndex: 1,
  },
  {
    id: 53,
    category: "Water Damage",
    question: "After completing a water damage repair, the phone charges but battery percentage does not increase. What component is most likely faulty?",
    options: [
      "Display",
      "Charging IC or PMIC (Power Management IC) corroded or damaged by the water",
      "SIM card slot",
      "Camera module",
    ],
    correctIndex: 1,
  },

  // ── Customer Service & Business (7) ───────────────────────────────────────
  {
    id: 54,
    category: "Customer Service",
    question: "A customer wants their data backed up before repair but you do not have their phone passcode. What is the correct procedure?",
    options: [
      "Try common passcodes (1234, 0000) until one works",
      "Proceed with repair and attempt backup without the passcode",
      "Ask the customer to back up data themselves or provide the passcode; record on the job card that backup was not performed if they decline",
      "Format the device and start fresh",
    ],
    correctIndex: 2,
  },
  {
    id: 55,
    category: "Customer Service",
    question: "You quoted ₹600 for a charging port replacement. During repair, you discover the charging IC is also damaged, requiring an additional ₹900. What do you do?",
    options: [
      "Complete the full repair and present the ₹1,500 bill — the customer will understand",
      "Call the customer, explain the additional fault and revised cost, and proceed ONLY after receiving their explicit approval",
      "Do only the port and return the phone — let the IC issue go",
      "Do the full repair for the original ₹600 to maintain goodwill",
    ],
    correctIndex: 1,
  },
  {
    id: 56,
    category: "Customer Service",
    question: "A customer angrily says the new display you fitted has a 'yellow tint' and demands a free replacement. On inspection, the colour temperature is within normal range for that grade of display. What do you do?",
    options: [
      "Argue that the customer is wrong and show the colour temperature spec sheet",
      "Replace the display for free without question to avoid conflict",
      "Calmly explain the difference between OEM and original displays, compare side-by-side if possible, and document the customer's feedback whether or not they accept the explanation",
      "Offer a 50% discount on a new original display immediately",
    ],
    correctIndex: 2,
  },
  {
    id: 57,
    category: "Customer Service",
    question: "What is the industry-standard warranty period for display and battery replacements in the Indian independent repair market?",
    options: [
      "No warranty offered — parts are sold as-is",
      "7 days only",
      "30 to 90 days covering parts and workmanship defects",
      "Minimum 1 year by law",
    ],
    correctIndex: 2,
  },
  {
    id: 58,
    category: "Customer Service",
    question: "A stranger brings you a locked iPhone and asks you to unlock it — they say they 'forgot the passcode'. They cannot provide any purchase receipt, box, or Apple ID. What do you do?",
    options: [
      "Unlock it for a fee — this is a common request",
      "Ask no questions and proceed — it is the customer's problem if it is stolen",
      "Refuse — possessing or facilitating access to a potentially stolen device is an offence under Section 411 IPC; ask for proof of ownership",
      "Unlock only if they give you their ID proof",
    ],
    correctIndex: 2,
  },
  {
    id: 59,
    category: "Customer Service",
    question: "Before starting a repair on a high-value phone (e.g., Samsung Galaxy S24 Ultra), what are the most important items to record on the job card?",
    options: [
      "Nothing special — just the repair type and price",
      "Existing physical damage (scratches, dents, cracks), the IMEI number, and the customer's signature acknowledging the pre-existing condition",
      "Only the model name and colour",
      "Customer's Aadhaar number for identity verification",
    ],
    correctIndex: 1,
  },
];

/** Deterministic Fisher-Yates shuffle seeded by current second — good enough for quiz selection. */
export function selectQuestions(count = 15): number[] {
  const indices = Array.from({ length: QUESTIONS.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count);
}

export const QUIZ_QUESTION_COUNT = 15;
export const QUIZ_PASS_SCORE = 11; // 11/15 = 73% ≥ 70%
export const QUIZ_SESSION_TTL_MS = 60 * 60 * 1000; // 60-minute window to complete
export const QUIZ_RETRY_DAYS = 7;
