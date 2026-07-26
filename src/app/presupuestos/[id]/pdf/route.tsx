import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getPresupuesto } from "@/lib/actions";
import { PresupuestoPDF } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const presupuesto = await getPresupuesto(Number(id));
  if (!presupuesto) {
    return new NextResponse("Not found", { status: 404 });
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

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="presupuesto-${String(presupuesto.numero).padStart(4, "0")}.pdf"`,
    },
  });
}
