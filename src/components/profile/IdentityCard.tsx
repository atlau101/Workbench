import Card from "@/components/ui/Card";
import PillTag from "@/components/ui/PillTag";

function formatMemberSince(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

interface IdentityCardProps {
  name: string;
  email: string;
  role: string;
  memberSince: string;
}

export default function IdentityCard({
  name,
  email,
  role,
  memberSince,
}: IdentityCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[var(--font-heading)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            Identity
          </p>
          <h1 className="mt-3 font-[var(--font-heading)] text-[32px] font-semibold text-[var(--color-on-surface)]">
            {name}
          </h1>
          <p className="mt-2 text-[16px] text-[var(--color-on-surface-variant)]">
            {email}
          </p>
        </div>
        <PillTag color="teal">{role}</PillTag>
      </div>

      <div className="mt-6 grid gap-4 border-t border-[var(--color-outline-variant)] pt-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            Member since
          </p>
          <p className="mt-2 text-sm text-[var(--color-on-surface)]">
            {formatMemberSince(memberSince)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            Access
          </p>
          <p className="mt-2 text-sm text-[var(--color-on-surface)]">
            Read-only profile shell
          </p>
        </div>
      </div>
    </Card>
  );
}
