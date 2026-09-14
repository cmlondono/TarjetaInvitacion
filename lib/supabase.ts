import { createClient, SupabaseClient } from '@supabase/supabase-js'

let clienteSupabaseInstancia: SupabaseClient | null = null

/**
 * Obtiene o inicializa el cliente de Supabase.
 * Si las variables de entorno aún no han sido configuradas, retorna null de forma segura.
 */
export function obtenerClienteSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || url.includes('tu-proyecto')) {
    return null
  }

  if (!clienteSupabaseInstancia) {
    clienteSupabaseInstancia = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return clienteSupabaseInstancia
}
