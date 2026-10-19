'use client'

import React, { useId } from 'react'
import type { TipoEscena } from '@/types/invitation'

/**
 * Escenas animadas de fondo (dibujos originales, sin personajes con derechos de autor).
 * Toman los colores del estilo, así cada kit las tiñe a su manera. Son SVG + CSS: livianas,
 * se ven igual en el editor y en la invitación, y respetan «reducir movimiento» del teléfono.
 */

export const CATALOGO_ESCENAS: { id: TipoEscena; nombre: string; descripcion: string }[] = [
  { id: 'comic', nombre: 'Cómic', descripcion: 'Rayos de cómic y ¡POW! ¡ZAS!' },
  { id: 'ciudad', nombre: 'Ciudad de héroes', descripcion: 'Noche, faro y un héroe volando' },
  { id: 'tormenta', nombre: 'Tormenta de rayos', descripcion: 'Relámpagos y lluvia' },
  { id: 'castillo', nombre: 'Castillo encantado', descripcion: 'Destellos y corazones que suben' },
  { id: 'hielo', nombre: 'Reino de hielo', descripcion: 'Aurora y copos de nieve' },
  { id: 'hadas', nombre: 'Jardín de hadas', descripcion: 'Luciérnagas, flores y mariposas' },
  { id: 'aranas', nombre: 'Telarañas y arañitas', descripcion: 'Ciudad de noche con arañitas héroes colgando' },
]

interface Colores {
  fondo: string
  acento: string
  detalle: string
}

