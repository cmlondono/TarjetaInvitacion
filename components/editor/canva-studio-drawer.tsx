'use client'

import React, { useState, useEffect } from 'react'
import {
  ConfiguracionVisual,
  DetalleEvento,
  TipoSeccion,
  TexturaFondo,
  MarcoDecorativoTipo,
  EfectoFondo,
  FuenteTipografica,
  FormaTarjeta,
} from '@/types/invitation'
import { PLANTILLAS_TEMAS } from '@/lib/theme-presets'
import { CATALOGO_SECCIONES } from '@/lib/modular-defaults'
import { LISTA_ICONOS_DISPONIBLES, IconoDinamico } from '@/components/ui/icono-dinamico'
import { SelectorColorTonal } from './selector-color-tonal'
import { TarjetonIcon } from '@/components/ui/tarjeton-logo'
import {
  LayoutTemplate,
  Sparkles,
  Palette,
  Type,
  ImageIcon,
  Music,
  Layers,
  Search,
  Check,
  X,
  Play,
  Pause,
  Plus,
  Square,
  Flame,
  Cake,
  PartyPopper,
  Wine,
  Heart,
  Baby,
  Mail,
} from 'lucide-react'

export type PestanaCanva =
  | 'plantillas'
  | 'elementos'
  | 'fondos'
  | 'colores'
  | 'tipografia'
  | 'iconos'
  | 'musica'
  | 'modulos'

export interface CanvaStudioDrawerProps {
  abierto: boolean
  alCerrar: () => void
  visual: ConfiguracionVisual
  alActualizarVisual: (campo: keyof ConfiguracionVisual, valor: any) => void
  evento: DetalleEvento
  alActualizarEvento: (campo: keyof DetalleEvento, valor: any) => void
  alAplicarPlantilla: (plantillaId: string) => void
  alAgregarSeccion: (tipo: TipoSeccion) => void
  pestanaInicial?: PestanaCanva
  onAbrirPersonalizadorSobre?: () => void
}

const TEXTURAS_DISPONIBLES: {
  id: TexturaFondo
  nombre: string
  descripcion: string
  muestraColor: string
}[] = [
  { id: 'liso', nombre: 'Liso / Minimalista', descripcion: 'Fondo limpio con color sólido', muestraColor: '#F8FAFC' },
  { id: 'papel_algodon', nombre: 'Papel de Algodón', descripcion: 'Textura artesanal de fibras', muestraColor: '#F5F5F4' },
  { id: 'marmol_oro', nombre: 'Mármol & Vetas Oro', descripcion: 'Piedra pulida con vetas doradas', muestraColor: '#FAF8F5' },
  { id: 'acuarela_botanica', nombre: 'Acuarela Botánica', descripcion: 'Manchas suaves de acuarela', muestraColor: '#F0FDF4' },
  { id: 'noche_estrellada', nombre: 'Noche Cósmica', descripcion: 'Constelaciones y estrellas', muestraColor: '#0F172A' },
  { id: 'lino_rustico', nombre: 'Lino & Asado Rústico', descripcion: 'Trama de tela para campo y BBQ', muestraColor: '#FFFBEB' },
  { id: 'fiesta_neon', nombre: 'Cyber Fiesta Neón', descripcion: 'Degradado vibrante fiesta', muestraColor: '#FAF5FF' },
  { id: 'terciopelo_oscuro', nombre: 'Terciopelo Oscuro', descripcion: 'Acabado profundo y suntuoso', muestraColor: '#18181B' },
]

const MARCOS_DISPONIBLES: {
  id: MarcoDecorativoTipo
  nombre: string
  descripcion: string
}[] = [
  { id: 'ninguno', nombre: 'Sin Marco', descripcion: 'Borde limpio estándar' },
  { id: 'oro_fino', nombre: 'Filete de Oro Fino', descripcion: 'Línea interior sutil dorada' },
  { id: 'doble_dorado', nombre: 'Doble Borde con Diamantes', descripcion: 'Rombo ornamental en esquinas' },
  { id: 'esquinas_vintage', nombre: 'Esquinas Vintage', descripcion: 'Detalle barroco en las 4 esquinas' },
  { id: 'arco_floral', nombre: 'Corona de Laureles', descripcion: 'Detalle de laurel superior' },
]

