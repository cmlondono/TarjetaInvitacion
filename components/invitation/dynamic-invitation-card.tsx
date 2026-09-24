'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import {
  DetalleEvento,
  ConfiguracionVisual,
  Invitado,
  SeccionModular,
  TipoSeccion,
  ElementoItinerario,
} from '@/types/invitation'
import { EventCountdown } from './event-countdown'
import { BackgroundEffects } from './background-effects'
import { construirUrlWhatsApp } from '@/lib/event-utils'
import { generarSeccionesPorDefecto, IMAGENES_CURADAS } from '@/lib/modular-defaults'
import { comprimirImagen } from '@/lib/image-compression'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { ModuloRsvp } from './modulo-rsvp'
import { InlineEditableText } from '@/components/editor/inline-editable-text'
import { DecoracionesTarjeta } from './decoraciones-tarjeta'
import {
  BarraInsercionEntreBloques,
  BarraHerramientasBloque,
} from '@/components/editor/bloque-accion-toolbar'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CreditCard,
  Copy,
  Check,
  CalendarPlus,
  Navigation,
  Phone,
  Quote,
  Building2,
  Music,
  Camera,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'

interface DynamicInvitationCardProps {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  invitado?: Invitado | null
  esModoVistaPrevia?: boolean
  esModoEdicionDirecta?: boolean
  alActualizarSeccion?: (seccionId: string, campo: keyof SeccionModular, valor: any) => void
  alActualizarDatosSeccion?: (seccionId: string, campoDatos: string, valor: any) => void
  alActualizarEvento?: (campo: keyof DetalleEvento, valor: any) => void
  alMoverSeccion?: (indice: number, direccion: 'arriba' | 'abajo') => void
  alEliminarSeccion?: (seccionId: string) => void
  alInsertarSeccionEnIndice?: (indice: number, tipo: TipoSeccion) => void
}

