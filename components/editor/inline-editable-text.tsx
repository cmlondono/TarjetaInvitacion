'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useEditorLienzo, useSeccionActual } from './lienzo/contexto-editor'
import { atributosFuente, estiloTextoACss, leerTextoEditable } from '@/lib/editor/estilos'

interface InlineEditableTextProps {
  valor: string
  alGuardar: (nuevoValor: string) => void
  activo?: boolean
  multilinea?: boolean
  placeholder?: string
  etiqueta?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  className?: string
  style?: React.CSSProperties
  /** Clave del campo: permite guardar un estilo individual (fuente, tamaño, color...) para este texto */
  campo?: string
  /** Texto calculado (fecha, contador): se mueve y se le da estilo, pero no se escribe encima */
  soloEstilo?: boolean
  /** Contenido propio en lugar del texto (p. ej. las cajas de la cuenta regresiva) */
  children?: React.ReactNode
}

/** Coloca el texto plano del portapapeles sin formato externo */
function pegarComoTextoPlano(e: React.ClipboardEvent) {
  e.preventDefault()
  const texto = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, texto)
}

function seleccionarContenido(el: HTMLElement) {
  const rango = document.createRange()
  rango.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(rango)
}

/**
 * Texto editable directamente sobre la tarjeta (WYSIWYG).
 * - Un toque lo selecciona y muestra la barra de estilo (fuente, tamaño, color...).
 * - Un segundo toque o doble clic permite escribir sobre el propio texto, con su tipografía real.
 * - Su estilo individual se guarda en la sección (`estilosTexto[campo]`) y se ve igual en la invitación publicada.
 * - Seleccionado, se arrastra a cualquier parte del bloque (con mouse, también sin seleccionar antes).
 * - Si el anfitrión lo quita (`oculto`), el invitado no lo ve; en el editor queda tenue para poder mostrarlo otra vez.
 */
