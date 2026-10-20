import { unstable_cache } from 'next/cache'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { CONFIGURACION_DEFAULT, type ConfiguracionGlobal } from '@/types/admin'

/**
 * Configuración global del sistema (precios, cupo gratis, anuncios, mantenimiento, WhatsApp de soporte)
 * leída de la base de datos. Es lo que el superadministrador edita en el panel: todo el sitio la usa
 * en lugar de valores escritos en el código. Solo para el servidor.
 */
export async function obtenerConfiguracionGlobal(): Promise<ConfiguracionGlobal> {
  const respaldo = { ...CONFIGURACION_DEFAULT, ...ServidorAlmacen.obtenerConfiguracion() }
  const supabase = obtenerClienteSupabase()
  if (!supabase) return respaldo
  try {
    const { data, error } = await supabase.from('configuracion_global').select('*').eq('id', 'principal').maybeSingle()
    if (error || !data) return respaldo
    return {
      precioPremiumCOP: Number(data.precio_premium_cop ?? respaldo.precioPremiumCOP),
      precioPremiumUSD: Number(data.precio_premium_usd ?? respaldo.precioPremiumUSD),
      limiteGratisInvitados: Number(data.limite_gratis_invitados ?? respaldo.limiteGratisInvitados),
      anunciosAdsHabilitados: data.anuncios_ads_habilitados ?? respaldo.anunciosAdsHabilitados,
      modoMantenimiento: data.modo_mantenimiento ?? respaldo.modoMantenimiento,
      mensajeMantenimiento: data.mensaje_mantenimiento ?? respaldo.mensajeMantenimiento,
      whatsappSoporte: data.whatsapp_soporte ?? respaldo.whatsappSoporte,
      ultimaActualizacion: data.ultima_actualizacion ?? respaldo.ultimaActualizacion,
    }
  } catch {
    return respaldo
  }
}

export const ETIQUETA_CONFIGURACION = 'configuracion-global'

/** Igual, con caché de 5 minutos (para el layout de todas las páginas). Se renueva al guardar en el panel. */
export const obtenerConfiguracionCacheada = unstable_cache(obtenerConfiguracionGlobal, ['configuracion-global'], {
  tags: [ETIQUETA_CONFIGURACION],
  revalidate: 300,
})

/** '$15.900' a partir de un valor en pesos */
export const formatearCOP = (valor: number) => `$${Math.round(valor).toLocaleString('es-CO')}`

/** Cuenta de Google AdSense del sitio (la misma de public/ads.txt) */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-4454797114720338'
