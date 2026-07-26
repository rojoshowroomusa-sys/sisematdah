import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const existingClients = await prisma.cliente.count();
    if (existingClients > 0) {
      return Response.json({ message: "La base ya tiene datos. Eliminala o vaciala para reseed." });
    }

  // ── Clientes ──
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { nombre: "TechSolutions S.L.", email: "info@techsolutions.es", telefono: "912 345 678", direccion: "C/ Gran Vía 42, Madrid" } }),
    prisma.cliente.create({ data: { nombre: "Estudio Creativo Dos", email: "hola@estudiodos.com", telefono: "934 567 890", direccion: "Av. Diagonal 210, Barcelona" } }),
    prisma.cliente.create({ data: { nombre: "Carpintería El Roble", email: "pedidos@elroble.es", telefono: "954 123 456", direccion: "Pol. Ind. La Vega, Sevilla" } }),
    prisma.cliente.create({ data: { nombre: "Clínica DentalCare", email: "admin@dentalcare.es", telefono: "961 789 012", direccion: "C/ Poeta Querol 15, Valencia" } }),
    prisma.cliente.create({ data: { nombre: "Bufete López & Asociados", email: "contacto@lopezabogados.com", telefono: "915 555 777", direccion: "C/ Serrano 88, Madrid" } }),
  ]);

  // ── Productos ──
  const productos = await Promise.all([
    prisma.producto.create({ data: { nombre: "Desarrollo Web Corporativo", descripcion: "Sitio web responsive con CMS", precio: 2500, tipo: "servicio", categoria: "consultoria" } }),
    prisma.producto.create({ data: { nombre: "Tienda Online (E-commerce)", descripcion: "Tienda con catálogo, carrito y pasarela de pago", precio: 4800, tipo: "servicio", categoria: "consultoria" } }),
    prisma.producto.create({ data: { nombre: "App Móvil Android", descripcion: "Aplicación nativa Android", precio: 6500, tipo: "servicio", categoria: "digital" } }),
    prisma.producto.create({ data: { nombre: "App Móvil iOS", descripcion: "Aplicación nativa iOS", precio: 7200, tipo: "servicio", categoria: "digital" } }),
    prisma.producto.create({ data: { nombre: "Consultoría UX (hora)", descripcion: "Análisis y diseño de experiencia de usuario", precio: 90, tipo: "servicio", categoria: "consultoria" } }),
    prisma.producto.create({ data: { nombre: "Hosting Premium (año)", descripcion: "Hosting cloud con SSL y backups", precio: 240, tipo: "producto", categoria: "suscripcion" } }),
    prisma.producto.create({ data: { nombre: "Dominio .com (.es)", descripcion: "Registro o renovación de dominio", precio: 15, tipo: "producto", categoria: "suscripcion" } }),
    prisma.producto.create({ data: { nombre: "Soporte Técnico (hora)", descripcion: "Mantenimiento y soporte técnico", precio: 60, tipo: "servicio", categoria: "servicio" } }),
    prisma.producto.create({ data: { nombre: "Mueble a medida", descripcion: "Diseño y fabricación de mueble personalizado", precio: 1200, tipo: "producto", categoria: "material" } }),
    prisma.producto.create({ data: { nombre: "Restauración de silla", descripcion: "Restauración completa de silla antigua", precio: 180, tipo: "servicio", categoria: "servicio" } }),
  ]);

  // ── Presupuestos ──
  const now = new Date();

  const p1 = await prisma.presupuesto.create({
    data: {
      numero: 1, clienteId: clientes[0].id, fecha: new Date(now.getTime() - 7 * 86400000),
      validez: "30 días", notas: "Incluye 3 rondas de revisión.", impuesto: 21, estado: "aprobado",
      items: {
        create: [
          { productoId: productos[0].id, descripcion: "Desarrollo Web Corporativo", cantidad: 1, precioUnitario: 2500, total: 2500 },
          { productoId: productos[5].id, descripcion: "Hosting Premium (1 año)", cantidad: 1, precioUnitario: 240, total: 240 },
          { productoId: productos[7].id, descripcion: "Soporte Técnico (5 horas)", cantidad: 5, precioUnitario: 60, total: 300 },
        ],
      },
    },
  });

  const p2 = await prisma.presupuesto.create({
    data: {
      numero: 2, clienteId: clientes[1].id, fecha: new Date(now.getTime() - 3 * 86400000),
      validez: "15 días", notas: "Presupuesto urgente.", impuesto: 21, estado: "enviado",
      items: {
        create: [
          { productoId: productos[1].id, descripcion: "Tienda Online", cantidad: 1, precioUnitario: 4800, total: 4800 },
          { productoId: productos[6].id, descripcion: "Dominio .com", cantidad: 1, precioUnitario: 15, total: 15 },
        ],
      },
    },
  });

  const p3 = await prisma.presupuesto.create({
    data: {
      numero: 3, clienteId: clientes[2].id, fecha: new Date(now.getTime() - 1 * 86400000),
      validez: "30 días", notas: "", impuesto: 10, estado: "borrador",
      items: {
        create: [
          { productoId: productos[8].id, descripcion: "Mueble a medida", cantidad: 2, precioUnitario: 1200, total: 2400 },
          { productoId: productos[9].id, descripcion: "Restauración de silla", cantidad: 4, precioUnitario: 180, total: 720 },
        ],
      },
    },
  });

  const p4 = await prisma.presupuesto.create({
    data: {
      numero: 4, clienteId: clientes[3].id, fecha: new Date(now.getTime() - 14 * 86400000),
      validez: "30 días", notas: "Descuento del 10 % por fidelidad.", impuesto: 21, estado: "aprobado",
      items: {
        create: [
          { descripcion: "App de gestión de citas", cantidad: 1, precioUnitario: 3500, total: 3500 },
          { descripcion: "Módulo de recordatorios SMS", cantidad: 1, precioUnitario: 800, total: 800 },
        ],
      },
    },
  });

  const p5 = await prisma.presupuesto.create({
    data: {
      numero: 5, clienteId: clientes[4].id, fecha: new Date(now.getTime() - 30 * 86400000),
      validez: "30 días", notas: "Facturación mensual.", impuesto: 21, estado: "pagado",
      items: {
        create: [
          { productoId: productos[4].id, descripcion: "Consultoría UX (8 horas)", cantidad: 8, precioUnitario: 90, total: 720 },
          { descripcion: "Rediseño de portal corporativo", cantidad: 1, precioUnitario: 3200, total: 3200 },
        ],
      },
    },
  });

  // ── Eventos ──
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  await Promise.all([
    prisma.calendarEvent.create({ data: { title: "Revisión con TechSolutions", type: "reunion", date: new Date(hoy.getTime() + 1 * 86400000), time: "10:00", duration: 60, clienteId: clientes[0].id, description: "Seguimiento del desarrollo web" } }),
    prisma.calendarEvent.create({ data: { title: "Llamada con Estudio Creativo", type: "llamada", date: new Date(hoy.getTime() + 1 * 86400000), time: "15:30", duration: 30, clienteId: clientes[1].id } }),
    prisma.calendarEvent.create({ data: { title: "Visita taller Carpintería El Roble", type: "cita", date: new Date(hoy.getTime() + 2 * 86400000), time: "11:00", duration: 90, clienteId: clientes[2].id, description: "Ver muestras de materiales" } }),
    prisma.calendarEvent.create({ data: { title: "Entrega de presupuesto DentalCare", type: "cita", date: new Date(hoy.getTime() + 3 * 86400000), time: "09:30", duration: 45, clienteId: clientes[3].id } }),
    prisma.calendarEvent.create({ data: { title: "Reunión interna de equipo", type: "reunion", date: hoy, time: "12:00", duration: 60, description: "Planificación semanal" } }),
    prisma.calendarEvent.create({ data: { title: "Llamada proveedor hosting", type: "llamada", date: hoy, time: "17:00", duration: 20 } }),
    prisma.calendarEvent.create({ data: { title: "Corte mensual de facturación", type: "recordatorio", date: hoy, description: "Revisar y enviar facturas pendientes" } }),
  ]);

  // ── Proyectos y Tareas (org) ──
  const proyecto = await prisma.project.create({
    data: { name: "Rediseño Web Clientes", color: "#6366f1" },
  });

  const proyecto2 = await prisma.project.create({
    data: { name: "Migración Servidores", color: "#f59e0b" },
  });

  const t1 = await prisma.task.create({
    data: { title: "Preparar presentación nuevos diseños", projectId: proyecto.id, energyLevel: "hiperfoco", status: "inbox", estimatedMinutes: 60 },
  });
  await prisma.task.create({ data: { title: "Seleccionar paleta de colores", energyLevel: "cero_energia", status: "next_up", estimatedMinutes: 15, parentTaskId: t1.id, stepOrder: 1 } });
  await prisma.task.create({ data: { title: "Elegir tipografía principal", energyLevel: "cero_energia", status: "next_up", estimatedMinutes: 10, parentTaskId: t1.id, stepOrder: 2 } });
  await prisma.task.create({ data: { title: "Armar 3 wireframes de home", energyLevel: "media_energia", status: "inbox", estimatedMinutes: 45, parentTaskId: t1.id, stepOrder: 3 } });

  await prisma.task.create({
    data: { title: "Revisar plan de hosting actual", projectId: proyecto2.id, energyLevel: "cero_energia", status: "inbox", estimatedMinutes: 20 },
  });

  await prisma.task.create({
    data: { title: "Llamar a proveedor de backups", projectId: proyecto2.id, energyLevel: "media_energia", status: "inbox", estimatedMinutes: 15 },
  });

  await prisma.task.create({
    data: { title: "Ordenar facturas del trimestre", energyLevel: "cero_energia", status: "inbox", estimatedMinutes: 30 },
  });

  await prisma.task.create({
    data: { title: "Leer artículo sobre optimización SQL", energyLevel: "hiperfoco", status: "inbox", estimatedMinutes: 25 },
  });

  return Response.json({
      message: "Base de datos poblada con datos de ejemplo",
      stats: {
        clientes: clientes.length,
        productos: productos.length,
        presupuestos: 5,
        eventos: 7,
        proyectos: 2,
        tareas: 8,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: "Error al poblar la base de datos" }, { status: 500 });
  }
}
