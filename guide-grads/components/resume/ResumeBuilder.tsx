"use client";

import React, { useEffect, useState } from "react";
import OverleafTabsPreview from "./templates/OverleafTabsPreview";

/** ---------------- Types ---------------- */
type Experience = {
  id: string;
  company: string;
  title: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
};

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  city: string;
  coursework?: string;
};

type Project = {
  id: string;
  name: string;
  stack: string;
  bullets: string[];
};

type SkillBlockKind = "list" | "text";

type SkillBlock = {
  id: string;
  title: string; // e.g. "Languages"
  kind: SkillBlockKind;
  items: string[]; // used when kind="list"
  text: string; // used when kind="text"
};

type CustomEntryMode = "bullets" | "text";

type CustomEntry = {
  id: string;
  title: string; // "Title"
  subtitle: string; // "Subtitle"
  location?: string;
  start?: string;
  end?: string;

  mode: CustomEntryMode; // bullets OR text
  bullets: string[];
  text: string;
};

export type ResumeData = {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;

  github?: string;
  discord?: string;

  headline: string;
  summary: string;

  education: Education[];
  experience: Experience[];
  projects: Project[];
  achievements: string[];

  // Skills model:
  skillBlocks: SkillBlock[];

  // Custom section:
  customSectionTitle: string; // chosen once via modal, not editable
  custom: CustomEntry[];
};

/** ---------------- Customize Types ---------------- */
type FontFamilyKind = "sans" | "serif" | "mono";
type HeadingStyle = "rule" | "boxed" | "underline" | "split";
type HeadingCaps = "capitalize" | "uppercase";
type HeadingSize = "s" | "m" | "l" | "xl";
type HeadingIcons = "none" | "outline" | "filled";

export type ResumeCustomize = {
  // spacing
  fontSizePt: number; // 8–12 typical
  lineHeight: number; // 1.05–1.35 typical
  marginXmm: number; // left/right
  marginYmm: number; // top/bottom
  entryGapPx: number; // spacing between entries

  // font
  fontKind: FontFamilyKind; // sans/serif/mono
  fontName: string; // chosen label

  // section headings
  headingStyle: HeadingStyle;
  headingCaps: HeadingCaps;
  headingSize: HeadingSize;
  headingIcons: HeadingIcons;
};

const STORAGE_KEY = "guidegrads.resume.builder.v2";

/** ---------------- Defaults ---------------- */
const emptyResume: ResumeData = {
  name: "",
  location: "",
  email: "",
  phone: "",
  linkedin: "",
  website: "",
  github: "",
  discord: "",
  headline: "",
  summary: "",
  education: [],
  experience: [],
  projects: [],
  achievements: [],
  skillBlocks: [],
  customSectionTitle: "",
  custom: [],
};

const defaultCustomize: ResumeCustomize = {
  fontSizePt: 9,
  lineHeight: 1.15,
  marginXmm: 12,
  marginYmm: 12,
  entryGapPx: 10,

  fontKind: "sans",
  fontName: "Lato",

  headingStyle: "rule",
  headingCaps: "capitalize",
  headingSize: "m",
  headingIcons: "none",
};

/** ---------------- Helpers ---------------- */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function moveByIndex<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function splitCommaList(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function hasText(v?: string) {
  return (v ?? "").trim().length > 0;
}

function hasAny(list?: string[]) {
  return (list ?? []).some((x) => hasText(x));
}

/** ---------------- UI bits (no deps) ---------------- */
function Icon({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center justify-center">{children}</span>;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Icon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 10l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
    </Icon>
  );
}

function UpIcon() {
  return (
    <Icon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 5l-6 6h12l-6-6Z" fill="currentColor" />
      </svg>
    </Icon>
  );
}
function DownIcon() {
  return (
    <Icon>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 19l6-6H6l6 6Z" fill="currentColor" />
      </svg>
    </Icon>
  );
}

function Kebab() {
  return (
    <Icon>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    </Icon>
  );
}

function DownloadIcon() {
  return (
    <Icon>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4.01 4a1 1 0 0 1-1.4 0l-4.01-4a1 1 0 1 1 1.4-1.42L11 13.59V4a1 1 0 0 1 1-1Z" />
        <path d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z" />
      </svg>
    </Icon>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-white/70">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <div className="text-xs text-white/70">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
      />
    </div>
  );
}

function SmallButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "ghost" | "danger" | "solid";
  disabled?: boolean;
}) {
  const base = "rounded-full px-3 py-1.5 text-xs";
  const cls =
    variant === "danger"
      ? `${base} bg-red-500/15 text-red-200 hover:bg-red-500/25`
      : variant === "solid"
      ? `${base} bg-teal-500 font-semibold text-white hover:bg-teal-400`
      : `${base} bg-white/10 text-white/80 hover:bg-white/15`;

  return (
    <button
      onClick={onClick}
      className={cls + (disabled ? " opacity-40 pointer-events-none" : "")}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

function TabButton({
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
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium",
        active ? "bg-white text-slate-900 shadow" : "bg-white/0 text-white/80 hover:bg-white/10",
      ].join(" ")}
      type="button"
    >
      {label}
    </button>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-5xl rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="text-4xl font-extrabold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function AddTile({
  title,
  desc,
  onClick,
}: {
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left hover:bg-slate-100"
      type="button"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </button>
  );
}

