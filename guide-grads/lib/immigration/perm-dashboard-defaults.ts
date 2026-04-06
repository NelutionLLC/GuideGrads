import type { PermDashboardPayload } from "./perm-dashboard-types";

/**
 * Fallback snapshot when FLAG and remote JSON are unavailable.
 * Prefer live DOL FLAG data via `/api/perm-stats` when the server can reach flag.dol.gov.
 */
export const PERM_DASHBOARD_SNAPSHOT: PermDashboardPayload = {
  yesterdayProcessed: {
    label: "Remaining PERM requests (illustrative)",
    value: 106,
    trendPct: -55,
  },
  yesterdayCertified: {
    label: "Analyst review — current priority date (illustrative)",
    value: 0,
    valueDisplay: "Nov 2024",
    trendPct: 0,
    hideTrend: true,
  },
  lastSync: {
    iso: "2026-04-05T02:47:00.000Z",
    displayTimezone: "CDT",
  },
  averageProcessTime: {
    label: "Average Process Time",
    days: 487,
    rangeLow: 472,
    rangeHigh: 488,
    asOf: "2026-04-04",
  },
  source: "snapshot",
  dataNote:
    "Could not load live DOL FLAG data. Showing a static placeholder. Check server network access to https://flag.dol.gov/processingtimes or set PERM_STATS_JSON_URL.",
};
