'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DetalleEvento, ExperienciaInvitado, FotoFondo, Invitado, TipoApertura, TipoEscena } from '@/types/invitation'
import { textoSobre, type TemaInvitacion } from './tema'
import { esInvitadoReal, fechaLarga } from './contexto'
import { CapaFotoFondo } from './foto-fondo'
import { CapaEscena } from './escenas'

/** 'Valentina & Andrés' → 'V&A' · 'Isabella' → 'I' */
export function monograma(nombres: string): string {
  const partes = nombres.split(/\s*(?:&|y)\s*/i).filter(Boolean)
  if (partes.length >= 2) return `${partes[0].trim()[0] || ''}&${partes[1].trim()[0] || ''}`.toUpperCase()
  return (nombres.trim()[0] || '★').toUpperCase()
}

export const INSTRUCCIONES_APERTURA: Record<TipoApertura, string> = {
  sobre: 'Toca el sello para abrir',
  telon: 'Toca para abrir el telón',
  raspa: 'Raspa con el dedo para descubrir',
  caja: 'Toca la caja para abrirla',
  puertas: 'Toca para abrir las puertas',
  libro: 'Toca la tarjeta para abrirla',
  boleto: 'Toca para rasgar tu boleto',
  globo: 'Toca el globo para reventarlo',
  deslizar: 'Toca para abrir',
  directo: '',
}

const DURACION: Partial<Record<TipoApertura, number>> = { telon: 1100, puertas: 1150, libro: 1100, globo: 650, deslizar: 750 }

/** Aperturas que cubren toda la pantalla con sus paneles: la foto va dentro de ellos y se ve la invitación al abrir */
const DE_PANTALLA_COMPLETA: TipoApertura[] = ['telon', 'puertas', 'deslizar']

function Raspadita({ tema, alDescubrir, fecha }: { tema: TemaInvitacion; alDescubrir: () => void; fecha: string }) {
  const lienzo = useRef<HTMLCanvasElement | null>(null)
  const raspando = useRef(false)
  const avisado = useRef(false)

  useEffect(() => {
    const c = lienzo.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const escala = window.devicePixelRatio || 1
    c.width = c.offsetWidth * escala
    c.height = c.offsetHeight * escala
    ctx.scale(escala, escala)
    const degradado = ctx.createLinearGradient(0, 0, c.offsetWidth, c.offsetHeight)
    degradado.addColorStop(0, '#C9C9CE')
    degradado.addColorStop(0.5, '#E4E4E8')
    degradado.addColorStop(1, '#B8B8BE')
    ctx.fillStyle = degradado
    ctx.fillRect(0, 0, c.offsetWidth, c.offsetHeight)
    ctx.fillStyle = '#5A5A62'
    ctx.font = '600 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Raspa aquí', c.offsetWidth / 2, c.offsetHeight / 2 + 5)
  }, [])

  const raspar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!raspando.current) return
    const c = lienzo.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const r = c.getBoundingClientRect()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(e.clientX - r.left, e.clientY - r.top, 22, 0, Math.PI * 2)
    ctx.fill()
    // Al descubrir casi la mitad, se abre sola
    const datos = ctx.getImageData(0, 0, c.width, c.height).data
    let vacios = 0
    for (let i = 3; i < datos.length; i += 64) if (datos[i] === 0) vacios++
    if (!avisado.current && vacios / (datos.length / 64) > 0.45) {
      avisado.current = true
      setTimeout(alDescubrir, 400)
    }
  }

  return (
    <div style={{ position: 'relative', width: 150, height: 150, borderRadius: 999, overflow: 'hidden', backgroundColor: tema.tarjeta, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 12, boxSizing: 'border-box' }}>
      <span style={{ fontFamily: tema.familiaTitulo, fontSize: 18, color: tema.tinta, lineHeight: 1.2 }}>{fecha}</span>
      <canvas
        ref={lienzo}
        aria-label="Zona para raspar"
        onPointerDown={(e) => {
          raspando.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          raspar(e)
        }}
        onPointerMove={raspar}
        onPointerUp={() => (raspando.current = false)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  )
}

/** Mitad de la foto de la apertura, dentro de un panel (telón o puerta) que ocupa media pantalla */
function MitadDeFoto({ lado, foto }: { lado: 'left' | 'right'; foto?: FotoFondo }) {
  if (!foto?.url) return null
  return (
    <span style={{ position: 'absolute', top: 0, bottom: 0, [lado]: 0, width: '200%' }}>
      <CapaFotoFondo foto={foto} />
    </span>
  )
}

