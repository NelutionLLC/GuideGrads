import { PERM_DASHBOARD_SNAPSHOT } from "@/lib/immigration/perm-dashboard-defaults";
import { fetchFlagPermDashboardPayload } from "@/lib/immigration/fetchFlagPermMetrics";
import type { PermDashboardPayload } from "@/lib/immigration/perm-dashboard-types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isRemotePayload(x: unknown): x is PermDashboardPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const yp = o.yesterdayProcessed as Record<string, unknown> | undefined;
  const yc = o.yesterdayCertified as Record<string, unknown> | undefined;
  const ls = o.lastSync as Record<string, unknown> | undefined;
  const apt = o.averageProcessTime as Record<string, unknown> | undefined;
  if (typeof yp?.value !== "number" || typeof yp?.trendPct !== "number") return false;
  if (typeof yc?.value !== "number" || typeof yc?.trendPct !== "number") return false;
  if (typeof ls?.iso !== "string") return false;
  if (
    typeof apt?.days !== "number" ||
    typeof apt?.rangeLow !== "number" ||
    typeof apt?.rangeHigh !== "number" ||
    typeof apt?.asOf !== "string"
  ) {
    return false;
  }
  return true;
}

function snapshotResponse(): PermDashboardPayload {
  return {
    ...PERM_DASHBOARD_SNAPSHOT,
    lastSync: {
      ...PERM_DASHBOARD_SNAPSHOT.lastSync,
      iso: new Date().toISOString(),
    },
  };
}

export async function GET() {
  const remoteUrl = process.env.PERM_STATS_JSON_URL?.trim();

  if (remoteUrl) {
    try {
      const res = await fetch(remoteUrl, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data: unknown = await res.json();
        if (isRemotePayload(data)) {
          const base = snapshotResponse();
          return NextResponse.json({
            ...base,
            ...data,
            yesterdayProcessed: {
              ...PERM_DASHBOARD_SNAPSHOT.yesterdayProcessed,
              ...data.yesterdayProcessed,
            },
            yesterdayCertified: {
              ...PERM_DASHBOARD_SNAPSHOT.yesterdayCertified,
              ...data.yesterdayCertified,
            },
            lastSync: { ...base.lastSync, ...data.lastSync },
            averageProcessTime: {
              ...PERM_DASHBOARD_SNAPSHOT.averageProcessTime,
              ...data.averageProcessTime,
            },
            source: "remote" as const,
            dataNote: data.dataNote ?? base.dataNote,
          });
        }
      }
    } catch {
      /* try FLAG */
    }
  }

  const flagPayload = await fetchFlagPermDashboardPayload();
  if (flagPayload) {
    return NextResponse.json(flagPayload);
  }

  return NextResponse.json({
    ...snapshotResponse(),
    source: "snapshot",
    dataNote: remoteUrl
      ? "Could not load remote PERM stats or DOL FLAG; showing bundled snapshot."
      : PERM_DASHBOARD_SNAPSHOT.dataNote,
  });
}
