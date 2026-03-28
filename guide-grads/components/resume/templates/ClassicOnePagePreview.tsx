// import type { ResumeData } from "../ResumeBuilder";

// export default function ClassicOnePagePreview({ data }: { data: ResumeData }) {
//   const name = data.name.trim();
//   const headline = data.headline.trim();
//   const summary = data.summary.trim();

//   const contactParts = [data.location, data.phone, data.email]
//     .map((v) => (v ?? "").trim())
//     .filter(Boolean);

//   const skills = (data.skills ?? "")
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);

//   const hasHeader = Boolean(name || headline || contactParts.length);
//   const hasEducation = (data.education ?? []).length > 0;
//   const hasExperience = (data.experience ?? []).length > 0;
//   const hasSkills = skills.length > 0;
//   const hasSummary = Boolean(summary);

//   // If everything is empty, show nothing (true empty paper)
//   const hasAnything = hasHeader || hasEducation || hasExperience || hasSkills || hasSummary;
//   if (!hasAnything) {
//     return (
//       <div className="w-full bg-white">
//         <div className="mx-auto max-w-[820px] px-10 py-10" />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-white text-slate-900">
//       <div className="mx-auto w-full max-w-[820px] px-10 py-8">
//         {/* Header */}
//         {hasHeader ? (
//           <header className="space-y-1">
//             {name ? (
//               <h1 className="text-3xl font-bold leading-none tracking-tight">{name}</h1>
//             ) : null}

//             {contactParts.length ? (
//               <div className="flex flex-wrap gap-x-2 text-sm text-slate-700">
//                 {contactParts.map((c, i) => (
//                   <span key={i} className="inline-flex items-center">
//                     {c}
//                     {i !== contactParts.length - 1 ? (
//                       <span className="mx-2 text-slate-300">•</span>
//                     ) : null}
//                   </span>
//                 ))}
//               </div>
//             ) : null}

//             {headline ? (
//               <div className="text-sm font-medium text-slate-800">{headline}</div>
//             ) : null}
//           </header>
//         ) : null}

//         <div className={`${hasHeader ? "mt-6" : ""} space-y-6`}>
//           {/* Summary */}
//           {hasSummary ? (
//             <section>
//               <SectionTitle>SUMMARY</SectionTitle>
//               <p className="mt-2 text-sm leading-relaxed text-slate-800">{summary}</p>
//             </section>
//           ) : null}

//           {/* Education */}
//           {hasEducation ? (
//             <section>
//               <SectionTitle>EDUCATION</SectionTitle>
//               <div className="mt-2 space-y-3">
//                 {data.education.map((edu) => {
//                   const school = (edu.school ?? "").trim();
//                   const degree = (edu.degree ?? "").trim();
//                   const field = (edu.field ?? "").trim();
//                   const dates = formatDates(edu.start, edu.end);

//                   const leftTop = school;
//                   const leftBottom = [degree, field ? `in ${field}` : ""].filter(Boolean).join(" ");

//                   // Skip rendering a row if it's completely empty
//                   if (!leftTop && !leftBottom && !dates) return null;

//                   return (
//                     <div key={edu.id}>
//                       {leftTop || dates ? (
//                         <RowLeftRight left={leftTop} right={dates} strongLeft />
//                       ) : null}
//                       {leftBottom ? (
//                         <div className="text-sm text-slate-800">{leftBottom}</div>
//                       ) : null}
//                     </div>
//                   );
//                 })}
//               </div>
//             </section>
//           ) : null}

//           {/* Experience */}
//           {hasExperience ? (
//             <section>
//               <SectionTitle>WORK EXPERIENCE</SectionTitle>

//               <div className="mt-2 space-y-4">
//                 {data.experience.map((exp) => {
//                   const title = (exp.title ?? "").trim();
//                   const company = (exp.company ?? "").trim();
//                   const location = (exp.location ?? "").trim();
//                   const dates = formatDates(exp.start, exp.end);
//                   const bullets = (exp.bullets ?? []).map((b) => b.trim()).filter(Boolean);

//                   // Skip if everything empty
//                   if (!title && !company && !location && !dates && bullets.length === 0) return null;

//                   return (
//                     <div key={exp.id}>
//                       {(title || dates) ? (
//                         <RowLeftRight left={title} right={dates} strongLeft />
//                       ) : null}

//                       {(company || location) ? (
//                         <RowLeftRight left={company} right={location} secondary />
//                       ) : null}

//                       {bullets.length ? (
//                         <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
//                           {bullets.slice(0, 10).map((b, i) => (
//                             <li key={i}>{b}</li>
//                           ))}
//                         </ul>
//                       ) : null}
//                     </div>
//                   );
//                 })}
//               </div>
//             </section>
//           ) : null}

//           {/* Skills */}
//           {hasSkills ? (
//             <section>
//               <SectionTitle>TECHNICAL SKILLS</SectionTitle>
//               <div className="mt-2 text-sm text-slate-800 leading-relaxed">
//                 {skills.join(", ")}
//               </div>
//             </section>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }

// function SectionTitle({ children }: { children: string }) {
//   return (
//     <div className="border-b border-slate-300 pb-1 text-sm font-bold tracking-wide">
//       {children}
//     </div>
//   );
// }

// function RowLeftRight({
//   left,
//   right,
//   secondary,
//   strongLeft,
// }: {
//   left: string;
//   right: string;
//   secondary?: boolean;
//   strongLeft?: boolean;
// }) {
//   const L = (left ?? "").trim();
//   const R = (right ?? "").trim();
//   if (!L && !R) return null;

//   return (
//     <div className={`flex items-baseline justify-between gap-4 ${secondary ? "text-slate-700" : ""}`}>
//       <div className={`${strongLeft ? "text-sm font-semibold" : "text-sm"} leading-snug`}>
//         {L}
//       </div>
//       <div className="shrink-0 text-sm">{R}</div>
//     </div>
//   );
// }

// function formatDates(start?: string, end?: string) {
//   const s = (start ?? "").trim();
//   const e = (end ?? "").trim();
//   if (!s && !e) return "";
//   if (s && !e) return `${s} – Present`;
//   if (!s && e) return e;
//   return `${s} – ${e}`;
// }
