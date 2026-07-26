"use client";

import { useState } from "react";
import { showToast } from "@/components/toast";

interface Props {
  presupuestoId: number;
  numero: number;
  defaultEmail?: string;
  clienteNombre: string;
}

export function SendEmailButton({ presupuestoId, numero, defaultEmail, clienteNombre }: Props) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultEmail || "");
  const [subject, setSubject] = useState(`Presupuesto #${String(numero).padStart(4, "0")}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!to) { showToast("Ingresá un destinatario", "error"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/send-presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presupuestoId, to, subject, message }),
      });
      if (!res.ok) throw new Error();
      showToast("Presupuesto enviado por email");
      setOpen(false);
    } catch {
      showToast("Error al enviar. Revisá la configuración SMTP", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
      >
        Enviar por Email
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-[12px] border border-border shadow-dialog w-full max-w-md mx-4 p-5 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Enviar presupuesto</h3>
              <button onClick={() => setOpen(false)} className="text-text-tertiary hover:text-text-primary text-lg leading-none">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-tertiary mb-1 block">Para *</label>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="email@cliente.com"
                  className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-tertiary mb-1 block">Asunto</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-tertiary mb-1 block">Mensaje</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={`Adjuntamos el presupuesto para ${clienteNombre}...`}
                  className="w-full border border-border rounded-[6px] px-3 py-2 text-sm text-text-primary bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>
              <div className="text-xs text-text-tertiary">Se adjunta el PDF automáticamente</div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-[8px] hover:bg-surface-alt transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-[8px] hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
