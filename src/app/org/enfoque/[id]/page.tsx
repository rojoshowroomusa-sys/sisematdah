import { notFound } from "next/navigation";
import { getTask } from "@/lib/org-actions";
import { TaskFocusView } from "./focus-view";

interface SubtaskData {
  id: number;
  title: string;
  estimatedMinutes: number | null;
  stepOrder: number | null;
}

export default async function EnfoquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(Number(id));
  if (!task) notFound();

  const subtasks = task.subtasks as SubtaskData[];

  if (subtasks.length === 0 && task.parentTaskId) {
    return (
      <TaskFocusView
        task={{
          id: task.id,
          title: task.title,
          estimatedMinutes: task.estimatedMinutes ?? undefined,
          parentTitle: task.parentTask?.title ?? undefined,
        }}
        isSingle={true}
      />
    );
  }

  if (subtasks.length === 0) {
    return (
      <TaskFocusView
        task={{
          id: task.id,
          title: task.title,
          estimatedMinutes: task.estimatedMinutes ?? undefined,
        }}
        isSingle={true}
      />
    );
  }

  return (
    <TaskFocusView
      task={{
        id: task.id,
        title: task.title,
      }}
      steps={subtasks.map((s) => ({
        id: s.id,
        action: s.title,
        estimatedMinutes: s.estimatedMinutes ?? undefined,
        order: s.stepOrder ?? 0,
      }))}
      isSingle={false}
    />
  );
}
