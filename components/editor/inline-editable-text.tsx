'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Pencil } from 'lucide-react'

interface InlineEditableTextProps {
  valor: string
  alGuardar: (nuevoValor: string) => void
  activo?: boolean
  multilinea?: boolean
  placeholder?: string
  etiqueta?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
  className?: string
  style?: React.CSSProperties
}

/**
 * Componente robusto de edición directa in-place.
 * Alterna entre vista tipográfica y un input/textarea nativo en 1 clic,
 * evitando caídas o congelamientos de reconciliación en React 19.
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
}: InlineEditableTextProps) {
  const [estaEditando, setEstaEditando] = useState(false)
  const [textoLocal, setTextoLocal] = useState(valor || '')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  // Sincronizar estado local si el valor exterior cambia
  useEffect(() => {
    setTextoLocal(valor || '')
  }, [valor])

  // Si no está en modo editor, renderizar texto estático normal
  if (!activo) {
    return (
      <Etiqueta className={className} style={style}>
        {valor || ''}
      </Etiqueta>
    )
  }

  const iniciarEdicion = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTextoLocal(valor || '')
    setEstaEditando(true)
  }

  const finalizarEdicion = () => {
    setEstaEditando(false)
    const limpio = textoLocal.trim()
    if (limpio !== (valor || '')) {
      alGuardar(limpio)
    }
  }

  const cancelarEdicion = () => {
    setTextoLocal(valor || '')
    setEstaEditando(false)
  }

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (!multilinea && e.key === 'Enter') {
      e.preventDefault()
      finalizarEdicion()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelarEdicion()
    }
  }

  // ── ESTADO EDITANDO (INPUT NATIVO CONTROLADO) ──
  if (estaEditando) {
    const clasesInput = `w-full bg-amber-50/90 text-slate-900 ring-2 ring-amber-400 rounded-lg px-2 py-1 outline-none transition-all shadow-inner text-center font-inherit ${className}`

    if (multilinea) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={textoLocal}
          onChange={(e) => setTextoLocal(e.target.value)}
          onBlur={finalizarEdicion}
          onKeyDown={manejarKeyDown}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          rows={3}
          className={clasesInput}
          style={style}
          placeholder={placeholder}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={textoLocal}
        onChange={(e) => setTextoLocal(e.target.value)}
        onBlur={finalizarEdicion}
        onKeyDown={manejarKeyDown}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        className={clasesInput}
        style={style}
        placeholder={placeholder}
      />
    )
  }

  // ── ESTADO REPOSO EN MODO EDICIÓN DIRECTA ──
  const esVacio = !valor || valor.trim() === ''

  return (
    <Etiqueta
      onClick={iniciarEdicion}
      title="Texto de ejemplo — Haz clic para escribir tu información real"
      className={`relative group/editable cursor-pointer transition-all rounded-lg px-1.5 py-0.5 inline-block max-w-full ${className} ${
        esVacio
          ? 'italic opacity-60 bg-amber-400/10 border border-dashed border-amber-400/50'
          : 'hover:ring-2 hover:ring-amber-400/70 hover:bg-amber-400/10'
      }`}
      style={style}
    >
      <span>{valor || placeholder}</span>
      <span className="inline-flex items-center ml-1.5 opacity-0 group-hover/editable:opacity-100 bg-slate-900 text-white text-[9px] font-sans font-bold px-1.5 py-0.5 rounded shadow-sm transition-opacity align-middle pointer-events-none select-none">
        <Pencil size={9} className="mr-0.5" />
        <span>Editar</span>
      </span>
    </Etiqueta>
  )
}
