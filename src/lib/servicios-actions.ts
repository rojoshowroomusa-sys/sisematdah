"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

// ── SERVICIOS CONTRATADOS ──

export async function getServicios(clienteId: number) {
  return prisma.servicioContratado.findMany({
    where: { clienteId },
    include: { tareas: true, pagos: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createServicio(data: {
  clienteId: number;
  nombre: string;
  descripcion?: string;
  montoMensual: number;
  diaFacturacion?: number;
  frecuenciaFactura?: string;
}) {
  const s = await prisma.servicioContratado.create({ data: { ...data, diaFacturacion: data.diaFacturacion ?? 1 } });
  revalidatePath(`/clientes/${data.clienteId}`);
  revalidatePath("/clientes");
  return s;
}

export async function updateServicio(
  id: number,
  data: {
    nombre?: string;
    descripcion?: string;
    montoMensual?: number;
    diaFacturacion?: number;
    estado?: string;
    frecuenciaFactura?: string;
  }
) {
  const s = await prisma.servicioContratado.update({ where: { id }, data });
  revalidatePath(`/clientes/${s.clienteId}`);
  return s;
}

export async function deleteServicio(id: number) {
  const s = await prisma.servicioContratado.delete({ where: { id } });
  revalidatePath(`/clientes/${s.clienteId}`);
  revalidatePath("/clientes");
}

// ── TAREAS REALIZADAS ──

export async function getTareas(clienteId: number, year?: number, month?: number) {
  const where: any = { clienteId };
  if (year !== undefined) {
    const start = new Date(year, month ?? 0, 1);
    const end = new Date(year, (month ?? 0) + 1, 0, 23, 59, 59);
    where.fecha = { gte: start, lte: end };
  }
  return prisma.tareaRealizada.findMany({
    where,
    include: { servicio: { select: { nombre: true } } },
    orderBy: { fecha: "desc" },
  });
}

export async function createTarea(data: {
  clienteId: number;
  servicioId?: number;
  titulo: string;
  descripcion?: string;
  fecha?: Date;
  horas?: number;
  tipo?: string;
}) {
  const t = await prisma.tareaRealizada.create({ data: { ...data, fecha: data.fecha ?? new Date() } });
  revalidatePath(`/clientes/${data.clienteId}`);
  return t;
}

export async function deleteTarea(id: number) {
  const t = await prisma.tareaRealizada.delete({ where: { id } });
  revalidatePath(`/clientes/${t.clienteId}`);
}

// ── PAGOS ──

export async function getPagos(clienteId: number) {
  return prisma.pagoCliente.findMany({
    where: { clienteId },
    include: { servicio: { select: { nombre: true } } },
    orderBy: { fecha: "desc" },
  });
}

export async function createPago(data: {
  clienteId: number;
  servicioId?: number;
  monto: number;
  fecha: Date;
  medio?: string;
  periodo: string;
  estado?: string;
  notas?: string;
}) {
  const p = await prisma.pagoCliente.create({ data });
  revalidatePath(`/clientes/${data.clienteId}`);
  return p;
}

export async function updatePagoEstado(id: number, estado: string) {
  const p = await prisma.pagoCliente.update({ where: { id }, data: { estado } });
  revalidatePath(`/clientes/${p.clienteId}`);
}

// ── SERVICIOS TERCEROS ──

export async function getServiciosTerceros(clienteId: number) {
  return prisma.servicioTercero.findMany({
    where: { clienteId },
    include: { proveedor: { select: { nombre: true } } },
    orderBy: { fecha: "desc" },
  });
}

export async function createServicioTercero(data: {
  clienteId: number;
  proveedorNombre: string;
  proveedorId?: number;
  concepto: string;
  costo: number;
  fecha?: Date;
  facturadoAlCliente?: boolean;
  notas?: string;
}) {
  const st = await prisma.servicioTercero.create({ data: { ...data, fecha: data.fecha ?? new Date() } });
  revalidatePath(`/clientes/${data.clienteId}`);
  return st;
}

export async function deleteServicioTercero(id: number) {
  const st = await prisma.servicioTercero.delete({ where: { id } });
  revalidatePath(`/clientes/${st.clienteId}`);
}

// ── PROVEEDORES ──

export async function getProveedores() {
  return prisma.proveedor.findMany({ orderBy: { nombre: "asc" } });
}

export async function createProveedor(data: { nombre: string; contacto?: string; telefono?: string; email?: string }) {
  return prisma.proveedor.create({ data });
}

// ── RESUMEN ──

export async function getResumenServicios(clienteId: number) {
  const servicios = await prisma.servicioContratado.findMany({
    where: { clienteId },
    include: { tareas: true, pagos: true },
  });
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();
  const tareasMes = await prisma.tareaRealizada.findMany({
    where: {
      clienteId,
      fecha: { gte: new Date(anio, mes, 1), lte: new Date(anio, mes + 1, 0, 23, 59, 59) },
    },
  });
  const totalHoras = tareasMes.reduce((s, t) => s + t.horas, 0);
  const costoProveedores = await prisma.servicioTercero.aggregate({
    where: { clienteId },
    _sum: { costo: true },
  });
  const totalServicios = servicios.reduce((s, sv) => s + sv.montoMensual, 0);
  const pendientes = servicios.flatMap((s) => s.pagos.filter((p) => p.estado === "pendiente"));
  return {
    serviciosActivos: servicios.filter((s) => s.estado === "activo").length,
    totalMensual: totalServicios,
    totalHorasMes: totalHoras,
    costoProveedores: costoProveedores._sum.costo ?? 0,
    pendientesCobro: pendientes.reduce((s, p) => s + p.monto, 0),
  };
}
