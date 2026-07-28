"use client";

import { useState, useActionState } from "react";
import type { ItemFormData } from "@/lib/types";

interface PresupuestoFormData {
  clienteId: number;
  fecha?: string;
  validez?: string;
  notas?: string;
  impuesto: number;
  estado: string;
  frecuencia?: string;
  items: ItemFormData[];
}

interface Props {
  clientes: { id: number; nombre: string }[];
  productos: { id: number; nombre: string; precio: number }[];
  defaultValues?: {
    clienteId: number;
    fecha: string;
    validez: string;
    notas: string;
    impuesto: number;
    estado: string;
    frecuencia?: string | null;
  };
  defaultItems?: ItemFormData[];
  onSubmit: (data: PresupuestoFormData) => Promise<void>;
}

function emptyItem(): ItemFormData {
  return { key: crypto.randomUUID(), descripcion: "", cantidad: 1, precioUnitario: 0 };
}

export default function PresupuestoForm({ clientes, productos, defaultValues, defaultItems, onSubmit }: Props) {
  const [items, setItems] = useState<ItemFormData[]>(
    defaultItems && defaultItems.length > 0
      ? defaultItems.map((i) => ({ ...i, key: crypto.randomUUID() }))
      : [emptyItem()]
  );

  const [error, submitAction, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        const itemsData = JSON.parse(formData.get("_items") as string);
        await onSubmit({
          clienteId: Number(formData.get("clienteId")),
          fecha: (formData.get("fecha") as string) || undefined,
          validez: (formData.get("validez") as string) || undefined,
          notas: (formData.get("notas") as string) || undefined,
          impuesto: Number(formData.get("impuesto")),
          estado: (formData.get("estado") as string) || "borrador",
          frecuencia: (formData.get("frecuencia") as string) || undefined,
          items: itemsData,
        });
        return null;
      } catch {
        return "Error al guardar el presupuesto";
      }
    },
    null
  );

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  const impuesto = defaultValues?.impuesto ?? 21;
  const total = subtotal + subtotal * (impuesto / 100);

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(key: string, field: keyof ItemFormData, value: string | number | undefined) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const updated = { ...i, [field]: value };
        if (field === "productoId") {
          const prod = productos.find((p) => p.id === Number(value));
          if (prod) {
            updated.descripcion = prod.nombre;
            updated.precioUnitario = prod.precio;
          }
        }
        return updated;
      })
    );
  }

  return (
    <form action={submitAction} className="max-w-3xl space-y-5">
      <div className="bg-surface rounded-[10px] border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="gauge leading-none px-1.5 py-0.5">ⓘ</span>
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Orden de trabajo</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Cliente *</label>
            <select
              name="clienteId"
              required
              defaultValue={defaultValues?.clienteId}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Fecha</label>
            <input
              name="fecha"
              type="date"
              defaultValue={defaultValues?.fecha ?? new Date().toISOString().split("T")[0]}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Validez</label>
            <input
              name="validez"
              placeholder="Ej: 30 días"
              defaultValue={defaultValues?.validez}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">IVA (%)</label>
            <input
              name="impuesto"
              type="number"
              defaultValue={defaultValues?.impuesto ?? 21}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Estado</label>
            <select
              name="estado"
              defaultValue={defaultValues?.estado || "borrador"}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              <option value="borrador">Borrador</option>
              <option value="enviado">Enviado</option>
              <option value="aprobado">Aprobado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Recurrencia</label>
            <select
              name="frecuencia"
              defaultValue={defaultValues?.frecuencia || ""}
              className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
            >
              <option value="">No recurrente</option>
              <option value="mensual">Mensual</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[10px] border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="gauge leading-none px-1.5 py-0.5">☰</span>
            <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Partidas</h2>
          </div>
          <button type="button" onClick={addItem} className="text-sm font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
            <span className="text-base leading-none">+</span> Añadir
          </button>
        </div>

        <input type="hidden" name="_items" value={JSON.stringify(items.map(({ productoId, descripcion, cantidad, precioUnitario }) => ({ productoId, descripcion, cantidad, precioUnitario })))} />

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={item.key} className="flex gap-3 items-start p-2 -mx-2 rounded-[6px] even:bg-stone-50/50">
              <div className="flex-1">
                {productos.length > 0 && (
                  <select
                    value={item.productoId ?? ""}
                    onChange={(e) => updateItem(item.key!, "productoId", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 mb-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
                  >
                    <option value="">-- Seleccionar --</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre} - {p.precio}€</option>
                    ))}
                  </select>
                )}
                <div className="flex flex-wrap gap-2">
                  <input
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => updateItem(item.key!, "descripcion", e.target.value)}
                    className="w-full sm:flex-1 sm:w-auto border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Cant"
                      value={item.cantidad}
                      onChange={(e) => updateItem(item.key!, "cantidad", Number(e.target.value))}
                      className="flex-1 sm:w-16 border border-border rounded-[6px] px-2 py-2 text-sm text-text-primary bg-stone-50 text-center focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio"
                      value={item.precioUnitario}
                      onChange={(e) => updateItem(item.key!, "precioUnitario", Number(e.target.value))}
                      className="flex-1 sm:w-24 border border-border rounded-[6px] px-2 py-2 text-sm text-text-primary bg-stone-50 text-right focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                    />
                    <div className="hidden sm:flex w-24 items-center justify-end text-sm font-mono text-text-secondary">
                      {(item.cantidad * item.precioUnitario).toFixed(2)} €
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.key!)} className="self-center text-text-tertiary hover:text-destructive transition-colors text-lg leading-none px-1">
                        ×
                      </button>
                    )}
                  </div>
                  <div className="sm:hidden w-full text-right text-sm font-mono text-text-secondary">
                    = {(item.cantidad * item.precioUnitario).toFixed(2)} €
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 flex flex-col items-end gap-1">
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">Subtotal</span>
            <span className="font-mono w-24 text-right text-text-secondary">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">IVA ({impuesto}%)</span>
            <span className="font-mono w-24 text-right text-text-secondary">{(subtotal * impuesto / 100).toFixed(2)} €</span>
          </div>
          <div className="flex gap-10 text-sm font-medium">
            <span className="text-text-primary">Total</span>
            <span className="font-mono w-24 text-right text-text-primary">{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="sticky-note p-4 space-y-2">
        <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider">Notas</label>
        <textarea
          name="notas"
          rows={3}
          defaultValue={defaultValues?.notas}
          placeholder="Condiciones, observaciones..."
          className="w-full bg-transparent border-none px-0 py-0 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-white px-6 py-2.5 rounded-[8px] text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50 active:scale-[0.97] shadow-card"
        >
          {pending ? "Guardando..." : "Guardar Presupuesto"}
        </button>
        <span className="text-[11px] text-text-tertiary font-mono">
          {items.length} {items.length === 1 ? "partida" : "partidas"} · {total.toFixed(2)} € total
        </span>
      </div>
    </form>
  );
}
