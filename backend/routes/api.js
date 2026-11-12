// API de datos (reemplaza localStorage). El servidor traduce entre los nombres
// que usa el frontend (title, desc, location...) y las columnas de Supabase.
const express = require('express');
const { supabase } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');
const router = express.Router();

// ---------- helpers ----------
const AUTO_APROBAR = process.env.AUTO_APROBAR !== 'false';
const estadoInicial = () => (AUTO_APROBAR ? 'aprobado' : 'pendiente');

const txt = (v, max = 500) => (v == null ? '' : String(v).trim().slice(0, max));
const digits = v => txt(v, 20).replace(/\D/g, '');
const httpUrl = v => { const s = txt(v, 1000); return /^https?:\/\//i.test(s) ? s : null; };
const telOk = t => /^\d{9}$/.test(t);
const bad = (res, msg) => res.status(400).json({ error: msg });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function esAdmin(userId) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', userId).single();
    return !!data && data.rol === 'admin';
}

// El admin borra cualquier fila; un usuario normal solo las suyas
const borrarPublicacion = tabla => h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    let q = supabase.from(tabla).delete().eq('id', req.params.id);
    if (!(await esAdmin(req.session.userId))) q = q.eq('usuario_id', req.session.userId);
    const { data, error } = await q.select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'No encontrado.' });
    res.json({ ok: true });
});

const h = fn => (req, res) => fn(req, res).catch(e => {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor.' });
});

async function rolDe(userId) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', userId).maybeSingle();
    return (data && data.rol) || 'estudiante';
}

// Admin y delegado pueden publicar anuncios
async function requirePublicador(req, res, next) {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Inicia sesión para continuar.' });
        }
        const rol = await rolDe(req.session.userId);
        if (!['admin', 'delegado'].includes(rol)) {
            return res.status(403).json({ error: 'No tienes permiso para publicar anuncios.' });
        }
        req.rol = rol;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error del servidor.' });
    }
}

// Recibe una imagen en base64, la sube a Storage y devuelve su URL pública
async function subirImagenAnuncio(dataUrl) {
    if (!dataUrl) return null;
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!m) throw new Error('IMG_FORMATO');
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 2 * 1024 * 1024) throw new Error('IMG_GRANDE');

    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const nombre = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const { error } = await supabase.storage.from('anuncios')
        .upload(nombre, buf, { contentType: `image/${m[1]}` });
    if (error) throw error;
    return supabase.storage.from('anuncios').getPublicUrl(nombre).data.publicUrl;
}

// ---------- mappers: fila de BD -> objeto que espera el frontend ----------
const mapLostFound = (r, uid) => ({
    id: r.id, title: r.titulo, category: r.categoria || '', campus: r.campus || '',
    location: r.lugar_exacto || '', datetime: r.fecha_hora, status: r.tipo,
    phone: r.telefono || '', img: r.url_foto || '', desc: r.descripcion || '',
    mine: !!uid && r.usuario_id === uid
});
const mapTutor = (r, uid) => ({
    id: r.id, name: r.nombre_completo, career: r.carrera || '', semester: r.semestre || '',
    faculty: r.campus || '', courses: (r.cursos || '').split(',').map(s => s.trim()).filter(Boolean),
    modality: r.modalidad || '', price: r.precio || '', phone: r.telefono || '', bio: r.bio || '',
    mine: !!uid && r.usuario_id === uid
});
const mapHueco = (r, uid, joinedByMe = false) => ({
    id: r.id, title: r.titulo, category: r.categoria || '', campus: r.campus || '',
    location: r.lugar_exacto || '', time: r.horario || '', capacity: r.aforo || 0,
    joined: r.unidos ?? 1, organizer: r.organizador || '', phone: r.telefono || '', desc: r.descripcion || '',
    mine: !!uid && r.usuario_id === uid,
    joinedByMe
});
const mapAnn = (r, nombres, uid) => ({
    id: r.id, title: r.titulo, category: r.categoria || '', urgency: r.urgencia || 'INFO',
    campus: r.campus_afectado || '', content: r.contenido || '',
    date: (r.creado_en || '').slice(0, 10),
    image: r.imagen_url || '',
    eventAt: r.fecha_evento || null,
    authorName: (nombres && nombres.get(r.admin_id)) || '',
    mine: !!uid && r.admin_id === uid
});
/* =====================================================
   BUSCADOR DE ESTUDIANTES
===================================================== */

