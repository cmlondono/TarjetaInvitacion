'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { VisualCustomizer } from '@/components/editor/visual-customizer'
import { EventoRepositorio } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'

function ContenidoCrear() {
  const searchParams = useSearchParams()
  const tokenEdicion = searchParams.get('editar')
  const [eventoAEditar, setEventoAEditar] = useState<DetalleEvento | undefined>(undefined)
  const [cargando, setCargando] = useState(!!tokenEdicion)

  useEffect(() => {
    if (tokenEdicion) {
      const cargar = async () => {
        let encontrado = EventoRepositorio.obtenerPorTokenAdmin(tokenEdicion)
        if (!encontrado) {
          encontrado = await EventoRepositorio.obtenerPorTokenAdminAsync(tokenEdicion)
          if (encontrado) {
            EventoRepositorio.guardar(encontrado)
          }
        }
        if (encontrado) {
          setEventoAEditar(encontrado)
        }
        setCargando(false)
      }
      cargar()
    }
  }, [tokenEdicion])

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-medium animate-pulse">Cargando editor...</p>
      </div>
    )
  }

  return <VisualCustomizer eventoInicial={eventoAEditar} modoEdicion={!!eventoAEditar} />
}

export default function PaginaCrear() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ContenidoCrear />
    </Suspense>
  )
}
