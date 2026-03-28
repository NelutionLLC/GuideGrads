import ApplicationsBoard from "../../../components/applications/ApplicationsBoard";

export default function ApplicationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="mt-1 text-white/70">
          Track every job you apply to — follow-ups, interviews, offers.
        </p>
      </div>

      <ApplicationsBoard />
    </div>
  );
}
