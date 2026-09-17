'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MetricasSistema,
  Promocion,
  PublicacionLanding,
  ConfiguracionGlobal,
} from '@/types/admin'
import { DetalleEvento } from '@/types/invitation'
import { AdminStorage, CONFIGURACION_DEFAULT } from '@/lib/admin-storage'
import { EventoRepositorio } from '@/lib/storage'
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Ticket,
  Megaphone,
  Sliders,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  RefreshCw,
  Award,
  Lock,
  Search,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  AlertTriangle,
  CalendarRange,
  Clock,
} from 'lucide-react'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'

export default function PaginaAdminDashboard() {
  const router = useRouter()
  const [autenticado, setAutenticado] = useState(false)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  const [pestana, setPestana] = useState<
    'metricas' | 'promociones' | 'publicaciones' | 'eventos' | 'configuracion' | 'seguridad'
  >('metricas')

  // Estados de datos
  const [metricas, setMetricas] = useState<MetricasSistema | null>(null)
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [publicaciones, setPublicaciones] = useState<PublicacionLanding[]>([])
  const [configuracion, setConfiguracion] = useState<ConfiguracionGlobal>(CONFIGURACION_DEFAULT)
  const [eventos, setEventos] = useState<DetalleEvento[]>([])
  const [busquedaEvento, setBusquedaEvento] = useState('')

  // Estados para consulta de eventos por rango de fechas (Escalabilidad para miles de eventos)
  const fechaHoy = new Date()
  const primerDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1).toISOString().split('T')[0]
  const ultimoDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const [fechaDesde, setFechaDesde] = useState(primerDiaMes)
  const [fechaHasta, setFechaHasta] = useState(ultimoDiaMes)
  const [cargandoEventos, setCargandoEventos] = useState(false)
  const [filtroPresetFecha, setFiltroPresetFecha] = useState<'este_mes' | 'proximos_30' | 'proximos_90' | 'pasados' | 'personalizado'>('este_mes')
  const [eventoAEliminar, setEventoAEliminar] = useState<DetalleEvento | null>(null)
  const [eliminandoEvento, setEliminandoEvento] = useState(false)
  const [idCopiadoAdmin, setIdCopiadoAdmin] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tarjeton.online'

  // Formulario de Nueva Promoción
  const [nuevoCodigo, setNuevoCodigo] = useState('')
  const [nuevoTipoDescuento, setNuevoTipoDescuento] = useState<'porcentaje' | 'precio_fijo'>('porcentaje')
  const [nuevoValorDescuento, setNuevoValorDescuento] = useState<number>(20)
  const [nuevosUsosMaximos, setNuevosUsosMaximos] = useState<number>(100)

  // Formulario de Nueva Publicación Landing
  const [nuevoTituloPub, setNuevoTituloPub] = useState('')
  const [nuevoContenidoPub, setNuevoContenidoPub] = useState('')
  const [nuevoBotonPub, setNuevoBotonPub] = useState('Aprovechar Oferta')
  const [nuevoEnlacePub, setNuevoEnlacePub] = useState('/crear?plan=premium')
  const [nuevoColorPub, setNuevoColorPub] = useState('#0F172A')

  // Notificación de éxito
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Verificar sesión al montar
  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/admin/verificar')
        const data = await res.json()
        if (data.autenticado) {
          setAutenticado(true)
          cargarDatos()
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setCargandoAuth(false)
      }
    }
    verificar()
  }, [router])

  // Cargar eventos del rango al entrar a la pestaña 'eventos'
  useEffect(() => {
    if (autenticado && pestana === 'eventos') {
      consultarEventos()
    }
  }, [pestana, autenticado])

  const cargarDatos = () => {
    setMetricas(AdminStorage.calcularMetricas())
    setPromociones(AdminStorage.obtenerPromociones())
    setPublicaciones(AdminStorage.obtenerPublicaciones())
    setConfiguracion(AdminStorage.obtenerConfiguracion())
    consultarEventos()
  }

  const consultarEventos = async (desdeParam?: string, hastaParam?: string, busqParam?: string) => {
    setCargandoEventos(true)
    const d = desdeParam !== undefined ? desdeParam : fechaDesde
    const h = hastaParam !== undefined ? hastaParam : fechaHasta
    const q = busqParam !== undefined ? busqParam : busquedaEvento

    try {
      const params = new URLSearchParams()
      if (d) params.set('desde', d)
      if (h) params.set('hasta', h)
      if (q) params.set('busqueda', q)

      const res = await fetch(`/api/admin/eventos?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.eventos && Array.isArray(data.eventos)) {
          setEventos(data.eventos)
          return
        }
      }

      // Fallback local en caso de desconexión
      const locales = EventoRepositorio.obtenerTodos().filter((e) => {
        const tiempo = new Date(e.fechaEvento).getTime()
        const tD = d ? new Date(d).getTime() : 0
        const tH = h ? new Date(h + 'T23:59:59').getTime() : Infinity
        return tiempo >= tD && tiempo <= tH
      })
      setEventos(locales)
    } catch (err) {
      console.error('Error consultando eventos:', err)
    } finally {
      setCargandoEventos(false)
    }
  }

  const aplicarPresetFecha = (preset: 'este_mes' | 'proximos_30' | 'proximos_90' | 'pasados' | 'personalizado') => {
    setFiltroPresetFecha(preset)
    const ahora = new Date()
    let nuevaDesde = ''
    let nuevaHasta = ''

    if (preset === 'este_mes') {
      nuevaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString().split('T')[0]
      nuevaHasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).toISOString().split('T')[0]
    } else if (preset === 'proximos_30') {
      nuevaDesde = ahora.toISOString().split('T')[0]
      const fHasta = new Date()
      fHasta.setDate(ahora.getDate() + 30)
      nuevaHasta = fHasta.toISOString().split('T')[0]
    } else if (preset === 'proximos_90') {
      nuevaDesde = ahora.toISOString().split('T')[0]
      const fHasta = new Date()
      fHasta.setDate(ahora.getDate() + 90)
      nuevaHasta = fHasta.toISOString().split('T')[0]
    } else if (preset === 'pasados') {
      const fDesde = new Date()
      fDesde.setMonth(ahora.getMonth() - 6)
      nuevaDesde = fDesde.toISOString().split('T')[0]
      const fAyer = new Date()
      fAyer.setDate(ahora.getDate() - 1)
      nuevaHasta = fAyer.toISOString().split('T')[0]
    }

    if (preset !== 'personalizado') {
      setFechaDesde(nuevaDesde)
      setFechaHasta(nuevaHasta)
      consultarEventos(nuevaDesde, nuevaHasta)
    }
  }

  const copiarEnlaceAdmin = (tokenAdmin: string, id: string) => {
    const enlace = `${baseUrl}/gestionar/${tokenAdmin}`
    navigator.clipboard.writeText(enlace)
    setIdCopiadoAdmin(id)
    notificar('URL de gestión copiada al portapapeles.')
    setTimeout(() => setIdCopiadoAdmin(null), 2500)
  }

  const ejecutarEliminarEvento = async () => {
    if (!eventoAEliminar) return
    setEliminandoEvento(true)
    try {
      // 1. Borrado en backend con eliminación en cascada de invitados y confirmaciones
      const res = await fetch(`/api/admin/eventos?id=${encodeURIComponent(eventoAEliminar.id)}`, {
        method: 'DELETE',
      })

      // 2. Limpiar del almacenamiento local
      EventoRepositorio.eliminar(eventoAEliminar.id)

      if (res.ok) {
        notificar(`Evento "${eventoAEliminar.titulo}" y todas sus invitaciones fueron eliminados.`)
      } else {
        notificar('Evento eliminado de memoria y almacenamiento local.')
      }

      setEventoAEliminar(null)
      consultarEventos()
      setMetricas(AdminStorage.calcularMetricas())
    } catch (err) {
      console.error('Error eliminando evento:', err)
      notificar('Hubo un error al procesar la eliminación.')
    } finally {
      setEliminandoEvento(false)
    }
  }

  const notificar = (msg: string) => {
    setMensajeExito(msg)
    setTimeout(() => setMensajeExito(null), 3000)
  }

  const handleCerrarSesion = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Acciones de Promociones
  const handleCrearPromocion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoCodigo.trim()) return

    const nuevaPromo: Promocion = {
      id: `promo-${Date.now()}`,
      codigo: nuevoCodigo.trim().toUpperCase(),
      tipoDescuento: nuevoTipoDescuento,
      valor: nuevoValorDescuento,
      usosMaximos: nuevosUsosMaximos,
      usosActuales: 0,
      activo: true,
      creadoEn: new Date().toISOString(),
    }

    AdminStorage.guardarPromocion(nuevaPromo)
    setPromociones(AdminStorage.obtenerPromociones())
    setNuevoCodigo('')
    notificar(`Cupón ${nuevaPromo.codigo} creado con éxito.`)
  }

  const handleEliminarPromocion = (id: string) => {
    AdminStorage.eliminarPromocion(id)
    setPromociones(AdminStorage.obtenerPromociones())
    notificar('Cupón eliminado.')
  }

  const handleTogglePromocion = (promo: Promocion) => {
    const actualizada = { ...promo, activo: !promo.activo }
    AdminStorage.guardarPromocion(actualizada)
    setPromociones(AdminStorage.obtenerPromociones())
  }

  // Acciones de Publicaciones
  const handleCrearPublicacion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoTituloPub.trim()) return

    const nuevaPub: PublicacionLanding = {
      id: `pub-${Date.now()}`,
      tipo: 'banner_superior',
      titulo: nuevoTituloPub.trim(),
      contenido: nuevoContenidoPub.trim(),
      textoBoton: nuevoBotonPub.trim() || undefined,
      enlaceBoton: nuevoEnlacePub.trim() || undefined,
      colorFondo: nuevoColorPub,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    }

    AdminStorage.guardarPublicacion(nuevaPub)
    setPublicaciones(AdminStorage.obtenerPublicaciones())
    setNuevoTituloPub('')
    setNuevoContenidoPub('')
    notificar('Aviso publicado en la landing page.')
  }

  const handleEliminarPublicacion = (id: string) => {
    AdminStorage.eliminarPublicacion(id)
    setPublicaciones(AdminStorage.obtenerPublicaciones())
    notificar('Publicación eliminada.')
  }

  const handleTogglePublicacion = (pub: PublicacionLanding) => {
    const actualizada = { ...pub, activo: !pub.activo }
    AdminStorage.guardarPublicacion(actualizada)
    setPublicaciones(AdminStorage.obtenerPublicaciones())
  }

  // Acciones de Eventos
  const handleTogglePremiumEvento = (ev: DetalleEvento) => {
    const actualizado = { ...ev, esPremium: !ev.esPremium }
    EventoRepositorio.guardar(actualizado)
    cargarDatos()
    notificar(`Evento ${ev.titulo} actualizado a ${actualizado.esPremium ? 'PREMIUM' : 'GRATUITO'}.`)
  }

  const handleEliminarEvento = (id: string) => {
    if (confirm('¿Está seguro de eliminar este evento y todos sus pases asociados?')) {
      EventoRepositorio.eliminar(id)
      cargarDatos()
      notificar('Evento eliminado del sistema.')
    }
  }

  // Acciones de Configuración Global
  const handleGuardarConfiguracion = (e: React.FormEvent) => {
    e.preventDefault()
    AdminStorage.guardarConfiguracion(configuracion)
    cargarDatos()
    notificar('Configuración operativa guardada con éxito.')
  }

  if (cargandoAuth) {
    return (
      <div
        className="min-h-screen bg-white text-slate-900 flex items-center justify-center font-serif"
        style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
      >
        <p className="text-xs text-slate-500 animate-pulse font-medium">
          Verificando credenciales de seguridad...
        </p>
      </div>
    )
  }

  if (!autenticado) return null

  // Filtro de eventos
  const eventosFiltrados = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(busquedaEvento.toLowerCase()) ||
      e.slugPublico.toLowerCase().includes(busquedaEvento.toLowerCase()) ||
      e.tokenAdmin.toLowerCase().includes(busquedaEvento.toLowerCase())
  )

  return (
    <div
      className="min-h-screen bg-slate-50/70 text-slate-900 font-serif selection:bg-slate-900 selection:text-white"
      style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
    >
      {/* Barra Superior con el mismo estilo de la Landing */}
      <header className="w-full bg-white border-b border-slate-200 px-6 sm:px-12 py-3.5 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <TarjetonLogo size="sm" subtexto="admin" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={cargarDatos}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="Recargar datos y métricas"
          >
            <RefreshCw size={14} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Ver Sitio Web</span>
          </Link>

          <button
            type="button"
            onClick={handleCerrarSesion}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Alerta flotante de notificación */}
      {mensajeExito && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-200 border border-slate-800">
          <Check size={16} className="text-emerald-400" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Encabezado de la Consola */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sesión Segura Activa (Superadmin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Métricas, Ingresos & Configuración
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Supervisión de compras de planes Premium, cupones de descuento, anuncios en el Home y control de eventos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/crear"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Nuevo Evento</span>
            </Link>
          </div>
        </div>

        {/* ═════════ TARJETAS DE MÉTRICAS & INGRESOS (KPIS) ═════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold">Ingresos (COP)</span>
              <DollarSign size={16} className="text-emerald-600" />
            </div>
            <span className="text-2xl font-black font-mono text-slate-950 block">
              ${(metricas?.ingresosTotalesCOP || 0).toLocaleString('es-CO')}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">COP recaudados</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold">Equivalente USD</span>
              <DollarSign size={16} className="text-slate-800" />
            </div>
            <span className="text-2xl font-black font-mono text-slate-950 block">
              ${(metricas?.ingresosTotalesUSD || 0).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">USD acumulados</span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold">Eventos Creados</span>
              <Calendar size={16} className="text-slate-800" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">
              {metricas?.totalEventos || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {metricas?.totalEventosPremium || 0} Premium · {metricas?.totalEventosGratis || 0} Gratis
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold">Tasa Conversión</span>
              <TrendingUp size={16} className="text-slate-800" />
            </div>
            <span className="text-2xl font-black text-slate-950 font-mono block">
              {metricas?.tasaConversion || 0}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Gratis a Premium</span>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold">Total Invitados</span>
              <Users size={16} className="text-slate-800" />
            </div>
            <span className="text-2xl font-black text-slate-950 block">
              {metricas?.totalInvitados || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Pases nominales creados</span>
          </div>
        </div>

        {/* ═════════ BARRA DE PESTAÑAS (ESTILO CÁPSULA LANDING) ═════════ */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto text-xs">
          {[
            { id: 'metricas', label: 'Estadísticas', icono: <TrendingUp size={14} /> },
            { id: 'promociones', label: 'Promociones & Cupones', icono: <Ticket size={14} /> },
            { id: 'publicaciones', label: 'Banners en Landing', icono: <Megaphone size={14} /> },
            { id: 'eventos', label: 'Gestión de Eventos', icono: <Calendar size={14} /> },
            { id: 'configuracion', label: 'Configuración Global', icono: <Sliders size={14} /> },
            { id: 'seguridad', label: 'Seguridad Master', icono: <ShieldCheck size={14} /> },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPestana(p.id as any)}
              className={`px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                pestana === p.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.icono}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* ═════════ PESTAÑA 1: ESTADÍSTICAS & EVENTOS RECIENTES ═════════ */}
        {pestana === 'metricas' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-950 mb-1 flex items-center gap-2">
                <TrendingUp size={18} />
                <span>Últimos Eventos Registrados</span>
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Registro histórico de los actos y celebraciones configuradas por los usuarios.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Título del Evento</th>
                      <th className="py-3 px-3">Anfitrión</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3">Licencia</th>
                      <th className="py-3 px-3">Fecha</th>
                      <th className="py-3 px-3 text-right">Tarjeta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(metricas?.eventosRecientes || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Aún no hay eventos registrados en la plataforma.
                        </td>
                      </tr>
                    ) : (
                      (metricas?.eventosRecientes || []).map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-slate-950 max-w-[220px] truncate">
                            {ev.titulo}
                          </td>
                          <td className="py-3.5 px-3 text-slate-700">{ev.anfitriones || '—'}</td>
                          <td className="py-3.5 px-3 capitalize text-slate-600">{ev.tipoEvento}</td>
                          <td className="py-3.5 px-3">
                            {ev.esPremium ? (
                              <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-bold inline-flex items-center gap-1">
                                <Award size={11} className="text-amber-400" />
                                <span>Premium ($15.900)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                                Cortesía (50 pases)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                            {ev.fechaEvento?.split('T')[0] || '—'}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <Link
                              href={`/i/${ev.slugPublico}`}
                              target="_blank"
                              className="text-slate-900 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <span>Ver</span>
                              <ExternalLink size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ PESTAÑA 2: PROMOCIONES & CUPONES ═════════ */}
        {pestana === 'promociones' && (
          <div className="space-y-6">
            {/* Formulario de Creación de Cupones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-950 mb-1 flex items-center gap-2">
                <Ticket size={18} />
                <span>Generador de Códigos Promocionales / Cupones</span>
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Crea cupones de descuento para campañas de marketing. Se aplicarán automáticamente en el checkout de Mercado Pago.
              </p>

              <form onSubmit={handleCrearPromocion} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Código del Cupón
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoCodigo}
                    onChange={(e) => setNuevoCodigo(e.target.value)}
                    placeholder="Ej: BODA50 / LANZAMIENTO"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-950 uppercase focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Tipo de Descuento
                  </label>
                  <select
                    value={nuevoTipoDescuento}
                    onChange={(e) => setNuevoTipoDescuento(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  >
                    <option value="porcentaje">Porcentaje de Descuento (%)</option>
                    <option value="precio_fijo">Tarifa Fija Especial (COP)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {nuevoTipoDescuento === 'porcentaje' ? 'Valor (% Descuento)' : 'Precio Final en COP'}
                  </label>
                  <input
                    type="number"
                    required
                    value={nuevoValorDescuento}
                    onChange={(e) => setNuevoValorDescuento(Number(e.target.value))}
                    placeholder={nuevoTipoDescuento === 'porcentaje' ? '20' : '9900'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Límite de Usos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={nuevosUsosMaximos}
                      onChange={(e) => setNuevosUsosMaximos(Number(e.target.value))}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Plus size={14} /> <span>Crear</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Listado de Cupones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-950 mb-3">Cupones Registrados</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Beneficio</th>
                      <th className="py-2.5 px-3">Usos / Cupo</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promociones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          Aún no has creado cupones de promoción.
                        </td>
                      </tr>
                    ) : (
                      promociones.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-mono font-bold text-slate-950">{p.codigo}</td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {p.tipoDescuento === 'porcentaje'
                              ? `${p.valor}% de Descuento`
                              : `$${p.valor.toLocaleString('es-CO')} COP`}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {p.usosActuales} / {p.usosMaximos}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePromocion(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                p.activo
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {p.activo ? 'Activo' : 'Pausado'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEliminarPromocion(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Eliminar cupón"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ PESTAÑA 3: BANNERS EN LANDING PAGE ═════════ */}
        {pestana === 'publicaciones' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-950 mb-1 flex items-center gap-2">
                <Megaphone size={18} />
                <span>Publicar Anuncio o Promoción en la Landing Page</span>
              </h3>
              <p className="text-xs text-slate-600 mb-6">
                Configura un banner superior que se mostrará en la cabecera de la página principal para captar clientes.
              </p>

              <form onSubmit={handleCrearPublicacion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Título Destacado
                    </label>
                    <input
                      type="text"
                      required
                      value={nuevoTituloPub}
                      onChange={(e) => setNuevoTituloPub(e.target.value)}
                      placeholder="Ej: ¡Oferta Especial de Temporada!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Color de Fondo del Banner
                    </label>
                    <div className="flex items-center gap-2 border border-slate-300 rounded-xl px-3 py-1.5 bg-white">
                      <input
                        type="color"
                        value={nuevoColorPub}
                        onChange={(e) => setNuevoColorPub(e.target.value)}
                        className="w-7 h-7 rounded border-0 cursor-pointer"
                      />
                      <span className="font-mono text-slate-700 text-xs">{nuevoColorPub}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Mensaje / Detalle del Anuncio
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoContenidoPub}
                    onChange={(e) => setNuevoContenidoPub(e.target.value)}
                    placeholder="Ej: Confecciona tu tarjeta hoy y recibe 20% de descuento en el plan Premium con el cupón PROMO20."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Texto del Botón (CTA)
                    </label>
                    <input
                      type="text"
                      value={nuevoBotonPub}
                      onChange={(e) => setNuevoBotonPub(e.target.value)}
                      placeholder="Ej: Crear Invitación"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Enlace de Destino
                    </label>
                    <input
                      type="text"
                      value={nuevoEnlacePub}
                      onChange={(e) => setNuevoEnlacePub(e.target.value)}
                      placeholder="/crear"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Plus size={15} /> <span>Publicar Anuncio en Landing</span>
                </button>
              </form>
            </div>

            {/* Listado de Publicaciones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-950 mb-4">Banners Activos y Anteriores</h4>

              <div className="space-y-3">
                {publicaciones.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No has creado anuncios para la landing page aún.
                  </p>
                ) : (
                  publicaciones.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-black/10 shadow-2xs"
                          style={{ backgroundColor: pub.colorFondo || '#0F172A' }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-950 text-xs">{pub.titulo}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                pub.activo
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {pub.activo ? 'Visible' : 'Pausado'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] truncate mt-0.5">
                            {pub.contenido}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePublicacion(pub)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[11px] text-slate-700 font-semibold cursor-pointer"
                        >
                          {pub.activo ? 'Pausar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarPublicacion(pub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Eliminar publicación"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════ PESTAÑA 4: GESTOR GLOBAL DE EVENTOS POR RANGO DE FECHAS ═════════ */}
        {pestana === 'eventos' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              
              {/* Encabezado con Contexto de Escalabilidad */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                    <CalendarRange size={20} className="text-slate-800" />
                    <span>Control de Eventos por Rango de Fechas ({eventos.length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Filtra eventos en un rango temporal para garantizar máxima velocidad ante miles de registros. Consulta fechas, recupera URLs privadas de anfitriones y modera contenido.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => consultarEventos()}
                    disabled={cargandoEventos}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={cargandoEventos ? 'animate-spin text-amber-400' : ''} />
                    <span>{cargandoEventos ? 'Consultando...' : 'Actualizar Rango'}</span>
                  </button>
                </div>
              </div>

              {/* Botones de Presets Rápidos de Fechas */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Períodos Rápidos de Consulta
                </span>
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 w-fit text-xs">
                  <button
                    type="button"
                    onClick={() => aplicarPresetFecha('este_mes')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filtroPresetFecha === 'este_mes'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Este Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPresetFecha('proximos_30')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filtroPresetFecha === 'proximos_30'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Próximos 30 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPresetFecha('proximos_90')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filtroPresetFecha === 'proximos_90'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Próximos 3 Meses
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarPresetFecha('pasados')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filtroPresetFecha === 'pasados'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Eventos Pasados
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroPresetFecha('personalizado')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filtroPresetFecha === 'personalizado'
                        ? 'bg-white text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
              </div>

              {/* Selector de Rango de Fechas & Buscador de Texto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="sm:col-span-1 lg:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => {
                      setFechaDesde(e.target.value)
                      setFiltroPresetFecha('personalizado')
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-1 lg:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => {
                      setFechaHasta(e.target.value)
                      setFiltroPresetFecha('personalizado')
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Búsqueda de Texto (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={busquedaEvento}
                      onChange={(e) => setBusquedaEvento(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && consultarEventos()}
                      placeholder="Buscar por título, anfitrión o slug..."
                      className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                    />
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <button
                    type="button"
                    onClick={() => consultarEventos()}
                    disabled={cargandoEventos}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs h-[38px] disabled:opacity-50"
                  >
                    <Search size={13} />
                    <span>Filtrar</span>
                  </button>
                </div>
              </div>

              {/* Barra de Estado del Rango Activo */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-1 px-3 bg-slate-100/60 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">
                  Rango Activo: <strong className="text-slate-900 font-mono">{fechaDesde || 'Inicio'}</strong> al <strong className="text-slate-900 font-mono">{fechaHasta || 'Fin'}</strong>
                </span>
                <span className="text-slate-700 font-bold">
                  {eventos.length} {eventos.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                </span>
              </div>

              {/* Tabla Detallada Centrada en Fechas & Recuperación */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Fecha del Evento</th>
                      <th className="py-3 px-3">Evento & Anfitrión</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">URL de Gestión (Recuperación Anfitrión)</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cargandoEventos ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <RefreshCw size={20} className="mx-auto animate-spin mb-2 text-slate-700" />
                          <p className="font-semibold">Consultando eventos en el rango seleccionado...</p>
                        </td>
                      </tr>
                    ) : eventos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          <Calendar className="mx-auto text-slate-400 mb-2" size={26} />
                          <p className="font-bold text-slate-700">No hay eventos en este rango de fechas</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Prueba ampliando las fechas con los botones rápidos o ajustando la búsqueda.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      eventos.map((ev) => {
                        const fechaEv = new Date(ev.fechaEvento)
                        const hoyCero = new Date()
                        hoyCero.setHours(0, 0, 0, 0)
                        const fechaEvCero = new Date(fechaEv)
                        fechaEvCero.setHours(0, 0, 0, 0)
                        const diffDias = Math.round((fechaEvCero.getTime() - hoyCero.getTime()) / (1000 * 60 * 60 * 24))
                        const enlaceAdminPrivado = `${baseUrl}/gestionar/${ev.tokenAdmin}`

                        return (
                          <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* 1. Columna Destacada de Fecha */}
                            <td className="py-3.5 px-3 min-w-[210px]">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center shrink-0">
                                  <span className="text-[9px] font-bold uppercase text-slate-500 font-mono leading-none">
                                    {fechaEv.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                                  </span>
                                  <span className="text-base font-black text-slate-950 font-mono leading-tight mt-0.5">
                                    {fechaEv.getDate()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-950 block capitalize truncate">
                                    {fechaEv.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-mono block">
                                    {ev.horaEvento || 'Hora no definida'}
                                  </span>
                                  {diffDias > 1 ? (
                                    <span className="inline-block mt-0.5 text-[9px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                                      En {diffDias} días
                                    </span>
                                  ) : diffDias === 1 ? (
                                    <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                                      Mañana
                                    </span>
                                  ) : diffDias === 0 ? (
                                    <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                                      ¡Se celebra hoy!
                                    </span>
                                  ) : (
                                    <span className="inline-block mt-0.5 text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                      Finalizado hace {Math.abs(diffDias)} d
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 2. Evento & Anfitrión */}
                            <td className="py-3.5 px-3 max-w-[220px]">
                              <span className="font-bold text-slate-950 text-xs block truncate" title={ev.titulo}>
                                {ev.titulo}
                              </span>
                              <span className="text-slate-600 text-[11px] block truncate">
                                Por: {ev.anfitriones || 'No especificado'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                /i/{ev.slugPublico}
                              </span>
                            </td>

                            {/* 3. Plan / Licencia */}
                            <td className="py-3.5 px-3">
                              <button
                                type="button"
                                onClick={() => handleTogglePremiumEvento(ev)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  ev.esPremium
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                                title="Haz clic para alternar el estado Premium manualmente"
                              >
                                <Award size={11} className={ev.esPremium ? 'text-amber-400' : ''} />
                                <span>{ev.esPremium ? 'PREMIUM' : 'GRATUITO'}</span>
                              </button>
                            </td>

                            {/* 4. Enlace de Gestión Privado (Recuperación) */}
                            <td className="py-3.5 px-3 min-w-[240px]">
                              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                                <span className="text-[10px] font-mono text-slate-600 truncate flex-1 select-all" title={enlaceAdminPrivado}>
                                  {enlaceAdminPrivado}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copiarEnlaceAdmin(ev.tokenAdmin, ev.id)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-800 flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
                                  title="Copiar enlace privado para enviar al anfitrión"
                                >
                                  {idCopiadoAdmin === ev.id ? (
                                    <>
                                      <Check size={11} className="text-emerald-600 font-bold" />
                                      <span className="text-emerald-700">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* 5. Acciones Directas */}
                            <td className="py-3.5 px-3 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                              <Link
                                href={`/i/${ev.slugPublico}`}
                                target="_blank"
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs"
                                title="Ver tarjeta pública del invitado"
                              >
                                <span>Tarjeta</span>
                                <ExternalLink size={10} />
                              </Link>

                              <Link
                                href={`/gestionar/${ev.tokenAdmin}`}
                                target="_blank"
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold inline-flex items-center gap-1 border border-slate-200 shadow-2xs"
                                title="Abrir panel del anfitrión"
                              >
                                <span>Gestionar</span>
                                <ExternalLink size={10} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => setEventoAEliminar(ev)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors border border-transparent hover:border-rose-200"
                                title="Eliminar evento definitivamente"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>

                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ PESTAÑA 5: AJUSTES GLOBALES DEL SISTEMA ═════════ */}
        {pestana === 'configuracion' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-950 mb-1 flex items-center gap-2">
              <Sliders size={18} />
              <span>Configuración Operativa del Sistema</span>
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              Ajusta los precios globales, topes de cortesía y parámetros de monetización.
            </p>

            <form onSubmit={handleGuardarConfiguracion} className="space-y-5 text-xs max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Tarifa Base Premium en COP ($)
                  </label>
                  <input
                    type="number"
                    value={configuracion.precioPremiumCOP}
                    onChange={(e) =>
                      setConfiguracion({ ...configuracion, precioPremiumCOP: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 text-sm focus:border-slate-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">Monto cobrado en Mercado Pago</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Tarifa Base Premium en USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={configuracion.precioPremiumUSD}
                    onChange={(e) =>
                      setConfiguracion({ ...configuracion, precioPremiumUSD: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 text-sm focus:border-slate-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">Valor de referencia visual</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Límite Gratuito de Invitados
                  </label>
                  <input
                    type="number"
                    value={configuracion.limiteGratisInvitados}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        limiteGratisInvitados: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 text-sm focus:border-slate-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">
                    A partir de este número se solicita el pago Premium
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    WhatsApp de Soporte Oficial
                  </label>
                  <input
                    type="text"
                    value={configuracion.whatsappSoporte || ''}
                    onChange={(e) =>
                      setConfiguracion({ ...configuracion, whatsappSoporte: e.target.value })
                    }
                    placeholder="573001234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 text-sm focus:border-slate-900 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">
                    Número para asistencia a los anfitriones
                  </span>
                </div>
              </div>

              {/* Anuncios de Google Ads */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                  <div>
                    <span className="font-bold text-slate-950 block text-xs">Anuncios de Google Ads</span>
                    <span className="text-[11px] text-slate-500">
                      Mostrar bloques publicitarios en las tarjetas de eventos gratuitos
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfiguracion({
                        ...configuracion,
                        anunciosAdsHabilitados: !configuracion.anunciosAdsHabilitados,
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      configuracion.anunciosAdsHabilitados ? 'bg-slate-900' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        configuracion.anunciosAdsHabilitados ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Guardar Configuración Operativa
              </button>
            </form>
          </div>
        )}

        {/* ═════════ PESTAÑA 6: SEGURIDAD & AUDITORÍA ═════════ */}
        {pestana === 'seguridad' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Protocolo de Seguridad & Credenciales de Superadministrador</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Este panel opera bajo aislamiento criptográfico con sesiones firmadas en cookies HttpOnly
                y prevención contra ataques de fuerza bruta.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <KeyRound size={16} />
                  <span>¿Cómo cambiar tu contraseña maestra?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Para cambiar las credenciales de acceso en producción o desarrollo local, edita las
                  siguientes variables en tu archivo <code className="text-slate-900 font-bold">.env.local</code> (o en
                  tu panel de Vercel):
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-[10px] text-slate-800 space-y-1">
                  <div>MASTER_ADMIN_USER=tu_nuevo_usuario</div>
                  <div>MASTER_ADMIN_PASSWORD=TuClaveSegura2026!*#</div>
                  <div>MASTER_ADMIN_JWT_SECRET=frase_secreta_larga_aleatoria</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Protecciones Activas en este Panel</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-600 font-bold" />
                    <span>Cookies HttpOnly inaccesibles mediante XSS o JavaScript malicioso.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-600 font-bold" />
                    <span>Comparación en tiempo constante (protección contra Timing Attacks).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-600 font-bold" />
                    <span>Bloqueo temporal por 15 minutos tras 5 intentos fallidos por IP.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-600 font-bold" />
                    <span>Expiración automática de sesión de 8 horas.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE EVENTO ═════════ */}
        {eventoAEliminar && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-slate-950">
                    Eliminar Evento Definitivamente
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Esta acción es irreversible y purgará los registros en cascada.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="text-slate-900 font-bold truncate">
                  {eventoAEliminar.titulo}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Fecha: {new Date(eventoAEliminar.fechaEvento).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Anfitrión: {eventoAEliminar.anfitriones || 'No especificado'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 text-[11px] text-rose-900 space-y-1">
                <span className="font-bold block">Se eliminarán permanentemente:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-800">
                  <li>El evento y su página pública de tarjeta.</li>
                  <li>Todas las invitaciones y pases emitidos.</li>
                  <li>Todos los registros de invitados (tanto confirmados, como pendientes y declinados).</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={eliminandoEvento}
                  onClick={() => setEventoAEliminar(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={eliminandoEvento}
                  onClick={ejecutarEliminarEvento}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {eliminandoEvento ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Eliminando todo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Sí, Eliminar Definitivamente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
