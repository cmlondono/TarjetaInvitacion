'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DetalleEvento, ConfiguracionVisual, Invitado, EstadoConfirmacion, MetodoConfirmacion } from '@/types/invitation'
import { InvitadoRepositorio } from '@/lib/storage'
import { InlineEditableText } from '@/components/editor/inline-editable-text'
import { Check, X, Users, MessageSquare, CheckCircle2, UserCheck, RefreshCw, MessageCircle } from 'lucide-react'

interface ModuloRsvpProps {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  invitado?: Invitado | null
  esModoVistaPrevia?: boolean
  esModoEdicionDirecta?: boolean
  urlWhatsApp?: string
  subtitulo?: string
  alActualizarSubtitulo?: (nuevoSubtitulo: string) => void
  metodoConfirmacion?: MetodoConfirmacion
}

/**
 * Determina si un color hexadecimal es percibido como claro u oscuro
 */
function esColorClaro(hex?: string): boolean {
  if (!hex || hex === 'transparent') return true
  const limpio = hex.replace('#', '')
  if (limpio.length < 6) return true
  const r = parseInt(limpio.substring(0, 2), 16) || 0
  const g = parseInt(limpio.substring(2, 4), 16) || 0
  const b = parseInt(limpio.substring(4, 6), 16) || 0
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 145
}

