'use client'

import React from 'react'
import type { DetalleEvento, OpcionRsvp, SeccionModular } from '@/types/invitation'
import { OPCIONES_COMIDA_POR_DEFECTO, PREGUNTA_COMIDA_POR_DEFECTO } from '@/components/invitacion/confirmacion'
import { Campo, EditorLista, Interruptor, Segmentos, idCorto } from './ui'

/**
 * Lo que ve el invitado al confirmar: cómo le llegan las respuestas al anfitrión y la pregunta
 * de comida (vegano, sin gluten…), que se puede apagar o cambiar. Se usa en el bloque
 * «Confirmar asistencia» y en la pestaña Datos.
 */
export function AjustesConfirmacion({
  seccion,
  evento,
  alDato,
  alEvento,
}: {
  seccion: SeccionModular
  evento: DetalleEvento
  alDato: (sId: string, campo: string, valor: unknown) => void
  alEvento: (cambios: Partial<DetalleEvento>) => void
}) {
  const d = seccion.datos || {}
  const s = seccion.id
  return (
    <div className="flex flex-col gap-3.5">
      <Segmentos
        etiqueta="¿Cómo te llegan las respuestas?"
        opciones={[
          { id: 'tarjeton', nombre: 'En mi panel' },
          { id: 'ambos', nombre: 'Panel y WhatsApp' },
          { id: 'whatsapp', nombre: 'WhatsApp' },
        ]}
        valor={evento.metodoConfirmacion || 'tarjeton'}
        alCambiar={(v) => {
          alEvento({ metodoConfirmacion: v })
          alDato(s, 'metodoConfirmacion', v)
        }}
      />
      {evento.metodoConfirmacion !== 'tarjeton' && evento.metodoConfirmacion && (
        <Campo etiqueta="Tu WhatsApp (con indicativo)" tipo="tel" valor={evento.whatsappNumero} alCambiar={(v) => alEvento({ whatsappNumero: v.replace(/[^\d]/g, '') })} placeholder="573001234567" />
      )}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-slate-200">
        <Interruptor
          etiqueta="Preguntar por la comida"
          descripcion={d.preguntarComida === false ? 'Tus invitados no verán esta pregunta' : 'Vegano, sin gluten, menú infantil…'}
          activo={d.preguntarComida !== false}
          alCambiar={(v) => alDato(s, 'preguntarComida', v)}
        />
        {d.preguntarComida !== false && (
          <>
            <Campo etiqueta="Pregunta" valor={d.preguntaComida} alCambiar={(v) => alDato(s, 'preguntaComida', v)} placeholder={PREGUNTA_COMIDA_POR_DEFECTO} maximo={70} />
            <EditorLista<OpcionRsvp>
              etiqueta="Opciones que puede elegir"
              items={d.opcionesComida ?? OPCIONES_COMIDA_POR_DEFECTO}
              alCambiar={(v) => alDato(s, 'opcionesComida', v)}
              crear={() => ({ id: idCorto('cm'), texto: '' })}
              textoAgregar="Agregar opción"
              maximo={10}
              render={(o, actualizar) => <Campo etiqueta="Opción" valor={o.texto} alCambiar={(v) => actualizar({ texto: v })} placeholder="Ej: Sin mariscos" maximo={30} />}
            />
            <p className="m-0 text-[12px] text-slate-500">Siempre aparece también «Ninguna». Lo que elijan llega con su respuesta en tu panel.</p>
          </>
        )}
      </div>
    </div>
  )
}
