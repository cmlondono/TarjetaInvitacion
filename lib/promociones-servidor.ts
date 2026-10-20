import { obtenerClienteSupabase } from '@/lib/supabase'
import type { Promocion, PublicacionLanding } from '@/types/admin'

/**
 * Cupones y banners de la landing en la base de datos (tablas `promociones` y `publicaciones_landing`).
 * El cupón se valida y el precio se calcula siempre en el servidor: el navegador no decide cuánto se cobra.
 * Solo para el servidor.
 */

export const promocionDeFila = (f: any): Promocion => ({
  id: f.id,
  codigo: f.codigo,
  tipoDescuento: f.tipo_descuento === 'precio_fijo' ? 'precio_fijo' : 'porcentaje',
  valor: Number(f.valor) || 0,
  usosMaximos: Number(f.usos_maximos) || 0,
  usosActuales: Number(f.usos_actuales) || 0,
  activo: Boolean(f.activo),
  fechaExpiracion: f.fecha_expiracion || undefined,
  creadoEn: f.creado_en,
})

export const filaDePromocion = (p: Promocion) => ({
  id: p.id,
  codigo: p.codigo.trim().toUpperCase(),
  tipo_descuento: p.tipoDescuento,
  valor: p.valor,
  usos_maximos: p.usosMaximos,
  usos_actuales: p.usosActuales,
  activo: p.activo,
  fecha_expiracion: p.fechaExpiracion || null,
})

export const publicacionDeFila = (f: any): PublicacionLanding => ({
  id: f.id,
  tipo: f.tipo || 'banner_superior',
  titulo: f.titulo,
  contenido: f.contenido,
  textoBoton: f.texto_boton || undefined,
  enlaceBoton: f.enlace_boton || undefined,
  activo: Boolean(f.activo),
  colorFondo: f.color_fondo || undefined,
  fechaCreacion: f.fecha_creacion,
})

export const filaDePublicacion = (p: PublicacionLanding) => ({
  id: p.id,
  tipo: p.tipo,
  titulo: p.titulo,
  contenido: p.contenido,
  texto_boton: p.textoBoton || null,
  enlace_boton: p.enlaceBoton || null,
  activo: p.activo,
  color_fondo: p.colorFondo || null,
})

export type ResultadoCupon = { valido: true; promocion: Promocion } | { valido: false; mensaje: string }

/** Revisa en la base de datos que el cupón exista, esté activo, vigente y con usos disponibles */
export async function validarCupon(codigo: string): Promise<ResultadoCupon> {
  const supabase = obtenerClienteSupabase()
  const limpio = (codigo || '').trim().toUpperCase()
  if (!limpio || !supabase) return { valido: false, mensaje: 'El código promocional no existe o está inactivo.' }
  const { data } = await supabase.from('promociones').select('*').eq('codigo', limpio).maybeSingle()
  if (!data) return { valido: false, mensaje: 'El código promocional no existe o está inactivo.' }
  const promocion = promocionDeFila(data)
  if (!promocion.activo) return { valido: false, mensaje: 'El código promocional no existe o está inactivo.' }
  if (promocion.fechaExpiracion && new Date(promocion.fechaExpiracion) < new Date()) return { valido: false, mensaje: 'Este cupón ha expirado.' }
  if (promocion.usosMaximos > 0 && promocion.usosActuales >= promocion.usosMaximos) return { valido: false, mensaje: 'Este cupón ha alcanzado el límite máximo de usos.' }
  return { valido: true, promocion }
}

/** Precio final en COP con el cupón aplicado (nunca negativo ni mayor al precio base) */
export function aplicarCupon(precioBaseCOP: number, promocion?: Promocion | null): number {
  if (!promocion) return precioBaseCOP
  const final = promocion.tipoDescuento === 'porcentaje' ? precioBaseCOP * (1 - Math.min(100, Math.max(0, promocion.valor)) / 100) : Math.min(precioBaseCOP, promocion.valor)
  return Math.max(0, Math.round(final))
}

/** Suma un uso al cupón */
export async function registrarUsoCupon(promocion: Promocion): Promise<void> {
  const supabase = obtenerClienteSupabase()
  if (!supabase) return
  await supabase.from('promociones').update({ usos_actuales: promocion.usosActuales + 1 }).eq('id', promocion.id)
}

/** Banner superior activo de la landing (el más reciente) */
export async function obtenerBannerActivo(): Promise<PublicacionLanding | null> {
  const supabase = obtenerClienteSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('publicaciones_landing')
    .select('*')
    .eq('activo', true)
    .eq('tipo', 'banner_superior')
    .order('fecha_creacion', { ascending: false })
    .limit(1)
  if (error || !data?.length) return null
  return publicacionDeFila(data[0])
}
