import Link from "next/link";

import HeroVisual from "../components/landing/HeroVisual";
import TopNav from "../components/layout/TopNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#071c33] text-white">
      <TopNav />

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-10 md:grid-cols-2 md:pt-14">
        {/* Left visual */}
        <HeroVisual />

        {/* Right content */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            GuideGrads <br />
            <span className="text-teal-300">Career</span> Suite
            <br />
            <span className="text-white/90">
              Resume + Cover Letter + Jobs + Application Tracker
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Build ATS-ready resumes, generate tailored cover letters, find OPT/H1B-friendly roles,
            track applications, and get latest immigration timelines — all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white/90">
              Import existing resume
            </button> */}
            <Link
              href="/resume"
              className="inline-flex rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-400"
            >
              Build my resume today
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-teal-300">✓</span> OPT / CPT / H1B focused
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-300">✓</span> Track every application
            </div>
            <div className="flex items-center gap-2">
              <span className="text-teal-300">✓</span> Clean PDF exports
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
            <span className="rounded bg-white/10 px-2 py-1">EXCELLENT</span>
            <span>★ ★ ★ ★ ★</span>
            <span className="text-white/50">Trusted by grads worldwide</span>
          </div>
        </div>
      </section>

      {/* <WaveDivider /> */}
      {/* <TrustStrip /> */}
    </main>
  );
}
