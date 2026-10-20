'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ConfiguracionVisual,
  ElementoLienzo,
  EstiloSeccion,
  EstiloTexto,
  SeccionModular,
  TipoSeccion,
} from '@/types/invitation'
import type { ContextoEditorLienzo, Seleccion } from './contexto-editor'
import type { AccionesLienzo } from './barra-contextual'
import * as ops from '@/lib/editor/operaciones'
import { crearElementosDesdeCombinacion } from '@/lib/editor/combinaciones-texto'
import { generarIdElemento } from '@/lib/editor/estilos'
import { crearSeccionPorTipo, CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { subirImagen } from '@/lib/image-compression'
import { seleccionarArchivoImagen } from './controles'
import type { PanelAgregarProps } from './panel-agregar'
import type { PanelCapasProps } from './panel-capas'

type SetSecciones = (act: SeccionModular[] | ((prev: SeccionModular[]) => SeccionModular[])) => void

interface OpcionesEstudio {
  esEdicion: boolean
  esMovil: boolean
  secciones: SeccionModular[]
  setSecciones: SetSecciones
  visual: ConfiguracionVisual
  eventoId: string
  cortarGrupo: () => void
  deshacer: () => void
  rehacer: () => void
}

function proporcionDeImagen(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img.naturalHeight && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1)
    img.onerror = () => resolve(1)
    img.src = url
  })
}

