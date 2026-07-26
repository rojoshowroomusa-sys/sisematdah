import { redirect } from "next/navigation";
import { crearCliente } from "@/lib/actions";
import ClienteForm from "../form";

export default function NuevoClientePage() {
  async function handleSubmit(data: { nombre: string; email?: string; telefono?: string; direccion?: string }) {
    "use server";
    await crearCliente(data);
    redirect("/clientes");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Nuevo Cliente</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Agregá un cliente al sistema</p>
      </div>
      <ClienteForm onSubmit={handleSubmit} />
    </div>
  );
}
