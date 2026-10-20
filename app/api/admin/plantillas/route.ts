import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { obtenerSesionAdmin } from '@/lib/admin-auth'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { PLANTILLAS } from '@/lib/estudio/plantillas'
import { ETIQUETA_PLANTILLAS, leerTablaPlantillas, limpiarCambiosPlantilla, plantillaDeFila } from '@/lib/estudio/plantillas-servidor'

export const dynamic = 'force-dynamic'

const SIN_TABLA = 'La tabla de plantillas no existe todavía. Ejecuta el bloque 9 de schema.sql en Supabase y vuelve a intentar.'

/** Tras cualquier cambio, la galería, la landing y las páginas de plantilla se regeneran al momento */
function refrescarSitio() {
  revalidateTag(ETIQUETA_PLANTILLAS, { expire: 0 })
  revalidatePath('/')
  revalidatePath('/plantillas')
  revalidatePath('/plantillas/[id]', 'page')
  revalidatePath('/sitemap.xml')
}

function errorEscritura(mensaje?: string) {
  const sinLlave = !process.env.SUPABASE_SERVICE_ROLE_KEY
  return NextResponse.json(
    { error: sinLlave ? 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor: sin ella no se puede escribir en la tabla de plantillas.' : mensaje || 'No se pudo guardar.' },
    { status: 500 }
  )
}

/**
 * GET /api/admin/plantillas
 * Todas las plantillas (visibles y ocultas). Si la tabla no existe, devuelve las del código
 * marcadas como «sin pasar a la base de datos».
 */
export async function GET() {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const filas = await leerTablaPlantillas()
  if (!filas) {
    return NextResponse.json({
      tablaLista: false,
      plantillas: PLANTILLAS.map((p, orden) => ({ ...p, visible: true, orden })),
      pendientesDelCodigo: PLANTILLAS.length,
    })
  }
  const enBase = new Set(filas.map((f) => f.id))
  return NextResponse.json({
    tablaLista: true,
    plantillas: filas.map((f) => ({ ...plantillaDeFila(f), visible: f.visible, orden: f.orden })),
    pendientesDelCodigo: PLANTILLAS.filter((p) => !enBase.has(p.id)).length,
  })
}

/**
 * POST /api/admin/plantillas
 * - { accion: 'importar' }: pasa a la base de datos las plantillas del código que aún no están
 *   (no sobrescribe las que ya se editaron en el panel).
 * - { accion: 'duplicar', id }: copia oculta de una plantilla, para crear una variación.
 */
export async function POST(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 })

  const { accion, id } = await req.json().catch(() => ({}))
  const filas = await leerTablaPlantillas()
  if (!filas) return NextResponse.json({ error: SIN_TABLA }, { status: 409 })

  if (accion === 'importar') {
    const enBase = new Set(filas.map((f) => f.id))
    const base = filas.reduce((max, f) => Math.max(max, f.orden), -1) + 1
    const nuevas = PLANTILLAS.filter((p) => !enBase.has(p.id)).map((p, i) => ({
      id: p.id,
      datos: p,
      visible: true,
      orden: base + i,
    }))
    if (nuevas.length) {
      const { error } = await supabase.from('plantillas').upsert(nuevas, { onConflict: 'id', ignoreDuplicates: true })
      if (error) return errorEscritura(error.message)
    }
    refrescarSitio()
    return NextResponse.json({ ok: true, importadas: nuevas.length })
  }

  if (accion === 'duplicar' && typeof id === 'string') {
    const original = filas.find((f) => f.id === id)
    if (!original) return NextResponse.json({ error: 'Plantilla no encontrada.' }, { status: 404 })
    const nuevoId = `${id}-copia-${Math.random().toString(36).slice(2, 6)}`
    const datos = { ...original.datos, id: nuevoId, nombre: `${original.datos.nombre} (copia)`, destacada: false }
    const { error } = await supabase.from('plantillas').insert({ id: nuevoId, datos, visible: false, orden: original.orden })
    if (error) return errorEscritura(error.message)
    refrescarSitio()
    return NextResponse.json({ ok: true, id: nuevoId })
  }

  return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
}

/**
 * PATCH /api/admin/plantillas
 * { id, visible?, orden?, datos? }: mostrar u ocultar, reordenar o editar textos, categoría y estilo.
 */
export async function PATCH(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 })

  const { id, visible, orden, datos } = await req.json().catch(() => ({}))
  if (typeof id !== 'string') return NextResponse.json({ error: 'Falta el id.' }, { status: 400 })

  const filas = await leerTablaPlantillas()
  if (!filas) return NextResponse.json({ error: SIN_TABLA }, { status: 409 })
  const fila = filas.find((f) => f.id === id)
  if (!fila) return NextResponse.json({ error: 'Plantilla no encontrada. ¿Ya pasaste las plantillas a la base de datos?' }, { status: 404 })

  const cambios: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
  if (typeof visible === 'boolean') cambios.visible = visible
  if (Number.isInteger(orden)) cambios.orden = orden
  if (datos && typeof datos === 'object') cambios.datos = { ...fila.datos, ...limpiarCambiosPlantilla(datos, fila.datos) }

  const { error } = await supabase.from('plantillas').update(cambios).eq('id', id)
  if (error) return errorEscritura(error.message)
  refrescarSitio()
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/plantillas?id= — elimina la plantilla (las invitaciones ya creadas con ella no cambian) */
export async function DELETE(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id.' }, { status: 400 })
  const { error } = await supabase.from('plantillas').delete().eq('id', id)
  if (error) return errorEscritura(error.message)
  refrescarSitio()
  return NextResponse.json({ ok: true })
}
