'use client'

import React, { useEffect, useState } from 'react'
import type {
  AnimacionEntrada,
  ConfiguracionVisual,
  ElementoLienzo,
  EstiloSeccion,
  EstiloTexto,
  FiltroImagen,
  MascaraImagen,
  NombreIcono,
  SeccionModular,
} from '@/types/invitation'
import type { Seleccion } from './contexto-editor'
import type { MovimientoCapa } from '@/lib/editor/operaciones'
import {
  CATALOGO_ANIMACIONES,
  CATALOGO_FILTROS,
  CATALOGO_FUENTES,
  CATALOGO_MASCARAS,
  estiloMascara,
} from '@/lib/editor/estilos'
import { LISTA_ICONOS_DISPONIBLES, IconoDinamico } from '@/components/ui/icono-dinamico'
import { Deslizador, GrupoOpciones, PanelHerramienta, SelectorColor, Separador } from './controles'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  BringToFront,
  Check,
  Copy,
  Crop,
  Droplet,
  Eye,
  EyeOff,
  FlipHorizontal2,
  FlipVertical2,
  Frame,
  ImageIcon,
  Italic,
  Layers,
  Lock,
  Minus,
  MoveVertical,
  Palette,
  PencilLine,
  Plus,
  RefreshCw,
  RotateCcw,
  SendToBack,
  Sparkles,
  Square,
  Trash2,
  Type,
  Underline,
  Wand2,
} from 'lucide-react'

export interface AccionesLienzo {
  seleccionar: (s: Seleccion) => void
  editarTexto: (clave: string) => void
  actualizarElemento: (sId: string, eId: string, cambios: Partial<ElementoLienzo>) => void
  actualizarEstiloTextoElemento: (sId: string, eId: string, cambios: Partial<EstiloTexto> | null) => void
  actualizarEstiloTexto: (sId: string, campo: string, cambios: Partial<EstiloTexto> | null) => void
  actualizarEstiloSeccion: (sId: string, cambios: Partial<EstiloSeccion>) => void
  eliminarElemento: (sId: string, eId: string) => void
  duplicarElemento: (sId: string, eId: string) => void
  moverCapa: (sId: string, eId: string, movimiento: MovimientoCapa) => void
  reemplazarImagen: (sId: string, eId: string) => void
  abrirRecorte: (sId: string, eId: string) => void
  subirFondoSeccion: (sId: string) => void
  moverSeccion: (sId: string, direccion: 'arriba' | 'abajo') => void
  duplicarSeccion: (sId: string) => void
  ocultarSeccion: (sId: string) => void
  eliminarSeccion: (sId: string) => void
  abrirAgregar: () => void
  abrirCapas: () => void
}

interface BarraContextualProps {
  seleccion: Seleccion
  secciones: SeccionModular[]
  visual: ConfiguracionVisual
  acciones: AccionesLienzo
  esMovil: boolean
  /** Herramientas adicionales cuando no hay nada seleccionado (atajos en el celular) */
  extrasSinSeleccion?: React.ReactNode[]
}

const TAMANO_ICONO = 16

export function BotonAccion({
  etiqueta,
  icono,
  alPulsar,
  esMovil,
  peligro = false,
  activo = false,
  deshabilitado = false,
}: {
  etiqueta: string
  icono: React.ReactNode
  alPulsar: () => void
  esMovil: boolean
  peligro?: boolean
  activo?: boolean
  deshabilitado?: boolean
}) {
  return (
    <button
      type="button"
      onClick={alPulsar}
      disabled={deshabilitado}
      title={etiqueta}
      className={
        esMovil
          ? `flex flex-col items-center justify-center gap-1 min-w-[58px] h-[58px] px-1 rounded-xl text-[10px] font-semibold shrink-0 disabled:opacity-35 ${
              peligro ? 'text-rose-600 active:bg-rose-50' : activo ? 'bg-amber-100 text-amber-900' : 'text-slate-700 active:bg-slate-100'
            }`
          : `flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
              peligro ? 'text-rose-600 hover:bg-rose-50' : activo ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'
            }`
      }
    >
      {icono}
      <span className="whitespace-nowrap leading-none">{etiqueta}</span>
    </button>
  )
}

/** Tamaño en px que tiene hoy un texto de bloque (para iniciar el deslizador en su valor real) */
function tamanoActualTexto(clave: string): number {
  if (typeof document === 'undefined') return 16
  const el = document.querySelector<HTMLElement>(`[data-texto-clave="${CSS.escape(clave)}"]`)
  if (!el) return 16
  return Math.round(parseFloat(getComputedStyle(el).fontSize) || 16)
}

interface ControlesTextoProps {
  estilo: EstiloTexto | undefined
  alCambiar: (cambios: Partial<EstiloTexto> | null) => void
  tamanoPorDefecto: number
  coloresTema: string[]
  abierta: string | null
  setAbierta: (id: string | null) => void
  esMovil: boolean
}

