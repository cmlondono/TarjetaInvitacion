import { DetalleEvento } from './invitation'

export interface Promocion {
  id: string
  codigo: string // Ej: 'PROMO50', 'LANZAMIENTO'
  tipoDescuento: 'porcentaje' | 'precio_fijo'
  valor: number // Porcentaje (ej: 50 para 50%) o valor en COP (ej: 9900)
  usosMaximos: number
  usosActuales: number
  activo: boolean
  fechaExpiracion?: string
  creadoEn: string
}

export interface PublicacionLanding {
  id: string
  tipo: 'banner_superior' | 'aviso_destacado' | 'comunicado'
  titulo: string
  contenido: string
  textoBoton?: string
  enlaceBoton?: string
  activo: boolean
  colorFondo?: string // Ej: '#0F172A' (Slate) o '#009EE3' (Mercado Pago)
  fechaCreacion: string
}

export interface ConfiguracionGlobal {
  precioPremiumCOP: number // Default: 15900
  precioPremiumUSD: number // Calculado: precio en COP ÷ tasa del día (no se edita)
  tasaCopPorUsd?: number // Pesos por dólar usados para calcular precioPremiumUSD
  paisVisitante?: string // País de quien consulta (solo en /api/configuracion), p. ej. «CO»
  limiteGratisInvitados: number // Default: 50
  anunciosAdsHabilitados: boolean // Default: true
  modoMantenimiento: boolean // Default: false
  mensajeMantenimiento?: string
  whatsappSoporte?: string // WhatsApp de ayuda para anfitriones
  ultimaActualizacion: string
}

export const CONFIGURACION_DEFAULT: ConfiguracionGlobal = {
  precioPremiumCOP: 15900,
  precioPremiumUSD: 3.99,
  limiteGratisInvitados: 50,
  anunciosAdsHabilitados: true,
  modoMantenimiento: false,
  mensajeMantenimiento: 'Estamos realizando labores de mantenimiento protocolario.',
  whatsappSoporte: '',
  ultimaActualizacion: new Date().toISOString(),
}

export interface MetricasSistema {
  totalEventos: number
  totalEventosPremium: number
  totalEventosGratis: number
  totalInvitados: number
  ingresosTotalesCOP: number
  ingresosTotalesUSD: number
  tasaConversion: number // Porcentaje de conversión a premium
  eventosRecientes: DetalleEvento[]
  promocionesActivas: number
  publicacionesActivas: number
}

export interface SesionAdmin {
  usuario: string
  rol: 'superadmin'
  expiraEn: number
}
