'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DetalleEvento, ConfiguracionVisual, Invitado, SeccionModular } from '@/types/invitation'
import { EventCountdown } from './event-countdown'
import { BackgroundEffects } from './background-effects'
import { construirUrlWhatsApp } from '@/lib/event-utils'
import { generarSeccionesPorDefecto } from '@/lib/modular-defaults'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { AdBanner } from '@/components/ads/ad-banner'
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
} from 'lucide-react'

interface DynamicInvitationCardProps {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  invitado?: Invitado | null
  esModoVistaPrevia?: boolean
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
}: DynamicInvitationCardProps) {
  const [cuentaCopiada, setCuentaCopiada] = useState(false)
  const urlWhatsApp = construirUrlWhatsApp(evento, invitado || undefined)
  const esPlural = invitado ? invitado.esPlural : false
  const nombreInvitado = invitado?.nombre || 'Invitado de Honor'

  // Mapeo tipográfico sobrio
  const claseFuenteTitulo =
    visual.fuenteTitulo === 'playfair'
      ? 'font-serif'
      : visual.fuenteTitulo === 'cormorant'
      ? 'font-serif italic font-normal'
      : visual.fuenteTitulo === 'cinzel'
      ? 'font-serif uppercase tracking-[0.18em]'
      : visual.fuenteTitulo === 'montserrat'
      ? 'font-sans font-bold tracking-tight'
      : visual.fuenteTitulo === 'dancing'
      ? 'font-serif italic tracking-wide'
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

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: visual.colorFondo }}
    >
      {/* Micro-textura y efectos sutiles */}
      <BackgroundEffects efecto={visual.efectoFondo} colorAcento={visual.colorSecundario} />

      {/* Tarjeta Central Modular */}
      <div className="relative w-full max-w-[430px] z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-[1px] shadow-2xl transition-all"
          style={{
            background: `linear-gradient(180deg, ${visual.colorSecundario}44 0%, ${visual.colorPrimario}22 50%, ${visual.colorSecundario}33 100%)`,
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-white/60 dark:border-black/40"
            style={{ backgroundColor: visual.colorTarjeta }}
          >
            {/* Renderizado de Bloques Modulares Dinámicos */}
            <div className="flex flex-col">
              {listaSecciones.map((seccion, index) => {
                switch (seccion.tipo) {
                  case 'cabecera': {
                    const imagenPortada = seccion.datos?.imagenPortada || evento.imagenPortada
                    const imagenRetrato = seccion.datos?.imagenRetrato || evento.imagenRetrato

                    return (
                      <div
                        key={seccion.id}
                        className="relative text-center flex flex-col items-center border-b border-black/[0.06] dark:border-white/[0.08]"
                        style={{
                          background: `linear-gradient(180deg, ${visual.colorPrimario}0A 0%, transparent 100%)`,
                        }}
                      >
                        {/* Fotografía de Portada Superior si está definida */}
                        {imagenPortada && (
                          <div className="w-full h-36 sm:h-44 relative overflow-hidden bg-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagenPortada}
                              alt={evento.titulo}
                              className="w-full h-full object-cover object-center"
                            />
                            <div
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"
                              style={{
                                background: `linear-gradient(180deg, transparent 40%, ${visual.colorTarjeta} 100%)`,
                              }}
                            />
                          </div>
                        )}

                        <div className={`px-6 sm:px-8 pb-7 flex flex-col items-center w-full ${imagenPortada ? 'pt-3' : 'pt-8'}`}>
                          {/* Fotografía / Logotipo Central si está configurado */}
                          {imagenRetrato && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md mb-3 -mt-8 relative z-10 bg-white"
                              style={{ borderColor: visual.colorPrimario }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imagenRetrato}
                                alt="Anfitrión"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Badge institucional de convocatoria */}
                          <motion.div
                            custom={index}
                            initial="oculto"
                            animate="visible"
                            variants={animacionAparicion}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3"
                            style={{
                              borderColor: `${visual.colorSecundario}55`,
                              backgroundColor: `${visual.colorSecundario}12`,
                              color: visual.colorTexto,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: visual.colorSecundario }}
                            />
                            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">
                              {invitado ? 'Pase Protocolario Personal' : 'Convocatoria Oficial'}
                            </span>
                          </motion.div>

                          {/* Nombre del Invitado o Título Principal */}
                          <motion.h2
                            custom={index + 0.5}
                            initial="oculto"
                            animate="visible"
                            variants={animacionAparicion}
                            className={`text-2xl sm:text-3xl leading-snug tracking-tight ${claseFuenteTitulo}`}
                            style={{ color: visual.colorTexto }}
                          >
                            {invitado ? nombreInvitado : seccion.titulo || evento.titulo}
                          </motion.h2>

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

                          {/* Anfitriones y Subtítulo */}
                          <div className="mt-4 text-center">
                            <p
                              className="text-[10px] tracking-[0.25em] uppercase font-semibold opacity-70"
                              style={{ color: visual.colorTexto }}
                            >
                              {seccion.subtitulo || evento.subtitulo || 'Tiene el honor de invitarle a'}
                            </p>
                            <h3
                              className={`text-lg sm:text-xl font-bold mt-1 ${claseFuenteTitulo}`}
                              style={{ color: visual.colorTexto }}
                            >
                              {evento.anfitriones || evento.titulo}
                            </h3>
                          </div>

                          {/* Filete divisorio editorial */}
                          <div className="mt-5 flex items-center justify-center gap-3 w-full opacity-30">
                            <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                            <IconoDinamico nombre={seccion.icono || 'sparkles'} size={12} />
                            <div className="h-px flex-1 bg-current" style={{ color: visual.colorTexto }} />
                          </div>
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
                          <p className="text-[10px] tracking-[0.25em] uppercase font-semibold opacity-60 text-center">
                            {seccion.titulo || 'Tiempo Restante'}
                          </p>
                        </div>
                        <EventCountdown
                          fechaIso={evento.fechaEvento}
                          colorTexto={visual.colorTexto}
                          colorAcento={visual.colorSecundario}
                        />
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
                        <div className="grid grid-cols-2 gap-2.5 w-full">
                          <div
                            className="flex flex-col items-center justify-center p-3 rounded-xl text-center border"
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
                            <span
                              className="text-xs font-semibold mt-0.5"
                              style={{ color: visual.colorTexto }}
                            >
                              {evento.horaEvento || 'Por definir'}
                            </span>
                          </div>
                        </div>

                        {/* Botón sincronizar con Google Calendar */}
                        <a
                          href={enlaceCalendar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 border transition-all hover:bg-black/5"
                          style={{
                            borderColor: `${visual.colorPrimario}20`,
                            color: visual.colorTexto,
                          }}
                        >
                          <CalendarPlus size={13} style={{ color: visual.colorSecundario }} />
                          <span>Guardar en mi Calendario</span>
                        </a>
                      </motion.div>
                    )
                  }

                  case 'itinerario': {
                    const hitos = seccion.datos?.itinerario || []
                    if (hitos.length === 0) return null

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
                          <div>
                            <p
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: visual.colorTexto }}
                            >
                              {seccion.titulo || 'Itinerario'}
                            </p>
                            {seccion.subtitulo && (
                              <p className="text-[10px] opacity-60">{seccion.subtitulo}</p>
                            )}
                          </div>
                        </div>

                        {/* Cronograma vertical */}
                        <div className="space-y-3 pl-1 relative border-l-2 ml-3" style={{ borderColor: `${visual.colorPrimario}20` }}>
                          {hitos.map((hito) => (
                            <div key={hito.id} className="relative pl-5">
                              {/* Punto o icono del hito */}
                              <div
                                className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full border bg-white flex items-center justify-center shadow-xs"
                                style={{
                                  borderColor: visual.colorSecundario,
                                  color: visual.colorSecundario,
                                }}
                              >
                                <IconoDinamico nombre={hito.icono || 'sparkles'} size={10} />
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span
                                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${visual.colorPrimario}10`,
                                    color: visual.colorPrimario,
                                  }}
                                >
                                  {hito.hora}
                                </span>
                                <h4
                                  className="text-xs font-semibold"
                                  style={{ color: visual.colorTexto }}
                                >
                                  {hito.titulo}
                                </h4>
                              </div>
                              {hito.descripcion && (
                                <p className="text-[11px] opacity-70 mt-0.5 leading-relaxed">
                                  {hito.descripcion}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
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

                    if (!direccion) return null

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
                            <p className="text-[9px] uppercase tracking-wider font-semibold opacity-60">
                              {seccion.titulo || 'Sede del Evento'}
                            </p>
                            <p
                              className="text-xs font-semibold mt-0.5"
                              style={{ color: visual.colorTexto }}
                            >
                              {nombreLugar}
                            </p>
                            {seccion.datos?.detallesAcceso && (
                              <p className="text-[10px] opacity-70 mt-1 leading-normal">
                                {seccion.datos.detallesAcceso}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botones de Navegación Google Maps & Waze */}
                        <div className="grid grid-cols-2 gap-2">
                          {enlaceMapa && (
                            <a
                              href={enlaceMapa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all hover:bg-black/5"
                              style={{
                                borderColor: `${visual.colorPrimario}33`,
                                color: visual.colorTexto,
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
                              className="py-2.5 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 border transition-all hover:bg-black/5"
                              style={{
                                borderColor: `${visual.colorPrimario}33`,
                                color: visual.colorTexto,
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

                    if (!etiqueta) return null

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
                              <p className="text-[9px] uppercase tracking-wider font-semibold opacity-60">
                                {seccion.titulo || 'Código de Etiqueta'}
                              </p>
                              <p
                                className="text-xs font-semibold"
                                style={{ color: visual.colorTexto }}
                              >
                                {etiqueta}
                              </p>
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

                          {notas && (
                            <p className="text-[10px] opacity-70 italic">{notas}</p>
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
                              <p className="text-[9px] uppercase tracking-wider font-semibold opacity-60">
                                {seccion.titulo || 'Detalles de Cortesía'}
                              </p>
                              {banco && (
                                <p className="font-semibold" style={{ color: visual.colorTexto }}>
                                  {banco} · {tipoCuenta || 'Cuenta'}
                                </p>
                              )}
                            </div>
                          </div>

                          {numeroCuenta && (
                            <div className="flex items-center justify-between bg-white/80 dark:bg-black/20 p-2 rounded-lg border border-black/5 text-xs">
                              <div>
                                <span className="text-[9px] opacity-60 uppercase block">
                                  Número de Cuenta:
                                </span>
                                <span className="font-mono font-bold text-xs">{numeroCuenta}</span>
                                {titular && (
                                  <span className="text-[10px] opacity-70 block">
                                    Titular: {titular}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => copiarCuenta(numeroCuenta)}
                                className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
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
                            </div>
                          )}

                          {enlaceLista && (
                            <a
                              href={enlaceLista}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-center border flex items-center justify-center gap-1.5 transition-all hover:bg-black/5"
                              style={{ borderColor: `${visual.colorPrimario}30`, color: visual.colorTexto }}
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
                          <p
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: visual.colorTexto }}
                          >
                            {seccion.titulo || 'Galería de Momentos'}
                          </p>
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

                    if (!mensaje) return null

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
                          <p
                            className="text-xs sm:text-[13px] leading-relaxed italic opacity-90"
                            style={{ color: visual.colorTexto }}
                          >
                            &ldquo;{mensaje}&rdquo;
                          </p>
                          {autor && (
                            <p
                              className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mt-2"
                              style={{ color: visual.colorSecundario }}
                            >
                              — {autor}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )
                  }

                  case 'hospedaje': {
                    const hoteles = seccion.datos?.hoteles || []
                    if (hoteles.length === 0) return null

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
                          <p
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: visual.colorTexto }}
                          >
                            {seccion.titulo || 'Hospedaje Recomendado'}
                          </p>
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

                  case 'confirmacion_rsvp': {
                    return (
                      <motion.div
                        key={seccion.id}
                        custom={index}
                        initial="oculto"
                        animate="visible"
                        variants={animacionAparicion}
                        className="px-6 sm:px-8 py-6 flex flex-col items-center"
                      >
                        {seccion.subtitulo && (
                          <p
                            className="text-center text-[11px] opacity-75 mb-3 leading-relaxed max-w-xs"
                            style={{ color: visual.colorTexto }}
                          >
                            {seccion.subtitulo}
                          </p>
                        )}
                        <a
                          href={esModoVistaPrevia ? undefined : urlWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-6 rounded-xl font-sans font-semibold text-white text-xs tracking-wider uppercase transition-all active:scale-[0.98] shadow-md hover:opacity-90 flex items-center justify-center gap-2.5 text-center cursor-pointer"
                          style={{
                            backgroundColor: visual.colorPrimario,
                          }}
                        >
                          <WhatsAppIcon />
                          <span>Confirmar Asistencia en WhatsApp</span>
                        </a>
                      </motion.div>
                    )
                  }

                  default:
                    return null
                }
              })}
            </div>

            {/* Banner publicitario sobrio para cuentas libres */}
            <div className="px-6 sm:px-8 pb-4">
              <AdBanner esPremium={evento.esPremium} slotId="corporate-card-slot" />
            </div>

            {/* Pie de página institucional */}
            <div className="pb-6 text-center opacity-40 hover:opacity-80 transition-opacity">
              <a
                href="/"
                className="text-[10px] uppercase tracking-[0.25em] font-medium"
                style={{ color: visual.colorTexto }}
              >
                InvitacionesYa Studio
              </a>
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