function controlesTexto({
  estilo,
  alCambiar,
  tamanoPorDefecto,
  coloresTema,
  abierta,
  setAbierta,
  esMovil,
}: ControlesTextoProps): React.ReactNode[] {
  const tamano = estilo?.tamano ?? tamanoPorDefecto
  const comunes = { abierta, alCambiar: setAbierta, esMovil }

  return [
    <PanelHerramienta key="fuente" id="fuente" etiqueta="Fuente" titulo="Tipografía" icono={<Type size={TAMANO_ICONO} />} anchoEscritorio="w-64" {...comunes}>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => alCambiar({ fuente: undefined })}
          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            !estilo?.fuente ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-400' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          La del tema (automática)
        </button>
        {CATALOGO_FUENTES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => alCambiar({ fuente: f.id })}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
              estilo?.fuente === f.id ? 'bg-amber-50 ring-1 ring-amber-400' : 'hover:bg-slate-50'
            }`}
          >
            <span style={{ fontFamily: f.familia }} className="text-lg text-slate-900 leading-tight">
              {f.nombre}
            </span>
            <span className="text-[10px] text-slate-400">{f.categoria}</span>
          </button>
        ))}
      </div>
    </PanelHerramienta>,

    <PanelHerramienta key="tamano" id="tamano" etiqueta={`${Math.round(tamano)}`} titulo="Tamaño del texto" icono={<span className="text-[13px] font-bold leading-none">Aa</span>} {...comunes}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => alCambiar({ tamano: Math.max(6, Math.round(tamano) - 1) })}
          className="h-10 w-10 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center cursor-pointer active:bg-slate-100"
          aria-label="Reducir tamaño"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1">
          <Deslizador etiqueta="Tamaño" valor={tamano} min={6} max={140} unidad=" px" alCambiar={(v) => alCambiar({ tamano: v })} />
        </div>
        <button
          type="button"
          onClick={() => alCambiar({ tamano: Math.min(200, Math.round(tamano) + 1) })}
          className="h-10 w-10 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center cursor-pointer active:bg-slate-100"
          aria-label="Aumentar tamaño"
        >
          <Plus size={16} />
        </button>
      </div>
    </PanelHerramienta>,

    <PanelHerramienta key="color" id="color" etiqueta="Color" titulo="Color del texto" icono={<span className="w-4 h-4 rounded-full border border-slate-300" style={{ background: estilo?.color || 'conic-gradient(#f59e0b,#ec4899,#3b82f6,#10b981,#f59e0b)' }} />} {...comunes}>
      <SelectorColor valor={estilo?.color} alCambiar={(c) => alCambiar({ color: c })} coloresTema={coloresTema} />
    </PanelHerramienta>,

    <PanelHerramienta key="formato" id="formato" etiqueta="Formato" titulo="Formato y alineación" icono={<Bold size={TAMANO_ICONO} />} {...comunes}>
      <GrupoOpciones
        columnas={4}
        valor={undefined}
        opciones={[
          { id: 'negrita', etiqueta: <Bold size={15} className={estilo?.peso && estilo.peso >= 600 ? 'text-amber-600' : ''} />, titulo: 'Negrita' },
          { id: 'cursiva', etiqueta: <Italic size={15} className={estilo?.cursiva ? 'text-amber-600' : ''} />, titulo: 'Cursiva' },
          { id: 'subrayado', etiqueta: <Underline size={15} className={estilo?.subrayado ? 'text-amber-600' : ''} />, titulo: 'Subrayado' },
          { id: 'mayusculas', etiqueta: <span className={`text-[11px] font-bold ${estilo?.mayusculas ? 'text-amber-600' : ''}`}>AA</span>, titulo: 'Mayúsculas' },
        ]}
        alCambiar={(id) => {
          if (id === 'negrita') alCambiar({ peso: estilo?.peso && estilo.peso >= 600 ? 400 : 700 })
          if (id === 'cursiva') alCambiar({ cursiva: !estilo?.cursiva })
          if (id === 'subrayado') alCambiar({ subrayado: !estilo?.subrayado })
          if (id === 'mayusculas') alCambiar({ mayusculas: !estilo?.mayusculas })
        }}
      />
      <Separador />
      <GrupoOpciones
        columnas={3}
        valor={estilo?.alineacion}
        opciones={[
          { id: 'izquierda', etiqueta: <AlignLeft size={15} />, titulo: 'Izquierda' },
          { id: 'centro', etiqueta: <AlignCenter size={15} />, titulo: 'Centro' },
          { id: 'derecha', etiqueta: <AlignRight size={15} />, titulo: 'Derecha' },
        ]}
        alCambiar={(id) => alCambiar({ alineacion: id })}
      />
      <Separador />
      <Deslizador etiqueta="Grosor" valor={estilo?.peso ?? 400} min={300} max={800} paso={100} alCambiar={(v) => alCambiar({ peso: v })} />
    </PanelHerramienta>,

    <PanelHerramienta key="espaciado" id="espaciado" etiqueta="Espaciado" titulo="Espaciado" icono={<MoveVertical size={TAMANO_ICONO} />} {...comunes}>
      <Deslizador etiqueta="Entre letras" valor={estilo?.interletrado ?? 0} min={-0.05} max={0.8} paso={0.01} unidad=" em" alCambiar={(v) => alCambiar({ interletrado: v })} />
      <Deslizador etiqueta="Entre líneas" valor={estilo?.interlineado ?? 1.3} min={0.8} max={2.6} paso={0.05} alCambiar={(v) => alCambiar({ interlineado: v })} />
    </PanelHerramienta>,

    <PanelHerramienta key="contorno" id="contorno" etiqueta="Borde" titulo="Borde de las letras" icono={<span className="text-[15px] font-black leading-none text-white [-webkit-text-stroke:1.5px_#334155] [paint-order:stroke_fill]">A</span>} {...comunes}>
      <Deslizador etiqueta="Grosor del borde" valor={estilo?.contornoGrosor ?? 0} min={0} max={6} paso={0.5} unidad=" px" alCambiar={(v) => alCambiar({ contornoGrosor: v || undefined, contornoColor: v ? estilo?.contornoColor || '#FFFFFF' : estilo?.contornoColor })} />
      <SelectorColor
        valor={estilo?.contornoColor}
        alCambiar={(c) => alCambiar(c ? { contornoColor: c, contornoGrosor: estilo?.contornoGrosor || 1.5 } : { contornoColor: undefined, contornoGrosor: undefined })}
        coloresTema={coloresTema}
        etiquetaQuitar="Sin borde"
      />
    </PanelHerramienta>,

    <PanelHerramienta key="sombra" id="sombra" etiqueta="Sombra" titulo="Sombra del texto" icono={<span className="text-[15px] font-black leading-none [text-shadow:2px_2px_0_#cbd5e1]">S</span>} {...comunes}>
      <GrupoOpciones
        columnas={3}
        valor={estilo?.sombra ?? 'ninguna'}
        opciones={[
          { id: 'ninguna', etiqueta: 'Ninguna' },
          { id: 'suave', etiqueta: 'Suave' },
          { id: 'marcada', etiqueta: 'Marcada' },
          { id: 'solida', etiqueta: 'Sólida' },
          { id: 'brillo', etiqueta: 'Brillo' },
        ]}
        alCambiar={(id) => alCambiar({ sombra: id })}
      />
      <Separador />
      <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Color de la sombra</p>
      <SelectorColor
        valor={estilo?.sombraColor}
        alCambiar={(c) => alCambiar({ sombraColor: c, sombra: c && (!estilo?.sombra || estilo.sombra === 'ninguna') ? 'solida' : estilo?.sombra })}
        coloresTema={coloresTema}
        etiquetaQuitar="Color automático"
      />
    </PanelHerramienta>,

    <PanelHerramienta key="efectos" id="efectos" etiqueta="Fondo" titulo="Fondo y recuadro del texto" icono={<Sparkles size={TAMANO_ICONO} />} {...comunes}>
      <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Resaltado detrás del texto</p>
      <SelectorColor
        valor={estilo?.colorFondo}
        alCambiar={(c) => alCambiar({ colorFondo: c })}
        coloresTema={coloresTema}
        etiquetaQuitar="Sin resaltado"
      />
      <Separador />
      <Deslizador etiqueta="Recuadro alrededor" valor={estilo?.marcoGrosor ?? 0} min={0} max={6} paso={0.5} unidad=" px" alCambiar={(v) => alCambiar({ marcoGrosor: v || undefined, marcoColor: v ? estilo?.marcoColor || coloresTema[0] : estilo?.marcoColor })} />
      {(estilo?.marcoGrosor ?? 0) > 0 && (
        <SelectorColor
          valor={estilo?.marcoColor}
          alCambiar={(c) => alCambiar(c ? { marcoColor: c } : { marcoColor: undefined, marcoGrosor: undefined })}
          coloresTema={coloresTema}
          etiquetaQuitar="Sin recuadro"
        />
      )}
    </PanelHerramienta>,
  ]
}

function controlesComunesElemento(
  elemento: ElementoLienzo,
  sId: string,
  acciones: AccionesLienzo,
  abierta: string | null,
  setAbierta: (id: string | null) => void,
  esMovil: boolean
): React.ReactNode[] {
  const comunes = { abierta, alCambiar: setAbierta, esMovil }
  const actualizar = (cambios: Partial<ElementoLienzo>) => acciones.actualizarElemento(sId, elemento.id, cambios)

  return [
    <PanelHerramienta key="posicion" id="posicion" etiqueta="Posición" titulo="Posición y capas" icono={<Layers size={TAMANO_ICONO} />} {...comunes}>
      <GrupoOpciones<MovimientoCapa>
        columnas={2}
        valor={undefined}
        opciones={[
          { id: 'frente', etiqueta: <><BringToFront size={14} /> Al frente</> },
          { id: 'adelante', etiqueta: <><ArrowUp size={14} /> Adelante</> },
          { id: 'atras', etiqueta: <><ArrowDown size={14} /> Atrás</> },
          { id: 'fondo', etiqueta: <><SendToBack size={14} /> Al fondo</> },
        ]}
        alCambiar={(mov) => acciones.moverCapa(sId, elemento.id, mov)}
      />
      <Separador />
      <Deslizador etiqueta="Rotación" valor={elemento.rotacion} min={0} max={359} unidad="°" alCambiar={(v) => actualizar({ rotacion: v })} />
      <Deslizador etiqueta="Ancho" valor={elemento.ancho} min={3} max={140} paso={0.5} unidad="%" alCambiar={(v) => {
        const proporcion = elemento.alto && elemento.ancho ? elemento.alto / elemento.ancho : undefined
        actualizar(proporcion && elemento.tipo !== 'texto' ? { ancho: v, alto: v * proporcion } : { ancho: v })
      }} />
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <button type="button" onClick={() => actualizar({ x: (100 - elemento.ancho) / 2 })} className="h-9 rounded-lg border border-slate-200 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer">
          Centrar horizontal
        </button>
        <button type="button" onClick={() => actualizar({ rotacion: 0 })} className="h-9 rounded-lg border border-slate-200 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1">
          <RotateCcw size={12} /> Sin rotación
        </button>
      </div>
    </PanelHerramienta>,

    <PanelHerramienta key="opacidad" id="opacidad" etiqueta="Transparencia" titulo="Transparencia y volteo" icono={<Droplet size={TAMANO_ICONO} />} {...comunes}>
      <Deslizador etiqueta="Opacidad" valor={Math.round(elemento.opacidad * 100)} min={5} max={100} unidad="%" alCambiar={(v) => actualizar({ opacidad: v / 100 })} />
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <button type="button" onClick={() => actualizar({ volteoH: !elemento.volteoH })} className={`h-9 rounded-lg border text-[11px] font-semibold cursor-pointer flex items-center justify-center gap-1 ${elemento.volteoH ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
          <FlipHorizontal2 size={13} /> Voltear ↔
        </button>
        <button type="button" onClick={() => actualizar({ volteoV: !elemento.volteoV })} className={`h-9 rounded-lg border text-[11px] font-semibold cursor-pointer flex items-center justify-center gap-1 ${elemento.volteoV ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
          <FlipVertical2 size={13} /> Voltear ↕
        </button>
      </div>
    </PanelHerramienta>,

    <PanelHerramienta key="animacion" id="animacion" etiqueta="Animar" titulo="Animación al aparecer" icono={<Wand2 size={TAMANO_ICONO} />} {...comunes}>
      <p className="text-[11px] text-slate-500 mb-2">Se reproduce cuando el invitado llega a este punto de la tarjeta.</p>
      <GrupoOpciones<AnimacionEntrada>
        columnas={2}
        valor={elemento.animacion ?? 'ninguna'}
        opciones={CATALOGO_ANIMACIONES.map((a) => ({ id: a.id, etiqueta: a.nombre }))}
        alCambiar={(id) => actualizar({ animacion: id })}
      />
    </PanelHerramienta>,

    <BotonAccion key="bloquear" etiqueta={elemento.bloqueado ? 'Desbloquear' : 'Bloquear'} icono={<Lock size={TAMANO_ICONO} />} activo={elemento.bloqueado} alPulsar={() => actualizar({ bloqueado: !elemento.bloqueado })} esMovil={esMovil} />,
    <BotonAccion key="duplicar" etiqueta="Duplicar" icono={<Copy size={TAMANO_ICONO} />} alPulsar={() => acciones.duplicarElemento(sId, elemento.id)} esMovil={esMovil} />,
  ]
}

/**
 * Barra de herramientas contextual: cambia según lo que esté seleccionado.
 * En PC es una barra sobre la tarjeta; en el celular es la barra inferior deslizable.
 */
export function BarraContextual({ seleccion, secciones, visual, acciones, esMovil, extrasSinSeleccion = [] }: BarraContextualProps) {
  const [abierta, setAbierta] = useState<string | null>(null)
  const claveSeleccion = seleccion ? JSON.stringify(seleccion) : ''
  useEffect(() => setAbierta(null), [claveSeleccion])

  const coloresTema = [visual.colorPrimario, visual.colorSecundario, visual.colorTexto, visual.colorTarjeta, visual.colorFondo]
  const seccion = seleccion ? secciones.find((s) => s.id === seleccion.seccionId) : undefined
  const comunes = { abierta, alCambiar: setAbierta, esMovil }

  let titulo = ''
  let herramientas: React.ReactNode[] = []

  if (!seleccion || !seccion) {
    titulo = 'Diseño'
    herramientas = esMovil
      ? [
          <BotonAccion key="agregar" etiqueta="Añadir" icono={<Plus size={TAMANO_ICONO} />} alPulsar={acciones.abrirAgregar} esMovil={esMovil} />,
          ...extrasSinSeleccion,
          <BotonAccion key="capas" etiqueta="Capas" icono={<Layers size={TAMANO_ICONO} />} alPulsar={acciones.abrirCapas} esMovil={esMovil} />,
        ]
      : [
          <span key="ayuda" className="text-xs text-slate-500 px-1 truncate">
            Toca un texto, una foto o una sección de la tarjeta para editarla · Doble clic para escribir
          </span>,
        ]
  } else if (seleccion.tipo === 'texto') {
    const clave = `${seleccion.seccionId}:${seleccion.campo}`
    const estilo = seccion.estilosTexto?.[seleccion.campo]
    const cambiar = (c: Partial<EstiloTexto>) => acciones.actualizarEstiloTexto(seleccion.seccionId, seleccion.campo, c)
    const movible = !seleccion.campo.includes('.')
    // Fecha y contador se calculan solos: se mueven y se estilizan, pero no se escriben encima
    const soloEstilo = typeof document !== 'undefined' && Boolean(document.querySelector(`[data-texto-clave="${CSS.escape(clave)}"][data-solo-estilo]`))
    titulo = soloEstilo ? 'Fecha' : 'Texto'
    herramientas = [
      ...(soloEstilo ? [] : [<BotonAccion key="escribir" etiqueta="Escribir" icono={<PencilLine size={TAMANO_ICONO} />} alPulsar={() => acciones.editarTexto(clave)} esMovil={esMovil} />]),
      <BotonAccion
        key="quitar"
        etiqueta={estilo?.oculto ? 'Mostrar' : 'Quitar'}
        icono={estilo?.oculto ? <Eye size={TAMANO_ICONO} /> : <EyeOff size={TAMANO_ICONO} />}
        peligro={!estilo?.oculto}
        alPulsar={() => cambiar({ oculto: estilo?.oculto ? undefined : true })}
        esMovil={esMovil}
      />,
      ...(movible
        ? [
            <PanelHerramienta key="posicion" id="posicion" etiqueta="Posición" titulo="Posición del texto" icono={<Layers size={TAMANO_ICONO} />} {...comunes}>
              <p className="text-[11px] text-slate-500 mb-2">Arrastra el texto para moverlo a cualquier parte del bloque.</p>
              <Deslizador etiqueta="Rotación" valor={estilo?.rotacion ?? 0} min={-180} max={180} unidad="°" alCambiar={(v) => cambiar({ rotacion: v || undefined })} />
              <button
                type="button"
                disabled={!estilo?.x && !estilo?.y && !estilo?.rotacion}
                onClick={() => cambiar({ x: undefined, y: undefined, rotacion: undefined })}
                className="w-full h-9 mt-1 rounded-lg border border-slate-200 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw size={12} /> Volver a su lugar
              </button>
            </PanelHerramienta>,
          ]
        : []),
      ...controlesTexto({
        estilo,
        alCambiar: (c) => acciones.actualizarEstiloTexto(seleccion.seccionId, seleccion.campo, c),
        tamanoPorDefecto: tamanoActualTexto(clave),
        coloresTema,
        abierta,
        setAbierta,
        esMovil,
      }),
      <BotonAccion key="restablecer" etiqueta="Restablecer" icono={<RefreshCw size={TAMANO_ICONO} />} deshabilitado={!estilo} alPulsar={() => acciones.actualizarEstiloTexto(seleccion.seccionId, seleccion.campo, null)} esMovil={esMovil} />,
    ]
  } else if (seleccion.tipo === 'elemento') {
    const elemento = seccion.elementos?.find((el) => el.id === seleccion.elementoId)
    if (elemento) {
      const sId = seccion.id
      const actualizar = (cambios: Partial<ElementoLienzo>) => acciones.actualizarElemento(sId, elemento.id, cambios)

      switch (elemento.tipo) {
        case 'texto':
          titulo = 'Texto libre'
          herramientas = [
            <BotonAccion key="escribir" etiqueta="Escribir" icono={<PencilLine size={TAMANO_ICONO} />} alPulsar={() => acciones.editarTexto(elemento.id)} esMovil={esMovil} />,
            ...controlesTexto({
              estilo: elemento.estiloTexto,
              alCambiar: (c) => acciones.actualizarEstiloTextoElemento(sId, elemento.id, c),
              tamanoPorDefecto: 18,
              coloresTema,
              abierta,
              setAbierta,
              esMovil,
            }),
            <PanelHerramienta key="curva" id="curva" etiqueta="Curvar" titulo="Texto en arco" icono={<span className="text-[15px] font-black leading-none">⌒</span>} {...comunes}>
              <Deslizador
                etiqueta="Curva"
                valor={elemento.estiloTexto?.curva ?? 0}
                min={-100}
                max={100}
                alCambiar={(v) => acciones.actualizarEstiloTextoElemento(sId, elemento.id, { curva: Math.abs(v) < 3 ? undefined : v })}
              />
              <GrupoOpciones
                columnas={3}
                valor={!elemento.estiloTexto?.curva ? 'recto' : elemento.estiloTexto.curva > 0 ? 'arriba' : 'abajo'}
                opciones={[
                  { id: 'arriba', etiqueta: '⌒ Arco' },
                  { id: 'recto', etiqueta: 'Recto' },
                  { id: 'abajo', etiqueta: '∪ Sonrisa' },
                ]}
                alCambiar={(id) => acciones.actualizarEstiloTextoElemento(sId, elemento.id, { curva: id === 'recto' ? undefined : id === 'arriba' ? 45 : -45 })}
              />
              <p className="text-[11px] text-slate-500 mt-2">Funciona mejor con textos de una línea. Al escribir se ve recto y vuelve a curvarse al terminar.</p>
            </PanelHerramienta>,
          ]
          break
        case 'imagen':
          titulo = 'Foto'
          herramientas = [
            <BotonAccion key="reemplazar" etiqueta="Cambiar" icono={<ImageIcon size={TAMANO_ICONO} />} alPulsar={() => acciones.reemplazarImagen(sId, elemento.id)} esMovil={esMovil} />,
            <BotonAccion key="recortar" etiqueta="Recortar" icono={<Crop size={TAMANO_ICONO} />} deshabilitado={!elemento.url} alPulsar={() => acciones.abrirRecorte(sId, elemento.id)} esMovil={esMovil} />,
            <PanelHerramienta key="mascara" id="mascara" etiqueta="Forma" titulo="Forma de la foto" icono={<Frame size={TAMANO_ICONO} />} {...comunes}>
              <div className="grid grid-cols-4 gap-2">
                {CATALOGO_MASCARAS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => actualizar({ mascara: m.id as MascaraImagen })}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border cursor-pointer ${
                      (elemento.mascara ?? 'ninguna') === m.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-9 h-9 bg-slate-400" style={estiloMascara(m.id as MascaraImagen, 14)} />
                    <span className="text-[9px] font-semibold text-slate-600">{m.nombre}</span>
                  </button>
                ))}
              </div>
              {(elemento.mascara === 'redondeada' || elemento.mascara === 'ninguna' || !elemento.mascara) && (
                <Deslizador etiqueta="Esquinas redondeadas" valor={elemento.radio ?? 0} min={0} max={50} unidad="%" alCambiar={(v) => actualizar({ radio: v, mascara: v > 0 ? 'redondeada' : 'ninguna' })} />
              )}
            </PanelHerramienta>,
            <PanelHerramienta key="filtro" id="filtro" etiqueta="Filtros" titulo="Filtros" icono={<Palette size={TAMANO_ICONO} />} {...comunes}>
              <div className="grid grid-cols-4 gap-2">
                {CATALOGO_FILTROS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => actualizar({ filtro: f.id as FiltroImagen })}
                    className={`flex flex-col items-center gap-1 p-1 rounded-lg border cursor-pointer ${
                      (elemento.filtro ?? 'ninguno') === f.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {elemento.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={elemento.url} alt="" className="w-11 h-11 object-cover rounded" style={{ filter: f.css }} />
                    )}
                    <span className="text-[9px] font-semibold text-slate-600">{f.nombre}</span>
                  </button>
                ))}
              </div>
            </PanelHerramienta>,
            <PanelHerramienta key="borde" id="borde" etiqueta="Borde" titulo="Borde y sombra" icono={<Square size={TAMANO_ICONO} />} {...comunes}>
              <Deslizador etiqueta="Grosor del borde" valor={elemento.bordeAncho ?? 0} min={0} max={16} unidad=" px" alCambiar={(v) => actualizar({ bordeAncho: v })} />
              {(elemento.bordeAncho ?? 0) > 0 && (
                <SelectorColor valor={elemento.bordeColor} alCambiar={(c) => actualizar({ bordeColor: c })} coloresTema={coloresTema} etiquetaQuitar="Color del tema" />
              )}
              <Separador />
              <button
                type="button"
                onClick={() => actualizar({ sombra: !elemento.sombra })}
                className={`w-full h-9 rounded-lg border text-[11px] font-semibold cursor-pointer ${elemento.sombra ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
              >
                {elemento.sombra ? '✓ Con sombra' : 'Agregar sombra'}
              </button>
            </PanelHerramienta>,
          ]
          break
        case 'sticker':
        case 'icono':
          titulo = elemento.tipo === 'sticker' ? 'Sticker' : 'Ícono'
          herramientas = [
            <PanelHerramienta key="color" id="color" etiqueta="Color" titulo="Color" icono={<span className="w-4 h-4 rounded-full border border-slate-300" style={{ background: elemento.color || visual.colorPrimario }} />} {...comunes}>
              <SelectorColor valor={elemento.color} alCambiar={(c) => actualizar({ color: c })} coloresTema={coloresTema} etiquetaQuitar="Color de acento del tema" />
            </PanelHerramienta>,
            ...(elemento.tipo === 'icono'
              ? [
                  <PanelHerramienta key="cambiar" id="cambiar" etiqueta="Cambiar" titulo="Elegir ícono" icono={<RefreshCw size={TAMANO_ICONO} />} anchoEscritorio="w-80" {...comunes}>
                    <div className="grid grid-cols-6 gap-1.5">
                      {LISTA_ICONOS_DISPONIBLES.map((ic) => (
                        <button
                          key={ic.id}
                          type="button"
                          title={ic.etiqueta}
                          onClick={() => actualizar({ icono: ic.id as NombreIcono })}
                          className={`aspect-square rounded-lg border flex items-center justify-center cursor-pointer ${elemento.icono === ic.id ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                          <IconoDinamico nombre={ic.id} size={18} />
                        </button>
                      ))}
                    </div>
                  </PanelHerramienta>,
                ]
              : []),
          ]
          break
        case 'forma':
          titulo = 'Forma'
          herramientas = [
            <PanelHerramienta key="relleno" id="relleno" etiqueta="Relleno" titulo="Color de relleno" icono={<span className="w-4 h-4 rounded border border-slate-300" style={{ background: elemento.colorRelleno || visual.colorPrimario }} />} {...comunes}>
              <SelectorColor valor={elemento.colorRelleno} alCambiar={(c) => actualizar({ colorRelleno: c })} coloresTema={coloresTema} etiquetaQuitar="Color de acento del tema" />
            </PanelHerramienta>,
            <PanelHerramienta key="borde" id="borde" etiqueta="Borde" titulo="Borde" icono={<Square size={TAMANO_ICONO} />} {...comunes}>
              <Deslizador etiqueta={elemento.forma === 'linea' ? 'Grosor de la línea' : 'Grosor del borde'} valor={elemento.grosorBorde ?? 0} min={0} max={20} unidad=" px" alCambiar={(v) => actualizar({ grosorBorde: v })} />
              {elemento.forma === 'rectangulo' && (
                <Deslizador etiqueta="Esquinas redondeadas" valor={elemento.radio ?? 0} min={0} max={50} unidad="%" alCambiar={(v) => actualizar({ radio: v })} />
              )}
              <SelectorColor valor={elemento.colorBorde} alCambiar={(c) => actualizar({ colorBorde: c })} coloresTema={coloresTema} etiquetaQuitar="Sin color de borde" />
            </PanelHerramienta>,
          ]
          break
      }
      herramientas.push(...controlesComunesElemento(elemento, sId, acciones, abierta, setAbierta, esMovil))
      // Eliminar va al principio: en el celular la barra es larga y al final quedaba escondido
      herramientas.unshift(
        <BotonAccion key="eliminar" etiqueta="Eliminar" icono={<Trash2 size={TAMANO_ICONO} />} peligro alPulsar={() => acciones.eliminarElemento(sId, elemento.id)} esMovil={esMovil} />
      )
    }
  } else if (seleccion.tipo === 'seccion') {
    const estilo = seccion.estilo || {}
    const sId = seccion.id
    const esCabecera = seccion.tipo === 'cabecera'
    titulo = 'Sección'
    herramientas = [
      <BotonAccion key="agregar" etiqueta="Añadir aquí" icono={<Plus size={TAMANO_ICONO} />} alPulsar={acciones.abrirAgregar} esMovil={esMovil} />,
      <PanelHerramienta key="fondo" id="fondo" etiqueta="Fondo" titulo="Fondo de la sección" icono={<Palette size={TAMANO_ICONO} />} {...comunes}>
        <SelectorColor
          valor={estilo.colorFondo}
          alCambiar={(c) => acciones.actualizarEstiloSeccion(sId, { colorFondo: c })}
          coloresTema={coloresTema}
          etiquetaQuitar="Sin color de fondo"
        />
        <Separador />
        <button
          type="button"
          onClick={() => acciones.subirFondoSeccion(sId)}
          className="w-full h-9 rounded-lg border border-slate-200 text-[11px] font-semibold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <ImageIcon size={13} /> {estilo.imagenFondo ? 'Cambiar foto de fondo' : 'Poner una foto de fondo'}
        </button>
        {estilo.imagenFondo && (
          <>
            <Deslizador
              etiqueta="Intensidad de la foto"
              valor={Math.round((estilo.opacidadImagenFondo ?? 1) * 100)}
              min={5}
              max={100}
              unidad="%"
              alCambiar={(v) => acciones.actualizarEstiloSeccion(sId, { opacidadImagenFondo: v / 100 })}
            />
            <button
              type="button"
              onClick={() => acciones.actualizarEstiloSeccion(sId, { imagenFondo: undefined, opacidadImagenFondo: undefined })}
              className="w-full h-8 rounded-lg border border-dashed border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Quitar foto de fondo
            </button>
          </>
        )}
      </PanelHerramienta>,
      <PanelHerramienta key="animacion" id="animacion" etiqueta="Animar" titulo="Animación de la sección" icono={<Wand2 size={TAMANO_ICONO} />} {...comunes}>
        <GrupoOpciones<AnimacionEntrada>
          columnas={2}
          valor={estilo.animacion ?? 'ninguna'}
          opciones={CATALOGO_ANIMACIONES.map((a) => ({ id: a.id, etiqueta: a.nombre }))}
          alCambiar={(id) => acciones.actualizarEstiloSeccion(sId, { animacion: id })}
        />
      </PanelHerramienta>,
      ...(seccion.tipo === 'lienzo_libre'
        ? [
            <PanelHerramienta key="alto" id="alto" etiqueta="Alto" titulo="Alto del lienzo" icono={<MoveVertical size={TAMANO_ICONO} />} {...comunes}>
              <Deslizador
                etiqueta="Alto respecto al ancho"
                valor={estilo.alturaLienzo ?? 75}
                min={15}
                max={220}
                unidad="%"
                alCambiar={(v) => acciones.actualizarEstiloSeccion(sId, { alturaLienzo: v })}
              />
            </PanelHerramienta>,
          ]
        : []),
      <BotonAccion key="subir" etiqueta="Subir" icono={<ArrowUp size={TAMANO_ICONO} />} alPulsar={() => acciones.moverSeccion(sId, 'arriba')} esMovil={esMovil} />,
      <BotonAccion key="bajar" etiqueta="Bajar" icono={<ArrowDown size={TAMANO_ICONO} />} alPulsar={() => acciones.moverSeccion(sId, 'abajo')} esMovil={esMovil} />,
      <BotonAccion key="duplicar" etiqueta="Duplicar" icono={<Copy size={TAMANO_ICONO} />} deshabilitado={esCabecera} alPulsar={() => acciones.duplicarSeccion(sId)} esMovil={esMovil} />,
      <BotonAccion key="ocultar" etiqueta={seccion.visible ? 'Ocultar' : 'Mostrar'} icono={seccion.visible ? <EyeOff size={TAMANO_ICONO} /> : <Eye size={TAMANO_ICONO} />} alPulsar={() => acciones.ocultarSeccion(sId)} esMovil={esMovil} />,
      <BotonAccion key="eliminar" etiqueta="Eliminar" icono={<Trash2 size={TAMANO_ICONO} />} peligro deshabilitado={esCabecera} alPulsar={() => acciones.eliminarSeccion(sId)} esMovil={esMovil} />,
    ]
  }

  if (esMovil) {
    return (
      <div className="flex items-stretch gap-0.5 overflow-x-auto px-1.5 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] touch-pan-x">
        {seleccion && (
          <button
            type="button"
            onClick={() => acciones.seleccionar(null)}
            className="flex flex-col items-center justify-center gap-1 min-w-[58px] h-[58px] rounded-xl text-[10px] font-bold shrink-0 text-emerald-700 active:bg-emerald-50"
          >
            <Check size={TAMANO_ICONO} />
            <span className="leading-none">Listo</span>
          </button>
        )}
        {herramientas}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mr-1">
        {titulo}
      </span>
      <div className="flex items-center gap-0.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] min-w-0">
        {herramientas}
      </div>
      {seleccion && (
        <button
          type="button"
          onClick={() => acciones.seleccionar(null)}
          className="ml-auto shrink-0 h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1"
          title="Terminar (Esc)"
        >
          <Check size={13} /> Listo
        </button>
      )}
    </div>
  )
}
