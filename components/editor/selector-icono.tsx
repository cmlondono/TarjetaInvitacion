'use client'

import { useState, useRef, useEffect } from 'react'
import { NombreIcono } from '@/types/invitation'
import { IconoDinamico, LISTA_ICONOS_DISPONIBLES } from '@/components/ui/icono-dinamico'
import { ChevronDown, Search } from 'lucide-react'

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
  const [busqueda, setBusqueda] = useState('')
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

  const iconosFiltrados = LISTA_ICONOS_DISPONIBLES.filter(
    (i) =>
      i.etiqueta.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.id.toLowerCase().includes(busqueda.toLowerCase())
  )

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
        <span className="truncate max-w-[100px]">{iconoSeleccionadoInfo.etiqueta.split('/')[0].trim()}</span>
        <ChevronDown size={12} className="opacity-50" />
      </button>

      {abierto && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-1 py-1 mb-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Biblioteca de Iconos</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {LISTA_ICONOS_DISPONIBLES.length} disponibles
            </span>
          </div>

          {/* Buscador de icono */}
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar: fiesta, copa, música, regalo..."
              className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-900"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-1">
            {iconosFiltrados.map((item) => {
              const seleccionado = item.id === iconoActual
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    alSeleccionar(item.id)
                    setAbierto(false)
                    setBusqueda('')
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    seleccionado
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  title={item.etiqueta}
                >
                  <IconoDinamico nombre={item.id} size={16} />
                  <span className="text-[8px] truncate w-full text-center leading-none">
                    {item.etiqueta.split('/')[0].trim()}
                  </span>
                </button>
              )
            })}
            {iconosFiltrados.length === 0 && (
              <div className="col-span-4 py-4 text-center text-xs text-slate-400">
                No se encontraron iconos
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