router.get('/usuarios/buscar', requireAuth, h(async (req, res) => {

    // Limpiar y validar el término de búsqueda
    const termino = txt(req.query.q, 60)
        .replace(/[\\%_*]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Exigir al menos dos caracteres
    if (termino.length < 2) {
        return res.json({ usuarios: [] });
    }

    // Buscar usuarios registrados por nombre
    const { data, error } = await supabase
        .from('perfiles')
        .select('id, nombre, rol')
        .ilike('nombre', `%${termino}%`)
        .neq('id', req.session.userId)
        .neq('rol', 'admin')
        .order('nombre', { ascending: true })
        .limit(10);

    if (error) throw error;

    // Devolver únicamente información necesaria
    const usuarios = (data || []).map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre || 'Usuario UNSA',
        rol: usuario.rol || 'estudiante'
    }));

    res.json({ usuarios });

}));

/* =====================================================
   PERFIL: HISTORIAL DE ACTIVIDAD DEL USUARIO
===================================================== */

router.get('/perfil/actividad', requireAuth, h(async (req, res) => {

    const usuarioId = req.session.userId;

    // Consultar las publicaciones realizadas por el usuario
    const resultados = await Promise.all([

        supabase.from('objetos_perdidos')
            .select('id, titulo, tipo, categoria, lugar_exacto, creado_en, estado')
            .eq('usuario_id', usuarioId)
            .order('creado_en', { ascending: false }),

        supabase.from('tutores')
            .select('id, nombre_completo, carrera, cursos, creado_en, estado')
            .eq('usuario_id', usuarioId)
            .order('creado_en', { ascending: false }),

        supabase.from('punto_hueco')
            .select('id, titulo, categoria, lugar_exacto, horario, creado_en, estado')
            .eq('usuario_id', usuarioId)
            .order('creado_en', { ascending: false }),

        supabase.from('asesorias')
            .select('*')
            .eq('usuario_id', usuarioId),

        supabase.from('hueco_participantes')
            .select('hueco_id')
            .eq('usuario_id', usuarioId)

    ]);

    // Comprobar errores de las consultas
    for (const resultado of resultados) {
        if (resultado.error) throw resultado.error;
    }

    const [objetos, tutores, huecos, asesorias, participaciones] = resultados;

    // Consultar información de los grupos a los que se unió
    const idsHuecos = [
        ...new Set((participaciones.data || []).map(p => p.hueco_id))
    ];

    let huecosUnidos = [];

    if (idsHuecos.length > 0) {

        const { data, error } = await supabase
            .from('punto_hueco')
            .select('id, titulo, categoria, horario, lugar_exacto')
            .in('id', idsHuecos);

        if (error) throw error;

        huecosUnidos = data || [];
    }

    // Construir el historial sin exponer teléfonos ni datos privados
    const actividades = [];

    (objetos.data || []).forEach(r => {

        actividades.push({
            id: r.id,
            tipo: 'objeto',
            titulo: r.tipo === 'PERDIDO'
                ? 'Publicaste un objeto perdido'
                : 'Publicaste un objeto encontrado',
            descripcion: `${r.titulo} · ${r.categoria || 'Sin categoría'} · ${r.lugar_exacto || ''}`,
            fecha: r.creado_en,
            estado: r.estado
        });

    });

    (tutores.data || []).forEach(r => {

        actividades.push({
            id: r.id,
            tipo: 'tutoria',
            titulo: 'Publicaste un perfil de tutoría',
            descripcion: `${r.nombre_completo} · ${r.carrera || ''} · ${r.cursos || ''}`,
            fecha: r.creado_en,
            estado: r.estado
        });

    });

    (huecos.data || []).forEach(r => {

        actividades.push({
            id: r.id,
            tipo: 'hueco',
            titulo: 'Creaste un Punto Hueco',
            descripcion: `${r.titulo} · ${r.categoria || ''} · ${r.horario || ''}`,
            fecha: r.creado_en,
            estado: r.estado
        });

    });

    (asesorias.data || []).forEach(r => {

        actividades.push({
            id: r.id,
            tipo: 'asesoria',
            titulo: 'Solicitaste una asesoría',
            descripcion: r.curso_tema || 'Solicitud de asesoría académica',
            fecha: r.creado_en || null,
            estado: r.estado
        });

    });

    // Mostrar también los grupos a los que pertenece.
    // La tabla actual no proporciona un campo de fecha de unión.
    huecosUnidos.forEach(r => {

        actividades.push({
            id: r.id,
            tipo: 'participacion',
            titulo: 'Participas en un Punto Hueco',
            descripcion: `${r.titulo} · ${r.categoria || ''} · ${r.horario || ''}`,
            fecha: null,
            estado: 'participando'
        });

    });

    // Ordenar por fecha cuando existe una fecha registrada.
    actividades.sort((a, b) => {
        return new Date(b.fecha || 0) - new Date(a.fecha || 0);
    });

    // Resumen estadístico
    res.json({

        resumen: {
            publicaciones: (objetos.data || []).length +
                (tutores.data || []).length,

            huecosCreados: (huecos.data || []).length,

            huecosUnidos: (participaciones.data || []).length
        },

        actividades

    });

}));



