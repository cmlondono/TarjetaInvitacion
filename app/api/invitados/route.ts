import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearInvitadoDesdeDb } from '@/lib/storage'
import { Invitado } from '@/types/invitation'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let eventoId = searchParams.get('eventoId')
    const slug = searchParams.get('slug')

    const supabase = obtenerClienteSupabase()

    // 1. Resolver ID real del evento si se proporcionó un slug
    if ((!eventoId || eventoId === 'demo') && slug) {
      const enMemoria = ServidorAlmacen.obtenerEventoPorSlug(slug)
      if (enMemoria) {
        eventoId = enMemoria.id
      } else if (supabase) {
        const { data: eventoDb } = await supabase
          .from('eventos')
          .select('id')
          .eq('slug_publico', slug)
          .maybeSingle()
        if (eventoDb) eventoId = eventoDb.id
      }
    }

    if (!eventoId) {
      return NextResponse.json(
        { exito: false, error: 'Identificador de evento requerido.' },
        { status: 400 }
      )
    }

    const mapaInvitados = new Map<string, Invitado>()

    // 2. Cargar primero de memoria del servidor
    const enMemoria = ServidorAlmacen.obtenerInvitados(eventoId)
    enMemoria.forEach((inv) => mapaInvitados.set(inv.id, inv))

    // 3. Cargar de Supabase si está disponible
    if (supabase && eventoId !== 'demo') {
      const { data, error } = await supabase
        .from('invitados')
        .select('*')
        .eq('evento_id', eventoId)
        .order('creado_en', { ascending: false })

      if (!error && data) {
        data.forEach((fila: any) => {
          const invDb = mapearInvitadoDesdeDb(fila)
          // Si ya existía en memoria con datos más recientes, fusionar
          const anterior = mapaInvitados.get(invDb.id)
          mapaInvitados.set(invDb.id, { ...invDb, ...anterior })
        })
      }
    }

    return NextResponse.json({
      exito: true,
      invitados: Array.from(mapaInvitados.values()),
    })
  } catch (err: any) {
    console.error('Error en GET /api/invitados:', err)
    return NextResponse.json(
      { exito: false, error: err.message },
      { status: 500 }
    )
  }
}
