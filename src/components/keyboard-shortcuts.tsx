"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const shortcuts = [
  { keys: "g luego h", label: "Ir a Presupuestos" },
  { keys: "g luego c", label: "Ir a Clientes" },
  { keys: "g luego p", label: "Ir a Productos" },
  { keys: "g luego a", label: "Ir a Agenda" },
  { keys: "g luego o", label: "Ir a Organización" },
  { keys: "n luego p", label: "Nuevo presupuesto" },
  { keys: "/", label: "Buscar global" },
  { keys: "?", label: "Mostrar atajos" },
];

export function KeyboardShortcuts({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  useEffect(() => {
    let buf = "";
    let timer: ReturnType<typeof setTimeout> | null = null;

    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        setShowHelp((p) => !p);
        return;
      }
      if (e.key === "Escape") { setShowHelp(false); return; }

      if (e.key.length === 1) {
        if (timer) clearTimeout(timer);
        buf += e.key.toLowerCase();
        timer = setTimeout(() => { buf = ""; }, 1000);

        if (buf === "gh") { router.push("/"); buf = ""; }
        else if (buf === "gc") { router.push("/clientes"); buf = ""; }
        else if (buf === "gp") { router.push("/productos"); buf = ""; }
        else if (buf === "ga") { router.push("/agenda"); buf = ""; }
        else if (buf === "go") { router.push("/org"); buf = ""; }
        else if (buf === "np") { router.push("/presupuestos/nuevo"); buf = ""; }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [router]);

  return (
    <>
      {children}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowHelp(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Atajos de teclado</h3>
              <button onClick={() => setShowHelp(false)} className="text-text-tertiary hover:text-text-primary">&times;</button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.keys} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-text-secondary">{s.label}</span>
                  <kbd className="text-xs font-mono bg-surface-alt border border-border px-2 py-0.5 rounded-[4px] text-text-tertiary">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-tertiary mt-4 border-t border-border pt-3">Los atajos de dos teclas se escriben rápido (ej: g + h)</p>
          </div>
        </div>
      )}
    </>
  );
}
