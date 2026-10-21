import { DetalleEvento, Invitado, LIMITE_INVITADOS_GRATIS } from '@/types/invitation'
import { obtenerClienteSupabase } from './supabase'
import { ServidorAlmacen } from './server-storage'

const LOCAL_STORAGE_KEY_EVENTOS = 'plataforma_invitaciones_eventos'
const LOCAL_STORAGE_KEY_INVITADOS = 'plataforma_invitaciones_invitados'

/**
 * Convierte una fila de la base de datos Supabase al tipo DetalleEvento
 */
export function mapearEventoDesdeDb(fila: any): DetalleEvento {
  const secciones = Array.isArray(fila.secciones) ? fila.secciones : []
  const cabeceraSec = secciones.find((s: any) => s.tipo === 'cabecera')

  const imagenPortada = fila.imagen_portada || cabeceraSec?.datos?.imagenPortada || undefined
  const imagenRetrato = fila.imagen_retrato || cabeceraSec?.datos?.imagenRetrato || undefined
  const mostrarFotoRetrato =
    fila.mostrar_foto_retrato !== undefined
      ? fila.mostrar_foto_retrato
      : cabeceraSec?.datos?.mostrarFotoRetrato !== undefined
      ? cabeceraSec.datos.mostrarFotoRetrato
      : true
  const mostrarBadge =
    fila.mostrar_badge !== undefined
      ? fila.mostrar_badge
      : cabeceraSec?.datos?.mostrarBadge !== undefined
      ? cabeceraSec.datos.mostrarBadge
      : true
  const textoBadge = fila.texto_badge || cabeceraSec?.datos?.textoBadge || undefined

  return {
    id: fila.id,
    tokenAdmin: fila.token_admin,
    slugPublico: fila.slug_publico,
    tipoEvento: fila.tipo_evento,
    titulo: fila.titulo,
    subtitulo: fila.subtitulo || undefined,
    anfitriones: fila.anfitriones,
    fechaEvento: fila.fecha_evento,
    horaEvento: fila.hora_evento || '',
    direccion: fila.direccion,
    enlaceMapa: fila.enlace_mapa || '',
    codigoVestimenta: fila.codigo_vestimenta || undefined,
    paletaVestimenta: fila.paleta_vestimenta || [],
    datosBancarios: fila.datos_bancarios || undefined,
    whatsappNumero: fila.whatsapp_numero,
    whatsappPlantilla: fila.whatsapp_plantilla,
    fotosGaleria: fila.fotos_galeria || [],
    imagenPortada,
    imagenRetrato,
    mostrarFotoRetrato,
    mostrarBadge,
    textoBadge,
    esPremium: fila.es_premium || false,
    limiteGratisInvitados:
      fila.limite_gratis_invitados !== undefined && fila.limite_gratis_invitados !== null
        ? Number(fila.limite_gratis_invitados)
        : fila.configuracion_visual?.limiteGratisInvitados !== undefined &&
          fila.configuracion_visual?.limiteGratisInvitados !== null
        ? Number(fila.configuracion_visual.limiteGratisInvitados)
        : 50,
    creadoEn: fila.creado_en,
    expiraEn: fila.expira_en,
    configuracionVisual: fila.configuracion_visual || undefined,
    secciones,
    metodoConfirmacion: fila.metodo_confirmacion || undefined,
  }
}

/**
 * Convierte una fila de la base de datos Supabase al tipo Invitado
 */
export function mapearInvitadoDesdeDb(fila: any): Invitado {
  return {
    id: fila.id,
    eventoId: fila.evento_id,
    nombre: fila.nombre,
    pases: fila.pases || 1,
    esPlural: fila.es_plural || false,
    telefono: fila.telefono || undefined,
    codigoAcceso: fila.codigo_acceso,
    confirmado: fila.confirmado || false,
    estadoConfirmacion: fila.estado_confirmacion || (fila.confirmado ? 'confirmado' : 'pendiente'),
    cuposConfirmados:
      fila.cupos_confirmados !== undefined && fila.cupos_confirmados !== null
        ? fila.cupos_confirmados
        : fila.confirmado
        ? fila.pases || 1
        : 0,
    mensajeConfirmacion: fila.mensaje_confirmacion || undefined,
    fechaConfirmacion: fila.fecha_confirmacion || undefined,
    enviadoPorWhatsApp: Boolean(fila.enviado_por_whatsapp),
    fechaEnvioWhatsApp: fila.fecha_envio_whatsapp || undefined,
  }
}

