import { NextResponse } from 'next/server'
import { generarFirmaIntegridadWompi, ConfiguracionPagoWompi } from '@/lib/wompi'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tokenAdmin, eventoId, tituloEvento } = body

    const publicKey =
      process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
      'pub_test_Q5yDA9xoKdePzhSGeVe9HAUr1jiFdAcI'
    const integritySecret =
      process.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_b8a6a8e63e12480bbcf6791e813f8903'
    const amountInCents = parseInt(process.env.WOMPI_MONTO_CENTAVOS || '1590000', 10)
    const currency = 'COP'

    // Prefijo y token para asociar unívocamente el pago al evento
    const tokenLimpio = (tokenAdmin || eventoId || 'evento').toString().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
    const reference = `PREM_${tokenLimpio}_${Date.now()}`

    // Generar la firma de integridad SHA-256
    const signatureIntegrity = generarFirmaIntegridadWompi(
      reference,
      amountInCents,
      currency,
      integritySecret
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = tokenAdmin
      ? `${appUrl}/gestionar/${tokenAdmin}?pago=exitoso`
      : `${appUrl}/crear?pago=exitoso`

    const esModoPrueba = publicKey.startsWith('pub_test_')

    const configuracion: ConfiguracionPagoWompi = {
      publicKey,
      currency,
      amountInCents,
      reference,
      signatureIntegrity,
      redirectUrl,
      esModoPrueba,
    }

    return NextResponse.json({
      exito: true,
      configuracion,
      montoFormateadoCOP: '$15.900 COP',
      equivalenteUSD: '$3.99 USD',
      tituloEvento: tituloEvento || 'Pase Ilimitado Protocolario',
    })
  } catch (error) {
    console.error('Error al generar transacción de Wompi:', error)
    return NextResponse.json(
      { exito: false, error: 'No se pudo generar la transacción de Wompi' },
      { status: 500 }
    )
  }
}
