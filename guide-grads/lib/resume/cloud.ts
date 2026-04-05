import { createClient } from "@/lib/supabase/client";
import type { ResumeCustomize, ResumeData } from "@/components/resume/ResumeBuilder";

/** Stored in `resumes.payload` only — cover letter lives in `cover_letters`. */
export type ResumeCloudPayload = {
  data?: ResumeData;
  customize?: ResumeCustomize;
  updatedAt?: number;
};

export type ResumeRow = {
  id: string;
  name: string;
  payload: ResumeCloudPayload;
  updated_at: string;
};

const SESSION_READY_MS = 5000;
const SESSION_POLL_MS = 50;

/**
 * After login/refresh, the browser client can lag behind React auth state; queries run as anon and RLS
 * returns no rows. Wait until getUser() resolves before hitting the DB.
 */
async function waitForSupabaseUser(): Promise<boolean> {
  const supabase = createClient();
  const deadline = Date.now() + SESSION_READY_MS;
  while (Date.now() < deadline) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return true;
    await new Promise((r) => setTimeout(r, SESSION_POLL_MS));
  }
  return false;
}

export async function listResumes(): Promise<ResumeRow[]> {
  const supabase = createClient();
  const sessionReady = await waitForSupabaseUser();
  if (!sessionReady) {
    console.warn("listResumes: Supabase session not ready in time — try refreshing the page.");
    return [];
  }
  const { data, error } = await supabase
    .from("resumes")
    .select("id,name,payload,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    payload: (r.payload as ResumeCloudPayload) ?? {},
    updated_at: r.updated_at as string,
  }));
}

export async function getResume(id: string): Promise<ResumeRow | null> {
  const supabase = createClient();
  const sessionReady = await waitForSupabaseUser();
  if (!sessionReady) return null;
  const { data, error } = await supabase
    .from("resumes")
    .select("id,name,payload,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    payload: (data.payload as ResumeCloudPayload) ?? {},
    updated_at: data.updated_at as string,
  };
}

export async function updateResume(id: string, payload: ResumeCloudPayload, name?: string) {
  const supabase = createClient();
  const patch: Record<string, unknown> = {
    payload,
    updated_at: new Date().toISOString(),
  };
  if (name !== undefined) patch.name = name;
  const { error } = await supabase.from("resumes").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createResume(name: string, payload: ResumeCloudPayload): Promise<ResumeRow> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      name,
      payload,
      schema_version: 1,
    })
    .select("id,name,payload,updated_at")
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    name: data.name as string,
    payload: (data.payload as ResumeCloudPayload) ?? {},
    updated_at: data.updated_at as string,
  };
}
