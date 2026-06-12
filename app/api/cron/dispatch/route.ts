import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { escalateStale } from "@/lib/dispatch";

export const dynamic = "force-dynamic";

/**
 * Dispatch escalation tick — invoked every minute by host crontab
 * (ops/crontab.tpl, synced by deploy.sh). Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const result = await escalateStale();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[cron:dispatch]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
