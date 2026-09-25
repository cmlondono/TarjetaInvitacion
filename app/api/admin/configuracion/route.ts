import { NextRequest, NextResponse } from 'next/server'
import { obtenerSesionAdmin } from '@/lib/admin-auth'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ConfiguracionGlobal, CONFIGURACION_DEFAULT } from '@/types/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/configuracion
 * Obtiene la configuración completa del sistema para el panel de Superadministrador
 */
export async function GET() {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let config = ServidorAlmacen.obtenerConfiguracion()

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
      console.warn('Aviso en GET /api/admin/configuracion desde Supabase:', e)
    }
  }

  return NextResponse.json({
    ok: true,
    configuracion: config || CONFIGURACION_DEFAULT,
  })
}

/**
 * POST /api/admin/configuracion
 * Guarda las configuraciones operativas en memoria, disco y Supabase PostgreSQL
 */
export async function POST(req: NextRequest) {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const cuerpo = await req.json()
    const nuevaConfig: Partial<ConfiguracionGlobal> = cuerpo?.configuracion || cuerpo

    if (!nuevaConfig) {
      return NextResponse.json({ error: 'Configuración requerida' }, { status: 400 })
    }

    // 1. Guardar en servidor local (Memoria + Disco JSON)
    const configGuardada = ServidorAlmacen.guardarConfiguracion(nuevaConfig)

    // 2. Persistir en base de datos central Supabase PostgreSQL
    let guardadoEnSupabase = false
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      try {
        const { error } = await supabase.from('configuracion_global').upsert({
          id: 'principal',
          precio_premium_cop: configGuardada.precioPremiumCOP,
          precio_premium_usd: configGuardada.precioPremiumUSD,
          limite_gratis_invitados: configGuardada.limiteGratisInvitados,
          anuncios_ads_habilitados: configGuardada.anunciosAdsHabilitados,
          modo_mantenimiento: configGuardada.modoMantenimiento,
          mensaje_mantenimiento: configGuardada.mensajeMantenimiento || null,
          whatsapp_soporte: configGuardada.whatsappSoporte || null,
          ultima_actualizacion: new Date().toISOString(),
        })

        if (!error) {
          guardadoEnSupabase = true
        } else {
          console.error('Error guardando en Supabase configuracion_global:', error)
        }
      } catch (dbErr) {
        console.error('Excepción guardando configuracion_global en Supabase:', dbErr)
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Configuración guardada exitosamente.',
      configuracion: configGuardada,
      guardadoEnSupabase,
    })
  } catch (error: any) {
    console.error('Error en POST /api/admin/configuracion:', error)
    return NextResponse.json(
      { error: error.message || 'Error guardando configuración' },
      { status: 500 }
    )
  }
}
