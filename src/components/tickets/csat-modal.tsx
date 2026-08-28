"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { TicketResponseDto } from "@/types/api";
import { cn } from "@/lib/utils";

const RATINGS = [
  { value: 1, label: "Muy insatisfecho" },
  { value: 2, label: "Insatisfecho" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Satisfecho" },
  { value: 5, label: "Muy satisfecho" },
];

export function CsatModal({
  ticket,
  open,
  onOpenChange,
  onClosed,
}: {
  ticket: TicketResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosed: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!ticket || rating === 0) return;
    setLoading(true);
    try {
      await api.patch(`/api/v1/tickets/${ticket.id}/close`, { rating, comment });
      toast.success("Ticket cerrado y calificación registrada");
      setRating(0);
      setComment("");
      onOpenChange(false);
      onClosed();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Califica tu experiencia</DialogTitle>
          <DialogDescription>
            ¿Cómo fue la atención en el ticket{" "}
            <span className="font-medium">{ticket?.ticketNumber}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex gap-1">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(r.value)}
                aria-label={`${r.value} estrellas`}
                className="group"
              >
                <Star
                  className={cn(
                    "size-9 transition-all",
                    r.value <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted-foreground group-hover:scale-110",
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {rating > 0 ? RATINGS[rating - 1].label : "Selecciona una calificación"}
          </p>

          <Textarea
            placeholder="Comentario opcional (máx. 500 caracteres)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="min-h-24"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || loading}>
            {loading ? "Enviando…" : "Enviar calificación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
