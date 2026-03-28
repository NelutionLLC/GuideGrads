"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ResumeData } from "../ResumeBuilder";

/** ---------- helpers ---------- */
function clean(s?: string) {
  return (s ?? "").trim();
}
function hasAny(arr?: string[]) {
  return (arr ?? []).some((x) => clean(x));
}
function ensureHttp(url: string) {
  const u = clean(url);
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}
function prettyLinkLabel(urlOrText: string) {
  const v = clean(urlOrText);
  if (!v) return "";
  return v.replace(/^https?:\/\//, "");
}

/** ---------- page sizing (px at 96dpi) ---------- */
const PAGE_W = 816; // 8.5in * 96
const PAGE_H = 1056; // 11in * 96
const PAD_X = 48;
const PAD_Y = 40;
const CONTENT_H = PAGE_H - PAD_Y * 2;

/** ---------- inline SVG icons (no deps) ---------- */
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="inline-flex items-center justify-center align-middle">
      {children}
    </span>
  );
}
function IconMail({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z" />
      </svg>
    </Icon>
  );
}
function IconPhone({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.33.57 3.59.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.26.2 2.47.57 3.59a1 1 0 0 1-.24 1l-2.21 2.2Z" />
      </svg>
    </Icon>
  );
}
function IconLocation({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
      </svg>
    </Icon>
  );
}
function IconGlobe({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.16a15.7 15.7 0 0 0-1.1-5.02A8.03 8.03 0 0 1 19.93 11ZM12 4c.96 0 2.26 2.09 2.93 7H9.07C9.74 6.09 11.04 4 12 4ZM4.07 13h3.16c.2 1.83.62 3.56 1.1 5.02A8.03 8.03 0 0 1 4.07 13Zm3.16-2H4.07a8.03 8.03 0 0 1 4.26-5.02c-.48 1.46-.9 3.19-1.1 5.02ZM12 20c-.96 0-2.26-2.09-2.93-7h5.86C14.26 17.91 12.96 20 12 20Zm3.67-1.98c.48-1.46.9-3.19 1.1-5.02h3.16a8.03 8.03 0 0 1-4.26 5.02Z" />
      </svg>
    </Icon>
  );
}
function IconLinkedIn({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM0.5 23.5h4V7.98h-4V23.5Zm7 0h3.99v-8.4c0-2.24.43-4.41 3.2-4.41 2.73 0 2.76 2.55 2.76 4.55v8.26H23.5v-9.09c0-4.46-.96-7.89-6.18-7.89-2.5 0-4.17 1.37-4.85 2.67h-.07V7.98H7.5V23.5Z" />
      </svg>
    </Icon>
  );
}
function IconGitHub({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5A12 12 0 0 0 0 12.78c0 5.44 3.44 10.05 8.2 11.68.6.12.82-.27.82-.58v-2.2c-3.34.75-4.04-1.66-4.04-1.66-.55-1.44-1.34-1.82-1.34-1.82-1.1-.78.08-.76.08-.76 1.2.09 1.84 1.27 1.84 1.27 1.08 1.9 2.83 1.35 3.52 1.03.1-.8.42-1.35.76-1.66-2.66-.31-5.46-1.38-5.46-6.12 0-1.35.46-2.45 1.22-3.31-.12-.31-.53-1.58.12-3.29 0 0 1-.33 3.3 1.27a11.1 11.1 0 0 1 6 0c2.3-1.6 3.3-1.27 3.3-1.27.65 1.71.24 2.98.12 3.29.76.86 1.22 1.96 1.22 3.31 0 4.76-2.8 5.8-5.48 6.11.43.39.82 1.16.82 2.34v3.46c0 .32.22.71.82.59A12.2 12.2 0 0 0 24 12.78 12 12 0 0 0 12 .5Z" />
      </svg>
    </Icon>
  );
}
function IconDiscord({ size = 14 }: { size?: number }) {
  return (
    <Icon>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.3 4.5A19.6 19.6 0 0 0 15.8 3a13.7 13.7 0 0 0-.6 1.3 18.3 18.3 0 0 0-6.4 0A13.7 13.7 0 0 0 8.2 3 19.6 19.6 0 0 0 3.7 4.5C1.4 8 0.8 11.4 1 14.8a19.8 19.8 0 0 0 6.1 3.1 14.4 14.4 0 0 0 1.3-2.1c-.7-.3-1.4-.6-2.1-1 .2-.1.4-.3.6-.4 4 1.9 8.3 1.9 12.2 0 .2.2.4.3.6.4-.7.4-1.4.7-2.1 1 .4.7.9 1.5 1.3 2.1a19.8 19.8 0 0 0 6.1-3.1c.4-3.9-.7-7.3-2.7-10.3ZM8.7 13.1c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
      </svg>
    </Icon>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <div className="min-w-0 text-[12.5px] text-slate-900">{left}</div>
      <div className="shrink-0 text-[12.5px] text-slate-700">{right}</div>
    </div>
  );
}
function SectionTitle({ title }: { title: string }) {
  return (
    <div>
      <div className="text-[13px] font-semibold tracking-widest text-slate-900">{title}</div>
      <div className="mt-2 border-t border-slate-300" />
    </div>
  );
}

