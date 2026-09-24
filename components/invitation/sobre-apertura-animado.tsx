'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DetalleEvento,
  ConfiguracionVisual,
  Invitado,
  EstiloSobreTipo,
  ColorLacreTipo,
  ForroSobreTipo,
} from '@/types/invitation'
import { BackgroundEffects } from './background-effects'
import { RotateCcw } from 'lucide-react'

interface SobreAperturaAnimadoProps {
  evento: DetalleEvento
  visual: ConfiguracionVisual
  invitado?: Invitado | null
  esModoEdicionDirecta?: boolean
  claveReinicio?: number | string
  children: React.ReactNode
}

/**
 * Obtener gradientes realistas y colores 3D para el sello de cera
 */
export function obtenerGradienteLacre(colorLacre?: ColorLacreTipo) {
  switch (colorLacre) {
    case 'rojo_rubi':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #F87171 0%, #DC2626 35%, #991B1B 70%, #450A0A 100%)',
        borde: 'border-red-300/40',
        texto: 'text-red-100',
        sombra: '0 8px 20px rgba(153, 27, 27, 0.45)',
      }
    case 'azul_noche':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #60A5FA 0%, #2563EB 35%, #1E3A8A 70%, #0F172A 100%)',
        borde: 'border-blue-300/40',
        texto: 'text-blue-100',
        sombra: '0 8px 20px rgba(30, 58, 138, 0.45)',
      }
    case 'verde_esmeralda':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #4ADE80 0%, #059669 35%, #064E3B 70%, #022C22 100%)',
        borde: 'border-emerald-300/40',
        texto: 'text-emerald-100',
        sombra: '0 8px 20px rgba(6, 78, 59, 0.45)',
      }
    case 'negro_onix':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #94A3B8 0%, #334155 35%, #0F172A 75%, #020617 100%)',
        borde: 'border-white/30',
        texto: 'text-slate-100',
        sombra: '0 8px 20px rgba(0, 0, 0, 0.6)',
      }
    case 'bronce':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #D97706 0%, #B45309 35%, #78350F 70%, #451A03 100%)',
        borde: 'border-white/30',
        texto: 'text-yellow-100',
        sombra: '0 8px 20px rgba(120, 53, 15, 0.45)',
      }
    case 'rosa_oro':
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #FECDD3 0%, #FB7185 35%, #BE123C 70%, #4C0519 100%)',
        borde: 'border-rose-200/50',
        texto: 'text-rose-100',
        sombra: '0 8px 20px rgba(190, 18, 60, 0.45)',
      }
    case 'oro':
    default:
      return {
        fondo: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #D4AF37 40%, #996515 75%, #5B3A0D 100%)',
        borde: 'border-yellow-200/50',
        texto: 'text-yellow-100',
        sombra: '0 8px 22px rgba(153, 101, 21, 0.5)',
      }
  }
}

/**
 * Determina si un color hexadecimal es claro para asegurar contraste tipográfico perfecto
 */
export function esColorClaro(hex: string): boolean {
  if (!hex || typeof hex !== 'string') return false
  const limpio = hex.replace('#', '')
  if (limpio.length < 6) return false
  const r = parseInt(limpio.substring(0, 2), 16) || 0
  const g = parseInt(limpio.substring(2, 4), 16) || 0
  const b = parseInt(limpio.substring(4, 6), 16) || 0
  const brillo = (r * 299 + g * 587 + b * 114) / 1000
  return brillo > 165
}

/**
 * Recortes y formas geométricas según el estilo de sobre
 */
