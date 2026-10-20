'use client'

import React, { useState } from 'react'
import type {
  AnimacionEntrada,
  CancionPropuesta,
  DetalleEvento,
  ElementoItinerario,
  EstiloSeccion,
  HotelHospedaje,
  OpcionJuego,
  PersonaDestacada,
  RegaloReservable,
  SeccionModular,
} from '@/types/invitation'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { CATALOGO_ANIMACIONES } from '@/lib/editor/estilos'
import { MuestraOrnamento } from '@/components/invitacion/ornamentos'
import type { TemaInvitacion } from '@/components/invitacion/tema'
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, ImageIcon, Plus, ShieldCheck, Sparkles, Trash2, Type } from 'lucide-react'
import {
  AreaTexto,
  Campo,
  CampoFechaHora,
  EditorLista,
  Interruptor,
  Segmentos,
  SubirFoto,
  TituloGrupo,
  idCorto,
} from './ui'
import { AjustesConfirmacion } from './ajustes-confirmacion'

export interface ActualizadoresBloque {
  alCampo: (sId: string, campo: keyof SeccionModular, valor: unknown) => void
  alDato: (sId: string, campo: string, valor: unknown) => void
  alEstilo: (sId: string, cambios: Partial<EstiloSeccion>) => void
  alEvento: (cambios: Partial<DetalleEvento>) => void
  mover: (sId: string, direccion: 'arriba' | 'abajo') => void
  duplicar: (sId: string) => void
  alternarVisible: (sId: string) => void
  eliminar: (sId: string) => void
  abrirElementosCollage: (sId: string) => void
  /** Selecciona el título del bloque en la invitación y abre sus herramientas de letra, color, borde y sombra */
  estilizarTitulo: (sId: string) => void
  /** Texto libre nuevo dentro del bloque, o panel de fotos, stickers y formas */
  agregarElemento: (sId: string, tipo: 'texto' | 'foto' | 'mas') => void
}

const SIN_TITULO_VISIBLE: SeccionModular['tipo'][] = ['imagen_libre', 'separador_ornamental', 'lienzo_libre']

const VARIANTES: Partial<Record<SeccionModular['tipo'], { id: string; nombre: string }[]>> = {
  cabecera: [
    { id: 'arco', nombre: 'Foto en arco' },
    { id: 'circulo', nombre: 'Foto redonda' },
    { id: 'completa', nombre: 'Foto completa' },
    { id: 'sin_foto', nombre: 'Sin foto' },
  ],
  cuenta_regresiva: [
    { id: 'cajas', nombre: 'Cajas' },
    { id: 'linea', nombre: 'Una línea' },
  ],
  itinerario: [
    { id: 'linea', nombre: 'Línea de tiempo' },
    { id: 'tarjetas', nombre: 'Tarjetas' },
    { id: 'columnas', nombre: 'Dos columnas' },
  ],
}

type Pestana = 'contenido' | 'diseno' | 'decoracion'

interface InspectorProps {
  seccion: SeccionModular
  evento: DetalleEvento
  tema: TemaInvitacion
  act: ActualizadoresBloque
  esPrimera: boolean
  esUltima: boolean
}

