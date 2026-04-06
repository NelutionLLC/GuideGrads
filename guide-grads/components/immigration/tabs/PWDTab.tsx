import {
  oesVsCba,
  pwdAffectsLcaPerm,
  pwdPageAsOf,
  pwdPrevailingWageLookup,
  pwdPrimarySources,
  pwdProcessingRows,
  pwdTimelineCategories,
  pwdWhatIs,
  wageLevels,
} from "@/lib/immigration/content/pwd";
import DataTable from "../ui/DataTable";
import SectionCard from "../ui/SectionCard";
import SourcesFooter from "../ui/SourcesFooter";

export default function PWDTab() {
  return (
    <div className="space-y-4">
      <SectionCard title={pwdWhatIs.title}>
        <ul className="list-inside list-disc space-y-2">
          {pwdWhatIs.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="DOL processing (verify current NPC times)">
        <DataTable
          columns={[
            { key: "category", header: "Category" },
            { key: "rangeOrNote", header: "Notes" },
            { key: "source", header: "Source" },
          ]}
          rows={pwdProcessingRows.map((r) => ({
            category: r.category,
            rangeOrNote: r.rangeOrNote,
            source: (
              <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                {r.source.label}
              </a>
            ),
          }))}
        />
        <p className="mt-2 text-xs text-white/50">
          Replace quantitative benchmarks using the DOL National Processing Center published processing times for your
          submission type.
        </p>
      </SectionCard>

      <SectionCard title={wageLevels.title}>
        <ul className="space-y-2">
          {wageLevels.levels.map((l) => (
            <li key={l.level}>
              <strong className="text-white/90">Level {l.level}</strong> — {l.desc}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-white/55">{wageLevels.note}</p>
      </SectionCard>

      <SectionCard title={pwdPrevailingWageLookup.title}>
        <p className="text-sm text-white/75">{pwdPrevailingWageLookup.intro}</p>
        <ul className="mt-4 space-y-2">
          {pwdPrevailingWageLookup.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-400 hover:text-teal-300"
              >
                {link.label} →
              </a>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={oesVsCba.title}>
        <DataTable
          columns={[
            { key: "source", header: "Wage source" },
            { key: "note", header: "Summary" },
          ]}
          rows={oesVsCba.rows}
        />
      </SectionCard>

      <SectionCard title={pwdAffectsLcaPerm.title}>
        <ul className="list-inside list-disc space-y-2">
          {pwdAffectsLcaPerm.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Estimated timelines by stage (illustrative)">
        <DataTable
          columns={[
            { key: "stage", header: "Stage" },
            { key: "typicalRange", header: "Typical dependency" },
          ]}
          rows={pwdTimelineCategories}
        />
      </SectionCard>

      <SourcesFooter asOf={pwdPageAsOf} sources={pwdPrimarySources} />
    </div>
  );
}
