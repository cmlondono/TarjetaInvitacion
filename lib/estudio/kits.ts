import type {
  ConfiguracionVisual,
  EfectoFondo,
  ExperienciaInvitado,
  FuenteTipografica,
  TipoApertura,
  TipoEsquinas,
  TipoEvento,
  TipoEscena,
  TipoOrnamento,
} from '@/types/invitation'

/**
 * Kit de estilo: un solo toque cambia colores, letras, ornamento, esquinas y la apertura sugerida.
 * Los textos y fotos de la invitación no cambian.
 */
export interface KitEstilo {
  id: string
  nombre: string
  descripcion: string
  eventos: TipoEvento[]
  colores: {
    fondo: string
    tarjeta: string
    texto: string
    acento: string
    detalle: string
  }
  fuenteTitulo: FuenteTipografica
  fuenteCuerpo: FuenteTipografica
  ornamento: TipoOrnamento
  esquinas: TipoEsquinas
  apertura: TipoApertura
  efectoFondo: EfectoFondo
  /** Fondo animado (opcional) */
  escena?: TipoEscena
  /** Frase corta para mostrar en la tarjeta del kit */
  muestra: { kicker: string; titulo: string }
}

// Fila compacta: [id, nombre, descripción, eventos, fondo, tarjeta, texto, acento, detalle, fuenteTítulo, fuenteCuerpo, ornamento, esquinas, apertura, efecto, kicker, título]
type FilaKit = [
  string,
  string,
  string,
  TipoEvento[],
  string,
  string,
  string,
  string,
  string,
  FuenteTipografica,
  FuenteTipografica,
  TipoOrnamento,
  TipoEsquinas,
  TipoApertura,
  EfectoFondo,
  string,
  string,
]

