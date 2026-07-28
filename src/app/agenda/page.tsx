import Link from "next/link";
import { getEventos } from "@/lib/actions";
import { CalendarGrid } from "./calendar-grid";
import { WeekView } from "./week-view";
import { DeleteEventButton } from "./delete-event";

interface EventoConCliente {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  time: string | null;
  duration: number | null;
  type: string;
  clienteId: number | null;
  cliente: { id: number; nombre: string; email: string | null; telefono: string | null } | null;
}

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const typeColors: Record<string, string> = {
  cita: "bg-blue-100 text-blue-700",
  reunion: "bg-purple-100 text-purple-700",
  llamada: "bg-amber-100 text-amber-700",
  recordatorio: "bg-teal-100 text-teal-700",
  otro: "bg-stone-100 text-stone-600",
};

const typeLabels: Record<string, string> = {
  cita: "Cita",
  reunion: "Reunión",
  llamada: "Llamada",
  recordatorio: "Recordatorio",
  otro: "Otro",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; año?: string; dia?: string; vista?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const mes = params.mes ? parseInt(params.mes) - 1 : now.getMonth();
  const año = params.año ? parseInt(params.año) : now.getFullYear();
  const diaSeleccionado = params.dia ? parseInt(params.dia) : null;
  const vista = params.vista || "mes";

  const eventos = await getEventos(mes, año);

  const eventosDelDia = diaSeleccionado
    ? (eventos as EventoConCliente[]).filter((e) => new Date(e.date).getDate() === diaSeleccionado && new Date(e.date).getMonth() === mes)
    : [];

  const prevMes = mes === 0 ? 11 : mes - 1;
  const prevAño = mes === 0 ? año - 1 : año;
  const nextMes = mes === 11 ? 0 : mes + 1;
  const nextAño = mes === 11 ? año + 1 : año;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Agenda</h1>
          <p className="text-sm text-text-tertiary mt-0.5">{meses[mes]} {año}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex border border-border rounded-[8px] overflow-hidden">
            <Link
              href={`/agenda?mes=${mes + 1}&año=${año}${diaSeleccionado ? `&dia=${diaSeleccionado}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                vista === "mes" ? "bg-accent text-white" : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              Mes
            </Link>
            <Link
              href={`/agenda?mes=${mes + 1}&año=${año}&vista=semana${diaSeleccionado ? `&dia=${diaSeleccionado}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                vista === "semana" ? "bg-accent text-white" : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              Semana
            </Link>
          </div>
          <Link
            href="/agenda/nuevo"
            className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors whitespace-nowrap"
          >
            + Nuevo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
            <Link
              href={`/agenda?mes=${prevMes + 1}&año=${prevAño}${vista === "semana" ? "&vista=semana" : ""}`}
              className="text-xs sm:text-sm font-medium text-text-tertiary hover:text-accent transition-colors"
            >
              ← {meses[prevMes]}
            </Link>
            <h2 className="font-semibold text-sm sm:text-base text-text-primary">{meses[mes]} {año}</h2>
            <Link
              href={`/agenda?mes=${nextMes + 1}&año=${nextAño}${vista === "semana" ? "&vista=semana" : ""}`}
              className="text-xs sm:text-sm font-medium text-text-tertiary hover:text-accent transition-colors"
            >
              {meses[nextMes]} →
            </Link>
            </div>
            {vista === "semana" ? (
              <WeekView eventos={eventos as EventoConCliente[]} mes={mes} año={año} />
            ) : (
              <CalendarGrid mes={mes} año={año} diaSeleccionado={diaSeleccionado} eventos={eventos} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-[10px] border border-border p-5 shadow-card">
            <h3 className="font-medium text-sm text-text-secondary mb-3">
              {diaSeleccionado
                ? `Eventos del ${diaSeleccionado} de ${meses[mes]}`
                : "Seleccioná un día"}
            </h3>
            {eventosDelDia.length === 0 && diaSeleccionado && (
              <p className="text-sm text-text-tertiary">Sin eventos este día</p>
            )}
            <div className="space-y-2">
              {eventosDelDia.map((e) => (
                <div key={e.id} className="p-3 rounded-[8px] border border-border space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] ${typeColors[e.type] || "bg-stone-100 text-stone-600"}`}>
                      {typeLabels[e.type] || e.type}
                    </span>
                    {e.time && <span className="text-xs font-mono text-text-tertiary">{e.time}</span>}
                  </div>
                  <p className="text-sm font-medium text-text-primary">{e.title}</p>
                  {e.cliente && <p className="text-xs text-text-tertiary">{e.cliente.nombre}</p>}
                  {e.description && <p className="text-xs text-text-tertiary">{e.description}</p>}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/agenda/${e.id}/editar`}
                      className="text-xs font-medium text-accent hover:text-accent-hover"
                    >
                      Editar
                    </Link>
                    <DeleteEventButton eventId={e.id} title={e.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href={`/agenda/nuevo${diaSeleccionado ? `?dia=${diaSeleccionado}&mes=${mes + 1}&año=${año}` : ""}`}
            className="block text-center border border-dashed border-border text-text-tertiary hover:text-accent hover:border-accent px-4 py-2.5 rounded-[8px] text-sm font-medium transition-colors"
          >
            + Agregar evento rápido
          </Link>
        </div>
      </div>
    </div>
  );
}
