ALTER TABLE public.objetos_perdidos
ADD COLUMN IF NOT EXISTS expira_en TIMESTAMPTZ;

-- Dar 60 días desde la creación a los reportes existentes.
UPDATE public.objetos_perdidos
SET expira_en = creado_en + INTERVAL '60 days'
WHERE expira_en IS NULL;

-- Las publicaciones nuevas reciben su vencimiento automáticamente.
ALTER TABLE public.objetos_perdidos
ALTER COLUMN expira_en SET DEFAULT (NOW() + INTERVAL '60 days'),
ALTER COLUMN expira_en SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_objetos_perdidos_expira
ON public.objetos_perdidos(expira_en);