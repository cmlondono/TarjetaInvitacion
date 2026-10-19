'use client'

import React, { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SeccionModular, TipoEvento, TipoSeccion } from '@/types/invitation'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { infoEvento } from '@/lib/estudio/eventos'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { Eye, EyeOff, GripVertical, Plus } from 'lucide-react'

export function nombreBloque(s: SeccionModular): string {
  if (s.tipo === 'cabecera') return 'Portada'
  return s.titulo || CATALOGO_SECCIONES.find((m) => m.tipo === s.tipo)?.nombre || 'Bloque'
}

function Fila({
  seccion,
  activa,
  alElegir,
  alAlternar,
}: {
  seccion: SeccionModular
  activa: boolean
  alElegir: () => void
  alAlternar: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: seccion.id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 rounded-xl border pr-1 ${isDragging ? 'relative z-10 shadow-lg bg-white border-amber-400' : activa ? 'bg-amber-50 border-amber-300' : 'bg-white border-transparent hover:border-slate-200'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        data-vaul-no-drag
        aria-label={`Arrastrar ${nombreBloque(seccion)}`}
        className="w-8 h-11 flex items-center justify-center text-slate-400 touch-none cursor-grab active:cursor-grabbing disabled:opacity-0 disabled:cursor-default shrink-0"
      >
        <GripVertical size={15} />
      </button>
      <button type="button" onClick={alElegir} aria-current={activa} className={`flex-1 min-w-0 min-h-11 text-left text-[14px] truncate cursor-pointer ${activa ? 'font-bold text-slate-900' : 'font-medium text-slate-800'} ${seccion.visible ? '' : 'line-through text-slate-400'}`}>
        {nombreBloque(seccion)}
      </button>
      <button type="button" onClick={alAlternar} aria-label={seccion.visible ? `Ocultar ${nombreBloque(seccion)}` : `Mostrar ${nombreBloque(seccion)}`} className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer">
        {seccion.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </li>
  )
}

interface PanelBloquesProps {
  secciones: SeccionModular[]
  tipoEvento: TipoEvento
  seleccionId: string | null
  alElegir: (id: string) => void
  alAlternar: (id: string) => void
  alReordenar: (idOrigen: string, idDestino: string) => void
  alAgregar: (tipo: TipoSeccion) => void
}

export function PanelBloques({ secciones, tipoEvento, seleccionId, alElegir, alAlternar, alReordenar, alAgregar }: PanelBloquesProps) {
  const [catalogo, setCatalogo] = useState(false)
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const ordenadas = [...secciones].sort((a, b) => a.orden - b.orden)
  const info = infoEvento(tipoEvento)
  const presentes = new Set(secciones.map((s) => s.tipo))
  const sugeridos = info.sugeridos.filter((t) => !presentes.has(t))

  const alSoltar = (e: DragEndEvent) => {
    if (e.over && e.active.id !== e.over.id) alReordenar(String(e.active.id), String(e.over.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Tu invitación</span>
        <span className="text-[12px] text-slate-500">Arrastra para ordenar · toca para editar</span>
      </div>
      <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
        <SortableContext items={ordenadas.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ol className="list-none m-0 p-0 flex flex-col gap-1">
            {ordenadas.map((s) => (
              <Fila key={s.id} seccion={s} activa={seleccionId === s.id} alElegir={() => alElegir(s.id)} alAlternar={() => alAlternar(s.id)} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <button type="button" onClick={() => setCatalogo(!catalogo)} aria-expanded={catalogo} className="min-h-11 rounded-xl border-[1.5px] border-dashed border-slate-400 bg-slate-50 text-slate-900 text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100">
        <Plus size={16} /> Añadir bloque
      </button>

      {catalogo && (
        <div className="flex flex-col gap-1.5">
          {CATALOGO_SECCIONES.filter((m) => m.tipo !== 'cabecera').map((m) => (
            <button
              key={m.tipo}
              type="button"
              onClick={() => {
                alAgregar(m.tipo)
                setCatalogo(false)
              }}
              className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-amber-400 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <IconoDinamico nombre={m.iconoDefecto} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-slate-900">{m.nombre}</span>
                <span className="block text-[12px] text-slate-500 leading-snug">{m.descripcion}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {sugeridos.length > 0 && !catalogo && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-slate-600">Sugeridos para {info.nombre.toLowerCase()}</span>
          <div className="flex flex-wrap gap-1.5">
            {sugeridos.map((t) => (
              <button key={t} type="button" onClick={() => alAgregar(t)} className="min-h-8 px-3 rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:border-amber-400 cursor-pointer">
                + {CATALOGO_SECCIONES.find((m) => m.tipo === t)?.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
