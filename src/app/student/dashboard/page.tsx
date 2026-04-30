import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import Card from "@/components/ui/Card";

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-on-background)]">
          Dashboard
        </h2>
        <p className="mt-1 text-[var(--color-on-surface-variant)]">Welcome back, {user.email}</p>
      </div>
      <Card className="p-6">
        <p className="font-semibold text-[var(--color-on-surface)]">Coming soon</p>
        <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
          Your dashboard will show progress and recent activity.
        </p>
      </Card>
    </div>
  );
}
