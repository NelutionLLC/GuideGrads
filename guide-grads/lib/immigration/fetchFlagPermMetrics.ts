import type { PermDashboardPayload, PermMetricSlot } from "./perm-dashboard-types";

export const FLAG_PERM_PROCESSING_TIMES_URL = "https://flag.dol.gov/processingtimes";

/**
 * Parse official DOL FLAG “Processing Times” HTML for PERM metrics.
 * @see https://flag.dol.gov/processingtimes
 */
export function parseFlagPermHtml(
  html: string,
): Omit<PermDashboardPayload, "source" | "lastSync"> | null {
  const backlogIdx = html.indexOf('<th colspan="2" id="a">PERM</th>');
  if (backlogIdx === -1) return null;

  const backlogEnd = html.indexOf("</tbody></table>", backlogIdx);
  if (backlogEnd === -1) return null;
  const backlogSlice = html.slice(backlogIdx, backlogEnd);

  const rows: { month: string; remaining: number }[] = [];
  const trRe = /<tr><td>([^<]+)<\/td><td>([0-9,]+)<\/td><\/tr>/g;
  let m: RegExpExecArray | null;
  while ((m = trRe.exec(backlogSlice)) !== null) {
    const rem = parseInt(m[2].replace(/,/g, ""), 10);
    if (!Number.isNaN(rem)) rows.push({ month: m[1].trim(), remaining: rem });
  }
  if (rows.length === 0) return null;

  const latest = rows[rows.length - 1];
  const prev = rows.length >= 2 ? rows[rows.length - 2] : null;
  let trendPct = 0;
  if (prev && prev.remaining > 0) {
    trendPct = Math.round(((latest.remaining - prev.remaining) / prev.remaining) * 100);
  }

  const asOfMatch = html.match(
    /PERM Processing Times<\/strong>\s*<em>\(as of ([^)]+)\)<\/em><\/caption>\s*<thead>\s*<tr>\s*<th[^>]*>Processing Queue<\/th>\s*<th[^>]*>Priority Date<\/th>/,
  );
  const permAsOf = asOfMatch?.[1]?.trim() ?? "";

  const analystPri = html.match(/<td headers="a">Analyst Review<\/td><td[^>]*>([^<]+)<\/td>/);
  const priorityText = analystPri?.[1]?.replace(/\s+/g, " ").trim() ?? "";

  const avgIdx = html.indexOf("Average Number of Days to Process PERM Applications");
  if (avgIdx === -1) return null;
  const avgSub = html.slice(avgIdx, avgIdx + 2000);
  const avgMatch = avgSub.match(
    /<td headers="a">Analyst Review<\/td><td headers="b">([^<]+)<\/td><td headers="c">(\d+)<\/td>/,
  );
  const avgMonth = avgMatch?.[1]?.trim() ?? "";
  const avgDays = avgMatch ? parseInt(avgMatch[2], 10) : NaN;
  if (Number.isNaN(avgDays)) return null;

  const yp: PermMetricSlot = {
    label: `Remaining PERM requests (${latest.month})`,
    value: latest.remaining,
    trendPct,
  };
  const yc: PermMetricSlot = {
    label: "Analyst review — current priority date",
    value: 0,
    valueDisplay: priorityText || "—",
    trendPct: 0,
    hideTrend: true,
  };

  return {
    yesterdayProcessed: yp,
    yesterdayCertified: yc,
    averageProcessTime: {
      label: "Average process time (Analyst Review)",
      days: avgDays,
      rangeLow: avgDays,
      rangeHigh: avgDays,
      asOf: avgMonth || permAsOf,
    },
    dataNote: `Figures are read from the U.S. Department of Labor FLAG page (${FLAG_PERM_PROCESSING_TIMES_URL}). PERM metrics are updated on a monthly schedule (first full work week), not daily. “Remaining requests” is backlog by receipt month; it is not a count of cases certified yesterday.`,
  };
}

export async function fetchFlagPermDashboardPayload(): Promise<PermDashboardPayload | null> {
  let html: string;
  try {
    const res = await fetch(FLAG_PERM_PROCESSING_TIMES_URL, {
      cache: "no-store",
      headers: {
        "User-Agent": "GuideGrads/1.0 (https://github.com/)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const parsed = parseFlagPermHtml(html);
  if (!parsed) return null;

  return {
    ...parsed,
    source: "flag",
    lastSync: {
      iso: new Date().toISOString(),
      displayTimezone: "Local",
    },
  };
}
