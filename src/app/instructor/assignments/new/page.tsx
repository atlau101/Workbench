import { listTemplates } from "@/app/actions/assignments";
import NewAssignmentForm from "./Form";

export default async function NewInstructorAssignmentPage() {
  const templates = await listTemplates();
  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
          Create New Assignment
        </h2>
        <p className="mt-1 text-[var(--color-on-surface-variant)]">
          Set up a new assignment with a gate configuration and scaffolding
          prompts.
        </p>
      </div>
      <NewAssignmentForm templates={templates} />
    </div>
  );
}
