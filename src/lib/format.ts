import type { TicketResponseDto } from "@/types/api";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

export type SlaLevel = "green" | "yellow" | "red" | "neutral";

export interface SlaState {
  level: SlaLevel;
  label: string;
}

/**
 * Determines the SLA "traffic light" for a ticket based on its resolution deadline.
 * - red: resolution deadline already exceeded.
 * - yellow: less than 25% of the total window remains.
 * - green: otherwise (with a healthy margin).
 * - neutral: no resolution deadline available.
 */
export function getSlaState(ticket: TicketResponseDto): SlaState {
  const deadline = ticket.resolutionDeadline;
  if (!deadline) return { level: "neutral", label: "Sin SLA" };

  const now = Date.now();
  const deadlineMs = new Date(deadline).getTime();
  const createdMs = new Date(ticket.createdAt).getTime();
  const total = deadlineMs - createdMs;

  if (now >= deadlineMs) {
    return { level: "red", label: "SLA vencido" };
  }

  const remaining = deadlineMs - now;
  const ratio = total > 0 ? remaining / total : 0;

  if (ratio <= 0.25) {
    return { level: "yellow", label: "Por vencer" };
  }

  return { level: "green", label: "Dentro de SLA" };
}
