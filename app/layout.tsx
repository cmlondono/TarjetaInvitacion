import type { Metadata } from 'next'
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
  title: {
    default: 'Tarjetón — Papelería Digital Protocolaria & Convocatorias Formales',
    template: '%s | Tarjetón',
  },
  description:
    'Plataforma oficial para confeccionar tarjetones de invitación interactivos para actos solemnes, eventos corporativos, galas y bodas de etiqueta.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon',
  },
  other: {
    'google-adsense-account': 'ca-pub-4454797114720338',
  },
}

export const viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const adsenseId =
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-4454797114720338'

  return (
    <html lang="es" className="bg-white text-slate-900">
      <head>
        <meta name="google-adsense-account" content={adsenseId} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600;700&family=Parisienne&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@400;500;600;700&family=Prata&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${robotoSlab.variable} ${inter.variable} ${playfair.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  )
}
