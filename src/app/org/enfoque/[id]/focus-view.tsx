"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateTask, deleteTask } from "@/lib/org-actions";
import { logMadeToday } from "../../made-today";
import Timer from "@/components/timer";
import Toast, { showToast } from "@/components/toast";
import { useConfirm } from "@/components/confirm";

interface StepData {
  id: number;
  action: string;
  estimatedMinutes?: number;
  order: number;
}

interface FocusTask {
  id: number;
  title: string;
  estimatedMinutes?: number;
  parentTitle?: string;
}

interface Props {
  task: FocusTask;
  steps?: StepData[];
  isSingle: boolean;
}

export function TaskFocusView({ task, steps, isSingle }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const { confirm, dialog } = useConfirm();

  const displaySteps = steps ?? [];
  const currentStep = displaySteps[currentIndex];
  const isLastStep = currentIndex === displaySteps.length - 1;
  const totalSteps = displaySteps.length;

  const handleNext = useCallback(async () => {
    setCompleting(true);
    try {
      if (isSingle) {
        await updateTask(task.id, { status: "done" });
        logMadeToday(task.title);
        showToast("✓ Completado");
        setCompleted(true);
        return;
      }

      if (currentStep) {
        await updateTask(currentStep.id, { status: "done" });
        showToast("Paso completado");
      }

      if (isLastStep) {
        await updateTask(task.id, { status: "done" });
        logMadeToday(task.title);
        showToast("✓ Tarea finalizada");
        setCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } finally {
      setCompleting(false);
    }
  }, [isSingle, currentStep, isLastStep, task.id]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !completed) {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, completed]);

  if (completed) {
    return (
      <div className="max-w-md mx-auto min-h-[350px] p-8 bg-stone-900 border border-stone-700/50 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-3xl mb-4 border border-teal-500/20">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-stone-100 mb-2">Listo por hoy</h2>
        <p className="text-sm text-stone-400 mb-6">Completaste {isSingle ? "la acción" : "todos los pasos"}.</p>
        <button
          onClick={() => router.push("/org")}
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start max-w-2xl mx-auto">
      <div className="flex-1 min-h-[350px] p-6 bg-stone-900 border border-stone-700/50 rounded-3xl shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <div className="flex items-center gap-2">
              <button onClick={() => confirm({ title: "Salir del foco", message: "¿Salir del modo foco? El progreso se guarda.", confirmLabel: "Salir", onConfirm: () => router.push("/org") })} className="text-stone-500 hover:text-stone-300 transition-colors" title="Salir">←</button>
              <span className="truncate max-w-[180px]">{task.title}</span>
            </div>
            {totalSteps > 0 && (
              <span className="font-mono bg-stone-800 px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {totalSteps}
              </span>
            )}
          </div>

          {task.parentTitle && (
            <div className="text-xs text-stone-500 mt-1">Parte de: {task.parentTitle}</div>
          )}
        </div>

        <div className="my-8">
          <span className="text-xs font-semibold tracking-wider text-teal-400 uppercase">
            {isSingle ? "Acción" : `Acción inmediata (${currentStep?.estimatedMinutes ?? task.estimatedMinutes ?? "?"} min)`}
          </span>
          <h2 className="text-2xl font-medium mt-2 leading-snug text-stone-50">
            {isSingle ? task.title : currentStep?.action}
          </h2>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={completing}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 text-stone-950 font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {completing ? "..." : isSingle
              ? "✓ Completar"
              : isLastStep
              ? "✓ Finalizar por hoy"
              : "Hecho, siguiente paso →"}
          </button>

          {!isSingle && (
            <p className="text-center text-xs text-stone-500">Presioná Espacio para avanzar</p>
          )}
        </div>
      </div>

      <div className="w-44 flex-shrink-0 space-y-3">
        <Timer />
        <button
          onClick={() => confirm({ title: "Eliminar tarea", message: `¿Eliminar "${task.title}"?`, onConfirm: async () => { await deleteTask(task.id); showToast("Tarea eliminada"); router.push("/org"); } })}
          className="w-full text-xs text-rose-500 hover:text-rose-400 border border-rose-800/50 p-2 rounded-xl text-center transition-colors"
        >
          Eliminar tarea
        </button>
      </div>
      <Toast />
      {dialog()}
    </div>
  );
}
