const stages = ["borrador", "enviado", "aprobado", "pagado"] as const;

const stageLabels: Record<string, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  aprobado: "Aprobado",
  pagado: "Pagado",
  vencido: "Vencido",
};

interface Props {
  status: string;
  presupuestoId: number;
  compact?: boolean;
}

export function BudgetStatusBadge({ status, presupuestoId, compact }: Props) {
  const currentIdx = stages.indexOf(status as typeof stages[number]);

  if (currentIdx === -1) {
    return (
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-[6px] ${
          status === "vencido" ? "bg-destructive-soft text-destructive" : "bg-stone-100 text-stone-600"
        }`}
      >
        {stageLabels[status] || status}
      </span>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2" title={stageLabels[status]}>
        <div className="flex items-center gap-0.5">
          {stages.map((s, i) => (
            <div
              key={s}
              className={`w-1.5 h-1.5 rounded-full ${
                i <= currentIdx
                  ? i === currentIdx
                    ? "bg-accent ring-2 ring-accent-soft"
                    : "bg-accent"
                  : "bg-border-emphasis"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-text-tertiary font-medium">{stageLabels[status]}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                i <= currentIdx
                  ? i === currentIdx
                    ? "bg-accent ring-2 ring-accent-soft"
                    : "bg-accent"
                  : "bg-border-emphasis"
              }`}
            />
            {i < stages.length - 1 && (
              <div
                className={`w-5 h-[3px] rounded-full ${
                  i < currentIdx ? "bg-accent" : "bg-border-soft"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <span
        className={`text-xs font-medium ${
          currentIdx >= 0 && currentIdx < stages.length
            ? "text-text-secondary"
            : "text-text-tertiary"
        }`}
      >
        {stageLabels[status] || status}
      </span>
    </div>
  );
}
