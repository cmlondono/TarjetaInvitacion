import type { DetalleEvento } from '@/types/invitation'
import { obtenerSticker } from '@/lib/editor/stickers'

/**
 * Funciones de diseño Premium. Cualquiera puede usarlas en el editor; si el evento no ha pagado,
 * no se puede publicar: enviar o compartir pide el pago y el enlace público muestra que aún no está publicada.
 * Se calcula con los datos guardados del evento (la misma regla en el editor, la invitación y el servidor).
 */
export type FuncionPremium = 'plantilla' | 'particulas' | 'fondo_animado' | 'stickers_animados' | 'movimiento'

export const NOMBRE_FUNCION_PREMIUM: Record<FuncionPremium, string> = {
  plantilla: 'Plantilla Premium',
  particulas: 'Partículas',
  fondo_animado: 'Fondo en movimiento',
  stickers_animados: 'Stickers animados',
  movimiento: 'Movimiento continuo',
}

type EventoParaPremium = Pick<DetalleEvento, 'configuracionVisual' | 'secciones'>

export function funcionesPremiumUsadas(evento: EventoParaPremium): FuncionPremium[] {
  const visual = evento.configuracionVisual
  const usadas = new Set<FuncionPremium>()
  if (visual?.plantillaPremium) usadas.add('plantilla')
  if (visual?.particulas?.tipo) usadas.add('particulas')
  if (visual?.fondoAnimado) usadas.add('fondo_animado')
  for (const s of evento.secciones || []) {
    for (const el of s.elementos || []) {
      if (el.oculto) continue
      if (el.tipo === 'sticker' && obtenerSticker(el.stickerId)?.animado) usadas.add('stickers_animados')
      if (el.movimiento && el.movimiento !== 'ninguno') usadas.add('movimiento')
    }
  }
  return [...usadas]
}

/** No se puede publicar todavía: usa funciones Premium y el evento no ha pagado */
export function requiereActivarPremium(evento: EventoParaPremium & Pick<DetalleEvento, 'esPremium'>): boolean {
  return !evento.esPremium && funcionesPremiumUsadas(evento).length > 0
}