/** Confeti que sale del centro (globo que se revienta) */
function Estallido({ colores }: { colores: string[] }) {
  const piezas = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const angulo = (i / 22) * Math.PI * 2 + Math.random() * 0.3
        const distancia = 90 + Math.random() * 80
        return { x: Math.cos(angulo) * distancia, y: Math.sin(angulo) * distancia, color: colores[i % colores.length], giro: Math.random() * 360 }
      }),
    [colores]
  )
  return (
    <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '45%', width: 0, height: 0 }}>
      {piezas.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.giro }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ position: 'absolute', width: 9, height: 5, marginLeft: -4, marginTop: -2, borderRadius: 2, backgroundColor: p.color }}
        />
      ))}
    </span>
  )
}

interface AperturaProps {
  tipo: TipoApertura
  tema: TemaInvitacion
  evento: DetalleEvento
  invitado: Invitado | null
  saludoPersonal: boolean
  /** Color, textos y foto que eligió el anfitrión (vacío = lo del estilo) */
  personalizacion?: Pick<ExperienciaInvitado, 'colorApertura' | 'tituloApertura' | 'textoApertura' | 'fotoApertura'>
  /** Fondo animado del estilo: también se ve detrás de la apertura */
  escena?: TipoEscena
  /** Dentro de un marco (vista previa del editor) en lugar de pantalla completa */
  contenida?: boolean
  alAbrir: () => void
}

