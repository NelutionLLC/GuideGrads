export default function TopBar() {
    return (
      <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 backdrop-blur">
        <div className="text-sm text-white/70">
          Welcome back 👋
        </div>
  
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
            Notifications
          </button>
          <button className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400">
            Upgrade
          </button>
        </div>
      </div>
    );
  }
  