import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductoConUso } from "@/lib/actions";
import { formatEUR, formatDate } from "@/lib/format";

const categoriaLabels: Record<string, string> = {
  material: "Material",
  servicio: "Servicio",
  digital: "Digital",
  suscripcion: "Suscripción",
  consultoria: "Consultoría",
  otro: "Otro",
};

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  aprobado: "Aprobado",
  pagado: "Pagado",
  vencido: "Vencido",
};

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProductoConUso(Number(id));
  if (!data) notFound();

  const { producto, presupuestos, totalIngresos, vecesUsado } = data;

  return (
    <div>
      <div className="flex items-center gap-4 mb-7">
        <Link
          href="/productos"
          className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
        >
          ← Productos
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{producto.nombre}</h1>
          <p className="text-sm text-text-tertiary mt-0.5">Detalle del producto</p>
        </div>
        <Link
          href={`/productos/${producto.id}/editar`}
          className="text-sm font-medium text-accent border border-border px-4 py-2 rounded-[8px] hover:bg-accent-soft transition-colors"
        >
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Información</h2>
          <div className="space-y-2.5">
            <div>
              <span className="text-xs text-text-tertiary block">Tipo</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] inline-block mt-1 ${
                producto.tipo === "servicio" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {producto.tipo}
              </span>
            </div>
            {producto.categoria && (
              <div>
                <span className="text-xs text-text-tertiary block">Categoría</span>
                <span className="text-xs font-medium text-text-primary mt-0.5 block">
                  {categoriaLabels[producto.categoria] || producto.categoria}
                </span>
              </div>
            )}
            <div>
              <span className="text-xs text-text-tertiary block">Precio</span>
              <span className="text-base font-semibold font-mono text-text-primary mt-0.5 block">
                {formatEUR(producto.precio)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Uso</h2>
          <div className="space-y-2.5">
            <div>
              <span className="text-xs text-text-tertiary block">Veces usado en presupuestos</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block">{vecesUsado}</span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary block">Ingresos generados</span>
              <span className="text-base font-semibold font-mono text-text-primary mt-0.5 block">
                {formatEUR(totalIngresos)}
              </span>
            </div>
            <div>
              <span className="text-xs text-text-tertiary block">Presupuestos que lo incluyen</span>
              <span className="text-base font-semibold text-text-primary mt-0.5 block">{presupuestos.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card lg:col-span-1">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Descripción</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">
            {producto.descripcion || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-[10px] border border-border overflow-hidden shadow-card">
        <div className="px-5 py-3.5 border-b border-border bg-surface-alt">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Presupuestos que incluyen este producto
          </h2>
        </div>
        {presupuestos.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-text-tertiary">
            Este producto no se ha usado en ningún presupuesto todavía.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {presupuestos.map((p) => (
              <Link
                key={p.id}
                href={`/presupuestos/${p.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50/50 transition-colors"
              >
                <div className="font-mono text-sm text-text-tertiary w-16 flex-shrink-0">
                  #{String(p.numero).padStart(4, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {p.cliente.nombre}
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">{formatDate(p.fecha)}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] ${
                  p.estado === "aprobado" || p.estado === "pagado"
                    ? "bg-emerald-100 text-emerald-700"
                    : p.estado === "enviado"
                    ? "bg-blue-100 text-blue-700"
                    : p.estado === "vencido"
                    ? "bg-red-100 text-red-700"
                    : "bg-stone-100 text-stone-600"
                }`}>
                  {statusLabels[p.estado] || p.estado}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
