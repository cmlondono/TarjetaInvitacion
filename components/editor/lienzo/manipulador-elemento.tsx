'use client'

import { useEffect, useRef, useState } from 'react'
import Moveable from 'react-moveable'
import type { ElementoLienzo } from '@/types/invitation'

interface ManipuladorElementoProps {
  elemento: ElementoLienzo
  capa: HTMLDivElement
  /** Bloque al que pertenece el elemento */
  seccionId: string
  /** Evento de mouse con el que se presionó un elemento aún no seleccionado: arrastra sin soltar */
  arrastrePendiente: React.MutableRefObject<PointerEvent | null>
  alConfirmar: (cambios: Partial<ElementoLienzo>) => void
  /** Se soltó encima de otro bloque: el elemento pasa a ese bloque con su posición relativa a él */
  alCambiarBloque: (haciaId: string, cambios: Partial<ElementoLienzo>) => void
}

const redondear = (n: number) => Math.round(n * 100) / 100

/**
 * Asas de transformación del elemento seleccionado (mover, redimensionar, rotar y pellizcar).
 * Durante el gesto solo se modifica el DOM (60 fps); al soltar se guarda en porcentajes.
 */
export default function ManipuladorElemento({
  elemento,
  capa,
  seccionId,
  arrastrePendiente,
  alConfirmar,
  alCambiarBloque,
}: ManipuladorElementoProps) {
  const moveableRef = useRef<Moveable | null>(null)
  const [objetivo, setObjetivo] = useState<HTMLElement | null>(null)
  const [guias, setGuias] = useState<{ v: number[]; h: number[]; elementos: Element[] }>({ v: [], h: [], elementos: [] })

  useEffect(() => {
    const el = capa.querySelector<HTMLElement>(`[data-elemento-id="${elemento.id}"]`)
    setObjetivo(el)
    const ancho = capa.clientWidth
    const alto = capa.clientHeight
    setGuias({
      v: [0, ancho / 2, ancho],
      h: [0, alto / 2, alto],
      elementos: Array.from(capa.querySelectorAll('[data-elemento-id]')).filter((n) => n !== el),
    })
  }, [capa, elemento.id])

  // Si el usuario presionó con el mouse un elemento no seleccionado, continuar ese mismo gesto como arrastre
  useEffect(() => {
    const pendiente = arrastrePendiente.current
    if (!objetivo || !pendiente || !moveableRef.current) return
    arrastrePendiente.current = null
    if ((pendiente.buttons & 1) === 1) {
      moveableRef.current.dragStart(pendiente, objetivo)
    }
  }, [objetivo, arrastrePendiente])

  // Recalcular las asas cuando cambian propiedades que afectan la caja (desde paneles o deshacer)
  useEffect(() => {
    moveableRef.current?.updateRect()
  }, [elemento.x, elemento.y, elemento.ancho, elemento.alto, elemento.rotacion, elemento.texto, elemento.estiloTexto])

  if (!objetivo) return null

  const esTexto = elemento.tipo === 'texto'
  const mantenerProporcion = elemento.tipo === 'sticker' || elemento.tipo === 'icono'

  const confirmarCaja = (target: HTMLElement | SVGElement) => {
    const el = target as HTMLElement
    const anchoCapa = capa.clientWidth || 1
    const altoCapa = capa.clientHeight || 1
    const cambios: Partial<ElementoLienzo> = {
      x: redondear((el.offsetLeft / anchoCapa) * 100),
      y: redondear((el.offsetTop / altoCapa) * 100),
      ancho: redondear((el.offsetWidth / anchoCapa) * 100),
    }
    if (!esTexto) cambios.alto = redondear((el.offsetHeight / anchoCapa) * 100)

    // Dejar el DOM en porcentajes (lo que React volverá a renderizar)
    el.style.left = `${cambios.x}%`
    el.style.top = `${cambios.y}%`
    el.style.width = `${cambios.ancho}%`
    if (!esTexto) el.style.height = `${cambios.alto}cqw`
    alConfirmar(cambios)
  }

  /** Si el centro del elemento quedó sobre otro bloque, lo pasa a ese bloque. Devuelve true si lo pasó. */
  const pasarAOtroBloque = (target: HTMLElement | SVGElement): boolean => {
    const el = target as HTMLElement
    const caja = el.getBoundingClientRect()
    const destino = document
      .elementsFromPoint(caja.left + caja.width / 2, caja.top + caja.height / 2)
      .map((n) => (n as HTMLElement).closest?.('.seccion-lienzo[data-seccion-id]') as HTMLElement | null)
      .find((n) => n && n.dataset.seccionId !== seccionId)
    if (!destino?.dataset.seccionId) return false

    // Posición sin rotación (la de offsetLeft/Top) pasada a coordenadas del bloque de destino
    const origen = capa.getBoundingClientRect()
    const rect = destino.getBoundingClientRect()
    const izquierda = origen.left + el.offsetLeft - rect.left
    const arriba = origen.top + el.offsetTop - rect.top
    const cambios: Partial<ElementoLienzo> = {
      x: redondear((izquierda / rect.width) * 100),
      y: redondear((arriba / Math.max(rect.height, 1)) * 100),
      ancho: redondear((el.offsetWidth / rect.width) * 100),
    }
    if (!esTexto) cambios.alto = redondear((el.offsetHeight / rect.width) * 100)
    alCambiarBloque(destino.dataset.seccionId, cambios)
    return true
  }

  return (
    <Moveable
      ref={moveableRef}
      className="tarjeton-moveable"
      target={objetivo}
      origin={false}
      draggable
      resizable
      rotatable
      pinchable={['resizable', 'rotatable']}
      keepRatio={mantenerProporcion}
      renderDirections={esTexto ? ['w', 'e'] : ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
      rotationPosition="bottom"
      throttleDrag={0}
      throttleResize={0}
      throttleRotate={0}
      snapRotationDegrees={[0, 45, 90, 135, 180, 225, 270, 315]}
      snapRotationThreshold={4}
      snappable
      snapContainer={capa}
      snapThreshold={6}
      verticalGuidelines={guias.v}
      horizontalGuidelines={guias.h}
      elementGuidelines={guias.elementos}
      snapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
      elementSnapDirections={{ left: true, top: true, right: true, bottom: true, center: true, middle: true }}
      isDisplaySnapDigit={false}
      onDrag={({ target, left, top }) => {
        target.style.left = `${left}px`
        target.style.top = `${top}px`
      }}
      onDragEnd={({ target, isDrag }) => {
        if (!isDrag) return
        if (!pasarAOtroBloque(target)) confirmarCaja(target)
      }}
      onResize={({ target, width, height, drag }) => {
        target.style.width = `${width}px`
        if (!esTexto) target.style.height = `${height}px`
        target.style.left = `${drag.left}px`
        target.style.top = `${drag.top}px`
      }}
      onResizeEnd={({ target, isDrag }) => {
        if (isDrag) confirmarCaja(target)
      }}
      onRotate={({ target, transform }) => {
        target.style.transform = transform
      }}
      onRotateEnd={({ lastEvent }) => {
        if (!lastEvent) return
        let grados = Math.round(lastEvent.rotation) % 360
        if (grados < 0) grados += 360
        alConfirmar({ rotacion: grados })
      }}
    />
  )
}
