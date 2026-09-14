import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/gestionar/', '/api/'], // Proteger paneles de administración privados
      },
    ],
    sitemap: 'https://invitacionesya.com/sitemap.xml',
  }
}
