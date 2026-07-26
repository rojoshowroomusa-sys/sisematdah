"use client";

import { useRouter } from "next/navigation";
import { eliminarEvento } from "@/lib/actions";
import { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

export function DeleteEventButton({ eventId, title }: { eventId: number; title: string }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    await eliminarEvento(eventId);
    showToast("Evento eliminado");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() =>
          confirm({
            title: "Eliminar evento",
            message: `¿Eliminar "${title}"?`,
            confirmLabel: "Eliminar",
            onConfirm: handleDelete,
          })
        }
        className="text-xs font-medium text-destructive hover:bg-destructive-soft rounded-[4px] px-1.5 py-0.5 transition-colors"
      >
        Eliminar
      </button>
      {dialog()}
    </>
  );
}
