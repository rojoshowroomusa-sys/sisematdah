"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEUR, formatDate } from "@/lib/format";
import { BudgetStatusBadge } from "./budget-status-badge";
import { QuickStatusButtons } from "./budget-actions-client";
import { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";
import { cambiarEstadoPresupuesto, eliminarPresupuesto } from "@/lib/actions";
import { ExportPresupuestosButton } from "./presupuestos-export";

interface PresupuestoItem {
  id: number;
  numero: number;
  fecha: Date;
  estado: string;
  frecuencia: string | null;
  esPlantilla: boolean;
  cliente: { nombre: string };
  items: { total: number }[];
  impuesto: number;
}

interface Props {
  presupuestos: PresupuestoItem[];
}

type SortKey = "numero" | "fecha" | "cliente" | "total" | "estado";

const PAGE_SIZE = 15;

export function PresupuestosDashboard({ presupuestos }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortKey, setSortKey] = useState<SortKey>("numero");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const page = Number(searchParams.get("page") || "1");
  const { confirm, dialog } = useConfirm();

  const sorted = useMemo(() => {
    const list = presupuestos.map((p) => ({
      ...p,
      clienteNombre: p.cliente.nombre,
      total: p.items.reduce((s, i) => s + i.total, 0) * (1 + p.impuesto / 100),
    }));
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "numero": cmp = a.numero - b.numero; break;
        case "fecha": cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime(); break;
        case "cliente": cmp = a.clienteNombre.localeCompare(b.clienteNombre); break;
        case "total": cmp = a.total - b.total; break;
        case "estado": cmp = a.estado.localeCompare(b.estado); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [presupuestos, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagedIds = paged.map((p) => p.id);
  const allSelected = pagedIds.length > 0 && pagedIds.every((id) => selected.has(id));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pagedIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pagedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  async function batchStatus(estado: string) {
    setBatchLoading(true);
    const ids = Array.from(selected);
    const labels: Record<string, string> = { enviado: "Enviados", aprobado: "Aprobados", pagado: "Pagados", vencido: "Vencidos" };
    try {
      await Promise.all(ids.map((id) => cambiarEstadoPresupuesto(id, estado)));
      showToast(`${ids.length} presupuestos marcados como "${labels[estado] || estado}"`);
      setSelected(new Set());
      router.refresh();
    } catch {
      showToast("Error al cambiar estado en lote", "error");
    } finally {
      setBatchLoading(false);
    }
  }

  async function batchDelete() {
    setBatchLoading(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => eliminarPresupuesto(id)));
      showToast(`${ids.length} presupuestos eliminados`);
      setSelected(new Set());
      router.refresh();
    } catch {
      showToast("Error al eliminar en lote", "error");
    } finally {
      setBatchLoading(false);
    }
  }

  function SortHeader({ label, sort }: { label: string; sort: SortKey }) {
    const active = sortKey === sort;
    return (
      <button
        onClick={() => toggleSort(sort)}
        className={`font-medium text-xs uppercase tracking-wider transition-colors flex items-center gap-1 ${
          active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
        }`}
      >
        {label}
        {active && <span className="text-[9px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
      </button>
    );
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="bg-accent text-white rounded-[10px] px-4 py-2.5 mb-3 flex items-center gap-3 text-sm shadow-elevated animate-in">
          <span className="font-medium">{selected.size} seleccionados</span>
          <span className="opacity-40">|</span>
          <span className="text-xs text-white/70">Estado:</span>
          <select
            onChange={(e) => { const v = e.target.value; if (v) batchStatus(v); }}
            disabled={batchLoading}
            className="text-xs bg-white/15 text-white border border-white/20 rounded-[6px] px-2 py-1 focus:outline-none disabled:opacity-50"
          >
            <option value="">Cambiar...</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
          </select>
          <span className="opacity-40">|</span>
          <button
            onClick={() =>
              confirm({
                title: "Eliminar presupuestos",
                message: `¿Eliminar ${selected.size} presupuestos? Esta acción no se puede deshacer.`,
                confirmLabel: "Eliminar todo",
                onConfirm: batchDelete,
              })
            }
            disabled={batchLoading}
            className="text-xs font-medium text-red-200 hover:text-white disabled:opacity-50 transition-colors"
          >
            {batchLoading ? "..." : "Eliminar"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-white/60 hover:text-white transition-colors"
          >
            Deseleccionar
          </button>
        </div>
      )}

      <div className="flex items-center justify-end mb-2">
        <ExportPresupuestosButton
          presupuestos={sorted.map((p) => ({
            id: p.id,
            numero: p.numero,
            fecha: p.fecha,
            estado: p.estado,
            clienteNombre: p.clienteNombre,
            total: p.total,
          }))}
        />
      </div>

      <div className="bg-surface border border-border rounded-[10px] overflow-hidden shadow-card">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left">
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                />
              </th>
              <th className="px-2 py-3 w-16"><SortHeader label="N°" sort="numero" /></th>
              <th className="px-2 py-3"><SortHeader label="Cliente" sort="cliente" /></th>
              <th className="px-2 py-3 w-24"><SortHeader label="Fecha" sort="fecha" /></th>
              <th className="px-2 py-3 text-right w-24"><SortHeader label="Total" sort="total" /></th>
              <th className="px-2 py-3 w-28"><SortHeader label="Estado" sort="estado" /></th>
              <th className="px-2 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-border/50 last:border-b-0 transition-colors ${
                  selected.has(p.id) ? "bg-accent/5" : "hover:bg-stone-50/50"
                }`}
              >
                <td className="px-3 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                  />
                </td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-1">
                    <Link href={`/presupuestos/${p.id}`} className="font-mono text-xs text-text-tertiary hover:text-accent">
                      #{String(p.numero).padStart(4, "0")}
                    </Link>
                    {p.esPlantilla && <span className="text-[9px] font-medium px-1 py-0.5 rounded-[3px] bg-purple-100 text-purple-700">PLANTILLA</span>}
                  </div>
                </td>
                <td className="px-2 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/presupuestos/${p.id}`} className="font-medium text-text-primary hover:text-accent transition-colors">
                      {p.clienteNombre}
                    </Link>
                    {p.frecuencia && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] bg-accent-soft text-accent">↻</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3.5 text-text-tertiary text-xs">{formatDate(p.fecha)}</td>
                <td className="px-2 py-3.5 text-right font-mono font-semibold text-text-primary">{formatEUR(p.total)}</td>
                <td className="px-2 py-3.5">
                  <BudgetStatusBadge status={p.estado} presupuestoId={p.id} compact />
                </td>
                <td className="px-2 py-3.5">
                  <QuickStatusButtons presupuestoId={p.id} currentStatus={p.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-text-tertiary">
            Página {page} de {totalPages} ({sorted.length} resultados)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-[6px] text-text-secondary hover:bg-surface border border-border disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-1">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-text-tertiary">...</span>}
                  <button
                    onClick={() => goToPage(p)}
                    className={`px-3 py-1.5 rounded-[6px] transition-colors ${
                      p === page
                        ? "bg-accent text-white"
                        : "text-text-secondary hover:bg-surface border border-border"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-[6px] text-text-secondary hover:bg-surface border border-border disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}

      {dialog()}
    </>
  );
}
