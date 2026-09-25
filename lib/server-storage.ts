import { DetalleEvento, Invitado } from '@/types/invitation'
import { ConfiguracionGlobal, CONFIGURACION_DEFAULT } from '@/types/admin'

// Almacén híbrido de alta disponibilidad: Memoria global + Respaldo persistente en Disco JSON
// Garantiza persistencia inmediata en el servidor incluso si Supabase aún no está conectado,
// resiste reinicios del servidor, recargas de Next.js y permite que dispositivos externos
// en la misma red o en producción local lean los datos guardados de forma transparente.

declare global {
  var __tarjeton_eventos_cache: Map<string, DetalleEvento> | undefined
  var __tarjeton_confirmaciones_cache: Map<string, Map<string, Invitado>> | undefined
  var __tarjeton_configuracion_cache: ConfiguracionGlobal | undefined
  var __tarjeton_disco_cargado: boolean | undefined
}

if (!globalThis.__tarjeton_eventos_cache) {
  globalThis.__tarjeton_eventos_cache = new Map<string, DetalleEvento>()
}

if (!globalThis.__tarjeton_confirmaciones_cache) {
  globalThis.__tarjeton_confirmaciones_cache = new Map<string, Map<string, Invitado>>()
}

const eventosCache = globalThis.__tarjeton_eventos_cache
const confirmacionesCache = globalThis.__tarjeton_confirmaciones_cache

// Ayudantes dinámicos para acceso seguro al sistema de archivos en entornos Node.js
function obtenerFs() {
  if (typeof window !== 'undefined') return null
  try {
    return require('fs')
  } catch {
    return null
  }
}

function obtenerPath() {
  if (typeof window !== 'undefined') return null
  try {
    return require('path')
  } catch {
    return null
  }
}

function obtenerRutasArchivos(): { eventos: string; invitados: string; configuracion: string } | null {
  const fs = obtenerFs()
  const path = obtenerPath()
  if (!fs || !path) return null

  // 1. Intentar carpeta data/ en la raíz del proyecto
  try {
    const cwd = /*turbopackIgnore: true*/ process.cwd()
    const rutaData = path.join(cwd, 'data')
    if (!fs.existsSync(rutaData)) {
      fs.mkdirSync(rutaData, { recursive: true })
    }
    return {
      eventos: path.join(rutaData, 'eventos_db.json'),
      invitados: path.join(rutaData, 'invitados_db.json'),
      configuracion: path.join(rutaData, 'configuracion_db.json'),
    }
  } catch {
    // 2. Si el sistema de archivos principal es de solo lectura (como AWS Lambda / Vercel Serverless), usar /tmp
    try {
      const rutaTmp = path.join('/tmp', 'tarjeton_data')
      if (!fs.existsSync(rutaTmp)) {
        fs.mkdirSync(rutaTmp, { recursive: true })
      }
      return {
        eventos: path.join(rutaTmp, 'eventos_db.json'),
        invitados: path.join(rutaTmp, 'invitados_db.json'),
        configuracion: path.join(rutaTmp, 'configuracion_db.json'),
      }
    } catch {
      return null
    }
  }
}

