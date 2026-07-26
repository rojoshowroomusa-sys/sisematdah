"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setDailyState, quickCapture } from "@/lib/org-actions";

export type EnergyLevel = "cero_energia" | "media_energia" | "hiperfoco";
export type EnergyMood = "modo_supervivencia" | "regular" | "hiperfoco";

const energyMap: Record<EnergyLevel, EnergyMood> = {
  cero_energia: "modo_supervivencia",
  media_energia: "regular",
  hiperfoco: "hiperfoco",
};

export function EnergyCheckIn() {
  const router = useRouter();
  const [captureText, setCaptureText] = useState("");
  const [showCapture, setShowCapture] = useState(false);

  async function handleSelect(level: EnergyLevel) {
    const mood = energyMap[level];
    await setDailyState({ date: new Date(), energyMood: mood });
    router.push(`/org?energy=${mood}`);
  }

  async function handleQuickCapture() {
    if (!captureText.trim()) return;
    await quickCapture(captureText.trim());
    setCaptureText("");
    setShowCapture(false);
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col items-center text-center">
      <div className="mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-teal-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Check-in Diario
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-4 text-slate-50">
          ¿Con cuánta batería contás hoy?
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Elegí tu estado actual. Adaptaremos la pantalla para mostrarte solo lo que podés manejar ahora.
        </p>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={() => handleSelect("cero_energia")}
          className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-500/70 rounded-2xl transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl font-bold border border-rose-500/20">
              🛡️
            </div>
            <div>
              <h2 className="text-base font-semibold text-rose-200">Modo Mínimo (Baja Energía)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Solo 1 cosa indispensable. Cero sobrecarga.</p>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-slate-300 text-sm font-mono">→</span>
        </button>

        <button
          onClick={() => handleSelect("media_energia")}
          className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/70 rounded-2xl transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/20">
              ⚡
            </div>
            <div>
              <h2 className="text-base font-semibold text-amber-200">Modo Regular (Energía Media)</h2>
              <p className="text-xs text-slate-400 mt-0.5">3 micro-acciones para mantener el flujo sin agotar.</p>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-slate-300 text-sm font-mono">→</span>
        </button>

        <button
          onClick={() => handleSelect("hiperfoco")}
          className="w-full p-4 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/70 rounded-2xl transition-all flex items-center justify-between text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/20">
              🚀
            </div>
            <div>
              <h2 className="text-base font-semibold text-emerald-200">Modo Hiperfoco (Energía Alta)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ver backlog completo, proyectos y planificación.</p>
            </div>
          </div>
          <span className="text-slate-500 group-hover:text-slate-300 text-sm font-mono">→</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800 w-full flex flex-col items-center gap-3">
        <button
          onClick={() => setShowCapture(!showCapture)}
          className="text-xs text-slate-400 hover:text-teal-400 underline underline-offset-4 transition-colors"
        >
          ✍️ Solo quiero anotar una idea rápida sin elegir estado
        </button>

        {showCapture && (
          <div className="w-full flex gap-2">
            <input
              autoFocus
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickCapture()}
              placeholder="Escribí tu idea..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleQuickCapture}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 px-4 py-3 rounded-xl text-sm font-medium"
            >
              Capturar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
