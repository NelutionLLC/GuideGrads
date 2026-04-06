import type { DatedSource, ProcessingRow } from "../types";
import { IMMIGRATION_CONTENT_AS_OF } from "./meta";

export const pwdPageAsOf = IMMIGRATION_CONTENT_AS_OF;

export const pwdPrimarySources: DatedSource[] = [
  {
    label: "ETA — Prevailing Wage Overview",
    url: "https://www.dol.gov/agencies/eta/foreign-labor/programs/prevailing-wage-determination",
    lastVerified: "2026-04-05",
  },
  {
    label: "ETA — Processing times (PWD)",
    url: "https://www.dol.gov/agencies/eta/processing-times-npc",
    lastVerified: "2026-04-05",
  },
];

export const pwdWhatIs = {
  title: "What is a Prevailing Wage Determination (PWD)?",
  bullets: [
    "A PWD is ETA’s official determination of the appropriate wage for an occupation in a specific geographic area for immigration-related filings (e.g., PERM, certain H-1B/LCA contexts depending on workflow).",
    "Employers must pay at least the required wage consistent with the determination and program rules.",
    "PWD timelines affect when recruitment and PERM filing can proceed.",
  ],
};

export const pwdProcessingRows: ProcessingRow[] = [
  {
    category: "Standard processing (illustrative range)",
    rangeOrNote: "Often several months; varies by workload — verify NPC published processing times.",
    source: {
      label: "DOL — NPC processing times",
      url: "https://flag.dol.gov/processingtimes",
      lastVerified: "2026-04-05",
    },
  },
  {
    category: "Center of Excellence (COE) / redetermination contexts",
    rangeOrNote: "Certain matters route through specialized review; timelines differ — check DOL NPC guidance for the category that applies.",
    source: {
      label: "DOL — ETA processing",
      url: "https://flag.dol.gov/processingtimes",
      lastVerified: "2026-04-05",
    },
  },
];

export const wageLevels = {
  title: "Wage levels (OES / survey-based schedules)",
  levels: [
    { level: "I", desc: "Entry — typically aligned with lower percentiles of the accepted wage survey for the occupation/area." },
    { level: "II", desc: "Qualified — mid-range progression within the survey distribution." },
    { level: "III", desc: "Experienced — higher percentiles reflecting greater experience and responsibility." },
    { level: "IV", desc: "Fully competent / highest — top percentiles within the survey distribution for the occupation/area." },
  ],
  note: "Exact mapping uses DOL methodology tied to the OES (or other permitted) wage source for the determination. See ETA prevailing wage guidance.",
};

export const oesVsCba = {
  title: "OES vs CBA wage sources",
  rows: [
    {
      source: "OES (Occupational Employment and Wage Statistics)",
      note: "BLS-based survey wages commonly used for PWD schedules where applicable.",
    },
    {
      source: "CBA (Collective Bargaining Agreement)",
      note: "May be used when a qualifying CBA meets regulatory requirements for the determination.",
    },
  ],
};

export const pwdAffectsLcaPerm = {
  title: "How PWD affects LCA and PERM",
  bullets: [
    "H-1B LCAs require offering the required wage; PWD or permitted wage methodology must be satisfied per program rules.",
    "PERM recruitment and prevailing wage steps must align with ETA rules before filing ETA Form 9089.",
  ],
};

/** Official tools only — no in-app wage calculator (use DOL for authoritative numbers). */
export const pwdPrevailingWageLookup = {
  title: "Prevailing wage estimate & lookup",
  intro:
    "Use the Department of Labor’s tools for occupation- and area-specific wage data. GuideGrads does not compute prevailing wages — filings require ETA’s determination or a permitted alternative under program rules.",
  links: [
    {
      label: "DOL Online Wage Library (OE/SOC Wizard)",
      url: "https://flag.dol.gov/wage-data/wage-search",
    },
  ],
};

/** Category timeline table — illustrative; DOL publishes actual NPC stats. */
export const pwdTimelineCategories: { stage: string; typicalRange: string }[] = [
  { stage: "PWD request submitted → determination issued", typicalRange: "Highly variable; check NPC processing times for your submission type" },
  { stage: "PWD received → recruitment (PERM)", typicalRange: "Depends on employer schedule and mandatory posting windows" },
  { stage: "Recruitment complete → ETA 9089 filing", typicalRange: "Employer-driven after compliance" },
];
