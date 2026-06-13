# LocalTech host crontab — source of truth lives in the repo.
# Synced to the VPS user's crontab by deploy.sh on every deploy.
# ${CRON_SECRET} is expanded from /var/www/localtech/.env at sync time.
# Secret travels in a header (never the URL — query strings land in logs).

# Dispatch escalation tick — expire stale offers, escalate waves, manual fallback
* * * * * curl -sf -H "x-cron-secret: ${CRON_SECRET}" "http://127.0.0.1:3007/api/cron/dispatch" > /dev/null 2>&1

# Trust score recompute — nightly 02:30 IST (feeds dispatch ranking)
30 2 * * * curl -sf -H "x-cron-secret: ${CRON_SECRET}" "http://127.0.0.1:3007/api/cron/trust-score" > /dev/null 2>&1

# Review nudge — hourly: wave-1 at 4h, wave-2 at 48h post-completion (target ≥45% rate)
0 * * * * curl -sf -H "x-cron-secret: ${CRON_SECRET}" "http://127.0.0.1:3007/api/cron/review-nudge" > /dev/null 2>&1

# Warranty day-25 reminders + technician weekly summaries (Mon only) — 03:00 IST = 21:30 UTC
30 21 * * * curl -sf -H "x-cron-secret: ${CRON_SECRET}" "http://127.0.0.1:3007/api/cron/weekly" > /dev/null 2>&1
