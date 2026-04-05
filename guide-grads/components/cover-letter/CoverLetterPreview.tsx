"use client";

import type { AccentApply, HeaderLayout, ResumeCustomize } from "@/components/resume/ResumeBuilder";
import { defaultAccentApply } from "@/components/resume/ResumeBuilder";
import { type CoverLetterData, coverLetterShouldHidePreviewPlaceholders } from "@/types/coverLetter";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

const ptToPx = (pt: number) => (pt * 96) / 72;
const mmToPx = (mm: number) => (mm * 96) / 25.4;

const DEFAULT_ACCENT_HEX = "#0f172a";

function normalizeAccentApply(a?: Partial<AccentApply> | null): AccentApply {
  return { ...defaultAccentApply, ...a };
}

function resolveAccentHex(customize: ResumeCustomize): string {
  const c = customize.accentColor?.trim();
  if (c && /^#[0-9A-Fa-f]{6}$/i.test(c)) return c;
  return DEFAULT_ACCENT_HEX;
}

function pickAccent(customize: ResumeCustomize, key: keyof AccentApply, fallback: string): string {
  return normalizeAccentApply(customize.accentApply)[key] ? resolveAccentHex(customize) : fallback;
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

function prettyLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ensureHttp(url: string) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

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

function IconLocation() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={CONTACT_ICON_SVG_STYLE} aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

const LETTER_W = 8.5 * 96;
const LETTER_H = 11 * 96;

const CONTACT_GAP_PX = 10;

export type CoverLetterPreviewHandle = {
  download: () => Promise<void>;
};

type Props = {
  letter: CoverLetterData;
  customize: ResumeCustomize;
};

type ProfileHeaderProps = {
  letter: CoverLetterData;
  customize: ResumeCustomize;
  baseFontPx: number;
  contentW: number;
  padX: number;
  padY: number;
  sectionGapPxResolved: number;
  hidePreviewPlaceholders: boolean;
};

function CoverLetterProfileHeader({
  letter,
  customize,
  baseFontPx,
  contentW,
  padX,
  padY,
  sectionGapPxResolved,
  hidePreviewPlaceholders,
}: ProfileHeaderProps) {
  const p = letter.profile;
  const dateText = letter.dateStr?.trim() ?? "";
  const showDate = dateText.length > 0;

  const isBanner = customize.headerColorMode === "banner";
  const bannerBg = resolveAccentHex(customize);
  const primaryInk = "#0f172a";
  const contactDefault = "#1a1a1a";
  const nameColor = isBanner ? "#ffffff" : pickAccent(customize, "name", primaryInk);
  const contactColor = isBanner ? "#ffffff" : pickAccent(customize, "headerContactText", contactDefault);
  const dateColor = isBanner ? "#ffffff" : primaryInk;
  const showIcons = customize.coverLetterShowContactIcons === true;
  /** Icon glyph color: accent when resume “Header icons” is on, else match contact text. */
  const headerIconColor = isBanner ? "#ffffff" : pickAccent(customize, "headerIcons", contactColor);

  const ph = {
    color: isBanner ? "rgba(255,255,255,0.52)" : "#94a3b8",
    fontStyle: "italic" as const,
  };

  const headerLayout = normalizeHeaderLayout(customize.headerLayout);
  const contactFontSize = Math.max(11, baseFontPx * 0.92);
  const lineH = customize.lineHeight;
  /** Slightly larger than body — +3pt, scales with Customize → Font size */
  const nameFontPx = baseFontPx + ptToPx(3);

  const nameFilled = Boolean(p.fullName?.trim());
  const nameStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: nameFontPx,
    lineHeight: lineH,
    minWidth: 0,
    ...(nameFilled || hidePreviewPlaceholders ? { color: nameColor, fontStyle: "normal" as const } : ph),
  };
  const nameDisplay = p.fullName?.trim() || (hidePreviewPlaceholders ? "" : "Full Name");

  const contactOpacity = (filled: boolean) => (filled ? (isBanner ? 1 : 0.92) : 1);

  type LineSpec = {
    key: string;
    placeholder: string;
    value: string | undefined;
    icon: React.ReactNode;
    href?: (v: string) => string;
    display?: (v: string) => string;
  };

  const lineSpecs: LineSpec[] = [
    { key: "loc", placeholder: "Location", value: p.location, icon: <IconLocation /> },
    { key: "phone", placeholder: "Phone", value: p.phone, icon: <IconPhone />, href: (v) => `tel:${v.replace(/\s/g, "")}` },
    { key: "email", placeholder: "Email", value: p.email, icon: <IconMail />, href: (v) => `mailto:${v.trim()}` },
    {
      key: "linkedin",
      placeholder: "Linkedin",
      value: p.linkedin,
      icon: <IconLinkedIn />,
      href: (v) => ensureHttp(v.trim()),
      display: (v) => prettyLabel(v.trim()),
    },
  ];

  const githubTrim = p.github?.trim();
  if (githubTrim) {
    lineSpecs.push({
      key: "github",
      placeholder: "GitHub",
      value: p.github,
      icon: <IconGitHub />,
      href: (v) => ensureHttp(v.trim()),
      display: (v) => prettyLabel(v.trim()),
    });
  }

  lineSpecs.push({
    key: "portfolio",
    placeholder: "Portfolio",
    value: p.portfolio,
    icon: <IconGlobe />,
    href: (v) => ensureHttp(v.trim()),
    display: (v) => prettyLabel(v.trim()),
  });

  const renderOneLine = (spec: LineSpec, textAlign: "left" | "center" | "right" = "left") => {
    const v = spec.value?.trim();
    const filled = Boolean(v);
    const label =
      spec.display && v ? spec.display(v) : v || (hidePreviewPlaceholders ? "" : spec.placeholder);
    const styleBase: React.CSSProperties = {
      fontSize: contactFontSize,
      lineHeight: 1.35,
      textAlign,
      ...(filled
        ? { color: contactColor, opacity: contactOpacity(true), fontStyle: "normal" as const }
        : hidePreviewPlaceholders
          ? { color: contactColor, opacity: contactOpacity(true), fontStyle: "normal" as const }
          : { ...ph }),
    };

    const inner =
      filled && spec.href ? (
        <a
          href={spec.href(v!)}
          style={{ ...styleBase, color: contactColor, opacity: contactOpacity(true), textDecoration: "none" }}
        >
          {label}
        </a>
      ) : (
        <span style={styleBase}>{label}</span>
      );

    /** Centered stack: full-width row so lines never sit on one horizontal wrap like “Phone Email …”. */
    const rowCentered =
      textAlign === "center"
        ? ({
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            lineHeight: 1.35,
            boxSizing: "border-box",
          } as const)
        : null;

    if (!showIcons) {
      if (textAlign === "center") {
        return (
          <div key={spec.key} style={{ width: "100%", textAlign: "center", boxSizing: "border-box" }}>
            {filled && spec.href ? (
              <a
                href={spec.href(v!)}
                style={{ ...styleBase, color: contactColor, opacity: contactOpacity(true), textDecoration: "none" }}
              >
                {label}
              </a>
            ) : (
              <span style={styleBase}>{label}</span>
            )}
          </div>
        );
      }
      return (
        <div key={spec.key} style={styleBase}>
          {filled && spec.href ? (
            <a
              href={spec.href(v!)}
              style={{ color: contactColor, opacity: contactOpacity(true), textDecoration: "none" }}
            >
              {label}
            </a>
          ) : (
            label
          )}
        </div>
      );
    }

    return (
      <div key={spec.key} style={rowCentered ?? {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        lineHeight: 1.35,
        justifyContent: textAlign === "right" ? "flex-end" : "flex-start",
        maxWidth: "100%",
      }}
      >
        <span style={{ color: headerIconColor, display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{spec.icon}</span>
        {inner}
      </div>
    );
  };

  const renderContactInlineWrap = (
    justify: "center" | "flex-start" | "flex-end",
    marginTop: string = "4px",
    specs: LineSpec[] = lineSpecs
  ) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: `${CONTACT_GAP_PX}px`,
        rowGap: "6px",
        marginTop,
        justifyContent: justify,
        color: contactColor,
        fontSize: contactFontSize,
        lineHeight: 1.35,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {specs.map((s) => (
        <React.Fragment key={s.key}>{renderOneLine(s, "left")}</React.Fragment>
      ))}
    </div>
  );

  const nameDateRow = (opts: { justify: "space-between" | "center" | "flex-start"; nameTextAlign?: "left" | "center" }) => {
    const { justify, nameTextAlign = "left" } = opts;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: justify,
          flexWrap: "wrap",
          columnGap: 16,
          rowGap: 4,
          marginBottom: 6,
        }}
      >
        <div style={{ ...nameStyle, textAlign: nameTextAlign, flex: justify === "space-between" ? "1 1 auto" : undefined, minWidth: 0 }}>
          {nameDisplay}
        </div>
        {showDate ? (
          <div
            style={{
              textAlign: "right",
              fontSize: baseFontPx,
              lineHeight: lineH,
              whiteSpace: "nowrap",
              color: dateColor,
              ...(justify === "center" ? { justifySelf: "end" } : {}),
            }}
          >
            {dateText}
          </div>
        ) : null}
      </div>
    );
  };

  let profileInner: React.ReactNode;

  if (headerLayout === "splitRight") {
    const locSpec = lineSpecs.find((s) => s.key === "loc")!;
    const restSpecs = lineSpecs.filter((s) => s.key !== "loc");
    profileInner = (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ textAlign: "left", flex: "1 1 auto", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              columnGap: 16,
              marginBottom: 6,
            }}
          >
            <div style={{ ...nameStyle, minWidth: 0 }}>{nameDisplay}</div>
          </div>
          {renderOneLine(locSpec, "left")}
        </div>
        <div style={{ flexShrink: 0, maxWidth: "52%", textAlign: "right" }}>
          {showDate ? (
            <div style={{ fontSize: baseFontPx, lineHeight: lineH, color: dateColor, marginBottom: 6 }}>{dateText}</div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: showIcons ? "5px" : "2px" }}>
            {restSpecs.map((s) => renderOneLine(s, "right"))}
          </div>
        </div>
      </div>
    );
  } else if (headerLayout === "centerRow2") {
    profileInner = (
      <div style={{ textAlign: "center" }}>
        <div style={{ ...nameStyle, textAlign: "center" }}>{nameDisplay}</div>
        {showDate ? (
          <div style={{ marginTop: 6, fontSize: baseFontPx, lineHeight: lineH, color: dateColor }}>{dateText}</div>
        ) : null}
        {renderContactInlineWrap("center", "8px")}
      </div>
    );
  } else if (headerLayout === "nameThenInline") {
    profileInner = (
      <div>
        {nameDateRow({ justify: "space-between" })}
        {renderContactInlineWrap("flex-start")}
      </div>
    );
  } else if (headerLayout === "stackLeft") {
    profileInner = (
      <div style={{ textAlign: "left" }}>
        <div style={{ ...nameStyle, textAlign: "left" }}>{nameDisplay}</div>
        {showDate ? (
          <div
            style={{
              marginTop: 4,
              fontSize: baseFontPx,
              lineHeight: lineH,
              color: dateColor,
              textAlign: "left",
            }}
          >
            {dateText}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: showIcons ? "5px" : "2px",
            marginTop: 6,
            width: "100%",
          }}
        >
          {lineSpecs.map((s) => renderOneLine(s, "left"))}
        </div>
      </div>
    );
  } else {
    // stackCenter — Name & date & address each on their own centered line; phone/email/links in one wrapping row (matches thumbnail)
    const locSpec = lineSpecs.find((s) => s.key === "loc")!;
    const restSpecs = lineSpecs.filter((s) => s.key !== "loc");
    profileInner = (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: showIcons ? 5 : 3,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <div style={{ ...nameStyle, textAlign: "center" }}>{nameDisplay}</div>
        </div>
        {showDate ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              fontSize: baseFontPx,
              lineHeight: lineH,
              color: dateColor,
              boxSizing: "border-box",
            }}
          >
            {dateText}
          </div>
        ) : null}
        {renderOneLine(locSpec, "center")}
        {restSpecs.length > 0 ? renderContactInlineWrap("center", "6px", restSpecs) : null}
      </div>
    );
  }

  /** Full-bleed banner: direct child of the padded page so width spans the whole sheet (matches resume preview). */
  if (isBanner) {
    return (
      <div
        style={{
          background: bannerBg,
          width: LETTER_W,
          boxSizing: "border-box",
          marginLeft: -padX,
          marginTop: -padY,
          paddingTop: padY + 14,
          paddingBottom: 22,
          paddingLeft: padX,
          paddingRight: padX,
          marginBottom: sectionGapPxResolved,
        }}
      >
        {profileInner}
      </div>
    );
  }

  return (
    <div style={{ width: contentW, marginBottom: sectionGapPxResolved, maxWidth: "100%" }}>{profileInner}</div>
  );
}