// =====================================================
// OBJETOS PERDIDOS
// =====================================================
router.get('/lost-found', h(async (req, res) => {
    const { data, error } = await supabase.from('objetos_perdidos').select('*')
        .eq('estado', 'aprobado').order('creado_en', { ascending: false });
    if (error) throw error;
    res.json(data.map(r => mapLostFound(r, req.session.userId)));
}));

router.post('/lost-found', requireAuth, h(async (req, res) => {
    const b = req.body || {};
    const row = {
        usuario_id: req.session.userId,
        tipo: b.status,
        titulo: txt(b.title, 150),
        categoria: txt(b.category, 50),
        campus: txt(b.campus, 50),
        lugar_exacto: txt(b.location, 200),
        fecha_hora: b.datetime,
        telefono: digits(b.phone),
        url_foto: httpUrl(b.img),
        descripcion: txt(b.desc, 1000),
        estado: estadoInicial()
    };
    if (!['PERDIDO', 'ENCONTRADO'].includes(row.tipo)) return bad(res, 'Tipo de reporte no válido.');
    if (!row.titulo || !row.lugar_exacto) return bad(res, 'Faltan campos obligatorios.');
    if (!row.fecha_hora || isNaN(Date.parse(row.fecha_hora))) return bad(res, 'Fecha no válida.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { data, error } = await supabase.from('objetos_perdidos').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(mapLostFound(data, req.session.userId));
}));
router.put('/lost-found/:id', requireAuth, h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    const b = req.body || {};
    const row = {
        tipo: b.status,
        titulo: txt(b.title, 150),
        categoria: txt(b.category, 50),
        campus: txt(b.campus, 50),
        lugar_exacto: txt(b.location, 200),
        fecha_hora: b.datetime,
        telefono: digits(b.phone),
        url_foto: httpUrl(b.img),
        descripcion: txt(b.desc, 1000)
    };
    if (!['PERDIDO', 'ENCONTRADO'].includes(row.tipo)) return bad(res, 'Tipo de reporte no válido.');
    if (!row.titulo || !row.lugar_exacto) return bad(res, 'Faltan campos obligatorios.');
    if (!row.fecha_hora || isNaN(Date.parse(row.fecha_hora))) return bad(res, 'Fecha no válida.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { data, error } = await supabase.from('objetos_perdidos').update(row)
        .eq('id', req.params.id).eq('usuario_id', req.session.userId)   // solo el dueño
        .select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Publicación no encontrada.' });
    res.json(mapLostFound(data, req.session.userId));
}));
router.delete('/lost-found/:id', requireAuth, borrarPublicacion('objetos_perdidos'))

// =====================================================
// TUTORES
// =====================================================
router.get('/tutors', h(async (req, res) => {
    const { data, error } = await supabase.from('tutores').select('*')
        .eq('estado', 'aprobado').order('creado_en', { ascending: false });
    if (error) throw error;
    res.json(data.map(r => mapTutor(r, req.session.userId)));
}));

