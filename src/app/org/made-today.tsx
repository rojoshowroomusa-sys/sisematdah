"use client";

import { useEffect, useState } from "react";

interface MadeTodayItem {
  title: string;
  doneAt: string;
}

function getTodayLog(): MadeTodayItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("flux_made_today");
    const data = raw ? JSON.parse(raw) : [];
    const today = new Date().toDateString();
    return data.filter((item: MadeTodayItem) => new Date(item.doneAt).toDateString() === today);
  } catch {
    return [];
  }
}

function useTodayLog() {
  const [items, setItems] = useState<MadeTodayItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getTodayLog();
  });

  useEffect(() => {
    function handler() {
      setItems(getTodayLog());
    }
    window.addEventListener("storage", handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  return items;
}

export function MadeToday() {
  const items = useTodayLog();
  const [show, setShow] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      <button
        onClick={() => setShow(!show)}
        className="text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
      >
        ✅ Hecho hoy {items.length > 0 && `(${items.length})`}
      </button>
      {show && (
        <div className="mt-3 space-y-1.5">
          {items.length === 0 ? (
            <p className="text-xs text-slate-500">Todavía no completaste nada hoy. Cualquier paso cuenta.</p>
          ) : (
            items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-teal-400">✓</span>
                <span>{item.title}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function logMadeToday(title: string) {
  try {
    const raw = localStorage.getItem("flux_made_today");
    const data: MadeTodayItem[] = raw ? JSON.parse(raw) : [];
    data.push({ title, doneAt: new Date().toISOString() });
    localStorage.setItem("flux_made_today", JSON.stringify(data));
    window.dispatchEvent(new Event("storage"));
  } catch {}
}
