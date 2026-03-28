export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-white/70">
            Your next steps across jobs, applications, and visa timelines.
          </p>
        </div>
  
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="text-sm text-white/70">Applications</div>
            <div className="mt-2 text-3xl font-semibold">12</div>
            <div className="mt-1 text-sm text-white/50">+3 this week</div>
          </div>
  
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="text-sm text-white/70">Interviews</div>
            <div className="mt-2 text-3xl font-semibold">2</div>
            <div className="mt-1 text-sm text-white/50">1 upcoming</div>
          </div>
  
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="text-sm text-white/70">Visa reminders</div>
            <div className="mt-2 text-3xl font-semibold">1</div>
            <div className="mt-1 text-sm text-white/50">OPT check-in</div>
          </div>
        </div>
  
        {/* Two-column */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Next actions */}
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Next actions</h2>
              <button className="rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">
                Add
              </button>
            </div>
  
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2">
                <span className="text-white/85">Follow up: Amazon — SDE Intern</span>
                <span className="text-white/50">Today</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2">
                <span className="text-white/85">Update resume for Data Analyst roles</span>
                <span className="text-white/50">2 days</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-black/10 px-3 py-2">
                <span className="text-white/85">OPT: STEM extension checklist</span>
                <span className="text-white/50">1 week</span>
              </li>
            </ul>
          </div>
  
          {/* Saved jobs */}
          <div className="rounded-2xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved jobs</h2>
              <a
                href="/jobs"
                className="rounded-full bg-teal-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-400"
              >
                Browse
              </a>
            </div>
  
            <div className="space-y-3 text-sm">
              {[
                { company: "Google", role: "Software Engineer", tag: "H1B-friendly" },
                { company: "Deloitte", role: "Data Analyst", tag: "OPT-friendly" },
                { company: "Stripe", role: "Backend Engineer", tag: "Unknown" },
              ].map((j) => (
                <div
                  key={j.company + j.role}
                  className="rounded-xl bg-black/10 px-3 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{j.role}</div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                      {j.tag}
                    </span>
                  </div>
                  <div className="mt-1 text-white/70">{j.company}</div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">
                      Apply
                    </button>
                    <button className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15">
                      Add to tracker
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  