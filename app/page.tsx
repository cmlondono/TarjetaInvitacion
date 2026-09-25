import Link from 'next/link'
import { Metadata } from 'next'
import {
  ArrowRight,
  Shield,
  CalendarCheck,
  Building2,
  Check,
  Award,
  Layers,
  Sparkles,
  Smartphone,
  Lock,
  MessageCircle,
  MapPin,
  Clock,
} from 'lucide-react'
import { LandingAnnouncementBanner } from '@/components/landing/anuncio-banner'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
import { ServidorAlmacen } from '@/lib/server-storage'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { CONFIGURACION_DEFAULT } from '@/types/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tarjetón — Convocatorias Protocolarias & Tarjetas Formales para WhatsApp',
  description:
    'Diseñe tarjetones de invitación digitales interactivos para actos corporativos, asambleas, grados y celebraciones formales. Confirmación por WhatsApp y control de aforo.',
  keywords: [
    'tarjeton digital',
    'tarjetones de invitacion',
    'invitaciones corporativas digitales',
    'tarjetas de invitacion formales',
    'invitaciones protocolarias whatsapp',
    'confirmacion rsvp whatsapp',
    'invitaciones ejecutivas personalizadas',
  ],
  openGraph: {
    title: 'Tarjetón — Papelería Digital Protocolaria & Corporativa',
    description:
      'Diseño formal de tarjetones interactivos sin registros obligatorios. Confirmación directa en WhatsApp y control de aforo.',
    url: 'https://invitacionesya.com',
    siteName: 'Tarjetón',
    locale: 'es_LA',
    type: 'website',
  },
}

