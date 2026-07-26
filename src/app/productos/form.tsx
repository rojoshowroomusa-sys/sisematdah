"use client";

import { useActionState } from "react";

const categorias = [
  { value: "material", label: "Material" },
  { value: "servicio", label: "Servicio" },
  { value: "digital", label: "Digital" },
  { value: "suscripcion", label: "Suscripción" },
  { value: "consultoria", label: "Consultoría" },
  { value: "otro", label: "Otro" },
];

interface Props {
  defaultValues?: { nombre: string; descripcion?: string | null; precio: number; tipo?: string; categoria?: string | null };
  onSubmit: (data: { nombre: string; descripcion?: string; precio: number; tipo?: string; categoria?: string }) => Promise<void>;
}

export default function ProductoForm({ defaultValues, onSubmit }: Props) {
  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await onSubmit({
          nombre: formData.get("nombre") as string,
          descripcion: (formData.get("descripcion") as string) || undefined,
          precio: parseFloat(formData.get("precio") as string),
          tipo: (formData.get("tipo") as string) || "producto",
          categoria: (formData.get("categoria") as string) || undefined,
        });
        return null;
      } catch {
        return "Error al guardar el producto";
      }
    },
    null
  );

  return (
    <form action={submitAction} className="max-w-lg space-y-5">
      <div className="bg-surface rounded-[10px] border border-border p-5 space-y-4 shadow-card">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Datos del producto</h2>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre *</label>
          <input
            name="nombre"
            required
            defaultValue={defaultValues?.nombre}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo</label>
            <select
              name="tipo"
              defaultValue={defaultValues?.tipo || "producto"}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Categoría</label>
            <select
              name="categoria"
              defaultValue={defaultValues?.categoria ?? ""}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              <option value="">Sin categoría</option>
              {categorias.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Precio (€) *</label>
          <input
            name="precio"
            type="number"
            step="0.01"
            required
            defaultValue={defaultValues?.precio}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            defaultValue={defaultValues?.descripcion ?? ""}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
