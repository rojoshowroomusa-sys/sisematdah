"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cambiarEstadoPresupuesto, eliminarPresupuesto, duplicarPresupuesto, togglePlantilla, generarFactura } from "@/lib/actions";
import { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

export function QuickStatusButton({
  presupuestoId,
  estado,
  label,
  className,
}: {
  presupuestoId: number;
  estado: string;
  label: string;
  className: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await cambiarEstadoPresupuesto(presupuestoId, estado);
      showToast(`Presupuesto marcado como "${label}"`);
      router.refresh();
    } catch {
      showToast("Error al cambiar estado", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handle} disabled={loading} className={`${className} disabled:opacity-50`}>
      {loading ? "..." : label}
    </button>
  );
}

const nextTransitions: Record<string, { estado: string; label: string }> = {
  borrador: { estado: "enviado", label: "Enviar" },
  enviado: { estado: "aprobado", label: "Aprobar" },
  aprobado: { estado: "pagado", label: "Cobrado" },
};

export function QuickStatusButtons({
  presupuestoId,
  currentStatus,
}: {
  presupuestoId: number;
  currentStatus: string;
}) {
  const next = nextTransitions[currentStatus];
  if (!next) return null;

  return (
    <div className="flex gap-1">
      {(currentStatus === "enviado"
        ? [next, { estado: "vencido" as const, label: "Vencer" }]
        : [next]
      ).map((item) => (
        <QuickStatusButton
          key={item.estado}
          presupuestoId={presupuestoId}
          estado={item.estado}
          label={item.label}
          className={
            item.estado === "vencido"
              ? "text-xs font-medium px-2.5 py-1 rounded-[6px] text-destructive hover:bg-destructive-soft transition-colors"
              : "text-xs font-medium px-2.5 py-1 rounded-[6px] text-accent hover:bg-accent-soft transition-colors"
          }
        />
      ))}
    </div>
  );
}

export function DeleteBudgetButton({ presupuestoId, numero }: { presupuestoId: number; numero: number }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    await eliminarPresupuesto(presupuestoId);
    showToast("Presupuesto eliminado");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() =>
          confirm({
            title: "Eliminar presupuesto",
            message: `¿Eliminar el presupuesto #${String(numero).padStart(4, "0")}?`,
            confirmLabel: "Eliminar",
            onConfirm: handleDelete,
          })
        }
        className="text-sm font-medium text-destructive border border-destructive/20 px-4 py-2 rounded-[8px] hover:bg-destructive-soft transition-colors"
      >
        Eliminar
      </button>
      {dialog()}
    </>
  );
}

export function DuplicateBudgetButton({ presupuestoId }: { presupuestoId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await duplicarPresupuesto(presupuestoId);
      showToast("Presupuesto duplicado");
      router.refresh();
    } catch {
      showToast("Error al duplicar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-sm font-medium text-text-secondary border border-border px-4 py-2 rounded-[8px] hover:bg-surface-alt transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Duplicar"}
    </button>
  );
}

export function DetailStatusButton({
  presupuestoId,
  estado,
  label,
  className,
}: {
  presupuestoId: number;
  estado: string;
  label: string;
  className: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await cambiarEstadoPresupuesto(presupuestoId, estado);
      showToast(`Presupuesto marcado como "${label}"`);
      router.refresh();
    } catch {
      showToast("Error al cambiar estado", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`${className} disabled:opacity-50`}
    >
      {loading ? "..." : label}
    </button>
  );
}

export function PlantillaToggleButton({ presupuestoId, esPlantilla }: { presupuestoId: number; esPlantilla: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await togglePlantilla(presupuestoId);
      showToast(esPlantilla ? "Eliminada de plantillas" : "Guardada como plantilla");
      router.refresh();
    } catch {
      showToast("Error al cambiar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`text-sm font-medium border px-4 py-2 rounded-[8px] transition-colors disabled:opacity-50 ${
        esPlantilla
          ? "text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100"
          : "text-text-secondary border-border hover:bg-surface-alt"
      }`}
    >
      {loading ? "..." : esPlantilla ? "★ Plantilla" : "Guardar como plantilla"}
    </button>
  );
}

export function GenerarFacturaButton({ presupuestoId }: { presupuestoId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const factura = await generarFactura(presupuestoId);
      showToast("Factura generada");
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al generar factura", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-[8px] hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Generar factura"}
    </button>
  );
}
