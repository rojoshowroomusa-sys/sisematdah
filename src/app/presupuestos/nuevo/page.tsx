import { redirect } from "next/navigation";
import Link from "next/link";
import { getClientes, getProductos, crearPresupuesto, getPlantillas } from "@/lib/actions";
export const dynamic = 'force-dynamic';
import PresupuestoForm from "../form";
import { formatEUR } from "@/lib/format";

export default async function NuevoPresupuestoPage({ searchParams }: { searchParams: Promise<{ plantilla?: string }> }) {
  const [clientes, productos, plantillas] = await Promise.all([getClientes(), getProductos(), getPlantillas()]);
  const { plantilla } = await searchParams;
  const plantillaData = plantilla ? plantillas.find((p) => p.id === Number(plantilla)) : null;

  async function handleSubmit(data: Parameters<typeof crearPresupuesto>[0]) {
    "use server";
    const presupuesto = await crearPresupuesto(data);
    redirect(`/presupuestos/${presupuesto.id}`);
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Nuevo Presupuesto</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Creá un presupuesto para un cliente</p>
      </div>

      {plantillas.length > 0 && !plantillaData && (
        <div className="bg-surface border border-border rounded-[10px] p-4 mb-6 shadow-card">
          <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Desde una plantilla</h2>
          <div className="flex flex-wrap gap-2">
            {plantillas.map((p) => {
              const subtotal = p.items.reduce((s, i) => s + i.total, 0);
              const total = subtotal + subtotal * (p.impuesto / 100);
              return (
                <Link
                  key={p.id}
                  href={`/presupuestos/nuevo?plantilla=${p.id}`}
                  className="text-sm px-3 py-2 rounded-[8px] border border-border hover:border-purple-200 hover:bg-purple-50 transition-colors"
                >
                  <span className="font-medium text-text-primary">{p.cliente.nombre}</span>
                  <span className="text-text-tertiary text-xs ml-2">{formatEUR(total)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {plantillaData && (
        <div className="mb-4">
          <Link
            href="/presupuestos/nuevo"
            className="text-xs text-text-tertiary hover:text-accent transition-colors"
          >
            &larr; Sin plantilla
          </Link>
        </div>
      )}

      <PresupuestoForm
        clientes={clientes}
        productos={productos}
        onSubmit={handleSubmit}
        defaultValues={plantillaData ? {
          clienteId: plantillaData.clienteId,
          fecha: new Date().toISOString().split("T")[0],
          validez: plantillaData.validez ?? "",
          notas: plantillaData.notas ?? "",
          impuesto: plantillaData.impuesto,
          estado: "borrador",
        } : undefined}
        defaultItems={plantillaData ? plantillaData.items.map((i) => ({
          productoId: i.productoId ?? undefined,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        })) : undefined}
      />
    </div>
  );
}
