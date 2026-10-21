import { NextResponse } from 'next/server'
import { obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { paisVisitante } from '@/lib/tasa-cambio'
import { CONFIGURACION_DEFAULT } from '@/types/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/configuracion
 * Configuración pública del sistema: precio en COP (y su equivalente en USD con la tasa del día),
 * cupo gratis, mantenimiento y anuncios. Incluye el país de quien consulta para mostrar el precio
 * en su moneda (COP en Colombia, USD aproximado en otros países).
 */
export async function GET() {
  try {
    const [configuracion, pais] = await Promise.all([obtenerConfiguracionGlobal(), paisVisitante()])
    return NextResponse.json({ ok: true, configuracion: { ...configuracion, paisVisitante: pais } })
  } catch (error) {
    console.error('Error en GET /api/configuracion:', error)
    return NextResponse.json({ ok: true, configuracion: CONFIGURACION_DEFAULT })
  }
}
