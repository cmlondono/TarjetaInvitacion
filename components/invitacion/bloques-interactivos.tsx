'use client'

import React, { useEffect, useState } from 'react'
import type { SeccionModular } from '@/types/invitation'
import { esInvitadoReal, useInvitacion } from './contexto'
import { Boton, Caja, Etiqueta, MarcoBloque, Texto, icono } from './piezas'
import type { PropsBloque } from './bloques'

const inputEstilo: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 46,
  padding: '0 14px',
  borderRadius: 'var(--inv-radio-control)',
  border: '1.5px solid var(--inv-linea)',
  backgroundColor: 'var(--inv-tarjeta)',
  color: 'var(--inv-tinta)',
  font: 'inherit',
  fontSize: 15,
}

/** Copia local de la sección que se actualiza con la respuesta del servidor tras una interacción */
function useSeccionViva(seccion: SeccionModular) {
  const [viva, setViva] = useState(seccion)
  useEffect(() => setViva(seccion), [seccion])
  return [viva, setViva] as const
}

function leerLocal(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

function guardarLocal(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor)
  } catch {}
}

// ─────────── Playlist colaborativa ───────────
export function BloquePlaylist({ seccion }: PropsBloque) {
  const { modo, invitado, interactuar } = useInvitacion()
  const [viva, setViva] = useSeccionViva(seccion)
  const [abierto, setAbierto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [artista, setArtista] = useState('')
  const [enviando, setEnviando] = useState(false)
  const canciones = viva.datos?.canciones || []

  const agregar = async () => {
    if (!titulo.trim()) return
    setEnviando(true)
    const nueva = await interactuar(seccion.id, 'agregar_cancion', {
      titulo: titulo.trim(),
      artista: artista.trim(),
      propuestaPor: esInvitadoReal(invitado) ? invitado.nombre : 'Un invitado',
    })
    if (nueva) setViva(nueva)
    setTitulo('')
    setArtista('')
    setAbierto(false)
    setEnviando(false)
  }

  return (
    <MarcoBloque seccion={seccion} centrado={false}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <Etiqueta seccion={seccion} />
        <Texto seccion={seccion} campo="subtitulo" valor={seccion.subtitulo || ''} placeholder="Agrega la canción que no puede faltar." estilo={{ fontSize: 14, color: 'var(--inv-tinta-suave)' }} />
      </div>
      {canciones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {canciones.slice(-8).map((c) => (
            <Caja key={c.id} estilo={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'var(--inv-acento)', color: 'var(--inv-texto-acento)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icono.musica}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.titulo}</span>
                <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>
                  {[c.artista, c.propuestaPor ? `la propuso ${c.propuestaPor}` : ''].filter(Boolean).join(' · ')}
                </span>
              </span>
            </Caja>
          ))}
        </div>
      )}
      {abierto ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 600 }}>
            Canción
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} style={inputEstilo} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 600 }}>
            Artista (opcional)
            <input value={artista} onChange={(e) => setArtista(e.target.value)} maxLength={60} style={inputEstilo} />
          </label>
          <Boton onClick={agregar} deshabilitado={enviando || !titulo.trim()}>
            {enviando ? 'Agregando…' : 'Agregar a la playlist'}
          </Boton>
        </div>
      ) : (
        <Boton onClick={() => setAbierto(true)} icono={icono.musica} deshabilitado={modo === 'editor'}>
          Agregar mi canción
        </Boton>
      )}
      {viva.datos?.enlacePlaylist && (
        <Boton href={viva.datos.enlacePlaylist} variante="borde" icono={icono.enlace}>
          Abrir la playlist
        </Boton>
      )}
    </MarcoBloque>
  )
}

// ─────────── Vaca para el regalo ───────────
export function BloqueVaca({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  const meta = Number(datos.metaVaca) || 0
  const recaudado = Number(datos.recaudadoVaca) || 0
  const porcentaje = meta > 0 ? Math.min(100, Math.round((recaudado / meta) * 100)) : 0
  const [copiado, setCopiado] = useState(false)
  const formato = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
  if (!editable && !datos.medioPagoVaca && !datos.enlacePagoVaca) return null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(datos.medioPagoVaca || '')
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} campo="subtitulo" valor={seccion.subtitulo || ''} placeholder="¿Para qué es la vaca?" multilinea estilo={{ fontSize: 14, color: 'var(--inv-tinta-suave)' }} />
      {meta > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 14, borderRadius: 999, backgroundColor: 'var(--inv-suave)', overflow: 'hidden' }}>
            <div style={{ width: `${porcentaje}%`, height: '100%', backgroundColor: 'var(--inv-acento)', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
            <span>{porcentaje}% reunido</span>
            <span>Meta: {formato.format(meta)}</span>
          </div>
        </div>
      )}
      {(datos.medioPagoVaca || editable) && (
        <Caja estilo={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Texto seccion={seccion} dato="medioPagoVaca" valor={datos.medioPagoVaca || ''} placeholder="Ej: Nequi 300 123 4567" estilo={{ flex: 1, fontSize: 15, fontWeight: 700 }} />
          {datos.medioPagoVaca && (
            <Boton onClick={copiar} bloque={false} icono={copiado ? icono.check : icono.copiar}>
              {copiado ? 'Copiado' : 'Copiar'}
            </Boton>
          )}
        </Caja>
      )}
      {datos.enlacePagoVaca && (
        <Boton href={datos.enlacePagoVaca} icono={icono.enlace}>
          Aportar
        </Boton>
      )}
    </MarcoBloque>
  )
}

