'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Award,
  X,
  Smartphone,
  CheckCircle2,
  Loader2,
  Building,
  Check,
  Wallet,
  Zap,
  Ticket,
  Tag,
} from 'lucide-react'
import { AdminStorage } from '@/lib/admin-storage'
import { Promocion } from '@/types/admin'

interface ModalPagoProps {
  abierto: boolean
  alCerrar: () => void
  alCompletarPago: () => void
  tituloEvento?: string
  tokenAdmin?: string
  eventoId?: string
}

export function ModalPago({
  abierto,
  alCerrar,
  alCompletarPago,
  tituloEvento,
  tokenAdmin,
  eventoId,
}: ModalPagoProps) {
  const [procesando, setProcesando] = useState(false)
  const [pagoExitoso, setPagoExitoso] = useState(false)
  const [idComprobante, setIdComprobante] = useState<string | null>(null)
  const [correoCliente, setCorreoCliente] = useState('')
  const [errorPago, setErrorPago] = useState<string | null>(null)

  // Cupones y Promociones
  const [mostrarCampoCupon, setMostrarCampoCupon] = useState(false)
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState<Promocion | null>(null)
  const [errorCupon, setErrorCupon] = useState<string | null>(null)

  if (!abierto) return null

  const config = AdminStorage.obtenerConfiguracion()
  const precioBaseCOP = config.precioPremiumCOP || 15900
  const precioBaseUSD = config.precioPremiumUSD || 3.99

  let precioFinalCOP = precioBaseCOP
  if (cuponAplicado) {
    if (cuponAplicado.tipoDescuento === 'porcentaje') {
      precioFinalCOP = Math.max(0, Math.round(precioBaseCOP * (1 - cuponAplicado.valor / 100)))
    } else {
      precioFinalCOP = Math.min(precioBaseCOP, cuponAplicado.valor)
    }
  }

  const handleValidarCupon = () => {
    setErrorCupon(null)
    if (!codigoCupon.trim()) return

    const res = AdminStorage.validarCupon(codigoCupon.trim())
    if (res.valido && res.promocion) {
      setCuponAplicado(res.promocion)
      setErrorCupon(null)
    } else {
      setCuponAplicado(null)
      setErrorCupon(res.mensaje || 'Cupón inválido o expirado.')
    }
  }

  const handleQuitarCupon = () => {
    setCuponAplicado(null)
    setCodigoCupon('')
    setErrorCupon(null)
  }

  const handlePagarConMercadoPago = async () => {
    setProcesando(true)
    setErrorPago(null)

    try {
      const res = await fetch('/api/pagos/mercadopago/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAdmin,
          eventoId,
          tituloEvento,
          emailCliente: correoCliente.trim() || undefined,
          precioCOP: precioFinalCOP,
        }),
      })

      const data = await res.json()

      if (!data.exito || !data.initPoint) {
        setErrorPago(data.error || 'No se pudo conectar con Mercado Pago. Revisa la configuración.')
        setProcesando(false)
        return
      }

      // Si el cupón fue aplicado, registrar su uso
      if (cuponAplicado) {
        AdminStorage.registrarUsoCupon(cuponAplicado.codigo)
      }

      // Si tenemos un enlace de Mercado Pago (producción o sandbox)
      if (data.initPoint && !data.initPoint.includes('demo')) {
        // Redirigir directamente en la misma ventana para evitar bloqueos de ventanas emergentes en móviles
        window.location.href = data.initPoint
      } else {
        // Solo en entorno local/desarrollo sin credenciales
        setTimeout(() => {
          setProcesando(false)
          ejecutarAprobacionSimulada()
        }, 1200)
      }
    } catch (err: any) {
      console.error(err)
      setErrorPago('Error de red al conectar con Mercado Pago.')
      setProcesando(false)
    }
  }

  const ejecutarAprobacionSimulada = () => {
    setProcesando(true)
    if (cuponAplicado) {
      AdminStorage.registrarUsoCupon(cuponAplicado.codigo)
    }
    setTimeout(() => {
      setProcesando(false)
      setIdComprobante(`MP-APROBADO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)
      setPagoExitoso(true)
      setTimeout(() => {
        alCompletarPago()
      }, 1500)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 text-slate-900 font-sans">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={alCerrar}
          disabled={procesando}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {pagoExitoso ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold font-serif text-slate-950">
              ¡Pago Aprobado con Éxito!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Su licencia <strong>Pase Ilimitado Protocolario</strong> ha sido activada en Mercado Pago para{' '}
              <em>{tituloEvento || 'su evento'}</em>.
            </p>
            {idComprobante && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 max-w-xs mx-auto">
                ID Transacción: <strong>{idComprobante}</strong>
              </div>
            )}
            <p className="text-[11px] text-slate-400 font-medium">
              Desbloqueando invitados ilimitados y removiendo publicidad...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Cabecera Oficial Mercado Pago */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <Award size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-950">
                    Activación de Pase Ilimitado
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {tituloEvento ? `Evento: ${tituloEvento}` : 'Licencia Oficial Tarjetón'}
                  </p>
                </div>
              </div>

              {/* Insignia Mercado Pago */}
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pasarela Oficial
                </span>
                <span className="text-xs font-black text-[#009EE3] flex items-center justify-end gap-1">
                  <Wallet size={14} />
                  <span>mercado pago</span>
                </span>
              </div>
            </div>

            {/* Resumen del Pedido con Descuento Dinámico */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Licencia Premium de Evento</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Invitados ilimitados + Sin publicidad + QR
                </p>
                {cuponAplicado && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
                    <Tag size={10} /> Cupón {cuponAplicado.codigo} aplicado (
                    {cuponAplicado.tipoDescuento === 'porcentaje'
                      ? `-${cuponAplicado.valor}%`
                      : `Tarifa $${cuponAplicado.valor.toLocaleString('es-CO')}`}
                    )
                  </span>
                )}
              </div>
              <div className="text-right">
                {cuponAplicado ? (
                  <>
                    <span className="text-xs text-slate-400 line-through mr-1 font-mono">
                      ${precioBaseCOP.toLocaleString('es-CO')}
                    </span>
                    <span className="text-2xl font-extrabold font-serif text-emerald-600">
                      ${precioFinalCOP.toLocaleString('es-CO')}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-extrabold font-serif text-slate-950">
                    ${precioBaseCOP.toLocaleString('es-CO')}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 block font-medium">
                  COP (~${precioBaseUSD} USD) · Pago Único
                </span>
              </div>
            </div>

            {/* Apartado de Cupón de Descuento Promocional */}
            <div className="pt-1">
              {!cuponAplicado ? (
                <div>
                  {!mostrarCampoCupon ? (
                    <button
                      type="button"
                      onClick={() => setMostrarCampoCupon(true)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 cursor-pointer underline"
                    >
                      <Ticket size={13} className="text-amber-600" />
                      <span>¿Tienes un código de promoción o descuento?</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                          <Ticket size={12} /> Código Promocional
                        </label>
                        <button
                          type="button"
                          onClick={() => setMostrarCampoCupon(false)}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={codigoCupon}
                          onChange={(e) => setCodigoCupon(e.target.value)}
                          placeholder="Ej: BODA50"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg uppercase font-mono font-bold text-slate-900"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleValidarCupon()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleValidarCupon}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </div>
                      {errorCupon && (
                        <p className="text-[10px] text-rose-600 font-medium">{errorCupon}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600 font-bold" />
                    <span>Descuento activo con cupón <strong>{cuponAplicado.codigo}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuitarCupon}
                    className="text-[10px] text-rose-600 hover:underline cursor-pointer font-bold"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            {/* Beneficios Incluidos */}
            <div className="space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 font-bold shrink-0" />
                <span>Emisión de pases <strong>sin límite de aforo</strong>.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 font-bold shrink-0" />
                <span><strong>Exclusión total de anuncios</strong> publicitarios para tus invitados.</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600 font-bold shrink-0" />
                <span>Confirmaciones nominales de <strong>WhatsApp ilimitadas</strong>.</span>
              </div>
            </div>

            {/* Métodos Soportados por Mercado Pago */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Paga de forma instantánea y segura con:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <Smartphone size={16} className="text-purple-600" />
                  <span className="font-bold text-[11px]">Nequi</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <Building size={16} className="text-blue-600" />
                  <span className="font-bold text-[11px]">PSE (Bancos)</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <CreditCard size={16} className="text-slate-800" />
                  <span className="font-bold text-[11px]">Tarjetas</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center gap-1">
                  <Zap size={16} className="text-amber-600" />
                  <span className="font-bold text-[11px]">Efecty</span>
                </div>
              </div>
            </div>

            {/* Correo para el comprobante */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 block">
                Tu Correo Electrónico (para recibir la confirmación de pago)
              </label>
              <input
                type="email"
                value={correoCliente}
                onChange={(e) => setCorreoCliente(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            {errorPago && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
                {errorPago}
              </div>
            )}

            {/* Botón Principal Mercado Pago */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePagarConMercadoPago}
                disabled={procesando}
                className="w-full py-3.5 px-6 rounded-xl bg-[#009EE3] hover:bg-[#0089C7] text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {procesando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Conectando con Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>
                      Pagar ${precioFinalCOP.toLocaleString('es-CO')} COP con Mercado Pago
                    </span>
                  </>
                )}
              </button>

              {/* Opción de prueba únicamente en desarrollo local */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={ejecutarAprobacionSimulada}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline cursor-pointer"
                  >
                    Simular Aprobación Instantánea (Modo Pruebas / Sandbox)
                  </button>
                </div>
              )}
            </div>

            {/* Sellos de Seguridad */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Cifrado Seguro de 256 bits
              </span>
              <span>·</span>
              <span>Protección al Comprador Mercado Pago</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
