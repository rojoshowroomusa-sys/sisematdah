import { notFound, redirect } from "next/navigation";
import { getPresupuesto, getClientes, getProductos, actualizarPresupuesto } from "@/lib/actions";
import PresupuestoForm from "../../form";

export default async function EditarPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [presupuesto, clientes, productos] = await Promise.all([
    getPresupuesto(Number(id)),
    getClientes(),
    getProductos(),
  ]);
  if (!presupuesto) notFound();
  const pId = presupuesto.id;
  const pClienteId = presupuesto.clienteId;
  const pFecha = presupuesto.fecha;
  const pValidez = presupuesto.validez;
  const pNotas = presupuesto.notas;
  const pImpuesto = presupuesto.impuesto;
  const pEstado = presupuesto.estado;
  const pItems = presupuesto.items;

  async function handleSubmit(data: Parameters<typeof actualizarPresupuesto>[1]) {
    "use server";
    await actualizarPresupuesto(pId, data);
    redirect(`/presupuestos/${pId}`);
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Editar Presupuesto</h1>
        <p className="text-sm text-text-tertiary mt-0.5">#{String(presupuesto.numero).padStart(4, "0")}</p>
      </div>
      <PresupuestoForm
        clientes={clientes}
        productos={productos}
        defaultValues={{
          clienteId: pClienteId,
          fecha: new Date(pFecha).toISOString().split("T")[0],
          validez: pValidez ?? "",
          notas: pNotas ?? "",
          impuesto: pImpuesto,
          estado: pEstado,
        }}
        defaultItems={pItems.map((i) => ({
          productoId: i.productoId ?? undefined,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
