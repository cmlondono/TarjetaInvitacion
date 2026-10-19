'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Drawer as Vaul } from 'vaul'
import type { ConfiguracionVisual, DetalleEvento, EstiloSeccion, SeccionModular, TipoSeccion } from '@/types/invitation'
import { useHistorialEditor } from '@/hooks/use-historial-editor'
import { useAutoguardado } from '@/hooks/use-autoguardado'
import { useEstudioLienzo } from '@/components/editor/lienzo/use-estudio-lienzo'
import { ProveedorEditorLienzo } from '@/components/editor/lienzo/contexto-editor'
import { BarraContextual } from '@/components/editor/lienzo/barra-contextual'
import { PanelAgregar } from '@/components/editor/lienzo/panel-agregar'
import { DialogoRecorte } from '@/components/editor/lienzo/dialogo-recorte'
import { IndicadorGuardado } from '@/components/editor/lienzo/indicadores'
import { Invitacion } from '@/components/invitacion/invitacion'
import { temaDe } from '@/components/invitacion/tema'
import { ModalPago } from '@/components/checkout/modal-pago'
import { crearSeccionPorTipo } from '@/lib/modular-defaults'
import { generarSeccionesParaEvento, infoEvento } from '@/lib/estudio/eventos'
import { obtenerKit, visualDesdeKit, KIT_POR_DEFECTO } from '@/lib/estudio/kits'
import { duplicarSeccion, reordenarSecciones } from '@/lib/editor/operaciones'
import { PanelBloques, nombreBloque } from './panel-bloques'
import { Inspector, type ActualizadoresBloque } from './inspector'
import { PanelEstilos } from './panel-estilos'
import { PanelExperiencia } from './panel-experiencia'
import { PanelDatos } from './panel-datos'
import { BotonCerrar } from './ui'
import { ArrowLeft, Eye, LayoutList, Monitor, Palette, PencilLine, Plus, RotateCcw, Send, Smartphone, Sparkles } from 'lucide-react'

type Anchura = 'movil' | 'tablet' | 'escritorio'

function useAnchura(): Anchura {
  const [anchura, setAnchura] = useState<Anchura>('escritorio')
  useEffect(() => {
    const medir = () => setAnchura(window.innerWidth < 768 ? 'movil' : window.innerWidth < 1180 ? 'tablet' : 'escritorio')
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])
  return anchura
}

/** Asigna un valor en una ruta "a.0.b" sin mutar (para editar elementos de listas desde la invitación) */
function asignarRuta(objeto: Record<string, unknown>, ruta: string[], valor: unknown): Record<string, unknown> | unknown[] {
  const [clave, ...resto] = ruta
  const esLista = Array.isArray(objeto)
  const copia: Record<string, unknown> | unknown[] = esLista ? [...(objeto as unknown[])] : { ...objeto }
  const actual = (copia as Record<string, unknown>)[clave]
  ;(copia as Record<string, unknown>)[clave] = resto.length ? asignarRuta((actual as Record<string, unknown>) ?? {}, resto, valor) : valor
  return copia
}

type PanelDiseno = 'estilo' | 'experiencia' | 'datos'
type HojaMovil = 'bloques' | 'diseno' | 'inspector' | null

