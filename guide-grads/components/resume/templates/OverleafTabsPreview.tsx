"use client";

import { pageDimensions, resolvePageSize } from "@/lib/page/a4";
import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AccentApply, EntryLayout, HeaderLayout, Project, ResumeCustomize, ResumeData } from "../ResumeBuilder";

const DEFAULT_ACCENT_HEX = "#0f172a";

function normalizeAccentApply(a?: AccentApply | null): AccentApply {
  return {
    name: a?.name ?? true,
    headings: a?.headings ?? true,
    headingsLine: a?.headingsLine ?? true,
    headerIcons: a?.headerIcons ?? false,
    headerContactText: a?.headerContactText ?? false,
    dotsBarsBubbles: a?.dotsBarsBubbles ?? false,
    dates: a?.dates ?? false,
    entryTitle: a?.entryTitle ?? false,
    entrySubtitle: a?.entrySubtitle ?? false,
    linkIcons: a?.linkIcons ?? false,
  };
}

function resolveAccentHex(customize: ResumeCustomize): string {
  const c = customize.accentColor?.trim();
  if (c && /^#[0-9A-Fa-f]{6}$/i.test(c)) return c;
  return DEFAULT_ACCENT_HEX;
}

function pickAccent(customize: ResumeCustomize, key: keyof AccentApply, fallback: string): string {
  return normalizeAccentApply(customize.accentApply)[key] ? resolveAccentHex(customize) : fallback;
}

/** Bold primary line(s) in education / experience / project / custom entries. */
function entryTitleStyle(customize: ResumeCustomize): React.CSSProperties {
  return {
    fontWeight: 600,
    color: pickAccent(customize, "entryTitle", "#0f172a"),
  };
}

const ptToPx = (pt: number) => (pt * 96) / 72;
const mmToPx = (mm: number) => (mm * 96) / 25.4;


function injectBulletStyles(html: string): string {
  return html
    // Strip <a> tags but keep their text content (no hyperlinks in resume body)
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<ul>/g, '<ul style="list-style:none;padding-left:0;margin:0">')
    .replace(/<ol>/g, '<ol style="list-style:none;padding-left:0;margin:0">')
    .replace(/<li>/g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0">')
    .replace(/<li /g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0" ')
    // Bare <p> after <li>: keep block layout so text-align / justify from the editor apply
    .replace(/(<li[^>]*>)<p>/g, '$1<p style="margin:0">')
    // hanging indent for plain <p> bullet paragraphs (user typed • directly)
    .replace(/<p>•/g, '<p style="padding-left:0.9em;text-indent:-0.9em;margin:0">•');
}

const TEXT_ALIGN_IN_STYLE_RE = /\s*text-align\s*:\s*[^;]+;?/gi;
const LINE_HEIGHT_IN_STYLE_RE = /\s*line-height\s*:\s*[^;]+;?/gi;

function sanitizeInlineStyleAttrValue(styles: string): string {
  return styles
    .replace(TEXT_ALIGN_IN_STYLE_RE, "")
    .replace(LINE_HEIGHT_IN_STYLE_RE, "")
    .replace(/;;+/g, ";")
    .replace(/^;+|;+$/g, "")
    .trim();
}

/** Remove text-align / line-height from inline styles (preview controls both via CSS + pagination). */
function sanitizeRichHtmlInlineStyles(html: string): string {
  return html
    .replace(/\sstyle="([^"]*)"/gi, (_m, content: string) => {
      const cleaned = sanitizeInlineStyleAttrValue(content);
      return cleaned ? ` style="${cleaned}"` : "";
    })
    .replace(/\sstyle='([^']*)'/gi, (_m, content: string) => {
      const cleaned = sanitizeInlineStyleAttrValue(content);
      return cleaned ? ` style='${cleaned}'` : "";
    });
}

function extractFirstTextAlign(html: string): React.CSSProperties["textAlign"] | undefined {
  const m = html.match(/\btext-align\s*:\s*(left|center|right|justify)\b/i);
  if (!m) return undefined;
  return m[1].toLowerCase() as React.CSSProperties["textAlign"];
}

/**
 * TipTap often sets text-align only on the active paragraph; hoist the first alignment found
 * to the preview container so every bullet/line in that field matches.
 */
function prepareRichPreviewHtml(raw: string): { html: string; textAlign?: React.CSSProperties["textAlign"] } {
  const trimmed = raw.trim();
  if (!trimmed) return { html: "" };
  const textAlign = extractFirstTextAlign(trimmed);
  const stripped = sanitizeRichHtmlInlineStyles(trimmed);
  return { html: injectBulletStyles(stripped), textAlign };
}

/**
 * Text column: `viewportH` equals full contentH — no insets needed.
 */
function computeLineSnappedViewport(contentH: number, lineStepPx: number) {
  const step = Math.max(1, Math.round(lineStepPx));
  return {
    viewportH: Math.max(0, contentH),
    padTop: 0,
    padBottom: 0,
    lineSnapPx: step,
  };
}

/** One horizontal text band (top/bottom relative to the measurement strip’s top border). */
type LineBand = { t: number; b: number };

/** Keep page end `end` from landing inside a painted line (same rules as computePageWindowsFromBands). */
function snapEndToLineBands(start: number, end: number, bands: LineBand[], EPS: number): number {
  let out = end;
  for (const { t, b } of bands) {
    if (b <= start + EPS) continue;
    if (t >= out - EPS) continue;
    if (t > start + EPS && t + EPS < out && out < b - EPS) {
      out = Math.min(out, t);
    }
  }
  for (const { t, b } of bands) {
    if (t > start + EPS && out > t + EPS && out < b - EPS) {
      out = Math.min(out, t);
    }
  }
  return out;
}

/**
 * If a page starts mid-line (rounding / vh splits), move the break up to the line top when that still
 * leaves content on the previous page — avoids a sliver of the previous line above the first real line.
 */
function snapPageStartsToLineTops(
  windows: PageContentWindow[],
  bands: LineBand[],
  th: number,
  EPS: number
): PageContentWindow[] {
  if (windows.length <= 1 || !bands.length) return windows;
  const out = windows.map((w) => ({ start: w.start, contentEnd: w.contentEnd }));
  for (let i = 1; i < out.length; i++) {
    let s = out[i].start;
    for (const { t, b } of bands) {
      if (s > t + EPS && s < b - EPS) {
        if (t > out[i - 1].start + EPS) {
          s = t;
        }
        break;
      }
    }
    const si = Math.round(s);
    out[i].start = si;
    out[i - 1].contentEnd = si;
  }
  out[out.length - 1].contentEnd = th;
  const filtered = out.filter((w) => w.contentEnd > w.start + 0.5);
  if (!filtered.length) return windows;
  filtered[0].start = 0;
  for (let i = 1; i < filtered.length; i++) {
    filtered[i].start = filtered[i - 1].contentEnd;
  }
  filtered[filtered.length - 1].contentEnd = th;
  return filtered;
}

/**
 * Merge only fragments of the *same* painted line (adjacent spans). Do not merge stacked lines:
 * touching line boxes (t ≈ prev.b) must stay separate or whole blocks jump to the next page.
 */
function mergeSameLineFragments(raw: LineBand[]): LineBand[] {
  if (!raw.length) return [];
  const sorted = [...raw].sort((a, b) => a.t - b.t || a.b - b.b);
  const out: LineBand[] = [];
  const Y_TOL = 3.5;
  for (const L of sorted) {
    if (L.b - L.t < 1) continue;
    const prev = out[out.length - 1];
    if (prev && Math.abs(L.t - prev.t) < Y_TOL && Math.abs(L.b - prev.b) < Y_TOL) {
      prev.t = Math.min(prev.t, L.t);
      prev.b = Math.max(prev.b, L.b);
    } else {
      out.push({ t: L.t, b: L.b });
    }
  }
  return out;
}

/**
 * Drop container-sized rects (`li`, rich-text wrappers) when *any* finer line band lies inside —
 * one real line is enough to prove the tall rect is redundant for breaks.
 */
function dropListItemContainerBands(bands: LineBand[], lineSnapPx: number): LineBand[] {
  const step = Math.max(8, Math.round(lineSnapPx));
  const tallTh = step * 1.55;
  return bands.filter((T) => {
    const th = T.b - T.t;
    if (th < tallTh) return true;
    const finerInside = bands.filter(
      (L) =>
        L !== T &&
        L.b - L.t < th * 0.82 &&
        L.t >= T.t - 1 &&
        L.b <= T.b + 6
    );
    return finerInside.length < 1;
  });
}

/**
 * Only subdivide bands taller than one viewport — otherwise fake "lines" split skills / rich blocks mid-paragraph.
 */
function subdivideBandsToLineSteps(bands: LineBand[], lineSnapPx: number, viewportH: number): LineBand[] {
  const step = Math.max(8, Math.round(lineSnapPx));
  const threshold = Math.max(40, step * 2.05);
  const vh = Math.max(1, viewportH);
  const EPS = 0.35;
  const out: LineBand[] = [];
  for (const L of bands) {
    const h = L.b - L.t;
    if (h <= threshold || h <= vh + EPS) {
      out.push(L);
      continue;
    }
    let y = L.t;
    while (y < L.b - 0.05) {
      const nb = Math.min(y + step, L.b);
      if (nb - y >= 1.2) out.push({ t: y, b: nb });
      y = nb;
    }
  }
  return out.sort((a, b) => a.t - b.t || a.b - b.b);
}

/**
 * Per-line geometry: TreeWalker + Range (primary), plus `p` getClientRects (per wrapped line).
 * Do not call `li.getClientRects()` — it collapses multi-line bullets into one band.
 */
