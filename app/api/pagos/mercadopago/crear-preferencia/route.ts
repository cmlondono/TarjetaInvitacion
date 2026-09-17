import { NextResponse } from 'next/server'
import { crearPreferenciaMercadoPago } from '@/lib/mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenAdmin, eventoId, tituloEvento, emailCliente, precioCOP } = body

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

    return NextResponse.json({
      exito: true,
      preferenciaId: preferencia.id,
      initPoint: initPointFinal,
      sandboxInitPoint: preferencia.sandbox_init_point,
      publicKey,
      esModoPrueba,
      precioCOP: precioCOP ? `$${precioCOP.toLocaleString('es-CO')} COP` : '$15.900 COP',
      equivalenteUSD: '$3.99 USD',
    })
  } catch (error) {
    console.error('Error en crear-preferencia Mercado Pago:', error)
    return NextResponse.json(
      { exito: false, error: 'Error interno en la solicitud de pago' },
      { status: 500 }
    )
  }
}
