'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DetalleEvento, Invitado } from '@/types/invitation'
import { EventoRepositorio, InvitadoRepositorio } from '@/lib/storage'
import { DynamicInvitationCard } from './dynamic-invitation-card'
import { SobreAperturaAnimado } from './sobre-apertura-animado'
import { TEMA_POR_DEFECTO } from '@/lib/theme-presets'
import { haExpirado } from '@/lib/event-utils'
import { Calendar, ArrowRight } from 'lucide-react'

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

  // 3. Efecto de hidratación para asegurar que el evento y el invitado estén 100% sincronizados
  useEffect(() => {
    setMontado(true)
    // Si no tenemos evento o es demo, buscar en almacenamiento local del navegador
    let eventoActual = evento
    if (!eventoActual || eventoActual.id === 'demo') {
      const guardadoLocal = EventoRepositorio.obtenerPorSlug(slug)
      if (guardadoLocal) {
        eventoActual = guardadoLocal
        setEvento(guardadoLocal)
      } else if (!eventoActual) {
        const demoEvento: DetalleEvento = {
          id: 'demo',
          tokenAdmin: '',
          slugPublico: slug,
          tipoEvento: 'corporativo',
          titulo: 'Convocatoria Oficial',
          subtitulo: 'Tiene el agrado de invitarle a',
          anfitriones: 'Comité Organizador',
          fechaEvento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          horaEvento: '7:00 PM',
          direccion: 'Sede Principal del Evento',
          enlaceMapa: 'https://maps.google.com',
          whatsappNumero: '573000000000',
          whatsappPlantilla: 'Confirmo la asistencia de {invitado} para {pases} persona(s) a {evento}.',
          esPremium: false,
          creadoEn: new Date().toISOString(),
          expiraEn: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        }
        eventoActual = demoEvento
        setEvento(demoEvento)
      }
    }

    if (!eventoActual) return

    // Buscar invitado real en local
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
        fetch(`/api/invitados?eventoId=${encodeURIComponent(eventoActual.id)}&slug=${encodeURIComponent(slug)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.invitados && Array.isArray(data.invitados)) {
              const coincidencia = data.invitados.find(
                (i: Invitado) =>
                  (tokenParam && i.codigoAcceso === tokenParam) ||
                  (nombreParam && i.nombre && i.nombre.trim().toLowerCase() === nombreParam.trim().toLowerCase())
              )
              if (coincidencia) {
                setInvitado(coincidencia)
              }
            }
          })
          .catch(() => {})
      }
    }
  }, [slug, nombreParam, tokenParam, evento?.id])

  // Estado previo a la resolución del evento (evita cualquier discrepancia de SSR vs cliente)
  if (!evento) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
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
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
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
