"use client";


type ResumeOption = {
  id: string;
  name: string;
};

type Props = {
  resumes: ResumeOption[];
  activeResumeId: string;
  onChangeResume: (id: string) => void;

  onDownload: () => void;
  onCreateNew?: () => void;
  onDuplicate?: () => void;
};

export function EditorHeader({
  resumes,
  activeResumeId,
  onChangeResume,
  onDownload,
  onCreateNew,
  onDuplicate,
}: Props) {
  const active = resumes.find((r) => r.id === activeResumeId);

  return (
    <div className="w-full rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Editor</div>
          <div className="text-xs text-slate-500">Autosaves to this browser</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Resume dropdown */}
        <div className="relative">
          <select
            value={activeResumeId}
            onChange={(e) => onChangeResume(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            ▾
          </span>
        </div>

        {/* Download */}
        <button
          onClick={onDownload}
          className="h-10 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <span>Download</span>
          <span aria-hidden>⬇︎</span>
        </button>

        {/* 3-dot menu (optional) */}
        <div className="relative group">
          <button
            className="h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
            aria-label="More"
            type="button"
          >
            ⋮
          </button>

          {/* simple hover menu (you can switch to click popover later) */}
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <button
              onClick={onCreateNew}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              type="button"
            >
              New resume
            </button>
            <button
              onClick={onDuplicate}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              type="button"
            >
              Duplicate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