export function AperturaInvitacion({ tipo, tema, evento, invitado, saludoPersonal, personalizacion = {}, escena, contenida = false, alAbrir }: AperturaProps) {
  const [abriendo, setAbriendo] = useState(false)
  const [visible, setVisible] = useState(tipo !== 'directo')

  useEffect(() => {
    if (tipo === 'directo') alAbrir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo])

  const abrir = () => {
    if (abriendo) return
    setAbriendo(true)
    setTimeout(() => {
      setVisible(false)
      alAbrir()
    }, DURACION[tipo] ?? 900)
  }

  const nombres = evento.anfitriones || evento.titulo
  const titulo = personalizacion.tituloApertura?.trim() || nombres
  const instruccion = personalizacion.textoApertura?.trim() || INSTRUCCIONES_APERTURA[tipo]
  const color = personalizacion.colorApertura || tema.acento
  const textoColor = textoSobre(color)
  const foto = personalizacion.fotoApertura?.url ? personalizacion.fotoApertura : undefined
  const pantallaCompleta = DE_PANTALLA_COMPLETA.includes(tipo)
  const real = esInvitadoReal(invitado)
  const fecha = fechaLarga(evento.fechaEvento)
  const tamanoTitulo = (base: number) => (tema.tituloCaligrafico ? base * 1.3 : base)
  // Texto directo sobre el fondo: si el color de letra del estilo no contrasta con el fondo, se usa blanco o negro
  const tintaFondo = textoSobre(tema.fondo) === textoSobre(tema.tinta) ? textoSobre(tema.fondo) : tema.tinta
  // Sobre una escena animada o una foto, los títulos van en una tarjeta para leerse siempre
  const conFondo = Boolean(escena || foto)
  const tarjetaTitulo: React.CSSProperties = conFondo
    ? { padding: '12px 20px', borderRadius: 18, backgroundColor: `color-mix(in srgb, ${tema.tarjeta} 88%, transparent)`, color: tema.tinta, maxWidth: '100%', boxSizing: 'border-box' }
    : { maxWidth: '100%' }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="apertura"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: contenida ? 'absolute' : 'fixed',
            inset: 0,
            zIndex: 80,
            // Puertas y portada dejan ver la invitación mientras se abren
            backgroundColor: tipo === 'puertas' || tipo === 'deslizar' ? 'transparent' : tema.fondo,
            color: tintaFondo,
            fontFamily: tema.familiaCuerpo,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
            padding: 24,
            overflow: 'hidden',
          }}
        >
          {!pantallaCompleta && <CapaEscena escena={escena} colores={{ fondo: tema.fondo, acento: tema.acento, detalle: tema.detalle }} />}
          {!pantallaCompleta && <CapaFotoFondo foto={foto} />}

          {real && saludoPersonal && (
            <div style={{ position: 'absolute', top: 24, left: 16, right: 16, zIndex: 3, margin: '0 auto', maxWidth: 380, padding: '12px 16px', borderRadius: 16, backgroundColor: tema.tarjeta, color: tema.tinta, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Hola, {invitado.nombre}</span>
              <span style={{ fontSize: 13, opacity: 0.75 }}>
                {invitado.pases > 1 ? `Reservamos ${invitado.pases} lugares para ustedes` : 'Tenemos un lugar reservado para ti'}
              </span>
            </div>
          )}

          {tipo === 'sobre' && (
            <button type="button" onClick={abrir} aria-label="Abrir la invitación" style={{ position: 'relative', width: 270, height: 176, border: 0, padding: 0, background: 'none', cursor: 'pointer', perspective: 800 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 10, backgroundColor: `color-mix(in srgb, ${color} 14%, ${tema.tarjeta})`, boxShadow: '0 16px 32px rgba(15,23,42,0.18)' }} />
              <motion.span
                animate={abriendo ? { rotateX: 180 } : { rotateX: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderLeft: '135px solid transparent', borderRight: '135px solid transparent', borderTop: `100px solid color-mix(in srgb, ${color} 24%, ${tema.tarjeta})`, transformOrigin: 'top center' }}
              />
              <motion.span
                animate={abriendo ? { scale: 0, opacity: 0 } : { scale: [1, 1.06, 1] }}
                transition={abriendo ? { duration: 0.3 } : { duration: 1.6, repeat: Infinity }}
                style={{ position: 'absolute', left: '50%', top: 74, width: 58, height: 58, marginLeft: -29, borderRadius: 999, backgroundColor: color, color: textoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: 22, boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }}
              >
                {monograma(nombres)}
              </motion.span>
            </button>
          )}

          {tipo === 'telon' && (
            <button type="button" onClick={abrir} aria-label="Abrir el telón" style={{ position: 'absolute', inset: 0, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(34), color: tintaFondo, padding: 24, textAlign: 'center' }}>{titulo}</span>
              {(['left', 'right'] as const).map((lado) => (
                <motion.span
                  key={lado}
                  animate={abriendo ? { x: lado === 'left' ? '-100%' : '100%' } : { x: 0 }}
                  transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    [lado]: 0,
                    width: '51%',
                    overflow: 'hidden',
                    background: `repeating-linear-gradient(90deg, ${color} 0 14px, color-mix(in srgb, ${color} 80%, #000) 14px 28px)`,
                    boxShadow: `${lado === 'left' ? 6 : -6}px 0 18px rgba(0,0,0,0.3)`,
                  }}
                >
                  <MitadDeFoto lado={lado} foto={foto} />
                </motion.span>
              ))}
            </button>
          )}

          {tipo === 'puertas' && (
            <button type="button" onClick={abrir} aria-label="Abrir las puertas" style={{ position: 'absolute', inset: 0, border: 0, padding: 0, background: 'none', cursor: 'pointer', perspective: 1400 }}>
              {(['left', 'right'] as const).map((lado) => (
                <motion.span
                  key={lado}
                  animate={abriendo ? { rotateY: lado === 'left' ? 100 : -100 } : { rotateY: 0 }}
                  transition={{ duration: 1.1, ease: [0.6, 0, 0.3, 1] }}
                  style={{ position: 'absolute', top: 0, bottom: 0, [lado]: 0, width: '50%', overflow: 'hidden', transformOrigin: `${lado} center`, backgroundColor: color, boxShadow: 'inset 0 0 50px rgba(0,0,0,0.28)' }}
                >
                  <MitadDeFoto lado={lado} foto={foto} />
                  {!foto && escena && (
                    <span style={{ position: 'absolute', top: 0, bottom: 0, [lado]: 0, width: '200%', opacity: 0.6 }}>
                      <CapaEscena escena={escena} colores={{ fondo: tema.fondo, acento: tema.acento, detalle: tema.detalle }} />
                    </span>
                  )}
                  <span style={{ position: 'absolute', inset: '7% 14%', border: `2px solid color-mix(in srgb, ${textoColor} 30%, transparent)`, borderRadius: 8 }} />
                  <span style={{ position: 'absolute', top: '50%', [lado === 'left' ? 'right' : 'left']: 14, width: 8, height: 46, marginTop: -23, borderRadius: 4, backgroundColor: tema.detalle, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
                </motion.span>
              ))}
              <motion.span animate={{ opacity: abriendo ? 0 : 1 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
                <span style={{ maxWidth: '100%', boxSizing: 'border-box', padding: '14px 22px', borderRadius: 18, backgroundColor: `color-mix(in srgb, ${color} 82%, #000)`, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', color: textoColor, fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(30), lineHeight: 1.1, textAlign: 'center' }}>{titulo}</span>
              </motion.span>
            </button>
          )}

          {tipo === 'raspa' && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '26px 20px', borderRadius: tema.radioTarjeta, backgroundColor: tema.tarjeta, color: tema.tinta, border: `2px solid ${color}`, textAlign: 'center' }}>
              <span style={{ fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(30), lineHeight: 1.1 }}>{titulo}</span>
              <Raspadita tema={tema} alDescubrir={abrir} fecha={fecha} />
            </div>
          )}

          {tipo === 'caja' && (
            <button type="button" onClick={abrir} aria-label="Abrir la caja" style={{ position: 'relative', width: 180, height: 180, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
              <motion.span animate={abriendo ? { scale: 1.3, opacity: 0 } : { scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} style={{ position: 'absolute', left: 12, right: 12, bottom: 0, height: 124, borderRadius: 12, backgroundColor: color }} />
              <motion.span animate={abriendo ? { scale: 1.3, opacity: 0 } : { scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} style={{ position: 'absolute', left: '50%', bottom: 0, height: 124, width: 24, marginLeft: -12, backgroundColor: tema.detalle }} />
              <motion.span animate={abriendo ? { y: -160, rotate: -24, opacity: 0 } : { y: 0 }} transition={{ duration: 0.7 }} style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 36, borderRadius: 10, backgroundColor: `color-mix(in srgb, ${color} 80%, #000)` }}>
                <span style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 24, marginLeft: -12, backgroundColor: tema.detalle }} />
                <span style={{ position: 'absolute', left: '50%', top: -28, width: 64, height: 30, marginLeft: -32, border: `9px solid ${tema.detalle}`, borderBottom: 0, borderRadius: '32px 32px 0 0', boxSizing: 'border-box' }} />
              </motion.span>
            </button>
          )}

          {tipo === 'libro' && (
            <button type="button" onClick={abrir} aria-label="Abrir la tarjeta" style={{ position: 'relative', width: 230, height: 320, border: 0, padding: 0, background: 'none', cursor: 'pointer', perspective: 1200 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: 12, backgroundColor: tema.tarjeta, color: tema.tinta, boxShadow: '0 16px 32px rgba(15,23,42,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color }}>Estás invitado</span>
                <span style={{ fontSize: 15 }}>{fecha}</span>
              </span>
              <motion.span
                animate={abriendo ? { rotateY: -165 } : { rotateY: 0 }}
                transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1] }}
                style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', transformOrigin: 'left center', backfaceVisibility: 'hidden', backgroundColor: color, color: textoColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 20, textAlign: 'center', boxShadow: '4px 0 16px rgba(0,0,0,0.2)' }}
              >
                <span style={{ position: 'absolute', inset: 10, border: `1.5px solid color-mix(in srgb, ${textoColor} 40%, transparent)`, borderRadius: 8 }} />
                <span style={{ width: 64, height: 64, borderRadius: 999, border: `1.5px solid ${textoColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: 24 }}>{monograma(nombres)}</span>
                <span style={{ fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(26), lineHeight: 1.1 }}>{titulo}</span>
              </motion.span>
            </button>
          )}

          {tipo === 'boleto' && (
            <button type="button" onClick={abrir} aria-label="Rasgar el boleto" style={{ position: 'relative', width: 300, height: 140, border: 0, padding: 0, background: 'none', cursor: 'pointer', display: 'flex', filter: 'drop-shadow(0 12px 20px rgba(15,23,42,0.2))' }}>
              <motion.span
                animate={abriendo ? { scale: 1.06, opacity: 0 } : { scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{ position: 'relative', flex: 1, borderRadius: '12px 0 0 12px', backgroundColor: color, color: textoColor, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '0 18px', textAlign: 'left' }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.8 }}>Pase de entrada</span>
                <span style={{ fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(22), lineHeight: 1.1 }}>{titulo}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{fecha}</span>
              </motion.span>
              <motion.span
                animate={abriendo ? { x: 50, y: 140, rotate: 32, opacity: 0 } : { x: 0 }}
                transition={{ duration: 0.6, ease: 'easeIn' }}
                style={{ position: 'relative', width: 78, borderRadius: '0 12px 12px 0', borderLeft: `2px dashed color-mix(in srgb, ${textoColor} 55%, transparent)`, backgroundColor: color, color: textoColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tema.familiaTitulo, fontSize: 20 }}
              >
                <span style={{ position: 'absolute', left: -9, top: -8, width: 16, height: 16, borderRadius: 999, backgroundColor: tema.fondo }} />
                <span style={{ position: 'absolute', left: -9, bottom: -8, width: 16, height: 16, borderRadius: 999, backgroundColor: tema.fondo }} />
                <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>{monograma(nombres)}</span>
              </motion.span>
            </button>
          )}

          {tipo === 'globo' && (
            <>
              <span style={{ position: 'relative', fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(30), lineHeight: 1.1, textAlign: 'center', ...tarjetaTitulo }}>{titulo}</span>
              <button type="button" onClick={abrir} aria-label="Reventar el globo" style={{ position: 'relative', width: 160, height: 230, border: 0, padding: 0, background: 'none', cursor: 'pointer' }}>
                <motion.svg
                  viewBox="0 0 120 180"
                  width="160"
                  height="230"
                  aria-hidden="true"
                  animate={abriendo ? { scale: 1.35, opacity: 0 } : { y: [0, -10, 0] }}
                  transition={abriendo ? { duration: 0.18 } : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M60 4C30 4 10 28 10 58c0 34 28 62 46 70l-5 8h18l-5-8c18-8 46-36 46-70C110 28 90 4 60 4z" fill={color} />
                  <ellipse cx="40" cy="40" rx="9" ry="16" fill="#fff" opacity="0.35" transform="rotate(-25 40 40)" />
                  <path d="M60 136c-6 14 8 22 0 42" stroke={tintaFondo} strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
                </motion.svg>
                {abriendo && <Estallido colores={[color, tema.detalle, tema.acento, '#F6C445']} />}
              </button>
            </>
          )}

          {tipo === 'deslizar' && (
            <motion.button
              type="button"
              onClick={abrir}
              aria-label="Abrir la invitación"
              animate={abriendo ? { y: '-100%' } : { y: 0 }}
              transition={{ duration: 0.75, ease: [0.7, 0, 0.3, 1] }}
              style={{ position: 'absolute', inset: 0, border: 0, padding: 24, backgroundColor: tema.fondo, color: tintaFondo, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', font: 'inherit', boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
            >
              <CapaEscena escena={escena} colores={{ fondo: tema.fondo, acento: tema.acento, detalle: tema.detalle }} />
              <CapaFotoFondo foto={foto} />
              <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...tarjetaTitulo, width: 'min(100%, 380px)', boxSizing: 'border-box', padding: conFondo ? '18px 22px' : 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color }}>{fecha}</span>
                <span style={{ maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'break-word', fontFamily: tema.familiaTitulo, fontSize: tamanoTitulo(40), lineHeight: 1.05 }}>{titulo}</span>
              </span>
              <motion.span
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{ position: 'absolute', bottom: 40, minHeight: 44, padding: '0 20px', borderRadius: 999, backgroundColor: color, color: textoColor, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}
              >
                ↑ {instruccion}
              </motion.span>
            </motion.button>
          )}

          {!abriendo && instruccion && tipo !== 'deslizar' && (
            <span
              style={{
                position: tipo === 'telon' || tipo === 'puertas' ? 'absolute' : 'relative',
                bottom: tipo === 'telon' || tipo === 'puertas' ? 40 : undefined,
                fontSize: 14,
                fontWeight: 600,
                zIndex: 1,
                padding: '8px 14px',
                borderRadius: 999,
                pointerEvents: 'none',
                backgroundColor: tipo === 'telon' || tipo === 'puertas' ? 'rgba(0,0,0,0.4)' : conFondo ? `color-mix(in srgb, ${tema.tarjeta} 85%, transparent)` : 'transparent',
                color: tipo === 'telon' || tipo === 'puertas' ? '#FFFFFF' : conFondo ? tema.tinta : tintaFondo,
                opacity: 0.9,
              }}
            >
              {instruccion}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
