require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

if (!process.env.SESSION_SECRET) throw new Error('Falta SESSION_SECRET');

const app = express();
app.set('trust proxy', 1);                    // Vercel está detrás de un proxy
app.use(express.json({ limit: '3mb' }));      // anuncios con imagen
app.use(cookieSession({
    name: 'sid',
    keys: [process.env.SESSION_SECRET],
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 2
}));

app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Página de inicio pública
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, '..', 'fronend', 'home.html')
    );
});

// Solo local; en Vercel los estáticos los sirve su CDN
app.use(express.static(path.join(__dirname, '..', 'fronend')));

module.exports = app;