import { NextRequest, NextResponse } from 'next/server'
import { obtenerPlantillaPublicada } from '@/lib/estudio/plantillas-servidor'

/** GET /api/plantillas?id= — una plantilla publicada (las ocultas no se entregan) */
export async function GET(req: NextRequest) {
  const plantilla = await obtenerPlantillaPublicada(new URL(req.url).searchParams.get('id'))
  if (!plantilla) return NextResponse.json({ error: 'Plantilla no encontrada.' }, { status: 404 })
  return NextResponse.json({ plantilla })
}
