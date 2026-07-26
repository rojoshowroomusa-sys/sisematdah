"use client";

import { useActionState } from "react";

interface Props {
  defaultValues?: { nombre: string; email?: string | null; telefono?: string | null; direccion?: string | null };
  onSubmit: (data: { nombre: string; email?: string; telefono?: string; direccion?: string }) => Promise<void>;
}

export default function ClienteForm({ defaultValues, onSubmit }: Props) {
  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await onSubmit({
          nombre: formData.get("nombre") as string,
          email: (formData.get("email") as string) || undefined,
          telefono: (formData.get("telefono") as string) || undefined,
          direccion: (formData.get("direccion") as string) || undefined,
        });
        return null;
      } catch {
        return "Error al guardar el cliente";
      }
    },
    null
  );

  return (
    <form action={submitAction} className="max-w-lg space-y-5">
      <div className="bg-surface rounded-[10px] border border-border p-5 space-y-4">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Datos del cliente</h2>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre *</label>
          <input
            name="nombre"
            required
            defaultValue={defaultValues?.nombre}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Teléfono</label>
          <input
            name="telefono"
            defaultValue={defaultValues?.telefono ?? ""}
            className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Dirección</label>
          <textarea
            name="direccion"
            rows={2}
            defaultValue={defaultValues?.direccion ?? ""}
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
