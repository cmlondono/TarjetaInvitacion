import type {
  ElementoLienzo,
  EstiloSeccion,
  EstiloTexto,
  SeccionModular,
} from '@/types/invitation'
import { generarIdElemento } from './estilos'

/**
 * Operaciones puras sobre las secciones de la tarjeta.
 * Siempre devuelven un arreglo nuevo: así el historial (deshacer/rehacer) y el
 * autoguardado en la base de datos detectan cada cambio.
 */

function mapearSeccion(
  secciones: SeccionModular[],
  seccionId: string,
  fn: (s: SeccionModular) => SeccionModular
): SeccionModular[] {
  return secciones.map((s) => (s.id === seccionId ? fn(s) : s))
}

export function zMaximo(seccion?: SeccionModular): number {
  return (seccion?.elementos || []).reduce((max, el) => Math.max(max, el.z), 0)
}

export function actualizarElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elementoId: string,
  cambios: Partial<ElementoLienzo>
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    elementos: (s.elementos || []).map((el) => (el.id === elementoId ? { ...el, ...cambios } : el)),
  }))
}

export function actualizarEstiloTextoElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elementoId: string,
  cambios: Partial<EstiloTexto> | null
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    elementos: (s.elementos || []).map((el) =>
      el.id === elementoId
        ? { ...el, estiloTexto: cambios === null ? { tamano: el.estiloTexto?.tamano } : limpiar({ ...el.estiloTexto, ...cambios }) }
        : el
    ),
  }))
}

export function agregarElementos(
  secciones: SeccionModular[],
  seccionId: string,
  nuevos: ElementoLienzo[]
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    elementos: [...(s.elementos || []), ...nuevos],
  }))
}

/** Pasa un elemento libre a otro bloque (queda encima de los que ya tiene) con su nueva posición */
export function moverElementoASeccion(
  secciones: SeccionModular[],
  desdeId: string,
  haciaId: string,
  elementoId: string,
  cambios: Partial<ElementoLienzo>
): SeccionModular[] {
  const elemento = secciones.find((s) => s.id === desdeId)?.elementos?.find((el) => el.id === elementoId)
  const destino = secciones.find((s) => s.id === haciaId)
  if (!elemento || !destino || desdeId === haciaId) return secciones
  const movido = { ...elemento, ...cambios, z: zMaximo(destino) + 1 }
  return secciones.map((s) =>
    s.id === desdeId
      ? { ...s, elementos: (s.elementos || []).filter((el) => el.id !== elementoId) }
      : s.id === haciaId
      ? { ...s, elementos: [...(s.elementos || []), movido] }
      : s
  )
}

export function eliminarElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elementoId: string
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    elementos: (s.elementos || []).filter((el) => el.id !== elementoId),
  }))
}

export function duplicarElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elementoId: string
): { secciones: SeccionModular[]; nuevoId: string | null } {
  const seccion = secciones.find((s) => s.id === seccionId)
  const original = seccion?.elementos?.find((el) => el.id === elementoId)
  if (!seccion || !original) return { secciones, nuevoId: null }
  const copia: ElementoLienzo = {
    ...structuredClone(original),
    id: generarIdElemento(),
    x: Math.min(original.x + 4, 96),
    y: Math.min(original.y + 4, 96),
    z: zMaximo(seccion) + 1,
    bloqueado: false,
  }
  return { secciones: agregarElementos(secciones, seccionId, [copia]), nuevoId: copia.id }
}

/** Pega un elemento copiado (posiblemente de otra sección) con un id nuevo */
export function pegarElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elemento: ElementoLienzo
): { secciones: SeccionModular[]; nuevoId: string } {
  const seccion = secciones.find((s) => s.id === seccionId)
  const nuevo: ElementoLienzo = {
    ...structuredClone(elemento),
    id: generarIdElemento(),
    x: Math.min(elemento.x + 3, 96),
    y: Math.min(elemento.y + 3, 96),
    z: zMaximo(seccion) + 1,
  }
  return { secciones: agregarElementos(secciones, seccionId, [nuevo]), nuevoId: nuevo.id }
}

export type MovimientoCapa = 'adelante' | 'atras' | 'frente' | 'fondo'

/** Cambia el orden de apilamiento y normaliza los z a 1..n */
export function moverCapaElemento(
  secciones: SeccionModular[],
  seccionId: string,
  elementoId: string,
  movimiento: MovimientoCapa
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => {
    const orden = [...(s.elementos || [])].sort((a, b) => a.z - b.z)
    const i = orden.findIndex((el) => el.id === elementoId)
    if (i < 0) return s
    const [el] = orden.splice(i, 1)
    const destino =
      movimiento === 'frente'
        ? orden.length
        : movimiento === 'fondo'
        ? 0
        : movimiento === 'adelante'
        ? Math.min(i + 1, orden.length)
        : Math.max(i - 1, 0)
    orden.splice(destino, 0, el)
    const zPorId = new Map(orden.map((e, idx) => [e.id, idx + 1]))
    return { ...s, elementos: (s.elementos || []).map((e) => ({ ...e, z: zPorId.get(e.id) ?? e.z })) }
  })
}

/** Reordena las capas según la lista (primero = encima de todo) */
export function reordenarCapas(
  secciones: SeccionModular[],
  seccionId: string,
  idsDeArribaHaciaAbajo: string[]
): SeccionModular[] {
  const total = idsDeArribaHaciaAbajo.length
  const zPorId = new Map(idsDeArribaHaciaAbajo.map((id, i) => [id, total - i]))
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    elementos: (s.elementos || []).map((e) => ({ ...e, z: zPorId.get(e.id) ?? e.z })),
  }))
}

