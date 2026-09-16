import { DetalleEvento, Invitado } from '@/types/invitation'

// Almacén en memoria global para el entorno del servidor Next.js
// Garantiza persistencia y comunicación inmediata entre endpoints cuando Supabase
// aún no está configurado o como capa de caché de alta velocidad.
declare global {
  var __tarjeton_eventos_cache: Map<string, DetalleEvento> | undefined
  var __tarjeton_confirmaciones_cache: Map<string, Map<string, Invitado>> | undefined
}

if (!globalThis.__tarjeton_eventos_cache) {
  globalThis.__tarjeton_eventos_cache = new Map<string, DetalleEvento>()
}

if (!globalThis.__tarjeton_confirmaciones_cache) {
  globalThis.__tarjeton_confirmaciones_cache = new Map<string, Map<string, Invitado>>()
}

const eventosCache = globalThis.__tarjeton_eventos_cache
const confirmacionesCache = globalThis.__tarjeton_confirmaciones_cache

export const ServidorAlmacen = {
  guardarEvento(evento: DetalleEvento): void {
    if (!evento || !evento.id) return
    eventosCache.set(evento.id, evento)
    if (evento.slugPublico) {
      eventosCache.set(`slug:${evento.slugPublico}`, evento)
    }
    if (evento.tokenAdmin) {
      eventosCache.set(`token:${evento.tokenAdmin}`, evento)
    }
  },

  obtenerEventoPorSlug(slug: string): DetalleEvento | null {
    return eventosCache.get(`slug:${slug}`) || null
  },

  obtenerEventoPorToken(token: string): DetalleEvento | null {
    return eventosCache.get(`token:${token}`) || null
  },

  obtenerEventoPorId(id: string): DetalleEvento | null {
    return eventosCache.get(id) || null
  },

  guardarInvitado(eventoId: string, invitado: Invitado): void {
    if (!eventoId || !invitado) return
    let mapa = confirmacionesCache.get(eventoId)
    if (!mapa) {
      mapa = new Map<string, Invitado>()
      confirmacionesCache.set(eventoId, mapa)
    }

    // Buscar si ya existe por código de acceso o nombre para no duplicar
    let claveExistente = invitado.id
    for (const [clave, existente] of mapa.entries()) {
      if (
        (invitado.codigoAcceso && existente.codigoAcceso === invitado.codigoAcceso) ||
        (invitado.nombre && existente.nombre && existente.nombre.trim().toLowerCase() === invitado.nombre.trim().toLowerCase())
      ) {
        claveExistente = clave
        break
      }
    }

    const anterior = mapa.get(claveExistente)
    mapa.set(claveExistente, { ...anterior, ...invitado, id: claveExistente, eventoId })
  },

  obtenerInvitados(eventoId: string): Invitado[] {
    const mapa = confirmacionesCache.get(eventoId)
    if (!mapa) return []
    return Array.from(mapa.values())
  },
}