router.post('/tutors', requireAuth, h(async (req, res) => {
    const b = req.body || {};
    const cursos = Array.isArray(b.courses) ? b.courses.map(c => txt(c, 80)).filter(Boolean).join(', ') : txt(b.courses, 500);
    const row = {
        usuario_id: req.session.userId,
        nombre_completo: txt(b.name, 120),
        carrera: txt(b.career, 100),
        semestre: txt(b.semester, 50),
        campus: txt(b.faculty, 50),
        cursos,
        modalidad: txt(b.modality, 50),
        precio: txt(b.price, 80),
        telefono: digits(b.phone),
        bio: txt(b.bio, 1000) || 'Estudiante tutor dispuesto a ayudar en cursos clave.',
        estado: estadoInicial()
    };
    if (!row.nombre_completo || !row.carrera || !row.cursos) return bad(res, 'Faltan campos obligatorios.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { data, error } = await supabase.from('tutores').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(mapTutor(data, req.session.userId));
}));
router.put('/tutors/:id', requireAuth, h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    const b = req.body || {};
    const cursos = Array.isArray(b.courses) ? b.courses.map(c => txt(c, 80)).filter(Boolean).join(', ') : txt(b.courses, 500);
    const row = {
        nombre_completo: txt(b.name, 120), carrera: txt(b.career, 100),
        semestre: txt(b.semester, 50), campus: txt(b.faculty, 50), cursos,
        modalidad: txt(b.modality, 50), precio: txt(b.price, 80),
        telefono: digits(b.phone),
        bio: txt(b.bio, 1000) || 'Estudiante tutor dispuesto a ayudar en cursos clave.'
    };
    if (!row.nombre_completo || !row.carrera || !row.cursos) return bad(res, 'Faltan campos obligatorios.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { data, error } = await supabase.from('tutores').update(row)
        .eq('id', req.params.id).eq('usuario_id', req.session.userId)
        .select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Publicación no encontrada.' });
    res.json(mapTutor(data, req.session.userId));
}));
router.delete('/tutors/:id', requireAuth, borrarPublicacion('tutores'));


// Anuncios: el admin borra cualquiera; el delegado solo los suyos
router.delete('/announcements/:id', requirePublicador, h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    let q = supabase.from('notificaciones').delete().eq('id', req.params.id);
    if (req.rol !== 'admin') q = q.eq('admin_id', req.session.userId);
    const { data, error } = await q.select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Anuncio no encontrado.' });
    res.json({ ok: true });
}));

// =====================================================
// ASESORÍAS (solicitudes de alumnos que buscan tutor)
// =====================================================
router.post('/asesorias', requireAuth, h(async (req, res) => {
    const b = req.body || {};
    const row = {
        usuario_id: req.session.userId,
        curso_tema: txt(b.course, 150),
        nombre_facultad: txt(b.studentInfo, 150),
        telefono: digits(b.phone),
        detalles: txt(b.details, 1000),
        estado: estadoInicial()
    };
    if (!row.curso_tema || !row.nombre_facultad) return bad(res, 'Faltan campos obligatorios.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { error } = await supabase.from('asesorias').insert(row);
    if (error) throw error;
    res.status(201).json({ ok: true });
}));

// =====================================================
// PUNTO HUECO
// =====================================================
router.get('/huecos', h(async (req, res) => {
    const { data, error } = await supabase.from('punto_hueco').select('*')
        .eq('estado', 'aprobado').order('creado_en', { ascending: false });
    if (error) throw error;

    // Huecos a los que ya se unió este usuario
    let unidos = new Set();
    if (req.session.userId) {
        const { data: mios, error: e2 } = await supabase.from('hueco_participantes')
            .select('hueco_id').eq('usuario_id', req.session.userId);
        if (e2) throw e2;
        unidos = new Set(mios.map(m => m.hueco_id));
    }
    res.json(data.map(r => mapHueco(r, req.session.userId, unidos.has(r.id))));
}));

router.post('/huecos', requireAuth, h(async (req, res) => {
    const b = req.body || {};
    const aforo = Math.min(30, Math.max(2, parseInt(b.capacity, 10) || 6));
    const row = {
        usuario_id: req.session.userId,
        titulo: txt(b.title, 150),
        categoria: txt(b.category, 50),
        campus: txt(b.campus, 50),
        lugar_exacto: txt(b.location, 200),
        horario: txt(b.time, 80),
        aforo,
        organizador: txt(b.organizer, 120),
        telefono: digits(b.phone),
        descripcion: txt(b.desc, 1000) || 'Reunión libre de hora libre en el campus.',
        estado: estadoInicial()
    };
    if (!row.titulo || !row.lugar_exacto || !row.horario || !row.organizador) return bad(res, 'Faltan campos obligatorios.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    const { data, error } = await supabase.from('punto_hueco').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(mapHueco(data, req.session.userId));
}));
router.put('/huecos/:id', requireAuth, h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    const b = req.body || {};
    const row = {
        titulo: txt(b.title, 150), categoria: txt(b.category, 50), campus: txt(b.campus, 50),
        lugar_exacto: txt(b.location, 200), horario: txt(b.time, 80),
        aforo: Math.min(30, Math.max(2, parseInt(b.capacity, 10) || 6)),
        organizador: txt(b.organizer, 120), telefono: digits(b.phone),
        descripcion: txt(b.desc, 1000) || 'Reunión libre de hora libre en el campus.'
    };
    if (!row.titulo || !row.lugar_exacto || !row.horario || !row.organizador) return bad(res, 'Faltan campos obligatorios.');
    if (!telOk(row.telefono)) return bad(res, 'El teléfono debe tener 9 dígitos.');

    // No permitir un aforo menor que las personas ya unidas
    const { data: actual, error: e1 } = await supabase.from('punto_hueco').select('unidos')
        .eq('id', req.params.id).eq('usuario_id', req.session.userId).maybeSingle();
    if (e1) throw e1;
    if (!actual) return res.status(404).json({ error: 'Publicación no encontrada.' });
    if (row.aforo < actual.unidos) return bad(res, `Ya hay ${actual.unidos} personas unidas; el aforo no puede ser menor.`);

    const { data, error } = await supabase.from('punto_hueco').update(row)
        .eq('id', req.params.id).eq('usuario_id', req.session.userId)
        .select().maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Publicación no encontrada.' });
    res.json(mapHueco(data, req.session.userId));
}));
router.delete('/huecos/:id', requireAuth, borrarPublicacion('punto_hueco'));

