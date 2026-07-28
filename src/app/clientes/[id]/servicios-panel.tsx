import { getServicios, getTareas, getPagos, getServiciosTerceros, getProveedores, getResumenServicios } from "@/lib/servicios-actions";
import { formatEUR, formatDate } from "@/lib/format";
import * as SC from "./servicios-client";

interface Props {
  clienteId: number;
  clienteNombre: string;
}

export async function ServiciosPanel({ clienteId, clienteNombre }: Props) {
  const [servicios, tareas, pagos, terceros, proveedores, resumen] = await Promise.all([
    getServicios(clienteId),
    getTareas(clienteId),
    getPagos(clienteId),
    getServiciosTerceros(clienteId),
    getProveedores(),
    getResumenServicios(clienteId),
  ]);

  return (
    <div className="space-y-5">
        {/* Resumen cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-[10px] p-3.5 shadow-card">
          <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Servicios activos</p>
          <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{resumen.serviciosActivos}</p>
        </div>
        <div className="bg-surface border border-border rounded-[10px] p-3.5 shadow-card">
          <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Ingreso mensual</p>
          <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{formatEUR(resumen.totalMensual)}</p>
        </div>
        <div className="bg-surface border border-border rounded-[10px] p-3.5 shadow-card">
          <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Horas este mes</p>
          <p className="text-lg font-semibold font-mono text-text-primary mt-0.5">{resumen.totalHorasMes}h</p>
        </div>
        <div className="bg-surface border border-border rounded-[10px] p-3.5 shadow-card">
          <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Pendiente cobro</p>
          <p className="text-lg font-semibold font-mono text-destructive mt-0.5">{formatEUR(resumen.pendientesCobro)}</p>
        </div>
      </div>

      {/* Servicios contratados */}
      <div className="bg-surface border border-border rounded-[10px] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Planes activos</h3>
          <SC.AddServicio clienteId={clienteId} />
        </div>
        {servicios.length === 0 ? (
          <div className="px-4 sm:px-5 py-10 text-center text-text-tertiary text-sm">Sin servicios contratados</div>
        ) : (
          <div className="divide-y divide-border/50">
            {servicios.map((s) => (
              <div key={s.id} className="px-4 sm:px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.estado === "activo" ? "bg-accent" : "bg-text-muted"}`} />
                    <span className="font-medium text-text-primary">{s.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="gauge">{s.estado === "activo" ? "Activo" : s.estado}</span>
                    <span className="gauge gauge-active">{formatEUR(s.montoMensual)}/mes</span>
                    <SC.EditServicio servicio={s} />
                    <SC.DeleteServicio id={s.id} />
                  </div>
                </div>
                {s.descripcion && <p className="text-xs text-text-tertiary mb-2">{s.descripcion}</p>}
                <div className="flex gap-3 text-[11px] text-text-tertiary">
                  <span>Factura día {s.diaFacturacion}</span>
                  <span>·</span>
                  <span>{s.frecuenciaFactura}</span>
                  <span>·</span>
                  <span>{s.tareas.length} tareas</span>
                  <span>·</span>
                  <span>{s.pagos.length} pagos</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tareas realizadas */}
      <div className="bg-surface border border-border rounded-[10px] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Tareas realizadas</h3>
          <SC.AddTarea clienteId={clienteId} servicios={servicios} />
        </div>
        {tareas.length === 0 ? (
          <div className="px-4 sm:px-5 py-10 text-center text-text-tertiary text-sm">Sin tareas registradas este mes</div>
        ) : (
          <div className="divide-y divide-border/50">
            {tareas.map((t) => (
              <div key={t.id} className="px-4 sm:px-5 py-3 flex items-center gap-2 sm:gap-3">
                <span className="text-accent text-sm">☑</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{t.titulo}</p>
                  {t.servicio && <p className="text-[11px] text-text-tertiary">{t.servicio.nombre}</p>}
                </div>
                <span className="text-xs text-text-tertiary">{formatDate(t.fecha)}</span>
                {t.horas > 0 && <span className="gauge w-12 text-center">{t.horas}h</span>}
                <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-[3px] ${t.tipo === "interna" ? "bg-accent-soft text-accent" : "bg-amber-50 text-amber-700"}`}>
                  {t.tipo === "interna" ? "int" : "3ro"}
                </span>
                <SC.DeleteTarea id={t.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagos */}
      <div className="bg-surface border border-border rounded-[10px] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Pagos</h3>
          <SC.AddPago clienteId={clienteId} servicios={servicios} />
        </div>
        {pagos.length === 0 ? (
          <div className="px-4 sm:px-5 py-10 text-center text-text-tertiary text-sm">Sin pagos registrados</div>
        ) : (
          <div className="divide-y divide-border/50">
            {pagos.map((p) => (
              <div key={p.id} className="px-4 sm:px-5 py-3 flex items-center gap-2 sm:gap-3">
                <span className={`text-sm ${p.estado === "cobrado" ? "text-success" : p.estado === "pendiente" ? "text-warm-accent" : "text-destructive"}`}>
                  {p.estado === "cobrado" ? "✅" : p.estado === "pendiente" ? "⏳" : "⚠"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    {p.periodo} <span className="font-mono font-semibold">{formatEUR(p.monto)}</span>
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {p.medio} · {p.servicio?.nombre ?? "General"}
                  </p>
                </div>
                <span className="text-xs text-text-tertiary">{formatDate(p.fecha)}</span>
                <SC.PagoEstado pago={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Servicios de terceros */}
      <div className="bg-surface border border-border rounded-[10px] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Terceros contratados</h3>
          <SC.AddTercero clienteId={clienteId} proveedores={proveedores} />
        </div>
        {terceros.length === 0 ? (
          <div className="px-4 sm:px-5 py-10 text-center text-text-tertiary text-sm">Sin servicios de terceros</div>
        ) : (
          <div className="divide-y divide-border/50">
            {terceros.map((t) => (
              <div key={t.id} className="px-4 sm:px-5 py-3 flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-text-tertiary">{formatDate(t.fecha)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{t.concepto}</p>
                  <p className="text-[11px] text-text-tertiary">
                    {t.proveedor?.nombre ?? t.proveedorNombre} · {t.facturadoAlCliente ? "Facturado" : "Costo interno"}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-text-primary">{formatEUR(t.costo)}</span>
                <SC.DeleteTercero id={t.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