const animacionAparicion = {
  oculto: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

function generarEnlaceGoogleCalendar(evento: DetalleEvento): string {
  try {
    const fecha = new Date(evento.fechaEvento)
    const fechaInicio = fecha.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const fechaFin = new Date(fecha.getTime() + 4 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '')
    const titulo = encodeURIComponent(evento.titulo)
    const detalles = encodeURIComponent(
      `${evento.subtitulo || ''}\nAnfitriones: ${evento.anfitriones}\nSede: ${evento.direccion}`
    )
    const lugar = encodeURIComponent(evento.direccion)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaInicio}/${fechaFin}&details=${detalles}&location=${lugar}`
  } catch {
    return 'https://calendar.google.com'
  }
}

export function DynamicInvitationCard({
  evento,
  visual,
  invitado,
  esModoVistaPrevia = false,
  esModoEdicionDirecta = false,
  alActualizarSeccion,
  alActualizarDatosSeccion,
  alActualizarEvento,
  alMoverSeccion,
  alEliminarSeccion,
  alInsertarSeccionEnIndice,
}: DynamicInvitationCardProps) {
  const [cuentaCopiada, setCuentaCopiada] = useState(false)
  const urlWhatsApp = construirUrlWhatsApp(evento, invitado || undefined)
  const esPlural = invitado ? invitado.esPlural : false
  const nombreInvitado = invitado?.nombre || 'Invitado de Honor'

  const manejarSubidaArchivo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    alCompletar: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const urlComprimida = await comprimirImagen(file)
      alCompletar(urlComprimida)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          alCompletar(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Mapeo tipográfico especializado para tarjetas de invitación
  const claseFuenteTitulo =
    visual.fuenteTitulo === 'greatvibes'
      ? 'font-greatvibes text-4xl sm:text-5xl font-normal tracking-wide'
      : visual.fuenteTitulo === 'alexbrush'
      ? 'font-alexbrush text-3xl sm:text-4xl font-normal tracking-wide'
      : visual.fuenteTitulo === 'parisienne'
      ? 'font-parisienne text-3xl sm:text-4xl font-normal tracking-wide'
      : visual.fuenteTitulo === 'cinzel'
      ? 'font-cinzel uppercase tracking-[0.18em] font-semibold'
      : visual.fuenteTitulo === 'cormorant'
      ? 'font-cormorant italic font-normal tracking-normal'
      : visual.fuenteTitulo === 'playfair'
      ? 'font-playfair font-normal'
      : visual.fuenteTitulo === 'prata'
      ? 'font-prata font-normal tracking-normal'
      : visual.fuenteTitulo === 'lora'
      ? 'font-lora italic font-normal'
      : visual.fuenteTitulo === 'montserrat'
      ? 'font-montserrat font-bold tracking-tight'
      : visual.fuenteTitulo === 'poppins'
      ? 'font-poppins font-semibold tracking-normal'
      : visual.fuenteTitulo === 'dancing'
      ? 'font-dancing text-3xl sm:text-4xl font-normal tracking-wide'
      : 'font-sans font-semibold'

  // Obtener secciones modulares activas y ordenadas
  const listaSecciones: SeccionModular[] = (
    evento.secciones && evento.secciones.length > 0
      ? evento.secciones
      : generarSeccionesPorDefecto(evento)
  )
    .filter((s) => s.visible)
    .sort((a, b) => a.orden - b.orden)

  const copiarCuenta = async (numero: string) => {
    try {
      await navigator.clipboard.writeText(numero)
      setCuentaCopiada(true)
      setTimeout(() => setCuentaCopiada(false), 2000)
    } catch {}
  }

  // Manejo de música de fondo protocolaria
  const [reproduciendoMusica, setReproduciendoMusica] = useState(false)
  const [audioInstancia, setAudioInstancia] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (visual.musicaFondo?.activa && visual.musicaFondo.url) {
      const audio = new Audio(visual.musicaFondo.url)
      audio.loop = true
      audio.volume = 0.4
      setAudioInstancia(audio)

      if (visual.musicaFondo.autoReproducir && !esModoVistaPrevia) {
        audio.play().then(() => setReproduciendoMusica(true)).catch(() => {
          // El navegador bloquea autoplay hasta el primer gesto del usuario
        })
      }

      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [visual.musicaFondo?.url, visual.musicaFondo?.activa, visual.musicaFondo?.autoReproducir, esModoVistaPrevia])

  const alternarMusica = () => {
    if (!audioInstancia && visual.musicaFondo?.url) {
      const audio = new Audio(visual.musicaFondo.url)
      audio.loop = true
      audio.volume = 0.4
      audio.play().then(() => setReproduciendoMusica(true))
      setAudioInstancia(audio)
      return
    }
    if (!audioInstancia) return

    if (reproduciendoMusica) {
      audioInstancia.pause()
      setReproduciendoMusica(false)
    } else {
      audioInstancia.play().then(() => setReproduciendoMusica(true))
    }
  }

  // Siluetas de Tarjeta
  const formaTarjeta = visual.formaTarjeta || 'clasica'
  const claseFormaExterior =
    formaTarjeta === 'arco'
      ? 'rounded-t-[180px] sm:rounded-t-[210px] rounded-b-3xl'
      : formaTarjeta === 'doble_borde'
      ? 'rounded-2xl ring-4 ring-amber-400/20 shadow-2xl'
      : formaTarjeta === 'biselada'
      ? 'rounded-[2.5rem]'
      : 'rounded-2xl'

  const claseFormaInterior =
    formaTarjeta === 'arco'
      ? 'rounded-t-[179px] sm:rounded-t-[209px] rounded-b-3xl'
      : formaTarjeta === 'doble_borde'
      ? 'rounded-xl border-2 border-amber-400/30'
      : formaTarjeta === 'biselada'
      ? 'rounded-[2.4rem]'
      : 'rounded-2xl'

  return (
    <div
      className={`w-full ${
        esModoVistaPrevia ? 'min-h-full py-3 sm:py-6' : 'min-h-screen py-8 sm:py-12'
      } flex flex-col items-center justify-center px-2 sm:px-4 relative overflow-hidden`}
      style={{ backgroundColor: 'var(--color-fondo-live, ' + (visual.colorFondo || '#F8FAFC') + ')' }}
    >
      {/* Micro-textura y efectos sutiles */}
      <BackgroundEffects efecto={visual.efectoFondo} colorAcento={visual.colorSecundario} />

      {/* Botón Flotante de Música de Fondo */}
      {visual.musicaFondo?.activa && visual.musicaFondo.url && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in duration-300">
          <button
            type="button"
            onClick={alternarMusica}
            className={`px-3 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 transition-all cursor-pointer select-none active:scale-95 ${
              reproduciendoMusica
                ? 'bg-slate-900/90 text-white border-slate-400/50 ring-2 ring-slate-400/30'
                : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-white'
            }`}
            title={reproduciendoMusica ? 'Pausar melodía de fondo' : 'Reproducir melodía de fondo'}
          >
            <div className={`relative ${reproduciendoMusica ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
              <Music size={14} className={reproduciendoMusica ? 'text-white' : 'text-slate-600'} />
            </div>
            <span className="text-[11px] font-semibold tracking-wide max-w-[120px] truncate">
              {visual.musicaFondo.titulo || 'Melodía'}
            </span>
            <span className="text-[10px] opacity-70">
              {reproduciendoMusica ? '❚❚' : '▶'}
            </span>
          </button>
        </div>
      )}

      {/* Tarjeta Central Modular */}
      <div className="relative w-full max-w-[430px] z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`${claseFormaExterior} p-[1px] shadow-2xl`}
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, var(--color-secundario-live, ${visual.colorSecundario}) 25%, transparent) 0%, color-mix(in srgb, var(--color-primario-live, ${visual.colorPrimario}) 15%, transparent) 50%, color-mix(in srgb, var(--color-secundario-live, ${visual.colorSecundario}) 20%, transparent) 100%)`,
          }}
        >
          <div
            className={`relative ${claseFormaInterior} overflow-hidden backdrop-blur-xl border border-white/60 dark:border-black/40`}
            style={{
              backgroundColor: 'var(--color-tarjeta-live, ' + (visual.colorTarjeta || '#FFFFFF') + ')',
              color: 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')',
            }}
          >
            {/* Decoraciones Estéticas y Texturas Artesanales */}
            <DecoracionesTarjeta
              textura={visual.texturaFondo}
              marco={visual.marcoDecorativo}
              colorAcento={visual.colorPrimario}
              colorSecundario={visual.colorSecundario}
            />

            {/* Renderizado de Bloques Modulares Dinámicos */}
            <div className="flex flex-col relative z-10">
              {listaSecciones.map((seccion, index) => {
                const renderizarBloque = () => {
                  switch (seccion.tipo) {
                  case 'cabecera': {
                    const imagenPortada = seccion.datos?.imagenPortada !== undefined ? seccion.datos.imagenPortada : evento.imagenPortada
                    const imagenRetrato = (seccion.datos?.imagenRetrato !== undefined ? seccion.datos.imagenRetrato : evento.imagenRetrato) || ''
                    const tieneFotoValida = Boolean(imagenRetrato && imagenRetrato.trim() !== '')
                    const mostrarFotoRetrato = seccion.datos?.mostrarFotoRetrato !== false && evento.mostrarFotoRetrato !== false
                    const mostrarBadge = seccion.datos?.mostrarBadge !== false && evento.mostrarBadge !== false
                    const textoBadge = seccion.datos?.textoBadge !== undefined
                      ? seccion.datos.textoBadge
                      : (evento.textoBadge !== undefined ? evento.textoBadge : (invitado ? 'Pase Protocolario Personal' : 'Convocatoria Oficial'))
                    const mostrarSeparadorCabecera = seccion.datos?.mostrarSeparador !== false

                    return (
                      <div
                        key={seccion.id}
                        className="relative text-center flex flex-col items-center border-b border-black/[0.06] dark:border-white/[0.08]"
                        style={{
                          background: `linear-gradient(180deg, color-mix(in srgb, var(--color-primario-live, ${visual.colorPrimario || '#0F172A'}) 5%, transparent) 0%, transparent 100%)`,
                        }}
                      >
                        {/* Fotografía de Portada Superior si está definida */}
                        {imagenPortada ? (
                          <div className="w-full h-36 sm:h-44 relative overflow-hidden bg-slate-200 group/portada">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagenPortada}
                              alt={evento.titulo}
                              className="w-full h-full object-cover object-center"
                            />
                            <div
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"
                              style={{
                                background: `linear-gradient(180deg, transparent 40%, var(--color-tarjeta-live, ${visual.colorTarjeta || '#FFFFFF'}) 100%)`,
                              }}
                            />
                            {esModoEdicionDirecta && (
                              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const portadas = IMAGENES_CURADAS.portadas
                                    const idxActual = portadas.findIndex((p) => p.url === imagenPortada)
                                    const siguiente = portadas[(idxActual + 1) % portadas.length].url
                                    alActualizarDatosSeccion?.(seccion.id, 'imagenPortada', siguiente)
                                    alActualizarEvento?.('imagenPortada', siguiente)
                                  }}
                                  className="px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold shadow-md backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-all border border-white/20"
                                  title="1 Clic: Cambiar a la siguiente foto de catálogo"
                                >
                                  <Wand2 size={11} className="text-amber-400" />
                                  <span>Foto Sugerida</span>
                                </button>
                                <label className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-slate-900 text-[10px] font-bold shadow-md backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-all border border-slate-200">
                                  <Camera size={11} />
                                  <span>Subir Foto</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      manejarSubidaArchivo(e, (url) => {
                                        alActualizarDatosSeccion?.(seccion.id, 'imagenPortada', url)
                                        alActualizarEvento?.('imagenPortada', url)
                                      })
                                    }
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        ) : esModoEdicionDirecta ? (
                          <div className="w-full py-6 border-2 border-dashed border-slate-300 bg-slate-100/50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 transition-colors">
                            <div className="flex items-center gap-2">
                              <label className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer hover:bg-slate-800">
                                <Camera size={13} />
                                <span>Subir Foto de Portada</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    manejarSubidaArchivo(e, (url) => {
                                      alActualizarDatosSeccion?.(seccion.id, 'imagenPortada', url)
                                      alActualizarEvento?.('imagenPortada', url)
                                    })
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const primera = IMAGENES_CURADAS.portadas[0].url
                                  alActualizarDatosSeccion?.(seccion.id, 'imagenPortada', primera)
                                  alActualizarEvento?.('imagenPortada', primera)
                                }}
                                className="px-3 py-1.5 rounded-full bg-white text-slate-800 border border-slate-300 text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
                              >
                                <Wand2 size={13} className="text-amber-500" />
                                <span>Usar Foto Sugerida</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500">Haz clic en una opción para ilustrar la portada en 1 solo paso</span>
                          </div>
                        ) : null}

                        <div className={`px-4 sm:px-8 pb-7 flex flex-col items-center w-full ${imagenPortada ? 'pt-3' : 'pt-8'}`}>
                          {/* Fotografía / Logotipo Central si está configurado */}
                          {mostrarFotoRetrato ? (
                            tieneFotoValida ? (
                              <div className={`relative group/retrato ${imagenPortada ? '-mt-8 sm:-mt-10' : 'mt-0'} z-10 mb-3`}>
                                <div
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md bg-white"
                                  style={{ borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')' }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imagenRetrato}
                                    alt="Anfitrión"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {esModoEdicionDirecta && (
                                  <div className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover/retrato:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-all cursor-pointer" title="Cambiar fotografía">
                                      <Camera size={14} />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) =>
                                          manejarSubidaArchivo(e, (url) => {
                                            alActualizarDatosSeccion?.(seccion.id, 'imagenRetrato', url)
                                            alActualizarDatosSeccion?.(seccion.id, 'mostrarFotoRetrato', true)
                                            alActualizarEvento?.('imagenRetrato', url)
                                            alActualizarEvento?.('mostrarFotoRetrato', true)
                                          })
                                        }
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        alActualizarDatosSeccion?.(seccion.id, 'imagenRetrato', '')
                                        alActualizarDatosSeccion?.(seccion.id, 'mostrarFotoRetrato', false)
                                        alActualizarEvento?.('imagenRetrato', '')
                                        alActualizarEvento?.('mostrarFotoRetrato', false)
                                      }}
                                      className="p-1.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-all cursor-pointer"
                                      title="Eliminar foto y quitar círculo"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : esModoEdicionDirecta ? (
                              <div className="relative group/circulo-vacio mb-3 z-10">
                                <label
                                  className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-600 bg-slate-100/60 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                                  title="Subir foto de anfitrión o logotipo"
                                >
                                  <Camera size={15} className="text-slate-600" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      manejarSubidaArchivo(e, (url) => {
                                        alActualizarDatosSeccion?.(seccion.id, 'imagenRetrato', url)
                                        alActualizarDatosSeccion?.(seccion.id, 'mostrarFotoRetrato', true)
                                        alActualizarEvento?.('imagenRetrato', url)
                                        alActualizarEvento?.('mostrarFotoRetrato', true)
                                      })
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    alActualizarDatosSeccion?.(seccion.id, 'mostrarFotoRetrato', false)
                                    alActualizarDatosSeccion?.(seccion.id, 'imagenRetrato', '')
                                    alActualizarEvento?.('mostrarFotoRetrato', false)
                                    alActualizarEvento?.('imagenRetrato', '')
                                  }}
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer transition-all border border-white"
                                  title="Eliminar círculo de foto (no poner foto)"
                                >
                                  <X size={11} strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : null
                          ) : esModoEdicionDirecta ? (
                            <button
                              type="button"
                              onClick={() => {
                                alActualizarDatosSeccion?.(seccion.id, 'mostrarFotoRetrato', true)
                                alActualizarEvento?.('mostrarFotoRetrato', true)
                              }}
                              className="mb-2 text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100/70 hover:bg-slate-100 border border-dashed border-slate-300 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer opacity-70 hover:opacity-100"
                              title="Restaurar el círculo de fotografía o logotipo"
                            >
                              <Plus size={11} />
                              <span>Añadir foto / logo central</span>
                            </button>
                          ) : null}

                          {/* Badge institucional de convocatoria / distintivo editable */}
                          {mostrarBadge ? (
                            <motion.div
                              custom={index}
                              initial="oculto"
                              animate="visible"
                              variants={animacionAparicion}
                              className="relative group/badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 transition-all"
                              style={{
                                borderColor: `${visual.colorSecundario}55`,
                                backgroundColor: `${visual.colorSecundario}12`,
                                color: visual.colorTexto,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: visual.colorSecundario }}
                              />
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={textoBadge}
                                alGuardar={(nuevoTexto) => {
                                  const val = nuevoTexto.trim()
                                  if (!val) {
                                    alActualizarDatosSeccion?.(seccion.id, 'mostrarBadge', false)
                                    alActualizarDatosSeccion?.(seccion.id, 'textoBadge', '')
                                    alActualizarEvento?.('mostrarBadge', false)
                                    alActualizarEvento?.('textoBadge', '')
                                  } else {
                                    alActualizarDatosSeccion?.(seccion.id, 'textoBadge', val)
                                    alActualizarDatosSeccion?.(seccion.id, 'mostrarBadge', true)
                                    alActualizarEvento?.('textoBadge', val)
                                    alActualizarEvento?.('mostrarBadge', true)
                                  }
                                }}
                                etiqueta="span"
                                className="text-[10px] uppercase tracking-[0.25em] font-semibold"
                                style={{ color: visual.colorTexto }}
                                placeholder="Convocatoria Oficial"
                              />
                              {esModoEdicionDirecta && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alActualizarDatosSeccion?.(seccion.id, 'mostrarBadge', false)
                                    alActualizarDatosSeccion?.(seccion.id, 'textoBadge', '')
                                    alActualizarEvento?.('mostrarBadge', false)
                                    alActualizarEvento?.('textoBadge', '')
                                  }}
                                  className="ml-0.5 w-4 h-4 rounded-full bg-slate-900/10 hover:bg-rose-600 hover:text-white text-slate-500 opacity-50 group-hover/badge:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                                  title="Eliminar este distintivo"
                                >
                                  <X size={10} strokeWidth={2.5} />
                                </button>
                              )}
                            </motion.div>
                          ) : esModoEdicionDirecta ? (
                            <button
                              type="button"
                              onClick={() => {
                                alActualizarDatosSeccion?.(seccion.id, 'mostrarBadge', true)
                                alActualizarDatosSeccion?.(seccion.id, 'textoBadge', 'Convocatoria Oficial')
                                alActualizarEvento?.('mostrarBadge', true)
                                alActualizarEvento?.('textoBadge', 'Convocatoria Oficial')
                              }}
                              className="mb-3 text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100/70 hover:bg-slate-100 border border-dashed border-slate-300 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer opacity-70 hover:opacity-100"
                              title="Restaurar el distintivo superior"
                            >
                              <Plus size={11} />
                              <span>Añadir distintivo (ej: Convocatoria Oficial)</span>
                            </button>
                          ) : null}

                          {/* Nombre del Invitado o Título Principal con Edición Directa */}
                          <div className="w-full text-center">
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={invitado ? nombreInvitado : seccion.titulo || evento.titulo}
                              alGuardar={(nuevoTexto) => {
                                alActualizarSeccion?.(seccion.id, 'titulo', nuevoTexto)
                                alActualizarEvento?.('titulo', nuevoTexto)
                              }}
                              etiqueta="h2"
                              className={`text-2xl sm:text-3xl leading-snug tracking-tight font-bold ${claseFuenteTitulo}`}
                              style={{ color: visual.colorTexto }}
                              placeholder="Título del Evento (ej: Nuestra Boda)"
                            />
                          </div>

                          {invitado && (
                            <motion.div
                              custom={index + 0.7}
                              initial="oculto"
                              animate="visible"
                              variants={animacionAparicion}
                              className="mt-2"
                            >
                              <span
                                className="text-[11px] px-3 py-1 rounded-md font-mono uppercase tracking-wider font-medium"
                                style={{
                                  backgroundColor: `${visual.colorPrimario}0F`,
                                  color: visual.colorTexto,
                                  border: `1px solid ${visual.colorPrimario}20`,
                                }}
                              >
                                Válido para {invitado.pases}{' '}
                                {invitado.pases === 1 ? 'persona' : 'personas'}
                              </span>
                            </motion.div>
                          )}

                          {/* Anfitriones y Subtítulo con Edición Directa */}
                          <div className="mt-4 text-center w-full">
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={seccion.subtitulo || evento.subtitulo || ''}
                              alGuardar={(nuevoTexto) => {
                                alActualizarSeccion?.(seccion.id, 'subtitulo', nuevoTexto)
                                alActualizarEvento?.('subtitulo', nuevoTexto)
                              }}
                              etiqueta="p"
                              className="text-[10px] tracking-[0.25em] uppercase font-semibold opacity-70 block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Tiene el honor de invitarle a"
                            />
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={evento.anfitriones || ''}
                              alGuardar={(nuevoTexto) => {
                                alActualizarEvento?.('anfitriones', nuevoTexto)
                              }}
                              etiqueta="h3"
                              className={`text-lg sm:text-xl font-bold mt-1 block ${claseFuenteTitulo}`}
                              style={{ color: visual.colorTexto }}
                              placeholder="Nombres de los anfitriones"
                            />
                          </div>

                          {/* Filete divisorio editorial de cabecera */}
                          {mostrarSeparadorCabecera ? (
                            <div className="mt-5 relative group/separador-cabecera w-full">
                              <div className="flex items-center justify-center gap-3 w-full opacity-30">
                                <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                                <IconoDinamico nombre={seccion.icono || 'sparkles'} size={12} />
                                <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                              </div>
                              {esModoEdicionDirecta && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/separador-cabecera:opacity-100 transition-opacity pointer-events-none">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alActualizarDatosSeccion?.(seccion.id, 'mostrarSeparador', false)
                                    }}
                                    className="pointer-events-auto px-2 py-0.5 rounded-full bg-slate-900/90 text-rose-300 hover:bg-rose-600 hover:text-white text-[10px] font-semibold shadow-md flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Eliminar este separador"
                                  >
                                    <Trash2 size={11} />
                                    <span>Eliminar separador</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : esModoEdicionDirecta ? (
                            <div className="mt-3 flex justify-center w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  alActualizarDatosSeccion?.(seccion.id, 'mostrarSeparador', true)
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer opacity-60 hover:opacity-100"
                                title="Restaurar separador inferior de cabecera"
                              >
                                <Plus size={10} />
                                <span>Añadir separador de cabecera</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  }

                  case 'cuenta_regresiva': {
                    if (!evento.fechaEvento) return null
                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <IconoDinamico
                            nombre={seccion.icono || 'clock'}
                            size={12}
                            style={{ color: visual.colorSecundario }}
                          />
                          <InlineEditableText
                            activo={esModoEdicionDirecta}
                            valor={seccion.titulo || 'Tiempo Restante'}
                            alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                            etiqueta="p"
                            className="text-[10px] tracking-[0.25em] uppercase font-semibold opacity-60 text-center"
                            style={{ color: visual.colorTexto }}
                          />
                        </div>
                        <EventCountdown
                          fechaIso={evento.fechaEvento}
                          colorTexto={visual.colorTexto}
                          colorAcento={visual.colorSecundario}
                          esModoEdicionDirecta={esModoEdicionDirecta}
                        />

                        {esModoEdicionDirecta && (
                          <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex flex-col items-center gap-1.5 w-full bg-slate-500/5 p-2 rounded-xl border border-dashed border-slate-400/40">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              <Calendar size={12} style={{ color: visual.colorSecundario }} />
                              <span>Ajustar Fecha & Hora del Contador (En Vivo):</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                              <input
                                type="date"
                                value={evento.fechaEvento ? evento.fechaEvento.split('T')[0] : ''}
                                onChange={(e) => {
                                  const nuevaFecha = e.target.value
                                  if (nuevaFecha) {
                                    const hora =
                                      evento.fechaEvento && evento.fechaEvento.includes('T')
                                        ? evento.fechaEvento.split('T')[1]
                                        : '19:00:00'
                                    alActualizarEvento?.('fechaEvento', `${nuevaFecha}T${hora}`)
                                  }
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg shadow-2xs outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                style={{ color: visual.colorTexto }}
                                title="El contador regresivo se recalculará inmediatamente al elegir una fecha futura"
                              />
                              <input
                                type="time"
                                value={
                                  evento.fechaEvento && evento.fechaEvento.includes('T')
                                    ? evento.fechaEvento.split('T')[1].substring(0, 5)
                                    : '19:00'
                                }
                                onChange={(e) => {
                                  const nuevaHora = e.target.value
                                  if (nuevaHora) {
                                    const fecha = evento.fechaEvento
                                      ? evento.fechaEvento.split('T')[0]
                                      : new Date().toISOString().split('T')[0]
                                    alActualizarEvento?.('fechaEvento', `${fecha}T${nuevaHora}:00`)
                                    const [h, m] = nuevaHora.split(':').map(Number)
                                    const ampm = h >= 12 ? 'PM' : 'AM'
                                    const h12 = h % 12 || 12
                                    alActualizarEvento?.('horaEvento', `${h12}:${m < 10 ? '0' + m : m} ${ampm}`)
                                  }
                                }}
                                className="px-2 py-1 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg shadow-2xs outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                style={{ color: visual.colorTexto }}
                                title="Cambiar hora de inicio del evento"
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {evento.fechaEvento
                                ? new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : 'Sin fecha configurada'}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )
                  }

                  case 'fecha_hora': {
                    const enlaceCalendar = generarEnlaceGoogleCalendar(evento)
                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04] space-y-3"
                      >
                        {/* Cabecera del bloque Fecha & Horario */}
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <IconoDinamico
                            nombre={seccion.icono || 'calendar'}
                            size={12}
                            style={{ color: visual.colorSecundario }}
                          />
                          <InlineEditableText
                            activo={esModoEdicionDirecta}
                            valor={seccion.titulo || 'Fecha & Horario'}
                            alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                            etiqueta="p"
                            className="text-[10px] tracking-[0.25em] uppercase font-semibold opacity-60 text-center"
                            style={{ color: visual.colorTexto }}
                            placeholder="Fecha & Horario"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 w-full">
                          <div
                            className="flex flex-col items-center justify-center p-3 rounded-xl text-center border relative transition-all"
                            style={{
                              backgroundColor: `${visual.colorPrimario}05`,
                              borderColor: `${visual.colorPrimario}18`,
                            }}
                          >
                            <Calendar
                              size={16}
                              className="opacity-80 mb-1"
                              style={{ color: visual.colorSecundario }}
                            />
                            <span className="text-[9px] uppercase tracking-widest font-semibold opacity-60">
                              Fecha
                            </span>

                            {esModoEdicionDirecta ? (
                              <div className="w-full flex flex-col items-center mt-1 z-20">
                                <input
                                  type="date"
                                  value={evento.fechaEvento ? evento.fechaEvento.split('T')[0] : ''}
                                  onChange={(e) => {
                                    const nueva = e.target.value
                                    if (nueva) {
                                      const horaActual = evento.fechaEvento && evento.fechaEvento.includes('T')
                                        ? evento.fechaEvento.split('T')[1]
                                        : '18:00:00'
                                      alActualizarEvento?.('fechaEvento', `${nueva}T${horaActual}`)
                                    }
                                  }}
                                  className="w-full max-w-[145px] px-2 py-1 text-xs font-bold text-center bg-white border border-slate-300 rounded-lg shadow-2xs outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                                  style={{ color: visual.colorTexto }}
                                  title="Selecciona la fecha del evento"
                                />
                                <span className="text-[9px] text-slate-500 mt-1 capitalize font-medium">
                                  {evento.fechaEvento
                                    ? new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'Sin fecha'}
                                </span>
                              </div>
                            ) : (
                              <span
                                className="text-xs font-semibold mt-0.5 capitalize"
                                style={{ color: visual.colorTexto }}
                              >
                                {evento.fechaEvento
                                  ? new Date(evento.fechaEvento).toLocaleDateString('es-ES', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Por confirmar'}
                              </span>
                            )}
                          </div>

                          <div
                            className="flex flex-col items-center justify-center p-3 rounded-xl text-center border"
                            style={{
                              backgroundColor: `${visual.colorPrimario}05`,
                              borderColor: `${visual.colorPrimario}18`,
                            }}
                          >
                            <Clock
                              size={16}
                              className="opacity-80 mb-1"
                              style={{ color: visual.colorSecundario }}
                            />
                            <span className="text-[9px] uppercase tracking-widest font-semibold opacity-60">
                              Hora
                            </span>
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={evento.horaEvento || '6:30 PM'}
                              alGuardar={(val) => alActualizarEvento?.('horaEvento', val)}
                              etiqueta="span"
                              className="text-xs font-semibold mt-0.5 block"
                              style={{ color: visual.colorTexto }}
                              placeholder="6:30 PM"
                            />
                          </div>
                        </div>

                        {/* Botón sincronizar con Google Calendar */}
                        <a
                          href={enlaceCalendar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 border hover:bg-black/5"
                          style={{
                            borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')',
                            color: 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')',
                          }}
                        >
                          <CalendarPlus size={13} style={{ color: 'var(--color-secundario-live, ' + (visual.colorSecundario || '#D4AF37') + ')' }} />
                          <span>Guardar en mi Calendario</span>
                        </a>
                      </motion.div>
                    )
                  }

                  case 'itinerario': {
                    const hitos: ElementoItinerario[] = seccion.datos?.itinerario || []
                    if (hitos.length === 0 && !esModoEdicionDirecta) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className="p-1.5 rounded-lg border"
                            style={{
                              backgroundColor: `${visual.colorPrimario}0A`,
                              borderColor: `${visual.colorPrimario}15`,
                              color: visual.colorSecundario,
                            }}
                          >
                            <IconoDinamico nombre={seccion.icono || 'clock'} size={14} />
                          </div>
                          <div className="flex-1">
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={seccion.titulo || 'Itinerario'}
                              alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                              etiqueta="p"
                              className="text-xs font-bold uppercase tracking-wider block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Itinerario del Evento"
                            />
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={seccion.subtitulo || ''}
                              alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'subtitulo', val)}
                              etiqueta="p"
                              className="text-[10px] opacity-60 block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Cronograma de la celebración..."
                            />
                          </div>
                        </div>

                        {/* Cronograma vertical */}
                        <div className="space-y-3 pl-1 relative border-l-2 ml-3" style={{ borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')' }}>
                          {hitos.map((hito, hIdx) => (
                            <div key={hito.id} className="relative pl-5">
                              {/* Punto o icono del hito */}
                              <div
                                className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border bg-white flex items-center justify-center shadow-xs"
                                style={{
                                  borderColor: 'var(--color-secundario-live, ' + (visual.colorSecundario || '#D4AF37') + ')',
                                  color: 'var(--color-secundario-live, ' + (visual.colorSecundario || '#D4AF37') + ')',
                                }}
                              >
                                <IconoDinamico nombre={hito.icono || 'sparkles'} size={10} />
                              </div>

                              <div className="flex items-baseline justify-between gap-2">
                                <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                  <InlineEditableText
                                    activo={esModoEdicionDirecta}
                                    valor={hito.hora}
                                    alGuardar={(val) => {
                                      const actualizados = [...hitos]
                                      actualizados[hIdx] = { ...actualizados[hIdx], hora: val }
                                      alActualizarDatosSeccion?.(seccion.id, 'itinerario', actualizados)
                                    }}
                                    etiqueta="span"
                                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block"
                                    style={{
                                      backgroundColor: `color-mix(in srgb, var(--color-primario-live, ${visual.colorPrimario || '#0F172A'}) 10%, transparent)`,
                                      color: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')',
                                    }}
                                    placeholder="20:00"
                                  />
                                  <InlineEditableText
                                    activo={esModoEdicionDirecta}
                                    valor={hito.titulo}
                                    alGuardar={(val) => {
                                      const actualizados = [...hitos]
                                      actualizados[hIdx] = { ...actualizados[hIdx], titulo: val }
                                      alActualizarDatosSeccion?.(seccion.id, 'itinerario', actualizados)
                                    }}
                                    etiqueta="h4"
                                    className="text-xs font-semibold inline-block"
                                    style={{ color: visual.colorTexto }}
                                    placeholder="Nombre del momento"
                                  />
                                </div>
                                {esModoEdicionDirecta && hitos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const actualizados = hitos.filter((_, idx) => idx !== hIdx)
                                      alActualizarDatosSeccion?.(seccion.id, 'itinerario', actualizados)
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                                    title="Eliminar este momento del cronograma"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={hito.descripcion || ''}
                                alGuardar={(val) => {
                                  const actualizados = [...hitos]
                                  actualizados[hIdx] = { ...actualizados[hIdx], descripcion: val }
                                  alActualizarDatosSeccion?.(seccion.id, 'itinerario', actualizados)
                                }}
                                etiqueta="p"
                                className="text-[11px] opacity-70 mt-0.5 leading-relaxed block"
                                style={{ color: visual.colorTexto }}
                                placeholder="Detalles de este momento (opcional)..."
                              />
                            </div>
                          ))}
                        </div>

                        {esModoEdicionDirecta && (
                          <button
                            type="button"
                            onClick={() => {
                              const nuevoHito: ElementoItinerario = {
                                id: `it-${Date.now()}`,
                                hora: '20:00',
                                titulo: 'Nuevo Momento',
                                descripcion: 'Detalle de la actividad',
                                icono: 'sparkles',
                              }
                              alActualizarDatosSeccion?.(seccion.id, 'itinerario', [...hitos, nuevoHito])
                            }}
                            className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl bg-slate-100/70 hover:bg-slate-200/80 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-3 transition-colors"
                          >
                            <Plus size={13} /> <span>+ Añadir momento al itinerario</span>
                          </button>
                        )}
                      </motion.div>
                    )
                  }

                  case 'ubicacion': {
                    const direccion = seccion.datos?.direccion || evento.direccion
                    const nombreLugar = seccion.datos?.nombreLugar || evento.direccion
                    const enlaceMapa = seccion.datos?.enlaceMapa || evento.enlaceMapa
                    const enlaceWaze =
                      seccion.datos?.enlaceWaze ||
                      (direccion ? `https://waze.com/ul?q=${encodeURIComponent(direccion)}` : '')

                    if (!direccion && !esModoEdicionDirecta) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04] space-y-3"
                      >
                        <div
                          className="p-3.5 rounded-xl border flex items-start gap-3"
                          style={{
                            backgroundColor: `${visual.colorPrimario}05`,
                            borderColor: `${visual.colorPrimario}18`,
                          }}
                        >
                          <div
                            className="p-2 rounded-lg shrink-0 border mt-0.5"
                            style={{
                              backgroundColor: `${visual.colorPrimario}0A`,
                              borderColor: `${visual.colorPrimario}15`,
                              color: visual.colorSecundario,
                            }}
                          >
                            <MapPin size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={seccion.titulo || 'Sede del Evento'}
                              alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                              etiqueta="p"
                              className="text-[9px] uppercase tracking-wider font-semibold opacity-60 block"
                              placeholder="Sede del Evento"
                            />
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={nombreLugar || ''}
                              alGuardar={(val) => {
                                alActualizarDatosSeccion?.(seccion.id, 'nombreLugar', val)
                                alActualizarEvento?.('direccion', val)
                              }}
                              etiqueta="p"
                              className="text-xs font-semibold mt-0.5 block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Nombre del salón, hacienda o dirección"
                            />
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={seccion.datos?.detallesAcceso || ''}
                              alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'detallesAcceso', val)}
                              etiqueta="p"
                              className="text-[10px] opacity-70 mt-1 leading-normal block"
                              placeholder="Indicaciones de acceso, parqueadero o salón..."
                            />
                          </div>
                        </div>

                        {/* Enlace de Google Maps en Modo Edición Directa */}
                        {esModoEdicionDirecta && (
                          <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                            <MapPin size={13} className="text-amber-600 shrink-0" />
                            <input
                              type="url"
                              value={enlaceMapa || ''}
                              onChange={(e) => {
                                alActualizarDatosSeccion?.(seccion.id, 'enlaceMapa', e.target.value)
                                alActualizarEvento?.('enlaceMapa', e.target.value)
                              }}
                              placeholder="Enlace de Google Maps (https://maps.google.com/...)"
                              className="w-full text-[10px] bg-transparent outline-none font-mono"
                            />
                          </div>
                        )}

                        {/* Botones de Navegación Google Maps & Waze */}
                        <div className="grid grid-cols-2 gap-2">
                          {enlaceMapa && (
                            <a
                              href={enlaceMapa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border hover:bg-black/5"
                              style={{
                                borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')',
                                color: 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')',
                              }}
                            >
                              <ExternalLink size={12} />
                              <span>Google Maps</span>
                            </a>
                          )}
                          {enlaceWaze && (
                            <a
                              href={enlaceWaze}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border hover:bg-black/5"
                              style={{
                                borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')',
                                color: 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')',
                              }}
                            >
                              <Navigation size={12} />
                              <span>Waze</span>
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'codigo_vestimenta': {
                    const etiqueta = seccion.datos?.etiqueta || evento.codigoVestimenta
                    const colores = seccion.datos?.coloresSugeridos || evento.paletaVestimenta || []
                    const notas = seccion.datos?.notasVestimenta

                    if (!etiqueta && !esModoEdicionDirecta) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div
                          className="p-3.5 rounded-xl border flex flex-col gap-2.5"
                          style={{
                            backgroundColor: `${visual.colorPrimario}05`,
                            borderColor: `${visual.colorPrimario}18`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg shrink-0 border"
                              style={{
                                backgroundColor: `${visual.colorPrimario}0A`,
                                borderColor: `${visual.colorPrimario}15`,
                                color: visual.colorSecundario,
                              }}
                            >
                              <IconoDinamico nombre={seccion.icono || 'shirt'} size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={seccion.titulo || 'Código de Etiqueta'}
                                alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                                etiqueta="p"
                                className="text-[9px] uppercase tracking-wider font-semibold opacity-60 block"
                                placeholder="Código de Etiqueta"
                              />
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={etiqueta || ''}
                                alGuardar={(val) => {
                                  alActualizarDatosSeccion?.(seccion.id, 'etiqueta', val)
                                  alActualizarEvento?.('codigoVestimenta', val)
                                }}
                                etiqueta="p"
                                className="text-xs font-semibold block"
                                style={{ color: visual.colorTexto }}
                                placeholder="Ej: Traje Formal / Corbata Oscura"
                              />
                            </div>
                          </div>

                          {/* Paleta de colores sugeridos si aplica */}
                          {colores.length > 0 && (
                            <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2">
                              <span className="text-[10px] opacity-60 font-medium">Paleta sugerida:</span>
                              <div className="flex items-center gap-1.5">
                                {colores.map((c, i) => (
                                  <span
                                    key={i}
                                    className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {(notas || esModoEdicionDirecta) && (
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={notas || ''}
                              alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'notasVestimenta', val)}
                              etiqueta="p"
                              className="text-[10px] opacity-70 italic block"
                              placeholder="Notas adicionales de etiqueta (opcional)..."
                            />
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'regalos_bancarios': {
                    const banco = seccion.datos?.banco || evento.datosBancarios?.banco
                    const tipoCuenta = seccion.datos?.tipoCuenta || evento.datosBancarios?.tipoCuenta
                    const numeroCuenta = seccion.datos?.numeroCuenta || evento.datosBancarios?.numeroCuenta
                    const titular = seccion.datos?.titular || evento.datosBancarios?.titular
                    const enlaceLista = seccion.datos?.enlaceListaRegalos

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div
                          className="p-3.5 rounded-xl border flex flex-col gap-2.5"
                          style={{
                            backgroundColor: `${visual.colorPrimario}05`,
                            borderColor: `${visual.colorPrimario}18`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg shrink-0 border"
                              style={{
                                backgroundColor: `${visual.colorPrimario}0A`,
                                borderColor: `${visual.colorPrimario}15`,
                                color: visual.colorSecundario,
                              }}
                            >
                              <CreditCard size={16} />
                            </div>
                            <div className="text-xs min-w-0 flex-1">
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={seccion.titulo || 'Detalles de Cortesía / Lluvia de Sobres'}
                                alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                                etiqueta="p"
                                className="text-[9px] uppercase tracking-wider font-semibold opacity-60 block"
                                placeholder="Detalles de Cortesía"
                              />
                              <div className="flex items-center gap-1.5 font-semibold" style={{ color: visual.colorTexto }}>
                                <InlineEditableText
                                  activo={esModoEdicionDirecta}
                                  valor={banco || ''}
                                  alGuardar={(val) => {
                                    alActualizarDatosSeccion?.(seccion.id, 'banco', val)
                                    alActualizarEvento?.('datosBancarios', {
                                      ...evento.datosBancarios,
                                      banco: val,
                                    })
                                  }}
                                  etiqueta="span"
                                  placeholder="Nombre del Banco"
                                />
                                <span className="opacity-60">·</span>
                                <InlineEditableText
                                  activo={esModoEdicionDirecta}
                                  valor={tipoCuenta || 'Ahorros'}
                                  alGuardar={(val) => {
                                    alActualizarDatosSeccion?.(seccion.id, 'tipoCuenta', val)
                                    alActualizarEvento?.('datosBancarios', {
                                      ...evento.datosBancarios,
                                      tipoCuenta: val,
                                    })
                                  }}
                                  etiqueta="span"
                                  placeholder="Tipo Cuenta"
                                />
                              </div>
                            </div>
                          </div>

                          {(numeroCuenta || esModoEdicionDirecta) && (
                            <div className="flex items-center justify-between bg-white/80 dark:bg-black/20 p-2.5 rounded-lg border border-black/5 text-xs">
                              <div className="flex-1 min-w-0 mr-2">
                                <span className="text-[9px] opacity-60 uppercase block">
                                  Número de Cuenta:
                                </span>
                                <InlineEditableText
                                  activo={esModoEdicionDirecta}
                                  valor={numeroCuenta || ''}
                                  alGuardar={(val) => {
                                    alActualizarDatosSeccion?.(seccion.id, 'numeroCuenta', val)
                                    alActualizarEvento?.('datosBancarios', {
                                      ...evento.datosBancarios,
                                      numeroCuenta: val,
                                    })
                                  }}
                                  etiqueta="span"
                                  className="font-mono font-bold text-xs block"
                                  placeholder="000-000000-00"
                                />
                                <div className="flex items-center gap-1 text-[10px] opacity-70 mt-0.5">
                                  <span>Titular:</span>
                                  <InlineEditableText
                                    activo={esModoEdicionDirecta}
                                    valor={titular || ''}
                                    alGuardar={(val) => {
                                      alActualizarDatosSeccion?.(seccion.id, 'titular', val)
                                      alActualizarEvento?.('datosBancarios', {
                                        ...evento.datosBancarios,
                                        titular: val,
                                      })
                                    }}
                                    etiqueta="span"
                                    placeholder="Nombre del titular"
                                  />
                                </div>
                              </div>
                              {numeroCuenta && (
                                <button
                                  onClick={() => copiarCuenta(numeroCuenta)}
                                  className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0"
                                >
                                  {cuentaCopiada ? (
                                    <>
                                      <Check size={12} className="text-emerald-600" />
                                      <span>Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={12} />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {enlaceLista && (
                            <a
                              href={enlaceLista}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-center border flex items-center justify-center gap-1.5 hover:bg-black/5"
                              style={{ borderColor: 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')', color: 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')' }}
                            >
                              <span>Ver Mesa de Regalos Online</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'galeria_fotos': {
                    const fotos = seccion.datos?.fotos || evento.fotosGaleria || []
                    if (fotos.length === 0) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <IconoDinamico
                            nombre={seccion.icono || 'camera'}
                            size={14}
                            style={{ color: visual.colorSecundario }}
                          />
                          <InlineEditableText
                            activo={esModoEdicionDirecta}
                            valor={seccion.titulo || 'Galería de Momentos'}
                            alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                            etiqueta="p"
                            className="text-xs font-bold uppercase tracking-wider block"
                            style={{ color: visual.colorTexto }}
                            placeholder="Galería de Momentos"
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {fotos.map((foto, fIdx) => (
                            <div
                              key={fIdx}
                              className="h-24 sm:h-28 rounded-xl overflow-hidden border border-black/10 relative group"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={foto}
                                alt={`Foto ${fIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'mensaje_libre': {
                    const mensaje = seccion.datos?.mensaje
                    const autor = seccion.datos?.autorMensaje

                    if (!mensaje && !esModoEdicionDirecta) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div
                          className="p-4 rounded-xl border relative text-center"
                          style={{
                            backgroundColor: `${visual.colorPrimario}04`,
                            borderColor: `${visual.colorPrimario}15`,
                          }}
                        >
                          <Quote
                            size={20}
                            className="mx-auto mb-2 opacity-30"
                            style={{ color: visual.colorSecundario }}
                          />
                          <div className="w-full">
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={mensaje || ''}
                              alGuardar={(nuevoTexto) => {
                                alActualizarDatosSeccion?.(seccion.id, 'mensaje', nuevoTexto)
                              }}
                              multilinea={true}
                              etiqueta="p"
                              className="text-xs sm:text-[13px] leading-relaxed italic opacity-90 block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Escribe aquí tu frase, dedicatoria o reflexión..."
                            />
                          </div>
                          {(autor || esModoEdicionDirecta) && (
                            <div className="mt-2 flex items-center justify-center gap-1">
                              <span
                                className="text-[10px] uppercase tracking-wider font-semibold opacity-70"
                                style={{ color: visual.colorSecundario }}
                              >
                                —
                              </span>
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={autor || ''}
                                alGuardar={(nuevoAutor) => {
                                  alActualizarDatosSeccion?.(seccion.id, 'autorMensaje', nuevoAutor)
                                }}
                                etiqueta="span"
                                className="text-[10px] uppercase tracking-wider font-semibold opacity-70 inline-block"
                                style={{ color: visual.colorSecundario }}
                                placeholder="Nombre del autor o anfitriones"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'hospedaje': {
                    const hoteles = seccion.datos?.hoteles || []
                    if (hoteles.length === 0 && !esModoEdicionDirecta) return null

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04] space-y-2.5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 size={14} style={{ color: visual.colorSecundario }} />
                          <InlineEditableText
                            activo={esModoEdicionDirecta}
                            valor={seccion.titulo || 'Hospedaje Recomendado'}
                            alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                            etiqueta="p"
                            className="text-xs font-bold uppercase tracking-wider block"
                            style={{ color: visual.colorTexto }}
                            placeholder="Hospedaje Recomendado"
                          />
                        </div>
                        {hoteles.map((h) => (
                          <div
                            key={h.id}
                            className="p-3 rounded-xl border flex items-center justify-between text-xs"
                            style={{
                              backgroundColor: `${visual.colorPrimario}05`,
                              borderColor: `${visual.colorPrimario}15`,
                            }}
                          >
                            <div>
                              <p className="font-semibold" style={{ color: visual.colorTexto }}>
                                {h.nombre}
                              </p>
                              {h.direccion && (
                                <p className="text-[10px] opacity-70">{h.direccion}</p>
                              )}
                              {h.telefono && (
                                <a
                                  href={`tel:${h.telefono}`}
                                  className="text-[10px] opacity-80 flex items-center gap-1 mt-0.5 hover:underline"
                                >
                                  <Phone size={10} />
                                  <span>{h.telefono}</span>
                                </a>
                              )}
                            </div>
                            {h.enlace && (
                              <a
                                href={h.enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all hover:bg-black/5"
                                style={{ borderColor: `${visual.colorPrimario}30` }}
                              >
                                Reservar
                              </a>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )
                  }

                  case 'texto_libre': {
                    const texto = seccion.datos?.cuerpoTexto || seccion.datos?.mensaje
                    if (!texto && !esModoEdicionDirecta) return null

                    const alineacion = seccion.datos?.alineacionTexto || 'centro'
                    const tamano = seccion.datos?.tamanoTexto || 'base'
                    const estilo = seccion.datos?.estiloTexto || 'cursiva'

                    const claseAlineacion =
                      alineacion === 'izquierda'
                        ? 'text-left'
                        : alineacion === 'derecha'
                        ? 'text-right'
                        : 'text-center'

                    const claseTamano =
                      tamano === 'sm'
                        ? 'text-xs leading-relaxed'
                        : tamano === 'lg'
                        ? 'text-base sm:text-lg leading-relaxed'
                        : tamano === 'xl'
                        ? 'text-lg sm:text-xl font-medium leading-snug'
                        : 'text-sm leading-relaxed'

                    const claseEstilo =
                      estilo === 'cursiva'
                        ? 'font-serif italic'
                        : estilo === 'serif'
                        ? 'font-serif'
                        : estilo === 'destacado'
                        ? 'font-serif italic font-semibold'
                        : 'font-sans'

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        <div
                          className={`p-4 rounded-xl border relative ${claseAlineacion} ${
                            estilo === 'destacado' ? 'border-amber-400/40' : ''
                          }`}
                          style={{
                            backgroundColor: `${visual.colorPrimario}04`,
                            borderColor: estilo === 'destacado' ? undefined : `${visual.colorPrimario}15`,
                          }}
                        >
                          {/* Selector de alineación rápido en modo edición */}
                          {esModoEdicionDirecta && (
                            <div className="flex items-center justify-end gap-1 mb-2 pb-1.5 border-b border-black/5 opacity-60 hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => alActualizarDatosSeccion?.(seccion.id, 'alineacionTexto', 'izquierda')}
                                className={`p-1 rounded hover:bg-black/5 cursor-pointer ${alineacion === 'izquierda' ? 'text-amber-600 font-bold' : ''}`}
                                title="Alinear a la izquierda"
                              >
                                <AlignLeft size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => alActualizarDatosSeccion?.(seccion.id, 'alineacionTexto', 'centro')}
                                className={`p-1 rounded hover:bg-black/5 cursor-pointer ${alineacion === 'centro' ? 'text-amber-600 font-bold' : ''}`}
                                title="Alinear al centro"
                              >
                                <AlignCenter size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => alActualizarDatosSeccion?.(seccion.id, 'alineacionTexto', 'derecha')}
                                className={`p-1 rounded hover:bg-black/5 cursor-pointer ${alineacion === 'derecha' ? 'text-amber-600 font-bold' : ''}`}
                                title="Alinear a la derecha"
                              >
                                <AlignRight size={11} />
                              </button>
                            </div>
                          )}

                          {(seccion.titulo || esModoEdicionDirecta) && (
                            <div className="flex items-center gap-1.5 mb-2.5 justify-center">
                              <IconoDinamico
                                nombre={seccion.icono || 'feather'}
                                size={13}
                                style={{ color: visual.colorSecundario }}
                              />
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={seccion.titulo || ''}
                                alGuardar={(val) => alActualizarSeccion?.(seccion.id, 'titulo', val)}
                                etiqueta="span"
                                className="text-[10px] tracking-[0.2em] uppercase font-bold opacity-70"
                                style={{ color: visual.colorTexto }}
                                placeholder="Título (opcional)"
                              />
                            </div>
                          )}

                          <InlineEditableText
                            activo={esModoEdicionDirecta}
                            valor={texto || ''}
                            alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'cuerpoTexto', val)}
                            multilinea={true}
                            etiqueta="p"
                            className={`${claseTamano} ${claseEstilo} whitespace-pre-line opacity-90 block`}
                            style={{ color: seccion.datos?.colorTextoPersonalizado || visual.colorTexto }}
                            placeholder="Haz clic aquí para escribir tu texto libre, poema o versículo bíblico..."
                          />

                          {(seccion.datos?.autorMensaje || esModoEdicionDirecta) && (
                            <div className="mt-3">
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={seccion.datos?.autorMensaje || ''}
                                alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'autorMensaje', val)}
                                etiqueta="p"
                                className="text-[10px] uppercase tracking-wider font-semibold opacity-70 block"
                                style={{ color: visual.colorSecundario }}
                                placeholder="— Autor o cita (opcional)"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'imagen_libre': {
                    const url = seccion.datos?.urlImagen
                    if (!url && !esModoEdicionDirecta) return null

                    const formato = seccion.datos?.formatoImagen || 'polaroid'
                    const pie = seccion.datos?.pieImagen

                    // Placeholder en modo edición si aún no se ha cargado foto
                    if (!url && esModoEdicionDirecta) {
                      return (
                        <div key={seccion.id} className="px-6 sm:px-8 py-5 border-b border-black/[0.04]">
                          <div className="p-6 border-2 border-dashed border-amber-400/50 rounded-2xl bg-amber-500/5 text-center flex flex-col items-center justify-center gap-2">
                            <Camera size={24} className="text-amber-600" />
                            <p className="text-xs font-bold text-amber-950">Módulo de Fotografía</p>
                            <label className="cursor-pointer">
                              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                                <Camera size={13} /> Cargar Fotografía
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) =>
                                  manejarSubidaArchivo(e, (newUrl) =>
                                    alActualizarDatosSeccion?.(seccion.id, 'urlImagen', newUrl)
                                  )
                                }
                              />
                            </label>
                            <p className="text-[10px] text-slate-500">Selecciona una imagen desde tu dispositivo</p>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-5 border-b border-black/[0.04]"
                      >
                        {/* Selector de formato rápido en modo edición */}
                        {esModoEdicionDirecta && (
                          <div className="flex items-center justify-center gap-1 mb-3 text-[10px]">
                            {[
                              { id: 'polaroid', label: 'Polaroid' },
                              { id: 'circular', label: 'Circular' },
                              { id: 'banner', label: 'Banner' },
                              { id: 'tarjeta', label: 'Tarjeta' },
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => alActualizarDatosSeccion?.(seccion.id, 'formatoImagen', f.id)}
                                className={`px-2 py-0.5 rounded-full border cursor-pointer font-medium transition-colors ${
                                  formato === f.id
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {formato === 'polaroid' ? (
                          <div className="bg-white p-3 pb-4 rounded-xl shadow-lg border border-black/10 rotate-[-1deg] hover:rotate-0 transition-transform duration-300 max-w-xs mx-auto text-center group/polaroid relative">
                            <div className="aspect-square sm:aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-100 mb-2.5 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={pie || seccion.titulo || 'Fotografía'}
                                className="w-full h-full object-cover"
                              />
                              {esModoEdicionDirecta && (
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/polaroid:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <span className="px-2.5 py-1 rounded-full bg-white text-slate-900 text-[10px] font-bold shadow-md flex items-center gap-1">
                                    <Camera size={12} /> Cambiar
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      manejarSubidaArchivo(e, (newUrl) =>
                                        alActualizarDatosSeccion?.(seccion.id, 'urlImagen', newUrl)
                                      )
                                    }
                                  />
                                </label>
                              )}
                            </div>
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={pie || ''}
                              alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'pieImagen', val)}
                              etiqueta="p"
                              className="font-serif italic text-xs text-slate-800 tracking-wide pt-1 block"
                              placeholder="Escribe un pie de foto..."
                            />
                          </div>
                        ) : formato === 'circular' ? (
                          <div className="text-center group/circular relative">
                            <div
                              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mx-auto shadow-md border-2 mb-2 bg-white relative"
                              style={{ borderColor: visual.colorPrimario }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={pie || seccion.titulo || 'Fotografía'}
                                className="w-full h-full object-cover"
                              />
                              {esModoEdicionDirecta && (
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/circular:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <Camera size={16} className="text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      manejarSubidaArchivo(e, (newUrl) =>
                                        alActualizarDatosSeccion?.(seccion.id, 'urlImagen', newUrl)
                                      )
                                    }
                                  />
                                </label>
                              )}
                            </div>
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={pie || ''}
                              alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'pieImagen', val)}
                              etiqueta="p"
                              className="text-xs opacity-75 italic block"
                              style={{ color: visual.colorTexto }}
                              placeholder="Pie de foto..."
                            />
                          </div>
                        ) : formato === 'banner' ? (
                          <div className="-mx-6 sm:-mx-8 relative overflow-hidden h-44 sm:h-52 bg-slate-100 group/banner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={pie || seccion.titulo || 'Fotografía'}
                              className="w-full h-full object-cover"
                            />
                            {esModoEdicionDirecta && (
                              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10">
                                <span className="px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                                  <Camera size={13} /> Cambiar Banner
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) =>
                                    manejarSubidaArchivo(e, (newUrl) =>
                                      alActualizarDatosSeccion?.(seccion.id, 'urlImagen', newUrl)
                                    )
                                  }
                                />
                              </label>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-center text-xs font-serif italic">
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={pie || ''}
                                alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'pieImagen', val)}
                                etiqueta="span"
                                placeholder="Pie de foto..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl overflow-hidden border border-black/10 shadow-xs bg-white group/tarjeta relative">
                            <div className="aspect-video w-full overflow-hidden relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={pie || seccion.titulo || 'Fotografía'}
                                className="w-full h-full object-cover"
                              />
                              {esModoEdicionDirecta && (
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/tarjeta:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                  <span className="px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                                    <Camera size={13} /> Cambiar Foto
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      manejarSubidaArchivo(e, (newUrl) =>
                                        alActualizarDatosSeccion?.(seccion.id, 'urlImagen', newUrl)
                                      )
                                    }
                                  />
                                </label>
                              )}
                            </div>
                            <div className="p-3 text-center">
                              <InlineEditableText
                                activo={esModoEdicionDirecta}
                                valor={pie || ''}
                                alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'pieImagen', val)}
                                etiqueta="p"
                                className="text-xs opacity-80 block"
                                style={{ color: visual.colorTexto }}
                                placeholder="Pie de foto..."
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  }

                  case 'boton_enlace': {
                    const texto = seccion.datos?.textoBoton || seccion.titulo || 'Visitar Enlace'
                    const url = seccion.datos?.urlBoton || '#'
                    const subtexto = seccion.datos?.subtextoBoton
                    const estilo = seccion.datos?.estiloBoton || 'primario'
                    const icono = seccion.datos?.iconoBoton || seccion.icono || 'link'

                    const estiloDorado = estilo === 'dorado'
                    const estiloBorde = estilo === 'borde'

                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-4 border-b border-black/[0.04]"
                      >
                        <a
                          href={esModoEdicionDirecta ? undefined : url}
                          target={esModoEdicionDirecta ? undefined : '_blank'}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (esModoEdicionDirecta) e.preventDefault()
                          }}
                          className={`w-full py-3.5 px-5 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 shadow-xs active:scale-[0.98] ${
                            estiloDorado
                              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-bold'
                              : estiloBorde
                              ? 'border-2 font-bold hover:bg-black/5'
                              : 'text-white font-bold'
                          }`}
                          style={{
                            backgroundColor:
                              !estiloDorado && !estiloBorde ? 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')' : undefined,
                            borderColor: estiloBorde ? 'var(--color-primario-live, ' + (visual.colorPrimario || '#0F172A') + ')' : undefined,
                            color: estiloBorde ? 'var(--color-texto-live, ' + (visual.colorTexto || '#0F172A') + ')' : undefined,
                          }}
                        >
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <IconoDinamico nombre={icono} size={15} />
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={texto}
                              alGuardar={(val) => {
                                alActualizarSeccion?.(seccion.id, 'titulo', val)
                                alActualizarDatosSeccion?.(seccion.id, 'textoBoton', val)
                              }}
                              etiqueta="span"
                              placeholder="Texto del Botón"
                            />
                            <ExternalLink size={13} className="opacity-70" />
                          </div>
                          {(subtexto || esModoEdicionDirecta) && (
                            <InlineEditableText
                              activo={esModoEdicionDirecta}
                              valor={subtexto || ''}
                              alGuardar={(val) => alActualizarDatosSeccion?.(seccion.id, 'subtextoBoton', val)}
                              etiqueta="span"
                              className="text-[10px] opacity-80 font-normal mt-0.5 block"
                              placeholder="Subtítulo opcional..."
                            />
                          )}
                        </a>

                        {/* Campo de enlace en modo edición */}
                        {esModoEdicionDirecta && (
                          <div className="mt-2 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                            <LinkIcon size={12} className="text-slate-400 shrink-0" />
                            <input
                              type="url"
                              value={seccion.datos?.urlBoton || ''}
                              onChange={(e) => alActualizarDatosSeccion?.(seccion.id, 'urlBoton', e.target.value)}
                              placeholder="Pegar enlace de Spotify, mesa de regalos, YouTube..."
                              className="w-full text-[10px] bg-transparent outline-none font-mono"
                            />
                          </div>
                        )}
                      </motion.div>
                    )
                  }

                  case 'separador_ornamental': {
                    const estilo = seccion.datos?.estiloSeparador || 'linea_dorada'

                    return (
                      <div key={seccion.id} className="relative group/separador-bloque px-6 sm:px-8 py-3 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center justify-center w-full">
                          {estilo === 'linea_dorada' ? (
                            <div className="flex items-center gap-3 w-full max-w-[220px] opacity-80">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400" />
                              <span className="text-amber-500 text-xs">◈</span>
                              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400" />
                            </div>
                          ) : estilo === 'botanico' ? (
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 opacity-80">
                              <span className="text-sm">🌿</span>
                              <div className="h-px w-16 bg-current opacity-30" />
                              <span className="text-xs tracking-widest uppercase font-serif">✧</span>
                              <div className="h-px w-16 bg-current opacity-30" />
                              <span className="text-sm scale-x-[-1] inline-block">🌿</span>
                            </div>
                          ) : estilo === 'onda' ? (
                            <svg width="80" height="12" viewBox="0 0 80 12" fill="none" className="opacity-50">
                              <path d="M0 6C10 0 10 12 20 6C30 0 30 12 40 6C50 0 50 12 60 6C70 0 70 12 80 6" stroke={visual.colorSecundario} strokeWidth="1.5" />
                            </svg>
                          ) : estilo === 'editorial_icono' ? (
                            <div className="flex items-center justify-center gap-3 w-full max-w-[240px] opacity-40">
                              <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                              <IconoDinamico nombre={seccion.icono || 'sparkles'} size={12} />
                              <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                            </div>
                          ) : estilo === 'linea_simple' ? (
                            <div className="w-full max-w-[220px] h-px bg-current opacity-25" style={{ color: visual.colorTexto }} />
                          ) : (
                            <div className="flex items-center gap-2 text-xs tracking-widest text-amber-500 opacity-80">
                              <span>✦</span>
                              <span>✦</span>
                              <span>✦</span>
                            </div>
                          )}
                        </div>

                        {/* Barra de control y eliminación directa */}
                        {esModoEdicionDirecta && (
                          <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] pt-1 z-20">
                            {[
                              { id: 'linea_dorada', label: '◈ Dorado' },
                              { id: 'botanico', label: '🌿 Laurel' },
                              { id: 'onda', label: '〰 Onda' },
                              { id: 'diamantes', label: '✦ Diamantes' },
                              { id: 'editorial_icono', label: '✧ Filete' },
                              { id: 'linea_simple', label: '─ Sutil' },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => alActualizarDatosSeccion?.(seccion.id, 'estiloSeparador', s.id)}
                                className={`px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                                  estilo === s.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}

                            {/* Botón directo de eliminación de separador */}
                            <button
                              type="button"
                              onClick={() => alEliminarSeccion?.(seccion.id)}
                              className="px-2.5 py-0.5 rounded-full bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-rose-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold shadow-2xs"
                              title="Eliminar este separador de la invitación"
                            >
                              <Trash2 size={10} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }

                  case 'confirmacion_rsvp': {
                    const metodoConfirmacion =
                      seccion.datos?.metodoConfirmacion ||
                      evento.metodoConfirmacion ||
                      'tarjeton'
                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="w-full"
                      >
                        <ModuloRsvp
                          evento={evento}
                          visual={visual}
                          invitado={invitado}
                          esModoVistaPrevia={esModoVistaPrevia}
                          esModoEdicionDirecta={esModoEdicionDirecta}
                          urlWhatsApp={urlWhatsApp}
                          subtitulo={seccion.subtitulo}
                          alActualizarSubtitulo={(nuevoSubtitulo) => {
                            alActualizarSeccion?.(seccion.id, 'subtitulo', nuevoSubtitulo)
                          }}
                          metodoConfirmacion={metodoConfirmacion}
                        />
                      </motion.div>
                    )
                  }
                  default:
                    return null
                }
              }

              const bloque = renderizarBloque()
              if (!bloque && !esModoEdicionDirecta) return null

              return (
                <Fragment key={seccion.id}>
                  {esModoEdicionDirecta && index > 0 && (
                    <BarraInsercionEntreBloques
                      indice={index}
                      alInsertar={(idx, tipo) => alInsertarSeccionEnIndice?.(idx, tipo)}
                    />
                  )}

                  <div
                    className={`relative ${
                      esModoEdicionDirecta
                        ? 'group/seccion hover:ring-2 hover:ring-slate-900/30 rounded-xl transition-all'
                        : ''
                    }`}
                  >
                    {esModoEdicionDirecta && (
                      <BarraHerramientasBloque
                        indice={index}
                        totalSecciones={listaSecciones.length}
                        esCabecera={seccion.tipo === 'cabecera'}
                        alMover={(dir) => alMoverSeccion?.(index, dir)}
                        alEliminar={() => alEliminarSeccion?.(seccion.id)}
                      />
                    )}

                    {bloque}
                  </div>

                  {esModoEdicionDirecta && index === listaSecciones.length - 1 && (
                    <BarraInsercionEntreBloques
                      indice={index + 1}
                      alInsertar={(idx, tipo) => alInsertarSeccionEnIndice?.(idx, tipo)}
                    />
                  )}
                </Fragment>
              )
            })}
          </div>

            {/* Pie de página institucional */}
            <div className="pb-6 text-center opacity-40 hover:opacity-80 transition-opacity">
              {esModoEdicionDirecta ? (
                <span
                  className="text-[10px] uppercase tracking-[0.25em] font-medium"
                  style={{ color: visual.colorTexto }}
                >
                  Tarjetón Studio
                </span>
              ) : (
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] uppercase tracking-[0.25em] font-medium hover:underline"
                  style={{ color: visual.colorTexto }}
                >
                  Tarjetón Studio
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
