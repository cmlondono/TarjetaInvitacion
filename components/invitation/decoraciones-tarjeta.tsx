'use client'

import React from 'react'
import { TexturaFondo, MarcoDecorativoTipo } from '@/types/invitation'

interface DecoracionesTarjetaProps {
  textura?: TexturaFondo
  marco?: MarcoDecorativoTipo
  colorAcento?: string
  colorSecundario?: string
  forma?: string
}

export function DecoracionesTarjeta({
  textura = 'liso',
  marco = 'ninguno',
  colorAcento = '#D4AF37',
  colorSecundario = '#B59975',
  forma = 'rounded-3xl',
}: DecoracionesTarjetaProps) {
  return (
    <>
      {/* ══════════════ TEXTURAS DE FONDO ARTESANALES ══════════════ */}
      {textura === 'papel_algodon' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply z-0"
          style={{
            backgroundImage: `radial-gradient(#d6d3d1 1px, transparent 1px), radial-gradient(#e7e5e4 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />
      )}

      {textura === 'marmol_oro' && (
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color-burn z-0 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path
              d="M-50,80 Q100,120 200,60 T450,150"
              fill="none"
              stroke={colorAcento}
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M-20,300 Q150,220 300,280 T500,200"
              fill="none"
              stroke={colorSecundario}
              strokeWidth="2"
              strokeOpacity="0.3"
            />
            <path
              d="M50,550 Q200,480 320,540 T480,470"
              fill="none"
              stroke={colorAcento}
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
          </svg>
        </div>
      )}

      {textura === 'acuarela_botanica' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          {/* Mancha botánica superior derecha */}
          <div
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-2xl"
            style={{ backgroundColor: `${colorAcento}35` }}
          />
          {/* Mancha botánica inferior izquierda */}
          <div
            className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full blur-3xl"
            style={{ backgroundColor: `${colorSecundario}30` }}
          />
        </div>
      )}

      {textura === 'noche_estrellada' && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, transparent),
                                radial-gradient(1px 1px at 80px 120px, #ffffff, transparent),
                                radial-gradient(1.5px 1.5px at 220px 60px, ${colorAcento}, transparent),
                                radial-gradient(1px 1px at 300px 200px, #ffffff, transparent),
                                radial-gradient(2px 2px at 150px 340px, ${colorAcento}, transparent),
                                radial-gradient(1px 1px at 260px 480px, #ffffff, transparent)`,
              backgroundSize: '350px 350px',
            }}
          />
        </div>
      )}

      {textura === 'lino_rustico' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply z-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(168, 85, 247, 0.03) 0, rgba(168, 85, 247, 0.03) 2px, transparent 2px, transparent 6px), repeating-linear-gradient(-45deg, rgba(217, 119, 6, 0.04) 0, rgba(217, 119, 6, 0.04) 2px, transparent 2px, transparent 6px)`,
          }}
        />
      )}

      {textura === 'fiesta_neon' && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
          <div
            className="absolute top-0 inset-x-0 h-32 blur-2xl"
            style={{
              background: `linear-gradient(180deg, ${colorAcento}40 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-32 blur-2xl"
            style={{
              background: `linear-gradient(0deg, ${colorSecundario}35 0%, transparent 100%)`,
            }}
          />
        </div>
      )}

      {textura === 'terciopelo_oscuro' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-50 z-0"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      )}

      {/* ══════════════ MARCOS & RIBETES DECORATIVOS ══════════════ */}
      {marco === 'oro_fino' && (
        <div
          className="absolute inset-3 pointer-events-none rounded-[1.3rem] border z-20"
          style={{
            borderColor: `${colorAcento}44`,
            boxShadow: `inset 0 0 0 1px ${colorAcento}18`,
          }}
        />
      )}

      {marco === 'doble_dorado' && (
        <div
          className="absolute inset-2.5 pointer-events-none rounded-[1.3rem] border border-dashed z-20"
          style={{
            borderColor: `${colorAcento}55`,
          }}
        >
          <div
            className="absolute inset-1.5 rounded-[1.1rem] border"
            style={{
              borderColor: `${colorAcento}33`,
            }}
          />
          {/* Rombos en las 4 esquinas */}
          <span className="absolute -top-1.5 -left-1.5 text-[8px]" style={{ color: colorAcento }}>◈</span>
          <span className="absolute -top-1.5 -right-1.5 text-[8px]" style={{ color: colorAcento }}>◈</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-[8px]" style={{ color: colorAcento }}>◈</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-[8px]" style={{ color: colorAcento }}>◈</span>
        </div>
      )}

      {marco === 'esquinas_vintage' && (
        <div className="absolute inset-2 pointer-events-none z-20 overflow-hidden">
          {/* Esquina Sup Izquierda */}
          <div className="absolute top-1 left-1 w-7 h-7 border-t-2 border-l-2" style={{ borderColor: colorAcento }} />
          {/* Esquina Sup Derecha */}
          <div className="absolute top-1 right-1 w-7 h-7 border-t-2 border-r-2" style={{ borderColor: colorAcento }} />
          {/* Esquina Inf Izquierda */}
          <div className="absolute bottom-1 left-1 w-7 h-7 border-b-2 border-l-2" style={{ borderColor: colorAcento }} />
          {/* Esquina Inf Derecha */}
          <div className="absolute bottom-1 right-1 w-7 h-7 border-b-2 border-r-2" style={{ borderColor: colorAcento }} />
        </div>
      )}

      {marco === 'arco_floral' && (
        <div className="absolute inset-x-0 top-1 flex justify-center pointer-events-none z-20 opacity-60">
          <span className="text-xs tracking-[0.3em]" style={{ color: colorAcento }}>
            🌿 ◈ 🌿
          </span>
        </div>
      )}
    </>
  )
}
