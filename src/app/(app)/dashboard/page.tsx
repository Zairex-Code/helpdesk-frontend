"use client";

import { Activity, Gauge, Timer, Trophy } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MODULE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { getSlaState } from "@/lib/format";
import { useTickets } from "@/hooks/use-tickets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/tickets/status-badge";

export default function DashboardPage() {
  const { tickets, loading } = useTickets();

  const stats = useMemo(() => {
    const total = tickets.length;
    const byStatus = new Map<string, number>();
    const byModule = new Map<string, number>();
    const byDay = new Map<string, number>();

    let csatSum = 0;
    let csatCount = 0;
    let compliant = 0;

    for (const t of tickets) {
      byStatus.set(t.status, (byStatus.get(t.status) ?? 0) + 1);
      byModule.set(t.erpModule, (byModule.get(t.erpModule) ?? 0) + 1);
      const day = new Date(t.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);

      if (t.csatRating != null) {
        csatSum += t.csatRating;
        csatCount += 1;
      }
      const sla = getSlaState(t);
      if (sla.level === "green" || sla.level === "yellow") compliant += 1;
    }

    const slaCompliance = total > 0 ? Math.round((compliant / total) * 100) : 0;
    const csatAvg = csatCount > 0 ? (csatSum / csatCount).toFixed(1) : "—";

    return {
      total,
      byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
        value: count,
      })),
      byModule: Array.from(byModule.entries()).map(([module, count]) => ({
        name: MODULE_LABELS[module as keyof typeof MODULE_LABELS],
        value: count,
      })),
      byDay: Array.from(byDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, count]) => ({ name: day.slice(5), value: count })),
      slaCompliance,
      csatAvg,
      open: tickets.filter((t) => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(t.status)).length,
      resolved: tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
        <p className="text-muted-foreground text-sm">
          Métricas de atención, SLA y satisfacción en tiempo real.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Tickets totales"
          value={stats.total}
          icon={Activity}
          description="Todos los tickets del dominio"
        />
        <SummaryCard
          title="En curso"
          value={stats.open}
          icon={Timer}
          description="Abiertos, asignados y en proceso"
        />
        <SummaryCard
          title="Resueltos / cerrados"
          value={stats.resolved}
          icon={Trophy}
          description="Ciclo de vida completado"
        />
        <SummaryCard
          title="Cumplimiento SLA"
          value={`${stats.slaCompliance}%`}
          icon={Gauge}
          description="Dentro de margen o por vencer"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tickets en el tiempo</CardTitle>
            <CardDescription>Evolución diaria de creación de tickets</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.byDay}>
                <defs>
                  <linearGradient id="fillTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Tickets"
                  stroke="var(--primary)"
                  fill="url(#fillTickets)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento SLA</CardTitle>
            <CardDescription>Porcentaje dentro de margen</CardDescription>
          </CardHeader>
          <CardContent className="flex h-72 flex-col items-center justify-center">
            <div className="relative h-[70%] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ value: stats.slaCompliance }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" fill="var(--primary)" background cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{stats.slaCompliance}%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              CSAT promedio: <span className="font-semibold">{stats.csatAvg} / 5</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets por módulo ERP</CardTitle>
            <CardDescription>Distribución por área funcional afectada</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byModule}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-[10px]" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                  {stats.byModule.map((_, i) => (
                    <Cell key={i} fill="var(--primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de los tickets</CardTitle>
            <CardDescription>Distribución por estado del ciclo de vida</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.byStatus}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" allowDecimals={false} className="text-xs" />
                <YAxis type="category" dataKey="name" width={90} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" name="Tickets" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            Actividad reciente
          </CardTitle>
          <CardDescription>Últimos tickets actualizados en el dominio</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {[...tickets]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 6)
              .map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{t.ticketNumber}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </li>
              ))}
            {!loading && tickets.length === 0 && (
              <li className="py-3 text-center text-muted-foreground">Sin actividad.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardDescription>{title}</CardDescription>
        <Icon className="text-primary size-4" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
