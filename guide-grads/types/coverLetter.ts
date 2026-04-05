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

/** Rough visible text from HTML for “has the user typed in the body?” checks (no DOM). */
export function coverLetterBodyVisibleText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Preview shows italic placeholders until the user touches Profile, Recipient, or Body; then empty fields
 * render blank with normal styling (no “Full Name” / “Recipient Name” / etc.).
 */
export function coverLetterShouldHidePreviewPlaceholders(letter: CoverLetterData): boolean {
  const p = letter.profile;
  const profileTouched = [
    p.fullName,
    p.location,
    p.phone,
    p.email,
    p.linkedin,
    p.github,
    p.portfolio,
  ].some((s) => (s ?? "").trim().length > 0);
  const recipientTouched = [letter.recipientName, letter.recipientTitle, letter.companyName].some(
    (s) => (s ?? "").trim().length > 0
  );
  const bodyTouched = coverLetterBodyVisibleText(letter.bodyHtml ?? "").length > 0;
  return profileTouched || recipientTouched || bodyTouched;
}
