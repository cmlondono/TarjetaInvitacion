import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { Invitado } from '@/types/invitation'

/** Cupos máximos para quien confirma desde el enlace general (sin pase personal) */
const MAX_CUPOS_ENLACE_GENERAL = 10
const MAX_NOMBRE = 80
const MAX_MENSAJE = 500

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const entero = (v: unknown) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : 0)
const limitar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
// En ilike, % y _ son comodines: escribir «%» como nombre coincidiría con cualquier invitado
const sinComodines = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { eventoId } = body
    const { slugPublico, id, codigoAcceso, estadoConfirmacion } = body
    const nombre = texto(body.nombre, MAX_NOMBRE)
    const mensajeConfirmacion = texto(body.mensajeConfirmacion, MAX_MENSAJE) || null
    const confirma = estadoConfirmacion === 'confirmado'

    if (!estadoConfirmacion || !['confirmado', 'no_asiste'].includes(estadoConfirmacion)) {
      return NextResponse.json({ exito: false, error: 'Estado de confirmación inválido.' }, { status: 400 })
    }

    const ahora = new Date().toISOString()
    const supabase = obtenerClienteSupabase()

    // 1. Resolver evento real si viene con 'demo' o solo con slug
    if ((!eventoId || eventoId === 'demo') && slugPublico) {
      const enMemoria = ServidorAlmacen.obtenerEventoPorSlug(slugPublico)
      if (enMemoria) {
        eventoId = enMemoria.id
      } else if (supabase) {
        const { data: eventoDb } = await supabase.from('eventos').select('id').eq('slug_publico', slugPublico).maybeSingle()
        if (eventoDb) eventoId = eventoDb.id
      }
    }

    let invitadoExistente: any = null
    let cupos = 0

    if (supabase) {
      // El evento debe existir
      if (!eventoId || eventoId === 'demo') {
        return NextResponse.json({ exito: false, error: 'Invitación no encontrada.' }, { status: 404 })
      }
      const { data: eventoDb } = await supabase.from('eventos').select('id').eq('id', eventoId).maybeSingle()
      if (!eventoDb) {
        return NextResponse.json({ exito: false, error: 'Invitación no encontrada.' }, { status: 404 })
      }

      // 2. Pase personal: debe coincidir el código de acceso con un invitado de ESTE evento
      if (codigoAcceso && codigoAcceso !== 'token') {
        let consulta = supabase.from('invitados').select('*').eq('evento_id', eventoId).eq('codigo_acceso', codigoAcceso)
        if (id && id !== 'inv-temp') consulta = consulta.eq('id', id)
        const { data } = await consulta.maybeSingle()
        if (!data) {
          return NextResponse.json({ exito: false, error: 'Este pase no es válido para la invitación.' }, { status: 403 })
        }
        invitadoExistente = data
      }

      // 3. Enlace general: se identifica por nombre dentro del evento
      if (!invitadoExistente) {
        if (!nombre) {
          return NextResponse.json({ exito: false, error: 'Escribe tu nombre para confirmar.' }, { status: 400 })
        }
        const { data } = await supabase.from('invitados').select('*').ilike('nombre', sinComodines(nombre)).eq('evento_id', eventoId).limit(1)
        if (data && data.length > 0) invitadoExistente = data[0]
      }

      if (invitadoExistente) {
        const maximo = Math.max(1, invitadoExistente.pases || 1)
        cupos = confirma ? limitar(entero(body.cuposConfirmados) || maximo, 1, maximo) : 0
        const { error } = await supabase
          .from('invitados')
          .update({
            confirmado: confirma,
            fecha_confirmacion: ahora,
            estado_confirmacion: estadoConfirmacion,
            cupos_confirmados: cupos,
            mensaje_confirmacion: mensajeConfirmacion,
          })
          .eq('id', invitadoExistente.id)
        if (error) throw error
      } else {
        // Nuevo invitado desde el enlace general: id y código los genera el servidor
        cupos = confirma ? limitar(entero(body.cuposConfirmados) || 1, 1, MAX_CUPOS_ENLACE_GENERAL) : 0
        const pases = Math.max(1, cupos)
        const nuevo = {
          id: crypto.randomUUID(),
          evento_id: eventoId,
          nombre,
          pases,
          es_plural: pases > 1,
          codigo_acceso: crypto.randomUUID().replace(/-/g, '').slice(0, 10),
          confirmado: confirma,
          fecha_confirmacion: ahora,
          estado_confirmacion: estadoConfirmacion,
          cupos_confirmados: cupos,
          mensaje_confirmacion: mensajeConfirmacion,
        }
        const { error } = await supabase.from('invitados').insert(nuevo)
        if (error) throw error
        invitadoExistente = nuevo
      }
    } else {
      cupos = confirma ? limitar(entero(body.cuposConfirmados) || 1, 1, MAX_CUPOS_ENLACE_GENERAL) : 0
    }

    // 4. Copia en la memoria del servidor (modo sin base de datos)
    const eventoIdFinal = eventoId || 'evento-principal'
    const invitadoMemoria: Invitado = {
      id: invitadoExistente?.id || (id && id !== 'inv-temp' ? id : crypto.randomUUID()),
      eventoId: eventoIdFinal,
      nombre: invitadoExistente?.nombre || nombre || 'Invitado Confirmado',
      pases: invitadoExistente?.pases || Math.max(1, cupos),
      cuposConfirmados: cupos,
      esPlural: (invitadoExistente?.pases || cupos) > 1,
      codigoAcceso: invitadoExistente?.codigo_acceso || (codigoAcceso && codigoAcceso !== 'token' ? codigoAcceso : crypto.randomUUID().slice(0, 8)),
      confirmado: confirma,
      estadoConfirmacion,
      mensajeConfirmacion: mensajeConfirmacion || undefined,
      fechaConfirmacion: ahora,
    }
    ServidorAlmacen.guardarInvitado(eventoIdFinal, invitadoMemoria)

    return NextResponse.json({
      exito: true,
      mensaje: confirma ? '¡Tu asistencia ha sido confirmada con éxito!' : 'Tu respuesta ha sido registrada. ¡Gracias por avisar!',
      fechaConfirmacion: ahora,
      // Sin el código de acceso: quien confirma por nombre no debe recibir el pase de otra persona
      invitado: { ...invitadoMemoria, codigoAcceso: undefined },
    })
  } catch (error: any) {
    console.error('Error procesando confirmación RSVP:', error)
    return NextResponse.json(
      { exito: false, error: 'Error al registrar su confirmación. Por favor, comuníquese con el anfitrión o el administrador del sistema.' },
      { status: 500 }
    )
  }
}
