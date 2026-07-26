import { notFound } from "next/navigation";
import Link from "next/link";
import { getFactura } from "@/lib/actions";
import { formatEUR, formatDate } from "@/lib/format";
import { FacturaActions } from "./actions";

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factura = await getFactura(Number(id));
  if (!factura) notFound();

  const subtotal = factura.items.reduce((s, i) => s + i.total, 0);
  const total = subtotal + subtotal * (factura.impuesto / 100);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            Factura F-{String(factura.numero).padStart(4, "0")}
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">{factura.cliente.nombre}</p>
        </div>
        <FacturaActions facturaId={factura.id} estado={factura.estado} />
      </div>

      <div className="bg-surface rounded-[10px] border border-border p-5 mb-6 shadow-card">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-tertiary">Cliente</span>
            <p className="text-text-primary font-medium">{factura.cliente.nombre}</p>
            {factura.cliente.email && <p className="text-text-secondary">{factura.cliente.email}</p>}
            {factura.cliente.direccion && <p className="text-text-secondary">{factura.cliente.direccion}</p>}
          </div>
          <div className="text-right">
            <span className="text-text-tertiary">Presupuesto origen</span>
            <p>
              <Link href={`/presupuestos/${factura.presupuesto.id}`} className="font-mono text-accent hover:underline">
                #{String(factura.presupuesto.numero).padStart(4, "0")}
              </Link>
            </p>
            <span className="text-text-tertiary block mt-2">Fecha</span>
            <p className="text-text-primary">{formatDate(factura.fecha)}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              <th className="text-left px-4 py-3.5">Descripción</th>
              <th className="text-right px-4 py-3.5">Cant.</th>
              <th className="text-right px-4 py-3.5">Precio</th>
              <th className="text-right px-4 py-3.5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {factura.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-text-primary">{item.descripcion}</td>
                <td className="px-4 py-3 text-sm text-right text-text-secondary">{item.cantidad}</td>
                <td className="px-4 py-3 text-sm text-right text-text-secondary">{formatEUR(item.precioUnitario)}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-text-primary">{formatEUR(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border px-4 py-4 flex flex-col items-end gap-1">
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">Subtotal</span>
            <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(subtotal)}</span>
          </div>
          <div className="flex gap-10 text-sm">
            <span className="text-text-tertiary">IVA ({factura.impuesto}%)</span>
            <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(subtotal * factura.impuesto / 100)}</span>
          </div>
          <div className="flex gap-10 text-sm font-medium">
            <span className="text-text-primary">Total</span>
            <span className="font-mono w-24 text-right text-text-primary">{formatEUR(total)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <Link
          href={`/facturas/${factura.id}/pdf`}
          className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
        >
          Descargar PDF
        </Link>
      </div>
    </div>
  );
}