export function EditorEstudio({ eventoInicial }: { eventoInicial: DetalleEvento }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anchura = useAnchura()
  const esMovil = anchura === 'movil'

  const historial = useHistorialEditor(() => {
    const info = infoEvento(eventoInicial.tipoEvento)
    const visual = eventoInicial.configuracionVisual || visualDesdeKit(obtenerKit(info.kitSugerido) || KIT_POR_DEFECTO)
    const secciones = eventoInicial.secciones?.length
      ? eventoInicial.secciones
      : generarSeccionesParaEvento({ tipo: eventoInicial.tipoEvento, nombres: eventoInicial.anfitriones, fecha: eventoInicial.fechaEvento.slice(0, 10), hora: eventoInicial.fechaEvento.slice(11, 16), lugar: eventoInicial.direccion })
    return { evento: eventoInicial, visual, secciones }
  })
  const { evento, visual, secciones, setEvento, setVisual, setSecciones } = historial

  const [bloqueId, setBloqueId] = useState<string | null>(() => secciones.find((s) => s.tipo === 'cabecera')?.id || null)
  const [vistaInvitado, setVistaInvitado] = useState(false)
  const [claveApertura, setClaveApertura] = useState(0)
  const [dispositivo, setDispositivo] = useState<'movil' | 'escritorio'>('movil')
  const [panelDiseno, setPanelDiseno] = useState<PanelDiseno | null>(null)
  const [hoja, setHoja] = useState<HojaMovil>(null)
  const [pagoAbierto, setPagoAbierto] = useState(searchParams?.get('plan') === 'premium')
  const tema = useMemo(() => temaDe(visual), [visual])

  const estudio = useEstudioLienzo({
    esEdicion: !vistaInvitado,
    esMovil,
    secciones,
    setSecciones,
    visual,
    eventoId: evento.id,
    cortarGrupo: historial.cortarGrupo,
    deshacer: historial.deshacer,
    rehacer: historial.rehacer,
  })

  const agregarElementoEnRef = useRef(estudio.agregarElementoEn)
  agregarElementoEnRef.current = estudio.agregarElementoEn

  const construirEvento = useCallback((): DetalleEvento => {
    const actual = historial.estadoActual.current
    const fecha = new Date(actual.evento.fechaEvento)
    const expira = new Date((Number.isNaN(fecha.getTime()) ? Date.now() : fecha.getTime()) + 7 * 24 * 60 * 60 * 1000)
    const rsvp = actual.secciones.find((s) => s.tipo === 'confirmacion_rsvp')
    return {
      ...actual.evento,
      configuracionVisual: actual.visual,
      secciones: actual.secciones,
      expiraEn: expira.toISOString(),
      metodoConfirmacion: actual.evento.metodoConfirmacion || (rsvp?.datos?.metodoConfirmacion as DetalleEvento['metodoConfirmacion']) || 'tarjeton',
    }
  }, [historial.estadoActual])

  const autoguardado = useAutoguardado({ habilitado: true, dependencia: historial.estadoActual.current, construirEvento })

  useEffect(() => {
    const alSalir = (e: BeforeUnloadEvent) => {
      if (autoguardado.tieneCambiosSinGuardar) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [autoguardado.tieneCambiosSinGuardar])

  // ─────────── Actualizaciones ───────────
  const mapear = useCallback(
    (sId: string, fn: (s: SeccionModular) => SeccionModular) => setSecciones((prev) => prev.map((s) => (s.id === sId ? fn(s) : s))),
    [setSecciones]
  )

  const edicion = useMemo(
    () => ({
      alCampo: (sId: string, campo: keyof SeccionModular, valor: unknown) => mapear(sId, (s) => ({ ...s, [campo]: valor })),
      alDato: (sId: string, campo: string, valor: unknown) =>
        mapear(sId, (s) => ({ ...s, datos: asignarRuta((s.datos || {}) as Record<string, unknown>, campo.split('.'), valor) as SeccionModular['datos'] })),
      alEvento: (campo: keyof DetalleEvento, valor: unknown) => setEvento((prev) => ({ ...prev, [campo]: valor })),
      agregarElemento: (sId: string, tipo: 'texto' | 'mas') => {
        setBloqueId(sId)
        setHoja(null)
        agregarElementoEnRef.current(sId, tipo)
      },
    }),
    [mapear, setEvento]
  )

  const agregarBloque = (tipo: TipoSeccion) => {
    historial.cortarGrupo()
    const nueva = crearSeccionPorTipo(tipo, 0)
    setSecciones((prev) => {
      const ordenadas = [...prev].sort((a, b) => a.orden - b.orden)
      const iSel = ordenadas.findIndex((s) => s.id === bloqueId)
      const iRsvp = ordenadas.findIndex((s) => s.tipo === 'confirmacion_rsvp')
      const indice = iSel >= 0 && ordenadas[iSel].tipo !== 'confirmacion_rsvp' ? iSel + 1 : iRsvp >= 0 ? iRsvp : ordenadas.length
      ordenadas.splice(indice, 0, nueva)
      return ordenadas.map((s, i) => ({ ...s, orden: i }))
    })
    historial.cortarGrupo()
    setBloqueId(nueva.id)
    setTimeout(() => document.getElementById(`bloque-${nueva.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
    if (esMovil) setHoja('inspector')
  }

  const act: ActualizadoresBloque = {
    alCampo: edicion.alCampo,
    alDato: edicion.alDato,
    alEstilo: (sId: string, cambios: Partial<EstiloSeccion>) => mapear(sId, (s) => ({ ...s, estilo: { ...(s.estilo || {}), ...cambios } })),
    alEvento: (cambios) => setEvento((prev) => ({ ...prev, ...cambios })),
    mover: (sId, direccion) => {
      historial.cortarGrupo()
      setSecciones((prev) => {
        const ord = [...prev].sort((a, b) => a.orden - b.orden)
        const i = ord.findIndex((s) => s.id === sId)
        const j = direccion === 'arriba' ? i - 1 : i + 1
        if (i < 0 || j < 0 || j >= ord.length) return prev
        return reordenarSecciones(prev, sId, ord[j].id)
      })
    },
    duplicar: (sId) => {
      historial.cortarGrupo()
      setSecciones((prev) => duplicarSeccion(prev, sId))
    },
    alternarVisible: (sId) => {
      historial.cortarGrupo()
      mapear(sId, (s) => ({ ...s, visible: !s.visible }))
    },
    eliminar: (sId) => {
      const s = secciones.find((x) => x.id === sId)
      if (!s || !window.confirm(`¿Eliminar «${nombreBloque(s)}»? Puedes deshacerlo con el botón ↶.`)) return
      historial.cortarGrupo()
      setSecciones((prev) => prev.filter((x) => x.id !== sId).map((x, i) => ({ ...x, orden: i })))
      setBloqueId(secciones.find((x) => x.tipo === 'cabecera')?.id || null)
      setHoja(null)
    },
    abrirElementosCollage: (sId) => {
      estudio.acciones.seleccionar({ tipo: 'seccion', seccionId: sId })
      setHoja(null)
      estudio.acciones.abrirAgregar()
    },
    agregarElemento: (sId, tipo) => edicion.agregarElemento(sId, tipo),
    estilizarTitulo: (sId) => {
      estudio.acciones.seleccionar({ tipo: 'texto', seccionId: sId, campo: 'titulo' })
      setHoja(null)
      setTimeout(() => document.querySelector(`[data-texto-clave="${CSS.escape(`${sId}:titulo`)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    },
  }

  const cambiarVisual = (v: ConfiguracionVisual, continuo = false) => {
    if (!continuo) historial.cortarGrupo()
    setVisual(v)
  }

  const irAInvitados = async () => {
    await autoguardado.guardarAhora()
    router.push(`/gestionar/${evento.tokenAdmin}`)
  }

  const ordenadas = [...secciones].sort((a, b) => a.orden - b.orden)
  const bloque = secciones.find((s) => s.id === bloqueId) || null
  const iBloque = bloque ? ordenadas.findIndex((s) => s.id === bloque.id) : -1
  const seleccionTexto = estudio.seleccion && (estudio.seleccion.tipo === 'texto' || estudio.seleccion.tipo === 'elemento')

  const propsIndicador = {
    autoguardadoActivo: true,
    estado: autoguardado.estado,
    mensajeError: autoguardado.mensajeError,
    puedeDeshacer: historial.puedeDeshacer,
    puedeRehacer: historial.puedeRehacer,
    alDeshacer: historial.deshacer,
    alRehacer: historial.rehacer,
    alReintentar: autoguardado.guardarAhora,
  }

  const seleccionarBloque = (id: string) => {
    setBloqueId(id)
    if (estudio.seleccion?.tipo === 'seccion' && estudio.seleccion.seccionId !== id) estudio.acciones.seleccionar(null)
  }

  const inspector = bloque && (
    <Inspector key={bloque.id} seccion={bloque} evento={evento} tema={tema} act={act} esPrimera={iBloque <= 0} esUltima={iBloque === ordenadas.length - 1} />
  )

  const panelBloques = (
    <PanelBloques
      secciones={secciones}
      tipoEvento={evento.tipoEvento}
      seleccionId={bloqueId}
      alElegir={(id) => {
        seleccionarBloque(id)
        document.getElementById(`bloque-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (esMovil) setHoja('inspector')
      }}
      alAlternar={act.alternarVisible}
      alReordenar={(a, b) => {
        historial.cortarGrupo()
        setSecciones((prev) => reordenarSecciones(prev, a, b))
      }}
      alAgregar={agregarBloque}
    />
  )

  const [pestanaMovil, setPestanaMovil] = useState<PanelDiseno>('estilo')

  // En móvil abre la única hoja de diseño (Estilo · Experiencia · Datos) en la pestaña indicada
  const abrirHojaDiseno = (pestana: PanelDiseno) => {
    setVistaInvitado(false)
    setPestanaMovil(pestana)
    setHoja('diseno')
  }

  const contenidoDiseno = (pestana: PanelDiseno) => (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Diseño" className="flex p-1 rounded-xl bg-slate-100">
        {(
          [
            ['estilo', 'Estilo'],
            ['experiencia', 'Experiencia'],
            ['datos', 'Datos'],
          ] as [PanelDiseno, string][]
        ).map(([id, nombre]) => (
          <button key={id} type="button" role="tab" aria-selected={pestana === id} onClick={() => (esMovil ? setPestanaMovil(id) : setPanelDiseno(id))} className={`flex-1 min-h-9 rounded-lg text-[13px] cursor-pointer ${pestana === id ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-semibold text-slate-600'}`}>
            {nombre}
          </button>
        ))}
      </div>
      {pestana === 'estilo' && <PanelEstilos visual={visual} tipoEvento={evento.tipoEvento} eventoId={evento.id} alCambiar={cambiarVisual} />}
      {pestana === 'experiencia' && (
        <PanelExperiencia
          evento={evento}
          visual={visual}
          alCambiar={cambiarVisual}
          alProbarApertura={() => {
            setVistaInvitado(true)
            setClaveApertura((c) => c + 1)
            setPanelDiseno(null)
            setHoja(null)
          }}
        />
      )}
      {pestana === 'datos' && (
        <PanelDatos
          evento={evento}
          alCambiar={(c) => setEvento((prev) => ({ ...prev, ...c }))}
          confirmacion={secciones.find((s) => s.tipo === 'confirmacion_rsvp')}
          alDato={edicion.alDato}
          alAgregarConfirmacion={() => {
            setPanelDiseno(null)
            setHoja(null)
            agregarBloque('confirmacion_rsvp')
          }}
        />
      )}
    </div>
  )

  /** Barra inferior del celular: cualquier herramienta cierra la vista previa y vuelve al modo diseño */
  const abrirHerramienta = (id: Exclude<HojaMovil, null>) => {
    setVistaInvitado(false)
    setHoja(id)
  }

  // ─────────── Lienzo (la invitación) ───────────
  // Cuando el marco tiene alto propio, la foto de fondo de la invitación se ajusta a él (no a la ventana)
  const visor = { containerType: 'size', ['--inv-alto-visor' as string]: '100cqh' } as React.CSSProperties
  const lienzo = (
    <div
      className={`relative mx-auto bg-white overflow-hidden ${esMovil ? (vistaInvitado ? 'w-full h-full overflow-y-auto' : 'w-full min-h-full') : dispositivo === 'movil' ? 'w-[390px] rounded-[36px] border-[10px] border-slate-900 shadow-2xl' : 'w-full max-w-[760px] rounded-2xl border border-slate-300 shadow-xl'}`}
      style={!esMovil ? { height: 'calc(100vh - 150px)', overflowY: 'auto', ...visor } : vistaInvitado ? visor : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) estudio.acciones.seleccionar(null)
      }}
    >
      <Invitacion
        key={vistaInvitado ? `vista-${claveApertura}` : 'editor'}
        evento={{ ...evento, secciones, configuracionVisual: visual }}
        visual={visual}
        modo={vistaInvitado ? 'vista' : 'editor'}
        contenida
        mostrarApertura={vistaInvitado}
        claveApertura={claveApertura}
        edicion={vistaInvitado ? undefined : edicion}
        seleccionId={vistaInvitado ? null : bloqueId}
        alSeleccionarBloque={seleccionarBloque}
      />
    </div>
  )

  const barraSuperior = (
    <header className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white border-b border-slate-200 sticky top-0 z-40">
      <Link href={`/gestionar/${evento.tokenAdmin}`} aria-label="Ir a mi panel" className="w-10 h-10 rounded-xl border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
        <ArrowLeft size={18} />
      </Link>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 truncate">{evento.titulo}</span>
        <IndicadorGuardado {...propsIndicador} compacto={esMovil} />
      </div>
      {!esMovil && (
        <>
          <div role="group" aria-label="Modo" className="flex p-1 rounded-xl bg-slate-100">
            <button type="button" aria-pressed={!vistaInvitado} onClick={() => setVistaInvitado(false)} className={`min-h-9 px-3 rounded-lg text-[13px] flex items-center gap-1.5 cursor-pointer ${!vistaInvitado ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-semibold text-slate-600'}`}>
              <PencilLine size={14} /> Diseñar
            </button>
            <button
              type="button"
              aria-pressed={vistaInvitado}
              onClick={() => {
                setVistaInvitado(true)
                setClaveApertura((c) => c + 1)
              }}
              className={`min-h-9 px-3 rounded-lg text-[13px] flex items-center gap-1.5 cursor-pointer ${vistaInvitado ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-semibold text-slate-600'}`}
            >
              <Eye size={14} /> Ver como invitado
            </button>
          </div>
          <button type="button" onClick={() => setPanelDiseno('estilo')} className="min-h-10 px-3.5 rounded-xl border border-slate-300 text-[13px] font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
            <Palette size={15} /> Estilo
          </button>
          <button type="button" onClick={() => setPanelDiseno('experiencia')} className="min-h-10 px-3.5 rounded-xl border border-slate-300 text-[13px] font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
            <Sparkles size={15} /> Experiencia
          </button>
        </>
      )}
      <button type="button" onClick={irAInvitados} className="min-h-10 px-3.5 sm:px-4 rounded-xl bg-slate-900 text-white text-[13px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer hover:bg-slate-800">
        <Send size={15} /> <span>{esMovil ? 'Enviar' : 'Invitados y envío'}</span>
      </button>
    </header>
  )

  return (
    <ProveedorEditorLienzo value={estudio.contexto}>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
        {barraSuperior}

        {esMovil ? (
          <>
            {vistaInvitado ? (
              // La vista previa ocupa su propia pantalla: el diseño no queda debajo ni se desplaza con ella
              <div className="fixed inset-x-0 top-0 bottom-[76px] z-[45] flex flex-col bg-white">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 text-white text-[13px] font-semibold shrink-0">
                  Así la verá tu invitado
                  <button type="button" onClick={() => setClaveApertura((c) => c + 1)} className="flex items-center gap-1.5 underline cursor-pointer">
                    <RotateCcw size={14} /> Repetir apertura
                  </button>
                </div>
                <div className="relative flex-1 min-h-0">{lienzo}</div>
              </div>
            ) : (
              <main className="flex-1 pb-36 bg-slate-200/60">{lienzo}</main>
            )}

            {seleccionTexto && !vistaInvitado ? (
              <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,0.1)] pb-[env(safe-area-inset-bottom)]">
                <BarraContextual seleccion={estudio.seleccion} secciones={secciones} visual={visual} acciones={estudio.acciones} esMovil />
              </div>
            ) : (
              <>
                {bloque && !vistaInvitado && (
                  <button type="button" onClick={() => setHoja('inspector')} className="fixed left-3 right-3 bottom-[84px] z-40 min-h-12 px-4 rounded-2xl bg-slate-900 text-white text-[14px] font-bold flex items-center justify-between shadow-lg cursor-pointer">
                    <span className="truncate">Editar «{nombreBloque(bloque)}»</span>
                    <PencilLine size={16} />
                  </button>
                )}
                <nav aria-label="Herramientas" className="fixed inset-x-0 bottom-0 z-40 h-[76px] bg-white border-t border-slate-200 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
                  {(
                    [
                      ['bloques', 'Bloques', <LayoutList key="i" size={21} />],
                      ['diseno', 'Estilo', <Palette key="i" size={21} />],
                    ] as const
                  ).map(([id, nombre, icono]) => (
                    <button key={id} type="button" onClick={() => (id === 'diseno' ? abrirHojaDiseno('estilo') : abrirHerramienta(id))} className="w-16 h-14 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      {icono}
                      {nombre}
                    </button>
                  ))}
                  <button type="button" aria-label="Añadir" onClick={() => abrirHerramienta('bloques')} className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg cursor-pointer">
                    <Plus size={26} />
                  </button>
                  <button type="button" onClick={() => abrirHojaDiseno('datos')} className="w-16 h-14 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                    <PencilLine size={21} />
                    Datos
                  </button>
                  <button
                    type="button"
                    aria-pressed={vistaInvitado}
                    onClick={() => {
                      if (vistaInvitado) return setVistaInvitado(false)
                      setVistaInvitado(true)
                      setClaveApertura((c) => c + 1)
                    }}
                    className={`w-16 h-14 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer ${vistaInvitado ? 'text-amber-600' : 'text-slate-600'}`}
                  >
                    {vistaInvitado ? <PencilLine size={21} /> : <Eye size={21} />}
                    {vistaInvitado ? 'Diseñar' : 'Ver'}
                  </button>
                </nav>
              </>
            )}

            <Vaul.Root open={hoja !== null} onOpenChange={(abierta) => !abierta && setHoja(null)}>
              <Vaul.Portal>
                <Vaul.Overlay className="fixed inset-0 z-[60] bg-black/30" />
                <Vaul.Content className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[88vh] flex-col rounded-t-3xl bg-white outline-none" aria-describedby={undefined}>
                  <div className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />
                  <div className="flex items-center justify-between px-4 pt-2">
                    <Vaul.Title className="text-[16px] font-extrabold text-slate-900">
                      {hoja === 'bloques' ? 'Bloques' : hoja === 'inspector' ? 'Editar bloque' : pestanaMovil === 'datos' ? 'Datos del evento' : 'Diseño'}
                    </Vaul.Title>
                    <BotonCerrar alCerrar={() => setHoja(null)} />
                  </div>
                  <div className="overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
                    {hoja === 'bloques' && panelBloques}
                    {hoja === 'inspector' && inspector}
                    {hoja === 'diseno' && contenidoDiseno(pestanaMovil)}
                  </div>
                </Vaul.Content>
              </Vaul.Portal>
            </Vaul.Root>
          </>
        ) : (
          <div className="flex-1 flex min-h-0">
            {anchura === 'escritorio' && (
              <aside aria-label="Bloques" className="w-[280px] shrink-0 bg-white border-r border-slate-200 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 66px)' }}>
                {panelBloques}
              </aside>
            )}

            <section aria-label="Invitación" className="flex-1 min-w-0 flex flex-col items-center gap-3 p-4 overflow-hidden">
              <div className="w-full max-w-[760px] flex items-center justify-between gap-2 min-h-11">
                {seleccionTexto && !vistaInvitado ? (
                  <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-300 shadow-md px-2 py-1.5">
                    <BarraContextual seleccion={estudio.seleccion} secciones={secciones} visual={visual} acciones={estudio.acciones} esMovil={false} />
                  </div>
                ) : vistaInvitado ? (
                  <div className="flex-1 flex items-center gap-3 text-[13px] font-semibold text-slate-700">
                    Así la verá tu invitado.
                    <button type="button" onClick={() => setClaveApertura((c) => c + 1)} className="flex items-center gap-1.5 text-slate-900 underline cursor-pointer">
                      <RotateCcw size={14} /> Repetir apertura
                    </button>
                  </div>
                ) : (
                  <p className="m-0 flex-1 text-[13px] text-slate-600">Toca un bloque para editarlo, o un texto para escribir encima y darle estilo.</p>
                )}
                {anchura === 'tablet' && (
                  <button type="button" onClick={() => setPanelDiseno('datos')} className="min-h-10 px-3 rounded-xl border border-slate-300 bg-white text-[13px] font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <LayoutList size={15} /> Bloques
                  </button>
                )}
                <div role="group" aria-label="Dispositivo" className="flex p-1 rounded-xl bg-white border border-slate-200 shrink-0">
                  <button type="button" aria-label="Vista celular" aria-pressed={dispositivo === 'movil'} onClick={() => setDispositivo('movil')} className={`w-9 h-8 rounded-lg flex items-center justify-center cursor-pointer ${dispositivo === 'movil' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                    <Smartphone size={15} />
                  </button>
                  <button type="button" aria-label="Vista computador" aria-pressed={dispositivo === 'escritorio'} onClick={() => setDispositivo('escritorio')} className={`w-9 h-8 rounded-lg flex items-center justify-center cursor-pointer ${dispositivo === 'escritorio' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                    <Monitor size={15} />
                  </button>
                </div>
              </div>
              {lienzo}
            </section>

            <aside aria-label="Propiedades del bloque" className="w-[360px] shrink-0 bg-white border-l border-slate-200 p-5 overflow-y-auto" style={{ height: 'calc(100vh - 66px)' }}>
              {panelDiseno ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-extrabold text-slate-900">{panelDiseno === 'datos' && anchura === 'tablet' ? 'Bloques y datos' : 'Diseño de la invitación'}</span>
                    <BotonCerrar alCerrar={() => setPanelDiseno(null)} />
                  </div>
                  {panelDiseno === 'datos' && anchura === 'tablet' && <div className="pb-4 border-b border-slate-200">{panelBloques}</div>}
                  {contenidoDiseno(panelDiseno)}
                </div>
              ) : (
                inspector || <p className="text-[14px] text-slate-600">Toca un bloque de la invitación para editarlo.</p>
              )}
            </aside>
          </div>
        )}

        <PanelAgregar {...estudio.propsPanelAgregar} />
        <DialogoRecorte url={estudio.recorte?.url ?? null} alCancelar={estudio.cancelarRecorte} alConfirmar={estudio.confirmarRecorte} />
        <ModalPago
          abierto={pagoAbierto}
          alCerrar={() => setPagoAbierto(false)}
          alCompletarPago={() => setPagoAbierto(false)}
          tituloEvento={evento.titulo}
          tokenAdmin={evento.tokenAdmin}
          eventoId={evento.id}
        />
      </div>
    </ProveedorEditorLienzo>
  )
}
