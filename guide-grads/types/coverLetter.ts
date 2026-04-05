/** Sender block on the cover letter (edited here, not pulled from resume). */
export type CoverLetterProfile = {
  fullName: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
};

/** Cover letter fields stored with the resume builder (localStorage). */
export type CoverLetterData = {
  /** Shown top-right when set; hidden on preview when empty. */
  dateStr: string;
  profile: CoverLetterProfile;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  salutation: string;
  bodyHtml: string;
  closingLine: string;
  signature: string;
};

export const emptyProfile = (): CoverLetterProfile => ({
  fullName: "",
  location: "",
  phone: "",
  email: "",
  linkedin: "",
  github: "",
  portfolio: "",
});

export const emptyCoverLetter = (): CoverLetterData => ({
  dateStr: "",
  profile: emptyProfile(),
  recipientName: "",
  recipientTitle: "",
  companyName: "",
  salutation: "Dear Hiring Manager,",
  bodyHtml: "",
  closingLine: "Sincerely,",
  signature: "",
});

/** Parse stored JSON; maps legacy `signOffName` → `signature` and fills `profile`. */
export function normalizeCoverLetter(raw: unknown): CoverLetterData {
  if (!raw || typeof raw !== "object") return emptyCoverLetter();
  const r = raw as Record<string, unknown>;
  const signOffLegacy = r.signOffName;
  const sig =
    (typeof r.signature === "string" && r.signature) ||
    (typeof signOffLegacy === "string" && signOffLegacy) ||
    "";

  const profIn = r.profile;
  const profile: CoverLetterProfile = {
    ...emptyProfile(),
    ...(typeof profIn === "object" && profIn !== null ? (profIn as Partial<CoverLetterProfile>) : {}),
  };

  return {
    dateStr: typeof r.dateStr === "string" ? r.dateStr : "",
    profile,
    recipientName: typeof r.recipientName === "string" ? r.recipientName : "",
    recipientTitle: typeof r.recipientTitle === "string" ? r.recipientTitle : "",
    companyName: typeof r.companyName === "string" ? r.companyName : "",
    salutation: typeof r.salutation === "string" ? r.salutation : emptyCoverLetter().salutation,
    bodyHtml: typeof r.bodyHtml === "string" ? r.bodyHtml : "",
    closingLine: typeof r.closingLine === "string" ? r.closingLine : emptyCoverLetter().closingLine,
    signature: sig,
  };
}
