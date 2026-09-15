'use client'

import { useEffect, useRef } from 'react'
import { Award } from 'lucide-react'

interface AdBannerProps {
  slotId?: string
  formato?: 'horizontal' | 'cuadrado' | 'responsive' | 'sidebar' | 'inline'
  esPremium?: boolean
  className?: string
  onUpgradeClick?: () => void
  mostrarBotonQuitar?: boolean
}

/**
 * Componente oficial para Google AdSense en InvitacionesYa.
 * Cumple con todas las directrices de Google AdSense:
 * - Etiquetado explícito y obligatorio ("Publicidad").
 * - Se elimina al 100% si esPremium === true.
 * - Soporte dinámico para client-id vía NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID.
 * - Formatos optimizados para sidebar de diseño, inter-secciones e invitaciones móviles.
 */
export function AdBanner({
  slotId = '1234567890',
  formato = 'responsive',
  esPremium = false,
  className = '',
  onUpgradeClick,
  mostrarBotonQuitar = false,
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const adClientId =
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-4454797114720338'

  useEffect(() => {
    if (esPremium) return

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch {
      // Manejo silencioso ante bloqueadores de publicidad
    }
  }, [esPremium])

  // Si el usuario adquirió el plan Premium, no se renderiza NADA en el DOM
  if (esPremium) return null

  // Clases según formato seleccionado
  let contenedorClases = 'w-full max-w-[360px] min-h-[90px]'
  let adFormatGoogle = 'auto'

  if (formato === 'horizontal') {
    contenedorClases = 'w-full max-w-2xl min-h-[90px]'
    adFormatGoogle = 'horizontal'
  } else if (formato === 'sidebar') {
    contenedorClases = 'w-full min-h-[140px]'
    adFormatGoogle = 'rectangle'
  } else if (formato === 'inline') {
    contenedorClases = 'w-full max-w-[340px] min-h-[110px]'
    adFormatGoogle = 'rectangle'
  } else if (formato === 'cuadrado') {
    contenedorClases = 'w-[300px] h-[250px]'
    adFormatGoogle = 'rectangle'
  }

  return (
    <div
      className={`w-full flex flex-col items-center justify-center my-3 overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between px-1 mb-1 max-w-[380px]">
        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold select-none">
          Publicidad
        </span>
        {mostrarBotonQuitar && onUpgradeClick && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Award size={11} />
            <span>Quitar anuncios con Premium</span>
          </button>
        )}
      </div>

      <div
        ref={adRef}
        className={`${contenedorClases} bg-slate-50/80 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden transition-all`}
      >
        {/* Contenedor oficial del anuncio Google AdSense */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%', textAlign: 'center' }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format={adFormatGoogle}
          data-full-width-responsive="true"
        />

        {/* Placeholder elegante visible mientras se aprueba la cuenta o en desarrollo */}
        <div className="flex flex-col items-center justify-center gap-1 text-slate-400 pointer-events-none select-none py-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block animate-pulse" />
            <span>Espacio Publicitario Google AdSense</span>
          </div>
          <p className="text-[10px] text-slate-400 max-w-[260px] leading-tight">
            Anuncio segmentado para visitantes del plan gratuito.
          </p>
        </div>
      </div>
    </div>
  )
}
