import { NextResponse } from 'next/server'
import {
  obtenerCredencialesAdmin,
  compararEnTiempoConstante,
  generarTokenSesion,
  adjuntarCookieSesion,
  registrarIntentoFallido,
  resetearIntentosFallidos,
} from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

    // 1. Verificación de fuerza bruta
    const controlFuerzaBruta = registrarIntentoFallido(ip)
    if (controlFuerzaBruta.bloqueado) {
      return NextResponse.json(
        {
          exito: false,
          error: `Demasiados intentos fallidos por seguridad. Cuenta bloqueada temporalmente por ${controlFuerzaBruta.minutosRestantes} minutos.`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { usuario, contrasena } = body

    if (!usuario || !contrasena) {
      return NextResponse.json(
        { exito: false, error: 'Debe ingresar usuario y contraseña.' },
        { status: 400 }
      )
    }

    const credencialesReales = obtenerCredencialesAdmin()
    if (!credencialesReales) {
      return NextResponse.json(
        {
          exito: false,
          error:
            'Acceso administrativo no configurado en el servidor. Configure MASTER_ADMIN_USER y MASTER_ADMIN_PASSWORD en las variables de entorno.',
        },
        { status: 503 }
      )
    }

    const usuarioValido = compararEnTiempoConstante(usuario.trim(), credencialesReales.usuario)
    const passValido = compararEnTiempoConstante(contrasena.trim(), credencialesReales.contrasena)

    if (!usuarioValido || !passValido) {
      return NextResponse.json(
        { exito: false, error: 'Credenciales de acceso no válidas.' },
        { status: 401 }
      )
    }

    // Acceso exitoso: reiniciar intentos fallidos
    resetearIntentosFallidos(ip)

    // Generar token criptográfico firmado
    const token = generarTokenSesion(credencialesReales.usuario)

    const response = NextResponse.json({
      exito: true,
      mensaje: 'Autenticación exitosa como Superadministrador.',
    })

    // Adjuntar cookie segura HttpOnly
    adjuntarCookieSesion(response, token)

    return response
  } catch (error) {
    console.error('Error en login de administrador:', error)
    return NextResponse.json(
      { exito: false, error: 'Error interno en el servidor de autenticación.' },
      { status: 500 }
    )
  }
}
