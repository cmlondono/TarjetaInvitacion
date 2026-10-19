import type { CSSProperties } from 'react'
import type {
  AnimacionEntrada,
  EstiloTexto,
  FiltroImagen,
  FuenteTipografica,
  MascaraImagen,
} from '@/types/invitation'

/** Ancho de referencia del lienzo: los tamaños de los elementos libres se expresan sobre 400px */
export const ANCHO_REFERENCIA_LIENZO = 400

export const CATALOGO_FUENTES: { id: FuenteTipografica; nombre: string; familia: string; categoria: string }[] = [
  { id: 'greatvibes', nombre: 'Great Vibes', familia: "'Great Vibes', cursive", categoria: 'Caligráfica' },
  { id: 'alexbrush', nombre: 'Alex Brush', familia: "'Alex Brush', cursive", categoria: 'Caligráfica' },
  { id: 'parisienne', nombre: 'Parisienne', familia: "'Parisienne', cursive", categoria: 'Caligráfica' },
  { id: 'pacifico', nombre: 'Pacifico', familia: "'Pacifico', cursive", categoria: 'Divertida' },
  { id: 'dancing', nombre: 'Dancing Script', familia: "'Dancing Script', cursive", categoria: 'Caligráfica' },
  { id: 'fraunces', nombre: 'Fraunces', familia: "'Fraunces', serif", categoria: 'Serif' },
  { id: 'playfair', nombre: 'Playfair Display', familia: "'Playfair Display', serif", categoria: 'Serif' },
  { id: 'cormorant', nombre: 'Cormorant', familia: "'Cormorant Garamond', serif", categoria: 'Serif' },
  { id: 'cinzel', nombre: 'Cinzel', familia: "'Cinzel', serif", categoria: 'Serif' },
  { id: 'prata', nombre: 'Prata', familia: "'Prata', serif", categoria: 'Serif' },
  { id: 'lora', nombre: 'Lora', familia: "'Lora', serif", categoria: 'Serif' },
  { id: 'montserrat', nombre: 'Montserrat', familia: "'Montserrat', sans-serif", categoria: 'Moderna' },
  { id: 'bricolage', nombre: 'Bricolage', familia: "'Bricolage Grotesque', sans-serif", categoria: 'Divertida' },
  { id: 'fredoka', nombre: 'Fredoka', familia: "'Fredoka', sans-serif", categoria: 'Divertida' },
  { id: 'dmsans', nombre: 'DM Sans', familia: "'DM Sans', sans-serif", categoria: 'Moderna' },
  { id: 'poppins', nombre: 'Poppins', familia: "'Poppins', sans-serif", categoria: 'Moderna' },
  { id: 'inter', nombre: 'Inter', familia: "var(--font-inter), 'Inter', sans-serif", categoria: 'Moderna' },
]

export function familiaFuente(fuente?: FuenteTipografica): string | undefined {
  return CATALOGO_FUENTES.find((f) => f.id === fuente)?.familia
}

/** Sombra de cada intensidad; `color` reemplaza el color por defecto (negro o blanco en el brillo) */
const SOMBRAS_TEXTO: Record<NonNullable<EstiloTexto['sombra']>, (color?: string) => string | undefined> = {
  ninguna: () => undefined,
  suave: (c) => `0 1px 3px ${c ? `color-mix(in srgb, ${c} 45%, transparent)` : 'rgba(0,0,0,0.25)'}`,
  marcada: (c) => `0 2px 6px ${c ? `color-mix(in srgb, ${c} 80%, transparent)` : 'rgba(0,0,0,0.55)'}`,
  solida: (c) => `0.06em 0.06em 0 ${c || 'rgba(0,0,0,0.35)'}`,
  brillo: (c) => `0 0 12px ${c || 'rgba(255,255,255,0.85)'}, 0 0 2px ${c || 'rgba(255,255,255,0.9)'}`,
}

/**
 * Convierte un EstiloTexto en CSS.
 * - `relativoAlLienzo`: el tamaño escala con el ancho de la sección (unidades cqw), para
 *   que el diseño libre se vea idéntico en cualquier celular.
 */
