"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

// ── CLIENTS ──

export async function getClientes(opts?: { search?: string; sort?: string; order?: string }) {
  const orderField = opts?.sort === "email" || opts?.sort === "createdAt" ? opts.sort : "nombre";
  const orderDir = opts?.order === "asc" ? "asc" : "desc";
  return prisma.cliente.findMany({
    where: opts?.search
      ? {
          OR: [
            { nombre: { contains: opts.search } },
            { email: { contains: opts.search } },
            { telefono: { contains: opts.search } },
          ],
        }
      : undefined,
    include: { _count: { select: { presupuestos: true } } },
    orderBy: { [orderField]: orderDir === "asc" ? "asc" : "desc" },
  });
}

export async function getCliente(id: number) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      presupuestos: {
        include: { items: true, cliente: true },
        orderBy: { fecha: "desc" },
      },
    },
  });
}

export async function crearCliente(data: { nombre: string; email?: string; telefono?: string; direccion?: string }) {
  const cliente = await prisma.cliente.create({ data });
  revalidatePath("/clientes");
  return cliente;
}

export async function actualizarCliente(id: number, data: { nombre: string; email?: string; telefono?: string; direccion?: string }) {
  const cliente = await prisma.cliente.update({ where: { id }, data });
  revalidatePath("/clientes");
  return cliente;
}

export async function eliminarCliente(id: number) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/clientes");
}

// ── PRODUCTS ──

export async function getProductos() {
  return prisma.producto.findMany({ orderBy: { nombre: "asc" } });
}

export async function getProducto(id: number) {
  return prisma.producto.findUnique({ where: { id } });
}

export async function getProductoConUso(id: number) {
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          presupuesto: {
            include: { cliente: true },
          },
        },
        orderBy: { presupuesto: { fecha: "desc" } },
      },
    },
  });
  if (!producto) return null;

  const presupuestos = producto.items.map((item) => item.presupuesto);
  const unicos = presupuestos.filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  );
  const totalIngresos = producto.items.reduce((sum, i) => sum + i.total, 0);
  const vecesUsado = producto.items.length;

  return { producto, presupuestos: unicos, totalIngresos, vecesUsado };
}

export async function crearProducto(data: { nombre: string; descripcion?: string; precio: number; tipo?: string; categoria?: string }) {
  const producto = await prisma.producto.create({ data });
  revalidatePath("/productos");
  return producto;
}

export async function actualizarProducto(id: number, data: { nombre: string; descripcion?: string; precio: number; tipo?: string; categoria?: string | null }) {
  const producto = await prisma.producto.update({ where: { id }, data });
  revalidatePath("/productos");
  return producto;
}

export async function eliminarProducto(id: number) {
  await prisma.producto.delete({ where: { id } });
  revalidatePath("/productos");
}

// ── BUDGETS ──

export async function getPresupuestos(filters?: {
  search?: string;
  estado?: string;
  clienteId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  return prisma.presupuesto.findMany({
    where: {
      ...(filters?.estado ? { estado: filters.estado } : {}),
      ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
      ...(filters?.fechaDesde || filters?.fechaHasta
        ? {
            fecha: {
              ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
              ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta) } : {}),
            },
          }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { cliente: { nombre: { contains: filters.search } } },
              ...(!isNaN(Number(filters.search)) ? [{ numero: { equals: Number(filters.search) } }] : []),
            ],
          }
        : {}),
    },
    include: { cliente: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPresupuestosStats() {
  const presupuestos = await prisma.presupuesto.findMany({
    include: { items: true },
  });

  const totalCount = presupuestos.length;
  const pendingCount = presupuestos.filter((p) => p.estado === "borrador" || p.estado === "enviado").length;
  const approvedCount = presupuestos.filter((p) => p.estado === "aprobado").length;

  const now = new Date();
  const thisMonth = presupuestos.filter((p) => {
    const d = new Date(p.fecha);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthTotal = thisMonth.reduce((sum, p) => {
    const subtotal = p.items.reduce((s, i) => s + i.total, 0);
    return sum + subtotal + subtotal * (p.impuesto / 100);
  }, 0);

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthPres = presupuestos.filter((p) => {
      const pd = new Date(p.fecha);
      return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
    });
    const total = monthPres.reduce((sum, p) => {
      const s = p.items.reduce((a, i) => a + i.total, 0);
      return sum + s + s * (p.impuesto / 100);
    }, 0);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString("es", { month: "short" }), total };
  }).reverse();

  return { totalCount, pendingCount, approvedCount, monthTotal, monthlyRevenue };
}

