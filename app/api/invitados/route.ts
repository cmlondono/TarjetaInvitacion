import { NextRequest, NextResponse } from 'next/server'
import { obtenerClienteSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventoId = searchParams.get('eventoId')

    if (!eventoId) {
      return NextResponse.json(
        { exito: false, error: 'Identificador de evento requerido.' },
        { status: 400 }
      )
    }

    const supabase = obtenerClienteSupabase()

    if (supabase) {
      const { data, error } = await supabase
        .from('invitados')
        .select('*')
        .eq('evento_id', eventoId)
        .order('creado_en', { ascending: false })

      if (error) {
        console.error('Error consultando invitados en Supabase:', error)
        return NextResponse.json({ exito: true, invitados: [] })
      }

      const invitadosFormateados = (data || []).map((inv: any) => ({
        id: inv.id,
        eventoId: inv.evento_id,
        nombre: inv.nombre,
        pases: inv.pases,
        esPlural: inv.es_plural,
        telefono: inv.telefono,
        codigoAcceso: inv.codigo_acceso,
        confirmado: inv.confirmado,
        estadoConfirmacion: inv.confirmado ? 'confirmado' : 'pendiente',
        cuposConfirmados: inv.confirmado ? inv.pases : 0,
        fechaConfirmacion: inv.fecha_confirmacion,
      }))

      return NextResponse.json({ exito: true, invitados: invitadosFormateados })
    }

    return NextResponse.json({ exito: true, invitados: [] })
  } catch (err: any) {
    return NextResponse.json(
      { exito: false, error: err.message },
      { status: 500 }
    )
  }
}
