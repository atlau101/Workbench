import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Button, Card } from "@/components/ui";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <Card elevated className="p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
          Workbench
        </p>
        <h1 className="text-[var(--text-h2)] font-semibold">Create account</h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Choose the role you want this account to use.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-[var(--radius)] bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
          {error}
        </p>
      ) : null}

      <form action={signUp} className="mt-6 space-y-4">
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
            minLength={8}
            className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-on-surface)]">Role</span>
          <select
            required
            name="role"
            defaultValue="student"
            className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 outline-none transition-colors focus:border-[var(--color-primary)]"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>

        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-on-surface-variant)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--color-primary)]">
          Log in
        </Link>
      </p>
    </Card>
  );
}
