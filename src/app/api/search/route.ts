import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q || q.length < 2) {
    return NextResponse.json({ presupuestos: [], clientes: [], productos: [] });
  }

  const [presupuestos, clientes, productos] = await Promise.all([
    prisma.presupuesto.findMany({
      where: {
        OR: [
          { cliente: { nombre: { contains: q } } },
          ...(!isNaN(Number(q)) ? [{ numero: { equals: Number(q) } }] : []),
        ],
      },
      include: { cliente: { select: { nombre: true } } },
      take: 5,
      orderBy: { fecha: "desc" },
    }),
    prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: q } },
          { email: { contains: q } },
          { telefono: { contains: q } },
        ],
      },
      take: 5,
      orderBy: { nombre: "asc" },
    }),
    prisma.producto.findMany({
      where: { nombre: { contains: q } },
      take: 5,
      orderBy: { nombre: "asc" },
    }),
  ]);

  return NextResponse.json({
    presupuestos: presupuestos.map((p) => ({
      id: p.id,
      numero: p.numero,
      clienteNombre: p.cliente.nombre,
    })),
    clientes: clientes.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      email: c.email,
    })),
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
    })),
  });
}
