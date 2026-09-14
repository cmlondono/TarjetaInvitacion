/**
 * Definición de tipos para la plataforma de invitaciones interactivas.
 * Arquitectura modular y extensible.
 */

export type TipoEvento =
  | 'boda'
  | 'cumpleanos'
  | 'grado'
  | 'quince_anos'
  | 'baby_shower'
  | 'bautizo'
  | 'corporativo'
  | 'otro'

export type FuenteTipografica =
  | 'playfair' // Elegante / Clásica
  | 'montserrat' // Moderna / Minimalista
  | 'cormorant' // Romántica / Ceremonial
  | 'inter' // Limpia / Corporativa
  | 'cinzel' // Solemne / Sofisticada
  | 'dancing' // Cursiva / Festiva

export type EfectoFondo =
  | 'particulas_doradas'
  | 'confeti'
  | 'flores_delicadas'
  | 'destellos'
  | 'estrellas'
  | 'ninguno'

export type NombreIcono =
  | 'calendar'
  | 'clock'
  | 'mapPin'
  | 'sparkles'
  | 'heart'
  | 'gift'
  | 'wine'
  | 'shirt'
  | 'music'
  | 'camera'
  | 'info'
  | 'car'
  | 'building'
  | 'award'
  | 'church'
  | 'bell'
  | 'utensils'
  | 'plane'
  | 'ring'
  | 'check'
  | 'star'
  | 'users'
  | 'messageSquare'

export type TipoSeccion =
  | 'cabecera'          // Portada con título, anfitriones, subtítulo, foto de portada / retrato
  | 'cuenta_regresiva'  // Contador regresivo interactivo
  | 'fecha_hora'        // Fecha, hora y botón para guardar en calendario
  | 'itinerario'        // Cronograma por hitos (Recepción, Ceremonia, Cóctel, Cena, Brindis, etc.)
  | 'ubicacion'         // Sede, dirección, enlaces Waze y Google Maps
  | 'codigo_vestimenta' // Dress code con paleta de colores sugeridos y notas
  | 'regalos_bancarios' // Lluvia de sobres, datos bancarios o mesa de regalos online
  | 'galeria_fotos'     // Fotos del evento o anfitriones
  | 'mensaje_libre'     // Poema, dedicatoria de bienvenida o notas especiales
  | 'hospedaje'         // Recomendaciones de hoteles o transporte
  | 'confirmacion_rsvp' // Botón interactivo de confirmación WhatsApp

export interface ElementoItinerario {
  id: string
  hora: string // Ej: "16:00" o "4:00 PM"
  titulo: string // Ej: "Recepción de Invitados"
  descripcion?: string // Ej: "Bienvenida y cóctel en los jardines"
  icono?: NombreIcono
}

export interface HotelHospedaje {
  id: string
  nombre: string
  direccion?: string
  telefono?: string
  enlace?: string
}

export interface SeccionModular {
  id: string
  tipo: TipoSeccion
  titulo: string
  subtitulo?: string
  icono?: NombreIcono
  visible: boolean
  orden: number
  // Campos dinámicos del bloque modular
  datos?: {
    // Cabecera / Imágenes
    imagenPortada?: string // URL de imagen de fondo o banner superior
    imagenRetrato?: string // URL de fotografía o logo central
    // Itinerario
    itinerario?: ElementoItinerario[]
    // Vestimenta
    etiqueta?: string
    coloresSugeridos?: string[]
    notasVestimenta?: string
    // Regalos / Lluvia de sobres
    tipoRegalo?: 'sobres' | 'transferencia' | 'lista_regalos' | 'mixto'
    banco?: string
    tipoCuenta?: string
    numeroCuenta?: string
    titular?: string
    enlaceListaRegalos?: string
    // Ubicación
    nombreLugar?: string
    direccion?: string
    enlaceMapa?: string
    enlaceWaze?: string
    detallesAcceso?: string
    // Galería
    fotos?: string[]
    // Mensaje libre
    mensaje?: string
    autorMensaje?: string
    // Hospedaje
    hoteles?: HotelHospedaje[]
  }
}

export interface ConfiguracionVisual {
  fuenteTitulo: FuenteTipografica
  fuenteCuerpo: FuenteTipografica
  colorPrimario: string // Color de acento y botones principales
  colorSecundario: string // Tonalidades intermedias
  colorFondo: string // Fondo general de la página
  colorTarjeta: string // Color/transparencia de la tarjeta central
  colorTexto: string // Color tipográfico principal
  efectoFondo: EfectoFondo
  mostrarCuentaRegresiva: boolean
  mostrarUbicacion: boolean
  mostrarDressCode: boolean
  mostrarGaleria: boolean
  mostrarLluviaSobres: boolean
}

export interface DetalleEvento {
  id: string
  tokenAdmin: string // Token secreto criptográfico para gestionar
  slugPublico: string // Identificador en la URL pública
  tipoEvento: TipoEvento
  titulo: string // Ej: "Boda de Sofía & Carlos"
  subtitulo?: string // Ej: "¡Nos casamos!"
  anfitriones: string // Ej: "Sofía Gómez y Carlos Mora"
  fechaEvento: string // Formato ISO 8601
  horaEvento: string // Ej: "7:00 PM"
  direccion: string // Ej: "Hacienda San José, Salón Los Olivos"
  enlaceMapa: string // URL de Google Maps o Waze
  codigoVestimenta?: string // Ej: "Traje formal / Guayabera clara"
  paletaVestimenta?: string[] // Colores recomendados para los invitados
  datosBancarios?: {
    banco: string
    numeroCuenta: string
    titular: string
    tipoCuenta: string
  }
  whatsappNumero: string // Con indicativo internacional, ej: 573001234567
  whatsappPlantilla: string // Plantilla dinámica para confirmación
  fotosGaleria?: string[]
  imagenPortada?: string // Banner o fotografía superior
  imagenRetrato?: string // Fotografía central o logotipo de anfitrión
  esPremium: boolean // Si pagó por invitados ilimitados / sin anuncios
  creadoEn: string
  expiraEn: string // Fecha evento + 7 días

  // Arquitectura modular dinámica
  configuracionVisual?: ConfiguracionVisual
  secciones?: SeccionModular[]
}

export interface Invitado {
  id: string
  eventoId: string
  nombre: string
  pases: number // Cantidad de personas permitidas (1 = individual, 2+ = con acompañantes)
  esPlural: boolean // Define si el texto dice "Te esperamos" o "Los esperamos"
  telefono?: string // Opcional, para envío directo con un clic
  codigoAcceso: string // Token de invitación única
  confirmado?: boolean
  fechaConfirmacion?: string
}

// Constante de negocio: Límite de invitados gratuitos
export const LIMITE_INVITADOS_GRATIS = 50
