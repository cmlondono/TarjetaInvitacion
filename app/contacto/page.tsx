import { Metadata } from 'next'
import Link from 'next/link'
import { obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { ArrowLeft, Mail, MessageCircle, Clock, ShieldCheck, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto y Soporte — Tarjetón (tarjeton.online)',
  description:
    'Canales oficiales de atención al cliente, asistencia técnica y consultas de la plataforma Tarjetón en tarjeton.online.',
}

// El WhatsApp de soporte es el configurado en el panel de administración
export const revalidate = 300

export default async function PaginaContacto() {
  const { whatsappSoporte } = await obtenerConfiguracionGlobal()
  // Sin un número real configurado en el panel no se muestra el canal (un número de ejemplo sería un dato falso)
  const numeroWhatsapp = (whatsappSoporte || '').replace(/[^\d]/g, '')
  const hayWhatsapp = numeroWhatsapp.length >= 10 && numeroWhatsapp !== '573001234567'
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-serif" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8 text-slate-700 dark:text-slate-300">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline mb-2 font-sans"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Contacto & Atención al Cliente
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-sans">
            Canales de atención de la plataforma <strong>Tarjetón</strong> (<span className="text-slate-700 dark:text-slate-300 font-mono">https://www.tarjeton.online</span>).
          </p>
        </div>

        {/* Tarjetas de contacto directo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Mail size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Correo Electrónico</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Atención directa para consultas de servicio, activación de pases, dudas de facturación o privacidad:
            </p>
            <div className="space-y-1">
              <a
                href="mailto:soportetarjeton@gmail.com"
                className="block text-sm font-bold text-slate-900 dark:text-white underline underline-offset-4 hover:text-slate-700 break-all"
              >
                soportetarjeton@gmail.com
              </a>
            </div>
          </div>

          {hayWhatsapp && <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Atención por WhatsApp</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Asistencia personalizada para anfitriones y organizadores de eventos protocolares:
            </p>
            <a
              href={`https://wa.me/${numeroWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              Contactar por WhatsApp →
            </a>
          </div>}
        </div>

        {/* Horarios y compromisos */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Compromiso de Transparencia y Servicio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Tiempo de Respuesta</strong>
                <span className="text-slate-500">Menos de 24 horas hábiles por correo.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Garantía de Servicio</strong>
                <span className="text-slate-500">Soporte directo antes y durante la fecha del evento.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-white">Dominio Oficial</strong>
                <span className="text-slate-500">www.tarjeton.online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
