"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { eliminarCliente } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

interface ClienteItem {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  createdAt: Date;
  presupuestosCount: number;
}

interface Props {
  items: ClienteItem[];
}

export function ClientesList({ items }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const sort = sp.get("sort") || "";
  const order = sp.get("order") || "";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearch(sp.get("search") || "");
  }, [sp]);

  function pushFilters(s: string, sortKey?: string, sortOrder?: string) {
    const p = new URLSearchParams();
    if (s) p.set("search", s);
    if (sortKey) p.set("sort", sortKey);
    if (sortOrder) p.set("order", sortOrder);
    router.push(`/clientes?${p.toString()}`);
  }

  function onSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushFilters(val), 300);
  }

  function toggleSort(key: string) {
    if (sort === key) {
      pushFilters(search, key, order === "asc" ? "desc" : "asc");
    } else {
      pushFilters(search, key, "asc");
    }
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-[10px] p-3 mb-4 flex items-end gap-2 shadow-card">
        <div className="flex-1">
          <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Buscar</label>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nombre, email o teléfono..."
            className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left">
              <Th active={sort === "nombre" || !sort} dir={order} onClick={() => toggleSort("nombre")} label="Nombre" />
              <Th active={sort === "email"} dir={order} onClick={() => toggleSort("email")} label="Email" />
              <Th label="Teléfono" />
              <Th active={sort === "createdAt"} dir={order} onClick={() => toggleSort("createdAt")} label="Registrado" />
              <Th label="Presupuestos" />
              <Th label="" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <ClientRow key={c.id} item={c} />
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}

function Th({ label, active, dir, onClick }: { label: string; active?: boolean; dir?: string; onClick?: () => void }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <th className="px-4 py-3">
      <Wrapper
        onClick={onClick}
        className={`font-medium text-xs uppercase tracking-wider flex items-center gap-1 ${
          onClick ? "cursor-pointer hover:text-text-primary transition-colors" : ""
        } ${active ? "text-text-primary" : "text-text-tertiary"}`}
      >
        {label}
        {active && onClick && <span className="text-[9px]">{dir === "asc" ? "▲" : "▼"}</span>}
      </Wrapper>
    </th>
  );
}

function ClientRow({ item }: { item: ClienteItem }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    await eliminarCliente(item.id);
    showToast("Cliente eliminado");
    router.refresh();
  }

  return (
    <>
      <tr className="border-b border-border/50 hover:bg-stone-50/50 transition-colors">
        <td className="px-4 py-3.5">
          <Link href={`/clientes/${item.id}`} className="font-medium text-text-primary hover:text-accent transition-colors">
            {item.nombre}
          </Link>
        </td>
        <td className="px-4 py-3.5 text-text-secondary">{item.email || "—"}</td>
        <td className="px-4 py-3.5 text-text-secondary">{item.telefono || "—"}</td>
        <td className="px-4 py-3.5 text-text-tertiary text-xs">{formatDate(item.createdAt)}</td>
        <td className="px-4 py-3.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded-[4px] bg-accent-soft text-accent">
            {item.presupuestosCount} presupuestos
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex gap-2.5">
            <Link href={`/clientes/${item.id}`} className="text-accent hover:text-accent-hover text-xs font-medium">
              Ver
            </Link>
            <Link href={`/clientes/${item.id}/editar`} className="text-accent hover:text-accent-hover text-xs font-medium">
              Editar
            </Link>
            <button
              onClick={() =>
                confirm({
                  title: "Eliminar cliente",
                  message: `¿Eliminar a "${item.nombre}"? También se eliminarán sus presupuestos y eventos.`,
                  confirmLabel: "Eliminar",
                  onConfirm: handleDelete,
                })
              }
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {dialog()}
    </>
  );
}
