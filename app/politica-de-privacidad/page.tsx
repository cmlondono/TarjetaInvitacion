import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Tarjetón (tarjeton.online)',
  description:
    'Política de privacidad, cookies y tratamiento de datos personales de la plataforma Tarjetón en tarjeton.online.',
}

export default function PoliticaPrivacidad() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-serif" style={{ fontFamily: 'var(--font-roboto-slab), serif' }}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline mb-2 font-sans"
        >
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 dark:text-white">
            Política de Privacidad y Cookies
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">Última actualización: Septiembre 2026</p>
        </div>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">1. Responsable del Tratamiento de Datos</h2>
          <p>
            El presente sitio web <strong>Tarjetón</strong> (accesible desde el dominio oficial <span className="font-mono text-xs">https://www.tarjeton.online</span>) es operado para la confección, personalización y distribución de papelería digital interactiva para eventos y celebraciones formales.
          </p>
          <p>
            Para cualquier consulta sobre privacidad, protección de datos personales o ejercicio de derechos ARCO, puede contactar al responsable a través del correo electrónico de soporte: <a href="mailto:carlosmariolondono8@gmail.com" className="font-semibold underline">carlosmariolondono8@gmail.com</a>.
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">2. Información que recopilamos</h2>
          <p>
            En Tarjetón priorizamos el principio de minimización de datos y el respeto a la privacidad del usuario:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
            <li>
              <strong>Sin registro obligatorio:</strong> Los usuarios no requieren registrar cuentas de usuario ni almacenar contraseñas en nuestros servidores para confeccionar tarjetones.
            </li>
            <li>
              <strong>Datos del evento:</strong> Recopilamos únicamente los datos que el anfitrión decide ingresar para la confección del tarjetón: título del evento, fecha, lugar, música ambiental seleccionada, número de WhatsApp institucional para confirmaciones y la lista de nombres de invitados para generar sus pases nominales.
            </li>
            <li>
              <strong>Datos de confirmación RSVP:</strong> Cuando un invitado accede a su enlace nominal y confirma asistencia, se almacena el estado de respuesta (asiste / no asiste) y número de cupos asignados.
            </li>
          </ul>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">3. Finalidad del Uso de la Información</h2>
          <p>
            La información ingresada se utiliza exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-1 marker:text-slate-400">
            <li>Generar las tarjetas interactivas de invitación y los sobres tridimensionales.</li>
            <li>Facilitar la confirmación directa al organizador vía WhatsApp.</li>
            <li>Procesar de forma segura pagos únicos para la activación del pase premium opcional.</li>
          </ul>
          <p>
            No comercializamos, cedemos ni transferimos información privada a terceros con fines de prospección comercial.
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">4. Publicidad y Cookies de Google (Google AdSense)</h2>
          <p>
            Este sitio web utiliza <strong>Google AdSense</strong>, un servicio de publicidad prestado por Google LLC (&quot;Google&quot;), para financiar el acceso al plan de cortesía de la plataforma mediante anuncios contextuales no invasivos.
          </p>
          <p>
            En cumplimiento de las políticas y directrices de Google para editores:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
            <li>
              Google y otros proveedores de tecnología publicitaria utilizan cookies para publicar anuncios basados en visitas anteriores de los usuarios a este sitio web (<span className="font-mono text-xs">tarjeton.online</span>) o a otros sitios web en Internet.
            </li>
            <li>
              El uso de cookies publicitarias permite a Google y a sus socios comerciales mostrar anuncios adaptados a las preferencias del usuario.
            </li>
            <li>
              Los usuarios pueden inhabilitar la publicidad personalizada en cualquier momento ingresando a la{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                Configuración de anuncios de Google
              </a>.
            </li>
            <li>
              Asimismo, los usuarios pueden optar por no recibir cookies de proveedores externos para la publicidad personalizada visitando{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                www.aboutads.info
              </a>{' '}
              o la plataforma de autorregulación europea{' '}
              <a
                href="https://www.youronlinechoices.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline text-slate-900 dark:text-white"
              >
                Your Online Choices
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">5. Ciclo de Vida y Expiración</h2>
          <p>
            Los enlaces de las invitaciones dejan de estar disponibles para los invitados 7 días después de la fecha del evento configurada por el organizador. Los datos del evento y de sus invitados se conservan solo para que el organizador pueda consultarlos y se eliminan definitivamente cuando el organizador lo solicita por correo (ver sección 6).
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">6. Ejercicio de Derechos (ARCO)</h2>
          <p>
            Usted tiene derecho en cualquier momento a solicitar el acceso, rectificación o eliminación anticipada de cualquier evento o pase registrado. Para ejercer estos derechos, remita su solicitud a <a href="mailto:carlosmariolondono8@gmail.com" className="font-semibold underline">carlosmariolondono8@gmail.com</a> indicando el token o enlace del evento, y responderemos en un plazo máximo de 48 horas hábiles.
          </p>
        </section>
      </div>
    </main>
  )
}
