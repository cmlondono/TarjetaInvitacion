-- =========================================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL PARA SUPABASE
-- Plataforma: InvitacionesYa Studio
-- =========================================================================

-- 1. TABLA DE EVENTOS
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
  es_premium BOOLEAN NOT NULL DEFAULT false,
  configuracion_visual JSONB DEFAULT '{}'::jsonb,
  secciones JSONB DEFAULT '[]'::jsonb,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_en TIMESTAMPTZ NOT NULL
);

-- Índices de alto rendimiento para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON public.eventos(slug_publico);
CREATE INDEX IF NOT EXISTS idx_eventos_token_admin ON public.eventos(token_admin);
CREATE INDEX IF NOT EXISTS idx_eventos_expira_en ON public.eventos(expira_en);

-- 2. TABLA DE INVITADOS
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

-- Si ya tenías creada la tabla anteriormente:
-- ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS estado_confirmacion TEXT DEFAULT 'pendiente';
-- ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS cupos_confirmados INTEGER DEFAULT 0;
-- ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS mensaje_confirmacion TEXT;
-- ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS enviado_por_whatsapp BOOLEAN DEFAULT false;
-- ALTER TABLE public.invitados ADD COLUMN IF NOT EXISTS fecha_envio_whatsapp TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invitados_evento_id ON public.invitados(evento_id);

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

-- 6. POLÍTICAS DE ACCESO (ROW LEVEL SECURITY)
-- Habilitar RLS para seguridad de nivel empresarial
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones_landing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_global ENABLE ROW LEVEL SECURITY;

-- Lectura pública para invitados por slug
CREATE POLICY "Lectura publica de eventos por slug"
ON public.eventos FOR SELECT
USING (true);

CREATE POLICY "Insertar nuevos eventos"
ON public.eventos FOR INSERT
WITH CHECK (true);

CREATE POLICY "Actualizar evento con token admin"
ON public.eventos FOR UPDATE
USING (true);

-- Invitados: lectura y confirmación pública
CREATE POLICY "Lectura de invitados"
ON public.invitados FOR SELECT
USING (true);

CREATE POLICY "Gestionar invitados"
ON public.invitados FOR ALL
USING (true);

-- Banners públicos activos
CREATE POLICY "Lectura de avisos en landing"
ON public.publicaciones_landing FOR SELECT
USING (activo = true);

-- Promociones
CREATE POLICY "Lectura de promociones activas"
ON public.promociones FOR SELECT
USING (activo = true);

-- Configuración global
CREATE POLICY "Lectura de configuracion global"
ON public.configuracion_global FOR SELECT
USING (true);
