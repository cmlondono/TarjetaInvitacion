'use client'

import { useEffect, useState, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number
  onChange: (valor: number) => void
  /**
   * Solo números enteros (precios en pesos, cupos, usos). Los puntos y comas se toman como
   * separadores de miles, como se escribe en Colombia: «15.900» → 15900 (no 15,9).
   */
  entero?: boolean
}

const aEntero = (texto: string) => texto.replace(/\D/g, '')
const conMiles = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString('es-CO') : '')

/**
 * Campo numérico que se puede borrar y volver a escribir (no se queda en 0).
 * Guarda el texto mientras se escribe y solo avisa cuando hay un número válido;
 * si se deja vacío, al salir del campo vuelve al último valor.
 */
export function CampoNumero({ value, onChange, onBlur, entero = false, ...resto }: Props) {
  const mostrar = (n: number) => (entero ? conMiles(n) : String(n))
  const [texto, setTexto] = useState(mostrar(value))

  // Si el valor cambia desde afuera (p. ej. al cargar la configuración), mostrarlo
  useEffect(() => {
    setTexto((actual) => {
      const numeroActual = entero ? Number(aEntero(actual)) : Number(actual)
      return actual !== '' && numeroActual === value ? actual : mostrar(value)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (entero) {
    // Texto con teclado numérico: así el punto de miles no se interpreta como decimal
    const { min, max, step: _paso, ...demas } = resto
    return (
      <input
        {...demas}
        type="text"
        inputMode="numeric"
        value={texto}
        onChange={(e) => {
          const digitos = aEntero(e.target.value).slice(0, 12)
          setTexto(digitos ? conMiles(Number(digitos)) : '')
          if (digitos) {
            let n = Number(digitos)
            if (max !== undefined && n > Number(max)) n = Number(max)
            if (min !== undefined && n < Number(min)) n = Number(min)
            onChange(n)
          }
        }}
        onBlur={(e) => {
          setTexto(mostrar(value))
          onBlur?.(e)
        }}
      />
    )
  }

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
