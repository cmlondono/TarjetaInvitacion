'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { TipoEvento } from '@/types/invitation'
import { EVENTOS_INFO, crearEventoInicial, infoEvento } from '@/lib/estudio/eventos'
import { KITS, aplicarKit, obtenerKit } from '@/lib/estudio/kits'
import { eventoDesdePlantilla, type Plantilla } from '@/lib/estudio/plantillas'
import { EventoRepositorio } from '@/lib/storage'
import { IconoDinamico } from '@/components/ui/icono-dinamico'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
import { Invitacion } from '@/components/invitacion/invitacion'
import { ArrowRight, LayoutTemplate, Loader2, X } from 'lucide-react'
import { claseInput } from './ui'

function fechaEnDias(dias: number): string {
  const d = new Date(Date.now() + dias * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const TIPOS_VALIDOS = EVENTOS_INFO.map((e) => e.id)

/**
 * Con `?plantilla=`, primero trae la plantilla de la base de datos (es la que el administrador
 * mantiene al día; las ocultas no se entregan) y luego abre el asistente con ella.
 */
export function AsistenteCreacion() {
  const params = useSearchParams()
  const id = params?.get('plantilla') || null
  const [estado, setEstado] = useState<{ cargando: boolean; plantilla: Plantilla | null }>({ cargando: Boolean(id), plantilla: null })

  useEffect(() => {
    if (!id) return
    let vigente = true
    fetch(`/api/plantillas?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => vigente && setEstado({ cargando: false, plantilla: r?.plantilla || null }))
      .catch(() => vigente && setEstado({ cargando: false, plantilla: null }))
    return () => {
      vigente = false
    }
  }, [id])

  if (estado.cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-600 animate-pulse">Abriendo la plantilla…</p>
      </div>
    )
  }
  return <Asistente plantillaInicial={estado.plantilla} />
}

function Asistente({ plantillaInicial }: { plantillaInicial: Plantilla | null }) {
  const router = useRouter()
  const params = useSearchParams()
  const [plantillaId, setPlantillaId] = useState<string | null>(plantillaInicial?.id || null)
  const plantilla = plantillaId ? plantillaInicial || undefined : undefined
  const tipoParam = params?.get('tipo') as TipoEvento
  const [tipo, setTipo] = useState<TipoEvento>(plantilla?.tipo || (TIPOS_VALIDOS.includes(tipoParam) ? tipoParam : 'boda'))
  const [kitElegido, setKitElegido] = useState<string | null>(plantilla?.kitId || null)
  const [verTodos, setVerTodos] = useState(false)
  const [nombres, setNombres] = useState('')
  const [fecha, setFecha] = useState(fechaEnDias(60))
  const [hora, setHora] = useState(plantilla?.hora || '18:00')
  const [lugar, setLugar] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // La vista previa usa ids aleatorios: se dibuja solo en el cliente para no romper la hidratación
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const info = infoEvento(tipo)
  const kitId = kitElegido || info.kitSugerido
  const kitsDelEvento = KITS.filter((k) => k.eventos.includes(tipo))
  const kitsVisibles = verTodos ? KITS : kitsDelEvento
  const usaPlantilla = plantilla && plantilla.tipo === tipo

  const construir = (conEjemplo: boolean, nombresFinales: string, lugarFinal: string) => {
    if (usaPlantilla) {
      const ev = eventoDesdePlantilla(plantilla, { nombres: nombresFinales, fecha, hora, lugar: lugarFinal }, conEjemplo)
      return kitId !== plantilla.kitId ? crearEventoConKit(ev, kitId) : ev
    }
    return crearEventoInicial({ tipo, nombres: nombresFinales, fecha, hora, lugar: lugarFinal, kitId })
  }

  // Vista previa real: la misma invitación que se va a crear
  const vistaPrevia = useMemo(
    () => construir(false, nombres || plantilla?.nombresEjemplo || info.ejemploNombres, lugar || plantilla?.lugarEjemplo || 'Lugar del evento'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tipo, nombres, fecha, hora, lugar, kitId, plantillaId]
  )

  const crear = async () => {
    if (!nombres.trim()) {
      setError(`Escribe ${info.etiquetaNombres.toLowerCase()} para continuar.`)
      return
    }
    setCreando(true)
    setError(null)
    try {
      const evento = construir(false, nombres.trim(), lugar.trim())
      const guardado = await EventoRepositorio.guardarAsync(evento)
      const plan = params?.get('plan') === 'premium' ? '&plan=premium' : ''
      router.replace(`/crear?editar=${guardado.tokenAdmin}${plan}`)
    } catch (err: any) {
      setError(err?.message || 'No pudimos crear tu invitación. Intenta de nuevo.')
      setCreando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200">
        <Link href="/" aria-label="Inicio de Tarjetón">
          <TarjetonLogo />
        </Link>
        <nav aria-label="Pasos" className="hidden md:flex items-center gap-2 text-[13px] font-semibold">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center">1</span>
            Qué celebras
          </span>
          <span className="w-5 h-0.5 bg-slate-300" />
          <span className="flex items-center gap-2 px-3 py-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full border-[1.5px] border-slate-300 text-[11px] flex items-center justify-center">2</span>
            Personaliza
          </span>
          <span className="w-5 h-0.5 bg-slate-300" />
          <span className="flex items-center gap-2 px-3 py-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full border-[1.5px] border-slate-300 text-[11px] flex items-center justify-center">3</span>
            Envía
          </span>
        </nav>
        <Link href="/plantillas" className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 hover:underline">
          <LayoutTemplate size={15} /> Ver plantillas
        </Link>
      </header>

      <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-8 py-8 flex flex-wrap gap-10 items-start">
        <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[34px] sm:text-[42px] leading-[1.05] font-extrabold tracking-tight">¿Qué vamos a celebrar?</h1>
            <p className="m-0 text-[16px] text-slate-600 max-w-xl">Elige el evento y armamos la invitación con los bloques que de verdad necesita. Todo se puede cambiar después.</p>
          </div>

          {plantilla && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <LayoutTemplate size={18} className="text-amber-700 shrink-0" />
              <span className="flex-1 text-[14px] text-amber-900">
                Usando la plantilla <b>{plantilla.nombre}</b>. Escribe tus datos y queda lista.
                {plantilla.premium && (
                  <span className="block text-[12.5px] mt-0.5">
                    ★ Es Premium: puedes usarla y editarla gratis; tus invitados la verán con la marca «Vista previa» hasta que actives Premium.
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPlantillaId(null)
                  setKitElegido(null)
                }}
                aria-label="Quitar plantilla"
                className="w-9 h-9 rounded-lg text-amber-800 hover:bg-amber-100 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div role="radiogroup" aria-label="Tipo de evento" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {EVENTOS_INFO.map((e) => {
              const activo = tipo === e.id
              return (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => {
                    setTipo(e.id)
                    setKitElegido(plantilla?.tipo === e.id ? plantilla.kitId : null)
                    setVerTodos(false)
                  }}
                  className={`flex items-center gap-3 p-3 min-h-[68px] rounded-2xl bg-white text-left cursor-pointer transition-shadow ${activo ? 'border-2 border-slate-900 shadow-md' : 'border-2 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activo ? 'bg-slate-900 text-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                    <IconoDinamico nombre={e.icono} size={20} />
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold leading-tight">{e.nombre}</span>
                    <span className="text-[12px] text-slate-500 leading-snug">{e.descripcion}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h2 className="m-0 text-[17px] font-bold">¿Qué ambiente quieres?</h2>
              <button type="button" onClick={() => setVerTodos(!verTodos)} className="text-[13px] font-bold text-slate-900 underline underline-offset-2 cursor-pointer">
                {verTodos ? `Solo los de ${info.nombre.toLowerCase()}` : `Ver los ${KITS.length} ambientes`}
              </button>
            </div>
            <div role="radiogroup" aria-label="Ambiente" className="flex flex-wrap gap-2">
              {kitsVisibles.map((k) => {
                const activo = kitId === k.id
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setKitElegido(k.id)}
                    className={`min-h-10 px-3.5 rounded-full text-[14px] font-semibold flex items-center gap-2 cursor-pointer ${activo ? 'bg-slate-900 text-white border-[1.5px] border-slate-900' : 'bg-white text-slate-800 border-[1.5px] border-slate-300 hover:border-slate-400'}`}
                  >
                    <span className="flex gap-0.5" aria-hidden="true">
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: k.colores.fondo }} />
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: k.colores.acento }} />
                    </span>
                    {k.nombre}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700 sm:col-span-2">
              {info.etiquetaNombres}
              <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder={`Ej: ${plantilla?.tipo === tipo ? plantilla.nombresEjemplo : info.ejemploNombres}`} maxLength={80} className={claseInput} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
                Fecha
                <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className={claseInput} />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
                Hora
                <input type="time" value={hora} onChange={(e) => e.target.value && setHora(e.target.value)} className={claseInput} />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-slate-700">
              Lugar
              <input value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder={`Ej: ${plantilla?.lugarEjemplo || 'Hacienda La Victoria, Cartagena'}`} maxLength={120} className={claseInput} />
            </label>
          </div>

          {error && (
            <p role="alert" className="m-0 p-3 rounded-xl bg-rose-50 text-rose-700 text-[14px] font-semibold">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={crear} disabled={creando} className="min-h-[52px] px-6 rounded-2xl bg-slate-900 text-white text-[16px] font-bold flex items-center gap-2.5 disabled:opacity-60 cursor-pointer hover:bg-slate-800">
              {creando ? <Loader2 size={18} className="animate-spin" /> : null}
              {creando ? 'Creando tu invitación…' : `Crear mi invitación de ${info.nombre.toLowerCase()}`}
              {!creando && <ArrowRight size={18} />}
            </button>
            <span className="text-[13px] text-slate-500">Se guarda sola en la nube mientras la diseñas.</span>
          </div>
        </section>

        <aside aria-label="Vista previa en vivo" className="flex-[1_1_360px] min-w-0 flex flex-col items-center gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Vista previa en vivo</span>
          <div className="w-[340px] h-[680px] rounded-[44px] bg-slate-900 p-3 shadow-2xl">
            <div className="relative w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden bg-white">
              {montado && <Invitacion key={`${tipo}-${kitId}-${plantillaId}`} evento={vistaPrevia} modo="vista" contenida mostrarApertura={false} />}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

/** Cambia el kit de una invitación creada desde plantilla (cuando el usuario eligió otro ambiente) */
function crearEventoConKit(evento: ReturnType<typeof crearEventoInicial>, kitId: string) {
  const kit = obtenerKit(kitId)
  if (!kit || !evento.configuracionVisual) return evento
  return { ...evento, configuracionVisual: aplicarKit(evento.configuracionVisual, kit, { cambiarApertura: true }) }
}
