import React from 'react'
import type { FotoFondo } from '@/types/invitation'

export const OPACIDAD_FOTO_POR_DEFECTO = 0.35

/**
 * Foto de fondo acomodada: cubre su contenedor, centrada en el punto (x, y) elegido,
 * con zoom, opacidad y desenfoque. El color de fondo de debajo se ve a través de ella.
 */
export function CapaFotoFondo({ foto, estilo }: { foto?: FotoFondo; estilo?: React.CSSProperties }) {
  if (!foto?.url) return null
  const x = foto.x ?? 50
  const y = foto.y ?? 50
  const zoom = foto.zoom ?? 100
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...estilo }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={foto.url}
        alt=""
        draggable={false}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${x}% ${y}%`,
          transform: zoom !== 100 || foto.desenfoque ? `scale(${zoom / 100 + (foto.desenfoque ? 0.04 : 0)})` : undefined,
          transformOrigin: `${x}% ${y}%`,
          opacity: foto.opacidad ?? OPACIDAD_FOTO_POR_DEFECTO,
          filter: foto.desenfoque ? `blur(${foto.desenfoque}px)` : undefined,
        }}
      />
    </div>
  )
}
