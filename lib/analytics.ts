"use client";

import posthog from "posthog-js";

// No-op safe wrapper — if NEXT_PUBLIC_POSTHOG_KEY is unset, every call is a no-op.
// Initialized once by <AnalyticsProvider> in the root layout.

let initialized = false;

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || initialized || typeof window === "undefined") return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,        // homepage / category / dashboard visits
    capture_pageleave: true,
    capture_exceptions: true,      // error monitoring — uncaught errors + unhandled rejections
    autocapture: false,            // explicit events only, keeps data clean
    persistence: "localStorage",
  });
  initialized = true;
}

/** Track a named product event. Safe to call anywhere client-side. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, props);
}

/** Associate events with a logged-in user. */
export function identify(userId: string, props?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, props);
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}
