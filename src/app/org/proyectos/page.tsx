import Link from "next/link";
import { getProjects } from "@/lib/org-actions";
import DeleteProjectButton from "./delete-button";

export default async function ProyectosPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-100">Proyectos</h1>
          <p className="text-sm text-stone-500 mt-0.5">{projects.length} proyectos</p>
        </div>
        <Link
          href="/org/proyectos/nuevo"
          className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-[8px] hover:bg-teal-500 transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-[12px] bg-stone-800 border border-stone-700/50 flex items-center justify-center">
            <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
          </div>
          <p className="text-base font-medium text-stone-300 mb-1">No hay proyectos</p>
          <p className="text-sm text-stone-500">Creá proyectos para organizar tus tareas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-stone-800/80 border border-stone-700/50 rounded-[10px] p-4 hover:border-stone-600/50 transition-colors shadow-card"
            >
              <Link href={`/org/proyectos/${p.id}`} className="block">
                <div className="flex items-center gap-2.5 mb-2">
                  {p.color && (
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                  )}
                  <h3 className="font-medium text-sm text-stone-100 truncate">
                    {p.name}
                  </h3>
                </div>
                <p className="text-xs text-stone-500">
                  {p._count.tasks} {(p._count.tasks === 1 ? "tarea" : "tareas")}
                </p>
              </Link>
              <div className="flex gap-2.5 mt-3 pt-3 border-t border-stone-700/30">
                <Link
                  href={`/org/proyectos/${p.id}/editar`}
                  className="text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Editar
                </Link>
                <DeleteProjectButton projectId={p.id} projectName={p.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
