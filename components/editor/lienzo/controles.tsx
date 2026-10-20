'use client'

import React, { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Drawer as Vaul } from 'vaul'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Pipette, X } from 'lucide-react'

/** Abre el selector de archivos del sistema y devuelve la imagen elegida */
export function seleccionarArchivoImagen(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    // Cualquier imagen: el navegador decide qué puede abrir (JPG, PNG, WebP, GIF, AVIF, BMP, SVG…)
    input.accept = 'image/*'
    input.onchange = () => resolve(input.files?.[0] || null)
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}

interface PanelHerramientaProps {
  id: string
  abierta: string | null
  alCambiar: (id: string | null) => void
  etiqueta: string
  icono: React.ReactNode
  esMovil: boolean
  activo?: boolean
  titulo?: string
  anchoEscritorio?: string
  children: React.ReactNode
}

/**
 * Botón de herramienta + panel de opciones.
 * En PC se abre como popover junto al botón; en el celular como hoja inferior que no tapa
 * la tarjeta (sin fondo oscuro), para ver el cambio en vivo mientras se ajusta.
 */
export function PanelHerramienta({
  id,
  abierta,
  alCambiar,
  etiqueta,
  icono,
  esMovil,
  activo = false,
  titulo,
  anchoEscritorio = 'w-72',
  children,
}: PanelHerramientaProps) {
  const estaAbierta = abierta === id

  const boton = (
    <button
      type="button"
      onClick={() => alCambiar(estaAbierta ? null : id)}
      className={
        esMovil
          ? `flex flex-col items-center justify-center gap-1 min-w-[62px] h-[58px] px-1.5 rounded-xl text-[10px] font-semibold shrink-0 transition-colors ${
              estaAbierta || activo ? 'bg-amber-100 text-amber-900' : 'text-slate-700 active:bg-slate-100'
            }`
          : `flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
              estaAbierta || activo ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
            }`
      }
      aria-expanded={estaAbierta}
    >
      {icono}
      <span className={esMovil ? 'leading-none whitespace-nowrap' : 'whitespace-nowrap'}>{etiqueta}</span>
    </button>
  )

  if (esMovil) {
    return (
      <>
        {boton}
        <Vaul.Root
          open={estaAbierta}
          onOpenChange={(abrir) => !abrir && alCambiar(null)}
          modal={false}
        >
          <Vaul.Portal>
            <Vaul.Content
              className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[52vh] flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.18)] outline-none"
              aria-describedby={undefined}
            >
              <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between px-4 pt-2 pb-1">
                <Vaul.Title className="text-sm font-bold text-slate-900">{titulo || etiqueta}</Vaul.Title>
                <button
                  type="button"
                  onClick={() => alCambiar(null)}
                  className="p-2 -mr-2 rounded-full text-slate-500 active:bg-slate-100"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">{children}</div>
            </Vaul.Content>
          </Vaul.Portal>
        </Vaul.Root>
      </>
    )
  }

  return (
    <Popover open={estaAbierta} onOpenChange={(abrir) => alCambiar(abrir ? id : null)}>
      <PopoverTrigger asChild>{boton}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={`${anchoEscritorio} max-h-[70vh] overflow-y-auto p-3 rounded-xl`}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {titulo && <p className="text-xs font-bold text-slate-900 mb-2">{titulo}</p>}
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface DeslizadorProps {
  etiqueta: string
  valor: number
  min: number
  max: number
  paso?: number
  unidad?: string
  alCambiar: (valor: number) => void
}

export function Deslizador({ etiqueta, valor, min, max, paso = 1, unidad = '', alCambiar }: DeslizadorProps) {
  const decimales = paso < 1 ? (paso < 0.1 ? 2 : 1) : 0
  return (
    <label className="block py-1.5">
      <span className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
        <span>{etiqueta}</span>
        <span className="font-mono text-slate-900 bg-slate-100 rounded px-1.5 py-0.5">
          {valor.toFixed(decimales)}
          {unidad}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => alCambiar(Number(e.target.value))}
        className="w-full h-2 accent-amber-500 cursor-pointer touch-pan-y"
      />
    </label>
  )
}

interface SelectorColorProps {
  valor?: string
  alCambiar: (color: string | undefined) => void
  coloresTema: string[]
  permitirQuitar?: boolean
  etiquetaQuitar?: string
}

const COLORES_BASE = ['#FFFFFF', '#F5F0E6', '#E8D5B7', '#D4AF37', '#B8860B', '#C08081', '#9F1239', '#1E3A8A', '#065F46', '#334155', '#111827', '#000000']

export function SelectorColor({
  valor,
  alCambiar,
  coloresTema,
  permitirQuitar = true,
  etiquetaQuitar = 'Usar el del tema',
}: SelectorColorProps) {
  const [hex, setHex] = useState(valor || '')
  useEffect(() => setHex(valor || ''), [valor])
  const soportaCuentagotas = typeof window !== 'undefined' && 'EyeDropper' in window

  const usarCuentagotas = async () => {
    try {
      const resultado = await new (window as any).EyeDropper().open()
      alCambiar(resultado.sRGBHex)
    } catch {}
  }

  const muestras = Array.from(new Set([...coloresTema.filter(Boolean), ...COLORES_BASE]))

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-8 gap-1.5">
        {muestras.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => alCambiar(c)}
            className={`aspect-square rounded-full border shadow-inner cursor-pointer transition-transform active:scale-90 ${
              valor?.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-amber-500 ring-offset-1' : 'border-slate-300'
            }`}
            style={{ backgroundColor: c }}
            title={c}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <HexColorPicker
        color={valor || '#000000'}
        onChange={(c) => alCambiar(c)}
        style={{ width: '100%', height: 140 }}
      />
      <div className="flex items-center gap-1.5">
        <input
          value={hex}
          onChange={(e) => {
            setHex(e.target.value)
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) alCambiar(e.target.value)
          }}
          placeholder="#000000"
          className="flex-1 min-w-0 h-8 px-2 rounded-lg border border-slate-300 font-mono text-xs uppercase"
        />
        {soportaCuentagotas && (
          <button
            type="button"
            onClick={usarCuentagotas}
            className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-100 cursor-pointer"
            title="Tomar un color de la pantalla"
          >
            <Pipette size={14} />
          </button>
        )}
      </div>
      {permitirQuitar && (
        <button
          type="button"
          onClick={() => alCambiar(undefined)}
          className="w-full h-8 rounded-lg border border-dashed border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
        >
          {etiquetaQuitar}
        </button>
      )}
    </div>
  )
}

interface OpcionGrupo<T extends string> {
  id: T
  etiqueta: React.ReactNode
  titulo?: string
}

export function GrupoOpciones<T extends string>({
  opciones,
  valor,
  alCambiar,
  columnas = 4,
}: {
  opciones: OpcionGrupo<T>[]
  valor?: T
  alCambiar: (id: T) => void
  columnas?: number
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
      {opciones.map((op) => (
        <button
          key={op.id}
          type="button"
          title={op.titulo}
          onClick={() => alCambiar(op.id)}
          className={`min-h-9 px-1.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
            valor === op.id
              ? 'border-amber-500 bg-amber-50 text-amber-900'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  )
}

export function Separador() {
  return <div className="h-px bg-slate-100 my-2" />
}
