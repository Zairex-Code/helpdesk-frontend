"use client";

import type { Role } from "@/types/api";

const TOKEN_KEY = "helpdesk.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface AuthSession {
  email: string;
  role: Role | null;
}

interface JwtPayload {
  sub?: string;
  upn?: string;
  preferred_username?: string;
  groups?: string[];
  exp?: number;
  iat?: number;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function computeSession(token: string | null): AuthSession | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = payload.groups?.[0] as Role | undefined;
  return {
    email: payload.upn ?? payload.preferred_username ?? payload.sub ?? "",
    role: role ?? null,
  };
}

export function getSession(): AuthSession | null {
  return computeSession(getToken());
}

export function getRoleFromToken(token: string): Role | null {
  return computeSession(token)?.role ?? null;
}

export function getRole(): Role | null {
  return getSession()?.role ?? null;
}
