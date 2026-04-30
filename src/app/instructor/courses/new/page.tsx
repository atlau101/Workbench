"use client";

import { useActionState } from "react";
import { createCourse } from "@/app/actions/courses";

const initialState: { error?: string } = {};

export default function NewCoursePage() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState);

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
        New Course
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-2 block font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
            Course Name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. English 101"
            className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-3 py-2.5 text-[16px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-[var(--color-error)]">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create Course"}
        </button>
      </form>
    </div>
  );
}
