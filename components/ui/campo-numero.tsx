'use client'

import { useEffect, useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number
  onChange: (valor: number) => void
}

/**
 * Campo numérico que se puede borrar y volver a escribir (no se queda en 0).
 * Guarda el texto mientras se escribe y solo avisa cuando hay un número válido;
 * si se deja vacío, al salir del campo vuelve al último valor.
 */
export function CampoNumero({ value, onChange, onBlur, ...resto }: Props) {
  const [texto, setTexto] = useState(String(value))

  // Si el valor cambia desde afuera (p. ej. al cargar la configuración), mostrarlo
  useEffect(() => {
    setTexto((actual) => (actual !== '' && Number(actual) === value ? actual : String(value)))
  }, [value])

  return (
    <input
      {...resto}
      type="number"
      inputMode="decimal"
      value={texto}
      onChange={(e) => {
        setTexto(e.target.value)
        const n = Number(e.target.value)
        if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n)
      }}
      onBlur={(e) => {
        if (texto.trim() === '' || !Number.isFinite(Number(texto))) setTexto(String(value))
        onBlur?.(e)
      }}
    />
  )
}
