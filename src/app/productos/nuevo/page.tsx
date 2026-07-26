import { redirect } from "next/navigation";
import { crearProducto } from "@/lib/actions";
import ProductoForm from "../form";

export default function NuevoProductoPage() {
  async function handleSubmit(data: { nombre: string; descripcion?: string; precio: number; tipo?: string; categoria?: string }) {
    "use server";
    await crearProducto(data);
    redirect("/productos");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Nuevo Producto / Servicio</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Agregá un producto o servicio al catálogo</p>
      </div>
      <ProductoForm onSubmit={handleSubmit} />
    </div>
  );
}
