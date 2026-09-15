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
    default: 'InvitacionesYa — Papelería Digital Protocolaria & Corporativa',
    template: '%s | InvitacionesYa',
  },
  description:
    'Plataforma para diseñar tarjetas de invitación interactivas para actos solemnes, eventos corporativos, galas y bodas de etiqueta.',
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
