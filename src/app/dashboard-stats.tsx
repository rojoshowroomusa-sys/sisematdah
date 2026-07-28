import { formatEUR } from "@/lib/format";

interface Props {
  monthlyRevenue: { year: number; month: number; label: string; total: number }[];
  statusDistribution: { borrador: number; enviado: number; aprobado: number; pagado: number; vencido: number };
  totalClients: number;
  newClientsThisMonth: number;
  totalRevenue: number;
  averagePerBudget: number;
}

const statusLabels: Record<string, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  aprobado: "Aprobado",
  pagado: "Pagado",
  vencido: "Vencido",
};

const statusBarColors: Record<string, string> = {
  borrador: "bg-stone-300",
  enviado: "bg-blue-400",
  aprobado: "bg-accent",
  pagado: "bg-success",
  vencido: "bg-destructive",
};

export function DashboardStats({
  monthlyRevenue,
  statusDistribution,
  totalClients,
  newClientsThisMonth,
  totalRevenue,
  averagePerBudget,
}: Props) {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.total), 1);
  const totalStatus = Object.values(statusDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-surface border border-border rounded-[10px] p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="gauge leading-none px-1.5 py-0.5">📊</span>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Ingresos mensuales</h3>
        </div>
        <div className="flex items-end gap-2 h-28">
          {monthlyRevenue.map((m) => (
            <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-text-tertiary">
                {m.total > 0 ? formatEUR(m.total) : ""}
              </span>
              <div
                className="w-full rounded-t-[4px] bg-accent-soft transition-all"
                style={{ height: `${Math.max((m.total / maxRevenue) * 100, 4)}%` }}
              >
                <div
                  className="w-full rounded-t-[4px] bg-accent transition-all"
                  style={{ height: "100%" }}
                />
              </div>
              <span className="text-[10px] font-medium text-text-tertiary">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[10px] p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="gauge leading-none px-1.5 py-0.5">◉</span>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Estado de presupuestos</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(statusDistribution).map(([key, count]) => {
            const pct = totalStatus > 0 ? (count / totalStatus) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-20 text-xs text-text-secondary font-medium">{statusLabels[key]}</div>
                <div className="flex-1 h-3 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${statusBarColors[key]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-xs font-semibold text-text-primary">{count}</span>
                  <span className="text-[10px] text-text-tertiary ml-1">({Math.round(pct)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[10px] p-4 shadow-card md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="gauge leading-none px-1.5 py-0.5">≡</span>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Panel general</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="relative pl-3 border-l-2 border-accent/40">
            <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Ingresos totales</p>
            <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{formatEUR(totalRevenue)}</p>
          </div>
          <div className="relative pl-3 border-l-2 border-accent/30">
            <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Promedio por presupuesto</p>
            <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{formatEUR(averagePerBudget)}</p>
          </div>
          <div className="relative pl-3 border-l-2 border-accent/30">
            <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Clientes totales</p>
            <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{totalClients}</p>
          </div>
          <div className="relative pl-3 border-l-2 border-accent/30">
            <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Nuevos este mes</p>
            <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">+{newClientsThisMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