export function obtenerGeometriaSobre(estilo: EstiloSobreTipo = 'clasico') {
  switch (estilo) {
    case 'moderno':
      return {
        solapaClip: 'polygon(0 0, 100% 0, 100% 84%, 0 84%)',
        bolsilloClip: 'polygon(0 42%, 100% 42%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[46%]',
        bolsilloAltura: 'h-[60%]',
        esquinas: 'rounded-xl',
        formaSello: 'rounded-xl', // Sello geométrico moderno
        solapaBorde: 'border-b border-white/20',
      }
    case 'vintage':
      return {
        solapaClip: 'polygon(0 0, 100% 0, 88% 70%, 50% 100%, 12% 70%)',
        bolsilloClip: 'polygon(0 38%, 18% 25%, 50% 10%, 82% 25%, 100% 38%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[58%]',
        bolsilloAltura: 'h-[64%]',
        esquinas: 'rounded-2xl',
        formaSello: 'rounded-full',
        solapaBorde: 'border-b border-white/30',
      }
    case 'gala':
      return {
        solapaClip: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)',
        bolsilloClip: 'polygon(0 32%, 25% 6%, 75% 6%, 100% 32%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[52%]',
        bolsilloAltura: 'h-[68%]',
        esquinas: 'rounded-2xl',
        formaSello: 'rounded-full',
        solapaBorde: 'border-b-2 border-white/40',
      }
    case 'artesanal':
      return {
        solapaClip: 'polygon(0 0, 100% 0, 92% 75%, 50% 100%, 8% 75%)',
        bolsilloClip: 'polygon(0 36%, 50% 6%, 100% 36%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[56%]',
        bolsilloAltura: 'h-[64%]',
        esquinas: 'rounded-2xl',
        formaSello: 'rounded-full',
        solapaBorde: 'border-b border-white/20',
      }
    case 'diamante':
      return {
        solapaClip: 'polygon(0 0, 100% 0, 50% 100%)',
        bolsilloClip: 'polygon(0 48%, 50% 0%, 100% 48%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[56%]',
        bolsilloAltura: 'h-[62%]',
        esquinas: 'rounded-2xl',
        formaSello: 'rounded-lg rotate-45', // Diamante facetado
        solapaBorde: 'border-b border-white/30',
      }
    case 'clasico':
    default:
      return {
        solapaClip: 'polygon(0 0, 100% 0, 50% 100%)',
        bolsilloClip: 'polygon(0 35%, 50% 0%, 100% 35%, 100% 100%, 0 100%)',
        solapaAltura: 'h-[55%]',
        bolsilloAltura: 'h-[62%]',
        esquinas: 'rounded-2xl',
        formaSello: 'rounded-full',
        solapaBorde: 'border-b border-white/30',
      }
  }
}

/**
 * Patrón interior decorativo
 */
export function ForroInteriorDecorativo({
  forro = 'satinado',
  colorAcento,
}: {
  forro?: ForroSobreTipo
  colorAcento: string
}) {
  if (forro === 'liso') {
    return <div className="absolute inset-x-2 top-2 h-36 rounded-t-xl opacity-10 bg-white pointer-events-none" />
  }

  if (forro === 'arabesco') {
    return (
      <div
        className="absolute inset-x-2 top-2 h-40 rounded-t-xl opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${colorAcento} 1px, transparent 1px), radial-gradient(circle at 0% 0%, ${colorAcento} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />
    )
  }

  if (forro === 'geometrico') {
    return (
      <div
        className="absolute inset-x-2 top-2 h-40 rounded-t-xl opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(45deg, ${colorAcento} 25%, transparent 25%), linear-gradient(-45deg, ${colorAcento} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${colorAcento} 75%), linear-gradient(-45deg, transparent 75%, ${colorAcento} 75%)`,
          backgroundSize: '20px 20px',
        }}
      />
    )
  }

  if (forro === 'floral') {
    return (
      <div
        className="absolute inset-x-2 top-2 h-40 rounded-t-xl opacity-25 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at center, ${colorAcento} 2px, transparent 3px)`,
          backgroundSize: '18px 24px',
        }}
      />
    )
  }

  // Por defecto: satinado degradado
  return (
    <div
      className="absolute inset-x-2 top-2 h-36 rounded-t-xl opacity-35 pointer-events-none"
      style={{
        background: `linear-gradient(180deg, ${colorAcento} 0%, transparent 100%)`,
      }}
    />
  )
}