// Posiciones pseudoaleatorias fijas: el servidor y el navegador dibujan exactamente lo mismo
function aleatorio(semilla: number) {
  let t = semilla
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
function lista<T>(n: number, semilla: number, crear: (r: () => number, i: number) => T): T[] {
  const r = aleatorio(semilla)
  return Array.from({ length: n }, (_, i) => crear(r, i))
}

const ESTRELLAS = lista(42, 7, (r) => ({ x: r() * 400, y: r() * 520, t: 0.6 + r() * 1.6, d: r() * 3, dur: 1.6 + r() * 2.4 }))
const VENTANAS = lista(70, 11, (r) => ({ x: r() * 400, y: 600 + r() * 190, d: r() * 6, dur: 2 + r() * 5 }))
const LLUVIA = lista(46, 3, (r) => ({ x: r() * 420 - 10, d: r() * 1.2, dur: 0.55 + r() * 0.5, largo: 14 + r() * 18 }))
const DESTELLOS = lista(30, 21, (r) => ({ x: r() * 400, y: r() * 600, t: 5 + r() * 9, d: r() * 4, dur: 1.8 + r() * 2.5 }))
const CORAZONES = lista(11, 5, (r) => ({ x: 20 + r() * 360, t: 10 + r() * 14, d: r() * 10, dur: 9 + r() * 8 }))
const COPOS = lista(54, 13, (r) => ({ x: r() * 400, t: 1.5 + r() * 3.5, d: r() * 10, dur: 7 + r() * 8 }))
const LUCIERNAGAS = lista(26, 17, (r) => ({ x: r() * 400, y: 120 + r() * 560, d: r() * 5, dur: 4 + r() * 5 }))
const FLORES = lista(16, 29, (r) => ({ x: 10 + r() * 380, y: 700 + r() * 80, t: 7 + r() * 6, tono: r() > 0.5 }))

// Las funciones trigonométricas pueden variar en el último decimal entre servidor y navegador
const redondear = (n: number) => Math.round(n * 100) / 100

/** Polígono de estallido de cómic */
function estallido(cx: number, cy: number, rExt: number, rInt: number, puntas: number) {
  return Array.from({ length: puntas * 2 }, (_, i) => {
    const a = (Math.PI * i) / puntas - Math.PI / 2
    const radio = i % 2 === 0 ? rExt : rInt
    return `${(cx + Math.cos(a) * radio).toFixed(1)},${(cy + Math.sin(a) * radio).toFixed(1)}`
  }).join(' ')
}

const anim = (nombre: string, dur: number, retraso = 0, extra?: React.CSSProperties): React.CSSProperties => ({
  animation: `${nombre} ${dur}s ${retraso ? `${-retraso}s` : '0s'} infinite ease-in-out`,
  ...extra,
})
const propio: React.CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center' }

const ESTILOS = `
@keyframes esc-girar { to { transform: rotate(360deg) } }
@keyframes esc-latir { 0%,100% { transform: scale(1) rotate(-4deg) } 50% { transform: scale(1.14) rotate(4deg) } }
@keyframes esc-titilar { 0%,100% { opacity: .15 } 50% { opacity: 1 } }
@keyframes esc-faro { 0%,100% { transform: rotate(-24deg) } 50% { transform: rotate(24deg) } }
@keyframes esc-volar { 0% { transform: translate(-120px, 140px) rotate(-12deg) } 100% { transform: translate(520px, -180px) rotate(-12deg) } }
@keyframes esc-relampago { 0%, 84%, 100% { opacity: 0 } 86% { opacity: 1 } 88% { opacity: .15 } 90% { opacity: .9 } 93% { opacity: 0 } }
@keyframes esc-lluvia { from { transform: translateY(-80px) } to { transform: translateY(880px) } }
@keyframes esc-nube { 0%,100% { transform: translateX(-18px) } 50% { transform: translateX(18px) } }
@keyframes esc-subir { 0% { transform: translateY(0); opacity: 0 } 10%, 85% { opacity: 1 } 100% { transform: translateY(-880px); opacity: 0 } }
@keyframes esc-bandera { 0%,100% { transform: skewY(0deg) scaleX(1) } 50% { transform: skewY(10deg) scaleX(.82) } }
@keyframes esc-aurora { 0%,100% { transform: translateX(-36px); opacity: .45 } 50% { transform: translateX(36px); opacity: .9 } }
@keyframes esc-caer { 0% { transform: translate(0, -60px) } 50% { transform: translate(16px, 400px) } 100% { transform: translate(0, 880px) } }
@keyframes esc-flotar { 0%,100% { transform: translate(0, 0) } 25% { transform: translate(14px, -12px) } 50% { transform: translate(-6px, -24px) } 75% { transform: translate(-14px, -6px) } }
@keyframes esc-aleteo { 0%,100% { transform: scaleX(1) } 50% { transform: scaleX(.2) } }
@keyframes esc-mariposa { 0% { transform: translate(-60px, 640px) } 50% { transform: translate(210px, 420px) } 100% { transform: translate(470px, 180px) } }
@keyframes esc-colgar { 0%,100% { transform: translateY(-30px) } 50% { transform: translateY(40px) } }
@keyframes esc-pendulo { 0%,100% { transform: rotate(-28deg) } 50% { transform: rotate(28deg) } }
@keyframes esc-mecer { 0%,100% { transform: rotate(-5deg) } 50% { transform: rotate(5deg) } }
@media (prefers-reduced-motion: reduce) { [data-escena] * { animation: none !important } }
`

function Comic({ fondo, acento, detalle, id }: Colores & { id: string }) {
  const rayos = Array.from({ length: 14 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 14
    const p = (ang: number) => `${(200 + Math.cos(ang) * 950).toFixed(0)},${(400 + Math.sin(ang) * 950).toFixed(0)}`
    return `200,400 ${p(a - 0.11)} ${p(a + 0.11)}`
  })
  const globos: [number, number, number, string, string][] = [
    [80, 120, 62, '¡POW!', acento],
    [326, 330, 52, '¡ZAS!', detalle],
    [96, 600, 58, '¡BOOM!', acento],
    [318, 720, 44, '¡WOW!', detalle],
  ]
  return (
    <>
      <defs>
        <pattern id={`${id}-puntos`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.6" fill={acento} opacity="0.2" />
        </pattern>
      </defs>
      <rect width="400" height="800" fill={fondo} />
      <g style={{ ...anim('esc-girar', 60, 0, { animationTimingFunction: 'linear' }), transformOrigin: '200px 400px' }}>
        {rayos.map((p, i) => (
          <polygon key={i} points={p} fill={detalle} opacity="0.16" />
        ))}
      </g>
      <rect width="400" height="800" fill={`url(#${id}-puntos)`} />
      {globos.map(([x, y, r, texto, color], i) => (
        <g key={texto} transform={`translate(${x} ${y})`}>
          <g style={{ ...anim('esc-latir', 1.8 + i * 0.3, i * 0.5), ...propio }}>
            <polygon points={estallido(0, 0, r, r * 0.68, 11)} fill={color} stroke="#111" strokeWidth="4" strokeLinejoin="round" />
            <text textAnchor="middle" dominantBaseline="central" fontFamily="'Bricolage Grotesque', Impact, sans-serif" fontWeight="900" fontSize={r * 0.42} fill="#fff" stroke="#111" strokeWidth="3" paintOrder="stroke">
              {texto}
            </text>
          </g>
        </g>
      ))}
    </>
  )
}

/** Edificios con ventanas que se encienden */
function Horizonte({ luz }: { luz: string }) {
  return (
    <>
      <path
        d="M0 800 V640 H34 V600 H70 V660 H96 V560 H140 V620 H160 V590 H196 V530 H232 V610 H258 V575 H300 V640 H322 V590 H360 V650 H400 V800 Z"
        fill="#05081A"
      />
      {VENTANAS.map((v, i) => (
        <rect key={i} x={v.x} y={v.y} width="5" height="7" fill={luz} style={anim('esc-titilar', v.dur, v.d)} />
      ))}
    </>
  )
}

function Ciudad({ acento, detalle, id }: Colores & { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#070B24' }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${acento} 45%, #0B1033)` }} />
        </linearGradient>
        <radialGradient id={`${id}-luna`}>
          <stop offset="0.6" stopColor={detalle} />
          <stop offset="1" stopColor={detalle} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      {ESTRELLAS.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={e.t} fill="#fff" style={anim('esc-titilar', e.dur, e.d)} />
      ))}
      <circle cx="318" cy="118" r="62" fill={`url(#${id}-luna)`} opacity="0.35" />
      <circle cx="318" cy="118" r="34" fill={detalle} />
      {/* Faro que barre el cielo con un emblema de estrella */}
      <g style={{ ...anim('esc-faro', 7), transformOrigin: '200px 800px' }}>
        <polygon points="190,800 120,40 280,40 210,800" fill={detalle} opacity="0.14" />
        <polygon points={estallido(200, 70, 30, 13, 5)} fill={detalle} opacity="0.55" />
      </g>
      {/* Héroe genérico con capa cruzando el cielo */}
      <g style={anim('esc-volar', 11, 2, { animationTimingFunction: 'linear' })}>
        <path d="M0 10 L-34 -2 L-30 22 Z" fill={acento} />
        <ellipse cx="6" cy="10" rx="16" ry="6" fill="#F8FAFC" />
        <circle cx="25" cy="7" r="6" fill="#F8FAFC" />
        <path d="M28 4 L44 -2" stroke="#F8FAFC" strokeWidth="4" strokeLinecap="round" />
      </g>
      <Horizonte luz={detalle} />
    </>
  )
}

