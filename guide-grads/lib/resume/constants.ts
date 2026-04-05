/** Session key for which cloud resume row is active (UUID). */
export const ACTIVE_RESUME_ID_KEY = "guidegrads.activeResumeId";

/** Resume + cover letter blob in localStorage (shared with Cover Letter studio). */
export const RESUME_BUILDER_STORAGE_KEY = "guidegrads.resume.builder.v2";

/** Applications board local cache when logged out. */
export const APPLICATIONS_STORAGE_KEY = "guidegrads.applications.v1";

export function clearGuideGradsSignedOutStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RESUME_BUILDER_STORAGE_KEY);
    window.localStorage.removeItem(ACTIVE_RESUME_ID_KEY);
    window.localStorage.removeItem(APPLICATIONS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
