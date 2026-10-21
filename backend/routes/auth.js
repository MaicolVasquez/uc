const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const store = require('../data/userStore');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nunca devolver el hash al cliente
const publicUser = (u) => ({ id: u.id, email: u.email, nombre: u.nombre, createdAt: u.createdAt });

// POST /api/auth/register
router.post('/auth/register', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const nombre = String(req.body.nombre || '').trim().slice(0, 60);

        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Correo electrónico inválido.' });
        if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
        if (store.findByEmail(email)) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Re-chequeo: otro registro igual pudo completarse mientras se calculaba el hash
        if (store.findByEmail(email)) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

        const user = store.add({
            id: crypto.randomUUID(),
            email,
            nombre,
            password: hash,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: 'Cuenta creada correctamente.', user: publicUser(user) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// GET /api/perfil  (protegido)
router.get('/perfil', authMiddleware, (req, res) => {
    const user = store.findById(req.session.userId);
    if (!user) {
        // La sesión apunta a un usuario que ya no existe
        return req.session.destroy(() => res.status(401).json({ error: 'Unauthorized: usuario no encontrado.' }));
    }
    res.json({ user: publicUser(user) });
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'No se pudo cerrar la sesión.' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada.' });
    });
});

module.exports = router;
