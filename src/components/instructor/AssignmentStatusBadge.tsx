import PillTag from "@/components/ui/PillTag";
import type { AssignmentStatus } from "@/lib/assignments";

const config: Record<
  AssignmentStatus,
  { color: "teal" | "amber" | "neutral"; label: string }
> = {
  published: { color: "teal", label: "Published" },
  draft: { color: "neutral", label: "Draft" },
  hidden: { color: "amber", label: "Hidden" },
};

export default function AssignmentStatusBadge({
  status,
}: {
  status: AssignmentStatus;
}) {
  const { color, label } = config[status] ?? config.draft;
  return <PillTag color={color}>{label}</PillTag>;
}
