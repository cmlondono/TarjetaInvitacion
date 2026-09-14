import { NextResponse } from 'next/server'
import { crearPreferenciaMercadoPago } from '@/lib/mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenAdmin, eventoId, tituloEvento, emailCliente } = body

    const preferencia = await crearPreferenciaMercadoPago({
      tokenAdmin,
      eventoId,
      tituloEvento,
      emailCliente,
    })

    if (!preferencia) {
      return NextResponse.json(
        { exito: false, error: 'No se pudo crear la preferencia de pago en Mercado Pago' },
        { status: 500 }
      )
    }

    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
    const esModoPrueba = publicKey.startsWith('TEST-') || !publicKey

    return NextResponse.json({
      exito: true,
      preferenciaId: preferencia.id,
      initPoint: esModoPrueba ? preferencia.sandbox_init_point : preferencia.init_point,
      sandboxInitPoint: preferencia.sandbox_init_point,
      publicKey,
      esModoPrueba,
      precioCOP: '$15.900 COP',
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
