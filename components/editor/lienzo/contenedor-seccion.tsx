'use client'

import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import type { ElementoLienzo, SeccionModular } from '@/types/invitation'
import { ElementoLienzoVista } from './elemento-lienzo'
import { ProveedorSeccionActual, useEditorLienzo } from './contexto-editor'
import { estadoInicialAnimacion, transicionAnimacion } from '@/lib/editor/estilos'

// Moveable solo existe en el editor y depende del navegador
const ManipuladorElemento = dynamic(() => import('./manipulador-elemento'), { ssr: false })

interface CapaElementosProps {
  seccion: SeccionModular
  colorAcento: string
  fuenteCuerpo?: string
}

/** Capa de elementos libres (textos, fotos, stickers, formas) superpuesta a una sección o bloque */
export function CapaElementos({ seccion, colorAcento, fuenteCuerpo }: CapaElementosProps) {
  const editor = useEditorLienzo()
  // Ref por callback: la capa aparece cuando se agrega el primer elemento
  const [capa, setCapa] = useState<HTMLDivElement | null>(null)
  const arrastrePendiente = useRef<PointerEvent | null>(null)

  const elementos = [...(seccion.elementos || [])].sort((a, b) => a.z - b.z)
  if (elementos.length === 0) return null

  const seleccionado =
    editor.seleccion?.tipo === 'elemento' && editor.seleccion.seccionId === seccion.id
      ? elementos.find((el) => el.id === (editor.seleccion as { elementoId: string }).elementoId)
      : undefined

  const presionarElemento = (elemento: ElementoLienzo, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const yaSeleccionado = seleccionado?.id === elemento.id
    if (!yaSeleccionado) {
      // Con mouse se puede arrastrar de inmediato; en táctil el primer toque solo selecciona
      // (así la tarjeta sigue pudiendo desplazarse con el dedo sobre elementos grandes)
      if (e.pointerType === 'mouse' && !elemento.bloqueado) arrastrePendiente.current = e.nativeEvent
      editor.seleccionar({ tipo: 'elemento', seccionId: seccion.id, elementoId: elemento.id })
    }
  }

  return (
    <div ref={setCapa} className="absolute inset-0 z-20 pointer-events-none" data-capa-seccion={seccion.id}>
      {elementos.map((elemento, i) => {
        const claveEdicion = elemento.id
        return (
          <ElementoLienzoVista
            key={elemento.id}
            elemento={elemento}
            colorAcento={colorAcento}
            fuenteCuerpo={fuenteCuerpo}
            esEdicion={editor.esEdicion}
            seleccionado={seleccionado?.id === elemento.id}
            editandoTexto={editor.textoEnEdicion === claveEdicion}
            indiceAnimacion={i}
            alPresionar={(e) => presionarElemento(elemento, e)}
            alDobleClick={() => {
              if (elemento.tipo === 'texto' && !elemento.bloqueado) {
                editor.seleccionar({ tipo: 'elemento', seccionId: seccion.id, elementoId: elemento.id })
                editor.setTextoEnEdicion(claveEdicion)
              }
            }}
            alTerminarTexto={(texto) => {
              editor.setTextoEnEdicion(null)
              if (texto !== elemento.texto) {
                editor.actualizarElemento(seccion.id, elemento.id, { texto })
              }
            }}
          />
        )
      })}

      {editor.esEdicion &&
        capa &&
        seleccionado &&
        !seleccionado.bloqueado &&
        editor.textoEnEdicion !== seleccionado.id && (
          <ManipuladorElemento
            key={seleccionado.id}
            elemento={seleccionado}
            capa={capa}
            seccionId={seccion.id}
            arrastrePendiente={arrastrePendiente}
            alConfirmar={(cambios) => editor.actualizarElemento(seccion.id, seleccionado.id, cambios)}
            alCambiarBloque={(haciaId, cambios) => editor.moverElementoASeccion(seccion.id, haciaId, seleccionado.id, cambios)}
          />
        )}
    </div>
  )
}

interface ContenedorSeccionProps {
  seccion: SeccionModular
  colorAcento: string
  fuenteCuerpo?: string
  className?: string
  children: React.ReactNode
}

/**
 * Envoltura de cada sección de la tarjeta:
 * - aplica fondo propio y animación de entrada configurados por el usuario,
 * - superpone la capa de elementos libres,
 * - en el editor, un toque en la sección la selecciona.
 */
export function ContenedorSeccion({ seccion, colorAcento, fuenteCuerpo, className = '', children }: ContenedorSeccionProps) {
  const editor = useEditorLienzo()
  const estilo = seccion.estilo || {}
  const seleccionada = editor.esEdicion && editor.seleccion?.seccionId === seccion.id

  const fondo = (estilo.colorFondo || estilo.imagenFondo) && (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {estilo.colorFondo && <div className="absolute inset-0" style={{ backgroundColor: estilo.colorFondo }} />}
      {estilo.imagenFondo && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${estilo.imagenFondo}")`, opacity: estilo.opacidadImagenFondo ?? 1 }}
        />
      )}
    </div>
  )

  const contenido = (
    <>
      {fondo}
      <div className="relative z-10">{children}</div>
      <CapaElementos seccion={seccion} colorAcento={colorAcento} fuenteCuerpo={fuenteCuerpo} />
    </>
  )

  const inicial = !editor.esEdicion ? estadoInicialAnimacion(estilo.animacion) : null
  const clases = `seccion-lienzo relative ${className} ${
    seleccionada ? 'ring-2 ring-amber-500/80 ring-offset-1 rounded-xl' : ''
  }`

  const alSeleccionar = editor.esEdicion
    ? () => {
        if (editor.textoEnEdicion) return
        editor.seleccionar({ tipo: 'seccion', seccionId: seccion.id })
      }
    : undefined

  return (
    <ProveedorSeccionActual value={seccion}>
      {inicial ? (
        <motion.div
          className={clases}
          initial={inicial}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={transicionAnimacion(estilo.animacion)}
        >
          {contenido}
        </motion.div>
      ) : (
        <div className={clases} onClick={alSeleccionar} data-seccion-id={seccion.id}>
          {contenido}
        </div>
      )}
    </ProveedorSeccionActual>
  )
}