export function Inspector({ seccion, evento, tema, act, esPrimera, esUltima }: InspectorProps) {
  const [pestana, setPestana] = useState<Pestana>('contenido')
  const meta = CATALOGO_SECCIONES.find((m) => m.tipo === seccion.tipo)
  const esPortada = seccion.tipo === 'cabecera'
  const sinDecoracion = seccion.tipo === 'separador_ornamental'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{esPortada ? 'Bloque de inicio' : meta?.nombre}</span>
          <h2 className="m-0 text-[19px] leading-tight font-extrabold text-slate-900">{esPortada ? 'Portada' : seccion.titulo || meta?.nombre}</h2>
        </div>
        <div className="flex gap-1.5">
          <button type="button" aria-label="Subir bloque" disabled={esPrimera} onClick={() => act.mover(seccion.id, 'arriba')} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer">
            <ArrowUp size={15} />
          </button>
          <button type="button" aria-label="Bajar bloque" disabled={esUltima} onClick={() => act.mover(seccion.id, 'abajo')} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center disabled:opacity-30 cursor-pointer">
            <ArrowDown size={15} />
          </button>
          {/* La portada se mueve como cualquier bloque, pero no se duplica ni se elimina: toda invitación tiene una */}
          {!esPortada && (
            <>
              <button type="button" aria-label="Duplicar bloque" onClick={() => act.duplicar(seccion.id)} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
                <Copy size={15} />
              </button>
            </>
          )}
          <button type="button" aria-label={seccion.visible ? 'Ocultar bloque' : 'Mostrar bloque'} onClick={() => act.alternarVisible(seccion.id)} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center cursor-pointer">
            {seccion.visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          {!esPortada && (
            <button type="button" aria-label="Eliminar bloque" onClick={() => act.eliminar(seccion.id)} className="w-9 h-9 rounded-lg border border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {!sinDecoracion && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Agregar a este bloque</span>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => act.agregarElemento(seccion.id, 'texto')} className="min-h-11 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800">
              <Type size={15} /> Texto
            </button>
            <button type="button" onClick={() => act.agregarElemento(seccion.id, 'foto')} className="min-h-11 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800">
              <ImageIcon size={15} /> Foto
            </button>
            <button type="button" onClick={() => act.agregarElemento(seccion.id, 'mas')} className="min-h-11 rounded-xl border border-slate-300 text-[13px] font-bold text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50">
              <Plus size={15} /> Stickers
            </button>
          </div>
          <span className="text-[12px] text-slate-500">Cualquier imagen (JPG, PNG, GIF, WebP…). Muévela, gírala y agrándala; si la sueltas sobre otro bloque, pasa a ese bloque.</span>
        </div>
      )}

      <div role="tablist" aria-label="Opciones del bloque" className="flex p-1 rounded-xl bg-slate-100">
        {(
          [
            ['contenido', 'Contenido'],
            ['diseno', 'Diseño'],
            ...(sinDecoracion ? [] : [['decoracion', 'Decoración']]),
          ] as [Pestana, string][]
        ).map(([id, nombre]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={`flex-1 min-h-9 rounded-lg text-[13px] cursor-pointer ${pestana === id ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-semibold text-slate-600'}`}
          >
            {nombre}
          </button>
        ))}
      </div>

      {pestana === 'contenido' && <Contenido seccion={seccion} evento={evento} act={act} />}
      {pestana === 'diseno' && <Diseno seccion={seccion} evento={evento} act={act} />}
      {pestana === 'decoracion' && <Decoracion seccion={seccion} tema={tema} act={act} />}
    </div>
  )
}

