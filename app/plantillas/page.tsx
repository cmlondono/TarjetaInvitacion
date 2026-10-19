import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
import { MiniaturaPlantilla } from '@/components/plantillas/miniatura-plantilla'
import { CATEGORIAS_PLANTILLAS, type CategoriaPlantilla } from '@/lib/estudio/plantillas'
import { obtenerPlantillasPublicadas } from '@/lib/estudio/plantillas-servidor'

export async function generateMetadata(): Promise<Metadata> {
  const PLANTILLAS = await obtenerPlantillasPublicadas()
  return {
    title: 'Plantillas de invitaciones digitales — Tarjetón',
    description: `${PLANTILLAS.length} plantillas listas para bodas, XV años, cumpleaños infantiles, baby shower, grados, paseos, novenas y más. Elige una, cambia los datos y compártela por WhatsApp.`,
    alternates: { canonical: '/plantillas' },
  }
}

export default async function PaginaPlantillas({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams
  // Las plantillas vienen de la base de datos (administrables en el panel); las ocultas no aparecen
  const PLANTILLAS = await obtenerPlantillasPublicadas()
  const activa = CATEGORIAS_PLANTILLAS.includes(categoria as CategoriaPlantilla) ? (categoria as CategoriaPlantilla) : null
  const lista = activa ? PLANTILLAS.filter((p) => p.categoria === activa) : PLANTILLAS

  const chip = (nombre: string, href: string, activo: boolean, cuenta: number) => (
    <Link
      key={nombre}
      href={href}
      scroll={false}
      aria-current={activo ? 'page' : undefined}
      className={`shrink-0 min-h-10 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 border transition-colors ${
        activo ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
      }`}
    >
      {nombre}
      <span className={activo ? 'text-slate-300' : 'text-slate-400'}>{cuenta}</span>
    </Link>
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ArrowLeft size={18} />
            <TarjetonLogo size="sm" />
          </Link>
          <Link href="/crear" className="min-h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center hover:bg-slate-800">
            Empezar en blanco
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
          <Sparkles size={14} /> {PLANTILLAS.length} plantillas
        </span>
        <h1 className="mt-2 mb-2 text-3xl sm:text-4xl font-bold text-slate-950">Elige una invitación y hazla tuya</h1>
        <p className="m-0 max-w-2xl text-[15px] text-slate-600">
          Cada plantilla trae colores, letras, forma de abrir y bloques pensados para su evento. Cambias los nombres, la fecha y el lugar, y la compartes por
          WhatsApp. Todo se puede editar después.
        </p>
      </section>

      <nav aria-label="Categorías" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {chip('Todas', '/plantillas', !activa, PLANTILLAS.length)}
          {CATEGORIAS_PLANTILLAS.map((c) =>
            chip(c, `/plantillas?categoria=${encodeURIComponent(c)}`, activa === c, PLANTILLAS.filter((p) => p.categoria === c).length)
          )}
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {lista.map((p) => (
          <MiniaturaPlantilla key={p.id} plantilla={p} />
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-slate-900">¿No ves tu evento?</h2>
            <p className="m-0 mt-1 text-[14px] text-slate-600">Empieza en blanco: eliges el tipo de evento y un estilo, y armas la invitación a tu gusto.</p>
          </div>
          <Link href="/crear" className="min-h-11 px-5 rounded-xl bg-slate-900 text-white text-[14px] font-bold flex items-center justify-center hover:bg-slate-800">
            Crear desde cero
          </Link>
        </div>
      </section>
    </main>
  )
}