// Unirse: una sola vez por usuario y sin pasarse del aforo (todo lo hace la función SQL)
router.post('/huecos/:id/join', requireAuth, h(async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return bad(res, 'ID no válido.');
    const userId = req.session.userId;

    const { data, error } = await supabase.rpc('unirse_punto_hueco', {
        p_id: req.params.id,
        p_usuario: userId
    });

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Ya te uniste a este Punto Hueco.' });
        if (error.code === '23503') return res.status(404).json({ error: 'El Punto Hueco no existe.' });
        if ((error.message || '').includes('AFORO_LLENO')) return res.status(409).json({ error: 'El aforo está lleno.' });
        throw error;
    }
    if (!data || data.length === 0) return res.status(409).json({ error: 'No se pudo unir al Punto Hueco.' });
    res.json(mapHueco(data[0], userId, true));
}));

/* =====================================================
   OBTENER CHAT GRUPAL DE PUNTO HUECO
===================================================== */

router.get('/huecos/:id/conversacion', requireAuth, h(async (req, res) => {

    const huecoId = req.params.id;
    const usuarioId = req.session.userId;

    if (!UUID_RE.test(huecoId)) {
        return bad(res, 'Identificador de Punto Hueco no válido.');
    }

    // Buscar la conversación vinculada al encuentro
    const { data: conversacion, error: e1 } = await supabase
        .from('conversaciones')
        .select('id, titulo, tipo')
        .eq('punto_hueco_id', huecoId)
        .eq('tipo', 'grupo')
        .maybeSingle();

    if (e1) throw e1;

    if (!conversacion) {
        return res.status(404).json({
            error: 'Este Punto Hueco todavía no tiene una conversación.'
        });
    }

    // Comprobar que el usuario pertenece al grupo
    const { data: participacion, error: e2 } = await supabase
        .from('conversacion_participantes')
        .select('usuario_id')
        .eq('conversacion_id', conversacion.id)
        .eq('usuario_id', usuarioId)
        .eq('activo', true)
        .maybeSingle();

    if (e2) throw e2;

    if (!participacion) {
        return res.status(403).json({
            error: 'Debes unirte al Punto Hueco para acceder a su chat.'
        });
    }

    res.json({

        conversacionId: conversacion.id,

        titulo: conversacion.titulo,

        tipo: conversacion.tipo

    });

}));

// Obtener participantes de un Punto Hueco (Para el modal del creador)

