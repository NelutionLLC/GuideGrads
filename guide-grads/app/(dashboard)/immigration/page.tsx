import ImmigrationInfoPage from "@/components/immigration/ImmigrationInfoPage";
import { Suspense } from "react";

function ImmigrationFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-16 rounded-2xl bg-white/5" />
      <div className="h-12 rounded-xl bg-white/5" />
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>
  );
}

export default function ImmigrationPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Immigration Information</h1>
      </div>

      <Suspense fallback={<ImmigrationFallback />}>
        <ImmigrationInfoPage />
      </Suspense>
    </div>
  );
}
