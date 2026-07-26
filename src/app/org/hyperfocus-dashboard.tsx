"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quickCapture, updateTask, createTask } from "@/lib/org-actions";
import { VoiceCapture } from "@/components/voice-capture";
import OrgSidebar from "@/components/org-sidebar";

interface TaskItem {
  id: number;
  title: string;
  energyLevel: string;
  status: string;
  estimatedMinutes?: number | null;
  frictionScore?: number | null;
  parentTaskId?: number | null;
  project?: { name: string; color?: string | null } | null;
  subtasks?: { id: number; title: string; status: string }[];
}

interface ProjectLink {
  id: number;
  name: string;
  color: string | null;
}

interface Props {
  tasks: TaskItem[];
  allTasks: TaskItem[];
  onChangeEnergy: () => void;
  projects: ProjectLink[];
}

export function HyperfocusDashboard({ tasks, allTasks, onChangeEnergy, projects }: Props) {
  const router = useRouter();
  const [captureText, setCaptureText] = useState("");
  const [showInbox, setShowInbox] = useState(false);

  const critical = tasks.filter(t => t.energyLevel === "cero_energia" || t.frictionScore && t.frictionScore <= 2);
  const queue = tasks.filter(t => t.energyLevel === "media_energia" && !critical.includes(t));
  const ideas = allTasks.filter(t => t.status === "inbox" && !t.parentTaskId);

  const handleVoiceResult = useCallback(async (text: string) => {
    if (!text.trim()) return;
    await quickCapture(text.trim());
    router.refresh();
  }, [router]);

  async function handleCapture() {
    if (!captureText.trim()) return;
    await quickCapture(captureText.trim());
    setCaptureText("");
    router.refresh();
  }

  async function handleBreakdown(taskId: number, title: string) {
    const res = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskTitle: title, energyLevel: "hiperfoco" }),
    });
    const data = await res.json();
    if (data.micro_steps) {
      for (const step of data.micro_steps) {
        await createTask({
          title: step.action,
          estimatedMinutes: step.estimated_minutes,
          energyLevel: "hiperfoco",
          parentTaskId: taskId,
          stepOrder: step.step_order,
          status: "next_up",
        });
      }
      await updateTask(taskId, { status: "in_progress" });
      router.push(`/org/enfoque/${taskId}`);
    }
  }

  return (
    <div className="flex gap-8 items-start">
      <OrgSidebar
        projects={projects}
        energyMood="hiperfoco"
        onChangeEnergy={onChangeEnergy}
      />

      <main className="flex-1 min-w-0 space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Sprint de Trabajo</h1>
            <p className="text-sm text-stone-400">Aprovechá la claridad mental manteniendo el foco en el top 3.</p>
          </div>
        </header>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3">
          <div className="flex gap-2">
            <input
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCapture()}
              placeholder="Capturá una idea al instante..."
              className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <VoiceCapture onResult={handleVoiceResult} />
            <button onClick={handleCapture} className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 px-4 py-3 rounded-xl text-sm font-medium">
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">🔥 Bloque Crítico</h3>
            {critical.length === 0 ? (
              <p className="text-xs text-stone-500">Sin tareas críticas</p>
            ) : (
              critical.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    {t.project && <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded">{t.project.name}</span>}
                    <Link href={`/org/tareas/${t.id}/editar`} className="text-xs text-stone-500 hover:text-stone-300" title="Editar">✎</Link>
                  </div>
                  <Link href={`/org/enfoque/${t.id}`} className="text-sm font-medium text-stone-100 block hover:text-emerald-300">
                    {t.title}
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">📋 En Cola</h3>
            {queue.length === 0 ? (
              <p className="text-xs text-stone-500">Sin tareas en cola</p>
            ) : (
              queue.slice(0, 3).map((t) => (
                <div key={t.id} className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    {t.project && <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded">{t.project.name}</span>}
                    <Link href={`/org/tareas/${t.id}/editar`} className="text-xs text-stone-500 hover:text-stone-300" title="Editar">✎</Link>
                  </div>
                  <Link href={`/org/enfoque/${t.id}`} className="text-sm font-medium text-stone-100 block hover:text-teal-300">
                    {t.title}
                  </Link>
                  <div className="flex gap-2">
                    {t.estimatedMinutes && <span className="text-xs text-stone-500">{t.estimatedMinutes} min</span>}
                    <button onClick={() => handleBreakdown(t.id, t.title)} className="text-xs text-teal-500 hover:text-teal-400">
                      ⊞ desglosar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-stone-900/60 border border-stone-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">💡 Ideas & Backlog</h3>
            <button
              onClick={() => setShowInbox(!showInbox)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              {showInbox ? "Ocultar" : "Mostrar"} bandeja ({ideas.length})
            </button>
            {showInbox && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ideas.length === 0 ? (
                  <p className="text-xs text-stone-500">Bandeja vacía</p>
                ) : (
                  ideas.slice(0, 8).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-stone-400">
                      <span>•</span>
                      <span>{t.title}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