export function estiloTextoACss(
  estilo: EstiloTexto | undefined,
  relativoAlLienzo = false
): CSSProperties {
  if (!estilo) return {}
  const css: CSSProperties = {}

  if (estilo.tamano) {
    css.fontSize = relativoAlLienzo
      ? `${((estilo.tamano / ANCHO_REFERENCIA_LIENZO) * 100).toFixed(3)}cqw`
      : `${estilo.tamano}px`
  }
  if (estilo.color) css.color = estilo.color
  if (estilo.peso) css.fontWeight = estilo.peso
  if (estilo.cursiva !== undefined) css.fontStyle = estilo.cursiva ? 'italic' : 'normal'
  if (estilo.subrayado) css.textDecoration = 'underline'
  if (estilo.mayusculas !== undefined) css.textTransform = estilo.mayusculas ? 'uppercase' : 'none'
  if (estilo.alineacion) {
    css.textAlign = estilo.alineacion === 'izquierda' ? 'left' : estilo.alineacion === 'derecha' ? 'right' : 'center'
  }
  if (estilo.interletrado !== undefined) css.letterSpacing = `${estilo.interletrado}em`
  if (estilo.interlineado) css.lineHeight = estilo.interlineado
  // Textos de bloque movidos por el anfitrión: se desplazan en % del ancho del bloque (cqw), igual en cualquier pantalla
  if (estilo.x || estilo.y) css.translate = `${estilo.x ?? 0}cqw ${estilo.y ?? 0}cqw`
  if (estilo.rotacion) css.rotate = `${estilo.rotacion}deg`
  if (estilo.sombra) css.textShadow = SOMBRAS_TEXTO[estilo.sombra]?.(estilo.sombraColor)
  if (estilo.contornoColor && estilo.contornoGrosor) {
    // El trazo se pinta detrás del relleno: la letra no se adelgaza, el borde crece hacia afuera
    css.WebkitTextStroke = `${estilo.contornoGrosor * 2}px ${estilo.contornoColor}`
    css.paintOrder = 'stroke fill'
  }
  if (estilo.colorFondo || (estilo.marcoColor && estilo.marcoGrosor)) {
    if (estilo.colorFondo) css.backgroundColor = estilo.colorFondo
    if (estilo.marcoColor && estilo.marcoGrosor) css.border = `${estilo.marcoGrosor}px solid ${estilo.marcoColor}`
    css.padding = '0.1em 0.35em'
    css.borderRadius = '0.25em'
    css.boxDecorationBreak = 'clone'
    css.WebkitBoxDecorationBreak = 'clone'
  }
  return css
}

/** Atributos de datos para aplicar la fuente propia (las clases de fuente del tema usan !important) */
export function atributosFuente(estilo?: EstiloTexto): Record<string, string> {
  return estilo?.fuente ? { 'data-fuente': estilo.fuente } : {}
}

export const CATALOGO_MASCARAS: { id: MascaraImagen; nombre: string }[] = [
  { id: 'ninguna', nombre: 'Original' },
  { id: 'redondeada', nombre: 'Redondeada' },
  { id: 'circulo', nombre: 'Círculo' },
  { id: 'arco', nombre: 'Arco' },
  { id: 'corazon', nombre: 'Corazón' },
  { id: 'estrella', nombre: 'Estrella' },
  { id: 'hexagono', nombre: 'Hexágono' },
  { id: 'gota', nombre: 'Gota' },
]

const POLIGONO_CORAZON =
  'polygon(50% 23.9%, 50.2% 22.2%, 51.5% 17.5%, 54.7% 11.3%, 60.2% 5.2%, 67.7% 1%, 76.5% 0%, 85.4% 2.7%, 93% 8.7%, 98.2% 17.3%, 100% 27.3%, 98.2% 37.7%, 93% 47.7%, 85.4% 57.2%, 76.5% 66%, 67.7% 74.4%, 60.2% 82.3%, 54.7% 89.3%, 51.5% 95%, 50.2% 98.7%, 50% 100%, 49.8% 98.7%, 48.5% 95%, 45.3% 89.3%, 39.8% 82.3%, 32.3% 74.4%, 23.5% 66%, 14.6% 57.2%, 7% 47.7%, 1.8% 37.7%, 0% 27.3%, 1.8% 17.3%, 7% 8.7%, 14.6% 2.7%, 23.5% 0%, 32.3% 1%, 39.8% 5.2%, 45.3% 11.3%, 48.5% 17.5%, 49.8% 22.2%)'

