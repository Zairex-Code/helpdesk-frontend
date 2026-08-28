"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import type { Role } from "@/types/api";

export interface Session {
  email: string;
  role: Role | null;
}

/**
 * Returns the current session, resolving it on the client after mount to avoid
 * hydration mismatches (the JWT lives in localStorage).
 */
export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return session;
}
