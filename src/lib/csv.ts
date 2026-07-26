export function productosToCSV(productos: {
  nombre: string;
  tipo: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
}[]) {
  const header = "Nombre,Tipo,Categoría,Descripción,Precio";
  const rows = productos.map((p) =>
    [
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.tipo,
      p.categoria || "",
      `"${(p.descripcion || "").replace(/"/g, '""')}"`,
      p.precio.toFixed(2),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}
