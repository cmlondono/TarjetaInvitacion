/**
 * Definición de tipos para la plataforma de invitaciones interactivas.
 * Arquitectura modular y extensible.
 */

export type TipoEvento =
  | 'boda'
  | 'cumpleanos'
  | 'cumpleanos_infantil'
  | 'grado'
  | 'quince_anos'
  | 'baby_shower'
  | 'revelacion_genero'
  | 'bautizo'
  | 'primera_comunion'
  | 'despedida_soltera'
  | 'aniversario'
  | 'paseo'
  | 'navidad'
  | 'amor_amistad'
  | 'disfraces'
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
  | 'pacifico' // Cursiva divertida (infantil, playa, paseos)
  | 'fraunces' // Serif cálida editorial
  | 'bricolage' // Display divertida y fuerte
  | 'fredoka' // Redondeada y tierna
  | 'dmsans' // Moderna y neutra

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
  | 'lienzo_libre'      // Collage libre: elementos libres (texto, fotos, stickers, formas)
  | 'historia'          // Nuestra historia / sobre el homenajeado, con foto e hitos
  | 'padrinos'          // Padrinos, damas de honor, chambelanes, ponentes
  | 'playlist'          // Playlist colaborativa: los invitados proponen canciones
  | 'vaca_regalo'       // Vaca / aporte colectivo para un regalo con meta
  | 'lista_regalos'     // Lista de regalos que cada invitado puede reservar
  | 'juego_adivinar'    // Juego o encuesta (¿cuánto pesará?, ¿niño o niña?)

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
  // Diseño libre tipo Canva (persistido en el JSONB `secciones`)
  elementos?: ElementoLienzo[] // Capa de elementos libres superpuestos a la sección
  estilo?: EstiloSeccion // Fondo, animación y alto del lienzo
  estilosTexto?: Record<string, EstiloTexto> // Estilo individual de cada texto editable (clave = campo)
  // Campos dinámicos del bloque modular
  datos?: {
    // Cabecera / Imágenes
    imagenPortada?: string // URL de imagen de fondo o banner superior
    imagenRetrato?: string // URL de fotografía o logo central
    mostrarFotoRetrato?: boolean // Permite ocultar o eliminar el círculo de foto/logo
    mostrarBadge?: boolean // Permite ocultar o eliminar el distintivo ("Convocatoria Oficial")
    textoBadge?: string // Texto editable para el distintivo/badge superior
    mostrarSeparador?: boolean // Permite ocultar o eliminar el separador de cabecera
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
    // Padrinos / personas destacadas
    personas?: PersonaDestacada[]
    // Playlist colaborativa
    canciones?: CancionPropuesta[]
    cancionesEliminadas?: string[] // Canciones que el anfitrión quitó (no se restauran al fusionar)
    enlacePlaylist?: string
    // Vaca para el regalo
    metaVaca?: number
    recaudadoVaca?: number
    medioPagoVaca?: string
    enlacePagoVaca?: string
    // Lista de regalos reservables
    regalos?: RegaloReservable[]
    // Juego / encuesta
    pregunta?: string
    opcionesJuego?: OpcionJuego[]
    // Texto del botón de confirmación y fecha límite
    fechaLimiteRsvp?: string
    // Pregunta de comida en la confirmación (vegano, sin gluten...): se puede cambiar o quitar
    preguntarComida?: boolean // Por defecto se pregunta
    preguntaComida?: string
    opcionesComida?: OpcionRsvp[]
    // Separador Ornamental
    estiloSeparador?:
      | 'linea_dorada'
      | 'rombo'
      | 'botanico'
      | 'onda'
      | 'puntos'
      | 'diamantes'
      | 'editorial_icono'
      | 'linea_simple'
  }
}

export interface PersonaDestacada {
  id: string
  nombre: string
  rol?: string
}

export interface CancionPropuesta {
  id: string
  titulo: string
  artista?: string
  propuestaPor?: string
}

export interface RegaloReservable {
  id: string
  nombre: string
  enlace?: string
  reservadoPor?: string
}

export interface OpcionRsvp {
  id: string
  texto: string
}

export interface OpcionJuego {
  id: string
  texto: string
  votos?: number
}

export type MetodoConfirmacion = 'tarjeton' | 'whatsapp' | 'ambos'

// ─────────── Rediseño v2: kits de estilo y experiencia del invitado ───────────

export type TipoApertura =
  | 'sobre'
  | 'telon'
  | 'raspa'
  | 'caja'
  | 'puertas' // Dos puertas que se abren hacia adentro
  | 'libro' // Tarjeta doblada que se despliega
  | 'boleto' // Boleto que se rasga por la línea punteada
  | 'globo' // Globo que se revienta
  | 'deslizar' // Portada a pantalla completa que sube
  | 'directo'

/**
 * Foto de fondo acomodable (invitación o apertura). La opacidad la mezcla con el color de fondo
 * del estilo, así el texto se sigue leyendo.
 */
export interface FotoFondo {
  url: string
  opacidad?: number // 0–1 (por defecto 0.35)
  x?: number // 0–100: punto de la foto que queda centrado (horizontal)
  y?: number // 0–100: (vertical)
  zoom?: number // 100–300 (%)
  desenfoque?: number // px
}
export type TipoRecorrido = 'pagina' | 'historias' | 'menu'
export type TipoOrnamento =
  | 'ramas'
  | 'filigrana'
  | 'confeti'
  | 'nubes'
  | 'palmas'
  | 'lineas'
  | 'estrellas'
  | 'globos'
  | 'corazones'
  | 'mariposas'
  | 'hojas'
  | 'copos'
  | 'ninguno'
