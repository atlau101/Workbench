import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { listPendingInvitesForMe, listEnrolledCoursesForMe } from "@/app/actions/enrollments";
import PendingInviteCard from "@/components/student/PendingInviteCard";
import EnrolledCourseList from "@/components/student/EnrolledCourseList";

export default async function StudentCoursesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [invites, enrolledCourses] = await Promise.all([
    listPendingInvitesForMe(),
    listEnrolledCoursesForMe(),
  ]);

  const hasActivity = invites.length > 0 || enrolledCourses.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-on-background)]">
          Courses
        </h2>
        <p className="mt-1 text-[var(--color-on-surface-variant)]">
          Your enrolled courses and pending invitations
        </p>
      </div>

      {!hasActivity && (
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
            school
          </span>
          <p className="mt-3 font-medium text-[var(--color-on-surface)]">No courses yet</p>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            Ask your instructor to invite you to a course.
          </p>
        </div>
      )}

      {invites.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
            Pending Invitations
          </h3>
          {invites.map((invite) => (
            <PendingInviteCard key={invite.enrollment_id} invite={invite} />
          ))}
        </section>
      )}

      {enrolledCourses.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
            Enrolled
          </h3>
          <EnrolledCourseList courses={enrolledCourses} />
        </section>
      )}
    </div>
  );
}
