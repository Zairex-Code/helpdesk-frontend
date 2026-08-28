export type Role = "CLIENTE" | "SOPORTE_TI" | "ADMIN";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ErpModule =
  | "FINANCIAL"
  | "BILLING"
  | "INVENTORY"
  | "SALES"
  | "CRM"
  | "HUMAN_RESOURCES"
  | "SUPPLY_CHAIN"
  | "CORE_SYSTEM";

export interface TicketResponseDto {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  erpModule: ErpModule;
  requesterId: string;
  vipCustomer: boolean;
  assignedAgentId: string | null;
  resolutionNotes: string | null;
  responseDeadline: string;
  resolutionDeadline: string;
  isResponseSlaBreached: boolean;
  isResolutionSlaBreached: boolean;
  csatRating: number | null;
  csatComment: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface TicketRequestDto {
  title: string;
  description: string;
  priority: Priority;
  erpModule: ErpModule;
  requesterId: string;
  vipCustomer: boolean;
}

export interface AssignTicketRequestDto {
  assignedAgentId: string;
}

export interface ResolveTicketRequestDto {
  resolutionNotes: string;
}

export interface CloseTicketRequestDto {
  rating: number;
  comment?: string;
}

export interface CancelTicketRequestDto {
  reason: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface ErrorResponseDto {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errorCode?: string;
  violations?: Record<string, string>;
  correlationId?: string;
  timestamp?: string;
}
