import { NextResponse } from 'next/server'
import { consultarPagoMercadoPago } from '@/lib/mercadopago'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearEventoDesdeDb } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Mercado Pago puede enviar el ID de pago en query params o en el body JSON
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
      const ref = pago.external_reference || '' // Formato: PREM_${tokenAdmin}_${timestamp}
      console.log(`[MERCADO PAGO WEBHOOK] Pago Aprobado: ${paymentId} para referencia: ${ref}`)

      const partes = ref.split('_')
      const tokenRef = partes.slice(1, -1).join('_') || partes[1]

      if (tokenRef) {
        // 1. Actualizar en Supabase PostgreSQL
        try {
          const supabase = obtenerClienteSupabase()
          if (supabase) {
            const { data: eventoDb } = await supabase
              .from('eventos')
              .select('*')
              .or(`token_admin.eq.${tokenRef},id.eq.${tokenRef}`)
              .maybeSingle()

            if (eventoDb) {
              await supabase
                .from('eventos')
                .update({ es_premium: true })
                .eq('id', eventoDb.id)

              const evMapeado = mapearEventoDesdeDb({ ...eventoDb, es_premium: true })
              ServidorAlmacen.guardarEvento(evMapeado)
              console.log(`[MERCADO PAGO WEBHOOK] Evento "${evMapeado.titulo}" activado como PREMIUM en Supabase.`)
            }
          }
        } catch (dbErr) {
          console.error('[MERCADO PAGO WEBHOOK] Error actualizando Supabase:', dbErr)
        }

        // 2. Actualizar también en caché del servidor
        const evMemoria =
          ServidorAlmacen.obtenerEventoPorToken(tokenRef) ||
          ServidorAlmacen.obtenerEventoPorId(tokenRef)
        if (evMemoria) {
          ServidorAlmacen.guardarEvento({ ...evMemoria, esPremium: true })
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error)
    return NextResponse.json({ error: 'Error interno en webhook' }, { status: 500 })
  }
}
