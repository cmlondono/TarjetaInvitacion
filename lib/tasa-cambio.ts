import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import { PAIS_POR_DEFECTO, TASA_RESPALDO_COP_POR_USD } from './precios'

/**
 * Pesos colombianos por dólar, del servicio gratuito open.er-api.com (se actualiza a diario).
 * Se guarda en caché 12 horas; si el servicio falla o responde algo raro, se usa la tasa de respaldo.
 * Solo para el servidor.
 */
export const obtenerTasaCopPorUsd = unstable_cache(
  async (): Promise<number> => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(4000) })
      const datos = await res.json()
      const tasa = Number(datos?.rates?.COP)
      // Rango sensato para el peso colombiano: evita mostrar un precio absurdo si el servicio falla
      if (datos?.result === 'success' && tasa >= 1500 && tasa <= 10000) return Math.round(tasa * 100) / 100
    } catch (e) {
      console.warn('[tasa-cambio] No se pudo consultar la tasa COP/USD:', e instanceof Error ? e.message : e)
    }
    return TASA_RESPALDO_COP_POR_USD
  },
  ['tasa-cop-usd'],
  { revalidate: 43200 }
)

/**
 * País del visitante (código ISO, p. ej. «CO», «US», «MX») según el hosting:
 * Vercel lo envía en x-vercel-ip-country. Sin ese dato (p. ej. en local) se asume Colombia.
 */
export async function paisVisitante(): Promise<string> {
  try {
    const h = await headers()
    return (h.get('x-vercel-ip-country') || h.get('cf-ipcountry') || PAIS_POR_DEFECTO).toUpperCase()
  } catch {
    return PAIS_POR_DEFECTO
  }
}