function Tormenta({ acento, detalle, id }: Colores & { id: string }) {
  const rayos = ['M120 150 L95 260 L130 260 L100 390', 'M300 120 L280 220 L312 222 L270 360', 'M210 200 L196 280 L222 282 L190 410']
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#0B1120' }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${acento} 40%, #111827)` }} />
        </linearGradient>
        <filter id={`${id}-brillo`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      <g opacity="0.18">
        <rect width="400" height="800" fill="#fff" style={anim('esc-relampago', 6, 1, { animationTimingFunction: 'linear', opacity: 0 })} />
      </g>
      {rayos.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={detalle} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" filter={`url(#${id}-brillo)`} style={anim('esc-relampago', 4.5 + i * 1.3, i * 1.7, { animationTimingFunction: 'linear', opacity: 0 })} />
      ))}
      {[
        [70, 110, 0],
        [250, 80, 2],
        [160, 170, 4],
        [340, 190, 1],
      ].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g style={anim('esc-nube', 9 + i * 2, d)}>
            <ellipse cx="0" cy="0" rx="70" ry="28" fill="#334155" />
            <ellipse cx="-30" cy="-16" rx="34" ry="26" fill="#3B4A63" />
            <ellipse cx="22" cy="-22" rx="40" ry="30" fill="#475569" />
          </g>
        </g>
      ))}
      {LLUVIA.map((l, i) => (
        <line key={i} x1={l.x} y1="0" x2={l.x - 4} y2={l.largo} stroke="#CBD5E1" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" style={anim('esc-lluvia', l.dur, l.d, { animationTimingFunction: 'linear' })} />
      ))}
    </>
  )
}

