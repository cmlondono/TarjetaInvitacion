import { ConfiguracionVisual, EfectoFondo } from '@/types/invitation'

export type CategoriaPaleta = 'todas' | 'fiesta' | 'familiar' | 'dulce' | 'formal' | 'naturaleza'

export interface PaletaCompleta {
  id: string
  nombre: string
  categoria: 'fiesta' | 'familiar' | 'dulce' | 'formal' | 'naturaleza'
  descripcion: string
  colorMuestra: string
  primario: string
  secundario: string
  fondo: string
  tarjeta: string
  texto: string
  efecto: EfectoFondo
}

export type RolColor = 'fondo' | 'tarjeta' | 'primario' | 'secundario' | 'texto'

export const CATALOGO_PALETAS: PaletaCompleta[] = [
  // 🎉 FIESTAS, CUMPLEAÑOS & CELEBRACIONES NOCTURNAS
  {
    id: 'party_neon',
    nombre: 'Fiesta Neón & Cumpleaños',
    categoria: 'fiesta',
    descripcion: 'Púrpura eléctrico con fucsia neón sobre fondo lavanda luminoso.',
    colorMuestra: '#EC4899',
    primario: '#7C3AED',
    secundario: '#EC4899',
    fondo: '#FAF5FF',
    tarjeta: '#FFFFFF',
    texto: '#3B0764',
    efecto: 'confeti',
  },
  {
    id: 'black_gold_vip',
    nombre: 'Glam VIP & Oro Dorado',
    categoria: 'fiesta',
    descripcion: 'Negro carbón satinado con destellos en oro brillante para fiestas exclusivas.',
    colorMuestra: '#EAB308',
    primario: '#18181B',
    secundario: '#EAB308',
    fondo: '#FEFCE8',
    tarjeta: '#FFFFFF',
    texto: '#18181B',
    efecto: 'particulas_doradas',
  },
  {
    id: 'sunset_coral_pool',
    nombre: 'Sunset Coral & Pool Party',
    categoria: 'fiesta',
    descripcion: 'Naranja atardecer, ámbar cálido y crema tropical para cócteles y piscina.',
    colorMuestra: '#EA580C',
    primario: '#EA580C',
    secundario: '#F59E0B',
    fondo: '#FFF7ED',
    tarjeta: '#FFFFFF',
    texto: '#7C2D12',
    efecto: 'destellos',
  },
  {
    id: 'cyber_disco',
    nombre: 'Cyber Disco & Noche Retro',
    categoria: 'fiesta',
    descripcion: 'Azul cobalto con destellos cian y violeta para rumbas y cumpleaños juveniles.',
    colorMuestra: '#06B6D4',
    primario: '#2563EB',
    secundario: '#06B6D4',
    fondo: '#F0FDFA',
    tarjeta: '#FFFFFF',
    texto: '#0F172A',
    efecto: 'estrellas',
  },
  {
    id: 'carnaval_tropical',
    nombre: 'Carnaval Tropical Festivo',
    categoria: 'fiesta',
    descripcion: 'Fucsia vibrante y verde lima para parrandas, chivas y celebraciones alegres.',
    colorMuestra: '#D946EF',
    primario: '#C026D3',
    secundario: '#84CC16',
    fondo: '#FDF4FF',
    tarjeta: '#FFFFFF',
    texto: '#701A75',
    efecto: 'confeti',
  },

  // 🏡 FAMILIARES, ASADOS & REUNIONES DE HOGAR
  {
    id: 'terracota_bbq',
    nombre: 'Terracota Cálido & Asado BBQ',
    categoria: 'familiar',
    descripcion: 'Tonos arcilla, madera noble y ámbar tostado ideales para asados familiares y campo.',
    colorMuestra: '#9A3412',
    primario: '#9A3412',
    secundario: '#D97706',
    fondo: '#FFFBEB',
    tarjeta: '#FFFFFF',
    texto: '#451A03',
    efecto: 'ninguno',
  },
  {
    id: 'salvia_reunion',
    nombre: 'Verde Salvia & Huerta Familiar',
    categoria: 'familiar',
    descripcion: 'Verde salvia fresco y olivo cálido para almuerzos campestres y reencuentros.',
    colorMuestra: '#15803D',
    primario: '#15803D',
    secundario: '#84CC16',
    fondo: '#F0FDF4',
    tarjeta: '#FFFFFF',
    texto: '#14532D',
    efecto: 'flores_delicadas',
  },
  {
    id: 'azul_hogar_calido',
    nombre: 'Azul Convivio & Almuerzo Familiar',
    categoria: 'familiar',
    descripcion: 'Azul marino clásico con cielo claro, sereno y confiable para reuniones de familia.',
    colorMuestra: '#2563EB',
    primario: '#1E3A8A',
    secundario: '#38BDF8',
    fondo: '#EFF6FF',
    tarjeta: '#FFFFFF',
    texto: '#1E293B',
    efecto: 'destellos',
  },
  {
    id: 'cafe_madera_rustico',
    nombre: 'Café Moca & Leña Rústica',
    categoria: 'familiar',
    descripcion: 'Café tostado, avellana y beige pergamino para asados al aire libre y fincas.',
    colorMuestra: '#78350F',
    primario: '#78350F',
    secundario: '#B45309',
    fondo: '#FAF8F5',
    tarjeta: '#FFFFFF',
    texto: '#451A03',
    efecto: 'ninguno',
  },

  // 👶 DULCES, BABY SHOWER, QUINCEAÑERAS & BAUTIZOS
  {
    id: 'pastel_dulzura_baby',
    nombre: 'Algodón Pastel & Baby Shower',
    categoria: 'dulce',
    descripcion: 'Rosa bebé con celeste nube y blanco suave para nacimientos y bienvenidas.',
    colorMuestra: '#F472B6',
    primario: '#BE185D',
    secundario: '#38BDF8',
    fondo: '#FDF2F8',
    tarjeta: '#FFFFFF',
    texto: '#4C1D95',
    efecto: 'confeti',
  },
  {
    id: 'lavanda_magica_xv',
    nombre: 'Lavanda & Ensueño Quinceañera',
    categoria: 'dulce',
    descripcion: 'Lila floral con amatista y destellos de plata para quince años mágicos.',
    colorMuestra: '#A78BFA',
    primario: '#7C3AED',
    secundario: '#A78BFA',
    fondo: '#F5F3FF',
    tarjeta: '#FFFFFF',
    texto: '#4C1D95',
    efecto: 'estrellas',
  },
  {
    id: 'rosa_cuarzo_oro_rosa',
    nombre: 'Rosa Cuarzo & Oro Rosa Nupcial',
    categoria: 'dulce',
    descripcion: 'Rosa palo empolvado con oro rosa satinado para bodas civiles y quinceañeras.',
    colorMuestra: '#FB7185',
    primario: '#9D174D',
    secundario: '#FB7185',
    fondo: '#FFF1F2',
    tarjeta: '#FFFFFF',
    texto: '#4C0519',
    efecto: 'flores_delicadas',
  },
  {
    id: 'menta_vainilla',
    nombre: 'Menta Fresca & Vainilla Bautizo',
    categoria: 'dulce',
    descripcion: 'Verde menta pastel con crema marfil para bautizos, primera comunión y bebés.',
    colorMuestra: '#2DD4BF',
    primario: '#0D9488',
    secundario: '#FBBF24',
    fondo: '#F0FDFA',
    tarjeta: '#FFFFFF',
    texto: '#134E4A',
    efecto: 'destellos',
  },

  // 👑 GALA, BODAS & PROTOCOLO FORMAL
  {
    id: 'medianoche_real_oro',
    nombre: 'Medianoche Real & Oro de Gala',
    categoria: 'formal',
    descripcion: 'Azul noche profundo con oro imperial para bodas de etiqueta y recepciones VIP.',
    colorMuestra: '#0F172A',
    primario: '#0F172A',
    secundario: '#D4AF37',
    fondo: '#F8FAFC',
    tarjeta: '#FFFFFF',
    texto: '#0F172A',
    efecto: 'particulas_doradas',
  },
  {
    id: 'champan_bronce_alta_costura',
    nombre: 'Champán & Bronce Satinado',
    categoria: 'formal',
    descripcion: 'Grafito oscuro con bronce pulido y pergamino de lino de alta costura.',
    colorMuestra: '#9A7B56',
    primario: '#27272A',
    secundario: '#9A7B56',
    fondo: '#FAF8F5',
    tarjeta: '#FFFFFF',
    texto: '#18181B',
    efecto: 'particulas_doradas',
  },
  {
    id: 'esmeralda_imperial',
    nombre: 'Esmeralda Imperial & Laurel',
    categoria: 'formal',
    descripcion: 'Verde bosque profundo con acentos de esmeralda luminosa para aniversarios solemnes.',
    colorMuestra: '#064E3B',
    primario: '#064E3B',
    secundario: '#059669',
    fondo: '#F0FDF4',
    tarjeta: '#FFFFFF',
    texto: '#064E3B',
    efecto: 'destellos',
  },
  {
    id: 'borgona_rubi_gala',
    nombre: 'Borgoña & Rubí Solemne',
    categoria: 'formal',
    descripcion: 'Vino borgoña con rubí profundo y oro viejo para bodas de invierno y bodas de plata.',
    colorMuestra: '#831843',
    primario: '#831843',
    secundario: '#BE185D',
    fondo: '#FDF2F8',
    tarjeta: '#FFFFFF',
    texto: '#831843',
    efecto: 'destellos',
  },
  {
    id: 'zafiro_oxford_diplomatico',
    nombre: 'Zafiro Oxford Diplomático',
    categoria: 'formal',
    descripcion: 'Azul cobalto institucional con azul zafiro para grados universitarios y cumbres.',
    colorMuestra: '#1E3A8A',
    primario: '#1E3A8A',
    secundario: '#3B82F6',
    fondo: '#EFF6FF',
    tarjeta: '#FFFFFF',
    texto: '#1E3A8A',
    efecto: 'destellos',
  },
  {
    id: 'monocromo_minimal_editorial',
    nombre: 'Monocromo Arquitectónico',
    categoria: 'formal',
    descripcion: 'Blanco puro, gris titanio y negro absoluto para eventos tech, exposiciones y arte.',
    colorMuestra: '#18181B',
    primario: '#18181B',
    secundario: '#71717A',
    fondo: '#FFFFFF',
    tarjeta: '#FFFFFF',
    texto: '#18181B',
    efecto: 'ninguno',
  },

  // 🌿 NATURALEZA, BOTÁNICA & EXTERIORES
  {
    id: 'eucalipto_jardin',
    nombre: 'Eucalipto & Jardín Botánico',
    categoria: 'naturaleza',
    descripcion: 'Verde oliva y salvia empolvado con toques florales para bodas al aire libre.',
    colorMuestra: '#059669',
    primario: '#047857',
    secundario: '#10B981',
    fondo: '#F2FBF7',
    tarjeta: '#FFFFFF',
    texto: '#064E3B',
    efecto: 'flores_delicadas',
  },
  {
    id: 'arena_oceano',
    nombre: 'Arena Cálida & Azul Océano',
    categoria: 'naturaleza',
    descripcion: 'Azul cerúleo con arena marina tostada para bodas de playa y celebraciones en el mar.',
    colorMuestra: '#0284C7',
    primario: '#0369A1',
    secundario: '#D97706',
    fondo: '#F0F9FF',
    tarjeta: '#FFFFFF',
    texto: '#0C4A6E',
    efecto: 'destellos',
  },
]

