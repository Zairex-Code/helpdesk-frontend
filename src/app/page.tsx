"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRole } from "@/lib/auth";
import type { Role } from "@/types/api";

const ROLE_HOME: Record<Role, string> = {
  CLIENTE: "/portal",
  SOPORTE_TI: "/agent/tickets",
  ADMIN: "/dashboard",
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const role = getRole();
    router.replace(role ? ROLE_HOME[role] : "/login");
  }, [router]);

  return null;
}
