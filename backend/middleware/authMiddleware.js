// Protege rutas: si no hay sesión activa, corta el flujo con 401.
function authMiddleware(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: inicia sesión para continuar.' });
    }
    next();
}

module.exports = authMiddleware;
