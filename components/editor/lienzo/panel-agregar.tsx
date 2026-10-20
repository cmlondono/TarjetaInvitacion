'use client'

import React, { useMemo, useState } from 'react'
import { Drawer as Vaul } from 'vaul'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ConfiguracionVisual, FormaGeometrica, NombreIcono, TipoSeccion } from '@/types/invitation'
import { CATALOGO_STICKERS, CATEGORIAS_STICKERS, StickerSvg, type DefinicionSticker } from '@/lib/editor/stickers'
import { COMBINACIONES_TEXTO, ESTILOS_TEXTO_BASICOS, type CombinacionTexto } from '@/lib/editor/combinaciones-texto'
import { familiaFuente, estiloTextoACss } from '@/lib/editor/estilos'
import { CATALOGO_SECCIONES, IMAGENES_CURADAS } from '@/lib/modular-defaults'
import { LISTA_ICONOS_DISPONIBLES, IconoDinamico } from '@/components/ui/icono-dinamico'
import type { EstiloTexto } from '@/types/invitation'
import { Image as ImageIcon, LayoutPanelTop, Loader2, Search, Shapes, Smile, Sticker, Type, Upload, X } from 'lucide-react'

type Pestana = 'texto' | 'fotos' | 'stickers' | 'iconos' | 'formas' | 'secciones'

export interface PanelAgregarProps {
  abierto: boolean
  alCerrar: () => void
  esMovil: boolean
  visual: ConfiguracionVisual
  subiendoImagen: boolean
  destino: string
  alAgregarTexto: (texto: string, estilo: EstiloTexto) => void
  alAgregarCombinacion: (combinacion: CombinacionTexto) => void
  alSubirFoto: () => void
  alAgregarFotoUrl: (url: string) => void
  alAgregarSticker: (sticker: DefinicionSticker) => void
  alAgregarIcono: (icono: NombreIcono) => void
  alAgregarForma: (forma: FormaGeometrica) => void
  alAgregarSeccion: (tipo: TipoSeccion) => void
}

const PESTANAS: { id: Pestana; nombre: string; icono: React.ReactNode }[] = [
  { id: 'texto', nombre: 'Texto', icono: <Type size={16} /> },
  { id: 'fotos', nombre: 'Fotos', icono: <ImageIcon size={16} /> },
  { id: 'stickers', nombre: 'Stickers', icono: <Sticker size={16} /> },
  { id: 'iconos', nombre: 'Íconos', icono: <Smile size={16} /> },
  { id: 'formas', nombre: 'Formas', icono: <Shapes size={16} /> },
  { id: 'secciones', nombre: 'Secciones', icono: <LayoutPanelTop size={16} /> },
]

const FORMAS: { id: FormaGeometrica; nombre: string; vista: React.CSSProperties }[] = [
  { id: 'rectangulo', nombre: 'Rectángulo', vista: { borderRadius: 4 } },
  { id: 'circulo', nombre: 'Círculo', vista: { borderRadius: '50%' } },
  { id: 'triangulo', nombre: 'Triángulo', vista: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' } },
  { id: 'rombo', nombre: 'Rombo', vista: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } },
  { id: 'linea', nombre: 'Línea', vista: { height: 4, marginTop: 18, borderRadius: 2 } },
]

