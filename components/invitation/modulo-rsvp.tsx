'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DetalleEvento, ConfiguracionVisual, Invitado, EstadoConfirmacion, MetodoConfirmacion } from '@/types/invitation'
import { InvitadoRepositorio } from '@/lib/storage'
import { Check, X, Users, MessageSquare, Send, CheckCircle2, UserCheck, RefreshCw, MessageCircle } from 'lucide-react'

interface ModuloRsvpProps {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  invitado?: Invitado | null
  esModoVistaPrevia?: boolean
  urlWhatsApp?: string
  subtitulo?: string
  metodoConfirmacion?: MetodoConfirmacion
}

export function ModuloRsvp({
  evento,
  visual,
  invitado,
  esModoVistaPrevia = false,
  urlWhatsApp = '',
  subtitulo,
  metodoConfirmacion = 'tarjeton',
}: ModuloRsvpProps) {
  const pasesMaximos = invitado?.pases || 2
  const [nombre, setNombre] = useState(invitado?.nombre || '')
  const [estado, setEstado] = useState<EstadoConfirmacion>('confirmado')
  const [cupos, setCupos] = useState<number>(pasesMaximos)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmadoExitoso, setConfirmadoExitoso] = useState(false)
  const [fechaConfirmacion, setFechaConfirmacion] = useState<string | null>(null)
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false)

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
        setCupos(parsed.cuposConfirmados || 1)
        setFechaConfirmacion(parsed.fechaConfirmacion || null)
        if (parsed.nombre) setNombre(parsed.nombre)
      } else if (invitado?.confirmado) {
        setConfirmadoExitoso(true)
        setEstado('confirmado')
        setCupos(invitado.cuposConfirmados || invitado.pases || 1)
        setFechaConfirmacion(invitado.fechaConfirmacion || null)
      }
    } catch {}
  }, [storageKey, invitado])

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setEnviando(true)

    const datosConfirmacion = {
      estadoConfirmacion: estado as 'confirmado' | 'no_asiste',
      cuposConfirmados: estado === 'confirmado' ? cupos : 0,
      mensajeConfirmacion: mensaje.trim() || undefined,
    }

    // 1. Guardar en repositorio local (patrón híbrido)
    InvitadoRepositorio.actualizarConfirmacion(
      evento.id,
      {
        id: invitado?.id,
        codigoAcceso: invitado?.codigoAcceso,
        nombre: nombre.trim(),
      },
      datosConfirmacion
    )

    // 2. Enviar a la API para persistencia remota
    try {
      const res = await fetch('/api/invitados/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: evento.id,
          slugPublico: evento.slugPublico,
          id: invitado?.id,
          codigoAcceso: invitado?.codigoAcceso,
          nombre: nombre.trim(),
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
          nombre: nombre.trim(),
          ...datosConfirmacion,
          fechaConfirmacion: ahora,
        })
      )
    } catch {}

    setFechaConfirmacion(ahora)
    setConfirmadoExitoso(true)
    setMostrarFormularioEdicion(false)
    setEnviando(false)
  }

  // ════════════ MODO 1: CONFIRMACIÓN EXCLUSIVA POR WHATSAPP ════════════
  if (metodoConfirmacion === 'whatsapp') {
    return (
      <div className="w-full px-5 sm:px-8 py-7 flex flex-col items-center">
        {subtitulo && (
          <p
            className="text-center text-xs opacity-75 mb-4 leading-relaxed max-w-sm"
            style={{ color: visual.colorTexto }}
          >
            {subtitulo}
          </p>
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
      {subtitulo && (
        <p
          className="text-center text-xs opacity-75 mb-4 leading-relaxed max-w-sm"
          style={{ color: visual.colorTexto }}
        >
          {subtitulo}
        </p>
      )}

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-md border border-black/5 text-slate-800">
        <AnimatePresence mode="wait">
          {confirmadoExitoso && !mostrarFormularioEdicion ? (
            <motion.div
              key="confirmado"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-2 space-y-4"
            >
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center shadow-sm"
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
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Modificar mi respuesta</span>
                </button>

                {metodoConfirmacion === 'ambos' && urlWhatsApp && !esModoVistaPrevia && (
                  <a
                    href={urlWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                  >
                    <span>Notificar también por WhatsApp</span>
                  </a>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="formulario"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={handleConfirmar}
              className="space-y-4"
            >
              {/* Información Nominal del Invitado */}
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
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Dra. Marcela Gómez"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all bg-white"
                  />
                </div>
              )}

              {/* Selector de Asistencia (Sí / No) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                  ¿Asistirás al evento?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEstado('confirmado')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      estado === 'confirmado'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Check size={15} className={estado === 'confirmado' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>Sí, asistiré</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstado('no_asiste')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      estado === 'no_asiste'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <X size={15} className={estado === 'no_asiste' ? 'text-rose-600' : 'text-slate-400'} />
                    <span>No podré asistir</span>
                  </button>
                </div>
              </div>

              {/* Selector de Cupos (Sólo si confirma asistencia) */}
              {estado === 'confirmado' && (
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
              )}

              {/* Mensaje opcional o restricciones alimentarias */}
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
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all bg-white"
                />
              </div>

              {/* Botón Principal de Confirmación */}
              <button
                type="submit"
                disabled={enviando || (!invitado?.nombre && !nombre.trim())}
                className="w-full py-3 px-5 rounded-xl font-semibold text-white text-xs tracking-wider uppercase transition-all active:scale-[0.98] shadow-md hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: visual.colorPrimario,
                }}
              >
                {enviando ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Confirmar Asistencia</span>
                  </>
                )}
              </button>

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
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
