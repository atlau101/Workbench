import Link from "next/link";
import { listMyCourses } from "@/app/actions/courses";

export default async function InstructorCoursesPage() {
  const courses = await listMyCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
            Courses
          </h2>
          <p className="mt-1 text-[var(--color-on-surface-variant)]">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center">
          <p className="font-medium text-[var(--color-on-surface)]">
            No courses yet
          </p>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            Create a course to start enrolling students.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm">
          <div className="divide-y divide-[var(--color-surface-variant)]">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-surface-container-low)]/50"
              >
                <p className="font-medium text-[var(--color-on-background)]">
                  {course.name}
                </p>
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
