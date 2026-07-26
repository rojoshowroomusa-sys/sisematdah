import { redirect } from "next/navigation";
import { createProject } from "@/lib/org-actions";
import ProjectForm from "../form";

export default function NuevoProyectoPage() {
  async function handleSubmit(data: { name: string; color?: string }) {
    "use server";
    await createProject(data);
    redirect("/org/proyectos");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-lg font-semibold tracking-tight text-stone-100">Nuevo Proyecto</h1>
        <p className="text-sm text-stone-500 mt-0.5">Creá un proyecto para agrupar tareas</p>
      </div>
      <ProjectForm onSubmit={handleSubmit} />
    </div>
  );
}
