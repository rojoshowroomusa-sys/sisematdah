import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTask, updateTask, getProjects } from "@/lib/org-actions";
import TaskForm from "../../form";

export default async function EditarTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await getTask(Number(id));
  if (!raw) notFound();
  const task = raw;

  const projects = await getProjects();

  async function handleSubmit(data: {
    title: string;
    energyLevel?: string;
    estimatedMinutes?: number;
    status?: string;
    projectId?: number | null;
  }) {
    "use server";
    await updateTask(task.id, data);
    redirect("/org");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <Link
          href="/org"
          className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
        >
          ← Volver
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-stone-100">Editar Tarea</h1>
          <p className="text-sm text-stone-500 mt-0.5 truncate max-w-md">{task.title}</p>
        </div>
      </div>
      <TaskForm
        projectOptions={projects.map((p) => ({ id: p.id, name: p.name }))}
        defaultValues={{
          title: task.title,
          energyLevel: task.energyLevel,
          estimatedMinutes: task.estimatedMinutes,
          status: task.status,
          projectId: task.projectId,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