function Contenido({ seccion, evento, act }: { seccion: SeccionModular; evento: DetalleEvento; act: ActualizadoresBloque }) {
  const d = seccion.datos || {}
  const s = seccion.id
  const carpeta = evento.id
  const dato = (campo: string) => (v: unknown) => act.alDato(s, campo, v)
  const titulo = <Campo etiqueta="Título del bloque" valor={seccion.titulo} alCambiar={(v) => act.alCampo(s, 'titulo', v)} />
  const fechaHora = (
    <CampoFechaHora fechaIso={evento.fechaEvento} alCambiar={(fechaEvento, horaEvento) => act.alEvento({ fechaEvento, horaEvento })} />
  )
  const consejo = (
    <p className="m-0 p-3 rounded-xl bg-amber-50 text-[13px] leading-snug text-amber-900">
      Toca cualquier texto en la invitación para escribir encima y cambiarle la letra, el color, el borde o la sombra.
    </p>
  )

  switch (seccion.tipo) {
    case 'cabecera': {
      const conFoto = (seccion.estilo?.variante || (d.imagenPortada ? 'arco' : 'sin_foto')) !== 'sin_foto'
      return (
        <div className="flex flex-col gap-3.5">
          <Campo etiqueta="Frase de apertura" valor={seccion.subtitulo} alCambiar={(v) => act.alCampo(s, 'subtitulo', v)} placeholder="¡Nos casamos!" />
          <Campo etiqueta="Nombres" valor={seccion.titulo} alCambiar={(v) => act.alCampo(s, 'titulo', v)} />
          {fechaHora}
          <Campo etiqueta="Lugar" valor={evento.direccion} alCambiar={(v) => act.alEvento({ direccion: v })} />
          <div className="flex flex-col gap-3 p-3 rounded-xl border border-slate-200">
            <Interruptor
              etiqueta="Foto en la portada"
              descripcion={conFoto ? 'Apágala si no quieres foto' : 'La portada queda solo con texto'}
              activo={conFoto}
              alCambiar={(v) => {
                act.alEstilo(s, { variante: v ? 'arco' : 'sin_foto' })
                if (!v) act.alDato(s, 'imagenPortada', undefined)
              }}
            />
            {conFoto && (
              <SubirFoto
                url={d.imagenPortada}
                alCambiar={(url) => {
                  act.alDato(s, 'imagenPortada', url)
                  if (!url) act.alEstilo(s, { variante: 'sin_foto' })
                }}
                carpeta={carpeta}
                etiqueta="Foto de portada"
              />
            )}
          </div>
          {consejo}
        </div>
      )
    }
    case 'cuenta_regresiva':
    case 'fecha_hora':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          {fechaHora}
          <p className="m-0 text-[12px] text-slate-500">Es la misma fecha de toda la invitación.</p>
        </div>
      )
    case 'itinerario':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <EditorLista<ElementoItinerario>
            etiqueta="Momentos"
            items={d.itinerario || []}
            alCambiar={dato('itinerario')}
            crear={() => ({ id: idCorto('it'), hora: '', titulo: '' })}
            textoAgregar="Agregar momento"
            render={(it, actualizar) => (
              <>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <Campo etiqueta="Hora" valor={it.hora} alCambiar={(v) => actualizar({ hora: v })} placeholder="5:00 p. m." />
                  <Campo etiqueta="Momento" valor={it.titulo} alCambiar={(v) => actualizar({ titulo: v })} placeholder="Ceremonia" />
                </div>
                <Campo etiqueta="Detalle (opcional)" valor={it.descripcion} alCambiar={(v) => actualizar({ descripcion: v })} />
              </>
            )}
          />
          <Campo etiqueta="Nombre del lugar" valor={d.nombreLugar} alCambiar={dato('nombreLugar')} />
          <Campo etiqueta="Dirección" valor={d.direccion} alCambiar={dato('direccion')} ayuda="Con la dirección se arman solos los botones de Google Maps y Waze." />
        </div>
      )
    case 'ubicacion':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Nombre del lugar" valor={d.nombreLugar} alCambiar={dato('nombreLugar')} />
          <Campo etiqueta="Dirección" valor={d.direccion} alCambiar={dato('direccion')} ayuda="Se usa para los botones de Google Maps y Waze." />
          <AreaTexto etiqueta="Indicaciones (opcional)" valor={d.detallesAcceso} alCambiar={dato('detallesAcceso')} placeholder="Piso, parqueadero, cómo entrar…" filas={2} />
          <Campo etiqueta="Enlace de Google Maps (opcional)" tipo="url" valor={d.enlaceMapa} alCambiar={dato('enlaceMapa')} />
        </div>
      )
    case 'codigo_vestimenta':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Código" valor={d.etiqueta} alCambiar={dato('etiqueta')} placeholder="Formal de jardín" />
          <AreaTexto etiqueta="Nota (opcional)" valor={d.notasVestimenta} alCambiar={dato('notasVestimenta')} placeholder="Por favor evita el blanco" filas={2} />
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate-700">Colores sugeridos</span>
            <div className="flex flex-wrap items-center gap-2">
              {(d.coloresSugeridos || []).map((c, i) => (
                <button key={c + i} type="button" aria-label={`Quitar ${c}`} onClick={() => act.alDato(s, 'coloresSugeridos', (d.coloresSugeridos || []).filter((_, j) => j !== i))} className="w-9 h-9 rounded-full border-2 border-white shadow-[0_0_0_1px_#cbd5e1] cursor-pointer" style={{ backgroundColor: c }} />
              ))}
              <label className="w-9 h-9 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-600 text-lg cursor-pointer relative" aria-label="Agregar color">
                +
                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => act.alDato(s, 'coloresSugeridos', [...(d.coloresSugeridos || []), e.target.value].slice(0, 8))} />
              </label>
            </div>
          </div>
        </div>
      )
    case 'regalos_bancarios':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <AreaTexto etiqueta="Mensaje" valor={seccion.subtitulo} alCambiar={(v) => act.alCampo(s, 'subtitulo', v)} filas={2} />
          <div className="grid grid-cols-2 gap-2">
            <Campo etiqueta="Banco" valor={d.banco} alCambiar={dato('banco')} placeholder="Bancolombia" />
            <Campo etiqueta="Tipo de cuenta" valor={d.tipoCuenta} alCambiar={dato('tipoCuenta')} placeholder="Ahorros" />
          </div>
          <Campo etiqueta="Número de cuenta" valor={d.numeroCuenta} alCambiar={dato('numeroCuenta')} ayuda="Si lo dejas vacío, el recuadro no se muestra a los invitados." />
          <Campo etiqueta="Titular" valor={d.titular} alCambiar={dato('titular')} />
          <Campo etiqueta="Enlace a mesa de regalos (opcional)" tipo="url" valor={d.enlaceListaRegalos} alCambiar={dato('enlaceListaRegalos')} />
        </div>
      )
    case 'galeria_fotos':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <div className="grid grid-cols-3 gap-2">
            {(d.fotos || []).map((f, i) => (
              <div key={f + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f} alt="" className="w-full aspect-square object-cover rounded-lg" />
                <button type="button" aria-label="Quitar foto" onClick={() => act.alDato(s, 'fotos', (d.fotos || []).filter((_, j) => j !== i))} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-white/90 text-rose-600 flex items-center justify-center cursor-pointer">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          {(d.fotos || []).length < 12 && <SubirFoto url={undefined} alCambiar={(url) => url && act.alDato(s, 'fotos', [...(d.fotos || []), url])} carpeta={carpeta} etiqueta="Agregar foto" />}
        </div>
      )
    case 'mensaje_libre':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <AreaTexto etiqueta="Frase o dedicatoria" valor={d.mensaje} alCambiar={dato('mensaje')} filas={4} />
          <Campo etiqueta="Autor (opcional)" valor={d.autorMensaje} alCambiar={dato('autorMensaje')} />
        </div>
      )
    case 'historia':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <AreaTexto etiqueta="Historia" valor={d.cuerpoTexto} alCambiar={dato('cuerpoTexto')} placeholder="Cómo se conocieron, un recuerdo especial…" filas={5} />
          <SubirFoto url={d.urlImagen} alCambiar={(url) => act.alDato(s, 'urlImagen', url)} carpeta={carpeta} etiqueta="Foto (opcional)" />
        </div>
      )
    case 'hospedaje':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <EditorLista<HotelHospedaje>
            etiqueta="Hoteles recomendados"
            items={d.hoteles || []}
            alCambiar={dato('hoteles')}
            crear={() => ({ id: idCorto('ht'), nombre: '' })}
            textoAgregar="Agregar hotel"
            render={(h, actualizar) => (
              <>
                <Campo etiqueta="Nombre" valor={h.nombre} alCambiar={(v) => actualizar({ nombre: v })} />
                <Campo etiqueta="Dirección" valor={h.direccion} alCambiar={(v) => actualizar({ direccion: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Campo etiqueta="Teléfono" tipo="tel" valor={h.telefono} alCambiar={(v) => actualizar({ telefono: v })} />
                  <Campo etiqueta="Enlace" tipo="url" valor={h.enlace} alCambiar={(v) => actualizar({ enlace: v })} />
                </div>
              </>
            )}
          />
        </div>
      )
    case 'padrinos':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <EditorLista<PersonaDestacada>
            etiqueta="Personas"
            items={d.personas || []}
            alCambiar={dato('personas')}
            crear={() => ({ id: idCorto('pd'), nombre: '' })}
            textoAgregar="Agregar persona"
            render={(p, actualizar) => (
              <div className="grid grid-cols-2 gap-2">
                <Campo etiqueta="Nombre" valor={p.nombre} alCambiar={(v) => actualizar({ nombre: v })} />
                <Campo etiqueta="Rol (opcional)" valor={p.rol} alCambiar={(v) => actualizar({ rol: v })} placeholder="Padrinos de anillos" />
              </div>
            )}
          />
        </div>
      )
    case 'playlist':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Texto de apoyo" valor={seccion.subtitulo} alCambiar={(v) => act.alCampo(s, 'subtitulo', v)} />
          <Campo etiqueta="Enlace a la playlist (Spotify, YouTube…)" tipo="url" valor={d.enlacePlaylist} alCambiar={dato('enlacePlaylist')} />
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-slate-700">Canciones propuestas por tus invitados ({(d.canciones || []).length})</span>
            {(d.canciones || []).length === 0 && <span className="text-[12px] text-slate-500">Aparecerán aquí cuando tus invitados las agreguen.</span>}
            {(d.canciones || []).map((c: CancionPropuesta) => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex-1 min-w-0 text-[13px]">
                  <b>{c.titulo}</b>
                  {c.artista ? ` · ${c.artista}` : ''}
                  {c.propuestaPor ? <span className="text-slate-500"> — {c.propuestaPor}</span> : null}
                </span>
                <button
                  type="button"
                  aria-label="Quitar canción"
                  onClick={() => {
                    act.alDato(s, 'canciones', (d.canciones || []).filter((x) => x.id !== c.id))
                    act.alDato(s, 'cancionesEliminadas', [...(d.cancionesEliminadas || []), c.id])
                  }}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    case 'vaca_regalo':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <AreaTexto etiqueta="¿Para qué es la vaca?" valor={seccion.subtitulo} alCambiar={(v) => act.alCampo(s, 'subtitulo', v)} filas={2} />
          <div className="grid grid-cols-2 gap-2">
            <Campo etiqueta="Meta (COP)" tipo="number" valor={d.metaVaca || ''} alCambiar={(v) => act.alDato(s, 'metaVaca', Number(v) || 0)} />
            <Campo etiqueta="Reunido (COP)" tipo="number" valor={d.recaudadoVaca || ''} alCambiar={(v) => act.alDato(s, 'recaudadoVaca', Number(v) || 0)} />
          </div>
          <Campo etiqueta="Cómo aportar" valor={d.medioPagoVaca} alCambiar={dato('medioPagoVaca')} placeholder="Nequi 300 123 4567" />
          <Campo etiqueta="Enlace de pago (opcional)" tipo="url" valor={d.enlacePagoVaca} alCambiar={dato('enlacePagoVaca')} />
        </div>
      )
    case 'lista_regalos':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Texto de apoyo" valor={seccion.subtitulo} alCambiar={(v) => act.alCampo(s, 'subtitulo', v)} />
          <EditorLista<RegaloReservable>
            etiqueta="Regalos"
            items={d.regalos || []}
            alCambiar={dato('regalos')}
            crear={() => ({ id: idCorto('rg'), nombre: '' })}
            textoAgregar="Agregar regalo"
            maximo={60}
            render={(r, actualizar) => (
              <>
                <Campo etiqueta="Regalo" valor={r.nombre} alCambiar={(v) => actualizar({ nombre: v })} />
                <Campo etiqueta="Precio de referencia (opcional)" valor={r.precio} alCambiar={(v) => actualizar({ precio: v || undefined })} placeholder="$120.000" />
                <Campo etiqueta="Enlace a la tienda (opcional)" tipo="url" valor={r.enlace} alCambiar={(v) => actualizar({ enlace: v })} />
                <SubirFoto url={r.imagen} alCambiar={(url) => actualizar({ imagen: url })} carpeta={carpeta} etiqueta="Foto (opcional)" />
                {r.reservadoPor && (
                  <span className="text-[12px] font-semibold text-emerald-700">
                    Reservado por {r.reservadoPor}{' '}
                    <button type="button" onClick={() => actualizar({ reservadoPor: undefined })} className="underline cursor-pointer">
                      liberar
                    </button>
                  </span>
                )}
              </>
            )}
          />
        </div>
      )
    case 'juego_adivinar':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Pregunta" valor={d.pregunta} alCambiar={dato('pregunta')} />
          <EditorLista<OpcionJuego>
            etiqueta="Opciones"
            items={d.opcionesJuego || []}
            alCambiar={dato('opcionesJuego')}
            crear={() => ({ id: idCorto('op'), texto: '', votos: 0 })}
            textoAgregar="Agregar opción"
            maximo={6}
            render={(o, actualizar) => (
              <>
                <Campo etiqueta="Opción" valor={o.texto} alCambiar={(v) => actualizar({ texto: v })} />
                <span className="text-[12px] text-slate-500">{o.votos || 0} votos</span>
              </>
            )}
          />
        </div>
      )
    case 'confirmacion_rsvp':
      return (
        <div className="flex flex-col gap-3.5">
          <Campo etiqueta="Pregunta" valor={seccion.titulo} alCambiar={(v) => act.alCampo(s, 'titulo', v)} placeholder="¿Nos acompañas?" />
          <Campo etiqueta="Texto del botón" valor={d.textoBoton} alCambiar={dato('textoBoton')} placeholder="Confirmar asistencia" />
          <Campo etiqueta="Fecha límite para responder (opcional)" valor={d.fechaLimiteRsvp} alCambiar={dato('fechaLimiteRsvp')} placeholder="20 de febrero" />
          <AjustesConfirmacion seccion={seccion} evento={evento} alDato={act.alDato} alEvento={act.alEvento} />
          <p className="m-0 text-[12px] text-slate-500">Cada invitado ve su nombre y cuántos lugares tiene. Las respuestas llegan a tu panel de invitados.</p>
        </div>
      )
    case 'texto_libre':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <AreaTexto etiqueta="Texto" valor={d.cuerpoTexto} alCambiar={dato('cuerpoTexto')} filas={5} />
          <Segmentos
            etiqueta="Alineación"
            opciones={[
              { id: 'izquierda', nombre: 'Izquierda' },
              { id: 'centro', nombre: 'Centro' },
              { id: 'derecha', nombre: 'Derecha' },
            ]}
            valor={d.alineacionTexto || 'centro'}
            alCambiar={dato('alineacionTexto')}
          />
        </div>
      )
    case 'imagen_libre':
      return (
        <div className="flex flex-col gap-3.5">
          <SubirFoto url={d.urlImagen} alCambiar={(url) => act.alDato(s, 'urlImagen', url)} carpeta={carpeta} />
          <Campo etiqueta="Pie de foto (opcional)" valor={d.pieImagen} alCambiar={dato('pieImagen')} />
          <Segmentos
            etiqueta="Formato"
            opciones={[
              { id: 'tarjeta', nombre: 'Tarjeta' },
              { id: 'banner', nombre: 'Ancha' },
              { id: 'circular', nombre: 'Redonda' },
            ]}
            valor={(d.formatoImagen as string) || 'tarjeta'}
            alCambiar={dato('formatoImagen')}
          />
        </div>
      )
    case 'boton_enlace':
      return (
        <div className="flex flex-col gap-3.5">
          {titulo}
          <Campo etiqueta="Texto del botón" valor={d.textoBoton} alCambiar={dato('textoBoton')} />
          <Campo etiqueta="Enlace" tipo="url" valor={d.urlBoton} alCambiar={dato('urlBoton')} placeholder="https://" />
          <Campo etiqueta="Texto de apoyo (opcional)" valor={d.subtextoBoton} alCambiar={dato('subtextoBoton')} />
        </div>
      )
    case 'lienzo_libre':
      return (
        <div className="flex flex-col gap-3.5">
          <p className="m-0 text-[13px] text-slate-600">Un espacio propio para ubicar libremente textos, fotos y stickers. Lo que pongas aquí no tapa el resto de la invitación.</p>
          <button type="button" onClick={() => act.abrirElementosCollage(s)} className="min-h-11 rounded-xl bg-slate-900 text-white text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer">
            <Sparkles size={16} /> Agregar textos, fotos o stickers
          </button>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
            Alto del collage
            <input type="range" min={25} max={200} value={seccion.estilo?.alturaLienzo ?? 75} onChange={(e) => act.alEstilo(s, { alturaLienzo: Number(e.target.value) })} className="accent-amber-500" />
          </label>
        </div>
      )
    default:
      return titulo
  }
}

