"use client";

import { Inbox, Ticket as TicketIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTickets } from "@/hooks/use-tickets";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { SlaIndicator } from "@/components/tickets/sla-indicator";
import { StatusBadge } from "@/components/tickets/status-badge";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { formatRelative } from "@/lib/format";
import type { TicketResponseDto } from "@/types/api";

const ACTIVE = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
const COMPLETED = ["CLOSED", "CANCELLED"];

export default function PortalPage() {
  const { tickets, loading, refresh } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const active = useMemo(() => tickets.filter((t) => ACTIVE.includes(t.status)), [tickets]);
  const completed = useMemo(() => tickets.filter((t) => COMPLETED.includes(t.status)), [tickets]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mi portal</h1>
        <p className="text-muted-foreground text-sm">
          Crea y da seguimiento a tus incidencias de soporte.
        </p>
      </header>

      <CreateTicketForm onCreated={refresh} />

      <Tabs defaultValue="open">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="open" className="gap-2">
              Abiertos
              <Badge variant="secondary" className="h-5 px-1.5">
                {active.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completados
              <Badge variant="secondary" className="h-5 px-1.5">
                {completed.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="open" className="mt-4">
          <TicketBrowser
            tickets={active}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            detail={selected}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TicketBrowser
            tickets={completed}
            loading={loading}
            selectedId={selectedId}
            onSelect={setSelectedId}
            detail={selected}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TicketBrowser({
  tickets,
  loading,
  selectedId,
  onSelect,
  detail,
}: {
  tickets: TicketResponseDto[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  detail: TicketResponseDto | null;
}) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Inbox className="text-muted-foreground/50 mb-3 size-10" />
        <p className="text-muted-foreground">No hay tickets en esta bandeja.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onSelect(ticket.id)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-colors hover:bg-accent",
              selectedId === ticket.id ? "border-primary/50 bg-accent" : "bg-card",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
              <SlaIndicator ticket={ticket} />
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-medium">{ticket.title}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-muted-foreground">{formatRelative(ticket.updatedAt)}</span>
            </div>
          </button>
        ))}
      </div>

      <div>
        {detail ? (
          <TicketDetail ticket={detail} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <TicketIcon className="text-muted-foreground/50 mb-3 size-10" />
            <p className="text-muted-foreground">Selecciona un ticket para ver el detalle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