export function ModuloRsvp({
  evento,
  visual,
  invitado,
  esModoVistaPrevia = false,
  esModoEdicionDirecta = false,
  urlWhatsApp = '',
  subtitulo,
  alActualizarSubtitulo,
  metodoConfirmacion = 'tarjeton',
}: ModuloRsvpProps) {
  const pasesMaximos = Math.max(1, invitado?.pases || 2)
  const [nombre, setNombre] = useState(invitado?.nombre || '')
  const [estado, setEstado] = useState<EstadoConfirmacion>('confirmado')
  const [cupos, setCupos] = useState<number>(pasesMaximos)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmadoExitoso, setConfirmadoExitoso] = useState(false)
  const [fechaConfirmacion, setFechaConfirmacion] = useState<string | null>(null)
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false)
  const [errorNombre, setErrorNombre] = useState(false)

  // Clave de almacenamiento local para persistir la respuesta en el navegador del invitado
  const storageKey = `tarjeton_rsvp_${evento.id}_${invitado?.codigoAcceso || 'anon'}`

  useEffect(() => {
    // Verificar si ya había confirmado previamente
    try {
      const guardado = localStorage.getItem(storageKey)
      if (guardado) {
        const parsed = JSON.parse(guardado)
        setConfirmadoExitoso(true)
        setEstado(parsed.estadoConfirmacion || 'confirmado')
        setCupos(parsed.cuposConfirmados !== undefined ? parsed.cuposConfirmados : (parsed.cupos || 1))
        setFechaConfirmacion(parsed.fechaConfirmacion || null)
        if (parsed.nombre) setNombre(parsed.nombre)
      } else if (invitado?.confirmado) {
        setConfirmadoExitoso(true)
        setEstado((invitado.estadoConfirmacion as EstadoConfirmacion) || 'confirmado')
        setCupos(invitado.cuposConfirmados || invitado.pases || 1)
        setFechaConfirmacion(invitado.fechaConfirmacion || null)
      }
    } catch {}
  }, [storageKey, invitado])

  // Confirmación directa con un solo clic en Sí o No (sin botón extra)
  const ejecutarConfirmacionDirecta = async (decision: 'confirmado' | 'no_asiste') => {
    const nombreFinal = (invitado?.nombre || nombre).trim()
    if (!nombreFinal) {
      setErrorNombre(true)
      return
    }

    setEnviando(true)
    setEstado(decision)

    const cuposFinales = decision === 'confirmado' ? Math.max(1, cupos) : 0
    const datosConfirmacion = {
      estadoConfirmacion: decision,
      cuposConfirmados: cuposFinales,
      mensajeConfirmacion: mensaje.trim() || undefined,
    }

    // 1. Guardar en repositorio local (patrón híbrido)
    InvitadoRepositorio.actualizarConfirmacion(
      evento.id,
      {
        id: invitado?.id,
        codigoAcceso: invitado?.codigoAcceso,
        nombre: nombreFinal,
      },
      datosConfirmacion
    )

    // 2. Enviar a la API para persistencia remota en servidor y Supabase
    try {
      const res = await fetch('/api/invitados/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: evento.id,
          slugPublico: evento.slugPublico,
          id: invitado?.id,
          codigoAcceso: invitado?.codigoAcceso,
          nombre: nombreFinal,
          ...datosConfirmacion,
        }),
      })
      const data = await res.json()
      if (data.fechaConfirmacion) {
        setFechaConfirmacion(data.fechaConfirmacion)
      }
    } catch (err) {
      console.warn('Registro local completado. Sincronización en segundo plano.')
    }

    // 3. Persistir en el navegador del invitado
    const ahora = new Date().toISOString()
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          nombre: nombreFinal,
          ...datosConfirmacion,
          fechaConfirmacion: ahora,
        })
      )
    } catch {}

    // Notificar a componentes padre (como SobreAperturaAnimado) de la confirmación
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tarjeton_rsvp_confirmado', {
          detail: {
            eventoId: evento.id,
            decision,
            cupos: cuposFinales,
          },
        })
      )
    }

    setFechaConfirmacion(ahora)
    setConfirmadoExitoso(true)
    setMostrarFormularioEdicion(false)
    setEnviando(false)
  }

  // Variables de color armonizadas con la tarjeta y fondo de la invitación
  const fondoTarjeta = visual.colorTarjeta || '#FFFFFF'
  const textoTarjeta = visual.colorTexto || '#0F172A'
  const colorPrimario = visual.colorPrimario || '#0F172A'
  const colorSecundario = visual.colorSecundario || '#D4AF37'
  const esClaro = esColorClaro(fondoTarjeta)

  // Fondo dinámico adaptativo para que nunca quede en blanco fijo si el usuario cambia el tema
  const estiloCajaAdaptativa: React.CSSProperties = {
    background: esClaro
      ? 'color-mix(in srgb, var(--color-tarjeta-live, ' + fondoTarjeta + ') 75%, rgba(255, 255, 255, 0.85))'
      : 'color-mix(in srgb, var(--color-tarjeta-live, ' + fondoTarjeta + ') 75%, rgba(15, 23, 42, 0.85))',
    borderColor: esClaro ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
    color: textoTarjeta,
  }

  // ════════════ MODO 1: CONFIRMACIÓN EXCLUSIVA POR WHATSAPP ════════════
  if (metodoConfirmacion === 'whatsapp') {
    return (
      <div className="w-full px-5 sm:px-8 py-7 flex flex-col items-center">
        {(subtitulo || esModoEdicionDirecta) && (
          <div className="w-full max-w-sm mb-4 text-center">
            <InlineEditableText
              activo={esModoEdicionDirecta}
              valor={subtitulo || 'Agradecemos confirmar su asistencia a la mayor brevedad posible'}
              alGuardar={(nuevo) => alActualizarSubtitulo?.(nuevo)}
              multilinea={true}
              etiqueta="p"
              className="text-center text-xs opacity-75 leading-relaxed block"
              style={{ color: visual.colorTexto }}
              placeholder="Agradecemos confirmar su asistencia a la mayor brevedad posible"
            />
          </div>
        )}
        <div
          className="w-full max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border text-center space-y-4"
          style={estiloCajaAdaptativa}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/25 shadow-xs">
            <MessageCircle size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold font-serif" style={{ color: textoTarjeta }}>
              Confirmación vía WhatsApp
            </h4>
            <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed opacity-75" style={{ color: textoTarjeta }}>
              Notifique su asistencia al anfitrión de forma inmediata con un mensaje protocolario en un toque.
            </p>
          </div>

          <a
            href={esModoVistaPrevia ? undefined : urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl font-sans font-semibold text-white text-xs tracking-wider uppercase transition-all active:scale-[0.98] shadow-md hover:opacity-95 flex items-center justify-center gap-2 text-center cursor-pointer bg-[#25D366]"
          >
            <MessageCircle size={16} />
            <span>Confirmar Asistencia en WhatsApp</span>
          </a>
        </div>
      </div>
    )
  }

  // ════════════ MODO 2 & 3: FORMULARIO DIGITAL TARJETÓN O HÍBRIDO ════════════
  return (
    <div className="w-full px-5 sm:px-8 py-7 flex flex-col items-center">
      {/* Encabezado editorial de la sección */}
      {(subtitulo || esModoEdicionDirecta) && (
        <div className="w-full max-w-sm mb-4 text-center">
          <InlineEditableText
            activo={esModoEdicionDirecta}
            valor={subtitulo || 'Agradecemos confirmar su asistencia a la mayor brevedad posible'}
            alGuardar={(nuevo) => alActualizarSubtitulo?.(nuevo)}
            multilinea={true}
            etiqueta="p"
            className="text-center text-xs opacity-75 leading-relaxed block"
            style={{ color: visual.colorTexto }}
            placeholder="Agradecemos confirmar su asistencia a la mayor brevedad posible"
          />
        </div>
      )}

      <div
        className="w-full max-w-md backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border"
        style={estiloCajaAdaptativa}
      >
        <AnimatePresence mode="wait">
          {confirmadoExitoso && !mostrarFormularioEdicion ? (
            /* ════════════ PANTALLA: RESPUESTA YA REGISTRADA ════════════ */
            <motion.div
              key="confirmado"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-2 space-y-4"
            >
              <div
                className="w-13 h-13 rounded-full mx-auto flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: estado === 'confirmado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: estado === 'confirmado' ? '#10B981' : '#EF4444',
                  border: `1px solid ${estado === 'confirmado' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}
              >
                {estado === 'confirmado' ? <CheckCircle2 size={30} /> : <X size={30} />}
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-bold font-serif" style={{ color: textoTarjeta }}>
                  {estado === 'confirmado' ? '¡Asistencia Registrada!' : 'Respuesta Registrada'}
                </h4>
                <p className="text-xs mt-1.5 leading-relaxed opacity-80" style={{ color: textoTarjeta }}>
                  {estado === 'confirmado'
                    ? `Muchas gracias, ${nombre || 'invitado'}. Te esperamos con gusto (${cupos} ${cupos === 1 ? 'cupo confirmado' : 'cupos confirmados'}).`
                    : `Lamentamos que no puedas acompañarnos, ${nombre || 'invitado'}. ¡Gracias por avisarnos!`}
                </p>
                {fechaConfirmacion && (
                  <p className="text-[10px] mt-1.5 font-mono opacity-60" style={{ color: textoTarjeta }}>
                    Registrado el {new Date(fechaConfirmacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMostrarFormularioEdicion(true)}
                  className="text-xs font-semibold transition-all flex items-center gap-1.5 py-2 px-3.5 rounded-xl border cursor-pointer hover:opacity-80 active:scale-95 shadow-xs"
                  style={{
                    background: esClaro ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                    borderColor: esClaro ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                    color: textoTarjeta,
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Modificar mi respuesta</span>
                </button>

                {metodoConfirmacion === 'ambos' && urlWhatsApp && !esModoVistaPrevia && (
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer shadow-xs"
                  >
                    <MessageCircle size={14} />
                    <span>Notificar también por WhatsApp</span>
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            /* ════════════ FORMULARIO EN EL ORDEN EXACTO SOLICITADO ════════════ */
            <motion.div
              key="formulario"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {/* 1. NOMBRE Y PASE (como ya está y donde está) */}
              {invitado?.nombre ? (
                <div
                  className="rounded-xl p-3 sm:p-3.5 flex items-center justify-between border"
                  style={{
                    background: esClaro ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.06)',
                    borderColor: esClaro ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: colorPrimario }}
                    >
                      <UserCheck size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-bold block truncate" style={{ color: textoTarjeta }}>
                        {invitado.nombre}
                      </span>
                      <span className="text-[10px] sm:text-[11px] opacity-70 block" style={{ color: textoTarjeta }}>
                        Pase autorizado para {invitado.pases} {invitado.pases === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider block mb-1.5"
                    style={{ color: textoTarjeta, opacity: 0.85 }}
                  >
                    Tu Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value)
                      if (errorNombre) setErrorNombre(false)
                    }}
                    placeholder="Ej. Marcela Gómez"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all placeholder:opacity-50 ${
                      errorNombre ? 'ring-2 ring-rose-500 border-rose-500' : ''
                    }`}
                    style={{
                      background: esClaro ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                      color: textoTarjeta,
                      borderColor: errorNombre ? '#EF4444' : esClaro ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  {errorNombre && (
                    <p className="text-[10px] text-rose-500 mt-1 font-medium">
                      Por favor, escribe tu nombre antes de confirmar.
                    </p>
                  )}
                </div>
              )}

              {/* 2. LUEGO LOS CUPOS DE CONFIRMACIÓN */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: textoTarjeta, opacity: 0.85 }}
                  >
                    <Users size={14} style={{ color: colorSecundario || colorPrimario }} />
                    <span>¿Cuántos cupos confirmas?</span>
                  </label>
                  <span className="text-[11px] font-bold font-mono" style={{ color: colorPrimario }}>
                    {cupos} {cupos === 1 ? 'asistente' : 'asistentes'}
                  </span>
                </div>

                {pasesMaximos > 1 ? (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pasesMaximos }, (_, i) => i + 1).map((num) => {
                      const seleccionado = cupos === num
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCupos(num)}
                          className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 shadow-xs"
                          style={{
                            backgroundColor: seleccionado
                              ? colorPrimario
                              : esClaro
                              ? 'rgba(255, 255, 255, 0.7)'
                              : 'rgba(255, 255, 255, 0.08)',
                            color: seleccionado ? '#FFFFFF' : textoTarjeta,
                            borderColor: seleccionado
                              ? colorPrimario
                              : esClaro
                              ? 'rgba(0, 0, 0, 0.12)'
                              : 'rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    className="py-2 px-3 rounded-xl border text-xs flex items-center justify-between"
                    style={{
                      background: esClaro ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: esClaro ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                      color: textoTarjeta,
                    }}
                  >
                    <span className="opacity-80">Pase individual reservado</span>
                    <span className="font-bold font-mono">1 cupo</span>
                  </div>
                )}
              </div>

              {/* 3. LUEGO EL MENSAJE O RESTRICCIONES */}
              <div>
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5"
                  style={{ color: textoTarjeta, opacity: 0.85 }}
                >
                  <MessageSquare size={14} style={{ color: colorSecundario || colorPrimario }} />
                  <span>Mensaje o restricciones (opcional):</span>
                </label>
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej. Menú vegetariano, felicitaciones..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all placeholder:opacity-50"
                  style={{
                    background: esClaro ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                    color: textoTarjeta,
                    borderColor: esClaro ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              </div>

              {/* 4. POR ÚLTIMO LA PREGUNTA: ¿Asistirás al evento? CON EL SÍ Y EL NO QUE CONFIRMA DIRECTAMENTE */}
              <div className="pt-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-2 text-center"
                  style={{ color: textoTarjeta, opacity: 0.9 }}
                >
                  ¿Asistirás al evento?
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* Botón SÍ, ASISTIRÉ (Confirma directamente al tocar) */}
                  <button
                    type="button"
                    disabled={enviando}
                    onClick={() => ejecutarConfirmacionDirecta('confirmado')}
                    className="py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer shadow-md text-white disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Check size={16} className="stroke-[2.5]" />
                    <span>{enviando && estado === 'confirmado' ? 'Guardando...' : 'Sí, asistiré'}</span>
                  </button>

                  {/* Botón NO PODRÉ ASISTIR (Confirma directamente al tocar) */}
                  <button
                    type="button"
                    disabled={enviando}
                    onClick={() => ejecutarConfirmacionDirecta('no_asiste')}
                    className="py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer border disabled:opacity-60"
                    style={{
                      background: esClaro ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.15)',
                      borderColor: esClaro ? 'rgba(244, 63, 94, 0.25)' : 'rgba(244, 63, 94, 0.4)',
                      color: esClaro ? '#BE123C' : '#FDA4AF',
                    }}
                  >
                    <X size={16} className="stroke-[2.5]" />
                    <span>{enviando && estado === 'no_asiste' ? 'Guardando...' : 'No podré asistir'}</span>
                  </button>
                </div>
              </div>

              {/* Enlace alternativo para notificar por WhatsApp si el método es híbrido (ambos) */}
              {metodoConfirmacion === 'ambos' && urlWhatsApp && !esModoVistaPrevia && (
                <div
                  className="pt-2 text-center border-t mt-3"
                  style={{ borderColor: esClaro ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)' }}
                >
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] opacity-70 hover:opacity-100 font-medium inline-flex items-center gap-1 transition-opacity"
                    style={{ color: textoTarjeta }}
                  >
                    <span>¿Prefieres responder vía WhatsApp directo? Haz clic aquí</span>
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
