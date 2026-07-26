"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Props {
  clientes: { id: number; nombre: string }[];
}

export function DashboardFilters({ clientes }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const [estado, setEstado] = useState(sp.get("estado") || "");
  const [clienteId, setClienteId] = useState(sp.get("clienteId") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearch(sp.get("search") || "");
    setEstado(sp.get("estado") || "");
    setClienteId(sp.get("clienteId") || "");
  }, [sp]);

  function pushFilters(s: string, e: string, c: string) {
    const p = new URLSearchParams();
    if (s) p.set("search", s);
    if (e) p.set("estado", e);
    if (c) p.set("clienteId", c);
    router.push(`/?${p.toString()}`);
  }

  function onSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushFilters(val, estado, clienteId);
    }, 300);
  }

  function onEstadoChange(val: string) {
    setEstado(val);
    pushFilters(search, val, clienteId);
  }

  function onClienteChange(val: string) {
    setClienteId(val);
    pushFilters(search, estado, val);
  }

  function clear() {
    setSearch("");
    setEstado("");
    setClienteId("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/");
  }

  const hasFilters = sp.get("search") || sp.get("estado") || sp.get("clienteId");

  return (
    <div className="bg-surface border border-border rounded-[10px] p-3 mb-4 flex flex-wrap items-end gap-2">
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Buscar</label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cliente o número..."
          className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>
      <div className="w-36">
        <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Estado</label>
        <select
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
        >
          <option value="">Todos</option>
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="aprobado">Aprobado</option>
          <option value="pagado">Pagado</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>
      <div className="w-44">
        <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Cliente</label>
        <select
          value={clienteId}
          onChange={(e) => onClienteChange(e.target.value)}
          className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
        >
          <option value="">Todos</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => pushFilters(search, estado, clienteId)}
        className="bg-accent text-white px-4 py-1.5 rounded-[6px] text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Filtrar
      </button>
      {hasFilters && (
        <button onClick={clear} className="text-text-tertiary px-3 py-1.5 text-sm hover:text-text-secondary transition-colors">
          Limpiar
        </button>
      )}
    </div>
  );
}
