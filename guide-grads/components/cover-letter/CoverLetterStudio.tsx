"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import ResumeCustomizePanel from "@/components/resume/ResumeCustomizePanel";
import CoverLetterForm from "./CoverLetterForm";
import CoverLetterPreview, { type CoverLetterPreviewHandle } from "./CoverLetterPreview";
import { STARTER_BODY } from "./CoverLetterForm";
import type { CoverLetterData } from "@/types/coverLetter";
import { emptyCoverLetter, normalizeCoverLetter } from "@/types/coverLetter";
import {
  RESUME_BUILDER_STORAGE_KEY,
  defaultCustomize,
  emptyResume,
  mergeStoredResumeCustomize,
  type ResumeCustomize,
  type ResumeData,
} from "@/components/resume/ResumeBuilder";

function loadBundleFromStorage(): {
  data: ResumeData;
  resumeCustomize: ResumeCustomize;
  coverLetterCustomize: ResumeCustomize;
  coverLetter: CoverLetterData;
} {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(RESUME_BUILDER_STORAGE_KEY) : null;
    if (!raw) {
      return {
        data: emptyResume,
        resumeCustomize: defaultCustomize,
        coverLetterCustomize: defaultCustomize,
        coverLetter: emptyCoverLetter(),
      };
    }
    const parsed = JSON.parse(raw) as {
      data?: ResumeData;
      customize?: ResumeCustomize;
      coverLetterCustomize?: ResumeCustomize;
      coverLetter?: Partial<CoverLetterData>;
    };
    const data = parsed?.data ? { ...emptyResume, ...parsed.data } : emptyResume;
    const resumeCustomize = mergeStoredResumeCustomize(parsed?.customize);
    /** Isolated from resume — first time, copy current resume customize so the letter looks the same. */
    const coverLetterCustomize = mergeStoredResumeCustomize(
      parsed?.coverLetterCustomize !== undefined && parsed?.coverLetterCustomize !== null
        ? parsed.coverLetterCustomize
        : parsed?.customize
    );
    const coverLetter =
      parsed?.coverLetter && typeof parsed.coverLetter === "object"
        ? normalizeCoverLetter(parsed.coverLetter)
        : emptyCoverLetter();
    return { data, resumeCustomize, coverLetterCustomize, coverLetter };
  } catch {
    return {
      data: emptyResume,
      resumeCustomize: defaultCustomize,
      coverLetterCustomize: defaultCustomize,
      coverLetter: emptyCoverLetter(),
    };
  }
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

function DownloadIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TabKey = "content" | "customize" | "ai";

export default function CoverLetterStudio() {
  const [data, setData] = useState<ResumeData>(emptyResume);
  /** Resume customize — only updated from storage refresh; never from this page’s Customize tab. */
  const [resumeCustomize, setResumeCustomize] = useState<ResumeCustomize>(defaultCustomize);
  /** Cover letter only — persisted as `coverLetterCustomize`. */
  const [coverLetterCustomize, setCoverLetterCustomize] = useState<ResumeCustomize>(defaultCustomize);
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>(emptyCoverLetter);
  const [activeTab, setActiveTab] = useState<TabKey>("content");
  const [loaded, setLoaded] = useState(false);
  const previewRef = useRef<CoverLetterPreviewHandle>(null);

  useEffect(() => {
    const b = loadBundleFromStorage();
    setData(b.data);
    setResumeCustomize(b.resumeCustomize);
    setCoverLetterCustomize(b.coverLetterCustomize);
    setCoverLetter(b.coverLetter);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const refresh = () => {
      const b = loadBundleFromStorage();
      setData(b.data);
      setResumeCustomize(b.resumeCustomize);
      setCoverLetterCustomize(b.coverLetterCustomize);
      setCoverLetter(b.coverLetter);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === RESUME_BUILDER_STORAGE_KEY && e.newValue) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const raw = window.localStorage.getItem(RESUME_BUILDER_STORAGE_KEY);
      const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      window.localStorage.setItem(
        RESUME_BUILDER_STORAGE_KEY,
        JSON.stringify({
          ...prev,
          data,
          customize: resumeCustomize,
          coverLetter,
          coverLetterCustomize,
          updatedAt: Date.now(),
        })
      );
    } catch {
      /* ignore */
    }
  }, [coverLetter, coverLetterCustomize, data, resumeCustomize, loaded]);

  function setCoverLetterCustomizePatch(patch: Partial<ResumeCustomize>) {
    setCoverLetterCustomize((prev) => ({ ...prev, ...patch }));
  }

  function onDownload() {
    void previewRef.current?.download();
  }

  return (
    <div className="min-h-screen text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#071a2f]/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={activeTab === "content"} label="Content" onClick={() => setActiveTab("content")} />
            <TabButton active={activeTab === "customize"} label="Customize" onClick={() => setActiveTab("customize")} />
            <TabButton active={activeTab === "ai"} label="AI Tools" onClick={() => setActiveTab("ai")} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/resume"
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/15"
            >
              Edit resume
            </Link>
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-2 rounded-2xl bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400"
            >
              <DownloadIcon />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[560px_1fr]">
          <aside className="h-[calc(100vh-150px)] space-y-4 overflow-auto pr-1">
            {activeTab === "content" ? (
              <CoverLetterForm
                letter={coverLetter}
                onChange={(patch) => setCoverLetter((p) => ({ ...p, ...patch }))}
                onProfileChange={(patch) =>
                  setCoverLetter((p) => ({ ...p, profile: { ...p.profile, ...patch } }))
                }
                onInsertStarter={() =>
                  setCoverLetter((p) => ({ ...p, bodyHtml: p.bodyHtml?.trim() ? p.bodyHtml : STARTER_BODY }))
                }
              />
            ) : activeTab === "customize" ? (
              <ResumeCustomizePanel
                coverLetterMode
                customize={coverLetterCustomize}
                onPatch={setCoverLetterCustomizePatch}
              />
            ) : (
              <div className="rounded-2xl bg-white/5 p-6 text-white/80">
                <div className="text-lg font-semibold text-white">AI Tools</div>
                <div className="mt-2 text-sm text-white/60">Next: tailor this letter with AI, tone checks, and more.</div>
              </div>
            )}
          </aside>
          <section className="h-[calc(100vh-150px)] overflow-auto rounded-2xl bg-[#e2e5e9] p-8 flex items-start justify-center">
            <CoverLetterPreview ref={previewRef} letter={coverLetter} customize={coverLetterCustomize} />
          </section>
        </div>
      </div>
    </div>
  );
}
