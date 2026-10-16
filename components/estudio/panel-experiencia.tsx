'use client'

import React, { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import type { ConfiguracionVisual, DetalleEvento, ExperienciaInvitado, MusicaFondoConfig, TipoApertura, TipoRecorrido } from '@/types/invitation'
import { experienciaDe } from '@/lib/estudio/kits'
import { analizarMusica, problemaEnlaceMusica, TAMANO_MAXIMO_AUDIO, TIPOS_AUDIO_PERMITIDOS } from '@/lib/estudio/musica'
import { obtenerClienteSupabase } from '@/lib/supabase'
import { INSTRUCCIONES_APERTURA } from '@/components/invitacion/apertura'
import { Campo, EditorFotoFondo, Interruptor, Segmentos, TituloGrupo } from './ui'

const APERTURAS: { id: TipoApertura; nombre: string; descripcion: string }[] = [
  { id: 'sobre', nombre: 'Sobre con lacre', descripcion: 'Se abre al tocar el sello' },
  { id: 'telon', nombre: 'Telón', descripcion: 'Las cortinas se corren' },
  { id: 'raspa', nombre: 'Raspa y descubre', descripcion: 'Revela la fecha con el dedo' },
  { id: 'caja', nombre: 'Caja de regalo', descripcion: 'Ideal para cumpleaños' },
  { id: 'puertas', nombre: 'Puertas', descripcion: 'Dos puertas se abren hacia adentro' },
  { id: 'libro', nombre: 'Tarjeta doblada', descripcion: 'La portada se despliega' },
  { id: 'boleto', nombre: 'Boleto', descripcion: 'Se rasga por la línea punteada' },
  { id: 'globo', nombre: 'Globo', descripcion: 'Se revienta con confeti' },
  { id: 'deslizar', nombre: 'Portada que sube', descripcion: 'Foto y nombres a pantalla completa' },
  { id: 'directo', nombre: 'Directo', descripcion: 'Sin animación' },
]

const RECORRIDOS: { id: TipoRecorrido; nombre: string; descripcion: string }[] = [
  { id: 'pagina', nombre: 'Una página', descripcion: 'Se baja con el dedo, como una web' },
  { id: 'historias', nombre: 'Historias', descripcion: 'Una pantalla a la vez, como Instagram' },
  { id: 'menu', nombre: 'Con menú', descripcion: 'Accesos rápidos a cada sección' },
]

export const PRESETS_MUSICA = [
  { id: 'canon', nombre: 'Canon en Re (Pachelbel)', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pachelbel-canon-in-d-major-for-two-cellos-111005.mp3' },
  { id: 'piano', nombre: 'Vals romántico en piano', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-10141.mp3' },
  { id: 'acustico', nombre: 'Guitarras acústicas', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8bbf73458.mp3?filename=acoustic-guitars-ambient-uplifting-10820.mp3' },
  { id: 'jazz', nombre: 'Jazz lounge', url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f772dd.mp3?filename=smooth-waters-115977.mp3' },
]

interface PanelExperienciaProps {
  visual: ConfiguracionVisual
  evento: Pick<DetalleEvento, 'id' | 'tokenAdmin' | 'anfitriones'>
  /** `continuo`: cambio mientras se arrastra un control (un solo paso de deshacer) */
  alCambiar: (visual: ConfiguracionVisual, continuo?: boolean) => void
  alProbarApertura: () => void
}

export function PanelExperiencia({ visual, evento, alCambiar, alProbarApertura }: PanelExperienciaProps) {
  const exp = experienciaDe(visual)
  const setExp = (cambios: Partial<ExperienciaInvitado>, continuo?: boolean) =>
    alCambiar({ ...visual, experiencia: { ...exp, ...cambios }, animacionSobre: (cambios.apertura ?? exp.apertura) === 'sobre' }, continuo)
  const coloresTema = Array.from(new Set([visual.colorPrimario, visual.colorSecundario, visual.colorTexto, visual.colorTarjeta].filter(Boolean)))
  const musica = visual.musicaFondo || { activa: false, url: '', autoReproducir: true }
  const setMusica = (cambios: Partial<typeof musica>) => alCambiar({ ...visual, musicaFondo: { ...musica, ...cambios } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <TituloGrupo>Cómo se abre</TituloGrupo>
          <button type="button" onClick={alProbarApertura} className="text-[13px] font-bold text-slate-900 underline underline-offset-2 cursor-pointer">
            Ver cómo se abre
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {APERTURAS.map((a) => {
            const activa = exp.apertura === a.id
            return (
              <button key={a.id} type="button" aria-pressed={activa} onClick={() => setExp({ apertura: a.id })} className={`flex flex-col items-start gap-0.5 p-3 rounded-xl text-left cursor-pointer ${activa ? 'border-2 border-amber-500 bg-amber-50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}>
                <span className="text-[14px] font-bold text-slate-900">{a.nombre}</span>
                <span className="text-[12px] text-slate-500 leading-snug">{a.descripcion}</span>
              </button>
            )
          })}
        </div>
      </div>

      {exp.apertura !== 'directo' && (
        <div className="flex flex-col gap-3.5 p-3.5 rounded-2xl border border-slate-200">
          <TituloGrupo>Personaliza la apertura</TituloGrupo>
          <Campo etiqueta="Texto principal" valor={exp.tituloApertura} alCambiar={(v) => setExp({ tituloApertura: v || undefined }, true)} placeholder={evento.anfitriones || 'Los nombres del evento'} maximo={60} />
          <Campo etiqueta="Instrucción" valor={exp.textoApertura} alCambiar={(v) => setExp({ textoApertura: v || undefined }, true)} placeholder={INSTRUCCIONES_APERTURA[exp.apertura]} maximo={50} />
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-slate-700">Color</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" aria-pressed={!exp.colorApertura} onClick={() => setExp({ colorApertura: undefined })} className={`min-h-9 px-3 rounded-full text-[12px] font-semibold border cursor-pointer ${!exp.colorApertura ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}>
                Del estilo
              </button>
              {coloresTema.map((c) => (
                <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={exp.colorApertura === c} onClick={() => setExp({ colorApertura: c })} className={`w-9 h-9 rounded-full border cursor-pointer ${exp.colorApertura === c ? 'ring-2 ring-amber-500 ring-offset-2 border-transparent' : 'border-slate-300'}`} style={{ backgroundColor: c }} />
              ))}
              <label className="relative w-9 h-9 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-600 text-lg cursor-pointer overflow-hidden" aria-label="Otro color" style={exp.colorApertura && !coloresTema.includes(exp.colorApertura) ? { backgroundColor: exp.colorApertura, borderStyle: 'solid' } : undefined}>
                {exp.colorApertura && !coloresTema.includes(exp.colorApertura) ? '' : '+'}
                <input type="color" value={exp.colorApertura || visual.colorPrimario || '#000000'} onChange={(e) => setExp({ colorApertura: e.target.value }, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </div>
          </div>
          <EditorFotoFondo
            etiqueta="Foto de fondo de la apertura"
            ayuda={exp.apertura === 'telon' || exp.apertura === 'puertas' ? 'Se ve sobre el telón o las puertas y se abre con ellos.' : 'Es lo primero que ve tu invitado.'}
            foto={exp.fotoApertura}
            alCambiar={(fotoApertura, continuo) => setExp({ fotoApertura }, continuo)}
            carpeta={evento.id}
            colorFondo={visual.colorFondo}
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <TituloGrupo>Cómo se recorre</TituloGrupo>
        {RECORRIDOS.map((r) => {
          const activo = exp.recorrido === r.id
          return (
            <button key={r.id} type="button" aria-pressed={activo} onClick={() => setExp({ recorrido: r.id })} className={`flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${activo ? 'bg-amber-50 border-[1.5px] border-amber-400' : 'bg-white border-[1.5px] border-transparent hover:border-slate-200'}`}>
              <span className={`w-[18px] h-[18px] rounded-full shrink-0 box-border ${activo ? 'border-[6px] border-slate-900' : 'border-2 border-slate-400'}`} />
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-slate-900">{r.nombre}</span>
                <span className="text-[12px] text-slate-500">{r.descripcion}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3.5">
        <TituloGrupo>Detalles que encantan</TituloGrupo>
        <Interruptor etiqueta="Saludo con su nombre" descripcion="Y cuántos lugares tiene reservados" activo={exp.saludoPersonal} alCambiar={(v) => setExp({ saludoPersonal: v })} />
        <Interruptor etiqueta="Confeti al confirmar" descripcion="Una pequeña celebración" activo={exp.confetiAlConfirmar} alCambiar={(v) => setExp({ confetiAlConfirmar: v })} />
        <Interruptor etiqueta="Agregar al calendario" descripcion="Botón para Google y Apple" activo={exp.botonCalendario} alCambiar={(v) => setExp({ botonCalendario: v })} />
        <Interruptor etiqueta="Música de fondo" descripcion="Suena después de abrir la invitación" activo={musica.activa} alCambiar={(v) => setMusica({ activa: v, url: musica.url || PRESETS_MUSICA[0].url, titulo: musica.titulo || PRESETS_MUSICA[0].nombre })} />
        {musica.activa && <ElegirMusica musica={musica} setMusica={setMusica} evento={evento} />}
      </div>
    </div>
  )
}

type OrigenMusica = 'biblioteca' | 'archivo' | 'enlace'

function origenDe(url: string): OrigenMusica {
  if (!url || PRESETS_MUSICA.some((p) => p.url === url)) return 'biblioteca'
  if (url.includes('/tarjeton-audio/')) return 'archivo'
  return 'enlace'
}

/** Sube la canción directo a Supabase Storage con una URL firmada que entrega /api/audio */
async function subirCancion(archivo: File, evento: Pick<DetalleEvento, 'id' | 'tokenAdmin'>): Promise<string> {
  const res = await fetch('/api/audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventoId: evento.id, tokenAdmin: evento.tokenAdmin, tipo: archivo.type, tamano: archivo.size }),
  })
  const r = await res.json().catch(() => null)
  if (!res.ok || !r?.token) throw new Error(r?.error || 'No se pudo subir la canción.')
  const supabase = obtenerClienteSupabase()
  if (!supabase) throw new Error('El almacenamiento no está disponible.')
  const { error } = await supabase.storage.from(r.bucket).uploadToSignedUrl(r.ruta, r.token, archivo, { contentType: archivo.type })
  if (error) throw new Error('No se pudo subir la canción. Revisa tu conexión e intenta de nuevo.')
  return r.url as string
}

function ElegirMusica({
  musica,
  setMusica,
  evento,
}: {
  musica: MusicaFondoConfig
  setMusica: (cambios: Partial<MusicaFondoConfig>) => void
  evento: Pick<DetalleEvento, 'id' | 'tokenAdmin'>
}) {
  const [origen, setOrigen] = useState<OrigenMusica>(() => origenDe(musica.url))
  const [enlace, setEnlace] = useState(() => (origenDe(musica.url) === 'enlace' ? musica.url : ''))
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fuente = analizarMusica(musica.url)
  const problema = problemaEnlaceMusica(enlace)

  const elegirArchivo = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*,.mp3,.m4a'
    input.onchange = async () => {
      const archivo = input.files?.[0]
      if (!archivo) return
      if (!TIPOS_AUDIO_PERMITIDOS[archivo.type]) return setError('Ese archivo no es una canción compatible. Usa MP3, M4A, OGG o WAV.')
      if (archivo.size > TAMANO_MAXIMO_AUDIO) return setError('La canción pesa más de 15 MB. Prueba con un MP3 más liviano o usa un enlace de YouTube.')
      setSubiendo(true)
      setError(null)
      try {
        const url = await subirCancion(archivo, evento)
        setMusica({ url, titulo: archivo.name.replace(/\.[^.]+$/, '').slice(0, 60) })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo subir la canción.')
      } finally {
        setSubiendo(false)
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col gap-3 pl-1">
      <Segmentos<OrigenMusica>
        opciones={[
          { id: 'biblioteca', nombre: 'Biblioteca' },
          { id: 'archivo', nombre: 'Subir canción' },
          { id: 'enlace', nombre: 'YouTube o Spotify' },
        ]}
        valor={origen}
        alCambiar={(o) => {
          setOrigen(o)
          setError(null)
        }}
      />

      {origen === 'biblioteca' &&
        PRESETS_MUSICA.map((p) => (
          <button key={p.id} type="button" aria-pressed={musica.url === p.url} onClick={() => setMusica({ url: p.url, titulo: p.nombre })} className={`min-h-10 px-3 rounded-xl text-left text-[13px] font-semibold cursor-pointer ${musica.url === p.url ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
            {p.nombre}
          </button>
        ))}

      {origen === 'archivo' && (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={elegirArchivo} disabled={subiendo} className="min-h-11 rounded-xl bg-slate-900 text-white text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {subiendo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {subiendo ? 'Subiendo canción…' : origenDe(musica.url) === 'archivo' ? 'Cambiar canción' : 'Subir mi canción'}
          </button>
          <span className="text-[12px] text-slate-500">MP3, M4A, OGG o WAV de hasta 15 MB.</span>
          {origenDe(musica.url) === 'archivo' && <audio controls preload="none" src={musica.url} className="w-full h-10" />}
        </div>
      )}

      {origen === 'enlace' && (
        <div className="flex flex-col gap-2">
          <Campo
            etiqueta="Enlace de la canción"
            tipo="url"
            valor={enlace}
            alCambiar={(v) => {
              setEnlace(v)
              if (!problemaEnlaceMusica(v) && v.trim()) setMusica({ url: v.trim(), titulo: musica.titulo && origenDe(musica.url) === 'enlace' ? musica.titulo : 'Nuestra canción' })
            }}
            placeholder="https://youtu.be/… o https://open.spotify.com/track/…"
          />
          {problema ? (
            <span className="text-[12px] text-rose-600">{problema}</span>
          ) : fuente?.tipo === 'youtube' && origenDe(musica.url) === 'enlace' ? (
            <span className="p-2.5 rounded-xl bg-emerald-50 text-[12px] leading-snug text-emerald-900">Video de YouTube listo: suena de fondo al abrir la invitación (solo el audio).</span>
          ) : fuente?.tipo === 'spotify' && origenDe(musica.url) === 'enlace' ? (
            <span className="p-2.5 rounded-xl bg-amber-50 text-[12px] leading-snug text-amber-900">
              Spotify no deja que la música suene sola: tu invitado verá un pequeño reproductor de Spotify para darle play. Quien no tenga cuenta escucha una muestra de 30 segundos. Para que suene completa y sola, usa YouTube o sube la canción.
            </span>
          ) : (
            <span className="text-[12px] text-slate-500">En YouTube o Spotify toca «Compartir» → «Copiar enlace» y pégalo aquí.</span>
          )}
        </div>
      )}

      {origen !== 'biblioteca' && origenDe(musica.url) === origen && (
        <Campo etiqueta="Nombre que verán tus invitados" valor={musica.titulo} alCambiar={(v) => setMusica({ titulo: v })} placeholder="Nuestra canción" maximo={60} />
      )}
      {error && <span className="text-[12px] text-rose-600">{error}</span>}
    </div>
  )
}
