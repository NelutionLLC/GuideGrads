import {
  aosVsCp,
  eb1,
  eb2,
  eb3,
  ebPageAsOf,
  ebPrimarySources,
  visaBulletinExplained,
  visaBulletinSnapshotNote,
} from "@/lib/immigration/content/eb";
import CollapsibleSection from "../ui/CollapsibleSection";
import DataTable from "../ui/DataTable";
import SectionCard from "../ui/SectionCard";
import SourcesFooter from "../ui/SourcesFooter";

export default function EmploymentBasedTab() {
  return (
    <div className="space-y-4">
      <CollapsibleSection title={`${eb1.title}`} defaultOpen>
        <div className="space-y-4">
          {eb1.sections.map((sec) => (
            <div key={sec.subtitle}>
              <h3 className="font-semibold text-white/90">{sec.subtitle}</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {sec.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm text-white/55">
            EB-1A: no employer offer required. EB-1B: employer petition. EB-1C: qualifying multinational
            relationship — verify category rules on USCIS.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={eb2.title}>
        <ul className="list-inside list-disc space-y-2">
          {eb2.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection title={eb3.title}>
        <ul className="list-inside list-disc space-y-2">
          {eb3.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </CollapsibleSection>

      <SectionCard title={visaBulletinExplained.title}>
        <ul className="list-inside list-disc space-y-2">
          {visaBulletinExplained.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-amber-200/90">{visaBulletinSnapshotNote}</p>
        <a
          href={visaBulletinExplained.bulletinLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          {visaBulletinExplained.bulletinLink.label} →
        </a>
      </SectionCard>

      <SectionCard title={`${aosVsCp.title}`}>
        <DataTable
          columns={[
            { key: "aspect", header: "Topic" },
            { key: "aos", header: "Adjustment of status" },
            { key: "cp", header: "Consular processing" },
          ]}
          rows={aosVsCp.rows}
        />
        <a
          href={aosVsCp.aosSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          {aosVsCp.aosSource.label} →
        </a>
      </SectionCard>

      <SourcesFooter asOf={ebPageAsOf} sources={ebPrimarySources} />
    </div>
  );
}
