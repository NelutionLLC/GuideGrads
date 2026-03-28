export default function TopNav() {
    return (
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="text-2xl font-semibold tracking-tight">
          <span className="text-white">Guide</span>
          <span className="text-teal-400">Grads</span>
        </div>
  
        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <button className="hover:text-white">Builders</button>
          <button className="hover:text-white">Dashboard</button>
          <button className="hover:text-white">Resumes</button>
          <button className="hover:text-white">Cover Letters</button>
          <button className="hover:text-white">Jobs</button>
          <button className="hover:text-white">Immigration</button>
        </nav>
  
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10">
            Login
          </button>
          <button className="rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400">
            Free Account
          </button>
        </div>
      </header>
    );
  }
  