function Castillo({ fondo, acento, detalle, id }: Colores & { id: string }) {
  const torres: [number, number, number][] = [
    [96, 560, 38],
    [200, 470, 48],
    [304, 560, 38],
  ]
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fondo} />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      {DESTELLOS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <path d={`M0 ${-s.t} L${s.t * 0.25} ${-s.t * 0.25} L${s.t} 0 L${s.t * 0.25} ${s.t * 0.25} L0 ${s.t} L${-s.t * 0.25} ${s.t * 0.25} L${-s.t} 0 L${-s.t * 0.25} ${-s.t * 0.25} Z`} fill={detalle} style={anim('esc-titilar', s.dur, s.d)} />
        </g>
      ))}
      {CORAZONES.map((c, i) => (
        <g key={i} transform={`translate(${c.x} 820)`}>
          <path
            d={`M0 ${c.t * 0.3} C ${-c.t} ${-c.t * 0.4}, ${-c.t * 0.5} ${-c.t * 1.1}, 0 ${-c.t * 0.45} C ${c.t * 0.5} ${-c.t * 1.1}, ${c.t} ${-c.t * 0.4}, 0 ${c.t * 0.3} Z`}
            fill={acento}
            opacity="0.4"
            style={anim('esc-subir', c.dur, c.d, { animationTimingFunction: 'linear' })}
          />
        </g>
      ))}
      <ellipse cx="200" cy="820" rx="320" ry="110" style={{ fill: `color-mix(in srgb, ${acento} 18%, #FFFFFF)` }} />
      {/* Castillo */}
      <rect x="110" y="600" width="180" height="200" fill={acento} />
      {torres.map(([x, y, a], i) => (
        <g key={i}>
          <rect x={x - a / 2} y={y} width={a} height={800 - y} fill={acento} />
          <polygon points={`${x - a / 2 - 6},${y} ${x},${y - a * 1.4} ${x + a / 2 + 6},${y}`} style={{ fill: `color-mix(in srgb, ${acento} 70%, #000)` }} />
          <line x1={x} y1={y - a * 1.4} x2={x} y2={y - a * 1.4 - 30} stroke="#5B4636" strokeWidth="2" />
          <g transform={`translate(${x} ${y - a * 1.4 - 30})`}>
            <polygon points="0,0 22,6 0,12" fill={detalle} style={{ ...anim('esc-bandera', 1.4 + i * 0.2, i * 0.3), transformBox: 'fill-box', transformOrigin: 'left center' }} />
          </g>
          <rect x={x - 7} y={y + 26} width="14" height="20" rx="7" fill={detalle} style={anim('esc-titilar', 3 + i, i)} />
        </g>
      ))}
      <path d="M176 800 V720 A24 24 0 0 1 224 720 V800 Z" style={{ fill: `color-mix(in srgb, ${acento} 60%, #000)` }} />
      {[130, 160, 240, 270].map((x) => (
        <rect key={x} x={x - 8} y="586" width="16" height="16" fill={acento} />
      ))}
    </>
  )
}

function Hielo({ acento, detalle, id }: Colores & { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E2A47" />
          <stop offset="0.55" stopColor="#3D7FB8" />
          <stop offset="1" stopColor="#DDF3FF" />
        </linearGradient>
        <linearGradient id={`${id}-aurora`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={detalle} stopOpacity="0" />
          <stop offset="0.5" stopColor={detalle} />
          <stop offset="1" stopColor={acento} stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-difuso`}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M-60 ${150 + i * 70} C 60 ${90 + i * 70}, 160 ${220 + i * 60}, 260 ${140 + i * 70} S 420 ${120 + i * 60}, 470 ${170 + i * 70}`}
          fill="none"
          stroke={`url(#${id}-aurora)`}
          strokeWidth={46 - i * 14}
          filter={`url(#${id}-difuso)`}
          style={anim('esc-aurora', 8 + i * 3, i * 2)}
        />
      ))}
      <polygon points="-20,800 70,560 150,800" fill="#E8F6FF" />
      <polygon points="80,800 210,480 340,800" fill="#F5FBFF" />
      <polygon points="250,800 350,590 440,800" fill="#E1F1FC" />
      <polygon points="210,480 182,548 198,540 210,560 224,540 238,550" fill="#FFFFFF" />
      <polygon points="70,560 52,606 66,600 78,612 88,598" fill="#FFFFFF" />
      {COPOS.map((c, i) => (
        <circle key={i} cx={c.x} cy="0" r={c.t} fill="#FFFFFF" opacity="0.85" style={anim('esc-caer', c.dur, c.d, { animationTimingFunction: 'linear' })} />
      ))}
    </>
  )
}

