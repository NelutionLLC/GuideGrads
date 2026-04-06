import type { DatedSource, ProcessingRow } from "../types";
import { IMMIGRATION_CONTENT_AS_OF } from "./meta";

export const permPageAsOf = IMMIGRATION_CONTENT_AS_OF;

export const permPrimarySources: DatedSource[] = [
  {
    label: "ETA — PERM overview",
    url: "https://www.dol.gov/agencies/eta/foreign-labor/programs/perm",
    lastVerified: "2026-04-05",
  },
  {
    label: "DOL FLAG — case status",
    url: "https://flag.dol.gov/",
    lastVerified: "2026-04-05",
  },
  {
    label: "ETA — Processing times (PERM)",
    url: "https://www.dol.gov/agencies/eta/processing-times-npc",
    lastVerified: "2026-04-05",
  },
];

export const permWhatIs = {
  title: "What is PERM?",
  bullets: [
    "Program Electronic Review Management — DOL’s labor certification process for many employment-based green card cases.",
    "Employer tests the U.S. labor market and attests to regulatory requirements before filing ETA Form 9089.",
    "A certified ETA 9089 supports the employer’s I-140 petition (when required for the category).",
  ],
};

export const permProcessingRows: ProcessingRow[] = [
  {
    category: "Analyst review (no audit) — illustrative",
    rangeOrNote: "Often varies widely by case mix; use DOL NPC published averages/medians as a benchmark, not a guarantee.",
    source: {
      label: "DOL — NPC PERM processing",
      url: "https://flag.dol.gov/processingtimes",
      lastVerified: "2026-04-05",
    },
  },
  {
    category: "Audit queue",
    rangeOrNote: "Audited cases take longer; respond completely and timely to DOL requests.",
    source: {
      label: "ETA — PERM compliance",
      url: "https://flag.dol.gov/processingtimes",
      lastVerified: "2026-04-05",
    },
  },
];

export const permStages = [
  "Prevailing wage determination (PWD) and recruitment strategy",
  "Mandatory recruitment steps (posting, ads, timeline per regulations)",
  "Prepare and file ETA Form 9089 in FLAG",
  "DOL analyst review — approval, denial, or audit",
];

export const auditInfo = {
  title: "Audits",
  bullets: [
    "DOL may select cases for supervised recruitment or audit to verify compliance.",
    "Common triggers include random sampling, inconsistencies, or responses that require clarification — not an exhaustive list.",
    "Employers submit audit responses through FLAG; timelines extend until resolution.",
  ],
};

export const permToI140Phases: { phase: string; note: string }[] = [
  { phase: "PERM filed → certified (or denied)", note: "DOL processing per NPC times; audits add delay." },
  { phase: "I-140 petition (USCIS)", note: "Employer files with certified PERM (if category requires it) and supporting evidence." },
  { phase: "Immigrant visa / AOS", note: "After I-140 and when a visa number is available per Visa Bulletin." },
];
