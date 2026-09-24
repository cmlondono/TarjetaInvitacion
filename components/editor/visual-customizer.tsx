'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  DetalleEvento,
  ConfiguracionVisual,
  FuenteTipografica,
  EfectoFondo,
  SeccionModular,
  TipoSeccion,
  MetodoConfirmacion,
  FormaTarjeta,
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
import { SobreAperturaAnimado } from '@/components/invitation/sobre-apertura-animado'
import { ModalPersonalizadorSobre } from './modal-personalizador-sobre'
import { ModalPago } from '@/components/checkout/modal-pago'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
import { SeccionItemEditor } from './seccion-item-editor'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { CanvaStudioDrawer, PestanaCanva } from './canva-studio-drawer'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SelectorColorTonal } from './selector-color-tonal'
import {
  CATALOGO_PALETAS,
  PaletaCompleta as PaletaRapida,
} from '@/lib/palette-presets'
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
  Music,
  Volume2,
  Play,
  Pause,
  Edit3,
  Sliders,
  Wand2,
  Square,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Mail,
} from 'lucide-react'

const PRESETS_MUSICA = [
  {
    id: 'canon_re',
    nombre: 'Canon en Re Mayor (Pachelbel)',
    subtitulo: 'Cuerdas solemnes y bodas de gala',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pachelbel-canon-in-d-major-for-two-cellos-111005.mp3',
  },
  {
    id: 'piano_romantico',
    nombre: 'Vals Romántico en Piano',
    subtitulo: 'Melodía suave y emotiva',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-10141.mp3',
  },
  {
    id: 'acustico_solemne',
    nombre: 'Cuerdas Acústicas & Reverberación',
    subtitulo: 'Ideal para grados y aniversarios',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf73458.mp3?filename=acoustic-guitars-ambient-uplifting-10820.mp3',
  },
  {
    id: 'jazz_coctel',
    nombre: 'Jazz Lounge & Bossa Nova',
    subtitulo: 'Corporativo, cóctel y networking',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3?filename=smooth-waters-115977.mp3',
  },
]

const PALETAS_RAPIDAS: PaletaRapida[] = CATALOGO_PALETAS

const TIPOGRAFIAS_RAPIDAS: {
  id: string
  nombre: string
  subtitulo: string
  tituloFont: FuenteTipografica
  cuerpoFont: FuenteTipografica
}[] = [
  {
    id: 'caligrafica',
    nombre: 'Great Vibes',
    subtitulo: 'Caligrafía',
    tituloFont: 'greatvibes',
    cuerpoFont: 'montserrat',
  },
  {
    id: 'nupcial',
    nombre: 'Alex Brush',
    subtitulo: 'Nupcial',
    tituloFont: 'alexbrush',
    cuerpoFont: 'inter',
  },
  {
    id: 'parisienne',
    nombre: 'Parisienne',
    subtitulo: 'Chic',
    tituloFont: 'parisienne',
    cuerpoFont: 'montserrat',
  },
  {
    id: 'clasica',
    nombre: 'Playfair',
    subtitulo: 'Clásica',
    tituloFont: 'playfair',
    cuerpoFont: 'montserrat',
  },
  {
    id: 'gala',
    nombre: 'Cormorant',
    subtitulo: 'Gala',
    tituloFont: 'cormorant',
    cuerpoFont: 'montserrat',
  },
  {
    id: 'prata',
    nombre: 'Prata',
    subtitulo: 'Didone',
    tituloFont: 'prata',
    cuerpoFont: 'inter',
  },
  {
    id: 'solemne',
    nombre: 'Cinzel',
    subtitulo: 'Solemne',
    tituloFont: 'cinzel',
    cuerpoFont: 'inter',
  },
  {
    id: 'lora',
    nombre: 'Lora',
    subtitulo: 'Poética',
    tituloFont: 'lora',
    cuerpoFont: 'montserrat',
  },
  {
    id: 'moderna',
    nombre: 'Montserrat',
    subtitulo: 'Moderna',
    tituloFont: 'montserrat',
    cuerpoFont: 'inter',
  },
  {
    id: 'poppins',
    nombre: 'Poppins',
    subtitulo: 'Limpia',
    tituloFont: 'poppins',
    cuerpoFont: 'inter',
  },
  {
    id: 'festiva',
    nombre: 'Dancing Script',
    subtitulo: 'Festiva',
    tituloFont: 'dancing',
    cuerpoFont: 'montserrat',
  },
]

