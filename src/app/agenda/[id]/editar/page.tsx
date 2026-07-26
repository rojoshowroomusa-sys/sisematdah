import { notFound, redirect } from "next/navigation";
import { getClientes, getEvento, actualizarEvento } from "@/lib/actions";
import EventForm from "../../event-form";

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

function toTimeInput(t: string | null | undefined) {
  return t || "";
}

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await getEvento(Number(id));
  if (!evento) notFound();

  const clientes = await getClientes();

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Editar Evento</h1>
        <p className="text-sm text-text-tertiary mt-0.5">{evento.title}</p>
      </div>
      <EventForm
        clientes={clientes}
        defaultValues={{
          title: evento.title,
          description: evento.description || "",
          date: toDateInput(evento.date),
          time: toTimeInput(evento.time),
          duration: evento.duration || 60,
          type: evento.type,
          clienteId: evento.clienteId,
        }}
        onSubmit={async (data) => {
          "use server";
          await actualizarEvento(Number(id), data);
          redirect(`/agenda?mes=${new Date(evento.date).getMonth() + 1}&año=${new Date(evento.date).getFullYear()}`);
        }}
      />
    </div>
  );
}