// ─────────── Lista de regalos reservables ───────────
export function BloqueListaRegalos({ seccion }: PropsBloque) {
  const { modo, invitado, interactuar, evento } = useInvitacion()
  const [viva, setViva] = useSeccionViva(seccion)
  const [pidiendoNombre, setPidiendoNombre] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [enviando, setEnviando] = useState<string | null>(null)
  const regalos = viva.datos?.regalos || []
  const claveMios = `tarjeton_regalos_${evento.id}`
  const [mios, setMios] = useState<string[]>([])
  useEffect(() => setMios(JSON.parse(leerLocal(claveMios) || '[]')), [claveMios])

  const reservar = async (regaloId: string, quien: string) => {
    setEnviando(regaloId)
    const nueva = await interactuar(seccion.id, 'reservar_regalo', { regaloId, nombre: quien })
    if (nueva) {
      setViva(nueva)
      const lista = [...mios, regaloId]
      setMios(lista)
      guardarLocal(claveMios, JSON.stringify(lista))
    }
    setEnviando(null)
    setPidiendoNombre(null)
  }

  const liberar = async (regaloId: string) => {
    setEnviando(regaloId)
    const nueva = await interactuar(seccion.id, 'liberar_regalo', { regaloId })
    if (nueva) {
      setViva(nueva)
      const lista = mios.filter((id) => id !== regaloId)
      setMios(lista)
      guardarLocal(claveMios, JSON.stringify(lista))
    }
    setEnviando(null)
  }

  const alPulsar = (regaloId: string) => {
    if (esInvitadoReal(invitado)) reservar(regaloId, invitado.nombre)
    else setPidiendoNombre(regaloId)
  }

  return (
    <MarcoBloque seccion={seccion} centrado={false}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <Etiqueta seccion={seccion} />
        <Texto seccion={seccion} campo="subtitulo" valor={seccion.subtitulo || ''} placeholder="Reserva uno para que nadie repita." estilo={{ fontSize: 14, color: 'var(--inv-tinta-suave)' }} />
      </div>
      {regalos.length === 0 && modo === 'editor' && <p style={{ margin: 0, fontSize: 13, textAlign: 'center', color: 'var(--inv-tinta-suave)' }}>Agrega regalos en el panel</p>}
      {regalos.map((r) => {
        const reservado = Boolean(r.reservadoPor)
        const esMio = mios.includes(r.id)
        return (
          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Caja estilo={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(reservado ? { backgroundColor: 'var(--inv-acento)', color: 'var(--inv-texto-acento)' } : { border: '2px solid var(--inv-linea)' }) }}>
                {reservado && icono.check}
              </span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, textDecoration: reservado ? 'line-through' : undefined, opacity: reservado ? 0.7 : 1 }}>{r.nombre}</span>
                {reservado && <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>{esMio ? 'Lo llevas tú' : 'Ya está reservado'}</span>}
              </span>
              {r.enlace && !reservado && (
                <a href={r.enlace} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inv-acento)' }}>
                  Ver
                </a>
              )}
              {!reservado ? (
                <Boton onClick={() => alPulsar(r.id)} bloque={false} deshabilitado={modo === 'editor' || enviando === r.id}>
                  {enviando === r.id ? '…' : 'Lo llevo yo'}
                </Boton>
              ) : esMio ? (
                <Boton onClick={() => liberar(r.id)} variante="borde" bloque={false} deshabilitado={enviando === r.id}>
                  Liberar
                </Boton>
              ) : null}
            </Caja>
            {pidiendoNombre === r.id && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input aria-label="Tu nombre" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={60} style={inputEstilo} />
                <Boton onClick={() => nombre.trim() && reservar(r.id, nombre.trim())} bloque={false} deshabilitado={!nombre.trim()}>
                  Reservar
                </Boton>
              </div>
            )}
          </div>
        )
      })}
    </MarcoBloque>
  )
}