/**
 * Rota los colores de la paleta activa en un ciclo armónico:
 * Primario -> Secundario -> Fondo -> Tarjeta -> Primario
 * Permite explorar nuevas combinaciones con los mismos tonos con un solo clic.
 */
export function rotarColores(visual: ConfiguracionVisual): ConfiguracionVisual {
  const { colorPrimario, colorSecundario, colorFondo, colorTarjeta, colorTexto } = visual

  // Rotamos primario y secundario entre ellos, o ciclar acentos
  return {
    ...visual,
    colorPrimario: colorSecundario,
    colorSecundario: colorPrimario,
    // Verificamos contraste para que el texto siga siendo 100% legible
    colorTexto: asegurarContrasteLegible(colorTarjeta, colorTexto),
  }
}

/**
 * Intercambia el color primario (botones de acción) y el secundario (filetes y detalles)
 */
export function intercambiarAcentos(visual: ConfiguracionVisual): ConfiguracionVisual {
  return {
    ...visual,
    colorPrimario: visual.colorSecundario,
    colorSecundario: visual.colorPrimario,
  }
}

/**
 * Invierte los fondos: Fondo exterior ⇄ Fondo de la tarjeta
 */
export function invertirFondos(visual: ConfiguracionVisual): ConfiguracionVisual {
  const nuevoFondo = visual.colorTarjeta
  const nuevaTarjeta = visual.colorFondo

  return {
    ...visual,
    colorFondo: nuevoFondo,
    colorTarjeta: nuevaTarjeta,
    colorTexto: asegurarContrasteLegible(nuevaTarjeta, visual.colorTexto),
  }
}