const FORMAS_RAPIDAS: { id: FormaTarjeta; nombre: string }[] = [
  { id: 'clasica', nombre: 'Recta' },
  { id: 'arco', nombre: 'Arco' },
  { id: 'biselada', nombre: 'Bisel' },
]

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
  const [vistaMobile, setVistaMobile] = useState<'editor' | 'preview'>('preview')
  const [vistaDispositivo, setVistaDispositivo] = useState<'movil' | 'desktop'>('movil')
  const [modoEdicionDirecta, setModoEdicionDirecta] = useState(true)
  const [panelAjustesAbierto, setPanelAjustesAbierto] = useState(false)
  const [categoriaPaleta, setCategoriaPaleta] = useState<
    'todas' | 'fiesta' | 'familiar' | 'dulce' | 'formal' | 'naturaleza'
  >('fiesta')
  const [guardando, setGuardando] = useState(false)
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [mostrarModalAgregarSeccion, setMostrarModalAgregarSeccion] = useState(false)
  const [seccionExpandidaId, setSeccionExpandidaId] = useState<string | null>(null)
  const [mostrarEstudioCanva, setMostrarEstudioCanva] = useState(false)
  const [pestanaCanvaInicial, setPestanaCanvaInicial] = useState<PestanaCanva>('elementos')
  const [mostrarModalSobre, setMostrarModalSobre] = useState(false)
  const [claveSobre, setClaveSobre] = useState(0)

  const abrirEstudioCanvaEnPestana = (pestana: PestanaCanva = 'elementos') => {
    setPestanaCanvaInicial(pestana)
    setMostrarEstudioCanva(true)
  }

  // Ref y desplazamiento suave para el carrusel de tipografías
  const fuentesCarouselRef = useRef<HTMLDivElement>(null)
  const scrollFuentesCarousel = (direccion: 'izq' | 'der') => {
    if (fuentesCarouselRef.current) {
      const desplazamiento = direccion === 'izq' ? -140 : 140
      fuentesCarouselRef.current.scrollBy({ left: desplazamiento, behavior: 'smooth' })
    }
  }

  // Control de salida del editor sin guardar
  const [mostrarModalSalirSinGuardar, setMostrarModalSalirSinGuardar] = useState(false)
  const [haGuardado, setHaGuardado] = useState(false)

  const intentarVolverAInicio = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    // Si ya guardó o no está en modo edición y tiene enlace publicado generado, permite salir directo
    if (haGuardado) {
      router.push('/')
      return
    }
    setMostrarModalSalirSinGuardar(true)
  }

  // Advertencia de navegador para evitar pérdida accidental de datos
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!haGuardado) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [haGuardado])

  // Preescucha de música en el editor
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null)
  const [reproduciendoPreview, setReproduciendoPreview] = useState(false)

  useEffect(() => {
    return () => {
      if (audioPreview) {
        audioPreview.pause()
        audioPreview.src = ''
      }
    }
  }, [audioPreview])

  const alternarPreviewAudio = (url: string) => {
    if (reproduciendoPreview && audioPreview) {
      audioPreview.pause()
      setReproduciendoPreview(false)
      return
    }

    if (audioPreview) {
      audioPreview.pause()
    }

    try {
      const nuevoAudio = new Audio(url)
      nuevoAudio.volume = 0.5
      nuevoAudio
        .play()
        .then(() => setReproduciendoPreview(true))
        .catch(() => setReproduciendoPreview(false))
      nuevoAudio.onended = () => setReproduciendoPreview(false)
      nuevoAudio.onerror = () => setReproduciendoPreview(false)
      setAudioPreview(nuevoAudio)
    } catch {
      setReproduciendoPreview(false)
    }
  }

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
      metodoConfirmacion: 'tarjeton',
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
    if (campoDatos === 'metodoConfirmacion') {
      actualizarEvento('metodoConfirmacion', valor)
    }
  }

  const cambiarMetodoConfirmacion = (metodo: MetodoConfirmacion) => {
    actualizarEvento('metodoConfirmacion', metodo)
    const secRsvp = secciones.find((s) => s.tipo === 'confirmacion_rsvp')
    if (secRsvp) {
      actualizarDatosSeccion(secRsvp.id, 'metodoConfirmacion', metodo)
    }
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

  const aplicarPaletaRapida = (paleta: PaletaRapida) => {
    setVisual((prev) => ({
      ...prev,
      colorPrimario: paleta.primario,
      colorSecundario: paleta.secundario,
      colorFondo: paleta.fondo,
      colorTarjeta: paleta.tarjeta,
      colorTexto: paleta.texto,
      efectoFondo: paleta.efecto,
    }))
  }



  const aplicarTipografiaRapida = (t: (typeof TIPOGRAFIAS_RAPIDAS)[number]) => {
    setVisual((prev) => ({
      ...prev,
      fuenteTitulo: t.tituloFont,
      fuenteCuerpo: t.cuerpoFont,
    }))
  }

  const aplicarFormaRapida = (forma: FormaTarjeta) => {
    setVisual((prev) => ({
      ...prev,
      formaTarjeta: forma,
    }))
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

      const metodoConfirmacionSeleccionado = evento.metodoConfirmacion || 'tarjeton'

      const eventoGuardado: DetalleEvento = {
        ...evento,
        metodoConfirmacion: metodoConfirmacionSeleccionado,
        slugPublico: slug,
        expiraEn: fechaExpira,
        configuracionVisual: visual,
        secciones: secciones.map((s) => {
          if (s.tipo === 'confirmacion_rsvp') {
            return {
              ...s,
              datos: {
                ...s.datos,
                metodoConfirmacion: metodoConfirmacionSeleccionado,
              },
            }
          }
          return s
        }),
        imagenPortada: cabecera?.datos?.imagenPortada || evento.imagenPortada,
        imagenRetrato: cabecera?.datos?.imagenRetrato || evento.imagenRetrato,
      }

      setHaGuardado(true)
      EventoRepositorio.guardar(eventoGuardado)
      router.push(`/gestionar/${eventoGuardado.tokenAdmin}`)
    } catch (e) {
      console.error(e)
      setGuardando(false)
    }
  }

  return (
    <div className="w-full max-w-[100vw] min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      {/* Barra Superior de Herramientas */}
      <header className="w-full bg-white border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-40 flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-2xs gap-2">
        {/* Fila 1: Regresar + Identidad Tarjetón */}
        <div className="flex items-center justify-between w-full lg:w-auto min-w-0 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botón para regresar a la Landing Page con verificación de guardado */}
            <button
              type="button"
              onClick={intentarVolverAInicio}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Regresar a la página principal"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            {/* Logotipo */}
            <button
              type="button"
              onClick={intentarVolverAInicio}
              className="flex items-center gap-2 sm:gap-2.5 group min-w-0 text-left cursor-pointer"
              title="Regresar a la página principal"
            >
              <TarjetonLogo size="sm" subtexto="studio" />
              <div className="hidden md:block">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">
                  {modoEdicion ? 'Modo Edición' : 'Creador Modular'}
                </span>
              </div>
            </button>
          </div>

          {/* Badge modo en móvil */}
          <div className="sm:hidden">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium whitespace-nowrap">
              {modoEdicion ? 'Edición' : 'Creador'}
            </span>
          </div>
        </div>

        {/* Fila 2: Acciones Principales (En móvil: Carrusel horizontal fluido con swipe; En escritorio: Barra alineada sin desbordes) */}
        <div className="w-full lg:w-auto min-w-0 pt-1.5 lg:pt-0 border-t border-slate-100 lg:border-0 overflow-x-auto lg:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth touch-pan-x shrink-0">
          <div className="flex items-center justify-start sm:justify-end gap-1.5 sm:gap-2 w-max lg:w-auto min-w-full sm:min-w-0 px-1 sm:px-0 py-0.5 sm:py-0 pr-4 lg:pr-0">
            {/* Botón Sobre 3D: Activar y personalizar estilos, colores y lacre */}
            <button
              type="button"
              onClick={() => setMostrarModalSobre(true)}
              className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 border shrink-0 whitespace-nowrap select-none ${
                visual.animacionSobre
                  ? 'bg-slate-950 hover:bg-slate-900 text-white border-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Personalizar Sobre 3D: activar, cambiar estilos, colores y sellos de lacre"
            >
              <Mail size={13} className="shrink-0 text-current" />
              <span>Sobre 3D</span>
              {visual.animacionSobre && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Botón Estudio Tarjetón (Acorde a la app y en negro institucional) */}
            <button
              type="button"
              onClick={() => abrirEstudioCanvaEnPestana('elementos')}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 border border-slate-800 shrink-0 whitespace-nowrap select-none"
              title="Abrir Estudio Tarjetón: marcos, texturas artesanales, monogramas y biblioteca de iconos"
            >
              <Sparkles size={13} className="text-amber-400 shrink-0" />
              <span className="hidden xl:inline">Estudio Tarjetón</span>
              <span className="xl:hidden text-[11px] sm:text-xs">Estudio</span>
            </button>

            {/* Botón para alternar el Panel Lateral de Ajustes */}
            <button
              type="button"
              onClick={() => {
                setPanelAjustesAbierto(!panelAjustesAbierto)
                if (!panelAjustesAbierto) setVistaMobile('editor')
              }}
              className={`px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap select-none ${
                panelAjustesAbierto
                  ? 'bg-slate-100 border-slate-900 text-slate-950 font-bold'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title={panelAjustesAbierto ? 'Ocultar panel lateral' : 'Abrir ajustes detallados'}
            >
              <Sliders size={13} className="shrink-0" />
              <span className="hidden xl:inline">{panelAjustesAbierto ? 'Ocultar Ajustes' : 'Ajustes Detallados'}</span>
              <span className="xl:hidden text-[11px] sm:text-xs">{panelAjustesAbierto ? 'Ocultar' : 'Ajustes'}</span>
            </button>

            {/* Estado de Licencia / Premium */}
            {evento.esPremium ? (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 text-white shadow-2xs shrink-0 whitespace-nowrap select-none">
                <Award size={13} className="text-amber-400 shrink-0" />
                <span className="hidden xl:inline">Licencia Activa</span>
                <span className="xl:hidden text-[11px] sm:text-xs">VIP</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setMostrarModalPago(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap select-none"
                title="Habilitar invitados ilimitados y remover publicidad"
              >
                <Award size={13} className="text-amber-700 shrink-0" />
                <span className="hidden xl:inline">Activar Premium</span>
                <span className="xl:hidden text-[11px] sm:text-xs">Premium</span>
              </button>
            )}

            {/* Botón Publicar Tarjeta */}
            <button
              onClick={handleGuardarYPublicar}
              disabled={guardando}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl flex items-center gap-1 sm:gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap select-none"
            >
              {guardando ? (
                <span className="text-[11px] sm:text-xs">Guardando...</span>
              ) : (
                <>
                  <span className="hidden xl:inline">{modoEdicion ? 'Guardar Cambios' : 'Publicar Tarjeta'}</span>
                  <span className="xl:hidden text-[11px] sm:text-xs">{modoEdicion ? 'Guardar' : 'Publicar'}</span>
                  <ArrowRight size={13} className="shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Barra de alternancia móvil/tablet (Editor vs Vista Previa) */}
      <div className="lg:hidden w-full max-w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center shrink-0 z-30 shadow-2xs">
        <div className="grid grid-cols-2 max-w-xs w-full bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setVistaMobile('preview')}
            className={`py-1.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              vistaMobile === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 size={13} />
            <span>Tarjeta (Directo)</span>
          </button>
          <button
            type="button"
            onClick={() => setVistaMobile('editor')}
            className={`py-1.5 px-3 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              vistaMobile === 'editor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={13} />
            <span>Más Ajustes</span>
          </button>
        </div>
      </div>

      {/* Espacio de Trabajo Principal (2 Columnas) */}
      <div className="flex-1 w-full max-w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Barra Lateral de Configuración Modular */}
        <div
          className={`h-[calc(100vh-112px)] lg:h-[calc(100vh-61px)] overflow-y-auto bg-white border-r border-slate-200 p-4 sm:p-6 transition-all duration-200 ${
            panelAjustesAbierto
              ? 'lg:col-span-5 xl:col-span-4 lg:block'
              : 'lg:hidden'
          } ${vistaMobile === 'editor' ? 'block' : 'hidden lg:block'}`}
        >
          {/* Encabezado del Panel Lateral */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ajustes Detallados</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPanelAjustesAbierto(false)
                setVistaMobile('preview')
              }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
              title="Ocultar panel lateral"
            >
              <X size={15} />
              <span className="text-[11px]">Ocultar</span>
            </button>
          </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Plus size={14} /> <span>Añadir Módulo</span>
                </button>
              </div>

              {/* Banner Edición Directa */}
              <div className="bg-slate-900 text-white rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-white">¡Edición directa en la tarjeta habilitada!</span>
                  <p className="text-slate-300 mt-0.5">
                    Puedes hacer clic directamente en cualquier texto, foto o botón del tarjetón (a la derecha) para editarlo en tiempo real. También puedes usar los controles de aquí abajo si lo prefieres.
                  </p>
                </div>
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
              {/* Banner Acceso Directo Estudio Tarjetón */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-sm flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-xs font-black tracking-wide uppercase">Estudio Tarjetón</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Texturas de papel, marcos ornamentales, monogramas y biblioteca de iconos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => abrirEstudioCanvaEnPestana('elementos')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold shadow-xs cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  Abrir
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Palette size={16} /> Paleta de Colores & Tonos
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Selecciona cualquier elemento y navega entre tonos claros, medios y profundos.
                </p>
              </div>

              {/* Selector Tonal Minimalista con Cuadros de Color */}
              <SelectorColorTonal
                visual={visual}
                alActualizarVisual={actualizarVisual}
              />

              {/* Tipografía */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                  Tipografía de Títulos y Anfitriones
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'greatvibes', nombre: 'Great Vibes (Caligrafía Real)', muestra: 'font-greatvibes text-xl' },
                    { id: 'alexbrush', nombre: 'Alex Brush (Romance Nupcial)', muestra: 'font-alexbrush text-lg' },
                    { id: 'parisienne', nombre: 'Parisienne (Chic Francés)', muestra: 'font-parisienne text-lg' },
                    { id: 'playfair', nombre: 'Playfair (Clásica Formal)', muestra: 'font-playfair text-sm' },
                    { id: 'cormorant', nombre: 'Cormorant (Ceremonial)', muestra: 'font-cormorant text-sm italic' },
                    { id: 'prata', nombre: 'Prata (Didone Alta Moda)', muestra: 'font-prata text-sm' },
                    { id: 'cinzel', nombre: 'Cinzel (Solemne / Monumental)', muestra: 'font-cinzel text-xs uppercase tracking-widest font-semibold' },
                    { id: 'lora', nombre: 'Lora (Cálida & Poética)', muestra: 'font-lora text-sm italic' },
                    { id: 'montserrat', nombre: 'Montserrat (Moderna)', muestra: 'font-montserrat text-xs font-bold' },
                    { id: 'poppins', nombre: 'Poppins (Geométrica Limpia)', muestra: 'font-poppins text-xs font-semibold' },
                    { id: 'dancing', nombre: 'Dancing Script (Cursiva Festiva)', muestra: 'font-dancing text-base' },
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

              {/* Silueta y Corte de la Tarjeta */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Silueta y Corte de la Tarjeta
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Estilo arquitectónico y contorno del tarjetón principal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'clasica',
                      nombre: 'Clásica',
                      desc: 'Rectangular con bordes finos',
                      previewClase: 'rounded-xl',
                    },
                    {
                      id: 'arco',
                      nombre: 'Arco Ceremonial',
                      desc: 'Cúpula editorial curvada superior',
                      previewClase: 'rounded-t-2xl rounded-b-md',
                    },
                    {
                      id: 'doble_borde',
                      nombre: 'Doble Borde',
                      desc: 'Filete perimetral dorado de lujo',
                      previewClase: 'rounded-xl border-2 border-amber-400/50 ring-1 ring-amber-400/20',
                    },
                    {
                      id: 'biselada',
                      nombre: 'Biselada',
                      desc: 'Esquinas curvas extra suaves',
                      previewClase: 'rounded-2xl',
                    },
                  ].map((forma) => {
                    const seleccionada = (visual.formaTarjeta || 'clasica') === forma.id
                    return (
                      <button
                        key={forma.id}
                        type="button"
                        onClick={() => actualizarVisual('formaTarjeta', forma.id as FormaTarjeta)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          seleccionada
                            ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-9 h-11 border border-slate-400/60 bg-white shadow-2xs flex items-center justify-center ${forma.previewClase}`}
                          >
                            <div className="w-5 h-6 bg-slate-100/80 rounded-xs" />
                          </div>
                          {seleccionada && <Check size={14} className="text-slate-900" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{forma.nombre}</span>
                          <span className="text-[10px] text-slate-500 leading-tight block">{forma.desc}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ══════════ SOBRE PROTOCOLARIO INTERACTIVO DE APERTURA ══════════ */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-800" />
                      <span>Sobre Protocolario de Apertura</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Animación 3D de sobre con sello de cera al abrir la tarjeta.
                    </p>
                  </div>

                  {/* Switch Activar / Desactivar */}
                  <button
                    type="button"
                    onClick={() => actualizarVisual('animacionSobre', !visual.animacionSobre)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      visual.animacionSobre ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        visual.animacionSobre ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {visual.animacionSobre && (
                  <div className="space-y-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                    {/* Selector de Color del Sobre */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                        Tono del Sobre
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: '', nombre: 'A juego', color: visual.colorPrimario },
                          { id: '#0F172A', nombre: 'Azul Noche', color: '#0F172A' },
                          { id: '#4C0519', nombre: 'Borgoña', color: '#4C0519' },
                          { id: '#064E3B', nombre: 'Esmeralda', color: '#064E3B' },
                          { id: '#0B0F17', nombre: 'Negro Ónix', color: '#0B0F17' },
                          { id: '#F5F3EF', nombre: 'Marfil Real', color: '#F5F3EF' },
                        ].map((s) => {
                          const activo = (visual.colorSobre || '') === s.id
                          return (
                            <button
                              key={s.nombre}
                              type="button"
                              onClick={() => actualizarVisual('colorSobre', s.id || undefined)}
                              className={`py-1.5 px-2 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[11px] ${
                                activo
                                  ? 'border-slate-900 bg-white shadow-xs font-bold text-slate-900'
                                  : 'border-slate-200 bg-white/70 hover:bg-white text-slate-600'
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                style={{ backgroundColor: s.color }}
                              />
                              <span className="truncate">{s.nombre}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Monograma / Iniciales del Sello */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                        Monograma del Sello de Cera
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={visual.textoMonograma || ''}
                        onChange={(e) => actualizarVisual('textoMonograma', e.target.value.toUpperCase())}
                        placeholder="Ej: S&C, T, XV"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-serif uppercase tracking-widest text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    {/* Botón para abrir el Personalizador Completo de Sobre */}
                    <button
                      type="button"
                      onClick={() => setMostrarModalSobre(true)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Sliders size={13} className="text-white" />
                      <span>Personalizar Estilos, Formas & Lacres</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Música de Fondo Protocolaria */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Music size={14} className="text-slate-700" />
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Música de Fondo Protocolaria
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Acompaña la apertura de la invitación con melodía ceremonial.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(visual.musicaFondo?.activa)}
                      onChange={(e) => {
                        const activa = e.target.checked
                        const musicaActual = visual.musicaFondo || {
                          activa: false,
                          url: PRESETS_MUSICA[0].url,
                          titulo: PRESETS_MUSICA[0].nombre,
                          autoReproducir: true,
                        }
                        actualizarVisual('musicaFondo', {
                          ...musicaActual,
                          activa,
                          url: musicaActual.url || PRESETS_MUSICA[0].url,
                          titulo: musicaActual.titulo || PRESETS_MUSICA[0].nombre,
                        })
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                  </label>
                </div>

                {visual.musicaFondo?.activa && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        Pistas Melódicas Recomendadas (Libres de Regalías)
                      </label>
                      <div className="space-y-1.5">
                        {PRESETS_MUSICA.map((p) => {
                          const esSeleccionado = visual.musicaFondo?.url === p.url
                          const estaReproduciendoEste = reproduciendoPreview && audioPreview?.src === p.url
                          return (
                            <div
                              key={p.id}
                              className={`p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all ${
                                esSeleccionado
                                  ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-2xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() =>
                                  actualizarVisual('musicaFondo', {
                                    ...visual.musicaFondo,
                                    url: p.url,
                                    titulo: p.nombre,
                                  })
                                }
                              >
                                <p className="text-xs font-bold text-slate-800 truncate">{p.nombre}</p>
                                <p className="text-[10px] text-slate-500 truncate">{p.subtitulo}</p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => alternarPreviewAudio(p.url)}
                                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                                  title={estaReproduciendoEste ? 'Pausar prueba' : 'Escuchar muestra'}
                                >
                                  {estaReproduciendoEste ? (
                                    <Pause size={13} className="text-amber-600" />
                                  ) : (
                                    <Play size={13} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    actualizarVisual('musicaFondo', {
                                      ...visual.musicaFondo,
                                      url: p.url,
                                      titulo: p.nombre,
                                    })
                                  }
                                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    esSeleccionado
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {esSeleccionado ? 'Elegida' : 'Usar'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Enlace o URL personalizada */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        O ingresar enlace MP3 personalizado
                      </label>
                      <div className="space-y-1.5">
                        <input
                          type="url"
                          value={visual.musicaFondo?.url || ''}
                          onChange={(e) =>
                            actualizarVisual('musicaFondo', {
                              ...visual.musicaFondo,
                              url: e.target.value,
                            })
                          }
                          placeholder="https://ejemplo.com/tu-cancion.mp3"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
                        />

                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={visual.musicaFondo?.titulo || ''}
                            onChange={(e) =>
                              actualizarVisual('musicaFondo', {
                                ...visual.musicaFondo,
                                titulo: e.target.value,
                              })
                            }
                            placeholder="Título de la melodía (ej: Nuestra Canción)"
                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-slate-900 outline-none"
                          />

                          {visual.musicaFondo?.url && (
                            <button
                              type="button"
                              onClick={() => alternarPreviewAudio(visual.musicaFondo!.url)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {reproduciendoPreview && audioPreview?.src === visual.musicaFondo?.url ? (
                                <>
                                  <Pause size={12} className="text-amber-600" /> <span>Pausar</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} /> <span>Probar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

                {/* Método de Confirmación de Asistencia (RSVP) */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-600" />
                      <span>¿Cómo deseas que tus invitados confirmen asistencia?</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selecciona la vía principal para registrar cupos, confirmar asistentes y controlar el aforo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'tarjeton' as MetodoConfirmacion,
                        titulo: 'Botón Digital Tarjetón',
                        desc: 'Registro en web, control de aforo en vivo y exportación a PDF/Excel',
                        badge: 'Recomendado',
                      },
                      {
                        id: 'whatsapp' as MetodoConfirmacion,
                        titulo: 'Mensaje de WhatsApp',
                        desc: 'Abre chat directo con mensaje predefinido en tu WhatsApp',
                        badge: null,
                      },
                      {
                        id: 'ambos' as MetodoConfirmacion,
                        titulo: 'Ambos Métodos',
                        desc: 'Formulario digital web + botón opcional de WhatsApp',
                        badge: 'Híbrido',
                      },
                    ].map((metodo) => {
                      const seleccionado =
                        (evento.metodoConfirmacion || 'tarjeton') === metodo.id
                      return (
                        <button
                          key={metodo.id}
                          type="button"
                          onClick={() => cambiarMetodoConfirmacion(metodo.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                            seleccionado
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          {metodo.badge && (
                            <span
                              className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded absolute right-2 top-2 ${
                                seleccionado
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {metodo.badge}
                            </span>
                          )}
                          <span className="text-xs font-bold block pr-8">{metodo.titulo}</span>
                          <p
                            className={`text-[10px] mt-1 leading-snug ${
                              seleccionado ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {metodo.desc}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {(evento.metodoConfirmacion === 'tarjeton' || !evento.metodoConfirmacion) && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-emerald-950">
                      <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong>Modo Digital Tarjetón Activado:</strong> Tus invitados confirmarán directamente en la tarjeta interactiva. Las confirmaciones se registrarán automáticamente en tu panel de administración, donde podrás consultar métricas de aforo en vivo y descargar la <strong>Lista de Admisión en PDF</strong> o el archivo <strong>Excel</strong>.
                      </div>
                    </div>
                  )}

                  {/* Campos de WhatsApp (obligatorios si es whatsapp o ambos, opcionales si es tarjeton) */}
                  {(evento.metodoConfirmacion === 'whatsapp' || evento.metodoConfirmacion === 'ambos') && (
                    <div className="space-y-3 pt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
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
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ PESTAÑA 5: PLANTILLAS PREDETERMINADAS ═══════════════ */}
          {pestanaActiva === 'plantillas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} /> Colección de Estilos para Todo Evento
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cumpleaños, fiestas temáticas, asados y reuniones familiares, baby showers, bodas y galas.
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

        {/* ════════════════ VISTA PREVIA Y CANVAS INTERACTIVO ════════════════ */}
        <div
          className={`${
            panelAjustesAbierto ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'
          } h-[calc(100vh-112px)] lg:h-[calc(100vh-61px)] overflow-y-auto bg-slate-200/70 p-2.5 sm:p-6 flex flex-col items-center justify-start transition-all duration-300 ${
            vistaMobile === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* BARRA RÁPIDA DE 1 CLIC */}
          <div className="w-full max-w-2xl mb-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-sm p-2.5 flex flex-col gap-2.5 z-20">
            {/* FILA 1: Carrusel de Fuentes del ancho completo del contenedor */}
            <div className="w-full flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Fuente:
              </span>
              <div className="flex-1 w-full min-w-0 flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 shadow-2xs">
                {/* Botón retroceder carrusel */}
                <button
                  type="button"
                  onClick={() => scrollFuentesCarousel('izq')}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Ver fuentes anteriores"
                  aria-label="Fuente anterior"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Lista scrolleable horizontal suave a todo el ancho */}
                <div
                  ref={fuentesCarouselRef}
                  className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-1.5 py-0.5 w-full"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {TIPOGRAFIAS_RAPIDAS.map((t) => {
                    const estaActiva = visual.fuenteTitulo === t.tituloFont
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => aplicarTipografiaRapida(t)}
                        className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all cursor-pointer shrink-0 ${
                          estaActiva
                            ? 'bg-slate-900 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        }`}
                        title={`${t.nombre} (${t.subtitulo})`}
                      >
                        {t.subtitulo}
                      </button>
                    )
                  })}
                </div>

                {/* Botón avanzar carrusel */}
                <button
                  type="button"
                  onClick={() => scrollFuentesCarousel('der')}
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Ver fuentes siguientes"
                  aria-label="Fuente siguiente"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* FILA 2: Marcos & Bordes identado a la izquierda | Preview y Diseño a la derecha */}
            <div className="w-full flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap sm:flex-nowrap">
              {/* Izquierda: Marcos y Bordes identado a la izquierda, Texturas, Colores y Forma */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Marcos y Bordes */}
                <button
                  type="button"
                  onClick={() => abrirEstudioCanvaEnPestana('elementos')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Bordes perimetrales y marcos decorativos de la tarjeta"
                >
                  <Square size={13} className="text-slate-700" />
                  <span>Marcos & Bordes</span>
                </button>

                {/* Texturas de Papel */}
                <button
                  type="button"
                  onClick={() => abrirEstudioCanvaEnPestana('fondos')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Texturas de papel de algodón, mármol oro, acuarela, lino rústico"
                >
                  <Sparkles size={13} className="text-slate-600" />
                  <span>Texturas</span>
                </button>

                {/* Sobre Protocolario Interactivo */}
                <button
                  type="button"
                  onClick={() => setMostrarModalSobre(true)}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    visual.animacionSobre
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                  title="Personalizar Sobre 3D: activar, cambiar estilos, colores y sellos de lacre"
                >
                  <Mail size={13} className={visual.animacionSobre ? 'text-white' : 'text-slate-700'} />
                  <span>Sobre {visual.animacionSobre ? '✓' : ''}</span>
                </button>

                {/* Control Rápido de Color & Tonos */}
                <button
                  type="button"
                  onClick={() => {
                    setPestanaActiva('diseno')
                    setPanelAjustesAbierto(true)
                  }}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                  title="Editar paleta de colores y escala de tonos"
                >
                  <div className="flex items-center -space-x-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: visual.colorTarjeta }}
                      title={`Tarjeta: ${visual.colorTarjeta}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: visual.colorPrimario }}
                      title={`Botón: ${visual.colorPrimario}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: visual.colorSecundario }}
                      title={`Detalles: ${visual.colorSecundario}`}
                    />
                  </div>
                  <span className="font-bold text-[11px] text-slate-700 group-hover:text-slate-900">
                    Colores
                  </span>
                </button>

                {/* Forma de Tarjeta en 1 clic */}
                <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px]">
                  {FORMAS_RAPIDAS.map((f) => {
                    const estaActiva = visual.formaTarjeta === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => aplicarFormaRapida(f.id)}
                        className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                          estaActiva ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {f.nombre}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Derecha: Botón de Preview y de Diseño (+ Bloque, Dispositivo) */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarModalAgregarSeccion(true)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Añadir nueva sección a la tarjeta"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">+ Bloque</span>
                </button>

                <div className="hidden sm:block h-4 w-px bg-slate-200" />

                {/* Conmutador de Diseñando y Preview de Invitado (a la derecha) */}
                <div
                  className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs"
                  role="group"
                  aria-label="Modo de trabajo"
                >
                  <button
                    type="button"
                    onClick={() => setModoEdicionDirecta(true)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modoEdicionDirecta
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Modo Diseñador: Haz clic en textos, fotos y botones de la tarjeta para editarlos"
                  >
                    <Edit3 size={12} />
                    <span>Diseñando</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEdicionDirecta(false)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      !modoEdicionDirecta
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title="Previsualización de Invitado: Mira exactamente la experiencia real que tendrá el invitado"
                  >
                    <Eye size={12} />
                    <span>Vista Invitado</span>
                  </button>
                </div>

                {/* Conmutador de vista Móvil / Escritorio */}
                <button
                  type="button"
                  onClick={() => setVistaDispositivo(vistaDispositivo === 'movil' ? 'desktop' : 'movil')}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer shadow-2xs transition-all"
                  title={vistaDispositivo === 'movil' ? 'Cambiar a Vista de Escritorio' : 'Cambiar a Vista Móvil'}
                >
                  {vistaDispositivo === 'movil' ? <Monitor size={14} /> : <Smartphone size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Banner indicador interactivo de Modo */}
          <div
            className={`w-full max-w-2xl mb-3 flex items-center justify-between gap-2 px-4 py-2 rounded-2xl text-xs font-medium transition-all shadow-xs backdrop-blur-xs border ${
              modoEdicionDirecta
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-950 text-white border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {modoEdicionDirecta ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">
                      Modo Diseñador (Edición en Vivo)
                    </p>
                    <p className="text-[11px] text-slate-300 hidden sm:block truncate">
                      Haz clic en cualquier texto, foto o bloque para editar tu tarjeta.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">
                      Previsualización de Invitado
                    </p>
                    <p className="text-[11px] text-emerald-200 hidden sm:block truncate">
                      Así es exactamente como tus invitados verán la tarjeta y responderán su asistencia.
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModoEdicionDirecta(!modoEdicionDirecta)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                modoEdicionDirecta
                  ? 'bg-white text-slate-950 hover:bg-amber-50 shadow-xs'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50 shadow-xs'
              }`}
            >
              {modoEdicionDirecta ? (
                <>
                  <Eye size={13} />
                  <span>Ver como invitado</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Volver a diseñar</span>
                </>
              )}
            </button>
          </div>

          {/* Marco de Dispositivo Móvil */}
          <div
            id="tarjeton-preview-canvas"
            className={`w-full flex justify-center ${
              vistaDispositivo === 'movil' ? 'max-w-[440px]' : 'max-w-2xl'
            }`}
            style={{
              ['--color-tarjeta-live' as any]: visual.colorTarjeta || '#FFFFFF',
              ['--color-fondo-live' as any]: visual.colorFondo || '#F8FAFC',
              ['--color-primario-live' as any]: visual.colorPrimario || '#0F172A',
              ['--color-secundario-live' as any]: visual.colorSecundario || '#D4AF37',
              ['--color-texto-live' as any]: visual.colorTexto || '#0F172A',
            }}
          >
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-white">
              <ErrorBoundary fallbackTitle="Detalle visual al renderizar la tarjeta en vivo">
                <SobreAperturaAnimado
                  key={`sobre-${claveSobre}-${modoEdicionDirecta ? 'edit' : 'preview'}`}
                  evento={{ ...evento, secciones }}
                  visual={visual}
                  invitado={{
                    id: 'preview-invitado',
                    eventoId: evento.id,
                    nombre: 'Familia Ramírez Gómez',
                    pases: 2,
                    esPlural: true,
                    codigoAcceso: 'preview',
                    confirmado: false,
                    estadoConfirmacion: 'pendiente',
                  }}
                  esModoEdicionDirecta={modoEdicionDirecta}
                  claveReinicio={claveSobre}
                >
                  <DynamicInvitationCard
                    evento={{ ...evento, secciones }}
                    visual={visual}
                    esModoVistaPrevia={!modoEdicionDirecta}
                    esModoEdicionDirecta={modoEdicionDirecta}
                    alActualizarSeccion={(secId, campo, val) => actualizarCampoSeccion(secId, campo, val)}
                    alActualizarDatosSeccion={(secId, campoDatos, val) =>
                      actualizarDatosSeccion(secId, campoDatos, val)
                    }
                    alActualizarEvento={(campo, val) => actualizarEvento(campo, val)}
                    alMoverSeccion={(idx, dir) => moverSeccion(idx, dir)}
                    alEliminarSeccion={(secId) => eliminarSeccion(secId)}
                    alInsertarSeccionEnIndice={(idx, tipo) => {
                      const nueva = crearSeccionPorTipo(tipo, idx)
                      const copia = [...secciones]
                      copia.splice(idx, 0, nueva)
                      const reordenadas = copia.map((s, i) => ({ ...s, orden: i }))
                      setSecciones(reordenadas)
                    }}
                  />
                </SobreAperturaAnimado>
              </ErrorBoundary>
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

      {/* Estudio Creativo estilo Canva (Drawer Deslizante) */}
      <CanvaStudioDrawer
        abierto={mostrarEstudioCanva}
        alCerrar={() => setMostrarEstudioCanva(false)}
        visual={visual}
        alActualizarVisual={actualizarVisual}
        evento={evento}
        alActualizarEvento={actualizarEvento}
        alAplicarPlantilla={aplicarPlantilla}
        alAgregarSeccion={agregarNuevaSeccion}
        pestanaInicial={pestanaCanvaInicial}
        onAbrirPersonalizadorSobre={() => {
          setMostrarEstudioCanva(false)
          setMostrarModalSobre(true)
        }}
      />

      {/* Modal Personalizador de Sobre Protocolario 3D */}
      <ModalPersonalizadorSobre
        abierto={mostrarModalSobre}
        onCerrar={() => setMostrarModalSobre(false)}
        visual={visual}
        onChangeVisual={(cambios) => setVisual((prev) => ({ ...prev, ...cambios }))}
        onProbarApertura={(cambiosFinales) => {
          setVisual((prev) => ({
            ...prev,
            ...cambiosFinales,
            animacionSobre: true,
          }))
          setModoEdicionDirecta(false)
          setVistaMobile('preview')
          setClaveSobre((prev) => prev + 1)
          setTimeout(() => {
            document.getElementById('tarjeton-preview-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }, 120)
        }}
      />

      {/* ════════════ MODAL ALERTA: SALIR SIN GUARDAR CAMBIOS ════════════ */}
      {mostrarModalSalirSinGuardar && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ¿Deseas salir a la página principal?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Aún no has guardado los cambios ni se ha generado el enlace público de tu tarjeta. Si sales ahora, perderás todo el progreso realizado en tu diseño.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setMostrarModalSalirSinGuardar(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
              >
                Continuar editando
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarModalSalirSinGuardar(false)
                  handleGuardarYPublicar()
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Guardar y Publicar ahora</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarModalSalirSinGuardar(false)
                  router.push('/')
                }}
                className="w-full py-2 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                Salir sin guardar (perder progreso)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
