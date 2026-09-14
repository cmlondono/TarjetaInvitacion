import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — InvitacionesYa',
  description: 'Términos y condiciones de uso de la plataforma InvitacionesYa.',
}

export default function TerminosCondiciones() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline mb-2"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-xs text-slate-400">Última actualización: Septiembre 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Aceptación del Servicio</h2>
          <p>
            Al utilizar la plataforma InvitacionesYa para diseñar, generar o compartir tarjetas de invitación digitales, aceptas estos términos y condiciones en su totalidad.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Plan Gratuito y Límites</h2>
          <p>
            El plan gratuito permite generar hasta un máximo de 50 invitaciones personalizadas por evento. Para eventos con un número mayor de invitados, se ofrece la opción de adquirir un pase premium de pago único que desbloquea invitados ilimitados y retira los anuncios publicitarios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Contenido Permitido</h2>
          <p>
            Queda terminantemente prohibido utilizar el servicio para difundir contenido ofensivo, fraudulento, difamatorio o que infrinja derechos de autor. Nos reservamos el derecho de revocar el acceso a enlaces que violen estas directrices.
          </p>
        </section>
      </div>
    </main>
  )
}