function cargarDesdeDisco(): void {
  const fs = obtenerFs()
  const rutas = obtenerRutasArchivos()
  if (!fs || !rutas) return

  try {
    if (fs.existsSync(rutas.eventos)) {
      const contenido = fs.readFileSync(rutas.eventos, 'utf-8')
      if (contenido && contenido.trim()) {
        const eventos: DetalleEvento[] = JSON.parse(contenido)
        if (Array.isArray(eventos)) {
          for (const ev of eventos) {
            if (ev && ev.id) {
              eventosCache.set(ev.id, ev)
              if (ev.slugPublico) {
                eventosCache.set(`slug:${ev.slugPublico}`, ev)
              }
              if (ev.tokenAdmin) {
                eventosCache.set(`token:${ev.tokenAdmin}`, ev)
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ServidorAlmacen] Error leyendo eventos de disco:', err)
  }

  try {
    if (fs.existsSync(rutas.invitados)) {
      const contenido = fs.readFileSync(rutas.invitados, 'utf-8')
      if (contenido && contenido.trim()) {
        const invitadosPorEvento: Record<string, Invitado[]> = JSON.parse(contenido)
        for (const [eventoId, lista] of Object.entries(invitadosPorEvento)) {
          if (Array.isArray(lista)) {
            let mapa = confirmacionesCache.get(eventoId)
            if (!mapa) {
              mapa = new Map<string, Invitado>()
              confirmacionesCache.set(eventoId, mapa)
            }
            for (const inv of lista) {
              if (inv && inv.id) {
                mapa.set(inv.id, inv)
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[ServidorAlmacen] Error leyendo invitados de disco:', err)
  }
  try {
    if (fs.existsSync(rutas.configuracion)) {
      const contenido = fs.readFileSync(rutas.configuracion, 'utf-8')
      if (contenido && contenido.trim()) {
        const conf = JSON.parse(contenido)
        if (conf && typeof conf === 'object') {
          globalThis.__tarjeton_configuracion_cache = { ...CONFIGURACION_DEFAULT, ...conf }
        }
      }
    }
  } catch (err) {
    console.warn('[ServidorAlmacen] Error leyendo configuración de disco:', err)
  }
}

function persistirEventosEnDisco(): void {
  const fs = obtenerFs()
  const rutas = obtenerRutasArchivos()
  if (!fs || !rutas) return

  try {
    const lista: DetalleEvento[] = []
    for (const [key, ev] of eventosCache.entries()) {
      if (!key.startsWith('slug:') && !key.startsWith('token:')) {
        lista.push(ev)
      }
    }
    fs.writeFileSync(rutas.eventos, JSON.stringify(lista, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[ServidorAlmacen] Error guardando eventos en disco:', err)
  }
}

function persistirInvitadosEnDisco(): void {
  const fs = obtenerFs()
  const rutas = obtenerRutasArchivos()
  if (!fs || !rutas) return

  try {
    const estructura: Record<string, Invitado[]> = {}
    for (const [eventoId, mapa] of confirmacionesCache.entries()) {
      estructura[eventoId] = Array.from(mapa.values())
    }
    fs.writeFileSync(rutas.invitados, JSON.stringify(estructura, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[ServidorAlmacen] Error guardando invitados en disco:', err)
  }
}

function persistirConfiguracionEnDisco(): void {
  const fs = obtenerFs()
  const rutas = obtenerRutasArchivos()
  if (!fs || !rutas) return

  try {
    const config = globalThis.__tarjeton_configuracion_cache || CONFIGURACION_DEFAULT
    fs.writeFileSync(rutas.configuracion, JSON.stringify(config, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[ServidorAlmacen] Error guardando configuración en disco:', err)
  }
}

// Carga inicial en el servidor una única vez
if (typeof window === 'undefined' && !globalThis.__tarjeton_disco_cargado) {
  cargarDesdeDisco()
  globalThis.__tarjeton_disco_cargado = true
}

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
    persistirEventosEnDisco()
  },

  obtenerEventoPorSlug(slug: string): DetalleEvento | null {
    if (!slug) return null
    let ev = eventosCache.get(`slug:${slug}`) || null
    if (!ev && typeof window === 'undefined') {
      cargarDesdeDisco()
      ev = eventosCache.get(`slug:${slug}`) || null
    }
    return ev
  },

  obtenerEventoPorToken(token: string): DetalleEvento | null {
    if (!token) return null
    let ev = eventosCache.get(`token:${token}`) || null
    if (!ev && typeof window === 'undefined') {
      cargarDesdeDisco()
      ev = eventosCache.get(`token:${token}`) || null
    }
    return ev
  },

  obtenerEventoPorId(id: string): DetalleEvento | null {
    if (!id) return null
    let ev = eventosCache.get(id) || null
    if (!ev && typeof window === 'undefined') {
      cargarDesdeDisco()
      ev = eventosCache.get(id) || null
    }
    return ev
  },

  eliminarEvento(id: string): void {
    if (!id) return
    const ev = eventosCache.get(id)
    if (ev) {
      if (ev.slugPublico) eventosCache.delete(`slug:${ev.slugPublico}`)
      if (ev.tokenAdmin) eventosCache.delete(`token:${ev.tokenAdmin}`)
      eventosCache.delete(id)
    }
    confirmacionesCache.delete(id)
    persistirEventosEnDisco()
    persistirInvitadosEnDisco()
  },

  obtenerEventosPorRango(desde?: string, hasta?: string, busqueda?: string): DetalleEvento[] {
    if (typeof window === 'undefined') {
      cargarDesdeDisco()
    }
    const lista: DetalleEvento[] = []
    const tiempoDesde = desde ? new Date(desde).getTime() : 0
    const tiempoHasta = hasta
      ? new Date(hasta.includes('T') ? hasta : `${hasta}T23:59:59.999Z`).getTime()
      : Infinity
    const q = busqueda ? busqueda.toLowerCase().trim() : ''

    for (const [key, ev] of eventosCache.entries()) {
      if (!key.startsWith('slug:') && !key.startsWith('token:')) {
        const fechaEv = ev.fechaEvento ? new Date(ev.fechaEvento).getTime() : 0
        const cumpleRango = fechaEv >= tiempoDesde && fechaEv <= tiempoHasta
        const cumpleBusqueda =
          !q ||
          ev.titulo?.toLowerCase().includes(q) ||
          ev.anfitriones?.toLowerCase().includes(q) ||
          ev.slugPublico?.toLowerCase().includes(q)

        if (cumpleRango && cumpleBusqueda) {
          lista.push(ev)
        }
      }
    }

    return lista.sort((a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime())
  },

  guardarInvitado(eventoId: string, invitado: Invitado): void {
    if (!eventoId || !invitado) return
    let mapa = confirmacionesCache.get(eventoId)
    if (!mapa) {
      mapa = new Map<string, Invitado>()
      confirmacionesCache.set(eventoId, mapa)
    }

    let claveExistente = invitado.id
    for (const [clave, existente] of mapa.entries()) {
      if (
        (invitado.codigoAcceso && existente.codigoAcceso === invitado.codigoAcceso) ||
        (invitado.nombre &&
          existente.nombre &&
          existente.nombre.trim().toLowerCase() === invitado.nombre.trim().toLowerCase())
      ) {
        claveExistente = clave
        break
      }
    }

    const anterior = mapa.get(claveExistente)
    mapa.set(claveExistente, { ...anterior, ...invitado, id: claveExistente, eventoId })
    persistirInvitadosEnDisco()
  },

  obtenerInvitados(eventoId: string): Invitado[] {
    if (!eventoId) return []
    let mapa = confirmacionesCache.get(eventoId)
    if ((!mapa || mapa.size === 0) && typeof window === 'undefined') {
      cargarDesdeDisco()
      mapa = confirmacionesCache.get(eventoId)
    }
    if (!mapa) return []
    return Array.from(mapa.values())
  },

  obtenerConfiguracion(): ConfiguracionGlobal {
    if (typeof window === 'undefined') {
      cargarDesdeDisco()
    }
    return globalThis.__tarjeton_configuracion_cache || CONFIGURACION_DEFAULT
  },

  guardarConfiguracion(config: Partial<ConfiguracionGlobal>): ConfiguracionGlobal {
    const actual = this.obtenerConfiguracion()
    const nueva: ConfiguracionGlobal = {
      ...actual,
      ...config,
      ultimaActualizacion: new Date().toISOString(),
    }
    globalThis.__tarjeton_configuracion_cache = nueva
    persistirConfiguracionEnDisco()
    return nueva
  },
}
