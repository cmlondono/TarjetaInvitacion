import { MetadataRoute } from 'next'
import { obtenerPlantillasPublicadas } from '@/lib/estudio/plantillas-servidor'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const PLANTILLAS = await obtenerPlantillasPublicadas()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://www.tarjeton.online'
  const fechaActual = new Date()

  return [
    {
      url: baseUrl,
      lastModified: fechaActual,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/crear`,
      lastModified: fechaActual,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/plantillas`,
      lastModified: fechaActual,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...PLANTILLAS.map((p) => ({
      url: `${baseUrl}/plantillas/${p.id}`,
      lastModified: fechaActual,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
