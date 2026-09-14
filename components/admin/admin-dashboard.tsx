'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DetalleEvento,
  Invitado,
  LIMITE_INVITADOS_GRATIS,
} from '@/types/invitation'
import { InvitadoRepositorio, EventoRepositorio } from '@/lib/storage'
import { ModalPago } from '@/components/checkout/modal-pago'
import { construirMensajeCompartir } from '@/lib/event-utils'
import {
  Copy,
  Check,
  Share2,
  Users,
  Trash2,
  Plus,
  ExternalLink,
  Edit3,
  Shield,
  AlertCircle,
  Award,
} from 'lucide-react'

interface AdminDashboardProps {
  evento: DetalleEvento
}

export function AdminDashboard({ evento: eventoInicial }: AdminDashboardProps) {
  const [evento, setEvento] = useState<DetalleEvento>(eventoInicial)
  const [invitados, setInvitados] = useState<Invitado[]>([])
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [pasesNuevo, setPasesNuevo] = useState(1)
  const [esPlural, setEsPlural] = useState(false)
  const [telefonoNuevo, setTelefonoNuevo] = useState('')
  const [copiadoAdmin, setCopiadoAdmin] = useState(false)
  const [idCopiado, setIdCopiado] = useState<string | null>(null)
  const [mostrarModalUpgrade, setMostrarModalUpgrade] = useState(false)
  const [errorLimite, setErrorLimite] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://invitacionesya.com'
  const enlaceAdmin = `${baseUrl}/gestionar/${evento.tokenAdmin}`
  const enlacePublico = `${baseUrl}/i/${evento.slugPublico}`

  useEffect(() => {
    const list = InvitadoRepositorio.obtenerPorEvento(evento.id)
    setInvitados(list)
  }, [evento.id])

  useEffect(() => {
    try {
      localStorage.setItem('ultimo_evento_admin_token', evento.tokenAdmin)
    } catch {}
  }, [evento.tokenAdmin])

  const cantidadInvitados = invitados.length
  const limiteAlcanzado = !evento.esPremium && cantidadInvitados >= LIMITE_INVITADOS_GRATIS
  const porcentajeUso = Math.min(100, Math.round((cantidadInvitados / LIMITE_INVITADOS_GRATIS) * 100))

  const handleAgregarInvitado = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreNuevo.trim()) return

    const resultado = InvitadoRepositorio.agregar(evento, {
      eventoId: evento.id,
      nombre: nombreNuevo.trim(),
      pases: pasesNuevo,
      esPlural: esPlural || pasesNuevo > 1,
      telefono: telefonoNuevo.trim() || undefined,
    })

    if (!resultado.exito) {
      setErrorLimite(resultado.error || 'Se ha alcanzado el límite del cupo de cortesía.')
      setMostrarModalUpgrade(true)
      return
    }

    setInvitados(InvitadoRepositorio.obtenerPorEvento(evento.id))
    setNombreNuevo('')
    setPasesNuevo(1)
    setEsPlural(false)
    setTelefonoNuevo('')
    setErrorLimite(null)
  }

  const handlePagoCompletado = () => {
    const eventoActualizado = { ...evento, esPremium: true }
    setEvento(eventoActualizado)
    EventoRepositorio.guardar(eventoActualizado)
    setMostrarModalUpgrade(false)
    setErrorLimite(null)
  }

  const handleEliminarInvitado = (id: string) => {
    InvitadoRepositorio.eliminar(id)
    setInvitados(InvitadoRepositorio.obtenerPorEvento(evento.id))
  }

  const copiarTexto = async (texto: string, tipo: 'admin' | string) => {
    await navigator.clipboard.writeText(texto)
    if (tipo === 'admin') {
      setCopiadoAdmin(true)
      setTimeout(() => setCopiadoAdmin(false), 2000)
    } else {
      setIdCopiado(tipo)
      setTimeout(() => setIdCopiado(null), 2000)
    }
  }

  const enviarPorWhatsApp = (invitado: Invitado) => {
    const mensaje = construirMensajeCompartir(evento, invitado, baseUrl)
    const tel = invitado.telefono ? invitado.telefono.replace(/[^0-9]/g, '') : ''
    const url = tel
      ? `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`
      : `https://wa.me/?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const guardarEnMiWhatsApp = () => {
    const texto = `Enlace privado de administración para mi evento *${evento.titulo}*:\n\n${enlaceAdmin}\n\n(Conserva este enlace para gestionar y editar tu invitación).`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera Corporativa del Evento (Clara y Formal) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                Panel de Control
              </span>
              {evento.esPremium ? (
                <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 font-bold">
                  <Award size={12} /> Pase Ilimitado
                </span>
              ) : (
                <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Cupo de Cortesía (Hasta 50 pases)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif mt-3 tracking-tight break-words text-slate-950">
              {evento.titulo}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {new Date(evento.fechaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {evento.horaEvento}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              href={`/crear?editar=${evento.tokenAdmin}`}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 text-center text-slate-700"
            >
              <Edit3 size={14} /> Personalizar Diseño
            </Link>
            <a
              href={enlacePublico}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs"
            >
              <ExternalLink size={14} /> Ver Tarjeta Pública
            </a>
          </div>
        </div>

        {/* Respaldo y Llave de Acceso Secreta (Claro y Seguro) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
              <Shield size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Llave de Acceso y Gestión
              </p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                Este sistema opera sin contraseñas para su agilidad. Conserve este enlace privado para administrar o editar su tarjeta desde cualquier equipo.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <div className="flex-1 min-w-0 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-600 truncate select-all">
                {enlaceAdmin}
              </span>
              <button
                type="button"
                onClick={() => copiarTexto(enlaceAdmin, 'admin')}
                className="text-xs font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1 shrink-0 cursor-pointer px-2 py-1 rounded hover:bg-slate-200 transition-colors"
              >
                {copiadoAdmin ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiadoAdmin ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={guardarEnMiWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <Share2 size={14} />
              <span>Guardar en mi WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Indicador de Capacidad de Pases */}
        {!evento.esPremium && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Capacidad de Invitados Protocolarios
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                {cantidadInvitados} / {LIMITE_INVITADOS_GRATIS}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  cantidadInvitados >= LIMITE_INVITADOS_GRATIS
                    ? 'bg-red-500'
                    : 'bg-slate-900'
                }`}
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-slate-600 font-normal">
                {cantidadInvitados >= LIMITE_INVITADOS_GRATIS
                  ? 'Ha alcanzado el cupo máximo de 50 invitaciones de cortesía.'
                  : `Dispone de ${LIMITE_INVITADOS_GRATIS - cantidadInvitados} invitaciones en su cupo de cortesía.`}
              </p>
              <button
                onClick={() => setMostrarModalUpgrade(true)}
                className="text-slate-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Habilitar Cupo Ilimitado ($3.99 USD)</span>
              </button>
            </div>
          </div>
        )}

        {/* Formulario Formal de Generación de Pases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold font-serif mb-1 flex items-center gap-2 text-slate-950">
            <Plus size={16} className="text-slate-700" /> Expedición de Pases Personalizados
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Cada invitado dispondrá de una tarjeta nominal con sus cupos autorizados y enlace individual.
          </p>

          <form onSubmit={handleAgregarInvitado} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
            <div className="sm:col-span-2 lg:col-span-5">
              <label className="font-semibold text-slate-700 block mb-1.5">
                Nombre del Invitado o Familia
              </label>
              <input
                type="text"
                required
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                placeholder="Ej: Dr. Fernando Restrepo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1.5">
                Cupos / Pases
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={pasesNuevo}
                onChange={(e) => setPasesNuevo(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-3">
              <label className="font-semibold text-slate-700 block mb-1.5">
                WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={telefonoNuevo}
                onChange={(e) => setTelefonoNuevo(e.target.value)}
                placeholder="Ej: 573001234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={limiteAlcanzado}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs h-[39px] cursor-pointer"
              >
                Generar Pase
              </button>
            </div>
          </form>

          {errorLimite && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600" />
              <span>{errorLimite}</span>
            </div>
          )}
        </div>

        {/* Lista de Pases Generados */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-serif text-slate-950">Registro de Pases Emitidos ({invitados.length})</h2>
              <p className="text-xs text-slate-500">Distribución directa por mensajería o enlace personalizado.</p>
            </div>
          </div>

          {invitados.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <Users className="mx-auto text-slate-400 mb-2" size={28} />
              <p className="text-xs font-semibold text-slate-700">Sin invitaciones emitidas</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Utilice el formulario superior para generar los primeros pases nominales.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invitados.map((inv) => {
                const linkInvitado = `${baseUrl}/i/${evento.slugPublico}?g=${encodeURIComponent(inv.nombre)}&t=${inv.codigoAcceso}${inv.esPlural ? '&p=1' : ''}`
                const copiado = idCopiado === inv.id

                return (
                  <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{inv.nombre}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-mono shrink-0">
                          {inv.pases} {inv.pases === 1 ? 'pase' : 'pases'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-full sm:max-w-md mt-1 font-mono">
                        {linkInvitado}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => copiarTexto(linkInvitado, inv.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Copiar enlace"
                      >
                        {copiado ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => enviarPorWhatsApp(inv)}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        title="Enviar por WhatsApp"
                      >
                        <Share2 size={13} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarInvitado(inv.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        title="Eliminar pase"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Pasarela de Pago para Licencia Premium ($3.99 USD) */}
      <ModalPago
        abierto={mostrarModalUpgrade}
        alCerrar={() => setMostrarModalUpgrade(false)}
        alCompletarPago={handlePagoCompletado}
        tituloEvento={evento.titulo}
        tokenAdmin={evento.tokenAdmin}
        eventoId={evento.id}
      />
    </div>
  )
}
