import { NextResponse } from 'next/server'
import { consultarPagoMercadoPago } from '@/lib/mercadopago'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearEventoDesdeDb } from '@/lib/storage'

/**
 * POST /api/pagos/mercadopago/verificar
 * Verifica y valida el estado de un pago al retornar desde Mercado Pago
 * y actualiza inmediatamente el evento a PREMIUM en Supabase y caché de servidor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenAdmin, eventoId, paymentId, status } = body

    if (!tokenAdmin && !eventoId) {
      return NextResponse.json(
        { exito: false, error: 'Identificador de evento requerido' },
        { status: 400 }
      )
    }

    let pagoAprobado = false

    // 1. Si tenemos paymentId, verificar directamente con la API de Mercado Pago
    if (paymentId) {
      try {
        const detallePago = await consultarPagoMercadoPago(paymentId)
        if (detallePago && detallePago.status === 'approved') {
          pagoAprobado = true
        }
      } catch (e) {
        console.warn('Error consultando pago en Mercado Pago:', e)
      }
    }

    // 2. Si status reportado por Mercado Pago en la redirección es approved
    if (status === 'approved') {
      pagoAprobado = true
    }

    if (!pagoAprobado) {
      return NextResponse.json({
        exito: false,
        esPremium: false,
        mensaje: 'El pago aún no ha sido confirmado por la pasarela.',
      })
    }

    const identificador = tokenAdmin || eventoId

    // 3. Activar en Supabase PostgreSQL
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        const { data: eventoDb } = await supabase
          .from('eventos')
          .select('*')
          .or(`token_admin.eq.${identificador},id.eq.${identificador}`)
          .maybeSingle()

        if (eventoDb) {
          await supabase
            .from('eventos')
            .update({ es_premium: true })
            .eq('id', eventoDb.id)

          const evMapeado = mapearEventoDesdeDb({ ...eventoDb, es_premium: true })
          ServidorAlmacen.guardarEvento(evMapeado)
        }
      }
    } catch (dbErr) {
      console.warn('Aviso actualizando Supabase en verificación de pago:', dbErr)
    }

    // 4. Activar en caché de memoria del servidor
    const evMemoria =
      ServidorAlmacen.obtenerEventoPorToken(identificador) ||
      ServidorAlmacen.obtenerEventoPorId(identificador)

    if (evMemoria) {
      ServidorAlmacen.guardarEvento({ ...evMemoria, esPremium: true })
    }

    return NextResponse.json({
      exito: true,
      esPremium: true,
      mensaje: '¡Pase Ilimitado activado con éxito!',
    })
  } catch (error: any) {
    console.error('Error en /api/pagos/mercadopago/verificar:', error)
    return NextResponse.json(
      { exito: false, error: error.message || 'Error interno al verificar pago' },
      { status: 500 }
    )
  }
}
