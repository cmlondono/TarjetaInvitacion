import { NextRequest, NextResponse } from 'next/server'
import { obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { aplicarCupon, validarCupon } from '@/lib/promociones-servidor'

export const dynamic = 'force-dynamic'

/**
 * POST /api/promociones/validar { codigo }
 * Valida un cupón en la base de datos y devuelve el precio con descuento.
 * Solo informa lo necesario para mostrarlo (no expone usos ni otros cupones).
 */
export async function POST(req: NextRequest) {
  const { codigo } = await req.json().catch(() => ({}))
  const resultado = await validarCupon(String(codigo || ''))
  if (!resultado.valido) return NextResponse.json({ valido: false, mensaje: resultado.mensaje })
  const { precioPremiumCOP } = await obtenerConfiguracionGlobal()
  const { promocion } = resultado
  return NextResponse.json({
    valido: true,
    codigo: promocion.codigo,
    tipoDescuento: promocion.tipoDescuento,
    valor: promocion.valor,
    precioFinalCOP: aplicarCupon(precioPremiumCOP, promocion),
  })
}
