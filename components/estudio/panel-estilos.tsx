'use client'

import React, { useState } from 'react'
import type { ConfiguracionVisual, FuenteTipografica, TipoEsquinas, TipoEvento, TipoOrnamento } from '@/types/invitation'
import { KITS, aplicarKit, type KitEstilo } from '@/lib/estudio/kits'
import { infoEvento } from '@/lib/estudio/eventos'
import { CATALOGO_FUENTES, familiaFuente } from '@/lib/editor/estilos'
import { MuestraOrnamento } from '@/components/invitacion/ornamentos'
import { CapaEscena, CATALOGO_ESCENAS } from '@/components/invitacion/escenas'
import { textoSobre } from '@/components/invitacion/tema'
import { Check } from 'lucide-react'
import { EditorFotoFondo, Segmentos, TituloGrupo } from './ui'

function TarjetaKit({ kit, activo, alElegir }: { kit: KitEstilo; activo: boolean; alElegir: () => void }) {
  const caligrafica = ['greatvibes', 'alexbrush', 'parisienne', 'dancing', 'pacifico'].includes(kit.fuenteTitulo)
  return (
    <button
      type="button"
      onClick={alElegir}
      aria-pressed={activo}
      className={`relative flex flex-col rounded-2xl overflow-hidden bg-white text-left cursor-pointer transition-shadow ${activo ? 'ring-2 ring-amber-500 shadow-lg' : 'border border-slate-200 hover:shadow-md'}`}
    >
      <span className="relative flex p-3.5 h-40 box-border" style={{ backgroundColor: kit.colores.fondo }}>
        <CapaEscena escena={kit.escena} colores={{ fondo: kit.colores.fondo, acento: kit.colores.acento, detalle: kit.colores.detalle }} />
        <span
          className="relative flex-1 flex flex-col items-center justify-center gap-1 text-center p-2.5"
          style={{ backgroundColor: kit.colores.tarjeta, borderRadius: kit.esquinas === 'rectas' ? 4 : kit.esquinas === 'redondas' ? 20 : 12 }}
        >
          <span style={{ fontFamily: familiaFuente(kit.fuenteCuerpo), fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: kit.colores.acento }}>{kit.muestra.kicker}</span>
          <span style={{ fontFamily: familiaFuente(kit.fuenteTitulo), fontSize: caligrafica ? 26 : 19, fontWeight: caligrafica ? 400 : 700, lineHeight: 1.05, color: kit.colores.texto }}>{kit.muestra.titulo}</span>
          <span
            className="mt-1 px-2.5 h-5 inline-flex items-center"
            style={{ backgroundColor: kit.colores.acento, color: textoSobre(kit.colores.acento), borderRadius: kit.esquinas === 'redondas' ? 999 : 6, fontFamily: familiaFuente(kit.fuenteCuerpo), fontSize: 9, fontWeight: 700 }}
          >
            Confirmar
          </span>
        </span>
      </span>
      <span className="flex flex-col gap-0.5 px-3 py-2.5">
        <span className="text-[14px] font-bold text-slate-900">{kit.nombre}</span>
        <span className="text-[12px] text-slate-500 leading-snug">{kit.descripcion}</span>
      </span>
      {activo && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

const ROLES: { id: keyof Pick<ConfiguracionVisual, 'colorFondo' | 'colorTarjeta' | 'colorTexto' | 'colorPrimario' | 'colorSecundario'>; nombre: string }[] = [
  { id: 'colorFondo', nombre: 'Fondo' },
  { id: 'colorTarjeta', nombre: 'Tarjetas' },
  { id: 'colorTexto', nombre: 'Texto' },
  { id: 'colorPrimario', nombre: 'Acento y botones' },
  { id: 'colorSecundario', nombre: 'Detalles y ornamentos' },
]

const ORNAMENTOS: { id: TipoOrnamento; nombre: string }[] = [
  { id: 'ramas', nombre: 'Ramas' },
  { id: 'filigrana', nombre: 'Filigrana' },
  { id: 'confeti', nombre: 'Confeti' },
  { id: 'nubes', nombre: 'Nubes' },
  { id: 'palmas', nombre: 'Palmas' },
  { id: 'lineas', nombre: 'Líneas' },
  { id: 'estrellas', nombre: 'Estrellas' },
  { id: 'globos', nombre: 'Globos' },
  { id: 'corazones', nombre: 'Corazones' },
  { id: 'mariposas', nombre: 'Mariposas' },
  { id: 'hojas', nombre: 'Hojas' },
  { id: 'copos', nombre: 'Copos' },
  { id: 'ninguno', nombre: 'Ninguno' },
]

interface PanelEstilosProps {
  visual: ConfiguracionVisual
  tipoEvento: TipoEvento
  eventoId: string
  /** `continuo`: cambio mientras se arrastra un control (un solo paso de deshacer) */
  alCambiar: (visual: ConfiguracionVisual, continuo?: boolean) => void
}

export function PanelEstilos({ visual, tipoEvento, eventoId, alCambiar }: PanelEstilosProps) {
  const [filtro, setFiltro] = useState<'evento' | 'todos'>('evento')
  const info = infoEvento(tipoEvento)
  const kits = filtro === 'todos' ? KITS : KITS.filter((k) => k.eventos.includes(tipoEvento))
  const set = <K extends keyof ConfiguracionVisual>(campo: K, valor: ConfiguracionVisual[K]) => alCambiar({ ...visual, [campo]: valor })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <TituloGrupo>Elige un estilo</TituloGrupo>
          <div role="group" aria-label="Filtrar estilos" className="flex p-1 rounded-xl bg-slate-100">
            {(
              [
                ['evento', `Para ${info.nombre.toLowerCase()}`],
                ['todos', 'Todos'],
              ] as const
            ).map(([id, nombre]) => (
              <button key={id} type="button" aria-pressed={filtro === id} onClick={() => setFiltro(id)} className={`min-h-8 px-3 rounded-lg text-[12px] cursor-pointer ${filtro === id ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-semibold text-slate-600'}`}>
                {nombre}
              </button>
            ))}
          </div>
        </div>
        <p className="m-0 text-[13px] text-slate-600">Cambia colores, letras, ornamentos y la forma de abrir. Tus textos y fotos no se pierden.</p>
        <div className="grid grid-cols-2 gap-3">
          {kits.map((k) => (
            <TarjetaKit key={k.id} kit={k} activo={visual.kitId === k.id} alElegir={() => alCambiar(aplicarKit(visual, k, { cambiarApertura: true }))} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <TituloGrupo>Colores</TituloGrupo>
        {ROLES.map((r) => (
          <label key={r.id} className="flex items-center gap-3 cursor-pointer">
            <span className="relative w-10 h-10 rounded-xl border border-slate-300 shrink-0 overflow-hidden" style={{ backgroundColor: visual[r.id] }}>
              <input type="color" aria-label={r.nombre} value={visual[r.id] || '#000000'} onChange={(e) => set(r.id, e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-slate-800">{r.nombre}</span>
            <span className="text-[12px] font-mono text-slate-500 uppercase">{visual[r.id]}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <TituloGrupo>Fondo animado</TituloGrupo>
        <p className="m-0 text-[13px] text-slate-600">Dibujos que se mueven detrás de la invitación. Toman los colores de tu estilo.</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ id: undefined, nombre: 'Ninguno', descripcion: 'Solo el color de fondo' }, ...CATALOGO_ESCENAS].map((e) => {
            const activa = visual.escena === e.id
            return (
              <button key={e.id || 'ninguno'} type="button" aria-pressed={activa} onClick={() => set('escena', e.id)} title={e.descripcion} className={`flex flex-col rounded-xl overflow-hidden text-left cursor-pointer ${activa ? 'ring-2 ring-amber-500' : 'border border-slate-200 hover:border-slate-300'}`}>
                <span className="relative block h-24" style={{ backgroundColor: visual.colorFondo }}>
                  <CapaEscena escena={e.id} colores={{ fondo: visual.colorFondo, acento: visual.colorPrimario, detalle: visual.colorSecundario }} />
                </span>
                <span className="px-2 py-1.5 text-[12px] font-semibold text-slate-800 leading-tight">{e.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <TituloGrupo>Foto de fondo</TituloGrupo>
        <EditorFotoFondo
          etiqueta="Foto detrás de toda la invitación"
          ayuda="Queda quieta mientras el invitado baja. Bájale la opacidad para que los textos se lean bien."
          foto={visual.fotoFondo}
          alCambiar={(fotoFondo, continuo) => alCambiar({ ...visual, fotoFondo }, continuo)}
          carpeta={eventoId}
          colorFondo={visual.colorFondo}
        />
      </div>

      <div className="flex flex-col gap-3">
        <TituloGrupo>Letras</TituloGrupo>
        {(
          [
            ['fuenteTitulo', 'Títulos'],
            ['fuenteCuerpo', 'Textos'],
          ] as const
        ).map(([campo, nombre]) => (
          <label key={campo} className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
            {nombre}
            <select value={visual[campo]} onChange={(e) => set(campo, e.target.value as FuenteTipografica)} className="min-h-11 px-3 rounded-xl border border-slate-300 bg-white text-[15px] text-slate-900 cursor-pointer" style={{ fontFamily: familiaFuente(visual[campo]) }}>
              {CATALOGO_FUENTES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre} · {f.categoria}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <Segmentos<TipoEsquinas>
        etiqueta="Esquinas"
        opciones={[
          { id: 'rectas', nombre: 'Rectas' },
          { id: 'suaves', nombre: 'Suaves' },
          { id: 'redondas', nombre: 'Redondas' },
        ]}
        valor={visual.esquinas || 'suaves'}
        alCambiar={(v) => set('esquinas', v)}
      />

      <div className="flex flex-col gap-2">
        <TituloGrupo>Ornamento</TituloGrupo>
        <div className="grid grid-cols-4 gap-2">
          {ORNAMENTOS.map((o) => {
            const activo = (visual.ornamento || 'ninguno') === o.id
            return (
              <button key={o.id} type="button" aria-pressed={activo} onClick={() => set('ornamento', o.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl border cursor-pointer ${activo ? 'border-amber-500 bg-amber-50 border-2' : 'border-slate-200'}`}>
                <span className="w-12 h-7" style={{ color: visual.colorSecundario }}>
                  {o.id !== 'ninguno' ? <MuestraOrnamento tipo={o.id} color={visual.colorSecundario || '#94a3b8'} /> : <span className="block w-full h-full rounded bg-slate-100" />}
                </span>
                <span className="text-[11px] font-semibold text-slate-700">{o.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