function collectLineBands(
  flowRoot: HTMLElement,
  stripEl: HTMLElement,
  viewportH: number,
  lineSnapPx: number
): LineBand[] {
  const stripRect = stripEl.getBoundingClientRect();
  const raw: LineBand[] = [];
  const maxH = Math.max(24, viewportH);

  const pushRects = (rects: DOMRectList | DOMRect[]) => {
    const len = rects.length;
    for (let i = 0; i < len; i++) {
      const r = rects[i];
      if (r.height < 2 || r.width < 3) continue;
      if (r.height > maxH) continue;
      const t = r.top - stripRect.top + stripEl.scrollTop;
      const b = r.bottom - stripRect.top + stripEl.scrollTop;
      raw.push({ t, b });
    }
  };

  const tw = document.createTreeWalker(flowRoot, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return /\S/.test(node.textContent ?? "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let n: Node | null;
  while ((n = tw.nextNode())) {
    const range = document.createRange();
    try {
      range.selectNodeContents(n);
      pushRects(range.getClientRects());
    } finally {
      range.detach?.();
    }
  }

  flowRoot.querySelectorAll<HTMLElement>(".resume-preview p").forEach((el) => {
    pushRects(el.getClientRects());
  });

  flowRoot.querySelectorAll<HTMLElement>("div.inline-flex").forEach((el) => {
    const rects = el.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r.height < 2 || r.width < 3) continue;
      if (r.height > maxH) continue;
      pushRects([r]);
    }
  });

  /* Skills / labels + rich text: often `inline-block` with multi-line body (one tall rect otherwise). */
  flowRoot.querySelectorAll<HTMLElement>(".resume-preview div.inline-block").forEach((el) => {
    const rects = el.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r.height < 2 || r.width < 3) continue;
      if (r.height > maxH) continue;
      pushRects([r]);
    }
  });

  const merged = mergeSameLineFragments(raw);
  const dropped = dropListItemContainerBands(merged, lineSnapPx);

  /** Section headings (boxed, rule, etc.) have visual elements (backgrounds, lines) that extend above/below
   *  the text line. Adding their full bounding rect as an atomic band prevents the page break from landing
   *  inside the heading, which would split the background box across two pages causing a visual overlap. */
  const headingBands: LineBand[] = [];
  flowRoot.querySelectorAll<HTMLElement>(".resume-section-heading").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height < 1 || r.width < 3) return;
    const t = r.top - stripRect.top + stripEl.scrollTop;
    const b = r.bottom - stripRect.top + stripEl.scrollTop;
    if (b - t <= maxH) headingBands.push({ t, b });
  });

  const allBands = [...dropped, ...headingBands].sort((a, b) => a.t - b.t || a.b - b.b);
  return subdivideBandsToLineSteps(allBands, lineSnapPx, viewportH);
}

/** One page slice: show content [start, contentEnd) inside a fixed-height viewport (clip excess bottom). */
type PageContentWindow = { start: number; contentEnd: number };

/**
 * Contiguous, non-overlapping vertical bands so we never slice a line.
 * Each page uses a fixed `viewportH` clip (equals full `contentH`); short pages get bottom clip-path only.
 * Next page starts at previous `contentEnd` so there is no overlap with the prior page.
 */
function computePageWindowsFromBands(totalH: number, viewportH: number, bands: LineBand[]): PageContentWindow[] {
  const EPS = 0.35;
  const vh = Math.max(1, viewportH);
  const th = Math.max(0, totalH);
  const out: PageContentWindow[] = [];
  if (th <= EPS) return [{ start: 0, contentEnd: 0 }];

  let start = 0;
  let guard = 0;
  while (start < th - EPS && guard++ < 600) {
    const limit = Math.min(start + vh, th);
    let end = limit;

    for (const { t, b } of bands) {
      if (b <= start + EPS) continue;
      if (t >= end - EPS) continue;
      /** Band top must be strictly after `start`, else a full-column rect [0, th) makes `end` snap to 0 and duplicates content across pages. */
      if (t > start + EPS && t + EPS < end && end < b - EPS) {
        end = Math.min(end, t);
      }
    }

    for (const { t, b } of bands) {
      if (t > start + EPS && end > t + EPS && end < b - EPS) {
        end = Math.min(end, t);
      }
    }

    if (end <= start + EPS) {
      let nextTop = th + 1;
      for (const { t } of bands) {
        if (t > start + EPS) nextTop = Math.min(nextTop, t);
      }
      if (nextTop <= th) {
        end = Math.min(nextTop, start + vh, th);
      } else {
        end = Math.min(start + vh, th);
      }
    }

    const a = Math.floor(start);
    const b = Math.max(a + 1, Math.ceil(end));
    out.push({ start: a, contentEnd: Math.min(b, Math.ceil(th)) });
    if (end >= th - EPS) break;
    start = end;
  }

  const raw = out.length ? out : [{ start: 0, contentEnd: Math.max(1, Math.ceil(th)) }];
  return normalizePageWindows(raw, th, viewportH, bands);
}

/**
 * Round, remove gaps between windows, split any slice taller than `viewportH`, and cover `[0, totalH)`
 * without extending a single page past `viewportH` (that caused clipping to hide content → blank/extra pages).
 * `bands` snaps blind `vh` splits so we do not cut through a line (fixes clipped half-lines at page tops).
 */
function normalizePageWindows(
  raw: PageContentWindow[],
  totalH: number,
  viewportH: number,
  bands: LineBand[]
): PageContentWindow[] {
  const EPS = 0.35;
  const th = Math.max(0, Math.round(totalH));
  const vh = Math.max(1, Math.round(viewportH));
  if (th <= 0) return [{ start: 0, contentEnd: 0 }];
  if (!raw.length) return [{ start: 0, contentEnd: th }];

  let merged = raw
    .map((w) => ({
      start: Math.max(0, Math.floor(Number(w.start) || 0)),
      contentEnd: Math.ceil(Number(w.contentEnd) || 0),
    }))
    .map((w) => ({ start: w.start, contentEnd: Math.min(w.contentEnd, th) }))
    .filter((w) => w.contentEnd > w.start)
    .sort((a, b) => a.start - b.start);

  if (!merged.length) return [{ start: 0, contentEnd: th }];

  const coalesced: PageContentWindow[] = [];
  for (const w of merged) {
    if (!coalesced.length) {
      coalesced.push({ ...w });
      continue;
    }
    const p = coalesced[coalesced.length - 1];
    if (w.start < p.contentEnd) {
      p.contentEnd = Math.max(p.contentEnd, w.contentEnd);
    } else {
      coalesced.push({ ...w });
    }
  }
  merged = coalesced;

  if (merged[0].start > 0) merged[0].start = 0;

  for (let i = 1; i < merged.length; i++) {
    merged[i].start = merged[i - 1].contentEnd;
  }

  const split: PageContentWindow[] = [];
  for (const w of merged) {
    let s = w.start;
    const end = w.contentEnd;
    while (s < end - 1e-6) {
      let e = Math.min(s + vh, end);
      if (bands.length) {
        e = snapEndToLineBands(s, e, bands, EPS);
        if (e <= s + EPS) e = Math.min(s + vh, end);
      }
      if (e <= s + EPS) {
        e = Math.min(s + 1, end);
      }
      if (e <= s + 1e-6) break;
      const a = Math.floor(s);
      const b = Math.max(a + 1, Math.ceil(Math.min(e, end)));
      split.push({ start: a, contentEnd: b });
      s = e;
    }
  }

  let last = split[split.length - 1];
  while (last && last.contentEnd < th - EPS) {
    const s = last.contentEnd;
    let e = Math.min(s + vh, th);
    if (bands.length) {
      e = snapEndToLineBands(s, e, bands, EPS);
      if (e <= s + EPS) e = Math.min(s + vh, th);
    }
    if (e <= s + EPS) {
      e = Math.min(s + 1, th);
    }
    if (e <= s + 1e-6) break;
    const a = Math.floor(s);
    const b = Math.max(a + 1, Math.ceil(Math.min(e, th)));
    split.push({ start: a, contentEnd: b });
    last = split[split.length - 1];
  }

  /** Zero-height windows (from rounding) still render a full Letter page with clipH=0 → blank sheet between real pages. */
  const MIN_PAGE_H = 2;
  let compact = split.filter((w) => w.contentEnd - w.start >= MIN_PAGE_H);
  if (!compact.length) return [{ start: 0, contentEnd: th }];
  compact[0].start = 0;
  for (let i = 1; i < compact.length; i++) {
    compact[i].start = compact[i - 1].contentEnd;
  }
  compact[compact.length - 1].contentEnd = th;

  /** Closing gaps can merge two windows into one taller than `vh` — clip only shows `vh` px so the rest vanishes until the next page (blank middle sheet). */
  if (compact.some((w) => w.contentEnd - w.start > vh + 2)) {
    const resplit: PageContentWindow[] = [];
    for (const w of compact) {
      let s = w.start;
      const end = w.contentEnd;
      while (s < end - 1e-6) {
        let e = Math.min(s + vh, end);
        if (bands.length) {
          e = snapEndToLineBands(s, e, bands, EPS);
          if (e <= s + EPS) e = Math.min(s + vh, end);
        }
        if (e <= s + EPS) e = Math.min(s + 1, end);
        if (e <= s + 1e-6) break;
        const a = Math.floor(s);
        const b = Math.max(a + 1, Math.ceil(Math.min(e, end)));
        resplit.push({ start: a, contentEnd: b });
        s = e;
      }
    }
    if (resplit.length) {
      resplit[resplit.length - 1].contentEnd = th;
      compact = resplit;
    }
  }

  // Merge a tiny tail page into the previous page if they together fit within one viewport.
  // Threshold: anything less than 30% of viewport height is "tiny" — catches single-line overflows
  // that happen when tight line spacing (e.g. lineHeight 1.1) pushes just one line past the break.
  const MIN_TAIL_PX = Math.max(8, Math.round(vh * 0.30));
  while (compact.length > 1) {
    const tail = compact[compact.length - 1];
    const tailH = tail.contentEnd - tail.start;
    if (tailH >= MIN_TAIL_PX) break;
    compact.pop();
    const prev = compact[compact.length - 1];
    if (th - prev.start <= vh + 1) {
      prev.contentEnd = th;
    } else {
      compact.push(tail);
      break;
    }
  }

  let finalOut = compact;
  if (bands.length && compact.length > 1) {
    const snapped = snapPageStartsToLineTops(compact, bands, th, EPS);
    if (snapped.length) finalOut = snapped;
  }

  // Trim leading blank from non-first page windows.
  // When a page window starts with invisible space (no text bands), advance its start
  // to the first band top so the page doesn't open with a blank gap at the top.
  // The blank area is absorbed by the previous page's contentEnd (it stays clipped there).
  if (bands.length && finalOut.length > 1) {
    const BLANK_TRIM = Math.max(6, Math.round(vh * 0.012));
    const trimmed = finalOut.map((w) => ({ ...w }));
    for (let i = 1; i < trimmed.length; i++) {
      const s = trimmed[i].start;
      let firstBandT: number | null = null;
      for (const { t } of bands) {
        if (t >= s - EPS) {
          firstBandT = firstBandT === null ? t : Math.min(firstBandT, t);
        }
      }
      if (firstBandT !== null && firstBandT - s > BLANK_TRIM) {
        const ns = Math.floor(firstBandT);
        if (ns > trimmed[i - 1].start + 1 && ns < trimmed[i].contentEnd) {
          trimmed[i - 1].contentEnd = ns;
          trimmed[i].start = ns;
        }
      }
    }
    finalOut = trimmed;
  }

  return finalOut.length ? finalOut : [{ start: 0, contentEnd: th }];
}

