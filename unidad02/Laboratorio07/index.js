require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
const usuarios = [];
const PORT = process.env.PORT || 3000;

console.log(`Entorno configurado. Puerto: ${PORT}`);

app.use(express.json());

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
app.post('/api/auth/register', registrarUsuario);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});