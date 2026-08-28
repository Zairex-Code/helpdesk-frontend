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

interface JwtPayload {
  sub?: string;
  upn?: string;
  preferred_username?: string;
  groups?: string[];
  exp?: number;
  iat?: number;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getSession(): { email: string; role: Role | null } | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload) return null;
  const role = payload.groups?.[0] as Role | undefined;
  return {
    email: payload.upn ?? payload.preferred_username ?? payload.sub ?? "",
    role: role ?? null,
  };
}

export function getRole(): Role | null {
  return getSession()?.role ?? null;
}
