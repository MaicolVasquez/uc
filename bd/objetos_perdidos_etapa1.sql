ALTER TABLE public.objetos_perdidos
ADD COLUMN IF NOT EXISTS estado_resolucion VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
    CHECK (estado_resolucion IN ('ACTIVO', 'RESUELTO')),
ADD COLUMN IF NOT EXISTS resuelto_en TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_objetos_perdidos_resolucion
ON public.objetos_perdidos(estado_resolucion, creado_en DESC);