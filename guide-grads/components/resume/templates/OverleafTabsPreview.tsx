"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ResumeCustomize, ResumeData } from "../ResumeBuilder";

const ptToPx = (pt: number) => (pt * 96) / 72;
const mmToPx = (mm: number) => (mm * 96) / 25.4;

// US Letter @ 96dpi
const LETTER_W = 8.5 * 96; // 816
const LETTER_H = 11 * 96; // 1056

function injectBulletStyles(html: string): string {
  return html
    .replace(/<ul>/g, '<ul style="list-style:none;padding-left:0;margin:0">')
    .replace(/<ol>/g, '<ol style="list-style:none;padding-left:0;margin:0">')
    .replace(/<li>/g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0">')
    .replace(/<li /g, '<li style="padding-left:0.9em;text-indent:-0.9em;margin:0" ')
    // only inline <p> directly inside <li>, not all paragraphs
    .replace(/(<li[^>]*>)<p>/g, '$1<p style="display:inline;margin:0">')
    // hanging indent for plain <p> bullet paragraphs (user typed • directly)
    .replace(/<p>•/g, '<p style="padding-left:0.9em;text-indent:-0.9em;margin:0">•');
}

function joinParts(parts: (string | undefined | null)[], sep = " • ") {
  return parts.map((x) => (x ?? "").trim()).filter(Boolean).join(sep);
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

type Block = { key: string; node: React.ReactNode };

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
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM0 8h5v16H0V8Zm7.5 0H12v2.2h.07C12.8 8.9 14.46 8 16.5 8c4.48 0 5.5 3 5.5 6.8V24h-5v-8.4c0-2-.04-4.57-2.78-4.57-2.79 0-3.22 2.18-3.22 4.43V24H7.5V8Z" />
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
  const txt =
    customize.headingCaps === "uppercase" ? title.toUpperCase() : title;

  return (
    <div style={{ paddingTop: "20px" }}>
      <div className="text-slate-900 font-extrabold tracking-wide">{txt}</div>
      <div className="mt-2 h-px w-full bg-slate-300" />
    </div>
  );
}

const PREVIEW_DEFAULT_ORDER = ["basics", "skills", "experience", "education", "projects", "achievements", "custom"];

/** Build blocks (we paginate by block) */
function buildBlocks(data: ResumeData, customize: ResumeCustomize, baseFontPx: number): Block[] {
  const blocks: Block[] = [];

  const contactItems: { icon: React.ReactNode; label: string; href?: string }[] = [];
  if ((data.phone ?? "").trim()) contactItems.push({ icon: <IconPhone />, label: data.phone.trim() });
  if ((data.email ?? "").trim()) contactItems.push({ icon: <IconMail />, label: data.email.trim(), href: `mailto:${data.email.trim()}` });
  if ((data.linkedin ?? "").trim()) contactItems.push({ icon: <IconLinkedIn />, label: prettyLabel(data.linkedin.trim()), href: ensureHttp(data.linkedin.trim()) });
  if ((data.website ?? "").trim()) contactItems.push({ icon: <IconGlobe />, label: prettyLabel(data.website.trim()), href: ensureHttp(data.website.trim()) });
  if ((data.github ?? "").trim()) contactItems.push({ icon: <IconGitHub />, label: prettyLabel(data.github!.trim()), href: ensureHttp(data.github!.trim()) });

  const headerNode = (
    <div className="text-center">
      <div style={{ fontSize: baseFontPx + 16, fontWeight: 700, letterSpacing: "0.04em", color: "#0f172a" }}>
        {(data.name ?? "").trim() || "Your Name"}
      </div>
      {(data.location ?? "").trim() ? (
        <div style={{ marginTop: "2px", color: "#475569" }}>{data.location.trim()}</div>
      ) : null}
      {contactItems.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "4px", marginTop: "6px", color: "#334155" }}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                {item.icon}
                {item.href ? (
                  <a href={item.href} style={{ color: "#334155", textDecoration: "none" }}>{item.label}</a>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            </React.Fragment>
          ))}
        </div>
      ) : null}
      {data.summary?.trim() ? (
        <div
          style={{ marginTop: "6px", fontSize: "12px", color: "#475569", overflowWrap: "anywhere", wordBreak: "break-word" }}
          dangerouslySetInnerHTML={{ __html: injectBulletStyles(data.summary.trim()) }}
        />
      ) : null}
    </div>
  );

  const customLabel = (data.customSectionTitle ?? "").trim() || "Custom";
  const order = customize.sectionOrder ?? PREVIEW_DEFAULT_ORDER;

  for (const key of order) {
    if (key === "basics") {
      blocks.push({ key: "header", node: headerNode });
    } else if (key === "education" && (data.education ?? []).length) {
      blocks.push({ key: "edu-title", node: <SectionHeading title="Education" customize={customize} /> });
      data.education.forEach((e) => {
        blocks.push({
          key: `edu-${e.id}`,
          node: (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-900">{e.school}</div>
                <div className="text-slate-700">{formatRange(e.start, e.end)}</div>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="text-slate-800">{[e.degree, e.field].filter(Boolean).join(" in ")}</div>
                {e.city?.trim() ? <div className="text-slate-700">{e.city}</div> : null}
              </div>
              {e.coursework?.trim() ? (
                <div className="text-slate-700" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: `Coursework: ${e.coursework.trim()}` }} />
              ) : null}
            </div>
          ),
        });
      });
    } else if (key === "experience" && (data.experience ?? []).length) {
      blocks.push({ key: "exp-title", node: <SectionHeading title="Work Experience" customize={customize} /> });
      data.experience.forEach((x) => {
        blocks.push({
          key: `exp-${x.id}`,
          node: (
            <div className="mt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-900">{x.title}</div>
                <div className="text-slate-700">{formatRange(x.start, x.end)}</div>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="italic text-slate-800">{x.company}</div>
                {x.location?.trim() ? <div className="italic text-slate-700">{x.location}</div> : null}
              </div>
              {x.bulletsHtml?.trim() ? (
                <div className="mt-1 text-slate-800" style={{ overflowWrap: "anywhere", wordBreak: "break-word", paddingLeft: "0.6em" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(x.bulletsHtml.trim()) }} />
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
          node: (
            <div className="mt-2">
              <div>
                <span className="font-semibold text-slate-900">{p.name}</span>
                {p.stack?.trim() ? <span className="text-slate-700"> | {p.stack}</span> : null}
              </div>
              {p.bulletsHtml?.trim() ? (
                <div className="mt-1 text-slate-800" style={{ overflowWrap: "anywhere", wordBreak: "break-word", paddingLeft: "0.6em" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(p.bulletsHtml.trim()) }} />
              ) : null}
            </div>
          ),
        });
      });
    } else if (key === "skills" && (data.skillBlocks ?? []).length) {
      blocks.push({ key: "skills-title", node: <SectionHeading title="Skills" customize={customize} /> });
      data.skillBlocks.forEach((b) => {
        blocks.push({
          key: `skill-${b.id}`,
          node: (
            <div className="mt-2" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
              <span className="font-semibold text-slate-900">{b.title}: </span>
              {b.kind === "text" ? (
                <span className="text-slate-800" dangerouslySetInnerHTML={{ __html: injectBulletStyles(b.text ?? "") }} />
              ) : (
                <span className="text-slate-800">{(b.items ?? []).join(", ")}</span>
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
          <div className="mt-2 space-y-1">
            {(data.achievements ?? []).filter((a) => a.trim()).map((a, i) => (
              <div key={i} className="text-slate-800" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(a.trim()) }} />
            ))}
          </div>
        ),
      });
    } else if (key === "custom" && ((data.custom?.length ?? 0) > 0 || (data.customSectionTitle ?? "").trim())) {
      blocks.push({ key: "custom-title", node: <SectionHeading title={customLabel} customize={customize} /> });
      (data.custom ?? []).forEach((c) => {
        blocks.push({
          key: `custom-${c.id}`,
          node: (
            <div className="mt-2">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-900">{c.title}</div>
                <div className="text-slate-700">{formatRange(c.start, c.end)}</div>
              </div>
              <div className="italic text-slate-800">{joinParts([c.subtitle, c.location], " • ")}</div>
              {c.mode === "text" ? (
                c.text?.trim() ? (
                  <div className="mt-1 text-slate-800" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(c.text.trim()) }} />
                ) : null
              ) : c.bulletsHtml?.trim() ? (
                <div className="mt-1 text-slate-800" style={{ overflowWrap: "anywhere", wordBreak: "break-word", paddingLeft: "0.6em" }} dangerouslySetInnerHTML={{ __html: injectBulletStyles(c.bulletsHtml.trim()) }} />
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
      Lato: "var(--font-lato)",
      Roboto: "var(--font-roboto)",
      Nunito: "var(--font-nunito)",
      "Open Sans": "var(--font-open-sans)",
      "Work Sans": "var(--font-work-sans)",
      "Source Sans Pro": "var(--font-source-sans)",
      "IBM Plex Sans": "var(--font-ibm-plex)",
      "Fira Sans": "var(--font-fira-sans)",
      "Titillium Web": "var(--font-titillium)",
      Rubik: "var(--font-rubik)",
      Jost: "var(--font-jost)",
      Karla: "var(--font-karla)",
      Mulish: "var(--font-mulish)",
      Barlow: "var(--font-barlow)",
      Asap: "var(--font-asap)",
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
      const gap = current.length > 0 ? customize.entryGapPx : 0;
      const spaceNeeded = h + gap;

      if (current.length > 0 && used + spaceNeeded > contentH - lineH * 6) {
        nextPages.push(current);
        current = [];
        used = 0;
      }

      current.push(b);
      used += (current.length === 1 ? 0 : customize.entryGapPx) + h;
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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      measureAndPaginate();
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, contentH, contentW, baseFontPx, customize.lineHeight, fontFamily, customize.entryGapPx]);

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

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });

      for (let i = 0; i < pageEls.length; i++) {
        const canvas = await html2canvas(pageEls[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // html2canvas can't parse modern CSS color functions (lab, oklch, etc.)
            // used by Tailwind v4. Remove any stylesheet containing them.
            Array.from(clonedDoc.querySelectorAll("style")).forEach((el) => {
              if (
                el.textContent?.includes("lab(") ||
                el.textContent?.includes("oklch(") ||
                el.textContent?.includes("oklab(")
              ) {
                el.remove();
              }
            });
            // Also remove external stylesheets (Tailwind CDN / compiled CSS)
            Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]')).forEach((el) => el.remove());
          },
        });
        const img = canvas.toDataURL("image/jpeg", 0.97);
        if (i > 0) doc.addPage("letter", "portrait");
        doc.addImage(img, "JPEG", 0, 0, 612, 792);
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
        .resume-preview a { text-decoration: underline; }
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
              marginTop: i === 0 ? 0 : customize.entryGapPx,
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
                {pageBlocks.map((b, i) => (
                  <div
                    key={b.key}
                    style={{
                      marginTop: i === 0 ? 0 : customize.entryGapPx,
                      boxSizing: "border-box",
                    }}
                  >
                    {b.node}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default OverleafTabsPreview;

