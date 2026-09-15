import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventoId,
      id,
      codigoAcceso,
      nombre,
      estadoConfirmacion,
      cuposConfirmados,
      mensajeConfirmacion,
    } = body

    if (!eventoId) {
      return NextResponse.json(
        { exito: false, error: 'Identificador de evento requerido.' },
        { status: 400 }
      )
    }

    if (!estadoConfirmacion || !['confirmado', 'no_asiste'].includes(estadoConfirmacion)) {
      return NextResponse.json(
        { exito: false, error: 'Estado de confirmación inválido.' },
        { status: 400 }
      )
    }

    const ahora = new Date().toISOString()
    const supabase = obtenerClienteSupabase()

    if (supabase) {
      // 1. Intentar buscar si el invitado ya existe por ID o por Código de Acceso
      let invitadoExistente = null

      if (id) {
        const { data } = await supabase
          .from('invitados')
          .select('*')
          .eq('id', id)
          .eq('evento_id', eventoId)
          .single()
        invitadoExistente = data
      }

      if (!invitadoExistente && codigoAcceso) {
        const { data } = await supabase
          .from('invitados')
          .select('*')
          .eq('codigo_acceso', codigoAcceso)
          .eq('evento_id', eventoId)
          .single()
        invitadoExistente = data
      }

      if (!invitadoExistente && nombre) {
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
        // Actualizar registro existente
        const { error: errorUpdate } = await supabase
          .from('invitados')
          .update({
            confirmado: estadoConfirmacion === 'confirmado',
            fecha_confirmacion: ahora,
          })
          .eq('id', invitadoExistente.id)

        if (errorUpdate) {
          console.error('Error actualizando confirmación en Supabase:', errorUpdate)
        }
      } else {
        // Insertar nuevo registro para pase abierto
        const nuevoId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2)
        const nuevoCodigo = Math.random().toString(36).substring(2, 8)

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
      }
    }

    return NextResponse.json({
      exito: true,
      mensaje:
        estadoConfirmacion === 'confirmado'
          ? '¡Tu asistencia ha sido confirmada con éxito!'
          : 'Tu respuesta ha sido registrada. ¡Gracias por avisar!',
      fechaConfirmacion: ahora,
    })
  } catch (error: any) {
    console.error('Error procesando confirmación RSVP:', error)
    return NextResponse.json(
      { exito: false, error: 'Error procesando la solicitud: ' + error.message },
      { status: 500 }
    )
  }
}
