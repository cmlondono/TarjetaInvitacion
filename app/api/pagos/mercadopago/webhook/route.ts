import { NextResponse } from 'next/server'
import { consultarPagoMercadoPago } from '@/lib/mercadopago'
import { EventoRepositorio } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Mercado Pago puede enviar el ID de pago en query params o en el body JSON
    const topic = searchParams.get('topic') || searchParams.get('type')
    let paymentId = searchParams.get('id') || searchParams.get('data.id')

    if (!paymentId) {
      try {
        const body = await request.json()
        paymentId = body?.data?.id || body?.id
      } catch {}
    }

    if (!paymentId) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Consultar el estado real del pago en la API de Mercado Pago
    const pago = await consultarPagoMercadoPago(paymentId)

    if (pago && pago.status === 'approved') {
      const ref = pago.external_reference || '' // Ej: PREM_tokenAdmin_1700000000
      console.log(`[MERCADO PAGO WEBHOOK] Pago Aprobado: ${paymentId} para referencia: ${ref}`)

      const partes = ref.split('_')
      const tokenFragmento = partes[1]

      if (tokenFragmento) {
        const todos = EventoRepositorio.obtenerTodos()
        const eventoEncontrado = todos.find(
          (e) =>
            e.tokenAdmin.startsWith(tokenFragmento) ||
            e.id.startsWith(tokenFragmento)
        )

        if (eventoEncontrado) {
          eventoEncontrado.esPremium = true
          EventoRepositorio.guardar(eventoEncontrado)
          console.log(`[MERCADO PAGO WEBHOOK] Evento ${eventoEncontrado.titulo} activado como PREMIUM.`)
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error)
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 })
  }
}
