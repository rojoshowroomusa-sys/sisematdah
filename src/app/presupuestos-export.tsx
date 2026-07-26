"use client";

import { showToast } from "@/components/toast";
import { formatEUR, formatDate } from "@/lib/format";

interface PresupuestoItem {
  id: number;
  numero: number;
  fecha: Date;
  estado: string;
  clienteNombre: string;
  total: number;
}

export function ExportPresupuestosButton({ presupuestos }: { presupuestos: PresupuestoItem[] }) {
  function handleExport() {
    const header = "Número,Cliente,Fecha,Estado,Total";
    const rows = presupuestos.map((p) =>
      [
        `#${String(p.numero).padStart(4, "0")}`,
        `"${p.clienteNombre.replace(/"/g, '""')}"`,
        formatDate(p.fecha),
        p.estado,
        formatEUR(p.total),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "presupuestos.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exportados ${presupuestos.length} presupuestos`);
  }

  return (
    <button
      onClick={handleExport}
      className="text-xs font-medium text-text-secondary hover:text-accent px-2.5 py-1.5 rounded-[6px] hover:bg-accent-soft transition-colors"
    >
      Exportar CSV
    </button>
  );
}