/**
 * Desplaza todos los colores en un ciclo completo de 4 posiciones
 */
export function ciclarTodosLosColores(visual: ConfiguracionVisual): ConfiguracionVisual {
  // Ciclo: Primario -> Secundario, Secundario -> Fondo, Fondo -> Tarjeta, Tarjeta -> Primario
  const p = visual.colorPrimario
  const s = visual.colorSecundario
  const f = visual.colorFondo
  const t = visual.colorTarjeta

  const nuevaTarjeta = f
  return {
    ...visual,
    colorPrimario: s,
    colorSecundario: t,
    colorFondo: p,
    colorTarjeta: nuevaTarjeta,
    colorTexto: asegurarContrasteLegible(nuevaTarjeta, visual.colorTexto),
  }
}

/**
 * Intercambia los colores de dos roles específicos elegidos por el usuario
 */
export function intercambiarRoles(
  visual: ConfiguracionVisual,
  rol1: RolColor,
  rol2: RolColor
): ConfiguracionVisual {
  if (rol1 === rol2) return visual

  const mapa: Record<RolColor, string> = {
    fondo: visual.colorFondo,
    tarjeta: visual.colorTarjeta,
    primario: visual.colorPrimario,
    secundario: visual.colorSecundario,
    texto: visual.colorTexto,
  }

  const val1 = mapa[rol1]
  const val2 = mapa[rol2]

  mapa[rol1] = val2
  mapa[rol2] = val1

  return {
    ...visual,
    colorFondo: mapa.fondo,
    colorTarjeta: mapa.tarjeta,
    colorPrimario: mapa.primario,
    colorSecundario: mapa.secundario,
    colorTexto: mapa.texto,
  }
}

