CREATE INDEX IF NOT EXISTS idx_objetos_perdidos_matching
ON public.objetos_perdidos(tipo, estado, estado_resolucion, campus, categoria, creado_en DESC);