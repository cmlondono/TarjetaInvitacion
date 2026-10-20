'use client'

import { useState } from 'react'
import { AlertCircle, Check, Link2, Loader2 } from 'lucide-react'

interface Props {
  tokenAdmin: string
  slug: string
  baseUrl: string
  alCambiar: (nuevoSlug: string) => void
}

/** Cambiar el enlace público de la invitación (tarjeton.online/i/<enlace>) desde el panel del anfitrión */
export function EditorEnlace({ tokenAdmin, slug, baseUrl, alCambiar }: Props) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(slug)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

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
      setTexto(d.slug)
      alCambiar(d.slug)
      setEditando(false)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch {
      setError('No se pudo guardar el enlace. Revisa tu conexión.')
    } finally {
      setGuardando(false)
    }
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
            Es la dirección que ven tus invitados. Puedes cambiarla por una más corta o fácil de recordar.
          </p>
        </div>
      </div>

      {editando ? (
        <div className="space-y-2.5">
          <div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-900 overflow-hidden">
            <span className="pl-3.5 text-xs font-mono text-slate-500 shrink-0 hidden sm:inline">{baseUrl.replace(/^https?:\/\//, '')}/i/</span>
            <span className="pl-3.5 text-xs font-mono text-slate-500 shrink-0 sm:hidden">/i/</span>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && guardar()}
              maxLength={60}
              autoFocus
              aria-label="Nuevo enlace"
              className="flex-1 min-w-0 py-2.5 pr-3 text-xs font-mono text-slate-900 bg-transparent focus:outline-hidden"
            />
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
            <AlertCircle size={13} className="shrink-0 mt-px" />
            Los enlaces que ya enviaste con la dirección anterior dejarán de funcionar. Después de cambiarlo, vuelve a enviar la invitación.
          </p>
          {error && <p className="text-[11px] font-semibold text-rose-700">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || !texto.trim()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {guardando && <Loader2 size={13} className="animate-spin" />} Guardar enlace
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false)
                setTexto(slug)
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
              setTexto(slug)
              setEditando(true)
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {guardado ? <><Check size={14} className="text-emerald-600" /> Enlace guardado</> : 'Cambiar enlace'}
          </button>
        </div>
      )}
    </div>
  )
}
