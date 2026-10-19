import type { DetalleEvento, SeccionModular, TipoApertura, TipoEvento, TipoRecorrido, TipoSeccion } from '@/types/invitation'
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

  const visual = evento.configuracionVisual!
  const experiencia = experienciaDe(visual)
  return {
    ...evento,
    subtitulo: plantilla.kicker || evento.subtitulo,
    secciones,
    configuracionVisual: {
      ...visual,
      experiencia: {
        ...experiencia,
        apertura: plantilla.apertura || experiencia.apertura,
        recorrido: plantilla.recorrido || experiencia.recorrido,
      },
    },
  }
}
