export interface PreferenciaRespuesta {
  id: string
  init_point: string
  sandbox_init_point: string
  external_reference: string
}

export interface PagoMercadoPagoResponse {
  id: number
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded'
  status_detail: string
  external_reference: string
  transaction_amount: number
  payment_method_id: string
  payment_type_id: string
  payer?: {
    email?: string
  }
}

/**
 * Crea una preferencia de pago en la API oficial de Mercado Pago
 */
export async function crearPreferenciaMercadoPago({
  tokenAdmin,
  eventoId,
  tituloEvento,
  emailCliente,
}: {
  tokenAdmin?: string
  eventoId?: string
  tituloEvento?: string
  emailCliente?: string
}): Promise<PreferenciaRespuesta | null> {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const precio = parseInt(process.env.MERCADOPAGO_PRECIO_COP || '15900', 10)

    const tokenLimpio = (tokenAdmin || eventoId || 'evento')
      .toString()
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 12)
    const externalReference = `PREM_${tokenLimpio}_${Date.now()}`

    const redirectExito = tokenAdmin
      ? `${appUrl}/gestionar/${tokenAdmin}?pago=exitoso`
      : `${appUrl}/crear?pago=exitoso`
    const redirectFallo = tokenAdmin
      ? `${appUrl}/gestionar/${tokenAdmin}?pago=fallido`
      : `${appUrl}/crear?pago=fallido`

    // Si no hay token de acceso configurado aún, retornar simulación para pruebas
    if (!accessToken || accessToken.includes('00000000')) {
      return {
        id: `PREF-DEMO-${Date.now()}`,
        init_point: `${appUrl}/gestionar/${tokenAdmin || 'demo'}?pago=exitoso`,
        sandbox_init_point: `${appUrl}/gestionar/${tokenAdmin || 'demo'}?pago=exitoso`,
        external_reference: externalReference,
      }
    }

    const payload = {
      items: [
        {
          id: 'licencia-premium-invitacionesya',
          title: `Pase Ilimitado: ${tituloEvento || 'Evento Formal'}`,
          description: 'Emisión nominal sin límite de aforo y exclusión total de publicidad',
          quantity: 1,
          currency_id: 'COP',
          unit_price: precio,
        },
      ],
      payer: {
        email: emailCliente || 'cliente@invitacionesya.com',
      },
      back_urls: {
        success: redirectExito,
        pending: redirectExito,
        failure: redirectFallo,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      statement_descriptor: 'INVITACIONESYA',
      notification_url: `${appUrl}/api/pagos/mercadopago/webhook`,
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
    }

    const respuesta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!respuesta.ok) {
      const errorData = await respuesta.text()
      console.error('Error al crear preferencia Mercado Pago:', errorData)
      return null
    }

    const data = await respuesta.json()
    return {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      external_reference: externalReference,
    }
  } catch (error) {
    console.error('Error conectando con Mercado Pago:', error)
    return null
  }
}

/**
 * Consulta un pago por su ID a la API de Mercado Pago
 */
export async function consultarPagoMercadoPago(
  paymentId: string | number
): Promise<PagoMercadoPagoResponse | null> {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    if (!accessToken || accessToken.includes('00000000')) {
      return null
    }

    const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!respuesta.ok) return null
    return (await respuesta.json()) as PagoMercadoPagoResponse
  } catch (error) {
    console.error('Error consultando pago en Mercado Pago:', error)
    return null
  }
}
