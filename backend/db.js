// Cliente único de Supabase (solo backend: usa la service_role key, JAMÁS al navegador)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el archivo .env');
    process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, opts);

// Cliente descartable para signInWithPassword: así la sesión del usuario
// no "contamina" el cliente principal (que debe seguir siendo service_role).
const nuevoClienteAuth = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, opts);

module.exports = { supabase, nuevoClienteAuth };