const EFECTOS_FONDO: {
  id: EfectoFondo
  nombre: string
  emoji: string
}[] = [
  { id: 'ninguno', nombre: 'Sin partículas', emoji: '⚪' },
  { id: 'confeti', nombre: 'Lluvia de Confeti', emoji: '🎉' },
  { id: 'flores_delicadas', nombre: 'Pétalos Florales', emoji: '🌸' },
  { id: 'particulas_doradas', nombre: 'Polvo de Oro', emoji: '✨' },
  { id: 'destellos', nombre: 'Destellos Suaves', emoji: '✦' },
  { id: 'estrellas', nombre: 'Cielo Estrellado', emoji: '🌟' },
]

const COMBOS_TIPOGRAFIA: {
  id: string
  nombre: string
  estilo: string
  titulo: FuenteTipografica
  cuerpo: FuenteTipografica
}[] = [
  { id: 'caligrafica_gala', nombre: 'Caligrafía Real & Bodas', estilo: 'Great Vibes + Montserrat', titulo: 'greatvibes', cuerpo: 'montserrat' },
  { id: 'nupcial_romance', nombre: 'Romance Nupcial', estilo: 'Alex Brush + Inter', titulo: 'alexbrush', cuerpo: 'inter' },
  { id: 'chic_paris', nombre: 'Chic Francés / Quinceañera', estilo: 'Parisienne + Montserrat', titulo: 'parisienne', cuerpo: 'montserrat' },
  { id: 'clasico_formal', nombre: 'Gala & Tradición', estilo: 'Playfair + Montserrat', titulo: 'playfair', cuerpo: 'montserrat' },
  { id: 'ceremonial_poetico', nombre: 'Ceremonial & Altares', estilo: 'Cormorant + Montserrat', titulo: 'cormorant', cuerpo: 'montserrat' },
  { id: 'didone_moda', nombre: 'Alta Moda & Glamour', estilo: 'Prata + Inter', titulo: 'prata', cuerpo: 'inter' },
  { id: 'imperial_romano', nombre: 'Solemne & Grados', estilo: 'Cinzel + Inter', titulo: 'cinzel', cuerpo: 'inter' },
  { id: 'poetico_calido', nombre: 'Cálido & Poético', estilo: 'Lora + Montserrat', titulo: 'lora', cuerpo: 'montserrat' },
  { id: 'vanguardia_moderna', nombre: 'Vanguardia & Editorial', estilo: 'Montserrat + Inter', titulo: 'montserrat', cuerpo: 'inter' },
  { id: 'geometrico_limpio', nombre: 'Geométrica Contemporánea', estilo: 'Poppins + Inter', titulo: 'poppins', cuerpo: 'inter' },
  { id: 'festivo_cumple', nombre: 'Fiesta & Cumpleaños', estilo: 'Dancing Script + Montserrat', titulo: 'dancing', cuerpo: 'montserrat' },
]

