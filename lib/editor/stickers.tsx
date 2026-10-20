import type { CSSProperties, ReactNode } from 'react'
import { STICKERS_ANIMADOS } from './stickers-animados'

/**
 * Biblioteca de stickers y ornamentos vectoriales.
 * Todos usan `currentColor`, así toman el color que elija el usuario (o el acento del tema).
 * `proporcion` = alto / ancho del viewBox, para crear el elemento con su forma natural.
 */
export interface DefinicionSticker {
  id: string
  nombre: string
  categoria: CategoriaSticker
  viewBox: string
  proporcion: number
  contenido: ReactNode
  animado?: boolean // Sticker animado («GIF»): función Premium
}

export type CategoriaSticker =
  | 'Florales'
  | 'Ornamentos'
  | 'Boda & Amor'
  | 'Celebración'
  | 'Bebé & Niños'
  | 'Grados & Logros'
  | 'Animados'

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const HOJAS_OLIVO = [
  [16, 26, -35],
  [26, 20, 30],
  [36, 17, -30],
  [46, 14, 25],
  [56, 14, -25],
  [66, 16, 30],
  [76, 19, -30],
  [86, 24, 35],
]

const STICKERS_FIJOS: DefinicionSticker[] = [
  // ─────────── Florales ───────────
  {
    id: 'rama_olivo',
    nombre: 'Rama de olivo',
    categoria: 'Florales',
    viewBox: '0 0 100 40',
    proporcion: 0.4,
    contenido: (
      <g>
        <path d="M4 30 Q50 4 96 30" {...trazo} />
        {HOJAS_OLIVO.map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y + (i % 2 === 0 ? -5 : 5)}
            rx="6.5"
            ry="2.6"
            transform={`rotate(${r} ${x} ${y + (i % 2 === 0 ? -5 : 5)})`}
            fill="currentColor"
            opacity="0.85"
          />
        ))}
      </g>
    ),
  },
  {
    id: 'corona_laurel',
    nombre: 'Corona de laurel',
    categoria: 'Florales',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <path d="M44 90 C14 80 6 50 18 22" {...trazo} />
        <path d="M56 90 C86 80 94 50 82 22" {...trazo} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = i / 6
          const angulo = 200 + t * 110
          const rad = (angulo * Math.PI) / 180
          const cx = 50 + Math.cos(rad) * 38
          const cy = 55 - Math.sin(rad) * 38
          return (
            <g key={i}>
              <ellipse cx={cx} cy={cy} rx="7" ry="3" transform={`rotate(${-angulo + 50} ${cx} ${cy})`} fill="currentColor" />
              <ellipse cx={100 - cx} cy={cy} rx="7" ry="3" transform={`rotate(${angulo - 50} ${100 - cx} ${cy})`} fill="currentColor" />
            </g>
          )
        })}
      </g>
    ),
  },
  {
    id: 'flor_cinco',
    nombre: 'Flor delicada',
    categoria: 'Florales',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="50" cy="28" rx="13" ry="22" transform={`rotate(${r} 50 50)`} fill="currentColor" opacity="0.55" />
        ))}
        <circle cx="50" cy="50" r="9" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    categoria: 'Florales',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo} strokeWidth={2.6}>
        <path d="M50 50 m-6 0 a6 6 0 1 1 12 0 a10 10 0 1 1 -20 0 a16 16 0 1 1 32 0 a22 22 0 1 1 -44 0" />
        <path d="M30 70 C38 80 62 80 70 70" />
        <path d="M50 76 L50 96" />
        <path d="M50 88 C40 82 34 86 30 92 C40 94 46 92 50 88" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'hoja',
    nombre: 'Hoja',
    categoria: 'Florales',
    viewBox: '0 0 60 100',
    proporcion: 1.66,
    contenido: (
      <g>
        <path d="M30 4 C54 30 54 70 30 96 C6 70 6 30 30 4 Z" fill="currentColor" opacity="0.8" />
        <path d="M30 14 L30 92 M30 40 L42 30 M30 40 L18 30 M30 60 L44 48 M30 60 L16 48" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  },
  {
    id: 'eucalipto',
    nombre: 'Eucalipto',
    categoria: 'Florales',
    viewBox: '0 0 50 100',
    proporcion: 2,
    contenido: (
      <g>
        <path d="M25 98 C22 70 28 40 25 4" {...trazo} />
        {[12, 26, 40, 54, 68, 82].map((y, i) => (
          <circle key={y} cx={i % 2 === 0 ? 14 : 36} cy={y} r={8 - i * 0.6} fill="currentColor" opacity="0.7" />
        ))}
      </g>
    ),
  },
  {
    id: 'esquina_floral',
    nombre: 'Esquina floral',
    categoria: 'Florales',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <path d="M4 96 C10 50 50 10 96 4" {...trazo} />
        <path d="M22 60 C30 52 34 44 34 34" {...trazo} />
        <path d="M60 22 C52 30 44 34 34 34" {...trazo} />
        {[
          [14, 74, 40],
          [30, 48, 20],
          [48, 30, -10],
          [74, 14, -40],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="9" ry="3.6" transform={`rotate(${r} ${x} ${y})`} fill="currentColor" />
        ))}
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="34" cy="26" rx="4" ry="8" transform={`rotate(${r} 34 34)`} fill="currentColor" opacity="0.6" />
        ))}
        <circle cx="34" cy="34" r="3.5" fill="currentColor" />
      </g>
    ),
  },

  // ─────────── Ornamentos ───────────
  {
    id: 'filigrana',
    nombre: 'Filigrana divisoria',
    categoria: 'Ornamentos',
    viewBox: '0 0 200 30',
    proporcion: 0.15,
    contenido: (
      <g {...trazo} strokeWidth={1.8}>
        <path d="M4 15 L70 15" />
        <path d="M130 15 L196 15" />
        <path d="M70 15 C78 4 92 4 92 15 C92 22 84 22 84 15" />
        <path d="M130 15 C122 4 108 4 108 15 C108 22 116 22 116 15" />
        <path d="M92 15 L100 7 L108 15 L100 23 Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'esquinero_vintage',
    nombre: 'Esquinero vintage',
    categoria: 'Ornamentos',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo} strokeWidth={2}>
        <path d="M6 94 L6 6 L94 6" />
        <path d="M14 94 L14 14 L94 14" opacity="0.6" />
        <path d="M14 40 C30 40 40 30 40 14" />
        <path d="M24 24 C30 18 36 22 32 28 C28 34 22 30 24 24 Z" fill="currentColor" />
        <circle cx="6" cy="6" r="4" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'marco_ovalado',
    nombre: 'Marco ovalado',
    categoria: 'Ornamentos',
    viewBox: '0 0 80 100',
    proporcion: 1.25,
    contenido: (
      <g {...trazo}>
        <ellipse cx="40" cy="50" rx="36" ry="46" />
        <ellipse cx="40" cy="50" rx="31" ry="41" strokeWidth={1.2} strokeDasharray="2 3" />
        <path d="M34 4 L40 -1 L46 4" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'marco_circular',
    nombre: 'Marco circular',
    categoria: 'Ornamentos',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo}>
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="40" strokeWidth={1} />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2
          return <circle key={i} cx={50 + Math.cos(a) * 42.5} cy={50 + Math.sin(a) * 42.5} r="0.9" fill="currentColor" stroke="none" />
        })}
      </g>
    ),
  },
  {
    id: 'separador_corazon',
    nombre: 'Separador con corazón',
    categoria: 'Ornamentos',
    viewBox: '0 0 200 30',
    proporcion: 0.15,
    contenido: (
      <g>
        <path d="M4 15 L82 15 M118 15 L196 15" {...trazo} strokeWidth={1.6} />
        <path d="M100 26 C88 18 84 13 84 9 C84 5 87 3 90.5 3 C94 3 97 5 100 9 C103 5 106 3 109.5 3 C113 3 116 5 116 9 C116 13 112 18 100 26 Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'rombos',
    nombre: 'Rombos',
    categoria: 'Ornamentos',
    viewBox: '0 0 200 30',
    proporcion: 0.15,
    contenido: (
      <g fill="currentColor">
        <path d="M4 15 L84 15" stroke="currentColor" strokeWidth="1.2" />
        <path d="M116 15 L196 15" stroke="currentColor" strokeWidth="1.2" />
        <path d="M100 4 L108 15 L100 26 L92 15 Z" />
        <path d="M88 11 L92 15 L88 19 L84 15 Z" opacity="0.6" />
        <path d="M112 11 L116 15 L112 19 L108 15 Z" opacity="0.6" />
      </g>
    ),
  },
  {
    id: 'remolino',
    nombre: 'Remolino',
    categoria: 'Ornamentos',
    viewBox: '0 0 100 50',
    proporcion: 0.5,
    contenido: (
      <g {...trazo}>
        <path d="M6 40 C20 40 26 10 46 10 C60 10 62 28 50 28 C42 28 42 18 50 18" />
        <path d="M94 40 C80 40 74 10 54 10" opacity="0.6" />
      </g>
    ),
  },
  {
    id: 'arco_decorativo',
    nombre: 'Arco',
    categoria: 'Ornamentos',
    viewBox: '0 0 100 120',
    proporcion: 1.2,
    contenido: (
      <g {...trazo}>
        <path d="M8 116 L8 50 A42 42 0 0 1 92 50 L92 116" />
        <path d="M16 116 L16 50 A34 34 0 0 1 84 50 L84 116" strokeWidth={1.2} />
      </g>
    ),
  },

  // ─────────── Boda & Amor ───────────
  {
    id: 'anillos',
    nombre: 'Anillos',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 80',
    proporcion: 0.8,
    contenido: (
      <g>
        <circle cx="38" cy="50" r="24" {...trazo} strokeWidth={4} />
        <circle cx="62" cy="50" r="24" {...trazo} strokeWidth={4} />
        <path d="M30 26 L38 14 L46 26 L38 30 Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'corazon',
    nombre: 'Corazón',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 90',
    proporcion: 0.9,
    contenido: (
      <path d="M50 88 C20 65 5 48 5 30 C5 16 16 6 29 6 C38 6 45 11 50 19 C55 11 62 6 71 6 C84 6 95 16 95 30 C95 48 80 65 50 88 Z" fill="currentColor" />
    ),
  },
  {
    id: 'corazon_lineal',
    nombre: 'Corazón lineal',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 90',
    proporcion: 0.9,
    contenido: (
      <path d="M50 84 C22 63 8 47 8 31 C8 18 18 9 30 9 C38 9 45 13 50 21 C55 13 62 9 70 9 C82 9 92 18 92 31 C92 47 78 63 50 84 Z" {...trazo} strokeWidth={3} />
    ),
  },
  {
    id: 'dos_corazones',
    nombre: 'Dos corazones',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 70',
    proporcion: 0.7,
    contenido: (
      <g>
        <path d="M36 62 C16 47 6 36 6 24 C6 14 13 8 22 8 C28 8 33 11 36 17 C39 11 44 8 50 8 C59 8 66 14 66 24 C66 36 56 47 36 62 Z" fill="currentColor" opacity="0.55" />
        <path d="M64 66 C44 51 34 40 34 28 C34 18 41 12 50 12 C56 12 61 15 64 21 C67 15 72 12 78 12 C87 12 94 18 94 28 C94 40 84 51 64 66 Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'copas',
    nombre: 'Brindis',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo}>
        <path d="M22 18 L42 14 L44 40 C44 50 36 56 30 54 C24 52 20 44 22 18 Z" transform="rotate(-12 32 40)" />
        <path d="M33 56 L36 84 M26 86 L44 82" transform="rotate(-12 32 40)" />
        <path d="M58 14 L78 18 C80 44 76 52 70 54 C64 56 56 50 56 40 Z" transform="rotate(12 68 40)" />
        <path d="M67 56 L64 84 M56 82 L74 86" transform="rotate(12 68 40)" />
        <path d="M46 8 L50 2 M54 8 L58 4 M42 6 L40 1" />
      </g>
    ),
  },
  {
    id: 'mono_lazo',
    nombre: 'Moño',
    categoria: 'Boda & Amor',
    viewBox: '0 0 100 60',
    proporcion: 0.6,
    contenido: (
      <g fill="currentColor">
        <path d="M50 30 C36 12 14 6 10 16 C6 26 30 36 50 30 Z" />
        <path d="M50 30 C64 12 86 6 90 16 C94 26 70 36 50 30 Z" />
        <path d="M46 32 L32 56 L40 54 L48 34 Z M54 32 L68 56 L60 54 L52 34 Z" opacity="0.8" />
        <circle cx="50" cy="30" r="6" />
      </g>
    ),
  },

  // ─────────── Celebración ───────────
  {
    id: 'globos',
    nombre: 'Globos',
    categoria: 'Celebración',
    viewBox: '0 0 100 120',
    proporcion: 1.2,
    contenido: (
      <g>
        <ellipse cx="32" cy="34" rx="18" ry="22" fill="currentColor" opacity="0.6" />
        <ellipse cx="66" cy="28" rx="18" ry="22" fill="currentColor" />
        <ellipse cx="50" cy="52" rx="16" ry="20" fill="currentColor" opacity="0.8" />
        <path d="M32 56 C36 80 44 96 50 116 M66 50 C62 76 54 96 50 116 M50 72 L50 116" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </g>
    ),
  },
  {
    id: 'confeti',
    nombre: 'Confeti',
    categoria: 'Celebración',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        <rect x="10" y="12" width="8" height="4" transform="rotate(30 14 14)" />
        <rect x="70" y="8" width="8" height="4" transform="rotate(-20 74 10)" opacity="0.7" />
        <circle cx="44" cy="20" r="3" opacity="0.6" />
        <rect x="84" y="44" width="8" height="4" transform="rotate(60 88 46)" />
        <circle cx="22" cy="54" r="3.5" opacity="0.8" />
        <rect x="52" y="52" width="8" height="4" transform="rotate(-40 56 54)" opacity="0.6" />
        <path d="M30 80 L36 72 L40 82 Z" />
        <circle cx="76" cy="80" r="3" />
        <rect x="8" y="88" width="8" height="4" transform="rotate(10 12 90)" opacity="0.7" />
        <path d="M60 30 q4 -6 8 0 t8 0" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M40 66 q4 -6 8 0 t8 0" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      </g>
    ),
  },
  {
    id: 'estrella',
    nombre: 'Estrella',
    categoria: 'Celebración',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: <path d="M50 4 L61 37 L96 37 L68 58 L78 92 L50 72 L22 92 L32 58 L4 37 L39 37 Z" fill="currentColor" />,
  },
  {
    id: 'destellos',
    nombre: 'Destellos',
    categoria: 'Celebración',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        <path d="M40 10 C42 34 46 38 70 40 C46 42 42 46 40 70 C38 46 34 42 10 40 C34 38 38 34 40 10 Z" />
        <path d="M78 56 C79 68 81 70 92 71 C81 72 79 74 78 86 C77 74 75 72 64 71 C75 70 77 68 78 56 Z" opacity="0.7" />
        <path d="M76 8 C77 15 78 16 85 17 C78 18 77 19 76 26 C75 19 74 18 67 17 C74 16 75 15 76 8 Z" opacity="0.5" />
      </g>
    ),
  },
  {
    id: 'regalo',
    nombre: 'Regalo',
    categoria: 'Celebración',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo} strokeWidth={2.6}>
        <rect x="14" y="40" width="72" height="52" rx="3" />
        <rect x="8" y="28" width="84" height="14" rx="3" />
        <path d="M50 28 L50 92" />
        <path d="M50 28 C40 10 22 14 28 24 C32 30 44 28 50 28 C56 28 68 30 72 24 C78 14 60 10 50 28" />
      </g>
    ),
  },
  {
    id: 'torta',
    nombre: 'Torta',
    categoria: 'Celebración',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo} strokeWidth={2.4}>
        <rect x="14" y="62" width="72" height="30" rx="4" />
        <rect x="24" y="40" width="52" height="22" rx="4" />
        <path d="M14 72 C24 78 30 66 40 72 C50 78 56 66 66 72 C76 78 80 68 86 72" />
        <path d="M50 40 L50 24" />
        <path d="M50 22 C46 16 50 10 50 8 C50 10 54 16 50 22 Z" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'banderines',
    nombre: 'Banderines',
    categoria: 'Celebración',
    viewBox: '0 0 200 60',
    proporcion: 0.3,
    contenido: (
      <g>
        <path d="M2 6 Q100 34 198 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {[18, 46, 74, 102, 130, 158, 186].map((x, i) => {
          const y = 6 + Math.sin((x / 200) * Math.PI) * 14
          return <path key={x} d={`M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 24} Z`} fill="currentColor" opacity={i % 2 ? 0.55 : 1} />
        })}
      </g>
    ),
  },
  {
    id: 'corona',
    nombre: 'Corona',
    categoria: 'Celebración',
    viewBox: '0 0 100 70',
    proporcion: 0.7,
    contenido: (
      <g fill="currentColor">
        <path d="M8 22 L28 40 L50 8 L72 40 L92 22 L84 60 L16 60 Z" />
        <rect x="16" y="62" width="68" height="6" rx="2" />
        <circle cx="8" cy="20" r="5" />
        <circle cx="50" cy="6" r="5" />
        <circle cx="92" cy="20" r="5" />
      </g>
    ),
  },

  // ─────────── Bebé & Niños ───────────
  {
    id: 'luna_estrellas',
    nombre: 'Luna y estrellas',
    categoria: 'Bebé & Niños',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        <path d="M60 14 C38 18 26 40 32 62 C38 82 60 92 80 84 C58 80 46 60 50 40 C52 28 56 20 60 14 Z" />
        <path d="M78 22 L80 28 L86 30 L80 32 L78 38 L76 32 L70 30 L76 28 Z" opacity="0.7" />
        <path d="M20 20 L21.5 24 L25.5 25.5 L21.5 27 L20 31 L18.5 27 L14.5 25.5 L18.5 24 Z" opacity="0.6" />
      </g>
    ),
  },
  {
    id: 'nube',
    nombre: 'Nube',
    categoria: 'Bebé & Niños',
    viewBox: '0 0 100 60',
    proporcion: 0.6,
    contenido: (
      <path d="M22 52 C10 52 4 44 6 36 C8 28 16 24 24 26 C26 14 38 6 50 8 C62 10 68 18 70 26 C80 22 92 28 94 38 C96 48 88 54 78 52 Z" fill="currentColor" />
    ),
  },
  {
    id: 'osito',
    nombre: 'Osito',
    categoria: 'Bebé & Niños',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        <circle cx="24" cy="24" r="14" />
        <circle cx="76" cy="24" r="14" />
        <circle cx="50" cy="54" r="38" />
        <ellipse cx="50" cy="66" rx="16" ry="12" fill="#fff" opacity="0.85" />
        <circle cx="36" cy="46" r="4.5" fill="#fff" />
        <circle cx="64" cy="46" r="4.5" fill="#fff" />
        <ellipse cx="50" cy="61" rx="5" ry="3.5" />
      </g>
    ),
  },
  {
    id: 'sonajero',
    nombre: 'Sonajero',
    categoria: 'Bebé & Niños',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g {...trazo} strokeWidth={3}>
        <circle cx="36" cy="36" r="24" />
        <path d="M24 30 L48 30 M24 42 L48 42" strokeWidth={1.5} />
        <path d="M53 53 L84 84" strokeWidth={6} />
        <circle cx="88" cy="88" r="6" fill="currentColor" />
      </g>
    ),
  },

  // ─────────── Grados & Logros ───────────
  {
    id: 'birrete',
    nombre: 'Birrete',
    categoria: 'Grados & Logros',
    viewBox: '0 0 100 80',
    proporcion: 0.8,
    contenido: (
      <g fill="currentColor">
        <path d="M50 6 L96 26 L50 46 L4 26 Z" />
        <path d="M24 36 L24 56 C24 66 76 66 76 56 L76 36 L50 48 Z" opacity="0.85" />
        <path d="M88 30 L88 58" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="88" cy="62" r="4.5" />
      </g>
    ),
  },
  {
    id: 'diploma',
    nombre: 'Diploma',
    categoria: 'Grados & Logros',
    viewBox: '0 0 100 70',
    proporcion: 0.7,
    contenido: (
      <g>
        <rect x="8" y="20" width="84" height="30" rx="15" {...trazo} strokeWidth={3} />
        <path d="M22 26 L22 44" {...trazo} />
        <path d="M44 50 L40 68 L50 62 L60 68 L56 50" fill="currentColor" />
        <circle cx="50" cy="44" r="9" fill="currentColor" />
      </g>
    ),
  },
  {
    id: 'trofeo',
    nombre: 'Trofeo',
    categoria: 'Grados & Logros',
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        <path d="M28 8 L72 8 L72 34 C72 48 62 58 50 58 C38 58 28 48 28 34 Z" />
        <path d="M28 16 C12 16 12 40 30 42 M72 16 C88 16 88 40 70 42" fill="none" stroke="currentColor" strokeWidth="4" />
        <rect x="44" y="58" width="12" height="16" />
        <rect x="30" y="74" width="40" height="8" rx="2" />
        <rect x="24" y="84" width="52" height="10" rx="2" />
      </g>
    ),
  },
  {
    id: 'medalla',
    nombre: 'Medalla',
    categoria: 'Grados & Logros',
    viewBox: '0 0 80 100',
    proporcion: 1.25,
    contenido: (
      <g fill="currentColor">
        <path d="M20 4 L36 40 L28 44 L8 8 Z M60 4 L44 40 L52 44 L72 8 Z" opacity="0.7" />
        <circle cx="40" cy="66" r="28" />
        <path d="M40 50 L45 61 L57 61 L47 68 L51 80 L40 72 L29 80 L33 68 L23 61 L35 61 Z" fill="#fff" opacity="0.9" />
      </g>
    ),
  },
]

export const CATALOGO_STICKERS: DefinicionSticker[] = [...STICKERS_ANIMADOS, ...STICKERS_FIJOS]

export const CATEGORIAS_STICKERS: CategoriaSticker[] = [
  'Animados',
  'Florales',
  'Ornamentos',
  'Boda & Amor',
  'Celebración',
  'Bebé & Niños',
  'Grados & Logros',
]

export function obtenerSticker(id?: string): DefinicionSticker | undefined {
  return CATALOGO_STICKERS.find((s) => s.id === id)
}

export function StickerSvg({ id, className, style }: { id?: string; className?: string; style?: CSSProperties }) {
  const sticker = obtenerSticker(id)
  if (!sticker) return null
  return (
    <svg
      viewBox={sticker.viewBox}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', ...style }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {sticker.contenido}
    </svg>
  )
}