export function InlineEditableText({
  valor,
  alGuardar,
  activo = false,
  multilinea = false,
  placeholder = 'Escribe aquí...',
  etiqueta: Etiqueta = 'p',
  className = '',
  style,
  campo,
  soloEstilo = false,
  children,
}: InlineEditableTextProps) {
  const editor = useEditorLienzo()
  const seccion = useSeccionActual()
  const ref = useRef<HTMLElement | null>(null)
  const [edicionLocal, setEdicionLocal] = useState(false)
  // Arrastre en curso: desplazamiento provisional (en % del ancho del bloque) hasta soltar
  const [desplazamiento, setDesplazamiento] = useState<{ x: number; y: number } | null>(null)
  const arrastre = useRef<{ px: number; py: number; x0: number; y0: number; ancho: number; movido: boolean } | null>(null)
  const ignorarClick = useRef(false)

  const estiloPropio = campo ? seccion?.estilosTexto?.[campo] : undefined
  const estiloFinal: React.CSSProperties = {
    ...style,
    ...estiloTextoACss(estiloPropio),
    ...(multilinea ? { whiteSpace: 'pre-line' } : {}),
    ...(desplazamiento ? { translate: `${desplazamiento.x}cqw ${desplazamiento.y}cqw` } : {}),
  }
  const atributos = atributosFuente(estiloPropio)

  const claveTexto = seccion && campo ? `${seccion.id}:${campo}` : null
  const usaSeleccion = Boolean(claveTexto && editor.esEdicion)
  const estaEditando = !soloEstilo && (usaSeleccion ? editor.textoEnEdicion === claveTexto : edicionLocal)
  const estaSeleccionado =
    usaSeleccion &&
    editor.seleccion?.tipo === 'texto' &&
    editor.seleccion.seccionId === seccion?.id &&
    editor.seleccion.campo === campo

  // Al entrar en edición: cargar el texto actual, enfocar y seleccionar todo
  useEffect(() => {
    if (!estaEditando || !ref.current) return
    const el = ref.current
    el.textContent = valor || ''
    el.focus({ preventScroll: true })
    seleccionarContenido(el)
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaEditando])

  if (!activo) {
    if (estiloPropio?.oculto) return null
    return (
      <Etiqueta className={className} style={estiloFinal} {...atributos}>
        {children ?? (valor || '')}
      </Etiqueta>
    )
  }

  const iniciarEdicion = () => {
    if (usaSeleccion && claveTexto) {
      editor.seleccionar({ tipo: 'texto', seccionId: seccion!.id, campo: campo! })
      editor.setTextoEnEdicion(claveTexto)
    } else {
      setEdicionLocal(true)
    }
  }

  const terminarEdicion = (guardar: boolean) => {
    const el = ref.current
    const nuevo = el ? leerTextoEditable(el).trim() : ''
    if (usaSeleccion) {
      if (editor.textoEnEdicion === claveTexto) editor.setTextoEnEdicion(null)
    } else {
      setEdicionLocal(false)
    }
    if (guardar && nuevo !== (valor || '')) {
      alGuardar(nuevo)
    }
  }

  // Los textos de listas (momentos del itinerario) comparten estilo entre sí: no se mueven uno por uno
  const sePuedeMover = usaSeleccion && Boolean(campo) && !campo!.includes('.')

  const iniciarArrastre = (e: React.PointerEvent<HTMLElement>) => {
    if (!sePuedeMover || estaEditando || (!estaSeleccionado && e.pointerType !== 'mouse')) return
    const bloque = e.currentTarget.closest('.seccion-lienzo') as HTMLElement | null
    arrastre.current = { px: e.clientX, py: e.clientY, x0: estiloPropio?.x ?? 0, y0: estiloPropio?.y ?? 0, ancho: bloque?.getBoundingClientRect().width || 400, movido: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const moverArrastre = (e: React.PointerEvent<HTMLElement>) => {
    const a = arrastre.current
    if (!a) return
    const dx = e.clientX - a.px
    const dy = e.clientY - a.py
    if (!a.movido && Math.hypot(dx, dy) < 5) return
    if (!a.movido) {
      a.movido = true
      if (!estaSeleccionado) editor.seleccionar({ tipo: 'texto', seccionId: seccion!.id, campo: campo! })
    }
    setDesplazamiento({ x: a.x0 + (dx / a.ancho) * 100, y: a.y0 + (dy / a.ancho) * 100 })
  }

  const terminarArrastre = () => {
    const a = arrastre.current
    arrastre.current = null
    if (!a?.movido || !desplazamiento) return
    ignorarClick.current = true
    editor.actualizarEstiloTexto(seccion!.id, campo!, { x: Math.round(desplazamiento.x * 10) / 10, y: Math.round(desplazamiento.y * 10) / 10 })
    setDesplazamiento(null)
  }

  const manejarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (ignorarClick.current) {
      ignorarClick.current = false
      return
    }
    if (estaEditando) return
    if (!usaSeleccion || estaSeleccionado) {
      if (!soloEstilo) iniciarEdicion()
    } else {
      editor.seleccionar({ tipo: 'texto', seccionId: seccion!.id, campo: campo! })
    }
  }

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (ref.current) ref.current.textContent = valor || ''
      terminarEdicion(false)
      ref.current?.blur()
    } else if (e.key === 'Enter' && (!multilinea || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      ref.current?.blur()
    }
    e.stopPropagation()
  }

  if (estaEditando) {
    return (
      <Etiqueta
        ref={ref as any}
        data-texto-clave={claveTexto || undefined}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onBlur={() => terminarEdicion(true)}
        onKeyDown={manejarKeyDown}
        onPaste={pegarComoTextoPlano}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
        className={`texto-editando relative inline-block max-w-full min-w-[2ch] px-1.5 py-0.5 ${className}`}
        style={estiloFinal}
        {...atributos}
      />
    )
  }

  const esVacio = !valor || valor.trim() === ''

  return (
    <Etiqueta
      data-texto-clave={claveTexto || undefined}
      onClick={manejarClick}
      onPointerDown={iniciarArrastre}
      onPointerMove={moverArrastre}
      onPointerUp={terminarArrastre}
      onPointerCancel={() => {
        arrastre.current = null
        setDesplazamiento(null)
      }}
      data-solo-estilo={soloEstilo ? '' : undefined}
      onDoubleClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        if (!soloEstilo) iniciarEdicion()
      }}
      title={estiloPropio?.oculto ? 'Texto quitado: el invitado no lo ve. Selecciónalo y toca «Mostrar»' : soloEstilo ? 'Arrastra para moverlo y dale estilo (se cambia desde el panel)' : estaSeleccionado ? 'Arrastra para moverlo · toca de nuevo para escribir' : 'Toca para seleccionar, moverlo y darle estilo'}
      className={`relative group/editable cursor-pointer transition-all rounded-lg px-1.5 py-0.5 inline-block max-w-full ${className} ${
        estaSeleccionado
          ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent'
          : esVacio
          ? 'italic opacity-60 bg-amber-400/10 border border-dashed border-amber-400/50'
          : 'hover:ring-2 hover:ring-amber-400/70 hover:bg-amber-400/10'
      }`}
      style={{
        ...estiloFinal,
        ...(estiloPropio?.oculto ? { opacity: 0.3, textDecoration: 'line-through' } : {}),
        ...(estaSeleccionado && sePuedeMover ? { touchAction: 'none', cursor: 'move' } : {}),
      }}
      {...atributos}
    >
      {children ?? (valor || placeholder)}
    </Etiqueta>
  )
}
