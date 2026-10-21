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

const puntosPentagono = (cx: number, cy: number, r: number) =>
  Array.from({ length: 5 }, (_, i) => {
    const ang = ((Math.PI * 2) / 5) * i - Math.PI / 2
    return `${Math.round((cx + r * Math.cos(ang)) * 10) / 10},${Math.round((cy + r * Math.sin(ang)) * 10) / 10}`
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
  {
    id: 'anim_cohete',
    nombre: 'Cohete',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 120',
    proporcion: 1.2,
    contenido: (
      <g>
        <Flotar dy={6} dur="1.6s">
          <path d="M50 8 Q70 28 68 66 L32 66 Q30 28 50 8Z" fill="currentColor" />
          <circle cx="50" cy="38" r="8" fill="#E0F2FE" stroke="#fff" strokeWidth="2" />
          <path d="M32 52 L18 72 L32 68Z M68 52 L82 72 L68 68Z" fill="#F43F5E" />
          <path d="M40 66 L60 66 L56 74 L44 74Z" fill="#94A3B8" />
          <path d="M44 74 Q50 104 56 74Z" fill="#F97316">
            <animate attributeName="d" values="M44 74 Q50 104 56 74Z;M44 74 Q50 92 56 74Z;M44 74 Q50 108 56 74Z;M44 74 Q50 104 56 74Z" dur="0.5s" repeatCount={inf} />
          </path>
          <path d="M47 74 Q50 92 53 74Z" fill="#FDE047" />
        </Flotar>
        <Destello x={16} y={20} r={5} dur="1.4s" color="#fff" />
        <Destello x={86} y={34} r={4} dur="1.4s" inicio="0.7s" color="#FDE68A" />
      </g>
    ),
  },
  {
    id: 'anim_balon',
    nombre: 'Balón rebotando',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <g>
        <ellipse cx="50" cy="104" rx="20" ry="4" fill="#000" opacity="0.15">
          <animate attributeName="rx" values="22;12;22" keyTimes="0;0.5;1" dur="1s" repeatCount={inf} />
        </ellipse>
        <g>
          <animateTransform attributeName="transform" type="translate" values="0 0;0 -40;0 0" keyTimes="0;0.5;1" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" calcMode="spline" dur="1s" repeatCount={inf} />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 50 76;360 50 76" dur="2s" repeatCount={inf} />
            <circle cx="50" cy="76" r="24" fill="#fff" stroke="#1F2937" strokeWidth="2.5" />
            <polygon points={puntosPentagono(50, 76, 8)} fill="#1F2937" />
            {[0, 72, 144, 216, 288].map((a) => (
              <g key={a} transform={`rotate(${a} 50 76)`}>
                <line x1="50" y1="68" x2="50" y2="56" stroke="#1F2937" strokeWidth="2" />
                <path d="M44 54 L50 52 L56 54 L54 58 L46 58Z" fill="#1F2937" />
              </g>
            ))}
          </g>
        </g>
      </g>
    ),
  },
  {
    id: 'anim_corona',
    nombre: 'Corona brillante',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 80',
    proporcion: 0.8,
    contenido: (
      <g>
        <Balancear cx={50} cy={70} grados={4} dur="3s">
          <path d="M14 66 L10 24 L32 44 L50 14 L68 44 L90 24 L86 66Z" fill="currentColor" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="14" y="60" width="72" height="10" rx="3" fill="currentColor" />
          {[
            [10, 24, '#F472B6'],
            [50, 14, '#60A5FA'],
            [90, 24, '#34D399'],
          ].map(([x, y, c]) => (
            <circle key={String(x)} cx={x as number} cy={y as number} r="5" fill={c as string} stroke="#fff" strokeWidth="1.5" />
          ))}
          <circle cx="32" cy="58" r="3.5" fill="#fff" opacity="0.8" />
          <circle cx="50" cy="56" r="4.5" fill="#F43F5E" />
          <circle cx="68" cy="58" r="3.5" fill="#fff" opacity="0.8" />
        </Balancear>
        <Destello x={24} y={10} r={6} dur="1.5s" color="#fff" />
        <Destello x={78} y={8} r={5} dur="1.5s" inicio="0.75s" />
        <Destello x={56} y={34} r={3.5} dur="1.2s" inicio="0.3s" color="#fff" />
      </g>
    ),
  },
  {
    id: 'anim_arcoiris',
    nombre: 'Arcoíris',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 70',
    proporcion: 0.7,
    contenido: (
      <g fill="none" strokeLinecap="round">
        {['#F43F5E', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'].map((c, i) => (
          <path key={c} d={`M${12 + i * 5} 58 A${38 - i * 5} ${38 - i * 5} 0 0 1 ${88 - i * 5} 58`} stroke={c} strokeWidth="5" strokeDasharray="130" strokeDashoffset="130">
            <animate attributeName="stroke-dashoffset" values="130;0;0;130" keyTimes="0;0.35;0.85;1" dur="4s" begin={`${i * 0.12}s`} repeatCount={inf} />
          </path>
        ))}
        <g fill="#fff" stroke="#E2E8F0" strokeWidth="1.5">
          <Flotar dy={2} dur="2s">
            <circle cx="14" cy="58" r="8" />
            <circle cx="24" cy="60" r="7" />
            <circle cx="80" cy="60" r="7" />
            <circle cx="88" cy="58" r="8" />
          </Flotar>
        </g>
      </g>
    ),
  },
  {
    id: 'anim_notas',
    nombre: 'Notas musicales',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g fill="currentColor">
        {[
          [20, 0, 2.6],
          [52, 0.9, 3],
          [76, 1.7, 2.4],
        ].map(([x, ini, dur], i) => (
          <g key={i} opacity="0">
            <animateTransform attributeName="transform" type="translate" values="0 30;0 -20" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.7;1" dur={`${dur}s`} begin={`${ini}s`} repeatCount={inf} />
            {i % 2 === 0 ? (
              <>
                <ellipse cx={x} cy="70" rx="7" ry="5.5" transform={`rotate(-20 ${x} 70)`} />
                <rect x={x + 5} y="36" width="2.6" height="34" />
                <path d={`M${x + 7.6} 36 Q${x + 18} 40 ${x + 14} 52 Q${x + 14} 44 ${x + 7.6} 44Z`} />
              </>
            ) : (
              <>
                <ellipse cx={x} cy="72" rx="6.5" ry="5" transform={`rotate(-20 ${x} 72)`} />
                <ellipse cx={x + 18} cy="66" rx="6.5" ry="5" transform={`rotate(-20 ${x + 18} 66)`} />
                <rect x={x + 4.6} y="40" width="2.4" height="32" />
                <rect x={x + 22.6} y="34" width="2.4" height="32" />
                <path d={`M${x + 4.6} 40 L${x + 25} 34 L${x + 25} 40 L${x + 4.6} 46Z`} />
              </>
            )}
          </g>
        ))}
      </g>
    ),
  },
  {
    id: 'anim_bola_disco',
    nombre: 'Bola disco',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <g>
        <line x1="50" y1="0" x2="50" y2="22" stroke="#94A3B8" strokeWidth="2" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-6 50 0;6 50 0;-6 50 0" dur="3s" repeatCount={inf} />
          <circle cx="50" cy="58" r="34" fill="#CBD5E1" />
          {Array.from({ length: 7 }, (_, fila) =>
            Array.from({ length: 7 }, (_, col) => {
              const x = 22 + col * 9.4
              const y = 30 + fila * 9.4
              if ((x + 4 - 50) ** 2 + (y + 4 - 58) ** 2 > 31 ** 2) return null
              return (
                <rect key={`${fila}-${col}`} x={x} y={y} width="8" height="8" rx="1" fill={(fila + col) % 3 === 0 ? '#F8FAFC' : (fila + col) % 3 === 1 ? '#94A3B8' : 'currentColor'}>
                  <animate attributeName="opacity" values="1;0.35;1" dur={`${1.2 + ((fila * 7 + col) % 5) * 0.3}s`} repeatCount={inf} />
                </rect>
              )
            })
          )}
        </g>
        <Destello x={18} y={40} r={6} dur="1.3s" color="#fff" />
        <Destello x={84} y={74} r={5} dur="1.3s" inicio="0.6s" color="#F0ABFC" />
        <Destello x={80} y={28} r={4} dur="1.1s" inicio="0.3s" color="#67E8F9" />
      </g>
    ),
  },
  {
    id: 'anim_palmera',
    nombre: 'Palmera al viento',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <g>
        <circle cx="78" cy="22" r="12" fill="#FBBF24" opacity="0.9">
          <animate attributeName="r" values="12;13.5;12" dur="3s" repeatCount={inf} />
        </circle>
        <path d="M46 104 Q44 70 52 40" fill="none" stroke="#92400E" strokeWidth="6" strokeLinecap="round" />
        <Balancear cx={52} cy={40} grados={7} dur="2.6s">
          {[
            'M52 40 Q30 24 10 34 Q30 30 52 42Z',
            'M52 40 Q38 14 18 12 Q36 22 52 42Z',
            'M52 40 Q62 12 82 10 Q66 24 52 42Z',
            'M52 40 Q76 28 94 40 Q72 34 52 42Z',
            'M52 40 Q58 20 54 4 Q62 22 52 42Z',
          ].map((d) => (
            <path key={d} d={d} fill="currentColor" />
          ))}
          <circle cx="50" cy="44" r="3.5" fill="#78350F" />
          <circle cx="56" cy="45" r="3.5" fill="#78350F" />
        </Balancear>
        <path d="M0 106 Q25 98 50 106 T100 106 V110 H0Z" fill="#FDE68A" />
      </g>
    ),
  },
  {
    id: 'anim_copo',
    nombre: 'Copo de nieve',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="10s" repeatCount={inf} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <g key={a} transform={`rotate(${a} 50 50)`} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <line x1="50" y1="50" x2="50" y2="12" />
              <path d="M40 22 L50 30 L60 22" />
              <path d="M43 34 L50 40 L57 34" />
            </g>
          ))}
          <circle cx="50" cy="50" r="5" fill="currentColor" />
        </g>
        <Destello x={84} y={18} r={5} dur="1.6s" color="#fff" />
        <Destello x={16} y={82} r={4} dur="1.6s" inicio="0.8s" color="#BAE6FD" />
      </g>
    ),
  },
  {
    id: 'anim_arbol',
    nombre: 'Árbol de Navidad',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 120',
    proporcion: 1.2,
    contenido: (
      <g>
        <rect x="44" y="98" width="12" height="14" rx="2" fill="#92400E" />
        <path d="M50 18 L80 58 L64 58 L88 90 L12 90 L36 58 L20 58Z" fill="currentColor" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M30 56 Q50 66 70 56 M24 86 Q50 98 76 86" fill="none" stroke="#FDE68A" strokeWidth="1.8" />
        {[
          [36, 52, '#F43F5E'], [62, 50, '#FACC15'], [48, 68, '#60A5FA'], [30, 80, '#FACC15'], [70, 80, '#F43F5E'], [52, 84, '#A855F7'], [44, 40, '#60A5FA'],
        ].map(([x, y, c], i) => (
          <circle key={i} cx={x as number} cy={y as number} r="3.6" fill={c as string}>
            <animate attributeName="opacity" values="1;0.25;1" dur={`${0.9 + (i % 3) * 0.35}s`} begin={`${i * 0.15}s`} repeatCount={inf} />
          </circle>
        ))}
        <Latir cx={50} cy={14} a={1.25} dur="1.2s">
          <polygon points={puntosEstrella(50, 14, 10)} fill="#FACC15" />
        </Latir>
      </g>
    ),
  },
  {
    id: 'anim_calabaza',
    nombre: 'Calabaza encendida',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 90',
    proporcion: 0.9,
    contenido: (
      <g>
        <path d="M50 18 Q48 8 56 4" fill="none" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
        <Latir cx={50} cy={54} de={1} a={1.04} dur="2s">
          <ellipse cx="30" cy="54" rx="20" ry="30" fill="#EA580C" />
          <ellipse cx="70" cy="54" rx="20" ry="30" fill="#EA580C" />
          <ellipse cx="50" cy="54" rx="22" ry="32" fill="#F97316" />
          <g fill="#FDE047">
            <animate attributeName="fill" values="#FDE047;#F59E0B;#FDE047;#FEF08A;#FDE047" dur="1.4s" repeatCount={inf} />
            <path d="M30 44 L40 44 L35 34Z" />
            <path d="M60 44 L70 44 L65 34Z" />
            <path d="M28 62 Q50 82 72 62 L64 64 L60 70 L56 64 L50 70 L44 64 L40 70 L36 64Z" />
          </g>
        </Latir>
      </g>
    ),
  },
  {
    id: 'anim_fantasma',
    nombre: 'Fantasmita',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <Flotar dy={8} dur="2.8s">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-5 50 50;5 50 50;-5 50 50" dur="2.8s" repeatCount={inf} />
          <path d="M18 52 Q18 14 50 14 Q82 14 82 52 L82 96 Q74 88 68 96 Q60 104 54 96 Q50 90 46 96 Q40 104 32 96 Q26 88 18 96Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="38" cy="48" rx="5" ry="7" fill="#1E293B" />
          <ellipse cx="62" cy="48" rx="5" ry="7" fill="#1E293B" />
          <ellipse cx="50" cy="66" rx="6" ry="5" fill="#1E293B">
            <animate attributeName="ry" values="5;2;5" dur="2.8s" repeatCount={inf} />
          </ellipse>
          <circle cx="30" cy="60" r="4" fill="currentColor" opacity="0.5" />
          <circle cx="70" cy="60" r="4" fill="currentColor" opacity="0.5" />
        </g>
      </Flotar>
    ),
  },
  {
    id: 'anim_murcielago',
    nombre: 'Murciélago',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 60',
    proporcion: 0.6,
    contenido: (
      <Flotar dy={6} dur="1.8s">
        <g transform="translate(50 0)">
          <g>
            <animateTransform attributeName="transform" type="scale" values="1 1;1 0.35;1 1" dur="0.45s" repeatCount={inf} />
            <path d="M0 30 Q-14 10 -30 14 Q-26 20 -34 22 Q-30 28 -44 30 Q-34 34 -36 42 Q-20 34 -8 40Z" fill="currentColor" />
            <path d="M0 30 Q14 10 30 14 Q26 20 34 22 Q30 28 44 30 Q34 34 36 42 Q20 34 8 40Z" fill="currentColor" />
          </g>
          <ellipse cx="0" cy="32" rx="9" ry="11" fill="currentColor" />
          <path d="M-7 23 L-6 14 L-2 22 M7 23 L6 14 L2 22" fill="currentColor" />
          <circle cx="-3.5" cy="29" r="2" fill="#FDE047" />
          <circle cx="3.5" cy="29" r="2" fill="#FDE047" />
        </g>
      </Flotar>
    ),
  },
  {
    id: 'anim_sol',
    nombre: 'Sol radiante',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 100',
    proporcion: 1,
    contenido: (
      <g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" dur="14s" repeatCount={inf} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d="M50 4 L55 18 L45 18Z" fill="#F59E0B" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </g>
        <Latir cx={50} cy={50} a={1.06} dur="2.4s">
          <circle cx="50" cy="50" r="26" fill="#FACC15" />
          <circle cx="41" cy="46" r="3" fill="#78350F" />
          <circle cx="59" cy="46" r="3" fill="#78350F" />
          <path d="M40 57 Q50 66 60 57" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="35" cy="56" r="3.5" fill="#FB923C" opacity="0.6" />
          <circle cx="65" cy="56" r="3.5" fill="#FB923C" opacity="0.6" />
        </Latir>
      </g>
    ),
  },
  {
    id: 'anim_paloma',
    nombre: 'Paloma de la paz',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 80',
    proporcion: 0.8,
    contenido: (
      <g>
        <Flotar dy={5} dur="2.6s">
          <path d="M24 46 Q40 30 64 38 Q78 34 86 26 Q84 40 72 46 Q60 62 36 58 Q22 58 12 66 Q16 52 24 46Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 46 42;-28 46 42;0 46 42" dur="0.8s" repeatCount={inf} />
            <path d="M46 42 Q36 14 54 6 Q58 24 60 40Z" fill="#fff" stroke="#CBD5E1" strokeWidth="1.5" />
          </g>
          <circle cx="76" cy="32" r="2" fill="#1E293B" />
          <path d="M84 30 L92 31 L84 34Z" fill="#F59E0B" />
          <path d="M86 36 Q94 44 90 52" fill="none" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="91" cy="46" rx="2.6" ry="4.5" fill="currentColor" transform="rotate(-30 91 46)" />
        </Flotar>
        <Destello x={14} y={18} r={5} dur="1.8s" />
        <Destello x={62} y={72} r={4} dur="1.8s" inicio="0.9s" color="#fff" />
      </g>
    ),
  },
  {
    id: 'anim_trofeo',
    nombre: 'Trofeo',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <g>
        <Latir cx={50} cy={60} a={1.05} dur="1.8s">
          <path d="M28 14 L72 14 L70 44 Q68 64 50 66 Q32 64 30 44Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <path d="M28 20 Q12 20 14 34 Q16 46 30 46" fill="none" stroke="#CA8A04" strokeWidth="4" />
          <path d="M72 20 Q88 20 86 34 Q84 46 70 46" fill="none" stroke="#CA8A04" strokeWidth="4" />
          <rect x="44" y="66" width="12" height="14" fill="#CA8A04" />
          <rect x="30" y="80" width="40" height="12" rx="2" fill="currentColor" />
          <polygon points={puntosEstrella(50, 36, 10)} fill="#fff" opacity="0.9" />
          <path d="M36 18 Q36 40 44 54" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
        </Latir>
        <Destello x={14} y={64} r={6} dur="1.4s" />
        <Destello x={86} y={64} r={5} dur="1.4s" inicio="0.7s" />
        <Destello x={78} y={8} r={4} dur="1.1s" inicio="0.3s" color="#fff" />
      </g>
    ),
  },
  {
    id: 'anim_osito',
    nombre: 'Osito saludando',
    categoria: 'Animados',
    animado: true,
    viewBox: '0 0 100 110',
    proporcion: 1.1,
    contenido: (
      <g>
        <circle cx="26" cy="22" r="11" fill="#B45309" />
        <circle cx="74" cy="22" r="11" fill="#B45309" />
        <circle cx="26" cy="22" r="5" fill="#FDBA74" />
        <circle cx="74" cy="22" r="5" fill="#FDBA74" />
        <ellipse cx="50" cy="84" rx="26" ry="22" fill="#B45309" />
        <ellipse cx="50" cy="88" rx="14" ry="12" fill="#FDBA74" />
        <circle cx="50" cy="42" r="28" fill="#D97706" />
        <ellipse cx="50" cy="52" rx="12" ry="9" fill="#FDBA74" />
        <ellipse cx="50" cy="48" rx="4.5" ry="3.5" fill="#1E293B" />
        <circle cx="38" cy="38" r="3.2" fill="#1E293B" />
        <circle cx="62" cy="38" r="3.2" fill="#1E293B" />
        <path d="M45 56 Q50 60 55 56" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 66 L50 72 L60 66 L56 76 L44 76Z" fill="currentColor" />
        <ellipse cx="26" cy="82" rx="8" ry="12" fill="#B45309" transform="rotate(20 26 82)" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0 74 74;-40 74 74;0 74 74" dur="1.1s" repeatCount={inf} />
          <ellipse cx="80" cy="64" rx="8" ry="13" fill="#B45309" transform="rotate(-35 80 64)" />
        </g>
      </g>
    ),
  },
]
