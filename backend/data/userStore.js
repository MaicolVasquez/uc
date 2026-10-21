// "Base de datos" de usuarios: un arreglo en memoria que se respalda en data/users.json.
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'users.json');

function load() {
    try {
        const parsed = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];   // archivo inexistente o vacío
    }
}

const users = load();   // arreglo en memoria

function persist() {
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2), 'utf-8');
}

module.exports = {
    findByEmail: (email) => users.find(u => u.email === email),
    findById: (id) => users.find(u => u.id === id),
    add(user) {
        users.push(user);
        persist();
        return user;
    }
};
