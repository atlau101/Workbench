import Link from "next/link";
import { notFound } from "next/navigation";
import { listMyAssignments } from "@/app/actions/assignments";
import { getCourse } from "@/app/actions/courses";
import { listCourseRoster } from "@/app/actions/enrollments";
import AssignmentStatusBadge from "@/components/instructor/AssignmentStatusBadge";
import EnrollmentRoster from "@/components/instructor/EnrollmentRoster";
import InviteStudentForm from "@/components/instructor/InviteStudentForm";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, roster, allAssignments] = await Promise.all([
    getCourse(id),
    listCourseRoster(id),
    listMyAssignments(),
  ]);

  if (!course) notFound();

  const courseAssignments = allAssignments.filter(
    (assignment) => assignment.course_id === id
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          href="/instructor/courses"
          className="mb-2 flex items-center gap-1 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          All courses
        </Link>
        <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
          {course.name}
        </h2>
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
        <p className="font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
          Invite Student
        </p>
        <InviteStudentForm courseId={id} />
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
        <p className="font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
          Students ({roster.length})
        </p>
        <EnrollmentRoster enrollments={roster} courseId={id} />
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
            Assignments ({courseAssignments.length})
          </p>
          <Link
            href={`/instructor/assignments/new?courseId=${id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            + New
          </Link>
        </div>
        {courseAssignments.length === 0 ? (
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            No assignments yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-surface-variant)]">
            {courseAssignments.map((assignment) => (
              <li
                key={assignment.id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-[var(--color-on-surface)]">
                  {assignment.title}
                </span>
                <div className="flex items-center gap-3">
                  <AssignmentStatusBadge status={assignment.status} />
                  <Link
                    href={`/instructor/assignments/${assignment.id}`}
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
