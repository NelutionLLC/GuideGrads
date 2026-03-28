"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

type Application = {
  id: string;
  company: string;
  role: string;
  location?: string;
  visaTag?: "OPT-friendly" | "H1B-friendly" | "CPT-friendly" | "Unknown";
  stage: Stage;
  createdAt: string;
};

const STORAGE_KEY = "guidegrads.applications.v1";
const STAGES: Stage[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ApplicationsBoard() {
    const [apps, setApps] = useState<Application[]>(() => {
        if (typeof window === "undefined") return [];
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw) as Application[];
          if (!Array.isArray(parsed)) return [];
          return parsed;
        } catch {
          return [];
        }
    })

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
      }, [apps]);

    const [overStage, setOverStage] = useState<Stage | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    visaTag: "Unknown" as Application["visaTag"],
    stage: "Saved" as Stage,
  });

  const grouped = useMemo(() => {
    const map: Record<Stage, Application[]> = {
      Saved: [],
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };
    for (const a of apps) map[a.stage].push(a);
    return map;
  }, [apps]);

  function addApplication() {
    if (!form.company.trim() || !form.role.trim()) return;

    const next: Application = {
      id: uid(),
      company: form.company.trim(),
      role: form.role.trim(),
      location: form.location.trim() || undefined,
      visaTag: form.visaTag,
      stage: form.stage,
      createdAt: new Date().toISOString(),
    };

    setApps((prev) => [next, ...prev]);
    setForm({ company: "", role: "", location: "", visaTag: "Unknown", stage: "Saved" });
    setOpen(false);
  }

  function move(id: string, to: Stage) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage: to } : a)));
  }

  function remove(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Top actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-white/60">
          Tip: start by saving jobs, then move them as you apply.
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400 sm:w-auto"
        >
          + Add application
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {STAGES.map((stage) => (
          <div
            key={stage}
            onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage);
                e.dataTransfer.dropEffect = "move";
            }}
            onDragLeave={() => setOverStage((prev) => (prev === stage ? null : prev))}
            onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) move(id, stage);
                setOverStage(null);
            }}
            className={`rounded-2xl p-3 ${
                overStage === stage ? "bg-white/10" : "bg-white/5"
            }`}
            >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{stage}</h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                {grouped[stage].length}
              </span>
            </div>

            <div className="space-y-3">
              {grouped[stage].map((a) => (
                <div
                key={a.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", a.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="cursor-grab rounded-xl bg-black/15 p-3 active:cursor-grabbing"
              >              
                  <div className="text-sm font-semibold">{a.role}</div>
                  <div className="mt-1 text-xs text-white/70">{a.company}</div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.location ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                        {a.location}
                      </span>
                    ) : null}

                    {a.visaTag ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                        {a.visaTag}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <select
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white outline-none"
                      value={a.stage}
                      onChange={(e) => move(a.id, e.target.value as Stage)}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s} className="text-black">
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => remove(a.id)}
                      className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {grouped[stage].length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-white/40">
                  No items
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0b2340] p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add application</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-xs text-white/70">Company *</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                  className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
                  placeholder="e.g. Amazon"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-white/70">Role *</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-white/70">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
                  placeholder="Remote / City"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="text-xs text-white/70">Visa tag</label>
                <select
                  value={form.visaTag}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, visaTag: e.target.value as Application["visaTag"] }))
                  }
                  className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
                >
                  <option className="text-black" value="Unknown">Unknown</option>
                  <option className="text-black" value="OPT-friendly">OPT-friendly</option>
                  <option className="text-black" value="CPT-friendly">CPT-friendly</option>
                  <option className="text-black" value="H1B-friendly">H1B-friendly</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-white/70">Stage</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as Stage }))}
                  className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s} className="text-black" value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={addApplication}
                className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400"
              >
                Save
              </button>
            </div>

            <div className="mt-3 text-xs text-white/50">
              * Required fields: Company and Role
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
