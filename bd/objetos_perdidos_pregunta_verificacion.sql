ALTER TABLE public.objetos_perdidos
ADD COLUMN IF NOT EXISTS pregunta_verificacion VARCHAR(200);

CREATE TABLE IF NOT EXISTS public.reclamos_objetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objeto_id UUID NOT NULL REFERENCES public.objetos_perdidos(id) ON DELETE CASCADE,
    solicitante_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    respuesta VARCHAR(300) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (objeto_id, solicitante_id)
);

ALTER TABLE public.reclamos_objetos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reclamos_solo_service_role" ON public.reclamos_objetos;
CREATE POLICY "reclamos_solo_service_role"
    ON public.reclamos_objetos
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');