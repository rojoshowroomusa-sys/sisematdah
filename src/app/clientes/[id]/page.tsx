import { notFound } from "next/navigation";
import Link from "next/link";
import { getCliente } from "@/lib/actions";
import { formatEUR, formatDate } from "@/lib/format";
import { BudgetStatusBadge } from "@/app/budget-status-badge";
import { ServiciosPanel } from "./servicios-panel";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClienteDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const cliente = await getCliente(Number(id));
  if (!cliente) notFound();

  const activeTab = tab === "servicios" || tab === "facturas" ? tab : "detalle";
  const tabs = [
    { key: "detalle", label: "Detalle", href: `/clientes/${cliente.id}` },
    { key: "servicios", label: "Servicios", href: `/clientes/${cliente.id}?tab=servicios` },
    { key: "facturas", label: "Facturas", href: `/clientes/${cliente.id}?tab=facturas` },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <Link href="/clientes" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          ← Clientes
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{cliente.nombre}</h1>
        </div>
        <Link
          href={`/clientes/${cliente.id}/editar`}
          className="text-sm font-medium text-text-secondary border border-border px-4 py-2 rounded-[8px] hover:bg-surface-alt transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors -mb-[1px] ${
              activeTab === t.key
                ? "border-accent text-text-primary font-medium"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "detalle" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Contacto</h2>
              <div className="space-y-1.5">
                {cliente.email ? (
                  <p className="text-sm">
                    <span className="text-text-tertiary">Email:</span>{" "}
                    <span className="text-text-primary">{cliente.email}</span>
                  </p>
                ) : <p className="text-sm text-text-tertiary">Sin email registrado</p>}
                {cliente.telefono && (
                  <p className="text-sm">
                    <span className="text-text-tertiary">Teléfono:</span>{" "}
                    <span className="text-text-primary">{cliente.telefono}</span>
                  </p>
                )}
                {cliente.direccion && (
                  <p className="text-sm">
                    <span className="text-text-tertiary">Dirección:</span>{" "}
                    <span className="text-text-primary">{cliente.direccion}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Resumen</h2>
              <div className="space-y-1.5">
                <p className="text-sm">
                  <span className="text-text-tertiary">Cliente desde:</span>{" "}
                  <span className="text-text-primary">{formatDate(cliente.createdAt)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-text-tertiary">Presupuestos:</span>{" "}
                  <span className="text-text-primary font-semibold">{cliente.presupuestos.length}</span>
                </p>
                <p className="text-sm">
                  <span className="text-text-tertiary">Total facturado:</span>{" "}
                  <span className="text-text-primary font-semibold font-mono">
                    {formatEUR(
                      cliente.presupuestos.reduce((sum, p) => {
                        const s = p.items.reduce((a, i) => a + i.total, 0);
                        return sum + s + s * (p.impuesto / 100);
                      }, 0)
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card">
            <div className="px-5 py-3.5 border-b border-border bg-surface-alt flex items-center justify-between">
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Historial de presupuestos</h2>
              <Link
                href={`/presupuestos/nuevo?clienteId=${cliente.id}`}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
              >
                + Nuevo presupuesto
              </Link>
            </div>
            {cliente.presupuestos.length === 0 ? (
              <div className="px-5 py-12 text-center text-text-tertiary text-sm">
                Este cliente no tiene presupuestos aún
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">N°</th>
                    <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Fecha</th>
                    <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider">Estado</th>
                    <th className="px-5 py-3 font-medium text-text-tertiary text-xs uppercase tracking-wider text-right">Total</th>
                    <th className="px-5 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.presupuestos.map((p) => {
                    const subtotal = p.items.reduce((s, i) => s + i.total, 0);
                    const total = subtotal + subtotal * (p.impuesto / 100);
                    return (
                      <tr key={p.id} className="border-b border-border/50 last:border-b-0 hover:bg-stone-50/50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-text-tertiary">
                          #{String(p.numero).padStart(4, "0")}
                        </td>
                        <td className="px-5 py-3 text-text-secondary">{formatDate(p.fecha)}</td>
                        <td className="px-5 py-3">
                          <BudgetStatusBadge status={p.estado} presupuestoId={p.id} compact />
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-text-primary">{formatEUR(total)}</td>
                        <td className="px-5 py-3">
                          <Link href={`/presupuestos/${p.id}`} className="text-xs font-medium text-accent hover:text-accent-hover">
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === "servicios" && (
        <ServiciosPanel clienteId={cliente.id} clienteNombre={cliente.nombre} />
      )}

      {activeTab === "facturas" && (
        <div className="bg-surface rounded-[10px] border border-border p-10 text-center shadow-card">
          <p className="text-sm text-text-tertiary">Sección de facturas próximamente</p>
        </div>
      )}
    </div>
  );
}
