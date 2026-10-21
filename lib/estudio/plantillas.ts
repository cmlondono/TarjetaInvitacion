import type { DetalleEvento, ElementoLienzo, MovimientoContinuo, ParticulasConfig, SeccionModular, TipoApertura, TipoEscena, TipoEvento, TipoFondoAnimado, TipoRecorrido, TipoSeccion } from '@/types/invitation'
import { obtenerSticker } from '@/lib/editor/stickers'
import { crearSeccionPorTipo } from '@/lib/modular-defaults'
import { crearEventoInicial, formatearHora } from './eventos'
import { experienciaDe } from './kits'

/**
 * Plantillas de muestra: invitaciones completas listas para usar.
 * - La estructura (kit, frase de apertura, momentos, vestimenta, bloques extra) se copia al usarla.
 * - El contenido de ejemplo (historia, padrinos, canciones, cifras) solo se muestra en la vista previa:
 *   así nunca se cuelan datos de otra persona en una invitación real.
 */
export interface Plantilla {
  id: string
  nombre: string
  descripcion: string
  categoria: CategoriaPlantilla
  tipo: TipoEvento
  kitId: string
  nombresEjemplo: string
  lugarEjemplo: string
  hora: string
  kicker?: string
  apertura?: TipoApertura
  recorrido?: TipoRecorrido
  momentos?: [string, string][]
  vestimenta?: { etiqueta: string; colores?: string[]; nota?: string }
  extras?: TipoSeccion[]
  regalos?: string[]
  destacada?: boolean
  /** Plantilla Premium: se edita gratis; para publicar la invitación hay que activar Premium. Se marca desde el panel. */
  premium?: boolean
  /** Efectos de movimiento que trae la plantilla (también editables desde el panel) */
  efectos?: EfectosPlantilla
  ejemplo?: {
    historia?: string
    padrinos?: [string, string][]
    mensaje?: [string, string]
    canciones?: [string, string][]
    vaca?: [number, number, string]
  }
}

export type CategoriaPlantilla =
  | 'Bodas'
  | 'XV años'
  | 'Infantiles'
  | 'Halloween'
  | 'Cumpleaños'
  | 'Bebés'
  | 'Religiosas'
  | 'Celebraciones'
  | 'Salidas'
  | 'Diciembre'
  | 'Empresa'

export const CATEGORIAS_PLANTILLAS: CategoriaPlantilla[] = [
  'Bodas',
  'XV años',
  'Infantiles',
  'Halloween',
  'Cumpleaños',
  'Bebés',
  'Religiosas',
  'Celebraciones',
  'Salidas',
  'Diciembre',
  'Empresa',
]