function esCampoDeEscritura(objetivo: EventTarget | null): boolean {
  const el = objetivo as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

/**
 * Cerebro del editor tipo Canva: selección, acciones sobre secciones/elementos,
 * atajos de teclado, subida de fotos y paneles.
 * Todo cambio pasa por `setSecciones`, por eso entra al historial y al autoguardado en la base de datos.
 */
export function useEstudioLienzo({
  esEdicion,
  esMovil,
  secciones,
  setSecciones,
  visual,
  eventoId,
  cortarGrupo,
  deshacer,
  rehacer,
}: OpcionesEstudio) {
  const [seleccion, setSeleccion] = useState<Seleccion>(null)
  const [textoEnEdicion, setTextoEnEdicion] = useState<string | null>(null)
  const [panelAgregarAbierto, setPanelAgregarAbierto] = useState(false)
  const [panelCapasAbierto, setPanelCapasAbierto] = useState(false)
  const [recorte, setRecorte] = useState<{ sId: string; eId: string; url: string } | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [errorImagen, setErrorImagen] = useState<string | null>(null)
  const portapapeles = useRef<ElementoLienzo | null>(null)
  const seccionesRef = useRef(secciones)
  seccionesRef.current = secciones
  const carpetaImagenes = eventoId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'general'

  // Una acción discreta (agregar, borrar, soltar un arrastre) es su propio paso de deshacer
  const aplicar = useCallback(
    (fn: (prev: SeccionModular[]) => SeccionModular[], agrupable = false) => {
      if (!agrupable) cortarGrupo()
      setSecciones(fn)
      if (!agrupable) cortarGrupo()
    },
    [setSecciones, cortarGrupo]
  )

  // Si lo seleccionado desaparece (deshacer, eliminar), limpiar la selección
  useEffect(() => {
    if (!seleccion) return
    const seccion = secciones.find((s) => s.id === seleccion.seccionId)
    if (!seccion || (seleccion.tipo === 'elemento' && !seccion.elementos?.some((e) => e.id === seleccion.elementoId))) {
      setSeleccion(null)
      setTextoEnEdicion(null)
    }
  }, [secciones, seleccion])

  useEffect(() => {
    if (!esEdicion) {
      setSeleccion(null)
      setTextoEnEdicion(null)
    }
  }, [esEdicion])

  const seleccionar = useCallback((s: Seleccion) => {
    setSeleccion(s)
    setTextoEnEdicion((actual) => {
      if (!actual) return null
      if (s?.tipo === 'elemento' && s.elementoId === actual) return actual
      if (s?.tipo === 'texto' && `${s.seccionId}:${s.campo}` === actual) return actual
      return null
    })
  }, [])

  /** Sección donde se insertan los elementos nuevos y altura (%) visible en pantalla */
  const destino = useCallback((): { seccionId: string; yCentro: number } | null => {
    const visibles = [...seccionesRef.current].filter((s) => s.visible).sort((a, b) => a.orden - b.orden)
    if (visibles.length === 0) return null

    const calcularY = (id: string) => {
      const el = document.querySelector<HTMLElement>(`[data-seccion-id="${id}"]`)
      if (!el) return 40
      const r = el.getBoundingClientRect()
      const centroPantalla = window.innerHeight * (esMovil ? 0.38 : 0.5)
      const y = ((centroPantalla - r.top) / Math.max(r.height, 1)) * 100
      return Math.min(Math.max(y, 8), 80)
    }

    if (seleccion) return { seccionId: seleccion.seccionId, yCentro: calcularY(seleccion.seccionId) }

    // Sin selección: la sección que está en el centro de la pantalla
    const centro = window.innerHeight * 0.45
    let mejor = visibles[0].id
    let menorDistancia = Infinity
    for (const s of visibles) {
      const el = document.querySelector<HTMLElement>(`[data-seccion-id="${s.id}"]`)
      if (!el) continue
      const r = el.getBoundingClientRect()
      const distancia = r.top <= centro && r.bottom >= centro ? 0 : Math.min(Math.abs(r.top - centro), Math.abs(r.bottom - centro))
      if (distancia < menorDistancia) {
        menorDistancia = distancia
        mejor = s.id
      }
    }
    return { seccionId: mejor, yCentro: calcularY(mejor) }
  }, [seleccion, esMovil])

  const nombreDestino = useMemo(() => {
    const id = seleccion?.seccionId
    const s = id ? secciones.find((x) => x.id === id) : undefined
    if (!s) return 'la sección visible en pantalla'
    return `«${s.titulo || CATALOGO_SECCIONES.find((m) => m.tipo === s.tipo)?.nombre || 'Sección'}»`
  }, [seleccion, secciones])

  const insertar = useCallback(
    (crear: (z: number, yCentro: number) => ElementoLienzo[]) => {
      const d = destino()
      if (!d) return
      const seccion = seccionesRef.current.find((s) => s.id === d.seccionId)
      const nuevos = crear(ops.zMaximo(seccion) + 1, d.yCentro)
      aplicar((prev) => ops.agregarElementos(prev, d.seccionId, nuevos))
      setPanelAgregarAbierto(false)
      const ultimo = nuevos[nuevos.length - 1]
      setSeleccion({ tipo: 'elemento', seccionId: d.seccionId, elementoId: ultimo.id })
    },
    [destino, aplicar]
  )

  const conSubida = useCallback(
    async (tarea: () => Promise<void>) => {
      setSubiendoImagen(true)
      setErrorImagen(null)
      try {
        await tarea()
      } catch (err: any) {
        setErrorImagen(err?.message || 'No se pudo cargar la imagen')
      } finally {
        setSubiendoImagen(false)
      }
    },
    []
  )

  const acciones: AccionesLienzo = useMemo(
    () => ({
      seleccionar,
      editarTexto: (clave) => setTextoEnEdicion(clave),
      actualizarElemento: (sId, eId, cambios) => aplicar((prev) => ops.actualizarElemento(prev, sId, eId, cambios), true),
      actualizarEstiloTextoElemento: (sId, eId, cambios) =>
        aplicar((prev) => ops.actualizarEstiloTextoElemento(prev, sId, eId, cambios), cambios !== null),
      actualizarEstiloTexto: (sId, campo, cambios) =>
        aplicar((prev) => ops.actualizarEstiloTextoSeccion(prev, sId, campo, cambios), cambios !== null),
      actualizarEstiloSeccion: (sId, cambios) => aplicar((prev) => ops.actualizarEstiloSeccion(prev, sId, cambios), true),
      eliminarElemento: (sId, eId) => {
        aplicar((prev) => ops.eliminarElemento(prev, sId, eId))
        setSeleccion({ tipo: 'seccion', seccionId: sId })
      },
      duplicarElemento: (sId, eId) => {
        const { secciones: nuevas, nuevoId } = ops.duplicarElemento(seccionesRef.current, sId, eId)
        if (!nuevoId) return
        aplicar(() => nuevas)
        setSeleccion({ tipo: 'elemento', seccionId: sId, elementoId: nuevoId })
      },
      moverCapa: (sId, eId, mov) => aplicar((prev) => ops.moverCapaElemento(prev, sId, eId, mov)),
      reemplazarImagen: (sId, eId) => {
        seleccionarArchivoImagen().then((archivo) => {
          if (!archivo) return
          conSubida(async () => {
            const url = await subirImagen(archivo, carpetaImagenes)
            const proporcion = await proporcionDeImagen(url)
            const el = seccionesRef.current.find((s) => s.id === sId)?.elementos?.find((e) => e.id === eId)
            aplicar((prev) => ops.actualizarElemento(prev, sId, eId, { url, alto: (el?.ancho ?? 60) * proporcion }))
          })
        })
      },
      abrirRecorte: (sId, eId) => {
        const el = seccionesRef.current.find((s) => s.id === sId)?.elementos?.find((e) => e.id === eId)
        if (el?.url) setRecorte({ sId, eId, url: el.url })
      },
      subirFondoSeccion: (sId) => {
        seleccionarArchivoImagen().then((archivo) => {
          if (!archivo) return
          conSubida(async () => {
            const url = await subirImagen(archivo, carpetaImagenes)
            aplicar((prev) => ops.actualizarEstiloSeccion(prev, sId, { imagenFondo: url, opacidadImagenFondo: 0.35 }))
          })
        })
      },
      moverSeccion: (sId, direccion) =>
        aplicar((prev) => {
          const ordenadas = [...prev].sort((a, b) => a.orden - b.orden)
          const i = ordenadas.findIndex((s) => s.id === sId)
          const j = direccion === 'arriba' ? i - 1 : i + 1
          if (i < 0 || j < 0 || j >= ordenadas.length) return prev
          return ops.reordenarSecciones(prev, sId, ordenadas[j].id)
        }),
      duplicarSeccion: (sId) => aplicar((prev) => ops.duplicarSeccion(prev, sId)),
      ocultarSeccion: (sId) => {
        aplicar((prev) => prev.map((s) => (s.id === sId ? { ...s, visible: !s.visible } : s)))
        setSeleccion(null)
      },
      eliminarSeccion: (sId) => {
        if (!window.confirm('¿Eliminar esta sección y todo su contenido? Puedes deshacerlo con Ctrl+Z o el botón ↶.')) return
        aplicar((prev) => prev.filter((s) => s.id !== sId).map((s, i) => ({ ...s, orden: i })))
        setSeleccion(null)
      },
      abrirAgregar: () => setPanelAgregarAbierto(true),
      abrirCapas: () => setPanelCapasAbierto(true),
    }),
    [seleccionar, aplicar, conSubida, carpetaImagenes]
  )

  // ─────────── Atajos de teclado (PC) ───────────
  useEffect(() => {
    if (!esEdicion) return
    const alPresionar = (e: KeyboardEvent) => {
      if (esCampoDeEscritura(e.target)) return
      const mod = e.ctrlKey || e.metaKey
      const tecla = e.key.toLowerCase()

      if (mod && tecla === 'z') {
        e.preventDefault()
        if (e.shiftKey) rehacer()
        else deshacer()
        return
      }
      if (mod && tecla === 'y') {
        e.preventDefault()
        rehacer()
        return
      }
      if (e.key === 'Escape') {
        // Escape primero cierra el panel abierto (como en Canva); solo sin paneles deselecciona
        const hayPanelAbierto = document.querySelector(
          '[data-radix-popper-content-wrapper], [data-vaul-drawer], [role="dialog"]'
        )
        if (!hayPanelAbierto) setSeleccion(null)
        return
      }
      if (!seleccion) return

      if (seleccion.tipo === 'texto' && e.key === 'Enter') {
        e.preventDefault()
        setTextoEnEdicion(`${seleccion.seccionId}:${seleccion.campo}`)
        return
      }
      if (seleccion.tipo !== 'elemento') {
        if (mod && tecla === 'v' && portapapeles.current) {
          e.preventDefault()
          const { secciones: nuevas, nuevoId } = ops.pegarElemento(seccionesRef.current, seleccion.seccionId, portapapeles.current)
          aplicar(() => nuevas)
          setSeleccion({ tipo: 'elemento', seccionId: seleccion.seccionId, elementoId: nuevoId })
        }
        return
      }

      const { seccionId: sId, elementoId: eId } = seleccion
      const elemento = seccionesRef.current.find((s) => s.id === sId)?.elementos?.find((el) => el.id === eId)
      if (!elemento) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        acciones.eliminarElemento(sId, eId)
      } else if (mod && tecla === 'd') {
        e.preventDefault()
        acciones.duplicarElemento(sId, eId)
      } else if (mod && tecla === 'c') {
        portapapeles.current = structuredClone(elemento)
      } else if (mod && tecla === 'v' && portapapeles.current) {
        e.preventDefault()
        const { secciones: nuevas, nuevoId } = ops.pegarElemento(seccionesRef.current, sId, portapapeles.current)
        aplicar(() => nuevas)
        setSeleccion({ tipo: 'elemento', seccionId: sId, elementoId: nuevoId })
      } else if (e.key === 'Enter' && elemento.tipo === 'texto') {
        e.preventDefault()
        setTextoEnEdicion(eId)
      } else if (e.key.startsWith('Arrow') && !elemento.bloqueado) {
        e.preventDefault()
        const paso = e.shiftKey ? 5 : 0.5
        const dx = e.key === 'ArrowLeft' ? -paso : e.key === 'ArrowRight' ? paso : 0
        const dy = e.key === 'ArrowUp' ? -paso : e.key === 'ArrowDown' ? paso : 0
        aplicar((prev) => ops.actualizarElemento(prev, sId, eId, { x: elemento.x + dx, y: elemento.y + dy }), true)
      }
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [esEdicion, seleccion, deshacer, rehacer, acciones, aplicar])

  const contexto: ContextoEditorLienzo = useMemo(
    () => ({
      esEdicion,
      seleccion,
      seleccionar,
      textoEnEdicion,
      setTextoEnEdicion,
      actualizarElemento: (sId, eId, cambios) => aplicar((prev) => ops.actualizarElemento(prev, sId, eId, cambios)),
      actualizarEstiloTexto: (sId, campo, cambios) => aplicar((prev) => ops.actualizarEstiloTextoSeccion(prev, sId, campo, cambios)),
      moverElementoASeccion: (desde, hacia, eId, cambios) => {
        aplicar((prev) => ops.moverElementoASeccion(prev, desde, hacia, eId, cambios))
        setSeleccion({ tipo: 'elemento', seccionId: hacia, elementoId: eId })
      },
    }),
    [esEdicion, seleccion, seleccionar, textoEnEdicion, aplicar]
  )

  const propsPanelAgregar: PanelAgregarProps = {
    abierto: panelAgregarAbierto,
    alCerrar: () => setPanelAgregarAbierto(false),
    esMovil,
    visual,
    subiendoImagen,
    destino: nombreDestino,
    alAgregarTexto: (texto, estilo) => insertar((z, y) => [ops.crearElemento({ tipo: 'texto', texto, estilo }, z, y)]),
    alAgregarCombinacion: (combinacion) =>
      insertar((z, y) => crearElementosDesdeCombinacion(combinacion, generarIdElemento, z, Math.max(y - 12, 4))),
    alSubirFoto: () => {
      seleccionarArchivoImagen().then((archivo) => {
        if (!archivo) return
        conSubida(async () => {
          const url = await subirImagen(archivo, carpetaImagenes)
          const proporcion = await proporcionDeImagen(url)
          insertar((z, y) => [ops.crearElemento({ tipo: 'imagen', url, proporcion }, z, y)])
        })
      })
    },
    alAgregarFotoUrl: (url) => {
      conSubida(async () => {
        const proporcion = await proporcionDeImagen(url)
        insertar((z, y) => [ops.crearElemento({ tipo: 'imagen', url, proporcion }, z, y)])
      })
    },
    alAgregarSticker: (s) => insertar((z, y) => [ops.crearElemento({ tipo: 'sticker', stickerId: s.id, proporcion: s.proporcion }, z, y)]),
    alAgregarIcono: (icono) => insertar((z, y) => [ops.crearElemento({ tipo: 'icono', icono }, z, y)]),
    alAgregarForma: (forma) => insertar((z, y) => [ops.crearElemento({ tipo: 'forma', forma }, z, y)]),
    alAgregarSeccion: (tipo: TipoSeccion) => {
      const nueva = crearSeccionPorTipo(tipo, 0)
      const ordenadas = [...seccionesRef.current].sort((a, b) => a.orden - b.orden)
      const iSel = seleccion ? ordenadas.findIndex((s) => s.id === seleccion.seccionId) : -1
      const indice = iSel >= 0 ? iSel + 1 : ordenadas.length
      ordenadas.splice(indice, 0, nueva)
      aplicar(() => ordenadas.map((s, i) => ({ ...s, orden: i })))
      setPanelAgregarAbierto(false)
      setSeleccion({ tipo: 'seccion', seccionId: nueva.id })
      setTimeout(() => {
        document.querySelector(`[data-seccion-id="${nueva.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 120)
    },
  }

  const propsPanelCapas: PanelCapasProps = {
    abierto: panelCapasAbierto,
    alCerrar: () => setPanelCapasAbierto(false),
    esMovil,
    secciones,
    seleccion,
    alSeleccionar: seleccionar,
    alReordenarSecciones: (a, b) => {
      aplicar((prev) => ops.reordenarSecciones(prev, a, b))
    },
    alReordenarCapas: (sId, ids) => aplicar((prev) => ops.reordenarCapas(prev, sId, ids)),
    alAlternarSeccion: (sId) => aplicar((prev) => prev.map((s) => (s.id === sId ? { ...s, visible: !s.visible } : s))),
    alActualizarElemento: (sId, eId, cambios) => aplicar((prev) => ops.actualizarElemento(prev, sId, eId, cambios)),
    alEliminarElemento: (sId, eId) => aplicar((prev) => ops.eliminarElemento(prev, sId, eId)),
  }

  const confirmarRecorte = async (dataUrl: string, proporcion: number) => {
    if (!recorte) return
    const url = await subirImagen(dataUrl, carpetaImagenes)
    const el = seccionesRef.current.find((s) => s.id === recorte.sId)?.elementos?.find((e) => e.id === recorte.eId)
    aplicar((prev) => ops.actualizarElemento(prev, recorte.sId, recorte.eId, { url, alto: (el?.ancho ?? 60) * proporcion }))
    setRecorte(null)
  }

  /**
   * Agrega un texto libre en el centro de un bloque y lo deja listo para escribir,
   * o abre el panel de fotos, stickers y formas apuntando a ese bloque.
   */
  const agregarElementoEn = useCallback(
    (sId: string, tipo: 'texto' | 'foto' | 'mas') => {
      if (tipo === 'mas') {
        setSeleccion({ tipo: 'seccion', seccionId: sId })
        setPanelAgregarAbierto(true)
        return
      }
      if (tipo === 'foto') {
        // Sube la imagen y la deja en el centro del bloque, seleccionada para moverla
        seleccionarArchivoImagen().then((archivo) => {
          if (!archivo) return
          conSubida(async () => {
            const url = await subirImagen(archivo, carpetaImagenes)
            const proporcion = await proporcionDeImagen(url)
            const seccion = seccionesRef.current.find((s) => s.id === sId)
            const nueva = ops.crearElemento({ tipo: 'imagen', url, proporcion }, ops.zMaximo(seccion) + 1, 45)
            aplicar((prev) => ops.agregarElementos(prev, sId, [nueva]))
            setSeleccion({ tipo: 'elemento', seccionId: sId, elementoId: nueva.id })
          })
        })
        return
      }
      const seccion = seccionesRef.current.find((s) => s.id === sId)
      const nuevo = ops.crearElemento({ tipo: 'texto', texto: 'Escribe aquí', estilo: { tamano: 22 }, ancho: 70 }, ops.zMaximo(seccion) + 1, 50)
      aplicar((prev) => ops.agregarElementos(prev, sId, [{ ...nuevo, animacion: 'aparecer' }]))
      setSeleccion({ tipo: 'elemento', seccionId: sId, elementoId: nuevo.id })
      setTextoEnEdicion(nuevo.id)
    },
    [aplicar, conSubida, carpetaImagenes]
  )

  return {
    contexto,
    seleccion,
    acciones,
    agregarElementoEn,
    propsPanelAgregar,
    propsPanelCapas,
    recorte,
    cancelarRecorte: () => setRecorte(null),
    confirmarRecorte,
    subiendoImagen,
    errorImagen,
    limpiarErrorImagen: () => setErrorImagen(null),
  }
}

export type EstudioLienzo = ReturnType<typeof useEstudioLienzo>
export type { EstiloSeccion, EstiloTexto }
