import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { EventoRepositorio } from '@/lib/storage'
import { DynamicInvitationCard } from '@/components/invitation/dynamic-invitation-card'
import { TEMA_POR_DEFECTO, PLANTILLAS_TEMAS } from '@/lib/theme-presets'
import { haExpirado } from '@/lib/event-utils'
import { Sparkles, Calendar, ArrowRight } from 'lucide-react'

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
      siteName: 'InvitacionesYa',
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

  // En Next.js SSR / Client híbrido, recuperamos el evento
  // Si estamos en el cliente o no se encuentra en SSR, usamos el tema por defecto con los datos del slug
  const evento = EventoRepositorio.obtenerPorSlug(slug)

  // Datos de fallback para renderizar inmediatamente si es compartido por URL directa
  const eventoEfectivo = evento || {
    id: 'demo',
    tokenAdmin: '',
    slugPublico: slug,
    tipoEvento: 'corporativo' as const,
    titulo: 'Convocatoria Oficial',
    subtitulo: 'Tiene el agrado de invitarle a',
    anfitriones: 'Comité Organizador',
    fechaEvento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    horaEvento: '7:00 PM',
    direccion: 'Sede Principal del Evento',
    enlaceMapa: 'https://maps.google.com',
    whatsappNumero: '573000000000',
    whatsappPlantilla: 'Confirmo la asistencia de {invitado} para {pases} persona(s) a {evento}.',
    esPremium: false,
    creadoEn: new Date().toISOString(),
    expiraEn: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
  }

  // Verificación de expiración (Fecha del evento + 7 días)
  const eventoHaCaducado = haExpirado(eventoEfectivo.expiraEn)

  if (eventoHaCaducado) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={22} />
          </div>
          <h1 className="text-xl font-bold font-serif mb-2 text-white">Este acto ha finalizado</h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            La fecha programada para este evento ha concluido y el enlace protocolario ha cumplido su ciclo de vida.
          </p>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-3">
              ¿Desea confeccionar una invitación para su propio acto?
            </p>
            <Link
              href="/crear"
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Confeccionar Tarjeta Formal</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Marcado estructurado JSON-LD Schema.org para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: eventoEfectivo.titulo,
    startDate: eventoEfectivo.fechaEvento,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: eventoEfectivo.direccion,
      address: {
        '@type': 'PostalAddress',
        streetAddress: eventoEfectivo.direccion,
      },
    },
    description: eventoEfectivo.subtitulo || eventoEfectivo.titulo,
  }

  return (
    <>
      {/* Marcado estructurado para rastreadores de Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DynamicInvitationCard
        evento={eventoEfectivo}
        visual={eventoEfectivo.configuracionVisual || TEMA_POR_DEFECTO}
        invitado={
          nombreDecodificado
            ? {
                id: 'inv-temp',
                eventoId: eventoEfectivo.id,
                nombre: nombreDecodificado,
                pases: 1,
                esPlural: esPlural,
                codigoAcceso: tokenInvitado || 'token',
              }
            : null
        }
      />
    </>
  )
}
