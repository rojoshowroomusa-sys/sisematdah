export function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("es-ES").format(new Date(d));
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Redondeo monetario a centavos (medio fuera de cero, como se espera en dinero).
 *
 * El `toFixed(6)` sobre el valor ya escalado a centavos elimina el ruido binario
 * antes de redondear. Sin él, el producto flotante se queda corto y redondea hacia
 * abajo: `7 * 1.005` da 7.034999999999999 y se imprimía 7,03 en lugar de 7,04.
 */
export function roundToCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const scaled = Number((n * 100).toFixed(6));
  return (n < 0 ? -Math.round(-scaled) : Math.round(scaled)) / 100;
}

/** Total de una línea, ya redondeado a centavos. */
export function lineTotal(cantidad: number, precioUnitario: number): number {
  return roundToCents(cantidad * precioUnitario);
}

/**
 * Importe listo para mostrar: redondea a centavos antes de formatear.
 * Se usa para los importes de línea, de modo que lo impreso coincida con el
 * valor que `computeTotals` suma en el subtotal (importante para filas
 * antiguas guardadas antes de que la escritura redondeara).
 */
export function formatMoney(n: number): string {
  return formatEUR(roundToCents(n));
}

/**
 * Sanea un porcentaje de IVA que viene de un formulario.
 *
 * `Number("")` es 0, no NaN: por eso un campo vacío se guardaba como 0 % de IVA
 * mientras el preview seguía mostrando 21 %. Acá el vacío, el `null` y el `NaN`
 * caen al valor por defecto, y el resto se acota a 0..100.
 */
export function normalizeTaxRate(value: unknown, fallback = 21): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, 0), 100);
}

export interface Totals {
  subtotal: number;
  impuesto: number;
  total: number;
}

/**
 * Totales de un documento a partir de los totales de línea.
 *
 * El subtotal es la suma de los totales de línea YA redondeados, de modo que
 * coincide exactamente con la suma de lo que se imprime línea por línea. Es el
 * único camino de cálculo: lo usan el formulario, el detalle, el PDF, las
 * facturas y las estadísticas, para que ninguna vista discrepe de otra.
 *
 * Recibe los totales de línea ya resueltos: en el formulario son
 * `lineTotal(cantidad, precioUnitario)`, y en una vista de sólo lectura son los
 * `item.total` almacenados.
 */
export function computeTotals(lineTotals: number[], taxPercent: number): Totals {
  const subtotal = roundToCents(
    lineTotals.reduce((sum, t) => sum + roundToCents(t), 0)
  );
  const rate = Number.isFinite(taxPercent) ? taxPercent : 0;
  const impuesto = roundToCents(subtotal * (rate / 100));
  return { subtotal, impuesto, total: roundToCents(subtotal + impuesto) };
}
