import { NextResponse } from 'next/server'
import { crearPreferenciaMercadoPago } from '@/lib/mercadopago'
import { obtenerConfiguracionGlobal, formatearCOP } from '@/lib/configuracion-servidor'
import { aplicarCupon, registrarUsoCupon, validarCupon } from '@/lib/promociones-servidor'
import { obtenerClienteSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenAdmin, eventoId, tituloEvento, emailCliente, codigoCupon } = body

    // El precio lo decide el servidor: el del panel de administración y, si hay, el cupón validado
    // en la base de datos. Cualquier precio que envíe el navegador se ignora.
    const config = await obtenerConfiguracionGlobal()
    let promocion = null
    if (codigoCupon) {
      const cupon = await validarCupon(String(codigoCupon))
      if (!cupon.valido) return NextResponse.json({ exito: false, error: cupon.mensaje }, { status: 400 })
      promocion = cupon.promocion
    }
    const precioCOP = aplicarCupon(config.precioPremiumCOP, promocion)

    // Cupón del 100 %: no hay nada que cobrar, se activa Premium directamente (solo con el token del anfitrión)
    if (precioCOP === 0) {
      const supabase = obtenerClienteSupabase()
      if (!supabase || !tokenAdmin) return NextResponse.json({ exito: false, error: 'No se pudo activar el pase.' }, { status: 400 })
      const { data: evento } = await supabase.from('eventos').select('id').eq('token_admin', String(tokenAdmin)).maybeSingle()
      if (!evento) return NextResponse.json({ exito: false, error: 'No autorizado.' }, { status: 403 })
      const { error } = await supabase.from('eventos').update({ es_premium: true }).eq('id', evento.id)
      if (error) return NextResponse.json({ exito: false, error: 'No se pudo activar el pase.' }, { status: 500 })
      if (promocion) await registrarUsoCupon(promocion)
      return NextResponse.json({ exito: true, gratis: true, precioCOP: `${formatearCOP(0)} COP` })
    }

    const preferencia = await crearPreferenciaMercadoPago({
      tokenAdmin,
      eventoId,
      tituloEvento,
      emailCliente,
      precioCOP,
    })

    if (!preferencia) {
      const tieneToken = Boolean(
        process.env.MERCADOPAGO_ACCESS_TOKEN &&
        !process.env.MERCADOPAGO_ACCESS_TOKEN.includes('00000000')
      )

      return NextResponse.json(
        {
          exito: false,
          error: tieneToken
            ? 'No se pudo generar la orden de pago en Mercado Pago. Por favor intenta de nuevo.'
            : 'Las credenciales de Mercado Pago (MERCADOPAGO_ACCESS_TOKEN) deben configurarse en el servidor para habilitar pagos en vivo.',
        },
        { status: 500 }
      )
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
    const esModoPrueba = accessToken.startsWith('TEST-') || publicKey.startsWith('TEST-')

    // Si el token es de test, usar sandbox_init_point
    const initPointFinal = esModoPrueba && preferencia.sandbox_init_point
      ? preferencia.sandbox_init_point
      : preferencia.init_point

    if (promocion) await registrarUsoCupon(promocion)

    return NextResponse.json({
      exito: true,
      preferenciaId: preferencia.id,
      initPoint: initPointFinal,
      sandboxInitPoint: preferencia.sandbox_init_point,
      publicKey,
      esModoPrueba,
      precioCOP: `${formatearCOP(precioCOP)} COP`,
      equivalenteUSD: `${config.precioPremiumUSD} USD`,
    })
  } catch (error) {
    console.error('Error en crear-preferencia Mercado Pago:', error)
    return NextResponse.json(
      { exito: false, error: 'Error interno en la solicitud de pago' },
      { status: 500 }
    )
  }
}
