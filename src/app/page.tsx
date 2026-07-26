import { Suspense } from "react";
import Link from "next/link";
import { getPresupuestos, getPresupuestosStats, getDashboardStats, getClientes, getEventos, generarProximosRecurrentes } from "@/lib/actions";
import { formatEUR } from "@/lib/format";
import { DashboardFilters } from "./dashboard-filters";
import { PresupuestosDashboard } from "./presupuestos-dashboard";
import { AgendaReminders } from "./agenda-reminders";
import { DashboardStats } from "./dashboard-stats";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; estado?: string; clienteId?: string; page?: string }>;
}) {
  const params = await searchParams;
  const presupuestos = await getPresupuestos({
    search: params.search,
    estado: params.estado || undefined,
    clienteId: params.clienteId ? Number(params.clienteId) : undefined,
  });
  const [stats, dashboardStats] = await Promise.all([
    getPresupuestosStats(),
    getDashboardStats(),
  ]);
  const clientes = await getClientes();
  const now = new Date();
  const hoyEventos = await getEventos(now.getMonth(), now.getFullYear());
  const eventosHoy = hoyEventos.filter(
    (e) => new Date(e.date).getDate() === now.getDate()
  );

  const generados = await generarProximosRecurrentes();

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Presupuestos</h1>
          <p className="text-sm text-text-tertiary mt-0.5">{stats.totalCount} registrados</p>
        </div>
        <Link
          href="/presupuestos/nuevo"
          className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
        >
          + Nuevo
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-[10px] px-5 py-3 mb-5 flex items-center gap-6 text-sm">
        <div className="flex items-baseline gap-1.5">
          <span className="text-text-tertiary font-medium">Totales</span>
          <span className="text-text-primary font-semibold">{stats.totalCount}</span>
        </div>
        <span className="text-border-soft">/</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-text-tertiary font-medium">Pendientes</span>
          <span className="text-text-primary font-semibold">{stats.pendingCount}</span>
        </div>
        <span className="text-border-soft">/</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-text-tertiary font-medium">Aprobados</span>
          <span className="text-text-primary font-semibold">{stats.approvedCount}</span>
        </div>
        <span className="text-border-soft">/</span>
        <div className="flex items-baseline gap-1.5 ml-auto">
          <span className="text-text-tertiary font-medium">Mes actual</span>
          <span className="text-text-primary font-semibold font-mono">{formatEUR(stats.monthTotal)}</span>
        </div>
      </div>

      <DashboardStats
        monthlyRevenue={stats.monthlyRevenue}
        statusDistribution={dashboardStats.statusDistribution}
        totalClients={dashboardStats.totalClients}
        newClientsThisMonth={dashboardStats.newClientsThisMonth}
        totalRevenue={dashboardStats.totalRevenue}
        averagePerBudget={dashboardStats.averagePerBudget}
      />

      {eventosHoy.length > 0 && (
        <div className="mb-5">
          <AgendaReminders
            eventos={eventosHoy.map((e) => ({
              id: e.id,
              title: e.title,
              time: e.time,
              type: e.type,
              cliente: e.cliente ? { nombre: e.cliente.nombre } : null,
            }))}
          />
        </div>
      )}

      {generados > 0 && (
        <div className="bg-accent-soft text-accent border border-accent/20 rounded-[10px] px-4 py-2.5 mb-4 text-sm font-medium animate-fade-in">
          Se generaron {generados} presupuesto{generados !== 1 ? "s" : ""} recurrente{generados !== 1 ? "s" : ""}
        </div>
      )}

      <Suspense fallback={<div className="h-12" />}>
        <DashboardFilters clientes={clientes} />
      </Suspense>

      <Suspense fallback={<div className="h-32 flex items-center justify-center text-text-tertiary text-sm">Cargando...</div>}>
        {presupuestos.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 mx-auto mb-4 rounded-[12px] bg-surface border border-border flex items-center justify-center">
            <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-1.125 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-base font-medium text-text-secondary mb-1">No hay presupuestos</p>
          <p className="text-sm text-text-tertiary mb-5">Creá el primero o cargá datos de ejemplo</p>
          <a
            href="/api/seed"
            className="inline-block text-sm font-medium bg-accent text-white px-5 py-2 rounded-[8px] hover:bg-accent-hover transition-colors"
          >
            Cargar datos de ejemplo
          </a>
        </div>
      ) : (
        <PresupuestosDashboard presupuestos={presupuestos} />
      )}
      </Suspense>
    </div>
  );
}