/**
 * Componente interactivo de sobre protocolario:
 * - Soporta 6 estilos visuales refinados (Clásico, Moderno, Vintage, Gala, Artesanal, Diamante).
 * - Sello de lacre interactivo en 7 tonalidades realistas (Oro, Rubí, Zafiro, Esmeralda, Ónix, Bronce, Rosa Oro).
 * - Se abre fluidamente al tocar/hacer clic sobre el sobre o el sello.
 * - Sin botones ni letreros invasivos debajo del sobre.
 * - Si el invitado ya confirmó asistencia, el sobre aparece abierto de inmediato.
 */
export function SobreAperturaAnimado({
  evento,
  visual,
  invitado,
  esModoEdicionDirecta = false,
  claveReinicio,
  children,
}: SobreAperturaAnimadoProps) {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  const tieneSobreActivado = Boolean(visual.animacionSobre)
  const yaConfirmado = Boolean(
    invitado?.confirmado === true || invitado?.estadoConfirmacion === 'confirmado'
  )

  const [estaAbierto, setEstaAbierto] = useState<boolean>(() => {
    if (!tieneSobreActivado) return true
    if (esModoEdicionDirecta) return true
    if (yaConfirmado) return true
    return false
  })

  const [abriendo, setAbriendo] = useState(false)

  // Sincronizar apertura: si entra a edición directa se abre inmediatamente;
  // si entra a vista previa o prueba y el sobre está activo, se cierra para mostrar la animación
  useEffect(() => {
    if (esModoEdicionDirecta) {
      setEstaAbierto(true)
      setAbriendo(false)
    } else {
      if (tieneSobreActivado && !yaConfirmado) {
        setEstaAbierto(false)
        setAbriendo(false)
      }
    }
  }, [esModoEdicionDirecta, tieneSobreActivado, yaConfirmado, claveReinicio])

  // Si no está activado el sobre, renderizar directamente los hijos
  if (!tieneSobreActivado) {
    return <>{children}</>
  }

  const handleAbrirSobre = () => {
    if (abriendo || estaAbierto) return
    setAbriendo(true)
    // Secuencia de apertura en 3D
    setTimeout(() => {
      setEstaAbierto(true)
      setAbriendo(false)
    }, 1050)
  }

  const handleRepetirApertura = () => {
    setEstaAbierto(false)
    setAbriendo(false)
  }

  const estiloSobre = visual.estiloSobre || 'clasico'
  const geometria = obtenerGeometriaSobre(estiloSobre)
  const colorSobre = visual.colorSobre || visual.colorPrimario || '#1E293B'
  const estiloLacre = obtenerGradienteLacre(visual.colorLacre || 'oro')
  const monograma = visual.textoMonograma || 'T'
  const textoImpresoSobre = visual.textoImpresoSobre ?? 'Pase de Honor Protocolario'

  // En modo edición directa en el editor canvas, se muestra la tarjeta directamente
  if (esModoEdicionDirecta) {
    return <div className="relative w-full">{children}</div>
  }

  return (
    <div
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-x-hidden select-none"
      style={{ backgroundColor: visual.colorFondo }}
      suppressHydrationWarning
    >
      {/* Fondo ambiental interactivo */}
      <BackgroundEffects efecto={visual.efectoFondo} colorAcento={visual.colorSecundario} />

      {/* Botón flotante discreto para volver a reproducir la animación */}
      {estaAbierto && !yaConfirmado && montado && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in duration-300">
          <button
            type="button"
            onClick={handleRepetirApertura}
            className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Volver a ver la animación de apertura del sobre"
          >
            <RotateCcw size={12} className="text-white" />
            <span>Repetir sobre</span>
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!estaAbierto ? (
          /* ═══════════════ VISTA DEL SOBRE CERRADO / ABRIÉNDOSE ═══════════════ */
          <motion.div
            key="sobre-contenedor"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
            className="w-full max-w-md sm:max-w-lg px-4 py-8 flex flex-col items-center justify-center z-30 cursor-pointer group"
            onClick={handleAbrirSobre}
            title="Toca para abrir la invitación"
          >
            {/* Sobre Protocolario 3D */}
            <div
              className={`relative w-full aspect-[1.38/1] ${geometria.esquinas} shadow-2xl transition-transform duration-300 group-hover:scale-[1.015] flex items-center justify-center`}
              style={{
                perspective: 1200,
                ['--color-sobre-live' as any]: colorSobre,
              }}
            >
              {/* Cuerpo del Sobre (Base) */}
              <div
                className={`absolute inset-0 ${geometria.esquinas} overflow-hidden shadow-2xl`}
                style={{
                  backgroundColor: 'var(--color-sobre-live, ' + colorSobre + ')',
                  boxShadow:
                    estiloSobre === 'gala'
                      ? '0 25px 50px -10px rgba(0, 0, 0, 0.7), inset 0 0 0 2px rgba(212, 175, 55, 0.6)'
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* Forro interior decorativo */}
                <ForroInteriorDecorativo
                  forro={visual.forroSobre}
                  colorAcento={visual.colorSecundario || '#D4AF37'}
                />

                {/* Filetes perimetrales interiores */}
                {estiloSobre !== 'moderno' && (
                  <>
                    <div className="absolute inset-3 rounded-xl border border-white/20 pointer-events-none" />
                    {estiloSobre === 'gala' && (
                      <div className="absolute inset-4 rounded-lg border border-white/30 pointer-events-none" />
                    )}
                  </>
                )}

                {/* Textura sutil para papel artesanal */}
                {estiloSobre === 'artesanal' && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #000 1px, transparent 1px)`,
                      backgroundSize: '12px 12px',
                    }}
                  />
                )}
              </div>

              {/* Tarjeta interior que se asoma suavemente */}
              <motion.div
                initial={{ y: 0, opacity: 0.85 }}
                animate={abriendo ? { y: -85, opacity: 1 } : { y: 0, opacity: 0.85 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-5 top-5 bottom-8 rounded-xl bg-white shadow-md border border-slate-200 z-10 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
              >
                <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center mb-1.5 shadow-2xs">
                  <span className="text-slate-900 font-serif font-bold text-xs">{monograma}</span>
                </div>
                <p className="text-[11px] font-serif uppercase tracking-widest text-slate-800 line-clamp-1 font-bold">
                  {evento.titulo}
                </p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5 line-clamp-1">
                  {evento.anfitriones}
                </p>
              </motion.div>

              {/* Pliegue / Bolsillo frontal inferior */}
              <div
                className={`absolute inset-x-0 bottom-0 ${geometria.bolsilloAltura} rounded-b-2xl z-20 overflow-hidden flex flex-col items-center justify-end pb-5 px-6`}
                style={{
                  backgroundColor: 'var(--color-sobre-live, ' + colorSobre + ')',
                  boxShadow: '0 -8px 24px -6px rgba(0, 0, 0, 0.25)',
                  clipPath: geometria.bolsilloClip,
                }}
              >
                {/* Filete o bisel dorado en la solapa inferior */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    borderTop: estiloSobre === 'gala' ? '2px solid #D4AF37' : '1px solid #D4AF37',
                  }}
                />

                {/* Fajilla de gala horizontal decorativa */}
                {estiloSobre === 'gala' && (
                  <div className="absolute inset-x-0 bottom-2.5 h-6 bg-gradient-to-r from-white/10 via-white/25 to-white/10 border-y border-white/30 pointer-events-none flex items-center justify-center">
                    <span className="text-[8px] uppercase tracking-[0.3em] text-white font-bold">
                      Protocolo Oficial
                    </span>
                  </div>
                )}

                {/* Cartela Caligráfica de Alta Costura: Nombre del Invitado */}
                {(() => {
                  const esClaro = esColorClaro(colorSobre)
                  const colorTextoDestacado = esClaro ? '#0F172A' : '#FFFFFF'
                  const colorSubtexto = esClaro ? '#475569' : 'rgba(255, 255, 255, 0.85)'
                  const bordeCartela = esClaro ? '1px solid rgba(15, 23, 42, 0.15)' : '1px solid rgba(212, 175, 55, 0.5)'
                  const fondoCartela = esClaro
                    ? 'rgba(255, 255, 255, 0.90)'
                    : 'rgba(15, 23, 42, 0.65)'

                  const nombreMostrar = invitado?.nombre || 'Distinguido(a) Invitado(a)'
                  const esDemo = !invitado || invitado.id === 'preview-invitado' || invitado.id === 'inv-temp'

                  return (
                    <div
                      className="w-full max-w-[94%] sm:max-w-[88%] text-center relative z-10 px-3 py-2 sm:py-2.5 rounded-xl backdrop-blur-md shadow-lg mb-2 border transition-all"
                      style={{
                        background: fondoCartela,
                        border: bordeCartela,
                      }}
                    >
                      {textoImpresoSobre && (
                        <p
                          className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase font-bold mb-0.5 line-clamp-1"
                          style={{ color: visual.colorSecundario || (esClaro ? '#B45309' : '#FDE047') }}
                        >
                          {textoImpresoSobre}
                        </p>
                      )}
                      <p
                        className="text-base sm:text-2xl font-serif font-bold tracking-tight line-clamp-1 drop-shadow-xs"
                        style={{
                          color: colorTextoDestacado,
                          fontFamily:
                            visual.fuenteTitulo === 'greatvibes' || visual.fuenteTitulo === 'alexbrush'
                              ? 'var(--font-serif), serif'
                              : undefined,
                        }}
                      >
                        {nombreMostrar}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-0.5">
                        <span
                          className="text-[9px] sm:text-[10px] font-semibold tracking-wider"
                          style={{ color: colorSubtexto }}
                        >
                          {invitado?.pases && invitado.pases > 1
                            ? `Válido para ${invitado.pases} personas`
                            : 'Pase Protocolario Personal'}
                        </span>
                      </div>
                      {esDemo && (
                        <span
                          className="text-[8px] tracking-wide mt-0.5 block opacity-75 font-sans"
                          style={{ color: colorSubtexto }}
                        >
                          (Nombre de ejemplo — cada invitado recibirá su sobre personalizado)
                        </span>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Solapa Superior 3D con Sello de Cera */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={abriendo ? { rotateX: -180 } : { rotateX: 0 }}
                transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
                className={`absolute inset-x-0 top-0 ${geometria.solapaAltura} z-30 overflow-visible flex items-end justify-center`}
                style={{
                  transformOrigin: 'top center',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Cara Exterior de la Solapa */}
                <div
                  className={`w-full h-full rounded-t-2xl flex items-end justify-center relative ${geometria.solapaBorde}`}
                  style={{
                    backgroundColor: 'var(--color-sobre-live, ' + colorSobre + ')',
                    clipPath: geometria.solapaClip,
                    boxShadow: '0 10px 20px -4px rgba(0, 0, 0, 0.3)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  {/* Filete perimetral dorado interior en la solapa */}
                  {estiloSobre !== 'moderno' && (
                    <div className="absolute inset-x-4 top-2 bottom-2 pointer-events-none opacity-40 border-b border-white/20" />
                  )}
                </div>

                {/* Sello de Cera Protocolario en relieve interactivo */}
                <motion.div
                  initial={{ scale: 1 }}
                  animate={abriendo ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.45 }}
                  className="absolute -bottom-6 z-40 flex flex-col items-center"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 ${geometria.formaSello} flex items-center justify-center relative transition-transform`}
                    style={{
                      background: estiloLacre.fondo,
                      boxShadow: estiloLacre.sombra,
                    }}
                  >
                    {/* Relieve con borde de cera fundida */}
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 ${geometria.formaSello} border ${estiloLacre.borde} flex items-center justify-center shadow-inner`}
                    >
                      <span
                        className={`font-serif font-black ${estiloLacre.texto} text-lg sm:text-xl drop-shadow-md select-none ${
                          estiloSobre === 'diamante' ? '-rotate-45' : ''
                        }`}
                      >
                        {monograma}
                      </span>
                    </div>

                    {/* Brillo reflectante satinado */}
                    <div className="absolute top-1.5 left-2.5 w-3 h-2 rounded-full bg-white/40 blur-[1px]" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* ═══════════════ TARJETÓN PRINCIPAL REVELADO ═══════════════ */
          <motion.div
            key="tarjeta-revelada"
            initial={{ opacity: 0, y: 55, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