function Diseno({ seccion, evento, act }: { seccion: SeccionModular; evento: DetalleEvento; act: ActualizadoresBloque }) {
  const estilo = seccion.estilo || {}
  const variantes = VARIANTES[seccion.tipo]
  const s = seccion.id
  return (
    <div className="flex flex-col gap-5">
      {!SIN_TITULO_VISIBLE.includes(seccion.tipo) && (
        <div className="flex flex-col gap-2">
          <TituloGrupo>Letra de los textos</TituloGrupo>
          <p className="m-0 text-[13px] leading-snug text-slate-600">Cada texto puede tener su propia letra, tamaño, color, borde y sombra. Toca un texto en la invitación o empieza por el título.</p>
          <button type="button" onClick={() => act.estilizarTitulo(s)} className="min-h-11 rounded-xl border border-slate-300 text-[14px] font-bold text-slate-900 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
            <Type size={16} /> Cambiar la letra del título
          </button>
        </div>
      )}
      {variantes && (
        <div className="flex flex-col gap-2">
          <TituloGrupo>Distribución</TituloGrupo>
          <div className="grid grid-cols-2 gap-2">
            {variantes.map((v, i) => {
              const activa = (estilo.variante || (seccion.tipo === 'cabecera' ? (seccion.datos?.imagenPortada ? 'arco' : 'sin_foto') : variantes[0].id)) === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => act.alEstilo(s, { variante: v.id })}
                  className={`min-h-16 rounded-xl border text-[13px] font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer ${activa ? 'border-amber-500 bg-amber-50 text-amber-900 border-2' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}
                >
                  <span className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: i + 1 }).map((_, j) => (
                      <span key={j} className={`h-1.5 rounded-full ${activa ? 'bg-amber-400' : 'bg-slate-300'}`} style={{ width: 22 - i * 4 }} />
                    ))}
                  </span>
                  {v.nombre}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {seccion.tipo !== 'separador_ornamental' && seccion.tipo !== 'lienzo_libre' && (
        <div className="flex flex-col gap-2">
          <TituloGrupo>Fondo del bloque</TituloGrupo>
          <Segmentos
            opciones={[
              { id: 'tarjeta', nombre: 'Tarjeta' },
              { id: 'sin_fondo', nombre: 'Sin fondo' },
              { id: 'foto', nombre: 'Foto' },
            ]}
            valor={estilo.fondoBloque || 'tarjeta'}
            alCambiar={(v) => act.alEstilo(s, { fondoBloque: v })}
          />
          {estilo.fondoBloque === 'foto' && (
            <>
              <SubirFoto url={estilo.imagenFondo} alCambiar={(url) => act.alEstilo(s, { imagenFondo: url })} carpeta={evento.id} etiqueta="Foto de fondo" />
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
                Intensidad de la foto
                <input type="range" min={10} max={70} value={Math.round((estilo.opacidadImagenFondo ?? 0.35) * 100)} onChange={(e) => act.alEstilo(s, { opacidadImagenFondo: Number(e.target.value) / 100 })} className="accent-amber-500" />
                <span className="text-[12px] font-normal text-slate-500">Se mantiene suave para que el texto siempre se lea.</span>
              </label>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <TituloGrupo>Animación al aparecer</TituloGrupo>
        <div className="flex flex-wrap gap-1.5">
          {CATALOGO_ANIMACIONES.filter((a) => ['ninguna', 'aparecer', 'deslizar_arriba', 'zoom', 'rebote'].includes(a.id)).map((a) => {
            const activa = (estilo.animacion || 'aparecer') === a.id
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={activa}
                onClick={() => act.alEstilo(s, { animacion: a.id as AnimacionEntrada })}
                className={`min-h-9 px-3 rounded-full text-[12px] font-semibold border cursor-pointer ${activa ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
              >
                {a.nombre}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Decoracion({ seccion, tema, act }: { seccion: SeccionModular; tema: TemaInvitacion; act: ActualizadoresBloque }) {
  const porDefecto = seccion.tipo === 'cabecera' || seccion.tipo === 'confirmacion_rsvp'
  const orn = seccion.estilo?.ornamento ?? { activo: porDefecto, posicion: 'esquinas' as const }
  const s = seccion.id
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2.5 p-3 rounded-xl bg-emerald-50 text-emerald-900 text-[13px] leading-snug">
        <ShieldCheck size={18} className="shrink-0" />
        Las decoraciones van en los bordes o detrás del texto. Nunca tapan la información.
      </div>
      {tema.ornamento === 'ninguno' ? (
        <p className="m-0 text-[13px] text-slate-600">El estilo actual no usa ornamentos. Cambia de estilo para tener ramas, filigranas, confeti o nubes.</p>
      ) : (
        <div className="flex flex-col gap-3 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-16 h-10 rounded-lg bg-slate-50 p-1" style={{ color: tema.detalle }}>
              <MuestraOrnamento tipo={tema.ornamento} color={tema.detalle} />
            </span>
            <div className="flex-1">
              <Interruptor etiqueta="Ornamento del estilo" activo={orn.activo} alCambiar={(v) => act.alEstilo(s, { ornamento: { ...orn, activo: v } })} />
            </div>
          </div>
          {orn.activo && (
            <Segmentos
              etiqueta="Dónde"
              opciones={[
                { id: 'esquinas', nombre: 'Esquinas' },
                { id: 'arriba', nombre: 'Arriba' },
                { id: 'detras', nombre: 'Detrás del texto' },
              ]}
              valor={orn.posicion}
              alCambiar={(v) => act.alEstilo(s, { ornamento: { activo: true, posicion: v } })}
            />
          )}
        </div>
      )}
    </div>
  )
}
