import crypto from 'crypto'

export interface WompiTransaccionResponse {
  id: string
  created_at: string
  amount_in_cents: number
  reference: string
  customer_email: string
  currency: string
  payment_method_type: string
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
  status_message?: string
}

export interface ConfiguracionPagoWompi {
  publicKey: string
  currency: string
  amountInCents: number
  reference: string
  signatureIntegrity: string
  redirectUrl: string
  esModoPrueba: boolean
}

/**
 * Genera la firma SHA-256 de integridad requerida por Wompi para evitar manipulaciones del monto.
 * Fórmula oficial: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generarFirmaIntegridadWompi(
  referencia: string,
  montoEnCentavos: number,
  moneda: string = 'COP',
  integritySecret?: string
): string {
  const secreto = integritySecret || process.env.WOMPI_INTEGRITY_SECRET || ''
  const cadena = `${referencia}${montoEnCentavos}${moneda}${secreto}`
  return crypto.createHash('sha256').update(cadena, 'utf8').digest('hex')
}

/**
 * Valida la autenticidad de una notificación Webhook enviada por los servidores de Wompi.
 * Fórmula: Concatenar las propiedades indicadas en signature.properties con el timestamp y eventSecret, luego SHA256.
 */
export function validarFirmaWebhookWompi(
  body: any,
  eventSecret?: string
): boolean {
  try {
    const secreto = eventSecret || process.env.WOMPI_EVENT_SECRET || ''
    if (!secreto) return true // Si no hay secreto configurado en pruebas

    const properties: string[] = body?.signature?.properties || []
    const checksumEnviado: string = body?.signature?.checksum || ''
    const timestamp = body?.timestamp

    if (!checksumEnviado || properties.length === 0) {
      return false
    }

    // Obtener los valores anidados indicados en properties (ej: 'transaction.id')
    const valores = properties.map((prop) => {
      const keys = prop.split('.')
      let actual = body?.data
      for (const k of keys) {
        if (actual && typeof actual === 'object') {
          actual = actual[k]
        } else {
          return ''
        }
      }
      return actual
    })

    const cadenaConcatenada = `${valores.join('')}${timestamp}${secreto}`
    const checksumCalculado = crypto
      .createHash('sha256')
      .update(cadenaConcatenada, 'utf8')
      .digest('hex')

    return checksumCalculado === checksumEnviado
  } catch (error) {
    console.error('Error validando firma de Wompi:', error)
    return false
  }
}

/**
 * Consulta el estado de una transacción directamente a los servidores de Wompi
 */
export async function consultarTransaccionWompi(
  transaccionId: string,
  esModoPrueba: boolean = true
): Promise<WompiTransaccionResponse | null> {
  try {
    const baseUrl = esModoPrueba
      ? 'https://sandbox.wompi.co/v1'
      : 'https://production.wompi.co/v1'

    const respuesta = await fetch(`${baseUrl}/transactions/${transaccionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || ''}`,
      },
      cache: 'no-store',
    })

    if (!respuesta.ok) {
      return null
    }

    const data = await respuesta.json()
    return data?.data as WompiTransaccionResponse
  } catch (error) {
    console.error('Error al consultar transacción en Wompi:', error)
    return null
  }
}
