"use client";

import { useRouter } from "next/navigation";
import { cambiarEstadoPresupuesto } from "@/lib/actions";

interface Props {
  presupuestoId: number;
  currentStatus: string;
}

const transitions: Record<string, string[]> = {
  borrador: ["enviado"],
  enviado: ["aprobado", "vencido"],
  aprobado: ["pagado"],
  pagado: [],
  vencido: [],
};

export function QuickStatusButton({ presupuestoId, currentStatus }: Props) {
  const router = useRouter();
  const nextStates = transitions[currentStatus] || [];

  if (nextStates.length === 0) return null;

  async function handleClick(estado: string) {
    await cambiarEstadoPresupuesto(presupuestoId, estado);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {nextStates.map((estado) => (
        <button
          key={estado}
          onClick={() => handleClick(estado)}
          className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
            estado === "aprobado" ? "bg-green-100 text-green-700 hover:bg-green-200" :
            estado === "enviado" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
            estado === "pagado" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
            "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {estado === "enviado" ? "Enviar" :
           estado === "aprobado" ? "Aprobar" :
           estado === "pagado" ? "Cobrado" : estado}
        </button>
      ))}
    </div>
  );
}