/**
 * Convierte un DetalleEvento a la fila de la tabla `eventos` de Supabase.
 * Toda la edición visual (secciones, elementos libres, estilos por texto) viaja en
 * las columnas JSONB `secciones` y `configuracion_visual`.
 */
export function mapearEventoAFila(evento: DetalleEvento) {
  return {
    id: evento.id,
    token_admin: evento.tokenAdmin,
    slug_publico: evento.slugPublico,
    tipo_evento: evento.tipoEvento,
    titulo: evento.titulo,
    subtitulo: evento.subtitulo || null,
    anfitriones: evento.anfitriones,
    fecha_evento: evento.fechaEvento,
    hora_evento: evento.horaEvento || '',
    direccion: evento.direccion,
    enlace_mapa: evento.enlaceMapa || '',
    codigo_vestimenta: evento.codigoVestimenta || null,
    paleta_vestimenta: evento.paletaVestimenta || [],
    datos_bancarios: evento.datosBancarios || {},
    whatsapp_numero: evento.whatsappNumero,
    whatsapp_plantilla: evento.whatsappPlantilla,
    fotos_galeria: evento.fotosGaleria || [],
    imagen_portada: evento.imagenPortada || null,
    imagen_retrato: evento.imagenRetrato || null,
    mostrar_foto_retrato: evento.mostrarFotoRetrato !== false,
    mostrar_badge: evento.mostrarBadge !== false,
    texto_badge: evento.textoBadge || null,
    es_premium: Boolean(evento.esPremium),
    configuracion_visual: {
      ...(evento.configuracionVisual || {}),
      limiteGratisInvitados:
        evento.limiteGratisInvitados ||
        (evento.configuracionVisual as any)?.limiteGratisInvitados ||
        50,
    },
    secciones: evento.secciones || [],
    metodo_confirmacion: evento.metodoConfirmacion || 'tarjeton',
    expira_en: evento.expiraEn,
  }
}

/**
 * Versión pública de un evento: nunca expone el token de administración a los invitados.
 */
export function limpiarEventoPublico(evento: DetalleEvento): DetalleEvento {
  return { ...evento, tokenAdmin: '' }
}

function guardarCacheLocal(evento: DetalleEvento): void {
  if (typeof window === 'undefined') return
  try {
    const eventos = EventoRepositorio.obtenerTodos().filter((e) => e.id !== evento.id)
    eventos.push(evento)
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTOS, JSON.stringify(eventos))
  } catch (e) {
    console.warn('Advertencia guardando caché en localStorage:', e)
  }
}

/**
 * Consulta un evento en Supabase.
 * `respondio` = la base de datos contestó (aunque no exista): en ese caso no se usa la caché local,
 * para no servir copias de eventos borrados o desactualizados.
 */
async function consultarSupabase(
  columna: 'token_admin' | 'slug_publico',
  valor: string
): Promise<{ evento: DetalleEvento | null; respondio: boolean }> {
  const supabase = obtenerClienteSupabase()
  if (!supabase) return { evento: null, respondio: false }
  const { data, error } = await supabase.from('eventos').select('*').eq(columna, valor).maybeSingle()
  if (error) {
    console.warn(`Error consultando evento por ${columna} en Supabase:`, error.message)
    return { evento: null, respondio: false }
  }
  return { evento: data ? mapearEventoDesdeDb(data) : null, respondio: true }
}

/**
 * Capa de abstracción de datos (Patrón Repositorio).
 * La base de datos (Supabase) es la fuente de verdad: las lecturas la consultan primero
 * y todas las escrituras pasan por /api/eventos, que valida y persiste en el servidor.
 * localStorage solo es una caché del dispositivo del anfitrión, nunca la fuente de verdad.
 */
