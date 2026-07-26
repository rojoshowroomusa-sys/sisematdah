"use client";

import { useActionState } from "react";

const colores = [
  { value: "#6b7280", label: "Gris", clase: "bg-gray-500" },
  { value: "#ef4444", label: "Rojo", clase: "bg-red-500" },
  { value: "#f97316", label: "Naranja", clase: "bg-orange-500" },
  { value: "#eab308", label: "Amarillo", clase: "bg-yellow-500" },
  { value: "#22c55e", label: "Verde", clase: "bg-green-500" },
  { value: "#14b8a6", label: "Teal", clase: "bg-teal-500" },
  { value: "#3b82f6", label: "Azul", clase: "bg-blue-500" },
  { value: "#a855f7", label: "Púrpura", clase: "bg-purple-500" },
  { value: "#ec4899", label: "Rosa", clase: "bg-pink-500" },
];

interface Props {
  defaultValues?: { name: string; color?: string | null };
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
}

export default function ProjectForm({ defaultValues, onSubmit }: Props) {
  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await onSubmit({
          name: formData.get("name") as string,
          color: (formData.get("color") as string) || undefined,
        });
        return null;
      } catch {
        return "Error al guardar el proyecto";
      }
    },
    null
  );

  return (
    <form action={submitAction} className="max-w-lg space-y-5">
      <div className="bg-stone-800/80 rounded-[10px] border border-stone-700/50 p-5 space-y-4 shadow-card">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Datos del proyecto
        </h2>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1.5">
            Nombre *
          </label>
          <input
            name="name"
            required
            defaultValue={defaultValues?.name}
            className="w-full border border-stone-700 rounded-[6px] px-3 py-2 text-sm text-stone-100 bg-stone-800 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {colores.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  defaultChecked={defaultValues?.color === c.value}
                  className="sr-only peer"
                />
                <span
                  className={`w-6 h-6 rounded-full ${c.clase} ring-offset-2 ring-offset-stone-800 peer-checked:ring-2 peer-checked:ring-teal-400 transition-all`}
                />
                <span className="text-xs text-stone-400 peer-checked:text-stone-200">
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-teal-600 text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar Proyecto"}
      </button>
    </form>
  );
}
