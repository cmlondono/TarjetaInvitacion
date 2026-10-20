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

/** Código aleatorio de 5 letras/números que se agrega al final para que el enlace nunca choque con el de otra persona */
function codigoAleatorio(): string {
  const letras = 'abcdefghijkmnpqrstuvwxyz23456789' // sin 0/o ni 1/l para que no se confundan al dictarlo
  return Array.from(crypto.getRandomValues(new Uint8Array(5)), (b) => letras[b % letras.length]).join('')
}

/**
 * PATCH /api/eventos/enlace { tokenAdmin, slug }
 * Cambia el enlace público de la invitación (tarjeton.online/i/<nombre>-<código>). El anfitrión elige
 * el nombre y el servidor le agrega siempre un código aleatorio, así dos personas que escojan el
 * mismo nombre nunca obtienen el mismo enlace. Solo el anfitrión (con su token) puede hacerlo.
 * Los enlaces enviados antes con el nombre anterior dejan de funcionar.
 */
export async function PATCH(req: NextRequest) {
  const { tokenAdmin, slug } = await req.json().catch(() => ({}))
  if (!tokenAdmin) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 401 })

  const nombre = normalizarEnlace(slug).slice(0, 50).replace(/-+$/g, '')
  if (nombre.length < 3) {
    return NextResponse.json({ ok: false, error: 'El enlace debe tener al menos 3 letras o números.' }, { status: 400 })
  }

  const supabase = obtenerClienteSupabase()
  if (!supabase) return NextResponse.json({ ok: false, error: 'Base de datos no disponible.' }, { status: 503 })

  const { data: evento } = await supabase.from('eventos').select('*').eq('token_admin', String(tokenAdmin)).maybeSingle()
  if (!evento) return NextResponse.json({ ok: false, error: 'No autorizado.' }, { status: 403 })

  // Hasta 5 intentos por si el código aleatorio coincidiera con un enlace existente (muy improbable)
  for (let intento = 0; intento < 5; intento++) {
    const nuevo = `${nombre}-${codigoAleatorio()}`
    const { data: ocupado } = await supabase.from('eventos').select('id').eq('slug_publico', nuevo).maybeSingle()
    if (ocupado) continue
    const { error } = await supabase.from('eventos').update({ slug_publico: nuevo }).eq('id', evento.id)
    if (error?.code === '23505') continue
    if (error) return NextResponse.json({ ok: false, error: 'No se pudo guardar el enlace.' }, { status: 502 })
    ServidorAlmacen.guardarEvento(mapearEventoDesdeDb({ ...evento, slug_publico: nuevo }))
    return NextResponse.json({ ok: true, slug: nuevo })
  }
  return NextResponse.json({ ok: false, error: 'No se pudo generar un enlace único. Intenta de nuevo.' }, { status: 409 })
}