/** Resolved line box height in px — prefer column root (matches inherited rhythm), then body nodes. */
function measureLineSnapFromStrip(strip: HTMLElement, fallbackStepPx: number): number {
  const root = strip.querySelector<HTMLElement>(".resume-preview");
  if (root) {
    const rootLh = parseFloat(window.getComputedStyle(root).lineHeight);
    if (Number.isFinite(rootLh) && rootLh > 0) {
      return Math.max(1, Math.round(rootLh));
    }
  }
  const nodes = strip.querySelectorAll<HTMLElement>(".resume-preview p, .resume-preview li");
  let maxLh = 0;
  const limit = Math.min(nodes.length, 80);
  for (let i = 0; i < limit; i++) {
    const lh = parseFloat(window.getComputedStyle(nodes[i]).lineHeight);
    if (Number.isFinite(lh) && lh > 0) maxLh = Math.max(maxLh, lh);
  }
  if (maxLh <= 0) return Math.max(1, Math.round(fallbackStepPx));
  return Math.max(1, Math.round(maxLh));
}

function formatRange(start?: string, end?: string) {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} — Present`;
  if (!s && e) return e;
  return `${s} — ${e}`;
}

/** Projects: do not show "Present" when end date is empty — only start, or start — end when both set. */
function formatProjectRange(start?: string, end?: string) {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (!s && !e) return "";
  if (s && !e) return s;
  if (!s && e) return e;
  return `${s} — ${e}`;
}

function hasAny(list?: string[]) {
  return (list ?? []).some((x) => (x ?? "").trim().length > 0);
}

function normalizeHeaderLayout(h: string | undefined): HeaderLayout {
  if (
    h === "stackCenter" ||
    h === "centerRow2" ||
    h === "splitRight" ||
    h === "nameThenInline" ||
    h === "stackLeft"
  )
    return h;
  if (h === "split") return "splitRight";
  if (h === "centered") return "stackCenter";
  return "stackCenter";
}

type Block = { key: string; node: React.ReactNode };

/** Space between entry header row and bullets (work, projects, custom). */
const ENTRY_BODY_TOP_GAP_PX = 2;
/** Date/location column — compact line-height so a tall right column doesn’t inflate the row above bullets. */
const ENTRY_META_LINE_HEIGHT = 1.12;
/** Pulls the bullet block slightly closer to the title/meta row (same for all entry types). */
const ENTRY_HEADER_ROW_TUCK_PX = 2;

/**
 * Customize stores a section margin *level* 1–20; preview maps to real px (1→5, 2→6, … 20→24).
 */
function sectionMarginLevelToPx(level: number): number {
  return level + 4;
}

/**
 * Section headings use section margin; entries use entity margin only when the previous block is not a section title
 * (so no extra gap below the rule/dash before the first entry in a section).
 */
function marginTopBeforeBlock(
  blockKey: string,
  prevBlockKey: string | undefined,
  sectionMarginLevel: number,
  entityGapPx: number
): number {
  if (!prevBlockKey) return 0;
  if (blockKey.endsWith("-title") || blockKey === "skills-section") {
    return sectionMarginLevelToPx(sectionMarginLevel);
  }
  if (prevBlockKey.endsWith("-title")) {
    return 0;
  }
  return entityGapPx;
}

/** One vertical column of resume blocks; optional translateY for viewport pagination (line-level page breaks). */
function ResumeFlowColumn({
  blocks,
  sectionMarginLevel,
  entityGapPx,
  translateY = 0,
  style,
  className,
}: {
  blocks: Block[];
  sectionMarginLevel: number;
  entityGapPx: number;
  translateY?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        boxSizing: "border-box",
        transform: translateY !== 0 ? `translate3d(0, -${translateY}px, 0)` : undefined,
        backfaceVisibility: translateY !== 0 ? "hidden" : undefined,
        ...style,
      }}
    >
      {blocks.map((b, i) => (
        <div
          key={b.key}
          data-resume-block={b.key}
          style={{
            marginTop: marginTopBeforeBlock(
              b.key,
              i > 0 ? blocks[i - 1].key : undefined,
              sectionMarginLevel,
              entityGapPx
            ),
            boxSizing: "border-box",
          }}
        >
          {b.node}
        </div>
      ))}
    </div>
  );
}

/** Keeps header/contact SVGs aligned inside inline-flex rows (avoid inline + verticalAlign fighting items-center) */
const CONTACT_ICON_SVG_STYLE: React.CSSProperties = { display: "block", flexShrink: 0 };

function IconPhone() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.2 2.47.57 3.59a1 1 0 0 1-.24 1l-2.21 2.2Z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm7.93 9h-3.16a15.7 15.7 0 0 0-1.1-5.02A8.03 8.03 0 0 1 19.93 11ZM12 4c.96 0 2.26 2.09 2.93 7H9.07C9.74 6.09 11.04 4 12 4ZM4.07 13h3.16c.2 1.83.62 3.56 1.1 5.02A8.03 8.03 0 0 1 4.07 13Zm3.16-2H4.07a8.03 8.03 0 0 1 4.26-5.02c-.48 1.46-.9 3.19-1.1 5.02ZM12 20c-.96 0-2.26-2.09-2.93-7h5.86C14.26 17.91 12.96 20 12 20Zm3.67-1.98c.48-1.46.9-3.19 1.1-5.02h3.16a8.03 8.03 0 0 1-4.26 5.02Z" />
    </svg>
  );
}
function IconGitHub() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M12 .5A12 12 0 0 0 0 12.78c0 5.44 3.44 10.05 8.2 11.68.6.12.82-.27.82-.58v-2.2c-3.34.75-4.04-1.66-4.04-1.66-.55-1.44-1.34-1.82-1.34-1.82-1.1-.78.08-.76.08-.76 1.2.09 1.84 1.27 1.84 1.27 1.08 1.9 2.83 1.35 3.52 1.03.1-.8.42-1.35.76-1.66-2.66-.31-5.46-1.38-5.46-6.12 0-1.35.46-2.45 1.22-3.31-.12-.31-.53-1.58.12-3.29 0 0 1-.33 3.3 1.27a11.1 11.1 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.71.24 2.98.12 3.29.76.86 1.22 1.96 1.22 3.31 0 4.76-2.8 5.8-5.48 6.11.43.39.82 1.16.82 2.34v3.46c0 .32.22.71.82.59A12.2 12.2 0 0 0 24 12.78 12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

/** External link (project URL) — sized to sit on the title line */
function IconExternalLink() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ display: "block", flexShrink: 0 }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/** Project URL icon — base layout; color comes from pickAccent(…, linkIcons, …) */
const projectLinkAnchorStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  lineHeight: 1,
};

function IconLocation() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function prettyLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
function ensureHttp(url: string) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

/** Only treat as a clickable project link if it parses as http(s) and the host looks like a domain (has a dot, e.g. x.y). */
function isLikelyWebUrl(input: string): boolean {
  const s = input.trim();
  if (!s) return false;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname;
    if (host === "localhost" || host.endsWith(".localhost")) return true;
    return host.includes(".");
  } catch {
    return false;
  }
}

function SectionHeading({
  title,
  customize,
}: {
  title: string;
  customize: ResumeCustomize;
}) {
  /** Inter-section gap comes from block marginTop (section margin). */
  const padTop = 0;
  const padBottom = 2;

  const txt =
    customize.headingCaps === "uppercase" ? title.toUpperCase() : title;

  const baseFontPx = (customize.fontSizePt * 96) / 72;
  const headingOffset = customize.headingSize === "s" ? 3 : customize.headingSize === "l" ? 5 : customize.headingSize === "xl" ? 6 : 4;
  const headingTextColor = pickAccent(customize, "headings", "#0f172a");
  const sizeStyle: React.CSSProperties = {
    fontSize: `${baseFontPx + headingOffset}px`,
    fontWeight: 800,
    letterSpacing: "0.04em",
    lineHeight: 1.2,
    color: headingTextColor,
  };

  const lw = customize.headingLineWeight ?? "light";
  const baseLineColor = lw === "bold" ? "#0f172a" : lw === "normal" ? "#334155" : "#cbd5e1";
  const lineColor = pickAccent(customize, "headingsLine", baseLineColor);
  const lineThickness = lw === "bold" ? "2.5px" : lw === "normal" ? "1.5px" : "1px";
  const lineStyle: React.CSSProperties = { height: lineThickness, background: lineColor, width: "100%" };

  const style = customize.headingStyle ?? "rule";

  if (style === "boxed") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={{ ...sizeStyle, background: "#e2e8f0", width: "100%", padding: "4px 8px", textAlign: "center", boxSizing: "border-box" }}>{txt}</div>
      </div>
    );
  }

  if (style === "underline") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={{ ...sizeStyle, borderBottom: `${lineThickness} solid ${lineColor}`, paddingBottom: "4px", display: "inline-block" }}>{txt}</div>
      </div>
    );
  }

  if (style === "split") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ ...sizeStyle, whiteSpace: "nowrap" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  if (style === "plain") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={sizeStyle}>{txt}</div>
      </div>
    );
  }

  if (style === "double") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={lineStyle} />
        <div style={{ ...sizeStyle, marginTop: "5px", marginBottom: "5px" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  if (style === "leftbar") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "stretch", gap: "8px" }}>
        <div style={{ width: lineThickness === "1px" ? "3px" : lineThickness === "1.5px" ? "4px" : "5px", background: lineColor, borderRadius: "2px", flexShrink: 0 }} />
        <div style={sizeStyle}>{txt}</div>
      </div>
    );
  }

  if (style === "centered") {
    return (
      <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={lineStyle} />
        <div style={{ ...sizeStyle, whiteSpace: "nowrap" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  // default: "rule"
  return (
    <div className="resume-section-heading" style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
      <div style={sizeStyle}>{txt}</div>
      <div style={{ marginTop: "2px", marginBottom: "3px", ...lineStyle }} />
    </div>
  );
}

const PREVIEW_DEFAULT_ORDER = ["basics", "skills", "experience", "education", "projects", "achievements", "custom"];

function normalizeEntryLayout(raw: string | undefined): EntryLayout {
  if (raw === "l1" || raw === "l2" || raw === "l3" || raw === "l4" || raw === "l5") return raw;
  return "l1";
}

function getListingOrders(customize: ResumeCustomize) {
  const titleFirst = (customize.entryListingTitleOrder ?? "titleFirst") !== "subtitleFirst";
  const metaDateFirst = (customize.entryListingMetaOrder ?? "dateFirst") !== "locationFirst";
  return { titleFirst, metaDateFirst };
}

/** Education GPA on preview — always `GPA: value`; strips a duplicate leading "GPA:" from input */
function formatGpaForPreview(gpa: string | undefined): string {
  const t = (gpa ?? "").trim();
  if (!t) return "";
  const cleaned = t.replace(/^\s*gpa\s*:?\s*/i, "").trim();
  return cleaned ? `GPA: ${cleaned}` : "";
}

/**
 * Single-line meta (layout 1 & fallback). With GPA (education): `Date | Location | GPA` or `Location | Date | GPA`.
 * Without GPA: `Date | Location` or `Location | Date`.
 */
function buildMetaSameLine(
  dateStr: string,
  location: string | undefined,
  metaDateFirst: boolean,
  gpa?: string
): string {
  const d = (dateStr ?? "").trim();
  const l = (location ?? "").trim();
  const g = formatGpaForPreview(gpa);
  if (g) {
    return metaDateFirst ? [d, l, g].filter(Boolean).join(" | ") : [l, d, g].filter(Boolean).join(" | ");
  }
  const ordered = metaDateFirst ? [d, l] : [l, d];
  return ordered.filter(Boolean).join(" | ");
}

/** Education layouts 2–4: line1 = first listing field; line2 = second field | GPA */
function educationMetaTwoLines(
  dateStr: string,
  location: string | undefined,
  gpaDisplay: string,
  metaDateFirst: boolean,
  align: "left" | "right"
): React.ReactNode {
  const d = (dateStr ?? "").trim();
  const l = (location ?? "").trim();
  const g = gpaDisplay;
  const ta = align === "right" ? "right" : "left";
  const lineStyle: React.CSSProperties = { textAlign: ta, lineHeight: ENTRY_META_LINE_HEIGHT };
  if (metaDateFirst) {
    return (
      <>
        {d ? <div style={lineStyle}>{d}</div> : null}
        {(l || g) ? <div style={lineStyle}>{[l, g].filter(Boolean).join(" | ")}</div> : null}
      </>
    );
  }
  return (
    <>
      {l ? <div style={lineStyle}>{l}</div> : null}
      {(d || g) ? <div style={lineStyle}>{[d, g].filter(Boolean).join(" | ")}</div> : null}
    </>
  );
}

/** l4 left meta; l5 outer columns (matched for symmetric layout) */
const ENTRY_META_COL = "clamp(96px, 20%, 150px)";
const ENTRY_COL_GAP_L4 = "24px";
const ENTRY_COL_GAP_L5 = "17px";

function getEntryBodyIndentStyle(customize: ResumeCustomize, hasLeftMetaColumn: boolean): React.CSSProperties {
  const L = normalizeEntryLayout(customize.entryLayout);
  if (L === "l5") {
    return {
      marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L5})`,
      marginRight: `calc(${ENTRY_COL_GAP_L5} + ${ENTRY_META_COL})`,
      paddingLeft: "0.6em",
      paddingRight: "0.6em",
    };
  }
  if (L === "l4" && hasLeftMetaColumn) {
    return {
      marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L4})`,
      paddingLeft: "0.6em",
    };
  }
  return { paddingLeft: "0.6em" };
}

function getCourseworkIndentStyle(customize: ResumeCustomize, hasLeftMetaColumn: boolean): React.CSSProperties {
  const L = normalizeEntryLayout(customize.entryLayout);
  if (L === "l5") {
    return {
      marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L5})`,
      marginRight: `calc(${ENTRY_COL_GAP_L5} + ${ENTRY_META_COL})`,
    };
  }
  if (L === "l4" && hasLeftMetaColumn) {
    return { marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L4})` };
  }
  return {};
}

function renderEntryHeader(
  title: string,
  subtitle: string | undefined,
  dateStr: string,
  location: string | undefined,
  customize: ResumeCustomize,
  /** When set (including ""), subtitle is user subtitle only; tech stays on the same line as the title */
  projectInlineTech?: string,
  /** Education: appended last on meta lines after date | location */
  endMetaGpa?: string,
  /** Projects: optional URL shown as external-link icon after the project name */
  projectLinkUrl?: string
): React.ReactNode {
  const layout = normalizeEntryLayout(customize.entryLayout);
  const subStyle = customize.entrySubtitleStyle ?? "italic";
  const et = entryTitleStyle(customize);
  const metaColor = pickAccent(customize, "dates", "#334155");
  const subBase = subStyle === "bold" ? "#1e293b" : "#475569";

  const subCss: React.CSSProperties = {
    fontStyle: subStyle === "italic" ? "italic" : "normal",
    fontWeight: subStyle === "bold" ? 700 : 400,
    color: pickAccent(customize, "entrySubtitle", subBase),
  };

  const linkIconStyle: React.CSSProperties = {
    ...projectLinkAnchorStyle,
    color: pickAccent(customize, "linkIcons", "#475569"),
  };

  const projectMode = projectInlineTech !== undefined;
  const techDisplay = projectMode ? (projectInlineTech ?? "").trim() : "";
  const linkTrim = (projectLinkUrl ?? "").trim();
  const projectLinkIcon =
    linkTrim && projectMode && isLikelyWebUrl(linkTrim) ? (
      <a
        href={ensureHttp(linkTrim)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Project link"
        style={linkIconStyle}
      >
        <IconExternalLink />
      </a>
    ) : null;

  const hasSub = !!subtitle?.trim();
  const hasDate = !!dateStr?.trim();
  const hasLoc = !!location?.trim();
  const gpaDisplay = formatGpaForPreview(endMetaGpa);
  const hasGpa = !!gpaDisplay;

  const { titleFirst, metaDateFirst } = getListingOrders(customize);

  /** No date: same idea as projects — ignore l3–l5; only l1 (default) or l2; location stays on the first row */
  const layoutForRender: EntryLayout =
    !hasDate && !projectMode ? (layout === "l2" ? "l2" : "l1") : layout;

  const metaSameLine = buildMetaSameLine(dateStr, location, metaDateFirst, endMetaGpa);

  /** First in order = bold (title role); second = subtitle style */
  const titleCommaSubtitle = titleFirst ? (
    <span style={{ overflowWrap: "anywhere" as const }}>
      <span className="font-semibold" style={et}>
        {title}
      </span>
      {hasSub && (
        <>
          <span className="text-slate-900">, </span>
          <span style={subCss}>{subtitle}</span>
        </>
      )}
    </span>
  ) : (
    <span style={{ overflowWrap: "anywhere" as const }}>
      {hasSub ? (
        <>
          <span className="font-semibold" style={et}>
            {subtitle}
          </span>
          <span className="text-slate-900">, </span>
          <span style={subCss}>{title}</span>
        </>
      ) : (
        <span className="font-semibold" style={et}>
          {title}
        </span>
      )}
    </span>
  );

  /** Projects: name | tech — strong row (title role) vs soft row (subtitle role) */
  const projectTitleTechLineStrong = (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-1" style={{ overflowWrap: "anywhere" }}>
      <span className="font-semibold" style={et}>
        {title}
      </span>
      {projectLinkIcon}
      {techDisplay ? (
        <>
          <span className="text-slate-900"> | </span>
          <span style={subCss}>{techDisplay}</span>
        </>
      ) : null}
    </span>
  );
  const projectTitleTechLineSoft = (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-1" style={{ overflowWrap: "anywhere" }}>
      <span style={subCss}>{title}</span>
      {projectLinkIcon}
      {techDisplay ? (
        <>
          <span className="text-slate-900"> | </span>
          <span style={subCss}>{techDisplay}</span>
        </>
      ) : null}
    </span>
  );

  const projectTitleBody = titleFirst ? (
    <>
      <div>{projectTitleTechLineStrong}</div>
      {hasSub && <div style={subCss}>{subtitle}</div>}
    </>
  ) : (
    <>
      {hasSub && (
        <div className="font-semibold" style={et}>
          {subtitle}
        </div>
      )}
      <div>{hasSub ? projectTitleTechLineSoft : projectTitleTechLineStrong}</div>
    </>
  );
  const projectLeftStack = <div style={{ minWidth: 0 }}>{projectTitleBody}</div>;

  const metaD = (dateStr ?? "").trim();
  const metaL = (location ?? "").trim();

  /** Render two-line date/location (used by l2/l3 right column and l4 left column). */
  const renderMetaTwoLines = (align: "left" | "right") => {
    const ta = align === "right" ? "right" as const : "left" as const;
    const lineStyle: React.CSSProperties = { textAlign: ta, lineHeight: ENTRY_META_LINE_HEIGHT };
    if (hasGpa) return educationMetaTwoLines(dateStr, location, gpaDisplay, metaDateFirst, align);
    if (metaD && metaL) {
      return metaDateFirst ? (
        <><div style={lineStyle}>{metaD}</div><div style={lineStyle}>{metaL}</div></>
      ) : (
        <><div style={lineStyle}>{metaL}</div><div style={lineStyle}>{metaD}</div></>
      );
    }
    return <div style={lineStyle}>{metaSameLine}</div>;
  };

  /** l4 left meta: date & location on separate lines when both present; else one line */
  const leftMetaStack =
    hasDate || hasLoc || hasGpa ? (
      <div
        style={{
          flexShrink: 0,
          width: ENTRY_META_COL,
          boxSizing: "border-box",
          color: metaColor,
          lineHeight: ENTRY_META_LINE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1px",
        }}
      >
        {renderMetaTwoLines("left")}
      </div>
    ) : null;

  // Layout 1: "Title, Subtitle" left | "Date | Location | GPA" right (one row)
  if (layoutForRender === "l1") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "flex-start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        {projectMode ? projectLeftStack : <div style={{ minWidth: 0 }}>{titleCommaSubtitle}</div>}
        {(hasDate || hasLoc || hasGpa) && (
          <div
            style={{
              flexShrink: 0,
              color: metaColor,
              textAlign: "right",
              maxWidth: "50%",
              lineHeight: ENTRY_META_LINE_HEIGHT,
            }}
          >
            {metaSameLine}
          </div>
        )}
      </div>
    );
  }

  /** l2 / l3 right meta: date & location on separate lines when both present; else one line */
  const rightMetaColumn =
    hasDate || hasLoc || hasGpa ? (
      <div
        style={{
          flexShrink: 0,
          color: metaColor,
          lineHeight: ENTRY_META_LINE_HEIGHT,
          maxWidth: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1px",
        }}
      >
        {renderMetaTwoLines("right")}
      </div>
    ) : null;

  // Layout 2: title on one line, subtitle next line — date & location stacked on the right
  if (layoutForRender === "l2") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "flex-start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        {projectMode ? (
          projectLeftStack
        ) : (
          <div style={{ minWidth: 0 }}>
            {titleFirst ? (
              <>
                <div className="font-semibold" style={et}>
                  {title}
                </div>
                {hasSub && <div style={subCss}>{subtitle}</div>}
              </>
            ) : hasSub ? (
              <>
                <div className="font-semibold" style={et}>
                  {subtitle}
                </div>
                <div style={subCss}>{title}</div>
              </>
            ) : (
              <div className="font-semibold" style={et}>
                {title}
              </div>
            )}
          </div>
        )}
        {rightMetaColumn}
      </div>
    );
  }

  // Layout 3: "Title, Subtitle" one line — date & location on separate lines, right-aligned
  if (layoutForRender === "l3") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "flex-start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        {projectMode ? projectLeftStack : <div style={{ minWidth: 0 }}>{titleCommaSubtitle}</div>}
        {rightMetaColumn}
      </div>
    );
  }

  // Layout 4: Date & Location stacked left — Title and Subtitle on separate lines on the right
  if (layoutForRender === "l4") {
    return (
      <div
        style={{
          display: "flex",
          gap: ENTRY_COL_GAP_L4,
          alignItems: "flex-start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        {leftMetaStack}
        <div style={{ flex: 1, minWidth: 0 }}>
          {projectMode ? (
            projectTitleBody
          ) : titleFirst ? (
            <>
              <div className="font-semibold" style={et}>
                {title}
              </div>
              {hasSub && <div style={subCss}>{subtitle}</div>}
            </>
          ) : hasSub ? (
            <>
              <div className="font-semibold" style={et}>
                {subtitle}
              </div>
              <div style={subCss}>{title}</div>
            </>
          ) : (
            <div className="font-semibold" style={et}>
              {title}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout 5 (education + GPA): left = Date or Location (listing order); right = other field, then GPA (stacked)
  if (layoutForRender === "l5") {
    let l5Col1: string | null = null;
    let l5Col3: string | null = null;

    if (hasGpa) {
      if (metaDateFirst) {
        l5Col1 = (dateStr ?? "").trim() || null;
      } else {
        l5Col1 = (location ?? "").trim() || null;
      }
    } else if (hasDate && hasLoc) {
      if (metaDateFirst) {
        l5Col1 = dateStr;
        l5Col3 = location ?? null;
      } else {
        l5Col1 = location ?? null;
        l5Col3 = dateStr;
      }
    } else if (hasDate) {
      l5Col1 = dateStr;
    } else if (hasLoc) {
      l5Col3 = location ?? null;
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${ENTRY_META_COL} minmax(0, 1fr) ${ENTRY_META_COL}`,
          columnGap: ENTRY_COL_GAP_L5,
          rowGap: "2px",
          alignItems: "start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        <div style={{ color: metaColor, textAlign: "left" }}>{l5Col1}</div>
        <div style={{ minWidth: 0 }}>
          {projectMode ? projectTitleBody : titleFirst ? (
            <>
              <div className="font-semibold" style={et}>
                {title}
              </div>
              {hasSub && <div style={subCss}>{subtitle}</div>}
            </>
          ) : hasSub ? (
            <>
              <div className="font-semibold" style={et}>
                {subtitle}
              </div>
              <div style={subCss}>{title}</div>
            </>
          ) : (
            <div className="font-semibold" style={et}>
              {title}
            </div>
          )}
        </div>
        <div style={{ color: metaColor, textAlign: "right", lineHeight: ENTRY_META_LINE_HEIGHT }}>
          {hasGpa ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1px", lineHeight: ENTRY_META_LINE_HEIGHT }}>
              {metaDateFirst ? (
                <>
                  {(location ?? "").trim() ? <div>{(location ?? "").trim()}</div> : null}
                  {gpaDisplay ? <div>{gpaDisplay}</div> : null}
                </>
              ) : (
                <>
                  {(dateStr ?? "").trim() ? <div>{(dateStr ?? "").trim()}</div> : null}
                  {gpaDisplay ? <div>{gpaDisplay}</div> : null}
                </>
              )}
            </div>
          ) : (
            l5Col3
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "flex-start",
        marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
      }}
    >
      {projectMode ? projectLeftStack : <div style={{ minWidth: 0 }}>{titleCommaSubtitle}</div>}
      {(hasDate || hasLoc || hasGpa) && (
        <div
          style={{
            flexShrink: 0,
            color: metaColor,
            textAlign: "right",
            maxWidth: "50%",
            lineHeight: ENTRY_META_LINE_HEIGHT,
          }}
        >
          {metaSameLine}
        </div>
      )}
    </div>
  );
}

