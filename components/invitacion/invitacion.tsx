'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ConfiguracionVisual, DetalleEvento, Invitado, SeccionModular, TipoSeccion } from '@/types/invitation'
import { experienciaDe, KIT_POR_DEFECTO, visualDesdeKit } from '@/lib/estudio/kits'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { temaDe } from './tema'
import { ProveedorInvitacion, esInvitadoReal, type EdicionInvitacion, type ModoInvitacion } from './contexto'
import {
  BloqueBoton,
  BloqueCuentaRegresiva,
  BloqueFechaHora,
  BloqueGaleria,
  BloqueHistoria,
  BloqueHospedaje,
  BloqueImagen,
  BloqueItinerario,
  BloqueMensaje,
  BloquePadrinos,
  BloquePortada,
  BloqueRegalosBancarios,
  BloqueSeparador,
  BloqueTexto,
  BloqueUbicacion,
  BloqueVestimenta,
  type PropsBloque,
} from './bloques'
import { BloqueCollage, BloqueConfirmacion, BloqueJuego, BloqueListaRegalos, BloquePlaylist, BloqueVaca } from './bloques-interactivos'
import { ConfirmacionAsistencia, leerRespuestaGuardada, type RespuestaInvitado } from './confirmacion'
import { AperturaInvitacion } from './apertura'
import { useMusicaFondo } from './musica'
import { CapaFotoFondo } from './foto-fondo'
import { CapaEscena } from './escenas'

const BLOQUES: Partial<Record<TipoSeccion, (p: PropsBloque) => React.ReactElement | null>> = {
  cabecera: BloquePortada,
  cuenta_regresiva: BloqueCuentaRegresiva,
  fecha_hora: BloqueFechaHora,
  itinerario: BloqueItinerario,
  ubicacion: BloqueUbicacion,
  codigo_vestimenta: BloqueVestimenta,
  regalos_bancarios: BloqueRegalosBancarios,
  galeria_fotos: BloqueGaleria,
  mensaje_libre: BloqueMensaje,
  hospedaje: BloqueHospedaje,
  confirmacion_rsvp: BloqueConfirmacion,
  texto_libre: BloqueTexto,
  imagen_libre: BloqueImagen,
  boton_enlace: BloqueBoton,
  separador_ornamental: BloqueSeparador,
  lienzo_libre: BloqueCollage,
  historia: BloqueHistoria,
  padrinos: BloquePadrinos,
  playlist: BloquePlaylist,
  vaca_regalo: BloqueVaca,
  lista_regalos: BloqueListaRegalos,
  juego_adivinar: BloqueJuego,
}

export interface InvitacionProps {
  evento: DetalleEvento
  visual?: ConfiguracionVisual
  invitado?: Invitado | null
  modo?: ModoInvitacion
  /** Dentro de un marco de dispositivo (editor): la apertura y la confirmación no ocupan toda la ventana */
  contenida?: boolean
  mostrarApertura?: boolean
  claveApertura?: number
  edicion?: EdicionInvitacion
  seleccionId?: string | null
  alSeleccionarBloque?: (seccionId: string) => void
}

/**
 * La invitación que recibe el invitado. El mismo componente se usa en el editor (modo 'editor'),
 * en la vista previa ('vista') y en el enlace público ('publico'): lo que se diseña es lo que se ve.
 */
