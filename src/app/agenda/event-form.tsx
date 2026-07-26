"use client";

import { useActionState } from "react";

interface Props {
  clientes: { id: number; nombre: string }[];
  defaultValues?: {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    clienteId: number | null;
  };
  onSubmit: (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    duration?: number;
    type?: string;
    clienteId?: number;
  }) => Promise<void>;
}

const tipos = [
  { value: "cita", label: "Cita" },
  { value: "reunion", label: "Reunión" },
  { value: "llamada", label: "Llamada" },
  { value: "recordatorio", label: "Recordatorio" },
  { value: "otro", label: "Otro" },
];

export default function EventForm({ clientes, defaultValues, onSubmit }: Props) {
  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await onSubmit({
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || undefined,
          date: formData.get("date") as string,
          time: (formData.get("time") as string) || undefined,
          duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
          type: (formData.get("type") as string) || "cita",
          clienteId: formData.get("clienteId") ? Number(formData.get("clienteId")) : undefined,
        });
        return null;
      } catch {
        return "Error al guardar el evento";
      }
    },
    null
  );

  return (
    <form action={submitAction} className="max-w-lg space-y-5">
      <div className="bg-surface rounded-[10px] border border-border p-5 space-y-4 shadow-card">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Datos del evento</h2>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Título *</label>
          <input
            name="title"
            required
            defaultValue={defaultValues?.title}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Fecha *</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={defaultValues?.date ?? new Date().toISOString().split("T")[0]}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Hora</label>
            <input
              name="time"
              type="time"
              defaultValue={defaultValues?.time}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo</label>
            <select
              name="type"
              defaultValue={defaultValues?.type || "cita"}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Duración (min)</label>
            <input
              name="duration"
              type="number"
              defaultValue={defaultValues?.duration ?? 60}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Cliente relacionado</label>
          <select
            name="clienteId"
            defaultValue={defaultValues?.clienteId ?? ""}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
          >
            <option value="">Sin cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Descripción</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={defaultValues?.description}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Evento"}
      </button>
    </form>
  );
}
