import Link from "next/link";
import { getClientes } from "@/lib/actions";
import { ClientesList } from "./list";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; order?: string }>;
}) {
  const params = await searchParams;
  const clientes = await getClientes({
    search: params.search,
    sort: params.sort,
    order: params.order,
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Clientes</h1>
          <p className="text-sm text-text-tertiary mt-0.5">{clientes.length} registrados</p>
        </div>
        <Link
          href="/clientes/nuevo"
          className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-20 text-text-tertiary">
          <p className="text-base font-medium text-text-secondary mb-1">No hay clientes aún</p>
          <p className="text-sm">Creá tu primer cliente para empezar</p>
        </div>
      ) : (
        <ClientesList
          items={clientes.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            email: c.email,
            telefono: c.telefono,
            createdAt: c.createdAt,
            presupuestosCount: c._count.presupuestos,
          }))}
        />
      )}
    </div>
  );
}
