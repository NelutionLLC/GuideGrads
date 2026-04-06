import type { ReactNode } from "react";

export default function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; header: string }[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[320px] text-left text-sm text-white/80">
        <thead>
          <tr className="border-b border-white/10 bg-black/20">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2 font-semibold text-white/90">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 odd:bg-white/[0.02]">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  {row[c.key] != null && row[c.key] !== "" ? row[c.key] : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
