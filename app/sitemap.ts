import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://invitacionesya.com'
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
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos-y-condiciones`,
      lastModified: fechaActual,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
