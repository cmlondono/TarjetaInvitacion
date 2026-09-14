import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad — InvitacionesYa',
  description: 'Política de privacidad y tratamiento de datos personales de InvitacionesYa.',
}

export default function PoliticaPrivacidad() {
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
          Política de Privacidad
        </h1>
        <p className="text-xs text-slate-400">Última actualización: Septiembre 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Información que recopilamos</h2>
          <p>
            En InvitacionesYa priorizamos tu privacidad. Nuestra plataforma funciona sin registro de usuario obligatorio. Solo recopilamos los datos esenciales que decides ingresar para confeccionar tu tarjeta de invitación: título del evento, fecha, lugar, número de contacto para confirmación de WhatsApp y los nombres de los invitados que decidas agregar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Uso de la Información</h2>
          <p>
            La información ingresada se utiliza exclusivamente para generar las páginas visuales de invitación y permitir que tus invitados te contacten a través de enlaces directos a WhatsApp. No comercializamos ni transferimos tus datos a terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Ciclo de Vida y Expiración</h2>
          <p>
            Los eventos y los enlaces de invitación expiran automáticamente 7 días después de cumplida la fecha del evento configurada por el organizador, eliminándose los datos correspondientes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Publicidad y Cookies (Google AdSense)</h2>
          <p>
            Utilizamos servicios de terceros como Google AdSense para mostrar anuncios cuando visitas nuestro sitio web. Google puede utilizar cookies para publicar anuncios basados en tus visitas anteriores a este sitio o a otros sitios web de Internet. Puedes optar por no recibir publicidad personalizada visitando la configuración de anuncios de Google.
          </p>
        </section>
      </div>
    </main>
  )
}
