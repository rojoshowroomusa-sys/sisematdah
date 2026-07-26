"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const categorias = [
  { value: "material", label: "Material" },
  { value: "servicio", label: "Servicio" },
  { value: "digital", label: "Digital" },
  { value: "suscripcion", label: "Suscripción" },
  { value: "consultoria", label: "Consultoría" },
  { value: "otro", label: "Otro" },
];

export function ProductosFilter() {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("search") || "");
  const [categoria, setCategoria] = useState(sp.get("categoria") || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearch(sp.get("search") || "");
    setCategoria(sp.get("categoria") || "");
  }, [sp]);

  function pushFilters(s: string, c: string) {
    const p = new URLSearchParams();
    if (s) p.set("search", s);
    if (c) p.set("categoria", c);
    router.push(`/productos?${p.toString()}`);
  }

  function onSearchChange(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushFilters(val, categoria), 300);
  }

  function onCategoriaChange(val: string) {
    setCategoria(val);
    pushFilters(search, val);
  }

  function clear() {
    setSearch("");
    setCategoria("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push("/productos");
  }

  const hasFilters = sp.get("search") || sp.get("categoria");

  return (
    <div className="bg-surface border border-border rounded-[10px] p-3 mb-4 flex flex-wrap items-end gap-2 shadow-card">
      <div className="flex-1 min-w-[160px]">
        <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Buscar</label>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nombre del producto..."
          className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>
      <div className="w-40">
        <label className="text-xs font-medium text-text-tertiary mb-1.5 block">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="w-full border border-border rounded-[6px] px-3 py-1.5 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors appearance-none"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <button
        onClick={() => pushFilters(search, categoria)}
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
