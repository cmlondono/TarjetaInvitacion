import { unstable_cache } from 'next/cache'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { KITS } from './kits'
import { CATEGORIAS_PLANTILLAS, PLANTILLAS, type CategoriaPlantilla, type Plantilla } from './plantillas'

/**
 * Plantillas desde la base de datos (tabla `plantillas`), administrables en el panel.
 * Las de lib/estudio/plantillas.ts son la semilla: se usan mientras la tabla no exista o esté vacía,
 * y el panel las importa a la base de datos con un botón.
 * Solo para el servidor (usa la llave de servicio de Supabase).
 */

export interface FilaPlantilla {
  id: string
  datos: Plantilla
  visible: boolean
  orden: number
}

export const ETIQUETA_PLANTILLAS = 'plantillas'

/** Filas de la tabla, o null si la tabla no existe o no hay base de datos */
export async function leerTablaPlantillas(): Promise<FilaPlantilla[] | null> {
  const supabase = obtenerClienteSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.from('plantillas').select('id, datos, visible, orden').order('orden').order('id')
  if (error) return null
  return data as FilaPlantilla[]
}

/** Fila → plantilla (el id de la fila manda sobre el que venga en los datos) */
export const plantillaDeFila = (f: FilaPlantilla): Plantilla => ({ ...f.datos, id: f.id })

const publicadas = unstable_cache(
  async (): Promise<Plantilla[]> => {
    const filas = await leerTablaPlantillas()
    if (!filas || filas.length === 0) return PLANTILLAS
    return filas.filter((f) => f.visible).map(plantillaDeFila)
  },
  ['plantillas-publicadas'],
  { tags: [ETIQUETA_PLANTILLAS], revalidate: 300 }
)

/** Plantillas que ve el público (las visibles, en el orden del panel) */
export function obtenerPlantillasPublicadas(): Promise<Plantilla[]> {
  return publicadas()
}

export async function obtenerPlantillaPublicada(id?: string | null): Promise<Plantilla | undefined> {
  if (!id) return undefined
  return (await obtenerPlantillasPublicadas()).find((p) => p.id === id)
}

// ─────────── Edición desde el panel ───────────

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)

/**
 * Cambios permitidos desde el panel: textos, categoría, estilo, hora y destacada.
 * Lo demás (momentos, bloques extra, contenido de ejemplo) se conserva tal cual.
 */
export function limpiarCambiosPlantilla(cambios: Record<string, unknown>): Partial<Plantilla> {
  const limpio: Partial<Plantilla> = {}
  const nombre = texto(cambios.nombre, 80)
  if (nombre) limpio.nombre = nombre
  const descripcion = texto(cambios.descripcion, 160)
  if (descripcion !== undefined) limpio.descripcion = descripcion
  if (CATEGORIAS_PLANTILLAS.includes(cambios.categoria as CategoriaPlantilla)) limpio.categoria = cambios.categoria as CategoriaPlantilla
  if (typeof cambios.kitId === 'string' && KITS.some((k) => k.id === cambios.kitId)) limpio.kitId = cambios.kitId
  const kicker = texto(cambios.kicker, 80)
  if (kicker !== undefined) limpio.kicker = kicker || undefined
  const nombresEjemplo = texto(cambios.nombresEjemplo, 90)
  if (nombresEjemplo) limpio.nombresEjemplo = nombresEjemplo
  const lugarEjemplo = texto(cambios.lugarEjemplo, 120)
  if (lugarEjemplo !== undefined) limpio.lugarEjemplo = lugarEjemplo
  if (typeof cambios.hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(cambios.hora)) limpio.hora = cambios.hora
  if (typeof cambios.destacada === 'boolean') limpio.destacada = cambios.destacada
  return limpio
}
