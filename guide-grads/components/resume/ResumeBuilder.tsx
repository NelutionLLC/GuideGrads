"use client";

import React, { useEffect, useRef, useState } from "react";
import OverleafTabsPreview, { type OverleafTabsPreviewHandle } from "./templates/OverleafTabsPreview";
import RichTextArea from "./RichTextArea";

/** ---------------- Types ---------------- */
type Experience = {
  id: string;
  company: string;
  title: string;
  location?: string;
  start: string;
  end: string;
  bulletsHtml: string;
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
  bulletsHtml: string;
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
  bulletsHtml: string;
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
type HeadingStyle = "rule" | "boxed" | "underline" | "split" | "plain" | "double" | "leftbar" | "centered";
type HeadingCaps = "capitalize" | "uppercase";
type HeadingSize = "s" | "m" | "l" | "xl";
type HeadingIcons = "none" | "outline" | "filled";
type HeadingLineWeight = "light" | "normal" | "bold";
type EntryLayout = "standard" | "meta-left" | "compact" | "stacked";
type EntrySubtitleStyle = "normal" | "bold" | "italic";
type EntrySubtitlePlacement = "same-line" | "next-line";
type EntryDatePlacement = "same-line" | "next-line";

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
  headingLineWeight: HeadingLineWeight;
  // entry layout
  entryLayout: EntryLayout;
  entrySubtitleStyle: EntrySubtitleStyle;
  entrySubtitlePlacement: EntrySubtitlePlacement;
  entryDatePlacement: EntryDatePlacement;
  sectionOrder: string[];
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
  headingLineWeight: "light",
  entryLayout: "standard",
  entrySubtitleStyle: "italic",
  entrySubtitlePlacement: "next-line",
  entryDatePlacement: "next-line",
  sectionOrder: ["basics", "skills", "experience", "education", "projects", "achievements", "custom"],
};

const DEFAULT_SECTION_ORDER = ["basics", "skills", "experience", "education", "projects", "achievements", "custom"];

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

