import { NextResponse } from 'next/server'
import { removerCookieSesion } from '@/lib/admin-auth'

export async function POST() {
  const response = NextResponse.json({ exito: true, mensaje: 'Sesión finalizada con éxito.' })
  removerCookieSesion(response)
  return response
}
