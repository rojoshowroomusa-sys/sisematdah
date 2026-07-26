import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v23/9A3gp4V9B3xM_7L6.ttf", fontWeight: "normal" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  numero: { fontSize: 12, color: "#666", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  section: { flex: 1 },
  label: { fontSize: 8, color: "#999", marginBottom: 2, textTransform: "uppercase" },
  value: { fontSize: 10, marginBottom: 4 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: "row", borderBottom: "1 solid #000", paddingBottom: 5, marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #eee", paddingVertical: 4 },
  colDesc: { flex: 3 },
  colCant: { flex: 1, textAlign: "center" },
  colPrecio: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalSection: { marginTop: 15, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 },
  totalLabel: { width: 80, textAlign: "right", marginRight: 10 },
  totalValue: { width: 80, textAlign: "right" },
  grandTotal: { fontWeight: "bold", fontSize: 12, marginTop: 5 },
  notas: { marginTop: 20, fontSize: 9, color: "#666" },
});

interface PDFPresupuestoProps {
  presupuesto: {
    numero: number;
    fecha: Date | string;
    validez?: string | null;
    notas?: string | null;
    impuesto: number;
    cliente: { nombre: string; email?: string | null; telefono?: string | null; direccion?: string | null };
    items: { descripcion: string; cantidad: number; precioUnitario: number; total: number }[];
  };
}

export function PresupuestoPDF({ presupuesto }: PDFPresupuestoProps) {
  const subtotal = presupuesto.items.reduce((s, i) => s + i.total, 0);
  const impuesto = subtotal * (presupuesto.impuesto / 100);
  const total = subtotal + impuesto;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>PRESUPUESTO</Text>
          <Text style={styles.numero}>Nº {presupuesto.numero.toString().padStart(4, "0")}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{presupuesto.cliente.nombre}</Text>
            {presupuesto.cliente.direccion && <Text style={styles.value}>{presupuesto.cliente.direccion}</Text>}
            {presupuesto.cliente.email && <Text style={styles.value}>{presupuesto.cliente.email}</Text>}
            {presupuesto.cliente.telefono && <Text style={styles.value}>{presupuesto.cliente.telefono}</Text>}
          </View>
          <View style={[styles.section, { alignItems: "flex-end" }]}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{new Date(presupuesto.fecha).toLocaleDateString("es-ES")}</Text>
            {presupuesto.validez && (
              <>
                <Text style={[styles.label, { marginTop: 5 }]}>Validez</Text>
                <Text style={styles.value}>{presupuesto.validez}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Descripción</Text>
            <Text style={styles.colCant}>Cant.</Text>
            <Text style={styles.colPrecio}>Precio</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {presupuesto.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDesc}>{item.descripcion}</Text>
              <Text style={styles.colCant}>{item.cantidad}</Text>
              <Text style={styles.colPrecio}>{item.precioUnitario.toFixed(2)} €</Text>
              <Text style={styles.colTotal}>{item.total.toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA ({presupuesto.impuesto}%):</Text>
            <Text style={styles.totalValue}>{impuesto.toFixed(2)} €</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {presupuesto.notas && (
          <View style={styles.notas}>
            <Text style={styles.label}>Notas</Text>
            <Text>{presupuesto.notas}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
