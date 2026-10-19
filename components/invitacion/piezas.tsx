'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { SeccionModular } from '@/types/invitation'
import { InlineEditableText } from '@/components/editor/inline-editable-text'
import { ProveedorSeccionActual, useEditorLienzo } from '@/components/editor/lienzo/contexto-editor'
import { CapaElementos } from '@/components/editor/lienzo/contenedor-seccion'
import { estadoInicialAnimacion, transicionAnimacion } from '@/lib/editor/estilos'
import { useInvitacion } from './contexto'
import { OrnamentoArriba, OrnamentoDetras, OrnamentoEsquinas } from './ornamentos'

/**
 * Marco de cada bloque: fondo (tarjeta, sin fondo o foto), ornamento en una posición segura,
 * selección en el editor y animación de entrada para el invitado.
 */
export function MarcoBloque({
  seccion,
  children,
  ornamentoPorDefecto = false,
  relleno = '22px 20px',
  centrado = true,
}: {
  seccion: SeccionModular
  children: React.ReactNode
  ornamentoPorDefecto?: boolean
  relleno?: string
  centrado?: boolean
}) {
  const { tema, visual, modo, seleccionId, alSeleccionarBloque, edicion } = useInvitacion()
  const lienzo = useEditorLienzo()
  const estilo = seccion.estilo || {}
  const fondo = estilo.fondoBloque || 'tarjeta'
  const ornamento = estilo.ornamento ?? { activo: ornamentoPorDefecto, posicion: 'esquinas' as const }
  const conOrnamento = ornamento.activo && tema.ornamento !== 'ninguno'
  const seleccionado = modo === 'editor' && seleccionId === seccion.id
  const inicial = modo === 'publico' ? estadoInicialAnimacion(estilo.animacion || 'aparecer') : null

  const estiloCaja: React.CSSProperties = {
    position: 'relative',
    padding: relleno,
    borderRadius: 'var(--inv-radio)',
    textAlign: centrado ? 'center' : 'left',
    ...(fondo === 'tarjeta' ? { backgroundColor: 'var(--inv-tarjeta)' } : {}),
    ...(fondo === 'foto' && estilo.imagenFondo
      ? {
          backgroundImage: `linear-gradient(color-mix(in srgb, var(--inv-tarjeta) ${Math.round((1 - (estilo.opacidadImagenFondo ?? 0.35)) * 100)}%, transparent), color-mix(in srgb, var(--inv-tarjeta) ${Math.round((1 - (estilo.opacidadImagenFondo ?? 0.35)) * 100)}%, transparent)), url("${estilo.imagenFondo}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
    ...(estilo.colorFondo ? { backgroundColor: estilo.colorFondo } : {}),
    outline: seleccionado ? '2.5px solid #F59E0B' : undefined,
    outlineOffset: seleccionado ? 3 : undefined,
    cursor: modo === 'editor' ? 'pointer' : undefined,
  }

  const contenido = (
    <ProveedorSeccionActual value={seccion}>
      {conOrnamento && ornamento.posicion === 'esquinas' && <OrnamentoEsquinas tipo={tema.ornamento} color={tema.detalle} />}
      {conOrnamento && ornamento.posicion === 'detras' && <OrnamentoDetras tipo={tema.ornamento} color={tema.acento} />}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 10, alignItems: centrado ? 'center' : 'stretch' }}>
        {conOrnamento && ornamento.posicion === 'arriba' && <OrnamentoArriba tipo={tema.ornamento} color={tema.detalle} />}
        {children}
      </div>
      {/* Textos, fotos y stickers que el anfitrión ubica libremente encima del bloque */}
      <CapaElementos seccion={seccion} colorAcento={visual.colorPrimario} fuenteCuerpo={visual.fuenteCuerpo} />
      {seleccionado && edicion?.agregarElemento && (
        <div style={{ position: 'absolute', right: 8, bottom: 8, zIndex: 30, display: 'flex', gap: 6 }}>
          {(
            [
              ['texto', '＋ Texto'],
              ['mas', '＋ Más'],
            ] as const
          ).map(([tipo, texto]) => (
            <button
              key={tipo}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                edicion.agregarElemento?.(seccion.id, tipo)
              }}
              style={{ minHeight: 32, padding: '0 12px', borderRadius: 999, border: 0, backgroundColor: '#F59E0B', color: '#0F172A', fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              {texto}
            </button>
          ))}
        </div>
      )}
    </ProveedorSeccionActual>
  )

  const comunes = {
    id: `bloque-${seccion.id}`,
    'data-seccion-id': seccion.id,
    // Contenedor: los elementos libres se dimensionan en cqw y se ven igual en cualquier pantalla
    className: 'seccion-lienzo',
    style: estiloCaja,
    onPointerDownCapture: modo === 'editor' ? () => alSeleccionarBloque?.(seccion.id) : undefined,
    // Tocar fuera de un elemento libre lo suelta (deja de mostrar sus controles)
    onClick:
      modo === 'editor'
        ? (e: React.MouseEvent) => {
            const objetivo = e.target as HTMLElement
            if (lienzo.seleccion?.tipo === 'elemento' && !objetivo.closest('[data-elemento-id], .tarjeton-moveable')) lienzo.seleccionar(null)
          }
        : undefined,
  }

  if (inicial) {
    return (
      <motion.section
        {...comunes}
        initial={inicial}
        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={transicionAnimacion(estilo.animacion || 'aparecer')}
      >
        {contenido}
      </motion.section>
    )
  }
  return <section {...comunes}>{contenido}</section>
}

/** Etiqueta pequeña en mayúsculas con el color de acento (título de cada bloque) */
export function Etiqueta({ seccion, campo = 'titulo', valor }: { seccion: SeccionModular; campo?: 'titulo' | 'subtitulo'; valor?: string }) {
  return (
    <Texto
      seccion={seccion}
      campo={campo}
      valor={valor ?? (seccion[campo] as string) ?? ''}
      placeholder="Título del bloque"
      estilo={{
        fontFamily: 'var(--inv-fuente-cuerpo)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--inv-acento)',
        margin: 0,
      }}
    />
  )
}

/**
 * Texto de la invitación. Para el invitado: se oculta si está vacío.
 * En el editor: se escribe encima (WYSIWYG) y guarda en el campo indicado.
 */
export function Texto({
  seccion,
  campo,
  dato,
  campoEvento,
  valor,
  placeholder = 'Escribe aquí',
  etiqueta = 'p',
  estilo,
  multilinea = false,
  claveEstilo,
}: {
  seccion: SeccionModular
  /** Campo directo de la sección */
  campo?: 'titulo' | 'subtitulo'
  /** Campo dentro de datos */
  dato?: string
  /** Campo del evento */
  campoEvento?: 'anfitriones' | 'direccion' | 'horaEvento' | 'titulo' | 'subtitulo'
  valor: string
  placeholder?: string
  etiqueta?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  estilo?: React.CSSProperties
  multilinea?: boolean
  claveEstilo?: string
}) {
  const { editable, edicion } = useInvitacion()
  if (!editable && !valor) return null

  const guardar = (nuevo: string) => {
    if (!edicion) return
    if (campo) edicion.alCampo(seccion.id, campo, nuevo)
    else if (dato) edicion.alDato(seccion.id, dato, nuevo)
    else if (campoEvento) edicion.alEvento(campoEvento, nuevo)
  }

  return (
    <InlineEditableText
      valor={valor}
      alGuardar={guardar}
      activo={editable}
      multilinea={multilinea}
      placeholder={placeholder}
      etiqueta={etiqueta}
      campo={claveEstilo || campo || dato || campoEvento}
      style={{ margin: 0, ...estilo }}
    />
  )
}

/**
 * Foto opcional de un bloque. En el editor muestra encima un botón para quitarla,
 * así nunca queda una foto (o su espacio vacío) fija en la invitación.
 */
export function FotoQuitable({
  children,
  alQuitar,
  etiqueta = 'Quitar foto',
  estilo,
}: {
  children: React.ReactNode
  alQuitar: () => void
  etiqueta?: string
  estilo?: React.CSSProperties
}) {
  const { editable } = useInvitacion()
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', maxWidth: estilo?.width ? undefined : '100%', ...estilo }}>
      {children}
      {editable && <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          alQuitar()
        }}
        style={{ position: 'absolute', top: 8, right: 8, minHeight: 32, padding: '0 12px', borderRadius: 999, border: 0, backgroundColor: 'rgba(15,23,42,0.82)', color: '#fff', font: 'inherit', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
        {etiqueta}
      </button>}
    </div>
  )
}

/**
 * Texto calculado (fecha larga, cuenta regresiva, fecha límite): en el editor se selecciona,
 * se arrastra y se le da estilo como a cualquier texto, pero su contenido se cambia en el panel.
 */
export function TextoFijo({
  seccion,
  clave,
  children,
  etiqueta = 'p',
  estilo,
}: {
  seccion: SeccionModular
  clave: string
  children: React.ReactNode
  etiqueta?: 'p' | 'span' | 'div'
  estilo?: React.CSSProperties
}) {
  const { editable } = useInvitacion()
  return (
    <ProveedorSeccionActual value={seccion}>
      <InlineEditableText valor="" alGuardar={() => {}} activo={editable} soloEstilo campo={clave} etiqueta={etiqueta} style={{ margin: 0, ...estilo }}>
        {children}
      </InlineEditableText>
    </ProveedorSeccionActual>
  )
}

type VarianteBoton = 'solido' | 'borde' | 'suave'

export function Boton({
  children,
  href,
  onClick,
  variante = 'solido',
  icono,
  bloque = true,
  externo = true,
  deshabilitado = false,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variante?: VarianteBoton
  icono?: React.ReactNode
  bloque?: boolean
  externo?: boolean
  deshabilitado?: boolean
}) {
  const { modo } = useInvitacion()
  const estilos: Record<VarianteBoton, React.CSSProperties> = {
    solido: { backgroundColor: 'var(--inv-acento)', color: 'var(--inv-texto-acento)', border: '0' },
    borde: { backgroundColor: 'transparent', color: 'var(--inv-acento)', border: '1.5px solid var(--inv-linea)' },
    suave: { backgroundColor: 'var(--inv-suave)', color: 'var(--inv-tinta)', border: '0' },
  }
  const estilo: React.CSSProperties = {
    ...estilos[variante],
    minHeight: 48,
    padding: '0 14px',
    whiteSpace: 'nowrap',
    borderRadius: 'var(--inv-radio-control)',
    fontFamily: 'var(--inv-fuente-cuerpo)',
    fontSize: 15,
    fontWeight: 700,
    display: bloque ? 'flex' : 'inline-flex',
    width: bloque ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    textDecoration: 'none',
    cursor: deshabilitado ? 'not-allowed' : 'pointer',
    opacity: deshabilitado ? 0.55 : 1,
    boxSizing: 'border-box',
  }
  // En el editor los enlaces no navegan (se está diseñando)
  if (href && modo !== 'editor' && !deshabilitado) {
    return (
      <a href={href} target={externo ? '_blank' : undefined} rel={externo ? 'noopener noreferrer' : undefined} style={estilo}>
        {icono}
        {children}
      </a>
    )
  }
  return (
    <button type="button" onClick={modo === 'editor' ? undefined : onClick} disabled={deshabilitado} style={estilo}>
      {icono}
      {children}
    </button>
  )
}

export function Caja({ children, estilo }: { children: React.ReactNode; estilo?: React.CSSProperties }) {
  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 14px',
        borderRadius: 'calc(var(--inv-radio) * 0.7)',
        backgroundColor: 'var(--inv-suave)',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...estilo,
      }}
    >
      {children}
    </div>
  )
}

/** Tiempo restante hasta una fecha, actualizado cada segundo */
export function useCuentaRegresiva(fechaIso: string) {
  const calcular = () => {
    const destino = new Date(fechaIso).getTime()
    const diferencia = Math.max(0, (Number.isNaN(destino) ? 0 : destino) - Date.now())
    return {
      dias: Math.floor(diferencia / 86400000),
      horas: Math.floor((diferencia / 3600000) % 24),
      minutos: Math.floor((diferencia / 60000) % 60),
      segundos: Math.floor((diferencia / 1000) % 60),
      terminado: diferencia === 0,
    }
  }
  const [tiempo, setTiempo] = useState<ReturnType<typeof calcular> | null>(null)
  useEffect(() => {
    setTiempo(calcular())
    const t = setInterval(() => setTiempo(calcular()), 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaIso])
  return tiempo ?? { dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: false, cargando: true as const }
}

export const icono = {
  calendario: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  mapa: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  copiar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  musica: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  enlace: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
}
