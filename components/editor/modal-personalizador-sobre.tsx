'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ConfiguracionVisual,
  EstiloSobreTipo,
  ColorLacreTipo,
  ForroSobreTipo,
} from '@/types/invitation'
import {
  obtenerGeometriaSobre,
  obtenerGradienteLacre,
  ForroInteriorDecorativo,
  esColorClaro,
} from '@/components/invitation/sobre-apertura-animado'
import {
  Mail,
  X,
  Check,
  Eye,
  Sliders,
  Layers,
  Palette,
  Type,
} from 'lucide-react'

interface ModalPersonalizadorSobreProps {
  abierto: boolean
  onCerrar: () => void
  visual: ConfiguracionVisual
  onChangeVisual: (nuevoVisual: Partial<ConfiguracionVisual>) => void
  onProbarApertura?: (nuevoVisual?: Partial<ConfiguracionVisual>) => void
}

const ESTILOS_SOBRE: {
  id: EstiloSobreTipo
  nombre: string
  subtitulo: string
  descripcion: string
  icono: string
}[] = [
  {
    id: 'clasico',
    nombre: 'Protocolar Clásico',
    subtitulo: 'Barón en V tradicional',
    descripcion: 'Solapa triangular clásica con ribetes de oro fino y sello de cera tradicional.',
    icono: '✉️',
  },
  {
    id: 'moderno',
    nombre: 'Minimalista Chic',
    subtitulo: 'Solapa recta contemporánea',
    descripcion: 'Geometría horizontal limpia, estética editorial contemporánea y sello moderno.',
    icono: '📐',
  },
  {
    id: 'vintage',
    nombre: 'Romántico Vintage',
    subtitulo: 'Silueta ojival nupcial',
    descripcion: 'Curvas suaves ornamentales, filigranas doradas y forro arabesco de época.',
    icono: '🕊️',
  },
  {
    id: 'gala',
    nombre: 'Gala Golden Black',
    subtitulo: 'Black Tie con fajilla',
    descripcion: 'Bisel dorado reflectante de alto contraste, doble marco y fajilla protocolaria.',
    icono: '👑',
  },
  {
    id: 'artesanal',
    nombre: 'Papel Artesanal Kraft',
    subtitulo: 'Textura rústica natural',
    descripcion: 'Acabado cálido de papel hecho a mano con fibra de algodón y lacre rústico.',
    icono: '🌿',
  },
  {
    id: 'diamante',
    nombre: 'Origami Diamante',
    subtitulo: 'Geometría facetada',
    descripcion: 'Pliegues en corte de diamante con aristas de oro y sello facetado.',
    icono: '💎',
  },
]

const PALETA_COLORES_SOBRE = [
  { nombre: 'Marfil Real', hex: '#F8F5EE', textoOscuro: true },
  { nombre: 'Borgoña Imperial', hex: '#4A0E17', textoOscuro: false },
  { nombre: 'Azul Marino Noche', hex: '#0B192C', textoOscuro: false },
  { nombre: 'Verde Esmeralda', hex: '#0B2F24', textoOscuro: false },
  { nombre: 'Terracota / Kraft', hex: '#8B5A2B', textoOscuro: false },
  { nombre: 'Negro Carbón Gala', hex: '#121214', textoOscuro: false },
  { nombre: 'Rosa Palo Nude', hex: '#E8D5CE', textoOscuro: true },
  { nombre: 'Gris Titanio', hex: '#2C3338', textoOscuro: false },
]

const COLORES_LACRE: {
  id: ColorLacreTipo
  nombre: string
  colorMuestra: string
}[] = [
  { id: 'oro', nombre: 'Oro 24k', colorMuestra: '#D4AF37' },
  { id: 'rojo_rubi', nombre: 'Rojo Rubí Imperial', colorMuestra: '#DC2626' },
  { id: 'azul_noche', nombre: 'Azul Zafiro Real', colorMuestra: '#1D4ED8' },
  { id: 'verde_esmeralda', nombre: 'Verde Bosque', colorMuestra: '#059669' },
  { id: 'negro_onix', nombre: 'Negro Ónix Gala', colorMuestra: '#0F172A' },
  { id: 'bronce', nombre: 'Bronce Envejecido', colorMuestra: '#B45309' },
  { id: 'rosa_oro', nombre: 'Oro Rosa Perlado', colorMuestra: '#FB7185' },
]