function projectSubtitleCss(customize: ResumeCustomize): React.CSSProperties {
  const subStyle = customize.entrySubtitleStyle ?? "italic";
  const subBase = subStyle === "bold" ? "#1e293b" : "#475569";
  return {
    fontStyle: subStyle === "italic" ? "italic" : "normal",
    fontWeight: subStyle === "bold" ? 700 : 400,
    color: pickAccent(customize, "entrySubtitle", subBase),
  };
}

/** Tech stack: split on commas or pipes, normalize to comma-separated for display */
function formatTechStackForDisplay(stack: string): string {
  return stack
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

/** Project title / meta only (pagination splits bullets separately). */
function renderProjectHeaderOnly(p: Project, customize: ResumeCustomize): React.ReactNode {
  const dateStr = formatProjectRange(p.start, p.end);
  const hasDate = !!dateStr.trim();
  const name = (p.name ?? "").trim();
  const stackRaw = (p.stack ?? "").trim();
  const subtitle = (p.subtitle ?? "").trim();
  const loc = (p.location ?? "").trim();
  const techLine = formatTechStackForDisplay(stackRaw);
  const linkRaw = (p.link ?? "").trim();
  const linkHref = linkRaw && isLikelyWebUrl(linkRaw) ? linkRaw : "";
  const projectLinkIconStyleResolved: React.CSSProperties = {
    ...projectLinkAnchorStyle,
    color: pickAccent(customize, "linkIcons", "#475569"),
  };
  const noDateLinkIcon = linkHref ? (
    <a href={ensureHttp(linkHref)} target="_blank" rel="noopener noreferrer" aria-label="Project link" style={projectLinkIconStyleResolved}>
      <IconExternalLink />
    </a>
  ) : null;

  if (!hasDate) {
    const { titleFirst } = getListingOrders(customize);
    const subCssProps = projectSubtitleCss(customize);
    const et = entryTitleStyle(customize);
    const nameLineStrong = (
      <div className="inline-flex max-w-full flex-wrap items-center gap-x-1 text-slate-900">
        <span className="font-semibold" style={et}>
          {name || "Project"}
        </span>
        {noDateLinkIcon}
        {techLine ? (
          <>
            <span> | </span>
            <span style={subCssProps}>{techLine}</span>
          </>
        ) : null}
      </div>
    );
    const nameLineSoft = (
      <div className="inline-flex max-w-full flex-wrap items-center gap-x-1 text-slate-900">
        <span style={subCssProps}>{name || "Project"}</span>
        {noDateLinkIcon}
        {techLine ? (
          <>
            <span> | </span>
            <span style={subCssProps}>{techLine}</span>
          </>
        ) : null}
      </div>
    );
    const subLine = subtitle ? <div style={subCssProps}>{subtitle}</div> : null;
    return (
      <>
        {titleFirst ? (
          <>
            {nameLineStrong}
            {subLine}
          </>
        ) : subtitle ? (
          <>
            <div className="font-semibold" style={et}>
              {subtitle}
            </div>
            {nameLineSoft}
          </>
        ) : (
          nameLineStrong
        )}
      </>
    );
  }

  return renderEntryHeader(name, subtitle || undefined, dateStr, loc || undefined, customize, techLine, undefined, linkHref || undefined);
}

function renderProjectBlock(p: Project, customize: ResumeCustomize): React.ReactNode {
  const dateStr = formatProjectRange(p.start, p.end);
  const hasDate = !!dateStr.trim();
  const bulletPrep = p.bulletsHtml?.trim() ? prepareRichPreviewHtml(p.bulletsHtml.trim()) : null;
  const bullets = bulletPrep ? (
    <div
      className="text-slate-800"
      style={{
        marginTop: ENTRY_BODY_TOP_GAP_PX,
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        ...(hasDate
          ? getEntryBodyIndentStyle(customize, !!dateStr.trim())
          : { paddingLeft: "0.6em" }),
        ...(bulletPrep.textAlign ? { textAlign: bulletPrep.textAlign } : {}),
      }}
      dangerouslySetInnerHTML={{ __html: bulletPrep.html }}
    />
  ) : null;
  return (
    <div>
      {renderProjectHeaderOnly(p, customize)}
      {bullets}
    </div>
  );
}

/** Build blocks (continuous flow; pages slice by viewport height for line-level breaks) */
function buildBlocks(data: ResumeData, customize: ResumeCustomize, baseFontPx: number, pageW: number): Block[] {
  const blocks: Block[] = [];

  const contactItems: { icon: React.ReactNode; label: string; href?: string }[] = [];
  if ((data.phone ?? "").trim()) contactItems.push({ icon: <IconPhone />, label: data.phone.trim() });
  if ((data.email ?? "").trim()) contactItems.push({ icon: <IconMail />, label: data.email.trim(), href: `mailto:${data.email.trim()}` });
  if ((data.linkedin ?? "").trim()) contactItems.push({ icon: <IconLinkedIn />, label: prettyLabel(data.linkedin.trim()), href: ensureHttp(data.linkedin.trim()) });
  if ((data.website ?? "").trim()) contactItems.push({ icon: <IconGlobe />, label: prettyLabel(data.website.trim()), href: ensureHttp(data.website.trim()) });
  if ((data.github ?? "").trim()) contactItems.push({ icon: <IconGitHub />, label: prettyLabel(data.github!.trim()), href: ensureHttp(data.github!.trim()) });

  const contentPadPx = mmToPx(customize.marginXmm);
  const padYpx = mmToPx(customize.marginYmm);
  const isBanner = customize.headerColorMode === "banner";
  const bannerBg = resolveAccentHex(customize);

  const nameStyle: React.CSSProperties = {
    fontSize: baseFontPx + 16,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: isBanner ? "#ffffff" : pickAccent(customize, "name", "#0f172a"),
  };

  /** Gap between icon and label (match project link row spacing) */
  const CONTACT_ICON_GAP = "4px";
  const contactFontSize = Math.max(11, baseFontPx * 0.92);
  const contactDefault = "#1a1a1a";
  const contactColor = isBanner ? "#ffffff" : pickAccent(customize, "headerContactText", contactDefault);
  const headerIconColor = isBanner
    ? "#ffffff"
    : pickAccent(customize, "headerIcons", contactColor);

  const renderContactChip = (
    item: (typeof contactItems)[number],
    i: number,
    textAlign: "left" | "right" | "center" = "left"
  ) => (
    <span
      key={i}
      className="max-w-full"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: CONTACT_ICON_GAP,
        lineHeight: 1.25,
        justifyContent: textAlign === "right" ? "flex-end" : textAlign === "center" ? "center" : "flex-start",
      }}
    >
      <span style={{ color: headerIconColor, display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{item.icon}</span>
      {item.href ? (
        <a
          href={item.href}
          style={{
            color: contactColor,
            textDecoration: "none",
            textAlign,
            lineHeight: 1.25,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {item.label}
        </a>
      ) : (
        <span
          style={{
            color: contactColor,
            textAlign,
            lineHeight: 1.25,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {item.label}
        </span>
      )}
    </span>
  );

  const locTrim = (data.location ?? "").trim();
  const nameTrim = (data.name ?? "").trim() || "Your Name";
  const headlineTrim = (data.headline ?? "").trim();

  const renderLocationWithIcon = (variant: "centeredBlock" | "leftBlock" | "inlineRow") => {
    if (!locTrim) return null;
    const inner = (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: CONTACT_ICON_GAP,
          color: contactColor,
          fontSize: variant === "inlineRow" ? undefined : contactFontSize,
          lineHeight: 1.25,
        }}
      >
        <span style={{ color: headerIconColor, display: "inline-flex", alignItems: "center" }}>
          <IconLocation />
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1.25 }}>{locTrim}</span>
      </span>
    );
    if (variant === "centeredBlock") {
      return <div style={{ marginTop: "2px", display: "flex", justifyContent: "center" }}>{inner}</div>;
    }
    if (variant === "leftBlock") {
      return <div style={{ marginTop: "2px", display: "flex", alignItems: "center" }}>{inner}</div>;
    }
    return inner;
  };

  const headerLayout = normalizeHeaderLayout(customize.headerLayout);
  const summaryAlignLeft =
    headerLayout === "splitRight" || headerLayout === "nameThenInline" || headerLayout === "stackLeft";

  const summaryDefaultAlignClass = summaryAlignLeft
    ? "[&_p]:text-left [&_ul]:text-left [&_ol]:text-left"
    : "[&_p]:text-center [&_ul]:text-center [&_ol]:text-center";

  const summaryPrep = data.summary?.trim() ? prepareRichPreviewHtml(data.summary.trim()) : null;
  const summaryBlock = summaryPrep ? (
    <div
      className={summaryPrep.textAlign ? undefined : summaryDefaultAlignClass}
      style={{
        marginTop: summaryAlignLeft ? "10px" : "6px",
        fontSize: "12px",
        color: "#1a1a1a",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        ...(summaryPrep.textAlign ? { textAlign: summaryPrep.textAlign } : {}),
      }}
      dangerouslySetInnerHTML={{ __html: summaryPrep.html }}
    />
  ) : null;

  const headerNode = (() => {
    const headlineColor = isBanner ? "rgba(255,255,255,0.95)" : "#334155";
    const headlineBlock = headlineTrim ? (
      <div style={{ marginTop: "4px", fontSize: baseFontPx, color: headlineColor, fontWeight: 600 }}>{headlineTrim}</div>
    ) : null;

    const wrapBanner = (node: React.ReactNode) => {
      if (!isBanner) return node;
      /**
       * Full-bleed banner (same idea as cover letter): break out of the padded flow column with
       * negative horizontal inset so the bar spans the full sheet width.
       */
      return (
        <div
          style={{
            background: bannerBg,
            width: pageW,
            boxSizing: "border-box",
            marginLeft: -contentPadPx,
            marginRight: -contentPadPx,
            /**
             * Top offset is handled on page 1 by shifting the clip into the sheet’s top padding (see paginated
             * page wrapper). A negative margin here was clipped by `overflow: hidden` on the clip, leaving a
             * white band — same full-bleed idea as the cover letter’s header as direct child of the padded page.
             */
            paddingTop: padYpx + 14,
            paddingBottom: 22,
            paddingLeft: contentPadPx,
            paddingRight: contentPadPx,
            marginBottom: Math.max(6, Math.min(20, customize.sectionGapPx + 2)),
          }}
        >
          {node}
        </div>
      );
    };

    if (headerLayout === "splitRight") {
      return (
        <div>
          {wrapBanner(
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ textAlign: "left", flex: "1 1 auto", minWidth: 0 }}>
                <div style={nameStyle}>{nameTrim}</div>
                {renderLocationWithIcon("leftBlock")}
                {headlineBlock}
              </div>
              {contactItems.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "5px",
                    flexShrink: 0,
                    color: contactColor,
                    fontSize: contactFontSize,
                    lineHeight: 1.35,
                    maxWidth: "52%",
                  }}
                >
                  {contactItems.map((item, i) => renderContactChip(item, i, "right"))}
                </div>
              ) : null}
            </div>
          )}
          {summaryBlock}
        </div>
      );
    }

    if (headerLayout === "nameThenInline") {
      return (
        <div>
          {wrapBanner(
            <>
              <div style={nameStyle}>{nameTrim}</div>
              {headlineBlock}
              {locTrim || contactItems.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "10px",
                    rowGap: "6px",
                    marginTop: headlineTrim ? "6px" : "4px",
                    color: contactColor,
                    fontSize: contactFontSize,
                    lineHeight: 1.35,
                  }}
                >
                  {renderLocationWithIcon("inlineRow")}
                  {contactItems.map((item, i) => renderContactChip(item, i, "left"))}
                </div>
              ) : null}
            </>
          )}
          {summaryBlock}
        </div>
      );
    }

    if (headerLayout === "centerRow2") {
      return (
        <div className="text-center">
          {wrapBanner(
            <>
              <div style={nameStyle}>{nameTrim}</div>
              {locTrim || contactItems.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    rowGap: "6px",
                    marginTop: "6px",
                    color: contactColor,
                    fontSize: contactFontSize,
                    lineHeight: 1.35,
                  }}
                >
                  {renderLocationWithIcon("inlineRow")}
                  {contactItems.map((item, i) => renderContactChip(item, i, "center"))}
                </div>
              ) : null}
              {headlineTrim ? (
                <div style={{ marginTop: "6px", fontSize: baseFontPx, color: headlineColor, fontWeight: 600 }}>{headlineTrim}</div>
              ) : null}
            </>
          )}
          {summaryBlock}
        </div>
      );
    }

    if (headerLayout === "stackLeft") {
      return (
        <div>
          {wrapBanner(
            <div style={{ textAlign: "left" }}>
              <div style={nameStyle}>{nameTrim}</div>
              {renderLocationWithIcon("leftBlock")}
              {headlineBlock}
              {contactItems.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "5px",
                    marginTop: "6px",
                    color: contactColor,
                    fontSize: contactFontSize,
                    lineHeight: 1.35,
                  }}
                >
                  {contactItems.map((item, i) => renderContactChip(item, i, "left"))}
                </div>
              ) : null}
            </div>
          )}
          {summaryBlock}
        </div>
      );
    }

    // stackCenter — name, location, headline on separate lines; contact chips one centered wrapping row (matches layout thumbnail)
    return (
      <div className="text-center">
        {wrapBanner(
          <>
            <div style={nameStyle}>{nameTrim}</div>
            {renderLocationWithIcon("centeredBlock")}
            {headlineBlock}
            {contactItems.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  rowGap: "6px",
                  marginTop: "6px",
                  color: contactColor,
                  fontSize: contactFontSize,
                  lineHeight: 1.35,
                }}
              >
                {contactItems.map((item, i) => renderContactChip(item, i, "center"))}
              </div>
            ) : null}
          </>
        )}
        {summaryBlock}
      </div>
    );
  })();

  const customLabel = (data.customSectionTitle ?? "").trim() || "Custom";
  const order = customize.sectionOrder ?? PREVIEW_DEFAULT_ORDER;

  for (const key of order) {
    if (key === "basics") {
      blocks.push({ key: "header", node: headerNode });
    } else if (key === "education" && (data.education ?? []).length) {
      blocks.push({ key: "edu-title", node: <SectionHeading title="Education" customize={customize} /> });
      data.education.forEach((e) => {
        const degreeLine = [e.degree, e.field].filter(Boolean).join(" in ");
        const title = degreeLine.trim() || e.school;
        const subtitle = degreeLine.trim() ? e.school : undefined;
        const dateStr = formatRange(e.start, e.end);
        const hasLeftMeta = !!dateStr.trim();
        blocks.push({
          key: `edu-${e.id}`,
          node: (
            <div>
              {renderEntryHeader(title, subtitle, dateStr, e.city, customize, undefined, e.gpa)}
              {e.coursework?.trim() ? (() => {
                const cw = prepareRichPreviewHtml(e.coursework.trim());
                return (
                  <div
                    className="text-slate-900 [&_p]:m-0 [&_p]:leading-[inherit]"
                    style={{
                      marginTop: 2,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      ...getCourseworkIndentStyle(customize, hasLeftMeta),
                      ...(cw.textAlign ? { textAlign: cw.textAlign } : {}),
                    }}
                    dangerouslySetInnerHTML={{ __html: cw.html }}
                  />
                );
              })() : null}
            </div>
          ),
        });
      });
    } else if (key === "experience" && (data.experience ?? []).length) {
      blocks.push({ key: "exp-title", node: <SectionHeading title="Work Experience" customize={customize} /> });
      data.experience.forEach((x) => {
        const dateStr = formatRange(x.start, x.end);
        const hasLeftMeta = !!dateStr.trim();
        blocks.push({
          key: `exp-${x.id}`,
          node: (
            <div>
              {renderEntryHeader(x.title, x.company, dateStr, x.location, customize)}
              {x.bulletsHtml?.trim() ? (() => {
                const exp = prepareRichPreviewHtml(x.bulletsHtml.trim());
                return (
                  <div
                    className="text-slate-800"
                    style={{
                      marginTop: ENTRY_BODY_TOP_GAP_PX,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      ...getEntryBodyIndentStyle(customize, hasLeftMeta),
                      ...(exp.textAlign ? { textAlign: exp.textAlign } : {}),
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.html }}
                  />
                );
              })() : null}
            </div>
          ),
        });
      });
    } else if (key === "projects" && (data.projects ?? []).length) {
      blocks.push({ key: "proj-title", node: <SectionHeading title="Projects" customize={customize} /> });
      data.projects.forEach((p) => {
        blocks.push({
          key: `proj-${p.id}`,
          node: <div>{renderProjectBlock(p, customize)}</div>,
        });
      });
    } else if (key === "skills" && (data.skillBlocks ?? []).length) {
      const skillGap = customize.entryGapPx;
      const skillLinePx = Math.max(1, Math.round(baseFontPx * customize.lineHeight));
      blocks.push({
        key: "skills-section",
        node: (
          <div>
            <SectionHeading title="Skills" customize={customize} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${skillGap}px`,
              }}
            >
              {data.skillBlocks.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: "block",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    lineHeight: `${skillLinePx}px`,
                  }}
                >
                  <span className="font-semibold text-slate-900" style={{ color: pickAccent(customize, "dotsBarsBubbles", "#0f172a") }}>
                    {b.title}:{" "}
                  </span>
                  {b.kind === "text" ? (() => {
                    const sk = prepareRichPreviewHtml((b.text ?? "").trim());
                    if (!sk.html) return null;
                    return (
                      <div
                        className="min-w-0 max-w-full text-slate-900 [&_p]:m-0"
                        style={{
                          display: "block",
                          lineHeight: `${skillLinePx}px`,
                          ...(sk.textAlign ? { textAlign: sk.textAlign } : {}),
                        }}
                        dangerouslySetInnerHTML={{ __html: sk.html }}
                      />
                    );
                  })() : (
                    <span className="text-slate-900">{(b.items ?? []).join(", ")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    } else if (key === "achievements" && hasAny(data.achievements)) {
      blocks.push({ key: "ach-title", node: <SectionHeading title="Awards / Achievements" customize={customize} /> });
      blocks.push({
        key: "ach-list",
        node: (
          <div className="space-y-1">
            {(data.achievements ?? []).filter((a) => a.trim()).map((a, i) => {
              const ach = prepareRichPreviewHtml(a.trim());
              return (
                <div
                  key={i}
                  className="text-slate-900"
                  style={{
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    ...(ach.textAlign ? { textAlign: ach.textAlign } : {}),
                  }}
                  dangerouslySetInnerHTML={{ __html: ach.html }}
                />
              );
            })}
          </div>
        ),
      });
    } else if (key === "custom" && ((data.custom?.length ?? 0) > 0 || (data.customSectionTitle ?? "").trim())) {
      blocks.push({ key: "custom-title", node: <SectionHeading title={customLabel} customize={customize} /> });
      (data.custom ?? []).forEach((c) => {
        const dateStr = formatRange(c.start, c.end);
        const hasLeftMeta = !!dateStr.trim();
        blocks.push({
          key: `custom-${c.id}`,
          node: (
            <div>
              {renderEntryHeader(c.title, c.subtitle, dateStr, c.location, customize)}
              {c.mode === "text" ? (
                c.text?.trim() ? (() => {
                  const ct = prepareRichPreviewHtml(c.text.trim());
                  return (
                    <div
                      className="text-slate-800"
                      style={{
                        marginTop: ENTRY_BODY_TOP_GAP_PX,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        ...getCourseworkIndentStyle(customize, hasLeftMeta),
                        ...(ct.textAlign ? { textAlign: ct.textAlign } : {}),
                      }}
                      dangerouslySetInnerHTML={{ __html: ct.html }}
                    />
                  );
                })() : null
              ) : c.bulletsHtml?.trim() ? (() => {
                const cb = prepareRichPreviewHtml(c.bulletsHtml.trim());
                return (
                  <div
                    className="text-slate-800"
                    style={{
                      marginTop: ENTRY_BODY_TOP_GAP_PX,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      ...getEntryBodyIndentStyle(customize, hasLeftMeta),
                      ...(cb.textAlign ? { textAlign: cb.textAlign } : {}),
                    }}
                    dangerouslySetInnerHTML={{ __html: cb.html }}
                  />
                );
              })() : null}
            </div>
          ),
        });
      });
    }
  }

  return blocks;
}

export type OverleafTabsPreviewHandle = {
  download: () => Promise<void>;
};

const OverleafTabsPreview = React.forwardRef<
  OverleafTabsPreviewHandle,
  { data: ResumeData; customize: ResumeCustomize }
>(function OverleafTabsPreview({ data, customize }, ref) {
  const baseFontPx = useMemo(() => ptToPx(customize.fontSizePt), [customize.fontSizePt]);

  const padX = useMemo(() => mmToPx(customize.marginXmm), [customize.marginXmm]);
  const padY = useMemo(() => mmToPx(customize.marginYmm), [customize.marginYmm]);

  const { pageW, pageH } = useMemo(() => pageDimensions(customize.pageSize), [customize.pageSize]);

  const contentW = pageW - padX * 2;
  const contentH = pageH - padY * 2;

  /** Theoretical line step (before DOM measurement). */
  const lineStepPx = useMemo(
    () => Math.max(1, Math.round(baseFontPx * customize.lineHeight)),
    [baseFontPx, customize.lineHeight]
  );

  const sliceDefault = useMemo(() => {
    const snap = computeLineSnappedViewport(contentH, lineStepPx);
    return {
      ...snap,
      pageCount: 1,
      pageWindows: [{ start: 0, contentEnd: snap.viewportH }] as PageContentWindow[],
    };
  }, [contentH, lineStepPx]);

  /** Measured snap + viewport + page windows (contiguous content bands + bottom clip, no overlap). */
  const [measuredSlice, setMeasuredSlice] = useState<{
    lineSnapPx: number;
    viewportH: number;
    padTop: number;
    padBottom: number;
    pageCount: number;
    pageWindows: PageContentWindow[];
  } | null>(null);

  const pm = measuredSlice ?? sliceDefault;

  const fontFamily = useMemo(() => {
    const name = (customize.fontName?.trim() || "Lato") as keyof typeof fontVarMap;
  
    const fontVarMap: Record<string, string> = {
      // Sans
      Lato:              "var(--font-lato)",
      Roboto:            "var(--font-roboto)",
      Nunito:            "var(--font-nunito)",
      "Open Sans":       "var(--font-open-sans)",
      "Work Sans":       "var(--font-work-sans)",
      "Source Sans Pro": "var(--font-source-sans)",
      "IBM Plex Sans":   "var(--font-ibm-plex-sans)",
      "Fira Sans":       "var(--font-fira-sans)",
      "Titillium Web":   "var(--font-titillium)",
      Rubik:             "var(--font-rubik)",
      Jost:              "var(--font-jost)",
      Karla:             "var(--font-karla)",
      Mulish:            "var(--font-mulish)",
      Barlow:            "var(--font-barlow)",
      Asap:              "var(--font-asap)",
      // Serif
      Lora:                 "var(--font-lora)",
      "Source Serif Pro":   "var(--font-source-serif)",
      "Zilla Slab":         "var(--font-zilla-slab)",
      "PT Serif":           "var(--font-pt-serif)",
      Literata:             "var(--font-literata)",
      "EB Garamond":        "var(--font-eb-garamond)",
      Aleo:                 "var(--font-aleo)",
      "Crimson Pro":        "var(--font-crimson-pro)",
      "Cormorant Garamond": "var(--font-cormorant-garamond)",
      Vollkorn:             "var(--font-vollkorn)",
      Amiri:                "var(--font-amiri)",
      "Crimson Text":       "var(--font-crimson-text)",
      Alegreya:             "var(--font-alegreya)",
      // Mono
      Inconsolata:       "var(--font-inconsolata)",
      "Source Code Pro": "var(--font-source-code)",
      "IBM Plex Mono":   "var(--font-ibm-plex-mono)",
      "Overpass Mono":   "var(--font-overpass-mono)",
      "Space Mono":      "var(--font-space-mono)",
      "Courier Prime":   "var(--font-courier-prime)",
    };
  
    const family = fontVarMap[name] ?? "var(--font-lato)";
  
    // keep fallbacks:
    if (customize.fontKind === "serif") return `${family}, ui-serif, Georgia, "Times New Roman", serif`;
    if (customize.fontKind === "mono") return `${family}, ui-monospace, Menlo, Monaco, Consolas, monospace`;
    return `${family}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial, sans-serif`;
  }, [customize.fontKind, customize.fontName]);
  

  const blocks = useMemo(() => buildBlocks(data, customize, baseFontPx, pageW), [data, customize, baseFontPx, pageW]);

  const measureRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [scale, setScale] = useState(1);

  /** Measure full content height then split into fixed-height pages. */
  const measureAndPaginate = async () => {
    const root = measureRef.current;
    if (!root) return;

    try {
      // @ts-ignore
      if (document?.fonts?.ready) await document.fonts.ready;
    } catch { /* ignore */ }

    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(() => r(null), 150));

    const strip = root.querySelector<HTMLElement>("[data-resume-flow-strip]");
    if (!strip) { setTimeout(() => measureAndPaginate(), 200); return; }

    const flowRoot = strip.querySelector<HTMLElement>(".resume-preview");
    if (!flowRoot) { setTimeout(() => measureAndPaginate(), 200); return; }

    /** scrollHeight is the stable content extent; max() with others was inflating `th` and creating bogus trailing pages. */
    const totalH = Math.ceil(flowRoot.scrollHeight);
    if (totalH <= 0 && blocks.length > 0) { setTimeout(() => measureAndPaginate(), 200); return; }

    const { viewportH, padTop, padBottom } = computeLineSnappedViewport(contentH, lineStepPx);
    const lineSnapPx = measureLineSnapFromStrip(strip, lineStepPx);

    const bands = collectLineBands(flowRoot, strip, viewportH, lineSnapPx);
    /** Line bands only — block-atomic moves were sending whole projects/skills to the next page and leaving empty space. */
    const pageWindows = computePageWindowsFromBands(totalH, viewportH, bands);

    const n = pageWindows.length;
    setMeasuredSlice((prev) => {
      const next = { lineSnapPx, viewportH, padTop, padBottom, pageCount: n, pageWindows };
      if (
        prev &&
        prev.viewportH === next.viewportH &&
        prev.pageCount === next.pageCount &&
        prev.pageWindows.every((w, i) => w.start === next.pageWindows[i].start && w.contentEnd === next.pageWindows[i].contentEnd)
      ) return prev;
      return next;
    });
  };

  useEffect(() => {
    setMeasuredSlice(null);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      measureAndPaginate();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, contentH, contentW, lineStepPx, baseFontPx, customize.lineHeight, fontFamily, customize.entryGapPx, customize.sectionGapPx]);

  // Fit width to preview column — useLayoutEffect so the first paint uses the real scale (avoids flash of scale=1 then shrink).
  useLayoutEffect(() => {
    /** No horizontal inset so preview can align with toolbar actions (Download); scaling uses transformOrigin top right so the page stays right-aligned. */
    const horizontalGutterPx = 0;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerWidth = container.clientWidth;
      const availableWidth = Math.max(0, containerWidth - horizontalGutterPx);
      if (availableWidth <= 0) return;
      const next = Math.min(1, availableWidth / pageW);
      setScale((prev) => (Math.abs(prev - next) < 0.0005 ? prev : next));
    };

    updateScale();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined && w > 0) {
        const availableWidth = Math.max(0, w - horizontalGutterPx);
        const next = Math.min(1, availableWidth / pageW);
        setScale((prev) => (Math.abs(prev - next) < 0.0005 ? prev : next));
      } else {
        updateScale();
      }
    });
    resizeObserver.observe(container);

    const onWindowResize = () => {
      updateScale();
      measureAndPaginate();
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageW]);

  /** Full page width + horizontal padding so banner can bleed to edges without being clipped (see page wrappers). */
  const commonTextStyle: React.CSSProperties = {
    width: pageW,
    paddingLeft: padX,
    paddingRight: padX,
    fontFamily,
    fontSize: baseFontPx,
    /* Body bullets use px line-height via .resume-preview p/li; keep unitless here so header/name lines aren’t squashed. */
    lineHeight: customize.lineHeight,
    boxSizing: "border-box",
  };

  const totalScaledHeight = useMemo(() => {
    const numPages = pm.pageCount || 1;
    // Intermediate pages with < 35% of viewport content look like tiny cards — treat them as full pages.
    const MIN_CLIP_H = Math.max(pm.lineSnapPx * 6, Math.round(pm.viewportH * 0.35), 80);
    let total = 0;
    for (let i = 0; i < numPages; i++) {
      const isLast = i === numPages - 1;
      const win = pm.pageWindows[i] ?? { start: 0, contentEnd: pm.viewportH };
      const clipH = Math.max(0, Math.round(win.contentEnd - win.start));
      const clipAreaH = Math.min(pm.viewportH, clipH);
      const isTiny = !isLast && clipAreaH < MIN_CLIP_H;
      total += (isLast || isTiny) ? pageH : padY * 2 + clipAreaH;
    }
    total += 24 * Math.max(0, numPages - 1);
    return total * scale;
  }, [pm.pageCount, pm.pageWindows, pm.viewportH, padY, scale, pageH]);

  useImperativeHandle(
    ref,
    () => ({
      download: async () => {
        const pageEls = containerRef.current?.querySelectorAll<HTMLElement>("[data-resume-page]");
        if (!pageEls || pageEls.length === 0) return;

        const [{ default: jsPDF }, { toJpeg }] = await Promise.all([
          import("jspdf"),
          import("html-to-image"),
        ]);

        const fmt = resolvePageSize(customize.pageSize) === "a4" ? "a4" : "letter";
        const doc = new jsPDF({ unit: "pt", format: fmt, orientation: "portrait" });

        for (let i = 0; i < pageEls.length; i++) {
          const pageWPt = doc.internal.pageSize.getWidth();
          const pageHPt = doc.internal.pageSize.getHeight();
          // html-to-image uses SVG foreignObject — handles all modern CSS including lab()/oklch()
          const dataUrl = await toJpeg(pageEls[i], {
            quality: 0.97,
            backgroundColor: "#ffffff",
            pixelRatio: 2,
            width: pageW,
            height: pageH,
          });
          if (i > 0) doc.addPage(fmt, "portrait");
          doc.addImage(dataUrl, "JPEG", 0, 0, pageWPt, pageHPt);
        }

        doc.save("resume.pdf");
      },
    }),
    [customize.pageSize, pageW, pageH]
  );

  return (
    <div ref={containerRef} className="relative flex min-h-0 w-full flex-col items-end">
      <style>{`
        .resume-preview ul { list-style: none; padding-left: 0.6em; margin: 0; }
        .resume-preview ol { list-style: none; padding-left: 0.6em; margin: 0; }
        .resume-preview li { padding-left: 0.9em; text-indent: -0.9em; margin: 0; line-height: ${pm.lineSnapPx}px; }
        .resume-preview li::before { content: "• "; }
        .resume-preview li p { display: inline; margin: 0; line-height: inherit; }
        .resume-preview p { margin: 0; line-height: ${pm.lineSnapPx}px; }
        .resume-preview a { text-decoration: none; color: inherit; }
      `}</style>
      {/* Hidden measurement layer — outside the scale transform so heights are true 1× */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          width: pageW,
          position: "fixed",
          left: -pageW - 100,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div data-resume-flow-strip style={{ width: pageW, display: "flow-root", boxSizing: "border-box" }}>
          <ResumeFlowColumn
            blocks={blocks}
            sectionMarginLevel={customize.sectionGapPx}
            entityGapPx={customize.entryGapPx}
            className="resume-preview"
            style={commonTextStyle}
          />
        </div>
      </div>

      {/* Scale wrapper — height kept so parent scrolls correctly */}
      <div
        style={{
          transform: `scale(${scale})`,
          /** `top center` left a gap on the right when scaled down; `top right` keeps the paper flush with the preview column (matches Download above). */
          transformOrigin: "top right",
          width: pageW,
          height: totalScaledHeight / scale, // layout height in unscaled px
          marginBottom: totalScaledHeight - totalScaledHeight / scale, // compensate visual shrink
        }}
      >
        {/* Visible pages */}
        <div className="space-y-6">
          {Array.from({ length: pm.pageCount }, (_, pageIdx) => {
            const win = pm.pageWindows[pageIdx] ?? { start: 0, contentEnd: pm.viewportH };
            const clipH = Math.max(0, Math.round(win.contentEnd - win.start));
            /** Must match the pagination window height — not always `viewportH` when we break early (e.g. before Skills). Using full viewport on a short window showed extra lines and duplicated them on the next page. */
            const clipAreaH = Math.min(pm.viewportH, clipH);
            const isLastPage = pageIdx === pm.pageCount - 1;
            // Must match totalScaledHeight logic — same threshold for tiny-page detection.
            const MIN_CLIP_H = Math.max(pm.lineSnapPx * 6, Math.round(pm.viewportH * 0.35), 80);
            const isTinyPage = !isLastPage && clipAreaH < MIN_CLIP_H;
            /** Last page + tiny intermediate pages use full page height. Other intermediate pages shrink to padY*2+clipAreaH to eliminate the empty gap at the bottom. */
            const pageHeight = (isLastPage || isTinyPage) ? pageH : padY * 2 + clipAreaH;
            const bottomFiller = (isLastPage || isTinyPage) ? Math.max(0, pageH - padY * 2 - clipAreaH) : 0;
            /** Page 1 + banner: pull the clip into the top padding so the bar isn’t clipped (cover-letter behavior). */
            const bannerBleedFirstPage = pageIdx === 0 && customize.headerColorMode === "banner";
            return (
            <div
              key={pageIdx}
              data-resume-page
              className="bg-white shadow-md"
              style={{
                width: pageW,
                height: pageHeight,
                paddingLeft: padX,
                paddingRight: padX,
                paddingTop: padY,
                paddingBottom: padY,
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: pageW,
                  marginLeft: -padX,
                  marginTop: bannerBleedFirstPage ? -padY : 0,
                  overflow: "visible",
                  boxSizing: "border-box",
                }}
              >
                {pm.padTop > 0 ? <div style={{ height: pm.padTop }} aria-hidden /> : null}
                <div
                  style={{
                    height: clipAreaH,
                    width: pageW,
                    overflow: "hidden",
                    display: "flow-root",
                    isolation: "isolate",
                    contain: "paint",
                    boxSizing: "border-box",
                  }}
                >
                  <ResumeFlowColumn
                    blocks={blocks}
                    sectionMarginLevel={customize.sectionGapPx}
                    entityGapPx={customize.entryGapPx}
                    translateY={Math.round(win.start)}
                    className="resume-preview"
                    style={commonTextStyle}
                  />
                </div>
                {bannerBleedFirstPage ? <div style={{ height: padY }} aria-hidden /> : null}
                {pm.padBottom > 0 ? <div style={{ height: pm.padBottom }} aria-hidden /> : null}
                {bottomFiller > 0 ? <div style={{ height: bottomFiller }} aria-hidden /> : null}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
export default OverleafTabsPreview;

