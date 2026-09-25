-- =========================================================================
-- ESQUEMA Y MIGRACIÓN DE BASE DE DATOS POSTGRESQL PARA SUPABASE
-- Plataforma: Tarjetón Studio (Invitaciones Digitales Interactivas)
-- Este script es 100% IDEMPOTENTE: puedes ejecutarlo tanto en una base de
-- datos nueva como en una existente sin perder información.
-- =========================================================================

-- 1. TABLA PRINCIPAL DE EVENTOS
CREATE TABLE IF NOT EXISTS public.eventos (
  id TEXT PRIMARY KEY,
  token_admin TEXT UNIQUE NOT NULL,
  slug_publico TEXT UNIQUE NOT NULL,
  tipo_evento TEXT NOT NULL DEFAULT 'corporativo',
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  anfitriones TEXT NOT NULL,
  fecha_evento TIMESTAMPTZ NOT NULL,
  hora_evento TEXT,
  direccion TEXT NOT NULL,
  enlace_mapa TEXT,
  codigo_vestimenta TEXT,
  paleta_vestimenta JSONB DEFAULT '[]'::jsonb,
  datos_bancarios JSONB DEFAULT '{}'::jsonb,
  whatsapp_numero TEXT NOT NULL,
  whatsapp_plantilla TEXT NOT NULL,
  fotos_galeria JSONB DEFAULT '[]'::jsonb,
  imagen_portada TEXT,
  imagen_retrato TEXT,
  mostrar_foto_retrato BOOLEAN DEFAULT true,
  mostrar_badge BOOLEAN DEFAULT true,
  texto_badge TEXT DEFAULT 'Convocatoria Oficial',
  es_premium BOOLEAN NOT NULL DEFAULT false,
  configuracion_visual JSONB DEFAULT '{}'::jsonb,
  secciones JSONB DEFAULT '[]'::jsonb,
  metodo_confirmacion TEXT DEFAULT 'tarjeton',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_en TIMESTAMPTZ NOT NULL
);

-- Migración de columnas para eventos existentes
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS metodo_confirmacion TEXT DEFAULT 'tarjeton';
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS mostrar_foto_retrato BOOLEAN DEFAULT true;
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS mostrar_badge BOOLEAN DEFAULT true;
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS texto_badge TEXT DEFAULT 'Convocatoria Oficial';

-- Índices de alto rendimiento para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON public.eventos(slug_publico);
CREATE INDEX IF NOT EXISTS idx_eventos_token_admin ON public.eventos(token_admin);
CREATE INDEX IF NOT EXISTS idx_eventos_expira_en ON public.eventos(expira_en);


-- 2. TABLA DE INVITADOS Y CONFIRMACIONES RSVP
CREATE TABLE IF NOT EXISTS public.invitados (
  id TEXT PRIMARY KEY,
  evento_id TEXT NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  pases INTEGER NOT NULL DEFAULT 1,
  es_plural BOOLEAN NOT NULL DEFAULT false,
  telefono TEXT,
  codigo_acceso TEXT NOT NULL,
  confirmado BOOLEAN NOT NULL DEFAULT false,
  estado_confirmacion TEXT DEFAULT 'pendiente',
  cupos_confirmados INTEGER DEFAULT 0,
  mensaje_confirmacion TEXT,
  fecha_confirmacion TIMESTAMPTZ,
  enviado_por_whatsapp BOOLEAN DEFAULT false,
  fecha_envio_whatsapp TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migración de columnas de confirmación y WhatsApp para tablas ya creadas
ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS estado_confirmacion TEXT DEFAULT 'pendiente';
ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS cupos_confirmados INTEGER DEFAULT 0;
ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS mensaje_confirmacion TEXT;
ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS enviado_por_whatsapp BOOLEAN DEFAULT false;
ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS fecha_envio_whatsapp TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invitados_evento_id ON public.invitados(evento_id);
CREATE INDEX IF NOT EXISTS idx_invitados_codigo_acceso ON public.invitados(codigo_acceso);


-- 3. TABLA DE PROMOCIONES Y CUPONES DE DESCUENTO
CREATE TABLE IF NOT EXISTS public.promociones (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  tipo_descuento TEXT NOT NULL DEFAULT 'porcentaje', -- 'porcentaje' o 'precio_fijo'
  valor NUMERIC NOT NULL,
  usos_maximos INTEGER NOT NULL DEFAULT 100,
  usos_actuales INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_expiracion TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promociones_codigo ON public.promociones(codigo);


-- 4. TABLA DE PUBLICACIONES Y BANNERS EN LANDING PAGE
CREATE TABLE IF NOT EXISTS public.publicaciones_landing (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'banner_superior',
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  texto_boton TEXT,
  enlace_boton TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  color_fondo TEXT DEFAULT '#0F172A',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 5. TABLA DE CONFIGURACIÓN GLOBAL DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.configuracion_global (
  id TEXT PRIMARY KEY DEFAULT 'principal',
  precio_premium_cop INTEGER NOT NULL DEFAULT 15900,
  precio_premium_usd NUMERIC(10,2) NOT NULL DEFAULT 3.99,
  limite_gratis_invitados INTEGER NOT NULL DEFAULT 50,
  anuncios_ads_habilitados BOOLEAN NOT NULL DEFAULT true,
  modo_mantenimiento BOOLEAN NOT NULL DEFAULT false,
  mensaje_mantenimiento TEXT DEFAULT 'Estamos realizando labores de mantenimiento protocolario.',
  whatsapp_soporte TEXT DEFAULT '573001234567',
  ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO public.configuracion_global (id, precio_premium_cop, precio_premium_usd, limite_gratis_invitados)
VALUES ('principal', 15900, 3.99, 50)
ON CONFLICT (id) DO NOTHING;


-- 6. PERMISOS Y SEGURIDAD
-- Dado que en esta plataforma NO hay registro de usuarios con login/password,
-- sino que la seguridad se gestiona mediante tokens únicos en la URL:
--
-- OPCIÓN RECOMENDADA (Más simple y directa):
-- Desactivar RLS para que la aplicación guarde y lea sin bloqueos:
ALTER TABLE public.eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones_landing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_global DISABLE ROW LEVEL SECURITY;

-- OPCIÓN ALTERNATIVA (Si deseas mantener RLS activo en Supabase, habilita acceso público):
-- ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.invitados ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Acceso total eventos" ON public.eventos;
-- CREATE POLICY "Acceso total eventos" ON public.eventos FOR ALL USING (true) WITH CHECK (true);
-- DROP POLICY IF EXISTS "Acceso total invitados" ON public.invitados;
-- CREATE POLICY "Acceso total invitados" ON public.invitados FOR ALL USING (true) WITH CHECK (true);

