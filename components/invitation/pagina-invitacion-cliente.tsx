'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DetalleEvento, Invitado } from '@/types/invitation'
import { EventoRepositorio, InvitadoRepositorio } from '@/lib/storage'
import { DynamicInvitationCard } from './dynamic-invitation-card'
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
  // 1. Resolver evento: Priorizar SSR si existe, o hidratar inmediatamente desde localStorage
  const [evento, setEvento] = useState<DetalleEvento>(() => {
    if (eventoInicial && eventoInicial.id !== 'demo') {
      return eventoInicial
    }

    if (typeof window !== 'undefined') {
      const local = EventoRepositorio.obtenerPorSlug(slug)
      if (local) return local
    }

    return (
      eventoInicial || {
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
    )
  })

  // 2. Resolver invitado con datos reales (pases asignados, código, estado previo)
  const [invitado, setInvitado] = useState<Invitado | null>(() => {
    if (!nombreParam && !tokenParam) return null

    // Intentar buscar en local si ya existe
    if (typeof window !== 'undefined') {
      if (tokenParam) {
        const invLocal = InvitadoRepositorio.obtenerPorCodigoAcceso(evento.id, tokenParam)
        if (invLocal) return invLocal
      }
      if (nombreParam) {
        const invLocal = InvitadoRepositorio.obtenerPorNombre(evento.id, nombreParam)
        if (invLocal) return invLocal
      }
    }

    // Si aún no está en local, generar objeto con el ID real del evento
    return {
      id: 'inv-temp',
      eventoId: evento.id,
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
    // Si el evento actual es demo o faltan datos, buscar en local
    let eventoActual = evento
    if (evento.id === 'demo' || !evento.id) {
      const guardadoLocal = EventoRepositorio.obtenerPorSlug(slug)
      if (guardadoLocal) {
        eventoActual = guardadoLocal
        setEvento(guardadoLocal)
      }
    }

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
  }, [slug, nombreParam, tokenParam, evento.id])

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

  return (
    <DynamicInvitationCard
      evento={evento}
      visual={evento.configuracionVisual || TEMA_POR_DEFECTO}
      invitado={invitado}
    />
  )
}