function DragGrip() {
  return (
    <span className="cursor-grab px-1 text-white/30 hover:text-white/60 active:cursor-grabbing">
      <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
        <circle cx="3" cy="3" r="1.4" /><circle cx="9" cy="3" r="1.4" />
        <circle cx="3" cy="8" r="1.4" /><circle cx="9" cy="8" r="1.4" />
        <circle cx="3" cy="13" r="1.4" /><circle cx="9" cy="13" r="1.4" />
      </svg>
    </span>
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
      <div className="relative mx-4 w-full max-w-5xl rounded-2xl bg-[#0b223a] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="text-base font-semibold text-white">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">{children}</div>
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
      className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left hover:bg-white/10"
      type="button"
    >
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
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

  const previewRef = useRef<OverleafTabsPreviewHandle>(null);

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

  // section drag-to-reorder
  const [dragSection, setDragSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

  // sub-item drag-to-reorder
  const [dragExpId, setDragExpId] = useState<string | null>(null);
  const [dragOverExpId, setDragOverExpId] = useState<string | null>(null);
  const [dragEduId, setDragEduId] = useState<string | null>(null);
  const [dragOverEduId, setDragOverEduId] = useState<string | null>(null);
  const [dragProjId, setDragProjId] = useState<string | null>(null);
  const [dragOverProjId, setDragOverProjId] = useState<string | null>(null);
  const [dragSkillId, setDragSkillId] = useState<string | null>(null);
  const [dragOverSkillId, setDragOverSkillId] = useState<string | null>(null);
  const [dragAchIdx, setDragAchIdx] = useState<number | null>(null);
  const [dragOverAchIdx, setDragOverAchIdx] = useState<number | null>(null);
  const [dragCustomId, setDragCustomId] = useState<string | null>(null);
  const [dragOverCustomId, setDragOverCustomId] = useState<string | null>(null);

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

  /** ---------------- Sub-item reorder helpers ---------------- */
  function reorderById<T extends { id: string }>(
    list: T[],
    fromId: string,
    toId: string
  ): T[] {
    const fi = list.findIndex((x) => x.id === fromId);
    const ti = list.findIndex((x) => x.id === toId);
    if (fi < 0 || ti < 0 || fi === ti) return list;
    return moveByIndex(list, fi, ti);
  }

  function reorderExperiences(fromId: string, toId: string) {
    setData((p) => ({ ...p, experience: reorderById(p.experience, fromId, toId) }));
  }
  function reorderEducations(fromId: string, toId: string) {
    setData((p) => ({ ...p, education: reorderById(p.education, fromId, toId) }));
  }
  function reorderProjects(fromId: string, toId: string) {
    setData((p) => ({ ...p, projects: reorderById(p.projects, fromId, toId) }));
  }
  function reorderSkillBlocks(fromId: string, toId: string) {
    setData((p) => ({ ...p, skillBlocks: reorderById(p.skillBlocks ?? [], fromId, toId) }));
  }
  function reorderAchievements(fromIdx: number, toIdx: number) {
    setData((p) => ({ ...p, achievements: moveByIndex(p.achievements, fromIdx, toIdx) }));
  }
  function reorderCustomEntries(fromId: string, toId: string) {
    setData((p) => ({ ...p, custom: reorderById(p.custom ?? [], fromId, toId) }));
  }

  /** ---------------- Section reorder ---------------- */
  function reorderSections(from: string, to: string) {
    setCustomize((prev) => {
      const order = [...(prev.sectionOrder ?? DEFAULT_SECTION_ORDER)];
      const fromIdx = order.indexOf(from);
      const toIdx = order.indexOf(to);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      return { ...prev, sectionOrder: moveByIndex(order, fromIdx, toIdx) };
    });
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
          bulletsHtml: "",
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
  function addExperience() {
    setVisible((p) => ({ ...p, experience: true }));
    setOpenExperience(true);
    const id = uid();
    setData((p) => ({
      ...p,
      experience: [...p.experience, { id, company: "", title: "", location: "", start: "", end: "", bulletsHtml: "" }],
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
  function addProject() {
    setVisible((p) => ({ ...p, projects: true }));
    setOpenProjects(true);
    const id = uid();
    setData((p) => ({ ...p, projects: [...p.projects, { id, name: "", stack: "", bulletsHtml: "" }] }));
    setOpenProjId(id);
  }
  function updateProject(id: string, patch: Partial<Project>) {
    setData((p) => ({ ...p, projects: p.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }
  function removeProject(id: string) {
    setData((p) => ({ ...p, projects: p.projects.filter((x) => x.id !== id) }));
    if (openProjId === id) setOpenProjId(null);
  }
  function addAchievement() {
    setVisible((p) => ({ ...p, achievements: true }));
    setOpenAchievements(true);
    setData((p) => ({ ...p, achievements: [...p.achievements, ""] }));
    setOpenAchIndex((data.achievements ?? []).length);
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

  /** ---------------- Download ---------------- */
  function onDownload() {
    previewRef.current?.download();
  }

  const customLabel = data.customSectionTitle?.trim() ? data.customSectionTitle.trim() : "Custom";

  /** ---------------- Customize Lists ---------------- */
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

  function setCustomizePatch(patch: Partial<ResumeCustomize>) {
    setCustomize((prev) => ({ ...prev, ...patch }));
  }

  /** ---------------- Section content renderer ---------------- */
  function renderSectionContent(key: string): React.ReactNode {
    if (key === "basics") return (
      <>
        <button onClick={() => setOpenBasics((v) => !v)} className="flex w-full items-center justify-between gap-3" type="button">
          <div className="text-left">
            <div className="text-sm font-semibold">Basics</div>
            <div className="mt-1 text-xs text-white/60">
              {loaded ? `${data.name || "Full name"} • ${data.email || "email"} • ${data.phone || "phone"}` : "Full name • email • phone"}
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
              <RichTextArea label="Summary" value={data.summary} onChange={(v) => setBasics("summary", v)} placeholder="Write a brief professional summary..." />
            </div>
          </div>
        ) : null}
      </>
    );
    if (key === "skills") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenSkills((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">Skills</div>
              <div className="mt-1 text-xs text-white/60">
                {(data.skillBlocks ?? []).length ? "Configured" : "No skill blocks"}
              </div>
            </div>
            <Chevron open={openSkills} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={() => { setNewSkillTitle(""); setIsAddSkillOpen(true); }}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("skills")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openSkills ? (
          <div className="mt-4 space-y-3">
            {(data.skillBlocks ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/40">No skills added yet. Click "+ Add".</div>
            ) : null}
            {(data.skillBlocks ?? []).map((b) => {
              const isOpen = openSkillId === b.id;
              const isDragging = dragSkillId === b.id;
              const isDragOver = dragOverSkillId === b.id && dragSkillId !== b.id;
              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; setDragSkillId(b.id); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverSkillId(b.id); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (dragSkillId && dragSkillId !== b.id) reorderSkillBlocks(dragSkillId, b.id); setDragSkillId(null); setDragOverSkillId(null); }}
                  onDragEnd={() => { setDragSkillId(null); setDragOverSkillId(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={b.title || "Untitled skill"} onClick={() => setOpenSkillId((cur) => (cur === b.id ? null : b.id))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeSkillBlock(b.id)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
                  {isOpen ? (
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <span>Type:</span>
                          <SmallButton onClick={() => updateSkillBlock(b.id, { kind: "list" })} variant={b.kind === "list" ? "solid" : "ghost"}>List</SmallButton>
                          <SmallButton onClick={() => updateSkillBlock(b.id, { kind: "text" })} variant={b.kind === "text" ? "solid" : "ghost"}>Text</SmallButton>
                        </div>
                        {b.kind === "list" ? (
                          <div className="space-y-2">
                            <div className="text-xs text-white/70">Items</div>
                            <input value={(b.items ?? []).join(", ")} onChange={(e) => updateSkillBlock(b.id, { items: splitCommaList(e.target.value) })} placeholder="Comma separated" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30" />
                          </div>
                        ) : (
                          <RichTextArea label="Text" value={b.text ?? ""} onChange={(v) => updateSkillBlock(b.id, { text: v })} placeholder="Write a single line or paragraph" />
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
    if (key === "experience") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenExperience((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">Work Experience</div>
              <div className="mt-1 text-xs text-white/60">
                {data.experience.length ? `${data.experience.length} entr${data.experience.length === 1 ? "y" : "ies"}` : "No entries"}
              </div>
            </div>
            <Chevron open={openExperience} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={addExperience}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("experience")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openExperience ? (
          <div className="mt-4 space-y-3">
            {data.experience.map((e) => {
              const label = e.title?.trim() || "Untitled position";
              const isOpen = openExpId === e.id;
              const isDragging = dragExpId === e.id;
              const isDragOver = dragOverExpId === e.id && dragExpId !== e.id;
              return (
                <div
                  key={e.id}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); ev.dataTransfer.effectAllowed = "move"; setDragExpId(e.id); }}
                  onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setDragOverExpId(e.id); }}
                  onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragExpId && dragExpId !== e.id) reorderExperiences(dragExpId, e.id); setDragExpId(null); setDragOverExpId(null); }}
                  onDragEnd={() => { setDragExpId(null); setDragOverExpId(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={label} onClick={() => setOpenExpId((cur) => (cur === e.id ? null : e.id))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeExperience(e.id)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
                  {isOpen ? (
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextInput label="Job Title" value={e.title} onChange={(v) => updateExperience(e.id, { title: v })} />
                        <TextInput label="Company" value={e.company} onChange={(v) => updateExperience(e.id, { company: v })} />
                        <TextInput label="Location" value={e.location ?? ""} onChange={(v) => updateExperience(e.id, { location: v })} />
                        <TextInput label="Start" value={e.start} onChange={(v) => updateExperience(e.id, { start: v })} />
                        <TextInput label="End" value={e.end} onChange={(v) => updateExperience(e.id, { end: v })} />
                        <div className="sm:col-span-2">
                          <RichTextArea label="Bullets" value={e.bulletsHtml ?? ""} onChange={(v) => updateExperience(e.id, { bulletsHtml: v })} placeholder="Add bullet points..." />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
    if (key === "education") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenEducation((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">Education</div>
              <div className="mt-1 text-xs text-white/60">
                {data.education.length ? `${data.education.length} entr${data.education.length === 1 ? "y" : "ies"}` : "No entries"}
              </div>
            </div>
            <Chevron open={openEducation} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={addEducation}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("education")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openEducation ? (
          <div className="mt-4 space-y-3">
            {data.education.map((e) => {
              const label = e.school?.trim() || "Untitled education";
              const isOpen = openEduId === e.id;
              const isDragging = dragEduId === e.id;
              const isDragOver = dragOverEduId === e.id && dragEduId !== e.id;
              return (
                <div
                  key={e.id}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); ev.dataTransfer.effectAllowed = "move"; setDragEduId(e.id); }}
                  onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setDragOverEduId(e.id); }}
                  onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragEduId && dragEduId !== e.id) reorderEducations(dragEduId, e.id); setDragEduId(null); setDragOverEduId(null); }}
                  onDragEnd={() => { setDragEduId(null); setDragOverEduId(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={label} onClick={() => setOpenEduId((cur) => (cur === e.id ? null : e.id))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeEducation(e.id)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
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
                          <RichTextArea label="Coursework (optional)" value={e.coursework ?? ""} onChange={(v) => updateEducation(e.id, { coursework: v })} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
    if (key === "projects") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenProjects((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">Projects</div>
              <div className="mt-1 text-xs text-white/60">
                {data.projects.length ? `${data.projects.length} entr${data.projects.length === 1 ? "y" : "ies"}` : "No entries"}
              </div>
            </div>
            <Chevron open={openProjects} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={addProject}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("projects")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openProjects ? (
          <div className="mt-4 space-y-3">
            {data.projects.map((p) => {
              const label = p.name?.trim() || "Untitled project";
              const isOpen = openProjId === p.id;
              const isDragging = dragProjId === p.id;
              const isDragOver = dragOverProjId === p.id && dragProjId !== p.id;
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); ev.dataTransfer.effectAllowed = "move"; setDragProjId(p.id); }}
                  onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setDragOverProjId(p.id); }}
                  onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragProjId && dragProjId !== p.id) reorderProjects(dragProjId, p.id); setDragProjId(null); setDragOverProjId(null); }}
                  onDragEnd={() => { setDragProjId(null); setDragOverProjId(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={label} onClick={() => setOpenProjId((cur) => (cur === p.id ? null : p.id))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeProject(p.id)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
                  {isOpen ? (
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextInput label="Project name" value={p.name} onChange={(v) => updateProject(p.id, { name: v })} />
                        <TextInput label="Tech stack" value={p.stack} onChange={(v) => updateProject(p.id, { stack: v })} />
                        <div className="sm:col-span-2">
                          <RichTextArea label="Bullets" value={p.bulletsHtml ?? ""} onChange={(v) => updateProject(p.id, { bulletsHtml: v })} placeholder="Add bullet points..." />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
    if (key === "achievements") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenAchievements((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">Achievements</div>
              <div className="mt-1 text-xs text-white/60">{hasAny(data.achievements) ? "Configured" : "No items"}</div>
            </div>
            <Chevron open={openAchievements} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={addAchievement}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("achievements")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openAchievements ? (
          <div className="mt-4 space-y-3">
            {(data.achievements ?? []).map((a, idx) => {
              const plainText = (a ?? "").replace(/<[^>]*>/g, "").trim();
              const label = plainText || "Untitled achievement";
              const isOpen = openAchIndex === idx;
              const isDragging = dragAchIdx === idx;
              const isDragOver = dragOverAchIdx === idx && dragAchIdx !== idx;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); ev.dataTransfer.effectAllowed = "move"; setDragAchIdx(idx); }}
                  onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setDragOverAchIdx(idx); }}
                  onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragAchIdx !== null && dragAchIdx !== idx) reorderAchievements(dragAchIdx, idx); setDragAchIdx(null); setDragOverAchIdx(null); }}
                  onDragEnd={() => { setDragAchIdx(null); setDragOverAchIdx(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={label} onClick={() => setOpenAchIndex((cur) => (cur === idx ? null : idx))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeAchievement(idx)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
                  {isOpen ? (
                    <div className="rounded-2xl bg-white/5 p-4">
                      <RichTextArea value={a} onChange={(v) => updateAchievement(idx, v)} placeholder="Achievement bullet" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </>
    );
    if (key === "custom") return (
      <>
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setOpenCustom((v) => !v)} className="flex min-w-0 flex-1 items-center justify-between gap-3" type="button">
            <div className="text-left">
              <div className="text-sm font-semibold">{customLabel}</div>
              <div className="mt-1 text-xs text-white/60">
                {(data.custom?.length ?? 0) ? `${data.custom.length} entr${data.custom.length === 1 ? "y" : "ies"}` : "No entries"}
              </div>
            </div>
            <Chevron open={openCustom} />
          </button>
          <div className="flex items-center gap-2">
            <SmallButton variant="solid" onClick={addCustomEntry}>+ Add</SmallButton>
            <SmallButton variant="danger" onClick={() => deleteSection("custom")}>Delete</SmallButton>
            <DragGrip />
          </div>
        </div>
        {openCustom ? (
          <div className="mt-4 space-y-3">
            {(data.custom?.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/40">No entries yet. Click "+ Add".</div>
            ) : null}
            {(data.custom ?? []).map((c) => {
              const label = c.title?.trim() || "Untitled entry";
              const isOpen = openCustomId === c.id;
              const isDragging = dragCustomId === c.id;
              const isDragOver = dragOverCustomId === c.id && dragCustomId !== c.id;
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); ev.dataTransfer.effectAllowed = "move"; setDragCustomId(c.id); }}
                  onDragOver={(ev) => { ev.preventDefault(); ev.stopPropagation(); setDragOverCustomId(c.id); }}
                  onDrop={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragCustomId && dragCustomId !== c.id) reorderCustomEntries(dragCustomId, c.id); setDragCustomId(null); setDragOverCustomId(null); }}
                  onDragEnd={() => { setDragCustomId(null); setDragOverCustomId(null); }}
                  className={["space-y-2 rounded-xl transition-all", isDragging ? "opacity-40" : "", isDragOver ? "ring-2 ring-teal-400/50" : ""].filter(Boolean).join(" ")}
                >
                  <MiniRow label={label} onClick={() => setOpenCustomId((cur) => (cur === c.id ? null : c.id))} right={
                    <div className="flex items-center gap-2">
                      <SmallButton variant="danger" onClick={() => removeCustomEntry(c.id)}>Remove</SmallButton>
                      <DragGrip />
                    </div>
                  } />
                  {isOpen ? (
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <TextInput label="Title" value={c.title} onChange={(v) => updateCustomEntry(c.id, { title: v })} />
                        <TextInput label="Subtitle" value={c.subtitle} onChange={(v) => updateCustomEntry(c.id, { subtitle: v })} />
                        <TextInput label="Location (optional)" value={c.location ?? ""} onChange={(v) => updateCustomEntry(c.id, { location: v })} />
                        <TextInput label="Start (optional)" value={c.start ?? ""} onChange={(v) => updateCustomEntry(c.id, { start: v })} />
                        <TextInput label="End (optional)" value={c.end ?? ""} onChange={(v) => updateCustomEntry(c.id, { end: v })} />
                        <div className="sm:col-span-2 mt-2 flex items-center gap-2 text-xs text-white/70">
                          <span>Mode:</span>
                          <SmallButton onClick={() => updateCustomEntry(c.id, { mode: "bullets" })} variant={c.mode === "bullets" ? "solid" : "ghost"}>Bullets</SmallButton>
                          <SmallButton onClick={() => updateCustomEntry(c.id, { mode: "text" })} variant={c.mode === "text" ? "solid" : "ghost"}>Text</SmallButton>
                        </div>
                        <div className="sm:col-span-2">
                          {c.mode === "bullets" ? (
                            <RichTextArea label="Bullets" value={c.bulletsHtml ?? ""} onChange={(v) => updateCustomEntry(c.id, { bulletsHtml: v })} placeholder="Add bullet points..." />
                          ) : (
                            <RichTextArea label="Text" value={c.text ?? ""} onChange={(v) => updateCustomEntry(c.id, { text: v })} />
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
      </>
    );
    return null;
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

                {/* SECTIONS — drag to reorder */}
                {(customize.sectionOrder ?? DEFAULT_SECTION_ORDER)
                  .filter((key) => visible[key as keyof typeof visible])
                  .map((key) => {
                    const isDraggable = key !== "basics";
                    const isBeingDragged = dragSection === key;
                    const isDragTarget = dragOverSection === key && dragSection !== key;
                    return (
                      <div
                        key={key}
                        draggable={isDraggable}
                        onDragStart={isDraggable ? (e) => { e.dataTransfer.effectAllowed = "move"; setDragSection(key); } : undefined}
                        onDragOver={isDraggable ? (e) => { e.preventDefault(); setDragOverSection(key); } : undefined}
                        onDrop={isDraggable ? (e) => { e.preventDefault(); if (dragSection && dragSection !== key) reorderSections(dragSection, key); setDragSection(null); setDragOverSection(null); } : undefined}
                        onDragEnd={isDraggable ? () => { setDragSection(null); setDragOverSection(null); } : undefined}
                        className={[
                          "rounded-2xl bg-white/5 p-4 transition-all duration-150",
                          isBeingDragged ? "opacity-40" : "",
                          isDragTarget ? "ring-2 ring-teal-400/50" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {renderSectionContent(key)}
                      </div>
                    );
                  })}

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

                {/* Section headings */}
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

                {/* Title & Subtitle */}
                <div className="rounded-3xl bg-white/5 p-5">
                  <div className="text-3xl font-extrabold">Title &amp; Subtitle</div>

                  <div className="mt-4 space-y-5">
                    {/* Layout */}
                    <div>
                      <div className="text-sm font-semibold text-white/80">Layout</div>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {([
                          { key: "standard", thumb: (
                            <><div className="flex items-center justify-between w-full gap-1"><div className="flex-1 flex flex-col gap-1"><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-6 h-1 rounded-sm bg-white/35" /></div><div className="flex gap-0.5 shrink-0"><div className="w-2.5 h-2.5 rounded-sm border border-white/40" /><div className="w-2.5 h-2.5 rounded-full border border-white/40" /></div></div><div className="w-full h-1 rounded-sm bg-white/20 mt-1" /><div className="w-full h-1 rounded-sm bg-white/20" /></>
                          )},
                          { key: "meta-left", thumb: (
                            <><div className="flex items-start gap-1 w-full"><div className="flex flex-col gap-0.5 shrink-0"><div className="w-2.5 h-2.5 rounded-sm border border-white/40" /><div className="w-2.5 h-2.5 rounded-full border border-white/40 mt-0.5" /></div><div className="flex-1 flex flex-col gap-1 ml-1"><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-6 h-1 rounded-sm bg-white/35" /></div></div><div className="w-full h-1 rounded-sm bg-white/20 mt-1" /><div className="w-full h-1 rounded-sm bg-white/20" /></>
                          )},
                          { key: "compact", thumb: (
                            <><div className="flex items-center justify-between w-full gap-1"><div className="flex items-center gap-1"><div className="w-6 h-1.5 rounded-sm bg-white/60" /><div className="w-4 h-1 rounded-sm bg-white/35" /></div><div className="flex gap-0.5 shrink-0"><div className="w-2.5 h-1.5 rounded-sm bg-white/30" /></div></div><div className="w-full h-1 rounded-sm bg-white/20 mt-1" /><div className="w-full h-1 rounded-sm bg-white/20" /></>
                          )},
                          { key: "stacked", thumb: (
                            <><div className="w-8 h-1.5 rounded-sm bg-white/60" /><div className="w-6 h-1 rounded-sm bg-white/35 mt-1" /><div className="w-10 h-1 rounded-sm bg-white/25 mt-1" /><div className="w-full h-1 rounded-sm bg-white/20 mt-1" /></>
                          )},
                        ] as { key: string; thumb: React.ReactNode }[]).map(({ key, thumb }) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setCustomizePatch({ entryLayout: key as EntryLayout })}
                            className={["rounded-xl border p-2 flex flex-col items-start gap-1 transition-colors min-h-[60px] justify-center", customize.entryLayout === key ? "border-teal-400 bg-teal-500/20" : "border-white/20 bg-white/5 hover:bg-white/10"].join(" ")}
                          >
                            {thumb}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle style */}
                    <div>
                      <div className="text-sm font-semibold text-white/80">Subtitle style</div>
                      <div className="mt-2 flex gap-2">
                        <ChoicePill active={customize.entrySubtitleStyle === "normal"} label="Normal" onClick={() => setCustomizePatch({ entrySubtitleStyle: "normal" })} />
                        <ChoicePill active={customize.entrySubtitleStyle === "bold"} label="Bold" onClick={() => setCustomizePatch({ entrySubtitleStyle: "bold" })} />
                        <ChoicePill active={customize.entrySubtitleStyle === "italic"} label="Italic" onClick={() => setCustomizePatch({ entrySubtitleStyle: "italic" })} />
                      </div>
                    </div>

                    {/* Subtitle placement */}
                    <div>
                      <div className="text-sm font-semibold text-white/80">Subtitle placement</div>
                      <div className="mt-2 flex gap-2">
                        <ChoicePill active={customize.entrySubtitlePlacement === "same-line"} label="Same Line" onClick={() => setCustomizePatch({ entrySubtitlePlacement: "same-line" })} />
                        <ChoicePill active={customize.entrySubtitlePlacement === "next-line"} label="Next Line" onClick={() => setCustomizePatch({ entrySubtitlePlacement: "next-line" })} />
                      </div>
                    </div>

                    {/* Date & location placement */}
                    <div>
                      <div className="text-sm font-semibold text-white/80">Date &amp; Location placement</div>
                      <div className="mt-2 flex gap-2">
                        <ChoicePill active={customize.entryDatePlacement === "same-line"} label="Same Line" onClick={() => setCustomizePatch({ entryDatePlacement: "same-line" })} />
                        <ChoicePill active={customize.entryDatePlacement === "next-line"} label="Next Line" onClick={() => setCustomizePatch({ entryDatePlacement: "next-line" })} />
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
          <section className="h-[calc(100vh-150px)] overflow-auto rounded-2xl bg-[#e2e5e9] p-8 flex items-start justify-center">
            <OverleafTabsPreview ref={previewRef} data={data} customize={customize} />
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

