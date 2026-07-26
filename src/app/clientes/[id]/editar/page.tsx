import { notFound, redirect } from "next/navigation";
import { getCliente, actualizarCliente } from "@/lib/actions";
import ClienteForm from "../../form";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getCliente(Number(id));
  if (!cliente) notFound();
  const clienteId = cliente.id;

  async function handleSubmit(data: { nombre: string; email?: string; telefono?: string; direccion?: string }) {
    "use server";
    await actualizarCliente(clienteId, data);
    redirect("/clientes");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Editar Cliente</h1>
        <p className="text-sm text-text-tertiary mt-0.5">{cliente.nombre}</p>
      </div>
      <ClienteForm defaultValues={cliente} onSubmit={handleSubmit} />
    </div>
  );
}
