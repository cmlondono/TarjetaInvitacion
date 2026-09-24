import { ConfiguracionVisual, TipoEvento } from '@/types/invitation'

export interface DatosPlantillaEvento {
  titulo: string
  subtitulo: string
  anfitriones: string
  textoBadge: string
  codigoVestimenta?: string
  imagenPortada?: string
}

export interface PlantillaTema {
  id: string
  nombre: string
  tipoEvento: TipoEvento
  descripcion: string
  visual: ConfiguracionVisual
  datosEvento?: DatosPlantillaEvento
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
      animacionSobre: true,
      colorSobre: '#0F172A',
      estiloSobre: 'gala',
      colorLacre: 'oro',
      forroSobre: 'satinado',
      textoImpresoSobre: 'Convocatoria Oficial',
      textoMonograma: 'C',
    },
    datosEvento: {
      titulo: 'Cumbre de Innovación & Liderazgo 2026',
      subtitulo: 'Sesión Plenaria & Cóctel de Honor',
      anfitriones: 'Comité Directivo & Socios Estratégicos',
      textoBadge: 'Convocatoria Oficial',
      codigoVestimenta: 'Traje Formal / Corbata Oscura',
      imagenPortada: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Nuestra Boda — Sofía & Carlos',
      subtitulo: 'Tenemos el honor de invitarle a celebrar nuestro matrimonio',
      anfitriones: 'Sofía Gómez & Carlos Mora',
      textoBadge: 'Invitación de Honor',
      codigoVestimenta: 'Rigurosa Etiqueta / Gala',
      imagenPortada: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'academico-oxford',
    nombre: 'Académico Oxford',
    tipoEvento: 'grado',
    descripcion: 'Azul cobalto institucional, plata y blanco pergamino para actos solemnes de graduación.',
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
    datosEvento: {
      titulo: 'Ceremonia de Graduación & Grado de Honor',
      subtitulo: 'Solemne Acto de Colación de Grados y Entrega de Títulos',
      anfitriones: 'Consejo Académico & Graduando de Honor',
      textoBadge: 'Ceremonia de Grado',
      codigoVestimenta: 'Traje Académico / Traje Formal',
      imagenPortada: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Conferencia Anual & Networking Summit',
      subtitulo: 'Encuentro de Estrategia, Innovación y Tendencias Globales',
      anfitriones: 'Dirección Corporativa & Socios Estratégicos',
      textoBadge: 'Pase Ejecutivo',
      codigoVestimenta: 'Business Professional / Casual Formal',
      imagenPortada: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'distincion-champan',
    nombre: 'Distinción & Champán (Quince Años)',
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
    datosEvento: {
      titulo: 'Mis Quince Años — Valentina',
      subtitulo: 'Acompáñanos a celebrar una noche mágica e inolvidable',
      anfitriones: 'Familia Gómez Restrepo',
      textoBadge: 'Pase de Honor XV',
      codigoVestimenta: 'Traje de Gala / Vestido de Noche',
      imagenPortada: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Gran Fiesta de Cumpleaños',
      subtitulo: 'Música en vivo, cócteles de autor y celebración con amigos',
      anfitriones: 'Los Mejores Amigos & Familia',
      textoBadge: 'Pase VIP de Fiesta',
      codigoVestimenta: 'Cocktail Chic / Fiesta',
      imagenPortada: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Celebración Exclusiva de Aniversario & Cumpleaños',
      subtitulo: 'Noche de Gala, Brindis Especial y Celebración VIP',
      anfitriones: 'Homenajeado & Familiares',
      textoBadge: 'Pase Exclusivo VIP',
      codigoVestimenta: 'Elegante / Traje de Noche',
      imagenPortada: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Encuentro Familiar & Asado Campestre',
      subtitulo: 'Un día de celebración, buena comida y grandes recuerdos juntos',
      anfitriones: 'Nuestra Familia Reunida',
      textoBadge: 'Pase Familiar',
      codigoVestimenta: 'Casual Campestre',
      imagenPortada: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Celebración en el Jardín',
      subtitulo: 'Almuerzo campestre y velada íntima al aire libre',
      anfitriones: 'Nuestra Familia',
      textoBadge: 'Invitación Especial',
      codigoVestimenta: 'Elegante Casual / Tonos Tierra y Verde',
      imagenPortada: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Bienvenida a Nuestro Bebé',
      subtitulo: 'Acompáñanos a celebrar la llegada de nuestra mayor bendición',
      anfitriones: 'Papás & Familia',
      textoBadge: 'Pase Baby Shower',
      codigoVestimenta: 'Casual Elegante / Tonos Pastel',
      imagenPortada: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
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
    datosEvento: {
      titulo: 'Pool Party & Atardecer de Verano',
      subtitulo: 'Sol, música, piscina y la mejor compañía para celebrar',
      anfitriones: 'Los Anfitriones',
      textoBadge: 'Pase de Acceso',
      codigoVestimenta: 'Resort Casual / Traje de Baño Elegante',
      imagenPortada: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'romance-rosa-cuarzo',
    nombre: 'Rosa Cuarzo & Oro Rosa',
    tipoEvento: 'boda',
    descripcion: 'Rosa empolvado, oro rosa satinado y flores delicadas para bodas y aniversarios.',
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
    datosEvento: {
      titulo: 'Nuestra Boda — Sofía & Carlos',
      subtitulo: 'Queremos compartir contigo este momento tan especial e irrepetible',
      anfitriones: 'Sofía Gómez & Carlos Mora',
      textoBadge: 'Invitación Nupcial',
      codigoVestimenta: 'Formal Romántico / Tonos Suaves',
      imagenPortada: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    },
  },
]

export const TEMA_POR_DEFECTO = PLANTILLAS_TEMAS[0].visual

export function obtenerDatosPorTipoEvento(tipo: TipoEvento): DatosPlantillaEvento {
  const plantilla = PLANTILLAS_TEMAS.find((p) => p.tipoEvento === tipo)
  if (plantilla && plantilla.datosEvento) {
    return plantilla.datosEvento
  }
  return {
    titulo: 'Convocatoria Especial',
    subtitulo: 'Tiene el agrado de invitarle a',
    anfitriones: 'Los Anfitriones',
    textoBadge: 'Invitación Oficial',
    codigoVestimenta: 'Traje Formal / Rigurosa Etiqueta',
  }
}
