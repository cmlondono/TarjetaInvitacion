'use client'

import React, { useRef, useState } from 'react'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import type { FotoFondo } from '@/types/invitation'
import { seleccionarArchivoImagen } from '@/components/editor/lienzo/controles'
import { CapaFotoFondo, OPACIDAD_FOTO_POR_DEFECTO } from '@/components/invitacion/foto-fondo'
import { subirImagen } from '@/lib/image-compression'

/**
 * Controles del editor con la paleta del sistema Tarjetón:
 * slate-900 como principal, slate-100/200 en superficies y bordes, ámbar para selección.
 */

export const claseInput =
  'w-full min-h-11 px-3 rounded-xl border border-slate-300 bg-white text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400'

export function Campo({
  etiqueta,
  valor,
  alCambiar,
  placeholder,
  tipo = 'text',
  ayuda,
  maximo,
}: {
  etiqueta: string
  valor: string | number | undefined
  alCambiar: (v: string) => void
  placeholder?: string
  tipo?: 'text' | 'url' | 'tel' | 'number' | 'date' | 'time'
  ayuda?: string
  maximo?: number
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
      {etiqueta}
      <input
        type={tipo}
        value={valor ?? ''}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={placeholder}
        maxLength={maximo}
        inputMode={tipo === 'number' ? 'numeric' : undefined}
        className={claseInput}
      />
      {ayuda && <span className="text-[12px] font-normal text-slate-500">{ayuda}</span>}
    </label>
  )
}

export function AreaTexto({
  etiqueta,
  valor,
  alCambiar,
  placeholder,
  filas = 3,
}: {
  etiqueta: string
  valor: string | undefined
  alCambiar: (v: string) => void
  placeholder?: string
  filas?: number
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
      {etiqueta}
      <textarea
        value={valor ?? ''}
        onChange={(e) => alCambiar(e.target.value)}
        placeholder={placeholder}
        rows={filas}
        className={`${claseInput} py-2.5 resize-y`}
      />
    </label>
  )
}

export function Interruptor({
  etiqueta,
  descripcion,
  activo,
  alCambiar,
}: {
  etiqueta: string
  descripcion?: string
  activo: boolean
  alCambiar: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-slate-900">{etiqueta}</span>
        {descripcion && <span className="text-[12px] text-slate-500">{descripcion}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={etiqueta}
        onClick={() => alCambiar(!activo)}
        className={`shrink-0 w-11 h-6.5 rounded-full p-0.5 flex transition-colors cursor-pointer ${activo ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'}`}
      >
        <span className="w-5.5 h-5.5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  )
}

export function Segmentos<T extends string>({
  opciones,
  valor,
  alCambiar,
  etiqueta,
}: {
  opciones: { id: T; nombre: string }[]
  valor: T | undefined
  alCambiar: (v: T) => void
  etiqueta?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {etiqueta && <span className="text-[13px] font-semibold text-slate-700">{etiqueta}</span>}
      <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={valor === o.id}
            onClick={() => alCambiar(o.id)}
            className={`min-h-10 px-3.5 rounded-xl text-[13px] font-semibold border transition-colors cursor-pointer ${
              valor === o.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            {o.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TituloGrupo({ children }: { children: React.ReactNode }) {
  return <h3 className="m-0 text-[12px] font-bold uppercase tracking-wider text-slate-500">{children}</h3>
}

/** Etiqueta de función Premium (se puede usar sin pagar; para publicar la invitación hay que activar Premium) */
export function InsigniaPremium({ className = '' }: { className?: string }) {
  return (
    <span title="Función Premium" className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wider align-middle ${className}`}>
      ★ Premium
    </span>
  )
}

/** Sube una foto a la nube (Supabase Storage) y devuelve su URL */
export function SubirFoto({
  url,
  alCambiar,
  carpeta,
  etiqueta = 'Foto',
  forma = 'rect',
}: {
  url?: string
  alCambiar: (url: string | undefined) => void
  carpeta: string
  etiqueta?: string
  forma?: 'rect' | 'circulo'
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const elegir = async () => {
    const archivo = await seleccionarArchivoImagen()
    if (!archivo) return
    setSubiendo(true)
    setError(null)
    try {
      alCambiar(await subirImagen(archivo, carpeta))
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-slate-700">{etiqueta}</span>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={`w-16 h-16 object-cover border border-slate-200 ${forma === 'circulo' ? 'rounded-full' : 'rounded-xl'}`} />
        ) : (
          <span className={`w-16 h-16 bg-slate-100 border border-dashed border-slate-300 ${forma === 'circulo' ? 'rounded-full' : 'rounded-xl'}`} />
        )}
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={elegir} disabled={subiendo} className="min-h-10 px-3.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            {subiendo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {subiendo ? 'Subiendo…' : url ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {url && (
            <button type="button" onClick={() => alCambiar(undefined)} className="text-[12px] font-semibold text-rose-600 text-left cursor-pointer">
              Quitar foto
            </button>
          )}
        </div>
      </div>
      {error && <span className="text-[12px] text-rose-600">{error}</span>}
    </div>
  )
}

