"use client";

import { useSyncExternalStore } from "react";
import { computeSession, getToken, type AuthSession } from "@/lib/auth";

export type Session = AuthSession;

let cachedToken: string | null | undefined;
let cachedSession: Session | null = null;

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Session | null {
  const token = getToken();
  if (token !== cachedToken) {
    cachedToken = token;
    cachedSession = computeSession(token);
  }
  return cachedSession;
}

function getServerSnapshot(): Session | null {
  return null;
}

/**
 * Returns the current session. Reads the JWT from localStorage on the client
 * only (server snapshot is null), avoiding hydration mismatches. The snapshot
 * is cached per token so React sees a stable reference between renders.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
