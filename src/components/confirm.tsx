"use client";

import { useState } from "react";

interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

export function useConfirm() {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [loading, setLoading] = useState(false);

  function confirm(cfg: ConfirmConfig) {
    setConfig(cfg);
  }

  async function handleConfirm() {
    if (!config) return;
    setLoading(true);
    try {
      await config.onConfirm();
    } finally {
      setLoading(false);
      setConfig(null);
    }
  }

  function dialog() {
    if (!config) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-stone-800 border border-stone-700/50 rounded-[12px] p-5 w-80 shadow-dialog">
          <h3 className="text-sm font-semibold text-stone-100">{config.title}</h3>
          <p className="text-sm text-stone-400 mt-1.5">{config.message}</p>
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => setConfig(null)}
              className="text-sm font-medium text-stone-400 hover:text-stone-200 px-3 py-1.5 rounded-[6px] hover:bg-stone-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="text-sm font-medium bg-rose-600 text-white px-3 py-1.5 rounded-[6px] hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : config.confirmLabel || "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return { confirm, dialog };
}
