'use client'

import { motion } from 'framer-motion'
import { EfectoFondo } from '@/types/invitation'

interface BackgroundEffectsProps {
  efecto: EfectoFondo
  colorAcento: string
}

/**
 * Efectos de fondo sutiles, elegantes y corporativos.
 * Eliminadas estridencias y colores de fiesta infantil en favor de micro-interacciones editoriales.
 */
export function BackgroundEffects({ efecto, colorAcento }: BackgroundEffectsProps) {
  if (efecto === 'ninguno') {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gridSuave" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridSuave)" />
        </svg>
      </div>
    )
  }

  if (efecto === 'particulas_doradas') {
    const particulas = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: `${(i * 19) % 90 + 5}%`,
      y: `${(i * 27) % 90 + 5}%`,
      tamano: 2 + (i % 3),
    }))

    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {particulas.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: ['0px', '-15px', '0px'],
              opacity: [0.15, 0.45, 0.15],
            }}
            transition={{
              duration: 4 + (p.id % 3),
              repeat: Infinity,
              delay: p.id * 0.3,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: `${p.tamano}px`,
              height: `${p.tamano}px`,
              borderRadius: '50%',
              backgroundColor: colorAcento,
              boxShadow: `0 0 8px ${colorAcento}40`,
            }}
          />
        ))}
      </div>
    )
  }

  // Micro-destellos sobrios (estilo papelería de lujo con sellado en seco)
  const destellos = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    x: `${(i * 23) % 90 + 5}%`,
    y: `${(i * 31) % 90 + 5}%`,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {destellos.map((d) => (
        <motion.span
          key={d.id}
          animate={{
            opacity: [0.08, 0.35, 0.08],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 3.5 + (d.id % 2),
            repeat: Infinity,
            delay: d.id * 0.4,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            fontSize: '11px',
            color: colorAcento,
          }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}
