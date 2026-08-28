"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TicketResponseDto } from "@/types/api";

async function fetchTickets(): Promise<TicketResponseDto[]> {
  try {
    const { data } = await api.get<TicketResponseDto[]>("/api/v1/tickets");
    return data;
  } catch {
    return [];
  }
}

export function useTickets() {
  const [tickets, setTickets] = useState<TicketResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchTickets();
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchTickets().then((data) => {
      if (!cancelled) {
        setTickets(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { tickets, loading, refresh: load };
}
