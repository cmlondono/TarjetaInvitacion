import React from 'react'
import Link from 'next/link'

interface TarjetonIconProps {
  className?: string
  size?: number
}

/**
 * Isotipo / Ícono oficial de Tarjetón:
 * Representa un tarjetón de papelería protocolaria con doble relieve,
 * detalles dorados de etiqueta y el monograma señorial "T".
 */
export function TarjetonIcon({ className = '', size = 32 }: TarjetonIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tarjetón Isotipo"
    >
      <defs>
        {/* Gradiente dorado de etiqueta protocolaria */}
        <linearGradient id="tarjetonGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#B48222" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
        {/* Gradiente de fondo del tarjetón (slate oscuro institucional) */}
        <linearGradient id="tarjetonDarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B0F17" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        {/* Sombra sutil para profundidad de papel */}
        <filter id="tarjetonShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Contenedor exterior: Folio base con esquinas suavizadas */}
      <rect width="48" height="48" rx="12" fill="url(#tarjetonDarkBg)" />

      {/* Filete perimetral dorado fino */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="9.5"
        stroke="url(#tarjetonGold)"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Capa de fondo del tarjetón interior (efecto de tarjeta montada) */}
      <rect
        x="9"
        y="9"
        width="30"
        height="30"
        rx="6"
        fill="#0F172A"
        stroke="url(#tarjetonGold)"
        strokeWidth="1"
        filter="url(#tarjetonShadow)"
      />

      {/* Tarjeta interior en relieve dorado suave */}
      <rect
        x="11.5"
        y="11.5"
        width="25"
        height="25"
        rx="4.5"
        fill="#1E293B"
        stroke="url(#tarjetonGold)"
        strokeWidth="0.8"
        strokeDasharray="2 1.5"
        strokeOpacity="0.8"
      />

      {/* Letra 'T' señorial con serifas clásicas de imprenta protocolaria */}
      <path
        d="M17.5 17.5H30.5V20.5H27.5L26.5 21.5V29.5H28V31H20V29.5H21.5V21.5L20.5 20.5H17.5V17.5Z"
        fill="url(#tarjetonGold)"
      />

      {/* Destello de solemnidad superior */}
      <circle cx="24" cy="15" r="1" fill="#FDE68A" />
      {/* Puntos de esquina de papelería fina */}
      <circle cx="14" cy="14" r="0.75" fill="#D4AF37" opacity="0.8" />
      <circle cx="34" cy="14" r="0.75" fill="#D4AF37" opacity="0.8" />
      <circle cx="14" cy="34" r="0.75" fill="#D4AF37" opacity="0.8" />
      <circle cx="34" cy="34" r="0.75" fill="#D4AF37" opacity="0.8" />
    </svg>
  )
}

interface TarjetonLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  subtexto?: 'studio' | 'protocolo' | 'admin' | 'none'
  enlaceInicio?: boolean
  modoOscuro?: boolean
}

/**
 * Logotipo corporativo completo de Tarjetón (Isotipo + Tipografía formal)
 */
export function TarjetonLogo({
  className = '',
  size = 'md',
  subtexto = 'protocolo',
  enlaceInicio = false,
  modoOscuro = false,
}: TarjetonLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const subtextLabels = {
    protocolo: 'Papelería Digital & Protocolo',
    studio: 'Studio de Confección',
    admin: 'Consola de Control',
    none: null,
  }

  const contenido = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <TarjetonIcon
        size={iconSizes[size]}
        className="transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-sm rounded-xl"
      />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span
            className={`font-serif font-bold tracking-tight leading-none ${textSizes[size]} ${
              modoOscuro ? 'text-white' : 'text-slate-900 group-hover:text-slate-950'
            } transition-colors`}
          >
            Tarjetón
          </span>
          {subtexto === 'studio' && (
            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200/80 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
              Studio
            </span>
          )}
        </div>
        {subtexto !== 'none' && subtextLabels[subtexto] && (
          <span
            className={`hidden sm:inline-block text-[9px] sm:text-[10px] tracking-widest uppercase font-medium mt-0.5 ${
              modoOscuro ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {subtextLabels[subtexto]}
          </span>
        )}
      </div>
    </div>
  )

  if (enlaceInicio) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl">
        {contenido}
      </Link>
    )
  }

  return contenido
}
