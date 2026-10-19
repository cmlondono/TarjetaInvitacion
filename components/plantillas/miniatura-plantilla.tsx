import Link from 'next/link'
import type { Plantilla } from '@/lib/estudio/plantillas'
import { obtenerKit, KIT_POR_DEFECTO } from '@/lib/estudio/kits'
import { infoEvento, formatearHora } from '@/lib/estudio/eventos'
import { familiaFuente } from '@/lib/editor/estilos'
import { MuestraOrnamento } from '@/components/invitacion/ornamentos'
import { textoSobre } from '@/components/invitacion/tema'
import { CapaEscena } from '@/components/invitacion/escenas'

const CALIGRAFICAS = ['greatvibes', 'alexbrush', 'parisienne', 'dancing', 'pacifico']

/**
 * Tarjeta de una plantilla para la galería y la landing.
 * Se dibuja en el servidor con los colores, letras y ornamento reales de su kit.
 */
export function MiniaturaPlantilla({ plantilla }: { plantilla: Plantilla }) {
  const kit = obtenerKit(plantilla.kitId) || KIT_POR_DEFECTO
  const info = infoEvento(plantilla.tipo)
  const caligrafica = CALIGRAFICAS.includes(kit.fuenteTitulo)
  const radio = kit.esquinas === 'rectas' ? 4 : kit.esquinas === 'redondas' ? 22 : 14
  const kicker = plantilla.kicker || info.kicker

  return (
    <article className="@container group h-full flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-lg transition-shadow">
      <Link href={`/plantillas/${plantilla.id}`} aria-label={`Ver la plantilla ${plantilla.nombre}`} className="relative block p-2.5 @[15rem]:p-4 overflow-hidden" style={{ backgroundColor: kit.colores.fondo }}>
        <CapaEscena escena={kit.escena} colores={{ fondo: kit.colores.fondo, acento: kit.colores.acento, detalle: kit.colores.detalle }} />
        <div
          className="relative flex flex-col items-center justify-center gap-1.5 text-center px-3 py-6 h-[200px] @[15rem]:h-[230px] overflow-hidden"
          style={{ backgroundColor: kit.colores.tarjeta, borderRadius: radio, color: kit.colores.texto }}
        >
          {kit.ornamento !== 'ninguno' && (
            <>
              <span aria-hidden="true" className="absolute -top-2 -left-3 w-20 h-12 opacity-60">
                <MuestraOrnamento tipo={kit.ornamento} color={kit.colores.detalle} />
              </span>
              <span aria-hidden="true" className="absolute -bottom-2 -right-3 w-20 h-12 opacity-60 rotate-180">
                <MuestraOrnamento tipo={kit.ornamento} color={kit.colores.detalle} />
              </span>
            </>
          )}
          <span style={{ fontFamily: familiaFuente(kit.fuenteCuerpo), fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: kit.colores.acento }}>{kicker}</span>
          <span
            style={{
              fontFamily: familiaFuente(kit.fuenteTitulo),
              fontSize: caligrafica ? 'clamp(24px, 13cqi, 32px)' : 'clamp(18px, 9.5cqi, 24px)',
              fontWeight: caligrafica ? 400 : 700,
              lineHeight: 1.08,
              letterSpacing: caligrafica ? 0 : '-0.01em',
            }}
          >
            {plantilla.nombresEjemplo}
          </span>
          <span style={{ fontFamily: familiaFuente(kit.fuenteCuerpo), fontSize: 12, opacity: 0.8 }}>Sábado · {formatearHora(plantilla.hora)}</span>
          <span
            className="mt-2 px-3.5 h-7 inline-flex items-center"
            style={{ backgroundColor: kit.colores.acento, color: textoSobre(kit.colores.acento), borderRadius: kit.esquinas === 'redondas' ? 999 : 8, fontFamily: familiaFuente(kit.fuenteCuerpo), fontSize: 11, fontWeight: 700 }}
          >
            {info.rsvp.cta}
          </span>
        </div>
      </Link>
      <div className="flex flex-col gap-3 p-3 @[15rem]:p-4 flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{plantilla.categoria}</span>
          <h3 className="m-0 text-[15px] font-bold text-slate-900">{plantilla.nombre}</h3>
          <p className="m-0 text-[13px] text-slate-600 leading-snug line-clamp-2 min-h-[2.75em]">{plantilla.descripcion}</p>
        </div>
        <div className="mt-auto grid grid-cols-1 @[15rem]:grid-cols-2 gap-2">
          <Link href={`/plantillas/${plantilla.id}`} className="min-h-10 rounded-xl border border-slate-300 text-[13px] font-bold text-slate-800 flex items-center justify-center hover:bg-slate-50">
            Ver ejemplo
          </Link>
          <Link href={`/crear?plantilla=${plantilla.id}`} className="min-h-10 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center hover:bg-slate-800">
            Usar plantilla
          </Link>
        </div>
      </div>
    </article>
  )
}
