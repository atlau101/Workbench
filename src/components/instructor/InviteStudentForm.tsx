"use client";

import { useState, useTransition } from "react";
import { inviteStudent } from "@/app/actions/enrollments";

export default function InviteStudentForm({ courseId }: { courseId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ ok?: true; error?: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await inviteStudent(courseId, email);
      setMessage(result);
      if ("ok" in result) setEmail("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          className="flex-1 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-3 py-2 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Inviting…" : "Invite"}
        </button>
      </div>
      {message && "error" in message && (
        <p className="text-sm text-[var(--color-error)]">{message.error}</p>
      )}
      {message && "ok" in message && (
        <p className="text-sm text-[var(--color-primary)]">Invite sent!</p>
      )}
    </form>
  );
}
