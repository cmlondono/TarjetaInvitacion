import { NextResponse } from 'next/server'
import { activarPremiumPorPago } from '@/lib/pagos-servidor'

/**
 * POST /api/pagos/mercadopago/webhook
 * Aviso de Mercado Pago. El pago se consulta en su API antes de activar nada
 * (y ahí mismo se cuenta el uso del cupón, si lo hubo).
 */
export async function POST(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams

    // Mercado Pago puede enviar el ID de pago en query params o en el body JSON
    let paymentId = searchParams.get('id') || searchParams.get('data.id')
    let tipo = searchParams.get('type') || searchParams.get('topic')
    try {
      const body = await request.json()
      paymentId = paymentId || body?.data?.id || body?.id
      tipo = tipo || body?.type || body?.topic
    } catch {}

    // Solo interesan los avisos de pagos (no los de órdenes u otros)
    if (!paymentId || (tipo && tipo !== 'payment')) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const resultado = await activarPremiumPorPago(String(paymentId))
    console.log(`[MERCADO PAGO WEBHOOK] Pago ${paymentId}: ${resultado.mensaje}`)
    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error)
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 })
  }
}
