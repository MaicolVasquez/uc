ALTER TABLE public.objetos_perdidos
ALTER COLUMN telefono DROP NOT NULL;

ALTER TABLE public.objetos_perdidos
ADD COLUMN IF NOT EXISTS mostrar_whatsapp BOOLEAN NOT NULL DEFAULT FALSE;

-- Mantener habilitado WhatsApp en publicaciones antiguas que ya tenían un número de 9 dígitos
UPDATE public.objetos_perdidos
SET mostrar_whatsapp = TRUE
WHERE telefono IS NOT NULL
  AND length(trim(telefono)) = 9;