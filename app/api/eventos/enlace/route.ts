import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearEventoDesdeDb } from '@/lib/storage'

export const dynamic = 'force-dynamic'

/** 'Cumple de Emilio 4' → 'cumple-de-emilio-4' (solo minúsculas, números y guiones) */
function normalizarEnlace(texto: string): string {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

/**
 * PATCH /api/eventos/enlace { tokenAdmin, slug }
 * Cambia el enlace público de la invitación (tarjeton.online/i/<slug>). Solo el anfitrión
 * (con su token) puede hacerlo. Los enlaces enviados antes con el nombre anterior dejan de funcionar.
 */
export async function PATCH(req: NextRequest) {
  const { tokenAdmin, slug } = await req.json().catch(() => ({}))
  if (!tokenAdmin) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })

  const nuevo = normalizarEnlace(slug)
  if (nuevo.length < 3) {
    return NextResponse.json({ ok: false, error: 'El enlace debe tener al menos 3 letras o números.' }, { status: 400 })
  }

  const supabase = obtenerClienteSupabase()
  if (!supabase) return NextResponse.json({ ok: false, error: 'Base de datos no disponible.' }, { status: 503 })

  const { data: evento } = await supabase.from('eventos').select('*').eq('token_admin', String(tokenAdmin)).maybeSingle()
  if (!evento) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 })
  if (evento.slug_publico === nuevo) return NextResponse.json({ ok: true, slug: nuevo })

  const { data: ocupado } = await supabase.from('eventos').select('id').eq('slug_publico', nuevo).neq('id', evento.id).maybeSingle()
  if (ocupado) return NextResponse.json({ ok: false, error: 'Ese enlace ya lo usa otra invitación. Prueba con otro.' }, { status: 409 })

  const { error } = await supabase.from('eventos').update({ slug_publico: nuevo }).eq('id', evento.id)
  if (error) {
    const repetido = error.code === '23505'
    return NextResponse.json(
      { ok: false, error: repetido ? 'Ese enlace ya lo usa otra invitación. Prueba con otro.' : 'No se pudo guardar el enlace.' },
      { status: repetido ? 409 : 502 }
    )
  }

  ServidorAlmacen.guardarEvento(mapearEventoDesdeDb({ ...evento, slug_publico: nuevo }))
  return NextResponse.json({ ok: true, slug: nuevo })
}
