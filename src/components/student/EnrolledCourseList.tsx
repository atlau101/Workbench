import Link from "next/link";
import type { EnrolledCourse } from "@/lib/courses";

export default function EnrolledCourseList({
  courses,
}: {
  courses: EnrolledCourse[];
}) {
  return (
    <div className="space-y-6">
      {courses.map((course) => (
        <div
          key={course.enrollment_id}
          className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm"
        >
          <div className="mb-3">
            <h3 className="font-semibold text-[var(--color-on-background)]">
              {course.course.name}
            </h3>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Instructor: {course.course.instructor_email}
            </p>
          </div>

          {course.assignments.length === 0 ? (
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              No published assignments yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {course.assignments.map((assignment) => (
                <li key={assignment.id}>
                  <Link
                    href={`/a/${assignment.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      menu_book
                    </span>
                    {assignment.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
