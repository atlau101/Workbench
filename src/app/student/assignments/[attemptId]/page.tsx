import { notFound } from "next/navigation";
import { getAttemptForStudent } from "@/app/actions/attempts";
import AIAssistPhase from "@/components/workspace/AIAssistPhase";
import ReflectPhase from "@/components/workspace/ReflectPhase";
import SynthesizePhase from "@/components/workspace/SynthesizePhase";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default async function StudentAssignmentWorkspacePage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const bundle = await getAttemptForStudent(attemptId);

  if ("error" in bundle) {
    notFound();
  }

  return (
    <WorkspaceShell
      assignment={bundle.assignment}
      status={bundle.attempt.status}
    >
      {bundle.attempt.status === "reflect" ? (
        <ReflectPhase
          attemptId={bundle.attempt.id}
          assignment={bundle.assignment}
          responses={bundle.responses}
        />
      ) : null}

      {bundle.attempt.status === "ai_assist" ? (
        <AIAssistPhase
          attemptId={bundle.attempt.id}
          assignment={bundle.assignment}
          responses={bundle.responses}
          chatMessages={bundle.chatMessages}
        />
      ) : null}

      {bundle.attempt.status === "synthesize" ||
      bundle.attempt.status === "submitted" ||
      bundle.attempt.status === "complete" ? (
        <SynthesizePhase
          attemptId={bundle.attempt.id}
          attempt={bundle.attempt}
          assignment={bundle.assignment}
          finalOutput={bundle.finalOutput}
          responses={bundle.responses}
          chatMessages={bundle.chatMessages}
        />
      ) : null}
    </WorkspaceShell>
  );
}
