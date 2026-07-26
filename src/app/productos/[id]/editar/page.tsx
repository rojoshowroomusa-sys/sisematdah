import { notFound, redirect } from "next/navigation";
import { getProducto, actualizarProducto } from "@/lib/actions";
import ProductoForm from "../../form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProducto(Number(id));
  if (!producto) notFound();
  const productoId = producto.id;

  async function handleSubmit(data: { nombre: string; descripcion?: string; precio: number; tipo?: string; categoria?: string }) {
    "use server";
    await actualizarProducto(productoId, data);
    redirect("/productos");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Editar Producto</h1>
        <p className="text-sm text-text-tertiary mt-0.5">{producto.nombre}</p>
      </div>
      <ProductoForm defaultValues={producto} onSubmit={handleSubmit} />
    </div>
  );
}
