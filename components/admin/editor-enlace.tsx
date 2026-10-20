'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Check, Copy, Link2, Loader2, Share2 } from 'lucide-react'

interface Props {
  tokenAdmin: string
  slug: string
  baseUrl: string
  alCambiar: (nuevoSlug: string) => void
}

/** Mismo formato que aplica el servidor (para la vista previa) */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '')

/** 'cumple-emilio-k7x2p' → 'cumple-emilio' (sin el código aleatorio del final) */
// Solo si el final parece un código (tiene algún número), para no cortar nombres como «fiesta-sofia»
const sinCodigo = (slug: string) => slug.replace(/-(?=[a-z0-9]{0,4}[0-9])[a-z0-9]{4,5}$/, '')

/**
 * Cambiar el enlace público de la invitación desde el panel del anfitrión.
 * El anfitrión elige el nombre y el servidor agrega un código aleatorio para que nunca coincida
 * con el de otra persona. Al cambiarlo se muestra un aviso para guardar y reenviar el enlace nuevo.
 */
export function EditorEnlace({ tokenAdmin, slug, baseUrl, alCambiar }: Props) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(sinCodigo(slug))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enlaceNuevo, setEnlaceNuevo] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const dominio = baseUrl.replace(/^https?:\/\//, '')
  const vistaPrevia = normalizar(texto)

  const guardar = async () => {
    setError(null)
    setGuardando(true)
    try {
      const res = await fetch('/api/eventos/enlace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAdmin, slug: texto }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) {
        setError(d.error || 'No se pudo guardar el enlace.')
        return
      }
      alCambiar(d.slug)
      setEditando(false)
      setEnlaceNuevo(`${baseUrl}/i/${d.slug}`)
    } catch {
      setError('No se pudo guardar el enlace. Revisa tu conexión.')
    } finally {
      setGuardando(false)
    }
  }

  const copiar = async () => {
    if (!enlaceNuevo) return
    try {
      await navigator.clipboard.writeText(enlaceNuevo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
          <Link2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enlace de la invitación</p>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Es la dirección que ven tus invitados. Puedes cambiar el nombre por uno más fácil de recordar.
          </p>
        </div>
      </div>

      {/* Aviso tras cambiarlo: queda visible hasta que el anfitrión confirme que lo guardó */}
      {enlaceNuevo && (
        <div role="alert" className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
          <p className="flex items-start gap-2 text-sm font-bold text-amber-950">
            <AlertTriangle size={18} className="shrink-0 mt-px text-amber-700" />
            Guarda tu enlace nuevo
          </p>
          <p className="text-xs text-amber-900 leading-relaxed">
            Este es ahora el único enlace de tu invitación: <strong>el anterior ya no funciona</strong>. Guárdalo y vuelve a enviarlo a
            tus invitados; quien tenga el enlace viejo no podrá abrir la invitación.
          </p>
          <div className="bg-white rounded-lg border border-amber-300 px-3 py-2 text-xs font-mono text-slate-900 break-all select-all">{enlaceNuevo}</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copiar} className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              {copiado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copiado ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Enlace de mi invitación: ${enlaceNuevo}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              <Share2 size={14} /> Guardar en mi WhatsApp
            </a>
            <button type="button" onClick={() => setEnlaceNuevo(null)} className="px-3.5 py-2 rounded-xl border border-amber-400 text-amber-950 text-xs font-bold hover:bg-amber-100 cursor-pointer">
              Ya lo guardé
            </button>
          </div>
        </div>
      )}

      {editando ? (
        <div className="space-y-2.5">
          <label className="block text-[11px] font-semibold text-slate-700" htmlFor="nombre-enlace">
            Nombre del enlace
          </label>
          <input
            id="nombre-enlace"
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && vistaPrevia.length >= 3 && guardar()}
            maxLength={60}
            autoFocus
            placeholder="cumple-emilio"
            aria-label="Nuevo enlace"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:border-slate-900 focus:outline-hidden"
          />
          <p className="text-[11px] text-slate-600 break-all">
            Quedará así: <span className="font-mono text-slate-900">{dominio}/i/{vistaPrevia || '…'}-<span className="text-amber-700 font-bold">xxxxx</span></span>
            <span className="block text-slate-500 mt-0.5">
              Al final se agrega un código aleatorio (<span className="font-mono">xxxxx</span>) para que tu enlace sea único y nadie más tenga el mismo.
            </span>
          </p>
          <p className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
            <AlertCircle size={13} className="shrink-0 mt-px" />
            Los enlaces que ya enviaste con la dirección anterior dejarán de funcionar. Después de cambiarlo, guarda el nuevo y vuelve a enviar la invitación.
          </p>
          {error && <p className="text-[11px] font-semibold text-rose-700">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || vistaPrevia.length < 3}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {guardando && <Loader2 size={13} className="animate-spin" />} Guardar enlace
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false)
                setError(null)
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <span className="flex-1 min-w-0 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 truncate select-all">
            {baseUrl}/i/{slug}
          </span>
          <button
            type="button"
            onClick={() => {
              setTexto(sinCodigo(slug))
              setEnlaceNuevo(null)
              setEditando(true)
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            Cambiar enlace
          </button>
        </div>
      )}
    </div>
  )
}
