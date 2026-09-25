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
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border border-black/5 text-center space-y-4 text-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-xs">
            <MessageCircle size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold font-serif text-slate-900">
              Confirmación vía WhatsApp
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
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

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border border-black/5 text-slate-800">
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
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: estado === 'confirmado' ? '#DCFCE7' : '#FEE2E2',
                  color: estado === 'confirmado' ? '#15803D' : '#B91C1C',
                }}
              >
                {estado === 'confirmado' ? <CheckCircle2 size={28} /> : <X size={28} />}
              </div>

              <div>
                <h4 className="text-base font-bold font-serif text-slate-900">
                  {estado === 'confirmado' ? '¡Asistencia Registrada!' : 'Respuesta Registrada'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {estado === 'confirmado'
                    ? `Muchas gracias, ${nombre || 'invitado'}. Te esperamos con gusto (${cupos} ${cupos === 1 ? 'cupo' : 'cupos'}).`
                    : `Lamentamos que no puedas acompañarnos, ${nombre || 'invitado'}. ¡Gracias por avisarnos!`}
                </p>
                {fechaConfirmacion && (
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Registrado el {new Date(fechaConfirmacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMostrarFormularioEdicion(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Modificar mi respuesta</span>
                </button>

                {metodoConfirmacion === 'ambos' && urlWhatsApp && !esModoVistaPrevia && (
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                      <UserCheck size={14} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {invitado.nombre}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Pase autorizado para {invitado.pases} {invitado.pases === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
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
                    placeholder="Ej. Dra. Marcela Gómez"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all bg-white text-slate-900 ${
                      errorNombre ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users size={13} />
                    <span>¿Cuántos cupos confirmas?</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-800 font-mono">
                    {cupos} {cupos === 1 ? 'asistente' : 'asistentes'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pasesMaximos }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCupos(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        cupos === num
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. LUEGO EL MENSAJE O RESTRICCIONES */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1 flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  <span>Mensaje o restricciones (opcional):</span>
                </label>
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej. Menú vegetariano, felicitaciones..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all bg-white text-slate-900"
                />
              </div>

              {/* 4. POR ÚLTIMO LA PREGUNTA: ¿Asistirás al evento? CON SÍ Y NO QUE CONFIRMA DIRECTAMENTE */}
              <div className="pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5 text-center">
                  ¿Asistirás al evento?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={enviando}
                    onClick={() => ejecutarConfirmacionDirecta('confirmado')}
                    className="py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Check size={15} className="text-emerald-600 stroke-[2.5]" />
                    <span>{enviando && estado === 'confirmado' ? 'Guardando...' : 'Sí, asistiré'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={enviando}
                    onClick={() => ejecutarConfirmacionDirecta('no_asiste')}
                    className="py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs hover:bg-rose-100 active:scale-[0.98] disabled:opacity-50"
                  >
                    <X size={15} className="text-rose-600 stroke-[2.5]" />
                    <span>{enviando && estado === 'no_asiste' ? 'Guardando...' : 'No podré asistir'}</span>
                  </button>
                </div>
              </div>

              {/* Botón secundario para enviar por WhatsApp sólo si el método es híbrido (ambos) */}
              {metodoConfirmacion === 'ambos' && urlWhatsApp && !esModoVistaPrevia && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <span>¿Prefieres notificar vía WhatsApp directo? Haz clic aquí</span>
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
