'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Lock, User, KeyRound, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'

export default function PaginaAdminLogin() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      })

      const data = await res.json()

      if (data.exito) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Credenciales de acceso no válidas.')
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión con el servidor de autenticación.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-serif selection:bg-slate-900 selection:text-white"
      style={{ fontFamily: 'var(--font-roboto-slab), serif' }}
    >
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Logotipo y Título Editorial */}
        <div className="text-center space-y-2.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-500 block mb-1">
              Consola Master & Protocolo
            </span>
            <h1 className="text-2xl font-bold text-slate-950 tracking-tight">
              InvitacionesYa Studio
            </h1>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Acceso administrativo exclusivo para supervisión de métricas, cupones e ingresos.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Formulario de Autenticación */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Usuario Administrador
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-950 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden pl-10"
              />
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Contraseña Maestra
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-950 placeholder-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-hidden pl-10 pr-10 font-mono"
              />
              <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Botón de Ingreso con el mismo estilo de la Landing */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {cargando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel Seguro</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Nota de Seguridad y Retorno */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Cifrado HMAC SHA-256 · Sesión HttpOnly · Anti Fuerza Bruta</span>
          </div>
          <div className="pt-2">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-950 underline font-semibold">
              ← Volver a la Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
