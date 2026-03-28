// import type { ResumeData } from "../ResumeBuilder";

// export default function DefaultATSPreview({ data }: { data: ResumeData }) {
//   const contact = [
//     data.location,
//     data.phone,
//     data.email,
//   ].filter(Boolean);

//   const skills = data.skills
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);

//   return (
//     <div className="bg-white text-slate-900">
//       <div className="mx-auto max-w-[820px] px-8 py-6">
//         {/* Header */}
//         <header className="border-b border-slate-200 pb-3">
//           <div className="text-2xl font-bold">
//             {data.name || "Full Name"}
//           </div>

//           <div className="mt-1 text-sm text-slate-700">
//             {contact.length > 0
//               ? contact.join(" • ")
//               : "City, State • phone • email"}
//           </div>

//           {data.headline ? (
//             <div className="mt-2 text-sm font-medium text-slate-800">
//               {data.headline}
//             </div>
//           ) : null}
//         </header>

//         {/* Summary */}
//         {data.summary ? (
//           <section className="mt-4">
//             <SectionTitle>Summary</SectionTitle>
//             <p className="mt-1 text-sm leading-relaxed text-slate-800">
//               {data.summary}
//             </p>
//           </section>
//         ) : null}

//         {/* Skills */}
//         {skills.length > 0 ? (
//           <section className="mt-4">
//             <SectionTitle>Skills</SectionTitle>
//             <p className="mt-1 text-sm text-slate-800">
//               {skills.join(" • ")}
//             </p>
//           </section>
//         ) : null}

//         {/* Experience */}
//         <section className="mt-4">
//           <SectionTitle>Experience</SectionTitle>

//           <div className="mt-2 space-y-4">
//             {data.experience.map((exp) => (
//               <div key={exp.id}>
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="font-semibold text-sm">
//                     {(exp.title || "Job Title")}
//                     {exp.company ? ` — ${exp.company}` : ""}
//                   </div>
//                   <div className="shrink-0 text-xs text-slate-600">
//                     {[exp.start, exp.end].filter(Boolean).join(" – ") || "Dates"}
//                   </div>
//                 </div>

//                 {exp.location ? (
//                   <div className="text-xs text-slate-600">
//                     {exp.location}
//                   </div>
//                 ) : null}

//                 <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-800">
//                   {exp.bullets
//                     .map((b) => b.trim())
//                     .filter(Boolean)
//                     .slice(0, 6)
//                     .map((b, i) => (
//                       <li key={i}>{b}</li>
//                     ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Education */}
//         <section className="mt-4">
//           <SectionTitle>Education</SectionTitle>

//           <div className="mt-2 space-y-2">
//             {data.education.map((edu) => (
//               <div
//                 key={edu.id}
//                 className="flex items-start justify-between gap-4"
//               >
//                 <div className="text-sm font-semibold">
//                   {edu.school || "University Name"}
//                   <span className="ml-1 font-normal text-slate-700">
//                     {edu.degree || ""}
//                     {edu.field ? `, ${edu.field}` : ""}
//                   </span>
//                 </div>
//                 <div className="shrink-0 text-xs text-slate-600">
//                   {[edu.start, edu.end].filter(Boolean).join(" – ") || "Dates"}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// function SectionTitle({ children }: { children: string }) {
//   return (
//     <div className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
//       {children}
//     </div>
//   );
// }
