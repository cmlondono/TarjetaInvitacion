import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { ServidorAlmacen } from '@/lib/server-storage'
import { Invitado } from '@/types/invitation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let {
      eventoId,
      slugPublico,
      id,
      codigoAcceso,
      nombre,
      estadoConfirmacion,
      cuposConfirmados,
      mensajeConfirmacion,
    } = body

    if (!estadoConfirmacion || !['confirmado', 'no_asiste'].includes(estadoConfirmacion)) {
      return NextResponse.json(
        { exito: false, error: 'Estado de confirmación inválido.' },
        { status: 400 }
      )
    }

    const ahora = new Date().toISOString()
    const supabase = obtenerClienteSupabase()

    // 1. Resolver evento real si viene con 'demo' o solo con slug
    if ((!eventoId || eventoId === 'demo') && slugPublico) {
      const enMemoria = ServidorAlmacen.obtenerEventoPorSlug(slugPublico)
      if (enMemoria) {
        eventoId = enMemoria.id
      } else if (supabase) {
        const { data: eventoDb } = await supabase
          .from('eventos')
          .select('id')
          .eq('slug_publico', slugPublico)
          .maybeSingle()
        if (eventoDb) eventoId = eventoDb.id
      }
    }

    let invitadoExistente: any = null

    // 2. Buscar si el invitado ya existe en Supabase
    if (supabase) {
      if (codigoAcceso && codigoAcceso !== 'token') {
        const { data } = await supabase
          .from('invitados')
          .select('*')
          .eq('codigo_acceso', codigoAcceso)
          .maybeSingle()
        if (data) {
          invitadoExistente = data
          if (!eventoId || eventoId === 'demo') eventoId = data.evento_id
        }
      }

      if (!invitadoExistente && id && id !== 'inv-temp') {
        const { data } = await supabase
          .from('invitados')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (data) {
          invitadoExistente = data
          if (!eventoId || eventoId === 'demo') eventoId = data.evento_id
        }
      }

      if (!invitadoExistente && nombre && eventoId && eventoId !== 'demo') {
        const { data } = await supabase
          .from('invitados')
          .select('*')
          .ilike('nombre', nombre.trim())
          .eq('evento_id', eventoId)
          .limit(1)
        if (data && data.length > 0) {
          invitadoExistente = data[0]
        }
      }

      if (invitadoExistente) {
        const updateData: any = {
          confirmado: estadoConfirmacion === 'confirmado',
          fecha_confirmacion: ahora,
        }

        // Actualizar en Supabase
        try {
          await supabase
            .from('invitados')
            .update({
              ...updateData,
              estado_confirmacion: estadoConfirmacion,
              cupos_confirmados: cuposConfirmados,
              mensaje_confirmacion: mensajeConfirmacion,
            })
            .eq('id', invitadoExistente.id)
        } catch {
          await supabase
            .from('invitados')
            .update(updateData)
            .eq('id', invitadoExistente.id)
        }
      } else if (eventoId && eventoId !== 'demo') {
        // Registrar nuevo si no existía previamente
        const nuevoId =
          id && id !== 'inv-temp'
            ? id
            : typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2)
        const nuevoCodigo =
          codigoAcceso && codigoAcceso !== 'token'
            ? codigoAcceso
            : Math.random().toString(36).substring(2, 8)

        await supabase.from('invitados').insert({
          id: nuevoId,
          evento_id: eventoId,
          nombre: nombre || 'Invitado Confirmado',
          pases: cuposConfirmados || 1,
          es_plural: (cuposConfirmados || 1) > 1,
          codigo_acceso: nuevoCodigo,
          confirmado: estadoConfirmacion === 'confirmado',
          fecha_confirmacion: ahora,
        })

        invitadoExistente = {
          id: nuevoId,
          evento_id: eventoId,
          nombre: nombre || 'Invitado Confirmado',
          pases: cuposConfirmados || 1,
          codigo_acceso: nuevoCodigo,
        }
      }
    }

    // 3. Guardar SIEMPRE en la memoria del servidor
    const idFinal =
      invitadoExistente?.id ||
      (id && id !== 'inv-temp' ? id : typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2))
    const eventoIdFinal = eventoId || 'evento-principal'

    const invitadoMemoria: Invitado = {
      id: idFinal,
      eventoId: eventoIdFinal,
      nombre: nombre || invitadoExistente?.nombre || 'Invitado Confirmado',
      pases: invitadoExistente?.pases || cuposConfirmados || 1,
      cuposConfirmados: cuposConfirmados !== undefined ? cuposConfirmados : (estadoConfirmacion === 'confirmado' ? (invitadoExistente?.pases || 1) : 0),
      esPlural: (cuposConfirmados || 1) > 1,
      codigoAcceso: codigoAcceso && codigoAcceso !== 'token' ? codigoAcceso : invitadoExistente?.codigo_acceso || Math.random().toString(36).substring(2, 8),
      confirmado: estadoConfirmacion === 'confirmado',
      estadoConfirmacion: estadoConfirmacion,
      mensajeConfirmacion: mensajeConfirmacion,
      fechaConfirmacion: ahora,
    }

    ServidorAlmacen.guardarInvitado(eventoIdFinal, invitadoMemoria)

    return NextResponse.json({
      exito: true,
      mensaje:
        estadoConfirmacion === 'confirmado'
          ? '¡Tu asistencia ha sido confirmada con éxito!'
          : 'Tu respuesta ha sido registrada. ¡Gracias por avisar!',
      fechaConfirmacion: ahora,
      invitado: invitadoMemoria,
    })
  } catch (error: any) {
    console.error('Error procesando confirmación RSVP:', error)
    return NextResponse.json(
      { exito: false, error: 'Error procesando la solicitud: ' + error.message },
      { status: 500 }
    )
  }
}
