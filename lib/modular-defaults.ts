import {
  DetalleEvento,
  SeccionModular,
  TipoSeccion,
  NombreIcono,
  ElementoItinerario,
} from '@/types/invitation'

export interface MetaSeccion {
  tipo: TipoSeccion
  nombre: string
  descripcion: string
  iconoDefecto: NombreIcono
  tituloDefecto: string
}

export const CATALOGO_SECCIONES: MetaSeccion[] = [
  {
    tipo: 'cabecera',
    nombre: 'Cabecera & Portada',
    descripcion: 'Título del acto, anfitriones, fotografía de portada y logotipo central',
    iconoDefecto: 'sparkles',
    tituloDefecto: 'Convocatoria Oficial',
  },
  {
    tipo: 'cuenta_regresiva',
    nombre: 'Cuenta Regresiva',
    descripcion: 'Reloj en tiempo real con días, horas, minutos y segundos faltantes',
    iconoDefecto: 'clock',
    tituloDefecto: 'Tiempo Restante',
  },
  {
    tipo: 'fecha_hora',
    nombre: 'Fecha y Horario',
    descripcion: 'Fecha solemne, hora de inicio y sincronización con calendario',
    iconoDefecto: 'calendar',
    tituloDefecto: 'Fecha & Horario',
  },
  {
    tipo: 'itinerario',
    nombre: 'Itinerario / Cronograma',
    descripcion: 'Línea de tiempo con las etapas del evento (Recepción, Ceremonia, Cóctel, Cena)',
    iconoDefecto: 'clock',
    tituloDefecto: 'Itinerario del Acto',
  },
  {
    tipo: 'ubicacion',
    nombre: 'Sede & Ubicación',
    descripcion: 'Dirección, nombre del recinto y botones de navegación Waze / Google Maps',
    iconoDefecto: 'mapPin',
    tituloDefecto: 'Sede del Evento',
  },
  {
    tipo: 'codigo_vestimenta',
    nombre: 'Código de Vestimenta',
    descripcion: 'Etiqueta protocolaria, paleta de colores sugeridos y notas para invitados',
    iconoDefecto: 'shirt',
    tituloDefecto: 'Código de Etiqueta',
  },
  {
    tipo: 'regalos_bancarios',
    nombre: 'Mesa de Regalos / Lluvia de Sobres',
    descripcion: 'Datos bancarios para transferencias, lluvia de sobres o enlace a lista de regalos',
    iconoDefecto: 'gift',
    tituloDefecto: 'Detalles de Cortesía',
  },
  {
    tipo: 'galeria_fotos',
    nombre: 'Galería Fotográfica',
    descripcion: 'Mosaico de imágenes de los anfitriones, lugar o momentos especiales',
    iconoDefecto: 'camera',
    tituloDefecto: 'Galería de Recuerdos',
  },
  {
    tipo: 'mensaje_libre',
    nombre: 'Mensaje o Cita Especial',
    descripcion: 'Dedicatoria de los anfitriones, cita célebre, poema o consideraciones de ingreso',
    iconoDefecto: 'messageSquare',
    tituloDefecto: 'Palabras de Bienvenida',
  },
  {
    tipo: 'hospedaje',
    nombre: 'Hospedaje & Traslados',
    descripcion: 'Hoteles recomendados, tarifas y teléfonos para invitados de otras ciudades',
    iconoDefecto: 'building',
    tituloDefecto: 'Hospedaje Recomendado',
  },
  {
    tipo: 'confirmacion_rsvp',
    nombre: 'Confirmación WhatsApp (RSVP)',
    descripcion: 'Botón directo para confirmar asistencia nominal en WhatsApp con un solo toque',
    iconoDefecto: 'check',
    tituloDefecto: 'Confirmación de Asistencia',
  },
]

