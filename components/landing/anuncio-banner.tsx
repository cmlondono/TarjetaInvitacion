'use client'

import { useState, useEffect } from 'react'
import { AdminStorage } from '@/lib/admin-storage'
import { PublicacionLanding } from '@/types/admin'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

export function LandingAnnouncementBanner() {
  const [publicacion, setPublicacion] = useState<PublicacionLanding | null>(null)
  const [cerrado, setCerrado] = useState(false)

  useEffect(() => {
    const pubs = AdminStorage.obtenerPublicaciones()
    const activa = pubs.find((p) => p.activo && p.tipo === 'banner_superior')
    if (activa) {
      setPublicacion(activa)
    }
  }, [])

  if (!publicacion || cerrado) return null

  return (
    <div
      className="w-full text-white py-2.5 px-4 text-xs font-sans transition-all flex items-center justify-between shadow-xs relative z-50 animate-in slide-in-from-top-2 duration-200"
      style={{
        backgroundColor: publicacion.colorFondo || '#0F172A',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center flex-1">
        <Sparkles size={14} className="text-amber-400 shrink-0 hidden sm:inline" />
        <p className="font-medium truncate max-w-2xl">
          <strong className="font-bold mr-1.5">{publicacion.titulo}:</strong>
          <span>{publicacion.contenido}</span>
        </p>

        {publicacion.textoBoton && (
          <Link
            href={publicacion.enlaceBoton || '/crear'}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-[11px] hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
          >
            <span>{publicacion.textoBoton}</span>
            <ArrowRight size={11} />
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={() => setCerrado(true)}
        className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-2"
        title="Ocultar aviso"
      >
        <X size={14} />
      </button>
    </div>
  )
}
