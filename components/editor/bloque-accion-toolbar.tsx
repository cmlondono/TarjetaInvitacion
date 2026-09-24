'use client'

import React, { useState } from 'react'
import { TipoSeccion } from '@/types/invitation'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react'

interface BarraInsercionEntreBloquesProps {
  indice: number
  alInsertar: (indice: number, tipo: TipoSeccion) => void
}

export function BarraInsercionEntreBloques({
  indice,
  alInsertar,
}: BarraInsercionEntreBloquesProps) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="relative py-1.5 group/insert z-20">
      {/* Línea divisoria sutil que se activa en hover */}
      <div className="flex items-center justify-center relative">
        <div className="w-full h-px bg-amber-400/30 group-hover/insert:bg-amber-500/80 transition-all" />

        <button
          type="button"
          onClick={() => setAbierto(!abierto)}
          className="relative z-10 px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-amber-600 text-[10px] font-bold shadow-md flex items-center gap-1.5 transition-all transform scale-90 group-hover/insert:scale-100 cursor-pointer whitespace-nowrap"
          title="Insertar un nuevo bloque en esta posición"
        >
          <Plus size={12} className={abierto ? 'rotate-45 transition-transform' : 'transition-transform'} />
          <span>Añadir bloque aquí</span>
        </button>
      </div>

      {/* Menú emergente de selección de módulo tipo Notion */}
      {abierto && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 sm:w-80 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" /> Insertar en esta posición:
            </span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-0.5">
            {CATALOGO_SECCIONES.filter((c) => c.tipo !== 'cabecera' && c.tipo !== 'confirmacion_rsvp').map((cat) => (
              <button
                key={cat.tipo}
                type="button"
                onClick={() => {
                  alInsertar(indice, cat.tipo)
                  setAbierto(false)
                }}
                className="p-2 rounded-xl border border-slate-100 hover:border-slate-800 hover:bg-slate-50 text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors shrink-0">
                  <IconoDinamico nombre={cat.iconoDefecto} size={12} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                    {cat.nombre}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface BarraHerramientasBloqueProps {
  indice: number
  totalSecciones: number
  esCabecera?: boolean
  alMover: (direccion: 'arriba' | 'abajo') => void
  alEliminar: () => void
}

export function BarraHerramientasBloque({
  indice,
  totalSecciones,
  esCabecera = false,
  alMover,
  alEliminar,
}: BarraHerramientasBloqueProps) {
  return (
    <div className="absolute top-2 right-2 z-30 opacity-0 group-hover/seccion:opacity-100 transition-all flex items-center gap-1 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white px-2 py-1 rounded-lg shadow-xl border border-white/20 text-[10px]">
      {!esCabecera && indice > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            alMover('arriba')
          }}
          title="Mover sección arriba"
          className="p-1 hover:bg-white/20 rounded cursor-pointer transition-colors"
        >
          <ArrowUp size={12} />
        </button>
      )}

      {!esCabecera && indice < totalSecciones - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            alMover('abajo')
          }}
          title="Mover sección abajo"
          className="p-1 hover:bg-white/20 rounded cursor-pointer transition-colors"
        >
          <ArrowDown size={12} />
        </button>
      )}

      {!esCabecera && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            alEliminar()
          }}
          title="Eliminar este bloque"
          className="p-1 hover:bg-rose-600 rounded cursor-pointer transition-colors text-rose-300 hover:text-white"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}