const FORROS_SOBRE: {
  id: ForroSobreTipo
  nombre: string
  descripcion: string
}[] = [
  { id: 'satinado', nombre: 'Satinado Degradé', descripcion: 'Transición suave de alta costura' },
  { id: 'arabesco', nombre: 'Arabesco Barroco', descripcion: 'Filigranas y ornamentos clásicos' },
  { id: 'geometrico', nombre: 'Art Déco Geométrico', descripcion: 'Líneas estructuradas modernas' },
  { id: 'floral', nombre: 'Botánico / Olivo', descripcion: 'Follaje natural tenue' },
  { id: 'liso', nombre: 'Liso Minimalista', descripcion: 'Fondo puro monocromático' },
]

export const ModalPersonalizadorSobre = React.memo(function ModalPersonalizadorSobre({
  abierto,
  onCerrar,
  visual,
  onChangeVisual,
  onProbarApertura,
}: ModalPersonalizadorSobreProps) {
  // Estado local desacoplado para respuesta INMEDIATA (0ms de latencia, 60 FPS)
  const [previewAbierto, setPreviewAbierto] = useState(false)
  const [pestanaMobile, setPestanaMobile] = useState<'edicion' | 'preview'>('edicion')

  const [localTieneSobre, setLocalTieneSobre] = useState<boolean>(Boolean(visual.animacionSobre))
  const [localEstilo, setLocalEstilo] = useState<EstiloSobreTipo>(visual.estiloSobre || 'clasico')
  const [localColor, setLocalColor] = useState<string>(visual.colorSobre || visual.colorPrimario || '#0B192C')
  const [localLacre, setLocalLacre] = useState<ColorLacreTipo>(visual.colorLacre || 'oro')
  const [localForro, setLocalForro] = useState<ForroSobreTipo>(visual.forroSobre || 'satinado')
  const [localMonograma, setLocalMonograma] = useState<string>(visual.textoMonograma || 'T')
  const [localTextoImpreso, setLocalTextoImpreso] = useState<string>(
    visual.textoImpresoSobre ?? 'Pase de Honor Protocolario'
  )

  // Solo sincronizar estado local al ABRIR el modal, NUNCA durante la edición para evitar ciclos
  const abiertoPrevioRef = useRef(false)
  useEffect(() => {
    if (abierto && !abiertoPrevioRef.current) {
      setPestanaMobile('edicion')
      setLocalTieneSobre(Boolean(visual.animacionSobre))
      setLocalEstilo(visual.estiloSobre || 'clasico')
      setLocalColor(visual.colorSobre || visual.colorPrimario || '#0B192C')
      setLocalLacre(visual.colorLacre || 'oro')
      setLocalForro(visual.forroSobre || 'satinado')
      setLocalMonograma(visual.textoMonograma || 'T')
      setLocalTextoImpreso(visual.textoImpresoSobre ?? 'Pase de Honor Protocolario')
      setPreviewAbierto(false)
    }
    abiertoPrevioRef.current = abierto
  }, [abierto, visual])

  // Referencia viva con los últimos valores locales para sincronización limpia y segura
  const valoresRef = useRef({
    animacionSobre: localTieneSobre,
    estiloSobre: localEstilo,
    colorSobre: localColor,
    colorLacre: localLacre,
    forroSobre: localForro,
    textoMonograma: localMonograma,
    textoImpresoSobre: localTextoImpreso,
  })

  // Mantener valoresRef actualizado en cada cambio local
  useEffect(() => {
    valoresRef.current = {
      animacionSobre: localTieneSobre,
      estiloSobre: localEstilo,
      colorSobre: localColor,
      colorLacre: localLacre,
      forroSobre: localForro,
      textoMonograma: localMonograma,
      textoImpresoSobre: localTextoImpreso,
    }
  }, [localTieneSobre, localEstilo, localColor, localLacre, localForro, localMonograma, localTextoImpreso])

  // Temporizador para sincronizar hacia el padre con debounce (200ms) sin bloquear la interfaz
  const timerDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const programarSincronizacion = useCallback((cambiosParciales: Partial<ConfiguracionVisual>) => {
    const nuevosValores = { ...valoresRef.current, ...cambiosParciales }
    valoresRef.current = nuevosValores

    if (timerDebounceRef.current) {
      clearTimeout(timerDebounceRef.current)
    }
    // 200ms de debounce para permitir interacciones fluidas a 60fps sin saturar la página padre
    timerDebounceRef.current = setTimeout(() => {
      onChangeVisual(nuevosValores)
    }, 200)
  }, [onChangeVisual])

  // Sincronización inmediata al cerrar el modal o al probar en pantalla completa
  const sincronizarInmediato = useCallback(() => {
    if (timerDebounceRef.current) {
      clearTimeout(timerDebounceRef.current)
      timerDebounceRef.current = null
    }
    onChangeVisual(valoresRef.current)
  }, [onChangeVisual])

  const colorSobreInputRef = useRef<HTMLInputElement>(null)
  const previewSobreRef = useRef<HTMLDivElement>(null)
  const hexInputRef = useRef<HTMLInputElement>(null)
  const ultimoColorSobreRef = useRef<string>(localColor)
  const idleSobreTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rafSobreRef = useRef<number | null>(null)
  const colorSobreEnEsperaRef = useRef<string | null>(null)

  // Mantener los inputs nativos sincronizados cuando cambia el color
  useEffect(() => {
    ultimoColorSobreRef.current = localColor
    if (colorSobreInputRef.current && colorSobreInputRef.current.value !== localColor) {
      colorSobreInputRef.current.value = localColor
    }
    if (hexInputRef.current && hexInputRef.current.value !== localColor) {
      hexInputRef.current.value = localColor
    }
  }, [localColor])

  const aplicarColorEnVivoDirecto = useCallback(
    (nuevoColor: string, inmediato = false) => {
      ultimoColorSobreRef.current = nuevoColor

      // 1. Si es inmediato (evento nativo 'change' al soltar el mouse, clic en paleta de muestras o blur):
      if (inmediato) {
        if (rafSobreRef.current !== null) {
          cancelAnimationFrame(rafSobreRef.current)
          rafSobreRef.current = null
        }

        // Mutación directa e instantánea en el DOM del sobre
        if (previewSobreRef.current) {
          previewSobreRef.current.style.setProperty('--color-sobre-live', nuevoColor)
        }
        if (hexInputRef.current && hexInputRef.current.value !== nuevoColor) {
          hexInputRef.current.value = nuevoColor
        }
        if (colorSobreInputRef.current && colorSobreInputRef.current.value !== nuevoColor) {
          colorSobreInputRef.current.value = nuevoColor
        }

        setLocalColor(nuevoColor)
        programarSincronizacion({ colorSobre: nuevoColor })
        return
      }

      // 2. Durante el arrastre continuo en vivo (evento nativo 'input'):
      // ¡0ms de bloqueo! Cero renders de React mientras se mueve el mouse.
      // Sincronizamos la pintura GPU a 60/144 FPS por requestAnimationFrame.
      // El cursor y el selector del diálogo nativo se mueven a 1000 Hz pegados a la mano del usuario.
      colorSobreEnEsperaRef.current = nuevoColor

      if (rafSobreRef.current === null) {
        rafSobreRef.current = requestAnimationFrame(() => {
          rafSobreRef.current = null
          const colorAProcesar = colorSobreEnEsperaRef.current
          if (!colorAProcesar) return

          if (previewSobreRef.current) {
            previewSobreRef.current.style.setProperty('--color-sobre-live', colorAProcesar)
          }
          if (hexInputRef.current && hexInputRef.current.value !== colorAProcesar) {
            hexInputRef.current.value = colorAProcesar
          }
        })
      }
    },
    [programarSincronizacion]
  )

  // Listeners NATIVOS directos sobre el input de color del sobre con e.stopPropagation()
  // Bypassea completamente el sistema de eventos de React (react-dom-client).
  useEffect(() => {
    const el = colorSobreInputRef.current
    if (!el) return

    const handleNativeInput = (e: Event) => {
      e.stopPropagation()
      const val = (e.target as HTMLInputElement).value
      aplicarColorEnVivoDirecto(val, false)
    }

    const handleNativeChange = (e: Event) => {
      e.stopPropagation()
      const val = (e.target as HTMLInputElement).value
      aplicarColorEnVivoDirecto(val, true)
    }

    el.addEventListener('input', handleNativeInput)
    el.addEventListener('change', handleNativeChange)

    return () => {
      el.removeEventListener('input', handleNativeInput)
      el.removeEventListener('change', handleNativeChange)
    }
  }, [aplicarColorEnVivoDirecto])

  // Limpiar temporizadores y frames pendientes al desmontar
  useEffect(() => {
    return () => {
      if (rafSobreRef.current !== null) {
        cancelAnimationFrame(rafSobreRef.current)
      }
      if (timerDebounceRef.current) {
        clearTimeout(timerDebounceRef.current)
      }
    }
  }, [])

  // Geometría y lacre calculados en caliente desde el estado local instantáneo (0ms)
  const geometria = useMemo(() => obtenerGeometriaSobre(localEstilo), [localEstilo])
  const estiloLacre = useMemo(() => obtenerGradienteLacre(localLacre), [localLacre])

  // Acciones 100% inmediatas en el visor y componentes locales (0ms)
  const handleToggleSobre = () => {
    const nuevoEstado = !localTieneSobre
    setLocalTieneSobre(nuevoEstado)
    programarSincronizacion({ animacionSobre: nuevoEstado })
  }

  const handleCambiarEstilo = (nuevoEstilo: EstiloSobreTipo) => {
    setLocalEstilo(nuevoEstilo)
    programarSincronizacion({ estiloSobre: nuevoEstilo })
  }

  const handleCambiarColor = (nuevoColor: string) => {
    aplicarColorEnVivoDirecto(nuevoColor, true)
  }

  // Mantener el input de texto hex sincronizado cuando cambia el color
  useEffect(() => {
    if (hexInputRef.current) {
      hexInputRef.current.value = localColor
    }
  }, [localColor])

  const handleCambiarLacre = (nuevoLacre: ColorLacreTipo) => {
    setLocalLacre(nuevoLacre)
    programarSincronizacion({ colorLacre: nuevoLacre })
  }

  const handleCambiarForro = (nuevoForro: ForroSobreTipo) => {
    setLocalForro(nuevoForro)
    programarSincronizacion({ forroSobre: nuevoForro })
  }

  const handleCambiarMonograma = (valor: string) => {
    const limpio = valor.toUpperCase().slice(0, 4)
    setLocalMonograma(limpio)
    programarSincronizacion({ textoMonograma: limpio })
  }

  const handleCambiarTextoImpreso = (nuevoTexto: string) => {
    setLocalTextoImpreso(nuevoTexto)
    programarSincronizacion({ textoImpresoSobre: nuevoTexto })
  }

  const handleCerrar = () => {
    sincronizarInmediato()
    onCerrar()
  }

  const handleProbarApertura = () => {
    sincronizarInmediato()
    onProbarApertura?.({ ...valoresRef.current, animacionSobre: true })
    onCerrar()
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[94vh] sm:h-auto sm:max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Cabecera del Modal (Negro institucional & Blanco) */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center shadow-xs">
              <Mail size={17} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Sobre Protocolario 3D
                </h2>
                <span className="text-[10px] bg-white/15 text-slate-200 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20 hidden xs:inline-block">
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Ajustes de papelería, cortes, colores y sellos de cera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar personalizador"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de pestañas exclusiva para móvil (Opciones de Diseño vs Visor 3D) */}
        <div className="lg:hidden flex p-1.5 bg-slate-900 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setPestanaMobile('edicion')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
              pestanaMobile === 'edicion'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Opciones de Diseño</span>
          </button>
          <button
            type="button"
            onClick={() => setPestanaMobile('preview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
              pestanaMobile === 'preview'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Eye size={13} />
            <span>Ver Sobre 3D</span>
            {localTieneSobre && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />}
          </button>
        </div>

        {/* Cuerpo Principal: 2 Columnas (Visor Inmediato a la Izquierda | Controles a la Derecha) */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          
          {/* ═══════════════ COLUMNA 1: VISOR INTERACTIVO EN TIEMPO REAL ═══════════════ */}
          <div
            className={`${
              pestanaMobile === 'preview' ? 'flex' : 'hidden'
            } lg:flex w-full lg:w-[44%] p-4 sm:p-5 bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 flex-col justify-between shrink-0 overflow-y-auto`}
          >
            <div>
              {/* Botón en móvil para alternar rápidamente a la edición */}
              <div className="lg:hidden mb-3">
                <button
                  type="button"
                  onClick={() => setPestanaMobile('edicion')}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer select-none"
                >
                  <Sliders size={13} />
                  <span>Volver a Opciones de Diseño</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Visor en Vivo
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Toca el sobre para abrir o cerrar
                  </span>
                </div>

                {/* Alternador de estado para inspección rápida */}
                <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewAbierto(false)}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer select-none ${
                      !previewAbierto
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cerrado
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewAbierto(true)}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer select-none ${
                      previewAbierto
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Abierto
                  </button>
                </div>
              </div>

              {/* Visor 3D del Sobre en Tiempo Real (Respuesta Inmediata sin latencia) */}
              <div
                className="w-full aspect-[1.35/1] max-w-[380px] mx-auto rounded-2xl relative select-none cursor-pointer flex items-center justify-center p-2 group"
                onClick={() => setPreviewAbierto(!previewAbierto)}
                title="Haz clic para alternar entre sobre abierto y cerrado"
              >
                {/* Marco y Cuerpo del Sobre */}
                <div
                  ref={previewSobreRef}
                  className={`relative w-full h-full ${geometria.esquinas} shadow-xl flex items-center justify-center`}
                  style={{
                    perspective: 1000,
                    ['--color-sobre-live' as any]: localColor,
                  }}
                >
                  {/* Base del Sobre (Sin transiciones lentas de color para respuesta instantánea) */}
                  <div
                    className={`absolute inset-0 ${geometria.esquinas} overflow-hidden shadow-2xl`}
                    style={{
                      backgroundColor: 'var(--color-sobre-live, ' + localColor + ')',
                      boxShadow:
                        localEstilo === 'gala'
                          ? '0 20px 40px -10px rgba(0, 0, 0, 0.7), inset 0 0 0 2px rgba(212, 175, 55, 0.6)'
                          : '0 20px 40px -12px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {/* Forro interior decorativo en vivo */}
                    <ForroInteriorDecorativo
                      forro={localForro}
                      colorAcento={visual.colorSecundario || '#D4AF37'}
                    />

                    {/* Filetes perimetrales interiores */}
                    {localEstilo !== 'moderno' && (
                      <div className="absolute inset-2.5 rounded-xl border border-white/20 pointer-events-none" />
                    )}
                  </div>

                  {/* Tarjeta interior asomándose */}
                  <motion.div
                    animate={previewAbierto ? { y: -50, opacity: 1 } : { y: 0, opacity: 0.8 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-4 top-4 bottom-6 rounded-lg bg-white shadow-md border border-slate-200 z-10 flex flex-col items-center justify-center p-3 text-center pointer-events-none"
                  >
                    <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center mb-1 shadow-2xs">
                      <span className="text-slate-800 font-serif font-bold text-[10px]">{localMonograma}</span>
                    </div>
                    <p className="text-[10px] font-serif uppercase tracking-widest text-slate-800 font-bold line-clamp-1">
                      Invitación Formal
                    </p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5 line-clamp-1">
                      Comité Anfitrión
                    </p>
                  </motion.div>

                  {/* Bolsillo Frontal Inferior */}
                  <div
                    className={`absolute inset-x-0 bottom-0 ${geometria.bolsilloAltura} rounded-b-2xl z-20 overflow-hidden flex flex-col items-center justify-end pb-3.5 px-4`}
                    style={{
                      backgroundColor: 'var(--color-sobre-live, ' + localColor + ')',
                      boxShadow: '0 -6px 18px -4px rgba(0, 0, 0, 0.25)',
                      clipPath: geometria.bolsilloClip,
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-40"
                      style={{
                        borderTop: localEstilo === 'gala' ? '2px solid #D4AF37' : '1px solid #D4AF37',
                      }}
                    />

                    {/* Cartela Caligráfica en el frente del sobre */}
                    {(() => {
                      const esClaro = esColorClaro(localColor)
                      const colorTextoDestacado = esClaro ? '#0F172A' : '#FFFFFF'
                      const colorSubtexto = esClaro ? '#475569' : 'rgba(255, 255, 255, 0.85)'
                      const bordeCartela = esClaro ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid rgba(212, 175, 55, 0.5)'
                      const fondoCartela = esClaro
                        ? 'rgba(255, 255, 255, 0.90)'
                        : 'rgba(15, 23, 42, 0.65)'

                      return (
                        <div
                          className="w-full max-w-[92%] text-center relative z-10 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-md mb-1 border"
                          style={{
                            background: fondoCartela,
                            border: bordeCartela,
                          }}
                        >
                          {localTextoImpreso && (
                            <p
                              className="text-[7.5px] tracking-[0.25em] uppercase font-bold mb-0.5 line-clamp-1"
                              style={{ color: visual.colorSecundario || (esClaro ? '#B45309' : '#FDE047') }}
                            >
                              {localTextoImpreso}
                            </p>
                          )}
                          <p
                            className="text-xs sm:text-sm font-serif font-bold tracking-tight line-clamp-1 drop-shadow-xs"
                            style={{ color: colorTextoDestacado }}
                          >
                            Familia Ramírez Gómez
                          </p>
                          <span
                            className="text-[7.5px] tracking-wide block opacity-75 font-sans mt-0.5"
                            style={{ color: colorSubtexto }}
                          >
                            (Nombre de ejemplo — demostración)
                          </span>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Solapa Superior 3D con Sello de Cera */}
                  <motion.div
                    animate={previewAbierto ? { rotateX: -180 } : { rotateX: 0 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    className={`absolute inset-x-0 top-0 ${geometria.solapaAltura} z-30 overflow-visible flex items-end justify-center`}
                    style={{
                      transformOrigin: 'top center',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-t-2xl flex items-end justify-center relative ${geometria.solapaBorde}`}
                      style={{
                        backgroundColor: 'var(--color-sobre-live, ' + localColor + ')',
                        clipPath: geometria.solapaClip,
                        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.3)',
                        backfaceVisibility: 'hidden',
                      }}
                    />

                    {/* Sello de Cera en relieve */}
                    <motion.div
                      animate={previewAbierto ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -bottom-5 z-40 flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-12 ${geometria.formaSello} flex items-center justify-center relative shadow-xl`}
                        style={{
                          background: estiloLacre.fondo,
                          boxShadow: estiloLacre.sombra,
                        }}
                      >
                        <div
                          className={`w-9 h-9 ${geometria.formaSello} border ${estiloLacre.borde} flex items-center justify-center shadow-inner`}
                        >
                          <span
                            className={`font-serif font-black ${estiloLacre.texto} text-base drop-shadow-sm select-none ${
                              localEstilo === 'diamante' ? '-rotate-45' : ''
                            }`}
                          >
                            {localMonograma}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Ficha técnica informativa */}
            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Estilo:</span>
                <span className="font-medium text-slate-900">{ESTILOS_SOBRE.find(e => e.id === localEstilo)?.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Sello de Lacre:</span>
                <span className="font-medium capitalize text-slate-900">{localLacre.replace('_', ' ')} ({localMonograma})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Forro Interior:</span>
                <span className="font-medium capitalize text-slate-900">{localForro}</span>
              </div>
            </div>
          </div>

          {/* ═══════════════ COLUMNA 2: CONTROLES & PERSONALIZACIÓN ═══════════════ */}
          <div
            className={`${
              pestanaMobile === 'edicion' ? 'flex' : 'hidden'
            } lg:flex flex-1 p-4 sm:p-6 space-y-6 text-slate-800 text-sm overflow-y-auto flex-col`}
          >
            {/* Banner de acceso rápido a vista 3D en móvil */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setPestanaMobile('preview')}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-between text-xs font-bold shadow-xs border border-slate-800 cursor-pointer select-none active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <Eye size={13} className="text-white" />
                  </div>
                  <span>Ver Sobre 3D en Tiempo Real</span>
                </div>
                <span className="text-[11px] text-slate-300 flex items-center gap-1 font-semibold">
                  Toca aquí →
                </span>
              </button>
            </div>
            
            {/* 1. SECCIÓN DE ACTIVACIÓN: MENSAJE CLARO QUE EXPLICA QUE ES OPCIONAL */}
            <div
              onClick={handleToggleSobre}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                localTieneSobre
                  ? 'bg-slate-900 text-white border-slate-950 shadow-md'
                  : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                    localTieneSobre
                      ? 'bg-white text-slate-950 border-white'
                      : 'bg-white text-transparent border-slate-300'
                  }`}
                >
                  <Check size={14} strokeWidth={3} className={localTieneSobre ? 'text-slate-950' : 'opacity-0'} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight">
                      {localTieneSobre
                        ? 'Sobre Protocolario de Apertura: ACTIVADO'
                        : 'Activar Sobre Protocolario de Apertura 3D'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        localTieneSobre
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Opcional
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed ${localTieneSobre ? 'text-slate-300' : 'text-slate-600'}`}>
                    Esta función es <strong>completamente opcional</strong>. Si deseas que tus invitados vivan la experiencia ceremonial de ver y abrir un sobre en 3D antes de acceder a la invitación, <strong>marca esta casilla para activarla</strong>. Si prefieres que vean directamente la tarjeta sin pasar por el sobre, déjala desmarcada.
                  </p>

                  <p className={`text-[11px] font-medium pt-0.5 ${localTieneSobre ? 'text-slate-400' : 'text-slate-500'}`}>
                    • <strong>Comportamiento inteligente</strong>: Cuando un invitado confirme su asistencia, el sobre siempre aparecerá abierto automáticamente para no repetir la animación.
                  </p>
                </div>
              </div>

              {/* Switch visual en Blanco y Negro */}
              <div
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 self-end sm:self-center border ${
                  localTieneSobre
                    ? 'bg-white border-white'
                    : 'bg-slate-300 border-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full shadow-md transition-transform ${
                    localTieneSobre ? 'translate-x-6 bg-slate-950' : 'translate-x-0 bg-white'
                  }`}
                />
              </div>
            </div>

            {localTieneSobre && (
              <div className="space-y-6 animate-in fade-in duration-100">
                
                {/* 2. SELECTOR DE ESTILOS DE SOBRE */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} className="text-slate-800" />
                      <span>Estilos de Sobre ({ESTILOS_SOBRE.length} Estilos)</span>
                    </label>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                      {ESTILOS_SOBRE.find((e) => e.id === localEstilo)?.nombre}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {ESTILOS_SOBRE.map((estilo) => {
                      const seleccionado = localEstilo === estilo.id
                      return (
                        <button
                          key={estilo.id}
                          type="button"
                          onClick={() => handleCambiarEstilo(estilo.id)}
                          className={`p-3 rounded-xl border-2 text-left cursor-pointer relative flex flex-col justify-between select-none ${
                            seleccionado
                              ? 'bg-slate-50 border-slate-950 ring-1 ring-slate-950 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {seleccionado && (
                            <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px]">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{estilo.icono}</span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-tight">
                                {estilo.nombre}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {estilo.subtitulo}
                              </p>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                            {estilo.descripcion}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. COLORES DEL SOBRE */}
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                    <Palette size={14} className="text-slate-800" />
                    <span>Color de la Papelería del Sobre</span>
                  </label>

                  {/* Tonos selectos */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                    {PALETA_COLORES_SOBRE.map((color) => {
                      const esActivo = localColor.toLowerCase() === color.hex.toLowerCase()
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => handleCambiarColor(color.hex)}
                          className={`h-10 rounded-xl cursor-pointer flex items-center justify-center shadow-xs border-2 relative select-none ${
                            esActivo
                              ? 'ring-2 ring-slate-950 ring-offset-2 scale-105 border-slate-950'
                              : 'border-slate-300 hover:border-slate-500'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.nombre}
                        >
                          {esActivo && (
                            <Check
                              size={14}
                              strokeWidth={3}
                              className={color.textoOscuro ? 'text-slate-950' : 'text-white'}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Selector libre de color */}
                  <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-300">
                    <input
                      ref={colorSobreInputRef}
                      type="color"
                      defaultValue={localColor.startsWith('#') && localColor.length >= 4 ? localColor : '#0B192C'}
                      className="w-9 h-9 rounded-lg border border-slate-400 cursor-pointer bg-transparent"
                      title="Arrastra libremente para ver el color en vivo en tiempo real"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">Color Personalizado</p>
                      <p className="text-[10px] text-slate-500">Selecciona el tono hexadecimal exacto</p>
                    </div>
                    <input
                      ref={hexInputRef}
                      type="text"
                      defaultValue={localColor}
                      onChange={(e) => {
                        const val = e.target.value
                        if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
                          aplicarColorEnVivoDirecto(val, true)
                        }
                      }}
                      className="text-xs font-mono font-bold px-2.5 py-1 bg-white rounded-lg border border-slate-300 text-slate-900 shadow-2xs w-24 text-center uppercase outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* 4. SELLO DE LACRE & MONOGRAMA */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Mail size={14} className="text-slate-800" />
                      <span>Sello de Cera & Monograma</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Relieve 3D en la solapa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Monograma input */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Iniciales o Monograma del Sello
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={localMonograma}
                        onChange={(e) => handleCambiarMonograma(e.target.value)}
                        placeholder="Ej: J&M, 50, VIP, S"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-serif font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase tracking-widest text-center shadow-2xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Máximo 4 caracteres en mayúscula</p>
                    </div>

                    {/* Tonalidad del lacre */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Color del Lacre
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COLORES_LACRE.map((lacre) => {
                          const seleccionado = localLacre === lacre.id
                          return (
                            <button
                              key={lacre.id}
                              type="button"
                              onClick={() => handleCambiarLacre(lacre.id)}
                              className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center shadow-xs border select-none ${
                                seleccionado ? 'ring-2 ring-slate-950 ring-offset-2 scale-110 border-white' : 'border-black/20 hover:border-black/40'
                              }`}
                              style={{ backgroundColor: lacre.colorMuestra }}
                              title={lacre.nombre}
                            >
                              {seleccionado && <Check size={11} strokeWidth={3} className="text-white drop-shadow" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. TEXTO IMPRESO EN EL FRENTE DEL SOBRE */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Type size={14} className="text-slate-800" />
                      <span>Texto Impreso en el Frente</span>
                    </label>
                    <span className="text-[11px] text-slate-500">Caligrafía superior</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Encabezado o Tipo de Pase
                    </label>
                    <input
                      type="text"
                      value={localTextoImpreso}
                      onChange={(e) => handleCambiarTextoImpreso(e.target.value)}
                      placeholder="Ej: Pase de Honor Protocolario, Invitación Formal..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      El nombre de la invitación se mantiene automático según el invitado que reciba el enlace.
                    </p>
                  </div>

                  {/* Frases sugeridas */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Sugerencias de una sola pulsación:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Pase de Honor Protocolario',
                        'Invitación Formal',
                        'Pase de Honor',
                        'Invitación Especial',
                        'Pase Exclusivo',
                        'Reserva de Honor',
                        'Pase Personal',
                      ].map((frase) => (
                        <button
                          key={frase}
                          type="button"
                          onClick={() => handleCambiarTextoImpreso(frase)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none ${
                            localTextoImpreso === frase
                              ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                              : 'bg-white border-slate-300 text-slate-700 hover:border-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {frase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. FORRO INTERIOR */}
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                    <Sliders size={14} className="text-slate-800" />
                    <span>Forro Interior del Sobre</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FORROS_SOBRE.map((f) => {
                      const esActivo = localForro === f.id
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleCambiarForro(f.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer select-none ${
                            esActivo
                              ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-xs font-semibold">{f.nombre}</p>
                          <p className={`text-[10px] font-normal line-clamp-1 ${esActivo ? 'text-slate-300' : 'text-slate-400'}`}>
                            {f.descripcion}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Pie del modal con acciones */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* En móvil: alternador rápido entre opciones y preview */}
            <button
              type="button"
              onClick={() => setPestanaMobile(pestanaMobile === 'edicion' ? 'preview' : 'edicion')}
              className="lg:hidden px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
            >
              {pestanaMobile === 'edicion' ? (
                <>
                  <Eye size={13} />
                  <span>Ver Sobre</span>
                </>
              ) : (
                <>
                  <Sliders size={13} />
                  <span>Editar</span>
                </>
              )}
            </button>

            {localTieneSobre && onProbarApertura && (
              <button
                type="button"
                onClick={handleProbarApertura}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95 shadow-xs border border-slate-800 select-none whitespace-nowrap"
                title="Probar animación de apertura en pantalla completa"
              >
                <Eye size={13} className="text-white shrink-0" />
                <span className="hidden sm:inline">Probar en Pantalla Completa</span>
                <span className="sm:hidden">Pantalla Completa</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCerrar}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer active:scale-95 shadow-sm select-none whitespace-nowrap"
          >
            Listo, Aplicar Sobre
          </button>
        </div>

      </div>
    </div>
  )
})
