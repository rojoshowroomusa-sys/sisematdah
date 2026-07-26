import { redirect } from "next/navigation";
import { getClientes, crearEvento } from "@/lib/actions";
import EventForm from "../event-form";

export default async function NuevoEventoPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string; mes?: string; año?: string }>;
}) {
  const params = await searchParams;
  const clientes = await getClientes();

  const today = new Date();
  const fechaPreset = params.año && params.mes && params.dia
    ? `${params.año}-${String(Number(params.mes)).padStart(2, "0")}-${String(Number(params.dia)).padStart(2, "0")}`
    : today.toISOString().split("T")[0];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Nuevo Evento</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Agregá un evento a la agenda</p>
      </div>
      <EventForm
        clientes={clientes}
        defaultValues={{
          title: "",
          description: "",
          date: fechaPreset,
          time: "",
          duration: 60,
          type: "cita",
          clienteId: null,
        }}
        onSubmit={async (data) => {
          "use server";
          const evento = await crearEvento(data);
          redirect(`/agenda?mes=${new Date(evento.date).getMonth() + 1}&año=${new Date(evento.date).getFullYear()}&dia=${new Date(evento.date).getDate()}`);
        }}
      />
    </div>
  );
}
