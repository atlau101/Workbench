import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttemptForInstructor } from "@/app/actions/attempts";
import ChatColumn from "@/components/instructor/process-log/ChatColumn";
import FinalOutputColumn from "@/components/instructor/process-log/FinalOutputColumn";
import ReflectionColumn from "@/components/instructor/process-log/ReflectionColumn";
import PillTag from "@/components/ui/PillTag";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function InstructorAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await getAttemptForInstructor(id);

  if (!bundle || "error" in bundle) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href={`/instructor/assignments/${bundle.assignment.id}`}
            className="text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] flex items-center gap-1 mb-2"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back to assignment
          </Link>
          <h1 className="font-[var(--font-heading)] text-[40px] leading-[1.2] font-semibold text-[var(--color-on-background)]">
            Review: {bundle.studentLabel}
          </h1>
          <p className="mt-2 text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">
            Assignment: {bundle.assignment.title}
          </p>
          {bundle.studentEmail ? (
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {bundle.studentEmail}
            </p>
          ) : null}
        </div>
        {bundle.attempt.submittedAt ? (
          <PillTag color="teal">
            Submitted at {formatDateTime(bundle.attempt.submittedAt)}
          </PillTag>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:min-h-[70vh]">
        <ReflectionColumn
          assignment={bundle.assignment}
          responses={bundle.responses}
        />
        <ChatColumn chatMessages={bundle.chatMessages} />
        <FinalOutputColumn finalOutput={bundle.finalOutput} />
      </div>
    </div>
  );
}
