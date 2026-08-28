import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import { getSlaState, type SlaLevel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TicketResponseDto } from "@/types/api";

const DOT: Record<SlaLevel, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  neutral: "bg-muted-foreground",
};

const ICON: Record<SlaLevel, typeof Clock> = {
  green: CircleCheck,
  yellow: Clock,
  red: CircleAlert,
  neutral: Clock,
};

export function SlaIndicator({ ticket, withLabel = false }: { ticket: TicketResponseDto; withLabel?: boolean }) {
  const state = getSlaState(ticket);
  const Icon = ICON[state.level];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative flex size-2.5">
            {state.level === "red" && (
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", DOT[state.level])} />
            )}
            <span className={cn("relative inline-flex size-2.5 rounded-full", DOT[state.level])} />
          </span>
          {withLabel && <span className="text-xs text-muted-foreground">{state.label}</span>}
          <Icon className={cn("size-3.5", state.level === "red" ? "text-red-500" : "text-muted-foreground")} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{state.label}</TooltipContent>
    </Tooltip>
  );
}
