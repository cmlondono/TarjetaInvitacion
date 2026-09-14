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
    },
  },
]

export const TEMA_POR_DEFECTO = PLANTILLAS_TEMAS[0].visual
