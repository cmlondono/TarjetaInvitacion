import { NextRequest, NextResponse } from 'next/server'
import { obtenerSesionAdmin } from '@/lib/admin-auth'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearEventoDesdeDb } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

/**
 * GET /api/admin/eventos
 * Consulta paginada y filtrada por RANGO DE FECHAS para optimizar escalabilidad
 * cuando existen cientos o miles de eventos en la plataforma.
 */
export async function GET(request: NextRequest) {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const desde = searchParams.get('desde') // Formato YYYY-MM-DD o ISO
  const hasta = searchParams.get('hasta') // Formato YYYY-MM-DD o ISO
  const busqueda = searchParams.get('busqueda') || ''
  const limite = Number(searchParams.get('limite')) || 100

  const eventosMap = new Map<string, DetalleEvento>()

  // 1. Consultar base de datos central Supabase aplicando filtro por fecha a nivel SQL
  try {
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      let query = supabase.from('eventos').select('*')

      if (desde) {
        const fechaDesdeIso = desde.includes('T') ? desde : `${desde}T00:00:00.000Z`
        query = query.gte('fecha_evento', fechaDesdeIso)
      }

      if (hasta) {
        const fechaHastaIso = hasta.includes('T') ? hasta : `${hasta}T23:59:59.999Z`
        query = query.lte('fecha_evento', fechaHastaIso)
      }

      if (busqueda.trim()) {
        const q = busqueda.trim()
        query = query.or(`titulo.ilike.%${q}%,anfitriones.ilike.%${q}%,slug_publico.ilike.%${q}%`)
      }

      query = query.order('fecha_evento', { ascending: true }).limit(limite)

      const { data, error } = await query
      if (data && !error) {
        data.forEach((fila) => {
          const ev = mapearEventoDesdeDb(fila)
          eventosMap.set(ev.id, ev)
        })
      } else if (error) {
        console.warn('Error consultando eventos en Supabase:', error)
      }
    }
  } catch (err) {
    console.warn('Fallo de conexión en Supabase /api/admin/eventos:', err)
  }

  // 2. Fusionar con caché en memoria del servidor
  const enMemoria = ServidorAlmacen.obtenerEventosPorRango(
    desde || undefined,
    hasta || undefined,
    busqueda || undefined
  )
  enMemoria.forEach((ev) => {
    if (!eventosMap.has(ev.id)) {
      eventosMap.set(ev.id, ev)
    }
  })

  // 3. Ordenar cronológicamente por la fecha del evento
  const eventosFinal = Array.from(eventosMap.values()).sort(
    (a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime()
  )

  return NextResponse.json({
    ok: true,
    eventos: eventosFinal,
    total: eventosFinal.length,
    desde: desde || null,
    hasta: hasta || null,
  })
}

/**
 * DELETE /api/admin/eventos
 * Elimina definitivamente un evento, todas sus invitaciones y confirmaciones en cascada.
 */
export async function DELETE(request: NextRequest) {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID de evento requerido' }, { status: 400 })
  }

  try {
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      // 1. Borrar todas las invitaciones y respuestas (confirmados, declinados, pendientes)
      const { error: errInvitados } = await supabase
        .from('invitados')
        .delete()
        .eq('evento_id', id)
      if (errInvitados) {
        console.warn('Aviso borrando invitados en Supabase:', errInvitados)
      }

      // 2. Borrar el registro del evento en Supabase
      const { error: errEvento } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id)
      if (errEvento) {
        console.error('Error borrando evento en Supabase:', errEvento)
        return NextResponse.json(
          { error: 'Error al eliminar el evento de la base de datos' },
          { status: 500 }
        )
      }
    }

    // 3. Limpiar memoria del servidor
    ServidorAlmacen.eliminarEvento(id)

    return NextResponse.json({
      ok: true,
      mensaje: 'Evento, invitaciones y confirmaciones eliminados permanentemente.',
    })
  } catch (err: any) {
    console.error('Error procesando eliminación:', err)
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
