import { NextResponse } from 'next/server'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { CONFIGURACION_DEFAULT } from '@/types/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/configuracion
 * Endpoint público y ligero para obtener la configuración operativa del sistema:
 * - Precio en COP y USD
 * - Límite de invitados gratuitos para eventos sin licencia
 * - Modo mantenimiento y anuncios
 */
export async function GET() {
  try {
    // 1. Cargar desde memoria/disco del servidor
    let config = ServidorAlmacen.obtenerConfiguracion()

    // 2. Si hay conexión a Supabase, sincronizar si no se ha hecho
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('configuracion_global')
          .select('*')
          .eq('id', 'principal')
          .maybeSingle()

        if (data && !error) {
          config = ServidorAlmacen.guardarConfiguracion({
            precioPremiumCOP: data.precio_premium_cop ?? config.precioPremiumCOP,
            precioPremiumUSD: Number(data.precio_premium_usd ?? config.precioPremiumUSD),
            limiteGratisInvitados: data.limite_gratis_invitados ?? config.limiteGratisInvitados,
            anunciosAdsHabilitados: data.anuncios_ads_habilitados ?? config.anunciosAdsHabilitados,
            modoMantenimiento: data.modo_mantenimiento ?? config.modoMantenimiento,
            mensajeMantenimiento: data.mensaje_mantenimiento ?? config.mensajeMantenimiento,
            whatsappSoporte: data.whatsapp_soporte ?? config.whatsappSoporte,
            ultimaActualizacion: data.ultima_actualizacion ?? config.ultimaActualizacion,
          })
        }
      } catch (e) {
        console.warn('Aviso consultando configuracion_global en Supabase:', e)
      }
    }

    return NextResponse.json({
      ok: true,
      configuracion: config || CONFIGURACION_DEFAULT,
    })
  } catch (error: any) {
    console.error('Error en GET /api/configuracion:', error)
    return NextResponse.json({
      ok: true,
      configuracion: CONFIGURACION_DEFAULT,
    })
  }
}