export const PLANTILLAS: Plantilla[] = [
  // ─────────── Bodas ───────────
  {
    id: 'boda-jardin', nombre: 'Boda en el jardín', descripcion: 'Romántica, con sobre de lacre y ramas de olivo', categoria: 'Bodas', tipo: 'boda', kitId: 'jardin',
    nombresEjemplo: 'Valentina & Andrés', lugarEjemplo: 'Hacienda La Victoria, Cartagena', hora: '17:00', destacada: true,
    momentos: [['17:00', 'Ceremonia'], ['19:00', 'Cena y fiesta']], vestimenta: { etiqueta: 'Formal de jardín', colores: ['#8BA888', '#C9A27E', '#B4566A'], nota: 'Por favor evita el blanco.' },
    extras: ['padrinos'],
    ejemplo: { historia: 'Nos conocimos en un café de Getsemaní en 2019. Seis años y muchos viajes después, queremos celebrarlo con ustedes.', padrinos: [['Carolina Ospina', 'Madrina'], ['Felipe Herrera', 'Padrino']] },
  },
  {
    id: 'boda-iglesia', nombre: 'Boda en la iglesia', descripcion: 'Clásica en blanco y oro, ceremonia religiosa', categoria: 'Bodas', tipo: 'boda', kitId: 'iglesia',
    nombresEjemplo: 'Laura & Santiago', lugarEjemplo: 'Parroquia San Francisco, Bogotá', hora: '16:00', kicker: 'Unidos en matrimonio',
    momentos: [['16:00', 'Ceremonia religiosa'], ['18:30', 'Recepción']], vestimenta: { etiqueta: 'Etiqueta', nota: 'Caballeros de corbata.' },
    ejemplo: { mensaje: ['El amor es paciente, es bondadoso.', '1 Corintios 13'] },
  },
  {
    id: 'boda-finca', nombre: 'Boda en la finca', descripcion: 'Rústica y campestre, tonos tierra', categoria: 'Bodas', tipo: 'boda', kitId: 'rustico',
    nombresEjemplo: 'Mariana & Felipe', lugarEjemplo: 'Finca El Edén, Rionegro', hora: '15:00', kicker: 'Nos casamos en el campo',
    momentos: [['15:00', 'Ceremonia al aire libre'], ['17:00', 'Almuerzo campestre'], ['20:00', 'Fiesta']], vestimenta: { etiqueta: 'Campestre elegante', colores: ['#7D8B5C', '#C9A27E', '#8A5A3B'], nota: 'Zapato cómodo: hay césped.' },
    extras: ['hospedaje'],
  },
  {
    id: 'boda-playa', nombre: 'Boda en la playa', descripcion: 'Caribe, raspa y descubre la fecha', categoria: 'Bodas', tipo: 'boda', kitId: 'playa',
    nombresEjemplo: 'Camila & Daniel', lugarEjemplo: 'Playa Blanca, Barú', hora: '16:30', kicker: 'Boda frente al mar', destacada: true,
    momentos: [['16:30', 'Ceremonia en la playa'], ['18:30', 'Cóctel al atardecer'], ['20:00', 'Fiesta']], vestimenta: { etiqueta: 'Playero elegante', colores: ['#F5E6CC', '#3AA6A0', '#FFFFFF'], nota: 'Lino y colores claros. Sandalias bienvenidas.' },
    extras: ['hospedaje'],
  },
  {
    id: 'boda-boho', nombre: 'Boda boho', descripcion: 'Terracota, hojas secas y aire libre', categoria: 'Bodas', tipo: 'boda', kitId: 'boho',
    nombresEjemplo: 'Sara & Tomás', lugarEjemplo: 'Villa de Leyva, Boyacá', hora: '14:00', kicker: 'Celebremos el amor',
    momentos: [['14:00', 'Ceremonia'], ['16:00', 'Almuerzo'], ['19:00', 'Fogata y música']], vestimenta: { etiqueta: 'Boho chic', colores: ['#B5543A', '#D9A066', '#F3E3D3'] },
    extras: ['playlist'],
  },
  {
    id: 'boda-gala', nombre: 'Boda de gala', descripcion: 'Noche elegante con telón y dorado', categoria: 'Bodas', tipo: 'boda', kitId: 'gala',
    nombresEjemplo: 'Isabel & Alejandro', lugarEjemplo: 'Club El Nogal, Bogotá', hora: '19:00', kicker: 'Te invitamos a nuestra boda',
    momentos: [['19:00', 'Ceremonia'], ['20:30', 'Cena de gala'], ['22:00', 'Fiesta']], vestimenta: { etiqueta: 'Etiqueta rigurosa', nota: 'Damas de largo.' },
  },

  // ─────────── XV años ───────────
  {
    id: 'xv-rosa', nombre: 'XV rosa dorado', descripcion: 'Telón, estrellas y vals', categoria: 'XV años', tipo: 'quince_anos', kitId: 'rosa_dorado',
    nombresEjemplo: 'Isabella', lugarEjemplo: 'Salón Los Arcos, Medellín', hora: '20:00', destacada: true,
    momentos: [['20:00', 'Recepción'], ['21:00', 'Vals'], ['23:00', 'Hora loca']], vestimenta: { etiqueta: 'Gala', colores: ['#C2185B', '#D4A373', '#F9E4E6'] },
    ejemplo: { padrinos: [['Juliana Gil', 'Madrina'], ['Andrés Restrepo', 'Padrino'], ['Samuel', 'Chambelán'], ['Mateo', 'Chambelán']] },
  },
  {
    id: 'xv-royal', nombre: 'XV azul royal', descripcion: 'Azul profundo y plata', categoria: 'XV años', tipo: 'quince_anos', kitId: 'azul_royal',
    nombresEjemplo: 'Valeria', lugarEjemplo: 'Hotel Dann Carlton, Barranquilla', hora: '20:00', kicker: 'Mis quince',
    momentos: [['20:00', 'Recepción'], ['21:00', 'Vals'], ['22:00', 'Cena'], ['23:30', 'Fiesta']], vestimenta: { etiqueta: 'Gala', nota: 'Damas de largo.' },
  },
  {
    id: 'xv-mariposas', nombre: 'XV mariposas', descripcion: 'Lila y rosa, delicada y tierna', categoria: 'XV años', tipo: 'quince_anos', kitId: 'lila_mariposas',
    nombresEjemplo: 'Mariana', lugarEjemplo: 'Finca La Mariposa, Cali', hora: '19:00',
    momentos: [['19:00', 'Llegada'], ['20:00', 'Vals'], ['21:00', 'Fiesta']], vestimenta: { etiqueta: 'Elegante', colores: ['#8E5CC5', '#E5A3D1'] },
  },
  {
    id: 'xv-neon', nombre: 'XV neón', descripcion: 'Fiesta moderna con luces neón', categoria: 'XV años', tipo: 'quince_anos', kitId: 'neon_xv',
    nombresEjemplo: 'Sofía', lugarEjemplo: 'Discoteca Glow, Bogotá', hora: '20:00', kicker: '¡Mis 15!',
    momentos: [['20:00', 'Llegada'], ['21:00', 'Vals moderno'], ['22:00', 'Fiesta neón']], vestimenta: { etiqueta: 'Fiesta: algo que brille' },
    extras: ['playlist'],
  },

  // ─────────── Infantiles ───────────
  {
    id: 'inf-princesa', nombre: 'Fiesta de princesas', descripcion: 'Para niñas de 3 a 8 años', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa',
    nombresEjemplo: 'Mis 5 años · Emilia', lugarEjemplo: 'Salón de juegos Mundo Mágico', hora: '15:00', destacada: true,
    vestimenta: { etiqueta: 'Ven vestida de princesa' }, regalos: ['Muñeca', 'Kit de manualidades', 'Libro de cuentos'],
  },
  {
    id: 'inf-unicornio', nombre: 'Unicornio mágico', descripcion: 'Pastel, estrellas y mucha fantasía', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'unicornio',
    nombresEjemplo: 'Mis 6 años · Luciana', lugarEjemplo: 'Casa de la abuela', hora: '15:00', kicker: '¡Una fiesta mágica!',
    vestimenta: { etiqueta: 'Ropa cómoda para jugar' }, regalos: ['Peluche de unicornio', 'Plastilina', 'Set de colores'],
  },
  {
    id: 'inf-sirena', nombre: 'Sirenita', descripcion: 'Fiesta bajo el mar, ideal con piscina', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'sirena',
    nombresEjemplo: 'Mis 7 años · Antonella', lugarEjemplo: 'Club campestre, piscina infantil', hora: '14:00', kicker: 'Fiesta bajo el mar',
    vestimenta: { etiqueta: 'Trae vestido de baño y toalla' },
  },
  {
    id: 'inf-superheroes', nombre: 'Superhéroes', descripcion: 'Para niños de 4 a 10 años', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'superheroes',
    nombresEjemplo: 'Mis 6 años · Samuel', lugarEjemplo: 'Parque de los niños', hora: '15:00', kicker: '¡Misión cumpleaños!', destacada: true,
    vestimenta: { etiqueta: 'Ven disfrazado de tu héroe favorito' }, regalos: ['Figura de acción', 'Lego', 'Balón'],
  },
  {
    id: 'inf-dinos', nombre: 'Dinosaurios', descripcion: 'Aventura jurásica en la selva', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'dinosaurios',
    nombresEjemplo: 'Mis 4 años · Martín', lugarEjemplo: 'Jardín de la casa', hora: '15:00', kicker: '¡Rugido de fiesta!',
    vestimenta: { etiqueta: 'Ropa cómoda para explorar' }, regalos: ['Dinosaurios de juguete', 'Libro de dinosaurios', 'Kit de excavación'],
  },
  {
    id: 'inf-espacio', nombre: 'Aventura espacial', descripcion: 'Galaxia, estrellas y cohetes', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'espacio',
    nombresEjemplo: 'Despegamos a los 8 · Jerónimo', lugarEjemplo: 'Planetario de Bogotá', hora: '10:00', kicker: '¡Despegamos!',
    vestimenta: { etiqueta: 'Astronautas bienvenidos' },
  },
  {
    id: 'inf-futbol', nombre: 'Cumple futbolero', descripcion: 'Partido, torta y medallas', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'futbol',
    nombresEjemplo: 'Mis 9 años · Juan José', lugarEjemplo: 'Cancha sintética La 70', hora: '14:00', kicker: '¡Golazo de cumpleaños!',
    momentos: [['14:00', 'Calentamiento'], ['14:30', 'Partido'], ['16:00', 'Torta y premiación']], vestimenta: { etiqueta: 'Ropa deportiva y guayos' },
  },
  {
    id: 'inf-primer-anito', nombre: 'Mi primer añito', descripcion: 'Tierno, con globos y colores suaves', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'primer_anito',
    nombresEjemplo: 'Mi primer añito · Salomé', lugarEjemplo: 'Casa de los papás', hora: '11:00', kicker: 'Mi primer añito', destacada: true,
    momentos: [['11:00', 'Llegada'], ['12:00', 'Almuerzo'], ['13:00', 'Torta']], regalos: ['Ropa talla 18 meses', 'Juguete didáctico', 'Libro de tela'],
  },
  {
    id: 'inf-gamer', nombre: 'Fiesta gamer', descripcion: 'Para preadolescentes de 10 a 14', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'gamer',
    nombresEjemplo: 'Nivel 12 · Matías', lugarEjemplo: 'Sala de videojuegos Arena', hora: '16:00', kicker: 'Nivel desbloqueado',
    momentos: [['16:00', 'Torneo'], ['18:00', 'Pizza y torta']],
  },

  // ─────────── Más bodas ───────────
  {
    id: 'boda-esmeralda', nombre: 'Boda esmeralda', descripcion: 'Verde esmeralda y oro, elegante y sobria', categoria: 'Bodas', tipo: 'boda', kitId: 'esmeralda',
    nombresEjemplo: 'Daniela & Camilo', lugarEjemplo: 'Club El Rancho, Bogotá', hora: '18:00',
    momentos: [['18:00', 'Ceremonia'], ['19:30', 'Cena'], ['21:00', 'Fiesta']], vestimenta: { etiqueta: 'Formal', nota: 'Evita el verde esmeralda: es el color de la novia.' }, extras: ['padrinos', 'hospedaje'],
  },
  {
    id: 'boda-champana', nombre: 'Boda champaña', descripcion: 'Luminosa, en tonos champaña y perla', categoria: 'Bodas', tipo: 'boda', kitId: 'champana',
    nombresEjemplo: 'Mariana & Felipe', lugarEjemplo: 'Hacienda Fagua, Chía', hora: '16:00',
    momentos: [['16:00', 'Ceremonia'], ['17:30', 'Cóctel'], ['19:00', 'Cena y baile']], vestimenta: { etiqueta: 'Formal de día' }, extras: ['historia'],
    ejemplo: { historia: 'Nos conocimos en la universidad y desde entonces cada brindis lo hemos hecho juntos.' },
  },
  {
    id: 'boda-civil', nombre: 'Boda civil', descripcion: 'Íntima y minimalista, para la notaría y un almuerzo', categoria: 'Bodas', tipo: 'boda', kitId: 'minimal',
    nombresEjemplo: 'Ana & Luis', lugarEjemplo: 'Notaría 21 y almuerzo en Usaquén', hora: '11:00', kicker: 'Nos casamos por lo civil',
    momentos: [['11:00', 'Firma en la notaría'], ['13:00', 'Almuerzo']],
  },
  {
    id: 'boda-tropical', nombre: 'Boda tropical', descripcion: 'Colores vivos y palmeras para tierra caliente', categoria: 'Bodas', tipo: 'boda', kitId: 'tropical',
    nombresEjemplo: 'Sara & Julián', lugarEjemplo: 'Finca Los Almendros, Santa Fe de Antioquia', hora: '17:00',
    momentos: [['17:00', 'Ceremonia al aire libre'], ['19:00', 'Fiesta']], vestimenta: { etiqueta: 'Ropa fresca y colorida' }, extras: ['hospedaje'],
  },

  // ─────────── Más XV años ───────────
  {
    id: 'xv-champana', nombre: 'XV champaña', descripcion: 'Delicada y brillante, tonos champaña', categoria: 'XV años', tipo: 'quince_anos', kitId: 'champana',
    nombresEjemplo: 'Mis XV · Gabriela', lugarEjemplo: 'Salón Real, Hotel Dann', hora: '20:00', kicker: 'Mis quince años',
    momentos: [['20:00', 'Entrada'], ['20:30', 'Vals'], ['21:30', 'Fiesta']], vestimenta: { etiqueta: 'Elegante' }, extras: ['padrinos', 'galeria_fotos'],
  },
  {
    id: 'xv-gala', nombre: 'XV de gala', descripcion: 'Noche de gala en negro y dorado', categoria: 'XV años', tipo: 'quince_anos', kitId: 'gala',
    nombresEjemplo: 'Mis XV · Valentina', lugarEjemplo: 'Club Campestre, Medellín', hora: '20:00', kicker: 'Una noche de gala',
    momentos: [['20:00', 'Recepción'], ['21:00', 'Vals y brindis'], ['22:00', 'Hora loca']], vestimenta: { etiqueta: 'Gala' }, extras: ['playlist'],
  },
  {
    id: 'xv-princesa', nombre: 'XV de princesa', descripcion: 'Palacio animado en morado y dorado', categoria: 'XV años', tipo: 'quince_anos', kitId: 'princesa_real',
    nombresEjemplo: 'Mis XV · Isabella', lugarEjemplo: 'Hacienda Santa Bárbara', hora: '19:30', kicker: 'Te invito a mi palacio',
    momentos: [['19:30', 'Llegada'], ['20:30', 'Vals'], ['21:30', 'Fiesta']], vestimenta: { etiqueta: 'Elegante', colores: ['#7E22CE', '#FBBF24'] }, extras: ['padrinos'],
  },

  // ─────────── Más infantiles ───────────
  {
    id: 'inf-safari', nombre: 'Safari', descripcion: 'Aventura entre leones, jirafas y selva', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'safari',
    nombresEjemplo: 'Mis 3 años · Tomás', lugarEjemplo: 'Parque Jaime Duque', hora: '11:00', kicker: 'Aventura safari',
    vestimenta: { etiqueta: 'Ropa de explorador' }, regalos: ['Animales de juguete', 'Binoculares', 'Libro de animales'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-osito', nombre: 'Osito tierno', descripcion: 'Azul suave para los más pequeños', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'osito_azul',
    nombresEjemplo: 'Mis 2 años · Lucas', lugarEjemplo: 'Casa de los abuelos', hora: '15:00',
    regalos: ['Peluche', 'Bloques de construcción', 'Libro de tela'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-pop', nombre: 'Fiesta pop infantil', descripcion: 'Colores vivos, confeti y mucha energía', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'pop',
    nombresEjemplo: 'Mis 8 años · Sara', lugarEjemplo: 'Trampolines Jump Park', hora: '14:00', kicker: '¡A saltar!',
    momentos: [['14:00', 'Trampolines'], ['16:00', 'Torta']], vestimenta: { etiqueta: 'Medias antideslizantes' },
  },
  {
    id: 'inf-mariposas', nombre: 'Mariposas', descripcion: 'Lila y rosa con mariposas, dulce y alegre', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'lila_mariposas',
    nombresEjemplo: 'Mis 5 años · Abril', lugarEjemplo: 'Jardín Botánico, kiosco 3', hora: '10:00',
    vestimenta: { etiqueta: 'Toques lila' }, extras: ['galeria_fotos'],
  },

  // ─────────── Más cumpleaños ───────────
  {
    id: 'cumple-30', nombre: 'Mis 30 de gala', descripcion: 'Noche elegante en negro y dorado', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'gala',
    nombresEjemplo: 'Los 30 de Natalia', lugarEjemplo: 'Rooftop Hotel B3', hora: '20:00', kicker: 'Treinta y fabulosa',
    vestimenta: { etiqueta: 'Elegante en negro' }, extras: ['playlist', 'vaca_regalo'],
  },
  {
    id: 'cumple-playa', nombre: 'Cumple en la playa', descripcion: 'Sol, mar y atardecer caribeño', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'playa',
    nombresEjemplo: 'Los 40 de Carlos', lugarEjemplo: 'Playa Blanca, Barú', hora: '12:00',
    momentos: [['12:00', 'Lancha desde el muelle'], ['13:00', 'Almuerzo en la playa'], ['17:30', 'Atardecer']], vestimenta: { etiqueta: 'Blanco y ropa de playa' }, extras: ['hospedaje'],
  },
  {
    id: 'cumple-asado', nombre: 'Cumple con asado', descripcion: 'Parrilla, piscina y amigos en la finca', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'asado',
    nombresEjemplo: 'Los 35 de Juan Pablo', lugarEjemplo: 'Finca El Retiro, Girardot', hora: '11:00',
    momentos: [['11:00', 'Piscina'], ['14:00', 'Asado'], ['18:00', 'Torta']], vestimenta: { etiqueta: 'Trae vestido de baño' }, extras: ['vaca_regalo'],
  },
  {
    id: 'cumple-neon', nombre: 'Cumple neón', descripcion: 'Luces de neón y fiesta toda la noche', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'neon_xv',
    nombresEjemplo: 'Los 25 de Laura', lugarEjemplo: 'Discoteca La Octava', hora: '21:00', kicker: 'Que brille la noche',
    vestimenta: { etiqueta: 'Algo que brille' }, extras: ['playlist'],
  },
  {
    id: 'cumple-tropical', nombre: 'Cumple tropical', descripcion: 'Frutas, flores y colores de verano', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'tropical',
    nombresEjemplo: 'Los 28 de Sofía', lugarEjemplo: 'Terraza de la casa', hora: '15:00',
    vestimenta: { etiqueta: 'Estampados tropicales' }, extras: ['playlist'],
  },
  {
    id: 'cumple-60', nombre: 'Sesenta años de historia', descripcion: 'Brindis clásico para celebrar a los papás o abuelos', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'champana',
    nombresEjemplo: 'Los 60 de Martha', lugarEjemplo: 'Restaurante La Fragata', hora: '13:00', kicker: 'Celebremos su vida',
    extras: ['galeria_fotos', 'mensaje_libre'], ejemplo: { mensaje: ['Gracias por tanto amor y tantos años de alegría.', 'Tus hijos y nietos'] },
  },

  // ─────────── Más bebés ───────────
  {
    id: 'baby-safari', nombre: 'Baby shower safari', descripcion: 'Animalitos de la selva en tonos tierra', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'safari',
    nombresEjemplo: 'Baby shower de Martín', lugarEjemplo: 'Casa de la tía Ana', hora: '15:00',
    regalos: ['Pañales etapa 1', 'Body de algodón', 'Cobija'], extras: ['lista_regalos', 'juego_adivinar'],
  },
  {
    id: 'baby-boho', nombre: 'Baby shower boho', descripcion: 'Terracota y pampas, moderno y cálido', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'boho',
    nombresEjemplo: 'Baby shower de Luna', lugarEjemplo: 'Café Origen, Envigado', hora: '10:00',
    regalos: ['Portabebé', 'Ropa de 0 a 3 meses', 'Libros de cartón'], extras: ['lista_regalos'],
  },
  {
    id: 'baby-mariposas', nombre: 'Baby shower mariposas', descripcion: 'Lila con mariposas para una niña', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'lila_mariposas',
    nombresEjemplo: 'Baby shower de Antonia', lugarEjemplo: 'Salón de eventos del conjunto', hora: '15:00',
    regalos: ['Pañales etapa 2', 'Bañera', 'Monitor de bebé'], extras: ['lista_regalos', 'juego_adivinar'],
  },
  {
    id: 'revelacion-nube', nombre: 'Revelación entre nubes', descripcion: 'Pastel y suave para descubrir si es niño o niña', categoria: 'Bebés', tipo: 'revelacion_genero', kitId: 'nube',
    nombresEjemplo: '¿Niño o niña? · Familia Rojas', lugarEjemplo: 'Parque de la 93', hora: '16:00', kicker: '¿Lazo o corbatín?',
    extras: ['juego_adivinar'],
  },

  // ─────────── Más religiosas ───────────
  {
    id: 'bautizo-nube', nombre: 'Bautizo entre nubes', descripcion: 'Tierno y celestial, colores pastel', categoria: 'Religiosas', tipo: 'bautizo', kitId: 'nube',
    nombresEjemplo: 'Bautizo de Samuel', lugarEjemplo: 'Parroquia Santa Teresita', hora: '10:00',
    momentos: [['10:00', 'Ceremonia'], ['12:00', 'Almuerzo familiar']], extras: ['padrinos'],
  },
  {
    id: 'comunion-clasica', nombre: 'Primera comunión clásica', descripcion: 'Blanco y oro, solemne y elegante', categoria: 'Religiosas', tipo: 'primera_comunion', kitId: 'iglesia',
    nombresEjemplo: 'Primera comunión de Valeria', lugarEjemplo: 'Iglesia de Lourdes', hora: '09:00',
    momentos: [['09:00', 'Misa'], ['11:30', 'Celebración']], extras: ['padrinos', 'mensaje_libre'],
    ejemplo: { mensaje: ['Dejen que los niños vengan a mí.', 'Mateo 19:14'] },
  },
  {
    id: 'bautizo-rustico', nombre: 'Bautizo campestre', descripcion: 'Rústico y cálido, para celebrar en la finca', categoria: 'Religiosas', tipo: 'bautizo', kitId: 'rustico',
    nombresEjemplo: 'Bautizo de Emilia', lugarEjemplo: 'Capilla de la finca San José', hora: '11:00',
    momentos: [['11:00', 'Ceremonia'], ['13:00', 'Almuerzo campestre']], extras: ['padrinos'],
  },

  // ─────────── Más celebraciones ───────────
  {
    id: 'aniversario-oro', nombre: 'Bodas de oro', descripcion: 'Cincuenta años de amor, en dorado', categoria: 'Celebraciones', tipo: 'aniversario', kitId: 'champana',
    nombresEjemplo: 'Gloria & Hernando · 50 años', lugarEjemplo: 'Club Militar', hora: '13:00', kicker: '50 años juntos',
    extras: ['historia', 'galeria_fotos'], ejemplo: { historia: 'Se casaron en 1977 en Tunja. Cinco hijos, nueve nietos y medio siglo de amor después, queremos celebrarlos.' },
  },
  {
    id: 'despedida-playa', nombre: 'Despedida en la playa', descripcion: 'Último viaje de soltera con las amigas', categoria: 'Celebraciones', tipo: 'despedida_soltera', kitId: 'playa',
    nombresEjemplo: 'La despedida de Caro', lugarEjemplo: 'Santa Marta, Rodadero', hora: '10:00', kicker: 'Último viaje de soltera',
    vestimenta: { etiqueta: 'Blanco para la novia, rosa para las amigas' }, extras: ['hospedaje', 'vaca_regalo'],
  },
  {
    id: 'grado-gala', nombre: 'Grado de gala', descripcion: 'Celebración de grado en negro y dorado', categoria: 'Celebraciones', tipo: 'grado', kitId: 'gala',
    nombresEjemplo: 'Grado de Juliana · Medicina', lugarEjemplo: 'Restaurante Andrés DC', hora: '19:00', kicker: '¡Lo logré!',
    vestimenta: { etiqueta: 'Elegante' }, extras: ['galeria_fotos'],
  },
  {
    id: 'amor-amistad', nombre: 'Amor y amistad', descripcion: 'Celebración de septiembre con amigos', categoria: 'Celebraciones', tipo: 'amor_amistad', kitId: 'amor_amistad',
    nombresEjemplo: 'Amor y amistad · Los de siempre', lugarEjemplo: 'Casa de Pipe', hora: '19:00', kicker: 'Celebremos la amistad',
    extras: ['juego_adivinar', 'playlist'],
  },

  // ─────────── Más salidas ───────────
  {
    id: 'paseo-playa', nombre: 'Paseo a la playa', descripcion: 'Plan de amigos o familia al mar', categoria: 'Salidas', tipo: 'paseo', kitId: 'playa',
    nombresEjemplo: 'Paseo a Coveñas', lugarEjemplo: 'Coveñas, Sucre', hora: '06:00', kicker: '¡Nos vamos al mar!',
    momentos: [['06:00', 'Salida en bus'], ['13:00', 'Llegada al hotel']], extras: ['hospedaje', 'vaca_regalo'],
  },
  {
    id: 'camping', nombre: 'Fin de semana de camping', descripcion: 'Carpa, fogata y estrellas', categoria: 'Salidas', tipo: 'paseo', kitId: 'rustico',
    nombresEjemplo: 'Camping en Guatavita', lugarEjemplo: 'Camping Las Águilas, Guatavita', hora: '08:00',
    momentos: [['08:00', 'Salida'], ['10:30', 'Armar carpas'], ['19:00', 'Fogata']], vestimenta: { etiqueta: 'Ropa abrigada y botas' }, extras: ['vaca_regalo'],
  },
  {
    id: 'viaje-tropical', nombre: 'Viaje de amigos', descripcion: 'Itinerario de viaje, hotel y vaca para los gastos', categoria: 'Salidas', tipo: 'paseo', kitId: 'tropical',
    nombresEjemplo: 'San Andrés 2027', lugarEjemplo: 'San Andrés Isla', hora: '05:00', kicker: 'Rumbo a la isla',
    momentos: [['05:00', 'Vuelo'], ['10:00', 'Check-in'], ['15:00', 'Tour en lancha']], extras: ['hospedaje', 'vaca_regalo'],
  },

  // ─────────── Más diciembre ───────────
  {
    id: 'velitas', nombre: 'Noche de velitas', descripcion: 'Alumbrado del 7 de diciembre en familia', categoria: 'Diciembre', tipo: 'navidad', kitId: 'fin_de_ano',
    nombresEjemplo: 'Noche de velitas · Familia Gómez', lugarEjemplo: 'Frente a la casa de los abuelos', hora: '18:30', kicker: '7 de diciembre',
    momentos: [['18:30', 'Encendido de velas'], ['19:30', 'Natilla y buñuelos']],
  },
  {
    id: 'cena-navidad', nombre: 'Cena de Navidad', descripcion: 'Elegante, en negro y dorado, para el 24', categoria: 'Diciembre', tipo: 'navidad', kitId: 'gala',
    nombresEjemplo: 'Navidad en familia', lugarEjemplo: 'Casa de los tíos', hora: '20:00', kicker: 'Nochebuena',
    momentos: [['20:00', 'Novena'], ['21:00', 'Cena'], ['00:00', 'Regalos']], extras: ['juego_adivinar'],
  },
  {
    id: 'navidad-nieve', nombre: 'Navidad de cristal', descripcion: 'Copos de nieve y aurora animados', categoria: 'Diciembre', tipo: 'navidad', kitId: 'princesa_hielo',
    nombresEjemplo: 'Navidad de los niños', lugarEjemplo: 'Salón comunal del conjunto', hora: '16:00', kicker: 'Una Navidad mágica',
    momentos: [['16:00', 'Llegada de Papá Noel'], ['17:00', 'Entrega de regalos']],
  },

  // ─────────── Más empresa ───────────
  {
    id: 'empresa-fin-de-ano', nombre: 'Fiesta de fin de año', descripcion: 'Celebración de cierre de año del equipo', categoria: 'Empresa', tipo: 'corporativo', kitId: 'fin_de_ano',
    nombresEjemplo: 'Fiesta de fin de año · Grupo Andes', lugarEjemplo: 'Hotel Tequendama, salón Rojo', hora: '19:00', kicker: 'Gracias por este año',
    momentos: [['19:00', 'Bienvenida'], ['20:00', 'Reconocimientos'], ['21:00', 'Cena y baile']], vestimenta: { etiqueta: 'Elegante' },
  },
  {
    id: 'empresa-lanzamiento', nombre: 'Lanzamiento de producto', descripcion: 'Moderna y limpia, para presentar algo nuevo', categoria: 'Empresa', tipo: 'corporativo', kitId: 'minimal',
    nombresEjemplo: 'Lanzamiento App Mercado 2.0', lugarEjemplo: 'Ágora Bogotá', hora: '09:00', kicker: 'Te presentamos lo nuevo',
    momentos: [['09:00', 'Registro'], ['09:30', 'Presentación'], ['11:00', 'Networking']],
  },
  {
    id: 'empresa-integracion', nombre: 'Integración del equipo', descripcion: 'Asado y juegos para integrar al equipo', categoria: 'Empresa', tipo: 'corporativo', kitId: 'asado',
    nombresEjemplo: 'Integración Equipo Ventas', lugarEjemplo: 'Finca La Esperanza, La Calera', hora: '09:00',
    momentos: [['09:00', 'Salida en bus'], ['11:00', 'Juegos por equipos'], ['13:00', 'Asado']], vestimenta: { etiqueta: 'Ropa deportiva' },
  },
  {
    id: 'empresa-gala', nombre: 'Gala de premiación', descripcion: 'Noche de reconocimientos en negro y dorado', categoria: 'Empresa', tipo: 'corporativo', kitId: 'gala',
    nombresEjemplo: 'Premios Excelencia 2027', lugarEjemplo: 'Teatro Colsubsidio', hora: '19:00', kicker: 'Noche de premiación',
    vestimenta: { etiqueta: 'Etiqueta' },
  },

  // ─────────── Halloween / Día de brujas ───────────
  {
    id: 'hw-dulce-truco', nombre: 'Dulce o truco', descripcion: 'Halloween infantil con calabazas y murciélagos animados', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_calabazas',
    nombresEjemplo: 'Halloween de los primos', lugarEjemplo: 'Casa de la abuela Marta', hora: '16:00', kicker: '¡Dulce o truco!', destacada: true,
    momentos: [['16:00', 'Llegada disfrazados'], ['16:30', 'Recorrido de dulces'], ['17:30', 'Concurso de disfraces']],
    vestimenta: { etiqueta: 'Disfraz obligatorio', nota: 'Trae tu calabaza o bolsa para los dulces.' }, extras: ['juego_adivinar'],
  },
  {
    id: 'hw-fantasmitas', nombre: 'Fantasmitas', descripcion: 'Tierno, para los más pequeños, sin sustos', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_fantasmitas',
    nombresEjemplo: 'Halloween de los peques', lugarEjemplo: 'Jardín infantil Pasitos', hora: '10:00', kicker: '¡Bu! Estás invitado',
    momentos: [['10:00', 'Desfile de disfraces'], ['11:00', 'Manualidades de calabaza'], ['12:00', 'Merienda']],
    vestimenta: { etiqueta: 'Disfraz tierno y cómodo' },
  },
  {
    id: 'hw-conjunto', nombre: 'Halloween en el conjunto', descripcion: 'Recorrido de dulces por las torres del conjunto', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_fantasmitas',
    nombresEjemplo: 'Halloween Conjunto Los Robles', lugarEjemplo: 'Salón comunal, Conjunto Los Robles', hora: '17:00', kicker: '¡Niños del conjunto, a disfrazarse!', destacada: true,
    momentos: [['17:00', 'Encuentro en el salón comunal'], ['17:30', 'Recorrido por las torres'], ['19:00', 'Premiación del mejor disfraz']],
    vestimenta: { etiqueta: 'Disfraz y linterna', nota: 'Los niños siempre acompañados de un adulto.' }, extras: ['juego_adivinar'],
  },
  {
    id: 'hw-noche-brujas', nombre: 'Noche de brujas', descripcion: 'Fiesta de disfraces para adultos con caldero animado', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_brujas',
    nombresEjemplo: 'Noche de brujas 2027', lugarEjemplo: 'Casa de Laura, Chapinero', hora: '20:00', kicker: 'El caldero ya está hirviendo',
    momentos: [['20:00', 'Pócimas de bienvenida'], ['21:30', 'Concurso de disfraces'], ['22:00', 'Fiesta hasta el amanecer']],
    vestimenta: { etiqueta: 'Disfraz obligatorio · sin disfraz no entras' }, extras: ['playlist', 'juego_adivinar'],
  },
  {
    id: 'hw-terror', nombre: 'Noche del terror', descripcion: 'Elegante y oscura, con casa embrujada animada', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_terror',
    nombresEjemplo: 'Noche del terror', lugarEjemplo: 'Casona La Candelaria', hora: '21:00', kicker: 'Si te atreves…',
    momentos: [['21:00', 'Entrada a la casona'], ['22:00', 'Cena de las ánimas'], ['23:00', 'Fiesta']],
    vestimenta: { etiqueta: 'Disfraz de terror', colores: ['#0A0A0A', '#B91C1C'], nota: 'Solo mayores de 18.' }, extras: ['playlist'],
  },
  {
    id: 'hw-neon', nombre: 'Halloween neón', descripcion: 'Monster party con DJ y luces de neón', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_neon',
    nombresEjemplo: 'Monster Party', lugarEjemplo: 'Terraza Zona T, Bogotá', hora: '21:00', kicker: 'Monster party',
    momentos: [['21:00', 'Puertas abiertas'], ['22:00', 'DJ set'], ['00:00', 'Premio al mejor disfraz']],
    vestimenta: { etiqueta: 'Disfraz con algo que brille en la oscuridad' }, extras: ['playlist', 'vaca_regalo'],
  },
  {
    id: 'hw-bebe', nombre: 'Mi primer Halloween', descripcion: 'Para el primer Halloween del bebé, tierno y naranja', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_bebe',
    nombresEjemplo: 'Calabacita Emma', lugarEjemplo: 'Casa de los papás', hora: '15:00', kicker: 'Mi primer Halloween',
    momentos: [['15:00', 'Sesión de fotos disfrazados'], ['16:00', 'Onces y torta de calabaza']],
    vestimenta: { etiqueta: 'Toques naranja o morado' }, extras: ['galeria_fotos'],
  },
  {
    id: 'hw-oficina', nombre: 'Halloween en la oficina', descripcion: 'Concurso de disfraces y dulces para el equipo', categoria: 'Halloween', tipo: 'corporativo', kitId: 'hw_calabazas',
    nombresEjemplo: 'Halloween Equipo Andes', lugarEjemplo: 'Piso 8, sala de eventos', hora: '15:00', kicker: 'Hoy se viene disfrazado',
    momentos: [['15:00', 'Desfile por áreas'], ['16:00', 'Premiación'], ['16:30', 'Dulces para los hijos del equipo']],
    vestimenta: { etiqueta: 'Disfraz por áreas o individual' }, extras: ['juego_adivinar'],
  },
  {
    id: 'hw-cumple', nombre: 'Cumpleaños de terror', descripcion: 'Cumpleaños con temática de Halloween para grandes', categoria: 'Halloween', tipo: 'cumpleanos', kitId: 'hw_brujas',
    nombresEjemplo: 'Los 30 de Andrés', lugarEjemplo: 'Bar El Hechizo', hora: '20:00', kicker: 'Un cumpleaños de miedo',
    vestimenta: { etiqueta: 'Disfraz de miedo' }, extras: ['playlist'],
  },
  // Superhéroes y princesas con fondo animado (dibujos originales, sin personajes con derechos de autor)
  {
    id: 'inf-heroe-comic', nombre: 'Héroe de cómic', descripcion: 'Fondo de cómic animado: ¡POW! ¡ZAS! ¡BOOM!', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_comic',
    nombresEjemplo: 'Mis 7 años · Tomás', lugarEjemplo: 'Salón de fiestas Pequeños Gigantes', hora: '15:00', kicker: '¡Misión cumpleaños!', destacada: true,
    momentos: [['15:00', 'Entrenamiento de héroes'], ['16:30', 'Torta y piñata']],
    vestimenta: { etiqueta: 'Ven con tu capa o tu disfraz de héroe' }, regalos: ['Figura de acción', 'Lego', 'Capa y antifaz'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-heroe-ciudad', nombre: 'Héroe de la ciudad', descripcion: 'Ciudad de noche animada con un héroe volando', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_ciudad',
    nombresEjemplo: 'Mis 6 años · Samuel', lugarEjemplo: 'Parque de los niños', hora: '16:00', kicker: '¡Al rescate!',
    momentos: [['16:00', 'Misión: juegos'], ['17:30', 'Torta de héroes']],
    vestimenta: { etiqueta: 'Disfraz de superhéroe' }, regalos: ['Linterna de héroe', 'Rompecabezas', 'Cómic'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-heroe-trueno', nombre: 'Trueno y relámpago', descripcion: 'Tormenta de rayos animada para héroes poderosos', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_trueno',
    nombresEjemplo: 'Mis 8 años · Emiliano', lugarEjemplo: 'Casa del árbol, Chía', hora: '15:00', kicker: '¡Que retumbe la fiesta!',
    vestimenta: { etiqueta: 'Trae tu martillo, escudo o capa' }, extras: ['juego_adivinar'],
  },
  {
    id: 'inf-heroe-fuerza', nombre: 'Fuerza verde', descripcion: 'Cómic animado en verde y morado, ¡con mucha fuerza!', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_fuerza',
    nombresEjemplo: 'Mis 5 años · Nicolás', lugarEjemplo: 'Parque inflable Brinca Brinca', hora: '14:00', kicker: '¡Fuerza de cumpleaños!',
    momentos: [['14:00', 'Inflables'], ['15:30', 'Torta y sorpresas']],
    vestimenta: { etiqueta: 'Ropa cómoda para saltar' }, regalos: ['Muñeco de acción', 'Plastilina', 'Carro a control remoto'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-heroe-telarana', nombre: 'Héroe de telaraña', descripcion: 'Fiesta de superhéroe: ciudad de cómic, telarañas y un héroe que se columpia', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_telarana',
    nombresEjemplo: 'Mis 6 años · Mateo', lugarEjemplo: 'Salón de fiestas Ciudad Aventura', hora: '15:00', kicker: '¡Únete a mi equipo de héroes!', destacada: true,
    momentos: [['15:00', 'Entrenamiento de héroes'], ['16:00', 'Misión: rescatar la piñata'], ['17:00', 'Torta de héroes']],
    vestimenta: { etiqueta: 'Ven disfrazado de tu héroe favorito', colores: ['#DC2626', '#1D4ED8'] }, regalos: ['Figura de acción', 'Capa y antifaz', 'Rompecabezas de la ciudad'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-heroe-aranas', nombre: 'Arañitas héroes', descripcion: 'Telarañas, arañitas con antifaz y Arañín columpiándose en la ciudad', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_aranas',
    nombresEjemplo: 'Mis 6 años · Mateo', lugarEjemplo: 'Salón de fiestas Ciudad Aventura', hora: '15:00', kicker: '¡Atrapados en la diversión!', destacada: true,
    momentos: [['15:00', 'Entrenamiento arácnido'], ['16:00', 'Juegos y telarañas'], ['17:00', 'Torta y piñata']],
    vestimenta: { etiqueta: 'Ven disfrazado de tu héroe favorito', colores: ['#DC2626', '#2563EB'] }, regalos: ['Figura de acción', 'Lanzador de telarañas de juguete', 'Rompecabezas de la ciudad'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-princesa-castillo', nombre: 'Castillo encantado', descripcion: 'Castillo animado con destellos y corazones', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa_castillo',
    nombresEjemplo: 'Mis 5 años · Isabella', lugarEjemplo: 'Salón Reino Mágico', hora: '15:00', kicker: 'Érase una vez…', destacada: true,
    momentos: [['15:00', 'Llegada al castillo'], ['16:00', 'Baile real'], ['17:00', 'Torta']],
    vestimenta: { etiqueta: 'Ven vestida de princesa o príncipe' }, regalos: ['Corona y varita', 'Muñeca', 'Kit de maquillaje infantil'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-princesa-hielo', nombre: 'Reino de hielo', descripcion: 'Aurora y copos de nieve animados', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa_hielo',
    nombresEjemplo: 'Mis 6 años · Valeria', lugarEjemplo: 'Pista de patinaje Ice Park', hora: '11:00', kicker: 'Una fiesta de cristal',
    vestimenta: { etiqueta: 'Tonos azul y blanco', colores: ['#2563EB', '#A5F3FC', '#FFFFFF'] }, regalos: ['Bola de nieve musical', 'Libro de cuentos', 'Peluche'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-princesa-hadas', nombre: 'Jardín de hadas', descripcion: 'Luciérnagas, flores y mariposas que vuelan', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa_hadas',
    nombresEjemplo: 'Mis 4 años · Sofía', lugarEjemplo: 'Jardín de la casa de los abuelos', hora: '15:00', kicker: 'Un jardín mágico',
    vestimenta: { etiqueta: 'Ven con alas de hada' }, regalos: ['Alas de hada', 'Kit de jardinería infantil', 'Libro de hadas'], extras: ['lista_regalos'],
  },
  {
    id: 'inf-princesa-real', nombre: 'Princesa real', descripcion: 'Palacio animado en morado y dorado', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa_real',
    nombresEjemplo: 'Mis 7 años · Mariana', lugarEjemplo: 'Club Los Lagartos, salón principal', hora: '16:00', kicker: 'Te invito a mi palacio',
    momentos: [['16:00', 'Recepción real'], ['17:00', 'Show de magia'], ['18:00', 'Torta']],
    vestimenta: { etiqueta: 'Elegante de princesa', colores: ['#7E22CE', '#FBBF24', '#F5D0FE'] }, extras: ['galeria_fotos'],
  },

  // ─────────── Cumpleaños de jóvenes y adultos ───────────
  {
    id: 'cumple-pop', nombre: 'Cumple pop', descripcion: 'Colorido, con playlist y vaca', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'pop',
    nombresEjemplo: 'Los 30 de Mateo', lugarEjemplo: 'Terraza Bruma, Chapinero', hora: '21:00', destacada: true,
    ejemplo: { canciones: [['Feliz cumpleaños, ferxxo', 'Feid'], ['La Bicicleta', 'Carlos Vives y Shakira']], vaca: [1500000, 600000, 'Nequi 300 123 4567'] },
  },
  {
    id: 'cumple-disco', nombre: 'Noche disco', descripcion: 'Brillos, dorado y pista de baile', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'disco',
    nombresEjemplo: 'Los 40 de Carolina', lugarEjemplo: 'Bar La Pista, Medellín', hora: '21:00', kicker: 'Noche disco',
    vestimenta: { etiqueta: 'Años 70 y 80', nota: 'Lentejuelas bienvenidas.' },
  },
  {
    id: 'cumple-50', nombre: 'Brindis de 50', descripcion: 'Elegante y sobrio para celebrar en grande', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'vintage',
    nombresEjemplo: 'Los 50 de Ricardo', lugarEjemplo: 'Restaurante Andrés D.C.', hora: '20:00', kicker: 'Brindemos por los 50',
    vestimenta: { etiqueta: 'Elegante casual' },
  },

  // ─────────── Bebés ───────────
  {
    id: 'baby-nube', nombre: 'Baby shower nube', descripcion: 'Neutro, nubes y estrellas', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'nube',
    nombresEjemplo: 'Bebé Emma', lugarEjemplo: 'Casa de los abuelos, Cali', hora: '15:00',
    extras: ['lista_regalos'],
  },
  {
    id: 'baby-osito', nombre: 'Baby shower osito', descripcion: 'Azul cielo para niño', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'osito_azul',
    nombresEjemplo: 'Bebé Joaquín', lugarEjemplo: 'Salón comunal Cedritos', hora: '15:00', kicker: 'Viene un niño',
  },
  {
    id: 'baby-rosa', nombre: 'Lluvia rosa', descripcion: 'Corazones rosa para niña', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'lluvia_rosa',
    nombresEjemplo: 'Bebé Abril', lugarEjemplo: 'Casa de la familia', hora: '15:00', kicker: 'Viene una niña',
  },
  {
    id: 'revelacion', nombre: 'Revelación de género', descripcion: 'Raspa y descubre: ¿niño o niña?', categoria: 'Bebés', tipo: 'revelacion_genero', kitId: 'revelacion',
    nombresEjemplo: 'Familia Gómez Ruiz', lugarEjemplo: 'Casa de la familia', hora: '16:00', destacada: true,
  },

  // ─────────── Religiosas ───────────
  {
    id: 'bautizo', nombre: 'Bautizo', descripcion: 'Celeste y oro, ceremonia y recepción', categoria: 'Religiosas', tipo: 'bautizo', kitId: 'comunion',
    nombresEjemplo: 'Martín', lugarEjemplo: 'Parroquia Santa María', hora: '11:00',
    ejemplo: { padrinos: [['Laura Pérez', 'Madrina'], ['Andrés Gómez', 'Padrino']] },
  },
  {
    id: 'comunion', nombre: 'Primera comunión', descripcion: 'Delicada, con padrinos y mensaje', categoria: 'Religiosas', tipo: 'primera_comunion', kitId: 'comunion',
    nombresEjemplo: 'Valentina', lugarEjemplo: 'Iglesia de La Candelaria', hora: '10:00',
    ejemplo: { mensaje: ['Dejen que los niños vengan a mí.', 'Mateo 19:14'], padrinos: [['Ana María Ruiz', 'Madrina']] },
  },

  // ─────────── Celebraciones ───────────
  {
    id: 'grado', nombre: 'Grado universitario', descripcion: 'Toga, birrete y celebración', categoria: 'Celebraciones', tipo: 'grado', kitId: 'toga',
    nombresEjemplo: 'Camila Rodríguez', lugarEjemplo: 'Auditorio León de Greiff, Universidad Nacional', hora: '10:00', destacada: true,
    ejemplo: { historia: 'Cinco años de esfuerzo, madrugadas y café. Gracias por acompañarme hasta aquí.' },
  },
  {
    id: 'grado-bachiller', nombre: 'Grado de bachiller', descripcion: 'Azul y plata, ceremonia y fiesta', categoria: 'Celebraciones', tipo: 'grado', kitId: 'azul_royal',
    nombresEjemplo: 'Promoción 2026 · Santiago', lugarEjemplo: 'Colegio San José', hora: '09:00', kicker: '¡Por fin bachiller!',
  },
  {
    id: 'despedida', nombre: 'Despedida de soltera', descripcion: 'Fucsia, corazones y plan completo', categoria: 'Celebraciones', tipo: 'despedida_soltera', kitId: 'despedida',
    nombresEjemplo: 'Despedida de Daniela', lugarEjemplo: 'Zona T, Bogotá', hora: '19:00',
  },
  {
    id: 'aniversario-plata', nombre: 'Bodas de plata', descripcion: 'Esmeralda y oro para 25 años', categoria: 'Celebraciones', tipo: 'aniversario', kitId: 'esmeralda',
    nombresEjemplo: 'Rosa & Jorge', lugarEjemplo: 'Restaurante La Fragata', hora: '19:00', kicker: '25 años juntos',
    ejemplo: { historia: 'Veinticinco años, tres hijos y muchas historias. Queremos celebrarlo con quienes nos acompañaron.' },
  },
  {
    id: 'disfraces', nombre: 'Fiesta de disfraces', descripcion: 'Halloween, con premio al mejor disfraz', categoria: 'Celebraciones', tipo: 'disfraces', kitId: 'disfraces',
    nombresEjemplo: 'Noche de brujas', lugarEjemplo: 'Casa de Laura', hora: '20:00',
  },

  // ─────────── Salidas ───────────
  {
    id: 'paseo-rio', nombre: 'Paseo de olla', descripcion: 'Río, sancocho y buena compañía', categoria: 'Salidas', tipo: 'paseo', kitId: 'paseo_rio',
    nombresEjemplo: 'Paseo de olla al río', lugarEjemplo: 'Parque principal de Fusagasugá', hora: '07:00', destacada: true,
    momentos: [['07:00', 'Salida'], ['09:00', 'Llegada al río'], ['13:00', 'Sancocho']],
    ejemplo: { vaca: [600000, 250000, 'Nequi 310 222 3344'] },
  },
  {
    id: 'asado', nombre: 'Asado en la finca', descripcion: 'Domingo de familia y parrilla', categoria: 'Salidas', tipo: 'paseo', kitId: 'asado',
    nombresEjemplo: 'Asado familiar', lugarEjemplo: 'Finca Los Naranjos, La Vega', hora: '11:00', kicker: 'Asado familiar',
    momentos: [['11:00', 'Llegada'], ['13:00', 'Asado'], ['16:00', 'Juegos y piscina']],
  },
  {
    id: 'viaje', nombre: 'Plan de viaje', descripcion: 'Para organizar un viaje con amigos', categoria: 'Salidas', tipo: 'paseo', kitId: 'viaje',
    nombresEjemplo: 'Rumbo a Santa Marta', lugarEjemplo: 'Terminal de Transportes', hora: '06:00', kicker: 'Nos vamos de viaje',
    extras: ['hospedaje'],
  },

  // ─────────── Diciembre ───────────
  {
    id: 'novena', nombre: 'Novena navideña', descripcion: 'Natilla, buñuelos y aguinaldos', categoria: 'Diciembre', tipo: 'navidad', kitId: 'novena',
    nombresEjemplo: 'Familia Rodríguez', lugarEjemplo: 'Casa de la abuela Inés', hora: '19:00', destacada: true,
  },
  {
    id: 'fin-de-ano', nombre: 'Fiesta de fin de año', descripcion: 'Negro y oro para cerrar el año', categoria: 'Diciembre', tipo: 'navidad', kitId: 'fin_de_ano',
    nombresEjemplo: 'Despedimos el 2026', lugarEjemplo: 'Salón de eventos Mirador', hora: '20:00', kicker: 'Fiesta de fin de año',
    momentos: [['20:00', 'Cena'], ['22:00', 'Premiación'], ['23:00', 'Fiesta']],
  },
  {
    id: 'amigo-secreto', nombre: 'Amigo secreto', descripcion: 'Amor y amistad en septiembre', categoria: 'Diciembre', tipo: 'amor_amistad', kitId: 'amor_amistad',
    nombresEjemplo: 'Amor y amistad 2026', lugarEjemplo: 'Oficina, sala de reuniones', hora: '17:00',
  },

  // ─────────── Empresa ───────────
  {
    id: 'empresa', nombre: 'Evento empresarial', descripcion: 'Lanzamientos, foros y cocteles', categoria: 'Empresa', tipo: 'corporativo', kitId: 'protocolo',
    nombresEjemplo: 'Lanzamiento 2027', lugarEjemplo: 'Centro de Convenciones Ágora', hora: '18:00',
    ejemplo: { padrinos: [['María Fernanda Ruiz', 'Gerente general'], ['Carlos Mejía', 'Director de innovación']] },
  },

  // ─────────── Premium: con efectos de movimiento y stickers animados ───────────
  {
    id: 'premium-boda-gala-dorada', nombre: 'Boda de gala dorada', descripcion: 'Destellos dorados, aurora de color y anillos animados', categoria: 'Bodas', tipo: 'boda', kitId: 'champana',
    nombresEjemplo: 'Isabella & Mateo', lugarEjemplo: 'Club El Nogal, Bogotá', hora: '18:00', kicker: 'Nuestra boda', apertura: 'sobre', premium: true, destacada: true,
    momentos: [['18:00', 'Ceremonia'], ['19:30', 'Cóctel'], ['21:00', 'Cena y baile']], vestimenta: { etiqueta: 'Etiqueta rigurosa', colores: ['#C9A227', '#F5EBDD', '#1F2937'] },
    extras: ['padrinos', 'lista_regalos'], regalos: ['Juego de copas de cristal', 'Viaje de luna de miel', 'Vajilla para 12'],
    efectos: {
      particulas: { tipo: 'destellos', cantidad: 'normal' },
      fondoAnimado: 'aurora',
      stickers: [{ stickerId: 'anim_anillos', x: 79, y: 3, ancho: 17 }],
    },
    ejemplo: { historia: 'Un viaje, una canción y una pregunta bajo las estrellas. Ahora queremos celebrarlo con quienes más queremos.', padrinos: [['Daniela Restrepo', 'Madrina'], ['Juan Pablo Gómez', 'Padrino']] },
  },
  {
    id: 'premium-boda-lluvia-petalos', nombre: 'Boda lluvia de pétalos', descripcion: 'Pétalos que caen y corazones que suben', categoria: 'Bodas', tipo: 'boda', kitId: 'jardin',
    nombresEjemplo: 'Sofía & Nicolás', lugarEjemplo: 'Jardín Botánico, Medellín', hora: '16:00', kicker: 'Nos casamos', apertura: 'libro', premium: true,
    momentos: [['16:00', 'Ceremonia en el jardín'], ['18:00', 'Recepción']], vestimenta: { etiqueta: 'Formal de jardín', colores: ['#F9A8D4', '#8BA888', '#FFFFFF'] },
    extras: ['padrinos'],
    efectos: {
      particulas: { tipo: 'petalos', cantidad: 'normal' },
      fondoAnimado: 'degradado',
      stickers: [
        { stickerId: 'anim_corazones', x: 2, y: 2, ancho: 20 },
        { stickerId: 'anim_corazones', x: 78, y: 2, ancho: 20 },
      ],
    },
  },
  {
    id: 'premium-xv-noche-estrellas', nombre: 'XV noche de estrellas', descripcion: 'Estrellas que titilan sobre una aurora de color', categoria: 'XV años', tipo: 'quince_anos', kitId: 'azul_royal',
    nombresEjemplo: 'Mis XV · Valeria', lugarEjemplo: 'Salón Imperial, Cali', hora: '20:00', kicker: 'Mis quince años', apertura: 'telon', premium: true, destacada: true,
    momentos: [['20:00', 'Recepción'], ['21:00', 'Vals'], ['22:00', 'Fiesta']], vestimenta: { etiqueta: 'Gala', colores: ['#1E3A8A', '#C0C0C0', '#FFFFFF'] },
    extras: ['playlist'],
    efectos: {
      particulas: { tipo: 'estrellas', cantidad: 'muchas' },
      fondoAnimado: 'aurora',
      stickers: [{ stickerId: 'anim_estrellas', x: 78, y: 2, ancho: 19 }],
    },
  },
  {
    id: 'premium-xv-mariposas-magicas', nombre: 'XV mariposas mágicas', descripcion: 'Mariposas que vuelan entre destellos', categoria: 'XV años', tipo: 'quince_anos', kitId: 'lila_mariposas',
    nombresEjemplo: 'Mis XV · Mariana', lugarEjemplo: 'Hacienda Los Lagos, Pereira', hora: '19:00', kicker: 'Mis quince años', premium: true,
    momentos: [['19:00', 'Misa de acción de gracias'], ['20:30', 'Vals y fiesta']], vestimenta: { etiqueta: 'Formal', colores: ['#C4B5FD', '#F5D0FE', '#FFFFFF'] },
    efectos: {
      particulas: { tipo: 'destellos', cantidad: 'normal' },
      fondoAnimado: 'degradado',
      stickers: [
        { stickerId: 'anim_mariposa', x: 3, y: 4, ancho: 20, rotacion: -12 },
        { stickerId: 'anim_mariposa', x: 80, y: 78, ancho: 16, rotacion: 14 },
      ],
    },
  },
  {
    id: 'premium-cumple-fiesta-total', nombre: 'Cumpleaños fiesta total', descripcion: 'Confeti, globos que flotan y pastel con velas', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'pop',
    nombresEjemplo: 'Los 30 de Camilo', lugarEjemplo: 'Terraza 93, Bogotá', hora: '20:00', kicker: '¡Vamos de fiesta!', apertura: 'globo', premium: true, destacada: true,
    momentos: [['20:00', 'Llegada'], ['21:00', 'Torta'], ['22:00', 'Rumba']], extras: ['playlist'],
    efectos: {
      particulas: { tipo: 'confeti', cantidad: 'normal' },
      fondoAnimado: 'ondas',
      stickers: [
        { stickerId: 'anim_globos', x: 2, y: 2, ancho: 22 },
        { stickerId: 'anim_pastel', x: 80, y: 78, ancho: 16 },
      ],
    },
    ejemplo: { canciones: [['Vivir mi vida', 'Marc Anthony'], ['La bicicleta', 'Carlos Vives & Shakira']] },
  },
  {
    id: 'premium-infantil-burbujas', nombre: 'Fiesta de burbujas', descripcion: 'Burbujas, globos y un regalo que salta', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'nube',
    nombresEjemplo: 'Sofi cumple 5', lugarEjemplo: 'Parque de diversiones Mundo Aventura', hora: '15:00', kicker: '¡Ven a mi fiesta!', apertura: 'caja', premium: true,
    momentos: [['15:00', 'Juegos'], ['16:30', 'Piñata y torta']], extras: ['lista_regalos'], regalos: ['Set de pintura', 'Libro de cuentos', 'Muñeca'],
    efectos: {
      particulas: { tipo: 'burbujas', cantidad: 'normal' },
      stickers: [
        { stickerId: 'anim_globos', x: 2, y: 2, ancho: 22 },
        { stickerId: 'anim_regalo', x: 81, y: 79, ancho: 15 },
      ],
    },
  },
  {
    id: 'premium-baby-luna', nombre: 'Baby shower bajo la luna', descripcion: 'Luna dormida, estrellas y aurora suave', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'osito_azul',
    nombresEjemplo: 'Baby shower de Emiliano', lugarEjemplo: 'Casa de la abuela, Chía', hora: '15:00', kicker: 'Te esperamos con amor', premium: true,
    momentos: [['15:00', 'Bienvenida'], ['16:00', 'Juegos'], ['17:00', 'Apertura de regalos']], extras: ['lista_regalos'], regalos: ['Pañales etapa 1', 'Cobija suave', 'Coche'],
    efectos: {
      particulas: { tipo: 'estrellas', cantidad: 'pocas' },
      fondoAnimado: 'aurora',
      stickers: [{ stickerId: 'anim_luna', x: 74, y: 2, ancho: 24 }],
    },
  },
  {
    id: 'premium-grado-honor', nombre: 'Grado con honores', descripcion: 'Birrete al aire, confeti y fuegos artificiales', categoria: 'Celebraciones', tipo: 'grado', kitId: 'toga',
    nombresEjemplo: 'Grado de Laura Martínez', lugarEjemplo: 'Auditorio Universidad Nacional', hora: '10:00', kicker: '¡Lo logré!', premium: true,
    momentos: [['10:00', 'Ceremonia de grado'], ['13:00', 'Almuerzo de celebración']],
    efectos: {
      particulas: { tipo: 'confeti', cantidad: 'pocas' },
      stickers: [
        { stickerId: 'anim_birrete', x: 3, y: 2, ancho: 20 },
        { stickerId: 'anim_fuegos', x: 80, y: 77, ancho: 17 },
      ],
    },
  },
  {
    id: 'premium-aniversario-corazones', nombre: 'Aniversario de corazones', descripcion: 'Corazones que suben y un corazón que late', categoria: 'Celebraciones', tipo: 'aniversario', kitId: 'rosa_dorado',
    nombresEjemplo: 'Ana & Jorge · 25 años', lugarEjemplo: 'Restaurante Andrés, Chía', hora: '19:00', kicker: 'Bodas de plata', premium: true,
    momentos: [['19:00', 'Renovación de votos'], ['20:00', 'Cena']],
    efectos: {
      particulas: { tipo: 'corazones', cantidad: 'normal' },
      fondoAnimado: 'degradado',
      stickers: [{ stickerId: 'anim_corazon', x: 80, y: 3, ancho: 15, movimiento: 'flotar' }],
    },
    ejemplo: { historia: 'Veinticinco años, tres hijos y una casa llena de risas. Queremos brindar por todo lo vivido.' },
  },
  {
    id: 'premium-fin-de-ano-brindis', nombre: 'Fin de año con brindis', descripcion: 'Fuegos artificiales, brindis y destellos dorados', categoria: 'Diciembre', tipo: 'navidad', kitId: 'fin_de_ano',
    nombresEjemplo: 'Cena de fin de año', lugarEjemplo: 'Casa de los Rodríguez', hora: '21:00', kicker: '¡Feliz año nuevo!', premium: true,
    momentos: [['21:00', 'Cena'], ['23:55', 'Uvas y cuenta regresiva'], ['00:00', 'Brindis']],
    efectos: {
      particulas: { tipo: 'destellos', cantidad: 'muchas' },
      stickers: [
        { stickerId: 'anim_fuegos', x: 2, y: 2, ancho: 24 },
        { stickerId: 'anim_brindis', x: 81, y: 78, ancho: 16 },
      ],
    },
  },

  // ─────────── Gratis: más temáticas ───────────
  { id: 'boda-vintage', nombre: 'Boda vintage', descripcion: 'Brindis retro en tonos sepia', categoria: 'Bodas', tipo: 'boda', kitId: 'vintage', nombresEjemplo: 'Lucía & Esteban', lugarEjemplo: 'Casa Museo Quinta de Bolívar', hora: '17:30', kicker: 'Nos casamos', momentos: [['17:30', 'Ceremonia'], ['19:00', 'Cena']] },
  { id: 'boda-minimal', nombre: 'Boda minimalista', descripcion: 'Limpia, blanca y moderna', categoria: 'Bodas', tipo: 'boda', kitId: 'minimal', nombresEjemplo: 'Paula & Martín', lugarEjemplo: 'Galería Sextante, Bogotá', hora: '18:00', kicker: 'Nos casamos', momentos: [['18:00', 'Ceremonia'], ['19:30', 'Celebración']] },
  { id: 'xv-esmeralda', nombre: 'XV esmeralda', descripcion: 'Verde esmeralda con detalles dorados', categoria: 'XV años', tipo: 'quince_anos', kitId: 'esmeralda', nombresEjemplo: 'Mis XV · Antonella', lugarEjemplo: 'Club Campestre, Bucaramanga', hora: '20:00', kicker: 'Mis quince años', momentos: [['20:00', 'Recepción'], ['21:00', 'Vals']] },
  { id: 'xv-boho', nombre: 'XV boho', descripcion: 'Terracota, flores secas y aire libre', categoria: 'XV años', tipo: 'quince_anos', kitId: 'boho', nombresEjemplo: 'Mis XV · Salomé', lugarEjemplo: 'Finca La Esperanza, Guatapé', hora: '16:00', kicker: 'Mis quince años' },
  { id: 'inf-piratas', nombre: 'Fiesta pirata', descripcion: 'Mar, tesoros y mucha aventura', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'playa', nombresEjemplo: 'El capitán Tomás cumple 6', lugarEjemplo: 'Club de playa Los Corales', hora: '15:00', kicker: '¡A bordo, grumetes!', momentos: [['15:00', 'Búsqueda del tesoro'], ['16:30', 'Torta']] },
  { id: 'inf-pijamada', nombre: 'Pijamada', descripcion: 'Películas, almohadas y risas', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'nube', nombresEjemplo: 'Pijamada de Sara', lugarEjemplo: 'Casa de Sara', hora: '18:00', kicker: '¡Trae tu pijama!', momentos: [['18:00', 'Llegada'], ['19:00', 'Película y crispetas'], ['09:00', 'Desayuno']] },
  { id: 'inf-circo', nombre: 'Gran circo', descripcion: 'Payasos, malabares y colores', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'pop', nombresEjemplo: 'Martín cumple 4', lugarEjemplo: 'Salón de fiestas Arcoíris', hora: '15:30', kicker: '¡Pasen y vean!' },
  { id: 'inf-granja', nombre: 'La granja', descripcion: 'Animalitos, campo y diversión', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'rustico', nombresEjemplo: 'Juanito cumple 3', lugarEjemplo: 'Granja Las Margaritas, Cota', hora: '11:00', kicker: '¡Vamos a la granja!' },
  { id: 'inf-arcoiris', nombre: 'Arcoíris', descripcion: 'Todos los colores para celebrar', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'unicornio', nombresEjemplo: 'Isabella cumple 5', lugarEjemplo: 'Parque El Virrey', hora: '14:00', kicker: '¡Ven a mi fiesta!' },
  { id: 'cumple-karaoke', nombre: 'Noche de karaoke', descripcion: 'Micrófono abierto y mucha música', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'disco', nombresEjemplo: 'Los 25 de Daniela', lugarEjemplo: 'Karaoke Bar La Voz', hora: '21:00', kicker: '¡A cantar!', extras: ['playlist'] },
  { id: 'cumple-picnic', nombre: 'Picnic en el parque', descripcion: 'Mantel, sol y buena comida', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'jardin', nombresEjemplo: 'Picnic de Andrea', lugarEjemplo: 'Parque Simón Bolívar', hora: '12:00', kicker: 'Celebremos al aire libre' },
  { id: 'cumple-coctel', nombre: 'Cóctel elegante', descripcion: 'Copas, luces bajas y jazz', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'vintage', nombresEjemplo: 'Los 40 de Ricardo', lugarEjemplo: 'Bar Huerta, Medellín', hora: '20:00', kicker: 'Brindemos juntos', vestimenta: { etiqueta: 'Cóctel' } },
  { id: 'cumple-sorpresa', nombre: 'Fiesta sorpresa', descripcion: '¡Shhh! Que no se entere', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'gala', nombresEjemplo: 'Sorpresa para Carolina', lugarEjemplo: 'Apartamento de Laura', hora: '19:00', kicker: 'Es una sorpresa', momentos: [['19:00', 'Llegada (¡puntuales!)'], ['19:30', '¡Sorpresa!']] },
  { id: 'baby-elegante', nombre: 'Baby shower elegante', descripcion: 'Champaña y tonos suaves', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'champana', nombresEjemplo: 'Baby shower de Valentina', lugarEjemplo: 'Hotel Casa Medina', hora: '11:00', kicker: 'Esperamos con amor', extras: ['lista_regalos'] },
  { id: 'revelacion-globos', nombre: 'Revelación con globos', descripcion: '¿Rosa o azul? Lo sabremos juntos', categoria: 'Bebés', tipo: 'revelacion_genero', kitId: 'revelacion', nombresEjemplo: 'Revelación de Camila y Juan', lugarEjemplo: 'Terraza de la familia', hora: '16:00', kicker: '¿Niño o niña?', extras: ['juego_adivinar'] },
  { id: 'grado-preescolar', nombre: 'Grado de transición', descripcion: 'Los más pequeños también se gradúan', categoria: 'Celebraciones', tipo: 'grado', kitId: 'pop', nombresEjemplo: 'Grado de Samuel', lugarEjemplo: 'Colegio Los Alpes', hora: '09:00', kicker: '¡Me gradué!' },
  { id: 'grado-maestria', nombre: 'Grado de maestría', descripcion: 'Sobrio y formal, para un gran logro', categoria: 'Celebraciones', tipo: 'grado', kitId: 'protocolo', nombresEjemplo: 'Mg. Natalia Ríos', lugarEjemplo: 'Aula Máxima, Universidad de los Andes', hora: '17:00', kicker: 'Ceremonia de grado' },
  { id: 'jubilacion', nombre: 'Celebración de jubilación', descripcion: 'Una vida de trabajo merece un brindis', categoria: 'Celebraciones', tipo: 'otro', kitId: 'vintage', nombresEjemplo: 'La jubilación de Hernando', lugarEjemplo: 'Restaurante El Cielo', hora: '13:00', kicker: '¡Por fin, a descansar!' },
  { id: 'estreno-casa', nombre: 'Estreno de casa', descripcion: 'Conoce nuestro nuevo hogar', categoria: 'Celebraciones', tipo: 'otro', kitId: 'minimal', nombresEjemplo: 'Nuestro nuevo hogar', lugarEjemplo: 'Calle 85 # 12-30, apto 502', hora: '16:00', kicker: 'Estrenamos casa' },
  { id: 'reencuentro-promocion', nombre: 'Reencuentro de promoción', descripcion: 'Diez años después, otra vez juntos', categoria: 'Celebraciones', tipo: 'otro', kitId: 'azul_royal', nombresEjemplo: 'Promoción 2016', lugarEjemplo: 'Club Militar, Bogotá', hora: '19:00', kicker: 'Nos volvemos a ver' },

  // ─────────── Premium: temáticas animadas ───────────
  {
    id: 'premium-boda-atardecer', nombre: 'Boda al atardecer', descripcion: 'Playa, palmeras al viento y ondas de color', categoria: 'Bodas', tipo: 'boda', kitId: 'playa',
    nombresEjemplo: 'Mariana & Diego', lugarEjemplo: 'Hotel Las Américas, Cartagena', hora: '17:00', kicker: 'Nos casamos frente al mar', apertura: 'deslizar', premium: true,
    momentos: [['17:00', 'Ceremonia en la playa'], ['18:30', 'Cóctel al atardecer'], ['20:00', 'Fiesta']], vestimenta: { etiqueta: 'Playero elegante', colores: ['#F5E6CC', '#3AA6A0', '#FFFFFF'] }, extras: ['hospedaje'],
    efectos: { particulas: { tipo: 'luces', cantidad: 'normal' }, fondoAnimado: 'ondas', stickers: [{ stickerId: 'anim_palmera', x: 2, y: 2, ancho: 20 }, { stickerId: 'anim_corazones', x: 80, y: 76, ancho: 16 }] },
  },
  {
    id: 'premium-boda-invierno', nombre: 'Boda de invierno', descripcion: 'Nieve que cae y un copo que gira', categoria: 'Bodas', tipo: 'boda', kitId: 'iglesia',
    nombresEjemplo: 'Elena & Sebastián', lugarEjemplo: 'Hacienda Fagua, Chía', hora: '16:00', kicker: 'Unidos en matrimonio', apertura: 'puertas', premium: true,
    momentos: [['16:00', 'Ceremonia'], ['18:00', 'Recepción']], vestimenta: { etiqueta: 'Formal', colores: ['#E0F2FE', '#94A3B8', '#FFFFFF'] },
    efectos: { escena: 'hielo', particulas: { tipo: 'nieve', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_copo', x: 80, y: 3, ancho: 15 }] },
  },
  {
    id: 'premium-boda-esmeralda-real', nombre: 'Boda esmeralda real', descripcion: 'Verde profundo, oro y destellos', categoria: 'Bodas', tipo: 'boda', kitId: 'esmeralda',
    nombresEjemplo: 'Catalina & Felipe', lugarEjemplo: 'Hacienda San Rafael, Pereira', hora: '17:00', kicker: 'Nuestra boda', apertura: 'sobre', premium: true,
    momentos: [['17:00', 'Ceremonia'], ['19:00', 'Cena'], ['21:00', 'Baile']], extras: ['padrinos', 'lista_regalos'], regalos: ['Juego de sábanas', 'Cafetera', 'Viaje de luna de miel'],
    efectos: { particulas: { tipo: 'destellos', cantidad: 'normal' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_anillos', x: 79, y: 3, ancho: 17 }] },
  },
  {
    id: 'premium-boda-luces', nombre: 'Boda bajo las luces', descripcion: 'Rústica, con guirnaldas de luz cálida', categoria: 'Bodas', tipo: 'boda', kitId: 'rustico',
    nombresEjemplo: 'Ana María & Julián', lugarEjemplo: 'Finca Villa Laura, La Calera', hora: '15:00', kicker: 'Nos casamos en el campo', premium: true,
    momentos: [['15:00', 'Ceremonia'], ['17:00', 'Almuerzo'], ['20:00', 'Fiesta bajo las luces']], extras: ['hospedaje'],
    efectos: { particulas: { tipo: 'luces', cantidad: 'muchas' }, fondoAnimado: 'degradado', stickers: [{ stickerId: 'anim_corazon', x: 80, y: 3, ancho: 15, movimiento: 'flotar' }] },
  },
  {
    id: 'premium-xv-princesa-real', nombre: 'XV princesa real', descripcion: 'Castillo encantado y una corona que brilla', categoria: 'XV años', tipo: 'quince_anos', kitId: 'princesa_real',
    nombresEjemplo: 'Mis XV · Sofía', lugarEjemplo: 'Castillo Marroquín, Chía', hora: '20:00', kicker: 'Mis quince años', apertura: 'puertas', premium: true, destacada: true,
    momentos: [['20:00', 'Entrada de la quinceañera'], ['21:00', 'Vals'], ['22:00', 'Fiesta']], extras: ['playlist'],
    efectos: { escena: 'castillo', particulas: { tipo: 'destellos', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_corona', x: 79, y: 3, ancho: 17 }] },
  },
  {
    id: 'premium-xv-neon-party', nombre: 'XV neón party', descripcion: 'Bola disco, luces y música', categoria: 'XV años', tipo: 'quince_anos', kitId: 'neon_xv',
    nombresEjemplo: 'Mis XV · Gabriela', lugarEjemplo: 'Discoteca Mansión, Bogotá', hora: '21:00', kicker: '¡Mis XV!', apertura: 'caja', premium: true,
    momentos: [['21:00', 'Llegada'], ['22:00', 'Show'], ['23:00', 'Fiesta']], extras: ['playlist'],
    efectos: { particulas: { tipo: 'luces', cantidad: 'muchas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_bola_disco', x: 3, y: 0, ancho: 18 }, { stickerId: 'anim_notas', x: 80, y: 76, ancho: 16 }] },
  },
  {
    id: 'premium-xv-rosa-oro', nombre: 'XV rosa y oro', descripcion: 'Pétalos que caen y una corona dorada', categoria: 'XV años', tipo: 'quince_anos', kitId: 'rosa_dorado',
    nombresEjemplo: 'Mis XV · Juliana', lugarEjemplo: 'Hotel Dann Carlton, Medellín', hora: '20:00', kicker: 'Mis quince años', premium: true,
    momentos: [['20:00', 'Misa'], ['21:00', 'Vals'], ['22:00', 'Fiesta']],
    efectos: { particulas: { tipo: 'petalos', cantidad: 'normal' }, fondoAnimado: 'degradado', stickers: [{ stickerId: 'anim_corona', x: 79, y: 3, ancho: 17 }] },
  },
  {
    id: 'premium-xv-reino-hielo', nombre: 'XV reino de hielo', descripcion: 'Aurora, nieve y copos que giran', categoria: 'XV años', tipo: 'quince_anos', kitId: 'princesa_hielo',
    nombresEjemplo: 'Mis XV · Elsa María', lugarEjemplo: 'Salón Cristal, Cali', hora: '20:00', kicker: 'Mis quince años', apertura: 'telon', premium: true,
    efectos: { escena: 'hielo', particulas: { tipo: 'nieve', cantidad: 'muchas' }, stickers: [{ stickerId: 'anim_copo', x: 3, y: 3, ancho: 15 }, { stickerId: 'anim_copo', x: 82, y: 76, ancho: 13 }] },
  },
  {
    id: 'premium-inf-cohetes', nombre: 'Misión espacial', descripcion: 'Un cohete despega entre estrellas', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'espacio',
    nombresEjemplo: 'Astronauta Lucas cumple 6', lugarEjemplo: 'Planetario de Bogotá', hora: '15:00', kicker: '¡Despegamos!', apertura: 'caja', premium: true, destacada: true,
    momentos: [['15:00', 'Cuenta regresiva'], ['16:00', 'Juegos espaciales'], ['17:00', 'Torta']],
    efectos: { particulas: { tipo: 'estrellas', cantidad: 'muchas' }, stickers: [{ stickerId: 'anim_cohete', x: 3, y: 2, ancho: 17 }, { stickerId: 'anim_estrellas', x: 80, y: 76, ancho: 16 }] },
  },
  {
    id: 'premium-inf-gol', nombre: 'Gol de campeón', descripcion: 'Balón que rebota, trofeo y confeti', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'futbol',
    nombresEjemplo: 'Mateo cumple 8', lugarEjemplo: 'Cancha sintética Gol Center', hora: '10:00', kicker: '¡A jugar!', premium: true,
    momentos: [['10:00', 'Partido'], ['11:30', 'Premiación y torta']],
    efectos: { particulas: { tipo: 'confeti', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_balon', x: 3, y: 2, ancho: 16 }, { stickerId: 'anim_trofeo', x: 81, y: 76, ancho: 15 }] },
  },
  {
    id: 'premium-inf-unicornio-arcoiris', nombre: 'Unicornio y arcoíris', descripcion: 'Arcoíris que se dibuja y destellos mágicos', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'unicornio',
    nombresEjemplo: 'Valentina cumple 5', lugarEjemplo: 'Salón Mundo Mágico', hora: '15:00', kicker: '¡Ven a mi fiesta mágica!', apertura: 'caja', premium: true, destacada: true,
    efectos: { particulas: { tipo: 'destellos', cantidad: 'muchas' }, fondoAnimado: 'degradado', stickers: [{ stickerId: 'anim_arcoiris', x: 2, y: 2, ancho: 24 }, { stickerId: 'anim_estrellas', x: 81, y: 76, ancho: 15 }] },
  },
  {
    id: 'premium-inf-sirena-burbujas', nombre: 'Sirenita y burbujas', descripcion: 'Burbujas que suben y olas de mar', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'sirena',
    nombresEjemplo: 'Ariana cumple 6', lugarEjemplo: 'Piscina del Club Los Lagartos', hora: '14:00', kicker: '¡Fiesta bajo el mar!', premium: true,
    efectos: { particulas: { tipo: 'burbujas', cantidad: 'muchas' }, fondoAnimado: 'ondas', stickers: [{ stickerId: 'anim_burbujas', x: 80, y: 3, ancho: 17 }] },
  },
  {
    id: 'premium-inf-heroes-accion', nombre: 'Héroes en acción', descripcion: 'Cómic, ¡POW! y estrellas que titilan', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'heroe_comic',
    nombresEjemplo: 'Samuel cumple 7', lugarEjemplo: 'Salón Súper Fiesta', hora: '15:00', kicker: '¡Llama a los héroes!', apertura: 'globo', premium: true,
    efectos: { escena: 'comic', particulas: { tipo: 'confeti', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_estrellas', x: 80, y: 3, ancho: 16 }] },
  },
  {
    id: 'premium-inf-hadas', nombre: 'Bosque de hadas', descripcion: 'Mariposas, luciérnagas y destellos', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'princesa_hadas',
    nombresEjemplo: 'Luciana cumple 4', lugarEjemplo: 'Jardín de la abuela', hora: '15:00', kicker: '¡Fiesta en el bosque!', premium: true,
    efectos: { escena: 'hadas', particulas: { tipo: 'destellos', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_mariposa', x: 3, y: 3, ancho: 18 }, { stickerId: 'anim_mariposa', x: 81, y: 77, ancho: 15 }] },
  },
  {
    id: 'premium-inf-gamer-pro', nombre: 'Gamer pro', descripcion: 'Luces neón y trofeo de campeón', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'gamer',
    nombresEjemplo: 'Nivel 10 · Emiliano', lugarEjemplo: 'Sala de videojuegos Arena', hora: '16:00', kicker: '¡Player 1 listo!', premium: true,
    efectos: { particulas: { tipo: 'luces', cantidad: 'muchas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_trofeo', x: 80, y: 3, ancho: 15 }] },
  },
  {
    id: 'premium-inf-safari-sol', nombre: 'Safari bajo el sol', descripcion: 'Sol radiante y mariposas de la selva', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'safari',
    nombresEjemplo: 'Tomás cumple 3', lugarEjemplo: 'Parque Jaime Duque', hora: '11:00', kicker: '¡Aventura en la selva!', premium: true,
    efectos: { particulas: { tipo: 'petalos', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_sol', x: 80, y: 2, ancho: 17 }, { stickerId: 'anim_mariposa', x: 3, y: 77, ancho: 15 }] },
  },
  {
    id: 'premium-inf-primer-osito', nombre: 'Mi primer añito', descripcion: 'Un osito que saluda y globos que flotan', categoria: 'Infantiles', tipo: 'cumpleanos_infantil', kitId: 'primer_anito',
    nombresEjemplo: 'Primer añito de Martina', lugarEjemplo: 'Casa de los abuelos', hora: '15:00', kicker: '¡Mi primer añito!', premium: true,
    efectos: { particulas: { tipo: 'burbujas', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_osito', x: 3, y: 2, ancho: 17 }, { stickerId: 'anim_globos', x: 81, y: 72, ancho: 16 }] },
  },
  {
    id: 'premium-hw-calabazas-noche', nombre: 'Noche de calabazas', descripcion: 'Calabazas encendidas y murciélagos volando', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_calabazas',
    nombresEjemplo: 'Halloween en casa de Pablo', lugarEjemplo: 'Conjunto Los Robles', hora: '17:00', kicker: '¿Dulce o truco?', premium: true, destacada: true,
    efectos: { escena: 'calabazas', particulas: { tipo: 'destellos', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_murcielago', x: 2, y: 3, ancho: 18 }, { stickerId: 'anim_calabaza', x: 80, y: 76, ancho: 16 }] },
  },
  {
    id: 'premium-hw-fantasmas', nombre: 'Fantasmas traviesos', descripcion: 'Fantasmitas que flotan en la noche', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_fantasmitas',
    nombresEjemplo: 'Fiesta de disfraces de Ana', lugarEjemplo: 'Salón comunal', hora: '16:00', kicker: '¡Buuu!', premium: true,
    efectos: { escena: 'fantasmas', particulas: { tipo: 'estrellas', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_fantasma', x: 80, y: 2, ancho: 16 }] },
  },
  {
    id: 'premium-hw-neon-terror', nombre: 'Halloween neón', descripcion: 'Luces neón y murciélagos en la pista', categoria: 'Halloween', tipo: 'disfraces', kitId: 'hw_neon',
    nombresEjemplo: 'Monster Party 2026', lugarEjemplo: 'Bar La Cripta', hora: '21:00', kicker: 'Noche de monstruos', premium: true,
    efectos: { particulas: { tipo: 'luces', cantidad: 'muchas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_murcielago', x: 2, y: 3, ancho: 18 }, { stickerId: 'anim_murcielago', x: 80, y: 78, ancho: 15 }] },
  },
  {
    id: 'premium-baby-osito-rosa', nombre: 'Baby shower dulce espera', descripcion: 'Osito que saluda y corazones que suben', categoria: 'Bebés', tipo: 'baby_shower', kitId: 'lluvia_rosa',
    nombresEjemplo: 'Baby shower de Antonia', lugarEjemplo: 'Casa de la familia', hora: '15:00', kicker: 'Te esperamos con amor', premium: true,
    extras: ['lista_regalos'], regalos: ['Pañales etapa 1', 'Bañera', 'Monitor de bebé'],
    efectos: { particulas: { tipo: 'corazones', cantidad: 'pocas' }, fondoAnimado: 'degradado', stickers: [{ stickerId: 'anim_osito', x: 3, y: 2, ancho: 17 }] },
  },
  {
    id: 'premium-revelacion-confeti', nombre: 'Gran revelación', descripcion: 'Confeti, globos y un regalo misterioso', categoria: 'Bebés', tipo: 'revelacion_genero', kitId: 'revelacion',
    nombresEjemplo: 'Revelación de Laura y Andrés', lugarEjemplo: 'Terraza Casa Blanca', hora: '16:00', kicker: '¿Niño o niña?', apertura: 'globo', premium: true,
    extras: ['juego_adivinar'],
    efectos: { particulas: { tipo: 'confeti', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_globos', x: 2, y: 2, ancho: 20 }, { stickerId: 'anim_regalo', x: 81, y: 78, ancho: 15 }] },
  },
  {
    id: 'premium-bautizo-paloma', nombre: 'Bautizo con paloma', descripcion: 'Una paloma de paz y destellos de luz', categoria: 'Religiosas', tipo: 'bautizo', kitId: 'comunion',
    nombresEjemplo: 'Bautizo de Emmanuel', lugarEjemplo: 'Parroquia Santa Bárbara', hora: '11:00', kicker: 'Mi bautizo', premium: true,
    momentos: [['11:00', 'Ceremonia'], ['13:00', 'Almuerzo']],
    efectos: { particulas: { tipo: 'destellos', cantidad: 'pocas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_paloma', x: 79, y: 3, ancho: 18 }] },
  },
  {
    id: 'premium-comunion-luz', nombre: 'Primera comunión de luz', descripcion: 'Luces suaves y una paloma que vuela', categoria: 'Religiosas', tipo: 'primera_comunion', kitId: 'comunion',
    nombresEjemplo: 'Primera comunión de Isabella', lugarEjemplo: 'Iglesia de Nuestra Señora de Lourdes', hora: '10:00', kicker: 'Mi primera comunión', premium: true,
    momentos: [['10:00', 'Misa'], ['12:00', 'Celebración']],
    efectos: { particulas: { tipo: 'luces', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_paloma', x: 3, y: 3, ancho: 18 }] },
  },
  {
    id: 'premium-cumple-disco', nombre: 'Fiebre disco', descripcion: 'Bola disco, notas y luces de pista', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'disco',
    nombresEjemplo: 'Los 35 de Natalia', lugarEjemplo: 'Club Studio 54, Bogotá', hora: '21:00', kicker: '¡A la pista!', apertura: 'telon', premium: true, destacada: true,
    extras: ['playlist'],
    efectos: { particulas: { tipo: 'luces', cantidad: 'muchas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_bola_disco', x: 3, y: 0, ancho: 18 }, { stickerId: 'anim_notas', x: 80, y: 76, ancho: 16 }] },
  },
  {
    id: 'premium-cumple-tropical', nombre: 'Cumpleaños tropical', descripcion: 'Palmeras, sol y ondas de mar', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'tropical',
    nombresEjemplo: 'Los 28 de Valeria', lugarEjemplo: 'Beach Club Bocagrande', hora: '15:00', kicker: '¡Fiesta tropical!', premium: true,
    efectos: { particulas: { tipo: 'petalos', cantidad: 'pocas' }, fondoAnimado: 'ondas', stickers: [{ stickerId: 'anim_palmera', x: 2, y: 2, ancho: 19 }, { stickerId: 'anim_sol', x: 81, y: 76, ancho: 15 }] },
  },
  {
    id: 'premium-cumple-gala-dorada', nombre: 'Cumpleaños de gala', descripcion: 'Destellos dorados y un brindis elegante', categoria: 'Cumpleaños', tipo: 'cumpleanos', kitId: 'gala',
    nombresEjemplo: 'Los 50 de Patricia', lugarEjemplo: 'Hotel Grand Hyatt, Bogotá', hora: '20:00', kicker: 'Medio siglo de vida', premium: true,
    vestimenta: { etiqueta: 'Etiqueta', colores: ['#111827', '#C9A227'] },
    efectos: { particulas: { tipo: 'destellos', cantidad: 'muchas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_brindis', x: 80, y: 3, ancho: 16 }] },
  },
  {
    id: 'premium-despedida-glam', nombre: 'Despedida glam', descripcion: 'Brindis, corazones y luces de fiesta', categoria: 'Celebraciones', tipo: 'despedida_soltera', kitId: 'despedida',
    nombresEjemplo: 'La última noche de Camila', lugarEjemplo: 'Rooftop Bar 7, Medellín', hora: '20:00', kicker: 'Última noche de soltera', premium: true,
    efectos: { particulas: { tipo: 'corazones', cantidad: 'normal' }, fondoAnimado: 'degradado', stickers: [{ stickerId: 'anim_brindis', x: 3, y: 3, ancho: 16 }, { stickerId: 'anim_bola_disco', x: 81, y: 72, ancho: 15 }] },
  },
  {
    id: 'premium-aniversario-oro', nombre: 'Bodas de oro brillantes', descripcion: 'Cincuenta años entre destellos dorados', categoria: 'Celebraciones', tipo: 'aniversario', kitId: 'champana',
    nombresEjemplo: 'Rosa & Alberto · 50 años', lugarEjemplo: 'Club El Rancho', hora: '12:00', kicker: 'Bodas de oro', premium: true,
    efectos: { particulas: { tipo: 'destellos', cantidad: 'normal' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_anillos', x: 79, y: 3, ancho: 17 }] },
  },
  {
    id: 'premium-navidad-magica', nombre: 'Navidad mágica', descripcion: 'Árbol con luces, nieve y estrellas', categoria: 'Diciembre', tipo: 'navidad', kitId: 'novena',
    nombresEjemplo: 'Novena en familia', lugarEjemplo: 'Casa de los Gómez', hora: '19:00', kicker: '¡Feliz Navidad!', premium: true, destacada: true,
    momentos: [['19:00', 'Novena'], ['20:00', 'Buñuelos y natilla'], ['21:00', 'Regalos']],
    efectos: { particulas: { tipo: 'nieve', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_arbol', x: 3, y: 1, ancho: 16 }, { stickerId: 'anim_estrellas', x: 81, y: 76, ancho: 15 }] },
  },
  {
    id: 'premium-amor-amistad', nombre: 'Amor y amistad animado', descripcion: 'Corazones que suben y uno que late', categoria: 'Diciembre', tipo: 'amor_amistad', kitId: 'amor_amistad',
    nombresEjemplo: 'Amigo secreto 2026', lugarEjemplo: 'Oficina, piso 5', hora: '17:00', kicker: 'Amor y amistad', premium: true,
    efectos: { particulas: { tipo: 'corazones', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_corazon', x: 80, y: 3, ancho: 15 }] },
  },
  {
    id: 'premium-empresa-lanzamiento', nombre: 'Lanzamiento de impacto', descripcion: 'Un cohete que despega y aurora de marca', categoria: 'Empresa', tipo: 'corporativo', kitId: 'protocolo',
    nombresEjemplo: 'Lanzamiento Nova 2027', lugarEjemplo: 'Centro de Convenciones Ágora', hora: '18:00', kicker: 'Te invitamos al lanzamiento', premium: true,
    momentos: [['18:00', 'Registro'], ['18:30', 'Presentación'], ['19:30', 'Cóctel']],
    efectos: { particulas: { tipo: 'destellos', cantidad: 'pocas' }, fondoAnimado: 'aurora', stickers: [{ stickerId: 'anim_cohete', x: 81, y: 2, ancho: 14 }] },
  },
  {
    id: 'premium-empresa-premiacion', nombre: 'Noche de premiación', descripcion: 'Trofeo, destellos y fuegos artificiales', categoria: 'Empresa', tipo: 'corporativo', kitId: 'gala',
    nombresEjemplo: 'Premios Excelencia 2026', lugarEjemplo: 'Hotel JW Marriott, Bogotá', hora: '19:00', kicker: 'Gala de premiación', premium: true,
    vestimenta: { etiqueta: 'Etiqueta' },
    efectos: { particulas: { tipo: 'destellos', cantidad: 'normal' }, stickers: [{ stickerId: 'anim_trofeo', x: 3, y: 2, ancho: 15 }, { stickerId: 'anim_fuegos', x: 80, y: 76, ancho: 17 }] },
  },
  {
    id: 'premium-paseo-playa', nombre: 'Paseo a la playa', descripcion: 'Sol, palmeras y olas en movimiento', categoria: 'Salidas', tipo: 'paseo', kitId: 'playa',
    nombresEjemplo: 'Paseo a Santa Marta', lugarEjemplo: 'Playa Rodadero', hora: '06:00', kicker: '¡Nos vamos a la playa!', premium: true,
    momentos: [['06:00', 'Salida'], ['12:00', 'Almuerzo frente al mar']],
    efectos: { fondoAnimado: 'ondas', particulas: { tipo: 'burbujas', cantidad: 'pocas' }, stickers: [{ stickerId: 'anim_sol', x: 80, y: 2, ancho: 16 }, { stickerId: 'anim_palmera', x: 2, y: 74, ancho: 17 }] },
  },
]

export function obtenerPlantilla(id?: string | null): Plantilla | undefined {
  return PLANTILLAS.find((p) => p.id === id)
}

function fechaEnDias(dias: number): string {
  const d = new Date(Date.now() + dias * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function idItem(prefijo: string) {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Crea una invitación a partir de una plantilla.
 * Con `conEjemplo` se llenan los textos de muestra (solo para la galería y la vista previa).
 */
export function eventoDesdePlantilla(
  plantilla: Plantilla,
  datos: { nombres?: string; fecha?: string; hora?: string; lugar?: string } = {},
  conEjemplo = false
): DetalleEvento {
  const evento = crearEventoInicial({
    tipo: plantilla.tipo,
    nombres: datos.nombres || plantilla.nombresEjemplo,
    fecha: datos.fecha || fechaEnDias(75),
    hora: datos.hora || plantilla.hora,
    lugar: datos.lugar ?? plantilla.lugarEjemplo,
    kitId: plantilla.kitId,
  })

  let secciones: SeccionModular[] = evento.secciones || []

  // Bloques extra antes de la confirmación
  for (const tipo of plantilla.extras || []) {
    if (secciones.some((s) => s.tipo === tipo)) continue
    const i = secciones.findIndex((s) => s.tipo === 'confirmacion_rsvp')
    const nueva = crearSeccionPorTipo(tipo, 0)
    nueva.id = `${nueva.id}-${Math.random().toString(36).slice(2, 6)}`
    secciones.splice(i >= 0 ? i : secciones.length, 0, nueva)
  }

  secciones = secciones.map((s, orden) => {
    const d = { ...(s.datos || {}) }
    let s2: SeccionModular = { ...s, orden }
    if (s.tipo === 'cabecera' && plantilla.kicker) s2 = { ...s2, subtitulo: plantilla.kicker }
    if (s.tipo === 'itinerario' && plantilla.momentos) {
      d.itinerario = plantilla.momentos.map(([h, t]) => ({ id: idItem('it'), hora: formatearHora(h), titulo: t }))
    }
    if (s.tipo === 'codigo_vestimenta' && plantilla.vestimenta) {
      d.etiqueta = plantilla.vestimenta.etiqueta
      d.coloresSugeridos = plantilla.vestimenta.colores || []
      d.notasVestimenta = plantilla.vestimenta.nota || ''
    }
    if (s.tipo === 'lista_regalos' && plantilla.regalos?.length) {
      d.regalos = plantilla.regalos.map((nombre) => ({ id: idItem('rg'), nombre }))
    }
    if (conEjemplo && plantilla.ejemplo) {
      const e = plantilla.ejemplo
      if (s.tipo === 'historia' && e.historia) d.cuerpoTexto = e.historia
      if (s.tipo === 'padrinos' && e.padrinos) d.personas = e.padrinos.map(([nombre, rol]) => ({ id: idItem('pd'), nombre, rol }))
      if (s.tipo === 'mensaje_libre' && e.mensaje) {
        d.mensaje = e.mensaje[0]
        d.autorMensaje = e.mensaje[1]
      }
      if (s.tipo === 'playlist' && e.canciones) d.canciones = e.canciones.map(([titulo, artista]) => ({ id: idItem('cn'), titulo, artista }))
      if (s.tipo === 'vaca_regalo' && e.vaca) {
        d.metaVaca = e.vaca[0]
        d.recaudadoVaca = e.vaca[1]
        d.medioPagoVaca = e.vaca[2]
      }
    }
    return { ...s2, datos: d }
  })

  // Stickers que trae la plantilla, encima del bloque indicado (por defecto, la portada)
  for (const [i, st] of (plantilla.efectos?.stickers || []).entries()) {
    const def = obtenerSticker(st.stickerId)
    const destino = secciones.find((s) => s.tipo === (st.bloque || 'cabecera'))
    if (!def || !destino) continue
    const elemento: ElementoLienzo = {
      id: `el-pl-${i}-${Math.random().toString(36).slice(2, 7)}`,
      tipo: 'sticker',
      stickerId: st.stickerId,
      x: st.x,
      y: st.y,
      ancho: st.ancho,
      alto: Math.round(st.ancho * def.proporcion * 100) / 100,
      rotacion: st.rotacion || 0,
      opacidad: 1,
      z: 10 + i,
      animacion: 'zoom',
      movimiento: st.movimiento,
      color: st.color,
    }
    secciones = secciones.map((s) => (s.id === destino.id ? { ...s, elementos: [...(s.elementos || []), elemento] } : s))
  }

  const visual = evento.configuracionVisual!
  const experiencia = experienciaDe(visual)
  const efectos = plantilla.efectos
  return {
    ...evento,
    subtitulo: plantilla.kicker || evento.subtitulo,
    secciones,
    configuracionVisual: {
      ...visual,
      ...(efectos?.escena ? { escena: efectos.escena } : {}),
      ...(efectos?.particulas?.tipo ? { particulas: efectos.particulas } : {}),
      ...(efectos?.fondoAnimado ? { fondoAnimado: efectos.fondoAnimado } : {}),
      ...(plantilla.premium ? { plantillaPremium: plantilla.id } : {}),
      experiencia: {
        ...experiencia,
        apertura: plantilla.apertura || experiencia.apertura,
        recorrido: plantilla.recorrido || experiencia.recorrido,
      },
    },
  }
}

export interface StickerPlantilla {
  stickerId: string
  x: number // % del ancho del bloque
  y: number // % del alto del bloque
  ancho: number // % del ancho del bloque
  bloque?: TipoSeccion // Bloque donde va (por defecto la portada)
  rotacion?: number
  color?: string
  movimiento?: MovimientoContinuo
}

export interface EfectosPlantilla {
  escena?: TipoEscena
  particulas?: ParticulasConfig
  fondoAnimado?: TipoFondoAnimado
  stickers?: StickerPlantilla[]
}
