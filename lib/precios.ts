/**
 * Precio de Premium según dónde esté el visitante.
 * El superadministrador fija solo el precio en pesos colombianos (es lo que cobra Mercado Pago).
 * En Colombia se muestra en COP; desde otro país, su equivalente aproximado en dólares
 * junto al valor real que se cobra en pesos, para que nunca sea engañoso.
 */

export const PAIS_POR_DEFECTO = 'CO'

/** Tasa de respaldo si el servicio de cambio no responde (pesos por dólar) */
export const TASA_RESPALDO_COP_POR_USD = 3200

export const usdDesdeCop = (cop: number, tasaCopPorUsd: number) =>
  Math.round((cop / (tasaCopPorUsd > 0 ? tasaCopPorUsd : TASA_RESPALDO_COP_POR_USD)) * 100) / 100

export const formatoCop = (cop: number) => `$${Math.round(cop).toLocaleString('es-CO')} COP`
export const formatoUsd = (usd: number) => `US$${usd.toFixed(2)}`

/** Colombia (o país desconocido) ve pesos; el resto ve dólares aproximados */
export const esColombia = (pais?: string | null) => !pais || pais.toUpperCase() === PAIS_POR_DEFECTO

export interface TextoPrecio {
  /** Lo que se muestra en grande */
  principal: string
  /** Aclaración (solo fuera de Colombia): el valor real que se cobra */
  nota?: string
}

export function textoPrecio(cop: number, usd: number, pais?: string | null): TextoPrecio {
  if (esColombia(pais)) return { principal: formatoCop(cop) }
  return { principal: `≈ ${formatoUsd(usd)}`, nota: `se cobra ${formatoCop(cop)}` }
}

/** Una sola línea, para textos que no dependen del visitante (términos, páginas en caché) */
export const textoPrecioCompleto = (cop: number, usd: number) => `${formatoCop(cop)} (≈ ${formatoUsd(usd)})`