const FILAS: FilaKit[] = [
  // ─── Matrimonio y aniversarios ───
  ['jardin', 'Jardín romántico', 'Sobre con lacre · ramas · rosa y salvia', ['boda', 'quince_anos', 'bautizo', 'aniversario', 'despedida_soltera'], '#F6EDE8', '#FFFBF8', '#3E2B2C', '#B4566A', '#8BA888', 'greatvibes', 'fraunces', 'ramas', 'suaves', 'sobre', 'ninguno', '¡Nos casamos!', 'Valentina & Andrés'],
  ['iglesia', 'Clásico blanco y oro', 'Sobre · filigrana · ceremonia religiosa', ['boda', 'primera_comunion', 'bautizo', 'aniversario', 'quince_anos'], '#F7F5F0', '#FFFFFF', '#2B2620', '#8C6D1F', '#D4B26A', 'cormorant', 'cormorant', 'filigrana', 'rectas', 'sobre', 'ninguno', 'Unidos en matrimonio', 'Laura & Santiago'],
  ['rustico', 'Rústico campestre', 'Finca o hacienda · hojas · tonos tierra', ['boda', 'aniversario', 'bautizo', 'primera_comunion', 'paseo'], '#EFE6D8', '#FBF6EE', '#3B2F25', '#8A5A3B', '#7D8B5C', 'alexbrush', 'lora', 'hojas', 'suaves', 'sobre', 'ninguno', 'Nos casamos en el campo', 'Mariana & Felipe'],
  ['playa', 'Playa Caribe', 'Raspa y descubre · palmas · turquesa', ['boda', 'despedida_soltera', 'paseo', 'aniversario', 'cumpleanos'], '#DDF1F0', '#FFFFFF', '#12384A', '#C8553D', '#3AA6A0', 'greatvibes', 'dmsans', 'palmas', 'redondas', 'raspa', 'ninguno', 'Boda frente al mar', 'Camila & Daniel'],
  ['boho', 'Boho terracota', 'Sobre · hojas secas · terracota', ['boda', 'despedida_soltera', 'aniversario', 'baby_shower'], '#F3E3D3', '#FFF8F0', '#4A2C21', '#B5543A', '#D9A066', 'fraunces', 'dmsans', 'hojas', 'suaves', 'sobre', 'ninguno', 'Celebremos el amor', 'Sara & Tomás'],
  ['esmeralda', 'Esmeralda y oro', 'Telón · filigrana dorada · verde profundo', ['boda', 'aniversario', 'grado', 'corporativo'], '#0E3B2E', '#F8F4EA', '#173328', '#0E3B2E', '#C9A44C', 'prata', 'montserrat', 'filigrana', 'suaves', 'telon', 'particulas_doradas', 'Bodas de plata', '25 años juntos'],
  ['champana', 'Champaña', 'Sobre · líneas finas · nude y dorado', ['boda', 'quince_anos', 'aniversario', 'cumpleanos'], '#F2E9DC', '#FFFCF7', '#3A3027', '#8A6A40', '#D8C3A5', 'cormorant', 'montserrat', 'lineas', 'suaves', 'sobre', 'ninguno', 'Brindemos juntos', 'Ana & Luis'],
  ['gala', 'Gala noche', 'Telón · líneas doradas · fondo oscuro', ['boda', 'grado', 'corporativo', 'quince_anos', 'navidad'], '#15171D', '#1E2129', '#F2ECE1', '#D6B35C', '#7A6A45', 'fraunces', 'dmsans', 'filigrana', 'suaves', 'telon', 'particulas_doradas', 'Te invitamos', 'Noche de gala'],

  // ─── Quince años ───
  ['rosa_dorado', 'Rosa dorado', 'Telón · estrellas · rosa y oro', ['quince_anos', 'cumpleanos', 'despedida_soltera'], '#F9E4E6', '#FFFFFF', '#4A2433', '#C2185B', '#D4A373', 'parisienne', 'montserrat', 'estrellas', 'suaves', 'telon', 'destellos', 'Mis XV años', 'Isabella'],
  ['azul_royal', 'Azul royal y plata', 'Telón · estrellas · azul profundo', ['quince_anos', 'grado', 'boda'], '#0F1E4A', '#F5F7FB', '#0F1E4A', '#2B4BC8', '#B9C2D3', 'cinzel', 'montserrat', 'estrellas', 'suaves', 'telon', 'estrellas', 'Mis quince', 'Valeria'],
  ['lila_mariposas', 'Mariposas lila', 'Sobre · mariposas · lila y rosa', ['quince_anos', 'cumpleanos_infantil', 'primera_comunion', 'baby_shower'], '#EFE7FA', '#FFFFFF', '#3D2A5C', '#8E5CC5', '#E5A3D1', 'greatvibes', 'poppins', 'mariposas', 'redondas', 'sobre', 'ninguno', 'Mis XV años', 'Mariana'],
  ['neon_xv', 'Neón', 'Caja de regalo · estrellas · noche y neón', ['quince_anos', 'cumpleanos', 'despedida_soltera', 'disfraces'], '#120B2E', '#1E1545', '#F5F0FF', '#FF3CAC', '#3EE6E6', 'bricolage', 'dmsans', 'estrellas', 'redondas', 'caja', 'destellos', '¡Mis 15!', 'Sofía'],

  // ─── Cumpleaños infantil: niñas ───
  ['princesa', 'Princesa rosa', 'Caja de regalo · corazones · rosa y dorado', ['cumpleanos_infantil'], '#FFE3EE', '#FFFFFF', '#5A1E3C', '#D63370', '#F7C948', 'pacifico', 'fredoka', 'corazones', 'redondas', 'caja', 'destellos', '¡Ven a mi fiesta!', 'Mis 5 años · Emilia'],
  ['unicornio', 'Unicornio pastel', 'Caja de regalo · estrellas · lila y aguamarina', ['cumpleanos_infantil', 'baby_shower'], '#F3E8FF', '#FFFFFF', '#4B2C6F', '#9333EA', '#67D8E8', 'pacifico', 'fredoka', 'estrellas', 'redondas', 'caja', 'estrellas', '¡Una fiesta mágica!', 'Mis 6 años · Luciana'],
  ['sirena', 'Sirenita', 'Raspa y descubre · nubes · mar pastel', ['cumpleanos_infantil'], '#DFF7F4', '#FFFFFF', '#0F4C5C', '#168F83', '#F48FB1', 'pacifico', 'fredoka', 'nubes', 'redondas', 'raspa', 'ninguno', 'Fiesta bajo el mar', 'Mis 7 años · Antonella'],

  // ─── Cumpleaños infantil: niños ───
  ['superheroes', 'Superhéroes', 'Caja de regalo · estrellas · rojo y azul', ['cumpleanos_infantil'], '#1D4ED8', '#FFFFFF', '#0B1A3D', '#DC2626', '#FACC15', 'bricolage', 'dmsans', 'estrellas', 'suaves', 'caja', 'ninguno', '¡Misión cumpleaños!', 'Mis 6 años · Samuel'],
  ['dinosaurios', 'Dinosaurios', 'Caja de regalo · hojas · selva', ['cumpleanos_infantil'], '#D9F0C8', '#FFFFFF', '#1F3B14', '#3F8F2E', '#F59E0B', 'bricolage', 'fredoka', 'hojas', 'redondas', 'caja', 'ninguno', '¡Rugido de fiesta!', 'Mis 4 años · Martín'],
  ['espacio', 'Aventura espacial', 'Telón · estrellas · galaxia', ['cumpleanos_infantil', 'cumpleanos'], '#0B1033', '#161D4D', '#F1F4FF', '#FFB020', '#7DD3FC', 'bricolage', 'dmsans', 'estrellas', 'redondas', 'telon', 'estrellas', 'Despegamos a los 8', 'Jerónimo'],
  ['futbol', 'Fútbol', 'Directo · líneas de cancha · verde', ['cumpleanos_infantil', 'cumpleanos'], '#E7F6E7', '#FFFFFF', '#12301A', '#15803D', '#111827', 'bricolage', 'dmsans', 'lineas', 'suaves', 'directo', 'ninguno', '¡Golazo de cumpleaños!', 'Mis 9 años · Juan José'],
  ['safari', 'Safari', 'Caja de regalo · hojas · tonos selva', ['cumpleanos_infantil', 'baby_shower'], '#F6E9C8', '#FFFDF6', '#3D2B12', '#B0621A', '#4D7C3A', 'bricolage', 'fredoka', 'hojas', 'redondas', 'caja', 'ninguno', 'Aventura safari', 'Mis 3 años · Tomás'],
  ['gamer', 'Fiesta gamer', 'Caja de regalo · líneas · neón', ['cumpleanos_infantil', 'cumpleanos'], '#0F0F1A', '#1B1B2E', '#EDEDFF', '#22D3EE', '#A3E635', 'bricolage', 'dmsans', 'lineas', 'rectas', 'caja', 'ninguno', 'Nivel 12 desbloqueado', 'Matías'],

  // ─── Primer añito, baby shower y revelación ───
  ['primer_anito', 'Mi primer añito', 'Caja de regalo · globos · tonos suaves', ['cumpleanos_infantil', 'bautizo', 'baby_shower'], '#FFF4E6', '#FFFFFF', '#4A3B2A', '#C8642E', '#9CC9E8', 'fredoka', 'fredoka', 'globos', 'redondas', 'caja', 'ninguno', 'Mi primer añito', 'Salomé'],
  ['nube', 'Nube pastel', 'Directo · nubes · azul y rosa suave', ['baby_shower', 'bautizo', 'cumpleanos_infantil', 'revelacion_genero'], '#E6EEFF', '#FFFFFF', '#2B3858', '#4C75D9', '#F4B8C8', 'fredoka', 'fredoka', 'nubes', 'redondas', 'directo', 'estrellas', 'Baby shower', 'Bebé Emma'],
  ['osito_azul', 'Osito azul', 'Directo · nubes · azul cielo', ['baby_shower', 'bautizo', 'cumpleanos_infantil'], '#E3F0FB', '#FFFFFF', '#1E3A5F', '#2563EB', '#FCD34D', 'fredoka', 'fredoka', 'nubes', 'redondas', 'directo', 'ninguno', 'Viene un niño', 'Bebé Joaquín'],
  ['lluvia_rosa', 'Lluvia rosa', 'Directo · corazones · rosa', ['baby_shower', 'bautizo'], '#FCE7EF', '#FFFFFF', '#5B2440', '#DB2777', '#FBCFE8', 'greatvibes', 'fredoka', 'corazones', 'redondas', 'directo', 'ninguno', 'Viene una niña', 'Bebé Abril'],
  ['revelacion', '¿Niño o niña?', 'Raspa y descubre · globos · rosa y azul', ['revelacion_genero', 'baby_shower'], '#FFF7ED', '#FFFFFF', '#2F2A3A', '#DB2777', '#3B82F6', 'fredoka', 'fredoka', 'globos', 'redondas', 'raspa', 'ninguno', '¿Niño o niña?', 'Familia Gómez'],

  // ─── Bautizo y primera comunión ───
  ['comunion', 'Comunión celeste', 'Sobre · filigrana · celeste y oro', ['primera_comunion', 'bautizo'], '#EAF4FB', '#FFFFFF', '#1E3550', '#3C7DB8', '#D4B26A', 'greatvibes', 'lora', 'filigrana', 'suaves', 'sobre', 'ninguno', 'Mi primera comunión', 'Valentina'],

  // ─── Cumpleaños de adultos ───
  ['pop', 'Fiesta pop', 'Caja de regalo · confeti · colores vivos', ['cumpleanos', 'otro', 'cumpleanos_infantil'], '#FFE15A', '#FFFFFF', '#1B1820', '#E8336F', '#3D7BFF', 'bricolage', 'dmsans', 'confeti', 'redondas', 'caja', 'confeti', '¡Vamos a celebrar!', 'Los 30 de Mateo'],
  ['disco', 'Noche disco', 'Telón · estrellas · morado y dorado', ['cumpleanos', 'despedida_soltera', 'aniversario', 'amor_amistad'], '#2A0F3D', '#3A1656', '#FFF1F9', '#FFC93C', '#FF5DA2', 'bricolage', 'dmsans', 'estrellas', 'redondas', 'telon', 'destellos', 'Noche disco', 'Los 40 de Carolina'],
  ['vintage', 'Brindis vintage', 'Sobre · líneas · petróleo y cobre', ['cumpleanos', 'aniversario', 'corporativo', 'grado'], '#1F2A2E', '#F6F1E7', '#22313A', '#9A6324', '#7A9E9F', 'prata', 'lora', 'lineas', 'suaves', 'sobre', 'ninguno', 'Brindemos por los 50', 'Ricardo'],

  // ─── Despedida, salidas y paseos ───
  ['despedida', 'Última noche de soltera', 'Caja de regalo · corazones · fucsia', ['despedida_soltera', 'cumpleanos'], '#FFD6E8', '#FFFFFF', '#3B0A2A', '#E11D74', '#111111', 'bricolage', 'dmsans', 'corazones', 'redondas', 'caja', 'confeti', 'Última noche de soltera', 'Despedida de Daniela'],
  ['paseo_rio', 'Paseo de río', 'Directo · hojas · verde y naranja', ['paseo'], '#DCEFE3', '#FFFFFF', '#133A2A', '#1F8A5B', '#F2A33A', 'pacifico', 'dmsans', 'hojas', 'redondas', 'directo', 'ninguno', '¡Nos vamos de paseo!', 'Paseo de olla al río'],
  ['asado', 'Asado en la finca', 'Directo · hojas · tonos brasa', ['paseo', 'cumpleanos', 'corporativo'], '#F4E7DA', '#FFFAF4', '#3A2216', '#C2410C', '#6B8E23', 'bricolage', 'dmsans', 'hojas', 'suaves', 'directo', 'ninguno', 'Asado familiar', 'Domingo en la finca'],
  ['viaje', 'Plan de viaje', 'Directo · líneas · azul y amarillo', ['paseo', 'despedida_soltera'], '#E8F1FF', '#FFFFFF', '#10243F', '#2563EB', '#F59E0B', 'bricolage', 'dmsans', 'lineas', 'suaves', 'directo', 'ninguno', 'Nos vamos de viaje', 'Rumbo a Santa Marta'],
  ['tropical', 'Tropical', 'Raspa y descubre · hojas de palma · naranja', ['cumpleanos', 'boda', 'otro', 'paseo'], '#0F5A4C', '#FFF5E3', '#173B33', '#D9601C', '#F6C445', 'bricolage', 'dmsans', 'palmas', 'suaves', 'raspa', 'destellos', 'Fiesta en la playa', 'Sol & Mar'],

  // ─── Fechas especiales ───
  ['novena', 'Novena navideña', 'Caja de regalo · copos · rojo y verde', ['navidad'], '#8E1B1B', '#FFF8EE', '#3A1414', '#B91C1C', '#1E6B3A', 'pacifico', 'lora', 'copos', 'suaves', 'caja', 'estrellas', 'Novena de aguinaldos', 'Familia Rodríguez'],
  ['fin_de_ano', 'Fin de año dorado', 'Telón · estrellas · negro y oro', ['navidad', 'corporativo'], '#111827', '#1F2937', '#F9FAFB', '#EAB308', '#E5E7EB', 'fraunces', 'dmsans', 'estrellas', 'suaves', 'telon', 'particulas_doradas', 'Fiesta de fin de año', 'Despedimos el 2026'],
  ['amor_amistad', 'Amor y amistad', 'Caja de regalo · corazones · rojo y rosa', ['amor_amistad', 'aniversario'], '#FFE4E6', '#FFFFFF', '#4C0519', '#E11D48', '#FDA4AF', 'pacifico', 'dmsans', 'corazones', 'redondas', 'caja', 'ninguno', 'Amigo secreto', 'Amor y amistad 2026'],
  ['disfraces', 'Noche de disfraces', 'Telón · estrellas · morado y naranja', ['disfraces', 'cumpleanos', 'cumpleanos_infantil'], '#1C1326', '#2A1E38', '#FFF4E5', '#F97316', '#A78BFA', 'bricolage', 'dmsans', 'estrellas', 'suaves', 'telon', 'ninguno', 'Fiesta de disfraces', '31 de octubre'],

  // ─── Grados y empresa ───
  ['toga', 'Toga y birrete', 'Telón · líneas · azul noche y dorado', ['grado'], '#0F172A', '#FFFFFF', '#0F172A', '#0F172A', '#C9A227', 'fraunces', 'montserrat', 'lineas', 'suaves', 'telon', 'particulas_doradas', '¡Me gradué!', 'Camila Rodríguez'],
  ['protocolo', 'Protocolo clásico', 'Sobre · filigrana · azul noche y dorado', ['corporativo', 'grado', 'boda'], '#F4F1EA', '#FFFFFF', '#0F172A', '#0F172A', '#C9A227', 'cinzel', 'montserrat', 'filigrana', 'rectas', 'sobre', 'ninguno', 'Convocatoria', 'Gala Anual 2027'],
  // ─── Superhéroes y princesas con fondo animado (dibujos originales) ───
  ['heroe_comic', 'Cómic ¡POW!', 'Puertas · cómic animado · rojo, azul y amarillo', ['cumpleanos_infantil', 'cumpleanos'], '#FDE047', '#FFFFFF', '#0B1A3D', '#DC2626', '#2563EB', 'bricolage', 'fredoka', 'estrellas', 'suaves', 'puertas', 'ninguno', '¡Misión cumpleaños!', 'Mis 7 años · Tomás'],
  ['heroe_ciudad', 'Héroe de la ciudad', 'Portada que sube · ciudad de noche animada', ['cumpleanos_infantil', 'cumpleanos'], '#0B1033', '#FFFFFF', '#0B1A3D', '#DC2626', '#FACC15', 'bricolage', 'dmsans', 'estrellas', 'suaves', 'deslizar', 'ninguno', '¡Al rescate!', 'Mis 6 años · Samuel'],
  ['heroe_trueno', 'Trueno y relámpago', 'Boleto · tormenta de rayos animada · azul y dorado', ['cumpleanos_infantil', 'cumpleanos'], '#111827', '#F8FAFC', '#0F172A', '#1D4ED8', '#FACC15', 'bricolage', 'dmsans', 'lineas', 'rectas', 'boleto', 'ninguno', '¡Que retumbe la fiesta!', 'Mis 8 años · Emiliano'],
  ['heroe_fuerza', 'Fuerza verde', 'Caja de regalo · cómic animado · verde y morado', ['cumpleanos_infantil', 'cumpleanos'], '#BBF7D0', '#FFFFFF', '#14240F', '#16A34A', '#7C3AED', 'bricolage', 'fredoka', 'estrellas', 'suaves', 'caja', 'ninguno', '¡Fuerza de cumpleaños!', 'Mis 5 años · Nicolás'],
  ['princesa_castillo', 'Castillo encantado', 'Tarjeta doblada · castillo animado · rosa y dorado', ['cumpleanos_infantil', 'quince_anos'], '#FBCFE8', '#FFFFFF', '#5A1E3C', '#DB2777', '#F7C948', 'pacifico', 'fredoka', 'corazones', 'redondas', 'libro', 'ninguno', 'Érase una vez…', 'Mis 5 años · Isabella'],
  ['princesa_hielo', 'Reino de hielo', 'Puertas · aurora y copos animados · azul hielo', ['cumpleanos_infantil', 'navidad'], '#DBEAFE', '#FFFFFF', '#0C2D4D', '#2563EB', '#67E8F9', 'pacifico', 'fredoka', 'copos', 'redondas', 'puertas', 'ninguno', 'Una fiesta de cristal', 'Mis 6 años · Valeria'],
  ['princesa_hadas', 'Jardín de hadas', 'Globo · luciérnagas y mariposas animadas', ['cumpleanos_infantil', 'baby_shower'], '#FCE7F3', '#FFFFFF', '#3B2A4A', '#C026D3', '#34D399', 'pacifico', 'fredoka', 'mariposas', 'redondas', 'globo', 'ninguno', 'Un jardín mágico', 'Mis 4 años · Sofía'],
  ['princesa_real', 'Princesa real', 'Sobre · castillo animado · morado y dorado', ['cumpleanos_infantil', 'quince_anos'], '#E9D5FF', '#FFFFFF', '#3B0764', '#7E22CE', '#FBBF24', 'greatvibes', 'fredoka', 'filigrana', 'redondas', 'sobre', 'ninguno', 'Te invito a mi palacio', 'Mis 7 años · Mariana'],
  ['minimal', 'Minimal', 'Directo · sin ornamentos · blanco y negro', ['boda', 'grado', 'corporativo', 'cumpleanos', 'baby_shower', 'quince_anos', 'bautizo', 'otro', 'aniversario', 'paseo', 'revelacion_genero', 'primera_comunion'], '#EFEFEB', '#FFFFFF', '#171717', '#171717', '#B5B5AE', 'dmsans', 'dmsans', 'lineas', 'rectas', 'directo', 'ninguno', 'Celebremos', 'Ana & Luis'],
]

