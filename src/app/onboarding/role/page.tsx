import { setUserRole } from "@/app/actions/auth";
import { Button, Card } from "@/components/ui";

type RolePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function RolePage({ searchParams }: RolePageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card elevated className="w-full max-w-md p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
            Workbench
          </p>
          <h1 className="text-[var(--text-h2)] font-semibold">How will you use Workbench?</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Pick the role that fits you — this determines which dashboard you see.
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-[var(--radius)] bg-[var(--color-error-container)] px-4 py-3 text-sm text-[var(--color-on-error-container)]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          <form action={setUserRole}>
            <input type="hidden" name="role" value="student" />
            <Button type="submit" variant="secondary" className="w-full">
              I&apos;m a Student
            </Button>
          </form>
          <form action={setUserRole}>
            <input type="hidden" name="role" value="instructor" />
            <Button type="submit" variant="secondary" className="w-full">
              I&apos;m an Instructor
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
