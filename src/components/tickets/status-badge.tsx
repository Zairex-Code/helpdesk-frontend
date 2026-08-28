import { STATUS_BADGE, STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/types/api";

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", STATUS_BADGE[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
