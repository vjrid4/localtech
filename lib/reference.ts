import { randomInt } from "crypto";

/**
 * Booking reference generator — LT-XXXXXXX over a 32-char unambiguous
 * alphabet (no I/O/0/1). The reference doubles as the public track-page
 * access token, so it must come from a CSPRNG: 32^7 ≈ 34B combinations,
 * unguessable only if unpredictable.
 */
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReference(): string {
  let ref = "LT-";
  for (let i = 0; i < 7; i++) ref += CHARS[randomInt(CHARS.length)];
  return ref;
}
