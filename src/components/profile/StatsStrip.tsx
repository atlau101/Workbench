import Card from "@/components/ui/Card";

interface StatsStripItem {
  label: string;
  value: number;
}

interface StatsStripProps {
  items: StatsStripItem[];
}

export default function StatsStrip({ items }: StatsStripProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            {item.label}
          </p>
          <p className="mt-3 font-[Lexend] text-[32px] font-semibold text-[var(--color-on-surface)]">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
