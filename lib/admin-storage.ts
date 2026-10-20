import {
  Promocion,
  PublicacionLanding,
  ConfiguracionGlobal,
  MetricasSistema,
} from '@/types/admin'
import { EventoRepositorio, InvitadoRepositorio } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

const KEY_PROMOCIONES = 'invitacionesya_admin_promociones'
const KEY_PUBLICACIONES = 'invitacionesya_admin_publicaciones'
const KEY_CONFIGURACION = 'invitacionesya_admin_configuracion'

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

export const AdminStorage = {
  // ─── CONFIGURACIÓN GLOBAL ───
  obtenerConfiguracion(): ConfiguracionGlobal {
    if (typeof window === 'undefined') return CONFIGURACION_DEFAULT
    try {
      const data = localStorage.getItem(KEY_CONFIGURACION)
      return data ? { ...CONFIGURACION_DEFAULT, ...JSON.parse(data) } : CONFIGURACION_DEFAULT
    } catch {
      return CONFIGURACION_DEFAULT
    }
  },

  async obtenerConfiguracionAsync(): Promise<ConfiguracionGlobal> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/configuracion')
        if (res.ok) {
          const data = await res.json()
          if (data?.configuracion) {
            localStorage.setItem(KEY_CONFIGURACION, JSON.stringify(data.configuracion))
            return data.configuracion
          }
        }
      } catch {}
    }
    return this.obtenerConfiguracion()
  },

  guardarConfiguracion(config: Partial<ConfiguracionGlobal>): ConfiguracionGlobal {
    if (typeof window === 'undefined') return CONFIGURACION_DEFAULT
    const actual = this.obtenerConfiguracion()
    const nueva: ConfiguracionGlobal = {
      ...actual,
      ...config,
      ultimaActualizacion: new Date().toISOString(),
    }
    localStorage.setItem(KEY_CONFIGURACION, JSON.stringify(nueva))

    // Sincronización en segundo plano con la API
    fetch('/api/admin/configuracion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configuracion: nueva }),
    }).catch((e) => console.warn('Aviso sincronizando configuración con servidor:', e))

    return nueva
  },

  async guardarConfiguracionAsync(config: Partial<ConfiguracionGlobal>): Promise<ConfiguracionGlobal> {
    const actual = this.obtenerConfiguracion()
    const nueva: ConfiguracionGlobal = {
      ...actual,
      ...config,
      ultimaActualizacion: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      // La base de datos es la fuente de verdad: si no se guarda allí, se informa el error
      const res = await fetch('/api/admin/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuracion: nueva }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar la configuración.')
      const guardada = data?.configuracion || nueva
      localStorage.setItem(KEY_CONFIGURACION, JSON.stringify(guardada))
      return guardada
    }

    return nueva
  },

  // ─── PROMOCIONES & CUPONES ───
  obtenerPromociones(): Promocion[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(KEY_PROMOCIONES)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  guardarPromocion(promo: Promocion): Promocion {
    if (typeof window === 'undefined') return promo
    const lista = this.obtenerPromociones().filter((p) => p.id !== promo.id)
    lista.unshift(promo)
    localStorage.setItem(KEY_PROMOCIONES, JSON.stringify(lista))
    return promo
  },

  eliminarPromocion(id: string): void {
    if (typeof window === 'undefined') return
    const lista = this.obtenerPromociones().filter((p) => p.id !== id)
    localStorage.setItem(KEY_PROMOCIONES, JSON.stringify(lista))
  },

  validarCupon(codigo: string): { valido: boolean; promocion?: Promocion; mensaje?: string } {
    const lista = this.obtenerPromociones()
    const promo = lista.find(
      (p) => p.codigo.trim().toUpperCase() === codigo.trim().toUpperCase() && p.activo
    )

    if (!promo) {
      return { valido: false, mensaje: 'El código promocional no existe o está inactivo.' }
    }

    if (promo.fechaExpiracion && new Date(promo.fechaExpiracion) < new Date()) {
      return { valido: false, mensaje: 'Este cupón ha expirado.' }
    }

    if (promo.usosMaximos > 0 && promo.usosActuales >= promo.usosMaximos) {
      return { valido: false, mensaje: 'Este cupón ha alcanzado el límite máximo de usos.' }
    }

    return { valido: true, promocion: promo }
  },

  registrarUsoCupon(codigo: string): void {
    const lista = this.obtenerPromociones()
    const index = lista.findIndex(
      (p) => p.codigo.trim().toUpperCase() === codigo.trim().toUpperCase()
    )
    if (index !== -1) {
      lista[index].usosActuales += 1
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEY_PROMOCIONES, JSON.stringify(lista))
      }
    }
  },

  // ─── PUBLICACIONES & BANNERS EN LANDING PAGE ───
  obtenerPublicaciones(): PublicacionLanding[] {
    if (typeof window === 'undefined') return []
    try {
      const data = localStorage.getItem(KEY_PUBLICACIONES)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  guardarPublicacion(pub: PublicacionLanding): PublicacionLanding {
    if (typeof window === 'undefined') return pub
    const lista = this.obtenerPublicaciones().filter((p) => p.id !== pub.id)
    lista.unshift(pub)
    localStorage.setItem(KEY_PUBLICACIONES, JSON.stringify(lista))
    return pub
  },

  eliminarPublicacion(id: string): void {
    if (typeof window === 'undefined') return
    const lista = this.obtenerPublicaciones().filter((p) => p.id !== id)
    localStorage.setItem(KEY_PUBLICACIONES, JSON.stringify(lista))
  },

  // ─── CÁLCULO DE MÉTRICAS & INGRESOS ───
  // Si se reciben los eventos del servidor (Supabase) se usan como fuente de verdad;
  // si no, se recurre a la caché local del navegador.
  calcularMetricas(eventosServidor?: DetalleEvento[], totalInvitadosServidor?: number | null): MetricasSistema {
    const eventos: DetalleEvento[] = eventosServidor ?? EventoRepositorio.obtenerTodos()
    const config = this.obtenerConfiguracion()

    const totalEventos = eventos.length
    const eventosPremium = eventos.filter((e) => e.esPremium)
    const totalEventosPremium = eventosPremium.length
    const totalEventosGratis = totalEventos - totalEventosPremium

    // Ingresos calculados basados en eventos Premium aprobados
    const ingresosTotalesCOP = totalEventosPremium * config.precioPremiumCOP
    const ingresosTotalesUSD = Number(
      (totalEventosPremium * config.precioPremiumUSD).toFixed(2)
    )

    const tasaConversion =
      totalEventos > 0 ? Number(((totalEventosPremium / totalEventos) * 100).toFixed(1)) : 0

    // Conteo de invitados en todo el sistema
    let totalInvitados = 0
    if (typeof totalInvitadosServidor === 'number') {
      totalInvitados = totalInvitadosServidor
    } else {
      eventos.forEach((e) => {
        totalInvitados += InvitadoRepositorio.obtenerPorEvento(e.id).length
      })
    }

    // Más recientes primero según fecha de creación
    const eventosRecientes = [...eventos]
      .sort((a, b) => new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime())
      .slice(0, 10)

    const promocionesActivas = this.obtenerPromociones().filter((p) => p.activo).length
    const publicacionesActivas = this.obtenerPublicaciones().filter((p) => p.activo).length

    return {
      totalEventos,
      totalEventosPremium,
      totalEventosGratis,
      totalInvitados,
      ingresosTotalesCOP,
      ingresosTotalesUSD,
      tasaConversion,
      eventosRecientes,
      promocionesActivas,
      publicacionesActivas,
    }
  },
}