function Hadas({ fondo, acento, detalle, id }: Colores & { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fondo} />
          <stop offset="1" stopColor="#E7F8E1" />
        </linearGradient>
        <radialGradient id={`${id}-luz`}>
          <stop offset="0" stopColor="#FFF9C4" />
          <stop offset="1" stopColor="#FFF9C4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      <ellipse cx="90" cy="800" rx="230" ry="120" fill="#A7DB95" />
      <ellipse cx="330" cy="810" rx="220" ry="110" fill="#8DCE7B" />
      {FLORES.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`}>
          <g style={{ ...anim('esc-mecer', 3 + (i % 4), i * 0.4), transformBox: 'fill-box', transformOrigin: 'center bottom' }}>
            <line x1="0" y1="0" x2="0" y2="30" stroke="#4F9A3D" strokeWidth="2" />
            {[0, 72, 144, 216, 288].map((a) => (
              <circle key={a} cx={redondear(Math.cos((a * Math.PI) / 180) * f.t * 0.7)} cy={redondear(Math.sin((a * Math.PI) / 180) * f.t * 0.7)} r={redondear(f.t * 0.55)} fill={f.tono ? acento : detalle} />
            ))}
            <circle r={f.t * 0.4} fill="#FFE27A" />
          </g>
        </g>
      ))}
      {LUCIERNAGAS.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y})`}>
          <g style={anim('esc-flotar', l.dur, l.d)}>
            <circle r="9" fill={`url(#${id}-luz)`} style={anim('esc-titilar', 2 + (i % 3), l.d)} />
            <circle r="2" fill="#FFF6A8" />
          </g>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} style={anim('esc-mariposa', 14 + i * 3, i * 5, { animationTimingFunction: 'linear' })}>
          <g transform="rotate(-20)">
            <g style={{ ...anim('esc-aleteo', 0.35, i * 0.1), ...propio }}>
              <ellipse cx="-9" cy="-4" rx="10" ry="7" fill={i % 2 ? acento : detalle} />
              <ellipse cx="9" cy="-4" rx="10" ry="7" fill={i % 2 ? acento : detalle} />
              <ellipse cx="-7" cy="6" rx="6" ry="5" fill={i % 2 ? detalle : acento} />
              <ellipse cx="7" cy="6" rx="6" ry="5" fill={i % 2 ? detalle : acento} />
            </g>
            <rect x="-1.5" y="-8" width="3" height="18" rx="1.5" fill="#3F2A1D" />
          </g>
        </g>
      ))}
    </>
  )
}

/** Telaraña de esquina: hilos que salen de la esquina y anillos con una leve curva */
function telarana(cx: number, cy: number, radio: number, desde: number, hasta: number) {
  const rayos = 7
  const anillos = 5
  const angulo = (i: number) => ((desde + ((hasta - desde) * i) / (rayos - 1)) * Math.PI) / 180
  const punto = (i: number, r: number) => [redondear(cx + Math.cos(angulo(i)) * r), redondear(cy + Math.sin(angulo(i)) * r)]
  let d = ''
  for (let i = 0; i < rayos; i++) {
    const [x, y] = punto(i, radio)
    d += `M${cx} ${cy} L${x} ${y} `
  }
  for (let k = 1; k <= anillos; k++) {
    const r = (radio * k) / anillos
    for (let i = 0; i < rayos - 1; i++) {
      const [x1, y1] = punto(i, r)
      const [x2, y2] = punto(i + 1, r)
      // El hilo se curva un poco hacia la esquina, como una telaraña real
      const [mx, my] = [redondear(cx + ((x1 + x2) / 2 - cx) * 0.9), redondear(cy + ((y1 + y2) / 2 - cy) * 0.9)]
      d += `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2} `
    }
  }
  return d
}

