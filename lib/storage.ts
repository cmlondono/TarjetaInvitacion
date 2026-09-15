import { DetalleEvento, Invitado, LIMITE_INVITADOS_GRATIS } from '@/types/invitation'
import { obtenerClienteSupabase } from './supabase'

const LOCAL_STORAGE_KEY_EVENTOS = 'plataforma_invitaciones_eventos'
const LOCAL_STORAGE_KEY_INVITADOS = 'plataforma_invitaciones_invitados'

/**
 * Capa de abstracción de datos (Patrón Repositorio).
 * Funciona de manera híbrida: persistencia local inmediata y sincronización con Supabase PostgreSQL en producción.
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
   * Obtener evento por token de administración secreto
   */
  obtenerPorTokenAdmin(tokenAdmin: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.tokenAdmin === tokenAdmin) || null
  },

  /**
   * Obtener evento por slug público (para invitados)
   */
  obtenerPorSlug(slugPublico: string): DetalleEvento | null {
    const eventos = this.obtenerTodos()
    return eventos.find((e) => e.slugPublico === slugPublico) || null
  },

  /**
   * Guardar o actualizar un evento
   */
  guardar(evento: DetalleEvento): DetalleEvento {
    if (typeof window !== 'undefined') {
      const eventos = this.obtenerTodos().filter((e) => e.id !== evento.id)
      eventos.push(evento)
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTOS, JSON.stringify(eventos))
    }

    // Sincronización asíncrona con base de datos Supabase PostgreSQL si está conectada
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
            subtitulo: evento.subtitulo,
            anfitriones: evento.anfitriones,
            fecha_evento: evento.fechaEvento,
            hora_evento: evento.horaEvento,
            direccion: evento.direccion,
            enlace_mapa: evento.enlaceMapa,
            codigo_vestimenta: evento.codigoVestimenta,
            paleta_vestimenta: evento.paletaVestimenta || [],
            datos_bancarios: evento.datosBancarios || {},
            whatsapp_numero: evento.whatsappNumero,
            whatsapp_plantilla: evento.whatsappPlantilla,
            fotos_galeria: evento.fotosGaleria || [],
            imagen_portada: evento.imagenPortada,
            imagen_retrato: evento.imagenRetrato,
            es_premium: evento.esPremium,
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
   * Eliminar un evento
   */
  eliminar(id: string): void {
    if (typeof window !== 'undefined') {
      const eventos = this.obtenerTodos().filter((e) => e.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTOS, JSON.stringify(eventos))
    }

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase.from('eventos').delete().eq('id', id).then()
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
    return todos.filter((i) => i.eventoId === eventoId)
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
    }

    if (typeof window !== 'undefined') {
      const todos = this.obtenerTodos()
      todos.push(nuevoInvitado)
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
    }

    // Sincronizar con Supabase si está disponible
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
    const list = this.obtenerPorEvento(eventoId)
    return list.find((i) => i.codigoAcceso === codigoAcceso) || null
  },

  obtenerPorNombre(eventoId: string, nombre: string): Invitado | null {
    const list = this.obtenerPorEvento(eventoId)
    const normalized = nombre.trim().toLowerCase()
    return list.find((i) => i.nombre.trim().toLowerCase() === normalized) || null
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

    if (identificador.codigoAcceso) {
      index = todos.findIndex(
        (i) => i.eventoId === eventoId && i.codigoAcceso === identificador.codigoAcceso
      )
    }
    if (index === -1 && identificador.id) {
      index = todos.findIndex((i) => i.id === identificador.id)
    }
    if (index === -1 && identificador.nombre) {
      const norm = identificador.nombre.trim().toLowerCase()
      index = todos.findIndex(
        (i) => i.eventoId === eventoId && i.nombre.trim().toLowerCase() === norm
      )
    }

    const ahora = new Date().toISOString()
    let invitadoActualizado: Invitado

    if (index !== -1) {
      const anterior = todos[index]
      invitadoActualizado = {
        ...anterior,
        confirmado: datos.estadoConfirmacion === 'confirmado',
        estadoConfirmacion: datos.estadoConfirmacion,
        cuposConfirmados:
          datos.cuposConfirmados !== undefined
            ? datos.cuposConfirmados
            : datos.estadoConfirmacion === 'confirmado'
            ? anterior.pases
            : 0,
        mensajeConfirmacion: datos.mensajeConfirmacion || anterior.mensajeConfirmacion,
        fechaConfirmacion: ahora,
      }
      todos[index] = invitadoActualizado
    } else {
      // Si el invitado confirma por enlace público abierto sin pase precargado
      invitadoActualizado = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2),
        eventoId,
        nombre: identificador.nombre || 'Invitado Confirmado',
        pases: datos.cuposConfirmados || 1,
        cuposConfirmados: datos.cuposConfirmados || 1,
        esPlural: (datos.cuposConfirmados || 1) > 1,
        codigoAcceso: Math.random().toString(36).substring(2, 8),
        confirmado: datos.estadoConfirmacion === 'confirmado',
        estadoConfirmacion: datos.estadoConfirmacion,
        mensajeConfirmacion: datos.mensajeConfirmacion,
        fechaConfirmacion: ahora,
      }
      todos.push(invitadoActualizado)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
    }

    // Sincronizar con Supabase si está disponible
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
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

  eliminar(id: string): void {
    if (typeof window !== 'undefined') {
      const todos = this.obtenerTodos().filter((i) => i.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY_INVITADOS, JSON.stringify(todos))
    }

    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
        supabase.from('invitados').delete().eq('id', id).then()
      }
    } catch {}
  },
}
