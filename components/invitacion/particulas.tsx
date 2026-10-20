import React from 'react'
import type { ParticulasConfig, TipoFondoAnimado, TipoParticulas } from '@/types/invitation'

/**
 * Efectos Premium de movimiento: partículas sobre la invitación y fondos de color animados.
 * Solo CSS (animaciones en app/globals.css): livianos en el celular y sin JavaScript al recorrer.
 * Las posiciones salen de una semilla fija para que el servidor y el navegador dibujen lo mismo.
 */

export const CATALOGO_PARTICULAS: { id: TipoParticulas; nombre: string; descripcion: string }[] = [
  { id: 'confeti', nombre: 'Confeti', descripcion: 'Papelitos de colores cayendo' },
  { id: 'petalos', nombre: 'Pétalos', descripcion: 'Pétalos de flor que caen girando' },
  { id: 'corazones', nombre: 'Corazones', descripcion: 'Corazones que suben flotando' },
  { id: 'nieve', nombre: 'Nieve', descripcion: 'Copos suaves cayendo' },
  { id: 'estrellas', nombre: 'Estrellas', descripcion: 'Estrellas que titilan' },
  { id: 'burbujas', nombre: 'Burbujas', descripcion: 'Burbujas que suben' },
  { id: 'destellos', nombre: 'Destellos dorados', descripcion: 'Brillos que aparecen y se apagan' },
  { id: 'luces', nombre: 'Luces bokeh', descripcion: 'Círculos de luz desenfocados' },
]

export const CATALOGO_FONDOS_ANIMADOS: { id: TipoFondoAnimado; nombre: string; descripcion: string }[] = [
  { id: 'aurora', nombre: 'Aurora', descripcion: 'Manchas de color que se mueven despacio' },
  { id: 'degradado', nombre: 'Degradado vivo', descripcion: 'El color del fondo cambia suavemente' },
  { id: 'ondas', nombre: 'Ondas', descripcion: 'Olas de color en la parte de abajo' },
]

const CANTIDAD = { pocas: 12, normal: 22, muchas: 36 } as const

/** Números pseudoaleatorios repetibles (mulberry32) */
function generador(semilla: number) {
  let a = semilla
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const r2 = (n: number) => Math.round(n * 100) / 100

interface Colores {
  acento: string
  detalle: string
  fondo: string
}

const formaCorazon = (color: string) => (
  <svg viewBox="0 0 24 22" width="100%" height="100%" aria-hidden="true">
    <path d="M12 21 C5 15 1 11 1 6.5 C1 3.4 3.4 1 6.4 1 C8.6 1 10.6 2.3 12 4.3 C13.4 2.3 15.4 1 17.6 1 C20.6 1 23 3.4 23 6.5 C23 11 19 15 12 21Z" fill={color} />
  </svg>
)
const formaEstrella = (color: string) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <path d="M12 1 L14.6 8.6 L22.5 8.8 L16.2 13.6 L18.5 21.3 L12 16.8 L5.5 21.3 L7.8 13.6 L1.5 8.8 L9.4 8.6Z" fill={color} />
  </svg>
)
const formaDestello = (color: string) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <path d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0Z" fill={color} />
  </svg>
)

