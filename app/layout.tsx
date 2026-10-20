import type { Metadata, Viewport } from 'next'
import { ADSENSE_CLIENT_ID, obtenerConfiguracionCacheada } from '@/lib/configuracion-servidor'
import { ScriptAdsense } from '@/components/ads/script-adsense'
import { RegistrarServiceWorker } from '@/components/registrar-sw'
import { Roboto_Slab, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tarjeton.online'),
  title: {
    default: 'Tarjetón — Papelería Digital Protocolaria & Convocatorias Formales',
    template: '%s | Tarjetón',
  },
  description:
    'Plataforma para crear tarjetones e invitaciones interactivas para actos solemnes, eventos corporativos, galas y celebraciones.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon',
  },
  appleWebApp: {
    capable: true,
    title: 'Tarjetón',
    statusBarStyle: 'default',
  },
}

// maximumScale: 1 evita el zoom automático de iOS al enfocar inputs con letra < 16px
// (iOS sigue permitiendo el pellizco para ampliar).
export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adsenseId = ADSENSE_CLIENT_ID
  // «Anuncios habilitados» del panel de administración: sin él, no se carga el script de AdSense
  const { anunciosAdsHabilitados } = await obtenerConfiguracionCacheada()

  return (
    <html lang="es" className="bg-white text-slate-900">
      <head>
        <meta name="google-adsense-account" content={adsenseId} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600;700&family=Parisienne&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Prata&family=Pacifico&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Fredoka:wght@400;500;600&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {anunciosAdsHabilitados && <ScriptAdsense clientId={adsenseId} />}
      </head>
      <body className={`${robotoSlab.variable} ${inter.variable} ${playfair.variable} antialiased font-sans`}>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  )
}
