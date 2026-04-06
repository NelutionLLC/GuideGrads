import type { DatedSource, SourceRef } from "../types";
import { IMMIGRATION_CONTENT_AS_OF } from "./meta";

export const ebPageAsOf = IMMIGRATION_CONTENT_AS_OF;

export const ebPrimarySources: DatedSource[] = [
  {
    label: "USCIS — Employment-based immigration",
    url: "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-immigrants",
    lastVerified: "2026-04-05",
  },
  {
    label: "Department of State — Visa Bulletin",
    url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
    lastVerified: "2026-04-05",
  },
  {
    label: "USCIS — Adjustment of status",
    url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
    lastVerified: "2026-04-05",
  },
];

export const eb1 = {
  title: "EB-1",
  sections: [
    {
      subtitle: "EB-1A — Extraordinary ability",
      bullets: [
        "Self-petition possible; evidence of sustained national or international acclaim in the field.",
        "No labor certification (PERM) required.",
      ],
    },
    {
      subtitle: "EB-1B — Outstanding professor or researcher",
      bullets: [
        "Requires employer offer and evidence of international recognition.",
        "Labor certification is not required, but employer must file I-140 with offer documentation.",
      ],
    },
    {
      subtitle: "EB-1C — Multinational manager or executive",
      bullets: [
        "Requires qualifying multinational relationship and executive/managerial role.",
        "Labor certification is not required for EB-1C.",
      ],
    },
  ],
  source: {
    label: "USCIS — EB-1",
    url: "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-immigrant-workers/eb-1-visa-for-workers-of-extraordinary-ability",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const eb2 = {
  title: "EB-2",
  bullets: [
    "Generally for members of professions holding an advanced degree or its equivalent, or persons of exceptional ability.",
    "National Interest Waiver (NIW) allows self-petition without a job offer or PERM when statutory criteria are met.",
    "When not using NIW, PERM labor certification is typically required before the employer files I-140 (unless another exemption applies).",
  ],
  source: {
    label: "USCIS — EB-2",
    url: "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-immigrant-workers/eb-2-visa-for-workers-with-advanced-degrees-or-exceptional-ability",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const eb3 = {
  title: "EB-3",
  bullets: [
    "Categories include skilled workers, professionals, and other workers (each subcategory has distinct requirements).",
    "Labor certification (PERM) is generally required unless a specific exception applies.",
  ],
  source: {
    label: "USCIS — EB-3",
    url: "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-immigrant-workers/eb-3-visa-for-skilled-workers-professionals-and-other-workers",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

export const visaBulletinExplained = {
  title: "Priority dates and Visa Bulletin",
  bullets: [
    "Each employment-based preference category has a quota; when demand exceeds supply, a priority date queue forms.",
    "The Visa Bulletin publishes “Final Action Dates” and “Dates for Filing” charts for adjustment of status — which chart applies depends on USCIS instructions each month.",
    "Retrogression means priority dates move backward when categories are oversubscribed — common for India and China in certain EB categories.",
  ],
  bulletinLink: {
    label: "Current Visa Bulletin",
    url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
  } satisfies SourceRef,
};

export const aosVsCp = {
  title: "Adjustment of Status (AOS) vs Consular Processing (CP)",
  rows: [
    {
      aspect: "Where processed",
      aos: "Inside the U.S. through USCIS (Form I-485) when eligible.",
      cp: "Through the U.S. embassy/consulate abroad (immigrant visa interview).",
    },
    {
      aspect: "Travel / work",
      aos: "May request advance parole and EAD while pending (if eligible); follow USCIS rules.",
      cp: "Enter on immigrant visa after approval; follow DOS guidance.",
    },
    {
      aspect: "Eligibility to file",
      aos: "Requires a visa number immediately available per Bulletin + maintained lawful status considerations.",
      cp: "Follow NVC and consular steps after I-140 approval and when a visa is available.",
    },
  ],
  aosSource: {
    label: "USCIS — AOS",
    url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
    lastVerified: "2026-04-05",
  } satisfies DatedSource,
};

/** Illustrative snapshot — replace monthly from DOS Visa Bulletin “Final Action” for employment-based rows. */
export const visaBulletinSnapshotNote =
  "Cutoff dates change every month. Use the Department of State Visa Bulletin for the current chart; do not rely on any static snapshot for filing decisions.";
