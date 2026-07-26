import { notFound } from "next/navigation";
import Link from "next/link";
import { getPresupuesto } from "@/lib/actions";
import { formatEUR, formatDate } from "@/lib/format";
import { BudgetStatusBadge } from "@/app/budget-status-badge";
import { DetailStatusButton, DeleteBudgetButton, DuplicateBudgetButton, PlantillaToggleButton, GenerarFacturaButton } from "@/app/budget-actions-client";
import { SendEmailButton } from "@/app/send-email-button";
import { Attachments } from "@/components/attachments";

const nextStatus: Record<string, { estado: string; label: string; color: string }[]> = {
  borrador: [{ estado: "enviado", label: "Marcar como Enviado", color: "bg-accent text-white hover:bg-accent-hover" }],
  enviado: [
    { estado: "aprobado", label: "Aprobar", color: "bg-success text-white hover:bg-success/90" },
    { estado: "vencido", label: "Vencer", color: "bg-destructive-soft text-destructive hover:bg-red-200" },
  ],
  aprobado: [{ estado: "pagado", label: "Marcar como Pagado", color: "bg-accent text-white hover:bg-accent-hover" }],
  pagado: [],
  vencido: [],
};

export default async function PresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(Number(id));
  if (!presupuesto) notFound();

  const subtotal = presupuesto.items.reduce((s, i) => s + i.total, 0);
  const total = subtotal + subtotal * (presupuesto.impuesto / 100);

  return (
    <div>
      <div className="flex items-center gap-4 mb-7">
        <Link href="/" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          ← Volver
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            #{String(presupuesto.numero).padStart(4, "0")}
          </h1>
        </div>
        <BudgetStatusBadge
          status={presupuesto.estado}
          presupuestoId={presupuesto.id}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Cliente</h2>
          <p className="font-medium text-text-primary text-sm">{presupuesto.cliente.nombre}</p>
          {presupuesto.cliente.email && <p className="text-sm text-text-secondary mt-1">{presupuesto.cliente.email}</p>}
          {presupuesto.cliente.telefono && <p className="text-sm text-text-secondary">{presupuesto.cliente.telefono}</p>}
        </div>
        <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Detalles</h2>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-text-tertiary">Fecha:</span>{" "}
              <span className="text-text-primary">{formatDate(presupuesto.fecha)}</span>
            </p>
            {presupuesto.validez && (
              <p className="text-sm">
                <span className="text-text-tertiary">Validez:</span>{" "}
                <span className="text-text-primary">{presupuesto.validez}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-text-tertiary">IVA:</span>{" "}
              <span className="text-text-primary">{presupuesto.impuesto}%</span>
            </p>
            {presupuesto.frecuencia && (
              <p className="text-sm">
                <span className="text-text-tertiary">Recurrencia:</span>{" "}
                <span className="text-accent font-medium capitalize">{presupuesto.frecuencia}</span>
                {presupuesto.proximaGeneracion && (
                  <span className="text-text-tertiary text-xs ml-2">
                    (próxima: {formatDate(presupuesto.proximaGeneracion)})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[10px] border border-border overflow-hidden mb-6 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt text-left">
              <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Descripción</th>
              <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider text-center">Cant.</th>
              <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider text-right">Precio</th>
              <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {presupuesto.items.map((item, i) => (
              <tr key={i} className="border-b border-border/50 last:border-b-0">
                <td className="px-5 py-3.5 text-sm text-text-primary">{item.descripcion}</td>
                <td className="px-5 py-3.5 text-sm text-text-secondary text-center">{item.cantidad}</td>
                <td className="px-5 py-3.5 text-sm font-mono text-text-secondary text-right">{formatEUR(item.precioUnitario)}</td>
                <td className="px-5 py-3.5 text-sm font-mono text-text-primary text-right font-medium">{formatEUR(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-4 border-t border-border bg-surface-alt/50 flex flex-col items-end gap-1">
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">Subtotal</span>
            <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(subtotal)}</span>
          </div>
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">IVA ({presupuesto.impuesto}%)</span>
            <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(subtotal * presupuesto.impuesto / 100)}</span>
          </div>
          <div className="flex gap-10 text-sm pt-1 border-t border-border/50 w-full justify-end mt-1">
            <span className="font-medium text-text-primary">Total</span>
            <span className="font-mono w-24 text-right font-semibold text-text-primary">{formatEUR(total)}</span>
          </div>
        </div>
      </div>

      {presupuesto.notas && (
        <div className="bg-surface rounded-[10px] border border-border p-5 mb-6 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Notas</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{presupuesto.notas}</p>
        </div>
      )}

      {presupuesto.factura && (
        <div className="bg-surface rounded-[10px] border border-border p-5 mb-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Factura</h2>
              <Link href={`/facturas/${presupuesto.factura.id}`} className="font-mono text-sm text-accent hover:underline">
                F-{String(presupuesto.factura.numero).padStart(4, "0")}
              </Link>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-[4px] font-medium bg-green-100 text-green-700">
                {presupuesto.factura.estado}
              </span>
            </div>
          </div>
        </div>
      )}
      {presupuesto.estado === "aprobado" && !presupuesto.factura && (
        <div className="mb-6">
          <GenerarFacturaButton presupuestoId={presupuesto.id} />
        </div>
      )}

      <div className="mb-6">
        <Attachments
          presupuestoId={presupuesto.id}
          items={presupuesto.attachments || []}
        />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link
          href={`/presupuestos/${presupuesto.id}/pdf`}
          className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
        >
          Descargar PDF
        </Link>
        <SendEmailButton
          presupuestoId={presupuesto.id}
          numero={presupuesto.numero}
          defaultEmail={presupuesto.cliente.email || undefined}
          clienteNombre={presupuesto.cliente.nombre}
        />
        <Link
          href={`/presupuestos/${presupuesto.id}/editar`}
          className="text-sm font-medium text-text-secondary border border-border px-4 py-2 rounded-[8px] hover:bg-surface-alt transition-colors"
        >
          Editar
        </Link>

        {(nextStatus[presupuesto.estado] || []).map((s) => (
          <DetailStatusButton
            key={s.estado}
            presupuestoId={presupuesto.id}
            estado={s.estado}
            label={s.label}
            className={`text-sm font-medium px-4 py-2 rounded-[8px] transition-colors ${s.color}`}
          />
        ))}

        <DuplicateBudgetButton presupuestoId={presupuesto.id} />
        <PlantillaToggleButton presupuestoId={presupuesto.id} esPlantilla={presupuesto.esPlantilla} />
        <DeleteBudgetButton presupuestoId={presupuesto.id} numero={presupuesto.numero} />
      </div>
    </div>
  );
}
