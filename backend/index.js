const express = require('express')
const app = express();

app.use(express.json());

// Base de datos en memoria
const usuarios = [];

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mensaje: 'Por favor, proporciona email y contraseña.' });
        }

        const usuarioExistente = usuarios.find(u => u.email === email);
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: usuarios.length + 1,
            email: email,
            password: passwordHash
        };

        usuarios.push(nuevoUsuario);

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al registrar el usuario.' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});