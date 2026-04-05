"use client";

import React, { useMemo } from "react";
import {
  defaultAccentApply,
  defaultCustomize,
  type AccentApply,
  type HeaderColorMode,
  type ResumeCustomize,
} from "./ResumeBuilder";

/** Local aliases — resume builder keeps the same unions internally; panel only needs them for casts. */
type FontFamilyKind = "sans" | "serif" | "mono";
type HeadingStyle =
  | "rule"
  | "boxed"
  | "underline"
  | "split"
  | "plain"
  | "double"
  | "leftbar"
  | "centered";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function SliderRow({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
  onMinus,
  onPlus,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-sm text-white/60">{valueLabel}</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-teal-400"
        />

        <div className="flex items-center gap-1.5">
          <button
            onClick={onMinus}
            className="h-9 w-9 rounded-xl border border-white/20 text-xl leading-none text-white hover:bg-white/10"
            type="button"
          >
            −
          </button>
          <button
            onClick={onPlus}
            className="h-9 w-9 rounded-xl border border-white/20 text-xl leading-none text-white hover:bg-white/10"
            type="button"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function ChoicePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "rounded-xl border px-4 py-2 text-sm",
        active ? "border-teal-400 bg-teal-500/20 text-teal-300 font-medium" : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function EntryLayoutThumbCal() {
  return (
    <svg aria-hidden className="shrink-0 text-white/50" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
    </svg>
  );
}
function EntryLayoutThumbPin() {
  return (
    <svg aria-hidden className="shrink-0 text-white/50" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" />
      <circle cx="12" cy="11" r="2" fill="currentColor" className="text-white/35" stroke="none" />
    </svg>
  );
}
function ThumbDash({ className = "w-7" }: { className?: string }) {
  return <div className={`h-0.5 shrink-0 rounded-sm bg-white/45 ${className}`} />;
}

const ACCENT_SWATCH_PRESETS = [
  "#1e293b",
  "#0f766e",
  "#0d9488",
  "#0891b2",
  "#0369a1",
  "#1d4ed8",
  "#1e3a8a",
  "#4c1d95",
  "#7f1d1d",
  "#be185d",
  "#c026d3",
  "#ea580c",
] as const;

const HEADER_COLOR_MODE_ROW: HeaderColorMode[] = ["basic", "banner"];

type AccentApplyCell = { key: keyof AccentApply; label: string };

const ACCENT_APPLY_GRID: AccentApplyCell[][] = [
  [
    { key: "name", label: "Name" },
    { key: "dotsBarsBubbles", label: "Dots/Bars/Bubbles" },
  ],
  [
    { key: "headings", label: "Headings" },
    { key: "entryTitle", label: "Entry title" },
  ],
  [
    { key: "headingsLine", label: "Headings Line" },
    { key: "entrySubtitle", label: "Entry subtitle" },
  ],
  [
    { key: "headerIcons", label: "Header icons" },
    { key: "linkIcons", label: "Link icons" },
  ],
  [
    { key: "dates", label: "Dates" },
    { key: "headerContactText", label: "Contact info" },
  ],
];

/** Cover letter preview: profile block accent toggles (show/hide glyphs: Profile header → Show contact icons). */
const ACCENT_APPLY_COVER_LETTER: AccentApplyCell[] = [
  { key: "name", label: "Name" },
  { key: "headerContactText", label: "Contact info" },
];

const HEADER_MODE_LABELS: Record<HeaderColorMode, string> = {
  basic: "Basic",
  banner: "Banner",
};

function ColorModeIcon({ mode }: { mode: HeaderColorMode }) {
  if (mode === "basic") {
    return <div className="h-9 w-9 rounded-full border border-white/35 bg-white/70" />;
  }
  return (
    <div className="flex h-9 w-9 flex-col justify-center gap-1 rounded border border-white/25 bg-white/10 px-1.5 py-1.5">
      <div className="h-2.5 w-full rounded-sm bg-teal-500/95" />
      <div className="mx-auto h-1 w-[75%] rounded-sm bg-white/45" />
    </div>
  );
}

export default function ResumeCustomizePanel({
  customize,
  onPatch,
  coverLetterMode = false,
}: {
  customize: ResumeCustomize;
  onPatch: (patch: Partial<ResumeCustomize>) => void;
  /** Hide Entity Margin; Section Margin controls gaps between cover letter blocks only. */
  coverLetterMode?: boolean;
}) {
  const setCustomizePatch = onPatch;

  const fontSans = [
    "Source Sans Pro", "Karla", "Mulish",
    "Lato", "Titillium Web", "Work Sans",
    "Barlow", "Jost", "Fira Sans",
    "Roboto", "Rubik", "Asap",
    "Nunito", "Open Sans", "IBM Plex Sans",
  ];
  const fontSerif = [
    "Lora", "Source Serif Pro", "Zilla Slab",
    "PT Serif", "Literata", "EB Garamond",
    "Aleo", "Crimson Pro", "Cormorant Garamond",
    "Vollkorn", "Amiri", "Crimson Text",
    "Alegreya",
  ];
  const fontMono = [
    "Inconsolata", "Source Code Pro", "IBM Plex Mono",
    "Overpass Mono", "Space Mono", "Courier Prime",
  ];

  const fontList =
    customize.fontKind === "serif" ? fontSerif : customize.fontKind === "mono" ? fontMono : fontSans;

  const accentApplyResolved = useMemo(
    () => ({ ...defaultAccentApply, ...customize.accentApply }),
    [customize.accentApply]
  );

  return (
<div className="space-y-6">
  {/* Spacing */}
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Spacing</div>
    <div className="mt-4 grid grid-cols-1 gap-4">
      <SliderRow
        label="Font Size"
        valueLabel={`${customize.fontSizePt}pt`}
        min={8}
        max={12}
        step={1}
        value={customize.fontSizePt}
        onChange={(v) => setCustomizePatch({ fontSizePt: v })}
        onMinus={() => setCustomizePatch({ fontSizePt: clamp(customize.fontSizePt - 1, 8, 12) })}
        onPlus={() => setCustomizePatch({ fontSizePt: clamp(customize.fontSizePt + 1, 8, 12) })}
      />
      <SliderRow
        label="Line Height"
        valueLabel={customize.lineHeight.toFixed(1)}
        min={1.1}
        max={2}
        step={0.1}
        value={customize.lineHeight}
        onChange={(v) => setCustomizePatch({ lineHeight: clamp(Math.round(v * 10) / 10, 1.1, 2) })}
        onMinus={() =>
          setCustomizePatch({
            lineHeight: clamp(Number((customize.lineHeight - 0.1).toFixed(1)), 1.1, 2),
          })
        }
        onPlus={() =>
          setCustomizePatch({
            lineHeight: clamp(Number((customize.lineHeight + 0.1).toFixed(1)), 1.1, 2),
          })
        }
      />
      <SliderRow
        label="Left & Right Margin"
        valueLabel={`${customize.marginXmm}mm`}
        min={6}
        max={20}
        step={1}
        value={customize.marginXmm}
        onChange={(v) => setCustomizePatch({ marginXmm: v })}
        onMinus={() => setCustomizePatch({ marginXmm: clamp(customize.marginXmm - 1, 6, 20) })}
        onPlus={() => setCustomizePatch({ marginXmm: clamp(customize.marginXmm + 1, 6, 20) })}
      />
      <SliderRow
        label="Top & Bottom Margin"
        valueLabel={`${customize.marginYmm}mm`}
        min={6}
        max={20}
        step={1}
        value={customize.marginYmm}
        onChange={(v) => setCustomizePatch({ marginYmm: v })}
        onMinus={() => setCustomizePatch({ marginYmm: clamp(customize.marginYmm - 1, 6, 20) })}
        onPlus={() => setCustomizePatch({ marginYmm: clamp(customize.marginYmm + 1, 6, 20) })}
      />
      <SliderRow
        label={coverLetterMode ? "Section spacing" : "Section Margin"}
        valueLabel={`${customize.sectionGapPx + 4}px`}
        min={1}
        max={20}
        step={1}
        value={customize.sectionGapPx}
        onChange={(v) => setCustomizePatch({ sectionGapPx: clamp(v, 1, 20) })}
        onMinus={() => setCustomizePatch({ sectionGapPx: clamp(customize.sectionGapPx - 1, 1, 20) })}
        onPlus={() => setCustomizePatch({ sectionGapPx: clamp(customize.sectionGapPx + 1, 1, 20) })}
      />
      {coverLetterMode ? (
        <p className="text-xs leading-relaxed text-white/45">
          Space between profile, recipient, salutation, body, and closing on the cover letter preview.
        </p>
      ) : null}
      {!coverLetterMode ? (
        <SliderRow
          label="Entity Margin"
          valueLabel={`${customize.entryGapPx}px`}
          min={0}
          max={24}
          step={1}
          value={customize.entryGapPx}
          onChange={(v) => setCustomizePatch({ entryGapPx: v })}
          onMinus={() => setCustomizePatch({ entryGapPx: clamp(customize.entryGapPx - 1, 0, 24) })}
          onPlus={() => setCustomizePatch({ entryGapPx: clamp(customize.entryGapPx + 1, 0, 24) })}
        />
      ) : null}
    </div>
  </div>

  {/* Font */}
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Font</div>

    <div className="mt-4 grid grid-cols-3 gap-3">
      {([
        { kind: "serif",  label: "Serif", fontStyle: "font-serif",  defaultFont: "Lora" },
        { kind: "sans",   label: "Sans",  fontStyle: "font-sans",   defaultFont: "Lato" },
        { kind: "mono",   label: "Mono",  fontStyle: "font-mono",   defaultFont: "Inconsolata" },
      ] as { kind: FontFamilyKind; label: string; fontStyle: string; defaultFont: string }[]).map(({ kind, label, fontStyle, defaultFont }) => {
        const active = customize.fontKind === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => setCustomizePatch({ fontKind: kind, fontName: defaultFont })}
            className={[
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-4 transition-colors",
              active
                ? "border-teal-400 bg-teal-500/20"
                : "border-white/20 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <span className={`${fontStyle} text-3xl font-semibold leading-none ${active ? "text-teal-300" : "text-white/70"}`}>
              Aa
            </span>
            <span className={`text-sm font-medium ${active ? "text-teal-300" : "text-white/60"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fontList.map((f) => (
        <ChoicePill
          key={f}
          active={customize.fontName === f}
          label={f}
          onClick={() => setCustomizePatch({ fontName: f })}
        />
      ))}
    </div>

    <div className="mt-3 text-xs text-white/50">
      Note: Font names apply via CSS stack. If you want exact font files (Google Fonts), import them in your app.
    </div>
  </div>

  {/* Profile header (name + contacts) */}
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Profile header</div>
    {coverLetterMode ? (
      <p className="mt-2 text-xs text-white/45">
        Choose how your name, date, and contact lines are arranged on the cover letter preview.
      </p>
    ) : null}
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <button
        type="button"
        onClick={() => setCustomizePatch({ headerLayout: "stackCenter" })}
        className={[
          "rounded-xl border p-3 flex items-center justify-center transition-colors min-h-[64px]",
          customize.headerLayout === "stackCenter" ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
        ].join(" ")}
        aria-label="Stacked centered header layout"
      >
        <div className="flex flex-col items-center gap-0.5 w-full px-0.5">
          <div className="w-10 h-2 rounded-sm bg-white/60" />
          <div className="w-6 h-1 rounded-sm bg-white/35" />
          <div className="flex gap-0.5 justify-center mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setCustomizePatch({ headerLayout: "centerRow2" })}
        className={[
          "rounded-xl border p-3 flex items-center justify-center transition-colors min-h-[64px]",
          customize.headerLayout === "centerRow2" ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
        ].join(" ")}
        aria-label="Name with location and contacts on second row"
      >
        <div className="flex flex-col items-center gap-0.5 w-full px-0.5">
          <div className="w-10 h-2 rounded-sm bg-white/60" />
          <div className="flex items-center justify-center gap-0.5 w-full flex-wrap">
            <div className="w-5 h-1 rounded-sm bg-white/35" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setCustomizePatch({ headerLayout: "splitRight" })}
        className={[
          "rounded-xl border p-3 flex items-center justify-center transition-colors min-h-[64px]",
          customize.headerLayout === "splitRight" ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
        ].join(" ")}
        aria-label="Name left, contacts right"
      >
        <div className="flex items-start justify-between w-full gap-1 px-0.5">
          <div className="flex flex-col gap-0.5 items-start min-w-0">
            <div className="w-7 h-2 rounded-sm bg-white/60" />
            <div className="w-5 h-1 rounded-sm bg-white/35" />
          </div>
          <div className="flex flex-col gap-0.5 items-end shrink-0">
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setCustomizePatch({ headerLayout: "nameThenInline" })}
        className={[
          "rounded-xl border p-3 flex items-center justify-center transition-colors min-h-[64px]",
          customize.headerLayout === "nameThenInline" ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
        ].join(" ")}
        aria-label="Name then location and contacts inline"
      >
        <div className="flex flex-col items-stretch gap-0.5 w-full px-0.5">
          <div className="w-full h-2 rounded-sm bg-white/60" />
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="w-6 h-1 rounded-sm bg-white/35" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setCustomizePatch({ headerLayout: "stackLeft" })}
        className={[
          "rounded-xl border p-3 flex items-center justify-center transition-colors min-h-[64px]",
          customize.headerLayout === "stackLeft" ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
        ].join(" ")}
        aria-label="All left: name, address, contacts stacked"
      >
        <div className="flex flex-col items-start gap-0.5 w-full px-0.5">
          <div className="w-10 h-2 rounded-sm bg-white/60" />
          <div className="w-6 h-1 rounded-sm bg-white/35" />
          <div className="flex gap-0.5 justify-start">
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full border border-white/40" />
          </div>
        </div>
      </button>
    </div>
    {coverLetterMode ? (
      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/[0.07]">
        <input
          type="checkbox"
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/35 bg-[#0b223a] text-teal-400 accent-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
          checked={customize.coverLetterShowContactIcons === true}
          onChange={(e) => setCustomizePatch({ coverLetterShowContactIcons: e.target.checked })}
        />
        <span>Show Contact Icons</span>
      </label>
    ) : null}
  </div>

  {/* Section headings (resume only) */}
  {!coverLetterMode ? (
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Section Headings</div>

    <div className="mt-4 space-y-5">
      <div>
        <div className="text-sm font-semibold text-white/80">Style</div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {([
            { key: "rule", thumb: (
              <><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-full h-px bg-white/40" /><div className="w-6 h-1 rounded-sm bg-white/25" /><div className="w-9 h-1 rounded-sm bg-white/25" /></>
            )},
            { key: "boxed", thumb: (
              <><div className="w-full rounded bg-white/30 py-1 flex items-center justify-center"><div className="w-7 h-1.5 rounded-sm bg-white/70" /></div><div className="w-6 h-1 rounded-sm bg-white/25 mt-1" /><div className="w-9 h-1 rounded-sm bg-white/25" /></>
            )},
            { key: "underline", thumb: (
              <><div className="flex flex-col items-start gap-0.5"><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-8 h-px bg-white/50" /></div><div className="w-6 h-1 rounded-sm bg-white/25" /><div className="w-9 h-1 rounded-sm bg-white/25" /></>
            )},
            { key: "split", thumb: (
              <><div className="flex items-center gap-1 w-full"><div className="w-5 h-1.5 rounded-sm bg-white/60 shrink-0" /><div className="flex-1 h-px bg-white/40" /></div><div className="w-6 h-1 rounded-sm bg-white/25" /><div className="w-9 h-1 rounded-sm bg-white/25" /></>
            )},
            { key: "plain", thumb: (
              <><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-6 h-1 rounded-sm bg-white/25 mt-1" /><div className="w-9 h-1 rounded-sm bg-white/25" /></>
            )},
            { key: "double", thumb: (
              <><div className="w-full h-px bg-white/40" /><div className="w-8 h-1.5 rounded-sm bg-white/60 mt-0.5" /><div className="w-full h-px bg-white/40 mt-0.5" /><div className="w-6 h-1 rounded-sm bg-white/25 mt-1" /></>
            )},
            { key: "leftbar", thumb: (
              <div className="flex items-start gap-1 w-full"><div className="w-0.5 h-full min-h-[28px] bg-white/50 rounded-full shrink-0" /><div className="flex flex-col gap-1 flex-1"><div className="w-7 h-1.5 rounded-sm bg-white/60" /><div className="w-5 h-1 rounded-sm bg-white/25" /><div className="w-8 h-1 rounded-sm bg-white/25" /></div></div>
            )},
            { key: "centered", thumb: (
              <><div className="flex items-center gap-1 w-full"><div className="flex-1 h-px bg-white/40" /><div className="w-6 h-1.5 rounded-sm bg-white/60 shrink-0" /><div className="flex-1 h-px bg-white/40" /></div><div className="flex justify-center gap-1 mt-1"><div className="w-5 h-1 rounded-sm bg-white/25" /><div className="w-7 h-1 rounded-sm bg-white/25" /></div></>
            )},
          ] as { key: string; thumb: React.ReactNode }[]).map(({ key, thumb }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCustomizePatch({ headingStyle: key as HeadingStyle })}
              className={["rounded-xl border p-2 flex flex-col items-start gap-1.5 transition-colors min-h-[56px] justify-center", customize.headingStyle === key ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10"].join(" ")}
            >
              {thumb}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-white/80">Line Thickness</div>
        <div className="mt-2 flex gap-2">
          <ChoicePill active={(customize.headingLineWeight ?? "light") === "light"} label="Light" onClick={() => setCustomizePatch({ headingLineWeight: "light" })} />
          <ChoicePill active={(customize.headingLineWeight ?? "light") === "normal"} label="Normal" onClick={() => setCustomizePatch({ headingLineWeight: "normal" })} />
          <ChoicePill active={(customize.headingLineWeight ?? "light") === "bold"} label="Bold" onClick={() => setCustomizePatch({ headingLineWeight: "bold" })} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-white/80">Capitalization</div>
          <div className="mt-2 flex gap-2">
            <ChoicePill active={customize.headingCaps === "capitalize"} label="Capitalize" onClick={() => setCustomizePatch({ headingCaps: "capitalize" })} />
            <ChoicePill active={customize.headingCaps === "uppercase"} label="Uppercase" onClick={() => setCustomizePatch({ headingCaps: "uppercase" })} />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-white/80">Size</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <ChoicePill active={customize.headingSize === "s"} label="S" onClick={() => setCustomizePatch({ headingSize: "s" })} />
            <ChoicePill active={customize.headingSize === "m"} label="M" onClick={() => setCustomizePatch({ headingSize: "m" })} />
            <ChoicePill active={customize.headingSize === "l"} label="L" onClick={() => setCustomizePatch({ headingSize: "l" })} />
            <ChoicePill active={customize.headingSize === "xl"} label="XL" onClick={() => setCustomizePatch({ headingSize: "xl" })} />
          </div>
        </div>
      </div>

    </div>
  </div>
  ) : null}

  {/* Entry lines (resume only) */}
  {!coverLetterMode ? (
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Entry layout</div>

    <div className="mt-4 space-y-5">
      <div>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            {
              key: "l1" as const,
              thumb: (
                <div className="flex w-full min-h-[40px] items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <ThumbDash className="w-6" />
                    <ThumbDash className="w-5" />
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <EntryLayoutThumbCal />
                    <EntryLayoutThumbPin />
                  </div>
                </div>
              ),
            },
            {
              key: "l2" as const,
              thumb: (
                <div className="flex w-full min-h-[40px] items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <ThumbDash className="w-6" />
                    <ThumbDash className="w-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <EntryLayoutThumbCal />
                    <EntryLayoutThumbPin />
                  </div>
                </div>
              ),
            },
            {
              key: "l3" as const,
              thumb: (
                <div className="flex w-full min-h-[40px] flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <ThumbDash className="w-5" />
                      <ThumbDash className="w-4" />
                    </div>
                    <EntryLayoutThumbCal />
                  </div>
                  <div className="flex justify-end">
                    <EntryLayoutThumbPin />
                  </div>
                </div>
              ),
            },
            {
              key: "l4" as const,
              thumb: (
                <div className="flex w-full min-h-[40px] items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <EntryLayoutThumbCal />
                    <EntryLayoutThumbPin />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ThumbDash className="w-8" />
                    <ThumbDash className="w-7" />
                  </div>
                </div>
              ),
            },
            {
              key: "l5" as const,
              thumb: (
                <div className="flex w-full min-h-[44px] flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <EntryLayoutThumbCal />
                    <ThumbDash className="w-5" />
                    <EntryLayoutThumbPin />
                  </div>
                  <div className="flex justify-center">
                    <ThumbDash className="w-5" />
                  </div>
                </div>
              ),
            },
          ]).map(({ key, thumb }) => (
            <button
              key={key}
              type="button"
              aria-pressed={customize.entryLayout === key}
              aria-label={`Select entry layout ${key}`}
              onClick={() => setCustomizePatch({ entryLayout: key })}
              className={[
                "rounded-xl border px-3 py-3 transition-colors flex w-full items-center justify-center min-h-[52px]",
                customize.entryLayout === key ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              {thumb}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-white/80">Subtitle style</div>
        <div className="mt-2 flex gap-2">
          <ChoicePill active={customize.entrySubtitleStyle === "normal"} label="Normal" onClick={() => setCustomizePatch({ entrySubtitleStyle: "normal" })} />
          <ChoicePill active={customize.entrySubtitleStyle === "bold"} label="Bold" onClick={() => setCustomizePatch({ entrySubtitleStyle: "bold" })} />
          <ChoicePill active={customize.entrySubtitleStyle === "italic"} label="Italic" onClick={() => setCustomizePatch({ entrySubtitleStyle: "italic" })} />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-white/80">Listing type</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={customize.entryListingTitleOrder === "titleFirst"}
            aria-label="Title then subtitle"
            onClick={() => setCustomizePatch({ entryListingTitleOrder: "titleFirst" })}
            className={[
              "rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors min-h-[44px] flex items-center justify-center",
              customize.entryListingTitleOrder === "titleFirst" ? "border-teal-400 bg-teal-500/20 text-teal-200" : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10",
            ].join(" ")}
          >
            Title, Subtitle
          </button>
          <button
            type="button"
            aria-pressed={customize.entryListingTitleOrder === "subtitleFirst"}
            aria-label="Subtitle then title"
            onClick={() => setCustomizePatch({ entryListingTitleOrder: "subtitleFirst" })}
            className={[
              "rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors min-h-[44px] flex items-center justify-center",
              customize.entryListingTitleOrder === "subtitleFirst" ? "border-teal-400 bg-teal-500/20 text-teal-200" : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10",
            ].join(" ")}
          >
            Subtitle, Title
          </button>
          <button
            type="button"
            aria-pressed={customize.entryListingMetaOrder === "dateFirst"}
            aria-label="Date then location"
            onClick={() => setCustomizePatch({ entryListingMetaOrder: "dateFirst" })}
            className={[
              "rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors min-h-[44px] flex items-center justify-center",
              customize.entryListingMetaOrder === "dateFirst" ? "border-teal-400 bg-teal-500/20 text-teal-200" : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10",
            ].join(" ")}
          >
            Date | Location
          </button>
          <button
            type="button"
            aria-pressed={customize.entryListingMetaOrder === "locationFirst"}
            aria-label="Location then date"
            onClick={() => setCustomizePatch({ entryListingMetaOrder: "locationFirst" })}
            className={[
              "rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors min-h-[44px] flex items-center justify-center",
              customize.entryListingMetaOrder === "locationFirst" ? "border-teal-400 bg-teal-500/20 text-teal-200" : "border-white/20 bg-white/5 text-white/75 hover:bg-white/10",
            ].join(" ")}
          >
            Location | Date
          </button>
        </div>
      </div>
    </div>
  </div>
  ) : null}

  {/* Colors — accent swatches + where it applies (Link icons last) */}
  <div className="rounded-3xl bg-white/5 p-5">
    <div className="text-3xl font-extrabold">Colors</div>
    {coverLetterMode ? (
      <p className="mt-2 text-xs leading-relaxed text-white/45">
        Basic or banner style for the profile block at the top of the cover letter. Accent toggles apply to name, contact text, and (when icons are on) whether icon glyphs use the accent color.
      </p>
    ) : null}
    <div className="mt-5 grid grid-cols-2 gap-2">
      {HEADER_COLOR_MODE_ROW.map((mode) => {
        const active = customize.headerColorMode === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            aria-label={HEADER_MODE_LABELS[mode]}
            onClick={() => setCustomizePatch({ headerColorMode: mode })}
            className={[
              "flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl border p-2 transition-colors",
              active ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <ColorModeIcon mode={mode} />
            <span className="text-center text-[10px] font-medium leading-tight text-white/70">
              {HEADER_MODE_LABELS[mode]}
            </span>
          </button>
        );
      })}
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        title="Default"
        aria-label="Default accent color"
        onClick={() => setCustomizePatch({ accentColor: defaultCustomize.accentColor })}
        className={[
          "relative h-9 w-9 shrink-0 rounded-full border-2 transition-colors",
          customize.accentColor === defaultCustomize.accentColor ? "border-teal-400" : "border-white/25 bg-white",
        ].join(" ")}
      >
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="h-px w-[120%] rotate-45 bg-slate-400" />
        </span>
      </button>
      {ACCENT_SWATCH_PRESETS.map((hex) => (
        <button
          key={hex}
          type="button"
          title={hex}
          aria-label={`Accent ${hex}`}
          onClick={() => setCustomizePatch({ accentColor: hex })}
          style={{ backgroundColor: hex }}
          className={[
            "h-9 w-9 shrink-0 rounded-full border-2 transition-colors",
            customize.accentColor.toLowerCase() === hex.toLowerCase() ? "border-teal-400" : "border-white/20",
          ].join(" ")}
        />
      ))}
      <label
        className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-br from-red-500 via-yellow-400 to-blue-600 hover:border-white/40"
        title="Custom color"
      >
        <span className="sr-only">Custom accent color</span>
        <input
          type="color"
          value={customize.accentColor.match(/^#[0-9A-Fa-f]{6}$/) ? customize.accentColor : defaultCustomize.accentColor}
          onChange={(e) => setCustomizePatch({ accentColor: e.target.value })}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>

    <div className="mt-6 text-sm font-semibold text-white/80">
      {coverLetterMode ? "Apply accent to profile header" : "Apply accent color"}
    </div>
    <div className="mt-3 flex flex-col gap-2.5">
      {(coverLetterMode ? [ACCENT_APPLY_COVER_LETTER] : ACCENT_APPLY_GRID).map((row, ri) => (
        <div
          key={ri}
          className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 sm:items-start"
        >
          {row.map((cell) => {
            const c = cell;
            return (
              <label
                key={c.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/[0.07]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/35 bg-[#0b223a] text-teal-400 accent-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50"
                  checked={accentApplyResolved[c.key]}
                  onChange={(e) =>
                    setCustomizePatch({
                      accentApply: {
                        ...defaultAccentApply,
                        ...customize.accentApply,
                        [c.key]: e.target.checked,
                      },
                    })
                  }
                />
                <span>{c.label}</span>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  </div>
</div>
  );
}
