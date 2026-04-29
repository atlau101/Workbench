import { notFound } from "next/navigation";
import { getInstructorProfileBundle } from "@/app/actions/profile";
import IdentityCard from "@/components/profile/IdentityCard";
import StatsStrip from "@/components/profile/StatsStrip";

export default async function InstructorProfilePage() {
  const bundle = await getInstructorProfileBundle();
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
            label: "Assignments authored",
            value: bundle.stats.assignmentsAuthored,
          },
          {
            label: "Submitted attempts",
            value: bundle.stats.submittedAttempts,
          },
        ]}
      />
    </div>
  );
}