export default async function PaginaInicio() {
  let config = ServidorAlmacen.obtenerConfiguracion()
  try {
    const supabase = obtenerClienteSupabase()
    if (supabase) {
      const { data } = await supabase
        .from('configuracion_global')
        .select('*')
        .eq('id', 'principal')
        .maybeSingle()
      if (data) {
        config = {
          ...config,
          precioPremiumCOP: data.precio_premium_cop ?? config.precioPremiumCOP,
          precioPremiumUSD: Number(data.precio_premium_usd ?? config.precioPremiumUSD),
          limiteGratisInvitados: data.limite_gratis_invitados ?? config.limiteGratisInvitados,
          anunciosAdsHabilitados: data.anuncios_ads_habilitados ?? config.anunciosAdsHabilitados,
          modoMantenimiento: data.modo_mantenimiento ?? config.modoMantenimiento,
          mensajeMantenimiento: data.mensaje_mantenimiento ?? config.mensajeMantenimiento,
          whatsappSoporte: data.whatsapp_soporte ?? config.whatsappSoporte,
        }
      }
    }
  } catch {}

  const jsonLdWeb = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tarjetón',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Plataforma formal para confeccionar tarjetones e invitaciones digitales interactivas con confirmación en WhatsApp.',
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-serif selection:bg-slate-900 selection:text-white" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWeb) }}
      />

      {/* Banner de Modo Mantenimiento si está activo */}
      {config.modoMantenimiento && (
        <div className="w-full bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-xs font-bold border-b border-amber-600 shadow-xs flex items-center justify-center gap-2">
          <span>⚠️ Aviso del Sistema: {config.mensajeMantenimiento || 'El sistema se encuentra en mantenimiento programado.'}</span>
        </div>
      )}

      {/* Banner de Anuncios y Promociones Administrables */}
      <LandingAnnouncementBanner />

      {/* Navegación Superior Formal (Tema Claro y Limpio) */}
      <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 py-4 flex items-center justify-between shadow-2xs">
        <TarjetonLogo size="md" subtexto="protocolo" />

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#solucion" className="hover:text-slate-900 transition-colors">
            Metodología
          </a>
          <a href="#ocasiones" className="hover:text-slate-900 transition-colors">
            Actos Formales
          </a>
          <a href="#licencias" className="hover:text-slate-900 transition-colors">
            Condiciones & Tarifas
          </a>
        </nav>

        <Link
          href="/crear"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <span>Confeccionar Tarjeta</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero Section Editorial */}
      <section className="relative px-6 sm:px-10 pt-16 pb-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Badge de Protocolo y Acceso Libre */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sin registros obligatorios · Hasta {config.limiteGratisInvitados} pases de cortesía</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl text-slate-950">
          Diseño formal de tarjetas de invitación interactivas
        </h1>

        {/* Subtítulo */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
          Confeccione convocatorias sobrias para actos corporativos, ceremonias de gala y eventos de etiqueta. Genere pases nominales individuales y gestione confirmaciones directas en su WhatsApp institucional.
        </p>

        {/* Botones de Acción */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/crear"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Iniciar Estudio de Diseño</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#solucion"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors flex items-center justify-center"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Garantías de Convocatoria */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-xs text-slate-600 border-t border-slate-200 pt-8">
          <div className="flex items-center justify-center gap-2 font-medium">
            <Lock size={15} className="text-slate-800" /> Cero contraseñas
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <Smartphone size={15} className="text-slate-800" /> WhatsApp oficial
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <Building2 size={15} className="text-slate-800" /> Formato corporativo
          </div>
          <div className="flex items-center justify-center gap-2 font-medium">
            <Shield size={15} className="text-slate-800" /> Expiración automática
          </div>
        </div>
      </section>

      {/* Sección Arquitectura de la Solución (3 Pasos) */}
      <section id="solucion" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs tracking-widest uppercase text-slate-500 font-semibold">
              Metodología de Convocatoria
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 mt-2">
              Sobriedad visual sin barreras técnicas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Un flujo ágil y confiable diseñado para secretarías generales, comités organizadores y anfitriones formales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5 font-bold">
                  <Layers size={20} />
                </div>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Paso 01</span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Configuración Estética
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Personalice tipografías sobrias, paleta de colores formal, código de etiqueta y coordenadas de la sede con Google Maps.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5 font-bold">
                  <CalendarCheck size={20} />
                </div>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Paso 02</span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Asignación Nominal de Pases
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Expida credenciales nominales con el nombre de cada invitado o delegación, aforo reservado y enlace único.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5 font-bold">
                  <MessageCircle size={20} />
                </div>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">Paso 03</span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Recepción de Asistencia por WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Su invitado abre su pase digital y confirma con un solo toque mediante un mensaje prediseñado con sus datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Tipos de Acto */}
      <section id="ocasiones" className="py-20 max-w-5xl mx-auto px-6 sm:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs tracking-widest uppercase text-slate-500 font-semibold">Casos de Aplicación</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 mt-2">
            Versatilidad para toda ocasión de etiqueta
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Estructuras visuales equilibradas para garantizar una presentación impecable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              titulo: 'Cumbres & Actos Corporativos',
              tipo: 'Lanzamientos, juntas directivas, asambleas de socios y cócteles institucionales.',
              icono: <Building2 size={20} className="text-slate-800" />,
            },
            {
              titulo: 'Bodas & Enlaces de Etiqueta',
              tipo: 'Ceremonias solemnes con indicación de código de vestimenta y mapa interactivo.',
              icono: <Sparkles size={20} className="text-slate-800" />,
            },
            {
              titulo: 'Grados Académicos & Distinciones',
              tipo: 'Ceremonias universitarias, defensas de grado y conmemoraciones de honor.',
              icono: <Award size={20} className="text-slate-800" />,
            },
            {
              titulo: 'Galas de Aniversario & Premiaciones',
              tipo: 'Homenajes institucionales, cenas de beneficencia y eventos de gala formal.',
              icono: <Shield size={20} className="text-slate-800" />,
            },
            {
              titulo: 'Conferencias & Networking Ejecutivo',
              tipo: 'Reuniones de directivos, simposios y jornadas formativas especializadas.',
              icono: <Layers size={20} className="text-slate-800" />,
            },
            {
              titulo: 'Celebraciones Privadas Exclusivas',
              tipo: 'Reuniones de alto nivel que exigen confidencialidad y estricto control de aforo.',
              icono: <CalendarCheck size={20} className="text-slate-800" />,
            },
          ].map((item) => (
            <div
              key={item.titulo}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="mb-4">{item.icono}</div>
                <h3 className="font-bold text-sm text-slate-900">{item.titulo}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">{item.tipo}</p>
              </div>
              <Link
                href="/crear"
                className="mt-6 text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1.5"
              >
                <span>Confeccionar en este estilo</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sección Licencias y Tarifas Claras (Precio Actualizado a $3.99 USD) */}
      <section id="licencias" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <span className="text-xs tracking-widest uppercase text-slate-500 font-semibold">Condiciones Transparentes</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-950 mt-2 mb-3">
            Tarifas simples y justas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-14">
            Comience gratis con el cupo de cortesía y active la licencia completa solo si lo requiere.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Plan Gratuito */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold">
                  Aforo Inicial de Cortesía
                </span>
                <h3 className="text-xl font-bold mt-1 text-slate-950">Cupo de Cortesía</h3>
                <div className="my-5">
                  <span className="text-4xl font-extrabold text-slate-950">$0</span>
                  <span className="text-xs text-slate-500"> / sin costo</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 font-normal">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-800 shrink-0" />
                    <span>Emisión de hasta <strong>{config.limiteGratisInvitados} pases nominales</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-800 shrink-0" />
                    <span>Confirmación directa e ilimitada por WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-800 shrink-0" />
                    <span>Integración con Google Maps y cuenta regresiva</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-800 shrink-0" />
                    <span>Personalización visual completa a su gusto</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/crear"
                className="mt-8 w-full py-3.5 rounded-xl border border-slate-300 text-center text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors block"
              >
                Comenzar con {config.limiteGratisInvitados} Cupos Gratis
              </Link>
            </div>

            {/* Plan Premium Ilimitado */}
            <div className="p-8 rounded-2xl bg-white border-2 border-slate-900 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3.5 right-6 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-xs">
                Acceso Completo
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold">
                  Grandes Galas & Cumbres
                </span>
                <h3 className="text-xl font-bold mt-1 text-slate-950">Pase Ilimitado Protocolario</h3>
                <div className="my-5">
                  <span className="text-4xl font-extrabold text-slate-950">${config.precioPremiumUSD}</span>
                  <span className="text-xs text-slate-500 font-medium"> USD (~${config.precioPremiumCOP.toLocaleString('es-CO')} COP / Pago único)</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-800 font-normal">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-900 shrink-0 font-bold" />
                    <span>Pases nominales <strong>100% ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-900 shrink-0 font-bold" />
                    <span><strong>Exclusión absoluta de anuncios de Google</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-900 shrink-0 font-bold" />
                    <span>Códigos QR individuales de alta resolución</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-slate-900 shrink-0 font-bold" />
                    <span>Mayor periodo de archivo y soporte prioritario</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/crear?plan=premium"
                className="mt-8 w-full py-3.5 rounded-xl bg-slate-900 text-white text-center text-xs font-bold hover:bg-slate-800 transition-colors block shadow-sm"
              >
                Activar Pase Premium (${config.precioPremiumUSD} USD)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pie de Página Formal */}
      <footer className="w-full bg-white text-slate-500 text-xs py-14 px-6 sm:px-12 border-t border-slate-200 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <TarjetonLogo size="sm" subtexto="none" />
            <span className="text-[11px] text-slate-400">· Papelería digital interactiva para eventos formales</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] font-medium">
            <Link href="/politica-de-privacidad" className="hover:text-slate-900 transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/terminos-y-condiciones" className="hover:text-slate-900 transition-colors">
              Términos de Servicio
            </Link>
            <Link href="/crear" className="text-slate-900 hover:underline font-semibold">
              Estudio de Confección
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-slate-900 transition-colors inline-flex items-center gap-1">
              <Lock size={10} />
              <span>Consola Master</span>
            </Link>
          </div>

          <p className="text-[10px] text-slate-400 font-normal">
            © {new Date().getFullYear()} Tarjetón Studio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
