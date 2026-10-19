'use client'

import React, { useState } from 'react'
import type { SeccionModular } from '@/types/invitation'
import { useInvitacion, fechaLarga, enlaceGoogleCalendar, enlacesMapa } from './contexto'
import { Boton, Caja, Etiqueta, FotoQuitable, MarcoBloque, Texto, TextoFijo, icono, useCuentaRegresiva } from './piezas'
import { OrnamentoArriba } from './ornamentos'

export interface PropsBloque {
  seccion: SeccionModular
}

const estiloTitulo = (caligrafico: boolean, tamano?: number): React.CSSProperties => ({
  fontFamily: 'var(--inv-fuente-titulo)',
  fontSize: tamano ?? (caligrafico ? 52 : 40),
  fontWeight: caligrafico ? 400 : 700,
  lineHeight: 1.05,
  color: 'var(--inv-tinta)',
  letterSpacing: caligrafico ? 0 : '-0.02em',
})

const textoSuave: React.CSSProperties = { fontSize: 14, color: 'var(--inv-tinta-suave)', lineHeight: 1.5 }

// ─────────── Portada ───────────
export function BloquePortada({ seccion }: PropsBloque) {
  const { evento, tema, editable, edicion } = useInvitacion()
  const datos = seccion.datos || {}
  const variante = seccion.estilo?.variante || (datos.imagenPortada ? 'arco' : 'sin_foto')
  const foto = datos.imagenPortada
  const nombres = seccion.titulo || evento.anfitriones
  const completa = variante === 'completa'

  // Quitar la foto deja la portada sin foto (y sin espacio reservado)
  const quitarFoto = () => {
    edicion?.alDato(seccion.id, 'imagenPortada', undefined)
    edicion?.alCampo(seccion.id, 'estilo', { ...(seccion.estilo || {}), variante: 'sin_foto' })
  }

  const imagen = foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={foto}
      alt=""
      style={
        variante === 'circulo'
          ? { width: 180, height: 180, objectFit: 'cover', borderRadius: '50%' }
          : completa
          ? { width: '100%', height: 280, objectFit: 'cover', borderRadius: 'var(--inv-radio) var(--inv-radio) 0 0' }
          : { width: 220, height: 260, objectFit: 'cover', borderRadius: '110px 110px 16px 16px' }
      }
    />
  ) : editable && variante !== 'sin_foto' ? (
    <div
      style={{
        width: 200,
        height: 220,
        borderRadius: '100px 100px 16px 16px',
        border: '2px dashed var(--inv-linea)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--inv-tinta-suave)',
      }}
    >
      Agrega una foto en el panel
    </div>
  ) : null

  return (
    <MarcoBloque seccion={seccion} ornamentoPorDefecto relleno="26px 20px 30px">
      {variante !== 'sin_foto' && imagen && (
        <FotoQuitable
          alQuitar={quitarFoto}
          etiqueta={foto ? 'Quitar foto' : 'Sin foto'}
          estilo={completa ? { width: 'calc(100% + 40px)', margin: '-22px -20px 6px' } : undefined}
        >
          {imagen}
        </FotoQuitable>
      )}
      <Texto
        seccion={seccion}
        campo="subtitulo"
        valor={seccion.subtitulo || ''}
        placeholder="Frase de apertura"
        estilo={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--inv-acento)', marginTop: 6 }}
      />
      <Texto seccion={seccion} campo="titulo" valor={nombres} placeholder="Nombres" etiqueta="h1" estilo={estiloTitulo(tema.tituloCaligrafico)} />
      {fechaLarga(evento.fechaEvento) && (
        <TextoFijo seccion={seccion} clave="fecha" estilo={{ fontSize: 17 }}>
          {fechaLarga(evento.fechaEvento)}
        </TextoFijo>
      )}
      <Texto seccion={seccion} campoEvento="direccion" valor={evento.direccion || ''} placeholder="Lugar" estilo={textoSuave} />
    </MarcoBloque>
  )
}

