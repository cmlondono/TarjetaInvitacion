'use client'

import { useEffect, useState } from 'react'

/** Indicativos más usados por nuestros clientes (Colombia primero: es el valor por defecto) */
export const PAISES_TELEFONO: { codigo: string; pais: string; bandera: string }[] = [
  { codigo: '57', pais: 'Colombia', bandera: '🇨🇴' },
  { codigo: '1', pais: 'Estados Unidos / Canadá', bandera: '🇺🇸' },
  { codigo: '52', pais: 'México', bandera: '🇲🇽' },
  { codigo: '58', pais: 'Venezuela', bandera: '🇻🇪' },
  { codigo: '593', pais: 'Ecuador', bandera: '🇪🇨' },
  { codigo: '51', pais: 'Perú', bandera: '🇵🇪' },
  { codigo: '56', pais: 'Chile', bandera: '🇨🇱' },
  { codigo: '54', pais: 'Argentina', bandera: '🇦🇷' },
  { codigo: '507', pais: 'Panamá', bandera: '🇵🇦' },
  { codigo: '506', pais: 'Costa Rica', bandera: '🇨🇷' },
  { codigo: '502', pais: 'Guatemala', bandera: '🇬🇹' },
  { codigo: '503', pais: 'El Salvador', bandera: '🇸🇻' },
  { codigo: '504', pais: 'Honduras', bandera: '🇭🇳' },
  { codigo: '505', pais: 'Nicaragua', bandera: '🇳🇮' },
  { codigo: '591', pais: 'Bolivia', bandera: '🇧🇴' },
  { codigo: '595', pais: 'Paraguay', bandera: '🇵🇾' },
  { codigo: '598', pais: 'Uruguay', bandera: '🇺🇾' },
  { codigo: '55', pais: 'Brasil', bandera: '🇧🇷' },
  { codigo: '34', pais: 'España', bandera: '🇪🇸' },
  { codigo: '39', pais: 'Italia', bandera: '🇮🇹' },
  { codigo: '33', pais: 'Francia', bandera: '🇫🇷' },
  { codigo: '49', pais: 'Alemania', bandera: '🇩🇪' },
  { codigo: '44', pais: 'Reino Unido', bandera: '🇬🇧' },
]

export const INDICATIVO_POR_DEFECTO = '57'

/**
 * Separa un número guardado («573001234567») en indicativo y número local.
 * Si no empieza por un indicativo conocido (p. ej. «3001234567»), se asume Colombia.
 */
export function separarTelefono(valor?: string): { codigo: string; numero: string } {
  const digitos = (valor || '').replace(/\D/g, '')
  if (!digitos) return { codigo: INDICATIVO_POR_DEFECTO, numero: '' }
  const conocido = [...PAISES_TELEFONO]
    .sort((a, b) => b.codigo.length - a.codigo.length)
    .find((p) => digitos.startsWith(p.codigo) && digitos.length - p.codigo.length >= 7)
  return conocido ? { codigo: conocido.codigo, numero: digitos.slice(conocido.codigo.length) } : { codigo: INDICATIVO_POR_DEFECTO, numero: digitos }
}

/** «573001234567» → «+57 300 123 4567» (para mostrar) */
export function formatearTelefono(valor?: string): string {
  const { codigo, numero } = separarTelefono(valor)
  if (!numero) return ''
  return `+${codigo} ${numero.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')}`
}

interface Props {
  /** Número completo con indicativo y sin «+» (como lo usa WhatsApp), o vacío */
  valor?: string
  alCambiar: (valor: string) => void
  compacto?: boolean
  autoFocus?: boolean
  id?: string
}

/** Número de celular con selector de indicativo del país (por defecto +57) */
export function CampoTelefono({ valor, alCambiar, compacto = false, autoFocus, id }: Props) {
  const inicial = separarTelefono(valor)
  const [codigo, setCodigo] = useState(inicial.codigo)
  const [numero, setNumero] = useState(inicial.numero)

  // Si el valor cambia desde afuera (p. ej. se limpia el formulario), reflejarlo
  useEffect(() => {
    const actual = numero ? `${codigo}${numero}` : ''
    if ((valor || '') !== actual) {
      const s = separarTelefono(valor)
      setCodigo(valor ? s.codigo : codigo)
      setNumero(s.numero)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])

  const emitir = (c: string, n: string) => alCambiar(n ? `${c}${n}` : '')

  const alto = compacto ? 'h-8 text-xs' : 'h-[42px] text-sm'
  return (
    <div className={`flex items-stretch rounded-xl border border-slate-300 bg-white focus-within:border-slate-800 overflow-hidden ${compacto ? 'w-56' : 'w-full'}`}>
      <select
        aria-label="Indicativo del país"
        value={codigo}
        onChange={(e) => {
          setCodigo(e.target.value)
          emitir(e.target.value, numero)
        }}
        className={`${alto} pl-2 pr-1 bg-slate-50 border-r border-slate-200 text-slate-800 font-semibold focus:outline-none cursor-pointer shrink-0`}
      >
        {PAISES_TELEFONO.map((p) => (
          <option key={`${p.codigo}-${p.pais}`} value={p.codigo}>
            {p.bandera} +{p.codigo}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={numero}
        autoFocus={autoFocus}
        onChange={(e) => {
          let digitos = e.target.value.replace(/\D/g, '')
          // Si pegan el número con el indicativo (+57 300…), se quita para no duplicarlo
          if (e.target.value.trim().startsWith('+') && digitos.startsWith(codigo)) digitos = digitos.slice(codigo.length)
          digitos = digitos.slice(0, 15)
          setNumero(digitos)
          emitir(codigo, digitos)
        }}
        placeholder={codigo === '57' ? '300 123 4567' : 'Número'}
        className={`${alto} flex-1 min-w-0 px-3 font-mono text-slate-900 bg-transparent focus:outline-none`}
      />
    </div>
  )
}
