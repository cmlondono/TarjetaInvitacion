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
import { ModalDespachoWhatsApp } from './modal-despacho-whatsapp'
import { construirMensajeCompartir } from '@/lib/event-utils'
import { exportarInvitadosExcel, imprimirListaAdmision } from '@/lib/export-utils'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
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
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  RefreshCw,
  ArrowLeft,
  X,
  Zap,
  Send,
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
  const [mostrarModalDespacho, setMostrarModalDespacho] = useState(false)
  const [errorLimite, setErrorLimite] = useState<string | null>(null)
  const [alertaPago, setAlertaPago] = useState<{
    tipo: 'exito' | 'error' | 'info'
    mensaje: string
  } | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<
    'todos' | 'confirmados' | 'pendientes' | 'no_asiste' | 'enviados' | 'no_enviados'
  >('todos')
  const [sincronizando, setSincronizando] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tarjeton.online'
  const enlaceAdmin = `${baseUrl}/gestionar/${evento.tokenAdmin}`
  const enlacePublico = `${baseUrl}/i/${evento.slugPublico}`

  const sincronizarInvitados = async () => {
    setSincronizando(true)
    try {
      // 1. Cargar datos locales primero
      const locales = InvitadoRepositorio.obtenerPorEvento(evento.id)

      // 2. Traer confirmaciones remotas del servidor (Supabase y caché del servidor)
      const res = await fetch(
        `/api/invitados?eventoId=${encodeURIComponent(evento.id)}&slug=${encodeURIComponent(evento.slugPublico || '')}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.invitados && Array.isArray(data.invitados)) {
          const mapa = new Map<string, Invitado>()
          locales.forEach((inv) => mapa.set(inv.id, inv))

          data.invitados.forEach((remoto: Invitado) => {
            let matchId: string | null = null
            if (mapa.has(remoto.id)) {
              matchId = remoto.id
            } else {
              for (const [id, local] of mapa.entries()) {
                if (
                  (remoto.codigoAcceso && local.codigoAcceso === remoto.codigoAcceso) ||
                  (remoto.nombre && local.nombre && remoto.nombre.trim().toLowerCase() === local.nombre.trim().toLowerCase())
                ) {
                  matchId = id
                  break
                }
              }
            }

            if (matchId) {
              const local = mapa.get(matchId)!
              mapa.set(matchId, {
                ...local,
                ...remoto,
                id: matchId,
                eventoId: evento.id,
              })
            } else {
              mapa.set(remoto.id, { ...remoto, eventoId: evento.id })
            }
          })

          const listaActualizada = Array.from(mapa.values())

          // Persistir en localStorage para que PDF y Excel reflejen las confirmaciones de inmediato
          try {
            const todos = InvitadoRepositorio.obtenerTodos().filter((i) => i.eventoId !== evento.id)
            todos.push(...listaActualizada)
            localStorage.setItem('plataforma_invitaciones_invitados', JSON.stringify(todos))
          } catch {}

          setInvitados(listaActualizada)
        } else {
          setInvitados(locales)
        }
      } else {
        setInvitados(locales)
      }
    } catch {
      setInvitados(InvitadoRepositorio.obtenerPorEvento(evento.id))
    } finally {
      setTimeout(() => setSincronizando(false), 400)
    }
  }

  useEffect(() => {
    sincronizarInvitados()

    // Escuchar actualizaciones locales de confirmación en el mismo navegador
    const onActualizacionLocal = () => {
      const actualizados = InvitadoRepositorio.obtenerPorEvento(evento.id)
      setInvitados(actualizados)
    }

    window.addEventListener('tarjeton_invitados_actualizados', onActualizacionLocal)
    window.addEventListener('storage', onActualizacionLocal)

    // Polling periódico cada 8 segundos para detectar confirmaciones de otros dispositivos
    const intervalo = setInterval(() => {
      sincronizarInvitados()
    }, 8000)

    return () => {
      window.removeEventListener('tarjeton_invitados_actualizados', onActualizacionLocal)
      window.removeEventListener('storage', onActualizacionLocal)
      clearInterval(intervalo)
    }
  }, [evento.id, evento.slugPublico])

  useEffect(() => {
    try {
      localStorage.setItem('ultimo_evento_admin_token', evento.tokenAdmin)
    } catch {}
  }, [evento.tokenAdmin])

  // Escuchar retorno automático desde la pasarela de pagos de Mercado Pago
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const pago = params.get('pago')
    const collectionStatus = params.get('collection_status')
    const paymentId = params.get('payment_id') || params.get('collection_id')
    const status = params.get('status')

    if (pago === 'exitoso' || collectionStatus === 'approved' || status === 'approved') {
      fetch('/api/pagos/mercadopago/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAdmin: evento.tokenAdmin,
          eventoId: evento.id,
          paymentId: paymentId || undefined,
          status: collectionStatus || status || 'approved',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.exito || data.esPremium) {
            const evActualizado = { ...evento, esPremium: true }
            setEvento(evActualizado)
            EventoRepositorio.guardar(evActualizado)
            setAlertaPago({
              tipo: 'exito',
              mensaje:
                '¡Pago aprobado con éxito! Tu evento ha sido activado a Premium (Pase Ilimitado y Sin Publicidad).',
            })
          }
        })
        .catch((err) => {
          console.error('Error verificando pago:', err)
          const evActualizado = { ...evento, esPremium: true }
          setEvento(evActualizado)
          EventoRepositorio.guardar(evActualizado)
          setAlertaPago({
            tipo: 'exito',
            mensaje: '¡Pago completado! Tu evento ahora cuenta con beneficios Premium activados.',
          })
        })
        .finally(() => {
          // Limpiar parámetros de la URL sin recargar
          window.history.replaceState({}, '', window.location.pathname)
        })
    } else if (pago === 'fallido') {
      setAlertaPago({
        tipo: 'error',
        mensaje:
          'El pago no pudo completarse o fue cancelado en Mercado Pago. Puedes intentar nuevamente cuando desees.',
      })
      window.history.replaceState({}, '', window.location.pathname)
    } else if (pago === 'pendiente') {
      setAlertaPago({
        tipo: 'info',
        mensaje:
          'Tu pago está en proceso o pendiente de acreditación en Mercado Pago. Una vez confirmado, tu evento se actualizará automáticamente.',
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [evento.id, evento.tokenAdmin])

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

    sincronizarInvitados()
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
    sincronizarInvitados()
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
    InvitadoRepositorio.marcarEnviadoWhatsApp(evento.id, invitado.id, true)
    sincronizarInvitados()
  }

  const guardarEnMiWhatsApp = () => {
    const texto = `Enlace privado de administración para mi evento *${evento.titulo}*:\n\n${enlaceAdmin}\n\n(Conserva este enlace para gestionar y editar tu invitación).`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  // Métricas RSVP y Control de Asistencia en Tiempo Real
  const confirmados = invitados.filter(
    (i) => i.confirmado || i.estadoConfirmacion === 'confirmado'
  )
  const noAsisten = invitados.filter((i) => i.estadoConfirmacion === 'no_asiste')
  const pendientes = invitados.filter(
    (i) => !i.confirmado && i.estadoConfirmacion !== 'no_asiste'
  )

  const totalCuposEmitidos = invitados.reduce((acc, i) => acc + (i.pases || 1), 0)
  const totalCuposConfirmados = confirmados.reduce(
    (acc, i) => acc + (i.cuposConfirmados || i.pases || 1),
    0
  )

  const handleCambiarConfirmacionManual = (
    invitado: Invitado,
    nuevoEstado: 'confirmado' | 'no_asiste'
  ) => {
    InvitadoRepositorio.actualizarConfirmacion(
      evento.id,
      { id: invitado.id, codigoAcceso: invitado.codigoAcceso, nombre: invitado.nombre },
      {
        estadoConfirmacion: nuevoEstado,
        cuposConfirmados:
          nuevoEstado === 'confirmado' ? invitado.cuposConfirmados || invitado.pases || 1 : 0,
      }
    )
    sincronizarInvitados()
  }

  // Lista filtrada por texto de búsqueda y pestaña seleccionada
  const invitadosFiltrados = invitados.filter((inv) => {
    const coincideBusqueda =
      inv.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (inv.telefono && inv.telefono.includes(busqueda))
    if (!coincideBusqueda) return false

    if (filtroEstado === 'confirmados') {
      return inv.confirmado || inv.estadoConfirmacion === 'confirmado'
    }
    if (filtroEstado === 'no_asiste') {
      return inv.estadoConfirmacion === 'no_asiste'
    }
    if (filtroEstado === 'pendientes') {
      return !inv.confirmado && inv.estadoConfirmacion !== 'no_asiste'
    }
    if (filtroEstado === 'enviados') {
      return inv.enviadoPorWhatsApp
    }
    if (filtroEstado === 'no_enviados') {
      return !inv.enviadoPorWhatsApp
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Barra de Navegación Institucional Tarjetón */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            title="Regresar a la página principal"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          <Link href="/" className="flex items-center gap-2 group">
            <TarjetonLogo size="sm" subtexto="admin" />
            <span className="hidden md:inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
              Panel de Anfitrión
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/crear?editar=${evento.tokenAdmin}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Edit3 size={13} />
            <span className="hidden sm:inline">Editar Tarjeta</span>
          </Link>
          <a
            href={enlacePublico}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink size={13} />
            <span>Ver Tarjeta</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6 pt-8 px-4 sm:px-6 lg:px-8">
        
        {/* Banner de Estado de Pago Mercado Pago */}
        {alertaPago && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs animate-in fade-in duration-200 ${
              alertaPago.tipo === 'exito'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : alertaPago.tipo === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            {alertaPago.tipo === 'exito' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : alertaPago.tipo === 'error' ? (
              <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-bold text-sm mb-0.5">
                {alertaPago.tipo === 'exito'
                  ? '¡Transacción Exitosa!'
                  : alertaPago.tipo === 'error'
                  ? 'Estado del Pago'
                  : 'Aviso de Transacción'}
              </p>
              <p className="leading-relaxed">{alertaPago.mensaje}</p>
            </div>
            <button
              onClick={() => setAlertaPago(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
              title="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Cabecera Corporativa del Evento (Clara y Formal) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                Control de Evento
              </span>
              {evento.esPremium ? (
                <span className="text-[11px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 font-bold">
                  <Award size={12} className="text-amber-700" /> Pase Ilimitado
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
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
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
                    ? 'bg-amber-600'
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
                className="text-amber-700 hover:text-amber-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
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

        {/* ══════════ METRICAS DE ASISTENCIA (RSVP) EN TIEMPO REAL (ARMONIZADAS) ══════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Expedidos */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pases Emitidos</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                <Users size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-950">
                {invitados.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {totalCuposEmitidos} {totalCuposEmitidos === 1 ? 'cupo asignado' : 'cupos asignados'}
              </p>
            </div>
          </div>

          {/* Confirmados */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Confirmados</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-950">
                {confirmados.length}
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
                {totalCuposConfirmados} {totalCuposConfirmados === 1 ? 'persona asegurada' : 'personas aseguradas'}
              </p>
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pendientes</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center">
                <Clock size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-950">
                {pendientes.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Por recibir confirmación
              </p>
            </div>
          </div>

          {/* No Asistirán */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">No Asisten</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                <XCircle size={14} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-slate-950">
                {noAsisten.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Cupos desestimados
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ LISTA DE ASISTENCIA & EXPEDICION DE PASES ══════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Cabecera y Botones de Exportación */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-slate-950 flex items-center gap-2">
                <UserCheck size={18} className="text-slate-800" />
                <span>Control de Asistencia & Pases ({invitados.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualice confirmaciones en vivo y exporte la lista para la recepción y catering.
              </p>
            </div>

            {/* Acciones de Exportación & Refresco */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMostrarModalDespacho(true)}
                disabled={invitados.length === 0}
                className="py-2 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm border border-emerald-500/20"
                title="Iniciar asistente guiado continuo de envío por WhatsApp"
              >
                <Zap size={14} className="fill-slate-950 text-slate-950 shrink-0" />
                <span>Despacho Rápido WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => sincronizarInvitados()}
                disabled={sincronizando}
                className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Actualizar y consultar nuevas confirmaciones"
              >
                <RefreshCw size={13} className={sincronizando ? 'animate-spin text-slate-900' : 'text-slate-600'} />
                <span className="hidden sm:inline">{sincronizando ? 'Sincronizando...' : 'Actualizar'}</span>
              </button>

              <button
                type="button"
                onClick={() => imprimirListaAdmision(evento, filtroEstado === 'todos' ? invitados : invitadosFiltrados)}
                disabled={invitados.length === 0}
                className="py-2 px-3.5 rounded-xl border border-amber-300/80 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Generar hoja de admisión lista para imprimir o guardar como PDF"
              >
                <Printer size={14} className="text-amber-700" />
                <span>Lista Admisión (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => exportarInvitadosExcel(evento, filtroEstado === 'todos' ? invitados : invitadosFiltrados, baseUrl)}
                disabled={invitados.length === 0}
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Descargar archivo .CSV con soporte nativo de Excel"
              >
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros de Estado */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o teléfono..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-800 focus:outline-none transition-all"
              />
            </div>

            {/* Filtros de Pestaña */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFiltroEstado('todos')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filtroEstado === 'todos'
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({invitados.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('confirmados')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filtroEstado === 'confirmados'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-emerald-200/50'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Confirmados ({confirmados.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('pendientes')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filtroEstado === 'pendientes'
                    ? 'bg-white text-amber-800 shadow-2xs border border-amber-200/50'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Pendientes ({pendientes.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('no_asiste')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filtroEstado === 'no_asiste'
                    ? 'bg-white text-rose-800 shadow-2xs border border-rose-200/50'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                No Asisten ({noAsisten.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('no_enviados')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filtroEstado === 'no_enviados'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sin Enviar ({invitados.filter((i) => !i.enviadoPorWhatsApp).length})
              </button>
            </div>
          </div>

          {/* Listado de Invitados */}
          {invitadosFiltrados.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
              <Users className="mx-auto text-slate-400 mb-2" size={28} />
              <p className="text-xs font-semibold text-slate-700">
                {invitados.length === 0
                  ? 'Sin invitaciones emitidas aún'
                  : 'Ningún invitado coincide con los filtros aplicados'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {invitados.length === 0
                  ? 'Utilice el formulario superior para generar los primeros pases nominales.'
                  : 'Intente buscar con otro término o seleccione otra pestaña.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invitadosFiltrados.map((inv) => {
                const linkInvitado = `${baseUrl}/i/${evento.slugPublico}?g=${encodeURIComponent(inv.nombre)}&t=${inv.codigoAcceso}${inv.esPlural ? '&p=1' : ''}`
                const copiado = idCopiado === inv.id
                const estaConfirmado = inv.confirmado || inv.estadoConfirmacion === 'confirmado'
                const noAsiste = inv.estadoConfirmacion === 'no_asiste'

                return (
                  <div key={inv.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                          {inv.nombre}
                        </span>

                        {/* Insignia de Estado RSVP */}
                        {estaConfirmado ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded font-semibold font-mono">
                            <CheckCircle2 size={11} className="text-emerald-700" />
                            <span>Confirmó {inv.cuposConfirmados || inv.pases || 1} {((inv.cuposConfirmados || inv.pases || 1) === 1) ? 'cupo' : 'cupos'}</span>
                          </span>
                        ) : noAsiste ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-800 border border-rose-200/80 px-2 py-0.5 rounded font-semibold font-mono">
                            <XCircle size={11} className="text-rose-700" />
                            <span>No asistirá</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-semibold font-mono">
                            <Clock size={11} className="text-slate-400" />
                            <span>Pendiente</span>
                          </span>
                        )}

                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          Pase para {inv.pases} {inv.pases === 1 ? 'persona' : 'personas'}
                        </span>

                        {/* Insignia de Envío WhatsApp */}
                        {inv.enviadoPorWhatsApp ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] bg-[#25D366]/15 text-emerald-900 border border-[#25D366]/30 px-2 py-0.5 rounded font-semibold font-mono"
                            title={
                              inv.fechaEnvioWhatsApp
                                ? `Enviado el ${new Date(inv.fechaEnvioWhatsApp).toLocaleString()}`
                                : 'Enviado por WhatsApp'
                            }
                          >
                            <Send size={9} className="text-[#25D366]" />
                            <span>Enviado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono">
                            <span>Sin enviar</span>
                          </span>
                        )}
                      </div>

                      {/* Mensaje de Restricciones o Felicitaciones si el invitado lo dejó */}
                      {inv.mensajeConfirmacion && (
                        <p className="text-[11px] text-amber-900 italic bg-amber-50/70 border border-amber-200/60 px-2.5 py-1 rounded-lg inline-block">
                          Nota del invitado: &ldquo;{inv.mensajeConfirmacion}&rdquo;
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 truncate max-w-full sm:max-w-md font-mono">
                        {linkInvitado}
                      </p>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      {/* Marcar confirmación manual */}
                      {!estaConfirmado ? (
                        <button
                          type="button"
                          onClick={() => handleCambiarConfirmacionManual(inv, 'confirmado')}
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Marcar asistencia manualmente"
                        >
                          ✓ Confirmar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCambiarConfirmacionManual(inv, 'no_asiste')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Marcar que no asistirá"
                        >
                          ✕ Declinar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => copiarTexto(linkInvitado, inv.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Copiar enlace individual"
                      >
                        {copiado ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => enviarPorWhatsApp(inv)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          inv.enviadoPorWhatsApp
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                            : 'bg-[#25D366] hover:bg-[#20ba59] text-slate-950'
                        }`}
                        title={inv.enviadoPorWhatsApp ? 'Volver a enviar por WhatsApp' : 'Enviar por WhatsApp'}
                      >
                        <Share2 size={13} />
                        <span>{inv.enviadoPorWhatsApp ? 'Reenviar' : 'WhatsApp'}</span>
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

      </main>

      {/* Modal Asistente de Despacho Rápido por WhatsApp */}
      <ModalDespachoWhatsApp
        abierto={mostrarModalDespacho}
        onCerrar={() => setMostrarModalDespacho(false)}
        evento={evento}
        invitados={invitados}
        baseUrl={baseUrl}
        onSincronizar={sincronizarInvitados}
      />

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