// ─────────── Cuenta regresiva ───────────
export function BloqueCuentaRegresiva({ seccion }: PropsBloque) {
  const { evento } = useInvitacion()
  const t = useCuentaRegresiva(evento.fechaEvento)
  const variante = seccion.estilo?.variante || 'cajas'
  const cargando = 'cargando' in t
  const partes = [
    { valor: t.dias, etiqueta: t.dias === 1 ? 'día' : 'días' },
    { valor: t.horas, etiqueta: 'horas' },
    { valor: t.minutos, etiqueta: 'min' },
    { valor: t.segundos, etiqueta: 'seg' },
  ]
  return (
    <MarcoBloque seccion={seccion} relleno="18px">
      <Etiqueta seccion={seccion} />
      {/* Tamaños en em: el control «Tamaño» del texto agranda o achica todo el contador */}
      <TextoFijo seccion={seccion} clave="contador" etiqueta="div" estilo={{ width: '100%', boxSizing: 'border-box', fontSize: 16 }}>
        {t.terminado ? (
          <p style={{ margin: 0, fontSize: '1.125em', fontWeight: 600 }}>¡Hoy es el gran día!</p>
        ) : variante === 'linea' ? (
          <p style={{ margin: 0, fontSize: '1.25em', fontWeight: 600 }}>
            {t.dias} días · {t.horas} h · {t.minutos} min
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, width: '100%' }}>
            {partes.map((p) => (
              <div key={p.etiqueta} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', borderRadius: 'calc(var(--inv-radio) * 0.6)', backgroundColor: 'var(--inv-suave)' }}>
                <span style={{ fontSize: '1.625em', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{cargando ? '--' : String(p.valor).padStart(2, '0')}</span>
                <span style={{ fontSize: '0.7em', fontWeight: 600, color: 'var(--inv-tinta-suave)' }}>{p.etiqueta}</span>
              </div>
            ))}
          </div>
        )}
      </TextoFijo>
    </MarcoBloque>
  )
}

// ─────────── Fecha y hora ───────────
export function BloqueFechaHora({ seccion }: PropsBloque) {
  const { evento, experiencia } = useInvitacion()
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <TextoFijo seccion={seccion} clave="fecha" estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 24, fontWeight: 600 }}>
        {fechaLarga(evento.fechaEvento)}
      </TextoFijo>
      <Texto seccion={seccion} campoEvento="horaEvento" valor={evento.horaEvento || ''} placeholder="Hora" estilo={{ fontSize: 16 }} />
      {experiencia.botonCalendario && (
        <Boton href={enlaceGoogleCalendar(evento)} variante="suave" icono={icono.calendario}>
          Agregar a mi calendario
        </Boton>
      )}
    </MarcoBloque>
  )
}

function BotonesMapa({ lugar, direccion, enlaceMapa, enlaceWaze }: { lugar?: string; direccion?: string; enlaceMapa?: string; enlaceWaze?: string }) {
  const enlaces = enlacesMapa(lugar, direccion, enlaceMapa, enlaceWaze)
  if (!enlaces.maps) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, width: '100%' }}>
      <Boton href={enlaces.maps} variante="borde" icono={icono.mapa}>
        Google Maps
      </Boton>
      <Boton href={enlaces.waze} variante="borde">
        Waze
      </Boton>
    </div>
  )
}