export const EventoRepositorio = {
  /**
   * Obtener todos los eventos en caché local del navegador
   */
  obtenerTodos(): DetalleEvento[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTOS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  /**
   * Obtener evento por token desde la caché local (sin red). Solo como respaldo.
   */
  obtenerPorTokenAdmin(tokenAdmin: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.tokenAdmin === tokenAdmin) || ServidorAlmacen.obtenerEventoPorToken(tokenAdmin) || null
  },

  /**
   * Obtener evento por token de administración: base de datos primero, caché como respaldo.
   */
  async obtenerPorTokenAdminAsync(tokenAdmin: string): Promise<DetalleEvento | null> {
    if (typeof window === 'undefined') {
      try {
        const { evento: desdeDb, respondio } = await consultarSupabase('token_admin', tokenAdmin)
        if (desdeDb) {
          ServidorAlmacen.guardarEvento(desdeDb)
          return desdeDb
        }
        if (respondio) return null
      } catch (e) {
        console.warn('Error consultando evento por token:', e)
      }
      return ServidorAlmacen.obtenerEventoPorToken(tokenAdmin)
    }

    try {
      const res = await fetch(`/api/eventos?token=${encodeURIComponent(tokenAdmin)}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data?.evento) {
          guardarCacheLocal(data.evento)
          return data.evento
        }
      }
      if (res.status === 404) return null
    } catch {}

    // Sin conexión con el servidor: usar la última copia conocida del dispositivo
    return this.obtenerPorTokenAdmin(tokenAdmin)
  },

  /**
   * Obtener evento por slug desde la caché local (sin red). Solo como respaldo.
   */
  obtenerPorSlug(slugPublico: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.slugPublico === slugPublico) || ServidorAlmacen.obtenerEventoPorSlug(slugPublico) || null
  },

  /**
   * Obtener evento por slug público: base de datos primero, caché como respaldo.
   * En el servidor se usa para el SSR de /i/[slug].
   */
  async obtenerPorSlugAsync(slugPublico: string): Promise<DetalleEvento | null> {
    if (typeof window === 'undefined') {
      try {
        const { evento: desdeDb, respondio } = await consultarSupabase('slug_publico', slugPublico)
        if (desdeDb) {
          ServidorAlmacen.guardarEvento(desdeDb)
          return desdeDb
        }
        if (respondio) return null
      } catch (e) {
        console.warn('Error consultando evento por slug:', e)
      }
      return ServidorAlmacen.obtenerEventoPorSlug(slugPublico)
    }

    try {
      const res = await fetch(`/api/eventos?slug=${encodeURIComponent(slugPublico)}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data?.evento) return data.evento
      }
    } catch {}

    return null
  },

  /**
   * Guardar un evento sin esperar la respuesta (sincronización en segundo plano).
   */
  guardar(evento: DetalleEvento): DetalleEvento {
    if (typeof window === 'undefined') {
      ServidorAlmacen.guardarEvento(evento)
      const supabase = obtenerClienteSupabase()
      supabase
        ?.from('eventos')
        .upsert(mapearEventoAFila(evento))
        .then(({ error }) => {
          if (error) console.error('Error sincronizando evento con Supabase:', error.message)
        })
      return evento
    }

    guardarCacheLocal(evento)
    fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento),
    }).catch((e) => console.warn('Aviso sincronizando con /api/eventos:', e))

    return evento
  },

  /**
   * Guardar un evento esperando la confirmación de la base de datos.
   * Lanza un error si el servidor no pudo persistirlo, para que la interfaz lo informe.
   */
  async guardarAsync(evento: DetalleEvento): Promise<DetalleEvento> {
    if (typeof window === 'undefined') {
      this.guardar(evento)
      return evento
    }

    const respuesta = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento),
    })
    const resultado = await respuesta.json().catch(() => null)
    if (!respuesta.ok || !resultado?.ok) {
      throw new Error(resultado?.error || `No se pudo guardar la invitación (HTTP ${respuesta.status})`)
    }

    const eventoPersistido: DetalleEvento = resultado.evento || evento
    guardarCacheLocal(eventoPersistido)
    return eventoPersistido
  },

  /**
   * Eliminar un evento
   */
  eliminar(id: string): void {
    // 1. Limpiar memoria global del servidor
    ServidorAlmacen.eliminarEvento(id)

    // 2. Limpiar almacenamiento del navegador
    if (typeof window !== 'undefined') {
      const eventos = this.obtenerTodos().filter((e) => e.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTOS, JSON.stringify(eventos))
      const invitados = InvitadoRepositorio.obtenerTodos().filter((i) => i.eventoId !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(invitados))
    }

    // 3. Limpieza en cascada en Supabase PostgreSQL
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase.from('invitados').delete().eq('evento_id', id).then(() => {
          supabase.from('eventos').delete().eq('id', id).then()
        })
      }
    } catch {}
  },
}

