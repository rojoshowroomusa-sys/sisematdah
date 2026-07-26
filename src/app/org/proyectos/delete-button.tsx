"use client";

import { useRouter } from "next/navigation";
import { eliminarProyecto } from "@/lib/org-actions";
import { useConfirm } from "@/components/confirm";
import { showToast } from "@/components/toast";

interface Props {
  projectId: number;
  projectName: string;
}

export default function DeleteProjectButton({ projectId, projectName }: Props) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    await eliminarProyecto(projectId);
    showToast("Proyecto eliminado");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => confirm({ title: "Eliminar proyecto", message: `¿Eliminar "${projectName}"?`, onConfirm: handleDelete })}
        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
      >
        Eliminar
      </button>
      {dialog()}
    </>
  );
}
