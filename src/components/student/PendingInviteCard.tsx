"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondToInvite } from "@/app/actions/enrollments";
import type { PendingInvite } from "@/lib/courses";

export default function PendingInviteCard({
  invite,
}: {
  invite: PendingInvite;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function respond(decision: "accepted" | "declined") {
    startTransition(async () => {
      await respondToInvite(invite.enrollment_id, decision);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 shadow-sm">
      <div>
        <p className="font-medium text-[var(--color-on-background)]">
          {invite.course_name}
        </p>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Invited by {invite.instructor_email}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => respond("accepted")}
          disabled={isPending}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          Accept
        </button>
        <button
          onClick={() => respond("declined")}
          disabled={isPending}
          className="rounded-lg border border-[var(--color-outline-variant)] px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