function ContenidoPanel(props: PanelAgregarProps) {
  const [pestana, setPestana] = useState<Pestana>('texto')
  const [busquedaIcono, setBusquedaIcono] = useState('')
  const { visual } = props
  const acento = visual.colorPrimario

  const iconosFiltrados = useMemo(() => {
    const q = busquedaIcono.trim().toLowerCase()
    return q ? LISTA_ICONOS_DISPONIBLES.filter((i) => i.etiqueta.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)) : LISTA_ICONOS_DISPONIBLES
  }, [busquedaIcono])

  const fotosSugeridas = [...IMAGENES_CURADAS.portadas, ...((IMAGENES_CURADAS as any).retratos || [])] as { titulo: string; url: string }[]

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="flex gap-1 overflow-x-auto px-3 pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] shrink-0">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPestana(p.id)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-colors ${
              pestana === p.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {p.icono}
            {p.nombre}
          </button>
        ))}
      </div>

      <p className="px-4 pb-2 text-[11px] text-slate-500 shrink-0">
        Se agregará en: <span className="font-semibold text-slate-700">{props.destino}</span>
      </p>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
        {pestana === 'texto' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              {ESTILOS_TEXTO_BASICOS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => props.alAgregarTexto(b.texto, b.estilo)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition-colors"
                  style={{
                    fontFamily: familiaFuente(b.estilo.fuente) || familiaFuente(visual.fuenteTitulo),
                    fontSize: Math.min(b.estilo.tamano ?? 16, 30),
                    fontWeight: b.estilo.peso,
                  }}
                >
                  {b.nombre}
                </button>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Combinaciones de texto</p>
              <div className="grid grid-cols-2 gap-2">
                {COMBINACIONES_TEXTO.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => props.alAgregarCombinacion(c)}
                    title={c.nombre}
                    aria-label={`Añadir combinación: ${c.nombre}`}
                    className="aspect-[4/3] rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center gap-0.5 p-2 overflow-hidden"
                    style={{ color: visual.colorTexto }}
                  >
                    {c.lineas.map((l, i) => (
                      <span
                        key={i}
                        data-fuente={l.estilo.fuente}
                        className="block max-w-full truncate leading-tight"
                        style={{ ...estiloTextoACss({ ...l.estilo, tamano: undefined }), fontSize: Math.max(9, Math.min((l.estilo.tamano ?? 16) * 0.42, 26)) }}
                      >
                        {l.texto}
                      </span>
                    ))}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {pestana === 'fotos' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={props.alSubirFoto}
              disabled={props.subiendoImagen}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {props.subiendoImagen ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {props.subiendoImagen ? 'Subiendo foto…' : 'Subir una foto'}
            </button>
            <p className="text-[11px] text-slate-500">Tus fotos se guardan en la nube junto con tu invitación.</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sugeridas</p>
            <div className="grid grid-cols-3 gap-2">
              {fotosSugeridas.map((f) => (
                <button
                  key={f.url}
                  type="button"
                  onClick={() => props.alAgregarFotoUrl(f.url)}
                  className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-amber-400 cursor-pointer"
                  title={f.titulo}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.titulo} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        )}

        {pestana === 'stickers' && (
          <div className="space-y-4">
            {CATEGORIAS_STICKERS.map((cat) => (
              <div key={cat}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  {cat === 'Animados' ? 'Animados (GIF)' : cat}
                  {cat === 'Animados' && (
                    <span className="px-1.5 py-px rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold normal-case tracking-normal">★ Premium</span>
                  )}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {CATALOGO_STICKERS.filter((s) => s.categoria === cat).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => props.alAgregarSticker(s)}
                      title={s.nombre}
                      className="aspect-square rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer p-2.5 flex items-center justify-center"
                      style={{ color: acento }}
                    >
                      <StickerSvg id={s.id} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {pestana === 'iconos' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-amber-400">
              <Search size={15} className="text-slate-400" />
              <input
                value={busquedaIcono}
                onChange={(e) => setBusquedaIcono(e.target.value)}
                placeholder="Buscar: torta, anillo, música…"
                className="flex-1 min-w-0 bg-transparent text-sm outline-none"
              />
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconosFiltrados.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  title={ic.etiqueta}
                  onClick={() => props.alAgregarIcono(ic.id)}
                  className="aspect-square rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer flex items-center justify-center"
                  style={{ color: acento }}
                >
                  <IconoDinamico nombre={ic.id} size={22} />
                </button>
              ))}
            </div>
          </div>
        )}

        {pestana === 'formas' && (
          <div className="grid grid-cols-3 gap-2">
            {FORMAS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => props.alAgregarForma(f.id)}
                className="aspect-square rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center gap-2 p-3"
              >
                <span className="w-10 h-10 block" style={{ backgroundColor: acento, ...f.vista }} />
                <span className="text-[11px] font-semibold text-slate-600">{f.nombre}</span>
              </button>
            ))}
          </div>
        )}

        {pestana === 'secciones' && (
          <div className="space-y-1.5">
            {CATALOGO_SECCIONES.filter((s) => s.tipo !== 'cabecera').map((s) => (
              <button
                key={s.tipo}
                type="button"
                onClick={() => props.alAgregarSeccion(s.tipo)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  s.tipo === 'lienzo_libre' ? 'border-amber-400 bg-amber-50/60 hover:bg-amber-50' : 'border-slate-200 hover:border-amber-400'
                }`}
              >
                <span className="mt-0.5 w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <IconoDinamico nombre={s.iconoDefecto} size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900">{s.nombre}</span>
                  <span className="block text-[11px] text-slate-500 leading-snug">{s.descripcion}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Biblioteca de elementos: panel lateral en PC, hoja inferior en el celular */
export function PanelAgregar(props: PanelAgregarProps) {
  if (props.esMovil) {
    return (
      <Vaul.Root open={props.abierto} onOpenChange={(abrir) => !abrir && props.alCerrar()}>
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 z-[60] bg-black/30" />
          <Vaul.Content className="fixed inset-x-0 bottom-0 z-[61] flex h-[72vh] flex-col rounded-t-2xl bg-white outline-none" aria-describedby={undefined}>
            <div className="mx-auto mt-2.5 mb-2 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between px-4 pb-2">
              <Vaul.Title className="text-base font-bold text-slate-900">Añadir a la tarjeta</Vaul.Title>
              <button type="button" onClick={props.alCerrar} className="p-2 -mr-2 rounded-full text-slate-500 active:bg-slate-100" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <ContenidoPanel {...props} />
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    )
  }

  return (
    <Sheet open={props.abierto} onOpenChange={(abrir) => !abrir && props.alCerrar()}>
      <SheetContent side="left" className="w-[380px] sm:max-w-[380px] p-0 pt-4 flex flex-col gap-0">
        <SheetHeader className="px-4 pb-3 pt-0">
          <SheetTitle>Añadir a la tarjeta</SheetTitle>
        </SheetHeader>
        <ContenidoPanel {...props} />
      </SheetContent>
    </Sheet>
  )
}
