"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createServicio, updateServicio, deleteServicio, createTarea, deleteTarea, createPago, updatePagoEstado, createServicioTercero, deleteServicioTercero } from "@/lib/servicios-actions";
import { showToast } from "@/components/toast";

// ── Add Servicio Modal ──

export function AddServicio({ clienteId }: { clienteId: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [error, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    try {
      await createServicio({
        clienteId,
        nombre: fd.get("nombre") as string,
        descripcion: (fd.get("descripcion") as string) || undefined,
        montoMensual: Number(fd.get("monto")),
        diaFacturacion: Number(fd.get("dia")),
        frecuenciaFactura: (fd.get("frecuencia") as string) || "mensual",
      });
      showToast("Servicio creado");
      setOpen(false);
      router.refresh();
    } catch { showToast("Error al crear servicio", "error"); }
    return null;
  }, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
        <span className="text-base leading-none">+</span> Nuevo
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nuevo servicio</h3>
            <form action={action} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Nombre</label>
                <input name="nombre" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Descripción</label>
                <input name="descripcion" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Monto mensual</label>
                  <input name="monto" type="number" step="0.01" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Día facturación</label>
                  <input name="dia" type="number" min="1" max="31" defaultValue="1" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Frecuencia</label>
                <select name="frecuencia" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-medium text-text-secondary border border-border rounded-[6px] hover:bg-surface-alt">Cancelar</button>
                <button disabled={pending} className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-[6px] hover:bg-accent-hover disabled:opacity-50">{pending ? "..." : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Edit Servicio Modal ──

export function EditServicio({ servicio }: { servicio: { id: number; nombre: string; descripcion: string | null; montoMensual: number; diaFacturacion: number; estado: string; frecuenciaFactura: string } }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [error, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    try {
      await updateServicio(servicio.id, {
        nombre: fd.get("nombre") as string,
        descripcion: (fd.get("descripcion") as string) || undefined,
        montoMensual: Number(fd.get("monto")),
        diaFacturacion: Number(fd.get("dia")),
        estado: fd.get("estado") as string,
        frecuenciaFactura: fd.get("frecuencia") as string,
      });
      showToast("Servicio actualizado");
      setOpen(false);
      router.refresh();
    } catch { showToast("Error al actualizar", "error"); }
    return null;
  }, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">✎</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Editar servicio</h3>
            <form action={action} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Nombre</label>
                <input name="nombre" defaultValue={servicio.nombre} required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Descripción</label>
                <input name="descripcion" defaultValue={servicio.descripcion ?? ""} className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Monto mensual</label>
                  <input name="monto" type="number" step="0.01" defaultValue={servicio.montoMensual} required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Día facturación</label>
                  <input name="dia" type="number" min="1" max="31" defaultValue={servicio.diaFacturacion} className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Estado</label>
                  <select name="estado" defaultValue={servicio.estado} className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Frecuencia</label>
                  <select name="frecuencia" defaultValue={servicio.frecuenciaFactura} className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-medium text-text-secondary border border-border rounded-[6px] hover:bg-surface-alt">Cancelar</button>
                <button disabled={pending} className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-[6px] hover:bg-accent-hover disabled:opacity-50">{pending ? "..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Delete Servicio ──

export function DeleteServicio({ id }: { id: number }) {
  const router = useRouter();
  async function handle() {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await deleteServicio(id);
      showToast("Servicio eliminado");
      router.refresh();
    } catch { showToast("Error al eliminar", "error"); }
  }
  return <button onClick={handle} className="text-xs text-text-tertiary hover:text-destructive transition-colors">×</button>;
}

// ── Add Tarea Modal ──

export function AddTarea({ clienteId, servicios }: { clienteId: number; servicios: { id: number; nombre: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [error, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    try {
      await createTarea({
        clienteId,
        servicioId: Number(fd.get("servicioId")) || undefined,
        titulo: fd.get("titulo") as string,
        descripcion: (fd.get("descripcion") as string) || undefined,
        horas: Number(fd.get("horas")) || 0,
        tipo: fd.get("tipo") as string,
      });
      showToast("Tarea registrada");
      setOpen(false);
      router.refresh();
    } catch { showToast("Error al registrar tarea", "error"); }
    return null;
  }, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
        <span className="text-base leading-none">+</span> Nueva
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Registrar tarea</h3>
            <form action={action} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Título</label>
                <input name="titulo" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Servicio</label>
                <select name="servicioId" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                  <option value="">General</option>
                  {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Horas</label>
                  <input name="horas" type="number" step="0.5" defaultValue="0" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tipo</label>
                  <select name="tipo" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="interna">Interna</option>
                    <option value="tercero">Tercero</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-medium text-text-secondary border border-border rounded-[6px] hover:bg-surface-alt">Cancelar</button>
                <button disabled={pending} className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-[6px] hover:bg-accent-hover disabled:opacity-50">{pending ? "..." : "Registrar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Delete Tarea ──

export function DeleteTarea({ id }: { id: number }) {
  const router = useRouter();
  async function handle() {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await deleteTarea(id);
      showToast("Tarea eliminada");
      router.refresh();
    } catch { showToast("Error al eliminar", "error"); }
  }
  return <button onClick={handle} className="text-xs text-text-tertiary hover:text-destructive transition-colors ml-2">×</button>;
}

// ── Add Pago Modal ──

export function AddPago({ clienteId, servicios }: { clienteId: number; servicios: { id: number; nombre: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [error, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    try {
      await createPago({
        clienteId,
        servicioId: Number(fd.get("servicioId")) || undefined,
        monto: Number(fd.get("monto")),
        fecha: new Date(fd.get("fecha") as string),
        medio: fd.get("medio") as string,
        periodo: fd.get("periodo") as string,
        estado: fd.get("estado") as string,
        notas: (fd.get("notas") as string) || undefined,
      });
      showToast("Pago registrado");
      setOpen(false);
      router.refresh();
    } catch { showToast("Error al registrar pago", "error"); }
    return null;
  }, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
        <span className="text-base leading-none">+</span> Nuevo
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Registrar pago</h3>
            <form action={action} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Monto</label>
                  <input name="monto" type="number" step="0.01" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Fecha</label>
                  <input name="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Período</label>
                  <input name="periodo" placeholder="Ej: Julio 2026" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Medio</label>
                  <select name="medio" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Servicio</label>
                  <select name="servicioId" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="">General</option>
                    {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Estado</label>
                  <select name="estado" className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 appearance-none">
                    <option value="cobrado">Cobrado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-medium text-text-secondary border border-border rounded-[6px] hover:bg-surface-alt">Cancelar</button>
                <button disabled={pending} className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-[6px] hover:bg-accent-hover disabled:opacity-50">{pending ? "..." : "Registrar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Pago Estado Toggle ──

export function PagoEstado({ pago }: { pago: { id: number; estado: string } }) {
  const router = useRouter();
  async function toggle() {
    const next = pago.estado === "cobrado" ? "pendiente" : "cobrado";
    try {
      await updatePagoEstado(pago.id, next);
      router.refresh();
    } catch { showToast("Error al actualizar", "error"); }
  }
  return (
    <button onClick={toggle} className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] border border-border text-text-tertiary hover:bg-surface-alt transition-colors" title="Cambiar estado">
      {pago.estado === "cobrado" ? "Cobrado" : pago.estado === "pendiente" ? "Pendiente" : "Atrasado"}
    </button>
  );
}

// ── Add Tercero Modal ──

export function AddTercero({ clienteId, proveedores }: { clienteId: number; proveedores: { id: number; nombre: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [error, action, pending] = useActionState(async (_: unknown, fd: FormData) => {
    try {
      await createServicioTercero({
        clienteId,
        proveedorNombre: fd.get("proveedor") as string,
        concepto: fd.get("concepto") as string,
        costo: Number(fd.get("costo")),
        facturadoAlCliente: fd.get("facturado") === "true",
        notas: (fd.get("notas") as string) || undefined,
      });
      showToast("Servicio de tercero registrado");
      setOpen(false);
      router.refresh();
    } catch { showToast("Error al registrar", "error"); }
    return null;
  }, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
        <span className="text-base leading-none">+</span> Nuevo
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-surface border border-border rounded-[12px] shadow-dialog w-full max-w-sm mx-4 p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Nuevo servicio de tercero</h3>
            <form action={action} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Proveedor</label>
                  <input name="proveedor" list="proveedores" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                  <datalist id="proveedores">
                    {proveedores.map((p) => <option key={p.id} value={p.nombre} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Costo</label>
                  <input name="costo" type="number" step="0.01" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Concepto</label>
                <input name="concepto" required className="w-full border border-border rounded-[6px] px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div className="flex items-center gap-2">
                <input name="facturado" type="checkbox" value="true" className="rounded border-border text-accent" />
                <label className="text-xs text-text-secondary">Facturar al cliente</label>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-xs font-medium text-text-secondary border border-border rounded-[6px] hover:bg-surface-alt">Cancelar</button>
                <button disabled={pending} className="px-4 py-2 text-xs font-medium bg-accent text-white rounded-[6px] hover:bg-accent-hover disabled:opacity-50">{pending ? "..." : "Registrar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Delete Tercero ──

export function DeleteTercero({ id }: { id: number }) {
  const router = useRouter();
  async function handle() {
    if (!confirm("¿Eliminar este servicio de tercero?")) return;
    try {
      await deleteServicioTercero(id);
      showToast("Eliminado");
      router.refresh();
    } catch { showToast("Error al eliminar", "error"); }
  }
  return <button onClick={handle} className="text-xs text-text-tertiary hover:text-destructive transition-colors ml-2">×</button>;
}
