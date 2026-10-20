import { Metadata } from 'next'
import { EventoRepositorio, limpiarEventoPublico } from '@/lib/storage'
import { PaginaInvitacionCliente } from '@/components/invitation/pagina-invitacion-cliente'
import { ScriptAdsense } from '@/components/ads/script-adsense'
import { ADSENSE_CLIENT_ID, obtenerConfiguracionCacheada } from '@/lib/configuracion-servidor'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ g?: string; t?: string; p?: string }>
}

// ── Metadatos SEO y OpenGraph Dinámicos (Especialista SEO) ──
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { g: nombreInvitado } = await searchParams

  const nombreDecodificado = nombreInvitado ? decodeURIComponent(nombreInvitado) : null
  const tituloBase = nombreDecodificado
    ? `Pase Protocolario para ${nombreDecodificado}`
    : `Invitación Oficial & Protocolaria`

  const descripcionBase = `Convocatoria oficial. Consulte la fecha, sede, código de etiqueta y confirme su asistencia en línea.`

  return {
    title: tituloBase,
    description: descripcionBase,
    openGraph: {
      title: tituloBase,
      description: descripcionBase,
      type: 'website',
      locale: 'es_LA',
      siteName: 'Tarjetón',
      images: [
        {
          url: `/api/og?titulo=${encodeURIComponent(tituloBase)}&invitado=${encodeURIComponent(nombreDecodificado || '')}`,
          width: 1200,
          height: 630,
          alt: tituloBase,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: tituloBase,
      description: descripcionBase,
    },
    robots: {
      index: !nombreDecodificado, // No indexar enlaces individuales con nombres para proteger privacidad de invitados
      follow: true,
    },
  }
}

export default async function PaginaInvitacion({ params, searchParams }: Props) {
  const { slug } = await params
  const { g: nombreInvitado, t: tokenInvitado, p: esPluralParam } = await searchParams

  const nombreDecodificado = nombreInvitado ? decodeURIComponent(nombreInvitado) : null
  const esPlural = esPluralParam === '1'

  // Recuperar desde la base de datos (fuente de verdad) y nunca exponer el token de administración
  const eventoDb = await EventoRepositorio.obtenerPorSlugAsync(slug)
  const evento = eventoDb ? limpiarEventoPublico(eventoDb) : null
  // Las invitaciones Premium no muestran anuncios (es lo que se vende en el plan)
  const { anunciosAdsHabilitados } = await obtenerConfiguracionCacheada()
  const conAnuncios = anunciosAdsHabilitados && !!evento && !evento.esPremium

  // Marcado estructurado JSON-LD Schema.org para SEO
  const jsonLd = evento
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: evento.titulo,
        startDate: evento.fechaEvento,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: evento.direccion,
          address: {
            '@type': 'PostalAddress',
            streetAddress: evento.direccion,
          },
        },
        description: evento.subtitulo || evento.titulo,
      }
    : null

  return (
    <>
      {conAnuncios && <ScriptAdsense clientId={ADSENSE_CLIENT_ID} siempre />}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <PaginaInvitacionCliente
        eventoInicial={evento}
        slug={slug}
        nombreParam={nombreDecodificado}
        tokenParam={tokenInvitado}
        esPluralParam={esPlural}
      />
    </>
  )
}
