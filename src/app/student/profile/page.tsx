import { notFound } from "next/navigation";
import { getStudentProfileBundle } from "@/app/actions/profile";
import IdentityCard from "@/components/profile/IdentityCard";
import RecentActivityList from "@/components/profile/RecentActivityList";
import StatsStrip from "@/components/profile/StatsStrip";

export default async function StudentProfilePage() {
  const bundle = await getStudentProfileBundle();
  if (!bundle) notFound();

  return (
    <div className="space-y-6">
      <IdentityCard
        name={bundle.identity.name}
        email={bundle.identity.email}
        role={bundle.identity.role}
        memberSince={bundle.identity.memberSince}
      />
      <StatsStrip
        items={[
          {
            label: "Assignments submitted",
            value: bundle.stats.assignmentsSubmitted,
          },
          {
            label: "Gym sessions completed",
            value: bundle.stats.gymSessionsCompleted,
          },
        ]}
      />
      <RecentActivityList items={bundle.recentActivity} />
    </div>
  );
}
