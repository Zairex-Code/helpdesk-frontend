"use client";

import { History, Star } from "lucide-react";
import { useState } from "react";
import { MODULE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useSession } from "@/hooks/use-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CsatModal } from "@/components/tickets/csat-modal";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { SlaIndicator } from "@/components/tickets/sla-indicator";
import { StatusBadge } from "@/components/tickets/status-badge";
import type { TicketResponseDto } from "@/types/api";

export function TicketDetail({
  ticket,
  onUpdated,
}: {
  ticket: TicketResponseDto;
  onUpdated?: () => void;
}) {
  const session = useSession();
  const [csatOpen, setCsatOpen] = useState(false);

  const canClose = ticket.status === "RESOLVED" && session?.role === "CLIENTE";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">{ticket.ticketNumber}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <CardTitle className="text-xl">{ticket.title}</CardTitle>
            </div>
            <SlaIndicator ticket={ticket} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Detail label="Módulo" value={MODULE_LABELS[ticket.erpModule]} />
            <Detail label="Solicitante" value={ticket.requesterId} />
            <Detail label="Agente" value={ticket.assignedAgentId ?? "Sin asignar"} />
            <Detail label="Creado" value={formatDateTime(ticket.createdAt)} />
            <Detail label="Respuesta límite" value={formatDateTime(ticket.responseDeadline)} />
            <Detail label="Resolución límite" value={formatDateTime(ticket.resolutionDeadline)} />
          </div>

          {ticket.vipCustomer && (
            <Badge variant="outline" className="gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              Cliente VIP
            </Badge>
          )}

          {ticket.csatRating != null && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">CSAT:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < ticket.csatRating!
                        ? "size-4 fill-amber-400 text-amber-400"
                        : "size-4 text-muted-foreground/30"
                    }
                  />
                ))}
              </div>
              {ticket.csatComment && (
                <span className="text-muted-foreground">“{ticket.csatComment}”</span>
              )}
            </div>
          )}

          {canClose && (
            <div className="flex justify-end">
              <Button onClick={() => setCsatOpen(true)} className="gap-2">
                <Star className="size-4" />
                Cerrar y calificar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Historial de actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l pl-4">
            {buildActivity(ticket).map((entry, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">{entry.message}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <CsatModal
        ticket={ticket}
        open={csatOpen}
        onOpenChange={setCsatOpen}
        onClosed={() => onUpdated?.()}
      />
    </div>
  );
}

function buildActivity(ticket: TicketResponseDto): { message: string; at: string }[] {
  const entries: { message: string; at: string }[] = [
    { message: `Ticket creado por ${ticket.requesterId}`, at: ticket.createdAt },
  ];

  if (ticket.assignedAgentId) {
    entries.push({ message: `Asignado al agente ${ticket.assignedAgentId}`, at: ticket.updatedAt });
  }

  if (ticket.resolvedAt) {
    entries.push({
      message: ticket.resolutionNotes
        ? `Resuelto: ${ticket.resolutionNotes}`
        : "Ticket resuelto",
      at: ticket.resolvedAt,
    });
  }

  if (ticket.closedAt) {
    entries.push({
      message:
        ticket.csatRating != null
          ? `Cerrado con calificación CSAT ${ticket.csatRating}/5`
          : "Ticket cerrado",
      at: ticket.closedAt,
    });
  }

  return entries;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
