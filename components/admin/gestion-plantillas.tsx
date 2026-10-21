'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Crown, Database, ExternalLink, Eye, EyeOff, Loader2, Pencil, Search, Star, Trash2, X } from 'lucide-react'
import { CATEGORIAS_PLANTILLAS, type EfectosPlantilla, type Plantilla } from '@/lib/estudio/plantillas'
import { KITS, obtenerKit } from '@/lib/estudio/kits'
import { CATALOGO_FONDOS_ANIMADOS, CATALOGO_PARTICULAS } from '@/components/invitacion/particulas'
import { CATALOGO_ESCENAS } from '@/components/invitacion/escenas'
import type { TipoEscena, TipoFondoAnimado, TipoParticulas } from '@/types/invitation'

const POR_PAGINA = 15

type PlantillaAdmin = Plantilla & { visible: boolean; orden: number }

interface Respuesta {
  tablaLista: boolean
  plantillas: PlantillaAdmin[]
  pendientesDelCodigo: number
}

const claseCampo = 'w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400'

/**
 * Pestaña «Plantillas» del panel de administración: las plantillas viven en la base de datos.
 * Se pueden ocultar o mostrar, destacar, editar, duplicar, reordenar y eliminar.
 */
export function GestionPlantillas() {
  const [datos, setDatos] = useState<Respuesta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<string>('todas')
  const [filtroVisible, setFiltroVisible] = useState<'todas' | 'visibles' | 'ocultas'>('todas')
  const [filtroPlan, setFiltroPlan] = useState<'todas' | 'gratis' | 'premium'>('todas')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<PlantillaAdmin | null>(null)

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/plantillas', { cache: 'no-store' })
      const r = await res.json()
      if (!res.ok) throw new Error(r.error)
      setDatos(r)
      setError(null)
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No se pudieron cargar las plantillas.')
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const pedir = async (clave: string, url: string, init: RequestInit, mensaje?: string) => {
    setOcupado(clave)
    setError(null)
    try {
      const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
      const r = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(r.error)
      if (mensaje) setAviso(typeof mensaje === 'string' ? mensaje.replace('{n}', String(r.importadas ?? '')) : null)
      await cargar()
      return true
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No se pudo guardar.')
      return false
    } finally {
      setOcupado(null)
    }
  }

  const actualizar = (id: string, cambios: { visible?: boolean; orden?: number; datos?: Partial<Plantilla> }, mensaje?: string) =>
    pedir(id, '/api/admin/plantillas', { method: 'PATCH', body: JSON.stringify({ id, ...cambios }) }, mensaje)

  const importar = () => pedir('importar', '/api/admin/plantillas', { method: 'POST', body: JSON.stringify({ accion: 'importar' }) }, 'Listo: {n} plantillas pasaron a la base de datos.')

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return (datos?.plantillas || []).filter(
      (p) =>
        (categoria === 'todas' || p.categoria === categoria) &&
        (filtroVisible === 'todas' || (filtroVisible === 'visibles' ? p.visible : !p.visible)) &&
        (filtroPlan === 'todas' || (filtroPlan === 'premium' ? p.premium : !p.premium)) &&
        (!q || `${p.nombre} ${p.descripcion} ${p.id}`.toLowerCase().includes(q))
    )
  }, [datos, busqueda, categoria, filtroVisible, filtroPlan])

  // Paginación: al cambiar los filtros se vuelve a la primera página; si se borran plantillas no queda en una página vacía
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  useEffect(() => setPagina(1), [busqueda, categoria, filtroVisible, filtroPlan])
  const paginaActual = Math.min(pagina, totalPaginas)
  const listaPagina = lista.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  // Subir o bajar intercambia el orden con la plantilla vecina en la lista completa
  const mover = async (p: PlantillaAdmin, paso: -1 | 1) => {
    const todas = datos?.plantillas || []
    const i = todas.findIndex((x) => x.id === p.id)
    const vecina = todas[i + paso]
    if (!vecina) return
    const ordenP = p.orden === vecina.orden ? p.orden + paso : vecina.orden
    if (await actualizar(p.id, { orden: ordenP })) await actualizar(vecina.id, { orden: p.orden })
  }

  if (!datos && !error) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600 p-6">
        <Loader2 size={16} className="animate-spin" /> Cargando plantillas…
      </div>
    )
  }

  const total = datos?.plantillas.length || 0
  const visibles = datos?.plantillas.filter((p) => p.visible).length || 0
  const premium = datos?.plantillas.filter((p) => p.premium).length || 0

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Plantillas</h3>
            <p className="text-sm text-slate-600">
              {total} plantillas · {visibles} visibles · {total - visibles} ocultas · {premium} Premium. Ocultar es reversible y no afecta las invitaciones ya creadas.
            </p>
          </div>
        </div>

        {datos && !datos.tablaLista && (
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            <p className="m-0 font-bold flex items-center gap-2">
              <Database size={16} /> Las plantillas todavía están en el código
            </p>
            <ol className="m-0 pl-5 space-y-1">
              <li>
                En Supabase, abre el editor SQL y ejecuta el <b>bloque 9 de schema.sql</b> (crea la tabla <code>plantillas</code>).
              </li>
              <li>Vuelve aquí y pulsa el botón: las {datos.pendientesDelCodigo} plantillas pasan a la base de datos y desde ese momento se administran aquí.</li>
            </ol>
            <button type="button" onClick={importar} disabled={ocupado === 'importar'} className="self-start min-h-10 px-4 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer">
              {ocupado === 'importar' ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />} Pasar las plantillas a la base de datos
            </button>
          </div>
        )}

        {datos?.tablaLista && datos.pendientesDelCodigo > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sm text-sky-900">
            <span>
              Hay <b>{datos.pendientesDelCodigo}</b> plantillas en el código que no están en la base de datos (nuevas o eliminadas aquí antes).
            </span>
            <button type="button" onClick={importar} disabled={ocupado === 'importar'} className="min-h-9 px-4 rounded-xl bg-sky-700 text-white font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer">
              {ocupado === 'importar' ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />} Importarlas
            </button>
          </div>
        )}

        {error && <p className="m-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700">{error}</p>}
        {aviso && !error && (
          <p className="m-0 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700 flex items-center justify-between gap-2">
            {aviso}
            <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso(null)} className="cursor-pointer">
              <X size={14} />
            </button>
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <label className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o id" className={`${claseCampo} pl-9`} />
          </label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${claseCampo} w-auto`} aria-label="Categoría">
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS_PLANTILLAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={filtroVisible} onChange={(e) => setFiltroVisible(e.target.value as typeof filtroVisible)} className={`${claseCampo} w-auto`} aria-label="Visibilidad">
            <option value="todas">Visibles y ocultas</option>
            <option value="visibles">Solo visibles</option>
            <option value="ocultas">Solo ocultas</option>
          </select>
          <select value={filtroPlan} onChange={(e) => setFiltroPlan(e.target.value as typeof filtroPlan)} className={`${claseCampo} w-auto`} aria-label="Plan">
            <option value="todas">Gratis y Premium</option>
            <option value="gratis">Solo gratis</option>
            <option value="premium">Solo Premium</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {lista.length === 0 && <p className="m-0 p-6 text-sm text-slate-500">No hay plantillas con esos filtros.</p>}
        {listaPagina.map((p) => {
          const kit = obtenerKit(p.kitId)
          const soloLectura = !datos?.tablaLista
          const cargando = ocupado === p.id
          return (
            <div key={p.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${p.visible ? '' : 'bg-slate-50'}`}>
              <span className="flex flex-col shrink-0" aria-hidden="true">
                <button type="button" disabled={soloLectura || cargando} onClick={() => mover(p, -1)} className="text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer leading-none">▲</button>
                <button type="button" disabled={soloLectura || cargando} onClick={() => mover(p, 1)} className="text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer leading-none">▼</button>
              </span>
              <span className="w-10 h-10 rounded-lg shrink-0 border border-slate-200 flex items-center justify-center" style={{ backgroundColor: kit?.colores.fondo || '#f1f5f9' }}>
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: kit?.colores.acento || '#94a3b8' }} />
              </span>
              <div className="flex-1 min-w-[180px]">
                <p className={`m-0 text-sm font-bold ${p.visible ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                  {p.nombre} {p.destacada && <Star size={12} className="inline text-amber-500 fill-amber-400 -mt-0.5" />}{' '}
                  {p.premium && <span className="ml-1 px-1.5 py-px rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase align-middle">★ Premium</span>}
                </p>
                <p className="m-0 text-xs text-slate-500">
                  {p.categoria} · {kit?.nombre || p.kitId} · <code className="text-[11px]">{p.id}</code>
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {cargando && <Loader2 size={15} className="animate-spin text-slate-400" />}
                <button
                  type="button"
                  disabled={soloLectura || cargando}
                  onClick={() => actualizar(p.id, { visible: !p.visible })}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer disabled:opacity-40 ${p.visible ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-600 bg-white'}`}
                >
                  {p.visible ? <Eye size={13} /> : <EyeOff size={13} />} {p.visible ? 'Visible' : 'Oculta'}
                </button>
                <button
                  type="button"
                  disabled={soloLectura || cargando}
                  onClick={() => actualizar(p.id, { datos: { destacada: !p.destacada } })}
                  title="Las destacadas salen primero en la página de inicio"
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer disabled:opacity-40 ${p.destacada ? 'border-amber-300 text-amber-800 bg-amber-50' : 'border-slate-300 text-slate-600 bg-white'}`}
                >
                  <Star size={13} /> Destacada
                </button>
                <button
                  type="button"
                  disabled={soloLectura || cargando}
                  onClick={() => actualizar(p.id, { datos: { premium: !p.premium } }, p.premium ? `«${p.nombre}» ahora es gratis.` : `«${p.nombre}» ahora es Premium.`)}
                  title="Premium: se edita gratis; para publicar la invitación hay que pagar"
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 border cursor-pointer disabled:opacity-40 ${p.premium ? 'border-amber-400 text-amber-900 bg-amber-100' : 'border-slate-300 text-slate-600 bg-white'}`}
                >
                  <Crown size={13} /> {p.premium ? 'Premium' : 'Gratis'}
                </button>
                <a href={`/plantillas/${p.id}`} target="_blank" rel="noopener noreferrer" title="Ver (las ocultas no abren para el público)" className="h-8 w-8 rounded-lg border border-slate-300 text-slate-600 flex items-center justify-center hover:bg-slate-50">
                  <ExternalLink size={13} />
                </a>
                <button type="button" disabled={soloLectura || cargando} onClick={() => setEditando(p)} title="Editar" className="h-8 w-8 rounded-lg border border-slate-300 text-slate-600 flex items-center justify-center hover:bg-slate-50 cursor-pointer disabled:opacity-40">
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  disabled={soloLectura || cargando}
                  onClick={() => pedir(p.id, '/api/admin/plantillas', { method: 'POST', body: JSON.stringify({ accion: 'duplicar', id: p.id }) }, 'Copia creada (oculta): edítala y muéstrala cuando esté lista.')}
                  title="Duplicar"
                  className="h-8 w-8 rounded-lg border border-slate-300 text-slate-600 flex items-center justify-center hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  disabled={soloLectura || cargando}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar «${p.nombre}»? Las invitaciones ya creadas con ella no cambian. Si solo quieres quitarla de la galería, mejor ocúltala.`)) {
                      pedir(p.id, `/api/admin/plantillas?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' }, 'Plantilla eliminada.')
                    }
                  }}
                  title="Eliminar"
                  className="h-8 w-8 rounded-lg border border-rose-200 text-rose-600 flex items-center justify-center hover:bg-rose-50 cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {lista.length > POR_PAGINA && (
        <nav aria-label="Páginas de plantillas" className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, lista.length)} de {lista.length}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Página anterior" disabled={paginaActual <= 1} onClick={() => setPagina(paginaActual - 1)} className="h-9 w-9 rounded-lg border border-slate-300 bg-white flex items-center justify-center disabled:opacity-40 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= 1)
              .map((n, i, arr) => (
                <React.Fragment key={n}>
                  {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                  <button
                    type="button"
                    aria-current={n === paginaActual ? 'page' : undefined}
                    onClick={() => setPagina(n)}
                    className={`h-9 min-w-9 px-2 rounded-lg border text-sm font-bold cursor-pointer ${n === paginaActual ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {n}
                  </button>
                </React.Fragment>
              ))}
            <button type="button" aria-label="Página siguiente" disabled={paginaActual >= totalPaginas} onClick={() => setPagina(paginaActual + 1)} className="h-9 w-9 rounded-lg border border-slate-300 bg-white flex items-center justify-center disabled:opacity-40 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}

      {editando && (
        <EditorPlantilla
          plantilla={editando}
          guardando={ocupado === editando.id}
          alCerrar={() => setEditando(null)}
          alGuardar={async (cambios) => {
            if (await actualizar(editando.id, { datos: cambios }, 'Cambios guardados.')) setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function EditorPlantilla({
  plantilla,
  guardando,
  alCerrar,
  alGuardar,
}: {
  plantilla: PlantillaAdmin
  guardando: boolean
  alCerrar: () => void
  alGuardar: (cambios: Partial<Plantilla>) => void
}) {
  const [f, setF] = useState({
    nombre: plantilla.nombre,
    descripcion: plantilla.descripcion,
    categoria: plantilla.categoria,
    kitId: plantilla.kitId,
    kicker: plantilla.kicker || '',
    nombresEjemplo: plantilla.nombresEjemplo,
    lugarEjemplo: plantilla.lugarEjemplo,
    hora: plantilla.hora,
  })
  const [premium, setPremium] = useState(Boolean(plantilla.premium))
  const [efectos, setEfectos] = useState<EfectosPlantilla>(plantilla.efectos || {})
  const campo = (clave: keyof typeof f, etiqueta: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
      {etiqueta}
      <input value={f[clave]} onChange={(e) => setF({ ...f, [clave]: e.target.value })} className={claseCampo} {...extra} />
    </label>
  )
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={alCerrar}>
      <div role="dialog" aria-modal="true" aria-label="Editar plantilla" onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="m-0 text-lg font-bold text-slate-950">Editar plantilla</h3>
          <button type="button" aria-label="Cerrar" onClick={alCerrar} className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>
        {campo('nombre', 'Nombre', { maxLength: 80 })}
        {campo('descripcion', 'Descripción', { maxLength: 160 })}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
            Categoría
            <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value as Plantilla['categoria'] })} className={claseCampo}>
              {CATEGORIAS_PLANTILLAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
            Estilo
            <select value={f.kitId} onChange={(e) => setF({ ...f, kitId: e.target.value })} className={claseCampo}>
              {KITS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        {campo('kicker', 'Frase de apertura (opcional)', { maxLength: 80 })}
        {campo('nombresEjemplo', 'Nombres de ejemplo', { maxLength: 90 })}
        <div className="grid grid-cols-[1fr_120px] gap-3">
          {campo('lugarEjemplo', 'Lugar de ejemplo', { maxLength: 120 })}
          {campo('hora', 'Hora', { type: 'time' })}
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-500" />
            <span className="text-sm">
              <b className="text-slate-900">Plantilla Premium</b>
              <span className="block text-xs text-slate-600">Cualquiera puede usarla y editarla gratis; para publicar la invitación deberá activar Premium.</span>
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              Fondo animado (dibujos)
              <select value={efectos.escena || ''} onChange={(e) => setEfectos({ ...efectos, escena: (e.target.value || undefined) as TipoEscena | undefined })} className={claseCampo}>
                <option value="">El del estilo</option>
                {CATALOGO_ESCENAS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              Fondo en movimiento ★
              <select value={efectos.fondoAnimado || ''} onChange={(e) => setEfectos({ ...efectos, fondoAnimado: (e.target.value || undefined) as TipoFondoAnimado | undefined })} className={claseCampo}>
                <option value="">Ninguno</option>
                {CATALOGO_FONDOS_ANIMADOS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              Partículas ★
              <select
                value={efectos.particulas?.tipo || ''}
                onChange={(e) => setEfectos({ ...efectos, particulas: e.target.value ? { ...efectos.particulas, tipo: e.target.value as TipoParticulas } : undefined })}
                className={claseCampo}
              >
                <option value="">Ninguna</option>
                {CATALOGO_PARTICULAS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              Cantidad
              <select
                disabled={!efectos.particulas}
                value={efectos.particulas?.cantidad || 'normal'}
                onChange={(e) => efectos.particulas && setEfectos({ ...efectos, particulas: { ...efectos.particulas, cantidad: e.target.value as 'pocas' | 'normal' | 'muchas' } })}
                className={`${claseCampo} disabled:opacity-50`}
              >
                <option value="pocas">Pocas</option>
                <option value="normal">Normal</option>
                <option value="muchas">Muchas</option>
              </select>
            </label>
          </div>
          <p className="m-0 text-[11px] text-slate-500">
            ★ Efectos Premium: si la plantilla los trae, publicar la invitación pide activar Premium, aunque la plantilla esté marcada como gratis.
            {plantilla.efectos?.stickers?.length ? ` Trae ${plantilla.efectos.stickers.length} stickers animados (se conservan).` : ''}
          </p>
        </div>
        <p className="m-0 text-xs text-slate-500">Los momentos, bloques extra y el contenido de ejemplo de la plantilla se conservan.</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={alCerrar} className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 cursor-pointer">
            Cancelar
          </button>
          <button type="button" disabled={guardando || !f.nombre.trim()} onClick={() =>
              // null (no undefined) para que «Ninguno» viaje en el JSON y el servidor quite el efecto
              alGuardar({ ...f, premium, efectos: { escena: efectos.escena ?? null, fondoAnimado: efectos.fondoAnimado ?? null, particulas: efectos.particulas ?? null } as unknown as EfectosPlantilla })
            } className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            {guardando && <Loader2 size={14} className="animate-spin" />} Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
