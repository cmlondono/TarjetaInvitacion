'use client'

import { useState, useRef, useEffect } from 'react'
import { NombreIcono } from '@/types/invitation'
import { IconoDinamico, LISTA_ICONOS_DISPONIBLES } from '@/components/ui/icono-dinamico'
import { ChevronDown, Sparkles } from 'lucide-react'

interface SelectorIconoProps {
  iconoActual?: NombreIcono
  alSeleccionar: (icono: NombreIcono) => void
  etiqueta?: string
}

export function SelectorIcono({
  iconoActual = 'sparkles',
  alSeleccionar,
  etiqueta = 'Icono',
}: SelectorIconoProps) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [abierto])

  const iconoSeleccionadoInfo =
    LISTA_ICONOS_DISPONIBLES.find((i) => i.id === iconoActual) || LISTA_ICONOS_DISPONIBLES[0]

  return (
    <div className="relative inline-block" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
        title="Cambiar icono de la sección"
      >
        <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-700">
          <IconoDinamico nombre={iconoActual} size={13} />
        </div>
        <span className="truncate max-w-[90px]">{iconoSeleccionadoInfo.etiqueta}</span>
        <ChevronDown size={12} className="opacity-50" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 p-2 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Seleccionar Icono</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {LISTA_ICONOS_DISPONIBLES.length} disponibles
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1">
            {LISTA_ICONOS_DISPONIBLES.map((item) => {
              const seleccionado = item.id === iconoActual
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    alSeleccionar(item.id)
                    setAbierto(false)
                  }}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    seleccionado
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title={item.etiqueta}
                >
                  <IconoDinamico nombre={item.id} size={15} />
                  <span className="text-[9px] truncate w-full text-center leading-none">
                    {item.etiqueta.split('/')[0].trim()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
