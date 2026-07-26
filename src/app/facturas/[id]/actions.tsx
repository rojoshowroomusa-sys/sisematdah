"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cambiarEstadoFactura } from "@/lib/actions";
import { showToast } from "@/components/toast";

export function FacturaActions({ facturaId, estado }: { facturaId: number; estado: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const acciones: { estado: string; label: string; color: string }[] = [];
  if (estado === "emitida") {
    acciones.push({ estado: "pagada", label: "Marcar como pagada", color: "bg-green-600 text-white hover:bg-green-700" });
    acciones.push({ estado: "anulada", label: "Anular", color: "text-destructive border border-destructive/20 hover:bg-destructive-soft" });
  }
  if (estado === "pagada") {
    acciones.push({ estado: "anulada", label: "Anular", color: "text-destructive border border-destructive/20 hover:bg-destructive-soft" });
  }

  async function handle(nuevoEstado: string) {
    setLoading(true);
    try {
      await cambiarEstadoFactura(facturaId, nuevoEstado);
      showToast(`Factura marcada como "${nuevoEstado}"`);
      router.refresh();
    } catch {
      showToast("Error al cambiar estado", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {acciones.map((a) => (
        <button
          key={a.estado}
          onClick={() => handle(a.estado)}
          disabled={loading}
          className={`text-sm font-medium px-4 py-2 rounded-[8px] transition-colors disabled:opacity-50 ${a.color}`}
        >
          {loading ? "..." : a.label}
        </button>
      ))}
    </div>
  );
}