export const InvitadoRepositorio = {
  obtenerTodos(): Invitado[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY_INVITADOS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  obtenerPorEvento(eventoId: string): Invitado[] {
    const todos = this.obtenerTodos()
    const locales = todos.filter((i) => i.eventoId === eventoId)
    const enMemoria = ServidorAlmacen.obtenerInvitados(eventoId)

    if (enMemoria.length === 0) return locales

    // Fusionar con memoria si hay elementos más recientes
    const mapa = new Map<string, Invitado>()
    locales.forEach((inv) => mapa.set(inv.id, inv))
    enMemoria.forEach((inv) => {
      const local = mapa.get(inv.id)
      mapa.set(inv.id, { ...local, ...inv })
    })

    return Array.from(mapa.values())
  },

  /**
   * Consulta asíncrona de invitados combinando Supabase, memoria del servidor y local
   */
  async obtenerPorEventoAsync(eventoId: string): Promise<Invitado[]> {
    const listaLocales = this.obtenerPorEvento(eventoId)
    const mapa = new Map<string, Invitado>()
    listaLocales.forEach((inv) => mapa.set(inv.id, inv))

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        const { data, error } = await supabase
          .from('invitados')
          .select('*')
          .eq('evento_id', eventoId)
          .order('creado_en', { ascending: false })

        if (data && !error && data.length > 0) {
          data.forEach((fila: any) => {
            const mapeado = mapearInvitadoDesdeDb(fila)
            const local = mapa.get(mapeado.id)
            mapa.set(mapeado.id, { ...local, ...mapeado })
          })
        }
      }
    } catch (e) {
      console.warn('Error consultando invitados en Supabase:', e)
    }

    return Array.from(mapa.values())
  },

  /**
   * Agrega un invitado verificando la regla de negocio del límite gratuito
   */
  agregar(
    evento: DetalleEvento,
    invitadoData: Omit<Invitado, 'id' | 'codigoAcceso'>,
    limiteMaximoPersonalizado?: number
  ): {
    exito: boolean
    invitado?: Invitado
    error?: string
    /** Guardado en la base de datos: null si quedó guardado, o el mensaje de error */
    guardado?: Promise<string | null>
  } {
    const invitadosActuales = this.obtenerPorEvento(evento.id)

    // Regla de negocio inmutable:
    // El límite gratuito es el fijado para ESTE evento específico al momento de su creación (o por el Super Admin).
    // Si el evento fue creado cuando el sistema daba 50, se respeta 50 para siempre.
    // Si fue creado cuando daba 20, se respeta 20.
    const limiteMaximo =
      limiteMaximoPersonalizado ||
      evento.limiteGratisInvitados ||
      (evento.configuracionVisual as any)?.limiteGratisInvitados ||
      50

    if (!evento.esPremium && invitadosActuales.length >= limiteMaximo) {
      return {
        exito: false,
        error: `Has alcanzado el límite de ${limiteMaximo} invitados gratuitos concedidos a tu evento. Pasa al plan ilimitado para agregar más.`,
      }
    }

    const nuevoInvitado: Invitado = {
      ...invitadoData,
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2),
      codigoAcceso: Math.random().toString(36).substring(2, 8),
      confirmado: false,
      estadoConfirmacion: 'pendiente',
      enviadoPorWhatsApp: false,
    }

    // 1. Guardar en memoria de servidor
    ServidorAlmacen.guardarInvitado(evento.id, nuevoInvitado)

    // 2. Guardar en almacenamiento del navegador y sincronizar con servidor
    if (typeof window !== 'undefined') {
      try {
        const todos = this.obtenerTodos()
        todos.push(nuevoInvitado)
        localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
      } catch (err) {
        console.warn('Advertencia guardando invitados en localStorage:', err)
      }

      // La base de datos es la fuente de verdad: sin ella el enlace del invitado no funciona en otros teléfonos
      const guardado = fetch('/api/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId: evento.id, tokenAdmin: evento.tokenAdmin, invitado: nuevoInvitado }),
      })
        .then(async (res) => (res.ok ? null : (await res.json().catch(() => null))?.error || 'No se pudo guardar el invitado en la base de datos.'))
        .catch(() => 'Sin conexión: el invitado no se guardó en la base de datos.')
      return { exito: true, invitado: nuevoInvitado, guardado }
    }

    return { exito: true, invitado: nuevoInvitado }
  },

  obtenerPorCodigoAcceso(eventoId: string, codigoAcceso: string): Invitado | null {
    const list = this.obtenerTodos()
    // Buscar primero con coincidencia de eventoId, o de forma global si eventoId es genérico
    return (
      list.find(
        (i) => (i.eventoId === eventoId || !eventoId || eventoId === 'demo') && i.codigoAcceso === codigoAcceso
      ) ||
      list.find((i) => i.codigoAcceso === codigoAcceso) ||
      null
    )
  },

  obtenerPorNombre(eventoId: string, nombre: string): Invitado | null {
    const list = this.obtenerTodos()
    const normalized = nombre.trim().toLowerCase()
    return (
      list.find(
        (i) =>
          (i.eventoId === eventoId || !eventoId || eventoId === 'demo') &&
          i.nombre.trim().toLowerCase() === normalized
      ) ||
      list.find((i) => i.nombre.trim().toLowerCase() === normalized) ||
      null
    )
  },

  actualizarConfirmacion(
    eventoId: string,
    identificador: { id?: string; codigoAcceso?: string; nombre?: string },
    datos: {
      estadoConfirmacion: 'confirmado' | 'no_asiste'
      cuposConfirmados?: number
      mensajeConfirmacion?: string
    },
    opciones: { enviarAlServidor?: boolean } = {}
  ): { exito: boolean; invitado?: Invitado } {
    const todos = this.obtenerTodos()
    let index = -1

    if (identificador.codigoAcceso && identificador.codigoAcceso !== 'token') {
      index = todos.findIndex(
        (i) =>
          i.codigoAcceso === identificador.codigoAcceso &&
          (i.eventoId === eventoId || !eventoId || eventoId === 'demo')
      )
      if (index === -1) {
        index = todos.findIndex((i) => i.codigoAcceso === identificador.codigoAcceso)
      }
    }
    if (index === -1 && identificador.id && identificador.id !== 'inv-temp') {
      index = todos.findIndex((i) => i.id === identificador.id)
    }
    if (index === -1 && identificador.nombre) {
      const norm = identificador.nombre.trim().toLowerCase()
      index = todos.findIndex(
        (i) =>
          (i.eventoId === eventoId || !eventoId || eventoId === 'demo') &&
          i.nombre.trim().toLowerCase() === norm
      )
      if (index === -1) {
        index = todos.findIndex((i) => i.nombre.trim().toLowerCase() === norm)
      }
    }

    const ahora = new Date().toISOString()
    let invitadoActualizado: Invitado

    if (index !== -1) {
      const anterior = todos[index]
      const targetEventoId = anterior.eventoId && anterior.eventoId !== 'demo' ? anterior.eventoId : eventoId

      invitadoActualizado = {
        ...anterior,
        eventoId: targetEventoId,
        confirmado: datos.estadoConfirmacion === 'confirmado',
        estadoConfirmacion: datos.estadoConfirmacion,
        cuposConfirmados:
          datos.cuposConfirmados !== undefined
            ? datos.cuposConfirmados
            : datos.estadoConfirmacion === 'confirmado'
            ? anterior.pases || 1
            : 0,
        mensajeConfirmacion: datos.mensajeConfirmacion || anterior.mensajeConfirmacion,
        fechaConfirmacion: ahora,
      }
      todos[index] = invitadoActualizado
    } else {
      // Si el invitado confirma por enlace público abierto sin pase precargado
      invitadoActualizado = {
        id:
          identificador.id && identificador.id !== 'inv-temp'
            ? identificador.id
            : typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2),
        eventoId,
        nombre: identificador.nombre || 'Invitado Confirmado',
        pases: datos.cuposConfirmados || 1,
        cuposConfirmados: datos.cuposConfirmados || 1,
        esPlural: (datos.cuposConfirmados || 1) > 1,
        codigoAcceso: identificador.codigoAcceso && identificador.codigoAcceso !== 'token' ? identificador.codigoAcceso : Math.random().toString(36).substring(2, 8),
        confirmado: datos.estadoConfirmacion === 'confirmado',
        estadoConfirmacion: datos.estadoConfirmacion,
        mensajeConfirmacion: datos.mensajeConfirmacion,
        fechaConfirmacion: ahora,
      }
      todos.push(invitadoActualizado)
    }

    // 1. Guardar en memoria del servidor
    ServidorAlmacen.guardarInvitado(invitadoActualizado.eventoId, invitadoActualizado)

    // 2. Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
      // Notificar a otras pestañas y componentes abiertos en el mismo navegador
      window.dispatchEvent(
        new CustomEvent('tarjeton_invitados_actualizados', {
          detail: { eventoId: invitadoActualizado.eventoId, invitado: invitadoActualizado },
        })
      )
    }

    // 3. Persistir en la base de datos a través del servidor, que solo actualiza la respuesta
    //    (estado, cupos, mensaje) y nunca modifica los pases asignados por el anfitrión.
    if (
      opciones.enviarAlServidor !== false &&
      typeof window !== 'undefined' &&
      invitadoActualizado.eventoId &&
      invitadoActualizado.eventoId !== 'demo'
    ) {
      fetch('/api/invitados/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: invitadoActualizado.eventoId,
          id: invitadoActualizado.id,
          codigoAcceso: invitadoActualizado.codigoAcceso,
          nombre: invitadoActualizado.nombre,
          estadoConfirmacion: datos.estadoConfirmacion,
          cuposConfirmados: invitadoActualizado.cuposConfirmados,
          mensajeConfirmacion: invitadoActualizado.mensajeConfirmacion,
        }),
      }).catch((e) => console.warn('Aviso sincronizando confirmación:', e))
    }

    return { exito: true, invitado: invitadoActualizado }
  },

  marcarEnviadoWhatsApp(
    eventoId: string,
    invitadoId: string,
    enviado = true
  ): { exito: boolean; invitado?: Invitado } {
    const todos = this.obtenerTodos()
    const index = todos.findIndex((i) => i.id === invitadoId)
    if (index === -1) return { exito: false }

    const ahora = new Date().toISOString()
    const actualizado: Invitado = {
      ...todos[index],
      enviadoPorWhatsApp: enviado,
      fechaEnvioWhatsApp: enviado ? ahora : undefined,
    }
    todos[index] = actualizado

    ServidorAlmacen.guardarInvitado(eventoId, actualizado)

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
      window.dispatchEvent(
        new CustomEvent('tarjeton_invitados_actualizados', {
          detail: { invitadoActualizado: actualizado },
        })
      )
    }

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase
          .from('invitados')
          .update({
            enviado_por_whatsapp: enviado,
            fecha_envio_whatsapp: enviado ? ahora : null,
          })
          .eq('id', invitadoId)
          .then()
      }
    } catch {}

    return { exito: true, invitado: actualizado }
  },

  /** Cambia el teléfono de un invitado en este navegador y en la base de datos (solo ese campo) */
  actualizarTelefono(invitadoId: string, telefono: string | undefined): void {
    if (typeof window !== 'undefined') {
      const todos = this.obtenerTodos().map((i) => (i.id === invitadoId ? { ...i, telefono } : i))
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
    }
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase.from('invitados').update({ telefono: telefono || null }).eq('id', invitadoId).then()
      }
    } catch {}
  },

  /**
   * Elimina un pase en la base de datos (a través del servidor, que verifica el token del anfitrión)
   * y solo si se borró allí, también de la copia local. Devuelve el error para mostrarlo, o null.
   */
  async eliminarAsync(evento: Pick<DetalleEvento, 'id' | 'tokenAdmin'>, invitado: Pick<Invitado, 'id' | 'codigoAcceso'>): Promise<string | null> {
    try {
      const res = await fetch('/api/invitados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId: evento.id, tokenAdmin: evento.tokenAdmin, id: invitado.id, codigoAcceso: invitado.codigoAcceso }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.exito) return d.error || 'No se pudo eliminar el invitado.'
    } catch {
      return 'No se pudo eliminar el invitado. Revisa tu conexión.'
    }
    if (typeof window !== 'undefined') {
      const todos = this.obtenerTodos().filter((i) => i.id !== invitado.id && !(invitado.codigoAcceso && i.codigoAcceso === invitado.codigoAcceso))
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
      window.dispatchEvent(new CustomEvent('tarjeton_invitados_actualizados', { detail: { idEliminado: invitado.id } }))
    }
    return null
  },
}