/** Kits con fondo animado */
const ESCENA_DEL_KIT: Record<string, TipoEscena> = {
  superheroes: 'comic',
  princesa: 'castillo',
  heroe_comic: 'comic',
  heroe_ciudad: 'ciudad',
  heroe_trueno: 'tormenta',
  heroe_fuerza: 'comic',
  princesa_castillo: 'castillo',
  princesa_hielo: 'hielo',
  princesa_hadas: 'hadas',
  princesa_real: 'castillo',
}

export const KITS: KitEstilo[] = FILAS.map(
  ([id, nombre, descripcion, eventos, fondo, tarjeta, texto, acento, detalle, fuenteTitulo, fuenteCuerpo, ornamento, esquinas, apertura, efectoFondo, kicker, titulo]) => ({
    id,
    nombre,
    descripcion,
    eventos,
    colores: { fondo, tarjeta, texto, acento, detalle },
    fuenteTitulo,
    fuenteCuerpo,
    ornamento,
    esquinas,
    apertura,
    efectoFondo,
    escena: ESCENA_DEL_KIT[id],
    muestra: { kicker, titulo },
  })
)

export const KIT_POR_DEFECTO = KITS[0]

export function obtenerKit(id?: string): KitEstilo | undefined {
  return KITS.find((k) => k.id === id)
}

