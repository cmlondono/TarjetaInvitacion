import { Metadata } from 'next'
import Link from 'next/link'
import { formatearCOP, obtenerConfiguracionGlobal } from '@/lib/configuracion-servidor'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Tarjetón (tarjeton.online)',
  description:
    'Términos y condiciones de uso, políticas de pago y reembolsos de la plataforma Tarjetón en tarjeton.online.',
}

// El precio del pase es el configurado en el panel de administración
export const revalidate = 300

export default async function TerminosCondiciones() {
  const config = await obtenerConfiguracionGlobal()
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
            Términos y Condiciones de Uso
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">Última actualización: Septiembre 2026</p>
        </div>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">1. Aceptación del Servicio</h2>
          <p>
            Al acceder y utilizar la plataforma <strong>Tarjetón</strong> (disponible en <span className="font-mono text-xs">https://www.tarjeton.online</span>), usted acepta los presentes Términos y Condiciones en su totalidad, así como nuestra Política de Privacidad. Si no está de acuerdo con alguna cláusula, debe abstenerse de utilizar el servicio.
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">2. Descripción de los Planes y Tarifas</h2>
          <div className="space-y-2">
            <p>
              <strong>Plan de Cortesía (Acceso Libre):</strong> Permite confeccionar tarjetones interactivos con cupos de cortesía por evento, financiado mediante anuncios contextuales provistos por redes publicitarias autorizadas como Google AdSense.
            </p>
            <p>
              <strong>Pase Ilimitado Protocolario (Pago Único):</strong> Para cumbres, galas o celebraciones que requieran pases nominales ilimitados, supresión total de anuncios publicitarios y soporte prioritario, se ofrece el pase premium mediante la pasarela de pago Mercado Pago a una tarifa fija y transparente de ${config.precioPremiumUSD} USD (~{formatearCOP(config.precioPremiumCOP)} COP / pago único).
            </p>
          </div>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">3. Entrega del Servicio Digital</h2>
          <p>
            Dado que se trata de una aplicación web de entrega inmediata de software como servicio (SaaS), la habilitación del Pase Premium y sus funciones ilimitadas se efectúa en tiempo real y de forma automática una vez confirmada la transacción en la pasarela de pagos.
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">4. Política de Reembolsos y Garantía</h2>
          <p>
            Garantizamos la transparencia en nuestras transacciones:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
            <li>
              En caso de error en el cobro, duplicidad involuntaria o fallas técnicas imputables a la plataforma, se procederá al reembolso íntegro o activación manual inmediata.
            </li>
            <li>
              El anfitrión puede solicitar la devolución del pago dentro de los primeros 7 días calendario siguientes a la compra, siempre que el evento no se haya realizado aún.
            </li>
            <li>
              Para gestionar un reembolso, remita su comprobante de pago a <a href="mailto:soportetarjeton@gmail.com" className="font-semibold underline">soportetarjeton@gmail.com</a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">5. Contenido Permitido y Prohibiciones</h2>
          <p>
            Queda estrictamente prohibido utilizar el servicio para difundir contenidos calumniosos, fraudulentos, engañosos, obscenos o que infrinjan normativas de propiedad intelectual. Nos reservamos el derecho de cancelar enlaces que vulneren estas pautas sin derecho a reembolso.
          </p>
        </section>

        <section className="space-y-3 font-sans">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">6. Atención al Cliente</h2>
          <p>
            Para cualquier consulta sobre estos términos, puede comunicarse a través de <a href="mailto:soportetarjeton@gmail.com" className="font-semibold underline">soportetarjeton@gmail.com</a> o mediante nuestra página de <Link href="/contacto" className="font-semibold underline">Contacto y Soporte</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
