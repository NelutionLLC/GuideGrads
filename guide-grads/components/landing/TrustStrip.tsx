export default function TrustStrip() {
    return (
      <section className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-medium text-slate-600">
            Our users have landed interviews at:
          </div>
          <div className="flex flex-wrap items-center gap-8 text-slate-500">
            <div className="font-semibold">Google</div>
            <div className="font-semibold">Amazon</div>
            <div className="font-semibold">Meta</div>
            <div className="font-semibold">Boeing</div>
            <div className="font-semibold">Verizon</div>
          </div>
        </div>
      </section>
    );
  }
  