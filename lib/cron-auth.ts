import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

/**
 * Cron endpoint auth: header-only (secrets in query strings leak into
 * access logs and proxies), constant-time comparison.
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret");
  if (!secret || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
