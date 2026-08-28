"use client";

import {
  Ban,
  CirclePlay,
  Loader2,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/api";
import { MODULE_LABELS, PRIORITIES, PRIORITY_LABELS, TICKET_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { useTickets } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/tickets/priority-badge";
import { SlaIndicator } from "@/components/tickets/sla-indicator";
import { StatusBadge } from "@/components/tickets/status-badge";
import { formatRelative } from "@/lib/format";
import type { TicketResponseDto } from "@/types/api";

type Action = { type: "assign" | "resolve" | "cancel" } | { type: "investigate" } | null;

export default function AgentTicketsPage() {
  const { tickets, loading, refresh } = useTickets();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [action, setAction] = useState<Action>(null);
  const [target, setTarget] = useState<TicketResponseDto | null>(null);
  const [agentId, setAgentId] = useState("AGT-TI-5042");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (statusFilter === "ALL" || t.status === statusFilter) &&
          (priorityFilter === "ALL" || t.priority === priorityFilter),
      ),
    [tickets, statusFilter, priorityFilter],
  );

  function openAction(type: NonNullable<Action>["type"], ticket: TicketResponseDto) {
    setAction({ type } as Action);
    setTarget(ticket);
  }

  async function runAction() {
    if (!target || !action) return;
    setBusy(true);
    try {
      if (action.type === "assign") {
        await api.patch(`/api/v1/tickets/${target.id}/assign`, { assignedAgentId: agentId });
        toast.success("Ticket asignado");
      } else if (action.type === "investigate") {
        await api.patch(`/api/v1/tickets/${target.id}/start-investigation`);
        toast.success("Investigación iniciada");
      } else if (action.type === "resolve") {
        await api.patch(`/api/v1/tickets/${target.id}/resolve`, { resolutionNotes });
        toast.success("Ticket resuelto");
      } else if (action.type === "cancel") {
        await api.patch(`/api/v1/tickets/${target.id}/cancel`, { reason: cancelReason });
        toast.success("Ticket cancelado");
      }
      setAction(null);
      setTarget(null);
      setResolutionNotes("");
      setCancelReason("");
      refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mesa de ayuda</h1>
        <p className="text-muted-foreground text-sm">
          Gestiona incidencias, asigna agentes y controla el cumplimiento de SLA.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las prioridades</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</p>
                    <p className="max-w-xs truncate font-medium">{ticket.title}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{MODULE_LABELS[ticket.erpModule]}</TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <SlaIndicator ticket={ticket} withLabel />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelative(ticket.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {ticket.status === "OPEN" && (
                      <>
                        <ActionButton title="Asignar" onClick={() => openAction("assign", ticket)}>
                          <UserPlus className="size-4" />
                        </ActionButton>
                        <ActionButton title="Cancelar" onClick={() => openAction("cancel", ticket)}>
                          <Ban className="size-4" />
                        </ActionButton>
                      </>
                    )}
                    {ticket.status === "ASSIGNED" && (
                      <ActionButton title="Iniciar investigación" onClick={() => openAction("investigate", ticket)}>
                        <CirclePlay className="size-4" />
                      </ActionButton>
                    )}
                    {ticket.status === "IN_PROGRESS" && (
                      <ActionButton title="Resolver" onClick={() => openAction("resolve", ticket)}>
                        <Wrench className="size-4" />
                      </ActionButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action?.type === "assign" && "Asignar ticket"}
              {action?.type === "investigate" && "Iniciar investigación"}
              {action?.type === "resolve" && "Resolver ticket"}
              {action?.type === "cancel" && "Cancelar ticket"}
            </DialogTitle>
            <DialogDescription>
              {target?.ticketNumber} · {target?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {action?.type === "assign" && (
              <div className="space-y-2">
                <Label>ID del agente</Label>
                <Input value={agentId} onChange={(e) => setAgentId(e.target.value)} />
              </div>
            )}
            {action?.type === "resolve" && (
              <div className="space-y-2">
                <Label>Notas de resolución</Label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Causa raíz y solución aplicada…"
                  className="min-h-28"
                />
              </div>
            )}
            {action?.type === "cancel" && (
              <div className="space-y-2">
                <Label>Motivo de cancelación</Label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Motivo…"
                />
              </div>
            )}
            {action?.type === "investigate" && (
              <p className="text-sm text-muted-foreground">
                El ticket pasará al estado “En proceso”.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={runAction} disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant="ghost" size="icon" title={title} onClick={onClick} className="size-8">
      {children}
    </Button>
  );
}
