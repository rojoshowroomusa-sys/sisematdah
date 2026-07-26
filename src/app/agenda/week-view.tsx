"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { actualizarEvento } from "@/lib/actions";
import { showToast } from "@/components/toast";
import { DeleteEventButton } from "./delete-event";

interface EventItem {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  time: string | null;
  duration: number | null;
  type: string;
  clienteId: number | null;
  cliente: { id: number; nombre: string; email: string | null; telefono: string | null } | null;
}

interface Props {
  eventos: EventItem[];
  mes: number;
  año: number;
}

const typeColors: Record<string, string> = {
  cita: "bg-blue-100 text-blue-700",
  reunion: "bg-purple-100 text-purple-700",
  llamada: "bg-amber-100 text-amber-700",
  recordatorio: "bg-teal-100 text-teal-700",
  otro: "bg-stone-100 text-stone-600",
};

const typeLabels: Record<string, string> = {
  cita: "Cita",
  reunion: "Reunión",
  llamada: "Llamada",
  recordatorio: "Recordatorio",
  otro: "Otro",
};

export function WeekView({ eventos, mes, año }: Props) {
  const router = useRouter();
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const primerSemana = getStartOfWeek(new Date(año, mes, 1));
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(primerSemana);
    d.setDate(d.getDate() + i);
    return d;
  });

  function getEventsForDay(day: number) {
    return eventos.filter((e) => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === mes);
  }

  async function handleDrop(e: React.DragEvent, targetDay: number) {
    e.preventDefault();
    setDragOverDay(null);
    const eventId = parseInt(e.dataTransfer.getData("text/event-id"));
    if (!eventId) return;

    const targetDate = new Date(año, mes, targetDay);
    try {
      await actualizarEvento(eventId, { date: targetDate.toISOString().split("T")[0] });
      showToast("Evento movido");
      router.refresh();
    } catch {
      showToast("Error al mover evento", "error");
    }
  }

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const hoy = new Date();

  return (
    <div className="grid grid-cols-7 gap-1 min-h-[400px]">
      {semana.map((d, i) => {
        const dayNum = d.getDate();
        const isToday = dayNum === hoy.getDate() && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
        const dayEvents = getEventsForDay(dayNum);

        return (
          <div
            key={i}
            onDragOver={(e) => { e.preventDefault(); setDragOverDay(dayNum); }}
            onDragLeave={() => setDragOverDay(null)}
            onDrop={(e) => handleDrop(e, dayNum)}
            className={`rounded-[8px] border p-2 transition-colors ${
              dragOverDay === dayNum
                ? "border-accent bg-accent/5"
                : isToday
                ? "border-accent-soft bg-accent/5"
                : "border-border"
            }`}
          >
            <Link
              href={`/agenda?mes=${mes + 1}&año=${año}&dia=${dayNum}&vista=semana`}
              className={`block text-center text-xs font-semibold mb-2 py-1 rounded-[4px] transition-colors ${
                isToday ? "bg-accent text-white" : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {diasSemana[i]} {dayNum}
            </Link>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/event-id", String(ev.id))}
                  className="px-2 py-1 rounded-[4px] bg-surface-alt border border-border/50 text-xs cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow truncate"
                  title={ev.title}
                >
                  <div className="flex items-center gap-1">
                    {ev.time && <span className="text-[10px] font-mono text-text-tertiary">{ev.time}</span>}
                    <span className={`text-[10px] font-medium px-1 py-0.5 rounded-[2px] ${typeColors[ev.type] || "bg-stone-100 text-stone-600"}`}>
                      {typeLabels[ev.type] || ev.type}
                    </span>
                  </div>
                  <p className="font-medium text-text-primary truncate">{ev.title}</p>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <Link
                  href={`/agenda?mes=${mes + 1}&año=${año}&dia=${dayNum}&vista=semana`}
                  className="block text-[10px] text-accent hover:text-accent-hover text-center py-0.5"
                >
                  +{dayEvents.length - 3} más
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}
