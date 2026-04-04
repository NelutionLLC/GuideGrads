"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { EntryLayout, HeaderLayout, ResumeCustomize, ResumeData } from "../ResumeBuilder";

const ptToPx = (pt: number) => (pt * 96) / 72;
const mmToPx = (mm: number) => (mm * 96) / 25.4;

// US Letter @ 96dpi
const LETTER_W = 8.5 * 96; // 816
const LETTER_H = 11 * 96; // 1056

function injectBulletStyles(html: string): string {
  return html
    // Strip <a> tags but keep their text content (no hyperlinks in resume body)
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/<ul>/g, '<ul style="list-style:none;padding-left:0;margin:0">')
    .replace(/<ol>/g, '<ol style="list-style:none;padding-left:0;margin:0">')
    .replace(/<li>/g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0">')
    .replace(/<li /g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0" ')
    // only inline <p> directly inside <li>, not all paragraphs
    .replace(/(<li[^>]*>)<p>/g, '$1<p style="display:inline;margin:0">')
    // hanging indent for plain <p> bullet paragraphs (user typed • directly)
    .replace(/<p>•/g, '<p style="padding-left:0.9em;text-indent:-0.9em;margin:0">•');
}


function formatRange(start?: string, end?: string) {
  const s = (start ?? "").trim();
  const e = (end ?? "").trim();
  if (!s && !e) return "";
  if (s && !e) return `${s} — Present`;
  if (!s && e) return e;
  return `${s} — ${e}`;
}

function hasAny(list?: string[]) {
  return (list ?? []).some((x) => (x ?? "").trim().length > 0);
}

function normalizeHeaderLayout(h: string | undefined): HeaderLayout {
  if (h === "stackCenter" || h === "centerRow2" || h === "splitRight" || h === "nameThenInline") return h;
  if (h === "split") return "splitRight";
  if (h === "centered") return "stackCenter";
  return "stackCenter";
}

type Block = { key: string; node: React.ReactNode };

/** Space between entry header row and bullets (work, projects, custom) — tighter than former mt-1. */
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
  if (blockKey.endsWith("-title")) {
    return sectionMarginLevelToPx(sectionMarginLevel);
  }
  if (prevBlockKey.endsWith("-title")) {
    return 0;
  }
  return entityGapPx;
}

