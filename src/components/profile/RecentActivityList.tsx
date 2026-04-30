import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { StudentRecentActivityItem } from "@/app/actions/profile";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

interface RecentActivityListProps {
  items: StudentRecentActivityItem[];
}

export default function RecentActivityList({ items }: RecentActivityListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-heading)] text-[22px] font-semibold text-[var(--color-on-surface)]">
            Recent activity
          </h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Your latest submitted assignments and completed gym sessions.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="history"
            title="No completion signals yet"
            description="Submitted assignments and completed gym sessions will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-[var(--color-outline-variant)]">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 transition-opacity hover:opacity-80 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--color-on-surface)]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                  {item.subtitle}
                </p>
              </div>
              <span className="text-sm text-[var(--color-on-surface-variant)]">
                {formatDateTime(item.occurredAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
