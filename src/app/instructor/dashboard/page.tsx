import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { listMyAssignments } from "@/app/actions/assignments";
import MetricCard from "@/components/instructor/MetricCard";
import NeedsAttentionPanel from "@/components/instructor/NeedsAttentionPanel";
import TrendChartStub from "@/components/instructor/TrendChartStub";
import AssignmentsTable from "@/components/instructor/AssignmentsTable";

export default async function InstructorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const assignments = await listMyAssignments();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between pt-4">
        <div>
          <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)] tracking-tight">
            Instructor Overview
          </h2>
          <p className="font-[Plus Jakarta Sans] text-[var(--color-on-surface-variant)] mt-1">
            {user.email}
          </p>
        </div>
        <Link
          href="/instructor/assignments/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase hover:bg-[var(--color-primary-container)] transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Assignment
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Active Assignments"
          value={assignments.length}
          icon="assignment"
          subtext={assignments.length === 0 ? "Create your first assignment" : undefined}
        />
        <MetricCard
          label="Active Students"
          value={0}
          icon="groups"
          subtext="Awaiting first submissions"
        />
        <MetricCard
          label="Gate Completion Rate"
          value="—"
          icon="task_alt"
          subtext="Awaiting first submissions"
        />
        <MetricCard
          label="Flagged Students"
          value={0}
          icon="warning"
          variant="alert"
          subtext="No flags yet"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: trend chart + assignments table */}
        <div className="lg:col-span-8 space-y-8">
          <TrendChartStub />

          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--color-surface-variant)] flex items-center justify-between bg-[var(--color-surface)]/30">
              <h3 className="text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
                Active Assignments
              </h3>
              <Link
                href="/instructor/assignments"
                className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors"
              >
                View All
              </Link>
            </div>
            <AssignmentsTable assignments={assignments.slice(0, 5)} />
          </div>
        </div>

        {/* Right: needs attention */}
        <div className="lg:col-span-4">
          <NeedsAttentionPanel count={0} />
        </div>
      </div>
    </div>
  );
}
