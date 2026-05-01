import { notFound, redirect } from "next/navigation";
import { startAttempt } from "@/app/actions/attempts";
import { GATE_LEVELS } from "@/components/instructor/GateLevelPicker";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Assignment } from "@/lib/assignments";

export default async function AssignmentAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/a/${id}`)}`);
  }

  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, prompt, gate_level, ai_msg_limit, status")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !data) notFound();

  const assignment = data as Pick<
    Assignment,
    "id" | "title" | "prompt" | "gate_level" | "ai_msg_limit"
  >;

  await startAttempt(assignment.id);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <h1 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)] font-heading">
            {assignment.title}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-sm px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 font-medium">
              {GATE_LEVELS[assignment.gate_level]}
            </span>
            <span className="text-sm text-[var(--color-on-surface-variant)]">
              {assignment.ai_msg_limit} AI messages
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