router.get('/huecos/:id/participantes', requireAuth, h(async (req, res) => {

    if (!UUID_RE.test(req.params.id)) {
        return bad(res, 'ID no válido.');
    }

    // Comprobar quién organizó el encuentro
    const { data: hueco, error: e1 } = await supabase
        .from('punto_hueco')
        .select('usuario_id')
        .eq('id', req.params.id)
        .maybeSingle();

    if (e1) throw e1;

    if (!hueco) {
        return res.status(404).json({
            error: 'Punto Hueco no encontrado.'
        });
    }

    const administrador = await esAdmin(req.session.userId);

    if (
        hueco.usuario_id !== req.session.userId &&
        !administrador
    ) {
        return res.status(403).json({
            error: 'Solo el organizador puede consultar los participantes.'
        });
    }

    const { data, error } = await supabase
        .from('hueco_participantes')
        .select(`
            usuario_id,
            perfiles ( nombre )
        `)
        .eq('hueco_id', req.params.id);

    if (error) throw error;

    const participantes = (data || []).map(p => ({
        id: p.usuario_id,
        nombre: p.perfiles?.nombre || 'Usuario UNSA',
        carrera: 'Estudiante UNSA'
    }));

    res.json(participantes);

}));


// =====================================================
// NOTIFICACIONES / AVISOS
// =====================================================
router.get('/announcements', h(async (req, res) => {
    const { data, error } = await supabase.from('notificaciones').select('*')
        .order('creado_en', { ascending: false });
    if (error) throw error;

    // Nombres de quienes publicaron
    const ids = [...new Set(data.map(r => r.admin_id).filter(Boolean))];
    let nombres = new Map();
    if (ids.length) {
        const { data: perfiles, error: e2 } = await supabase.from('perfiles')
            .select('id, nombre').in('id', ids);
        if (e2) throw e2;
        nombres = new Map(perfiles.map(p => [p.id, p.nombre]));
    }
    res.json(data.map(r => mapAnn(r, nombres, req.session.userId)));
}));

router.post('/announcements', requirePublicador, h(async (req, res) => {
    const b = req.body || {};
    const row = {
        admin_id: req.session.userId,
        titulo: txt(b.title, 150),
        categoria: txt(b.category, 50),
        urgencia: txt(b.urgency, 20),
        campus_afectado: txt(b.campus, 80),
        contenido: txt(b.content, 2000),
        fecha_evento: null,
        imagen_url: null
    };
    if (!row.titulo || !row.contenido) return bad(res, 'Faltan campos obligatorios.');
    if (!['URGENTE', 'INFO', 'EVENTO'].includes(row.urgencia)) return bad(res, 'Urgencia no válida.');
    if (!['Huelgas', 'Feriados', 'Biblioteca', 'Tramites'].includes(row.categoria)) return bad(res, 'Categoría no válida.');

    if (b.eventAt) {
        if (isNaN(Date.parse(b.eventAt))) return bad(res, 'Fecha del evento no válida.');
        row.fecha_evento = new Date(b.eventAt).toISOString();
    }

    try {
        row.imagen_url = await subirImagenAnuncio(b.image);
    } catch (e) {
        if (e.message === 'IMG_FORMATO') return bad(res, 'La imagen debe ser JPG, PNG o WebP.');
        if (e.message === 'IMG_GRANDE') return bad(res, 'La imagen supera los 2 MB.');
        throw e;
    }

    const { data, error } = await supabase.from('notificaciones').insert(row).select().single();
    if (error) throw error;

    const { data: perfil } = await supabase.from('perfiles').select('nombre')
        .eq('id', req.session.userId).maybeSingle();
    const nombres = new Map([[req.session.userId, perfil && perfil.nombre]]);
    res.status(201).json(mapAnn(data, nombres, req.session.userId));
}));

// =====================================================
// MODERACIÓN (solo admin) — útil si AUTO_APROBAR=false
// =====================================================
const TABLAS_MODERABLES = ['tutores', 'punto_hueco', 'objetos_perdidos', 'asesorias'];

router.get('/admin/pendientes/:tabla', requireAdmin, h(async (req, res) => {
    if (!TABLAS_MODERABLES.includes(req.params.tabla)) return bad(res, 'Tabla no válida.');
    const { data, error } = await supabase.from(req.params.tabla).select('*').eq('estado', 'pendiente');
    if (error) throw error;
    res.json(data);
}));

