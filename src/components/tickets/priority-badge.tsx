import { PRIORITY_BADGE, PRIORITY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types/api";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", PRIORITY_BADGE[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
