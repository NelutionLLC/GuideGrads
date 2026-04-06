import {
  h1bCapFacts,
  h1bCapLottery,
  h1bDocuments,
  h1bEligibility,
  h1bExtensions,
  h1bFilingTimelineSteps,
  h1bOverview,
  h1bPageAsOf,
  h1bPrimarySources,
  h1bToGc,
  h1bTransfer,
} from "@/lib/immigration/content/h1b";
import SectionCard from "../ui/SectionCard";
import SourcesFooter from "../ui/SourcesFooter";

export default function H1BTab() {
  return (
    <div className="space-y-4">
      <SectionCard title={h1bOverview.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bOverview.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Cap numbers (statutory structure)">
        <p className="text-white/80">
          Regular cap: <strong>{h1bCapFacts.regularCap.toLocaleString()}</strong> — U.S. master’s exemption:{" "}
          <strong>{h1bCapFacts.usMasterExemption.toLocaleString()}</strong> (when applicable per statute and
          regulations).
        </p>
        <p className="mt-2 text-sm text-white/55">
          See USCIS for the current fiscal year process and any exemptions (e.g., cap-exempt employers).
        </p>
      </SectionCard>

      <SectionCard title={h1bEligibility.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bEligibility.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <a
          href={h1bEligibility.learnMore.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          {h1bEligibility.learnMore.label} →
        </a>
      </SectionCard>

      <SectionCard title={h1bCapLottery.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bCapLottery.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Filing timeline (typical cap season)">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
          {h1bFilingTimelineSteps.map((s, i) => (
            <div key={s.key} className="flex min-w-0 flex-1 flex-col sm:min-w-[140px]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/25 text-sm font-semibold text-teal-300">
                  {i + 1}
                </span>
                <span className="font-medium text-white">{s.label}</span>
              </div>
              <p className="mt-2 pl-10 text-sm text-white/65">{s.note}</p>
              {i < h1bFilingTimelineSteps.length - 1 ? (
                <div className="my-2 hidden h-px flex-1 bg-white/10 sm:ml-4 sm:mt-8 sm:block" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={h1bDocuments.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bDocuments.items.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <a
          href={h1bDocuments.lcaLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-teal-400 hover:text-teal-300"
        >
          {h1bDocuments.lcaLink.label} →
        </a>
      </SectionCard>

      <SectionCard title={h1bTransfer.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bTransfer.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={h1bExtensions.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bExtensions.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={h1bToGc.title}>
        <ul className="list-inside list-disc space-y-2">
          {h1bToGc.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-white/55">
          Open the <strong className="text-white/70">Employment Based</strong> tab for priority dates and AOS vs
          consular processing.
        </p>
      </SectionCard>

      <SourcesFooter asOf={h1bPageAsOf} sources={h1bPrimarySources} />
    </div>
  );
}
