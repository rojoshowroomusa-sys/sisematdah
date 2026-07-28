import Link from "next/link";
import { getProductos } from "@/lib/actions";
import { formatEUR } from "@/lib/format";
import { ProductosFilter } from "./filter";
import { ProductosList } from "./list";

const categoriaLabels: Record<string, string> = {
  material: "Material",
  servicio: "Servicio",
  digital: "Digital",
  suscripcion: "Suscripción",
  consultoria: "Consultoría",
  otro: "Otro",
};

const categoriaColors: Record<string, string> = {
  material: "bg-amber-100 text-amber-700",
  servicio: "bg-purple-100 text-purple-700",
  digital: "bg-blue-100 text-blue-700",
  suscripcion: "bg-teal-100 text-teal-700",
  consultoria: "bg-indigo-100 text-indigo-700",
  otro: "bg-stone-100 text-stone-600",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const productos = await getProductos();

  const filtered = productos.filter((p) => {
    if (params.search && !p.nombre.toLowerCase().includes(params.search.toLowerCase())) return false;
    if (params.categoria && p.categoria !== params.categoria) return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-text-primary">Productos / Servicios</h1>
          <p className="text-sm text-text-tertiary mt-0.5">{filtered.length} registrados</p>
        </div>
        <Link
          href="/productos/nuevo"
          className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors shrink-0"
        >
          + Nuevo
        </Link>
      </div>

      <ProductosFilter />

      <ProductosList
        items={filtered.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          tipo: p.tipo,
          categoria: p.categoria,
          descripcion: p.descripcion,
          precio: p.precio,
        }))}
        categoriaLabels={categoriaLabels}
        categoriaColors={categoriaColors}
      />
    </div>
  );
}