// ─────────── Itinerario (Ceremonia y fiesta, Agenda...) ───────────
export function BloqueItinerario({ seccion }: PropsBloque) {
  const { evento, experiencia, editable } = useInvitacion()
  const datos = seccion.datos || {}
  const hitos = datos.itinerario || []
  const variante = seccion.estilo?.variante || 'linea'

  // Cada momento se edita con una ruta "itinerario.<i>.<campo>" que el editor resuelve
  const textoHito = (indice: number, campo: 'hora' | 'titulo' | 'descripcion', valor: string, estilo: React.CSSProperties, placeholder: string) =>
    editable ? (
      <Texto seccion={seccion} dato={`itinerario.${indice}.${campo}`} claveEstilo={`itinerario.${campo}`} valor={valor} placeholder={placeholder} estilo={estilo} />
    ) : valor ? (
      <span style={estilo}>{valor}</span>
    ) : null

  return (
    <MarcoBloque seccion={seccion} centrado={false}>
      <div style={{ textAlign: 'center' }}>
        <Etiqueta seccion={seccion} />
      </div>
      {variante === 'columnas' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {hitos.map((h, i) => (
            <Caja key={h.id} estilo={{ alignItems: 'center', textAlign: 'center' }}>
              {textoHito(i, 'hora', h.hora, { fontSize: 20, fontWeight: 600 }, 'Hora')}
              {textoHito(i, 'titulo', h.titulo, { fontSize: 14, fontWeight: 600 }, 'Momento')}
              {textoHito(i, 'descripcion', h.descripcion || '', { fontSize: 12, color: 'var(--inv-tinta-suave)' }, 'Detalle')}
            </Caja>
          ))}
        </div>
      ) : variante === 'tarjetas' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hitos.map((h, i) => (
            <Caja key={h.id}>
              {textoHito(i, 'hora', h.hora, { fontSize: 13, fontWeight: 700, color: 'var(--inv-acento)' }, 'Hora')}
              {textoHito(i, 'titulo', h.titulo, { fontSize: 17, fontWeight: 600 }, 'Momento')}
              {textoHito(i, 'descripcion', h.descripcion || '', { fontSize: 13, color: 'var(--inv-tinta-suave)' }, 'Detalle')}
            </Caja>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 4 }}>
          {hitos.map((h, i) => (
            <div key={h.id} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: 'var(--inv-acento)', flexShrink: 0 }} />
                {i < hitos.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: 'var(--inv-linea)' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: i < hitos.length - 1 ? 18 : 0 }}>
                <span style={{ fontSize: 17, fontWeight: 600, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {textoHito(i, 'hora', h.hora, {}, 'Hora')}
                  <span aria-hidden="true">·</span>
                  {textoHito(i, 'titulo', h.titulo, {}, 'Momento')}
                </span>
                {textoHito(i, 'descripcion', h.descripcion || '', { fontSize: 13, color: 'var(--inv-tinta-suave)' }, 'Detalle (opcional)')}
              </div>
            </div>
          ))}
        </div>
      )}
      {(datos.nombreLugar || datos.direccion || editable) && (
        <Caja>
          <Texto seccion={seccion} dato="nombreLugar" valor={datos.nombreLugar || ''} placeholder="Nombre del lugar" estilo={{ fontSize: 16, fontWeight: 600 }} />
          <Texto seccion={seccion} dato="direccion" valor={datos.direccion || ''} placeholder="Dirección (abre Maps y Waze)" estilo={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }} />
        </Caja>
      )}
      <BotonesMapa lugar={datos.nombreLugar} direccion={datos.direccion} enlaceMapa={datos.enlaceMapa} enlaceWaze={datos.enlaceWaze} />
      {experiencia.botonCalendario && (
        <Boton href={enlaceGoogleCalendar(evento)} variante="suave" icono={icono.calendario}>
          Agregar a mi calendario
        </Boton>
      )}
    </MarcoBloque>
  )
}

// ─────────── Ubicación ───────────
export function BloqueUbicacion({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  if (!editable && !datos.nombreLugar && !datos.direccion) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="nombreLugar" valor={datos.nombreLugar || ''} placeholder="Nombre del lugar" estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 22, fontWeight: 600 }} />
      <Texto seccion={seccion} dato="direccion" valor={datos.direccion || ''} placeholder="Dirección" estilo={textoSuave} />
      <Texto seccion={seccion} dato="detallesAcceso" valor={datos.detallesAcceso || ''} placeholder="Indicaciones (opcional): piso, parqueadero…" multilinea estilo={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }} />
      <BotonesMapa lugar={datos.nombreLugar} direccion={datos.direccion} enlaceMapa={datos.enlaceMapa} enlaceWaze={datos.enlaceWaze} />
    </MarcoBloque>
  )
}

// ─────────── Código de vestimenta ───────────
export function BloqueVestimenta({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  const colores = datos.coloresSugeridos || []
  if (!editable && !datos.etiqueta && !colores.length && !datos.notasVestimenta) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="etiqueta" valor={datos.etiqueta || ''} placeholder="Ej: Formal de jardín" estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 22, fontWeight: 600 }} />
      {colores.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {colores.map((c) => (
            <span key={c} title={c} style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: c, border: '2px solid var(--inv-tarjeta)', boxShadow: '0 0 0 1px var(--inv-linea)' }} />
          ))}
        </div>
      )}
      <Texto seccion={seccion} dato="notasVestimenta" valor={datos.notasVestimenta || ''} placeholder="Nota (opcional): evita el blanco…" multilinea estilo={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }} />
    </MarcoBloque>
  )
}

