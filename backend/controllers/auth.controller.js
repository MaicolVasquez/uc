const bcrypt = require('bcryptjs');

// Nota: Reemplazar este arreglo simulado con la estructura/modelo 
// const { users } = require('../models/user.model');
const users = [];

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validar que se envíen los datos
        if (!email || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
        }

        // 2. Buscar al usuario
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Comparar la contraseña con el hash usando bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Creación de la sesión 
        req.session.userId = user.id;
        req.session.email = user.email;

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: { email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

module.exports = { login };