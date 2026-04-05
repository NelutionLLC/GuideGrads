import { createClient } from "@/lib/supabase/client";
import type { ResumeCustomize } from "@/components/resume/ResumeBuilder";
import type { CoverLetterData } from "@/types/coverLetter";
import { normalizeCoverLetter } from "@/types/coverLetter";

export type CoverLetterCloudPayload = {
  coverLetter?: CoverLetterData;
  coverLetterCustomize?: ResumeCustomize;
  updatedAt?: number;
};

function parsePayload(raw: unknown): CoverLetterCloudPayload {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const coverLetter =
    o.coverLetter && typeof o.coverLetter === "object"
      ? normalizeCoverLetter(o.coverLetter)
      : undefined;
  const coverLetterCustomize =
    o.coverLetterCustomize && typeof o.coverLetterCustomize === "object"
      ? (o.coverLetterCustomize as ResumeCustomize)
      : undefined;
  const updatedAt = typeof o.updatedAt === "number" ? o.updatedAt : undefined;
  return { coverLetter, coverLetterCustomize, updatedAt };
}

/** Load cover letter JSON for a resume; returns null if no row or on read errors (never throws). */
export async function getCoverLetterForResume(resumeId: string): Promise<CoverLetterCloudPayload | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cover_letters")
      .select("payload")
      .eq("resume_id", resumeId)
      .maybeSingle();
    if (error) {
      console.warn("cover_letters read failed", error.message);
      return null;
    }
    if (!data) return null;
    return parsePayload(data.payload);
  } catch (e) {
    console.warn("cover_letters read failed", e);
    return null;
  }
}

export async function upsertCoverLetterForResume(
  resumeId: string,
  body: { coverLetter: CoverLetterData; coverLetterCustomize: ResumeCustomize }
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const payload: CoverLetterCloudPayload = {
    coverLetter: body.coverLetter,
    coverLetterCustomize: body.coverLetterCustomize,
    updatedAt: Date.now(),
  };

  const { error } = await supabase.from("cover_letters").upsert(
    {
      user_id: user.id,
      resume_id: resumeId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "resume_id" }
  );
  if (error) throw error;
}
