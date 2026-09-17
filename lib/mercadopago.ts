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
  precioCOP,
}: {
  tokenAdmin?: string
  eventoId?: string
  tituloEvento?: string
  emailCliente?: string
  precioCOP?: number
}): Promise<PreferenciaRespuesta | null> {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
    
    // Resolver URL pública real (HTTPS obligatorio en producción para Mercado Pago)
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    if (!appUrl) {
      if (process.env.VERCEL_URL) {
        appUrl = `https://${process.env.VERCEL_URL}`
      } else {
        appUrl = 'https://tarjeton.online'
      }
    }
    if (!appUrl.startsWith('http')) {
      appUrl = `https://${appUrl}`
    }

    const precio = precioCOP && precioCOP > 0
      ? precioCOP
      : parseInt(process.env.MERCADOPAGO_PRECIO_COP || '15900', 10)

    const identificador = tokenAdmin || eventoId || 'evento'
    const externalReference = `PREM_${identificador}_${Date.now()}`

    const redirectExito = tokenAdmin
      ? `${appUrl}/gestionar/${tokenAdmin}?pago=exitoso`
      : `${appUrl}/crear?pago=exitoso`
    const redirectFallo = tokenAdmin
      ? `${appUrl}/gestionar/${tokenAdmin}?pago=fallido`
      : `${appUrl}/crear?pago=fallido`

    // Si no hay token de acceso configurado
    if (!accessToken || accessToken.includes('00000000')) {
      // En desarrollo local, permitir simulación para testing
      if (process.env.NODE_ENV === 'development') {
        return {
          id: `PREF-DEMO-${Date.now()}`,
          init_point: `${appUrl}/gestionar/${tokenAdmin || 'demo'}?pago=exitoso&demo=true`,
          sandbox_init_point: `${appUrl}/gestionar/${tokenAdmin || 'demo'}?pago=exitoso&demo=true`,
          external_reference: externalReference,
        }
      }
      // En producción, no simular aprobaciones gratuitas si falta el token
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado en producción.')
      return null
    }

    const payload: any = {
      items: [
        {
          id: 'licencia-premium-tarjeton',
          title: `Pase Ilimitado: ${tituloEvento || 'Evento Formal'}`,
          description: 'Emisión nominal sin límite de aforo y exclusión total de publicidad',
          quantity: 1,
          currency_id: 'COP',
          unit_price: precio,
        },
      ],
      payer: {
        email: emailCliente && emailCliente.includes('@') ? emailCliente : 'cliente@tarjeton.online',
      },
      back_urls: {
        success: redirectExito,
        pending: redirectExito,
        failure: redirectFallo,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      statement_descriptor: 'TARJETON',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
    }

    // Mercado Pago requiere HTTPS para notification_url
    if (appUrl.startsWith('https://')) {
      payload.notification_url = `${appUrl}/api/pagos/mercadopago/webhook`
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
      sandbox_init_point: data.sandbox_init_point || data.init_point,
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
