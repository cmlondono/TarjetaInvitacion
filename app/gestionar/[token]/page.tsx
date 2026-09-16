'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EventoRepositorio } from '@/lib/storage'
import { DetalleEvento } from '@/types/invitation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AlertCircle, Plus } from 'lucide-react'

export default function PaginaGestionar() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [evento, setEvento] = useState<DetalleEvento | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (token) {
      const cargar = async () => {
        let e = EventoRepositorio.obtenerPorTokenAdmin(token)
        if (!e) {
          e = await EventoRepositorio.obtenerPorTokenAdminAsync(token)
          if (e) {
            EventoRepositorio.guardar(e)
          }
        }
        setEvento(e)
        setCargando(false)
      }
      cargar()
    }
  }, [token])

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-medium animate-pulse">Cargando tu panel de control...</p>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-xl font-bold font-serif mb-2">Evento no encontrado</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            El enlace de administración que estás usando no es válido o ha expirado su ciclo de vida.
          </p>
          <Link
            href="/crear"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={16} /> Crear una nueva tarjeta gratis
          </Link>
        </div>
      </div>
    )
  }

  return <AdminDashboard evento={evento} />
}
