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

      if (desde && desde !== 'todos') {
        const fechaDesdeIso = desde.includes('T') ? desde : `${desde}T00:00:00.000Z`
        query = query.gte('fecha_evento', fechaDesdeIso)
      }

      if (hasta && hasta !== 'todos') {
        const fechaHastaIso = hasta.includes('T') ? hasta : `${hasta}T23:59:59.999Z`
        query = query.lte('fecha_evento', fechaHastaIso)
      }

      if (busqueda.trim()) {
        const q = busqueda.trim()
        query = query.or(`titulo.ilike.%${q}%,anfitriones.ilike.%${q}%,slug_publico.ilike.%${q}%`)
      }

      query = query.order('fecha_evento', { ascending: false }).limit(limite)

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
    desde && desde !== 'todos' ? desde : undefined,
    hasta && hasta !== 'todos' ? hasta : undefined,
    busqueda || undefined
  )
  enMemoria.forEach((ev) => {
    if (!eventosMap.has(ev.id)) {
      eventosMap.set(ev.id, ev)
    }
  })

  // 3. Ordenar cronológicamente descendente (más recientes primero)
  const eventosFinal = Array.from(eventosMap.values()).sort(
    (a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime()
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
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ ok: false, error: 'ID de evento requerido' }, { status: 400 })
  }

  try {
    // Resolver el evento primero para obtener su ID canónico y limpiar adecuadamente
    let eventoIdCanonica = id
    const evEnMemoria =
      ServidorAlmacen.obtenerEventoPorId(id) ||
      ServidorAlmacen.obtenerEventoPorSlug(id) ||
      ServidorAlmacen.obtenerEventoPorToken(id)
    if (evEnMemoria) {
      eventoIdCanonica = evEnMemoria.id
    }

    const supabase = obtenerClienteSupabase()
    if (supabase) {
      // 1. Borrar todas las invitaciones y respuestas en cascada en Supabase
      const { error: errInvitados } = await supabase
        .from('invitados')
        .delete()
        .eq('evento_id', eventoIdCanonica)
      if (errInvitados) {
        console.warn('Aviso borrando invitados en Supabase:', errInvitados)
      }

      // 2. Borrar el registro del evento en Supabase (por id canónico, token o slug)
      const { error: errEvento } = await supabase
        .from('eventos')
        .delete()
        .or(`id.eq.${eventoIdCanonica},token_admin.eq.${id},slug_publico.eq.${id}`)

      if (errEvento) {
        console.error('Error borrando evento en Supabase:', errEvento)
        return NextResponse.json(
          { ok: false, error: 'Error al eliminar el evento de la base de datos' },
          { status: 500 }
        )
      }
    }

    // 3. Limpiar almacenamiento en servidor (memoria + disco)
    ServidorAlmacen.eliminarEvento(eventoIdCanonica)
    if (evEnMemoria?.id && evEnMemoria.id !== id) {
      ServidorAlmacen.eliminarEvento(id)
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Evento, invitaciones y confirmaciones eliminados permanentemente en cascada.',
      id: eventoIdCanonica,
    })
  } catch (err: any) {
    console.error('Error procesando eliminación:', err)
    return NextResponse.json(
      { ok: false, error: err.message || 'Error interno del servidor al eliminar' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/eventos
 * Permite al Super Administrador modificar de forma exclusiva:
 * - limiteGratisInvitados (cupo de cortesía individual asignado al evento)
 * - esPremium (estado VIP)
 */
export async function PATCH(request: NextRequest) {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, limiteGratisInvitados, esPremium } = await request.json()
    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID de evento requerido' }, { status: 400 })
    }

    // 1. Obtener evento existente de memoria, disco o Supabase
    let evento =
      ServidorAlmacen.obtenerEventoPorId(id) ||
      ServidorAlmacen.obtenerEventoPorToken(id) ||
      ServidorAlmacen.obtenerEventoPorSlug(id)

    const supabase = obtenerClienteSupabase()
    if (!evento && supabase) {
      const { data } = await supabase.from('eventos').select('*').eq('id', id).maybeSingle()
      if (data) {
        evento = mapearEventoDesdeDb(data)
      }
    }

    if (!evento) {
      return NextResponse.json({ ok: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    // 2. Modificaciones autorizadas del Super Admin
    if (limiteGratisInvitados !== undefined && Number(limiteGratisInvitados) >= 0) {
      evento.limiteGratisInvitados = Number(limiteGratisInvitados)
      if (!evento.configuracionVisual) {
        evento.configuracionVisual = {} as any
      }
      (evento.configuracionVisual as any).limiteGratisInvitados = Number(limiteGratisInvitados)
    }

    if (esPremium !== undefined) {
      evento.esPremium = Boolean(esPremium)
    }

    // 3. Guardar en servidor local
    ServidorAlmacen.guardarEvento(evento)

    // 4. Sincronizar en base de datos central Supabase
    if (supabase) {
      const actualizacion: any = {
        es_premium: Boolean(evento.esPremium),
        configuracion_visual: evento.configuracionVisual || {},
      }
      if (evento.limiteGratisInvitados !== undefined) {
        actualizacion.limite_gratis_invitados = evento.limiteGratisInvitados
      }
      const { error: errUp } = await supabase.from('eventos').update(actualizacion).eq('id', evento.id)
      if (errUp && errUp.message?.includes('limite_gratis_invitados')) {
        delete actualizacion.limite_gratis_invitados
        await supabase.from('eventos').update(actualizacion).eq('id', evento.id)
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Evento actualizado exitosamente por el administrador.',
      evento,
    })
  } catch (err: any) {
    console.error('Error en PATCH /api/admin/eventos:', err)
    return NextResponse.json(
      { ok: false, error: err.message || 'Error al actualizar evento' },
      { status: 500 }
    )
  }
}
