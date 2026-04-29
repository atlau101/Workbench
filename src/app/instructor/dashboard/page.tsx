import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function InstructorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-on-background)]">
          Instructor Overview
        </h2>
        <p className="mt-1 text-[var(--color-on-surface-variant)]">
          Welcome back, {user.email}
        </p>
      </div>

      <Card className="p-6">
        <p className="font-semibold">Phase 2 content coming soon</p>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          This dashboard shell now matches the Stitch navigation structure.
        </p>
      </Card>
    </div>
  );
}
