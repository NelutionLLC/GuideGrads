// import type { ResumeData } from "../ResumeBuilder";

// function esc(s: string) {
//   // minimal LaTeX escaping
//   return (s ?? "")
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_")
//     .replace(/{/g, "\\{")
//     .replace(/}/g, "\\}")
//     .replace(/\^/g, "\\^{}")
//     .replace(/~/g, "\\~{}");
// }

// function clean(s?: string) {
//   return (s ?? "").trim();
// }

// function lines(items: string[]) {
//   return items.map((x) => x.trim()).filter(Boolean);
// }

// /**
//  * Generates Overleaf LaTeX code using YOUR template look/commands.
//  * We keep the macro definitions (resumeSubheading, resumeItem, etc.)
//  * and inject user content into the document body.
//  */
// export function generateLatex(data: ResumeData) {
//   const name = clean(data.name);
//   const location = clean(data.location);
//   const phone = clean(data.phone);
//   const email = clean(data.email);
//   const linkedin = clean(data.linkedin);
//   const website = clean(data.website);

//   const education = (data.education ?? []).filter((e) =>
//     [e.school, e.degree, e.field, e.start, e.end, e.city].some((x) => clean(x))
//   );

//   const experience = (data.experience ?? []).filter((e) =>
//     [e.company, e.title, e.location, e.start, e.end].some((x) => clean(x)) ||
//     (e.bullets ?? []).some((b) => clean(b))
//   );

//   const projects = (data.projects ?? []).filter((p) =>
//     [p.name, p.stack].some((x) => clean(x)) || (p.bullets ?? []).some((b) => clean(b))
//   );

//   const achievements = lines(data.achievements ?? []);

//   const skills = data.skillGroups ?? {
//     languages: [],
//     web: [],
//     tools: [],
//     cloud: [],
//   };

//   const hasHeader = !!(name || location || phone || email || linkedin || website);

//   // --- Build Header block ---
//   const header = hasHeader
//     ? `
// \\begin{center}
//     {\\Huge \\scshape ${esc(name || "")}} \\\\ \\vspace{1pt}
//     ${esc(location || "")} \\\\ \\vspace{1pt}
//     \\small \\raisebox{-0.1\\height}\\faPhone\\ {${esc(phone || "")}}
//     ${email ? `~ \\href{mailto:${esc(email)}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${esc(email)}}}` : ""}
//     ${linkedin ? `~ \\href{${esc(linkedin)}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{${esc(prettyLink(linkedin))}}}` : ""}
//     ${website ? `~ \\href{${esc(website)}}{\\raisebox{-0.2\\height}\\faGlobe\\ \\underline{${esc(prettyLink(website))}}}` : ""}
//     \\vspace{-8pt}
// \\end{center}
// `
//     : "";

//   // --- Education block ---
//   const eduBlock = education.length
//     ? `
// \\section{EDUCATION}
//   \\resumeSubHeadingListStart
// ${education
//   .map((e) => {
//     const school = esc(clean(e.school));
//     const dates = esc(`${clean(e.start)} – ${clean(e.end)}`.replace(/^ – | – $/g, ""));
//     const degree = esc(clean(e.degree));
//     const city = esc(clean(e.city));
//     const field = esc(clean(e.field));
//     const coursework = esc(clean(e.coursework ?? ""));
//     return `
//     \\resumeSubheading
//       {${school}}{${dates}}
//       {${degree}${field ? ` in ${field}` : ""}}{${city}}
// ${coursework ? `\n\n      Coursework: ${coursework}` : ""}
// `;
//   })
//   .join("\n")}
//   \\resumeSubHeadingListEnd
//   \\vspace{-13pt}
// `
//     : "";

//   // --- Experience block ---
//   const expBlock = experience.length
//     ? `
// \\section{WORK EXPERIENCE}
//   \\resumeSubHeadingListStart
// ${experience
//   .map((e) => {
//     const title = esc(clean(e.title));
//     const dates = esc(`${clean(e.start)} -- ${clean(e.end)}`.replace(/^ -- | -- $/g, ""));
//     const company = esc(clean(e.company));
//     const loc = esc(clean(e.location));
//     const bullets = lines(e.bullets ?? []);
//     return `
//     \\resumeSubheading
//       {${title}}{${dates}}
//       {${company}}{${loc}}
//       ${bullets.length ? `\\resumeItemListStart
// ${bullets.map((b) => `        \\resumeItem{${esc(b)}}`).join("\n")}
//       \\resumeItemListEnd` : ""}
// `;
//   })
//   .join("\n")}
//   \\resumeSubHeadingListEnd
// \\vspace{-10pt}
// `
//     : "";

