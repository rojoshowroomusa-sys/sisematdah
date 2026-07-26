import { notFound, redirect } from "next/navigation";
import { getProject, actualizarProyecto } from "@/lib/org-actions";
import ProjectForm from "../../form";

export default async function EditarProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await getProject(Number(id));
  if (!raw) notFound();
  const project = raw;

  async function handleSubmit(data: { name: string; color?: string }) {
    "use server";
    await actualizarProyecto(project.id, data);
    redirect("/org/proyectos");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-lg font-semibold tracking-tight text-stone-100">Editar Proyecto</h1>
        <p className="text-sm text-stone-500 mt-0.5">{project.name}</p>
      </div>
      <ProjectForm
        defaultValues={{ name: project.name, color: project.color }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
