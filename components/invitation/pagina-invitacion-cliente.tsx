'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DetalleEvento, Invitado } from '@/types/invitation'
import { EventoRepositorio, InvitadoRepositorio } from '@/lib/storage'
import { DynamicInvitationCard } from './dynamic-invitation-card'
import { SobreAperturaAnimado } from './sobre-apertura-animado'
import { TEMA_POR_DEFECTO } from '@/lib/theme-presets'
import { haExpirado } from '@/lib/event-utils'
import { Calendar, ArrowRight, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'

interface PaginaInvitacionClienteProps {
  eventoInicial: DetalleEvento | null
  slug: string
  nombreParam?: string | null
  tokenParam?: string | null
  esPluralParam?: boolean
}

export function PaginaInvitacionCliente({
  eventoInicial,
  slug,
  nombreParam,
  tokenParam,
  esPluralParam = false,
}: PaginaInvitacionClienteProps) {
  const [montado, setMontado] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [reintentando, setReintentando] = useState(false)

  // 1. Resolver evento de forma idéntica en SSR y cliente para evitar Hydration Mismatch
  const [evento, setEvento] = useState<DetalleEvento | null>(() => {
    if (eventoInicial && eventoInicial.id !== 'demo') {
      return eventoInicial
    }
    return null
  })

  // 2. Invitado base determinista para SSR y primer render
  const [invitado, setInvitado] = useState<Invitado | null>(() => {
    if (!nombreParam && !tokenParam) return null
    return {
      id: 'inv-temp',
      eventoId: eventoInicial?.id || 'demo',
      nombre: nombreParam || 'Invitado de Honor',
      pases: 1,
      esPlural: esPluralParam,
      codigoAcceso: tokenParam || 'token',
      confirmado: false,
      estadoConfirmacion: 'pendiente',
    }
  })

  const cargarEvento = useCallback(async () => {
    setReintentando(true)
    setNoEncontrado(false)

    try {
      // A. Buscar en almacenamiento local del navegador (si es el dispositivo del anfitrión)
      const guardadoLocal = EventoRepositorio.obtenerPorSlug(slug)
      if (guardadoLocal && guardadoLocal.id !== 'demo') {
        setEvento(guardadoLocal)

        // Respaldo proactivo: si el anfitrión tiene el evento en local, asegurar que el servidor también lo tenga
        fetch('/api/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guardadoLocal),
        }).catch(() => {})

        setReintentando(false)
        return guardadoLocal
      }

      // B. Consultar la API del servidor (fundamental para invitados en celulares y otros dispositivos)
      const res = await fetch(`/api/eventos?slug=${encodeURIComponent(slug)}`)
      if (res.ok) {
        const data = await res.json()
        if (data?.evento && data.evento.id !== 'demo') {
          setEvento(data.evento)
          setReintentando(false)
          return data.evento
        }
      }

      // Si no se encontró en local ni en el servidor
      setNoEncontrado(true)
    } catch (err) {
      console.error('Error cargando invitación:', err)
      setNoEncontrado(true)
    } finally {
      setReintentando(false)
    }

    return null
  }, [slug])

  // 3. Efecto de hidratación para asegurar que el evento y el invitado estén 100% sincronizados
  useEffect(() => {
    setMontado(true)

    // Si ya vino resuelto desde SSR, sincronizar proactivamente al servidor
    if (evento && evento.id !== 'demo') {
      fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento),
      }).catch(() => {})
      return
    }

    // Si no tenemos evento aún, cargarlo
    cargarEvento().then((ev) => {
      const eventoActual = ev || evento
      if (!eventoActual) return

      // Buscar invitado real en local o remoto
      if (nombreParam || tokenParam) {
        let invitadoReal: Invitado | null = null

        if (tokenParam) {
          invitadoReal = InvitadoRepositorio.obtenerPorCodigoAcceso(eventoActual.id, tokenParam)
        }
        if (!invitadoReal && nombreParam) {
          invitadoReal = InvitadoRepositorio.obtenerPorNombre(eventoActual.id, nombreParam)
        }

        if (invitadoReal) {
          setInvitado(invitadoReal)
        } else {
          // Consultar API remota por si el pase fue expedido en otro dispositivo
          fetch(
            `/api/invitados?eventoId=${encodeURIComponent(eventoActual.id)}&slug=${encodeURIComponent(slug)}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.invitados && Array.isArray(data.invitados)) {
                const coincidencia = data.invitados.find(
                  (i: Invitado) =>
                    (tokenParam && i.codigoAcceso === tokenParam) ||
                    (nombreParam &&
                      i.nombre &&
                      i.nombre.trim().toLowerCase() === nombreParam.trim().toLowerCase())
                )
                if (coincidencia) {
                  setInvitado(coincidencia)
                }
              }
            })
            .catch(() => {})
        }
      }
    })
  }, [slug, nombreParam, tokenParam, cargarEvento, evento])

  // Estado: Invitación no encontrada (enlace roto o aún no guardado)
  if (noEncontrado && !evento) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif mb-2 text-slate-100">
            Invitación No Disponible
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            No se pudo cargar la información de la invitación con el código <span className="font-mono text-amber-300">/i/{slug}</span>. Si el problema persiste o considera que es un error, por favor comuníquese con el anfitrión o con el administrador del sistema.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => cargarEvento()}
              disabled={reintentando}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={reintentando ? 'animate-spin' : ''} />
              <span>{reintentando ? 'Reintentando conexión...' : 'Reintentar Carga'}</span>
            </button>

            <Link
              href="/crear"
              className="w-full py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/60 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Confeccionar mi propia tarjeta</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Estado previo a la resolución del evento (evita cualquier discrepancia de SSR vs cliente)
  if (!evento) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-10 h-10 border-2 border-amber-400/80 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-amber-200/90 font-serif tracking-[0.2em] uppercase">
          Cargando Pase Protocolario...
        </p>
      </div>
    )
  }

  // Verificación de expiración (Fecha del evento + 7 días)
  const eventoHaCaducado = haExpirado(evento.expiraEn)

  if (eventoHaCaducado) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={22} />
          </div>
          <h1 className="text-xl font-bold font-serif mb-2 text-white">Este acto ha finalizado</h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            La fecha programada para este evento ha concluido y el enlace protocolario ha cumplido su ciclo de vida.
          </p>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-3">
              ¿Desea confeccionar una invitación para su propio acto?
            </p>
            <Link
              href="/crear"
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Confeccionar Tarjeta Formal</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const visualActual = evento.configuracionVisual || TEMA_POR_DEFECTO

  return (
    <SobreAperturaAnimado
      evento={evento}
      visual={visualActual}
      invitado={invitado}
    >
      <DynamicInvitationCard
        evento={evento}
        visual={visualActual}
        invitado={invitado}
      />
    </SobreAperturaAnimado>
  )
}
