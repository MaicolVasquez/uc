// Módulo: Estudiante a Estudiante (Tutorías)

const TUTOR_DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

// ---------- Estado ----------
let tutorEditingId = null;
let catalog = [];                            // cursos tutorables (vienen de /api/catalogo)
let tutorNiveles = {};                       // { codigo: nivel } del formulario del tutor
const picks = { prio: [], sec: [] };         // búsqueda del estudiante
const PICK_MAX = { prio: 3, sec: 5 };
const LEVEL_TXT = { 1: 'Especialista', 2: 'Intermedio', 3: 'Bases' };

const CAREERS_BY_AREA = {
    'Biomédicas': [
        'Agronomía', 'Biología', 'Ciencias de la Nutrición', 'Enfermería', 'Ingeniería Pesquera', 'Medicina Humana'
    ],
    'Ingenierías': [
        'Arquitectura', 'Ciencia de la Computación', 'Física', 'Ingeniería Ambiental', 'Ingeniería Civil',
        'Ingeniería de Industrias Alimentarias', 'Ingeniería de Materiales', 'Ingeniería de Minas',
        'Ingeniería de Sistemas', 'Ingeniería de Telecomunicaciones', 'Ingeniería Eléctrica',
        'Ingeniería Electrónica', 'Ingeniería Geofísica', 'Ingeniería Geológica', 'Ingeniería Industrial',
        'Ingeniería Mecánica', 'Ingeniería Mecatrónica', 'Ingeniería Metalúrgica', 'Ingeniería Química',
        'Ingeniería Sanitaria', 'Matemáticas', 'Química'
    ],
    'Sociales': [
        'Administración', 'Antropología', 'Artes', 'Banca y Seguros', 'Ciencias de la Comunicación',
        'Contabilidad', 'Derecho', 'Economía', 'Educación', 'Filosofía', 'Finanzas', 'Historia',
        'Literatura y Lingüística', 'Marketing', 'Psicología', 'Relaciones Industriales', 'Sociología',
        'Trabajo Social', 'Turismo y Hotelería'
    ]
};