export const IMAGENES_CURADAS = {
  portadas: [
    {
      titulo: 'Gala & Arquitectura Platino',
      url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      titulo: 'Celebración Floral Solemne',
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    },
    {
      titulo: 'Banquete & Luces Cálidas',
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      titulo: 'Salón Ejecutivo Minimalista',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    },
    {
      titulo: 'Terraza & Naturaleza Fina',
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  retratos: [
    {
      titulo: 'Monograma Formal Dorado',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    },
    {
      titulo: 'Emblema Sello Protocolario',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
    },
    {
      titulo: 'Corona de Laurel / Logotipo',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    },
  ],
}

/**
 * Genera la lista completa y ordenada de secciones modulares para un evento
 */
export function generarSeccionesPorDefecto(evento: DetalleEvento): SeccionModular[] {
  const itinerarioBase: ElementoItinerario[] = [
    {
      id: 'it-1',
      hora: '17:00',
      titulo: 'Recepción y Registro Protocolario',
      descripcion: 'Ingreso al recinto y cóctel de bienvenida',
      icono: 'users',
    },
    {
      id: 'it-2',
      hora: '18:00',
      titulo: 'Acto Solemne / Ceremonia',
      descripcion: 'Inicio formal de la sesión en el salón principal',
      icono: 'bell',
    },
    {
      id: 'it-3',
      hora: '19:30',
      titulo: 'Brindis de Honor',
      descripcion: 'Palabras oficiales y felicitaciones',
      icono: 'wine',
    },
    {
      id: 'it-4',
      hora: '20:30',
      titulo: 'Cena & Velada',
      descripcion: 'Servicio de banquete y celebración',
      icono: 'utensils',
    },
  ]

  return [
    {
      id: 'sec-cabecera',
      tipo: 'cabecera',
      titulo: evento.titulo || 'Convocatoria Oficial',
      subtitulo: evento.subtitulo || 'Tiene el agrado de invitarle a',
      icono: 'sparkles',
      visible: true,
      orden: 0,
      datos: {
        imagenPortada: evento.imagenPortada || IMAGENES_CURADAS.portadas[0].url,
        imagenRetrato: evento.imagenRetrato,
      },
    },
    {
      id: 'sec-cuenta-regresiva',
      tipo: 'cuenta_regresiva',
      titulo: 'Tiempo Restante',
      subtitulo: 'Aguardamos con entusiasmo esta distinguida fecha',
      icono: 'clock',
      visible: true,
      orden: 1,
    },
    {
      id: 'sec-fecha-hora',
      tipo: 'fecha_hora',
      titulo: 'Fecha & Horario',
      subtitulo: 'Rogamos puntualidad para el protocolo de inicio',
      icono: 'calendar',
      visible: true,
      orden: 2,
    },
    {
      id: 'sec-ubicacion',
      tipo: 'ubicacion',
      titulo: 'Sede del Evento',
      subtitulo: 'Coordenadas e información de acceso',
      icono: 'mapPin',
      visible: true,
      orden: 3,
      datos: {
        nombreLugar: evento.direccion || 'Recinto Metropolitano',
        direccion: evento.direccion || 'Recinto Metropolitano',
        enlaceMapa: evento.enlaceMapa || 'https://maps.google.com',
        detallesAcceso: 'Servicio de estacionamiento y valet parking disponible en el ingreso norte.',
      },
    },
    {
      id: 'sec-itinerario',
      tipo: 'itinerario',
      titulo: 'Cronograma del Acto',
      subtitulo: 'Desarrollo de los momentos principales',
      icono: 'clock',
      visible: true,
      orden: 4,
      datos: {
        itinerario: itinerarioBase,
      },
    },
    {
      id: 'sec-codigo-vestimenta',
      tipo: 'codigo_vestimenta',
      titulo: 'Código de Etiqueta',
      subtitulo: 'Indicaciones sobre el atuendo sugerido',
      icono: 'shirt',
      visible: true,
      orden: 5,
      datos: {
        etiqueta: evento.codigoVestimenta || 'Traje Formal / Rigurosa Etiqueta',
        coloresSugeridos: evento.paletaVestimenta || ['#0F172A', '#334155', '#475569', '#CBD5E1'],
        notasVestimenta: 'Se ruega a las damas evitar tonos blancos o marfil.',
      },
    },
    {
      id: 'sec-regalos',
      tipo: 'regalos_bancarios',
      titulo: 'Detalles de Cortesía',
      subtitulo: 'Lluvia de sobres y datos de transferencia',
      icono: 'gift',
      visible: true,
      orden: 6,
      datos: {
        tipoRegalo: 'transferencia',
        banco: evento.datosBancarios?.banco || 'Bancolombia',
        tipoCuenta: evento.datosBancarios?.tipoCuenta || 'Ahorros',
        numeroCuenta: evento.datosBancarios?.numeroCuenta || '123-456789-00',
        titular: evento.datosBancarios?.titular || evento.anfitriones || 'Anfitrión',
      },
    },
    {
      id: 'sec-mensaje',
      tipo: 'mensaje_libre',
      titulo: 'Mensaje de los Anfitriones',
      subtitulo: 'Palabras especiales para nuestros invitados',
      icono: 'messageSquare',
      visible: true,
      orden: 7,
      datos: {
        mensaje:
          'Su compañía en este día tan trascendental es el mayor honor y alegría que podemos recibir. Agradecemos ser parte de los momentos que marcan nuestra historia.',
        autorMensaje: evento.anfitriones,
      },
    },
    {
      id: 'sec-galeria',
      tipo: 'galeria_fotos',
      titulo: 'Galería Fotográfica',
      subtitulo: 'Momentos y estampas memorables',
      icono: 'camera',
      visible: false,
      orden: 8,
      datos: {
        fotos: [
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=600&q=80',
        ],
      },
    },
    {
      id: 'sec-confirmacion',
      tipo: 'confirmacion_rsvp',
      titulo: 'Confirmación de Asistencia',
      subtitulo: 'Agradecemos confirmar su asistencia a la mayor brevedad posible',
      icono: 'check',
      visible: true,
      orden: 9,
    },
  ]
}

/**
 * Crea una nueva sección según su tipo
 */
export function crearSeccionPorTipo(tipo: TipoSeccion, orden: number): SeccionModular {
  const meta = CATALOGO_SECCIONES.find((s) => s.tipo === tipo) || CATALOGO_SECCIONES[0]
  const idUnico = `sec-${tipo}-${Date.now()}`

  switch (tipo) {
    case 'itinerario':
      return {
        id: idUnico,
        tipo,
        titulo: meta.tituloDefecto,
        subtitulo: 'Cronograma por horas',
        icono: meta.iconoDefecto,
        visible: true,
        orden,
        datos: {
          itinerario: [
            { id: '1', hora: '18:00', titulo: 'Inicio de la Recepción', icono: 'wine' },
            { id: '2', hora: '19:30', titulo: 'Ceremonia Principal', icono: 'bell' },
            { id: '3', hora: '21:00', titulo: 'Banquete de Honor', icono: 'utensils' },
          ],
        },
      }
    case 'galeria_fotos':
      return {
        id: idUnico,
        tipo,
        titulo: meta.tituloDefecto,
        subtitulo: 'Fotografías de recuerdo',
        icono: meta.iconoDefecto,
        visible: true,
        orden,
        datos: {
          fotos: [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
          ],
        },
      }
    case 'hospedaje':
      return {
        id: idUnico,
        tipo,
        titulo: meta.tituloDefecto,
        subtitulo: 'Alojamientos convenidos con tarifa preferencial',
        icono: meta.iconoDefecto,
        visible: true,
        orden,
        datos: {
          hoteles: [
            {
              id: 'h1',
              nombre: 'Hotel Dann Carlton & Suites',
              direccion: 'Cra 43A # 7-50',
              telefono: '+57 (604) 444 5151',
              enlace: 'https://ejemplo.com/reserva',
            },
          ],
        },
      }
    case 'mensaje_libre':
      return {
        id: idUnico,
        tipo,
        titulo: meta.tituloDefecto,
        subtitulo: 'Dedicatoria',
        icono: meta.iconoDefecto,
        visible: true,
        orden,
        datos: {
          mensaje: 'Esperamos contar con su distinguida presencia para compartir este día inolvidable.',
        },
      }
    default:
      return {
        id: idUnico,
        tipo,
        titulo: meta.tituloDefecto,
        subtitulo: meta.descripcion,
        icono: meta.iconoDefecto,
        visible: true,
        orden,
        datos: {},
      }
  }
}
