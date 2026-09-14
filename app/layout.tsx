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
  return (
    <html lang="es" className="bg-white text-slate-900">
      <body className={`${robotoSlab.variable} ${inter.variable} ${playfair.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  )
}
