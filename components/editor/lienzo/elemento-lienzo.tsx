'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { ElementoLienzo } from '@/types/invitation'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { StickerSvg } from '@/lib/editor/stickers'
import {
  ANCHO_REFERENCIA_LIENZO,
  atributosFuente,
  estadoInicialAnimacion,
  estiloMascara,
  estiloTextoACss,
  familiaFuente,
  filtroCss,
  transicionAnimacion,
  leerTextoEditable,
} from '@/lib/editor/estilos'

interface ElementoLienzoVistaProps {
  elemento: ElementoLienzo
  colorAcento: string
  fuenteCuerpo?: string
  esEdicion: boolean
  seleccionado: boolean
  editandoTexto: boolean
  indiceAnimacion: number
  alPresionar?: (e: React.PointerEvent<HTMLDivElement>) => void
  alDobleClick?: () => void
  alTerminarTexto?: (texto: string) => void
}

/**
 * Texto en arco (como en Canva). Se dibuja en SVG sobre el ancho de referencia del lienzo,
 * así la curva y el tamaño de letra escalan igual en cualquier pantalla.
 */
function TextoCurvo({ elemento, fuenteCuerpo }: { elemento: ElementoLienzo; fuenteCuerpo?: string }) {
  const estilo = elemento.estiloTexto || {}
  const curva = Math.max(-100, Math.min(100, estilo.curva || 0))
  const ancho = (ANCHO_REFERENCIA_LIENZO * elemento.ancho) / 100
  const letra = estilo.tamano ?? 18
  const flecha = Math.max(1, ((ancho / 2) * Math.abs(curva)) / 100)
  const radio = (ancho * ancho) / 4 / (2 * flecha) + flecha / 2
  const margen = letra * 0.35
  const alto = flecha + letra * 1.3 + margen
  const haciaArriba = curva > 0
  const yExtremos = haciaArriba ? flecha + letra + margen / 2 : letra + margen / 2
  const idCamino = `curva-${elemento.id}`
  const texto = (elemento.texto || '').replace(/\s*\n\s*/g, ' ')
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" style={{ display: 'block', overflow: 'visible' }} aria-label={texto}>
      <path id={idCamino} d={`M 0 ${yExtremos} A ${radio} ${radio} 0 0 ${haciaArriba ? 1 : 0} ${ancho} ${yExtremos}`} fill="none" />
      <text
        {...atributosFuente(estilo)}
        fill={estilo.color || 'currentColor'}
        fontSize={letra}
        fontWeight={estilo.peso}
        fontStyle={estilo.cursiva ? 'italic' : undefined}
        letterSpacing={estilo.interletrado ? estilo.interletrado * letra : undefined}
        stroke={estilo.contornoColor && estilo.contornoGrosor ? estilo.contornoColor : undefined}
        strokeWidth={estilo.contornoColor && estilo.contornoGrosor ? estilo.contornoGrosor * 2 : undefined}
        paintOrder="stroke"
        style={{ fontFamily: familiaFuente(estilo.fuente) || familiaFuente(fuenteCuerpo as any), textShadow: estiloTextoACss(estilo).textShadow }}
      >
        <textPath href={`#${idCamino}`} startOffset="50%" textAnchor="middle">
          {estilo.mayusculas ? texto.toUpperCase() : texto}
        </textPath>
      </text>
    </svg>
  )
}

function ContenidoForma({ elemento }: { elemento: ElementoLienzo }) {
  const relleno = elemento.colorRelleno ?? 'currentColor'
  const borde = elemento.colorBorde
  const grosor = elemento.grosorBorde ?? 0

  if (elemento.forma === 'linea') {
    return (
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full block overflow-visible">
        <line
          x1="0"
          y1="5"
          x2="100"
          y2="5"
          stroke={elemento.colorBorde || relleno}
          strokeWidth={Math.max(1, grosor || 2)}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  const clipPath =
    elemento.forma === 'triangulo'
      ? 'polygon(50% 0%, 100% 100%, 0% 100%)'
      : elemento.forma === 'rombo'
      ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
      : undefined

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: relleno,
        border: grosor && borde && !clipPath ? `${grosor}px solid ${borde}` : undefined,
        borderRadius: elemento.forma === 'circulo' ? '50%' : elemento.radio ? `${elemento.radio}%` : undefined,
        clipPath,
      }}
    />
  )
}

/**
 * Representa un elemento libre del lienzo. Se usa igual en el editor y en la invitación publicada,
 * por eso lo que el anfitrión diseña es exactamente lo que ve el invitado.
 */
