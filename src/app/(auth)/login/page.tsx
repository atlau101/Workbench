"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn, signInWithMagicLink } from "@/app/actions/auth";
import { Button, Card } from "@/components/ui";

function LoginForm() {
  const searchParams = useSearchParams();
  const [useMagicLink, setUseMagicLink] = useState(false);
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <>
      <div className="mt-6 flex rounded-[var(--radius-full)] bg-[var(--color-surface-container)] p-1">
        <button
          type="button"
          onClick={() => setUseMagicLink(false)}
          className={[
            "flex-1 rounded-[var(--radius-full)] px-4 py-2 text-sm font-medium transition-colors",
            useMagicLink
              ? "text-[var(--color-on-surface-variant)]"
              : "bg-white text-[var(--color-on-surface)] shadow-sm",
          ].join(" ")}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setUseMagicLink(true)}
          className={[
            "flex-1 rounded-[var(--radius-full)] px-4 py-2 text-sm font-medium transition-colors",
            useMagicLink
              ? "bg-white text-[var(--color-on-surface)] shadow-sm"
              : "text-[var(--color-on-surface-variant)]",
          ].join(" ")}
        >
          Magic link
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-[var(--radius)] bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
          {error}
        </p>
      ) : null}

      {!error && message ? (
        <p className="mt-4 rounded-[var(--radius)] bg-[var(--color-surface-container)] px-4 py-3 text-sm text-[var(--color-on-surface)]">
          {message}
        </p>
      ) : null}

      {useMagicLink ? (
        <form action={signInWithMagicLink} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--color-on-surface)]">Email</span>
            <input
              required
              type="email"
              name="email"
              placeholder="you@school.edu"
              className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </label>
          <Button type="submit" className="w-full">
            Send magic link
          </Button>
        </form>
      ) : (
        <form action={signIn} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--color-on-surface)]">Email</span>
            <input
              required
              type="email"
              name="email"
              placeholder="you@school.edu"
              className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--color-on-surface)]">Password</span>
            <input
              required
              type="password"
              name="password"
              className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
            />
          </label>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-[var(--color-primary)]">
          Sign up
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Card elevated className="p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
          Workbench
        </p>
        <h1 className="text-[var(--text-h2)] font-semibold">Log in</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Access your instructor or student workspace.
        </p>
      </div>
      <Suspense fallback={<div className="mt-6 h-10 animate-pulse bg-[var(--color-surface-container)] rounded-[var(--radius)]" />}>
        <LoginForm />
      </Suspense>
    </Card>
  );
}
