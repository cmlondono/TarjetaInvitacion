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
  | 'greatvibes' // Cursiva Caligráfica / Boda de Gala
  | 'alexbrush' // Cursiva Nupcial Fluida
  | 'parisienne' // Chic Francés / Quinceañera
  | 'prata' // Didone Editorial / Alta Costura
  | 'lora' // Serif Cálida / Poética
  | 'poppins' // Geométrica Limpia / Contemporánea

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
  | 'link'
  | 'globe'
  | 'video'
  | 'shoppingBag'
  | 'feather'
  | 'quote'
  | 'image'
  | 'cake'
  | 'partyPopper'
  | 'flame'
  | 'baby'
  | 'sun'
  | 'beer'
  | 'crown'
  | 'flower'
  | 'bus'
  | 'coffee'
  | 'cocktail'
  | 'trophy'
  | 'mic'
  | 'headphones'
  | 'compass'
  | 'qrCode'
  | 'phone'
  | 'mail'
  | 'dollarSign'
  | 'wallet'
  | 'umbrella'
  | 'watch'
  | 'tree'
  | 'moon'
  | 'gamepad'
  | 'smile'
  | 'shieldCheck'
  | 'infinity'
  | 'sparkle'

export type TexturaFondo =
  | 'liso'
  | 'papel_algodon'
  | 'marmol_oro'
  | 'acuarela_botanica'
  | 'noche_estrellada'
  | 'lino_rustico'
  | 'terciopelo_oscuro'
  | 'fiesta_neon'

export type SelloCeraTipo =
  | 'ninguno'
  | 'monograma_oro'
  | 'lacre_rojo'
  | 'esmeralda_botanica'
  | 'zafiro_corona'
  | 'corazon_oro'

export type MarcoDecorativoTipo =
  | 'ninguno'
  | 'oro_fino'
  | 'doble_dorado'
  | 'esquinas_vintage'
  | 'arco_floral'

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
  | 'texto_libre'       // Bloque libre de texto con alineación, tamaño y formato
  | 'imagen_libre'      // Fotografía o banner libre (polaroid, circular, banner)
  | 'boton_enlace'      // Botón hacia cualquier enlace web externo (Spotify, Falabella, video)
  | 'separador_ornamental' // Filete dorado, botánico, ondas o monograma decorativo

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
    // Confirmación RSVP
    metodoConfirmacion?: MetodoConfirmacion
    // Bloque de Texto Libre
    cuerpoTexto?: string
    alineacionTexto?: 'izquierda' | 'centro' | 'derecha'
    tamanoTexto?: 'sm' | 'base' | 'lg' | 'xl'
    estiloTexto?: 'normal' | 'cursiva' | 'serif' | 'destacado'
    colorTextoPersonalizado?: string
    // Bloque de Imagen Libre
    urlImagen?: string
    pieImagen?: string
    formatoImagen?: 'banner' | 'cuadrada' | 'polaroid' | 'circular' | 'tarjeta'
    // Bloque de Botón / Enlace Externo
    textoBoton?: string
    urlBoton?: string
    subtextoBoton?: string
    estiloBoton?: 'primario' | 'secundario' | 'dorado' | 'borde'
    iconoBoton?: NombreIcono
    // Separador Ornamental
    estiloSeparador?: 'linea_dorada' | 'rombo' | 'botanico' | 'onda' | 'puntos'
  }
}

export type MetodoConfirmacion = 'tarjeton' | 'whatsapp' | 'ambos'

export type FormaTarjeta = 'clasica' | 'arco' | 'doble_borde' | 'biselada'

export interface MusicaFondoConfig {
  activa: boolean
  url: string
  titulo?: string
  autoReproducir?: boolean
}

export type EstiloSobreTipo =
  | 'clasico'    // Protocolar Clásico / Barón en V con bordes dorados
  | 'moderno'    // Minimalista Chic con solapa recta horizontal contemporánea
  | 'vintage'    // Romántico Vintage con curvas suaves, arabescos y tono cálido
  | 'gala'       // Gala Golden Black con alto contraste y marco dorado doble
  | 'artesanal'  // Papel Artesanal Kraft con textura hecha a mano
  | 'diamante'   // Geométrico Diamante / Origami facetado

export type ColorLacreTipo =
  | 'oro'             // Oro fundido 24k resplandeciente
  | 'rojo_rubi'       // Rojo lacre tradicional burdeos imperial
  | 'azul_noche'      // Azul zafiro real profundo
  | 'verde_esmeralda' // Verde esmeralda bosque
  | 'negro_onix'      // Negro carbón / ónix gala
  | 'bronce'          // Bronce / cobre envejecido
  | 'rosa_oro'        // Oro rosa aperlado

export type ForroSobreTipo =
  | 'satinado'        // Degradado satinado suave de acento
  | 'arabesco'        // Arabescos barrocos y filigrana de oro
  | 'geometrico'      // Trama geométrica contemporánea
  | 'floral'          // Ramas de olivo y follaje botánico
  | 'liso'            // Fondo pulcro minimalista

export interface ConfiguracionVisual {
  fuenteTitulo: FuenteTipografica
  fuenteCuerpo: FuenteTipografica
  colorPrimario: string // Color de acento y botones principales
  colorSecundario: string // Tonalidades intermedias
  colorFondo: string // Fondo general de la página
  colorTarjeta: string // Color/transparencia de la tarjeta central
  colorTexto: string // Color tipográfico principal
  efectoFondo: EfectoFondo
  formaTarjeta?: FormaTarjeta // Silueta de la tarjeta (Arco, Clásica, Doble Borde, etc.)
  musicaFondo?: MusicaFondoConfig // Melodía protocolaria de fondo
  texturaFondo?: TexturaFondo // Textura estética de fondo (papel artesanal, mármol oro, etc.)
  selloCera?: SelloCeraTipo // Sello de cera / lacre artesanal en relieve
  marcoDecorativo?: MarcoDecorativoTipo // Marco de oro fino, esquineros vintage, etc.
  textoMonograma?: string // Monograma opcional para el sello (ej: "J&M", "50", "A")
  animacionSobre?: boolean // Animación interactiva de sobre protocolario al abrir la tarjeta
  colorSobre?: string // Color o estilo del sobre protocolario
  estiloSobre?: EstiloSobreTipo // Estilo de diseño del sobre (Clásico, Moderno, Vintage, Gala, etc.)
  colorLacre?: ColorLacreTipo // Tonalidad del sello de lacre
  forroSobre?: ForroSobreTipo // Patrón decorativo del forro interior
  textoImpresoSobre?: string // Texto de caligrafía o encabezado protocolario impreso en el sobre (ej: "Pase de Honor Protocolario", "Invitación Formal")
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
  metodoConfirmacion?: MetodoConfirmacion
}

export type EstadoConfirmacion = 'confirmado' | 'no_asiste' | 'pendiente'

export interface Invitado {
  id: string
  eventoId: string
  nombre: string
  pases: number // Cantidad de personas permitidas (1 = individual, 2+ = con acompañantes)
  esPlural: boolean // Define si el texto dice "Te esperamos" o "Los esperamos"
  telefono?: string // Opcional, para envío directo con un clic
  codigoAcceso: string // Token de invitación única
  confirmado?: boolean
  estadoConfirmacion?: EstadoConfirmacion
  cuposConfirmados?: number
  mensajeConfirmacion?: string
  fechaConfirmacion?: string
}

// Constante de negocio: Límite de invitados gratuitos
export const LIMITE_INVITADOS_GRATIS = 50
