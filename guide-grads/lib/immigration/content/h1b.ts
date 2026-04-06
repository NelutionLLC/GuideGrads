import type { DatedSource, SourceRef } from "../types";
import { IMMIGRATION_CONTENT_AS_OF } from "./meta";

export const h1bPageAsOf = IMMIGRATION_CONTENT_AS_OF;

export const h1bPrimarySources: DatedSource[] = [
  {
    label: "USCIS — H-1B specialty occupation",
    url: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations",
    lastVerified: "2026-04-05",
  },
  {
    label: "USCIS — Cap season overview",
    url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-electronic-registration-process",
    lastVerified: "2026-04-05",
  },
  {
    label: "INA § 214(g) (statutory cap)",
    url: "https://www.govinfo.gov/content/pkg/USCODE-2011-title8/pdf/USCODE-2011-title8-chap12-subchapII-sec1184.pdf",
    lastVerified: "2026-04-05",
  },
];

/** Statutory structure; verify each FY against USCIS cap announcements. */
export const h1bCapFacts = {
  regularCap: 65_000,
  usMasterExemption: 20_000,
  asOf: h1bPageAsOf,
  source: {
    label: "USCIS — H-1B cap",
    url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/h-1b-fiscal-year-fy-2025-cap-season",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const h1bOverview = {
  title: "What is H-1B?",
  bullets: [
    "Nonimmigrant classification for workers in a specialty occupation that normally requires at least a bachelor’s degree (or equivalent) in the specific specialty.",
    "Initial admission is generally up to 3 years; extensions are possible for up to 3 additional years (6 years total in H-1B status is common, with exceptions such as AC21).",
    "Employer files Form I-129; worker cannot self-petition for standard H-1B employment.",
  ],
};

export const h1bEligibility = {
  title: "Eligibility (high level)",
  bullets: [
    "Job qualifies as a specialty occupation (complex duties + degree requirement in a specific field).",
    "Beneficiary meets education/experience requirements for the offered position.",
    "Employer will pay at least the required wage (including prevailing wage where applicable).",
  ],
  learnMore: {
    label: "USCIS — H-1B requirements",
    url: "https://www.uscis.gov/policy-manual/volume-2-part-h-chapter-1",
  } satisfies SourceRef,
};

export const h1bCapLottery = {
  title: "Cap and registration",
  bullets: [
    `Congress sets an annual limit of ${h1bCapFacts.regularCap.toLocaleString()} new H-1B visas subject to the cap, plus up to ${h1bCapFacts.usMasterExemption.toLocaleString()} set aside for beneficiaries with a U.S. master’s or higher from a qualifying institution (when the exemption applies).`,
    "Most cap-subject H-1Bs use an electronic registration in early spring; selected registrations may proceed to petition filing for the following fiscal year starting October 1.",
    "Exact registration windows and selection rules are published each year by USCIS — verify the current FY announcement.",
  ],
};

export const h1bFilingTimelineSteps = [
  { key: "reg", label: "Registration", note: "Employer registers in the annual window (typically March; confirm each FY)." },
  { key: "sel", label: "Selection", note: "If registrations exceed the cap, USCIS runs selection; selected employers may file." },
  { key: "file", label: "File I-129", note: "File within the filing period specified for that registration selection." },
  { key: "oct1", label: "Employment start", note: "Earliest cap-subject employment start is usually October 1 of the new FY (unless a different start date is requested and permitted)." },
];

export const h1bDocuments = {
  title: "Commonly required items (not exhaustive)",
  items: [
    "Certified LCA (ETA-9035) from the FLAG system for the offered role and work location(s).",
    "Form I-129 + H supplement and employer support letter describing the position.",
    "Evidence of beneficiary education (degree evaluations if foreign degree) and credentials.",
    "Job offer / support describing duties, specialty occupation, and wage.",
    "Copy of passport, prior visas/I-94, prior approvals (if applicable).",
  ],
  lcaLink: {
    label: "DOL — LCA (FLAG)",
    url: "https://flag.dol.gov/",
  } satisfies SourceRef,
};

export const h1bTransfer = {
  title: "H-1B portability (transfer)",
  bullets: [
    "A worker already in H-1B status may change employers when the new employer files a non-frivolous I-129 before the current period of stay expires (portability provisions).",
    "You must maintain lawful status; follow USCIS guidance on start dates and bridge petitions when needed.",
  ],
  source: {
    label: "USCIS — Reporting changes & portability",
    url: "https://www.uscis.gov/h-1b/h-1b-portability",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const h1bExtensions = {
  title: "Extensions and time beyond 6 years",
  bullets: [
    "Standard maximum is often described as 6 years in H-1B, with extensions in up to 3-year increments when an extension of status is available.",
    "AC21 may allow extensions beyond the 6th year in certain green-card stages (e.g., I-140 approved or PERM/I-140 pending long enough) — verify eligibility with counsel.",
  ],
  source: {
    label: "USCIS — AC21",
    url: "https://www.uscis.gov/archive/ac21",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const h1bToGc = {
  title: "Path from H-1B to employment-based green card",
  bullets: [
    "Employer typically starts with PERM labor certification (unless category exempt), then I-140, then adjustment of status or consular processing.",
    "Priority dates and visa availability follow the Department of State Visa Bulletin — see the Employment Based tab.",
  ],
};
