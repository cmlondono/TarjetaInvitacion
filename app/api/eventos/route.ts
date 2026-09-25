import { NextRequest, NextResponse } from 'next/server'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { mapearEventoDesdeDb } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

/**
 * GET /api/eventos
 * Obtiene un evento por slug público, token de administración o id único.
 * También permite diagnosticar la conexión con Supabase (?verificarDb=1).
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

    // 1. Buscar en almacenamiento persistente del servidor (memoria + disco JSON)
    let evento: DetalleEvento | null = null
    if (slug) evento = ServidorAlmacen.obtenerEventoPorSlug(slug)
    if (!evento && token) evento = ServidorAlmacen.obtenerEventoPorToken(token)
    if (!evento && id) evento = ServidorAlmacen.obtenerEventoPorId(id)

    if (evento) {
      return NextResponse.json({ ok: true, evento, origen: 'servidor_disco' })
    }

    // 2. Si no está en disco/memoria, consultar Supabase PostgreSQL si está configurado
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      let query = supabase.from('eventos').select('*')
      if (slug) query = query.eq('slug_publico', slug)
      else if (token) query = query.eq('token_admin', token)
      else if (id) query = query.eq('id', id)

      const { data, error } = await query.maybeSingle()
      if (data && !error) {
        const eventoDb = mapearEventoDesdeDb(data)
        // Guardar en disco local también como respaldo de alta velocidad
        ServidorAlmacen.guardarEvento(eventoDb)
        return NextResponse.json({ ok: true, evento: eventoDb, origen: 'supabase' })
      }
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
 * Persiste un evento en el servidor (disco y memoria) y en Supabase si está disponible.
 * Permite que dispositivos móviles, navegadores en incógnito y el renderizado SSR
 * tengan acceso inmediato al evento con todas sus fotos, secciones y configuraciones.
 */
export async function POST(req: NextRequest) {
  try {
    const cuerpo = await req.json()
    const evento: DetalleEvento = cuerpo?.evento || cuerpo

    if (!evento || !evento.id || !evento.titulo) {
      return NextResponse.json(
        { ok: false, error: 'Datos de evento inválidos' },
        { status: 400 }
      )
    }

    // 0. Protección estricta de regla de negocio:
    // El cupo de cortesía se fija al momento de crear el evento según la configuración del sistema vigente.
    // Los anfitriones NO pueden alterar este valor. Si el evento ya existía, se preserva su cupo asignado.
    const eventoExistente =
      ServidorAlmacen.obtenerEventoPorId(evento.id) ||
      ServidorAlmacen.obtenerEventoPorToken(evento.tokenAdmin)

    if (eventoExistente) {
      // Evento ya creado: preservar su límite histórico/asignado (ej: 50)
      evento.limiteGratisInvitados =
        eventoExistente.limiteGratisInvitados ||
        (eventoExistente.configuracionVisual as any)?.limiteGratisInvitados ||
        50
      // Proteger también el estado Premium pagado
      if (eventoExistente.esPremium) {
        evento.esPremium = true
      }
    } else {
      // Evento nuevo: snapshot del límite de cortesía vigente en la configuración global
      const configActual = ServidorAlmacen.obtenerConfiguracion()
      evento.limiteGratisInvitados = configActual?.limiteGratisInvitados || 50
    }

    // Persistir dentro de configuracionVisual para redundancia total en Supabase JSONB
    if (!evento.configuracionVisual) {
      evento.configuracionVisual = {} as any
    }
    (evento.configuracionVisual as any).limiteGratisInvitados = evento.limiteGratisInvitados

    // 1. Guardar de forma inmediata en el almacenamiento persistente del servidor (Disco JSON + Memoria)
    ServidorAlmacen.guardarEvento(evento)

    // 2. Sincronizar en Supabase si está disponible
    const supabase = obtenerClienteSupabase()
    let guardadoEnSupabase = false

    if (supabase) {
      try {
        const { error } = await supabase.from('eventos').upsert({
          id: evento.id,
          token_admin: evento.tokenAdmin,
          slug_publico: evento.slugPublico,
          tipo_evento: evento.tipoEvento,
          titulo: evento.titulo,
          subtitulo: evento.subtitulo || null,
          anfitriones: evento.anfitriones,
          fecha_evento: evento.fechaEvento,
          hora_evento: evento.horaEvento || '',
          direccion: evento.direccion,
          enlace_mapa: evento.enlaceMapa || '',
          codigo_vestimenta: evento.codigoVestimenta || null,
          paleta_vestimenta: evento.paletaVestimenta || [],
          datos_bancarios: evento.datosBancarios || {},
          whatsapp_numero: evento.whatsappNumero,
          whatsapp_plantilla: evento.whatsappPlantilla,
          fotos_galeria: evento.fotosGaleria || [],
          imagen_portada: evento.imagenPortada || null,
          imagen_retrato: evento.imagenRetrato || null,
          es_premium: Boolean(evento.esPremium),
          configuracion_visual: evento.configuracionVisual || {},
          secciones: evento.secciones || [],
          expira_en: evento.expiraEn,
        })

        if (!error) {
          guardadoEnSupabase = true
        } else {
          console.error('[POST /api/eventos] Error sincronizando con Supabase:', error.message)
        }
      } catch (dbErr: any) {
        console.error('[POST /api/eventos] Error conectando con Supabase:', dbErr?.message)
      }
    } else {
      console.info(
        '[POST /api/eventos] Evento guardado en disco del servidor. Nota: Para compartir enlaces con invitados en internet (Vercel), configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
    }

    return NextResponse.json({
      ok: true,
      evento,
      persistencia: guardadoEnSupabase ? 'supabase_y_disco' : 'disco_local',
      supabaseConfigurado: Boolean(supabase),
      guardadoEnSupabase,
    })
  } catch (err: any) {
    console.error('Error en POST /api/eventos:', err)
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al guardar el evento. Por favor, comuníquese con el administrador del sistema.' },
      { status: 500 }
    )
  }
}
