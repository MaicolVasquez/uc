
-- =====================================================
-- UNSA CONECTA
-- ETAPA 5: SISTEMA DE MENSAJERIA
-- =====================================================

-- =====================================================
-- 1. CONVERSACIONES
-- Permite conversaciones privadas y grupales.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('directa', 'grupo')),

    titulo VARCHAR(150),

    usuario_a UUID REFERENCES public.perfiles(id)
        ON DELETE CASCADE,

    usuario_b UUID REFERENCES public.perfiles(id)
        ON DELETE CASCADE,

    creado_por UUID NOT NULL REFERENCES public.perfiles(id)
        ON DELETE CASCADE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT conversaciones_usuarios_check CHECK (
        (
            tipo = 'directa'
            AND usuario_a IS NOT NULL
            AND usuario_b IS NOT NULL
            AND usuario_a < usuario_b
        )
        OR
        (
            tipo = 'grupo'
            AND usuario_a IS NULL
            AND usuario_b IS NULL
        )
    ),

    CONSTRAINT conversaciones_directa_unica
        UNIQUE (usuario_a, usuario_b)
);


-- =====================================================
-- 2. PARTICIPANTES
-- Identifica los integrantes de cada conversación.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversacion_participantes (

    conversacion_id UUID NOT NULL
        REFERENCES public.conversaciones(id)
        ON DELETE CASCADE,

    usuario_id UUID NOT NULL
        REFERENCES public.perfiles(id)
        ON DELETE CASCADE,

    rol VARCHAR(20) NOT NULL DEFAULT 'miembro'
        CHECK (rol IN ('administrador', 'miembro')),

    unido_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    ultimo_leido_en TIMESTAMPTZ,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (conversacion_id, usuario_id)

);


-- =====================================================
-- 3. MENSAJES
-- Almacena el contenido de cada conversación.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.mensajes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversacion_id UUID NOT NULL
        REFERENCES public.conversaciones(id)
        ON DELETE CASCADE,

    remitente_id UUID NOT NULL
        REFERENCES public.perfiles(id)
        ON DELETE CASCADE,

    contenido VARCHAR(2000) NOT NULL
        CHECK (length(trim(contenido)) > 0),

    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    editado_en TIMESTAMPTZ,

    eliminado_en TIMESTAMPTZ

);


-- =====================================================
-- 4. INDICES
-- Mejoran la velocidad de las consultas.
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_participantes_usuario
ON public.conversacion_participantes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_participantes_conversacion
ON public.conversacion_participantes(conversacion_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion_fecha
ON public.mensajes(conversacion_id, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_conversaciones_actualizacion
ON public.conversaciones(actualizado_en DESC);


-- =====================================================
-- 5. VALIDAR QUE EL REMITENTE SEA PARTICIPANTE ACTIVO
-- =====================================================

CREATE OR REPLACE FUNCTION public.validar_remitente_mensaje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM public.conversacion_participantes
        WHERE conversacion_id = NEW.conversacion_id
          AND usuario_id = NEW.remitente_id
          AND activo = TRUE
    ) THEN

        RAISE EXCEPTION 'REMITENTE_NO_PARTICIPANTE'
            USING ERRCODE = '42501';

    END IF;

    RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS trigger_validar_remitente
ON public.mensajes;

CREATE TRIGGER trigger_validar_remitente
BEFORE INSERT ON public.mensajes
FOR EACH ROW
EXECUTE FUNCTION public.validar_remitente_mensaje();


-- =====================================================
-- 6. ACTUALIZAR ACTIVIDAD DE LA CONVERSACION
-- =====================================================

CREATE OR REPLACE FUNCTION public.actualizar_fecha_conversacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE public.conversaciones
    SET actualizado_en = NEW.creado_en
    WHERE id = NEW.conversacion_id;

    RETURN NEW;

END;
$$;

DROP TRIGGER IF EXISTS trigger_actualizar_conversacion
ON public.mensajes;

CREATE TRIGGER trigger_actualizar_conversacion
AFTER INSERT ON public.mensajes
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_fecha_conversacion();


-- =====================================================
-- 7. CREAR O RECUPERAR CHAT PRIVADO
-- Evita crear dos conversaciones para la misma pareja.
-- =====================================================

CREATE OR REPLACE FUNCTION public.obtener_o_crear_chat_directo(
    p_solicitante UUID,
    p_destinatario UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE

    v_usuario_a UUID;
    v_usuario_b UUID;
    v_conversacion_id UUID;

BEGIN

    IF p_solicitante IS NULL OR p_destinatario IS NULL THEN
        RAISE EXCEPTION 'USUARIOS_INVALIDOS'
            USING ERRCODE = '22023';
    END IF;

    IF p_solicitante = p_destinatario THEN
        RAISE EXCEPTION 'NO_PUEDES_CONVERSAR_CONTIGO_MISMO'
            USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = p_solicitante
    ) OR NOT EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id = p_destinatario
    ) THEN

        RAISE EXCEPTION 'USUARIO_NO_EXISTE'
            USING ERRCODE = '23503';

    END IF;

    -- Ordenar los UUID para identificar una pareja única.
    v_usuario_a := LEAST(p_solicitante, p_destinatario);
    v_usuario_b := GREATEST(p_solicitante, p_destinatario);

    -- Buscar la conversación o crearla.
    INSERT INTO public.conversaciones (
        tipo,
        usuario_a,
        usuario_b,
        creado_por
    )
    VALUES (
        'directa',
        v_usuario_a,
        v_usuario_b,
        p_solicitante
    )
    ON CONFLICT (usuario_a, usuario_b)
    DO UPDATE SET
        actualizado_en = public.conversaciones.actualizado_en
    RETURNING id INTO v_conversacion_id;

    -- Registrar ambos participantes.
    INSERT INTO public.conversacion_participantes (
        conversacion_id,
        usuario_id,
        rol
    )
    VALUES
        (v_conversacion_id, p_solicitante, 'miembro'),
        (v_conversacion_id, p_destinatario, 'miembro')

    ON CONFLICT (conversacion_id, usuario_id)
    DO UPDATE SET activo = TRUE;

    RETURN v_conversacion_id;

END;
$$;


-- =====================================================
-- 8. SEGURIDAD RLS
-- El acceso se realizará mediante nuestro backend Express.
-- Nunca desde el navegador con una clave privilegiada.
-- =====================================================

ALTER TABLE public.conversaciones
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversacion_participantes
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mensajes
ENABLE ROW LEVEL SECURITY;


-- Bloquear el acceso directo de clientes públicos.
REVOKE ALL ON TABLE
    public.conversaciones,
    public.conversacion_participantes,
    public.mensajes
FROM anon, authenticated;

-- El backend utiliza exclusivamente su credencial privilegiada.
GRANT ALL ON TABLE
    public.conversaciones,
    public.conversacion_participantes,
    public.mensajes
TO service_role;

REVOKE ALL ON FUNCTION
    public.obtener_o_crear_chat_directo(UUID, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.obtener_o_crear_chat_directo(UUID, UUID)
TO service_role;


-- =====================================================
-- FIN DE LA MIGRACION
-- =====================================================
