import { redirect } from 'next/navigation'
import { obtenerSesionAdmin } from '@/lib/admin-auth'

export default async function PaginaAdminIndex() {
  const sesion = await obtenerSesionAdmin()

  if (sesion) {
    redirect('/admin/dashboard')
  } else {
    redirect('/admin/login')
  }
}
