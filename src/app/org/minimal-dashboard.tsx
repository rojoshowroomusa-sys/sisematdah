"use client";

import { useRouter } from "next/navigation";
import { updateTask, createTask } from "@/lib/org-actions";
import { MadeToday, logMadeToday } from "./made-today";

interface TaskItem {
  id: number;
  title: string;
  energyLevel: string;
  status: string;
  estimatedMinutes?: number | null;
  frictionScore?: number | null;
  project?: { name: string; color?: string | null } | null;
  subtasks?: { id: number; title: string; status: string }[];
}

interface Props {
  task: TaskItem | null;
  onChangeEnergy: () => void;
}

export function MinimalDashboard({ task, onChangeEnergy }: Props) {
  const router = useRouter();

  async function handleComplete() {
    if (!task) return;
    if (task.subtasks && task.subtasks.length > 0) {
      router.push(`/org/enfoque/${task.id}`);
      return;
    }
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskTitle: task.title, energyLevel: "cero_energia" }),
    });
    const data = await res.json();
    if (data.micro_steps) {
      for (const step of data.micro_steps) {
        await createTask({
          title: step.action,
          estimatedMinutes: step.estimated_minutes,
          energyLevel: "cero_energia",
          parentTaskId: task.id,
          stepOrder: step.step_order,
          status: "next_up",
        });
      }
      await updateTask(task.id, { status: "in_progress" });
      router.push(`/org/enfoque/${task.id}`);
    } else {
      await updateTask(task.id, { status: "done" });
      logMadeToday(task.title);
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-between max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
          🛡️ Modo Mínimo
        </span>
        <button onClick={onChangeEnergy} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
          Cambiar energía
        </button>
      </div>

      {!task ? (
        <div className="my-auto py-16 text-center text-slate-500">
          <p className="text-sm">No hay tareas de baja energía.</p>
          <p className="text-xs mt-2">Capturá una desde la página principal o cambiá de modo.</p>
          <button onClick={onChangeEnergy} className="mt-4 text-xs text-teal-400 underline underline-offset-4">
            Cambiar a otro modo
          </button>
        </div>
      ) : (
        <div className="my-auto py-12 px-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Única prioridad para hoy {task.estimatedMinutes ? `(~${task.estimatedMinutes} min)` : ""}
          </span>

          <h1 className="text-2xl font-medium text-slate-50 leading-relaxed">
            {task.title}
          </h1>

          <button
            onClick={handleComplete}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all shadow-lg"
          >
            ✓ Cumplí con esto por hoy
          </button>
        </div>
      )}

      <div className="flex items-end gap-4">
        <p className="text-center text-xs text-slate-400 italic flex-1">
          &ldquo;Si hacés solo esto, tu negocio sigue funcionando.&rdquo;
        </p>
        <div className="w-48">
          <MadeToday />
        </div>
      </div>
    </div>
  );
}
