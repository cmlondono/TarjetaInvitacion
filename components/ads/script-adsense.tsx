'use client'

import { usePathname } from 'next/navigation'

// Rutas sin anuncios: paneles privados y el editor. Las invitaciones (/i/) cargan el script
// desde su propia página, solo si el evento no es Premium.
const RUTAS_SIN_ANUNCIOS = ['/i/', '/admin', '/gestionar', '/crear']

/** Script de Google AdSense (anuncios automáticos), excepto en las rutas de arriba */
export function ScriptAdsense({ clientId, siempre = false }: { clientId: string; siempre?: boolean }) {
  const ruta = usePathname() || '/'
  if (!siempre && RUTAS_SIN_ANUNCIOS.some((r) => ruta.startsWith(r))) return null
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  )
}