const CoverLetterPreview = forwardRef<CoverLetterPreviewHandle, Props>(function CoverLetterPreview(
  { letter, customize },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseFontPx = useMemo(() => ptToPx(customize.fontSizePt), [customize.fontSizePt]);
  const padX = useMemo(() => mmToPx(customize.marginXmm), [customize.marginXmm]);
  const padY = useMemo(() => mmToPx(customize.marginYmm), [customize.marginYmm]);
  const contentW = LETTER_W - padX * 2;

  const fontFamily = useMemo(() => {
    const name = (customize.fontName?.trim() || "Lato") as string;
    const fontVarMap: Record<string, string> = {
      Lato: "var(--font-lato)",
      Roboto: "var(--font-roboto)",
      Nunito: "var(--font-nunito)",
      "Open Sans": "var(--font-open-sans)",
      "Work Sans": "var(--font-work-sans)",
      "Source Sans Pro": "var(--font-source-sans)",
      "IBM Plex Sans": "var(--font-ibm-plex-sans)",
      "Fira Sans": "var(--font-fira-sans)",
      "Titillium Web": "var(--font-titillium)",
      Rubik: "var(--font-rubik)",
      Jost: "var(--font-jost)",
      Karla: "var(--font-karla)",
      Mulish: "var(--font-mulish)",
      Barlow: "var(--font-barlow)",
      Asap: "var(--font-asap)",
      Lora: "var(--font-lora)",
      "Source Serif Pro": "var(--font-source-serif)",
      "Zilla Slab": "var(--font-zilla-slab)",
      "PT Serif": "var(--font-pt-serif)",
      Literata: "var(--font-literata)",
      "EB Garamond": "var(--font-eb-garamond)",
      Aleo: "var(--font-aleo)",
      "Crimson Pro": "var(--font-crimson-pro)",
      "Cormorant Garamond": "var(--font-cormorant-garamond)",
      Vollkorn: "var(--font-vollkorn)",
      Amiri: "var(--font-amiri)",
      "Crimson Text": "var(--font-crimson-text)",
      Alegreya: "var(--font-alegreya)",
      Inconsolata: "var(--font-inconsolata)",
      "Source Code Pro": "var(--font-source-code)",
      "IBM Plex Mono": "var(--font-ibm-plex-mono)",
      "Overpass Mono": "var(--font-overpass-mono)",
      "Space Mono": "var(--font-space-mono)",
      "Courier Prime": "var(--font-courier-prime)",
    };
    const family = fontVarMap[name] ?? "var(--font-lato)";
    if (customize.fontKind === "serif") return `${family}, ui-serif, Georgia, "Times New Roman", serif`;
    if (customize.fontKind === "mono") return `${family}, ui-monospace, Menlo, Monaco, Consolas, monospace`;
    return `${family}, ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial, sans-serif`;
  }, [customize.fontKind, customize.fontName]);

  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth - 48;
      if (w > 0) setScale(Math.min(1, w / LETTER_W));
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const isBanner = customize.headerColorMode === "banner";
  const ph = useMemo(
    () =>
      ({
        color: isBanner ? "rgba(255,255,255,0.52)" : "#94a3b8",
        fontStyle: "italic" as const,
      }) as const,
    [isBanner]
  );
  const text = { color: "#0f172a", fontStyle: "normal" as const };

  const hidePreviewPlaceholders = useMemo(
    () => coverLetterShouldHidePreviewPlaceholders(letter),
    [
      letter.bodyHtml,
      letter.recipientName,
      letter.recipientTitle,
      letter.companyName,
      letter.profile.fullName,
      letter.profile.location,
      letter.profile.phone,
      letter.profile.email,
      letter.profile.linkedin,
      letter.profile.github,
      letter.profile.portfolio,
    ]
  );

  const signOff = letter.signature?.trim();
  const salutationTrim = letter.salutation?.trim() ?? "";
  const closingTrim = letter.closingLine?.trim() ?? "";

  useImperativeHandle(ref, () => ({
    download: async () => {
      const pageEl = containerRef.current?.querySelector<HTMLElement>("[data-cover-letter-page]");
      if (!pageEl) return;
      const [{ default: jsPDF }, { toJpeg }] = await Promise.all([
        import("jspdf"),
        import("html-to-image"),
      ]);
      const dataUrl = await toJpeg(pageEl, {
        quality: 0.97,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        width: LETTER_W,
        height: LETTER_H,
      });
      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
      doc.addImage(dataUrl, "JPEG", 0, 0, 612, 792);
      const safeCompany = letter.companyName?.trim().replace(/[^\w\s-]/g, "").slice(0, 40) || "cover-letter";
      doc.save(`cover-letter-${safeCompany}.pdf`);
    },
  }));

  const lineSnap = Math.max(1, Math.round(baseFontPx * customize.lineHeight));
  const sectionGapPxResolved = useMemo(
    () => Math.max(5, Math.min(24, customize.sectionGapPx + 4)),
    [customize.sectionGapPx]
  );
  const totalScaledHeight = LETTER_H * scale;

  return (
    <div ref={containerRef} className="flex w-full min-h-0 flex-col items-center">
      <style>{`
        .cover-letter-body p { margin: 0 0 0.85em 0; line-height: ${lineSnap}px; }
        .cover-letter-body p:last-child { margin-bottom: 0; }
        .cover-letter-body ul, .cover-letter-body ol { margin: 0 0 0.85em 0; padding-left: 1.25em; }
        .cover-letter-body li { margin: 0; line-height: ${lineSnap}px; }
        .cover-letter-body a { color: inherit; text-decoration: none; }
      `}</style>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: LETTER_W,
          height: totalScaledHeight / scale,
          marginBottom: totalScaledHeight - totalScaledHeight / scale,
        }}
      >
        <div
          data-cover-letter-page
          className="bg-white shadow-md"
          style={{
            width: LETTER_W,
            height: LETTER_H,
            paddingLeft: padX,
            paddingRight: padX,
            paddingTop: padY,
            paddingBottom: padY,
            boxSizing: "border-box",
            overflow: "hidden",
            fontFamily,
            fontSize: baseFontPx,
            lineHeight: customize.lineHeight,
            color: "#0f172a",
          }}
        >
          <CoverLetterProfileHeader
            letter={letter}
            customize={customize}
            baseFontPx={baseFontPx}
            contentW={contentW}
            padX={padX}
            padY={padY}
            sectionGapPxResolved={sectionGapPxResolved}
            hidePreviewPlaceholders={hidePreviewPlaceholders}
          />

          <div style={{ width: contentW, maxWidth: "100%" }}>
            {/* To, + Recipient */}
            <div style={{ marginBottom: sectionGapPxResolved }}>
              <div style={{ ...text, fontSize: baseFontPx * 0.95, marginBottom: 4 }}>To,</div>
              <div style={letter.recipientName?.trim() || hidePreviewPlaceholders ? text : ph}>
                {letter.recipientName?.trim() || (hidePreviewPlaceholders ? "" : "Recipient Name")}
              </div>
              <div style={letter.recipientTitle?.trim() || hidePreviewPlaceholders ? text : ph}>
                {letter.recipientTitle?.trim() || (hidePreviewPlaceholders ? "" : "Job Title")}
              </div>
              <div style={letter.companyName?.trim() || hidePreviewPlaceholders ? text : ph}>
                {letter.companyName?.trim() || (hidePreviewPlaceholders ? "" : "Company")}
              </div>
            </div>

            <div
              style={{
                marginBottom: sectionGapPxResolved,
                ...(salutationTrim || hidePreviewPlaceholders ? text : ph),
              }}
            >
              {salutationTrim || (hidePreviewPlaceholders ? "" : "Dear Hiring Manager,")}
            </div>

            {letter.bodyHtml?.trim() ? (
              <div
                className="cover-letter-body"
                style={{ textAlign: "left", marginBottom: sectionGapPxResolved, ...text }}
                dangerouslySetInnerHTML={{ __html: letter.bodyHtml.trim() }}
              />
            ) : hidePreviewPlaceholders ? (
              <div style={{ marginBottom: sectionGapPxResolved }} aria-hidden />
            ) : (
              <div
                style={{
                  marginBottom: sectionGapPxResolved,
                  ...ph,
                  fontSize: baseFontPx * 0.95,
                }}
              >
                Your letter body will appear here.
              </div>
            )}

            <div>
              <div style={closingTrim || hidePreviewPlaceholders ? text : ph}>
                {closingTrim || (hidePreviewPlaceholders ? "" : "Sincerely,")}
              </div>
              <div style={{ marginTop: "0.3em", fontWeight: 600, ...(signOff || hidePreviewPlaceholders ? text : ph) }}>
                {signOff || (hidePreviewPlaceholders ? "" : "Your Name")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CoverLetterPreview;
