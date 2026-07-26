import Link from "next/link";
import { getTasks } from "@/lib/org-actions";

interface TaskItem {
  id: number;
  title: string;
  status: string;
  energyLevel: string;
  estimatedMinutes: number | null;
  parentTaskId: number | null;
}

export default async function TodasLasTareasPage() {
  const tasks: TaskItem[] = (await getTasks({})) as unknown as TaskItem[];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/org" className="text-xs text-slate-400 hover:text-teal-400 underline underline-offset-4 mb-1 inline-block">
            ← Volver
          </Link>
          <h1 className="text-xl font-semibold text-slate-100">Todas las tareas</h1>
        </div>
      </div>

      <div className="space-y-1">
        {["inbox", "next_up", "in_progress", "done", "archived"].map((status) => {
          const filtered = tasks.filter((t) => t.status === status && !t.parentTaskId);
          if (filtered.length === 0) return null;
          return (
            <div key={status} className="mb-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 px-1">
                {status === "inbox" ? "📥 Bandeja" :
                 status === "next_up" ? "▶ Siguientes" :
                 status === "in_progress" ? "🔄 En progreso" :
                 status === "done" ? "✅ Completadas" : "📦 Archivadas"}
              </h2>
              {filtered.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/50 transition-colors text-sm group">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.energyLevel === "cero_energia" ? "bg-rose-500" :
                    task.energyLevel === "hiperfoco" ? "bg-emerald-500" : "bg-amber-500"
                  }`} />
                  <Link href={`/org/enfoque/${task.id}`} className={`flex-1 min-w-0 ${task.status === "done" ? "line-through text-slate-500" : "text-slate-200"}`}>
                    <span className="truncate block">{task.title}</span>
                  </Link>
                  {task.estimatedMinutes && (
                    <span className="text-xs text-slate-500">{task.estimatedMinutes} min</span>
                  )}
                  <Link
                    href={`/org/tareas/${task.id}/editar`}
                    className="text-xs text-slate-600 hover:text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Editar"
                  >
                    ✎
                  </Link>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