/**
 * Determina si un color es oscuro para ajustar el texto y mantener contraste
 */
export function esColorOscuro(color: string): boolean {
  if (!color) return false
  const hex = color.replace('#', '')
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16)
    const g = parseInt(hex[1] + hex[1], 16)
    const b = parseInt(hex[2] + hex[2], 16)
    return (r * 299 + g * 587 + b * 114) / 1000 < 130
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 < 130
  }
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    const matches = color.match(/\d+/g)
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0], 10)
      const g = parseInt(matches[1], 10)
      const b = parseInt(matches[2], 10)
      return (r * 299 + g * 587 + b * 114) / 1000 < 130
    }
  }
  return false
}

/**
 * Asegura que el color de texto tenga contraste óptimo sobre el fondo de tarjeta
 */
export function asegurarContrasteLegible(colorFondoTarjeta: string, colorTextoActual: string): string {
  const tarjetaEsOscura = esColorOscuro(colorFondoTarjeta)
  const textoEsOscuro = esColorOscuro(colorTextoActual)

  // Si la tarjeta es oscura y el texto es oscuro -> cambiar texto a marfil / blanco
  if (tarjetaEsOscura && textoEsOscuro) {
    return '#F8FAFC'
  }
  // Si la tarjeta es clara y el texto es claro -> cambiar texto a grafito profundo
  if (!tarjetaEsOscura && !textoEsOscuro) {
    return '#18181B'
  }
  return colorTextoActual
}
