import { NextRequest, NextResponse } from 'next/server'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { mapearEventoDesdeDb } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

/**
 * GET /api/eventos
 * Obtiene un evento por slug público, token de administración o id único.
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

    // 1. Buscar en memoria global del servidor
    let evento: DetalleEvento | null = null
    if (slug) evento = ServidorAlmacen.obtenerEventoPorSlug(slug)
    if (!evento && token) evento = ServidorAlmacen.obtenerEventoPorToken(token)
    if (!evento && id) evento = ServidorAlmacen.obtenerEventoPorId(id)

    if (evento) {
      return NextResponse.json({ ok: true, evento, origen: 'servidor_memoria' })
    }

    // 2. Si no está en memoria, consultar Supabase PostgreSQL si está configurado
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      let query = supabase.from('eventos').select('*')
      if (slug) query = query.eq('slug_publico', slug)
      else if (token) query = query.eq('token_admin', token)
      else if (id) query = query.eq('id', id)

      const { data, error } = await query.maybeSingle()
      if (data && !error) {
        const eventoDb = mapearEventoDesdeDb(data)
        ServidorAlmacen.guardarEvento(eventoDb)
        return NextResponse.json({ ok: true, evento: eventoDb, origen: 'supabase' })
      }
    }

    return NextResponse.json({ ok: false, error: 'Evento no encontrado' }, { status: 404 })
  } catch (err: any) {
    console.error('Error en GET /api/eventos:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/eventos
 * Persiste un evento en el servidor y opcionalmente en Supabase.
 * Permite que dispositivos móviles, navegadores en incógnito y el renderizado SSR
 * tengan acceso inmediato al evento con todas sus fotos y configuraciones guardadas.
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

    // 1. Guardar en memoria viva del servidor Node.js
    ServidorAlmacen.guardarEvento(evento)

    // 2. Sincronizar en Supabase si está disponible
    try {
      const supabase = obtenerClienteSupabase()
      if (supabase) {
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

        if (error) {
          console.warn('Aviso sincronizando evento con Supabase:', error)
        }
      }
    } catch (dbErr) {
      console.warn('Error conectando a Supabase en POST /api/eventos:', dbErr)
    }

    return NextResponse.json({ ok: true, evento })
  } catch (err: any) {
    console.error('Error en POST /api/eventos:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
