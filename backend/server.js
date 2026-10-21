require('dotenv').config();   // carga PORT y SESSION_SECRET desde .env

const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 3000;
if (!process.env.SESSION_SECRET) {
    console.error('Falta SESSION_SECRET en el archivo .env');
    process.exit(1);
}

const app = express();

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,                 // pon true si usas HTTPS en producción
        maxAge: 1000 * 60 * 60 * 2     // 2 horas
    }
}));

// API
app.use('/api', authRoutes);

// Frontend servido por el mismo Express (mismo origen => la cookie de sesión funciona)
app.use(express.static(path.join(__dirname, '..', 'fronend')));

app.listen(PORT, () => {
    console.log(`UNSA Conecta en http://localhost:${PORT}`);
});
