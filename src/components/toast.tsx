"use client";

import { useState, useEffect, useCallback } from "react";

interface ToastData {
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  show: (message: string, type?: ToastData["type"]) => void;
}

let globalShow: ((message: string, type?: ToastData["type"]) => void) | null = null;

export function showToast(message: string, type?: ToastData["type"]) {
  globalShow?.(message, type);
}

export default function Toast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  const show = useCallback((message: string, type: ToastData["type"] = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    globalShow = show;
    return () => { globalShow = null; };
  }, [show]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-[10px] text-sm font-medium shadow-dialog border ${
          toast.type === "success"
            ? "bg-emerald-900/90 text-emerald-200 border-emerald-700/50"
            : toast.type === "error"
            ? "bg-rose-900/90 text-rose-200 border-rose-700/50"
            : "bg-stone-800/90 text-stone-200 border-stone-700/50"
        }`}
      >
        <span className="text-base">
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
        </span>
        {toast.message}
      </div>
    </div>
  );
}
