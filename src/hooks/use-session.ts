"use client";

import { useSyncExternalStore } from "react";
import { getSession } from "@/lib/auth";
import type { Role } from "@/types/api";

export interface Session {
  email: string;
  role: Role | null;
}

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Session | null {
  return getSession();
}

function getServerSnapshot(): Session | null {
  return null;
}

/**
 * Returns the current session. Reads the JWT from localStorage on the client
 * only (server snapshot is null), avoiding hydration mismatches.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
