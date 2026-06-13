/**
 * Short-lived in-memory cache for Aadhaar photos used in face-match.
 *
 * The photo is held only for the 15-minute window between Aadhaar OTP
 * verification and selfie submission. It is never written to the database.
 *
 * Assumption: single-container deployment (one Node.js process). If the
 * app ever runs multiple replicas, replace this with a Redis SETEX call
 * using the same 15-minute TTL.
 */

const TTL_MS = 15 * 60 * 1000; // 15 minutes

interface Entry {
  photo: string;    // base64 from Surepass — cleared after use
  expiresAt: number;
}

const cache = new Map<string, Entry>();

export function storeAadhaarPhoto(profileId: string, photo: string): void {
  cache.set(profileId, { photo, expiresAt: Date.now() + TTL_MS });
}

export function claimAadhaarPhoto(profileId: string): string | null {
  const entry = cache.get(profileId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(profileId);
    return null;
  }
  // Single-use: delete immediately after reading so the photo is never available again
  cache.delete(profileId);
  return entry.photo;
}

// Periodic sweep of expired entries (runs every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}, 5 * 60 * 1000);