export function Invitacion({
  evento,
  visual: visualProp,
  invitado = null,
  modo = 'publico',
  contenida = false,
  mostrarApertura = modo === 'publico',
  claveApertura = 0,
  edicion,
  seleccionId,
  alSeleccionarBloque,
}: InvitacionProps) {
  const visual = visualProp || evento.configuracionVisual || visualDesdeKit(KIT_POR_DEFECTO)
  const tema = useMemo(() => temaDe(visual), [visual])
  const experiencia = useMemo(() => experienciaDe(visual), [visual])
  const [abierta, setAbierta] = useState(!mostrarApertura || experiencia.apertura === 'directo')
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false)
  const [respuesta, setRespuesta] = useState<RespuestaInvitado | null>(null)
  const [indiceHistoria, setIndiceHistoria] = useState(0)

  useEffect(() => {
    setAbierta(!mostrarApertura || experiencia.apertura === 'directo')
  }, [claveApertura, mostrarApertura, experiencia.apertura])

  useEffect(() => {
    if (modo === 'publico') setRespuesta(leerRespuestaGuardada(evento.id, invitado))
  }, [modo, evento.id, invitado])

  // Música: suena después de abrir la invitación (los navegadores bloquean el audio antes de un toque)
  const musica = useMusicaFondo(visual.musicaFondo, modo !== 'editor', contenida)
  const iniciarMusica = musica.iniciar
  const alAbrir = useCallback(() => {
    setAbierta(true)
    iniciarMusica()
  }, [iniciarMusica])

  const interactuar = useCallback(
    async (seccionId: string, accion: string, datos: Record<string, unknown>): Promise<SeccionModular | null> => {
      if (modo !== 'publico') return null
      try {
        const res = await fetch('/api/interacciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: evento.slugPublico, seccionId, accion, datos, codigoAcceso: invitado?.codigoAcceso }),
        })
        const r = await res.json()
        return res.ok && r.seccion ? (r.seccion as SeccionModular) : null
      } catch {
        return null
      }
    },
    [modo, evento.slugPublico, invitado?.codigoAcceso]
  )

  const secciones = useMemo(
    () => [...(evento.secciones || [])].filter((s) => s.visible).sort((a, b) => a.orden - b.orden),
    [evento.secciones]
  )

  const recorrido = modo === 'editor' ? 'pagina' : experiencia.recorrido
  const real = esInvitadoReal(invitado)

  const valor = {
    evento,
    visual,
    tema,
    experiencia,
    invitado,
    modo,
    editable: modo === 'editor' && Boolean(edicion),
    edicion,
    seleccionId,
    alSeleccionarBloque,
    abrirConfirmacion: () => modo !== 'editor' && setConfirmacionAbierta(true),
    respuesta,
    interactuar,
  }

  const renderBloque = (s: SeccionModular) => {
    const Componente = BLOQUES[s.tipo]
    return Componente ? <Componente key={s.id} seccion={s} /> : null
  }

  const saludo = real && experiencia.saludoPersonal && modo !== 'editor' && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--inv-radio)', backgroundColor: 'var(--inv-tarjeta)' }}>
      <span style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: 'var(--inv-suave)', color: 'var(--inv-acento)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
        {invitado.nombre
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0])
          .join('')
          .toUpperCase()}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Hola, {invitado.nombre}</span>
        <span style={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }}>
          {invitado.pases > 1 ? `Reservamos ${invitado.pases} lugares para ustedes` : 'Tenemos un lugar reservado para ti'}
        </span>
      </span>
    </div>
  )

  const pie = (
    <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: 11, padding: '6px 0 4px', color: 'var(--inv-tinta)', opacity: 0.55, textDecoration: 'none' }}>
      Hecha con Tarjetón
    </a>
  )

  const nombreBloque = (s: SeccionModular) =>
    s.tipo === 'cabecera' ? 'Inicio' : s.titulo || CATALOGO_SECCIONES.find((m) => m.tipo === s.tipo)?.nombre || 'Sección'

  return (
    <ProveedorInvitacion value={valor}>
      <div
        data-invitacion=""
        style={{
          ...tema.variables,
          position: 'relative',
          width: '100%',
          minHeight: contenida ? '100%' : '100vh',
          boxSizing: 'border-box',
          // Dentro del editor, mientras se ve la apertura, la invitación no se desplaza por debajo
          ...(contenida && mostrarApertura && !abierta ? { height: '100%', overflow: 'hidden' } : {}),
        }}
      >
        {(visual.fotoFondo?.url || visual.escena) && (
          // Fondo animado y foto de fondo: quedan quietos mientras se recorre la invitación (alto de la pantalla o del marco del editor)
          <div aria-hidden="true" style={{ position: 'sticky', top: 0, height: 'var(--inv-alto-visor, 100dvh)', marginBottom: 'calc(-1 * var(--inv-alto-visor, 100dvh))', zIndex: 0, pointerEvents: 'none' }}>
            <CapaEscena escena={visual.escena} colores={{ fondo: tema.fondo, acento: tema.acento, detalle: tema.detalle }} />
            <CapaFotoFondo foto={visual.fotoFondo} />
          </div>
        )}
        {recorrido === 'historias' ? (
          <div style={{ position: 'relative', zIndex: 1, height: contenida ? '100%' : '100dvh', minHeight: contenida ? 640 : undefined }}>
            <div style={{ position: 'absolute', top: 10, left: 12, right: 12, zIndex: 5, display: 'flex', gap: 4 }}>
              {secciones.map((s, i) => (
                <span key={s.id} style={{ flex: 1, height: 3, borderRadius: 999, backgroundColor: i <= indiceHistoria ? 'var(--inv-acento)' : 'var(--inv-linea)' }} />
              ))}
            </div>
            <div
              onScroll={(e) => setIndiceHistoria(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
              style={{ display: 'flex', height: '100%', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
            >
              {secciones.map((s, i) => (
                <div key={s.id} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', overflowY: 'auto', boxSizing: 'border-box', padding: '28px 16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, maxWidth: 440, margin: '0 auto' }}>
                  {i === 0 && saludo}
                  {renderBloque(s)}
                  {i === secciones.length - 1 && pie}
                </div>
              ))}
            </div>
            <p style={{ position: 'absolute', bottom: 8, left: 0, right: 0, margin: 0, textAlign: 'center', fontSize: 12, opacity: 0.6 }}>Desliza para ver más →</p>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, margin: '0 auto', padding: '16px 16px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recorrido === 'menu' && (
              <nav aria-label="Secciones" style={{ position: 'sticky', top: 0, zIndex: 5, margin: '-16px -16px 0', padding: '10px 16px', backgroundColor: 'var(--inv-fondo)', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {secciones.map((s) => (
                  <a key={s.id} href={`#bloque-${s.id}`} style={{ flexShrink: 0, minHeight: 36, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, textDecoration: 'none', backgroundColor: 'var(--inv-tarjeta)', color: 'var(--inv-tinta)' }}>
                    {nombreBloque(s)}
                  </a>
                ))}
              </nav>
            )}
            {saludo}
            {secciones.map(renderBloque)}
            {pie}
          </div>
        )}

        {musica.fuente && abierta && (
          <>
            {musica.reproductor}
            <button
              type="button"
              onClick={musica.alternar}
              aria-label={musica.esSpotify ? (musica.spotifyVisible ? 'Ocultar reproductor' : 'Mostrar reproductor') : musica.sonando ? 'Pausar música' : 'Reproducir música'}
              style={{ position: contenida ? 'absolute' : 'fixed', right: 16, bottom: 16, zIndex: 60, maxWidth: 'calc(100% - 32px)', minHeight: 44, padding: '0 14px', borderRadius: 999, border: 0, backgroundColor: 'var(--inv-tinta)', color: 'var(--inv-tarjeta)', display: 'inline-flex', alignItems: 'center', gap: 8, font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}
            >
              <span aria-hidden="true">{musica.esSpotify ? '♫' : musica.sonando ? '❚❚' : '▶'}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{visual.musicaFondo?.titulo || 'Música'}</span>
            </button>
          </>
        )}

        {mostrarApertura && !abierta && (
          <AperturaInvitacion
            key={claveApertura}
            tipo={experiencia.apertura}
            tema={tema}
            evento={evento}
            invitado={invitado}
            saludoPersonal={experiencia.saludoPersonal}
            personalizacion={experiencia}
            escena={visual.escena}
            contenida={contenida}
            alAbrir={alAbrir}
          />
        )}

        <ConfirmacionAsistencia
          abierta={confirmacionAbierta}
          alCerrar={() => setConfirmacionAbierta(false)}
          evento={evento}
          invitado={invitado}
          experiencia={experiencia}
          simulada={modo !== 'publico'}
          respuestaPrevia={respuesta}
          alResponder={setRespuesta}
        />
      </div>
    </ProveedorInvitacion>
  )
}