function MiniRow({
  label,
  right,
  onClick,
}: {
  label: string;
  right?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2 hover:bg-white/10">
      <button onClick={onClick} className="min-w-0 flex-1 text-left" type="button">
        <div className="truncate text-sm text-white/90">{label}</div>
      </button>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function BulletEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/70">Bullets</div>
        <SmallButton onClick={() => onChange([...(bullets ?? []), ""])}>+ Bullet</SmallButton>
      </div>

      {(bullets ?? []).map((b, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={b}
            onChange={(e) => {
              const next = [...bullets];
              next[idx] = e.target.value;
              onChange(next);
            }}
            placeholder="Quantified impact bullet"
            className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
          />
          <button
            onClick={() => onChange(bullets.filter((_, i) => i !== idx))}
            className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/15"
            aria-label="Remove bullet"
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/** ---------------- Customize UI helpers ---------------- */
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
    <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{label}</div>
        <div className="text-base text-slate-500">{valueLabel}</div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={onMinus}
            className="h-11 w-11 rounded-xl border border-slate-200 text-2xl leading-none hover:bg-slate-50"
            type="button"
          >
            −
          </button>
          <button
            onClick={onPlus}
            className="h-11 w-11 rounded-xl border border-slate-200 text-2xl leading-none hover:bg-slate-50"
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
        active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

/** ---------------- Component ---------------- */
type TabKey = "content" | "customize" | "ai";

export default function ResumeBuilder() {
  /** IMPORTANT: do NOT read localStorage during render (prevents hydration mismatch) */
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [customize, setCustomize] = useState<ResumeCustomize>(defaultCustomize);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { data?: ResumeData; customize?: ResumeCustomize; updatedAt?: number };
        if (parsed?.data) setData({ ...emptyResume, ...parsed.data });
        if (parsed?.customize) setCustomize({ ...defaultCustomize, ...parsed.customize });
      }
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, customize, updatedAt: Date.now() }));
  }, [data, customize, loaded]);


  /** --- top bar state --- */
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [resumeName] = useState("Damber");
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);

  /** --- content UX state --- */
  const [addModalOpen, setAddModalOpen] = useState(false);

  // section collapses
  const [openBasics, setOpenBasics] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [openEducation, setOpenEducation] = useState(false);
  const [openExperience, setOpenExperience] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);
  const [openAchievements, setOpenAchievements] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);

  // per-entry expanded editor
  const [openEduId, setOpenEduId] = useState<string | null>(null);
  const [openExpId, setOpenExpId] = useState<string | null>(null);
  const [openProjId, setOpenProjId] = useState<string | null>(null);
  const [openAchIndex, setOpenAchIndex] = useState<number | null>(null);

  // skills: add modal
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillTitle, setNewSkillTitle] = useState("");

  // skills: which block is expanded
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);

  // custom: section name modal (chosen once)
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [newCustomSectionTitle, setNewCustomSectionTitle] = useState("");

  // custom: entry expanded
  const [openCustomId, setOpenCustomId] = useState<string | null>(null);

  // visibility (sections hidden until added)
  const [visible, setVisible] = useState({
    basics: true,
    skills: false,
    education: false,
    experience: false,
    projects: false,
    achievements: false,
    custom: false,
  });

  const hasSkills = (data.skillBlocks ?? []).length > 0;

  useEffect(() => {
    setVisible((p) => ({
      ...p,
      skills: p.skills || hasSkills,
      education: p.education || data.education.length > 0,
      experience: p.experience || data.experience.length > 0,
      projects: p.projects || data.projects.length > 0,
      achievements: p.achievements || hasAny(data.achievements),
      custom: p.custom || (data.custom?.length ?? 0) > 0 || hasText(data.customSectionTitle),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasSkills,
    data.education.length,
    data.experience.length,
    data.projects.length,
    data.achievements,
    data.custom?.length,
    data.customSectionTitle,
  ]);

  function setBasics<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((p) => ({ ...p, [key]: value }));
  }

  /** ---------------- Section delete (except basics) ---------------- */
  function deleteSection(section: keyof typeof visible) {
    if (section === "basics") return;

    setVisible((p) => ({ ...p, [section]: false }));

    setData((p) => {
      if (section === "skills") return { ...p, skillBlocks: [] };
      if (section === "education") return { ...p, education: [] };
      if (section === "experience") return { ...p, experience: [] };
      if (section === "projects") return { ...p, projects: [] };
      if (section === "achievements") return { ...p, achievements: [] };
      if (section === "custom") return { ...p, custom: [], customSectionTitle: "" };
      return p;
    });

    if (section === "education") setOpenEduId(null);
    if (section === "experience") setOpenExpId(null);
    if (section === "projects") setOpenProjId(null);
    if (section === "achievements") setOpenAchIndex(null);
    if (section === "skills") setOpenSkillId(null);
    if (section === "custom") setOpenCustomId(null);
  }

  /** ---------------- Skills ---------------- */
  function addSkillBlock(title: string) {
    const t = title.trim();
    if (!t) return;

    const id = uid();
    setData((p) => ({
      ...p,
      skillBlocks: [
        ...(p.skillBlocks ?? []),
        {
          id,
          title: t,
          kind: "list",
          items: [],
          text: "",
        },
      ],
    }));
    setVisible((p) => ({ ...p, skills: true }));
    setOpenSkills(true);
    setOpenSkillId(id);
  }

  function updateSkillBlock(id: string, patch: Partial<SkillBlock>) {
    setData((p) => ({
      ...p,
      skillBlocks: (p.skillBlocks ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function removeSkillBlock(id: string) {
    setData((p) => ({ ...p, skillBlocks: (p.skillBlocks ?? []).filter((b) => b.id !== id) }));
    setOpenSkillId((cur) => (cur === id ? null : cur));
  }

  function moveSkillBlock(id: string, dir: -1 | 1) {
    setData((p) => {
      const idx = (p.skillBlocks ?? []).findIndex((x) => x.id === id);
      if (idx < 0) return p;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= (p.skillBlocks ?? []).length) return p;
      return { ...p, skillBlocks: moveByIndex(p.skillBlocks ?? [], idx, nextIdx) };
    });
  }

  /** ---------------- Custom section ---------------- */
  function createCustomSection(sectionTitle: string) {
    const t = sectionTitle.trim();
    if (!t) return;

    setData((p) => ({
      ...p,
      customSectionTitle: t,
      custom: p.custom ?? [],
    }));
    setVisible((p) => ({ ...p, custom: true }));
    setOpenCustom(true);
  }

  function addCustomEntry() {
    // If section title not yet chosen, force modal
    if (!hasText(data.customSectionTitle)) {
      setNewCustomSectionTitle("");
      setIsAddCustomOpen(true);
      return;
    }

    setVisible((p) => ({ ...p, custom: true }));
    setOpenCustom(true);

    const id = uid();
    setData((p) => ({
      ...p,
      custom: [
        ...(p.custom ?? []),
        {
          id,
          title: "",
          subtitle: "",
          location: "",
          start: "",
          end: "",
          mode: "bullets",
          bullets: [],
          text: "",
        },
      ],
    }));
    setOpenCustomId(id);
  }

  function updateCustomEntry(id: string, patch: Partial<CustomEntry>) {
    setData((p) => ({
      ...p,
      custom: (p.custom ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function removeCustomEntry(id: string) {
    setData((p) => ({ ...p, custom: (p.custom ?? []).filter((c) => c.id !== id) }));
    setOpenCustomId((cur) => (cur === id ? null : cur));
  }

  function moveCustomEntry(id: string, dir: -1 | 1) {
    setData((p) => {
      const list = p.custom ?? [];
      const idx = list.findIndex((x) => x.id === id);
      if (idx < 0) return p;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= list.length) return p;
      return { ...p, custom: moveByIndex(list, idx, nextIdx) };
    });
  }

  /** ---------------- CRUD (Education/Experience/Projects/Achievements) ---------------- */
  function addEducation() {
    setVisible((p) => ({ ...p, education: true }));
    setOpenEducation(true);
    const id = uid();
    setData((p) => ({
      ...p,
      education: [...p.education, { id, school: "", degree: "", field: "", start: "", end: "", city: "", coursework: "" }],
    }));
    setOpenEduId(id);
  }
  function updateEducation(id: string, patch: Partial<Education>) {
    setData((p) => ({ ...p, education: p.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }
  function removeEducation(id: string) {
    setData((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) }));
    if (openEduId === id) setOpenEduId(null);
  }
  function moveEducation(id: string, dir: -1 | 1) {
    setData((p) => {
      const idx = p.education.findIndex((x) => x.id === id);
      if (idx < 0) return p;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= p.education.length) return p;
      return { ...p, education: moveByIndex(p.education, idx, nextIdx) };
    });
  }

  function addExperience() {
    setVisible((p) => ({ ...p, experience: true }));
    setOpenExperience(true);
    const id = uid();
    setData((p) => ({
      ...p,
      experience: [...p.experience, { id, company: "", title: "", location: "", start: "", end: "", bullets: [] }],
    }));
    setOpenExpId(id);
  }
  function updateExperience(id: string, patch: Partial<Experience>) {
    setData((p) => ({ ...p, experience: p.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }
  function removeExperience(id: string) {
    setData((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) }));
    if (openExpId === id) setOpenExpId(null);
  }
  function moveExperience(id: string, dir: -1 | 1) {
    setData((p) => {
      const idx = p.experience.findIndex((x) => x.id === id);
      if (idx < 0) return p;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= p.experience.length) return p;
      return { ...p, experience: moveByIndex(p.experience, idx, nextIdx) };
    });
  }

  function addProject() {
    setVisible((p) => ({ ...p, projects: true }));
    setOpenProjects(true);
    const id = uid();
    setData((p) => ({ ...p, projects: [...p.projects, { id, name: "", stack: "", bullets: [] }] }));
    setOpenProjId(id);
  }
  function updateProject(id: string, patch: Partial<Project>) {
    setData((p) => ({ ...p, projects: p.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }
  function removeProject(id: string) {
    setData((p) => ({ ...p, projects: p.projects.filter((x) => x.id !== id) }));
    if (openProjId === id) setOpenProjId(null);
  }
  function moveProject(id: string, dir: -1 | 1) {
    setData((p) => {
      const idx = p.projects.findIndex((x) => x.id === id);
      if (idx < 0) return p;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= p.projects.length) return p;
      return { ...p, projects: moveByIndex(p.projects, idx, nextIdx) };
    });
  }

  function addAchievement() {
    setVisible((p) => ({ ...p, achievements: true }));
    setOpenAchievements(true);
    setData((p) => {
      const newAchievements = [...p.achievements, ""];
      setOpenAchIndex(newAchievements.length - 1);
      return { ...p, achievements: newAchievements };
    });
  }
  function updateAchievement(index: number, value: string) {
    setData((p) => {
      const next = [...p.achievements];
      next[index] = value;
      return { ...p, achievements: next };
    });
  }
  function removeAchievement(index: number) {
    setData((p) => ({ ...p, achievements: p.achievements.filter((_, i) => i !== index) }));
    if (openAchIndex === index) setOpenAchIndex(null);
  }
  function moveAchievement(index: number, dir: -1 | 1) {
    setData((p) => {
      const nextIdx = index + dir;
      if (nextIdx < 0 || nextIdx >= p.achievements.length) return p;
      return { ...p, achievements: moveByIndex(p.achievements, index, nextIdx) };
    });
    setOpenAchIndex((cur) => {
      if (cur === null) return cur;
      if (cur === index) return index + dir;
      if (cur === index + dir) return index;
      return cur;
    });
  }

  /** ---------------- Add Content modal actions ---------------- */
  function handleAddSection(section: keyof typeof visible) {
    setAddModalOpen(false);

    if (section === "custom") {
      // open modal to name the custom section (non-editable later)
      setNewCustomSectionTitle("");
      setIsAddCustomOpen(true);
      return;
    }

    if (section === "education") {
      addEducation();
    } else if (section === "experience") {
      addExperience();
    } else if (section === "projects") {
      addProject();
    } else if (section === "achievements") {
      addAchievement();
    } else if (section === "skills") {
      setOpenSkills(true);
      setVisible((p) => ({ ...p, skills: true }));
    } else if (section === "basics") {
      setOpenBasics(true);
    }
  }

  /** ---------------- Download stub ---------------- */
  function onDownload() {
    window.print();
  }

  const customLabel = data.customSectionTitle?.trim() ? data.customSectionTitle.trim() : "Custom";

  /** ---------------- Customize Lists ---------------- */
  const fontSans = ["Lato", "Inter", "Roboto", "Open Sans", "Work Sans", "Source Sans Pro", "Nunito", "Rubik"];
  const fontSerif = ["Merriweather", "Georgia", "Times New Roman", "Libre Baskerville"];
  const fontMono = ["JetBrains Mono", "IBM Plex Mono", "Menlo", "Courier New"];

  const fontList =
    customize.fontKind === "serif" ? fontSerif : customize.fontKind === "mono" ? fontMono : fontSans;

  function setCustomizePatch(patch: Partial<ResumeCustomize>) {
    setCustomize((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div className="min-h-screen from-[#071a2f] via-[#071a2f] to-[#061528] text-white">
      {/* TOP TOOLBAR */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#071a2f]/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-2">
            <TabButton active={activeTab === "content"} label="Content" onClick={() => setActiveTab("content")} />
            <TabButton active={activeTab === "customize"} label="Customize" onClick={() => setActiveTab("customize")} />
            <TabButton active={activeTab === "ai"} label="AI Tools" onClick={() => setActiveTab("ai")} />
          </div>

          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setResumeMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/15"
              type="button"
            >
              <span className="max-w-[160px] truncate">{resumeName}</span>
              <Chevron open={resumeMenuOpen} />
            </button>

            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
              type="button"
            >
              <DownloadIcon />
              Download
            </button>

            <button className="rounded-2xl bg-white/10 p-2 text-white/90 hover:bg-white/15" aria-label="More" type="button">
              <Kebab />
            </button>

            {resumeMenuOpen ? (
              <div className="absolute right-0 top-[52px] w-[340px] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl">
                <div className="px-4 py-3 text-lg font-semibold">My Resumes</div>
                <div className="border-t border-slate-200" />
                <div className="px-4 py-3 text-slate-700">Resume No.1</div>
                <div className="border-t border-slate-200" />
                <div className="p-4">
                  <button
                    className="w-full rounded-xl bg-pink-600 px-4 py-2 font-semibold text-white hover:bg-pink-500"
                    onClick={() => setResumeMenuOpen(false)}
                    type="button"
                  >
                    + Add Resume
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[560px_1fr]">
          {/* LEFT */}
          <aside className="h-[calc(100vh-150px)] space-y-4 overflow-auto pr-1">
            {activeTab === "content" ? (
              <>

                {/* BASICS */}
                {visible.basics ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <button
                      onClick={() => setOpenBasics((v) => !v)}
                      className="flex w-full items-center justify-between gap-3"
                      type="button"
                    >
                      <div className="text-left">
                        <div className="text-sm font-semibold">Basics</div>
                        <div className="mt-1 text-xs text-white/60">
                          {loaded
                            ? `${data.name || "Full name"} • ${data.email || "email"} • ${data.phone || "phone"}`
                            : "Full name • email • phone"}
                        </div>
                      </div>
                      <Chevron open={openBasics} />
                    </button>

                    {openBasics ? (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextInput label="Full name" value={data.name} onChange={(v) => setBasics("name", v)} />
                        <TextInput label="Location" value={data.location} onChange={(v) => setBasics("location", v)} />
                        <TextInput label="Email" value={data.email} onChange={(v) => setBasics("email", v)} />
                        <TextInput label="Phone" value={data.phone} onChange={(v) => setBasics("phone", v)} />
                        <TextInput label="LinkedIn URL" value={data.linkedin} onChange={(v) => setBasics("linkedin", v)} />
                        <TextInput label="GitHub" value={data.github ?? ""} onChange={(v) => setBasics("github", v)} />
                        <TextInput label="Website URL" value={data.website} onChange={(v) => setBasics("website", v)} />
                        <div className="sm:col-span-2">
                          <TextArea label="Summary" value={data.summary} onChange={(v) => setBasics("summary", v)} rows={4} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* SKILLS */}
                {visible.skills ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenSkills((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Skills</div>
                          <div className="mt-1 text-xs text-white/60">
                            {(data.skillBlocks ?? []).length ? "Configured" : "No skill blocks"}
                          </div>
                        </div>
                        <Chevron open={openSkills} />
                      </button>

                      <div className="flex items-center gap-2">
                        <SmallButton
                          variant="solid"
                          onClick={() => {
                            setNewSkillTitle("");
                            setIsAddSkillOpen(true);
                          }}
                        >
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("skills")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openSkills ? (
                      <div className="mt-4 space-y-3">
                        {(data.skillBlocks ?? []).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/40">
                            No skills added yet. Click “+ Add”.
                          </div>
                        ) : null}

                        {(data.skillBlocks ?? []).map((b, idx) => {
                          const isOpen = openSkillId === b.id;

                          return (
                            <div key={b.id} className="space-y-2">
                              <MiniRow
                                label={b.title || "Untitled skill"}
                                onClick={() => setOpenSkillId((cur) => (cur === b.id ? null : b.id))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveSkillBlock(b.id, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveSkillBlock(b.id, 1)} disabled={idx === (data.skillBlocks ?? []).length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeSkillBlock(b.id)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <div className="space-y-3">
                                    <TextInput
                                      label="Section title"
                                      value={b.title}
                                      onChange={(v) => updateSkillBlock(b.id, { title: v })}
                                      placeholder="e.g. Languages"
                                    />

                                    <div className="flex items-center gap-2 text-xs text-white/70">
                                      <span>Type:</span>
                                      <SmallButton
                                        onClick={() => updateSkillBlock(b.id, { kind: "list" })}
                                        variant={b.kind === "list" ? "solid" : "ghost"}
                                      >
                                        List
                                      </SmallButton>
                                      <SmallButton
                                        onClick={() => updateSkillBlock(b.id, { kind: "text" })}
                                        variant={b.kind === "text" ? "solid" : "ghost"}
                                      >
                                        Text
                                      </SmallButton>
                                    </div>

                                    {b.kind === "list" ? (
                                      <div className="space-y-2">
                                        <div className="text-xs text-white/70">Items</div>
                                        <input
                                          value={(b.items ?? []).join(", ")}
                                          onChange={(e) => updateSkillBlock(b.id, { items: splitCommaList(e.target.value) })}
                                          placeholder="Comma separated"
                                          className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
                                        />
                                      </div>
                                    ) : (
                                      <TextArea
                                        label="Text"
                                        value={b.text ?? ""}
                                        onChange={(v) => updateSkillBlock(b.id, { text: v })}
                                        rows={3}
                                        placeholder="Write a single line or paragraph"
                                      />
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* EXPERIENCE */}
                {visible.experience ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenExperience((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Work Experience</div>
                          <div className="mt-1 text-xs text-white/60">
                            {data.experience.length ? `${data.experience.length} entr${data.experience.length === 1 ? "y" : "ies"}` : "No entries"}
                          </div>
                        </div>
                        <Chevron open={openExperience} />
                      </button>
                      <div className="flex items-center gap-2">
                        <SmallButton variant="solid" onClick={addExperience}>
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("experience")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openExperience ? (
                      <div className="mt-4 space-y-3">
                        {data.experience.map((e, idx) => {
                          const label = e.title?.trim() || "Untitled position";
                          const isOpen = openExpId === e.id;

                          return (
                            <div key={e.id} className="space-y-2">
                              <MiniRow
                                label={label}
                                onClick={() => setOpenExpId((cur) => (cur === e.id ? null : e.id))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveExperience(e.id, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveExperience(e.id, 1)} disabled={idx === data.experience.length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeExperience(e.id)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <TextInput label="Job Title" value={e.title} onChange={(v) => updateExperience(e.id, { title: v })} />
                                    <TextInput label="Company" value={e.company} onChange={(v) => updateExperience(e.id, { company: v })} />
                                    <TextInput label="Location" value={e.location ?? ""} onChange={(v) => updateExperience(e.id, { location: v })} />
                                    <TextInput label="Start" value={e.start} onChange={(v) => updateExperience(e.id, { start: v })} />
                                    <TextInput label="End" value={e.end} onChange={(v) => updateExperience(e.id, { end: v })} />
                                    <div className="sm:col-span-2">
                                      <BulletEditor bullets={e.bullets ?? []} onChange={(next) => updateExperience(e.id, { bullets: next })} />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* EDUCATION */}
                {visible.education ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenEducation((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Education</div>
                          <div className="mt-1 text-xs text-white/60">
                            {data.education.length ? `${data.education.length} entr${data.education.length === 1 ? "y" : "ies"}` : "No entries"}
                          </div>
                        </div>
                        <Chevron open={openEducation} />
                      </button>
                      <div className="flex items-center gap-2">
                        <SmallButton variant="solid" onClick={addEducation}>
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("education")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openEducation ? (
                      <div className="mt-4 space-y-3">
                        {data.education.map((e, idx) => {
                          const label = e.school?.trim() || "Untitled education";
                          const isOpen = openEduId === e.id;

                          return (
                            <div key={e.id} className="space-y-2">
                              <MiniRow
                                label={label}
                                onClick={() => setOpenEduId((cur) => (cur === e.id ? null : e.id))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveEducation(e.id, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveEducation(e.id, 1)} disabled={idx === data.education.length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeEducation(e.id)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <TextInput label="School" value={e.school} onChange={(v) => updateEducation(e.id, { school: v })} />
                                    <TextInput label="Degree" value={e.degree} onChange={(v) => updateEducation(e.id, { degree: v })} />
                                    <TextInput label="Field" value={e.field} onChange={(v) => updateEducation(e.id, { field: v })} />
                                    <TextInput label="City" value={e.city} onChange={(v) => updateEducation(e.id, { city: v })} />
                                    <TextInput label="Start" value={e.start} onChange={(v) => updateEducation(e.id, { start: v })} />
                                    <TextInput label="End" value={e.end} onChange={(v) => updateEducation(e.id, { end: v })} />
                                    <div className="sm:col-span-2">
                                      <TextArea
                                        label="Coursework (optional)"
                                        value={e.coursework ?? ""}
                                        onChange={(v) => updateEducation(e.id, { coursework: v })}
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* PROJECTS */}
                {visible.projects ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenProjects((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Projects</div>
                          <div className="mt-1 text-xs text-white/60">
                            {data.projects.length ? `${data.projects.length} entr${data.projects.length === 1 ? "y" : "ies"}` : "No entries"}
                          </div>
                        </div>
                        <Chevron open={openProjects} />
                      </button>
                      <div className="flex items-center gap-2">
                        <SmallButton variant="solid" onClick={addProject}>
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("projects")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openProjects ? (
                      <div className="mt-4 space-y-3">
                        {data.projects.map((p, idx) => {
                          const label = p.name?.trim() || "Untitled project";
                          const isOpen = openProjId === p.id;

                          return (
                            <div key={p.id} className="space-y-2">
                              <MiniRow
                                label={label}
                                onClick={() => setOpenProjId((cur) => (cur === p.id ? null : p.id))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveProject(p.id, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveProject(p.id, 1)} disabled={idx === data.projects.length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeProject(p.id)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <TextInput label="Project name" value={p.name} onChange={(v) => updateProject(p.id, { name: v })} />
                                    <TextInput label="Tech stack" value={p.stack} onChange={(v) => updateProject(p.id, { stack: v })} />
                                    <div className="sm:col-span-2">
                                      <BulletEditor bullets={p.bullets ?? []} onChange={(next) => updateProject(p.id, { bullets: next })} />
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* ACHIEVEMENTS */}
                {visible.achievements ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenAchievements((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Achievements</div>
                          <div className="mt-1 text-xs text-white/60">{hasAny(data.achievements) ? "Configured" : "No items"}</div>
                        </div>
                        <Chevron open={openAchievements} />
                      </button>
                      <div className="flex items-center gap-2">
                        <SmallButton variant="solid" onClick={addAchievement}>
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("achievements")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openAchievements ? (
                      <div className="mt-4 space-y-3">
                        {(data.achievements ?? []).map((a, idx) => {
                          const label = a?.trim() ? a.trim() : "Untitled achievement";
                          const isOpen = openAchIndex === idx;

                          return (
                            <div key={idx} className="space-y-2">
                              <MiniRow
                                label={label}
                                onClick={() => setOpenAchIndex((cur) => (cur === idx ? null : idx))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveAchievement(idx, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveAchievement(idx, 1)} disabled={idx === data.achievements.length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeAchievement(idx)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <input
                                    value={a}
                                    onChange={(e) => updateAchievement(idx, e.target.value)}
                                    placeholder="Achievement bullet"
                                    className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* CUSTOM (renamed by user-chosen title) */}
                {visible.custom ? (
                  <div className="rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setOpenCustom((v) => !v)}
                        className="flex min-w-0 flex-1 items-center justify-between gap-3"
                        type="button"
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">{customLabel}</div>
                          <div className="mt-1 text-xs text-white/60">
                            {(data.custom?.length ?? 0)
                              ? `${data.custom.length} entr${data.custom.length === 1 ? "y" : "ies"}`
                              : "No entries"}
                          </div>
                        </div>
                        <Chevron open={openCustom} />
                      </button>

                      <div className="flex items-center gap-2">
                        <SmallButton variant="solid" onClick={addCustomEntry}>
                          + Add
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => deleteSection("custom")}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>

                    {openCustom ? (
                      <div className="mt-4 space-y-3">
                        {(data.custom?.length ?? 0) === 0 ? (
                          <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/40">
                            No entries yet. Click “+ Add”.
                          </div>
                        ) : null}

                        {(data.custom ?? []).map((c, idx) => {
                          const label = c.title?.trim() || "Untitled entry";
                          const isOpen = openCustomId === c.id;

                          return (
                            <div key={c.id} className="space-y-2">
                              <MiniRow
                                label={label}
                                onClick={() => setOpenCustomId((cur) => (cur === c.id ? null : c.id))}
                                right={
                                  <div className="flex items-center gap-2">
                                    <SmallButton onClick={() => moveCustomEntry(c.id, -1)} disabled={idx === 0}>
                                      <UpIcon />
                                    </SmallButton>
                                    <SmallButton onClick={() => moveCustomEntry(c.id, 1)} disabled={idx === (data.custom ?? []).length - 1}>
                                      <DownIcon />
                                    </SmallButton>
                                    <SmallButton variant="danger" onClick={() => removeCustomEntry(c.id)}>
                                      Remove
                                    </SmallButton>
                                  </div>
                                }
                              />

                              {isOpen ? (
                                <div className="rounded-2xl bg-white/5 p-4">
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <TextInput label="Title" value={c.title} onChange={(v) => updateCustomEntry(c.id, { title: v })} />
                                    <TextInput label="Subtitle" value={c.subtitle} onChange={(v) => updateCustomEntry(c.id, { subtitle: v })} />
                                    <TextInput
                                      label="Location (optional)"
                                      value={c.location ?? ""}
                                      onChange={(v) => updateCustomEntry(c.id, { location: v })}
                                    />
                                    <TextInput label="Start (optional)" value={c.start ?? ""} onChange={(v) => updateCustomEntry(c.id, { start: v })} />
                                    <TextInput label="End (optional)" value={c.end ?? ""} onChange={(v) => updateCustomEntry(c.id, { end: v })} />

                                    <div className="sm:col-span-2 mt-2 flex items-center gap-2 text-xs text-white/70">
                                      <span>Mode:</span>
                                      <SmallButton
                                        onClick={() => updateCustomEntry(c.id, { mode: "bullets" })}
                                        variant={c.mode === "bullets" ? "solid" : "ghost"}
                                      >
                                        Bullets
                                      </SmallButton>
                                      <SmallButton
                                        onClick={() => updateCustomEntry(c.id, { mode: "text" })}
                                        variant={c.mode === "text" ? "solid" : "ghost"}
                                      >
                                        Text
                                      </SmallButton>
                                    </div>

                                    <div className="sm:col-span-2">
                                      {c.mode === "bullets" ? (
                                        <BulletEditor bullets={c.bullets ?? []} onChange={(next) => updateCustomEntry(c.id, { bullets: next })} />
                                      ) : (
                                        <TextArea label="Text" value={c.text ?? ""} onChange={(v) => updateCustomEntry(c.id, { text: v })} rows={3} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button
                  onClick={() => setAddModalOpen(true)}
                  className="mt-2 w-full rounded-2xl bg-gradient-to-r from-pink-600 to-rose-400 py-4 text-lg font-semibold text-white shadow-xl hover:opacity-95"
                  type="button"
                >
                  + Add Content
                </button>
              </>
            ) : activeTab === "customize" ? (
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
                      valueLabel={`${customize.lineHeight.toFixed(2)}`}
                      min={1.05}
                      max={1.35}
                      step={0.01}
                      value={customize.lineHeight}
                      onChange={(v) => setCustomizePatch({ lineHeight: v })}
                      onMinus={() => setCustomizePatch({ lineHeight: clamp(Number((customize.lineHeight - 0.01).toFixed(2)), 1.05, 1.35) })}
                      onPlus={() => setCustomizePatch({ lineHeight: clamp(Number((customize.lineHeight + 0.01).toFixed(2)), 1.05, 1.35) })}
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
                      label="Space between Entries"
                      valueLabel={`${customize.entryGapPx}px`}
                      min={0}
                      max={24}
                      step={1}
                      value={customize.entryGapPx}
                      onChange={(v) => setCustomizePatch({ entryGapPx: v })}
                      onMinus={() => setCustomizePatch({ entryGapPx: clamp(customize.entryGapPx - 1, 0, 24) })}
                      onPlus={() => setCustomizePatch({ entryGapPx: clamp(customize.entryGapPx + 1, 0, 24) })}
                    />
                  </div>
                </div>

                {/* Font */}
                <div className="rounded-3xl bg-white/5 p-5">
                  <div className="text-3xl font-extrabold">Font</div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <ChoicePill active={customize.fontKind === "serif"} label="Serif" onClick={() => setCustomizePatch({ fontKind: "serif", fontName: "Merriweather" })} />
                    <ChoicePill active={customize.fontKind === "sans"} label="Sans" onClick={() => setCustomizePatch({ fontKind: "sans", fontName: "Lato" })} />
                    <ChoicePill active={customize.fontKind === "mono"} label="Mono" onClick={() => setCustomizePatch({ fontKind: "mono", fontName: "JetBrains Mono" })} />
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

                {/* Section headings */}
                <div className="rounded-3xl bg-white/5 p-5">
                  <div className="text-3xl font-extrabold">Section Headings</div>

                  <div className="mt-4 space-y-5">
                    <div>
                      <div className="text-sm font-semibold text-white/80">Style</div>
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <ChoicePill active={customize.headingStyle === "rule"} label="Rule" onClick={() => setCustomizePatch({ headingStyle: "rule" })} />
                        <ChoicePill active={customize.headingStyle === "boxed"} label="Boxed" onClick={() => setCustomizePatch({ headingStyle: "boxed" })} />
                        <ChoicePill active={customize.headingStyle === "underline"} label="Underline" onClick={() => setCustomizePatch({ headingStyle: "underline" })} />
                        <ChoicePill active={customize.headingStyle === "split"} label="Split" onClick={() => setCustomizePatch({ headingStyle: "split" })} />
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

                    <div>
                      <div className="text-sm font-semibold text-white/80">Icons</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <ChoicePill active={customize.headingIcons === "none"} label="None" onClick={() => setCustomizePatch({ headingIcons: "none" })} />
                        <ChoicePill active={customize.headingIcons === "outline"} label="Outline" onClick={() => setCustomizePatch({ headingIcons: "outline" })} />
                        <ChoicePill active={customize.headingIcons === "filled"} label="Filled" onClick={() => setCustomizePatch({ headingIcons: "filled" })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 p-6 text-white/80">
                <div className="text-lg font-semibold text-white">AI Tools</div>
                <div className="mt-2 text-sm text-white/60">Next: improve writing, suggest bullets, etc.</div>
              </div>
            )}
          </aside>

          {/* RIGHT: PREVIEW */}
          <section className="h-[calc(100vh-150px)] overflow-hidden rounded-3xl bg-white/5 p-3">
            <div className="h-full overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="h-full overflow-auto bg-slate-100 p-6 flex items-start justify-center">
              <OverleafTabsPreview data={data} customize={customize} />
            </div>

            </div>
          </section>
        </div>
      </div>

      {/* ADD CONTENT MODAL */}
      <Modal open={addModalOpen} title="Add content" onClose={() => setAddModalOpen(false)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <AddTile title="Profile" desc="Basics like name, location, contact info." onClick={() => handleAddSection("basics")} />
          <AddTile title="Education" desc="Add your degrees & coursework." onClick={() => handleAddSection("education")} />
          <AddTile title="Work Experience" desc="Highlight internships and roles." onClick={() => handleAddSection("experience")} />
          <AddTile title="Skills" desc="Add skill blocks (Languages, Tools, etc.)." onClick={() => handleAddSection("skills")} />
          <AddTile title="Projects" desc="Showcase impactful projects." onClick={() => handleAddSection("projects")} />
          <AddTile title="Awards / Achievements" desc="Add achievements & awards." onClick={() => handleAddSection("achievements")} />
          <AddTile title="Custom" desc="Create your own section (name it once)." onClick={() => handleAddSection("custom")} />
        </div>
      </Modal>

      {/* ADD SKILL BLOCK MODAL */}
      {isAddSkillOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b223a] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-white">Add Skill Block</div>
              <button
                onClick={() => setIsAddSkillOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs text-white/70">Skill block name</div>
              <input
                autoFocus
                value={newSkillTitle}
                onChange={(e) => setNewSkillTitle(e.target.value)}
                placeholder="e.g. Languages"
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              />
              <div className="text-xs text-white/50">This will create ONLY one skill block with that title.</div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsAddSkillOpen(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  addSkillBlock(newSkillTitle);
                  setIsAddSkillOpen(false);
                }}
                className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
                type="button"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ADD CUSTOM SECTION NAME MODAL (ONE-TIME) */}
      {isAddCustomOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b223a] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-white">Name your Custom Section</div>
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs text-white/70">Section name</div>
              <input
                autoFocus
                value={newCustomSectionTitle}
                onChange={(e) => setNewCustomSectionTitle(e.target.value)}
                placeholder="e.g. Leadership, Certifications, Volunteering"
                className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              />
              <div className="text-xs text-white/50">
                This name is set once and will replace the “Custom” label everywhere.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsAddCustomOpen(false)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/15"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  createCustomSection(newCustomSectionTitle);
                  setIsAddCustomOpen(false);
                  setVisible((p) => ({ ...p, custom: true }));
                  setOpenCustom(true);
                }}
                className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
                type="button"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

