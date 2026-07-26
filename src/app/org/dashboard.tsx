"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quickCapture, updateTask, deleteTask, createTask } from "@/lib/org-actions";
import { VoiceCapture } from "@/components/voice-capture";
import { MadeToday } from "./made-today";
import { MinimalDashboard } from "./minimal-dashboard";
import { HyperfocusDashboard } from "./hyperfocus-dashboard";
import OrgSidebar from "@/components/org-sidebar";
import Toast, { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

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

interface ProjectLink {
  id: number;
  name: string;
  color: string | null;
}

interface Props {
  energyMood: string;
  tasks: TaskItem[];
  allTasks: TaskItem[];
  projects: ProjectLink[];
}

export function OrgDashboard({ energyMood, tasks, allTasks, projects }: Props) {
  const router = useRouter();
  const [captureText, setCaptureText] = useState("");
  const { confirm, dialog } = useConfirm();

  const isLowEnergy = energyMood === "modo_supervivencia";
  const isHyperfocus = energyMood === "hiperfoco";

  function handleChangeEnergy() {
    router.push("/org?energy=");
  }

  const handleVoiceResult = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await quickCapture(text.trim());
    router.refresh();
  }, [router]);

  async function handleCapture() {
    if (!captureText.trim()) return;
    await quickCapture(captureText.trim());
    setCaptureText("");
    showToast("Tarea capturada");
    router.refresh();
  }

  async function handleStatusChange(id: number, status: string) {
    await updateTask(id, { status });
    showToast(status === "done" ? "Tarea completada" : "Tarea reactivada");
    router.refresh();
  }

  async function handleBreakdown(taskId: number, title: string) {
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskTitle: title, energyLevel: energyMood }),
    });
    const data = await res.json();
    if (data.micro_steps) {
      for (const step of data.micro_steps) {
        await createTask({
          title: step.action,
          estimatedMinutes: step.estimated_minutes,
          energyLevel: energyMood,
          parentTaskId: taskId,
          stepOrder: step.step_order,
          status: "next_up",
        });
      }
      await updateTask(taskId, { status: "in_progress" });
      router.push(`/org/enfoque/${taskId}`);
    }
  }

  if (isLowEnergy) {
    return (
      <>
        <MinimalDashboard
          task={tasks[0] ?? null}
          onChangeEnergy={handleChangeEnergy}
        />
        <Toast />
        {dialog()}
      </>
    );
  }

  if (isHyperfocus) {
    return (
      <>
        <HyperfocusDashboard
          tasks={tasks}
          allTasks={allTasks}
          onChangeEnergy={handleChangeEnergy}
          projects={projects}
        />
        <Toast />
        {dialog()}
      </>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      <OrgSidebar
        projects={projects}
        energyMood={energyMood}
        onChangeEnergy={handleChangeEnergy}
      />
      <div className="flex-1 min-w-0 max-w-xl space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">⚡ Modo Regular</span>
          <h1 className="text-xl font-semibold text-stone-100 mt-1">Tus próximos pasos</h1>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
          <div className="flex gap-2">
            <input
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCapture()}
              placeholder="Capturá una idea al instante..."
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <VoiceCapture onResult={handleVoiceResult} />
            <button onClick={handleCapture} className="bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-3 rounded-xl text-sm font-medium">+</button>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <p className="text-sm">No hay tareas para hoy.</p>
              <p className="text-xs mt-1">Capturá una idea arriba y aparecerá acá.</p>
            </div>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 hover:border-stone-700 transition-colors">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleStatusChange(task.id, task.status === "done" ? "inbox" : "done")}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      task.status === "done" ? "bg-teal-500 border-teal-500 text-stone-950" : "border-stone-600 hover:border-teal-500"
                    }`}
                  >
                    {task.status === "done" && <span className="text-xs font-bold">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <Link href={`/org/enfoque/${task.id}`} className={`text-sm font-medium block ${task.status === "done" ? "line-through text-stone-500" : "text-stone-100"}`}>
                      {task.title}
                    </Link>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {task.estimatedMinutes && <span className="text-xs text-stone-500">{task.estimatedMinutes} min</span>}
                      {task.project && <span className="text-xs text-stone-500">{task.project.name}</span>}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="text-xs text-teal-400">{task.subtasks.filter(s => s.status === "done").length}/{task.subtasks.length} pasos</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!task.subtasks || task.subtasks.length === 0 ? (
                      <button onClick={() => handleBreakdown(task.id, task.title)} className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-stone-800" title="Desglosar">⊞</button>
                    ) : (
                      <Link href={`/org/enfoque/${task.id}`} className="text-xs text-teal-400 hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-stone-800">▶</Link>
                    )}
                    <Link href={`/org/tareas/${task.id}/editar`} className="text-xs text-stone-500 hover:text-stone-300 px-2 py-1 rounded-lg hover:bg-stone-800" title="Editar">✎</Link>
                    <button onClick={() => confirm({ title: "Eliminar tarea", message: `¿Eliminar "${task.title}"?`, onConfirm: async () => { await deleteTask(task.id); showToast("Tarea eliminada"); router.refresh(); } })} className="text-xs text-stone-500 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-stone-800">×</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Toast />
      {dialog()}
    </div>
  );
}