/** ---------- resume content ---------- */
function ResumeContent({ data }: { data: ResumeData }) {
  const showHeader =
    !!clean(data.name) ||
    !!clean(data.location) ||
    !!clean(data.phone) ||
    !!clean(data.email) ||
    !!clean(data.linkedin) ||
    !!clean(data.website) ||
    !!clean((data as any).github) ||
    !!clean((data as any).discord);

  const showEducation = (data.education ?? []).some((e) =>
    [e.school, e.degree, e.field, e.start, e.end, e.city, e.coursework].some((x) => clean(x))
  );

  const showExperience = (data.experience ?? []).some(
    (e) => [e.company, e.title, e.location, e.start, e.end].some((x) => clean(x)) || hasAny(e.bullets)
  );

  const showProjects = (data.projects ?? []).some((p) => [p.name, p.stack].some((x) => clean(x)) || hasAny(p.bullets));

  const showSkills = (data.skillBlocks ?? []).some((b) => {
    if (!clean(b.title)) return false;
    if (b.kind === "list") return (b.items ?? []).some((x) => clean(x));
    return !!clean(b.text);
  });

  const showAchievements = hasAny(data.achievements);

  const showCustom = (data.custom ?? []).some((c) => {
    const core = [c.title, c.subtitle, c.location, c.start, c.end].some((x) => clean(x));
    if (c.mode === "bullets") return core || hasAny(c.bullets);
    return core || !!clean(c.text);
  });

  const isTotallyEmpty =
    !showHeader && !showEducation && !showExperience && !showProjects && !showSkills && !showAchievements && !showCustom;

  const locationLine = clean(data.location);

  const contactItems = useMemo(() => {
    const items: { key: string; icon: React.ReactNode; label: string; href?: string }[] = [];

    const email = clean(data.email);
    if (email) items.push({ key: "email", icon: <IconMail />, label: email, href: `mailto:${email}` });

    const phone = clean(data.phone);
    if (phone) items.push({ key: "phone", icon: <IconPhone />, label: phone, href: `tel:${phone}` });

    const linkedin = clean(data.linkedin);
    if (linkedin)
      items.push({
        key: "linkedin",
        icon: <IconLinkedIn />,
        label: prettyLinkLabel(linkedin),
        href: ensureHttp(linkedin),
      });

    const website = clean(data.website);
    if (website)
      items.push({
        key: "website",
        icon: <IconGlobe />,
        label: prettyLinkLabel(website),
        href: ensureHttp(website),
      });

    const github = clean((data as any).github);
    if (github)
      items.push({
        key: "github",
        icon: <IconGitHub />,
        label: prettyLinkLabel(github),
        href: ensureHttp(github),
      });

    const discord = clean((data as any).discord);
    if (discord) items.push({ key: "discord", icon: <IconDiscord />, label: discord });

    return items;
  }, [data]);

  const customTitle = clean(data.customSectionTitle) ? clean(data.customSectionTitle).toUpperCase() : "CUSTOM";

  return (
    <div className="bg-white text-black">
      {/* HEADER */}
      <div className="text-center">
        <div className="text-[30px] font-semibold tracking-tight">{clean(data.name) || "Full Name"}</div>

        {locationLine ? (
          <div className="mt-2 inline-flex items-center justify-center gap-1 text-[13px] text-slate-800">
            <span className="text-slate-800">
              <IconLocation />
            </span>
            <span>{locationLine}</span>
          </div>
        ) : null}

        {contactItems.length ? (
          <div className="mt-2 flex flex-nowrap items-center justify-center gap-x-3 whitespace-nowrap text-[12.5px] text-slate-700">
            {contactItems.map((it) => (
              <span key={it.key} className="inline-flex items-center gap-[3px]">
                <span className="text-slate-800">{it.icon}</span>
                {it.href ? (
                  <a
                    href={it.href}
                    target={it.href.startsWith("http") ? "_blank" : undefined}
                    rel={it.href.startsWith("http") ? "noreferrer" : undefined}
                    className="hover:underline underline-offset-2"
                  >
                    {it.label}
                  </a>
                ) : (
                  <span>{it.label}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-[12px] text-slate-700">City, State • phone • email</div>
        )}

        <div className="mt-6 border-t border-slate-200" />
      </div>

      {/* EDUCATION */}
      {showEducation ? (
        <>
          <div className="mt-6">
            <SectionTitle title="EDUCATION" />
          </div>
          {(data.education ?? []).map((e) => {
            const left = clean(e.school);
            const right = [clean(e.start), clean(e.end)].filter(Boolean).join(" – ").trim();
            const line2Left = [clean(e.degree), clean(e.field)]
              .filter(Boolean)
              .join(clean(e.degree) && clean(e.field) ? " in " : "")
              .trim();
            const line2Right = clean(e.city);
            const coursework = clean(e.coursework);
            if (![left, right, line2Left, line2Right, coursework].some(Boolean)) return null;

            return (
              <div key={e.id} className="mt-3">
                <Row left={<span className="font-semibold">{left}</span>} right={<span className="font-semibold">{right}</span>} />
                <Row left={<span className="italic">{line2Left}</span>} right={<span className="italic">{line2Right}</span>} />
                {coursework ? (
                  <div className="mt-1 text-[12px] leading-[1.45] text-slate-800">
                    <span className="font-semibold">Coursework:</span> {coursework}
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {/* EXPERIENCE */}
      {showExperience ? (
        <>
          <div className="mt-6">
            <SectionTitle title="WORK EXPERIENCE" />
          </div>
          {(data.experience ?? []).map((e) => {
            const title = clean(e.title);
            const company = clean(e.company);
            const loc = clean(e.location);
            const date = [clean(e.start), clean(e.end)].filter(Boolean).join(" -- ");
            const bullets = (e.bullets ?? []).map((b) => clean(b)).filter(Boolean);
            if (![title, company, loc, date].some(Boolean) && bullets.length === 0) return null;

            return (
              <div key={e.id} className="mt-3">
                <Row left={<span className="font-semibold">{title}</span>} right={<span className="font-semibold">{date}</span>} />
                <Row left={<span className="italic">{company}</span>} right={<span className="italic">{loc}</span>} />
                {bullets.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] leading-[1.45] text-slate-900">
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {/* CUSTOM */}
      {showCustom ? (
        <>
          <div className="mt-6">
            <SectionTitle title={customTitle} />
          </div>
          {(data.custom ?? []).map((c) => {
            const title = clean(c.title);
            const subtitle = clean(c.subtitle);
            const loc = clean(c.location);
            const date = [clean(c.start), clean(c.end)].filter(Boolean).join(" -- ");
            const bullets = (c.bullets ?? []).map((b) => clean(b)).filter(Boolean);
            const text = clean(c.text);

            const hasCore = [title, subtitle, loc, date].some(Boolean);
            const hasBody = c.mode === "bullets" ? bullets.length > 0 : !!text;

            if (!hasCore && !hasBody) return null;

            return (
              <div key={c.id} className="mt-3">
                <Row left={<span className="font-semibold">{title}</span>} right={<span className="font-semibold">{date}</span>} />
                <Row left={<span className="italic">{subtitle}</span>} right={<span className="italic">{loc}</span>} />

                {c.mode === "bullets" ? (
                  bullets.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] leading-[1.45] text-slate-900">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null
                ) : text ? (
                  <div className="mt-2 text-[12.5px] leading-[1.45] text-slate-900">{text}</div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {/* PROJECTS */}
      {showProjects ? (
        <>
          <div className="mt-6">
            <SectionTitle title="PROJECTS" />
          </div>
          {(data.projects ?? []).map((p) => {
            const name = clean(p.name);
            const stack = clean(p.stack);
            const bullets = (p.bullets ?? []).map((b) => clean(b)).filter(Boolean);
            if (![name, stack].some(Boolean) && bullets.length === 0) return null;

            return (
              <div key={p.id} className="mt-3">
                <div className="text-[13px]">
                  <span className="font-semibold text-slate-900">{name}</span>
                  {stack ? (
                    <span className="text-slate-700"> | {stack}</span>
                  ) : null}
                </div>
                {bullets.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] leading-[1.45] text-slate-900">
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      {/* SKILLS */}
      {showSkills ? (
        <>
          <div className="mt-6">
            <SectionTitle title="TECHNICAL SKILLS" />
          </div>

          <div className="mt-3 space-y-2 text-[12.5px] leading-[1.5] text-slate-900">
            {(data.skillBlocks ?? []).map((b) => {
              const title = clean(b.title);
              if (!title) return null;

              const content =
                b.kind === "list"
                  ? (b.items ?? []).map((x) => clean(x)).filter(Boolean).join(", ")
                  : clean(b.text);

              if (!content) return null;

              return (
                <div key={b.id}>
                  <span className="font-semibold">{title}:</span> <span>{content}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {/* ACHIEVEMENTS */}
      {showAchievements ? (
        <>
          <div className="mt-6">
            <SectionTitle title="ACHIEVEMENTS" />
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.5px] leading-[1.45] text-slate-900">
            {(data.achievements ?? [])
              .map((x) => clean(x))
              .filter(Boolean)
              .map((a, i) => (
                <li key={i}>{a}</li>
              ))}
          </ul>
        </>
      ) : null}

      {isTotallyEmpty ? (
        <div className="mt-10 text-center text-sm text-slate-400">Start adding sections on the left to see your resume preview.</div>
      ) : null}
    </div>
  );
}

export default function OverleafTabsPreview({ data }: { data: ResumeData }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // auto-fit scale
  const [scale, setScale] = useState(1);

  // measure full content height (one-time render, then slice into pages)
  const measureOuterRef = useRef<HTMLDivElement | null>(null);
  const measureInnerRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const padding = 24;
      const available = el.clientWidth - padding * 2;
      const next = Math.max(0.55, Math.min(1, available / PAGE_W));
      setScale(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // measure content height robustly (fonts + mutation + resize)
  useLayoutEffect(() => {
    let cancelled = false;
    const outer = measureOuterRef.current;
    const inner = measureInnerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      if (cancelled) return;
      const h = Math.ceil(inner.scrollHeight || 0);
      if (h > 0) setContentHeight(h);
    };

    const schedule = () => requestAnimationFrame(measure);

    (async () => {
      const fontsAny = (document as any).fonts;
      if (fontsAny?.ready) {
        try {
          await fontsAny.ready;
        } catch {}
      }
      if (!cancelled) schedule();
    })();

    const ro = new ResizeObserver(schedule);
    ro.observe(inner);
    ro.observe(outer);

    const mo = new MutationObserver(schedule);
    mo.observe(inner, { childList: true, subtree: true, characterData: true });

    schedule();

    return () => {
      cancelled = true;
      ro.disconnect();
      mo.disconnect();
    };
  }, [data]);

  const pageCount = Math.max(1, Math.ceil(contentHeight / CONTENT_H));

  return (
    <div ref={wrapRef} className="h-full w-full">
      {/* Hidden measurement stage */}
      <div
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: PAGE_W,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={measureOuterRef} style={{ width: PAGE_W }} className="bg-white text-black">
          <div style={{ paddingLeft: PAD_X, paddingRight: PAD_X, paddingTop: PAD_Y, paddingBottom: PAD_Y }}>
            <div ref={measureInnerRef}>
              <ResumeContent data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* Actual preview pages */}
      <div className="h-full w-full overflow-auto p-6">
        <div className="flex flex-col items-center gap-6">
          {Array.from({ length: pageCount }).map((_, pageIndex) => {
            const offset = pageIndex * CONTENT_H;

            return (
              <div key={pageIndex} style={{ width: PAGE_W * scale, height: PAGE_H * scale }} className="relative">
                <div
                  style={{
                    width: PAGE_W,
                    height: PAGE_H,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                  className="rounded-[18px] bg-white text-black shadow-xl overflow-hidden"
                >
                  <div style={{ paddingLeft: PAD_X, paddingRight: PAD_X, paddingTop: PAD_Y, paddingBottom: PAD_Y }}>
                    <div style={{ height: CONTENT_H, overflow: "hidden", position: "relative" }}>
                      <div style={{ transform: `translateY(-${offset}px)` }}>
                        <ResumeContent data={data} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
