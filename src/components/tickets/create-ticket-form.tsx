"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Timer } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api, getErrorMessage } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import {
  ERP_MODULES,
  MODULE_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  SLA_MATRIX,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ErpModule, Priority, TicketRequestDto } from "@/types/api";

const schema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres").max(150, "Máximo 150 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres").max(2000, "Máximo 2000 caracteres"),
  erpModule: z.enum(ERP_MODULES),
  priority: z.enum(PRIORITIES),
});

type FormValues = z.infer<typeof schema>;

export function CreateTicketForm({ onCreated }: { onCreated: () => void }) {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState<Priority | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { erpModule: "FINANCIAL" },
  });

  const selectedModule = useWatch({ control, name: "erpModule" });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const payload: TicketRequestDto = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        erpModule: values.erpModule,
        requesterId: session?.email ?? "cliente@softtech.com",
        vipCustomer: false,
      };
      await api.post("/api/v1/tickets", payload);
      toast.success("Ticket creado correctamente");
      reset();
      onCreated();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="size-5 text-primary" />
          Crear nuevo ticket
        </CardTitle>
        <CardDescription>
          Reporta una incidencia en menos de 15 segundos con opciones guiadas del ERP.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Resumen breve del incidente" {...register("title")} />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Módulo ERP</Label>
              <Select
                value={selectedModule}
                onValueChange={(v) => setValue("erpModule", v as ErpModule)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona módulo" />
                </SelectTrigger>
                <SelectContent>
                  {ERP_MODULES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODULE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={priority ?? undefined}
                onValueChange={(v) => {
                  setPriority(v as Priority);
                  setValue("priority", v as Priority);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona prioridad" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {priority && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <Timer className="size-4" />
              SLA estimado: respuesta en {SLA_MATRIX[priority].response} · resolución en{" "}
              {SLA_MATRIX[priority].resolution}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el problema, contexto y pasos para reproducirlo…"
              className="min-h-28"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs">{errors.description.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Creando…" : "Enviar ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
