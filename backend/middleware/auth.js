const { supabase } = require('../db');

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Debes iniciar sesión para hacer esto.' });
    next();
}

async function requireAdmin(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Debes iniciar sesión.' });
    const { data, error } = await supabase.from('perfiles').select('rol').eq('id', req.session.userId).single();
    if (error || !data || data.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores.' });
    next();
}

module.exports = { requireAuth, requireAdmin };
