'use client'

import { createContext, useContext } from 'react'
import type {
  ConfiguracionVisual,
  DetalleEvento,
  ExperienciaInvitado,
  Invitado,
  SeccionModular,
} from '@/types/invitation'
import type { TemaInvitacion } from './tema'

export type ModoInvitacion = 'publico' | 'editor' | 'vista'

export interface EdicionInvitacion {
  /** Campo directo de la sección (titulo, subtitulo) */
  alCampo: (seccionId: string, campo: keyof SeccionModular, valor: unknown) => void
  /** Campo dentro de `datos` de la sección */
  alDato: (seccionId: string, campo: string, valor: unknown) => void
  /** Campo del evento (fecha, dirección, anfitriones...) */
  alEvento: (campo: keyof DetalleEvento, valor: unknown) => void
  /** Agrega un texto libre (listo para escribir) o abre el panel de fotos, stickers y formas para ese bloque */
  agregarElemento?: (seccionId: string, tipo: 'texto' | 'foto' | 'mas') => void
}

export interface ContextoInvitacionValor {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  tema: TemaInvitacion
  experiencia: ExperienciaInvitado
  invitado: Invitado | null
  modo: ModoInvitacion
  /** Se puede escribir directamente sobre la invitación */
  editable: boolean
  edicion?: EdicionInvitacion
  seleccionId?: string | null
  alSeleccionarBloque?: (seccionId: string) => void
  abrirConfirmacion: () => void
  /** Respuesta ya registrada por este invitado (si existe) */
  respuesta: { estado: 'confirmado' | 'no_asiste'; cupos: number } | null
  /** Interacciones del invitado que se guardan en la base de datos (playlist, regalos, votos) */
  interactuar: (seccionId: string, accion: string, datos: Record<string, unknown>) => Promise<SeccionModular | null>
}

const Contexto = createContext<ContextoInvitacionValor | null>(null)

export const ProveedorInvitacion = Contexto.Provider

export function useInvitacion(): ContextoInvitacionValor {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useInvitacion debe usarse dentro de ProveedorInvitacion')
  return valor
}

/** Un invitado "real" (abrió su enlace personal), no el de la vista previa */
export function esInvitadoReal(invitado: Invitado | null | undefined): invitado is Invitado {
  return Boolean(invitado && invitado.id !== 'inv-temp' && invitado.id !== 'preview-invitado' && invitado.nombre)
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** '2027-03-20T17:00:00' → 'Sábado 20 de marzo de 2027' */
export function fechaLarga(iso?: string): string {
  if (!iso) return ''
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const texto = FORMATO_FECHA.format(fecha).replace(',', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function fechaCalendario(fecha: Date): string {
  return fecha.toISOString().replace(/-|:|\.\d{3}/g, '')
}

export function enlaceGoogleCalendar(evento: DetalleEvento): string {
  const inicio = new Date(evento.fechaEvento)
  if (Number.isNaN(inicio.getTime())) return 'https://calendar.google.com'
  const fin = new Date(inicio.getTime() + 5 * 60 * 60 * 1000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${fechaCalendario(inicio)}/${fechaCalendario(fin)}`,
    details: evento.subtitulo || '',
    location: evento.direccion || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function enlacesMapa(lugar?: string, direccion?: string, enlaceMapa?: string, enlaceWaze?: string) {
  const consulta = [lugar, direccion].filter(Boolean).join(', ')
  return {
    maps: enlaceMapa && !/^https?:\/\/maps\.google\.com\/?$/.test(enlaceMapa)
      ? enlaceMapa
      : consulta
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
      : '',
    waze: enlaceWaze || (consulta ? `https://waze.com/ul?q=${encodeURIComponent(consulta)}&navigate=yes` : ''),
  }
}
