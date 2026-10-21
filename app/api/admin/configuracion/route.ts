import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { ETIQUETA_CONFIGURACION, obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { usdDesdeCop } from '@/lib/precios'
import { obtenerTasaCopPorUsd } from '@/lib/tasa-cambio'
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

  // Misma fuente que el resto del sitio: base de datos y el precio en USD calculado con la tasa del día
  const config = await obtenerConfiguracionGlobal()
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

    // Los precios en pesos y el cupo son números enteros en la base de datos: se redondean y se validan
    // (un decimal —p. ej. «15.900» leído como 15,9— hacía fallar el guardado sin explicar por qué)
    const numero = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v))
    const cop = numero(nuevaConfig.precioPremiumCOP)
    const limite = numero(nuevaConfig.limiteGratisInvitados)
    if (cop !== undefined && (!Number.isFinite(cop) || cop < 1000 || cop > 100_000_000)) {
      return NextResponse.json({ error: 'La tarifa en COP debe ser un número entre 1.000 y 100.000.000.' }, { status: 400 })
    }
    if (limite !== undefined && (!Number.isFinite(limite) || limite < 1 || limite > 100_000)) {
      return NextResponse.json({ error: 'El límite gratuito de invitados debe ser un número entero mayor que 0.' }, { status: 400 })
    }
    if (cop !== undefined) nuevaConfig.precioPremiumCOP = Math.round(cop)
    // El precio en dólares no se edita: se calcula con la tasa del día a partir del precio en pesos
    const tasa = await obtenerTasaCopPorUsd()
    delete nuevaConfig.tasaCopPorUsd
    delete nuevaConfig.paisVisitante
    if (nuevaConfig.precioPremiumCOP !== undefined) nuevaConfig.precioPremiumUSD = usdDesdeCop(nuevaConfig.precioPremiumCOP, tasa)
    if (limite !== undefined) nuevaConfig.limiteGratisInvitados = Math.round(limite)

    // 1. Guardar en servidor local (Memoria + Disco JSON)
    const configGuardada = ServidorAlmacen.guardarConfiguracion(nuevaConfig)

    // 2. Persistir en base de datos central Supabase PostgreSQL
    let guardadoEnSupabase = false
    let detalleError = ''
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
          detalleError = error.message
        }
      } catch (dbErr) {
        console.error('Excepción guardando configuracion_global en Supabase:', dbErr)
      }
    }

    if (supabase && !guardadoEnSupabase) {
      // Solo lo ve el superadministrador: el detalle ayuda a saber qué valor rechazó la base de datos
      return NextResponse.json({ error: `No se pudo guardar la configuración en la base de datos${detalleError ? ` (${detalleError})` : ''}. Intenta de nuevo.` }, { status: 502 })
    }

    // Las páginas que muestran precios, cupo gratis o el WhatsApp de soporte se regeneran al instante
    revalidateTag(ETIQUETA_CONFIGURACION, { expire: 0 })
    for (const ruta of ['/', '/contacto', '/terminos-y-condiciones']) revalidatePath(ruta)

    return NextResponse.json({
      ok: true,
      mensaje: 'Configuración guardada exitosamente.',
      configuracion: { ...configGuardada, tasaCopPorUsd: tasa },
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
