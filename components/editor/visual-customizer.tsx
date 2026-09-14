'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  DetalleEvento,
  ConfiguracionVisual,
  FuenteTipografica,
  EfectoFondo,
  SeccionModular,
  TipoSeccion,
} from '@/types/invitation'
import { PLANTILLAS_TEMAS, TEMA_POR_DEFECTO } from '@/lib/theme-presets'
import { generarTokenAdmin, generarSlug } from '@/lib/event-utils'
import { EventoRepositorio } from '@/lib/storage'
import {
  generarSeccionesPorDefecto,
  crearSeccionPorTipo,
  CATALOGO_SECCIONES,
} from '@/lib/modular-defaults'
import { DynamicInvitationCard } from '@/components/invitation/dynamic-invitation-card'
import { ModalPago } from '@/components/checkout/modal-pago'
import { SeccionItemEditor } from './seccion-item-editor'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import {
  Palette,
  Calendar,
  Layers,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  Eye,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Smartphone,
  Monitor,
  X,
  Check,
} from 'lucide-react'

interface VisualCustomizerProps {
  eventoInicial?: DetalleEvento
  visualInicial?: ConfiguracionVisual
  modoEdicion?: boolean
}

export function VisualCustomizer({
  eventoInicial,
  visualInicial = TEMA_POR_DEFECTO,
  modoEdicion = false,
}: VisualCustomizerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [pestanaActiva, setPestanaActiva] = useState<
    'secciones' | 'diseno' | 'multimedia' | 'evento' | 'plantillas'
  >('secciones')
  const [vistaMobile, setVistaMobile] = useState<'editor' | 'preview'>('editor')
  const [vistaDispositivo, setVistaDispositivo] = useState<'movil' | 'desktop'>('movil')
  const [guardando, setGuardando] = useState(false)
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [mostrarModalAgregarSeccion, setMostrarModalAgregarSeccion] = useState(false)
  const [seccionExpandidaId, setSeccionExpandidaId] = useState<string | null>(null)

  // Estado del Evento
  const [evento, setEvento] = useState<DetalleEvento>(() => {
    if (eventoInicial) return eventoInicial

    const hoy = new Date()
    const fechaPorDefecto = new Date(hoy.setDate(hoy.getDate() + 30)).toISOString().split('T')[0]

    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-id',
      tokenAdmin: generarTokenAdmin(),
      slugPublico: '',
      tipoEvento: 'corporativo',
      titulo: 'Cumbre de Innovación & Liderazgo 2026',
      subtitulo: 'Sesión Plenaria & Cóctel de Honor',
      anfitriones: 'Comité Directivo & Socios Estratégicos',
      fechaEvento: `${fechaPorDefecto}T18:30:00`,
      horaEvento: '6:30 PM',
      direccion: 'Centro de Convenciones Metropolitano, Auditorio Principal',
      enlaceMapa: 'https://maps.google.com',
      codigoVestimenta: 'Traje Formal / Corbata Oscura',
      whatsappNumero: '573001234567',
      whatsappPlantilla:
        'Estimado Comité: Confirmo la asistencia de {invitado} para {pases} persona(s) a {evento}.',
      datosBancarios: {
        banco: 'Bancolombia',
        numeroCuenta: '001-987654-20',
        titular: 'Fondo Corporativo',
        tipoCuenta: 'Corriente',
      },
      esPremium: false,
      creadoEn: new Date().toISOString(),
      expiraEn: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
    }
  })

  // Estado de la Configuración Visual
  const [visual, setVisual] = useState<ConfiguracionVisual>(() => {
    return eventoInicial?.configuracionVisual || visualInicial
  })

  // Estado de las Secciones Modulares
  const [secciones, setSecciones] = useState<SeccionModular[]>(() => {
    if (eventoInicial?.secciones && eventoInicial.secciones.length > 0) {
      return eventoInicial.secciones
    }
    return generarSeccionesPorDefecto(evento)
  })

  // Sincronizar secciones con la cabecera del evento
  const cabecera = secciones.find((s) => s.tipo === 'cabecera')

  const actualizarEvento = (campo: keyof DetalleEvento, valor: any) => {
    setEvento((prev) => ({ ...prev, [campo]: valor }))
  }

  const actualizarVisual = (campo: keyof ConfiguracionVisual, valor: any) => {
    setVisual((prev) => ({ ...prev, [campo]: valor }))
  }

  // Operaciones de Secciones Modulares
  const moverSeccion = (indice: number, direccion: 'arriba' | 'abajo') => {
    const nuevoIndice = direccion === 'arriba' ? indice - 1 : indice + 1
    if (nuevoIndice < 0 || nuevoIndice >= secciones.length) return

    const copia = [...secciones]
    const temporal = copia[indice]
    copia[indice] = copia[nuevoIndice]
    copia[nuevoIndice] = temporal

    // Normalizar propiedad orden
    const reordenadas = copia.map((s, idx) => ({ ...s, orden: idx }))
    setSecciones(reordenadas)
  }

  const alternarVisibilidadSeccion = (id: string) => {
    setSecciones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }

  const eliminarSeccion = (id: string) => {
    setSecciones((prev) =>
      prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, orden: idx }))
    )
  }

  const actualizarCampoSeccion = (id: string, campo: keyof SeccionModular, valor: any) => {
    setSecciones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [campo]: valor } : s))
    )
  }

  const actualizarDatosSeccion = (id: string, campoDatos: string, valor: any) => {
    setSecciones((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const datosActuales = s.datos || {}
        return {
          ...s,
          datos: { ...datosActuales, [campoDatos]: valor },
        }
      })
    )
  }

  const agregarNuevaSeccion = (tipo: TipoSeccion) => {
    const nueva = crearSeccionPorTipo(tipo, secciones.length)
    setSecciones((prev) => [...prev, nueva])
    setSeccionExpandidaId(nueva.id)
    setMostrarModalAgregarSeccion(false)
  }

  const aplicarPlantilla = (plantillaId: string) => {
    const plantilla = PLANTILLAS_TEMAS.find((p) => p.id === plantillaId)
    if (plantilla) {
      setVisual(plantilla.visual)
      actualizarEvento('tipoEvento', plantilla.tipoEvento)
    }
  }

  // Detección de selección de plan Premium desde la landing page
  useEffect(() => {
    if (searchParams.get('plan') === 'premium' && !evento.esPremium) {
      setMostrarModalPago(true)
    }
  }, [searchParams, evento.esPremium])

  const handlePagoCompletado = () => {
    const eventoActualizado = { ...evento, esPremium: true }
    setEvento(eventoActualizado)
    EventoRepositorio.guardar(eventoActualizado)
    setMostrarModalPago(false)
  }

  const handleGuardarYPublicar = () => {
    setGuardando(true)
    try {
      const slug = evento.slugPublico || generarSlug(evento.titulo)
      const fechaExpira = new Date(
        new Date(evento.fechaEvento).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString()

      const eventoGuardado: DetalleEvento = {
        ...evento,
        slugPublico: slug,
        expiraEn: fechaExpira,
        configuracionVisual: visual,
        secciones: secciones,
        imagenPortada: cabecera?.datos?.imagenPortada || evento.imagenPortada,
        imagenRetrato: cabecera?.datos?.imagenRetrato || evento.imagenRetrato,
      }

      EventoRepositorio.guardar(eventoGuardado)
      router.push(`/gestionar/${eventoGuardado.tokenAdmin}`)
    } catch (e) {
      console.error(e)
      setGuardando(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Barra Superior de Herramientas */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Botón para regresar a la Landing Page */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            title="Regresar a la página principal"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          {/* Logotipo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 group-hover:bg-slate-800 flex items-center justify-center font-bold text-sm text-white transition-colors">
              ✦
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-slate-950 transition-colors">
                  InvitacionesYa Studio
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                  {modoEdicion ? 'Modo Edición' : 'Creador Modular'}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Acciones Superiores */}
        <div className="flex items-center gap-2.5">
          {/* Alternador Mobile (Editor / Vista Previa) */}
          <div className="flex sm:hidden bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setVistaMobile('editor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md ${
                vistaMobile === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setVistaMobile('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1 ${
                vistaMobile === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Eye size={12} /> Ver
            </button>
          </div>

          {/* Estado de Licencia */}
          {evento.esPremium ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-2xs">
              <Award size={14} className="text-amber-400" />
              <span>Licencia Activa</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarModalPago(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-2xs"
              title="Habilitar invitados ilimitados y remover publicidad por $3.99 USD"
            >
              <Award size={14} />
              <span className="hidden sm:inline">Activar</span> <span>Premium ($3.99)</span>
            </button>
          )}

          <button
            onClick={handleGuardarYPublicar}
            disabled={guardando}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {guardando ? (
              'Guardando...'
            ) : (
              <>
                <span>{modoEdicion ? 'Guardar Cambios' : 'Publicar Tarjeta'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Espacio de Trabajo Principal (2 Columnas) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Barra Lateral de Configuración Modular */}
        <div
          className={`lg:col-span-6 xl:col-span-5 h-[calc(100vh-61px)] overflow-y-auto bg-white border-r border-slate-200 p-4 sm:p-6 ${
            vistaMobile === 'preview' ? 'hidden sm:block' : 'block'
          }`}
        >
          {/* Pestañas de Navegación del Editor */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-6 text-center text-xs">
            {[
              { id: 'secciones', label: 'Módulos', icono: <Layers size={15} /> },
              { id: 'diseno', label: 'Estilos', icono: <Palette size={15} /> },
              { id: 'multimedia', label: 'Imágenes', icono: <ImageIcon size={15} /> },
              { id: 'evento', label: 'Datos', icono: <Calendar size={15} /> },
              { id: 'plantillas', label: 'Temas', icono: <Sparkles size={15} /> },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPestanaActiva(p.id as any)}
                className={`py-2 px-1 rounded-lg font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  pestanaActiva === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p.icono}
                <span className="text-[10px]">{p.label}</span>
              </button>
            ))}
          </div>

          {/* ═══════════════ PESTAÑA 1: MÓDULOS & SECCIONES (DINÁMICO) ═══════════════ */}
          {pestanaActiva === 'secciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={16} /> Estructura Modular de la Invitación
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Reordena con las flechas, personaliza textos, iconos, imágenes o añade nuevos bloques.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarModalAgregarSeccion(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={14} /> <span>Añadir Módulo</span>
                </button>
              </div>

              {/* Lista de Secciones Ordenables */}
              <div className="space-y-2.5">
                {secciones.map((sec, idx) => (
                  <SeccionItemEditor
                    key={sec.id}
                    seccion={sec}
                    indice={idx}
                    totalSecciones={secciones.length}
                    expandido={seccionExpandidaId === sec.id}
                    alAlternarExpandido={() =>
                      setSeccionExpandidaId(seccionExpandidaId === sec.id ? null : sec.id)
                    }
                    alMover={(dir) => moverSeccion(idx, dir)}
                    alAlternarVisibilidad={() => alternarVisibilidadSeccion(sec.id)}
                    alEliminar={() => eliminarSeccion(sec.id)}
                    alActualizarCampo={(campo, val) => actualizarCampoSeccion(sec.id, campo, val)}
                    alActualizarDatos={(campoDatos, val) =>
                      actualizarDatosSeccion(sec.id, campoDatos, val)
                    }
                  />
                ))}
              </div>

              {/* Botón inferior grande para añadir módulo */}
              <button
                type="button"
                onClick={() => setMostrarModalAgregarSeccion(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Agregar Sección a la Invitación</span>
              </button>
            </div>
          )}

          {/* ═══════════════ PESTAÑA 2: DISEÑO, COLORES & TIPOGRAFÍAS ═══════════════ */}
          {pestanaActiva === 'diseno' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Palette size={16} /> Paleta de Colores Corporativos
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ajusta los tonos sobrios y de alta distinción para la tarjeta y fondos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Fondo General
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                    <input
                      type="color"
                      value={visual.colorFondo}
                      onChange={(e) => actualizarVisual('colorFondo', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{visual.colorFondo}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Fondo de Tarjeta
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                    <input
                      type="color"
                      value={visual.colorTarjeta}
                      onChange={(e) => actualizarVisual('colorTarjeta', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{visual.colorTarjeta}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Acento Primario (Botón)
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                    <input
                      type="color"
                      value={visual.colorPrimario}
                      onChange={(e) => actualizarVisual('colorPrimario', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{visual.colorPrimario}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Acento Secundario (Filetes)
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                    <input
                      type="color"
                      value={visual.colorSecundario}
                      onChange={(e) => actualizarVisual('colorSecundario', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{visual.colorSecundario}</span>
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Color de Texto
                  </label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1.5 bg-white">
                    <input
                      type="color"
                      value={visual.colorTexto}
                      onChange={(e) => actualizarVisual('colorTexto', e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono">{visual.colorTexto}</span>
                  </div>
                </div>
              </div>

              {/* Tipografía */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                  Tipografía de Títulos y Anfitriones
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'playfair', nombre: 'Playfair (Clásica Formal)', muestra: 'font-serif' },
                    { id: 'cormorant', nombre: 'Cormorant (Ceremonial)', muestra: 'font-serif italic' },
                    { id: 'cinzel', nombre: 'Cinzel (Solemne / Monumental)', muestra: 'font-serif tracking-widest' },
                    { id: 'montserrat', nombre: 'Montserrat (Moderna)', muestra: 'font-sans font-bold' },
                    { id: 'inter', nombre: 'Inter (Corporativa Limpia)', muestra: 'font-sans font-medium' },
                    { id: 'dancing', nombre: 'Dancing Script (Cursiva)', muestra: 'font-serif italic' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => actualizarVisual('fuenteTitulo', font.id as FuenteTipografica)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        visual.fuenteTitulo === font.id
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className={`text-sm block ${font.muestra}`}>Sofía & Carlos</span>
                      <span className="text-[10px] text-slate-500">{font.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Efecto de Fondo Sutil */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                  Efecto Ambiental de Fondo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ninguno', nombre: 'Limpio / Minimalista' },
                    { id: 'particulas_doradas', nombre: 'Micro-destellos Oro' },
                    { id: 'destellos', nombre: 'Reflejos Platino' },
                    { id: 'estrellas', nombre: 'Constelaciones Sutiles' },
                  ].map((efecto) => (
                    <button
                      key={efecto.id}
                      type="button"
                      onClick={() => actualizarVisual('efectoFondo', efecto.id as EfectoFondo)}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                        visual.efectoFondo === efecto.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {efecto.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ PESTAÑA 3: MULTIMEDIA & IMÁGENES ═══════════════ */}
          {pestanaActiva === 'multimedia' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon size={16} /> Gestión Rápida de Fotografías & Logotipo
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Las imágenes enriquecen la presencia protocolaria de la tarjeta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-xs font-bold text-slate-900">
                  ¿Cómo configurar las imágenes de tu tarjeta?
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Puedes personalizar la <strong>Fotografía de Portada</strong> y el{' '}
                  <strong>Logotipo o Foto de los Anfitriones</strong> desplegando el módulo{' '}
                  <strong>Cabecera & Portada</strong> en la pestaña <em>Módulos</em>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPestanaActiva('secciones')
                    const sec = secciones.find((s) => s.tipo === 'cabecera')
                    if (sec) setSeccionExpandidaId(sec.id)
                  }}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Layers size={13} /> Abrir Editor de Cabecera
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════ PESTAÑA 4: DATOS DEL EVENTO & WHATSAPP ═══════════════ */}
          {pestanaActiva === 'evento' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} /> Datos Centrales del Evento
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Información clave para los asistentes y el número para confirmar asistencia.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Título del Acto
                  </label>
                  <input
                    type="text"
                    value={evento.titulo}
                    onChange={(e) => {
                      actualizarEvento('titulo', e.target.value)
                      // Sincronizar cabecera si existe
                      const sec = secciones.find((s) => s.tipo === 'cabecera')
                      if (sec) actualizarCampoSeccion(sec.id, 'titulo', e.target.value)
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Anfitriones o Entidad Convocante
                  </label>
                  <input
                    type="text"
                    value={evento.anfitriones}
                    onChange={(e) => actualizarEvento('anfitriones', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Fecha del Evento
                    </label>
                    <input
                      type="date"
                      value={evento.fechaEvento.split('T')[0]}
                      onChange={(e) =>
                        actualizarEvento(
                          'fechaEvento',
                          `${e.target.value}T${evento.fechaEvento.split('T')[1] || '19:00:00'}`
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Hora de Inicio
                    </label>
                    <input
                      type="text"
                      value={evento.horaEvento}
                      onChange={(e) => actualizarEvento('horaEvento', e.target.value)}
                      placeholder="Ej: 7:00 PM"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Sede / Dirección
                  </label>
                  <input
                    type="text"
                    value={evento.direccion}
                    onChange={(e) => {
                      actualizarEvento('direccion', e.target.value)
                      const sec = secciones.find((s) => s.tipo === 'ubicacion')
                      if (sec) actualizarDatosSeccion(sec.id, 'direccion', e.target.value)
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                {/* WhatsApp de Confirmación */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MessageSquare size={13} /> WhatsApp para Recibir Confirmaciones
                    </label>
                    <input
                      type="text"
                      value={evento.whatsappNumero}
                      onChange={(e) => actualizarEvento('whatsappNumero', e.target.value)}
                      placeholder="Con indicativo, ej: 573001234567"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-500">
                      Incluye código de país (57 para Colombia, 52 para México, etc.) sin espacios ni signos +.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Plantilla del Mensaje de WhatsApp
                    </label>
                    <textarea
                      rows={3}
                      value={evento.whatsappPlantilla}
                      onChange={(e) => actualizarEvento('whatsappPlantilla', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg leading-relaxed font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Variables dinámicas:{' '}
                      <code className="text-slate-800 font-bold">{'{invitado}'}</code>,{' '}
                      <code className="text-slate-800 font-bold">{'{pases}'}</code>,{' '}
                      <code className="text-slate-800 font-bold">{'{evento}'}</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ PESTAÑA 5: PLANTILLAS PREDETERMINADAS ═══════════════ */}
          {pestanaActiva === 'plantillas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} /> Colección de Estilos Formales
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Aplica una combinación preconfigurada y luego ajústala libremente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLANTILLAS_TEMAS.map((plantilla) => (
                  <button
                    key={plantilla.id}
                    type="button"
                    onClick={() => aplicarPlantilla(plantilla.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-left transition-all hover:shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: plantilla.visual.colorPrimario }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: plantilla.visual.colorSecundario }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: plantilla.visual.colorFondo }}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                      {plantilla.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                      {plantilla.descripcion}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ════════════════ VISTA PREVIA EN TIEMPO REAL ════════════════ */}
        <div
          className={`lg:col-span-6 xl:col-span-7 h-[calc(100vh-61px)] overflow-y-auto bg-slate-200/70 p-4 sm:p-8 flex flex-col items-center justify-start ${
            vistaMobile === 'editor' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Selector de Tamaño de Vista Previa (Móvil / Escritorio) */}
          <div className="mb-4 bg-white px-3 py-1.5 rounded-full border border-slate-300 shadow-xs flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Vista Previa en Vivo:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-full">
              <button
                type="button"
                onClick={() => setVistaDispositivo('movil')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  vistaDispositivo === 'movil'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Smartphone (Formato Vertical)"
              >
                <Smartphone size={14} />
              </button>
              <button
                type="button"
                onClick={() => setVistaDispositivo('desktop')}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  vistaDispositivo === 'desktop'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Amplia"
              >
                <Monitor size={14} />
              </button>
            </div>
          </div>

          {/* Marco de Dispositivo Móvil */}
          <div
            className={`w-full transition-all duration-300 flex justify-center ${
              vistaDispositivo === 'movil' ? 'max-w-[440px]' : 'max-w-2xl'
            }`}
          >
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-white">
              <DynamicInvitationCard
                evento={{ ...evento, secciones }}
                visual={visual}
                esModoVistaPrevia={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════ MODAL: CATÁLOGO DE MÓDULOS DISPONIBLES ════════════ */}
      {mostrarModalAgregarSeccion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus size={18} /> Añadir Módulo a la Invitación
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona la sección que deseas incorporar a tu diseño protocolario.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalAgregarSeccion(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
              {CATALOGO_SECCIONES.filter(
                (c) => c.tipo !== 'cabecera' && c.tipo !== 'confirmacion_rsvp'
              ).map((cat) => (
                <button
                  key={cat.tipo}
                  type="button"
                  onClick={() => agregarNuevaSeccion(cat.tipo)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                      <IconoDinamico nombre={cat.iconoDefecto} size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{cat.nombre}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{cat.descripcion}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalAgregarSeccion(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pasarela de Pago para Licencia Premium */}
      <ModalPago
        abierto={mostrarModalPago}
        alCerrar={() => setMostrarModalPago(false)}
        alCompletarPago={handlePagoCompletado}
        tituloEvento={evento.titulo}
        tokenAdmin={evento.tokenAdmin}
        eventoId={evento.id}
      />
    </div>
  )
}
