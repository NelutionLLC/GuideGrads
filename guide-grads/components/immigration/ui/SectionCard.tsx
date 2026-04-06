export default function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-white/5 p-5 ${className}`}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-3 text-sm text-white/75">{children}</div>
    </section>
  );
}
