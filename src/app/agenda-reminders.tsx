"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface EventItem {
  id: number;
  title: string;
  time: string | null;
  type: string;
  cliente: { nombre: string } | null;
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

export function AgendaReminders({ eventos }: { eventos: EventItem[] }) {
  if (eventos.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Hoy
        </h3>
        <Link href="/agenda" className="text-xs font-medium text-accent hover:text-accent-hover">
          Ver agenda →
        </Link>
      </div>
      <div className="space-y-2">
        {eventos.map((e) => (
          <Link
            key={e.id}
            href={`/agenda?mes=${new Date().getMonth() + 1}&año=${new Date().getFullYear()}&dia=${new Date().getDate()}&vista=mes`}
            className="block p-2.5 rounded-[8px] border border-border hover:border-accent-soft hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] ${typeColors[e.type] || "bg-stone-100 text-stone-600"}`}>
                {typeLabels[e.type] || e.type}
              </span>
              {e.time && <span className="text-xs font-mono text-text-tertiary">{e.time}</span>}
            </div>
            <p className="text-sm font-medium text-text-primary mt-0.5">{e.title}</p>
            {e.cliente && <p className="text-xs text-text-tertiary mt-0.5">{e.cliente.nombre}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
