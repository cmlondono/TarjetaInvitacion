import { NextRequest, NextResponse } from 'next/server'
import { obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { mapearEventoDesdeDb, mapearEventoAFila, limpiarEventoPublico } from '@/lib/storage'
import { DetalleEvento, SeccionModular } from '@/types/invitation'

export const dynamic = 'force-dynamic'

/**
 * Busca un evento con la base de datos como fuente de verdad.
 * La memoria/disco del servidor solo se usa si Supabase no está configurado o no responde.
 */
async function buscarEvento(filtro: {
  slug?: string | null
  token?: string | null
  id?: string | null
}): Promise<{ evento: DetalleEvento | null; origen: 'supabase' | 'servidor_disco' | null }> {
  const supabase = obtenerClienteSupabase()
  if (supabase) {
    let query = supabase.from('eventos').select('*')
    if (filtro.slug) query = query.eq('slug_publico', filtro.slug)
    else if (filtro.token) query = query.eq('token_admin', filtro.token)
    else if (filtro.id) query = query.eq('id', filtro.id)

    const { data, error } = await query.maybeSingle()
    if (data && !error) {
      const eventoDb = mapearEventoDesdeDb(data)
      ServidorAlmacen.guardarEvento(eventoDb)
      return { evento: eventoDb, origen: 'supabase' }
    }
    // La base de datos respondió que no existe: es definitivo (no servir copias en caché de eventos borrados)
    if (!error) return { evento: null, origen: null }
    console.warn('[api/eventos] Supabase no respondió, usando respaldo:', error.message)
  }

  let evento: DetalleEvento | null = null
  if (filtro.slug) evento = ServidorAlmacen.obtenerEventoPorSlug(filtro.slug)
  if (!evento && filtro.token) evento = ServidorAlmacen.obtenerEventoPorToken(filtro.token)
  if (!evento && filtro.id) evento = ServidorAlmacen.obtenerEventoPorId(filtro.id)
  return { evento, origen: evento ? 'servidor_disco' : null }
}

/**
 * Conserva lo que aportaron los invitados (canciones, reservas de regalos, votos) cuando el
 * anfitrión guarda una versión de la invitación que se cargó antes de esas interacciones.
 * El anfitrión decide qué regalos u opciones existen; los invitados, quién reservó y cuántos votos hay.
 */
function fusionarInteracciones(nuevas: SeccionModular[] = [], existentes: SeccionModular[] = []): SeccionModular[] {
  const porId = new Map(existentes.map((s) => [s.id, s]))
  return nuevas.map((s) => {
    const previa = porId.get(s.id)
    if (!previa || previa.tipo !== s.tipo) return s
    const datos = { ...(s.datos || {}) }
    if (s.tipo === 'playlist') {
      const idsHost = new Set((s.datos?.canciones || []).map((c) => c.id))
      const deInvitados = (previa.datos?.canciones || []).filter((c) => !idsHost.has(c.id))
      // Las canciones nuevas de los invitados se suman; las que el anfitrión borró ya no vienen en su lista
      const borradasPorHost = new Set(s.datos?.cancionesEliminadas || [])
      datos.canciones = [...(s.datos?.canciones || []), ...deInvitados.filter((c) => !borradasPorHost.has(c.id))]
    }
    if (s.tipo === 'lista_regalos') {
      const reservas = new Map((previa.datos?.regalos || []).map((r) => [r.id, r.reservadoPor]))
      datos.regalos = (s.datos?.regalos || []).map((r) => (reservas.get(r.id) ? { ...r, reservadoPor: reservas.get(r.id) } : r))
    }
    if (s.tipo === 'juego_adivinar') {
      const votos = new Map((previa.datos?.opcionesJuego || []).map((o) => [o.id, o.votos || 0]))
      datos.opcionesJuego = (s.datos?.opcionesJuego || []).map((o) => ({ ...o, votos: Math.max(o.votos || 0, votos.get(o.id) || 0) }))
    }
    return { ...s, datos }
  })
}

/**
 * GET /api/eventos
 * Obtiene un evento por slug público, token de administración o id único.
 * Solo la consulta por token (anfitrión) devuelve el token de administración.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const token = searchParams.get('token')
    const id = searchParams.get('id')

    if (!slug && !token && !id) {
      return NextResponse.json(
        { ok: false, error: 'Se requiere slug, token o id' },
        { status: 400 }
      )
    }

    const { evento, origen } = await buscarEvento({ slug, token, id })

    if (evento) {
      const esAnfitrion = Boolean(token) && evento.tokenAdmin === token
      return NextResponse.json(
        { ok: true, evento: esAnfitrion ? evento : limpiarEventoPublico(evento), origen },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Evento no encontrado o no disponible temporalmente. Si el problema persiste, comuníquese con el administrador del sistema.' },
      { status: 404 }
    )
  } catch (err: any) {
    console.error('Error en GET /api/eventos:', err)
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al procesar la solicitud. Por favor, comuníquese con el administrador del sistema.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/eventos
 * Persiste un evento en Supabase (fuente de verdad) y en la caché del servidor.
 * - Un evento existente solo puede sobrescribirse presentando su token de administración.
 * - El estado Premium y el cupo de cortesía los decide el servidor, nunca el navegador.
 */
export async function POST(req: NextRequest) {
  try {
    const cuerpo = await req.json()
    const evento: DetalleEvento = cuerpo?.evento || cuerpo

    if (!evento || !evento.id || !evento.titulo || !evento.tokenAdmin || !evento.slugPublico) {
      return NextResponse.json(
        { ok: false, error: 'Datos de evento inválidos' },
        { status: 400 }
      )
    }

    const { evento: eventoExistente } = await buscarEvento({ id: evento.id })

    if (eventoExistente) {
      if (eventoExistente.tokenAdmin && eventoExistente.tokenAdmin !== evento.tokenAdmin) {
        return NextResponse.json(
          { ok: false, error: 'No autorizado para modificar esta invitación.' },
          { status: 403 }
        )
      }
      // Evento ya creado: preservar su cupo histórico y el estado Premium validado por la pasarela
      evento.limiteGratisInvitados =
        eventoExistente.limiteGratisInvitados ||
        (eventoExistente.configuracionVisual as any)?.limiteGratisInvitados ||
        50
      evento.esPremium = Boolean(eventoExistente.esPremium)
      evento.creadoEn = eventoExistente.creadoEn || evento.creadoEn
      // El enlace público solo cambia desde «Cambiar enlace» del panel (/api/eventos/enlace): una pestaña
      // abierta con el enlace anterior no debe devolverlo al guardar
      evento.slugPublico = eventoExistente.slugPublico || evento.slugPublico
      // Si el evento se creó con una plantilla Premium, guardar desde el navegador no puede quitar esa marca
      const plantillaPremium = (eventoExistente.configuracionVisual as any)?.plantillaPremium
      if (plantillaPremium && evento.configuracionVisual) (evento.configuracionVisual as any).plantillaPremium = plantillaPremium
      // El nombre del enlace también se cambia solo desde «Cambiar enlace»
      const nombreEnlace = (eventoExistente.configuracionVisual as any)?.nombreEnlace
      if (nombreEnlace && evento.configuracionVisual) (evento.configuracionVisual as any).nombreEnlace = nombreEnlace
      evento.secciones = fusionarInteracciones(evento.secciones, eventoExistente.secciones)
    } else {
      // Evento nuevo: snapshot del cupo vigente; Premium solo se activa tras un pago verificado
      // Cupo gratis vigente según el panel de administración (base de datos, no la memoria del servidor)
      const configActual = await obtenerConfiguracionGlobal()
      evento.limiteGratisInvitados = configActual.limiteGratisInvitados || 50
      evento.esPremium = false
    }

    if (!evento.configuracionVisual) {
      evento.configuracionVisual = {} as any
    }
    (evento.configuracionVisual as any).limiteGratisInvitados = evento.limiteGratisInvitados

    const supabase = obtenerClienteSupabase()
    let guardadoEnSupabase = false

    if (supabase) {
      const { error } = await supabase.from('eventos').upsert(mapearEventoAFila(evento))
      if (error) {
        console.error('[POST /api/eventos] Error guardando en Supabase:', error.message)
        return NextResponse.json(
          { ok: false, error: 'No se pudo guardar en la base de datos. Intente nuevamente en unos segundos.' },
          { status: 502 }
        )
      }
      guardadoEnSupabase = true
    } else {
      console.info(
        '[POST /api/eventos] Supabase no configurado: evento guardado solo en el disco del servidor. Configure NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para compartir enlaces en producción.'
      )
    }

    ServidorAlmacen.guardarEvento(evento)

    return NextResponse.json({
      ok: true,
      evento,
      persistencia: guardadoEnSupabase ? 'supabase_y_disco' : 'disco_local',
      supabaseConfigurado: Boolean(supabase),
      guardadoEnSupabase,
      guardadoEn: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error en POST /api/eventos:', err)
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al guardar el evento. Por favor, comuníquese con el administrador del sistema.' },
      { status: 500 }
    )
  }
}
