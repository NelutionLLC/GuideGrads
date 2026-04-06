export type PermMetricSlot = {
  label: string;
  value: number;
  /** When set, shown as the primary figure instead of `value` (e.g. DOL priority month). */
  valueDisplay?: string;
  trendPct: number;
  /** Hide the % change row (e.g. text-only metrics from FLAG). */
  hideTrend?: boolean;
};

/** Payload for GET /api/perm-stats — remote URL should return the same shape (JSON). */
export type PermDashboardPayload = {
  yesterdayProcessed: PermMetricSlot;
  yesterdayCertified: PermMetricSlot;
  lastSync: {
    iso: string;
    displayTimezone?: string;
  };
  averageProcessTime: {
    label: string;
    days: number;
    rangeLow: number;
    rangeHigh: number;
    /** Month label for the average (e.g. February 2026) or FLAG “as of” date string. */
    asOf: string;
  };
  /** `flag` = parsed live from DOL FLAG HTML; `remote` = PERM_STATS_JSON_URL; `snapshot` = bundled fallback. */
  source: "flag" | "remote" | "snapshot";
  /** Human-readable note (e.g. data limitations). */
  dataNote?: string;
};