export type TipoEsquinas = 'rectas' | 'suaves' | 'redondas'

export interface ExperienciaInvitado {
  apertura: TipoApertura
  recorrido: TipoRecorrido
  saludoPersonal: boolean
  confetiAlConfirmar: boolean
  botonCalendario: boolean
  // Personalización de la apertura (vacío = lo del estilo)
  colorApertura?: string
  tituloApertura?: string // Por defecto, los nombres del evento
  textoApertura?: string // Instrucción, p. ej. «Toca para abrir»
  fotoApertura?: FotoFondo
}

export type FormaTarjeta = 'clasica' | 'arco' | 'doble_borde' | 'biselada'

export interface MusicaFondoConfig {
  activa: boolean
  url: string // MP3 subido o enlazado, o enlace de YouTube / Spotify
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
  // Rediseño v2
  kitId?: string // Kit de estilo aplicado (jardin, gala, pop, nube, tropical, minimal...)
  esquinas?: TipoEsquinas
  ornamento?: TipoOrnamento // Ornamento del kit, siempre en bordes o detrás del texto
  experiencia?: ExperienciaInvitado
  fotoFondo?: FotoFondo // Foto detrás de toda la invitación
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
  mostrarFotoRetrato?: boolean
  mostrarBadge?: boolean
  textoBadge?: string
  esPremium: boolean // Si pagó por invitados ilimitados / sin anuncios
  limiteGratisInvitados?: number // Cupo de cortesía fijado al momento de su creación o por el Super Admin
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
  enviadoPorWhatsApp?: boolean
  fechaEnvioWhatsApp?: string
}

// Constante de negocio: Límite de invitados gratuitos
export const LIMITE_INVITADOS_GRATIS = 50

// ════════════════════ EDITOR LIBRE TIPO CANVA ════════════════════

export type AnimacionEntrada =
  | 'ninguna'
  | 'aparecer'
  | 'deslizar_arriba'
  | 'deslizar_izquierda'
  | 'deslizar_derecha'
  | 'zoom'
  | 'rebote'
  | 'girar'

/**
 * Estilo individual de un texto. Las propiedades vacías heredan el tema global,
 * así un cambio de paleta o tipografía sigue aplicando a lo no personalizado.
 */
export interface EstiloTexto {
  fuente?: FuenteTipografica
  tamano?: number // px (en elementos libres: px sobre un lienzo de 400px de ancho, escala con la pantalla)
  color?: string
  peso?: number // 300–800
  cursiva?: boolean
  subrayado?: boolean
  mayusculas?: boolean
  alineacion?: 'izquierda' | 'centro' | 'derecha'
  interletrado?: number // em
  interlineado?: number // múltiplo
  sombra?: 'ninguna' | 'suave' | 'marcada' | 'solida' | 'brillo'
  sombraColor?: string // si existe, la sombra usa este color con la intensidad elegida
  contornoColor?: string // borde alrededor de cada letra
  contornoGrosor?: number // px
  colorFondo?: string // resaltado detrás del texto
  marcoColor?: string // recuadro alrededor del texto
  marcoGrosor?: number // px
  curva?: number // -100…100: texto en arco (solo textos libres); positivo ⌒, negativo ∪
}

export type TipoElementoLienzo = 'texto' | 'imagen' | 'sticker' | 'icono' | 'forma'

export type MascaraImagen =
  | 'ninguna'
  | 'redondeada'
  | 'circulo'
  | 'arco'
  | 'corazon'
  | 'estrella'
  | 'hexagono'
  | 'gota'

export type FiltroImagen = 'ninguno' | 'bn' | 'sepia' | 'calido' | 'frio' | 'suave' | 'contraste' | 'vintage'

export type FormaGeometrica = 'rectangulo' | 'circulo' | 'linea' | 'triangulo' | 'rombo'

/**
 * Elemento libre posicionado dentro de una sección.
 * Las coordenadas son porcentajes para que el diseño sea idéntico en cualquier pantalla:
 *  - x, ancho, alto: % del ancho de la sección
 *  - y: % del alto de la sección
 */
export interface ElementoLienzo {
  id: string
  tipo: TipoElementoLienzo
  x: number
  y: number
  ancho: number
  alto?: number // ausente en textos (alto automático según contenido)
  rotacion: number
  opacidad: number // 0–1
  z: number
  bloqueado?: boolean
  oculto?: boolean
  animacion?: AnimacionEntrada
  volteoH?: boolean
  volteoV?: boolean
  // Texto
  texto?: string
  estiloTexto?: EstiloTexto
  // Imagen
  url?: string
  mascara?: MascaraImagen
  filtro?: FiltroImagen
  bordeAncho?: number
  bordeColor?: string
  radio?: number
  sombra?: boolean
  // Sticker / icono
  stickerId?: string
  icono?: NombreIcono
  color?: string
  // Forma
  forma?: FormaGeometrica
  colorRelleno?: string
  colorBorde?: string
  grosorBorde?: number
}

export interface EstiloSeccion {
  variante?: string // Distribución del bloque (p. ej. 'tarjeta' | 'linea' | 'columnas')
  fondoBloque?: 'tarjeta' | 'sin_fondo' | 'foto'
  ornamento?: { activo: boolean; posicion: 'esquinas' | 'arriba' | 'detras' }
  colorFondo?: string
  imagenFondo?: string
  opacidadImagenFondo?: number // 0–1
  animacion?: AnimacionEntrada
  alturaLienzo?: number // Solo lienzo_libre: alto como % del ancho (100 = cuadrado)
}
