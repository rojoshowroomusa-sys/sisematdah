"use client";

import { useActionState } from "react";

const energyOptions = [
  { value: "cero_energia", label: "Mínima", description: "Modo supervivencia" },
  { value: "media_energia", label: "Media", description: "Ritmo regular" },
  { value: "hiperfoco", label: "Hiperfoco", description: "Alta concentración" },
];

const statusOptions = [
  { value: "inbox", label: "Pendiente" },
  { value: "next_up", label: "Siguiente" },
  { value: "in_progress", label: "En curso" },
  { value: "done", label: "Completada" },
  { value: "archived", label: "Archivada" },
];

interface Props {
  projectOptions: { id: number; name: string }[];
  defaultValues: {
    title: string;
    energyLevel?: string | null;
    estimatedMinutes?: number | null;
    status?: string | null;
    projectId?: number | null;
  };
  onSubmit: (data: {
    title: string;
    energyLevel?: string;
    estimatedMinutes?: number;
    status?: string;
    projectId?: number | null;
  }) => Promise<void>;
}

export default function TaskForm({ projectOptions, defaultValues, onSubmit }: Props) {
  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await onSubmit({
          title: formData.get("title") as string,
          energyLevel: (formData.get("energyLevel") as string) || undefined,
          estimatedMinutes: formData.get("estimatedMinutes")
            ? Number(formData.get("estimatedMinutes"))
            : undefined,
          status: (formData.get("status") as string) || undefined,
          projectId: formData.get("projectId")
            ? Number(formData.get("projectId"))
            : null,
        });
        return null;
      } catch {
        return "Error al guardar la tarea";
      }
    },
    null
  );

  return (
    <form action={submitAction} className="max-w-lg space-y-5">
      <div className="bg-stone-800/80 rounded-[10px] border border-stone-700/50 p-5 space-y-4 shadow-card">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Datos de la tarea
        </h2>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1.5">
            Título *
          </label>
          <input
            name="title"
            required
            defaultValue={defaultValues?.title}
            className="w-full border border-stone-700 rounded-[6px] px-3 py-2 text-sm text-stone-100 bg-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Nivel de energía
          </label>
          <div className="flex flex-wrap gap-2">
            {energyOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 min-w-[120px] cursor-pointer rounded-[8px] border p-3 transition-colors ${
                  defaultValues?.energyLevel === opt.value
                    ? "border-teal-600 bg-teal-900/20"
                    : "border-stone-700 bg-stone-800/50 hover:border-stone-600"
                }`}
              >
                <input
                  type="radio"
                  name="energyLevel"
                  value={opt.value}
                  defaultChecked={defaultValues?.energyLevel === opt.value}
                  className="sr-only"
                />
                <p className="text-sm font-medium text-stone-200">{opt.label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{opt.description}</p>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Tiempo estimado (min)
            </label>
            <input
              name="estimatedMinutes"
              type="number"
              min={1}
              defaultValue={defaultValues?.estimatedMinutes ?? ""}
              placeholder="—"
              className="w-full border border-stone-700 rounded-[6px] px-3 py-2 text-sm text-stone-100 bg-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Estado
            </label>
            <select
              name="status"
              defaultValue={defaultValues?.status ?? "inbox"}
              className="w-full border border-stone-700 rounded-[6px] px-3 py-2 text-sm text-stone-100 bg-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors appearance-none"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1.5">
            Proyecto
          </label>
          <select
            name="projectId"
            defaultValue={defaultValues?.projectId ?? ""}
            className="w-full border border-stone-700 rounded-[6px] px-3 py-2 text-sm text-stone-100 bg-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors appearance-none"
          >
            <option value="">Sin proyecto</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-teal-600 text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
