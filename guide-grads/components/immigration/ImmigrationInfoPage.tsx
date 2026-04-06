"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import EmploymentBasedTab from "./tabs/EmploymentBasedTab";
import H1BTab from "./tabs/H1BTab";
import PERMTab from "./tabs/PERMTab";
import PWDTab from "./tabs/PWDTab";

const TAB_IDS = ["h1b", "eb", "pwd", "perm"] as const;
export type ImmigrationTabId = (typeof TAB_IDS)[number];

const TABS: { id: ImmigrationTabId; label: string }[] = [
  { id: "h1b", label: "H-1B" },
  { id: "eb", label: "Employment Based" },
  { id: "pwd", label: "PWD Timelines" },
  { id: "perm", label: "PERM Tracker" },
];

function isTabId(v: string | null): v is ImmigrationTabId {
  return v != null && (TAB_IDS as readonly string[]).includes(v);
}

/** Legacy ?tab=wage opens PWD (prevailing wage links live there). */
function tabFromSearchParams(tab: string | null): ImmigrationTabId | null {
  if (tab === "wage") return "pwd";
  return isTabId(tab) ? tab : null;
}

export default function ImmigrationInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: ImmigrationTabId = useMemo(() => tabFromSearchParams(tabParam) ?? "h1b", [tabParam]);

  useEffect(() => {
    if (tabParam === "wage") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "pwd");
      router.replace(`/immigration?${params.toString()}`, { scroll: false });
    }
  }, [tabParam, router, searchParams]);

  const setTab = useCallback(
    (id: ImmigrationTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`/immigration?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const panelId = (id: ImmigrationTabId) => `immigration-panel-${id}`;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 border-b border-white/10 bg-[#061528]/95 px-1 pb-0 backdrop-blur-sm">
        <div
          className="flex gap-1 overflow-x-auto pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Immigration topics"
        >
          {TABS.map((t) => {
            const selected = activeTab === t.id;
            const idx = TABS.findIndex((x) => x.id === t.id);
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`immigration-tab-${t.id}`}
                aria-selected={selected}
                aria-controls={panelId(t.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    const next = TABS[(idx + 1) % TABS.length];
                    setTab(next.id);
                    requestAnimationFrame(() =>
                      document.getElementById(`immigration-tab-${next.id}`)?.focus(),
                    );
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const next = TABS[(idx - 1 + TABS.length) % TABS.length];
                    setTab(next.id);
                    requestAnimationFrame(() =>
                      document.getElementById(`immigration-tab-${next.id}`)?.focus(),
                    );
                  }
                }}
                className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061528] ${
                  selected
                    ? "bg-teal-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[320px]">
        {activeTab === "h1b" ? (
          <div id={panelId("h1b")} role="tabpanel" aria-labelledby="immigration-tab-h1b">
            <H1BTab />
          </div>
        ) : null}
        {activeTab === "eb" ? (
          <div id={panelId("eb")} role="tabpanel" aria-labelledby="immigration-tab-eb">
            <EmploymentBasedTab />
          </div>
        ) : null}
        {activeTab === "pwd" ? (
          <div id={panelId("pwd")} role="tabpanel" aria-labelledby="immigration-tab-pwd">
            <PWDTab />
          </div>
        ) : null}
        {activeTab === "perm" ? (
          <div id={panelId("perm")} role="tabpanel" aria-labelledby="immigration-tab-perm">
            <PERMTab />
          </div>
        ) : null}
      </div>
    </div>
  );
}
