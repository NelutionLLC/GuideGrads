export default function HeroVisual() {
    return (
      <div className="relative">
        <div className="relative h-[420px] w-full">
          <div className="absolute left-0 top-10 w-[72%] rounded-xl bg-white p-4 text-slate-800 shadow-2xl">
            <div className="h-3 w-32 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full rounded bg-slate-100" />
              <div className="h-2 w-[85%] rounded bg-slate-100" />
              <div className="h-2 w-[92%] rounded bg-slate-100" />
            </div>
            <div className="mt-6 h-44 rounded bg-slate-50" />
          </div>
  
          <div className="absolute right-0 top-0 w-[46%] rounded-xl bg-[#6d3df4] p-4 shadow-2xl">
            <div className="h-3 w-24 rounded bg-white/40" />
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full rounded bg-white/20" />
              <div className="h-2 w-[80%] rounded bg-white/20" />
              <div className="h-2 w-[90%] rounded bg-white/20" />
            </div>
            <div className="mt-6 h-28 rounded bg-white/10" />
          </div>
  
          <div className="absolute bottom-0 left-20 w-[62%] rounded-xl bg-white p-3 text-slate-800 shadow-2xl">
            <div className="mb-3 text-xs font-medium text-slate-500">Templates</div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  