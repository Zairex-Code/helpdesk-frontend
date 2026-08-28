"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TicketResponseDto } from "@/types/api";

export function useTickets() {
  const [tickets, setTickets] = useState<TicketResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<TicketResponseDto[]>("/api/v1/tickets");
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tickets, loading, refresh };
}
