import type { ErpModule, Priority, Role, TicketStatus } from "@/types/api";

export const ROLES: Record<Role, string> = {
  CLIENTE: "Cliente",
  SOPORTE_TI: "Soporte TI",
  ADMIN: "Supervisor / Admin",
};

export const TICKET_STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const satisfies readonly TicketStatus[];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const ERP_MODULES = [
  "FINANCIAL",
  "BILLING",
  "INVENTORY",
  "SALES",
  "CRM",
  "HUMAN_RESOURCES",
  "SUPPLY_CHAIN",
  "CORE_SYSTEM",
] as const;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Abierto",
  ASSIGNED: "Asignado",
  IN_PROGRESS: "En proceso",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const MODULE_LABELS: Record<ErpModule, string> = {
  FINANCIAL: "Finanzas & Contabilidad",
  BILLING: "Facturación Electrónica",
  INVENTORY: "Inventario & Almacén",
  SALES: "Ventas & POS",
  CRM: "CRM",
  HUMAN_RESOURCES: "RRHH & Nómina",
  SUPPLY_CHAIN: "Cadena de Suministro",
  CORE_SYSTEM: "Administración del Sistema",
};

/** Tailwind classes for status badges. */
export const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ASSIGNED: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  RESOLVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  CLOSED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

/** Tailwind classes for priority badges. */
export const PRIORITY_BADGE: Record<Priority, string> = {
  LOW: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  MEDIUM: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** SLA matrix (priority -> response / resolution hours). Mirrors backend Priority enum. */
export const SLA_MATRIX: Record<Priority, { response: string; resolution: string }> = {
  LOW: { response: "24 h", resolution: "72 h" },
  MEDIUM: { response: "8 h", resolution: "24 h" },
  HIGH: { response: "2 h", resolution: "8 h" },
  CRITICAL: { response: "30 min", resolution: "4 h" },
};

export const DEMO_ACCOUNTS: { email: string; password: string; role: Role }[] = [
  { email: "cliente@softtech.com", password: "dylan", role: "CLIENTE" },
  { email: "soporte@softtech.com", password: "dylan", role: "SOPORTE_TI" },
  { email: "admin@softtech.com", password: "dylan", role: "ADMIN" },
];
