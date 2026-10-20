import type { ReactNode } from 'react'
import type { DefinicionSticker } from './stickers'

/**
 * Stickers animados («GIFs») — Premium.
 * Son vectores con animación SVG propia (no archivos GIF): pesan muy poco, se ven nítidos a
 * cualquier tamaño y toman el color que elija el usuario (`currentColor`) junto a algunos tonos fijos.
 */

const inf = 'indefinite'

/** Escala que late alrededor de un punto */
function Latir({ cx, cy, de = 1, a = 1.12, dur = '1.1s', inicio = '0s', children }: { cx: number; cy: number; de?: number; a?: number; dur?: string; inicio?: string; children: ReactNode }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g>
        <animateTransform attributeName="transform" type="scale" values={`${de};${a};${de}`} dur={dur} begin={inicio} repeatCount={inf} />
        <g transform={`translate(${-cx} ${-cy})`}>{children}</g>
      </g>
    </g>
  )
}

/** Vaivén vertical (flotar) */
function Flotar({ dy = 4, dur = '2.4s', inicio = '0s', children }: { dy?: number; dur?: string; inicio?: string; children: ReactNode }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="translate" values={`0 0;0 ${-dy};0 0`} dur={dur} begin={inicio} repeatCount={inf} />
      {children}
    </g>
  )
}

/** Balanceo alrededor de un punto */
function Balancear({ cx, cy, grados = 8, dur = '2s', inicio = '0s', children }: { cx: number; cy: number; grados?: number; dur?: string; inicio?: string; children: ReactNode }) {
  return (
    <g>
      <animateTransform attributeName="transform" type="rotate" values={`${-grados} ${cx} ${cy};${grados} ${cx} ${cy};${-grados} ${cx} ${cy}`} dur={dur} begin={inicio} repeatCount={inf} />
      {children}
    </g>
  )
}

const puntosEstrella = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const radio = i % 2 === 0 ? r : r * 0.45
    const ang = (Math.PI / 5) * i - Math.PI / 2
    return `${Math.round((cx + radio * Math.cos(ang)) * 10) / 10},${Math.round((cy + radio * Math.sin(ang)) * 10) / 10}`
  }).join(' ')

const corazon = (cx: number, cy: number, s: number) =>
  `M${cx} ${cy + 0.42 * s} C${cx - 0.42 * s} ${cy + 0.12 * s} ${cx - 0.5 * s} ${cy - 0.1 * s} ${cx - 0.5 * s} ${cy - 0.22 * s} C${cx - 0.5 * s} ${cy - 0.4 * s} ${cx - 0.32 * s} ${cy - 0.5 * s} ${cx - 0.2 * s} ${cy - 0.5 * s} C${cx - 0.1 * s} ${cy - 0.5 * s} ${cx - 0.03 * s} ${cy - 0.44 * s} ${cx} ${cy - 0.36 * s} C${cx + 0.03 * s} ${cy - 0.44 * s} ${cx + 0.1 * s} ${cy - 0.5 * s} ${cx + 0.2 * s} ${cy - 0.5 * s} C${cx + 0.32 * s} ${cy - 0.5 * s} ${cx + 0.5 * s} ${cy - 0.4 * s} ${cx + 0.5 * s} ${cy - 0.22 * s} C${cx + 0.5 * s} ${cy - 0.1 * s} ${cx + 0.42 * s} ${cy + 0.12 * s} ${cx} ${cy + 0.42 * s}Z`

