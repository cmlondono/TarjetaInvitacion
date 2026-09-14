'use client'

import React from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Heart,
  Gift,
  Wine,
  Shirt,
  Music,
  Camera,
  Info,
  Car,
  Building2,
  Award,
  Landmark,
  Bell,
  Utensils,
  Plane,
  Gem,
  Check,
  Star,
  Users,
  MessageSquare,
  LucideIcon,
} from 'lucide-react'
import { NombreIcono } from '@/types/invitation'

export interface IconoInfo {
  id: NombreIcono
  etiqueta: string
}

export const LISTA_ICONOS_DISPONIBLES: IconoInfo[] = [
  { id: 'calendar', etiqueta: 'Calendario' },
  { id: 'clock', etiqueta: 'Reloj / Hora' },
  { id: 'mapPin', etiqueta: 'Ubicación' },
  { id: 'sparkles', etiqueta: 'Celebración' },
  { id: 'heart', etiqueta: 'Amor / Pareja' },
  { id: 'ring', etiqueta: 'Anillo / Boda' },
  { id: 'wine', etiqueta: 'Brindis / Cóctel' },
  { id: 'utensils', etiqueta: 'Cena / Banquete' },
  { id: 'music', etiqueta: 'Música / Fiesta' },
  { id: 'shirt', etiqueta: 'Etiqueta / Vestimenta' },
  { id: 'gift', etiqueta: 'Regalos / Sobres' },
  { id: 'camera', etiqueta: 'Fotografía' },
  { id: 'building', etiqueta: 'Hotel / Sede' },
  { id: 'church', etiqueta: 'Iglesia / Templo' },
  { id: 'car', etiqueta: 'Transporte / Parking' },
  { id: 'plane', etiqueta: 'Viaje' },
  { id: 'award', etiqueta: 'Grado / Protocolo' },
  { id: 'bell', etiqueta: 'Ceremonia' },
  { id: 'star', etiqueta: 'Destacado' },
  { id: 'users', etiqueta: 'Invitados' },
  { id: 'messageSquare', etiqueta: 'Mensaje' },
  { id: 'info', etiqueta: 'Información' },
]

const MAPA_ICONOS: Record<NombreIcono, LucideIcon> = {
  calendar: Calendar,
  clock: Clock,
  mapPin: MapPin,
  sparkles: Sparkles,
  heart: Heart,
  ring: Gem,
  wine: Wine,
  utensils: Utensils,
  music: Music,
  shirt: Shirt,
  gift: Gift,
  camera: Camera,
  building: Building2,
  church: Landmark,
  car: Car,
  plane: Plane,
  award: Award,
  bell: Bell,
  star: Star,
  users: Users,
  messageSquare: MessageSquare,
  info: Info,
  check: Check,
}

interface IconoDinamicoProps {
  nombre?: NombreIcono
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function IconoDinamico({
  nombre = 'sparkles',
  size = 16,
  className = '',
  style,
}: IconoDinamicoProps) {
  const IconoComponente = MAPA_ICONOS[nombre] || Sparkles
  return <IconoComponente size={size} className={className} style={style} />
}