function IconPhone() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.2 2.47.57 3.59a1 1 0 0 1-.24 1l-2.21 2.2Z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm7.93 9h-3.16a15.7 15.7 0 0 0-1.1-5.02A8.03 8.03 0 0 1 19.93 11ZM12 4c.96 0 2.26 2.09 2.93 7H9.07C9.74 6.09 11.04 4 12 4ZM4.07 13h3.16c.2 1.83.62 3.56 1.1 5.02A8.03 8.03 0 0 1 4.07 13Zm3.16-2H4.07a8.03 8.03 0 0 1 4.26-5.02c-.48 1.46-.9 3.19-1.1 5.02ZM12 20c-.96 0-2.26-2.09-2.93-7h5.86C14.26 17.91 12.96 20 12 20Zm3.67-1.98c.48-1.46.9-3.19 1.1-5.02h3.16a8.03 8.03 0 0 1-4.26 5.02Z" />
    </svg>
  );
}
function IconGitHub() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle" }}>
      <path d="M12 .5A12 12 0 0 0 0 12.78c0 5.44 3.44 10.05 8.2 11.68.6.12.82-.27.82-.58v-2.2c-3.34.75-4.04-1.66-4.04-1.66-.55-1.44-1.34-1.82-1.34-1.82-1.1-.78.08-.76.08-.76 1.2.09 1.84 1.27 1.84 1.27 1.08 1.9 2.83 1.35 3.52 1.03.1-.8.42-1.35.76-1.66-2.66-.31-5.46-1.38-5.46-6.12 0-1.35.46-2.45 1.22-3.31-.12-.31-.53-1.58.12-3.29 0 0 1-.33 3.3 1.27a11.1 11.1 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.71.24 2.98.12 3.29.76.86 1.22 1.96 1.22 3.31 0 4.76-2.8 5.8-5.48 6.11.43.39.82 1.16.82 2.34v3.46c0 .32.22.71.82.59A12.2 12.2 0 0 0 24 12.78 12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline", verticalAlign: "middle", flexShrink: 0 }}>
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
  const sizeStyle: React.CSSProperties = {
    fontSize: `${baseFontPx + headingOffset}px`,
    fontWeight: 800,
    letterSpacing: "0.04em",
    lineHeight: 1.2,
    color: "#0f172a",
  };

  const lw = customize.headingLineWeight ?? "light";
  const lineColor = lw === "bold" ? "#0f172a" : lw === "normal" ? "#334155" : "#cbd5e1";
  const lineThickness = lw === "bold" ? "2.5px" : lw === "normal" ? "1.5px" : "1px";
  const lineStyle: React.CSSProperties = { height: lineThickness, background: lineColor, width: "100%" };

  const style = customize.headingStyle ?? "rule";

  if (style === "boxed") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={{ ...sizeStyle, background: "#e2e8f0", width: "100%", padding: "4px 8px", textAlign: "center", boxSizing: "border-box" }}>{txt}</div>
      </div>
    );
  }

  if (style === "underline") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={{ ...sizeStyle, borderBottom: `${lineThickness} solid ${lineColor}`, paddingBottom: "4px", display: "inline-block" }}>{txt}</div>
      </div>
    );
  }

  if (style === "split") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ ...sizeStyle, whiteSpace: "nowrap" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  if (style === "plain") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={sizeStyle}>{txt}</div>
      </div>
    );
  }

  if (style === "double") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
        <div style={lineStyle} />
        <div style={{ ...sizeStyle, marginTop: "5px", marginBottom: "5px" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  if (style === "leftbar") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "stretch", gap: "8px" }}>
        <div style={{ width: lineThickness === "1px" ? "3px" : lineThickness === "1.5px" ? "4px" : "5px", background: lineColor, borderRadius: "2px", flexShrink: 0 }} />
        <div style={sizeStyle}>{txt}</div>
      </div>
    );
  }

  if (style === "centered") {
    return (
      <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1, display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={lineStyle} />
        <div style={{ ...sizeStyle, whiteSpace: "nowrap" }}>{txt}</div>
        <div style={lineStyle} />
      </div>
    );
  }

  // default: "rule"
  return (
    <div style={{ paddingTop: padTop, paddingBottom: padBottom, lineHeight: 1 }}>
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

/** Matches l4/l5 first column width + gap so bullets/coursework align with title text */
const ENTRY_META_COL = "clamp(96px, 20%, 150px)";
const ENTRY_COL_GAP_L4 = "24px";
const ENTRY_COL_GAP_L5 = "22px";

function getEntryBodyIndentStyle(customize: ResumeCustomize, hasLeftMetaColumn: boolean): React.CSSProperties {
  const L = normalizeEntryLayout(customize.entryLayout);
  if (L === "l5" && hasLeftMetaColumn) {
    return {
      marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L5})`,
      paddingLeft: "0.6em",
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
  if (L === "l5" && hasLeftMetaColumn) {
    return { marginLeft: `calc(${ENTRY_META_COL} + ${ENTRY_COL_GAP_L5})` };
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
  endMetaGpa?: string
): React.ReactNode {
  const layout = normalizeEntryLayout(customize.entryLayout);
  const subStyle = customize.entrySubtitleStyle ?? "italic";

  const subCss: React.CSSProperties = {
    fontStyle: subStyle === "italic" ? "italic" : "normal",
    fontWeight: subStyle === "bold" ? 700 : 400,
    color: subStyle === "bold" ? "#1e293b" : "#475569",
  };

  const projectMode = projectInlineTech !== undefined;
  const techDisplay = projectMode ? (projectInlineTech ?? "").trim() : "";

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
      <span className="font-semibold text-slate-900">{title}</span>
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
          <span className="font-semibold text-slate-900">{subtitle}</span>
          <span className="text-slate-900">, </span>
          <span style={subCss}>{title}</span>
        </>
      ) : (
        <span className="font-semibold text-slate-900">{title}</span>
      )}
    </span>
  );

  /** Projects: name | tech — strong row (title role) vs soft row (subtitle role) */
  const projectTitleTechLineStrong = (
    <span style={{ overflowWrap: "anywhere" as const }}>
      <span className="font-semibold text-slate-900">{title}</span>
      {techDisplay ? (
        <>
          <span className="text-slate-900"> | </span>
          <span style={subCss}>{techDisplay}</span>
        </>
      ) : null}
    </span>
  );
  const projectTitleTechLineSoft = (
    <span style={{ overflowWrap: "anywhere" as const }}>
      <span style={subCss}>{title}</span>
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
      {hasSub && <div className="font-semibold text-slate-900">{subtitle}</div>}
      <div>{hasSub ? projectTitleTechLineSoft : projectTitleTechLineStrong}</div>
    </>
  );
  const projectLeftStack = <div style={{ minWidth: 0 }}>{projectTitleBody}</div>;

  /** l4 left meta: education + GPA → two lines (same pattern as l2/l3 right); else one line */
  const leftMetaStack =
    hasDate || hasLoc || hasGpa ? (
      <div
        style={{
          flexShrink: 0,
          width: ENTRY_META_COL,
          boxSizing: "border-box",
          color: "#334155",
          lineHeight: ENTRY_META_LINE_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1px",
        }}
      >
        {hasGpa ? (
          educationMetaTwoLines(dateStr, location, gpaDisplay, metaDateFirst, "left")
        ) : (
          <div>{metaSameLine}</div>
        )}
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
              color: "#334155",
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

  /** l2 / l3 right meta: education + GPA → two lines; else one line */
  const rightMetaColumn =
    hasDate || hasLoc || hasGpa ? (
      <div
        style={{
          flexShrink: 0,
          color: "#334155",
          lineHeight: ENTRY_META_LINE_HEIGHT,
          maxWidth: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1px",
        }}
      >
        {hasGpa ? (
          educationMetaTwoLines(dateStr, location, gpaDisplay, metaDateFirst, "right")
        ) : (
          <div style={{ textAlign: "right" }}>{metaSameLine}</div>
        )}
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
                <div className="font-semibold text-slate-900">{title}</div>
                {hasSub && <div style={subCss}>{subtitle}</div>}
              </>
            ) : hasSub ? (
              <>
                <div className="font-semibold text-slate-900">{subtitle}</div>
                <div style={subCss}>{title}</div>
              </>
            ) : (
              <div className="font-semibold text-slate-900">{title}</div>
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
              <div className="font-semibold text-slate-900">{title}</div>
              {hasSub && <div style={subCss}>{subtitle}</div>}
            </>
          ) : hasSub ? (
            <>
              <div className="font-semibold text-slate-900">{subtitle}</div>
              <div style={subCss}>{title}</div>
            </>
          ) : (
            <div className="font-semibold text-slate-900">{title}</div>
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
          gridTemplateColumns: `${ENTRY_META_COL} minmax(0, 1fr) minmax(88px, 28%)`,
          columnGap: ENTRY_COL_GAP_L5,
          rowGap: "2px",
          alignItems: "start",
          marginBottom: -ENTRY_HEADER_ROW_TUCK_PX,
        }}
      >
        <div style={{ color: "#334155", textAlign: "left" }}>{l5Col1}</div>
        <div style={{ minWidth: 0 }}>
          {projectMode ? projectTitleBody : titleFirst ? (
            <>
              <div className="font-semibold text-slate-900">{title}</div>
              {hasSub && <div style={subCss}>{subtitle}</div>}
            </>
          ) : hasSub ? (
            <>
              <div className="font-semibold text-slate-900">{subtitle}</div>
              <div style={subCss}>{title}</div>
            </>
          ) : (
            <div className="font-semibold text-slate-900">{title}</div>
          )}
        </div>
        <div style={{ color: "#334155", textAlign: "right", lineHeight: ENTRY_META_LINE_HEIGHT }}>
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
            color: "#334155",
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
  return {
    fontStyle: subStyle === "italic" ? "italic" : "normal",
    fontWeight: subStyle === "bold" ? 700 : 400,
    color: subStyle === "bold" ? "#1e293b" : "#475569",
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

/** Projects: classic one-line preview when no date range; entry layouts when start/end are set */
function renderProjectBlock(p: ResumeData["projects"][number], customize: ResumeCustomize): React.ReactNode {
  const dateStr = formatRange(p.start, p.end);
  const hasDate = !!dateStr.trim();
  const name = (p.name ?? "").trim();
  const stackRaw = (p.stack ?? "").trim();
  const subtitle = (p.subtitle ?? "").trim();
  const loc = (p.location ?? "").trim();
  const techLine = formatTechStackForDisplay(stackRaw);

  const bullets =
    p.bulletsHtml?.trim() ? (
      <div
        className="text-slate-800"
        style={{
          marginTop: ENTRY_BODY_TOP_GAP_PX,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          ...(hasDate
            ? getEntryBodyIndentStyle(customize, !!dateStr.trim())
            : { paddingLeft: "0.6em" }),
        }}
        dangerouslySetInnerHTML={{ __html: injectBulletStyles(p.bulletsHtml.trim()) }}
      />
    ) : null;

  if (!hasDate) {
    const { titleFirst } = getListingOrders(customize);
    const subCssProps = projectSubtitleCss(customize);
    const nameLineStrong = (
      <div className="text-slate-900">
        <span className="font-semibold text-slate-900">{name || "Project"}</span>
        {techLine ? (
          <>
            <span> | </span>
            <span style={subCssProps}>{techLine}</span>
          </>
        ) : null}
      </div>
    );
    const nameLineSoft = (
      <div className="text-slate-900">
        <span style={subCssProps}>{name || "Project"}</span>
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
      <div>
        {titleFirst ? (
          <>
            {nameLineStrong}
            {subLine}
          </>
        ) : subtitle ? (
          <>
            <div className="font-semibold text-slate-900">{subtitle}</div>
            {nameLineSoft}
          </>
        ) : (
          nameLineStrong
        )}
        {bullets}
      </div>
    );
  }

  return (
    <div>
      {renderEntryHeader(name, subtitle || undefined, dateStr, loc || undefined, customize, techLine)}
      {bullets}
    </div>
  );
}

/** Build blocks (we paginate by block) */
function buildBlocks(data: ResumeData, customize: ResumeCustomize, baseFontPx: number): Block[] {
  const blocks: Block[] = [];

  const contactItems: { icon: React.ReactNode; label: string; href?: string }[] = [];
  if ((data.phone ?? "").trim()) contactItems.push({ icon: <IconPhone />, label: data.phone.trim() });
  if ((data.email ?? "").trim()) contactItems.push({ icon: <IconMail />, label: data.email.trim(), href: `mailto:${data.email.trim()}` });
  if ((data.linkedin ?? "").trim()) contactItems.push({ icon: <IconLinkedIn />, label: prettyLabel(data.linkedin.trim()), href: ensureHttp(data.linkedin.trim()) });
  if ((data.website ?? "").trim()) contactItems.push({ icon: <IconGlobe />, label: prettyLabel(data.website.trim()), href: ensureHttp(data.website.trim()) });
  if ((data.github ?? "").trim()) contactItems.push({ icon: <IconGitHub />, label: prettyLabel(data.github!.trim()), href: ensureHttp(data.github!.trim()) });

  const nameStyle: React.CSSProperties = {
    fontSize: baseFontPx + 16,
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#0f172a",
  };

  /** Tighter gap between contact icon and label */
  const CONTACT_ICON_GAP = "2px";
  const contactFontSize = Math.max(11, baseFontPx * 0.92);
  const contactColor = "#1a1a1a";

  const renderContactChip = (
    item: (typeof contactItems)[number],
    i: number,
    textAlign: "left" | "right" | "center" = "left"
  ) => (
    <span
      key={i}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: CONTACT_ICON_GAP,
        justifyContent: textAlign === "right" ? "flex-end" : textAlign === "center" ? "center" : "flex-start",
      }}
    >
      {item.icon}
      {item.href ? (
        <a href={item.href} style={{ color: contactColor, textDecoration: "none", textAlign }}>
          {item.label}
        </a>
      ) : (
        <span style={{ textAlign }}>{item.label}</span>
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
          lineHeight: 1.35,
        }}
      >
        <IconLocation />
        <span>{locTrim}</span>
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
  const summaryAlignLeft = headerLayout === "splitRight" || headerLayout === "nameThenInline";

  const summaryBlock = data.summary?.trim() ? (
    <div
      style={{
        marginTop: summaryAlignLeft ? "10px" : "6px",
        fontSize: "12px",
        color: "#1a1a1a",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        textAlign: summaryAlignLeft ? "left" : "center",
      }}
      dangerouslySetInnerHTML={{ __html: injectBulletStyles(data.summary.trim()) }}
    />
  ) : null;

  const headerNode = (() => {
    const headlineBlock = headlineTrim ? (
      <div style={{ marginTop: "4px", fontSize: baseFontPx, color: "#334155", fontWeight: 600 }}>{headlineTrim}</div>
    ) : null;

    if (headerLayout === "splitRight") {
      return (
        <div>
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
          {summaryBlock}
        </div>
      );
    }

    if (headerLayout === "nameThenInline") {
      return (
        <div>
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
          {summaryBlock}
        </div>
      );
    }

    if (headerLayout === "centerRow2") {
      return (
        <div className="text-center">
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
            <div style={{ marginTop: "6px", fontSize: baseFontPx, color: "#334155", fontWeight: 600 }}>{headlineTrim}</div>
          ) : null}
          {summaryBlock}
        </div>
      );
    }

    // stackCenter — name, location, headline, then contacts each on their own visual rows (centered)
    return (
      <div className="text-center">
        <div style={nameStyle}>{nameTrim}</div>
        {renderLocationWithIcon("centeredBlock")}
        {headlineBlock}
        {contactItems.length > 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "6px",
              color: contactColor,
              fontSize: contactFontSize,
              lineHeight: 1.35,
            }}
          >
            {contactItems.map((item, i) => renderContactChip(item, i, "center"))}
          </div>
        ) : null}
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
              {e.coursework?.trim() ? (
                <div
                  className="text-slate-900"
                  style={{ overflowWrap: "anywhere", wordBreak: "break-word", ...getCourseworkIndentStyle(customize, hasLeftMeta) }}
                >
                  <span className="font-semibold">Coursework:</span>{" "}
                  <div
                    className="inline min-w-0 align-baseline [&_p]:m-0 [&_p]:inline [&_p]:leading-[inherit]"
                    dangerouslySetInnerHTML={{ __html: injectBulletStyles(e.coursework.trim()) }}
                  />
                </div>
              ) : null}
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
              {x.bulletsHtml?.trim() ? (
                <div
                  className="text-slate-800"
                  style={{
                    marginTop: ENTRY_BODY_TOP_GAP_PX,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    ...getEntryBodyIndentStyle(customize, hasLeftMeta),
                  }}
                  dangerouslySetInnerHTML={{ __html: injectBulletStyles(x.bulletsHtml.trim()) }}
                />
              ) : null}
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
      blocks.push({ key: "skills-title", node: <SectionHeading title="Skills" customize={customize} /> });
      data.skillBlocks.forEach((b) => {
        blocks.push({
          key: `skill-${b.id}`,
          node: (
            <div style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
              <span className="font-semibold text-slate-900">{b.title}: </span>
              {b.kind === "text" ? (
                <span className="text-slate-900" dangerouslySetInnerHTML={{ __html: injectBulletStyles(b.text ?? "") }} />
              ) : (
                <span className="text-slate-900">{(b.items ?? []).join(", ")}</span>
              )}
            </div>
          ),
        });
      });
    } else if (key === "achievements" && hasAny(data.achievements)) {
      blocks.push({ key: "ach-title", node: <SectionHeading title="Awards / Achievements" customize={customize} /> });
      blocks.push({
        key: "ach-list",
        node: (
          <div className="space-y-1">
            {(data.achievements ?? []).filter((a) => a.trim()).map((a, i) => (
              <div key={i} className="text-slate-900" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(a.trim()) }} />
            ))}
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
                c.text?.trim() ? (
                  <div
                    className="text-slate-800"
                    style={{
                      marginTop: ENTRY_BODY_TOP_GAP_PX,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      ...getCourseworkIndentStyle(customize, hasLeftMeta),
                    }}
                    dangerouslySetInnerHTML={{ __html: injectBulletStyles(c.text.trim()) }}
                  />
                ) : null
              ) : c.bulletsHtml?.trim() ? (
                <div
                  className="text-slate-800"
                  style={{
                    marginTop: ENTRY_BODY_TOP_GAP_PX,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    ...getEntryBodyIndentStyle(customize, hasLeftMeta),
                  }}
                  dangerouslySetInnerHTML={{ __html: injectBulletStyles(c.bulletsHtml.trim()) }}
                />
              ) : null}
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

  const contentW = LETTER_W - padX * 2;
  const contentH = LETTER_H - padY * 2;

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
  

  const blocks = useMemo(() => buildBlocks(data, customize, baseFontPx), [data, customize, baseFontPx]);

  const measureRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [pages, setPages] = useState<Block[][]>([]);
  const [scale, setScale] = useState(1);

  // main measure function
  const measureAndPaginate = async () => {
    const root = measureRef.current;
    if (!root) return;

    // Wait for fonts to be ready (this is the BIG fix for overflow)
    try {
      // @ts-ignore
      if (document?.fonts?.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
    } catch {
      // ignore
    }

    // give layout multiple beats to ensure rendering is complete
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(() => r(null), 100));

    const kids = Array.from(root.querySelectorAll<HTMLElement>("[data-block]"));
    
    if (kids.length !== blocks.length) {
      // Measurement not ready yet, retry
      setTimeout(() => measureAndPaginate(), 200);
      return;
    }

    const heights = kids.map((el) => {
      const computedStyle = window.getComputedStyle(el);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      return Math.max(el.offsetHeight + marginTop + marginBottom, 0);
    });

    const lineH = baseFontPx * customize.lineHeight;

    const nextPages: Block[][] = [];
    let current: Block[] = [];
    let used = 0;

    blocks.forEach((b, i) => {
      const h = heights[i] ?? 0;
      const prevKey = i > 0 ? blocks[i - 1].key : undefined;
      const gapBefore = marginTopBeforeBlock(b.key, prevKey, customize.sectionGapPx, customize.entryGapPx);
      const gap = current.length > 0 ? gapBefore : 0;
      const spaceNeeded = h + gap;

      if (current.length > 0 && used + spaceNeeded > contentH - lineH * 6) {
        nextPages.push(current);
        current = [];
        used = 0;
      }

      current.push(b);
      used += (current.length === 1 ? 0 : gapBefore) + h;
    });

    // Add the last page if it has content
    if (current.length) nextPages.push(current);
    
    // Always set pages - ensure we have at least one page
    if (nextPages.length === 0 && blocks.length > 0) {
      // If measurement failed completely, show all blocks (will be visible, not hidden)
      setPages([blocks]);
    } else {
      setPages(nextPages);
    }
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    // Show new block content immediately; stale `pages` kept old layout until measure finished.
    setPages([blocks]);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      measureAndPaginate();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, contentH, contentW, baseFontPx, customize.lineHeight, fontFamily, customize.entryGapPx, customize.sectionGapPx]);

  // Calculate scale to fit container width
  useEffect(() => {
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const padding = 48; // Account for padding in container
      const availableWidth = containerWidth - padding;
      
      if (availableWidth > 0) {
        const newScale = Math.min(1, availableWidth / LETTER_W);
        setScale(newScale);
      }
    };

    updateScale();
    
    // Use ResizeObserver for container size changes
    const container = containerRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        updateScale();
        measureAndPaginate();
      });
      resizeObserver.observe(container);
      
      const onResize = () => {
        updateScale();
        measureAndPaginate();
      };
      window.addEventListener("resize", onResize);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", onResize);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commonTextStyle: React.CSSProperties = {
    width: contentW,
    fontFamily,
    fontSize: baseFontPx,
    lineHeight: customize.lineHeight,
    boxSizing: "border-box",
  };

  const totalScaledHeight = useMemo(() => {
    const numPages = pages.length || 1;
    return (LETTER_H * numPages + 24 * (numPages - 1)) * scale;
  }, [pages.length, scale]);

  useImperativeHandle(ref, () => ({
    download: async () => {
      const pageEls = containerRef.current?.querySelectorAll<HTMLElement>("[data-resume-page]");
      if (!pageEls || pageEls.length === 0) return;

      const [{ default: jsPDF }, { toJpeg }] = await Promise.all([
        import("jspdf"),
        import("html-to-image"),
      ]);

      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });

      for (let i = 0; i < pageEls.length; i++) {
        // html-to-image uses SVG foreignObject — handles all modern CSS including lab()/oklch()
        const dataUrl = await toJpeg(pageEls[i], {
          quality: 0.97,
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        if (i > 0) doc.addPage("letter", "portrait");
        doc.addImage(dataUrl, "JPEG", 0, 0, 612, 792);
      }

      doc.save("resume.pdf");
    },
  }));

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center min-h-0 relative">
      <style>{`
        .resume-preview ul { list-style: none; padding-left: 0.6em; margin: 0; }
        .resume-preview ol { list-style: none; padding-left: 0.6em; margin: 0; }
        .resume-preview li { padding-left: 0.9em; text-indent: -0.9em; margin: 0; }
        .resume-preview li::before { content: "• "; }
        .resume-preview li p { display: inline; margin: 0; }
        .resume-preview p { margin: 0; }
        .resume-preview a { text-decoration: none; color: inherit; }
      `}</style>
      {/* Hidden measurement layer — outside the scale transform so heights are true 1× */}
      <div
        ref={measureRef}
        aria-hidden
        className="resume-preview"
        style={{
          ...commonTextStyle,
          width: contentW,
          position: "fixed",
          left: -contentW - 100,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        {blocks.map((b, i) => (
          <div
            key={b.key}
            data-block
            style={{
              marginTop: marginTopBeforeBlock(b.key, i > 0 ? blocks[i - 1].key : undefined, customize.sectionGapPx, customize.entryGapPx),
              boxSizing: "border-box",
            }}
          >
            {b.node}
          </div>
        ))}
      </div>

      {/* Scale wrapper — height kept so parent scrolls correctly */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: LETTER_W,
          height: totalScaledHeight / scale, // layout height in unscaled px
          marginBottom: totalScaledHeight - totalScaledHeight / scale, // compensate visual shrink
        }}
      >
        {/* Visible pages */}
        <div className="space-y-6">
          {pages.map((pageBlocks, pageIdx) => (
            <div
              key={pageIdx}
              data-resume-page
            className="bg-white shadow-md"
              style={{
                width: LETTER_W,
                height: LETTER_H,
                paddingLeft: padX,
                paddingRight: padX,
                paddingTop: padY,
                paddingBottom: padY,
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              <div className="resume-preview" style={{ ...commonTextStyle, height: contentH }}>
                {pageBlocks.map((b, i) => {
                  const g = blocks.findIndex((x) => x.key === b.key);
                  const prevKey = g > 0 ? blocks[g - 1].key : undefined;
                  const mt =
                    pageIdx > 0 && i === 0
                      ? 0
                      : marginTopBeforeBlock(b.key, prevKey, customize.sectionGapPx, customize.entryGapPx);
                  return (
                    <div
                      key={b.key}
                      style={{
                        marginTop: mt,
                        boxSizing: "border-box",
                      }}
                    >
                      {b.node}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default OverleafTabsPreview;

