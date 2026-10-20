'use client'

import { createContext, useContext } from 'react'
import type { ElementoLienzo, EstiloTexto, SeccionModular } from '@/types/invitation'

export type Seleccion =
  | { tipo: 'seccion'; seccionId: string }
  | { tipo: 'texto'; seccionId: string; campo: string }
  | { tipo: 'elemento'; seccionId: string; elementoId: string }
  | null

export interface ContextoEditorLienzo {
  esEdicion: boolean
  seleccion: Seleccion
  seleccionar: (seleccion: Seleccion) => void
  /** Clave del texto en edición directa: id de elemento o `${seccionId}:${campo}` */
  textoEnEdicion: string | null
  setTextoEnEdicion: (clave: string | null) => void
  actualizarElemento: (seccionId: string, elementoId: string, cambios: Partial<ElementoLienzo>) => void
  actualizarEstiloTexto: (seccionId: string, campo: string, cambios: Partial<EstiloTexto> | null) => void
  /** Pasa un elemento libre a otro bloque (al soltarlo encima de ese bloque) */
  moverElementoASeccion: (desdeId: string, haciaId: string, elementoId: string, cambios: Partial<ElementoLienzo>) => void
}

const VALOR_LECTURA: ContextoEditorLienzo = {
  esEdicion: false,
  seleccion: null,
  seleccionar: () => {},
  textoEnEdicion: null,
  setTextoEnEdicion: () => {},
  actualizarElemento: () => {},
  actualizarEstiloTexto: () => {},
  moverElementoASeccion: () => {},
}

const ContextoEditor = createContext<ContextoEditorLienzo>(VALOR_LECTURA)

export const ProveedorEditorLienzo = ContextoEditor.Provider

export function useEditorLienzo(): ContextoEditorLienzo {
  return useContext(ContextoEditor)
}

/** Sección que se está renderizando: permite a cada texto encontrar su estilo individual */
const ContextoSeccionActual = createContext<SeccionModular | null>(null)

export const ProveedorSeccionActual = ContextoSeccionActual.Provider

export function useSeccionActual(): SeccionModular | null {
  return useContext(ContextoSeccionActual)
}
