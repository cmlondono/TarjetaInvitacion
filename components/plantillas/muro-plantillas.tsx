'use client'

import { useEffect, useRef, useState } from 'react'
import type { Plantilla } from '@/lib/estudio/plantillas'
import { MiniaturaPlantilla } from './miniatura-plantilla'

const CASILLAS = 8
/** En celular solo se ven las primeras 6 */
const CASILLAS_MOVIL = 6
/** Ritmo "calmado": un cambio cada ~1 s */
const RITMO_MS = 1000
const ESPERA_CASILLA_MS = 950


/**
 * Cuadrícula de la landing: cada segundo una casilla al azar se voltea como un naipe
 * y muestra otra plantilla que no esté en pantalla. Se detiene la casilla bajo el mouse,
 * se pausa con la pestaña oculta y con "reducir movimiento" solo hace un fundido.
 */
export function MuroPlantillas({ plantillas: PLANTILLAS }: { plantillas: Plantilla[] }) {
  // Primero las destacadas en el panel; luego el resto
  const [visibles, setVisibles] = useState<Plantilla[]>(() =>
    [...PLANTILLAS.filter((p) => p.destacada), ...PLANTILLAS.filter((p) => !p.destacada)].slice(0, CASILLAS)
  )
  const visiblesRef = useRef(visibles)
  visiblesRef.current = visibles
  const casillasRef = useRef<(HTMLDivElement | null)[]>([])
  const fijas = useRef(new Set<number>())
  const ocupadas = useRef(new Set<number>())
  const ultima = useRef(-1)

  useEffect(() => {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let temporizador: ReturnType<typeof setTimeout> | undefined
    let activo = true

    const reemplazar = (i: number, nueva: Plantilla) =>
      setVisibles((v) => {
        const copia = [...v]
        copia[i] = nueva
        return copia
      })

    const cambiar = () => {
      const enPantalla = window.matchMedia('(max-width: 639px)').matches ? CASILLAS_MOVIL : CASILLAS
      const libres = Array.from({ length: enPantalla }, (_, i) => i).filter(
        (i) => i !== ultima.current && !fijas.current.has(i) && !ocupadas.current.has(i)
      )
      const el = libres.length ? casillasRef.current[libres[Math.floor(Math.random() * libres.length)]] : null
      if (!el) return
      const i = casillasRef.current.indexOf(el)
      const usadas = new Set(visiblesRef.current.map((p) => p.id))
      const opciones = PLANTILLAS.filter((p) => !usadas.has(p.id))
      const nueva = opciones[Math.floor(Math.random() * opciones.length)]
      if (!nueva) return

      ultima.current = i
      ocupadas.current.add(i)
      setTimeout(() => ocupadas.current.delete(i), ESPERA_CASILLA_MS)

      if (reducido) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = () => {
          reemplazar(i, nueva)
          requestAnimationFrame(() => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: 'forwards' }))
        }
        return
      }
      el.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).onfinish = () => {
        reemplazar(i, nueva)
        requestAnimationFrame(() =>
          el.animate([{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }], {
            duration: 340,
            easing: 'cubic-bezier(.2,.8,.3,1.15)',
            fill: 'forwards',
          })
        )
      }
    }

    const programar = () => {
      clearTimeout(temporizador)
      if (!activo || document.hidden) return
      temporizador = setTimeout(() => {
        cambiar()
        programar()
      }, RITMO_MS * (0.75 + Math.random() * 0.5))
    }

    document.addEventListener('visibilitychange', programar)
    programar()
    return () => {
      activo = false
      clearTimeout(temporizador)
      document.removeEventListener('visibilitychange', programar)
    }
  }, [])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {visibles.map((p, i) => (
        <div
          key={i}
          className={`[perspective:900px] ${i >= CASILLAS_MOVIL ? 'max-sm:hidden' : ''}`}
          onPointerEnter={() => fijas.current.add(i)}
          onPointerLeave={() => fijas.current.delete(i)}
          onFocusCapture={() => fijas.current.add(i)}
          onBlurCapture={() => fijas.current.delete(i)}
        >
          <div
            ref={(el) => {
              casillasRef.current[i] = el
            }}
            className="h-full"
          >
            <MiniaturaPlantilla plantilla={p} />
          </div>
        </div>
      ))}
    </div>
  )
}
