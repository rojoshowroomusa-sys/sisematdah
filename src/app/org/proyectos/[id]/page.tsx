import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getTasks } from "@/lib/org-actions";
import { formatMinutes } from "@/lib/format";

const statusLabels: Record<string, string> = {
  inbox: "Pendiente",
  next_up: "Siguiente",
  in_progress: "En curso",
  done: "Completada",
  archived: "Archivada",
};

const energyColors: Record<string, string> = {
  cero_energia: "bg-rose-500",
  media_energia: "bg-amber-500",
  hiperfoco: "bg-emerald-500",
};

const energyLabels: Record<string, string> = {
  cero_energia: "Mínima",
  media_energia: "Media",
  hiperfoco: "Hiperfoco",
};

export default async function ProyectoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(Number(id));
  if (!project) notFound();

  const tasks = await getTasks({ projectId: project.id });

  const grupos = tasks.reduce(
    (acc, t) => {
      const g = t.status === "done" || t.status === "archived" ? "completadas" : "activas";
      if (!acc[g]) acc[g] = [];
      acc[g].push(t);
      return acc;
    },
    {} as Record<string, typeof tasks>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <Link
          href="/org/proyectos"
          className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
        >
          ← Proyectos
        </Link>
        <div className="flex items-center gap-2.5">
          {project.color && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
          )}
          <h1 className="text-lg font-semibold tracking-tight text-stone-100">
            {project.name}
          </h1>
        </div>
        <span className="text-xs text-stone-500 bg-stone-800 px-2 py-0.5 rounded-[4px]">
          {project._count.tasks} {(project._count.tasks === 1 ? "tarea" : "tareas")}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-400 text-sm">No hay tareas en este proyecto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {["activas", "completadas"].map((grupo) => {
            const items = grupos[grupo] || [];
            if (items.length === 0) return null;
            return (
              <div key={grupo}>
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  {grupo === "activas" ? "Activas" : "Completadas"}
                  <span className="ml-1.5 font-normal text-stone-600">({items.length})</span>
                </h2>
                <div className="space-y-1.5">
                  {items.map((t) => (
                    <Link
                      key={t.id}
                      href={`/org/enfoque/${t.id}`}
                      className="flex items-center gap-3 bg-stone-800/50 border border-stone-700/30 rounded-[8px] px-4 py-3 hover:bg-stone-800 hover:border-stone-600/50 transition-colors"
                    >
                      {t.energyLevel && (
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            energyColors[t.energyLevel] || "bg-stone-600"
                          }`}
                          title={energyLabels[t.energyLevel] || t.energyLevel}
                        />
                      )}
                      <span
                        className={`flex-1 text-sm min-w-0 truncate ${
                          t.status === "done"
                            ? "line-through text-stone-500"
                            : "text-stone-200"
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.estimatedMinutes && (
                        <span className="text-xs font-mono text-stone-500 flex-shrink-0">
                          {formatMinutes(t.estimatedMinutes)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] flex-shrink-0 ${
                          t.status === "done"
                            ? "bg-emerald-900/40 text-emerald-400"
                            : t.status === "in_progress"
                            ? "bg-blue-900/40 text-blue-400"
                            : t.status === "next_up"
                            ? "bg-amber-900/40 text-amber-400"
                            : "bg-stone-700/50 text-stone-400"
                        }`}
                      >
                        {statusLabels[t.status] || t.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
