import { DetalleEvento, Invitado } from '@/types/invitation'

/**
 * Genera un token aleatorio criptográficamente seguro para administración
 * Ejemplo: adm_k9f82a1c4b7e8d3a
 */
export function generarTokenAdmin(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `adm_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
  }
  return `adm_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Genera un slug limpio y amigable a partir del título
 * Ejemplo: "Boda de Sofía & Carlos" -> "boda-de-sofia-carlos-a9f2"
 */
export function generarSlug(titulo: string): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, '') // Remover guiones iniciales y finales
    .slice(0, 35)

  const sufijo = Math.random().toString(36).substring(2, 6)
  return `${base || 'evento'}-${sufijo}`
}

/**
 * Genera un token corto para el invitado
 */
export function generarTokenInvitado(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Construye la URL de confirmación de WhatsApp con texto dinámico
 */
export function construirUrlWhatsApp(evento: DetalleEvento, invitado?: Invitado): string {
  const nombreInvitado = invitado?.nombre || 'Invitado Especial'
  const pases = invitado?.pases || 1
  
  let texto = evento.whatsappPlantilla || '¡Hola! Confirmo mi asistencia al evento {evento}.'
  
  texto = texto
    .replace(/{invitado}/gi, nombreInvitado)
    .replace(/{evento}/gi, evento.titulo)
    .replace(/{anfitriones}/gi, evento.anfitriones)
    .replace(/{pases}/gi, pases.toString())

  const numeroLimpio = evento.whatsappNumero.replace(/[^0-9]/g, '')
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(texto)}`
}

/**
 * Construye el mensaje que el anfitrión enviará a su invitado para invitarlo
 */
export function construirMensajeCompartir(evento: DetalleEvento, invitado: Invitado, baseUrl: string): string {
  const enlaceInvitacion = `${baseUrl}/i/${evento.slugPublico}?g=${encodeURIComponent(invitado.nombre)}&t=${invitado.codigoAcceso}${invitado.esPlural ? '&p=1' : ''}`
  
  return `¡Hola ${invitado.nombre}! Te comparto la invitación a mi evento: *${evento.titulo}*.\n\nPuedes ver todos los detalles y confirmar tu asistencia aquí:\n${enlaceInvitacion}`
}

/**
 * Calcula si un evento ya ha expirado (Fecha evento + 7 días)
 */
export function haExpirado(fechaExpiracionIso: string): boolean {
  return new Date().getTime() > new Date(fechaExpiracionIso).getTime()
}