export function ElementoLienzoVista({
  elemento,
  colorAcento,
  fuenteCuerpo,
  esEdicion,
  seleccionado,
  editandoTexto,
  indiceAnimacion,
  alPresionar,
  alDobleClick,
  alTerminarTexto,
}: ElementoLienzoVistaProps) {
  const refTexto = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editandoTexto || !refTexto.current) return
    const el = refTexto.current
    el.textContent = elemento.texto || ''
    el.focus({ preventScroll: true })
    const rango = document.createRange()
    rango.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(rango)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editandoTexto])

  if (elemento.oculto && !esEdicion) return null

  const esTexto = elemento.tipo === 'texto'
  const estiloPosicion: React.CSSProperties = {
    position: 'absolute',
    left: `${elemento.x}%`,
    top: `${elemento.y}%`,
    width: `${elemento.ancho}%`,
    height: esTexto ? 'auto' : `${elemento.alto ?? elemento.ancho}cqw`,
    transform: elemento.rotacion ? `rotate(${elemento.rotacion}deg)` : undefined,
    zIndex: elemento.z,
    opacity: elemento.oculto ? 0.25 : elemento.opacidad,
    pointerEvents: esEdicion ? 'auto' : 'none',
    touchAction: esEdicion && seleccionado ? 'none' : undefined,
  }

  const volteo =
    elemento.volteoH || elemento.volteoV
      ? `scale(${elemento.volteoH ? -1 : 1}, ${elemento.volteoV ? -1 : 1})`
      : undefined

  let contenido: React.ReactNode = null

  switch (elemento.tipo) {
    case 'texto': {
      const estiloTexto: React.CSSProperties = {
        fontSize: '4.5cqw',
        lineHeight: 1.25,
        fontFamily: familiaFuente(fuenteCuerpo as any),
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        textAlign: 'center',
        ...estiloTextoACss({ ...elemento.estiloTexto, colorFondo: undefined }, true),
      }
      contenido = editandoTexto ? (
        <div
          ref={refTexto}
          contentEditable="plaintext-only"
          suppressContentEditableWarning
          data-placeholder="Escribe aquí"
          className="texto-editando outline-none min-h-[1em]"
          style={estiloTexto}
          {...atributosFuente(elemento.estiloTexto)}
          onBlur={(e) => alTerminarTexto?.(leerTextoEditable(e.currentTarget))}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Escape') {
              e.currentTarget.textContent = elemento.texto || ''
              e.currentTarget.blur()
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
          }}
          onPointerDown={(e) => e.stopPropagation()}
        />
      ) : (
        elemento.estiloTexto?.curva && elemento.texto ? (
        <TextoCurvo elemento={elemento} fuenteCuerpo={fuenteCuerpo} />
      ) : (
        <div style={estiloTexto} {...atributosFuente(elemento.estiloTexto)}>
          <span
            style={
              elemento.estiloTexto?.colorFondo
                ? {
                    backgroundColor: elemento.estiloTexto.colorFondo,
                    padding: '0.1em 0.35em',
                    borderRadius: '0.25em',
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                  }
                : undefined
            }
          >
            {elemento.texto || (esEdicion ? 'Toca dos veces para escribir' : '')}
          </span>
        </div>
      )
      )
      break
    }
    case 'imagen': {
      const mascara = estiloMascara(elemento.mascara, elemento.radio)
      contenido = (
        <div
          className="w-full h-full overflow-hidden"
          style={{
            ...mascara,
            border: elemento.bordeAncho ? `${elemento.bordeAncho}px solid ${elemento.bordeColor || colorAcento}` : undefined,
            boxShadow: elemento.sombra ? '0 10px 30px rgba(0,0,0,0.28)' : undefined,
            backgroundColor: elemento.url ? undefined : 'rgba(148,163,184,0.25)',
          }}
        >
          {elemento.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={elemento.url}
              alt=""
              draggable={false}
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{ filter: filtroCss(elemento.filtro) }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[3cqw] text-slate-500 font-sans">
              Foto
            </div>
          )}
        </div>
      )
      break
    }
    case 'sticker':
      contenido = <StickerSvg id={elemento.stickerId} style={{ color: elemento.color || colorAcento }} />
      break
    case 'icono':
      contenido = (
        <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" style={{ color: elemento.color || colorAcento }}>
          <IconoDinamico nombre={elemento.icono} size={64} />
        </div>
      )
      break
    case 'forma':
      contenido = (
        <div className="w-full h-full" style={{ color: elemento.colorRelleno || colorAcento }}>
          <ContenidoForma elemento={{ ...elemento, colorRelleno: elemento.colorRelleno || colorAcento }} />
        </div>
      )
      break
  }

  const inicial = !esEdicion ? estadoInicialAnimacion(elemento.animacion) : null
  const cuerpo = <div style={{ width: '100%', height: '100%', transform: volteo }}>{contenido}</div>

  return (
    <div
      data-elemento-id={elemento.id}
      data-seleccionado={esEdicion && seleccionado ? '' : undefined}
      aria-selected={esEdicion ? seleccionado : undefined}
      className={esEdicion ? `elemento-lienzo-editable ${elemento.bloqueado ? 'cursor-default' : 'cursor-move'}` : undefined}
      style={estiloPosicion}
      onPointerDown={esEdicion ? alPresionar : undefined}
      onDoubleClick={
        esEdicion
          ? (e) => {
              e.stopPropagation()
              alDobleClick?.()
            }
          : undefined
      }
      onClick={esEdicion ? (e) => e.stopPropagation() : undefined}
    >
      {inicial ? (
        <motion.div
          className="w-full h-full"
          initial={inicial}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={transicionAnimacion(elemento.animacion, Math.min(indiceAnimacion * 0.08, 0.6))}
        >
          {cuerpo}
        </motion.div>
      ) : (
        cuerpo
      )}
      {esEdicion && elemento.bloqueado && seleccionado && (
        <span className="absolute -top-5 left-0 text-[9px] font-sans font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">
          🔒 Bloqueado
        </span>
      )}
    </div>
  )
}