router.patch('/admin/:tabla/:id/estado', requireAdmin, h(async (req, res) => {
    const { tabla, id } = req.params;
    const { estado } = req.body || {};
    if (!TABLAS_MODERABLES.includes(tabla)) return bad(res, 'Tabla no válida.');
    if (!['aprobado', 'rechazado', 'pendiente'].includes(estado)) return bad(res, 'Estado no válido.');
    const { error } = await supabase.from(tabla).update({ estado }).eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
}));


/* =====================================================
   MENSAJERIA PRIVADA
===================================================== */

// Comprobar que el usuario pertenece al chat
async function verificarParticipante(conversacionId, usuarioId) {

    const { data, error } = await supabase
        .from('conversacion_participantes')
        .select('conversacion_id, usuario_id, rol, ultimo_leido_en')
        .eq('conversacion_id', conversacionId)
        .eq('usuario_id', usuarioId)
        .eq('activo', true)
        .maybeSingle();

    if (error) throw error;

    return data;
}

/* =====================================================
   CREAR O RECUPERAR CONVERSACION PRIVADA
===================================================== */

router.post('/conversaciones/directas', requireAuth, h(async (req, res) => {

    const solicitanteId = req.session.userId;

    const destinatarioId = txt(
        req.body?.destinatarioId,
        36
    );

    if (!UUID_RE.test(destinatarioId)) {
        return bad(res, 'Identificador de estudiante no válido.');
    }

    if (solicitanteId === destinatarioId) {
        return bad(res, 'No puedes iniciar una conversación contigo mismo.');
    }

    // Crear o recuperar una conversación existente.
    // La función SQL garantiza que no se duplique la pareja.
    const { data, error } = await supabase.rpc(
        'obtener_o_crear_chat_directo',
        {
            p_solicitante: solicitanteId,
            p_destinatario: destinatarioId
        }
    );

    if (error) {

        if ((error.message || '').includes('USUARIO_NO_EXISTE')) {
            return res.status(404).json({
                error: 'El estudiante seleccionado no existe.'
            });
        }

        if ((error.message || '').includes('NO_PUEDES_CONVERSAR')) {
            return bad(res, 'No puedes conversar contigo mismo.');
        }

        throw error;
    }

    res.status(200).json({
        ok: true,
        conversacionId: data,
        mensaje: 'Conversación disponible.'
    });

}));

/* =====================================================
   LISTAR CONVERSACIONES DEL USUARIO
===================================================== */

router.get('/conversaciones', requireAuth, h(async (req, res) => {

    const usuarioId = req.session.userId;

    // Buscar las conversaciones donde participa el usuario
    const { data: propias, error: e1 } = await supabase
        .from('conversacion_participantes')
        .select('conversacion_id, rol, ultimo_leido_en')
        .eq('usuario_id', usuarioId)
        .eq('activo', true);

    if (e1) throw e1;

    if (!propias || propias.length === 0) {
        return res.json({ conversaciones: [] });
    }

    const ids = propias.map(p => p.conversacion_id);

    // Consultar las conversaciones
    const { data: conversaciones, error: e2 } = await supabase
        .from('conversaciones')
        .select('id, tipo, titulo, creado_en, actualizado_en')
        .in('id', ids)
        .order('actualizado_en', { ascending: false });

    if (e2) throw e2;

    // Consultar participantes de esas conversaciones
    const { data: participantes, error: e3 } = await supabase
        .from('conversacion_participantes')
        .select('conversacion_id, usuario_id, rol')
        .in('conversacion_id', ids)
        .eq('activo', true);

    if (e3) throw e3;

    // Consultar nombres de los participantes
    const usuarioIds = [
        ...new Set((participantes || []).map(p => p.usuario_id))
    ];

    const { data: perfiles, error: e4 } = await supabase
        .from('perfiles')
        .select('id, nombre, rol')
        .in('id', usuarioIds);

    if (e4) throw e4;

    const perfilMap = new Map(
        (perfiles || []).map(p => [p.id, p])
    );

    const propiaMap = new Map(
        propias.map(p => [p.conversacion_id, p])
    );

    const resultado = conversaciones.map(conv => {

        const miembros = participantes
            .filter(p => p.conversacion_id === conv.id)
            .map(p => {

                const perfil = perfilMap.get(p.usuario_id);

                return {
                    id: p.usuario_id,
                    nombre: perfil?.nombre || 'Usuario UNSA',
                    rol: perfil?.rol || 'estudiante',
                    esMiCuenta: p.usuario_id === usuarioId,
                    rolEnChat: p.rol
                };

            });

        const otroUsuario = miembros.find(
            p => p.id !== usuarioId
        );

        const miParticipacion = propiaMap.get(conv.id);

        return {

            id: conv.id,

            tipo: conv.tipo,

            titulo: conv.tipo === 'directa'
                ? otroUsuario?.nombre || 'Conversación privada'
                : conv.titulo || 'Grupo de estudiantes',

            actualizadoEn: conv.actualizado_en,

            ultimoLeidoEn: miParticipacion?.ultimo_leido_en || null,

            participantes: miembros

        };

    });

    res.json({
        conversaciones: resultado
    });

}));

