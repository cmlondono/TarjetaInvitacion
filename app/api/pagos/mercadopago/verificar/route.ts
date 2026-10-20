import { NextResponse } from 'next/server'
import { activarPremiumPorPago } from '@/lib/pagos-servidor'
import { obtenerClienteSupabase } from '@/lib/supabase'

/**
 * POST /api/pagos/mercadopago/verificar { tokenAdmin, paymentId }
 * Al volver de Mercado Pago, el panel del anfitrión pide activar Premium. Solo se activa si
 * Mercado Pago confirma que ese pago está aprobado y es de este evento: el estado que trae
 * la dirección del navegador no cuenta (cualquiera podría escribir status=approved).
 */
export async function POST(request: Request) {
  try {
    const { tokenAdmin, paymentId, demo } = await request.json().catch(() => ({}))
    if (!tokenAdmin) {
      return NextResponse.json({ exito: false, error: 'Identificador de evento requerido' }, { status: 400 })
    }

    // Solo en desarrollo local y sin credenciales de Mercado Pago: el pago simulado activa Premium
    const sinCredenciales = !process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN.includes('00000000')
    if (demo && process.env.NODE_ENV === 'development' && sinCredenciales) {
      const supabase = obtenerClienteSupabase()
      await supabase?.from('eventos').update({ es_premium: true }).eq('token_admin', String(tokenAdmin))
      return NextResponse.json({ exito: true, esPremium: true, mensaje: 'Pago simulado (desarrollo).' })
    }

    if (!paymentId) {
      return NextResponse.json({ exito: false, esPremium: false, mensaje: 'El pago aún no ha sido confirmado por Mercado Pago.' })
    }

    const resultado = await activarPremiumPorPago(String(paymentId), String(tokenAdmin))
    return NextResponse.json({ exito: resultado.activado, esPremium: resultado.activado, mensaje: resultado.mensaje })
  } catch (error: any) {
    console.error('Error en /api/pagos/mercadopago/verificar:', error)
    return NextResponse.json({ exito: false, error: 'Error interno al verificar pago' }, { status: 500 })
  }
}
