import { consultarPagoMercadoPago } from '@/lib/mercadopago'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearEventoDesdeDb } from '@/lib/storage'

export interface ResultadoActivacion {
  activado: boolean
  mensaje: string
}

/** Token del anfitrión dentro de la referencia del pago: PREM_${tokenAdmin}_${marcaDeTiempo} */
export function tokenDeReferencia(referencia: string): string {
  const partes = (referencia || '').split('_')
  if (partes[0] !== 'PREM' || partes.length < 3) return ''
  return partes.slice(1, -1).join('_')
}

/**
 * Activa Premium a partir de un pago de Mercado Pago, consultado directamente en su API
 * (nunca con lo que diga el navegador). Lo usan el webhook y el regreso del anfitrión.
 * - Si se pasa `tokenEsperado`, el pago debe pertenecer a ese evento.
 * - El uso del cupón se cuenta aquí, al aprobarse el pago, y una sola vez: solo la llamada
 *   que pasa el evento de gratis a Premium lo registra (el webhook puede llegar varias veces).
 */
export async function activarPremiumPorPago(paymentId: string | number, tokenEsperado?: string): Promise<ResultadoActivacion> {
  const pago = await consultarPagoMercadoPago(paymentId)
  if (!pago) return { activado: false, mensaje: 'No se encontró el pago en Mercado Pago.' }
  if (pago.status !== 'approved') return { activado: false, mensaje: 'El pago aún no ha sido aprobado por Mercado Pago.' }

  const token = tokenDeReferencia(pago.external_reference)
  if (!token) return { activado: false, mensaje: 'El pago no corresponde a un pase Premium.' }
  if (tokenEsperado && token !== tokenEsperado) return { activado: false, mensaje: 'El pago no corresponde a este evento.' }

  const supabase = obtenerClienteSupabase()
  if (!supabase) return { activado: false, mensaje: 'Base de datos no disponible.' }
  const { data: eventoDb } = await supabase.from('eventos').select('*').eq('token_admin', token).maybeSingle()
  if (!eventoDb) return { activado: false, mensaje: 'Evento no encontrado.' }
  if (eventoDb.es_premium) return { activado: true, mensaje: 'El evento ya es Premium.' }

  // Solo cambia si sigue gratis: si dos avisos llegan a la vez, uno solo lo activa
  const { data: cambiados, error } = await supabase
    .from('eventos')
    .update({ es_premium: true })
    .eq('id', eventoDb.id)
    .eq('es_premium', false)
    .select('id')
  if (error) return { activado: false, mensaje: 'No se pudo activar el pase.' }
  if (!cambiados?.length) return { activado: true, mensaje: 'El evento ya es Premium.' }

  ServidorAlmacen.guardarEvento(mapearEventoDesdeDb({ ...eventoDb, es_premium: true }))

  const cupon = String(pago.metadata?.cupon_codigo || '').trim().toUpperCase()
  if (cupon) {
    const { data: promo } = await supabase.from('promociones').select('id, usos_actuales').eq('codigo', cupon).maybeSingle()
    if (promo) await supabase.from('promociones').update({ usos_actuales: (promo.usos_actuales || 0) + 1 }).eq('id', promo.id)
  }

  console.log(`[PAGO] Pago ${paymentId} aprobado: evento "${eventoDb.titulo}" activado como Premium${cupon ? ` (cupón ${cupon})` : ''}.`)
  return { activado: true, mensaje: '¡Pase Ilimitado activado con éxito!' }
}
