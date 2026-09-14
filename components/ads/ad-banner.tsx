'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slotId?: string
  formato?: 'horizontal' | 'cuadrado' | 'responsive'
  esPremium?: boolean
  className?: string
}

/**
 * Componente modular para Google AdSense.
 * Cumple con las políticas de Google:
 * - Etiquetado claro ("Publicidad").
 * - Se oculta automáticamente para usuarios con plan Premium.
 * - Manejo elegante en entorno de desarrollo / ad-blockers.
 */
export function AdBanner({
  slotId = '1234567890',
  formato = 'responsive',
  esPremium = false,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (esPremium) return

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch {
      // Ignorar errores si AdSense está bloqueado por el navegador
    }
  }, [esPremium])

  if (esPremium) return null

  return (
    <div className={`w-full flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1 select-none">
        Publicidad
      </span>
      <div
        ref={adRef}
        className="w-full max-w-[360px] min-h-[90px] bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center p-2 text-center"
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Reemplazar con el Publisher ID real
          data-ad-slot={slotId}
          data-ad-format={formato}
          data-full-width-responsive="true"
        />
        {/* Placeholder visible cuando el script de Google no carga (desarrollo o bloqueador) */}
        <p className="text-xs text-muted-foreground/50 font-sans pointer-events-none">
          Espacio publicitario disponible · Google AdSense
        </p>
      </div>
    </div>
  )
}