export const EXPERIENCIA_POR_DEFECTO: ExperienciaInvitado = {
  apertura: 'sobre',
  recorrido: 'pagina',
  saludoPersonal: true,
  confetiAlConfirmar: true,
  botonCalendario: true,
}

/** Experiencia efectiva de una invitación (compatible con invitaciones creadas antes del rediseño) */
export function experienciaDe(visual: ConfiguracionVisual): ExperienciaInvitado {
  if (visual.experiencia) return { ...EXPERIENCIA_POR_DEFECTO, ...visual.experiencia }
  return { ...EXPERIENCIA_POR_DEFECTO, apertura: visual.animacionSobre ? 'sobre' : 'directo' }
}

/**
 * Aplica un kit a la configuración visual. Conserva lo que no es "estilo"
 * (música, experiencia elegida por el usuario, banderas de visibilidad).
 */
export function aplicarKit(
  visual: ConfiguracionVisual,
  kit: KitEstilo,
  opciones: { cambiarApertura?: boolean } = {}
): ConfiguracionVisual {
  const experiencia = experienciaDe(visual)
  return {
    ...visual,
    kitId: kit.id,
    colorFondo: kit.colores.fondo,
    colorTarjeta: kit.colores.tarjeta,
    colorTexto: kit.colores.texto,
    colorPrimario: kit.colores.acento,
    colorSecundario: kit.colores.detalle,
    fuenteTitulo: kit.fuenteTitulo,
    fuenteCuerpo: kit.fuenteCuerpo,
    ornamento: kit.ornamento,
    esquinas: kit.esquinas,
    efectoFondo: kit.efectoFondo,
    escena: kit.escena,
    experiencia: opciones.cambiarApertura ? { ...experiencia, apertura: kit.apertura } : experiencia,
  }
}

/** Configuración visual completa a partir de un kit (para invitaciones nuevas) */
export function visualDesdeKit(kit: KitEstilo): ConfiguracionVisual {
  return aplicarKit(
    {
      fuenteTitulo: kit.fuenteTitulo,
      fuenteCuerpo: kit.fuenteCuerpo,
      colorPrimario: kit.colores.acento,
      colorSecundario: kit.colores.detalle,
      colorFondo: kit.colores.fondo,
      colorTarjeta: kit.colores.tarjeta,
      colorTexto: kit.colores.texto,
      efectoFondo: kit.efectoFondo,
      mostrarCuentaRegresiva: true,
      mostrarUbicacion: true,
      mostrarDressCode: true,
      mostrarGaleria: true,
      mostrarLluviaSobres: true,
    },
    kit,
    { cambiarApertura: true }
  )
}
