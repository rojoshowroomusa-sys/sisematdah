"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eliminarProducto } from "@/lib/actions";
import { formatEUR } from "@/lib/format";
import { productosToCSV } from "@/lib/csv";
import Toast, { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

interface ProductItem {
  id: number;
  nombre: string;
  tipo: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
}

interface Props {
  items: ProductItem[];
  categoriaLabels: Record<string, string>;
  categoriaColors: Record<string, string>;
}

export function ProductosList({ items, categoriaLabels, categoriaColors }: Props) {
  const router = useRouter();
  const [vista, setVista] = useState<"tabla" | "grid">("tabla");
  const { confirm, dialog } = useConfirm();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number, nombre: string) {
    setDeletingId(id);
    try {
      await eliminarProducto(id);
      showToast("Producto eliminado");
      router.refresh();
    } catch {
      showToast("No se puede eliminar: el producto está en uso", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleExport() {
    const csv = productosToCSV(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Catálogo exportado");
  }

  if (items.length === 0) {
    return (
      <>
        <div className="text-center py-20 text-text-tertiary">
          <p className="text-base font-medium text-text-secondary mb-1">Sin resultados</p>
          <p className="text-sm">Probá con otros filtros</p>
        </div>
        <Toast />
        {dialog()}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-3">
        <button
          onClick={handleExport}
          className="text-xs font-medium text-text-secondary hover:text-accent px-2.5 py-1.5 rounded-[6px] hover:bg-accent-soft transition-colors"
        >
          Exportar CSV
        </button>
        <div className="flex border border-border rounded-[6px] overflow-hidden">
          <button
            onClick={() => setVista("tabla")}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
              vista === "tabla" ? "bg-accent text-white" : "text-text-secondary hover:bg-stone-50"
            }`}
          >
            ☰
          </button>
          <button
            onClick={() => setVista("grid")}
            className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
              vista === "grid" ? "bg-accent text-white" : "text-text-secondary hover:bg-stone-50"
            }`}
          >
            ⊞
          </button>
        </div>
      </div>

      {vista === "tabla" ? (
        <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt text-left">
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Tipo</th>
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Categoría</th>
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Descripción</th>
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider text-right">Precio</th>
                <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider w-28"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/productos/${p.id}`} className="font-medium text-text-primary hover:text-accent transition-colors">
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] ${
                      p.tipo === "servicio" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {p.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.categoria ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] ${categoriaColors[p.categoria] || "bg-stone-100 text-stone-600"}`}>
                        {categoriaLabels[p.categoria] || p.categoria}
                      </span>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary truncate max-w-xs">{p.descripcion || "—"}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-text-primary font-medium">{formatEUR(p.precio)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2.5 items-center">
                      <Link href={`/productos/${p.id}`} className="text-accent hover:text-accent-hover text-xs font-medium">
                        Ver
                      </Link>
                      <Link href={`/productos/${p.id}/editar`} className="text-accent hover:text-accent-hover text-xs font-medium">
                        Editar
                      </Link>
                      <button
                        onClick={() =>
                          confirm({
                            title: "Eliminar producto",
                            message: `¿Eliminar "${p.nombre}"?`,
                            confirmLabel: deletingId === p.id ? "..." : "Eliminar",
                            onConfirm: () => handleDelete(p.id, p.nombre),
                          })
                        }
                        disabled={deletingId === p.id}
                        className="text-red-500 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-surface border border-border rounded-[10px] p-4 hover:border-border-emphasis transition-colors shadow-card"
            >
              <Link href={`/productos/${p.id}`} className="block">
                <h3 className="font-medium text-sm text-text-primary truncate">{p.nombre}</h3>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] ${
                    p.tipo === "servicio" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {p.tipo}
                  </span>
                  {p.categoria && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] ${categoriaColors[p.categoria] || "bg-stone-100 text-stone-600"}`}>
                      {categoriaLabels[p.categoria] || p.categoria}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold font-mono text-text-primary mt-3">{formatEUR(p.precio)}</p>
                {p.descripcion && (
                  <p className="text-xs text-text-tertiary mt-1.5 line-clamp-2">{p.descripcion}</p>
                )}
              </Link>
              <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                <Link href={`/productos/${p.id}/editar`} className="text-xs font-medium text-accent hover:text-accent-hover">
                  Editar
                </Link>
                <button
                  onClick={() =>
                    confirm({
                      title: "Eliminar producto",
                      message: `¿Eliminar "${p.nombre}"?`,
                      confirmLabel: deletingId === p.id ? "..." : "Eliminar",
                      onConfirm: () => handleDelete(p.id, p.nombre),
                    })
                  }
                  disabled={deletingId === p.id}
                  className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast />
      {dialog()}
    </>
  );
}