// ─────────── Lluvia de sobres / datos bancarios ───────────
export function BloqueRegalosBancarios({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  const [copiado, setCopiado] = useState(false)
  const hayCuenta = Boolean(datos.numeroCuenta)
  if (!editable && !hayCuenta && !datos.enlaceListaRegalos) return null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(datos.numeroCuenta || '')
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} campo="subtitulo" valor={seccion.subtitulo || ''} placeholder="Mensaje sobre los regalos" multilinea estilo={{ fontSize: 14, lineHeight: 1.5 }} />
      {(hayCuenta || editable) && (
        <Caja estilo={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Texto seccion={seccion} dato="banco" valor={datos.banco || ''} placeholder="Banco" etiqueta="span" />
              {(datos.tipoCuenta || editable) && <span aria-hidden="true">·</span>}
              <Texto seccion={seccion} dato="tipoCuenta" valor={datos.tipoCuenta || ''} placeholder="Tipo de cuenta" etiqueta="span" />
            </span>
            <Texto seccion={seccion} dato="numeroCuenta" valor={datos.numeroCuenta || ''} placeholder="Número de cuenta" etiqueta="span" estilo={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.03em' }} />
            <Texto seccion={seccion} dato="titular" valor={datos.titular || ''} placeholder="Titular" etiqueta="span" estilo={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }} />
          </div>
          {hayCuenta && (
            <Boton onClick={copiar} bloque={false} icono={copiado ? icono.check : icono.copiar}>
              {copiado ? 'Copiado' : 'Copiar'}
            </Boton>
          )}
        </Caja>
      )}
      {datos.enlaceListaRegalos && (
        <Boton href={datos.enlaceListaRegalos} variante="borde" icono={icono.enlace}>
          Ver mesa de regalos
        </Boton>
      )}
    </MarcoBloque>
  )
}

// ─────────── Historia ───────────
export function BloqueHistoria({ seccion }: PropsBloque) {
  const { editable, edicion } = useInvitacion()
  const datos = seccion.datos || {}
  if (!editable && !datos.cuerpoTexto && !datos.urlImagen) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      {datos.urlImagen && (
        <FotoQuitable alQuitar={() => edicion?.alDato(seccion.id, 'urlImagen', undefined)} estilo={{ width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={datos.urlImagen} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 'calc(var(--inv-radio) * 0.7)' }} />
        </FotoQuitable>
      )}
      <Texto
        seccion={seccion}
        dato="cuerpoTexto"
        valor={datos.cuerpoTexto || ''}
        placeholder="Cuenta su historia: cómo se conocieron, un recuerdo especial…"
        multilinea
        estilo={{ fontSize: 15, lineHeight: 1.6, fontStyle: 'italic' }}
      />
    </MarcoBloque>
  )
}

// ─────────── Mensaje / frase ───────────
export function BloqueMensaje({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  if (!editable && !datos.mensaje && !datos.cuerpoTexto) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="mensaje" valor={datos.mensaje || datos.cuerpoTexto || ''} placeholder="Escribe una frase o dedicatoria" multilinea estilo={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 19, lineHeight: 1.5, fontStyle: 'italic' }} />
      <Texto seccion={seccion} dato="autorMensaje" valor={datos.autorMensaje || ''} placeholder="Autor (opcional)" estilo={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--inv-acento)' }} />
    </MarcoBloque>
  )
}

// ─────────── Texto libre ───────────
export function BloqueTexto({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  if (!editable && !datos.cuerpoTexto) return null
  const alineacion = datos.alineacionTexto === 'izquierda' ? 'left' : datos.alineacionTexto === 'derecha' ? 'right' : 'center'
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="cuerpoTexto" valor={datos.cuerpoTexto || ''} placeholder="Escribe tu texto" multilinea estilo={{ fontSize: 15, lineHeight: 1.6, textAlign: alineacion, width: '100%' }} />
    </MarcoBloque>
  )
}

// ─────────── Imagen ───────────
export function BloqueImagen({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  const formato = datos.formatoImagen || 'tarjeta'
  if (!datos.urlImagen && !editable) return null
  return (
    <MarcoBloque seccion={seccion} relleno={formato === 'banner' ? '0' : '16px'}>
      {datos.urlImagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={datos.urlImagen}
          alt={datos.pieImagen || ''}
          style={{
            width: formato === 'circular' ? 220 : '100%',
            height: formato === 'circular' ? 220 : undefined,
            maxHeight: 420,
            objectFit: 'cover',
            borderRadius: formato === 'circular' ? '50%' : formato === 'banner' ? 'var(--inv-radio)' : 'calc(var(--inv-radio) * 0.7)',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: 180, borderRadius: 'calc(var(--inv-radio) * 0.7)', border: '2px dashed var(--inv-linea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--inv-tinta-suave)' }}>
          Agrega una foto en el panel
        </div>
      )}
      <Texto seccion={seccion} dato="pieImagen" valor={datos.pieImagen || ''} placeholder="Pie de foto (opcional)" estilo={{ fontSize: 13, color: 'var(--inv-tinta-suave)', padding: formato === 'banner' ? '0 16px 14px' : 0 }} />
    </MarcoBloque>
  )
}

