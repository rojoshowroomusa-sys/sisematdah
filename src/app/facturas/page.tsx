import Link from "next/link";
import { getFacturas } from "@/lib/actions";
export const dynamic = 'force-dynamic';
import { formatEUR, formatDate } from "@/lib/format";

export default async function FacturasPage() {
  const facturas = await getFacturas();

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-text-primary">Facturas</h1>
        <p className="text-sm text-text-tertiary mt-0.5">{facturas.length} facturas emitidas</p>
      </div>

      <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                <th className="text-left px-3 py-3.5">N°</th>
                <th className="text-left px-3 py-3.5">Cliente</th>
                <th className="text-left px-3 py-3.5">Presupuesto</th>
                <th className="text-left px-3 py-3.5">Fecha</th>
                <th className="text-right px-3 py-3.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {facturas.map((f) => (
                <tr key={f.id} className="hover:bg-surface-alt/50 transition-colors">
                  <td className="px-3 py-3">
                    <Link href={`/facturas/${f.id}`} className="font-mono text-sm text-accent hover:underline">
                      F-{String(f.numero).padStart(4, "0")}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-text-primary">{f.cliente.nombre}</td>
                  <td className="px-3 py-3">
                    <Link href={`/presupuestos/${f.presupuesto.id}`} className="font-mono text-xs text-text-tertiary hover:text-accent">
                      #{String(f.presupuesto.numero).padStart(4, "0")}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-sm text-text-secondary">{formatDate(f.fecha)}</td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-[4px] ${
                      f.estado === "pagada" ? "bg-green-100 text-green-700" :
                      f.estado === "anulada" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {f.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {facturas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-sm text-text-tertiary">
                    No hay facturas aún. Aprobá un presupuesto para generar una.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