// ---------- Utilidades ----------
function val(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Falta el campo "${id}" en tutorias.html`);
    return el.value;
}

const nameOf = code => (catalog.find(c => c.codigo === code) || {}).nombre || code;
const optionValue = c => `${c.codigo} · ${c.nombre}` + (c.alias.length ? ` (${c.alias.join(', ')})` : '');

const chip = (label, onclick) =>
    `<span class="bg-amber-50 text-unsa-maroon text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
        ${escapeHtml(label)} <button type="button" onclick="${onclick}" class="ml-1">&times;</button></span>`;

// ---------- Catálogo ----------
async function loadCatalog() {
    try {
        catalog = await apiFetch('/api/catalogo');
        document.getElementById('courseList').innerHTML =
            catalog.map(c => `<option value="${escapeHtml(optionValue(c))}"></option>`).join('');
    } catch (err) {
        handleApiError(err);
    }
}

function findCourse(text) {
    const t = String(text).trim().toLowerCase();
    if (!t) return undefined;
    const code = (t.match(/\d{7}/) || [])[0];
    const exact = catalog.find(c => c.codigo === code || c.nombre.toLowerCase() === t ||
        c.alias.some(a => a.toLowerCase() === t));
    if (exact) return exact;
    const parcial = catalog.filter(c => c.nombre.toLowerCase().includes(t));
    return parcial.length === 1 ? parcial[0] : undefined;
}

// ---------- Formulario del tutor: cursos y niveles ----------
function addTutorCourse() {
    const input = document.getElementById('tutorCoursePick');
    const c = findCourse(input.value);
    if (!c) return openNotificationToast('Elige un curso de la lista.');
    tutorNiveles[c.codigo] = Number(document.getElementById('tutorLevelPick').value);
    input.value = '';
    renderTutorCourses();
}

function removeTutorCourse(code) {
    delete tutorNiveles[code];
    renderTutorCourses();
}

function renderTutorCourses() {
    const box = document.getElementById('tutorCoursesChosen');
    if (!box) return;
    box.innerHTML = Object.entries(tutorNiveles)
        .map(([code, n]) => chip(`${nameOf(code)} · ${LEVEL_TXT[n]}`, `removeTutorCourse('${code}')`))
        .join('');
}

// Llena el select de carreras según el área elegida
function fillCareers(area, selected = '') {
    const select = document.getElementById('tutorCareer');
    if (!select) return;
    const careers = [...(CAREERS_BY_AREA[area] || [])];

    // Si un tutor antiguo tiene una carrera escrita a mano que no está en la lista, la conservamos
    if (selected && !careers.includes(selected)) careers.push(selected);

    select.innerHTML = '<option value="" disabled selected>Selecciona tu carrera</option>' +
        careers.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

    if (selected) select.value = selected;
}

// ---------- Búsqueda del estudiante ----------
function addPick(kind, input) {
    const c = findCourse(input.value);
    input.value = '';
    if (!c) return;
    const other = kind === 'prio' ? 'sec' : 'prio';
    if (picks[kind].includes(c.codigo) || picks[other].includes(c.codigo)) return;
    if (picks[kind].length >= PICK_MAX[kind]) return openNotificationToast(`Máximo ${PICK_MAX[kind]} temas.`);
    picks[kind].push(c.codigo);
    renderPicks();
}

function removePick(kind, code) {
    picks[kind] = picks[kind].filter(x => x !== code);
    renderPicks();
}

function renderPicks() {
    for (const kind of ['prio', 'sec']) {
        const box = document.getElementById(kind + 'Chips');
        if (box) box.innerHTML = picks[kind].map(code => chip(nameOf(code), `removePick('${kind}','${code}')`)).join('');
    }
}

async function runRecommendation() {
    if (!picks.prio.length) return openNotificationToast('Elige al menos un tema prioritario.');
    try {
        const items = await apiFetch('/api/tutors/recomendar',
            { method: 'POST', body: { prioritarios: picks.prio, secundarios: picks.sec } });
        renderReco(items);
    } catch (err) {
        handleApiError(err);
    }
}

function renderReco(items) {
    const box = document.getElementById('recoResults');
    if (!box) return;
    if (!items.length) {
        box.innerHTML = `<p class="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">Ningún tutor cubre tus temas prioritarios todavía. Puedes enviar una solicitud de asesoría.</p>`;
        return;
    }
    box.innerHTML = items.map((r, i) => `
        <div class="border border-slate-200 rounded-xl p-4">
            <div class="flex justify-between items-start gap-3">
                <div>
                    <p class="text-[11px] font-bold text-slate-400">#${i + 1}</p>
                    <h3 class="font-bold text-slate-900">${escapeHtml(r.tutor.name)}</h3>
                    <p class="text-xs text-unsa-maroon font-semibold">${escapeHtml(r.tutor.career)} (${escapeHtml(r.tutor.semester)})</p>
                </div>
                <div class="text-2xl font-extrabold text-unsa-maroon">${Number(r.puntaje).toFixed(1)}</div>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-emerald-500" style="width:${Math.min(100, r.puntaje)}%"></div>
            </div>
            <p class="text-xs text-slate-600 mt-2">${escapeHtml(r.explicacion)}</p>
            <a href="https://wa.me/51${onlyDigits(r.tutor.phone)}?text=Hola%20${encodeURIComponent(r.tutor.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria"
               target="_blank" rel="noopener"
               class="inline-flex items-center gap-2 mt-3 text-xs font-bold text-emerald-700">
                <i class="fa-brands fa-whatsapp"></i> Contactar
            </a>
        </div>`).join('');
}

// ---------- Listado de tutores ----------
async function loadTutors() {
    try {
        await sessionReady;
        tutorsData = await apiFetch('/api/tutors');
        filterTutors();
    } catch (err) {
        handleApiError(err);
    }
}

function renderTutors(items = tutorsData) {
    const grid = document.getElementById('tutorsGrid');

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-graduation-cap text-4xl mb-2"></i>
                <p class="font-bold text-sm">Aún no hay tutores registrados.</p>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(tut => {
        const niveles = Object.entries(tut.niveles || {});
        const etiquetas = niveles.length
            ? niveles.map(([code, n]) => `${nameOf(code)} · ${LEVEL_TXT[n] || ''}`)
            : (tut.courses || []);
        const coursesBadges = etiquetas.map(c =>
            `<span class="bg-amber-50 text-unsa-maroon font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(c)}</span>`
        ).join(' ');

        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-start gap-3">
                        <img src="${TUTOR_DEFAULT_AVATAR}" alt="${escapeHtml(tut.name)}" class="w-14 h-14 rounded-full object-cover ring-2 ring-unsa-gold">
                        <div class="flex-1">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="font-bold text-slate-900 text-base">${escapeHtml(tut.name)}</h3>
                                <div class="flex gap-1">${editBtn('editTutor', tut)}${deleteBtn('tutors', tut, 'loadTutors')}</div>
                            </div>
                            <p class="text-xs font-semibold text-unsa-maroon">${escapeHtml(tut.career)} (${escapeHtml(tut.semester)})</p>
                            <p class="text-[11px] text-slate-500"><i class="fa-solid fa-graduation-cap"></i> Área de ${escapeHtml(tut.faculty)}</p>
                        </div>
                    </div>

                    <div class="mt-4">
                        <p class="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Cursos ofertados:</p>
                        <div class="flex flex-wrap gap-1">${coursesBadges}</div>
                    </div>

                    <p class="text-xs text-slate-600 mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "${escapeHtml(tut.bio)}"
                    </p>

                    <div class="mt-3 text-xs space-y-1 text-slate-600">
                        <p><span class="font-bold">Modalidad:</span> ${escapeHtml(tut.modality)}</p>
                        <p><span class="font-bold">Precio/Condición:</span> <span class="text-emerald-700 font-extrabold">${escapeHtml(tut.price)}</span></p>
                    </div>
                </div>

                <a href="https://wa.me/51${onlyDigits(tut.phone)}?text=Hola%20${encodeURIComponent(tut.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria"
                   target="_blank" rel="noopener"
                   class="w-full mt-4 bg-unsa-maroon hover:bg-unsa-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> Solicitar Asesoría por WhatsApp
                </a>
            </div>`;
    }).join('');
}

function filterTutors() {
    const query = document.getElementById('tutorSearch').value.toLowerCase();
    const faculty = document.getElementById('tutorFacultyFilter').value;
    const modality = document.getElementById('tutorModalityFilter').value;

    const filtered = tutorsData.filter(tut => {
        const matchesQuery = tut.name.toLowerCase().includes(query) ||
            (tut.courses || []).some(c => c.toLowerCase().includes(query)) ||
            tut.career.toLowerCase().includes(query);
        const matchesFaculty = faculty === 'ALL' || tut.faculty === faculty;
        const matchesModality = modality === 'ALL' || tut.modality.includes(modality);
        return matchesQuery && matchesFaculty && matchesModality;
    });

    renderTutors(filtered);
}

// ---------- Guardar y editar tutor ----------
async function handleSaveTutor(e) {
    e.preventDefault();

    if (!Object.keys(tutorNiveles).length) {
        return openNotificationToast('Añade al menos un curso con su nivel (pulsa "Añadir").');
    }

    const editingId = tutorEditingId;
    try {
        const payload = {
            name: val('tutorName'),
            career: val('tutorCareer'),
            semester: val('tutorSemester'),
            faculty: val('tutorFaculty'),
            niveles: tutorNiveles,
            modality: val('tutorModality'),
            price: val('tutorPrice'),
            phone: val('tutorPhone'),
            bio: val('tutorBio')
        };

        if (editingId) {
            await apiFetch(`/api/tutors/${encodeURIComponent(editingId)}`, { method: 'PUT', body: payload });
        } else {
            await apiFetch('/api/tutors', { method: 'POST', body: payload });
        }
        await loadTutors();
        closeModal('tutorRegisterModal');
        openNotificationToast(editingId ? 'Publicación actualizada.' : '¡Te has registrado exitosamente como Tutor Agustino!');
    } catch (err) {
        handleApiError(err);
    }
}

function editTutor(id) {
    const t = tutorsData.find(x => x.id === id);
    if (!t) return;
    tutorEditingId = id;
    document.getElementById('tutorName').value = t.name;
    document.getElementById('tutorFaculty').value = t.faculty;
    fillCareers(t.faculty, t.career);
    document.getElementById('tutorSemester').value = t.semester;
    tutorNiveles = { ...(t.niveles || {}) };
    renderTutorCourses();
    document.getElementById('tutorModality').value = t.modality;
    document.getElementById('tutorPrice').value = t.price;
    document.getElementById('tutorPhone').value = t.phone;
    document.getElementById('tutorBio').value = t.bio;
    openModal('tutorRegisterModal');
}

// ---------- Solicitud de asesoría ----------
async function handleSaveTutorRequest(e) {
    e.preventDefault();
    const payload = {
        course: document.getElementById('reqCourse').value,
        studentInfo: document.getElementById('reqStudentInfo').value,
        phone: document.getElementById('reqPhone').value,
        details: document.getElementById('reqDetails').value
    };

    try {
        await apiFetch('/api/asesorias', { method: 'POST', body: payload });
        closeModal('tutorRequestModal');
        e.target.reset();
        openNotificationToast('Tu solicitud de asesoría fue enviada al tablón estudiantil.');
    } catch (err) {
        handleApiError(err);
    }
}

// ---------- Arranque ----------
document.addEventListener('modalclosed', e => {
    if (e.detail === 'tutorRegisterModal') {
        tutorEditingId = null;
        tutorNiveles = {};
        renderTutorCourses();
        document.getElementById('tutorRegisterForm').reset();
        // reset() vuelve el área a la primera opción pero no dispara "change", así que rellenamos a mano
        fillCareers(document.getElementById('tutorFaculty').value);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const facultySelect = document.getElementById('tutorFaculty');
    if (facultySelect) fillCareers(facultySelect.value);

    await loadCatalog();   // primero el catálogo, para que las tarjetas muestren los nombres de los cursos
    loadTutors();
});