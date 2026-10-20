import { NextRequest, NextResponse } from 'next/server'
import { obtenerSesionAdmin } from '@/lib/admin-auth'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { filaDePromocion, promocionDeFila } from '@/lib/promociones-servidor'
import type { Promocion } from '@/types/admin'

export const dynamic = 'force-dynamic'

const sinBase = () => NextResponse.json({ error: 'La base de datos no está configurada.' }, { status: 503 })

/** GET /api/admin/promociones — todos los cupones */
export async function GET() {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const { data, error } = await supabase.from('promociones').select('*').order('creado_en', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promociones: (data || []).map(promocionDeFila) })
}

/** POST /api/admin/promociones — crear un cupón */
export async function POST(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const p = (await req.json().catch(() => ({}))) as Partial<Promocion>
  const codigo = String(p.codigo || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30)
  const valor = Number(p.valor)
  if (!codigo) return NextResponse.json({ error: 'Escribe un código.' }, { status: 400 })
  if (!Number.isFinite(valor) || valor < 0 || (p.tipoDescuento === 'porcentaje' && valor > 100)) {
    return NextResponse.json({ error: 'El valor del descuento no es válido.' }, { status: 400 })
  }
  const promocion: Promocion = {
    id: `promo-${crypto.randomUUID().slice(0, 8)}`,
    codigo,
    tipoDescuento: p.tipoDescuento === 'precio_fijo' ? 'precio_fijo' : 'porcentaje',
    valor,
    usosMaximos: Math.max(0, Math.trunc(Number(p.usosMaximos) || 0)),
    usosActuales: 0,
    activo: true,
    fechaExpiracion: p.fechaExpiracion || undefined,
    creadoEn: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('promociones').insert(filaDePromocion(promocion)).select('*').single()
  if (error) {
    const repetido = /duplicate|unique/i.test(error.message)
    return NextResponse.json({ error: repetido ? `Ya existe un cupón con el código ${codigo}.` : error.message }, { status: repetido ? 409 : 500 })
  }
  return NextResponse.json({ promocion: promocionDeFila(data) })
}

/** PATCH /api/admin/promociones — activar o desactivar { id, activo } */
export async function PATCH(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const { id, activo } = await req.json().catch(() => ({}))
  if (typeof id !== 'string' || typeof activo !== 'boolean') return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  const { error } = await supabase.from('promociones').update({ activo }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/promociones?id= */
export async function DELETE(req: NextRequest) {
  if (!(await obtenerSesionAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = obtenerClienteSupabase()
  if (!supabase) return sinBase()
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id.' }, { status: 400 })
  const { error } = await supabase.from('promociones').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
