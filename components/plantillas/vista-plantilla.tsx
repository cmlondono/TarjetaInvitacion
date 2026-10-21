'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import type { DetalleEvento } from '@/types/invitation'
import { Invitacion } from '@/components/invitacion/invitacion'

interface VistaPlantillaProps {
  evento: DetalleEvento
  plantillaId: string
  nombre: string
  descripcion: string
  premium?: boolean
  /** Precio de Premium, para decirlo claro en la barra (p. ej. «3.99 USD») */
  precioPremium?: string
}

/** Ejemplo completo de una plantilla, como lo vería un invitado, con la barra para usarla. */
export function VistaPlantilla({ evento, plantillaId, nombre, descripcion, premium, precioPremium }: VistaPlantillaProps) {
  const [clave, setClave] = useState(0)

  return (
    <div className="min-h-screen pb-24">
      <Invitacion key={clave} evento={evento} modo="vista" mostrarApertura claveApertura={clave} />

      <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl mx-auto rounded-2xl bg-slate-900/95 backdrop-blur text-white shadow-2xl p-3 flex flex-col gap-2.5">
          {premium && (
            <p className="m-0 px-1 text-[12.5px] text-amber-200 leading-snug">
              <span className="mr-1.5 px-1.5 py-px rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase align-middle">★ Premium</span>
              Pruébala gratis: tus invitados verán «Vista previa» hasta que actives Premium{precioPremium ? ` (pago único de ${precioPremium})` : ''}.
            </p>
          )}
          <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/plantillas" aria-label="Volver a las plantillas" className="w-11 h-11 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14px] font-bold truncate">{nombre}</p>
            <p className="m-0 text-[12px] text-slate-300 truncate">{descripcion}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setClave((c) => c + 1)
              window.scrollTo({ top: 0 })
            }}
            aria-label="Ver la apertura otra vez"
            title="Ver la apertura otra vez"
            className="w-11 h-11 shrink-0 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <RotateCcw size={17} />
          </button>
          <Link href={`/crear?plantilla=${plantillaId}`} className="min-h-11 px-4 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[14px] font-bold flex items-center">
            {premium ? '★ Usar Premium' : 'Usar gratis'}
          </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