// ─────────── Botón / enlace ───────────
export function BloqueBoton({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const datos = seccion.datos || {}
  if (!editable && !datos.urlBoton) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      <Texto seccion={seccion} dato="subtextoBoton" valor={datos.subtextoBoton || ''} placeholder="Texto de apoyo (opcional)" estilo={textoSuave} />
      <Boton href={datos.urlBoton || undefined} variante={datos.estiloBoton === 'borde' ? 'borde' : 'solido'} icono={icono.enlace}>
        {datos.textoBoton || 'Abrir enlace'}
      </Boton>
    </MarcoBloque>
  )
}

// ─────────── Separador ───────────
export function BloqueSeparador({ seccion }: PropsBloque) {
  const { tema } = useInvitacion()
  return (
    <section data-seccion-id={seccion.id} id={`bloque-${seccion.id}`} style={{ padding: '4px 0' }}>
      {tema.ornamento !== 'ninguno' ? (
        <OrnamentoArriba tipo={tema.ornamento} color={tema.detalle} />
      ) : (
        <div style={{ height: 1, margin: '8px 20%', backgroundColor: 'var(--inv-linea)' }} />
      )}
    </section>
  )
}

// ─────────── Galería ───────────
export function BloqueGaleria({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const fotos = seccion.datos?.fotos || []
  if (!fotos.length && !editable) return null
  return (
    <MarcoBloque seccion={seccion} relleno="18px 16px">
      <Etiqueta seccion={seccion} />
      {fotos.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, width: '100%' }}>
          {fotos.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={f + i} src={f} alt="" style={{ width: '100%', aspectRatio: i % 3 === 0 ? '1 / 1.2' : '1 / 1', objectFit: 'cover', borderRadius: 'calc(var(--inv-radio) * 0.6)' }} />
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: 120, borderRadius: 'calc(var(--inv-radio) * 0.6)', border: '2px dashed var(--inv-linea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--inv-tinta-suave)' }}>
          Agrega fotos en el panel
        </div>
      )}
    </MarcoBloque>
  )
}

// ─────────── Hospedaje ───────────
export function BloqueHospedaje({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const hoteles = seccion.datos?.hoteles || []
  if (!hoteles.length && !editable) return null
  return (
    <MarcoBloque seccion={seccion} centrado={false}>
      <div style={{ textAlign: 'center' }}>
        <Etiqueta seccion={seccion} />
      </div>
      {hoteles.length === 0 && <p style={{ ...textoSuave, margin: 0, textAlign: 'center' }}>Agrega hoteles recomendados en el panel</p>}
      {hoteles.map((h) => (
        <Caja key={h.id}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{h.nombre}</span>
          {h.direccion && <span style={{ fontSize: 13, color: 'var(--inv-tinta-suave)' }}>{h.direccion}</span>}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {h.telefono && (
              <Boton href={`tel:${h.telefono}`} variante="borde" bloque={false} externo={false}>
                Llamar
              </Boton>
            )}
            {h.enlace && (
              <Boton href={h.enlace} variante="borde" bloque={false}>
                Reservar
              </Boton>
            )}
          </div>
        </Caja>
      ))}
    </MarcoBloque>
  )
}

// ─────────── Padrinos / personas ───────────
export function BloquePadrinos({ seccion }: PropsBloque) {
  const { editable } = useInvitacion()
  const personas = seccion.datos?.personas || []
  if (!personas.length && !editable) return null
  return (
    <MarcoBloque seccion={seccion}>
      <Etiqueta seccion={seccion} />
      {personas.length === 0 ? (
        <p style={{ ...textoSuave, margin: 0 }}>Agrega nombres en el panel</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, width: '100%' }}>
          {personas.map((p) => (
            <Caja key={p.id} estilo={{ alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--inv-fuente-titulo)', fontSize: 17, fontWeight: 600 }}>{p.nombre}</span>
              {p.rol && <span style={{ fontSize: 12, color: 'var(--inv-tinta-suave)' }}>{p.rol}</span>}
            </Caja>
          ))}
        </div>
      )}
    </MarcoBloque>
  )
}
