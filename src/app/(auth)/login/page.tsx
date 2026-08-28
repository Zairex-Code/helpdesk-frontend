"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Sparkles, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { DEMO_ACCOUNTS, ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { LoginResponseDto, Role } from "@/types/api";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

const ROLE_HOME: Record<Role, string> = {
  CLIENTE: "/portal",
  SOPORTE_TI: "/agent/tickets",
  ADMIN: "/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<LoginResponseDto>("/api/v1/auth/login", values);
      setToken(data.token);
      const role = (JSON.parse(atob(data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
        .groups?.[0] ?? null) as Role | null;
      router.replace(role ? ROLE_HOME[role] : "/portal");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh w-full lg:grid-cols-2">
      <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <Sparkles className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">SoftTech HelpDesk</span>
        </div>

        <div className="space-y-6">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            Atención de incidencias con SLA reactivo y trazabilidad total.
          </h1>
          <p className="max-w-md text-white/80">
            Plataforma enterprise de gestión de tickets alineada a ISO/IEC 25010 y CMMI,
            con asignación automática de prioridad y vencimientos de SLA.
          </p>
        </div>

        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} SoftTech Solutions. Soporte corporativo.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <div className="brand-gradient flex size-11 items-center justify-center rounded-xl md:hidden">
              <Ticket className="size-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-muted-foreground text-sm">
              Accede con tu cuenta corporativa o usa una cuenta de prueba.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setValue("email", account.email);
                  setValue("password", account.password);
                  setError(null);
                }}
                className="hover:border-primary/50 hover:bg-accent rounded-xl border p-3 text-left transition-colors"
              >
                <p className="text-xs font-semibold">{ROLES[account.role]}</p>
                <p className="text-muted-foreground truncate text-[11px]">{account.email}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@softtech.com"
                  className="pl-9"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <KeyRound className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="py-3">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">Acceso de desarrollo</span>
            <Separator className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
