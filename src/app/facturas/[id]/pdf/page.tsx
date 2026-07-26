import { notFound } from "next/navigation";
import { getFactura } from "@/lib/actions";
import { formatEUR, formatDate } from "@/lib/format";

export default async function FacturaPDFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factura = await getFactura(Number(id));
  if (!factura) notFound();

  const subtotal = factura.items.reduce((s, i) => s + i.total, 0);
  const impuesto = subtotal * (factura.impuesto / 100);
  const total = subtotal + impuesto;

  return (
    <div className="max-w-[210mm] mx-auto p-8 text-sm print:p-0">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">FACTURA</h1>
          <p className="font-mono text-lg text-accent mt-1">F-{String(factura.numero).padStart(4, "0")}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-text-primary">{factura.cliente.nombre}</p>
          {factura.cliente.email && <p className="text-text-tertiary">{factura.cliente.email}</p>}
          {factura.cliente.direccion && <p className="text-text-tertiary">{factura.cliente.direccion}</p>}
        </div>
      </div>

      <div className="text-sm text-text-tertiary mb-8">
        Fecha: {formatDate(factura.fecha)}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-text-primary">
            <th className="text-left py-2 text-xs font-semibold uppercase tracking-wider">Descripción</th>
            <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider">Cant.</th>
            <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider">Precio</th>
            <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody>
          {factura.items.map((item) => (
            <tr key={item.id} className="border-b border-border">
              <td className="py-3 text-text-primary">{item.descripcion}</td>
              <td className="py-3 text-right text-text-secondary">{item.cantidad}</td>
              <td className="py-3 text-right text-text-secondary">{formatEUR(item.precioUnitario)}</td>
              <td className="py-3 text-right font-mono text-text-primary">{formatEUR(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col items-end mt-6 gap-1.5">
        <div className="flex gap-12 text-sm">
          <span className="text-text-tertiary">Subtotal</span>
          <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(subtotal)}</span>
        </div>
        <div className="flex gap-12 text-sm">
          <span className="text-text-tertiary">IVA ({factura.impuesto}%)</span>
          <span className="font-mono w-24 text-right text-text-secondary">{formatEUR(impuesto)}</span>
        </div>
        <div className="flex gap-12 text-sm font-bold border-t border-text-primary pt-2">
          <span className="text-text-primary">Total</span>
          <span className="font-mono w-24 text-right text-text-primary">{formatEUR(total)}</span>
        </div>
      </div>

      <p className="text-center text-text-tertiary text-xs mt-16 border-t border-border pt-4">
        Factura generada desde el sistema de presupuestos
      </p>
    </div>
  );
}