export function estiloMascara(mascara: MascaraImagen | undefined, radio?: number): CSSProperties {
  switch (mascara) {
    case 'redondeada':
      return { borderRadius: `${radio ?? 12}%` }
    case 'circulo':
      return { borderRadius: '50%' }
    case 'arco':
      return { borderRadius: '50% 50% 0 0 / 35% 35% 0 0' }
    case 'gota':
      return { borderRadius: '50% 50% 50% 0' }
    case 'corazon':
      return { clipPath: POLIGONO_CORAZON }
    case 'estrella':
      return {
        clipPath:
          'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }
    case 'hexagono':
      return { clipPath: 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)' }
    default:
      return radio ? { borderRadius: `${radio}%` } : {}
  }
}

export const CATALOGO_FILTROS: { id: FiltroImagen; nombre: string; css: string }[] = [
  { id: 'ninguno', nombre: 'Original', css: 'none' },
  { id: 'bn', nombre: 'B y N', css: 'grayscale(1)' },
  { id: 'sepia', nombre: 'Sepia', css: 'sepia(0.75)' },
  { id: 'calido', nombre: 'Cálido', css: 'sepia(0.25) saturate(1.25) hue-rotate(-8deg)' },
  { id: 'frio', nombre: 'Frío', css: 'saturate(0.9) hue-rotate(12deg) brightness(1.03)' },
  { id: 'suave', nombre: 'Suave', css: 'contrast(0.88) brightness(1.08) saturate(0.85)' },
  { id: 'contraste', nombre: 'Intenso', css: 'contrast(1.25) saturate(1.2)' },
  { id: 'vintage', nombre: 'Vintage', css: 'sepia(0.4) contrast(0.9) brightness(1.05) saturate(0.8)' },
]

export function filtroCss(filtro?: FiltroImagen): string | undefined {
  if (!filtro || filtro === 'ninguno') return undefined
  return CATALOGO_FILTROS.find((f) => f.id === filtro)?.css
}

export const CATALOGO_ANIMACIONES: { id: AnimacionEntrada; nombre: string }[] = [
  { id: 'ninguna', nombre: 'Ninguna' },
  { id: 'aparecer', nombre: 'Aparecer' },
  { id: 'deslizar_arriba', nombre: 'Subir' },
  { id: 'deslizar_izquierda', nombre: 'Desde izquierda' },
  { id: 'deslizar_derecha', nombre: 'Desde derecha' },
  { id: 'zoom', nombre: 'Zoom' },
  { id: 'rebote', nombre: 'Rebote' },
  { id: 'girar', nombre: 'Girar' },
]

/** Estado inicial (oculto) de cada animación de entrada; el final siempre es opacidad 1 sin desplazamiento */
export function estadoInicialAnimacion(animacion?: AnimacionEntrada): Record<string, number> | null {
  switch (animacion) {
    case 'aparecer':
      return { opacity: 0 }
    case 'deslizar_arriba':
      return { opacity: 0, y: 28 }
    case 'deslizar_izquierda':
      return { opacity: 0, x: -36 }
    case 'deslizar_derecha':
      return { opacity: 0, x: 36 }
    case 'zoom':
      return { opacity: 0, scale: 0.7 }
    case 'rebote':
      return { opacity: 0, scale: 0.4 }
    case 'girar':
      return { opacity: 0, rotate: -25, scale: 0.8 }
    default:
      return null
  }
}

export function transicionAnimacion(animacion?: AnimacionEntrada, retraso = 0) {
  if (animacion === 'rebote') {
    return { type: 'spring' as const, stiffness: 260, damping: 14, delay: retraso }
  }
  return { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: retraso }
}

export function generarIdElemento(): string {
  return `el-${
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  }`
}

/**
 * Texto escrito por el usuario en un elemento contentEditable.
 * No usa `innerText` porque aplica `text-transform` (guardaría MAYÚSCULAS de diseño como texto real).
 */
export function leerTextoEditable(el: HTMLElement): string {
  let texto = ''
  const recorrer = (nodo: Node) => {
    nodo.childNodes.forEach((hijo) => {
      if (hijo.nodeType === Node.TEXT_NODE) {
        texto += hijo.nodeValue || ''
      } else if (hijo.nodeName === 'BR') {
        texto += '\n'
      } else {
        const esBloque = ['DIV', 'P'].includes(hijo.nodeName)
        if (esBloque && texto && !texto.endsWith('\n')) texto += '\n'
        recorrer(hijo)
      }
    })
  }
  recorrer(el)
  return texto.replace(/\u00a0/g, ' ').replace(/\n$/, '')
}
