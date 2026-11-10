
-- =====================================================
-- UNSA CONECTA
-- ETAPA 6: CHATS AUTOMATICOS DE PUNTO HUECO
-- =====================================================

-- 1. RELACIONAR CADA GRUPO CON SU PUNTO HUECO

ALTER TABLE public.conversaciones
ADD COLUMN IF NOT EXISTS punto_hueco_id UUID
REFERENCES public.punto_hueco(id)
ON DELETE CASCADE;

-- Un Punto Hueco solamente puede tener un grupo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversaciones_punto_hueco
ON public.conversaciones(punto_hueco_id)
WHERE punto_hueco_id IS NOT NULL;


-- 2. CREAR GRUPOS PARA LOS PUNTOS HUECO EXISTENTES

INSERT INTO public.conversaciones (
    tipo,
    titulo,
    usuario_a,
    usuario_b,
    creado_por,
    punto_hueco_id
)
SELECT
    'grupo',
    LEFT('Punto Hueco: ' || ph.titulo, 150),
    NULL,
    NULL,
    ph.usuario_id,
    ph.id
FROM public.punto_hueco ph
WHERE NOT EXISTS (
    SELECT 1
    FROM public.conversaciones c
    WHERE c.punto_hueco_id = ph.id
)
ON CONFLICT (punto_hueco_id)
WHERE punto_hueco_id IS NOT NULL
DO NOTHING;


-- 3. INCORPORAR A LOS CREADORES COMO ADMINISTRADORES

INSERT INTO public.conversacion_participantes (
    conversacion_id,
    usuario_id,
    rol,
    activo
)
SELECT
    c.id,
    ph.usuario_id,
    'administrador',
    TRUE
FROM public.punto_hueco ph
JOIN public.conversaciones c
    ON c.punto_hueco_id = ph.id
ON CONFLICT (conversacion_id, usuario_id)
DO UPDATE SET
    activo = TRUE,
    rol = 'administrador';


-- 4. INCORPORAR A LOS PARTICIPANTES EXISTENTES

INSERT INTO public.conversacion_participantes (
    conversacion_id,
    usuario_id,
    rol,
    activo
)
SELECT
    c.id,
    hp.usuario_id,
    'miembro',
    TRUE
FROM public.hueco_participantes hp
JOIN public.conversaciones c
    ON c.punto_hueco_id = hp.hueco_id
ON CONFLICT (conversacion_id, usuario_id)
DO UPDATE SET
    activo = TRUE;


-- =====================================================
-- 5. TRIGGER: CREAR CHAT AL CREAR PUNTO HUECO
-- =====================================================

CREATE OR REPLACE FUNCTION public.crear_chat_punto_hueco()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_conversacion_id UUID;
BEGIN

    INSERT INTO public.conversaciones (
        tipo,
        titulo,
        usuario_a,
        usuario_b,
        creado_por,
        punto_hueco_id
    )
    VALUES (
        'grupo',
        LEFT('Punto Hueco: ' || NEW.titulo, 150),
        NULL,
        NULL,
        NEW.usuario_id,
        NEW.id
    )
    ON CONFLICT (punto_hueco_id)
    WHERE punto_hueco_id IS NOT NULL
    DO NOTHING;

    SELECT id
    INTO v_conversacion_id
    FROM public.conversaciones
    WHERE punto_hueco_id = NEW.id;

    -- Agregar al organizador como administrador.
    INSERT INTO public.conversacion_participantes (
        conversacion_id,
        usuario_id,
        rol,
        activo
    )
    VALUES (
        v_conversacion_id,
        NEW.usuario_id,
        'administrador',
        TRUE
    )
    ON CONFLICT (conversacion_id, usuario_id)
    DO UPDATE SET
        activo = TRUE,
        rol = 'administrador';

    RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS trigger_crear_chat_punto_hueco
ON public.punto_hueco;

CREATE TRIGGER trigger_crear_chat_punto_hueco
AFTER INSERT ON public.punto_hueco
FOR EACH ROW
EXECUTE FUNCTION public.crear_chat_punto_hueco();


-- =====================================================
-- 6. TRIGGER: AGREGAR PARTICIPANTE AL CHAT
-- =====================================================

CREATE OR REPLACE FUNCTION public.agregar_participante_chat_hueco()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_conversacion_id UUID;
BEGIN

    SELECT id
    INTO v_conversacion_id
    FROM public.conversaciones
    WHERE punto_hueco_id = NEW.hueco_id
      AND tipo = 'grupo';

    IF v_conversacion_id IS NULL THEN
        RAISE EXCEPTION 'CHAT_PUNTO_HUECO_NO_EXISTE';
    END IF;

    INSERT INTO public.conversacion_participantes (
        conversacion_id,
        usuario_id,
        rol,
        activo
    )
    VALUES (
        v_conversacion_id,
        NEW.usuario_id,
        'miembro',
        TRUE
    )
    ON CONFLICT (conversacion_id, usuario_id)
    DO UPDATE SET
        activo = TRUE;

    RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS trigger_agregar_participante_chat
ON public.hueco_participantes;

CREATE TRIGGER trigger_agregar_participante_chat
AFTER INSERT ON public.hueco_participantes
FOR EACH ROW
EXECUTE FUNCTION public.agregar_participante_chat_hueco();


-- =====================================================
-- 7. DESACTIVAR PARTICIPANTE SI ABANDONA EL ENCUENTRO
-- =====================================================

CREATE OR REPLACE FUNCTION public.quitar_participante_chat_hueco()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN

    UPDATE public.conversacion_participantes cp
    SET activo = FALSE
    FROM public.conversaciones c
    WHERE c.id = cp.conversacion_id
      AND c.punto_hueco_id = OLD.hueco_id
      AND cp.usuario_id = OLD.usuario_id
      AND cp.rol <> 'administrador';

    RETURN OLD;

END;
$$;


DROP TRIGGER IF EXISTS trigger_quitar_participante_chat
ON public.hueco_participantes;

CREATE TRIGGER trigger_quitar_participante_chat
AFTER DELETE ON public.hueco_participantes
FOR EACH ROW
EXECUTE FUNCTION public.quitar_participante_chat_hueco();


-- =====================================================
-- 8. PERMISOS DE FUNCIONES
-- =====================================================

REVOKE ALL ON FUNCTION public.crear_chat_punto_hueco()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.agregar_participante_chat_hueco()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.quitar_participante_chat_hueco()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.crear_chat_punto_hueco()
TO service_role;

GRANT EXECUTE ON FUNCTION public.agregar_participante_chat_hueco()
TO service_role;

GRANT EXECUTE ON FUNCTION public.quitar_participante_chat_hueco()
TO service_role;


-- =====================================================
-- FIN DE LA MIGRACION
-- =====================================================
