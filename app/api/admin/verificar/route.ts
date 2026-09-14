import { NextResponse } from 'next/server'
import { obtenerSesionAdmin } from '@/lib/admin-auth'

export async function GET() {
  const sesion = await obtenerSesionAdmin()
  if (!sesion) {
    return NextResponse.json({ autenticado: false }, { status: 401 })
  }
  return NextResponse.json({ autenticado: true, usuario: sesion.usuario, rol: sesion.rol })
}