export async function getDashboardStats() {
  const [presupuestos, clientes] = await Promise.all([
    prisma.presupuesto.findMany({ include: { items: true } }),
    prisma.cliente.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const now = new Date();
  const totalRevenue = presupuestos.reduce((sum, p) => {
    const s = p.items.reduce((a, i) => a + i.total, 0);
    return sum + s + s * (p.impuesto / 100);
  }, 0);

  const newClientsThisMonth = clientes.filter((c) => {
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const statusDistribution = {
    borrador: presupuestos.filter((p) => p.estado === "borrador").length,
    enviado: presupuestos.filter((p) => p.estado === "enviado").length,
    aprobado: presupuestos.filter((p) => p.estado === "aprobado").length,
    pagado: presupuestos.filter((p) => p.estado === "pagado").length,
    vencido: presupuestos.filter((p) => p.estado === "vencido").length,
  };

  return {
    totalClients: clientes.length,
    newClientsThisMonth,
    totalRevenue,
    averagePerBudget: presupuestos.length ? totalRevenue / presupuestos.length : 0,
    statusDistribution,
  };
}

export async function getPresupuesto(id: number) {
  return prisma.presupuesto.findUnique({
    where: { id },
    include: { cliente: true, items: { include: { producto: true } }, attachments: { orderBy: { createdAt: "desc" } }, factura: true },
  });
}

function calcularProximaGeneracion(frecuencia: string, desde: Date): Date {
  const d = new Date(desde);
  switch (frecuencia) {
    case "mensual": d.setMonth(d.getMonth() + 1); break;
    case "bimestral": d.setMonth(d.getMonth() + 2); break;
    case "trimestral": d.setMonth(d.getMonth() + 3); break;
    case "semestral": d.setMonth(d.getMonth() + 6); break;
    case "anual": d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

export async function crearPresupuesto(data: {
  clienteId: number;
  fecha?: string;
  validez?: string;
  notas?: string;
  impuesto?: number;
  estado?: string;
  frecuencia?: string;
  items: { productoId?: number; descripcion: string; cantidad: number; precioUnitario: number }[];
}) {
  const ultimo = await prisma.presupuesto.findFirst({ orderBy: { numero: "desc" } });
  const numero = (ultimo?.numero ?? 0) + 1;

  const items = data.items.map((item) => ({
    productoId: item.productoId ?? null,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    total: item.cantidad * item.precioUnitario,
  }));

  const proximaGeneracion = data.frecuencia ? calcularProximaGeneracion(data.frecuencia, data.fecha ? new Date(data.fecha) : new Date()) : null;

  const presupuesto = await prisma.presupuesto.create({
    data: {
      numero,
      clienteId: data.clienteId,
      fecha: data.fecha ? new Date(data.fecha) : new Date(),
      validez: data.validez,
      notas: data.notas,
      impuesto: data.impuesto ?? 21,
      estado: data.estado ?? "borrador",
      frecuencia: data.frecuencia || null,
      proximaGeneracion,
      items: { create: items },
    },
    include: { cliente: true, items: true },
  });

  revalidatePath("/");
  return presupuesto;
}

export async function actualizarPresupuesto(
  id: number,
  data: {
    clienteId: number;
    fecha?: string;
    validez?: string;
    notas?: string;
    impuesto?: number;
    estado?: string;
    frecuencia?: string | null;
    items: { id?: number; productoId?: number; descripcion: string; cantidad: number; precioUnitario: number }[];
  }
) {
  await prisma.itemPresupuesto.deleteMany({ where: { presupuestoId: id } });

  const items = data.items.map((item) => ({
    productoId: item.productoId ?? null,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
    total: item.cantidad * item.precioUnitario,
  }));

  const proximaGeneracion = data.frecuencia !== undefined
    ? (data.frecuencia ? calcularProximaGeneracion(data.frecuencia, data.fecha ? new Date(data.fecha) : new Date()) : null)
    : undefined;

  const presupuesto = await prisma.presupuesto.update({
    where: { id },
    data: {
      clienteId: data.clienteId,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
      validez: data.validez,
      notas: data.notas,
      impuesto: data.impuesto ?? 21,
      estado: data.estado ?? "borrador",
      frecuencia: data.frecuencia,
      proximaGeneracion,
      items: { create: items },
    },
    include: { cliente: true, items: true },
  });

  revalidatePath("/");
  return presupuesto;
}

export async function eliminarPresupuesto(id: number) {
  await prisma.presupuesto.delete({ where: { id } });
  revalidatePath("/");
}

export async function duplicarPresupuesto(id: number) {
  const original = await prisma.presupuesto.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!original) throw new Error("Presupuesto no encontrado");

  const ultimo = await prisma.presupuesto.findFirst({ orderBy: { numero: "desc" } });
  const numero = (ultimo?.numero ?? 0) + 1;

  const presupuesto = await prisma.presupuesto.create({
    data: {
      numero,
      clienteId: original.clienteId,
      fecha: new Date(),
      validez: original.validez,
      notas: original.notas,
      impuesto: original.impuesto,
      estado: "borrador",
      items: {
        create: original.items.map((item) => ({
          productoId: item.productoId,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          total: item.total,
        })),
      },
    },
    include: { cliente: true, items: true },
  });

  revalidatePath("/");
  return presupuesto;
}

export async function cambiarEstadoPresupuesto(id: number, estado: string) {
  await prisma.presupuesto.update({ where: { id }, data: { estado } });
  revalidatePath("/");
}

export async function generarProximosRecurrentes() {
  const ahora = new Date();
  const recurrentes = await prisma.presupuesto.findMany({
    where: {
      frecuencia: { not: null },
      proximaGeneracion: { lte: ahora },
    },
    include: { items: true },
  });

  for (const orig of recurrentes) {
    const ultimo = await prisma.presupuesto.findFirst({ orderBy: { numero: "desc" } });
    const numero = (ultimo?.numero ?? 0) + 1;

    await prisma.presupuesto.create({
      data: {
        numero,
        clienteId: orig.clienteId,
        fecha: new Date(),
        validez: orig.validez,
        notas: orig.notas,
        impuesto: orig.impuesto,
        estado: "borrador",
        frecuencia: orig.frecuencia,
        proximaGeneracion: calcularProximaGeneracion(orig.frecuencia!, ahora),
        items: {
          create: orig.items.map((item) => ({
            productoId: item.productoId,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            total: item.total,
          })),
        },
      },
    });

    await prisma.presupuesto.update({
      where: { id: orig.id },
      data: { proximaGeneracion: calcularProximaGeneracion(orig.frecuencia!, ahora) },
    });
  }

  return recurrentes.length;
}

export async function togglePlantilla(id: number) {
  const p = await prisma.presupuesto.findUnique({ where: { id }, select: { esPlantilla: true } });
  if (!p) throw new Error("No encontrado");
  await prisma.presupuesto.update({ where: { id }, data: { esPlantilla: !p.esPlantilla } });
  revalidatePath("/");
  revalidatePath(`/presupuestos/${id}`);
}

export async function getPlantillas() {
  return prisma.presupuesto.findMany({
    where: { esPlantilla: true },
    include: { items: true, cliente: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ── EVENTS ──

export async function getEventos(mes?: number, año?: number) {
  const now = new Date();
  const month = mes ?? now.getMonth();
  const year = año ?? now.getFullYear();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return prisma.calendarEvent.findMany({
    where: { date: { gte: start, lte: end } },
    include: { cliente: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

export async function getEvento(id: number) {
  return prisma.calendarEvent.findUnique({
    where: { id },
    include: { cliente: true },
  });
}

export async function crearEvento(data: {
  title: string;
  description?: string;
  date: string;
  time?: string;
  duration?: number;
  type?: string;
  clienteId?: number;
}) {
  const evento = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      time: data.time,
      duration: data.duration,
      type: data.type ?? "cita",
      clienteId: data.clienteId ?? null,
    },
  });
  revalidatePath("/agenda");
  return evento;
}

export async function actualizarEvento(
  id: number,
  data: {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    duration?: number;
    type?: string;
    clienteId?: number | null;
  }
) {
  const evento = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
      ...(data.time !== undefined ? { time: data.time } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.clienteId !== undefined ? { clienteId: data.clienteId } : {}),
    },
  });
  revalidatePath("/agenda");
  return evento;
}

export async function eliminarEvento(id: number) {
  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath("/agenda");
}

export async function getUltimoNumeroFactura() {
  const last = await prisma.factura.findFirst({ orderBy: { numero: "desc" }, select: { numero: true } });
  return last ? last.numero : 0;
}

export async function generarFactura(presupuestoId: number) {
  const presupuesto = await prisma.presupuesto.findUnique({
    where: { id: presupuestoId },
    include: { items: true },
  });
  if (!presupuesto) throw new Error("Presupuesto no encontrado");
  if (presupuesto.estado !== "aprobado") throw new Error("Solo se pueden facturar presupuestos aprobados");

  const existente = await prisma.factura.findUnique({ where: { presupuestoId } });
  if (existente) throw new Error("Este presupuesto ya tiene una factura");

  const ultimoNumero = await getUltimoNumeroFactura();
  const numero = ultimoNumero + 1;

  const factura = await prisma.factura.create({
    data: {
      numero,
      presupuestoId: presupuesto.id,
      clienteId: presupuesto.clienteId,
      impuesto: presupuesto.impuesto,
      items: {
        create: presupuesto.items.map((i) => ({
          productoId: i.productoId,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          total: i.total,
        })),
      },
    },
    include: { presupuesto: true, cliente: true, items: true },
  });

  revalidatePath("/");
  revalidatePath(`/presupuestos/${presupuestoId}`);
  return factura;
}

export async function getFacturas() {
  return prisma.factura.findMany({
    include: { cliente: { select: { nombre: true } }, presupuesto: { select: { id: true, numero: true } } },
    orderBy: { numero: "desc" },
  });
}

export async function getFactura(id: number) {
  return prisma.factura.findUnique({
    where: { id },
    include: { cliente: true, presupuesto: true, items: { include: { producto: true } } },
  });
}

export async function cambiarEstadoFactura(id: number, estado: string) {
  const f = await prisma.factura.update({ where: { id }, data: { estado } });
  revalidatePath("/facturas");
  revalidatePath(`/facturas/${id}`);
  return f;
}

export async function getFacturasStats() {
  const facturas = await prisma.factura.findMany({
    include: { items: { select: { total: true } } },
  });
  return {
    total: facturas.length,
    emitidas: facturas.filter((f) => f.estado === "emitida").length,
    pagadas: facturas.filter((f) => f.estado === "pagada").length,
    anuladas: facturas.filter((f) => f.estado === "anulada").length,
    ingresos: facturas.reduce((s, f) => s + (f.estado === "pagada" ? f.items.reduce((si, i) => si + i.total, 0) : 0), 0),
  };
}

export async function eliminarFactura(id: number) {
  await prisma.facturaItem.deleteMany({ where: { facturaId: id } });
  await prisma.factura.delete({ where: { id } });
  revalidatePath("/facturas");
}
