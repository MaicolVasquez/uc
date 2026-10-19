require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
// IMPORTAndo EXPRESS-SESSION
const session = require('express-session');

const app = express();
const usuarios = [];
const PORT = process.env.PORT || 3000;

console.log(`Entorno configurado. Puerto: ${PORT}`);

app.use(express.json());

// CONFIGURACIÓN DE LA SESIÓN
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));

async function registrarUsuario(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Por favor, proporciona email y contraseña.' });
        }

        const usuarioExistente = usuarios.find((usuario) => usuario.email === email);
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: usuarios.length + 1,
            email,
            password: passwordHash,
        };

        usuarios.push(nuevoUsuario);

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
            },
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar el usuario.' });
    }
}

function authMiddleware(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ mensaje: 'No autorizado. Debes iniciar sesión.' });
}
// Ruta de Registro
app.post('/api/auth/register', registrarUsuario);

app.get('/api/perfil', authMiddleware, (req, res) => {
    const usuario = usuarios.find((u) => u.id === req.session.userId);

    if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    res.json({
        mensaje: 'Perfil del usuario autenticado',
        usuario: {
            id: usuario.id,
            email: usuario.email,
        },
    });
});

// RUTA DE INICIO DE SESIÓN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Por favor, proporciona email y contraseña.' });
        }

        // Buscar al usuario por correo
        const user = usuarios.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Verificar la contraseña con el hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Establecer la sesión del usuario asignando su ID
        req.session.userId = user.id;

        res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al cerrar sesión'
            });
        }

        res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(200).json({
            mensaje: 'Sesión cerrada exitosamente'
        });
    });
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
