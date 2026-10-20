import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { mapearInvitadoDesdeDb } from '@/lib/storage'
import { Invitado } from '@/types/invitation'

interface EventoResuelto {
  id: string
  tokenAdmin: string | null
  esPremium: boolean
  limite: number
}

/** Busca el evento por id o slug, primero en la base de datos y luego en la memoria del servidor */
async function resolverEvento(eventoId: string | null, slug: string | null): Promise<EventoResuelto | null> {
  const supabase = obtenerClienteSupabase()
  if (supabase) {
    // El cupo gratis de cada evento vive en configuracion_visual.limiteGratisInvitados
    // (la tabla eventos no tiene columna limite_gratis_invitados: pedirla hace fallar la consulta)
    let consulta = supabase.from('eventos').select('id, token_admin, es_premium, configuracion_visual')
    if (eventoId && eventoId !== 'demo') consulta = consulta.eq('id', eventoId)
    else if (slug) consulta = consulta.eq('slug_publico', slug)
    else return null
    const { data, error } = await consulta.maybeSingle()
    if (error) console.error('[api/invitados] No se pudo consultar el evento:', error.message)
    if (data) {
      return {
        id: data.id,
        tokenAdmin: data.token_admin,
        esPremium: Boolean(data.es_premium),
        limite: Number(data.configuracion_visual?.limiteGratisInvitados ?? 50) || 50,
      }
    }
  }
  const enMemoria = (eventoId && ServidorAlmacen.obtenerEventoPorId(eventoId)) || (slug && ServidorAlmacen.obtenerEventoPorSlug(slug)) || null
  if (!enMemoria) return null
  return {
    id: enMemoria.id,
    tokenAdmin: enMemoria.tokenAdmin || null,
    esPremium: Boolean(enMemoria.esPremium),
    limite: Number(enMemoria.limiteGratisInvitados || 50),
  }
}

const esAnfitrion = (evento: EventoResuelto, token: unknown) => typeof token === 'string' && token.length > 0 && token === evento.tokenAdmin

/** Datos de un invitado aptos para mostrarse a él mismo */
const vistaInvitado = (inv: Invitado): Invitado => ({ ...inv, telefono: undefined })

/**
 * GET /api/invitados
 * - Con `tokenAdmin` del evento: la lista completa (panel del anfitrión).
 * - Con `codigo`: solo el pase de ese invitado (su enlace personal).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const evento = await resolverEvento(searchParams.get('eventoId'), searchParams.get('slug'))
    if (!evento) {
      return NextResponse.json({ exito: false, error: 'Invitación no encontrada.' }, { status: 404 })
    }
    const supabase = obtenerClienteSupabase()
    const tokenAdmin = searchParams.get('tokenAdmin')
    const codigo = searchParams.get('codigo')

    if (esAnfitrion(evento, tokenAdmin)) {
      const mapaInvitados = new Map<string, Invitado>()
      ServidorAlmacen.obtenerInvitados(evento.id).forEach((inv) => mapaInvitados.set(inv.id, inv))
      if (supabase) {
        const { data, error } = await supabase.from('invitados').select('*').eq('evento_id', evento.id).order('creado_en', { ascending: false })
        if (!error && data) {
          data.forEach((fila: any) => {
            const invDb = mapearInvitadoDesdeDb(fila)
            const anterior = mapaInvitados.get(invDb.id)
            mapaInvitados.set(invDb.id, { ...invDb, ...anterior })
          })
        }
      }
      return NextResponse.json({ exito: true, invitados: Array.from(mapaInvitados.values()) })
    }

    if (codigo) {
      let encontrado: Invitado | null = null
      if (supabase) {
        const { data } = await supabase.from('invitados').select('*').eq('evento_id', evento.id).eq('codigo_acceso', codigo).maybeSingle()
        if (data) encontrado = mapearInvitadoDesdeDb(data)
      }
      if (!encontrado) encontrado = ServidorAlmacen.obtenerInvitados(evento.id).find((i) => i.codigoAcceso === codigo) || null
      return NextResponse.json({ exito: true, invitados: encontrado ? [vistaInvitado(encontrado)] : [] })
    }

    return NextResponse.json({ exito: false, error: 'No autorizado.' }, { status: 401 })
  } catch (err: any) {
    console.error('Error en GET /api/invitados:', err)
    return NextResponse.json(
      { exito: false, error: 'Error del servidor al obtener la lista de invitados. Por favor, comuníquese con el administrador del sistema.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invitados
 * Agrega o actualiza invitados. Solo el anfitrión (con su tokenAdmin) puede hacerlo.
 */
export async function POST(req: NextRequest) {
  try {
    const cuerpo = await req.json()
    const { eventoId, invitado, invitados, tokenAdmin } = cuerpo

    if (!eventoId) {
      return NextResponse.json({ exito: false, error: 'eventoId es requerido' }, { status: 400 })
    }
    const evento = await resolverEvento(eventoId, null)
    if (!evento) {
      return NextResponse.json({ exito: false, error: 'Invitación no encontrada.' }, { status: 404 })
    }
    if (!esAnfitrion(evento, tokenAdmin)) {
      return NextResponse.json({ exito: false, error: 'No autorizado.' }, { status: 403 })
    }

    const lista: Invitado[] = invitados ? invitados : invitado ? [invitado] : []
    const supabase = obtenerClienteSupabase()

    // Límite del plan gratuito, verificado en el servidor
    if (supabase && !evento.esPremium && lista.length > 0) {
      const { data: actuales } = await supabase.from('invitados').select('id').eq('evento_id', evento.id)
      const existentes = new Set((actuales || []).map((f: any) => f.id))
      const nuevos = lista.filter((inv) => !existentes.has(inv.id)).length
      if (existentes.size + nuevos > evento.limite) {
        return NextResponse.json(
          { exito: false, error: `Has alcanzado el límite de ${evento.limite} invitados gratuitos. Pasa al plan ilimitado para agregar más.` },
          { status: 402 }
        )
      }
    }

    lista.forEach((inv) => ServidorAlmacen.guardarInvitado(evento.id, inv))

    if (supabase && lista.length > 0) {
      for (const inv of lista) {
        const { error } = await supabase.from('invitados').upsert({
          id: inv.id,
          evento_id: evento.id,
          nombre: inv.nombre,
          pases: inv.pases || 1,
          es_plural: Boolean(inv.esPlural),
          telefono: inv.telefono || null,
          codigo_acceso: inv.codigoAcceso,
          confirmado: Boolean(inv.confirmado),
          estado_confirmacion: inv.estadoConfirmacion || 'pendiente',
          cupos_confirmados: inv.cuposConfirmados || 0,
          mensaje_confirmacion: inv.mensajeConfirmacion || null,
          fecha_confirmacion: inv.fechaConfirmacion || null,
          enviado_por_whatsapp: Boolean(inv.enviadoPorWhatsApp),
          fecha_envio_whatsapp: inv.fechaEnvioWhatsApp || null,
        })
        // Supabase no lanza excepciones: devuelve el error. Si no se guarda, el panel debe saberlo
        if (error) {
          console.error('[api/invitados] No se pudo guardar el invitado:', error.message)
          return NextResponse.json({ exito: false, error: 'No se pudo guardar el invitado en la base de datos. Intenta de nuevo.' }, { status: 502 })
        }
      }
    }

    return NextResponse.json({ exito: true, total: lista.length })
  } catch (err: any) {
    console.error('Error en POST /api/invitados:', err)
    return NextResponse.json(
      { exito: false, error: 'Error del servidor al registrar invitados. Por favor, comuníquese con el administrador del sistema.' },
      { status: 500 }
    )
  }
}
