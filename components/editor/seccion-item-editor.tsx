'use client'

import React, { useRef } from 'react'
import {
  SeccionModular,
  ElementoItinerario,
  HotelHospedaje,
  NombreIcono,
} from '@/types/invitation'
import { SelectorIcono } from './selector-icono'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { IMAGENES_CURADAS } from '@/lib/modular-defaults'
import { comprimirImagen } from '@/lib/image-compression'
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Upload,
  Image as ImageIcon,
  Palette,
  ExternalLink,
  MapPin,
  Clock,
  Shirt,
  Gift,
  Building2,
  Sparkles,
  Camera,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Feather,
  Link as LinkIcon,
} from 'lucide-react'

interface SeccionItemEditorProps {
  seccion: SeccionModular
  indice: number
  totalSecciones: number
  expandido: boolean
  alAlternarExpandido: () => void
  alMover: (direccion: 'arriba' | 'abajo') => void
  alAlternarVisibilidad: () => void
  alEliminar: () => void
  alActualizarCampo: (campo: keyof SeccionModular, valor: any) => void
  alActualizarDatos: (campoDatos: string, valor: any) => void
}

export function SeccionItemEditor({
  seccion,
  indice,
  totalSecciones,
  expandido,
  alAlternarExpandido,
  alMover,
  alAlternarVisibilidad,
  alEliminar,
  alActualizarCampo,
  alActualizarDatos,
}: SeccionItemEditorProps) {
  const inputFilePortadaRef = useRef<HTMLInputElement>(null)
  const inputFileRetratoRef = useRef<HTMLInputElement>(null)
  const inputFileGaleriaRef = useRef<HTMLInputElement>(null)
  const inputFileImagenLibreRef = useRef<HTMLInputElement>(null)

  const handleSubirArchivo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onComplete: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const urlComprimida = await comprimirImagen(file)
      onComplete(urlComprimida)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onComplete(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Manejo de hitos en itinerario
  const agregarHitoItinerario = () => {
    const hitosActuales: ElementoItinerario[] = seccion.datos?.itinerario || []
    const nuevoHito: ElementoItinerario = {
      id: `it-${Date.now()}`,
      hora: '20:00',
      titulo: 'Nuevo Momento',
      descripcion: 'Detalle de la actividad',
      icono: 'sparkles',
    }
    alActualizarDatos('itinerario', [...hitosActuales, nuevoHito])
  }

  const actualizarHito = (id: string, campo: keyof ElementoItinerario, valor: any) => {
    const hitosActuales: ElementoItinerario[] = seccion.datos?.itinerario || []
    const actualizados = hitosActuales.map((h) => (h.id === id ? { ...h, [campo]: valor } : h))
    alActualizarDatos('itinerario', actualizados)
  }

  const eliminarHito = (id: string) => {
    const hitosActuales: ElementoItinerario[] = seccion.datos?.itinerario || []
    alActualizarDatos(
      'itinerario',
      hitosActuales.filter((h) => h.id !== id)
    )
  }

  // Manejo de paleta de vestimenta
  const agregarColorVestimenta = (color: string) => {
    const colores: string[] = seccion.datos?.coloresSugeridos || []
    if (!colores.includes(color)) {
      alActualizarDatos('coloresSugeridos', [...colores, color])
    }
  }

  const eliminarColorVestimenta = (indiceColor: number) => {
    const colores: string[] = seccion.datos?.coloresSugeridos || []
    alActualizarDatos(
      'coloresSugeridos',
      colores.filter((_, i) => i !== indiceColor)
    )
  }

  // Manejo de fotos en galería
  const agregarFotoGaleria = (url: string) => {
    if (!url) return
    const fotos: string[] = seccion.datos?.fotos || []
    alActualizarDatos('fotos', [...fotos, url])
  }

  const eliminarFotoGaleria = (indiceFoto: number) => {
    const fotos: string[] = seccion.datos?.fotos || []
    alActualizarDatos(
      'fotos',
      fotos.filter((_, i) => i !== indiceFoto)
    )
  }

  // Manejo de hoteles
  const agregarHotel = () => {
    const hoteles: HotelHospedaje[] = seccion.datos?.hoteles || []
    const nuevo: HotelHospedaje = {
      id: `hot-${Date.now()}`,
      nombre: 'Hotel Recomendado',
      direccion: 'Sector céntrico',
      telefono: '+57 (000) 000 0000',
    }
    alActualizarDatos('hoteles', [...hoteles, nuevo])
  }

  const actualizarHotel = (id: string, campo: keyof HotelHospedaje, valor: any) => {
    const hoteles: HotelHospedaje[] = seccion.datos?.hoteles || []
    alActualizarDatos(
      'hoteles',
      hoteles.map((h) => (h.id === id ? { ...h, [campo]: valor } : h))
    )
  }

  const eliminarHotel = (id: string) => {
    const hoteles: HotelHospedaje[] = seccion.datos?.hoteles || []
    alActualizarDatos(
      'hoteles',
      hoteles.filter((h) => h.id !== id)
    )
  }

  return (
    <div
      className={`border rounded-xl transition-all duration-200 bg-white shadow-2xs ${
        !seccion.visible ? 'opacity-55 border-slate-200' : 'border-slate-300'
      }`}
    >
      {/* Barra de Encabezado del Módulo */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 select-none">
        {/* Reordenar (Arriba / Abajo) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => alMover('arriba')}
            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Mover arriba"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            disabled={indice === totalSecciones - 1}
            onClick={() => alMover('abajo')}
            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Mover abajo"
          >
            <ArrowDown size={13} />
          </button>
        </div>

        {/* Icono y Título del Módulo */}
        <div
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          onClick={alAlternarExpandido}
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0">
            <IconoDinamico nombre={seccion.icono || 'sparkles'} size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 truncate">
                {seccion.titulo || 'Sección'}
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {seccion.tipo.replace('_', ' ')}
              </span>
            </div>
            {seccion.subtitulo && (
              <p className="text-[10px] text-slate-500 truncate">{seccion.subtitulo}</p>
            )}
          </div>
        </div>

        {/* Acciones Rápidas: Visibilidad, Eliminar, Expandir */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={alAlternarVisibilidad}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              seccion.visible
                ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'border-amber-300 bg-amber-50 text-amber-700'
            }`}
            title={seccion.visible ? 'Ocultar sección' : 'Mostrar sección'}
          >
            {seccion.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          {seccion.tipo !== 'cabecera' && seccion.tipo !== 'confirmacion_rsvp' && (
            <button
              type="button"
              onClick={alEliminar}
              className="w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
              title="Eliminar sección"
            >
              <Trash2 size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={alAlternarExpandido}
            className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title={expandido ? 'Colapsar configuración' : 'Expandir configuración'}
          >
            {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Contenido Expandible de Edición Dinámica */}
      {expandido && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3.5 bg-slate-50/50 rounded-b-xl animate-in fade-in duration-150">
          {/* Fila Básica: Título, Subtítulo e Icono */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Título del Módulo
              </label>
              <input
                type="text"
                value={seccion.titulo}
                onChange={(e) => alActualizarCampo('titulo', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                Icono Distintivo
              </label>
              <SelectorIcono
                iconoActual={seccion.icono}
                alSeleccionar={(nuevoIcono) => alActualizarCampo('icono', nuevoIcono)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Subtítulo / Bajada Descriptiva
            </label>
            <input
              type="text"
              value={seccion.subtitulo || ''}
              onChange={(e) => alActualizarCampo('subtitulo', e.target.value)}
              placeholder="Ej: Coordenadas e información de acceso"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* ════════ CAMPOS ESPECÍFICOS SEGÚN TIPO DE SECCIÓN ════════ */}

          {/* 1. CABECERA & IMÁGENES */}
          {seccion.tipo === 'cabecera' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* Fotografía de Portada */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={12} /> Fotografía de Portada Superior
                  </label>
                  <button
                    type="button"
                    onClick={() => inputFilePortadaRef.current?.click()}
                    className="text-[10px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload size={11} /> Subir archivo local
                  </button>
                  <input
                    ref={inputFilePortadaRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleSubirArchivo(e, (url) => alActualizarDatos('imagenPortada', url))
                    }
                  />
                </div>

                <input
                  type="url"
                  value={seccion.datos?.imagenPortada || ''}
                  onChange={(e) => alActualizarDatos('imagenPortada', e.target.value)}
                  placeholder="https://... URL de la imagen de portada"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />

                {/* Presets de Portada Curados */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[9px] text-slate-500 uppercase shrink-0">Sugerencias:</span>
                  {IMAGENES_CURADAS.portadas.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => alActualizarDatos('imagenPortada', img.url)}
                      className="px-2 py-1 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-[9px] font-medium shrink-0 cursor-pointer"
                      title={img.titulo}
                    >
                      {img.titulo.split('&')[0]}
                    </button>
                  ))}
                  {seccion.datos?.imagenPortada && (
                    <button
                      type="button"
                      onClick={() => alActualizarDatos('imagenPortada', '')}
                      className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[9px] font-medium shrink-0 cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>

              {/* Distintivo Superior (Badge / Convocatoria Oficial) */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-slate-600" /> Distintivo Superior (Badge)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nuevoEstado = seccion.datos?.mostrarBadge === false
                      alActualizarDatos('mostrarBadge', nuevoEstado)
                      if (nuevoEstado && !seccion.datos?.textoBadge) {
                        alActualizarDatos('textoBadge', 'Convocatoria Oficial')
                      }
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                      seccion.datos?.mostrarBadge !== false
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-300'
                    }`}
                  >
                    {seccion.datos?.mostrarBadge !== false ? 'Visible' : 'Oculto'}
                  </button>
                </div>

                {seccion.datos?.mostrarBadge !== false ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={seccion.datos?.textoBadge !== undefined ? seccion.datos.textoBadge : 'Convocatoria Oficial'}
                      onChange={(e) => alActualizarDatos('textoBadge', e.target.value)}
                      placeholder="Ej: Convocatoria Oficial, Pase Protocolario, etc."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[9px] text-slate-500 uppercase shrink-0">Sugerencias:</span>
                      {[
                        'Convocatoria Oficial',
                        'Pase Protocolario Personal',
                        'Invitación de Gala',
                        'Nuestra Boda',
                        'Celebración Especial',
                      ].map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => alActualizarDatos('textoBadge', sug)}
                          className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-[9px] font-medium shrink-0 cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          alActualizarDatos('mostrarBadge', false)
                          alActualizarDatos('textoBadge', '')
                        }}
                        className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[9px] font-medium shrink-0 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    El distintivo está oculto. Pulsa &quot;Oculto&quot; para activarlo nuevamente en la tarjeta.
                  </p>
                )}
              </div>

              {/* Logotipo / Monograma Central / Retrato */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Camera size={12} className="text-slate-600" /> Círculo de Foto / Logotipo
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nuevoEstado = seccion.datos?.mostrarFotoRetrato === false
                      alActualizarDatos('mostrarFotoRetrato', nuevoEstado)
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                      seccion.datos?.mostrarFotoRetrato !== false
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-500 border-slate-300'
                    }`}
                  >
                    {seccion.datos?.mostrarFotoRetrato !== false ? 'Activo' : 'Oculto'}
                  </button>
                </div>

                {seccion.datos?.mostrarFotoRetrato !== false ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">Subir imagen o logotipo central:</span>
                      <button
                        type="button"
                        onClick={() => inputFileRetratoRef.current?.click()}
                        className="text-[10px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={11} /> Subir archivo local
                      </button>
                      <input
                        ref={inputFileRetratoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleSubirArchivo(e, (url) => {
                            alActualizarDatos('imagenRetrato', url)
                            alActualizarDatos('mostrarFotoRetrato', true)
                          })
                        }
                      />
                    </div>

                    <input
                      type="url"
                      value={seccion.datos?.imagenRetrato || ''}
                      onChange={(e) => alActualizarDatos('imagenRetrato', e.target.value)}
                      placeholder="https://... URL del logotipo o fotografía central"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />

                    {/* Presets de Retrato */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <span className="text-[9px] text-slate-500 uppercase shrink-0">Sugerencias:</span>
                      {IMAGENES_CURADAS.retratos.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            alActualizarDatos('imagenRetrato', img.url)
                            alActualizarDatos('mostrarFotoRetrato', true)
                          }}
                          className="px-2 py-1 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-[9px] font-medium shrink-0 cursor-pointer"
                          title={img.titulo}
                        >
                          {img.titulo}
                        </button>
                      ))}
                      {seccion.datos?.imagenRetrato && (
                        <button
                          type="button"
                          onClick={() => alActualizarDatos('imagenRetrato', '')}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-medium shrink-0 cursor-pointer"
                        >
                          Quitar foto
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          alActualizarDatos('imagenRetrato', '')
                          alActualizarDatos('mostrarFotoRetrato', false)
                        }}
                        className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[9px] font-medium shrink-0 cursor-pointer"
                        title="Ocultar el círculo por completo si no deseas foto"
                      >
                        Quitar círculo
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    El círculo de foto está desactivado (no aparece en la tarjeta). Pulsa &quot;Oculto&quot; para activarlo.
                  </p>
                )}
              </div>

              {/* Filete Divisorio Inferior de Cabecera */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Filete Divisorio Inferior
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Línea con icono decorativo al pie de la cabecera
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nuevoEstado = seccion.datos?.mostrarSeparador === false
                    alActualizarDatos('mostrarSeparador', nuevoEstado)
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
                    seccion.datos?.mostrarSeparador !== false
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-300'
                  }`}
                >
                  {seccion.datos?.mostrarSeparador !== false ? 'Visible' : 'Oculto'}
                </button>
              </div>
            </div>
          )}

          {/* 2. ITINERARIO DINÁMICO */}
          {seccion.tipo === 'itinerario' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock size={12} /> Hitos del Cronograma
                </label>
                <button
                  type="button"
                  onClick={agregarHitoItinerario}
                  className="px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus size={12} /> Añadir Momento
                </button>
              </div>

              <div className="space-y-2">
                {(seccion.datos?.itinerario || []).map((hito, hIdx) => (
                  <div
                    key={hito.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hito.hora}
                        onChange={(e) => actualizarHito(hito.id, 'hora', e.target.value)}
                        placeholder="18:00"
                        className="w-20 px-2 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded"
                        title="Hora del hito"
                      />
                      <input
                        type="text"
                        value={hito.titulo}
                        onChange={(e) => actualizarHito(hito.id, 'titulo', e.target.value)}
                        placeholder="Título del hito (ej: Ceremonia)"
                        className="flex-1 px-2 py-1 text-xs font-semibold bg-slate-50 border border-slate-300 rounded"
                      />
                      <SelectorIcono
                        iconoActual={hito.icono}
                        alSeleccionar={(ic) => actualizarHito(hito.id, 'icono', ic)}
                      />
                      <button
                        type="button"
                        onClick={() => eliminarHito(hito.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Eliminar este momento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={hito.descripcion || ''}
                      onChange={(e) => actualizarHito(hito.id, 'descripcion', e.target.value)}
                      placeholder="Descripción o detalle breve del momento (opcional)"
                      className="w-full px-2 py-1 text-[11px] bg-slate-50/50 border border-slate-200 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CÓDIGO DE VESTIMENTA */}
          {seccion.tipo === 'codigo_vestimenta' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Shirt size={12} /> Etiqueta Protocolaria
                </label>
                <input
                  type="text"
                  value={seccion.datos?.etiqueta || ''}
                  onChange={(e) => alActualizarDatos('etiqueta', e.target.value)}
                  placeholder="Ej: Traje Formal / Corbata Oscura / Guayabera Clara"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              {/* Muestrario de Colores Sugeridos */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Palette size={12} /> Paleta de Colores Sugeridos para Asistentes
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {(seccion.datos?.coloresSugeridos || []).map((col, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 bg-white shadow-2xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: col }}
                      />
                      <span className="text-[10px] font-mono text-slate-600 uppercase">{col}</span>
                      <button
                        type="button"
                        onClick={() => eliminarColorVestimenta(cIdx)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Eliminar este color"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Añadir color con selector nativo */}
                  <label className="px-2 py-1 rounded-full border border-dashed border-slate-300 hover:border-slate-400 bg-white text-[10px] text-slate-600 font-medium flex items-center gap-1 cursor-pointer">
                    <Plus size={11} /> Añadir Color
                    <input
                      type="color"
                      defaultValue="#0F172A"
                      className="w-0 h-0 opacity-0 absolute"
                      onChange={(e) => agregarColorVestimenta(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Notas Especiales de Vestuario
                </label>
                <input
                  type="text"
                  value={seccion.datos?.notasVestimenta || ''}
                  onChange={(e) => alActualizarDatos('notasVestimenta', e.target.value)}
                  placeholder="Ej: Se ruega a las damas evitar tacón aguja por jardines"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 4. SEDE Y UBICACIÓN */}
          {seccion.tipo === 'ubicacion' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <MapPin size={12} /> Nombre del Recinto / Salón
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.nombreLugar || ''}
                    onChange={(e) => alActualizarDatos('nombreLugar', e.target.value)}
                    placeholder="Ej: Club Empresarial, Gran Salón"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Dirección Completa
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.direccion || ''}
                    onChange={(e) => alActualizarDatos('direccion', e.target.value)}
                    placeholder="Ej: Carrera 7 # 115-60, Bogotá"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Enlace de Google Maps
                  </label>
                  <input
                    type="url"
                    value={seccion.datos?.enlaceMapa || ''}
                    onChange={(e) => alActualizarDatos('enlaceMapa', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Enlace de Waze (Opcional)
                  </label>
                  <input
                    type="url"
                    value={seccion.datos?.enlaceWaze || ''}
                    onChange={(e) => alActualizarDatos('enlaceWaze', e.target.value)}
                    placeholder="https://waze.com/ul/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Detalles de Acceso y Estacionamiento
                </label>
                <input
                  type="text"
                  value={seccion.datos?.detallesAcceso || ''}
                  onChange={(e) => alActualizarDatos('detallesAcceso', e.target.value)}
                  placeholder="Ej: Servicio de valet parking disponible por la portería principal"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 5. REGALOS BANCARIOS / LLUVIA DE SOBRES */}
          {seccion.tipo === 'regalos_bancarios' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Gift size={12} /> Entidad Bancaria
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.banco || ''}
                    onChange={(e) => alActualizarDatos('banco', e.target.value)}
                    placeholder="Ej: Bancolombia / BBVA / Nequi"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={seccion.datos?.tipoCuenta || 'Ahorros'}
                    onChange={(e) => alActualizarDatos('tipoCuenta', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Ahorros">Cuenta de Ahorros</option>
                    <option value="Corriente">Cuenta Corriente</option>
                    <option value="Digital">Billetera Digital (Nequi / Daviplata)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.numeroCuenta || ''}
                    onChange={(e) => alActualizarDatos('numeroCuenta', e.target.value)}
                    placeholder="Ej: 001-987654-20"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.titular || ''}
                    onChange={(e) => alActualizarDatos('titular', e.target.value)}
                    placeholder="Ej: Carlos Gómez"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Enlace a Mesa de Regalos Online (Opcional)
                </label>
                <input
                  type="url"
                  value={seccion.datos?.enlaceListaRegalos || ''}
                  onChange={(e) => alActualizarDatos('enlaceListaRegalos', e.target.value)}
                  placeholder="https://... Enlace a lista de Amazon, Falabella, etc."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 6. GALERÍA FOTOGRÁFICA */}
          {seccion.tipo === 'galeria_fotos' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Camera size={12} /> Fotografías de la Galería
                </label>
                <button
                  type="button"
                  onClick={() => inputFileGaleriaRef.current?.click()}
                  className="text-[10px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={11} /> Subir desde mi equipo
                </button>
                <input
                  ref={inputFileGaleriaRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleSubirArchivo(e, (url) => agregarFotoGaleria(url))}
                />
              </div>

              {/* Mosaico de Miniaturas de la Galería */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(seccion.datos?.fotos || []).map((foto, fIdx) => (
                  <div
                    key={fIdx}
                    className="h-20 rounded-lg border border-slate-300 overflow-hidden relative group bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto} alt={`Foto ${fIdx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => eliminarFotoGaleria(fIdx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                      title="Quitar foto"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Agregar imagen por URL */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  id={`nueva-foto-${seccion.id}`}
                  placeholder="https://... Pegar URL de fotografía"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      agregarFotoGaleria((e.target as HTMLInputElement).value)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(
                      `nueva-foto-${seccion.id}`
                    ) as HTMLInputElement
                    if (el && el.value) {
                      agregarFotoGaleria(el.value)
                      el.value = ''
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Añadir
                </button>
              </div>
            </div>
          )}

          {/* 7. MENSAJE LIBRE / TEXTO LIBRE */}
          {(seccion.tipo === 'mensaje_libre' || seccion.tipo === 'texto_libre') && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Contenido del Texto o Dedicatoria
                </label>
                <textarea
                  rows={4}
                  value={seccion.datos?.cuerpoTexto || seccion.datos?.mensaje || ''}
                  onChange={(e) => {
                    alActualizarDatos('cuerpoTexto', e.target.value)
                    alActualizarDatos('mensaje', e.target.value)
                  }}
                  placeholder="Escribe aquí poemas, notas, versículos o palabras de bienvenida..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg leading-relaxed"
                />
              </div>

              {/* Controles de Formato: Alineación y Tamaño */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Alineación
                  </label>
                  <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white p-0.5">
                    {[
                      { id: 'izquierda', icon: <AlignLeft size={13} />, title: 'Izquierda' },
                      { id: 'centro', icon: <AlignCenter size={13} />, title: 'Centro' },
                      { id: 'derecha', icon: <AlignRight size={13} />, title: 'Derecha' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => alActualizarDatos('alineacionTexto', opt.id)}
                        className={`flex-1 py-1 flex items-center justify-center rounded cursor-pointer ${
                          (seccion.datos?.alineacionTexto || 'centro') === opt.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title={opt.title}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Tamaño
                  </label>
                  <select
                    value={seccion.datos?.tamanoTexto || 'base'}
                    onChange={(e) => alActualizarDatos('tamanoTexto', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="sm">Pequeño (Nota)</option>
                    <option value="base">Normal (Párrafo)</option>
                    <option value="lg">Mediano (Cita)</option>
                    <option value="xl">Grande (Destacado)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Estilo
                  </label>
                  <select
                    value={seccion.datos?.estiloTexto || 'cursiva'}
                    onChange={(e) => alActualizarDatos('estiloTexto', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="cursiva">Cursiva Poética</option>
                    <option value="serif">Serif Clásica</option>
                    <option value="normal">Sans Moderna</option>
                    <option value="destacado">Cita con Marco</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Firma o Autor (Opcional)
                </label>
                <input
                  type="text"
                  value={seccion.datos?.autorMensaje || ''}
                  onChange={(e) => alActualizarDatos('autorMensaje', e.target.value)}
                  placeholder="Ej: Sofía & Carlos / Proverbios 3:5"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 7.1. FOTOGRAFÍA / BANNER LIBRE */}
          {seccion.tipo === 'imagen_libre' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={12} /> Fotografía o Imagen
                  </label>
                  <button
                    type="button"
                    onClick={() => inputFileImagenLibreRef.current?.click()}
                    className="text-[10px] text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Upload size={11} /> Subir archivo
                  </button>
                  <input
                    ref={inputFileImagenLibreRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleSubirArchivo(e, (url) => alActualizarDatos('urlImagen', url))
                    }
                  />
                </div>
                <input
                  type="url"
                  value={seccion.datos?.urlImagen || ''}
                  onChange={(e) => alActualizarDatos('urlImagen', e.target.value)}
                  placeholder="https://... URL de la imagen"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                  Formato Visual de la Foto
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'polaroid', label: 'Polaroid Retro' },
                    { id: 'circular', label: 'Retrato Circular' },
                    { id: 'banner', label: 'Banner Amplio' },
                    { id: 'tarjeta', label: 'Tarjeta Clásica' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => alActualizarDatos('formatoImagen', fmt.id)}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                        (seccion.datos?.formatoImagen || 'polaroid') === fmt.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Pie de Foto / Dedicatoria Breve (Opcional)
                </label>
                <input
                  type="text"
                  value={seccion.datos?.pieImagen || ''}
                  onChange={(e) => alActualizarDatos('pieImagen', e.target.value)}
                  placeholder="Ej: Cartagena, Atardecer en el Muelle 2025"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* 7.2. BOTÓN & ENLACE EXTERNO */}
          {seccion.tipo === 'boton_enlace' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={seccion.datos?.textoBoton || ''}
                  onChange={(e) => alActualizarDatos('textoBoton', e.target.value)}
                  placeholder="Ej: Ver Mesa de Regalos en Falabella"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <LinkIcon size={12} /> Enlace de Destino (URL)
                </label>
                <input
                  type="url"
                  value={seccion.datos?.urlBoton || ''}
                  onChange={(e) => alActualizarDatos('urlBoton', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                    Estilo Visual del Botón
                  </label>
                  <select
                    value={seccion.datos?.estiloBoton || 'primario'}
                    onChange={(e) => alActualizarDatos('estiloBoton', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="primario">Color Principal del Evento</option>
                    <option value="dorado">Dorado de Gala (Gradiente)</option>
                    <option value="borde">Contorno Minimalista</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                    Subtexto Adicional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={seccion.datos?.subtextoBoton || ''}
                    onChange={(e) => alActualizarDatos('subtextoBoton', e.target.value)}
                    placeholder="Ej: Código de evento: #9948"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7.3. SEPARADOR ORNAMENTAL */}
          {seccion.tipo === 'separador_ornamental' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 block">
                Diseño del Separador
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'linea_dorada', label: 'Filete Dorado ◈', preview: '─── ◈ ───' },
                  { id: 'botanico', label: 'Corona Laurel', preview: '🌿 ✧ 🌿' },
                  { id: 'onda', label: 'Onda Sutil', preview: '∿∿∿' },
                  { id: 'diamantes', label: 'Tres Destellos', preview: '✦ ✦ ✦' },
                  { id: 'editorial_icono', label: 'Filete & Icono', preview: '── ✧ ──' },
                  { id: 'linea_simple', label: 'Línea Sutil', preview: '───────' },
                ].map((sep) => (
                  <button
                    key={sep.id}
                    type="button"
                    onClick={() => alActualizarDatos('estiloSeparador', sep.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      (seccion.datos?.estiloSeparador || 'linea_dorada') === sep.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{sep.preview}</span>
                    <span className="text-[10px] font-medium opacity-80">{sep.label}</span>
                  </button>
                ))}
              </div>

              {/* Botón directo de eliminar separador */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={alEliminar}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Eliminar este separador</span>
                </button>
              </div>
            </div>
          )}

          {/* 8. HOSPEDAJE RECOMENDADO */}
          {seccion.tipo === 'hospedaje' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 size={12} /> Hoteles Recomendados
                </label>
                <button
                  type="button"
                  onClick={agregarHotel}
                  className="px-2 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} /> Añadir Hotel
                </button>
              </div>

              <div className="space-y-2">
                {(seccion.datos?.hoteles || []).map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hotel.nombre}
                        onChange={(e) => actualizarHotel(hotel.id, 'nombre', e.target.value)}
                        placeholder="Nombre del hotel"
                        className="flex-1 px-2 py-1 text-xs font-semibold bg-slate-50 border border-slate-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarHotel(hotel.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <input
                        type="text"
                        value={hotel.direccion || ''}
                        onChange={(e) => actualizarHotel(hotel.id, 'direccion', e.target.value)}
                        placeholder="Dirección"
                        className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded"
                      />
                      <input
                        type="text"
                        value={hotel.telefono || ''}
                        onChange={(e) => actualizarHotel(hotel.id, 'telefono', e.target.value)}
                        placeholder="Teléfono"
                        className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded"
                      />
                      <input
                        type="url"
                        value={hotel.enlace || ''}
                        onChange={(e) => actualizarHotel(hotel.id, 'enlace', e.target.value)}
                        placeholder="URL de reserva"
                        className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. CONFIRMACIÓN DE ASISTENCIA (RSVP) */}
          {seccion.tipo === 'confirmacion_rsvp' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-600" />
                <span>¿Cómo deseas que tus invitados confirmen asistencia?</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'tarjeton',
                    titulo: 'Botón Digital Tarjetón',
                    desc: 'Registro en web, control de aforo en tiempo real y descarga en PDF/Excel',
                    destacado: 'Recomendado',
                  },
                  {
                    id: 'whatsapp',
                    titulo: 'Mensaje de WhatsApp',
                    desc: 'Abre chat directo con mensaje predefinido en tu WhatsApp',
                    destacado: null,
                  },
                  {
                    id: 'ambos',
                    titulo: 'Ambos Métodos',
                    desc: 'Formulario digital web + opción de notificar por WhatsApp',
                    destacado: 'Híbrido',
                  },
                ].map((metodo) => {
                  const seleccionado =
                    (seccion.datos?.metodoConfirmacion || 'tarjeton') === metodo.id
                  return (
                    <button
                      key={metodo.id}
                      type="button"
                      onClick={() => alActualizarDatos('metodoConfirmacion', metodo.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        seleccionado
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {metodo.destacado && (
                        <span
                          className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded absolute right-2 top-2 ${
                            seleccionado
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {metodo.destacado}
                        </span>
                      )}
                      <span className="text-xs font-bold block pr-8">{metodo.titulo}</span>
                      <p
                        className={`text-[10px] mt-1 leading-snug ${
                          seleccionado ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {metodo.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
