import Link from "next/link";

interface EventItem {
  id: number;
  title: string;
  date: Date;
}

interface Props {
  mes: number;
  año: number;
  diaSeleccionado: number | null;
  eventos: EventItem[];
}

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function CalendarGrid({ mes, año, diaSeleccionado, eventos }: Props) {
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const diaSemInicio = primerDia.getDay();

  const diasEvento = new Set(
    eventos.map((e) => new Date(e.date).getDate())
  );

  const celdas: (number | null)[] = [];
  for (let i = 0; i < diaSemInicio; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const hoy = new Date();
  const esHoy = (d: number) =>
    d === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear();

  return (
    <div>
      <div className="grid grid-cols-7 gap-0">
        {diasSemana.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-text-tertiary py-2">
            {d}
          </div>
        ))}
        {celdas.map((d, i) =>
          d === null ? (
            <div key={`e-${i}`} />
          ) : (
            <Link
              key={d}
              href={`/agenda?mes=${mes + 1}&año=${año}&dia=${d}`}
              className={`text-center py-2 text-sm rounded-[6px] transition-colors relative ${
                diaSeleccionado === d
                  ? "bg-accent text-white"
                  : esHoy(d)
                  ? "bg-accent-soft text-accent font-semibold"
                  : "hover:bg-surface-alt text-text-primary"
              }`}
            >
              {d}
              {diasEvento.has(d) && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    diaSeleccionado === d ? "bg-white" : "bg-accent"
                  }`}
                />
              )}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
