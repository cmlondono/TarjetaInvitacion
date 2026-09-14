import { NextResponse } from 'next/server'
import { validarFirmaWebhookWompi } from '@/lib/wompi'
import { EventoRepositorio } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Validar la firma criptográfica del Webhook
    const firmaValida = validarFirmaWebhookWompi(body)
    if (!firmaValida) {
      console.warn('Firma de webhook Wompi no válida')
      return NextResponse.json({ error: 'Firma no válida' }, { status: 400 })
    }

    const eventoTipo = body?.event // 'transaction.updated'
    const transaccion = body?.data?.transaction

    if (eventoTipo === 'transaction.updated' && transaccion) {
      const estado = transaccion.status
      const referencia = transaccion.reference // Ej: 'PREM_tokenAdmin_1700000000'

      console.log(`[WOMPI WEBHOOK] Transacción ${transaccion.id} - Estado: ${estado} - Ref: ${referencia}`)

      if (estado === 'APPROVED') {
        // Extraer el token o id de la referencia
        const partes = referencia.split('_')
        const tokenFragmento = partes[1]

        if (tokenFragmento) {
          // Si tenemos base de datos o almacenamiento persistente, actualizar el evento a esPremium = true
          const todos = EventoRepositorio.obtenerTodos()
          const eventoEncontrado = todos.find(
            (e) =>
              e.tokenAdmin.startsWith(tokenFragmento) ||
              e.id.startsWith(tokenFragmento)
          )

          if (eventoEncontrado) {
            eventoEncontrado.esPremium = true
            EventoRepositorio.guardar(eventoEncontrado)
            console.log(`[WOMPI WEBHOOK] Evento ${eventoEncontrado.titulo} actualizado a PREMIUM con éxito.`)
          }
        }
      }
    }

    // Responder siempre 200 OK a Wompi para confirmar recepción
    return NextResponse.json({ received: true, status: 'success' })
  } catch (error) {
    console.error('Error procesando webhook de Wompi:', error)
    return NextResponse.json(
      { error: 'Error interno en webhook' },
      { status: 500 }
    )
  }
}
