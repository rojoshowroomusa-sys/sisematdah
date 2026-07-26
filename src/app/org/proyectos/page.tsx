import Link from "next/link";
import { getProjects } from "@/lib/org-actions";
import DeleteProjectButton from "./delete-button";

export const dynamic = 'force-dynamic';

export default async function ProyectosPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-100">Proyectos</h1>
          <p className="text-sm text-stone-400 mt-0.5">{projects.length} proyectos</p>
        </div>
        <Link
          href="/org/proyectos/nuevo"
          className="text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-[8px] hover:bg-emerald-500 transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      <div className="space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-stone-800 border border-stone-700 rounded-[10px] px-4 py-3 flex items-center justify-between hover:border-stone-600 transition-colors"
          >
            <Link href={`/org/proyectos/${p.id}`} className="text-sm font-medium text-stone-200 hover:text-emerald-400 transition-colors">
              {p.name}
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500">{p._count.tasks} tareas</span>
              <Link
                href={`/org/proyectos/${p.id}/editar`}
                className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                Editar
              </Link>
              <DeleteProjectButton projectId={p.id} projectName={p.name} />
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-12">No hay proyectos aún</p>
        )}
      </div>
    </div>
  );
}
