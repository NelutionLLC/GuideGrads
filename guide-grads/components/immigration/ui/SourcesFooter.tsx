import type { DatedSource } from "@/lib/immigration/types";

export default function SourcesFooter({
  title = "Sources & last updated",
  asOf,
  sources,
}: {
  title?: string;
  asOf: string;
  sources: DatedSource[];
}) {
  return (
    <details className="rounded-xl border border-white/10 bg-black/20 text-sm text-white/70">
      <summary className="cursor-pointer select-none px-4 py-3 font-medium text-white/85 hover:bg-white/5">
        {title} — as of {asOf}
      </summary>
      <ul className="space-y-2 border-t border-white/10 px-4 py-3">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300"
            >
              {s.label}
            </a>
            <span className="text-white/45"> — verified {s.lastVerified}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