//   // --- Projects block ---
//   const projectsBlock = projects.length
//     ? `
// \\section{PROJECTS}
// \\vspace{-5pt}
//     \\resumeSubHeadingListStart
// ${projects
//   .map((p) => {
//     const title = esc(clean(p.name));
//     const stack = esc(clean(p.stack));
//     const bullets = lines(p.bullets ?? []);
//     return `
//         \\resumeProjectHeading
//           {\\textbf{${title}}  $|$ \\emph{${stack}}}{}
//           ${bullets.length ? `\\resumeItemListStart
// ${bullets.map((b) => `            \\resumeItem{${esc(b)}}`).join("\n")}
//           \\resumeItemListEnd` : ""}
//           \\vspace{-13pt}
// `;
//   })
//   .join("\n")}
//     \\resumeSubHeadingListEnd
// \\vspace{5pt}
// `
//     : "";

//   // --- Skills block (grouped like your LaTeX) ---
//   const skillsLines = [
//     skills.languages?.length ? `\\textbf{Languages}{: ${esc(skills.languages.join(", "))}} \\\\` : "",
//     skills.web?.length ? `\\textbf{Web and App Development}{: ${esc(skills.web.join(", "))}} \\\\` : "",
//     skills.tools?.length ? `\\textbf{Tools/Frameworks}{: ${esc(skills.tools.join(", "))}} \\\\` : "",
//     skills.cloud?.length ? `\\textbf{Cloud Technologies}{: ${esc(skills.cloud.join(", "))}} \\\\` : "",
//   ].filter(Boolean);

//   const skillsBlock = skillsLines.length
//     ? `
// \\section{TECHNICAL SKILLS}
//  \\begin{itemize}[leftmargin=0.15in, label={}]
//     \\small{\\item{
// ${skillsLines.map((l) => `     ${l}`).join("\n")}
//     }}
//  \\end{itemize}
// \\vspace{-13pt}
// `
//     : "";

//   // --- Achievements block ---
//   const achievementsBlock = achievements.length
//     ? `
// \\section{ACHIEVEMENTS}
// \\vspace{-5pt}
//     \\resumeSubHeadingListStart
//         \\resumeItemListStart
// ${achievements.map((a) => `            \\resumeItem{${esc(a)}}`).join("\n")}
//         \\resumeItemListEnd
//     \\resumeSubHeadingListEnd
//  \\vspace{-11pt}
// `
//     : "";

//   // NOTE: We include your macro/template header once, then inject blocks.
//   return `%-------------------------
// % GuideGrads Resume (generated)
// %------------------------

// \\documentclass[letterpaper,8.5pt]{article}

// \\usepackage{latexsym}
// \\usepackage[empty]{fullpage}
// \\usepackage{titlesec}
// \\usepackage{marvosym}
// \\usepackage[usenames,dvipsnames]{color}
// \\usepackage{verbatim}
// \\usepackage{enumitem}
// \\usepackage[hidelinks]{hyperref}
// \\usepackage[english]{babel}
// \\usepackage{tabularx}
// \\usepackage{fontawesome5}
// \\usepackage{multicol}
// \\usepackage{graphicx}
// \\setlength{\\multicolsep}{-3.0pt}
// \\setlength{\\columnsep}{-1pt}
// \\input{glyphtounicode}
// \\RequirePackage{fontawesome}

// % Adjust margins
// \\addtolength{\\oddsidemargin}{-0.6in}
// \\addtolength{\\evensidemargin}{-0.5in}
// \\addtolength{\\textwidth}{1.19in}
// \\addtolength{\\topmargin}{-.7in}
// \\addtolength{\\textheight}{1.4in}

// \\urlstyle{same}
// \\raggedbottom
// \\raggedright
// \\setlength{\\tabcolsep}{0in}

// % Sections formatting
// \\titleformat{\\section}{
//   \\vspace{-5pt}\\scshape\\raggedright\\large\\bfseries
// }{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

// % ATS parsable
// \\pdfgentounicode=1

// % Custom commands
// \\newcommand{\\resumeItem}[1]{
//   \\item\\small{
//     {#1 \\vspace{-2pt}}
//   }
// }

// \\newcommand{\\resumeSubheading}[4]{
//   \\vspace{-2pt}\\item
//     \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
//       \\textbf{#1} & \\textbf{\\small #2} \\\\
//       \\textit{\\small#3} & \\textit{\\small #4} \\\\
//     \\end{tabular*}\\vspace{-7pt}
// }

// \\newcommand{\\resumeProjectHeading}[2]{
//     \\item
//     \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
//       \\small#1 & \\textbf{\\small #2}\\\\
//     \\end{tabular*}\\vspace{-7pt}
// }

// \\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

// \\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
// \\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
// \\newcommand{\\resumeItemListStart}{\\begin{itemize}}
// \\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

// \\begin{document}

// ${header}
// ${eduBlock}
// ${expBlock}
// ${projectsBlock}
// ${skillsBlock}
// ${achievementsBlock}

// \\end{document}
// `;
// }

// function prettyLink(url: string) {
//   try {
//     const u = new URL(url);
//     return u.host + u.pathname.replace(/\/$/, "");
//   } catch {
//     return url.replace(/^https?:\/\//, "");
//   }
// }