export function CanvaStudioDrawer({
  abierto,
  alCerrar,
  visual,
  alActualizarVisual,
  evento,
  alActualizarEvento,
  alAplicarPlantilla,
  alAgregarSeccion,
  pestanaInicial,
  onAbrirPersonalizadorSobre,
}: CanvaStudioDrawerProps) {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaCanva>(pestanaInicial || 'elementos')
  const [filtroIcono, setFiltroIcono] = useState('')
  const [filtroPlantilla, setFiltroPlantilla] = useState<'todas' | 'fiesta' | 'familiar' | 'boda' | 'gala'>('todas')

  useEffect(() => {
    if (pestanaInicial) {
      setPestanaActiva(pestanaInicial)
    }
  }, [pestanaInicial, abierto])

  if (!abierto) return null

  const iconosFiltrados = LISTA_ICONOS_DISPONIBLES.filter(
    (ic) =>
      ic.etiqueta.toLowerCase().includes(filtroIcono.toLowerCase()) ||
      ic.id.toLowerCase().includes(filtroIcono.toLowerCase())
  )

  const plantillasFiltradas = PLANTILLAS_TEMAS.filter((p) => {
    if (filtroPlantilla === 'todas') return true
    if (filtroPlantilla === 'fiesta') return p.tipoEvento === 'cumpleanos'
    if (filtroPlantilla === 'familiar') return p.tipoEvento === 'otro' || p.tipoEvento === 'baby_shower'
    if (filtroPlantilla === 'boda') return p.tipoEvento === 'boda' || p.tipoEvento === 'quince_anos'
    if (filtroPlantilla === 'gala') return p.tipoEvento === 'corporativo' || p.tipoEvento === 'grado'
    return true
  })

  return (
    <>
      {/* Telón de fondo oscuro para cerrar al hacer clic afuera en móvil o desktop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
        onClick={alCerrar}
      />

      <div className="fixed inset-y-0 left-0 z-50 flex shadow-2xl animate-in slide-in-from-left duration-300 max-w-full">
        {/* ── BARRA VERTICAL DE ICONOS (CANVA DOCK) ── */}
        <div className="w-16 sm:w-20 bg-slate-900 text-white flex flex-col items-center py-4 border-r border-slate-800 shrink-0 z-10 select-none">
          <div className="mb-4 flex items-center justify-center" title="Estudio Tarjetón">
            <TarjetonIcon size={36} className="shadow-lg rounded-xl" />
          </div>

          <nav className="flex flex-col gap-1 w-full px-1 flex-1 overflow-y-auto">
            {[
              { id: 'elementos', label: 'Marcos', icono: <Square size={18} /> },
              { id: 'fondos', label: 'Fondos', icono: <ImageIcon size={18} /> },
              { id: 'plantillas', label: 'Diseños', icono: <LayoutTemplate size={18} /> },
              { id: 'colores', label: 'Colores', icono: <Palette size={18} /> },
              { id: 'tipografia', label: 'Fuentes', icono: <Type size={18} /> },
              { id: 'iconos', label: 'Iconos', icono: <Sparkles size={18} /> },
              { id: 'modulos', label: 'Bloques', icono: <Layers size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPestanaActiva(item.id as PestanaCanva)}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                  pestanaActiva === item.id
                    ? 'bg-white text-slate-900 shadow-md scale-95'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icono}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={alCerrar}
            className="mt-auto p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar estudio"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── BANDEJA LATERAL DE CONTENIDOS CREATIVOS ── */}
        <div className="w-[calc(100vw-4.5rem)] sm:w-96 max-w-md bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Cabecera de la bandeja */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 capitalize">
              {pestanaActiva === 'elementos' && '🖼️ Marcos & Bordes de Tarjeta'}
              {pestanaActiva === 'fondos' && '🖼️ Fondos & Texturas de Papel'}
              {pestanaActiva === 'plantillas' && '📑 Plantillas de Invitación'}
              {pestanaActiva === 'colores' && '🎨 Paletas de Ocasión'}
              {pestanaActiva === 'tipografia' && '🔤 Combos Tipográficos'}
              {pestanaActiva === 'iconos' && '🔍 Biblioteca de Iconos'}
              {pestanaActiva === 'modulos' && '⚡ Bloques Interactivos'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Haz clic en cualquier elemento para aplicarlo en vivo a tu tarjeta.
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido scrolleable de la bandeja */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ══════════ PESTAÑA: MARCOS & BORDES EDITORIALES ══════════ */}
          {pestanaActiva === 'elementos' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Square size={14} className="text-slate-800" /> Marcos & Filetes Editoriales
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Delicadas molduras impresas, filetes de oro y ribetes perimetrales para la tarjeta.
                </p>
                <div className="space-y-2">
                  {MARCOS_DISPONIBLES.map((marco) => {
                    const estaActivo = (visual.marcoDecorativo || 'ninguno') === marco.id
                    return (
                      <button
                        key={marco.id}
                        type="button"
                        onClick={() => alActualizarVisual('marcoDecorativo', marco.id)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer select-none ${
                          estaActivo
                            ? 'border-slate-950 bg-slate-50 shadow-2xs font-bold text-slate-950 ring-1 ring-slate-950'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{marco.nombre}</p>
                          <p className="text-[10px] text-slate-500">{marco.descripcion}</p>
                        </div>
                        {estaActivo && <Check size={14} className="text-slate-950" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sobre Protocolario 3D */}
              {/* Sobre Protocolario de Apertura 3D */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-800" /> Sobre de Apertura 3D
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Animación ceremonial de sobre y sello al entrar a la invitación.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alActualizarVisual('animacionSobre', !visual.animacionSobre)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      visual.animacionSobre ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                        visual.animacionSobre ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {visual.animacionSobre && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-3">
                    {/* Selector rápido de estilo */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                        Estilo de Sobre
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'clasico', nombre: 'Clásico', icon: '✉️' },
                          { id: 'moderno', nombre: 'Moderno', icon: '📐' },
                          { id: 'vintage', nombre: 'Vintage', icon: '🕊️' },
                          { id: 'gala', nombre: 'Gala', icon: '👑' },
                          { id: 'artesanal', nombre: 'Kraft', icon: '🌿' },
                          { id: 'diamante', nombre: 'Diamante', icon: '💎' },
                        ].map((estilo) => {
                          const esActivo = (visual.estiloSobre || 'clasico') === estilo.id
                          return (
                            <button
                              key={estilo.id}
                              type="button"
                              onClick={() => alActualizarVisual('estiloSobre', estilo.id)}
                              className={`py-1.5 px-2 rounded-lg border text-center cursor-pointer text-xs flex items-center justify-center gap-1 select-none ${
                                esActivo
                                  ? 'bg-white border-slate-900 font-bold text-slate-900 shadow-2xs'
                                  : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                              }`}
                            >
                              <span>{estilo.icon}</span>
                              <span className="text-[10px]">{estilo.nombre}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Botón para abrir personalizador completo */}
                    {onAbrirPersonalizadorSobre && (
                      <button
                        type="button"
                        onClick={onAbrirPersonalizadorSobre}
                        className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                      >
                        <Mail size={13} className="text-white" />
                        <span>Abrir Personalizador de Sobre Completo</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ PESTAÑA: FONDOS & TEXTURAS ══════════ */}
          {pestanaActiva === 'fondos' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Texturas de Papelería & Materiales
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {TEXTURAS_DISPONIBLES.map((tex) => {
                    const estaActiva = (visual.texturaFondo || 'liso') === tex.id
                    return (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => alActualizarVisual('texturaFondo', tex.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                          estaActiva
                            ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                            : 'border-slate-200 hover:border-slate-400 bg-white text-slate-800'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded-lg border flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: tex.muestraColor }}
                        >
                          <span className="text-[10px] font-mono opacity-40">Textura</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold">{tex.nombre}</p>
                          <p className={`text-[10px] mt-0.5 line-clamp-1 ${estaActiva ? 'text-slate-300' : 'text-slate-500'}`}>
                            {tex.descripcion}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Efectos Ambientales de Partículas */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Efecto Flotante en Pantalla
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {EFECTOS_FONDO.map((ef) => {
                    const estaActivo = visual.efectoFondo === ef.id
                    return (
                      <button
                        key={ef.id}
                        type="button"
                        onClick={() => alActualizarVisual('efectoFondo', ef.id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          estaActivo
                            ? 'border-slate-900 bg-slate-100 text-slate-950 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{ef.emoji}</span>
                        <span className="text-[11px] truncate">{ef.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ PESTAÑA: PLANTILLAS COMPLETAS (CANVA STYLE) ══════════ */}
          {pestanaActiva === 'plantillas' && (
            <div className="space-y-3">
              {/* Filtros de ocasión */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'fiesta', label: '🎉 Cumpleaños' },
                  { id: 'familiar', label: '🏡 Familia' },
                  { id: 'boda', label: '💍 Bodas' },
                  { id: 'gala', label: '👑 Gala' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltroPlantilla(f.id as any)}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      filtroPlantilla === f.id
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Lista visual de plantillas */}
              <div className="space-y-2.5">
                {plantillasFiltradas.map((plantilla) => (
                  <button
                    key={plantilla.id}
                    type="button"
                    onClick={() => alAplicarPlantilla(plantilla.id)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 bg-white text-left transition-all hover:shadow-md cursor-pointer group flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                        {plantilla.nombre}
                      </p>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: plantilla.visual.colorPrimario }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: plantilla.visual.colorSecundario }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: plantilla.visual.colorFondo }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {plantilla.descripcion}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ PESTAÑA: SELECTOR TONAL DE COLORES ══════════ */}
          {pestanaActiva === 'colores' && (
            <SelectorColorTonal
              visual={visual}
              alActualizarVisual={alActualizarVisual}
            />
          )}

          {/* ══════════ PESTAÑA: COMBOS TIPOGRÁFICOS ══════════ */}
          {pestanaActiva === 'tipografia' && (
            <div className="space-y-2.5">
              {COMBOS_TIPOGRAFIA.map((combo) => {
                const estaActivo =
                  visual.fuenteTitulo === combo.titulo && visual.fuenteCuerpo === combo.cuerpo
                return (
                  <button
                    key={combo.id}
                    type="button"
                    onClick={() => {
                      alActualizarVisual('fuenteTitulo', combo.titulo)
                      alActualizarVisual('fuenteCuerpo', combo.cuerpo)
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      estaActivo
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{combo.nombre}</span>
                      <span className={`text-[10px] ${estaActivo ? 'text-slate-300' : 'text-slate-400'}`}>
                        {combo.estilo}
                      </span>
                    </div>
                    <div className="pt-1">
                      <p className={`text-xl font-${combo.titulo} tracking-wide leading-tight`}>
                        Convocatoria Oficial
                      </p>
                      <p className={`text-[10px] mt-0.5 ${estaActivo ? 'text-slate-300' : 'text-slate-500'}`}>
                        Texto de lectura legible y armónico para los detalles
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ══════════ PESTAÑA: BUSCADOR DE ICONOS LIBRE ══════════ */}
          {pestanaActiva === 'iconos' && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={filtroIcono}
                  onChange={(e) => setFiltroIcono(e.target.value)}
                  placeholder="Buscar icono: fiesta, torta, regalo, asado..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto p-1">
                {iconosFiltrados.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group"
                    title={`Icono: ${item.etiqueta}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                      <IconoDinamico nombre={item.id} size={16} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 truncate w-full">
                      {item.etiqueta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ PESTAÑA: CATÁLOGO DE BLOQUES / MÓDULOS ══════════ */}
          {pestanaActiva === 'modulos' && (
            <div className="space-y-2">
              {CATALOGO_SECCIONES.filter(
                (c) => c.tipo !== 'cabecera' && c.tipo !== 'confirmacion_rsvp'
              ).map((cat) => (
                <button
                  key={cat.tipo}
                  type="button"
                  onClick={() => {
                    alAgregarSeccion(cat.tipo)
                    alCerrar()
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-left transition-all flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors shrink-0">
                      <IconoDinamico nombre={cat.iconoDefecto} size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{cat.nombre}</p>
                      <p className="text-[10px] text-slate-500 truncate">{cat.descripcion}</p>
                    </div>
                  </div>
                  <Plus size={14} className="text-slate-400 group-hover:text-slate-900 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)
}
