"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { formatEUR } from "@/lib/format";

interface Result {
  presupuestos: { id: number; numero: number; clienteNombre: string }[];
  clientes: { id: number; nombre: string; email: string | null }[];
  productos: { id: number; nombre: string; precio: number }[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) { setQuery(""); setResults(null); }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setSelectedIdx(0);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  function onQueryChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 200);
  }

  const allItems = [
    ...(results?.presupuestos.map((r) => ({ type: "presupuesto" as const, id: r.id, label: `#${String(r.numero).padStart(4, "0")} — ${r.clienteNombre}`, href: `/presupuestos/${r.id}` })) || []),
    ...(results?.clientes.map((r) => ({ type: "cliente" as const, id: r.id, label: r.nombre, sub: r.email || "", href: `/clientes/${r.id}` })) || []),
    ...(results?.productos.map((r) => ({ type: "producto" as const, id: r.id, label: r.nombre, sub: formatEUR(r.precio), href: `/productos/${r.id}` })) || []),
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && allItems[selectedIdx]) {
      window.location.href = allItems[selectedIdx].href;
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-text-tertiary hover:text-text-secondary border border-border rounded-[6px] px-2.5 py-1.5 flex items-center gap-2 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <span className="hidden sm:inline">Buscar...</span>
        <span className="text-[9px] font-mono bg-surface-alt px-1 py-0.5 rounded-[3px]">⌘K</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-lg mx-4 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscá presupuestos, clientes, productos..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              {loading && <div className="w-4 h-4 border-2 border-accent-soft border-t-accent rounded-full animate-spin" />}
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!query && (
                <p className="text-center py-8 text-text-tertiary text-sm">Escribí al menos 2 caracteres para buscar</p>
              )}
              {query.length >= 2 && allItems.length === 0 && !loading && (
                <p className="text-center py-8 text-text-tertiary text-sm">Sin resultados para "{query}"</p>
              )}
              {allItems.length > 0 && (
                <div className="space-y-0.5">
                  {allItems.map((item, i) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors ${
                        i === selectedIdx ? "bg-accent/10 text-accent" : "hover:bg-surface-alt text-text-primary"
                      }`}
                    >
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] uppercase ${
                        item.type === "presupuesto" ? "bg-blue-100 text-blue-700" :
                        item.type === "cliente" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {item.type === "presupuesto" ? "PRE" : item.type === "cliente" ? "CLI" : "PRO"}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {"sub" in item && item.sub && <span className="text-xs text-text-tertiary ml-auto">{item.sub}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] text-text-tertiary">
              <span>↑↓ Navegar</span>
              <span>↵ Abrir</span>
              <span className="ml-auto">Esc Cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
