import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eventoDesdePlantilla } from '@/lib/estudio/plantillas'
import { obtenerPlantillaPublicada, obtenerPlantillasPublicadas } from '@/lib/estudio/plantillas-servidor'
import { VistaPlantilla } from '@/components/plantillas/vista-plantilla'
import { obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { textoPrecioCompleto } from '@/lib/precios'

// Se regenera a diario para que la fecha de ejemplo siga en el futuro
export const revalidate = 86400

export async function generateStaticParams() {
  return (await obtenerPlantillasPublicadas()).map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const plantilla = await obtenerPlantillaPublicada(id)
  if (!plantilla) return { title: 'Plantilla no encontrada — Tarjetón' }
  return {
    title: `${plantilla.nombre} · Plantilla de invitación — Tarjetón`,
    description: `${plantilla.descripcion}. Mira el ejemplo completo y úsalo para tu propia invitación digital.`,
    alternates: { canonical: `/plantillas/${plantilla.id}` },
    robots: { index: true, follow: true },
  }
}

export default async function PaginaPlantilla({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plantilla = await obtenerPlantillaPublicada(id)
  if (!plantilla) notFound()

  // Se arma en el servidor para que la vista sea idéntica al hidratar (usa fechas e ids aleatorios)
  const evento = eventoDesdePlantilla(plantilla, {}, true)

  const config = plantilla.premium ? await obtenerConfiguracionGlobal() : null
  return (
    <VistaPlantilla
      evento={evento}
      plantillaId={plantilla.id}
      nombre={plantilla.nombre}
      descripcion={plantilla.descripcion}
      premium={plantilla.premium}
      precioPremium={config ? textoPrecioCompleto(config.precioPremiumCOP, config.precioPremiumUSD) : undefined}
    />
  )
}