/** Destello de 4 puntas que aparece y desaparece */
function Destello({ x, y, r = 5, dur = '1.6s', inicio = '0s', color = '#FCD34D' }: { x: number; y: number; r?: number; dur?: string; inicio?: string; color?: string }) {
  return (
    <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`} fill={color} opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur={dur} begin={inicio} repeatCount={inf} />
    </path>
  )
}

const CONFETI = [
  [8, '#F59E0B', 0, 2.6], [20, 'currentColor', 0.6, 3], [32, '#EC4899', 1.2, 2.4], [44, '#10B981', 0.3, 2.9], [56, 'currentColor', 1.6, 2.7],
  [68, '#3B82F6', 0.9, 3.1], [80, '#F59E0B', 1.9, 2.5], [92, '#EC4899', 0.4, 2.8], [14, '#3B82F6', 2.1, 3.2], [38, '#F59E0B', 2.4, 2.6],
  [62, '#EC4899', 2.8, 3], [86, 'currentColor', 1.4, 2.7], [50, '#10B981', 3.1, 2.5], [26, '#EC4899', 3.4, 3.1],
] as const

export const STICKERS_ANIMADOS: DefinicionSticker[] = [
  {
    id: 'anim_globos',
    nombre: 'Globos flotando',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 120',
    proporcion: 1.2,
    contenido: (
      <g>
        {[
          [30, 40, 'currentColor', '2.6s', '0s'],
          [52, 30, '#F59E0B', '2.2s', '0.4s'],
          [72, 44, '#EC4899', '2.9s', '0.8s'],
        ].map(([cx, cy, c, dur, ini]) => (
          <Flotar key={String(cx)} dy={5} dur={dur as string} inicio={ini as string}>
            <path d={`M${cx} ${Number(cy) + 22} Q${Number(cx) - 4} ${Number(cy) + 45} ${Number(cx) + 2} ${Number(cy) + 70}`} fill="none" stroke="#94A3B8" strokeWidth="1.2" />
            <ellipse cx={cx as number} cy={cy as number} rx="15" ry="19" fill={c as string} />
            <path d={`M${Number(cx) - 3} ${Number(cy) + 18} L${cx} ${Number(cy) + 23} L${Number(cx) + 3} ${Number(cy) + 18}Z`} fill={c as string} />
            <ellipse cx={Number(cx) - 5} cy={Number(cy) - 7} rx="3.5" ry="6" fill="#fff" opacity="0.45" />
          </Flotar>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_corazon',
    nombre: 'Corazón latiendo',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <Latir cx={50} cy={50} a={1.14} dur="1s">
          <path d={corazon(50, 52, 84)} fill="currentColor" />
          <path d={corazon(50, 52, 84)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" transform="translate(50 52) scale(0.86) translate(-50 -52)" />
        </Latir>
        <Destello x={78} y={22} r={6} dur="1.4s" />
        <Destello x={20} y={30} r={4} dur="1.4s" inicio="0.7s" />
      </g>
    ),
  },
  {
    id: 'anim_confeti',
    nombre: 'Lluvia de confeti',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {CONFETI.map(([x, c, ini, dur], i) => (
          <rect key={i} x={x} y={-6} width={i % 3 === 0 ? 4 : 5} height={i % 3 === 0 ? 4 : 2.6} rx="0.8" fill={c} opacity="0">
            <animate attributeName="y" values="-6;104" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animateTransform attributeName="transform" type="rotate" values={`0 ${x} 50;${i % 2 ? 360 : -360} ${x} 50`} dur={`${Number(dur) * 0.8}s`} begin={`${ini}s`} repeatCount={inf} />
          </rect>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_fuegos',
    nombre: 'Fuegos artificiales',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {[
          [32, 34, 'currentColor', '0s'],
          [70, 28, '#F59E0B', '0.8s'],
          [56, 64, '#EC4899', '1.5s'],
        ].map(([cx, cy, c, ini]) => (
          <g key={String(cx)} transform={`translate(${cx} ${cy})`}>
            <g opacity="0">
              <animate attributeName="opacity" values="0;1;0" keyTimes="0;0.2;1" dur="2.2s" begin={ini as string} repeatCount={inf} />
              <animateTransform attributeName="transform" type="scale" values="0.2;1.1" dur="2.2s" begin={ini as string} repeatCount={inf} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (Math.PI * 2 * i) / 12
                return (
                  <g key={i}>
                    <line x1={Math.round(Math.cos(a) * 60) / 10} y1={Math.round(Math.sin(a) * 60) / 10} x2={Math.round(Math.cos(a) * 160) / 10} y2={Math.round(Math.sin(a) * 160) / 10} stroke={c as string} strokeWidth="2" strokeLinecap="round" />
                    <circle cx={Math.round(Math.cos(a) * 200) / 10} cy={Math.round(Math.sin(a) * 200) / 10} r="1.6" fill={c as string} />
                  </g>
                )
              })}
            </g>
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_brindis',
    nombre: 'Brindis',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g strokeLinejoin="round" strokeLinecap="round">
        <Balancear cx={34} cy={88} grados={7} dur="1.6s">
          <path d="M22 22 L44 22 L40 50 Q33 58 26 50 Z" fill="#FDE68A" stroke="currentColor" strokeWidth="2.2" />
          <path d="M24 34 L42 34 L40 50 Q33 58 26 50 Z" fill="#FBBF24" opacity="0.8" />
          <line x1="33" y1="56" x2="33" y2="86" stroke="currentColor" strokeWidth="2.2" />
          <line x1="24" y1="88" x2="42" y2="88" stroke="currentColor" strokeWidth="2.2" />
        </Balancear>
        <Balancear cx={66} cy={88} grados={7} dur="1.6s" inicio="0.8s">
          <path d="M56 22 L78 22 L74 50 Q67 58 60 50 Z" fill="#FDE68A" stroke="currentColor" strokeWidth="2.2" />
          <path d="M58 34 L76 34 L74 50 Q67 58 60 50 Z" fill="#FBBF24" opacity="0.8" />
          <line x1="67" y1="56" x2="67" y2="86" stroke="currentColor" strokeWidth="2.2" />
          <line x1="58" y1="88" x2="76" y2="88" stroke="currentColor" strokeWidth="2.2" />
        </Balancear>
        {[
          [50, 14, '0s'],
          [44, 8, '0.5s'],
          [57, 6, '1s'],
        ].map(([x, y, ini]) => (
          <circle key={String(ini)} cx={x as number} cy={y as number} r="1.8" fill="#FBBF24" opacity="0">
            <animate attributeName="cy" values={`${y};${Number(y) - 8}`} dur="1.5s" begin={ini as string} repeatCount={inf} />
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin={ini as string} repeatCount={inf} />
          </circle>
        ))}
        <Destello x={50} y={22} r={6} dur="1.6s" />
      </g>
    ),
  },
  {
    id: 'anim_estrellas',
    nombre: 'Estrellas titilando',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {[
          [50, 50, 22, '0s'],
          [20, 24, 9, '0.4s'],
          [80, 22, 11, '0.9s'],
          [22, 78, 8, '1.3s'],
          [82, 76, 10, '0.6s'],
        ].map(([x, y, r, ini]) => (
          <Latir key={String(ini)} cx={x as number} cy={y as number} de={0.75} a={1.1} dur="1.8s" inicio={ini as string}>
            <polygon points={puntosEstrella(x as number, y as number, r as number)} fill={r === 22 ? 'currentColor' : '#FCD34D'}>
              <animate attributeName="opacity" values="1;0.45;1" dur="1.8s" begin={ini as string} repeatCount={inf} />
            </polygon>
          </Latir>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_pastel',
    nombre: 'Pastel con velas',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g strokeLinejoin="round">
        <rect x="14" y="56" width="72" height="30" rx="5" fill="currentColor" />
        <rect x="22" y="40" width="56" height="20" rx="4" fill="#FBCFE8" />
        <path d="M22 46 Q29 52 36 46 Q43 52 50 46 Q57 52 64 46 Q71 52 78 46" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 64 Q22 70 30 64 Q38 70 46 64 Q54 70 62 64 Q70 70 78 64 Q82 67 86 64" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" />
        {[36, 50, 64].map((x, i) => (
          <g key={x}>
            <rect x={x - 2} y="24" width="4" height="16" rx="1.5" fill={['#60A5FA', '#F59E0B', '#34D399'][i]} />
            <ellipse cx={x} cy="18" rx="3.2" ry="5.5" fill="#F97316">
              <animate attributeName="ry" values="5.5;7;4.8;5.5" dur={`${0.7 + i * 0.15}s`} repeatCount={inf} />
              <animate attributeName="cx" values={`${x};${x + 0.8};${x - 0.6};${x}`} dur={`${0.9 + i * 0.1}s`} repeatCount={inf} />
            </ellipse>
            <ellipse cx={x} cy="19.5" rx="1.5" ry="2.6" fill="#FEF08A" />
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_regalo',
    nombre: 'Regalo saltando',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0;0 0" keyTimes="0;0.25;0.5;1" dur="1.4s" repeatCount={inf} />
          <rect x="22" y="46" width="56" height="42" rx="3" fill="currentColor" />
          <rect x="46" y="46" width="8" height="42" fill="#FCD34D" />
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0;0 0" keyTimes="0;0.3;0.55;1" dur="1.4s" repeatCount={inf} />
            <rect x="18" y="34" width="64" height="13" rx="3" fill="currentColor" />
            <rect x="46" y="34" width="8" height="13" fill="#FCD34D" />
            <path d="M50 34 Q36 18 30 26 Q28 34 50 34 Q72 34 70 26 Q64 18 50 34Z" fill="#FCD34D" />
          </g>
        </g>
        <Destello x={18} y={24} r={5} dur="1.4s" />
        <Destello x={84} y={30} r={4} dur="1.4s" inicio="0.7s" />
      </g>
    ),
  },
  {
    id: 'anim_anillos',
    nombre: 'Anillos con destello',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 90',
    proporcion: 0.9,
    contenido: (
      <g>
        <Balancear cx={50} cy={55} grados={4} dur="3s">
          <circle cx="38" cy="56" r="20" fill="none" stroke="currentColor" strokeWidth="5" />
          <circle cx="62" cy="56" r="20" fill="none" stroke="#FBBF24" strokeWidth="5" />
          <path d="M33 30 L38 22 L43 30 L38 36Z" fill="#E0F2FE" stroke="currentColor" strokeWidth="1.5" />
        </Balancear>
        <Destello x={38} y={18} r={7} dur="1.5s" color="#fff" />
        <Destello x={74} y={30} r={5} dur="1.5s" inicio="0.75s" />
        <Destello x={20} y={40} r={4} dur="1.5s" inicio="0.4s" />
      </g>
    ),
  },
  {
    id: 'anim_birrete',
    nombre: 'Birrete al aire',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 8;0 -8;0 8" dur="2s" repeatCount={inf} />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="-10 50 50;10 50 50;-10 50 50" dur="2s" repeatCount={inf} />
            <path d="M50 30 L90 46 L50 62 L10 46Z" fill="currentColor" />
            <path d="M28 54 L28 68 Q50 80 72 68 L72 54 L50 62Z" fill="currentColor" opacity="0.85" />
            <path d="M80 50 L80 70" stroke="#FBBF24" strokeWidth="2.5" />
            <circle cx="80" cy="72" r="3.5" fill="#FBBF24" />
          </g>
        </g>
        <Destello x={16} y={20} r={5} dur="2s" />
        <Destello x={86} y={18} r={4} dur="2s" inicio="1s" />
      </g>
    ),
  },
  {
    id: 'anim_mariposa',
    nombre: 'Mariposa',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 90',
    proporcion: 0.9,
    contenido: (
      <Flotar dy={5} dur="3s">
        <g transform="translate(50 0)">
          <g>
            <animateTransform attributeName="transform" type="scale" values="1 1;0.25 1;1 1" dur="0.5s" repeatCount={inf} />
            <path d="M0 40 Q-30 5 -40 24 Q-46 42 0 46Z" fill="currentColor" />
            <path d="M0 46 Q-34 52 -28 72 Q-18 82 0 52Z" fill="currentColor" opacity="0.8" />
            <path d="M0 40 Q30 5 40 24 Q46 42 0 46Z" fill="currentColor" />
            <path d="M0 46 Q34 52 28 72 Q18 82 0 52Z" fill="currentColor" opacity="0.8" />
            <circle cx="-22" cy="28" r="4" fill="#fff" opacity="0.6" />
            <circle cx="22" cy="28" r="4" fill="#fff" opacity="0.6" />
          </g>
          <ellipse cx="0" cy="48" rx="2.6" ry="14" fill="#334155" />
          <path d="M-1 35 Q-6 24 -10 22 M1 35 Q6 24 10 22" fill="none" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </Flotar>
    ),
  },
  {
    id: 'anim_burbujas',
    nombre: 'Burbujas',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {[
          [20, 8, 0, 3.2], [40, 5, 0.8, 2.6], [58, 10, 1.6, 3.6], [76, 6, 0.4, 2.9], [32, 4, 2.2, 2.4], [86, 9, 1.2, 3.3], [10, 5, 2.8, 2.8],
        ].map(([x, r, ini, dur], i) => (
          <circle key={i} cx={x} cy="104" r={r} fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3" opacity="0">
            <animate attributeName="cy" values="104;-6" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animate attributeName="cx" values={`${x};${x + 5};${x - 4};${x}`} dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.8;1" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
          </circle>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_luna',
    nombre: 'Luna dormida',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <Balancear cx={45} cy={55} grados={5} dur="4s">
          <path d="M60 18 A34 34 0 1 0 74 74 A28 28 0 1 1 60 18Z" fill="currentColor" />
          <path d="M32 54 Q36 58 40 54" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </Balancear>
        {[
          [70, 34, 8, '0s'],
          [80, 22, 10, '0.8s'],
          [90, 10, 12, '1.6s'],
        ].map(([x, y, t, ini]) => (
          <text key={String(ini)} x={x as number} y={y as number} fontSize={t as number} fontWeight="700" fontFamily="sans-serif" fill="#94A3B8" opacity="0">
            z
            <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin={ini as string} repeatCount={inf} />
          </text>
        ))}
        <Destello x={16} y={18} r={4} dur="2s" />
        <Destello x={88} y={70} r={4} dur="2s" inicio="1s" />
      </g>
    ),
  },
  {
    id: 'anim_corazones',
    nombre: 'Corazones que suben',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        {[
          [22, 0, 3, 16, 'currentColor'], [50, 0.9, 2.6, 22, '#F472B6'], [76, 1.8, 3.2, 14, 'currentColor'], [36, 2.4, 2.8, 12, '#FB7185'], [64, 0.4, 3.4, 12, '#F472B6'],
        ].map(([x, ini, dur, s, c], i) => (
          <path key={i} d={corazon(x as number, 0, s as number)} fill={c as string} opacity="0">
            <animateTransform attributeName="transform" type="translate" values="0 106;0 -4" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.75;1" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
          </path>
        ))}
      </g>
    ),
  },
]