function limpiar<T extends object>(obj: T): T {
  const copia = { ...obj } as Record<string, unknown>
  Object.keys(copia).forEach((k) => copia[k] === undefined && delete copia[k])
  return copia as T
}

/** Estilo individual de un texto de bloque. `null` restablece el estilo del tema */
export function actualizarEstiloTextoSeccion(
  secciones: SeccionModular[],
  seccionId: string,
  campo: string,
  cambios: Partial<EstiloTexto> | null
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => {
    const estilos = { ...(s.estilosTexto || {}) }
    if (cambios === null) {
      delete estilos[campo]
    } else {
      estilos[campo] = limpiar({ ...estilos[campo], ...cambios })
    }
    return { ...s, estilosTexto: estilos }
  })
}

export function actualizarEstiloSeccion(
  secciones: SeccionModular[],
  seccionId: string,
  cambios: Partial<EstiloSeccion>
): SeccionModular[] {
  return mapearSeccion(secciones, seccionId, (s) => ({
    ...s,
    estilo: limpiar({ ...(s.estilo || {}), ...cambios }),
  }))
}

export function duplicarSeccion(secciones: SeccionModular[], seccionId: string): SeccionModular[] {
  const ordenadas = [...secciones].sort((a, b) => a.orden - b.orden)
  const i = ordenadas.findIndex((s) => s.id === seccionId)
  if (i < 0) return secciones
  const original = ordenadas[i]
  const copia: SeccionModular = {
    ...structuredClone(original),
    id: `sec-${original.tipo}-${Date.now()}`,
    elementos: (original.elementos || []).map((el) => ({ ...structuredClone(el), id: generarIdElemento() })),
  }
  ordenadas.splice(i + 1, 0, copia)
  return ordenadas.map((s, idx) => ({ ...s, orden: idx }))
}

export function reordenarSecciones(
  secciones: SeccionModular[],
  idOrigen: string,
  idDestino: string
): SeccionModular[] {
  const ordenadas = [...secciones].sort((a, b) => a.orden - b.orden)
  const desde = ordenadas.findIndex((s) => s.id === idOrigen)
  const hasta = ordenadas.findIndex((s) => s.id === idDestino)
  if (desde < 0 || hasta < 0 || desde === hasta) return secciones
  const [movida] = ordenadas.splice(desde, 1)
  ordenadas.splice(hasta, 0, movida)
  return ordenadas.map((s, idx) => ({ ...s, orden: idx }))
}

// ─────────── Fábrica de elementos nuevos ───────────

export type PlantillaElemento =
  | { tipo: 'texto'; texto: string; estilo?: EstiloTexto; ancho?: number }
  | { tipo: 'imagen'; url: string; proporcion?: number; ancho?: number }
  | { tipo: 'sticker'; stickerId: string; proporcion: number; ancho?: number }
  | { tipo: 'icono'; icono: ElementoLienzo['icono'] }
  | { tipo: 'forma'; forma: NonNullable<ElementoLienzo['forma']> }

/**
 * Crea un elemento centrado horizontalmente en la posición vertical indicada (% de la sección).
 */
export function crearElemento(plantilla: PlantillaElemento, z: number, yCentro = 40): ElementoLienzo {
  const base = { id: generarIdElemento(), rotacion: 0, opacidad: 1, z }

  switch (plantilla.tipo) {
    case 'texto': {
      const ancho = plantilla.ancho ?? 80
      return {
        ...base,
        tipo: 'texto',
        x: (100 - ancho) / 2,
        y: Math.max(0, yCentro - 4),
        ancho,
        texto: plantilla.texto,
        estiloTexto: { alineacion: 'centro', ...plantilla.estilo },
        animacion: 'deslizar_arriba',
      }
    }
    case 'imagen': {
      const ancho = plantilla.ancho ?? 60
      const alto = ancho * (plantilla.proporcion ?? 1)
      return {
        ...base,
        tipo: 'imagen',
        x: (100 - ancho) / 2,
        y: Math.max(0, yCentro - 15),
        ancho,
        alto,
        url: plantilla.url,
        mascara: 'redondeada',
        radio: 6,
        animacion: 'aparecer',
      }
    }
    case 'sticker': {
      const ancho = plantilla.ancho ?? (plantilla.proporcion < 0.35 ? 70 : 30)
      return {
        ...base,
        tipo: 'sticker',
        x: (100 - ancho) / 2,
        y: Math.max(0, yCentro - 8),
        ancho,
        alto: ancho * plantilla.proporcion,
        stickerId: plantilla.stickerId,
        animacion: 'zoom',
      }
    }
    case 'icono':
      return {
        ...base,
        tipo: 'icono',
        x: 42,
        y: Math.max(0, yCentro - 6),
        ancho: 16,
        alto: 16,
        icono: plantilla.icono,
        animacion: 'rebote',
      }
    case 'forma': {
      const esLinea = plantilla.forma === 'linea'
      const ancho = esLinea ? 60 : 30
      return {
        ...base,
        tipo: 'forma',
        x: (100 - ancho) / 2,
        y: Math.max(0, yCentro - (esLinea ? 1 : 8)),
        ancho,
        alto: esLinea ? 3 : 30,
        forma: plantilla.forma,
        grosorBorde: esLinea ? 2 : 0,
        opacidad: esLinea ? 1 : 0.85,
      }
    }
  }
}
