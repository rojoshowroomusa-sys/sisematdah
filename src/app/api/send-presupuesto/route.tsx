import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderToStream } from "@react-pdf/renderer";
import { getPresupuesto } from "@/lib/actions";
import { PresupuestoPDF } from "@/lib/pdf";

export async function POST(request: Request) {
  try {
    const { presupuestoId, to, subject, message } = await request.json();
    if (!presupuestoId || !to) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const presupuesto = await getPresupuesto(presupuestoId);
    if (!presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    const stream = await renderToStream(
      <PresupuestoPDF
        presupuesto={{
          numero: presupuesto.numero,
          fecha: presupuesto.fecha,
          validez: presupuesto.validez,
          notas: presupuesto.notas,
          impuesto: presupuesto.impuesto,
          cliente: presupuesto.cliente,
          items: presupuesto.items.map((i) => ({
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            total: i.total,
          })),
        }}
      />
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    });

    const filename = `presupuesto-${String(presupuesto.numero).padStart(4, "0")}.pdf`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@flux.app",
      to,
      subject: subject || `Presupuesto #${String(presupuesto.numero).padStart(4, "0")}`,
      text: message || `Adjuntamos el presupuesto #${String(presupuesto.numero).padStart(4, "0")} para ${presupuesto.cliente.nombre}.`,
      attachments: [{ filename, content: pdfBuffer }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Error al enviar email" }, { status: 500 });
  }
}
