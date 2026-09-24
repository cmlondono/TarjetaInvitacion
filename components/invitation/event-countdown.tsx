'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcularTiempoRestante(fechaObjetivo: string): TimeLeft {
  const diff = new Date(fechaObjetivo).getTime() - Date.now()
  if (diff <= 0 || isNaN(diff)) return { dias: 0, horas: 0, minutos: 0, segundos: 0 }

  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

interface EventCountdownProps {
  fechaIso: string
  colorTexto: string
  colorAcento: string
  compacto?: boolean
  esModoEdicionDirecta?: boolean
}

export function EventCountdown({
  fechaIso,
  colorTexto,
  colorAcento,
  compacto = true,
  esModoEdicionDirecta = false,
}: EventCountdownProps) {
  const [tiempo, setTiempo] = useState<TimeLeft>(() => calcularTiempoRestante(fechaIso))
  const [montado, setMontado] = useState(false)

  // Actualización inmediata al cambiar fechaIso (0ms latencia)
  useEffect(() => {
    setMontado(true)
    setTiempo(calcularTiempoRestante(fechaIso))
    const id = setInterval(() => {
      setTiempo(calcularTiempoRestante(fechaIso))
    }, 1000)
    return () => clearInterval(id)
  }, [fechaIso])

  if (!montado) return null

  const esFinalizado =
    tiempo.dias === 0 && tiempo.horas === 0 && tiempo.minutos === 0 && tiempo.segundos === 0

  if (esFinalizado) {
    return (
      <div className="text-center py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="font-semibold text-xs" style={{ color: colorTexto }}>
          {esModoEdicionDirecta
            ? '⏳ La fecha configurada ya pasó o es hoy. Ajusta la fecha más adelante para ver el contador regresivo en marcha.'
            : '¡El evento ya está sucediendo o ha finalizado! 🎉'}
        </p>
      </div>
    )
  }

  const unidades = [
    { etiqueta: 'Días', valor: tiempo.dias },
    { etiqueta: 'Hrs', valor: tiempo.horas },
    { etiqueta: 'Min', valor: tiempo.minutos },
    { etiqueta: 'Seg', valor: tiempo.segundos },
  ]

  return (
    <div className="grid grid-cols-4 gap-1.5 w-full">
      {unidades.map(({ etiqueta, valor }) => (
        <div
          key={etiqueta}
          className="flex flex-col items-center justify-center rounded-xl py-2 backdrop-blur-sm shadow-xs transition-transform hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.45)',
            border: `1px solid ${colorAcento}33`,
          }}
        >
          <motion.span
            key={valor}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-bold leading-none tabular-nums"
            style={{
              fontSize: compacto ? '1.25rem' : '1.5rem',
              color: colorTexto,
            }}
          >
            {String(valor).padStart(2, '0')}
          </motion.span>
          <span
            className="tracking-widest uppercase mt-0.5 text-[9px]"
            style={{ color: colorAcento }}
          >
            {etiqueta}
          </span>
        </div>
      ))}
    </div>
  )
}
