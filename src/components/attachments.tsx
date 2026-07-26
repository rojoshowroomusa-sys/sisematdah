"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

interface AttachmentItem {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith("image/")) return "🖼";
  if (mime.includes("pdf")) return "📄";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  if (mime.includes("document") || mime.includes("word")) return "📝";
  return "📎";
}

export function Attachments({
  presupuestoId,
  items: initialItems,
}: {
  presupuestoId: number;
  items: AttachmentItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { confirm, dialog } = useConfirm();

  async function handleUpload(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      showToast("El archivo es demasiado grande (máx 10MB)", "error");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("presupuestoId", String(presupuestoId));
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const attachment = await res.json();
      setItems((prev) => [...prev, attachment]);
      showToast("Archivo subido");
      router.refresh();
    } catch {
      showToast("Error al subir archivo", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(attachmentId: number, name: string) {
    confirm({
      title: "Eliminar archivo",
      message: `¿Eliminar "${name}"?`,
      confirmLabel: "Eliminar",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/upload?id=${attachmentId}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          setItems((prev) => prev.filter((a) => a.id !== attachmentId));
          showToast("Archivo eliminado");
          router.refresh();
        } catch {
          showToast("Error al eliminar archivo", "error");
        }
      },
    });
  }

  return (
    <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Archivos adjuntos</h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50 transition-colors"
        >
          {uploading ? "Subiendo..." : "+ Adjuntar"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-tertiary">Sin archivos adjuntos</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2 px-3 rounded-[8px] hover:bg-surface-alt transition-colors">
              <span className="text-base">{fileIcon(a.mimeType)}</span>
              <a
                href={`/uploads/${a.filename}`}
                target="_blank"
                className="flex-1 text-sm font-medium text-text-primary hover:text-accent truncate transition-colors"
              >
                {a.originalName}
              </a>
              <span className="text-xs text-text-tertiary">{formatSize(a.size)}</span>
              <button
                onClick={() => handleDelete(a.id, a.originalName)}
                className="text-xs text-text-tertiary hover:text-destructive transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {dialog()}
    </div>
  );
}
