"use client";

import type { PermDashboardPayload } from "@/lib/immigration/perm-dashboard-types";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
} from "react-icons/hi";

function formatSyncTime(iso: string, tzLabel?: string) {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
    const timeStr = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return { dateStr, timeStr, tz: tzLabel ?? "" };
  } catch {
    return { dateStr: "—", timeStr: "", tz: "" };
  }
}

function sourceBadge(source: PermDashboardPayload["source"]) {
  if (source === "flag") {
    return <span className="ml-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-200/95">DOL FLAG (live)</span>;
  }
  if (source === "remote") {
    return <span className="ml-2 rounded-full bg-teal-500/15 px-2 py-0.5 text-teal-200/90">Custom feed</span>;
  }
  return <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200/90">Offline snapshot</span>;
}

export default function PermTimelineDashboard() {
  /** Visual emphasis only — which metric card to highlight. */
  const [highlight, setHighlight] = useState<"backlog" | "priority">("priority");
  const [payload, setPayload] = useState<PermDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/perm-stats", { cache: "no-store" });
      const json = (await res.json()) as PermDashboardPayload;
      if (json?.yesterdayProcessed && json?.source) {
        setPayload(json);
      } else {
        setPayload(null);
      }
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const sync = payload ? formatSyncTime(payload.lastSync.iso, payload.lastSync.displayTimezone) : null;

  const avg = payload?.averageProcessTime;
  const showAvgRange = avg && avg.rangeLow !== avg.rangeHigh;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">PERM Timeline Tracker</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-white/65">
          {payload?.source === "flag" ? (
            <>
              Metrics below are pulled from the{" "}
              <strong className="text-white/85">U.S. Department of Labor FLAG</strong> processing times page on each
              load. Numbers are <strong className="text-white/85">by receipt month and reporting month</strong>.
            </>
          ) : (
            <>
              Track PERM backlog and analyst timing. When the server can reach DOL FLAG, numbers update automatically;
              otherwise a snapshot or your <code className="rounded bg-white/10 px-1 text-xs">PERM_STATS_JSON_URL</code>{" "}
              feed is used.
            </>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-white">PERM Dashboard</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5"
              role="group"
              aria-label="Highlight metric"
            >
              <button
                type="button"
                onClick={() => setHighlight("priority")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  highlight === "priority" ? "bg-teal-500 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Priority date
              </button>
              <button
                type="button"
                onClick={() => setHighlight("backlog")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  highlight === "backlog" ? "bg-teal-500 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Backlog
              </button>
            </div>
          </div>
        </div>

        {loading && !payload ? (
          <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-white/5" />
            ))}
          </div>
        ) : null}

        {payload ? (
          <>
            <p className="mb-4 text-xs text-white/45">
              {sourceBadge(payload.source)}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title={payload.yesterdayProcessed.label}
                value={payload.yesterdayProcessed.value}
                valueDisplay={payload.yesterdayProcessed.valueDisplay}
                trendPct={payload.yesterdayProcessed.trendPct}
                hideTrend={payload.yesterdayProcessed.hideTrend}
                iconWrapClass="bg-blue-500/20 text-blue-300"
                icon={<HiOutlineDocumentText className="h-5 w-5" aria-hidden />}
                emphasize={highlight === "backlog"}
              />
              <MetricCard
                title={payload.yesterdayCertified.label}
                value={payload.yesterdayCertified.value}
                valueDisplay={payload.yesterdayCertified.valueDisplay}
                trendPct={payload.yesterdayCertified.trendPct}
                hideTrend={payload.yesterdayCertified.hideTrend}
                iconWrapClass="bg-emerald-500/20 text-emerald-300"
                icon={<HiOutlineShieldCheck className="h-5 w-5" aria-hidden />}
                emphasize={highlight === "priority"}
              />
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-white/60">Last Sync</div>
                    <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
                      {sync?.dateStr ?? "—"}
                    </div>
                    <div className="mt-1 text-sm text-white/50">
                      {sync?.timeStr}
                      {sync?.tz ? ` ${sync.tz}` : " local"}
                    </div>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                    <HiOutlineRefresh className="h-5 w-5" aria-hidden />
                  </span>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white/60">{payload.averageProcessTime.label}</div>
                    <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
                      {payload.averageProcessTime.days} days
                    </div>
                    {showAvgRange ? (
                      <div className="mt-1 text-sm text-white/50">
                        Range: {payload.averageProcessTime.rangeLow}–{payload.averageProcessTime.rangeHigh} days
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs text-white/40">
                      Metric month: {payload.averageProcessTime.asOf}
                    </div>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                    <HiOutlineClock className="h-5 w-5" aria-hidden />
                  </span>
                </div>
              </div>
            </div>

            {payload.dataNote ? (
              <p className="mt-4 text-xs leading-relaxed text-white/45">{payload.dataNote}</p>
            ) : null}
          </>
        ) : (
          !loading && <p className="text-sm text-red-300/90">Could not load PERM dashboard.</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  valueDisplay,
  trendPct,
  hideTrend,
  icon,
  iconWrapClass,
  emphasize,
}: {
  title: string;
  value: number;
  valueDisplay?: string;
  trendPct: number;
  hideTrend?: boolean;
  icon: ReactNode;
  iconWrapClass: string;
  emphasize?: boolean;
}) {
  const primary = valueDisplay ?? value;
  const isText = typeof valueDisplay === "string";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
        emphasize ? "border-teal-500/40 bg-teal-500/10" : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium leading-snug text-white/60">{title}</div>
          <div
            className={`mt-2 font-semibold text-white ${isText ? "text-2xl leading-snug break-words" : "text-3xl tabular-nums"}`}
          >
            {primary}
          </div>
          {!hideTrend ? (
            <div className={`mt-1 text-sm ${trendPct < 0 ? "text-red-400" : "text-emerald-400"}`}>
              {trendPct > 0 ? "+" : ""}
              {trendPct}% vs prior receipt month
            </div>
          ) : null}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
