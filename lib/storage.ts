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
 * Capa de abstracción de datos (Patrón Repositorio).
 * Funciona de manera híbrida: persistencia local inmediata, caché en memoria de servidor
 * y sincronización bidireccional con Supabase PostgreSQL.
 */
export const EventoRepositorio = {
  /**
   * Obtener todos los eventos guardados en local
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
   * Obtener evento por token de administración secreto (Síncrono - Local)
   */
  obtenerPorTokenAdmin(tokenAdmin: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.tokenAdmin === tokenAdmin) || ServidorAlmacen.obtenerEventoPorToken(tokenAdmin) || null
  },

  /**
   * Obtener evento por token de administración secreto (Asíncrono - Supabase / Servidor / Local)
   */
  async obtenerPorTokenAdminAsync(tokenAdmin: string): Promise<DetalleEvento | null> {
    const enMemoria = ServidorAlmacen.obtenerEventoPorToken(tokenAdmin)
    if (enMemoria) return enMemoria

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('token_admin', tokenAdmin)
          .maybeSingle()
        if (data && !error) {
          const eventoMapeado = mapearEventoDesdeDb(data)
          ServidorAlmacen.guardarEvento(eventoMapeado)
          return eventoMapeado
        }
      }
    } catch (e) {
      console.warn('Error consultando evento por token en Supabase:', e)
    }

    // Intentar consultar API del servidor si estamos en el navegador
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/eventos?token=${encodeURIComponent(tokenAdmin)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.evento) {
            ServidorAlmacen.guardarEvento(data.evento)
            return data.evento
          }
        }
      } catch {}
    }

    return this.obtenerPorTokenAdmin(tokenAdmin)
  },

  /**
   * Obtener evento por slug público (Síncrono - Local)
   */
  obtenerPorSlug(slugPublico: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.slugPublico === slugPublico) || ServidorAlmacen.obtenerEventoPorSlug(slugPublico) || null
  },

  /**
   * Obtener evento por slug público (Asíncrono - Supabase / Servidor / Local)
   */
  async obtenerPorSlugAsync(slugPublico: string): Promise<DetalleEvento | null> {
    const enMemoria = ServidorAlmacen.obtenerEventoPorSlug(slugPublico)
    if (enMemoria) return enMemoria

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('slug_publico', slugPublico)
          .maybeSingle()
        if (data && !error) {
          const eventoMapeado = mapearEventoDesdeDb(data)
          ServidorAlmacen.guardarEvento(eventoMapeado)
          return eventoMapeado
        }
      }
    } catch (e) {
      console.warn('Error consultando evento por slug en Supabase:', e)
    }

    // Intentar consultar API del servidor si estamos en el navegador
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/eventos?slug=${encodeURIComponent(slugPublico)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.evento) {
            ServidorAlmacen.guardarEvento(data.evento)
            return data.evento
          }
        }
      } catch {}
    }

    return this.obtenerPorSlug(slugPublico)
  },

  /**
   * Guardar o actualizar un evento síncronamente (con sincronización en segundo plano)
   */
  guardar(evento: DetalleEvento): DetalleEvento {
    // 1. Guardar en memoria de servidor para disponibilidad inmediata
    ServidorAlmacen.guardarEvento(evento)

    // 2. Guardar en navegador protegiendo contra límite de cuota (QuotaExceededError)
    if (typeof window !== 'undefined') {
      try {
        const eventos = this.obtenerTodos().filter((e) => e.id !== evento.id)
        eventos.push(evento)
        localStorage.setItem(LOCAL_STORAGE_KEY_EVENTOS, JSON.stringify(eventos))
      } catch (e) {
        console.warn('Advertencia guardando en localStorage:', e)
      }

      // Sincronización en segundo plano con la API del servidor
      fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento),
      }).catch((e) => console.warn('Aviso sincronizando con /api/eventos:', e))
    }

    // 3. Sincronización directa con base de datos Supabase PostgreSQL
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase
          .from('eventos')
          .upsert({
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
            es_premium: Boolean(evento.esPremium),
            configuracion_visual: evento.configuracionVisual || {},
            secciones: evento.secciones || [],
            expira_en: evento.expiraEn,
          })
          .then(({ error }) => {
            if (error) console.error('Error sincronizando evento con Supabase:', error)
          })
      }
    } catch (err) {
      console.error('Error en conexión Supabase:', err)
    }

    return evento
  },

  /**
   * Guardar o actualizar un evento de manera ASÍNCRONA.
   * Espera la confirmación del servidor para garantizar que la invitación exista
   * en la nube antes de que el usuario comparta el enlace o lo abra en el celular.
   */
  async guardarAsync(evento: DetalleEvento): Promise<DetalleEvento> {
    // 1. Guardar local y en memoria
    this.guardar(evento)

    // 2. Esperar confirmación de la API del servidor
    if (typeof window !== 'undefined') {
      try {
        const respuesta = await fetch('/api/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evento),
        })
        if (!respuesta.ok) {
          console.warn('La API de eventos respondió con estado no exitoso:', respuesta.status)
        }
      } catch (err) {
        console.error('Error esperando persistencia en /api/eventos:', err)
      }
    }

    return evento
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
    invitadoData: Omit<Invitado, 'id' | 'codigoAcceso'>
  ): { exito: boolean; invitado?: Invitado; error?: string } {
    const invitadosActuales = this.obtenerPorEvento(evento.id)

    // Regla de negocio: Límite gratuito de 50 invitados
    if (!evento.esPremium && invitadosActuales.length >= LIMITE_INVITADOS_GRATIS) {
      return {
        exito: false,
        error: `Has alcanzado el límite de ${LIMITE_INVITADOS_GRATIS} invitados gratuitos. Pasa al plan ilimitado para agregar más.`,
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

      // Sincronizar en segundo plano con la API del servidor
      fetch('/api/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId: evento.id, invitado: nuevoInvitado }),
      }).catch((e) => console.warn('Aviso sincronizando con /api/invitados:', e))
    }

    // 3. Sincronizar con Supabase si está disponible
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase
          .from('invitados')
          .insert({
            id: nuevoInvitado.id,
            evento_id: nuevoInvitado.eventoId,
            nombre: nuevoInvitado.nombre,
            pases: nuevoInvitado.pases,
            es_plural: nuevoInvitado.esPlural,
            telefono: nuevoInvitado.telefono,
            codigo_acceso: nuevoInvitado.codigoAcceso,
            confirmado: false,
          })
          .then()
      }
    } catch {}

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
    }
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

    // 3. Sincronizar con Supabase si está disponible
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase && invitadoActualizado.eventoId && invitadoActualizado.eventoId !== 'demo') {
        supabase
          .from('invitados')
          .upsert({
            id: invitadoActualizado.id,
            evento_id: invitadoActualizado.eventoId,
            nombre: invitadoActualizado.nombre,
            pases: invitadoActualizado.pases,
            es_plural: invitadoActualizado.esPlural,
            telefono: invitadoActualizado.telefono,
            codigo_acceso: invitadoActualizado.codigoAcceso,
            confirmado: invitadoActualizado.confirmado,
            fecha_confirmacion: invitadoActualizado.fechaConfirmacion,
          })
          .then()
      }
    } catch {}

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

  eliminar(id: string): void {
    if (typeof window !== 'undefined') {
      const todos = this.obtenerTodos().filter((i) => i.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
      window.dispatchEvent(
        new CustomEvent('tarjeton_invitados_actualizados', {
          detail: { idEliminado: id },
        })
      )
    }

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase.from('invitados').delete().eq('id', id).then()
      }
    } catch {}
  },
}