function Deslizador({ etiqueta, valor, min, max, unidad, alCambiar }: { etiqueta: string; valor: number; min: number; max: number; unidad: string; alCambiar: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate-700">
      <span className="flex items-center justify-between">
        {etiqueta}
        <span className="text-[12px] font-normal text-slate-500 tabular-nums">
          {Math.round(valor)}
          {unidad}
        </span>
      </span>
      <input type="range" min={min} max={max} value={valor} onChange={(e) => alCambiar(Number(e.target.value))} className="accent-amber-500 cursor-pointer" />
    </label>
  )
}

/**
 * Foto de fondo acomodable (invitación o apertura): se sube a la nube, se arrastra para elegir
 * qué parte se ve y se ajustan opacidad, zoom y desenfoque. La vista previa usa el color de fondo real.
 * `continuo` = cambio que llega mientras se arrastra (se agrupa en un solo paso de deshacer).
 */
export function EditorFotoFondo({
  foto,
  alCambiar,
  carpeta,
  colorFondo,
  etiqueta,
  ayuda,
}: {
  foto?: FotoFondo
  alCambiar: (foto: FotoFondo | undefined, continuo?: boolean) => void
  carpeta: string
  colorFondo: string
  etiqueta: string
  ayuda?: string
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const arrastre = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null)
  const caja = useRef<HTMLDivElement | null>(null)

  const elegir = async () => {
    const archivo = await seleccionarArchivoImagen()
    if (!archivo) return
    setSubiendo(true)
    setError(null)
    try {
      const url = await subirImagen(archivo, carpeta)
      alCambiar({ opacidad: OPACIDAD_FOTO_POR_DEFECTO, x: 50, y: 50, zoom: 100, ...foto, url })
    } catch {
      setError('No se pudo subir la foto. Intenta de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  const cambiar = (cambios: Partial<FotoFondo>, continuo = true) => foto && alCambiar({ ...foto, ...cambios }, continuo)

  // Arrastrar la foto mueve el punto que queda centrado (como acomodar una foto en un marco)
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    const inicio = arrastre.current
    const rect = caja.current?.getBoundingClientRect()
    if (!inicio || !rect || !foto) return
    const sensibilidad = 100 / Math.max(1, (foto.zoom ?? 100) / 100)
    const x = Math.min(100, Math.max(0, inicio.fx - ((e.clientX - inicio.x) / rect.width) * sensibilidad))
    const y = Math.min(100, Math.max(0, inicio.fy - ((e.clientY - inicio.y) / rect.height) * sensibilidad))
    cambiar({ x: Math.round(x), y: Math.round(y) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-slate-900">{etiqueta}</span>
        {ayuda && <span className="text-[12px] text-slate-500">{ayuda}</span>}
      </div>
      {foto?.url ? (
        <>
          <div className="flex gap-3">
            <div
              ref={caja}
              role="img"
              aria-label="Vista previa: arrastra para acomodar la foto"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                arrastre.current = { x: e.clientX, y: e.clientY, fx: foto.x ?? 50, fy: foto.y ?? 50 }
              }}
              onPointerMove={mover}
              onPointerUp={() => (arrastre.current = null)}
              onPointerCancel={() => (arrastre.current = null)}
              className="relative w-[104px] h-[184px] shrink-0 rounded-xl overflow-hidden border border-slate-300 cursor-grab active:cursor-grabbing touch-none select-none"
              style={{ backgroundColor: colorFondo }}
            >
              <CapaFotoFondo foto={foto} />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-[12px] text-slate-500 leading-snug">Arrastra la foto para elegir qué parte se ve.</span>
              <button type="button" onClick={elegir} disabled={subiendo} className="min-h-10 px-3 rounded-xl border border-slate-300 text-[13px] font-bold text-slate-800 flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer hover:bg-slate-50">
                {subiendo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {subiendo ? 'Subiendo…' : 'Cambiar foto'}
              </button>
              <button type="button" onClick={() => cambiar({ x: 50, y: 50, zoom: 100 }, false)} className="min-h-9 px-3 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                Centrar
              </button>
              <button type="button" onClick={() => alCambiar(undefined)} className="min-h-9 px-3 rounded-xl text-[12px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer">
                Quitar foto
              </button>
            </div>
          </div>
          <Deslizador etiqueta="Opacidad" valor={Math.round((foto.opacidad ?? OPACIDAD_FOTO_POR_DEFECTO) * 100)} min={5} max={100} unidad="%" alCambiar={(v) => cambiar({ opacidad: v / 100 })} />
          <Deslizador etiqueta="Zoom" valor={foto.zoom ?? 100} min={100} max={300} unidad="%" alCambiar={(v) => cambiar({ zoom: v })} />
          <Deslizador etiqueta="Desenfoque" valor={foto.desenfoque ?? 0} min={0} max={12} unidad=" px" alCambiar={(v) => cambiar({ desenfoque: v || undefined })} />
        </>
      ) : (
        <button type="button" onClick={elegir} disabled={subiendo} className="min-h-11 rounded-xl border border-dashed border-slate-400 text-[14px] font-bold text-slate-800 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer hover:bg-slate-50">
          {subiendo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {subiendo ? 'Subiendo…' : 'Poner una foto'}
        </button>
      )}
      {error && <span className="text-[12px] text-rose-600">{error}</span>}
    </div>
  )
}

/** Editor de listas (momentos, padrinos, regalos, hoteles, opciones) */
export function EditorLista<T extends { id: string }>({
  etiqueta,
  items,
  alCambiar,
  crear,
  render,
  textoAgregar,
  maximo = 30,
}: {
  etiqueta: string
  items: T[]
  alCambiar: (items: T[]) => void
  crear: () => T
  render: (item: T, actualizar: (cambios: Partial<T>) => void) => React.ReactNode
  textoAgregar: string
  maximo?: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-slate-700">{etiqueta}</span>
      {items.map((item, i) => (
        <div key={item.id} className="relative flex flex-col gap-2 p-3 pr-11 rounded-xl border border-slate-200 bg-slate-50">
          {render(item, (cambios) => alCambiar(items.map((x, j) => (j === i ? { ...x, ...cambios } : x))))}
          <button
            type="button"
            aria-label="Quitar"
            onClick={() => alCambiar(items.filter((_, j) => j !== i))}
            className="absolute top-2 right-2 w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      {items.length < maximo && (
        <button
          type="button"
          onClick={() => alCambiar([...items, crear()])}
          className="min-h-10 rounded-xl border border-dashed border-slate-300 text-[13px] font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={15} /> {textoAgregar}
        </button>
      )}
    </div>
  )
}

export function idCorto(prefijo: string) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
}

/** Selector de fecha y hora del evento (actualiza fechaEvento y horaEvento) */
export function CampoFechaHora({
  fechaIso,
  alCambiar,
}: {
  fechaIso: string
  alCambiar: (fechaIso: string, horaTexto: string) => void
}) {
  const [fecha, hora] = (fechaIso || '').split('T')
  const hhmm = (hora || '18:00').slice(0, 5)
  const formatear = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    const sufijo = hh >= 12 ? 'p. m.' : 'a. m.'
    return `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm || 0).padStart(2, '0')} ${sufijo}`
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <Campo etiqueta="Fecha" tipo="date" valor={fecha} alCambiar={(v) => v && alCambiar(`${v}T${hhmm}:00`, formatear(hhmm))} />
      <Campo etiqueta="Hora" tipo="time" valor={hhmm} alCambiar={(v) => v && alCambiar(`${fecha}T${v}:00`, formatear(v))} />
    </div>
  )
}

export function BotonCerrar({ alCerrar }: { alCerrar: () => void }) {
  return (
    <button type="button" onClick={alCerrar} aria-label="Cerrar" className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
      <X size={18} />
    </button>
  )
}
