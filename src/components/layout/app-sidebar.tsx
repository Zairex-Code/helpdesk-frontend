"use client";

import { BarChart3, Headphones, LifeBuoy, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  icon: typeof BarChart3;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/portal", label: "Mi portal", icon: LifeBuoy, roles: ["CLIENTE"] },
  { href: "/agent/tickets", label: "Mesa de ayuda", icon: Headphones, roles: ["SOPORTE_TI", "ADMIN"] },
  { href: "/dashboard", label: "Dashboards", icon: BarChart3, roles: ["CLIENTE", "SOPORTE_TI", "ADMIN"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const session = useSession();
  const role = session?.role;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role as Role));

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="brand-gradient flex size-8 items-center justify-center rounded-lg">
          <Sparkles className="size-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">SoftTech</span>
          <span className="text-muted-foreground text-xs">HelpDesk</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-sidebar-accent p-3 text-xs leading-relaxed text-sidebar-accent-foreground/80">
          <p className="font-medium">Soporte SoftTech</p>
          <p className="mt-0.5">SLA reactivo · ISO/IEC 25010</p>
        </div>
      </div>
    </aside>
  );
}
