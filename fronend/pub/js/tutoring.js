// Módulo: Estudiante a Estudiante (Tutorías)

const TUTOR_DEFAULT_AVATAR = '/pub/img/avatar.svg';

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

    if (!picks.prio.length) {

        return openNotificationToast(
            'Elige al menos un tema prioritario.'
        );
    }

    const button = document.getElementById('tutorRecoBtn');
    const box = document.getElementById('recoResults');

    if (button.disabled) return;

    const originalText = button.innerHTML;

    button.disabled = true;

    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Buscando tutores...
    `;

    box.innerHTML = `
        <p class="tutor-loading">
            Analizando los cursos y niveles de especialización...
        </p>
    `;

    try {

        const items = await apiFetch(
            '/api/tutors/recomendar',
            {
                method: 'POST',
                body: {
                    prioritarios: [...picks.prio],
                    secundarios: [...picks.sec]
                }
            }
        );

        renderReco(items);

    } catch (err) {

        box.textContent =
            'No se pudieron obtener las recomendaciones.';

        handleApiError(err);

    } finally {

        button.disabled = false;
        button.innerHTML = originalText;

    }
}

function renderReco(items) {

    const box = document.getElementById('recoResults');

    if (!box) return;

    if (!items.length) {

        box.innerHTML = `
            <div class="tutor-empty">

                <div class="tutor-empty-icon">
                    <i class="fa-solid fa-user-magnifying-glass"></i>
                </div>

                <h3>No encontramos tutores compatibles</h3>

                <p>
                    Puedes seleccionar otros cursos o
                    publicar una solicitud de asesoría.
                </p>

                <button type="button"
                    onclick="openModal('tutorRequestModal')"
                    class="uc-secondary">

                    Solicitar asesoría

                </button>

            </div>`;

        return;
    }

    box.innerHTML = `
        <div class="tutor-reco-summary">

            <h3>Tutores recomendados</h3>

            <p>
                ${items.length} resultados ordenados
                por puntaje de compatibilidad.
            </p>

        </div>

        ${items.map((r, i) => {

            const score = Math.max(
                0,
                Math.min(100, Number(r.puntaje) || 0)
            );

            return `

                <div class="tutor-reco-result
                    ${i === 0 ? 'tutor-reco-first' : ''}">

                    <div class="flex justify-between items-start gap-3">

                        <div>

                            <span class="tutor-rank">

                                ${i === 0
                                    ? 'Mejor coincidencia'
                                    : 'Posición ' + (i + 1)}

                            </span>

                            <h3 class="font-extrabold text-slate-900 mt-2">

                                ${escapeHtml(r.tutor.name)}

                            </h3>

                            <p class="text-xs text-unsa-maroon font-semibold">

                                ${escapeHtml(r.tutor.career)}
                                (${escapeHtml(r.tutor.semester)})

                            </p>

                        </div>

                        <div class="tutor-score">

                            <strong>${score.toFixed(1)}</strong>
                            <small>de 100 puntos</small>

                        </div>

                    </div>

                    <div class="tutor-score-track">

                        <span style="width:${score}%"></span>

                    </div>

                    <p class="tutor-explanation">

                        ${escapeHtml(r.explicacion)}

                    </p>

                    <a href="https://wa.me/51${onlyDigits(r.tutor.phone)}?text=Hola%20${encodeURIComponent(r.tutor.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria"
                        target="_blank"
                        rel="noopener"
                        class="uc-secondary">

                        <i class="fa-brands fa-whatsapp"></i>
                        Contactar tutor

                    </a>

                </div>

            `;

        }).join('')}
    `;
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

    const counter = document.getElementById(
        'tutorResultsCount'
    );

    if (counter) {
        counter.textContent = items.length === 1
            ? '1 tutor encontrado'
            : `${items.length} tutores encontrados`;
    }

    if (items.length === 0) {

    grid.innerHTML = `
        <div class="tutor-empty">

            <div class="tutor-empty-icon">
                <i class="fa-solid fa-graduation-cap"></i>
            </div>

            <h3>No encontramos tutores</h3>

            <p>
                Prueba con otros filtros o publica
                una solicitud de asesoría.
            </p>

            <button type="button"
                onclick="openModal('tutorRequestModal')"
                class="uc-primary">

                Solicitar asesoría

            </button>

        </div>`;

    return;
}

    grid.innerHTML = items.map(tut => {
        const niveles = Object.entries(tut.niveles || {});
        const etiquetas = niveles.length
            ? niveles.map(([code, n]) => `${nameOf(code)} · ${LEVEL_TXT[n] || ''}`)
            : (tut.courses || []);
        const coursesBadges = etiquetas.map(c =>
            `<span class="tutor-course-chip">${escapeHtml(c)}</span>`
        ).join(' ');

        return `
            <div class="tutor-card">
                <div>
                    <div class="flex items-start gap-3">
                        <img src="${TUTOR_DEFAULT_AVATAR}" alt="${escapeHtml(tut.name)}" class="tutor-avatar">
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

                    <p class="tutor-bio">
                        "${escapeHtml(tut.bio)}"
                    </p>

                    <div class="mt-3 text-xs space-y-1 text-slate-600">
                        <p><span class="font-bold">Modalidad:</span> ${escapeHtml(tut.modality)}</p>
                        <p><span class="font-bold">Precio/Condición:</span> <span class="text-emerald-700 font-extrabold">${escapeHtml(tut.price)}</span></p>
                    </div>
                </div>

                <a href="https://wa.me/51${onlyDigits(tut.phone)}?text=Hola%20${encodeURIComponent(tut.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria"
                   target="_blank" rel="noopener"
                   class="uc-primary w-full mt-4">
                    <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> Solicitar Asesoría por WhatsApp
                </a>
            </div>`;
    }).join('');
}

function normalizeTutorText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function filterTutors() {

    const query = normalizeTutorText(
        document.getElementById('tutorSearch').value
    );

    const faculty = document.getElementById(
        'tutorFacultyFilter'
    ).value;

    const modality = document.getElementById(
        'tutorModalityFilter'
    ).value;

    const filtered = tutorsData.filter(tut => {

        const courses = Array.isArray(tut.courses)
            ? tut.courses
            : [tut.courses];

        const courseNames = Object.keys(tut.niveles || {})
            .map(code => nameOf(code));

        const searchable = [
            tut.name,
            tut.career,
            tut.faculty,
            tut.modality,
            ...courses,
            ...courseNames
        ];

        const matchesQuery = searchable.some(value =>
            normalizeTutorText(value).includes(query)
        );

        const matchesFaculty =
            faculty === 'ALL' || tut.faculty === faculty;

        const matchesModality =
            modality === 'ALL' ||
            String(tut.modality ?? '').includes(modality);

        return matchesQuery &&
            matchesFaculty &&
            matchesModality;
    });

    renderTutors(filtered);
}

function resetTutorFilters() {

    document.getElementById('tutorSearch').value = '';

    document.getElementById(
        'tutorFacultyFilter'
    ).value = 'ALL';

    document.getElementById(
        'tutorModalityFilter'
    ).value = 'ALL';

    filterTutors();
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