export function CapaParticulas({ config, colores }: { config?: ParticulasConfig; colores: Colores }) {
  if (!config?.tipo) return null
  const n = CANTIDAD[config.cantidad || 'normal']
  const azar = generador(config.tipo.length * 97 + n)
  const paleta = config.color
    ? [config.color]
    : config.tipo === 'confeti'
      ? [colores.acento, colores.detalle, '#F59E0B', '#EC4899', '#3B82F6', '#10B981']
      : config.tipo === 'petalos'
        ? ['#F9A8D4', '#FBCFE8', '#FDA4AF']
        : config.tipo === 'nieve'
          ? ['#FFFFFF']
          : config.tipo === 'estrellas' || config.tipo === 'destellos'
            ? ['#FCD34D', '#FDE68A']
            : [colores.acento, colores.detalle]

  const piezas = Array.from({ length: n }, (_, i) => {
    const x = r2(azar() * 100)
    const y = r2(azar() * 100)
    const dur = r2(6 + azar() * 8)
    const retraso = r2(-azar() * 14)
    const tam = r2(6 + azar() * 10)
    const deriva = Math.round((azar() - 0.5) * 120)
    const giro = Math.round(180 + azar() * 540) * (i % 2 ? 1 : -1)
    const color = paleta[i % paleta.length]
    const base: React.CSSProperties = {
      position: 'absolute',
      left: `${x}%`,
      width: tam,
      height: tam,
      ['--tj-deriva' as string]: `${deriva}px`,
      ['--tj-giro' as string]: `${giro}deg`,
    }
    switch (config.tipo) {
      case 'confeti':
        return <span key={i} className="tj-particula" style={{ ...base, top: '-8%', height: tam * 0.5, backgroundColor: color, borderRadius: 1.5, animation: `tj-caer ${dur}s linear ${retraso}s infinite` }} />
      case 'petalos':
        return <span key={i} className="tj-particula" style={{ ...base, top: '-8%', width: tam * 1.3, backgroundColor: color, borderRadius: '0 100% 0 100%', opacity: 0.85, animation: `tj-caer ${dur * 1.3}s ease-in-out ${retraso}s infinite` }} />
      case 'nieve':
        return <span key={i} className="tj-particula" style={{ ...base, top: '-8%', width: tam * 0.7, height: tam * 0.7, backgroundColor: color, borderRadius: 999, opacity: 0.85, filter: 'blur(0.6px)', boxShadow: '0 0 4px rgba(255,255,255,0.8)', animation: `tj-caer ${dur * 1.4}s linear ${retraso}s infinite` }} />
      case 'corazones':
        return <span key={i} className="tj-particula" style={{ ...base, top: '104%', width: tam * 1.4, height: tam * 1.3, opacity: 0.75, animation: `tj-subir ${dur * 1.2}s ease-in ${retraso}s infinite` }}>{formaCorazon(color)}</span>
      case 'burbujas':
        return <span key={i} className="tj-particula" style={{ ...base, top: '104%', width: tam * 1.8, height: tam * 1.8, borderRadius: 999, border: `1.5px solid ${color}`, backgroundColor: 'rgba(255,255,255,0.12)', opacity: 0.7, animation: `tj-subir ${dur * 1.3}s ease-in ${retraso}s infinite` }} />
      case 'estrellas':
        return <span key={i} className="tj-particula" style={{ ...base, top: `${y}%`, width: tam * 1.2, height: tam * 1.2, animation: `tj-titilar ${r2(dur / 3)}s ease-in-out ${retraso}s infinite` }}>{formaEstrella(color)}</span>
      case 'destellos':
        return <span key={i} className="tj-particula" style={{ ...base, top: `${y}%`, width: tam * 1.5, height: tam * 1.5, filter: `drop-shadow(0 0 4px ${color})`, animation: `tj-titilar ${r2(dur / 3.5)}s ease-in-out ${retraso}s infinite` }}>{formaDestello(color)}</span>
      case 'luces':
        return <span key={i} className="tj-particula" style={{ ...base, top: `${y}%`, width: tam * 5, height: tam * 5, borderRadius: 999, backgroundColor: color, opacity: 0.18, filter: 'blur(6px)', animation: `tj-vagar ${dur * 1.5}s ease-in-out ${retraso}s infinite` }} />
    }
  })

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {piezas}
    </div>
  )
}

export function CapaFondoAnimado({ tipo, colores }: { tipo?: TipoFondoAnimado; colores: Colores }) {
  if (!tipo) return null
  const caja: React.CSSProperties = { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }
  if (tipo === 'degradado') {
    return (
      <div aria-hidden="true" className="tj-fondo-animado" style={caja}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.55, backgroundImage: `linear-gradient(120deg, ${colores.fondo}, ${colores.acento}55, ${colores.detalle}55, ${colores.fondo}, ${colores.acento}44)`, backgroundSize: '300% 300%', animation: 'tj-degradado 16s ease-in-out infinite' }} />
      </div>
    )
  }
  if (tipo === 'aurora') {
    const mancha = (color: string, top: string, left: string, tam: string, dur: number, retraso: number): React.CSSProperties => ({
      position: 'absolute',
      top,
      left,
      width: tam,
      height: tam,
      borderRadius: '50%',
      backgroundColor: color,
      opacity: 0.32,
      filter: 'blur(48px)',
      animation: `tj-aurora ${dur}s ease-in-out ${retraso}s infinite`,
    })
    return (
      <div aria-hidden="true" className="tj-fondo-animado" style={caja}>
        <div style={mancha(colores.acento, '-10%', '-20%', '80vmax', 18, 0)} />
        <div style={mancha(colores.detalle, '40%', '30%', '70vmax', 22, -6)} />
        <div style={mancha(colores.acento, '70%', '-30%', '60vmax', 26, -12)} />
      </div>
    )
  }
  // Ondas: dos olas que se desplazan en la parte de abajo
  const ola = (color: string, alto: number, dur: number, opacidad: number) => (
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: '200%', height: `${alto}%`, opacity: opacidad, animation: `tj-ondas ${dur}s linear infinite` }}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
        <path d="M0 60 Q150 0 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill={color} />
      </svg>
    </div>
  )
  return (
    <div aria-hidden="true" className="tj-fondo-animado" style={caja}>
      {ola(colores.acento, 22, 14, 0.18)}
      {ola(colores.detalle, 16, 9, 0.22)}
    </div>
  )
}
