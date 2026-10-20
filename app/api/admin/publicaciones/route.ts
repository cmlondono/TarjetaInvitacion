import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { obtenerSesionAdmin } from '@/lib/admin-auth'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { filaDePublicacion, publicacionDeFila } from '@/lib/promociones-servidor'
import type { PublicacionLanding } from '@/types/admin'

export const dynamic = 'force-dynamic'

const sinBase = () => NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 })
const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** GET /api/admin/publicaciones — todos los avisos de la landing */
export async function GET() {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const { data, error } = await supabase.from('publicaciones_landing').select('*').order('fecha_creacion', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ publicaciones: (data || []).map(publicacionDeFila) })
}

/** POST /api/admin/publicaciones — publicar un aviso */
export async function POST(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const p = (await req.json().catch(() => ({}))) as Partial<PublicacionLanding>
  const titulo = texto(p.titulo, 120)
  if (!titulo) return NextResponse.json({ error: 'Escribe un título.' }, { status: 400 })
  const enlace = texto(p.enlaceBoton, 300)
  const publicacion: PublicacionLanding = {
    id: `pub-${crypto.randomUUID().slice(0, 8)}`,
    tipo: p.tipo === 'aviso_destacado' || p.tipo === 'comunicado' ? p.tipo : 'banner_superior',
    titulo,
    contenido: texto(p.contenido, 300),
    textoBoton: texto(p.textoBoton, 40) || undefined,
    // Solo enlaces internos o https (evita javascript: y similares)
    enlaceBoton: enlace && (enlace.startsWith('/') || enlace.startsWith('https://')) ? enlace : undefined,
    colorFondo: /^#[0-9a-f]{6}$/i.test(String(p.colorFondo)) ? p.colorFondo : '#0F172A',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('publicaciones_landing').insert(filaDePublicacion(publicacion)).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/')
  return NextResponse.json({ publicacion: publicacionDeFila(data) })
}

/** PATCH /api/admin/publicaciones — activar o desactivar { id, activo } */
export async function PATCH(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const { id, activo } = await req.json().catch(() => ({}))
  if (typeof id !== 'string' || typeof activo !== 'boolean') return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  const { error } = await supabase.from('publicaciones_landing').update({ activo }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/publicaciones?id= */
export async function DELETE(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id.' }, { status: 400 })
  const { error } = await supabase.from('publicaciones_landing').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}
