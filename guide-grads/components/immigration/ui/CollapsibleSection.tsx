export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="rounded-2xl border border-white/10 bg-white/[0.03] open:bg-white/[0.05]"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          {title}
          <span className="text-white/40" aria-hidden>
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-white/10 px-5 pb-5 pt-2 text-sm text-white/75">{children}</div>
    </details>
  );
}