// ─────────── Juego / encuesta ───────────
export function BloqueJuego({ seccion }: PropsBloque) {
  const { modo, interactuar, evento } = useInvitacion()
  const [viva, setViva] = useSeccionViva(seccion)
  const clave = `tarjeton_voto_${evento.id}_${seccion.id}`
  const [miVoto, setMiVoto] = useState<string | null>(null)
  useEffect(() => setMiVoto(leerLocal(clave)), [clave])
  const opciones = viva.datos?.opcionesJuego || []
  const total = opciones.reduce((s, o) => s + (o.votos || 0), 0)

  const votar = async (opcionId: string) => {
    if (miVoto || modo === 'editor') return
    setMiVoto(opcionId)
    guardarLocal(clave, opcionId)
    const nueva = await interactuar(seccion.id, 'votar', { opcionId })
    if (nueva) setViva(nueva)
  }

  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="pregunta" valor={viva.datos?.pregunta || ''} placeholder="Escribe la pregunta" estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 20, fontWeight: 600 }} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, opciones.length))}, minmax(0, 1fr))`, gap: 8, width: '100%' }}>
        {opciones.map((o) => {
          const pct = total > 0 ? Math.round(((o.votos || 0) / total) * 100) : 0
          const elegida = miVoto === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => votar(o.id)}
              aria-pressed={elegida}
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 52,
                borderRadius: 'var(--inv-radio-control)',
                border: elegida ? '2px solid var(--inv-acento)' : '1.5px solid var(--inv-linea)',
                backgroundColor: 'var(--inv-tarjeta)',
                color: 'var(--inv-tinta)',
                font: 'inherit',
                fontSize: 15,
                fontWeight: 600,
                cursor: miVoto ? 'default' : 'pointer',
              }}
            >
              {miVoto && <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, backgroundColor: 'var(--inv-suave)' }} />}
              <span style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {o.texto}
                {miVoto && <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>{pct}%</span>}
              </span>
            </button>
          )
        })}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--inv-tinta-suave)' }}>
        {miVoto ? `¡Gracias por votar! ${total} ${total === 1 ? 'voto' : 'votos'} hasta ahora.` : 'Toca tu respuesta'}
      </p>
    </MarcoBloque>
  )
}

// ─────────── Confirmar asistencia (llamado a la acción) ───────────
export function BloqueConfirmacion({ seccion }: PropsBloque) {
  const { abrirConfirmacion, respuesta, invitado } = useInvitacion()
  const datos = seccion.datos || {}
  const pases = esInvitadoReal(invitado) ? invitado.pases : null

  return (
    <MarcoBloque seccion={seccion} ornamentoPorDefecto relleno="26px 20px">
      <Texto seccion={seccion} campo="titulo" valor={seccion.titulo || ''} placeholder="¿Nos acompañas?" etiqueta="h2" estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 28, fontWeight: 600, lineHeight: 1.15 }} />
      <Texto seccion={seccion} campo="subtitulo" valor={seccion.subtitulo || ''} placeholder="Mensaje (opcional)" multilinea estilo={{ fontSize: 14, color: 'var(--inv-tinta-suave)' }} />
      {respuesta ? (
        <Caja estilo={{ alignItems: 'center', textAlign: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {respuesta.estado === 'confirmado'
              ? `Confirmaste ${respuesta.cupos}${pases ? ` de ${pases}` : ''} ${respuesta.cupos === 1 ? 'lugar' : 'lugares'}`
              : 'Nos avisaste que no podrás ir'}
          </span>
          <button type="button" onClick={abrirConfirmacion} style={{ border: 0, background: 'none', color: 'var(--inv-acento)', font: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 40 }}>
            Cambiar mi respuesta
          </button>
        </Caja>
      ) : (
        <Boton onClick={abrirConfirmacion}>{datos.textoBoton || 'Confirmar asistencia'}</Boton>
      )}
      {datos.fechaLimiteRsvp && <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>Por favor responde antes del {datos.fechaLimiteRsvp}</span>}
    </MarcoBloque>
  )
}

// ─────────── Collage libre ───────────
export function BloqueCollage({ seccion }: PropsBloque) {
  const alto = seccion.estilo?.alturaLienzo ?? 75
  // Los elementos libres los dibuja el marco del bloque, como en cualquier otro bloque
  return (
    <MarcoBloque seccion={seccion} relleno="0">
      <div style={{ width: '100%', paddingTop: `${alto}%` }} />
    </MarcoBloque>
  )
}
