import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ChevronLeft, ChevronRight, Crown, Sparkles } from 'lucide-react'
import { TarjetonLogo } from '@/components/ui/tarjeton-logo'
import { MiniaturaPlantilla } from '@/components/plantillas/miniatura-plantilla'
import { CATEGORIAS_PLANTILLAS, type CategoriaPlantilla } from '@/lib/estudio/plantillas'
import { obtenerPlantillasPublicadas } from '@/lib/estudio/plantillas-servidor'

const POR_PAGINA = 24
type Plan = 'gratis' | 'premium'

export async function generateMetadata(): Promise<Metadata> {
  const PLANTILLAS = await obtenerPlantillasPublicadas()
  return {
    title: 'Plantillas de invitaciones digitales — Tarjetón',
    description: `${PLANTILLAS.length} plantillas listas para bodas, XV años, cumpleaños infantiles, baby shower, grados, paseos, novenas y más. Elige una, cambia los datos y compártela por WhatsApp.`,
    alternates: { canonical: '/plantillas' },
  }
}

export default async function PaginaPlantillas({ searchParams }: { searchParams: Promise<{ categoria?: string; plan?: string; pagina?: string }> }) {
  const parametros = await searchParams
  // Las plantillas vienen de la base de datos (administrables en el panel); las ocultas no aparecen
  const PLANTILLAS = await obtenerPlantillasPublicadas()
  const activa = CATEGORIAS_PLANTILLAS.includes(parametros.categoria as CategoriaPlantilla) ? (parametros.categoria as CategoriaPlantilla) : null
  const plan: Plan | null = parametros.plan === 'gratis' || parametros.plan === 'premium' ? parametros.plan : null
  const delPlan = (p: (typeof PLANTILLAS)[number]) => !plan || (plan === 'premium' ? Boolean(p.premium) : !p.premium)
  const lista = PLANTILLAS.filter((p) => (!activa || p.categoria === activa) && delPlan(p))
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA))
  const pagina = Math.min(totalPaginas, Math.max(1, parseInt(parametros.pagina || '1', 10) || 1))
  const listaPagina = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  /** Enlace que conserva los filtros (cambiar un filtro vuelve a la página 1) */
  const enlace = (cambios: { categoria?: string | null; plan?: Plan | null; pagina?: number }) => {
    const q = new URLSearchParams()
    const cat = cambios.categoria !== undefined ? cambios.categoria : activa
    const pl = cambios.plan !== undefined ? cambios.plan : plan
    if (cat) q.set('categoria', cat)
    if (pl) q.set('plan', pl)
    if (cambios.pagina && cambios.pagina > 1) q.set('pagina', String(cambios.pagina))
    const s = q.toString()
    return s ? `/plantillas?${s}` : '/plantillas'
  }

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
          {chip('Todas', enlace({ categoria: null }), !activa, PLANTILLAS.filter(delPlan).length)}
          {CATEGORIAS_PLANTILLAS.map((c) => chip(c, enlace({ categoria: c }), activa === c, PLANTILLAS.filter((p) => p.categoria === c && delPlan(p)).length))}
        </div>
        <div role="group" aria-label="Plan" className="flex flex-wrap items-center gap-2 mt-1">
          {(
            [
              [null, 'Gratis y Premium', PLANTILLAS.length],
              ['gratis', 'Gratis', PLANTILLAS.filter((p) => !p.premium).length],
              ['premium', 'Premium', PLANTILLAS.filter((p) => p.premium).length],
            ] as const
          ).map(([id, nombre, cuenta]) => (
            <Link
              key={nombre}
              href={enlace({ plan: id })}
              scroll={false}
              aria-current={plan === id ? 'page' : undefined}
              className={`min-h-9 px-3.5 rounded-xl text-[13px] font-bold flex items-center gap-1.5 border transition-colors ${
                plan === id
                  ? id === 'premium'
                    ? 'bg-amber-400 border-amber-400 text-slate-950'
                    : 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {id === 'premium' && <Crown size={13} strokeWidth={2.5} />}
              {nombre} <span className="opacity-60">{cuenta}</span>
            </Link>
          ))}
        </div>
      </nav>


      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {listaPagina.map((p) => (
          <MiniaturaPlantilla key={p.id} plantilla={p} />
        ))}
        {lista.length === 0 && <p className="m-0 text-[14px] text-slate-600">No hay plantillas con estos filtros.</p>}
      </section>

      {totalPaginas > 1 && (
        <nav aria-label="Páginas de plantillas" className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-slate-600">
            {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, lista.length)} de {lista.length} plantillas
          </span>
          <div className="flex items-center gap-1.5">
            {pagina > 1 ? (
              <Link href={enlace({ pagina: pagina - 1 })} aria-label="Página anterior" className="h-10 w-10 rounded-xl border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50">
                <ChevronLeft size={17} />
              </Link>
            ) : (
              <span aria-hidden="true" className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center opacity-40">
                <ChevronLeft size={17} />
              </span>
            )}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1)
              .map((n, i, arr) => (
                <span key={n} className="flex items-center gap-1.5">
                  {i > 0 && n - arr[i - 1] > 1 && <span className="px-0.5 text-slate-400">…</span>}
                  <Link
                    href={enlace({ pagina: n })}
                    aria-current={n === pagina ? 'page' : undefined}
                    className={`h-10 min-w-10 px-3 rounded-xl border text-[14px] font-bold flex items-center justify-center ${n === pagina ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  >
                    {n}
                  </Link>
                </span>
              ))}
            {pagina < totalPaginas ? (
              <Link href={enlace({ pagina: pagina + 1 })} aria-label="Página siguiente" className="h-10 w-10 rounded-xl border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50">
                <ChevronRight size={17} />
              </Link>
            ) : (
              <span aria-hidden="true" className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center opacity-40">
                <ChevronRight size={17} />
              </span>
            )}
          </div>
        </nav>
      )}

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
