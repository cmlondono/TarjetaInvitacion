import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SesionAdmin } from '@/types/admin'

const NOMBRE_COOKIE_ADMIN = 'invitacionesya_admin_session'
const DURACION_SESION_SEGUNDOS = 8 * 60 * 60 // 8 horas

// Secreto para firmar tokens de sesión
function obtenerSecretoJwt(): string {
  return (
    process.env.MASTER_ADMIN_JWT_SECRET ||
    'secret_master_superadmin_invitacionesya_2026_super_safe_token_key_99'
  )
}

// Credenciales del superadministrador configuradas por variables de entorno
export function obtenerCredencialesAdmin(): { usuario: string; contrasena: string } | null {
  const usuario = process.env.MASTER_ADMIN_USER
  const contrasena = process.env.MASTER_ADMIN_PASSWORD
  if (!usuario || !contrasena) {
    return null
  }
  return { usuario, contrasena }
}

/**
 * Comparación segura contra ataques de temporización (timing attacks)
 */
export function compararEnTiempoConstante(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Genera un token de sesión firmado criptográficamente con HMAC-SHA256
 */
export function generarTokenSesion(usuario: string): string {
  const expiraEn = Date.now() + DURACION_SESION_SEGUNDOS * 1000
  const sesion: SesionAdmin = { usuario, rol: 'superadmin', expiraEn }
  const payloadBase64 = Buffer.from(JSON.stringify(sesion)).toString('base64url')

  const secreto = obtenerSecretoJwt()
  const firma = crypto
    .createHmac('sha256', secreto)
    .update(payloadBase64)
    .digest('base64url')

  return `${payloadBase64}.${firma}`
}

/**
 * Valida la firma criptográfica y la vigencia del token de sesión
 */
export function validarTokenSesion(token: string): SesionAdmin | null {
  try {
    if (!token || !token.includes('.')) return null
    const [payloadBase64, firma] = token.split('.')

    const secreto = obtenerSecretoJwt()
    const firmaEsperada = crypto
      .createHmac('sha256', secreto)
      .update(payloadBase64)
      .digest('base64url')

    if (!compararEnTiempoConstante(firma, firmaEsperada)) {
      return null
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const sesion: SesionAdmin = JSON.parse(payloadJson)

    // Verificar si no ha expirado
    if (Date.now() > sesion.expiraEn) {
      return null
    }

    return sesion
  } catch (error) {
    return null
  }
}

/**
 * Obtiene la sesión de administrador activa desde las cookies
 */
export async function obtenerSesionAdmin(): Promise<SesionAdmin | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(NOMBRE_COOKIE_ADMIN)
  if (!cookie?.value) return null
  return validarTokenSesion(cookie.value)
}

/**
 * Adjunta la cookie segura HttpOnly a la respuesta
 */
export function adjuntarCookieSesion(response: NextResponse, token: string): void {
  response.cookies.set({
    name: NOMBRE_COOKIE_ADMIN,
    value: token,
    httpOnly: true, // Inaccesible para JavaScript en el navegador (protege contra XSS)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DURACION_SESION_SEGUNDOS,
    path: '/',
  })
}

/**
 * Elimina la cookie de sesión
 */
export function removerCookieSesion(response: NextResponse): void {
  response.cookies.set({
    name: NOMBRE_COOKIE_ADMIN,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

// Control básico en memoria de intentos de inicio de sesión (Protección contra fuerza bruta)
const intentosFallidos = new Map<string, { cantidad: number; bloqueadoHasta: number }>()

export function registrarIntentoFallido(ip: string): { bloqueado: boolean; minutosRestantes?: number } {
  const ahora = Date.now()
  const registro = intentosFallidos.get(ip) || { cantidad: 0, bloqueadoHasta: 0 }

  if (registro.bloqueadoHasta > ahora) {
    const minutos = Math.ceil((registro.bloqueadoHasta - ahora) / 60000)
    return { bloqueado: true, minutosRestantes: minutos }
  }

  registro.cantidad += 1

  // Si supera 5 intentos fallidos, bloquear por 15 minutos
  if (registro.cantidad >= 5) {
    registro.bloqueadoHasta = ahora + 15 * 60 * 1000
    intentosFallidos.set(ip, registro)
    return { bloqueado: true, minutosRestantes: 15 }
  }

  intentosFallidos.set(ip, registro)
  return { bloqueado: false }
}

export function resetearIntentosFallidos(ip: string): void {
  intentosFallidos.delete(ip)
}