/* =====================================================
   OBTENER MENSAJES DE UNA CONVERSACION
===================================================== */

router.get('/conversaciones/:id/mensajes', requireAuth, h(async (req, res) => {

    const conversacionId = req.params.id;
    const usuarioId = req.session.userId;

    if (!UUID_RE.test(conversacionId)) {
        return bad(res, 'Identificador de conversación no válido.');
    }

    // Comprobar participación
    const participacion = await verificarParticipante(
        conversacionId,
        usuarioId
    );

    if (!participacion) {
        return res.status(403).json({
            error: 'No tienes acceso a esta conversación.'
        });
    }

    // Paginación
    const limite = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit, 10) || 30)
    );

    let consulta = supabase
        .from('mensajes')
        .select('id, remitente_id, contenido, creado_en, editado_en, eliminado_en')
        .eq('conversacion_id', conversacionId)
        .order('creado_en', { ascending: false })
        .limit(limite);

    // Permitir cargar mensajes anteriores
    if (req.query.before) {

        const fecha = new Date(req.query.before);

        if (Number.isNaN(fecha.getTime())) {
            return bad(res, 'Fecha de paginación no válida.');
        }

        consulta = consulta.lt(
            'creado_en',
            fecha.toISOString()
        );

    }

    const { data, error } = await consulta;

    if (error) throw error;

    // Registrar última lectura
    const { error: e2 } = await supabase
        .from('conversacion_participantes')
        .update({
            ultimo_leido_en: new Date().toISOString()
        })
        .eq('conversacion_id', conversacionId)
        .eq('usuario_id', usuarioId)
        .eq('activo', true);

    if (e2) throw e2;

    // Entregar mensajes en orden cronológico
    const mensajes = (data || [])
        .reverse()
        .map(m => ({

            id: m.id,

            remitenteId: m.remitente_id,

            contenido: m.eliminado_en
                ? 'Mensaje eliminado'
                : m.contenido,

            creadoEn: m.creado_en,

            editado: !!m.editado_en,

            eliminado: !!m.eliminado_en,

            esMio: m.remitente_id === usuarioId

        }));

    res.json({
        mensajes
    });

}));

/* =====================================================
   ENVIAR MENSAJE
===================================================== */

router.post('/conversaciones/:id/mensajes', requireAuth, h(async (req, res) => {

    const conversacionId = req.params.id;
    const usuarioId = req.session.userId;

    if (!UUID_RE.test(conversacionId)) {
        return bad(res, 'Identificador de conversación no válido.');
    }

    const contenido = String(req.body?.contenido || '').trim();

    if (!contenido) {
        return bad(res, 'El mensaje no puede estar vacío.');
    }

    if (contenido.length > 2000) {
        return bad(res, 'El mensaje no puede superar los 2000 caracteres.');
    }

    // Verificar que el remitente pertenece al chat
    const participacion = await verificarParticipante(
        conversacionId,
        usuarioId
    );

    if (!participacion) {
        return res.status(403).json({
            error: 'No puedes enviar mensajes a esta conversación.'
        });
    }

    // Insertar mensaje
    const { data, error } = await supabase
        .from('mensajes')
        .insert({

            conversacion_id: conversacionId,

            remitente_id: usuarioId,

            contenido

        })
        .select('id, remitente_id, contenido, creado_en')
        .single();

    if (error) throw error;

    res.status(201).json({

        ok: true,

        mensaje: {

            id: data.id,

            remitenteId: data.remitente_id,

            contenido: data.contenido,

            creadoEn: data.creado_en,

            esMio: true

        }

    });

}));

module.exports = router;