/** Arañita de caricatura con antifaz; `capa` la convierte en Arañín, el héroe de la escena */
function Aranita({ tamano, cuerpo, antifaz, capa }: { tamano: number; cuerpo: string; antifaz: string; capa?: string }) {
  const t = tamano
  const patas = [-1, 1].flatMap((lado) =>
    [-0.55, -0.15, 0.25, 0.6].map((f, i) => {
      const y = f * t
      return `M${redondear(lado * t * 0.55)} ${redondear(y)} Q${redondear(lado * t * 1.25)} ${redondear(y - t * 0.55)} ${redondear(lado * t * (1.5 + i * 0.05))} ${redondear(y + t * 0.35)}`
    })
  )
  return (
    <g>
      {capa && <path d={`M${-t * 0.5} ${-t * 0.2} L${-t * 0.9} ${t * 1.5} L${t * 0.9} ${t * 1.5} L${t * 0.5} ${-t * 0.2} Z`} fill={capa} />}
      {patas.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={cuerpo} strokeWidth={t * 0.16} strokeLinecap="round" />
      ))}
      {/* Borde claro: se distinguen sobre el cielo de noche */}
      <circle cx="0" cy={t * 0.35} r={t * 0.75} fill={cuerpo} stroke="rgba(255,255,255,0.45)" strokeWidth={t * 0.07} />
      <circle cx="0" cy={-t * 0.45} r={t * 0.6} fill={cuerpo} stroke="rgba(255,255,255,0.45)" strokeWidth={t * 0.07} />
      <rect x={-t * 0.62} y={-t * 0.7} width={t * 1.24} height={t * 0.42} rx={t * 0.2} fill={antifaz} />
      <circle cx={-t * 0.24} cy={-t * 0.5} r={t * 0.16} fill="#FFFFFF" />
      <circle cx={t * 0.24} cy={-t * 0.5} r={t * 0.16} fill="#FFFFFF" />
      <circle cx={-t * 0.22} cy={-t * 0.48} r={t * 0.07} fill="#111" />
      <circle cx={t * 0.26} cy={-t * 0.48} r={t * 0.07} fill="#111" />
      <path d={`M${-t * 0.18} ${-t * 0.18} Q0 ${-t * 0.02} ${t * 0.18} ${-t * 0.18}`} fill="none" stroke="#FFFFFF" strokeWidth={t * 0.08} strokeLinecap="round" />
    </g>
  )
}

const ARANITAS = lista(7, 37, (r, i) => ({ x: 30 + i * 55 + r() * 20, hilo: 90 + r() * 260, t: 9 + r() * 6, d: r() * 3, dur: 2.4 + r() * 2 }))

function Aranas({ acento, detalle, id }: Colores & { id: string }) {
  const hilo = 'rgba(255,255,255,0.55)'
  return (
    <>
      <defs>
        <linearGradient id={`${id}-cielo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#060A22' }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${detalle} 45%, #0B1033)` }} />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cielo)`} />
      {ESTRELLAS.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={e.t * 0.8} fill="#fff" style={anim('esc-titilar', e.dur, e.d)} />
      ))}
      <Horizonte luz="#FDE68A" />
      {/* Telarañas en las esquinas */}
      <path d={telarana(0, 0, 150, 0, 90)} fill="none" stroke={hilo} strokeWidth="1.4" />
      <path d={telarana(400, 0, 130, 90, 180)} fill="none" stroke={hilo} strokeWidth="1.4" />
      <path d={telarana(400, 800, 120, 180, 270)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
      {/* Arañitas que suben y bajan por su hilo */}
      {ARANITAS.map((a, i) => (
        <g key={i} transform={`translate(${redondear(a.x)} 0)`}>
          <g style={anim('esc-colgar', a.dur, a.d)}>
            <line x1="0" y1="-40" x2="0" y2={redondear(a.hilo)} stroke={hilo} strokeWidth="1.2" />
            <g transform={`translate(0 ${redondear(a.hilo + a.t)})`}>
              <Aranita tamano={redondear(a.t)} cuerpo={i % 2 ? '#1F2937' : '#111827'} antifaz={i % 2 ? detalle : acento} />
            </g>
          </g>
        </g>
      ))}
      {/* Arañín, el héroe, se columpia de lado a lado */}
      <g style={{ ...anim('esc-pendulo', 3.6), transformOrigin: '200px 0px' }}>
        <line x1="200" y1="0" x2="200" y2="330" stroke="rgba(255,255,255,0.8)" strokeWidth="2" />
        <g transform="translate(200 362)">
          <Aranita tamano={30} cuerpo="#111827" antifaz={acento} capa={detalle} />
        </g>
      </g>
    </>
  )
}

const ESCENAS: Record<TipoEscena, (p: Colores & { id: string }) => React.ReactElement> = {
  aranas: Aranas,
  comic: Comic,
  ciudad: Ciudad,
  tormenta: Tormenta,
  castillo: Castillo,
  hielo: Hielo,
  hadas: Hadas,
}

/** Capa con la escena animada; cubre su contenedor (posicionado) */
export function CapaEscena({ escena, colores, estilo }: { escena?: TipoEscena; colores: Colores; estilo?: React.CSSProperties }) {
  const id = `esc${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const Dibujo = escena ? ESCENAS[escena] : undefined
  if (!Dibujo) return null
  return (
    <div aria-hidden="true" data-escena={escena} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...estilo }}>
      <style>{ESTILOS}</style>
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ display: 'block' }}>
        <Dibujo {...colores} id={id} />
      </svg>
    </div>
  )
}
