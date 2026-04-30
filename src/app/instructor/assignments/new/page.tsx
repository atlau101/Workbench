import { listTemplates } from "@/app/actions/assignments";
import { listMyCourses } from "@/app/actions/courses";
import NewAssignmentForm from "./Form";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { courseId } = await searchParams;
  const [templates, courses] = await Promise.all([
    listTemplates(),
    listMyCourses(),
  ]);

  return (
    <div className="px-0">
      <NewAssignmentForm
        templates={templates}
        courses={courses}
        defaultCourseId={courseId}
      />
    </div>
  );
}
