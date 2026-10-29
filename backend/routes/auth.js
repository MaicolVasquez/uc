const express = require('express');
const { supabase, nuevoClienteAuth } = require('../db');
 
const router = express.Router();
const txt = (v, max) => (v == null ? '' : String(v).trim().slice(0, max));
const h = fn => (req, res) => fn(req, res).catch(e => {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
});
 
router.post('/auth/register', h(async (req, res) => {
    const email = txt(req.body.email, 200).toLowerCase();
    const password = String(req.body.password || '');
    const nombre = txt(req.body.nombre, 100) || email.split('@')[0];
 
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Correo no válido.' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
 
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
        const yaExiste = /already|registered|exists/i.test(error.message);
        return res.status(yaExiste ? 409 : 400).json({ error: yaExiste ? 'Ya existe una cuenta con ese correo.' : error.message });
    }
 
    // upsert por si ya tienes un trigger que crea el perfil automáticamente
    const { error: e2 } = await supabase.from('perfiles').upsert({ id: data.user.id, nombre });
    if (e2) {
        await supabase.auth.admin.deleteUser(data.user.id);   // no dejar usuarios sin perfil
        throw e2;
    }
    res.status(201).json({ ok: true });
}));
 
router.post('/auth/login', h(async (req, res) => {
    const email = txt(req.body.email, 200).toLowerCase();
    const password = String(req.body.password || '');
 
    const { data, error } = await nuevoClienteAuth().auth.signInWithPassword({ email, password });
    if (error || !data.user) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
 
    req.session.regenerate(err => {
        if (err) return res.status(500).json({ error: 'No se pudo iniciar sesión.' });
        req.session.userId = data.user.id;
        req.session.email = data.user.email;
        res.json({ ok: true });
    });
}));
 
router.post('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});
 
router.get('/perfil', h(async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Sin sesión.' });
 
    const { data: perfil, error } = await supabase
        .from('perfiles').select('id, rol, nombre, creado_en').eq('id', req.session.userId).single();
    if (error || !perfil) {
        return req.session.destroy(() => res.status(401).json({ error: 'Sin sesión.' }));
    }
    res.json({
        user: { id: perfil.id, email: req.session.email, nombre: perfil.nombre, rol: perfil.rol, createdAt: perfil.creado_en }
    });
}));
 
module.exports = router;
 