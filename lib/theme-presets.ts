import { ConfiguracionVisual, TipoEvento } from '@/types/invitation'

export interface PlantillaTema {
  id: string
  nombre: string
  tipoEvento: TipoEvento
  descripcion: string
  visual: ConfiguracionVisual
}

/**
 * Paletas de diseño corporativas, formales y de etiqueta.
 * Diseñadas bajo principios editoriales suizos y estándares de alta costura.
 */
export const PLANTILLAS_TEMAS: PlantillaTema[] = [
  {
    id: 'corporativo-medianoche',
    nombre: 'Gala Ejecutiva & Cumbre',
    tipoEvento: 'corporativo',
    descripcion: 'Azul medianoche, gris titanio y platino. Imponente, sobrio y respetuoso.',
    visual: {
      fuenteTitulo: 'montserrat',
      fuenteCuerpo: 'inter',
      colorPrimario: '#0F172A', // Slate 900 profundo
      colorSecundario: '#334155', // Slate 700
      colorFondo: '#F8FAFC', // Slate 50
      colorTarjeta: 'rgba(255, 255, 255, 0.95)',
      colorTexto: '#0F172A',
      efectoFondo: 'destellos',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'clasica',
    },
  },
  {
    id: 'etiqueta-bronce',
    nombre: 'Solemne & Bronce Satinado',
    tipoEvento: 'boda',
    descripcion: 'Inspirado en papelería de alta costura con toques bronce, carbón y lino.',
    visual: {
      fuenteTitulo: 'cormorant',
      fuenteCuerpo: 'montserrat',
      colorPrimario: '#27272A', // Zinc 800 grafito
      colorSecundario: '#9A7B56', // Bronce / Oro viejo mate
      colorFondo: '#FAFAF9', // Stone 50 cálido
      colorTarjeta: 'rgba(255, 255, 255, 0.96)',
      colorTexto: '#18181B',
      efectoFondo: 'particulas_doradas',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: true,
      formaTarjeta: 'arco',
    },
  },
  {
    id: 'academico-oxford',
    nombre: 'Académico Oxford',
    tipoEvento: 'grado',
    descripcion: 'Azul cobalto institucional, plata y blanco pergamino para actos solemnes.',
    visual: {
      fuenteTitulo: 'cinzel',
      fuenteCuerpo: 'inter',
      colorPrimario: '#1E293B',
      colorSecundario: '#2563EB',
      colorFondo: '#F1F5F9',
      colorTarjeta: 'rgba(255, 255, 255, 0.95)',
      colorTexto: '#0F172A',
      efectoFondo: 'destellos',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: true,
      formaTarjeta: 'doble_borde',
    },
  },
  {
    id: 'conferencia-minimalista',
    nombre: 'Conferencia & Networking',
    tipoEvento: 'corporativo',
    descripcion: 'Monocromático, arquitectónico y directo, pensado para directivos y eventos tech.',
    visual: {
      fuenteTitulo: 'inter',
      fuenteCuerpo: 'inter',
      colorPrimario: '#18181B', // Neutral 900
      colorSecundario: '#52525B', // Neutral 600
      colorFondo: '#FFFFFF',
      colorTarjeta: 'rgba(255, 255, 255, 0.98)',
      colorTexto: '#18181B',
      efectoFondo: 'ninguno',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: false,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'clasica',
    },
  },
  {
    id: 'distincion-champan',
    nombre: 'Distinción & Champán',
    tipoEvento: 'quince_anos',
    descripcion: 'Pizarra profunda y champán satinado. Sofisticación sin estridencias infantiles.',
    visual: {
      fuenteTitulo: 'playfair',
      fuenteCuerpo: 'montserrat',
      colorPrimario: '#292524', // Warm stone
      colorSecundario: '#B59975', // Champán mate
      colorFondo: '#F5F5F4',
      colorTarjeta: 'rgba(255, 255, 255, 0.95)',
      colorTexto: '#1C1917',
      efectoFondo: 'destellos',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: true,
      formaTarjeta: 'biselada',
    },
  },
  {
    id: 'cumpleanos-party-neon',
    nombre: 'Fiesta Neón & Cumpleaños',
    tipoEvento: 'cumpleanos',
    descripcion: 'Púrpura vibrante, rosa neón y efecto confeti para fiestas juveniles y de adultos.',
    visual: {
      fuenteTitulo: 'montserrat',
      fuenteCuerpo: 'inter',
      colorPrimario: '#6B21A8', // Violeta intenso
      colorSecundario: '#EC4899', // Rosa neón
      colorFondo: '#FAF5FF',
      colorTarjeta: 'rgba(255, 255, 255, 0.98)',
      colorTexto: '#3B0764',
      efectoFondo: 'confeti',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'biselada',
    },
  },
  {
    id: 'cumpleanos-black-gold',
    nombre: 'Glam Black & Gold (Cumpleaños VIP)',
    tipoEvento: 'cumpleanos',
    descripcion: 'Negro carbón sofisticado con lluvia de oro brillante y confeti.',
    visual: {
      fuenteTitulo: 'playfair',
      fuenteCuerpo: 'montserrat',
      colorPrimario: '#18181B',
      colorSecundario: '#EAB308',
      colorFondo: '#FEFCE8',
      colorTarjeta: 'rgba(255, 255, 255, 0.97)',
      colorTexto: '#18181B',
      efectoFondo: 'confeti',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'arco',
    },
  },
  {
    id: 'reunion-familiar-rustica',
    nombre: 'Terracota & Asado Familiar',
    tipoEvento: 'otro',
    descripcion: 'Terracota arcilla, miel tostada y lino. Ideal para asados familiares y días de campo.',
    visual: {
      fuenteTitulo: 'playfair',
      fuenteCuerpo: 'inter',
      colorPrimario: '#9A3412', // Terracota cálido
      colorSecundario: '#D97706', // Ámbar miel
      colorFondo: '#FFFBEB', // Crema cálido
      colorTarjeta: 'rgba(255, 255, 255, 0.97)',
      colorTexto: '#451A03',
      efectoFondo: 'ninguno',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: false,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'clasica',
    },
  },
  {
    id: 'jardin-campestre-salvia',
    nombre: 'Verde Salvia & Jardín Familiar',
    tipoEvento: 'otro',
    descripcion: 'Tonos bosque natural, eucalipto fresco y pétalos para picnics y almuerzos campestres.',
    visual: {
      fuenteTitulo: 'cormorant',
      fuenteCuerpo: 'inter',
      colorPrimario: '#15803D',
      colorSecundario: '#84CC16',
      colorFondo: '#F0FDF4',
      colorTarjeta: 'rgba(255, 255, 255, 0.96)',
      colorTexto: '#14532D',
      efectoFondo: 'flores_delicadas',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: false,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'arco',
    },
  },
  {
    id: 'baby-shower-dulzura',
    nombre: 'Pastel Dulzura & Fiesta Infantil',
    tipoEvento: 'baby_shower',
    descripcion: 'Rosa tierno, celeste pastel y confeti suave para baby showers y bautizos.',
    visual: {
      fuenteTitulo: 'montserrat',
      fuenteCuerpo: 'inter',
      colorPrimario: '#BE185D',
      colorSecundario: '#38BDF8',
      colorFondo: '#FDF2F8',
      colorTarjeta: 'rgba(255, 255, 255, 0.98)',
      colorTexto: '#4C1D95',
      efectoFondo: 'confeti',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: false,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'biselada',
    },
  },
  {
    id: 'sunset-tropical-pool',
    nombre: 'Sunset Coral & Pool Party',
    tipoEvento: 'cumpleanos',
    descripcion: 'Coral atardecer, naranja brillante y toques tropicales para fiestas de piscina y verano.',
    visual: {
      fuenteTitulo: 'montserrat',
      fuenteCuerpo: 'inter',
      colorPrimario: '#EA580C',
      colorSecundario: '#F59E0B',
      colorFondo: '#FFF7ED',
      colorTarjeta: 'rgba(255, 255, 255, 0.97)',
      colorTexto: '#7C2D12',
      efectoFondo: 'confeti',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: false,
      formaTarjeta: 'biselada',
    },
  },
  {
    id: 'romance-rosa-cuarzo',
    nombre: 'Rosa Cuarzo & Oro Rosa',
    tipoEvento: 'boda',
    descripcion: 'Rosa empolvado, oro rosa satinado y flores delicadas para aniversarios y veladas íntimas.',
    visual: {
      fuenteTitulo: 'playfair',
      fuenteCuerpo: 'montserrat',
      colorPrimario: '#9D174D',
      colorSecundario: '#FB7185',
      colorFondo: '#FFF1F2',
      colorTarjeta: 'rgba(255, 255, 255, 0.97)',
      colorTexto: '#4C0519',
      efectoFondo: 'flores_delicadas',
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: false,
      mostrarLluviaSobres: true,
      formaTarjeta: 'arco',
    },
  },
]

export const TEMA_POR_DEFECTO = PLANTILLAS_TEMAS[0].visual
