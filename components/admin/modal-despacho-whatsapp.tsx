'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { DetalleEvento, Invitado } from '@/types/invitation'
import { construirMensajeCompartir } from '@/lib/event-utils'
import { InvitadoRepositorio } from '@/lib/storage'
import {
  Send,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Copy,
  Phone,
  Edit2,
  Users,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react'

interface ModalDespachoWhatsAppProps {
  abierto: boolean
  onCerrar: () => void
  evento: DetalleEvento
  invitados: Invitado[]
  baseUrl: string
  onSincronizar: () => void
}

type TipoFiltroCola = 'con_telefono' | 'no_enviados' | 'pendientes' | 'todos'

export function ModalDespachoWhatsApp({
  abierto,
  onCerrar,
  evento,
  invitados,
  baseUrl,
  onSincronizar,
}: ModalDespachoWhatsAppProps) {
  const [filtroCola, setFiltroCola] = useState<TipoFiltroCola>('con_telefono')
  const [indiceActual, setIndiceActual] = useState(0)
  const [copiado, setCopiado] = useState(false)
  const [contadorSesion, setContadorSesion] = useState(0)
  const [completado, setCompletado] = useState(false)

  // Estado para edición rápida de teléfono in-situ
  const [editandoTelefono, setEditandoTelefono] = useState(false)
  const [telefonoNuevo, setTelefonoNuevo] = useState('')

  // Filtrar la cola según la preferencia del anfitrión
  const colaInvitados = useMemo(() => {
    return invitados.filter((inv) => {
      const tieneTel = Boolean(inv.telefono && inv.telefono.replace(/[^0-9]/g, '').length >= 7)
      if (filtroCola === 'con_telefono') return tieneTel
      if (filtroCola === 'no_enviados') return !inv.enviadoPorWhatsApp
      if (filtroCola === 'pendientes') return !inv.confirmado && inv.estadoConfirmacion !== 'no_asiste'
      return true
    })
  }, [invitados, filtroCola])

  // Resetear índice al cambiar de filtro o abrir modal
  useEffect(() => {
    setIndiceActual(0)
    setCompletado(false)
  }, [filtroCola, abierto])

  const totalCola = colaInvitados.length
  const invitadoActual: Invitado | undefined = colaInvitados[indiceActual]

  // Sincronizar input de teléfono al cambiar de invitado
  useEffect(() => {
    if (invitadoActual) {
      setTelefonoNuevo(invitadoActual.telefono || '')
      setEditandoTelefono(false)
    }
  }, [invitadoActual])

  if (!abierto) return null

  // Mensaje actual generado dinámicamente
  const mensajeActual = invitadoActual
    ? construirMensajeCompartir(evento, invitadoActual, baseUrl)
    : ''

  // Manejador para abrir WhatsApp y marcar como enviado
  const handleEnviarYPasar = () => {
    if (!invitadoActual) return

    const telLimpio = invitadoActual.telefono
      ? invitadoActual.telefono.replace(/[^0-9]/g, '')
      : ''

    const url = telLimpio
      ? `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensajeActual)}`
      : `https://wa.me/?text=${encodeURIComponent(mensajeActual)}`

    // Abrir WhatsApp en nueva pestaña
    window.open(url, '_blank')

    // Marcar en repositorio como enviado por WhatsApp
    InvitadoRepositorio.marcarEnviadoWhatsApp(evento.id, invitadoActual.id, true)
    setContadorSesion((prev) => prev + 1)
    onSincronizar()

    // Avanzar al siguiente invitado
    if (indiceActual + 1 < totalCola) {
      setIndiceActual((prev) => prev + 1)
    } else {
      setCompletado(true)
    }
  }

  // Marcar como enviado manualmente sin abrir WhatsApp (por si ya se envió)
  const handleMarcarEnviadoSinAbrir = () => {
    if (!invitadoActual) return
    InvitadoRepositorio.marcarEnviadoWhatsApp(evento.id, invitadoActual.id, true)
    setContadorSesion((prev) => prev + 1)
    onSincronizar()

    if (indiceActual + 1 < totalCola) {
      setIndiceActual((prev) => prev + 1)
    } else {
      setCompletado(true)
    }
  }

  // Guardar teléfono modificado en el acto
  const handleGuardarTelefono = () => {
    if (!invitadoActual) return
    const telLimpio = telefonoNuevo.trim()
    const todos = InvitadoRepositorio.obtenerTodos()
    const idx = todos.findIndex((i) => i.id === invitadoActual.id)
    if (idx !== -1) {
      todos[idx] = { ...todos[idx], telefono: telLimpio || undefined }
      if (typeof window !== 'undefined') {
        localStorage.setItem('tarjeton_invitados', JSON.stringify(todos))
      }
      onSincronizar()
    }
    setEditandoTelefono(false)
  }

  const copiarMensaje = async () => {
    await navigator.clipboard.writeText(mensajeActual)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const porcentaje = totalCola > 0 ? Math.round(((indiceActual) / totalCola) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Cabecera del Modal */}
        <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <Zap size={16} className="text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Despacho Rápido por WhatsApp
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                  Flujo Continuo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Envía las invitaciones nominales una a una con 1 clic sin riesgo de bloqueo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar asistente"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de Filtros de Cola */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
            Filtrar cola:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
            {[
              { id: 'con_telefono', label: 'Con Teléfono' },
              { id: 'no_enviados', label: 'No Enviados' },
              { id: 'pendientes', label: 'Pendientes RSVP' },
              { id: 'todos', label: 'Todos' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroCola(f.id as TipoFiltroCola)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filtroCola === f.id
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full bg-slate-100 h-1.5 shrink-0 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${totalCola > 0 ? ((indiceActual + (completado ? 1 : 0)) / totalCola) * 100 : 0}%` }}
          />
        </div>

        {/* Cuerpo del Asistente */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {totalCola === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Users className="mx-auto text-slate-300" size={36} />
              <p className="text-sm font-bold text-slate-800">
                No hay invitados en esta cola
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filtroCola === 'con_telefono'
                  ? 'Ningún invitado tiene un número de teléfono asignado. Agrega sus teléfonos en la tabla para despachar rápido.'
                  : filtroCola === 'no_enviados'
                  ? '¡Excelente! Todos los invitados de tu lista ya han sido marcados como enviados.'
                  : 'No se encontraron contactos que coincidan con el filtro seleccionado.'}
              </p>
              <button
                type="button"
                onClick={() => setFiltroCola('todos')}
                className="mt-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Ver todos los invitados ({invitados.length})
              </button>
            </div>
          ) : completado ? (
            /* Pantalla de Fin de Despacho */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  ¡Despacho de Cola Finalizado!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Has recorrido los <strong className="text-slate-800">{totalCola} contactos</strong> de este filtro.
                  {contadorSesion > 0 && (
                    <span> Despachaste <strong className="text-emerald-700">{contadorSesion} invitaciones</strong> en esta sesión.</span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-xs mx-auto text-xs text-slate-600">
                <p className="font-semibold text-slate-800">¿Deseas reiniciar o revisar de nuevo?</p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIndiceActual(0)
                      setCompletado(false)
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reiniciar</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCerrar}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    Listo, Salir
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Vista del Invitado Actual */
            invitadoActual && (
              <div className="space-y-4">
                
                {/* Cabecera del Turno Actual */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      {indiceActual + 1} / {totalCola}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Progreso: {porcentaje}%
                    </span>
                  </div>

                  {/* Estado de Envío Anterior */}
                  {invitadoActual.enviadoPorWhatsApp ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>Ya enviado anteriormente</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Clock size={12} className="text-slate-400" />
                      <span>Pendiente de envío</span>
                    </span>
                  )}
                </div>

                {/* Tarjeta del Invitado */}
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50/50 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                        {invitadoActual.nombre}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded-md font-medium border border-slate-200">
                          Pase para {invitadoActual.pases} {invitadoActual.pases === 1 ? 'persona' : 'personas'}
                        </span>

                        {invitadoActual.confirmado || invitadoActual.estadoConfirmacion === 'confirmado' ? (
                          <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={12} /> Confirmó asistencia
                          </span>
                        ) : invitadoActual.estadoConfirmacion === 'no_asiste' ? (
                          <span className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <XCircle size={12} /> No asistirá
                          </span>
                        ) : (
                          <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={12} /> Pendiente de confirmación
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teléfono y edición rápida */}
                    <div className="text-left sm:text-right shrink-0">
                      {!editandoTelefono ? (
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <Phone size={13} className="text-slate-400" />
                          <span className="text-xs font-mono font-bold text-slate-800">
                            {invitadoActual.telefono || 'Sin teléfono'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditandoTelefono(true)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Editar teléfono"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="tel"
                            value={telefonoNuevo}
                            onChange={(e) => setTelefonoNuevo(e.target.value)}
                            placeholder="Ej: 573001234567"
                            className="text-xs px-2 py-1 border border-slate-300 rounded-lg w-32 font-mono bg-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleGuardarTelefono}
                            className="px-2 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vista Previa del Mensaje de WhatsApp */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold uppercase tracking-wider">
                        Mensaje personalizado a enviar:
                      </span>
                      <button
                        type="button"
                        onClick={copiarMensaje}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
                      >
                        {copiado ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span className="text-emerald-600">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-[#e7f7ed]/70 border border-[#b2e5c4] rounded-xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap shadow-2xs">
                      {mensajeActual}
                    </div>
                  </div>
                </div>

                {/* Acciones del Turno */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                  
                  {/* Botones de Navegación Simple */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIndiceActual((prev) => Math.max(0, prev - 1))}
                      disabled={indiceActual === 0}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Anterior</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (indiceActual + 1 < totalCola) {
                          setIndiceActual((prev) => prev + 1)
                        } else {
                          setCompletado(true)
                        }
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Saltar al siguiente sin enviar"
                    >
                      <span>Saltar</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Botón Principal: Abrir WhatsApp y Enviar */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMarcarEnviadoSinAbrir}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      title="Marcar como enviado sin abrir chat"
                    >
                      ✓ Ya lo envié
                    </button>

                    <button
                      type="button"
                      onClick={handleEnviarYPasar}
                      className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap"
                    >
                      <Send size={15} className="shrink-0" />
                      <span>Abrir WhatsApp y Enviar</span>
                      <ExternalLink size={13} className="opacity-60" />
                    </button>
                  </div>

                </div>

              </div>
            )
          )}
        </div>

        {/* Pie del Modal con Instrucción y Salida */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="hidden sm:inline">
            💡 Al tocar &ldquo;Abrir WhatsApp&rdquo;, se envía el mensaje y pasa automáticamente al siguiente.
          </span>
          <button
            type="button"
            onClick={onCerrar}
            className="ml-auto text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer"
          >
            Cerrar Asistente
          </button>
        </div>

      </div>
    </div>
  )
}
