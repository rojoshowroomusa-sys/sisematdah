import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const presupuestoId = Number(formData.get("presupuestoId"));
    const file = formData.get("file") as File;

    if (!presupuestoId || !file) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    const attachment = await prisma.attachment.create({
      data: {
        presupuestoId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await unlink(path.join(process.cwd(), "public", "uploads", attachment.filename)).catch(() => {});
    await prisma.attachment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
