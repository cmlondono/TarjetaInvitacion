import { unstable_cache } from 'next/cache'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { KITS } from './kits'
import type { TipoEscena } from '@/types/invitation'
import { CATALOGO_FONDOS_ANIMADOS, CATALOGO_PARTICULAS } from '@/components/invitacion/particulas'
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

// Escenas válidas (el catálogo con nombres vive en un componente de cliente)
const ESCENAS_VALIDAS: TipoEscena[] = ['comic', 'ciudad', 'tormenta', 'castillo', 'hielo', 'hadas', 'aranas', 'calabazas', 'fantasmas', 'brujas', 'heroe_dia']

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
 * Cambios permitidos desde el panel: textos, categoría, estilo, hora, destacada, Premium y efectos
 * (escena, partículas y fondo en movimiento). Lo demás (momentos, bloques extra, contenido de ejemplo
 * y los stickers que trae la plantilla) se conserva tal cual.
 */
export function limpiarCambiosPlantilla(cambios: Record<string, unknown>, actual?: Plantilla): Partial<Plantilla> {
  const limpio: Partial<Plantilla> = {}
  if (typeof cambios.premium === 'boolean') limpio.premium = cambios.premium
  if (cambios.efectos && typeof cambios.efectos === 'object') {
    const e = cambios.efectos as Record<string, any>
    const efectos = { ...(actual?.efectos || {}) }
    if ('escena' in e) efectos.escena = ESCENAS_VALIDAS.includes(e.escena) ? e.escena : undefined
    if ('fondoAnimado' in e) efectos.fondoAnimado = CATALOGO_FONDOS_ANIMADOS.some((x) => x.id === e.fondoAnimado) ? e.fondoAnimado : undefined
    if ('particulas' in e) {
      const p = e.particulas
      efectos.particulas =
        p && CATALOGO_PARTICULAS.some((x) => x.id === p.tipo)
          ? {
              tipo: p.tipo,
              cantidad: ['pocas', 'normal', 'muchas'].includes(p.cantidad) ? p.cantidad : undefined,
              color: typeof p.color === 'string' && /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : undefined,
            }
          : undefined
    }
    limpio.efectos = efectos
  }
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
