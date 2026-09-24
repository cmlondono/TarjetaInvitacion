'use client'

import React, { useState } from 'react'
import { ConfiguracionVisual } from '@/types/invitation'
import { Check, Pipette } from 'lucide-react'

// Matriz de colores organizada por columnas de gamas cromáticas y filas de tonos (desde el más claro al más oscuro)
const MATRIZ_TONOS: { gama: string; tonos: string[] }[] = [
  {
    gama: 'Neutros & Carbón',
    tonos: ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#94A3B8', '#475569', '#1E293B', '#0F172A'],
  },
  {
    gama: 'Dorados & Arena',
    tonos: ['#FFFBEB', '#FEF08A', '#FACC15', '#EAB308', '#CA8A04', '#A16207', '#713F12'],
  },
  {
    gama: 'Terracota & Cálidos',
    tonos: ['#FFF7ED', '#FFEDD5', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#7C2D12'],
  },
  {
    gama: 'Rosas & Rubor',
    tonos: ['#FFF1F2', '#FFE4E6', '#FDA4AF', '#FB7185', '#F43F5E', '#BE123C', '#881337'],
  },
  {
    gama: 'Vinos & Ciruela',
    tonos: ['#FDF2F8', '#FCE7F3', '#F472B6', '#DB2777', '#BE185D', '#831843', '#500724'],
  },
  {
    gama: 'Púrpuras & Lavanda',
    tonos: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#A855F7', '#7E22CE', '#581C87', '#3B0764'],
  },
  {
    gama: 'Azules & Marina',
    tonos: ['#F0F9FF', '#BAE6FD', '#60A5FA', '#3B82F6', '#1D4ED8', '#1E3A8A', '#0F172A'],
  },
  {
    gama: 'Verdes & Salvia',
    tonos: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E', '#16A34A', '#15803D', '#14532D'],
  },
  {
    gama: 'Olivo & Tierra',
    tonos: ['#F7FEE7', '#ECFCCB', '#BEF264', '#84CC16', '#4D7C0F', '#3F6212', '#1A2E05'],
  },
]

// Armonías completas en 1 clic (muy discretas y sobrias)
const PALETAS_MINIMALISTAS = [
  {
    nombre: 'Minimal Monocromo',
    fondo: '#F8FAFC',
    tarjeta: '#FFFFFF',
    primario: '#0F172A',
    secundario: '#64748B',
    texto: '#0F172A',
  },
  {
    nombre: 'Oro Ceremonial',
    fondo: '#FAF8F5',
    tarjeta: '#FFFFFF',
    primario: '#1E293B',
    secundario: '#D4AF37',
    texto: '#0F172A',
  },
  {
    nombre: 'Salvia & Eucalipto',
    fondo: '#F2F7F4',
    tarjeta: '#FFFFFF',
    primario: '#166534',
    secundario: '#15803D',
    texto: '#14532D',
  },
  {
    nombre: 'Rosa Nupcial',
    fondo: '#FFF8F8',
    tarjeta: '#FFFFFF',
    primario: '#9F1239',
    secundario: '#FB7185',
    texto: '#4C0519',
  },
  {
    nombre: 'Medianoche Real',
    fondo: '#0F172A',
    tarjeta: '#1E293B',
    primario: '#FACC15',
    secundario: '#94A3B8',
    texto: '#F8FAFC',
  },
]

type ElementoEditable = 'colorTarjeta' | 'colorFondo' | 'colorPrimario' | 'colorSecundario' | 'colorTexto'

interface SelectorColorTonalProps {
  visual: ConfiguracionVisual
  alActualizarVisual: (campo: keyof ConfiguracionVisual, valor: any) => void
  className?: string
}

export function SelectorColorTonal({
  visual,
  alActualizarVisual,
  className = '',
}: SelectorColorTonalProps) {
  const [elementoActivo, setElementoActivo] = useState<ElementoEditable>('colorTarjeta')

  const elementos: { id: ElementoEditable; label: string; desc: string }[] = [
    { id: 'colorTarjeta', label: 'Tarjeta', desc: 'Fondo del tarjetón' },
    { id: 'colorFondo', label: 'Fondo Pantalla', desc: 'Fondo exterior general' },
    { id: 'colorPrimario', label: 'Botón Principal', desc: 'Color de botones y títulos clave' },
    { id: 'colorSecundario', label: 'Detalles & Bordes', desc: 'Ribetes, iconos y divisores' },
    { id: 'colorTexto', label: 'Texto', desc: 'Tipografía y cuerpo de texto' },
  ]

  const colorActual = visual[elementoActivo] || '#FFFFFF'

  const seleccionarColor = (nuevoColor: string) => {
    alActualizarVisual(elementoActivo, nuevoColor)
  }

  const aplicarPaletaCompleta = (p: (typeof PALETAS_MINIMALISTAS)[0]) => {
    alActualizarVisual('colorFondo', p.fondo)
    alActualizarVisual('colorTarjeta', p.tarjeta)
    alActualizarVisual('colorPrimario', p.primario)
    alActualizarVisual('colorSecundario', p.secundario)
    alActualizarVisual('colorTexto', p.texto)
  }

  return (
    <div className={`space-y-4 bg-white ${className}`}>
      {/* ── 1. SELECTOR DEL ELEMENTO A COLOREAR (MINIMALISTA) ── */}
      <div>
        <label className="text-[11px] font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
          Selecciona qué elemento pintar:
        </label>
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {elementos.map((elem) => {
            const activo = elementoActivo === elem.id
            const color = visual[elem.id] || '#FFFFFF'
            return (
              <button
                key={elem.id}
                type="button"
                onClick={() => setElementoActivo(elem.id)}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activo
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title={elem.desc}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{elem.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. MATRIZ DE TONOS (CUADRÍCULA DE COLORES ORGANIZADA) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Tonos & Escalas
          </span>
          <span className="text-[10px] text-slate-400">
            Toca arriba para tonos claros, abajo para profundos
          </span>
        </div>

        {/* Cuadrícula de cuadros de color */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div className="grid grid-cols-9 gap-1.5">
            {MATRIZ_TONOS.map((columna) => (
              <div key={columna.gama} className="flex flex-col gap-1.5">
                {columna.tonos.map((tono) => {
                  const estaSeleccionado =
                    colorActual.toUpperCase() === tono.toUpperCase()

                  return (
                    <button
                      key={tono}
                      type="button"
                      onClick={() => seleccionarColor(tono)}
                      title={`${columna.gama}: ${tono}`}
                      className={`w-full aspect-square rounded-md border transition-all cursor-pointer relative flex items-center justify-center ${
                        estaSeleccionado
                          ? 'border-slate-900 scale-110 shadow-md ring-2 ring-slate-900/30 z-10'
                          : 'border-black/10 hover:scale-105 hover:border-black/30'
                      }`}
                      style={{ backgroundColor: tono }}
                    >
                      {estaSeleccionado && (
                        <Check
                          size={12}
                          className={
                            // Color del check según luminosidad
                            ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#FFFBEB', '#FEF08A', '#FFF7ED', '#FFEDD5', '#FFF1F2', '#FFE4E6', '#FDF2F8', '#FAF5FF', '#F0F9FF', '#F0FDF4', '#DCFCE7', '#F7FEE7', '#ECFCCB'].includes(
                              tono.toUpperCase()
                            )
                              ? 'text-slate-900 drop-shadow-xs'
                              : 'text-white drop-shadow-xs'
                          }
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. COLOR PERSONALIZADO A MEDIDA ── */}
      <div className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="color"
              value={colorActual}
              onChange={(e) => seleccionarColor(e.target.value)}
              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0 bg-transparent"
              title="Abrir selector libre de color"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Color libre / Hex
            </span>
            <input
              type="text"
              value={colorActual}
              onChange={(e) => seleccionarColor(e.target.value)}
              placeholder="#FFFFFF"
              className="text-xs font-mono font-bold text-slate-800 bg-transparent outline-none w-20 uppercase"
            />
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Personalizado
        </span>
      </div>

      {/* ── 4. COMBINACIONES COMPLETAS SUGERIDAS (DISCRETAS) ── */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Combinaciones armónicas completas (opcional):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PALETAS_MINIMALISTAS.map((paleta) => (
            <button
              key={paleta.nombre}
              type="button"
              onClick={() => aplicarPaletaCompleta(paleta)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15"
                style={{ backgroundColor: paleta.primario }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15"
                style={{ backgroundColor: paleta.secundario }}
              />
              <span>{paleta.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
