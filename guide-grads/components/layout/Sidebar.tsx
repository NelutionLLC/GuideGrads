const items = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Resume Builder", href: "/resume" },
    { label: "Cover Letters", href: "/cover-letters" },
    { label: "Jobs", href: "/jobs" },
    { label: "Applications", href: "/applications" },
    { label: "Immigration", href: "/immigration" },
    { label: "Q&A", href: "/qa" },
  ];
  
  export default function Sidebar() {
    return (
      <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
        <div className="px-2 pb-4 text-xl font-semibold tracking-tight">
          <span className="text-white">Guide</span>
          <span className="text-teal-300">Grads</span>
        </div>
  
        <nav className="space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
  
        <div className="mt-6 border-t border-white/10 pt-4">
          <a
            href="/settings"
            className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
          >
            Settings
          </a>
        </div>
      </div>
    );
  }
  