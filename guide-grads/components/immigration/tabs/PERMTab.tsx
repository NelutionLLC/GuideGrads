import {
  auditInfo,
  permPageAsOf,
  permPrimarySources,
  permProcessingRows,
  permStages,
  permToI140Phases,
  permWhatIs,
} from "@/lib/immigration/content/perm";
import PermTimelineDashboard from "../PermTimelineDashboard";
import DataTable from "../ui/DataTable";
import SectionCard from "../ui/SectionCard";
import SourcesFooter from "../ui/SourcesFooter";

export default function PERMTab() {
  return (
    <div className="space-y-8">
      <PermTimelineDashboard />

      <SectionCard title={permWhatIs.title}>
        <ul className="list-inside list-disc space-y-2">
          {permWhatIs.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="DOL processing (analyst vs audit)">
        <DataTable
          columns={[
            { key: "category", header: "Track" },
            { key: "rangeOrNote", header: "Notes" },
            { key: "source", header: "Source" },
          ]}
          rows={permProcessingRows.map((r) => ({
            category: r.category,
            rangeOrNote: r.rangeOrNote,
            source: (
              <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                {r.source.label}
              </a>
            ),
          }))}
        />
      </SectionCard>

      <SectionCard title="Step-by-step stages">
        <ol className="list-inside list-decimal space-y-2">
          {permStages.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard title={auditInfo.title}>
        <ul className="list-inside list-disc space-y-2">
          {auditInfo.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Check case status (FLAG)">
        <p className="text-white/80">
          Employers and authorized representatives use the Department of Labor FLAG system for PERM filings and
          status.
        </p>
        <a
          href="https://flag.dol.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          Open DOL FLAG →
        </a>
      </SectionCard>

      <SectionCard title="Timeline: PERM toward I-140 / green card">
        <DataTable
          columns={[
            { key: "phase", header: "Phase" },
            { key: "note", header: "Notes" },
          ]}
          rows={permToI140Phases}
        />
        <p className="mt-2 text-xs text-white/50">
          Timelines are illustrative; USCIS and DOL publish separate processing statistics.
        </p>
      </SectionCard>

      <SourcesFooter asOf={permPageAsOf} sources={permPrimarySources} />
    </div>
  );
}
