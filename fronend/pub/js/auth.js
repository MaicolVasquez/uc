// Módulo: Cuenta (registro, login, perfil y logout contra el backend Express)

const ACTIVE_TAB = ['border-b-2', 'border-unsa-gold', 'text-unsa-maroon'];

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* sin cuerpo */ }
    if (!res.ok) throw new Error(data.error || 'Error inesperado (' + res.status + ')');
    return data;
}

function showAuthError(msg) {
    const box = document.getElementById('authError');
    box.textContent = msg;
    box.classList.toggle('hidden', !msg);
}

function showAuthTab(tab) {
    showAuthError('');
    const isLogin = tab === 'login';
    document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
    document.getElementById('registerForm').classList.toggle('hidden', isLogin);
    const tl = document.getElementById('tabLogin');
    const tr = document.getElementById('tabRegister');
    (isLogin ? tl : tr).classList.add(...ACTIVE_TAB);
    (isLogin ? tr : tl).classList.remove(...ACTIVE_TAB);
}

function showView(view) {
    document.getElementById('authLoading').classList.toggle('hidden', view !== 'loading');
    document.getElementById('authForms').classList.toggle('hidden', view !== 'forms');
    document.getElementById('profileCard').classList.toggle('hidden', view !== 'profile');
}


function renderProfile(user) {

    const email = user.email || '';
    const name = (user.nombre || email.split('@')[0] || 'Estudiante').trim();

    // Inicial del usuario
    document.getElementById('profileInitial').textContent =
        name.charAt(0).toUpperCase() || 'U';

    // Información personal
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;

    // Rol de usuario
    const roles = {
        estudiante: 'Estudiante',
        docente: 'Docente',
        admin: 'Administrador'
    };

    const role = String(user.rol || '').toLowerCase();

    document.getElementById('profileRole').textContent =
        roles[role] || 'Miembro UNSA';

    // Identificador
    document.getElementById('profileId').textContent =
        user.id ? user.id.slice(0, 8) + '…' : '—';

    // Fecha de registro
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;

    const formattedDate = createdAt && !Number.isNaN(createdAt.getTime())
        ? createdAt.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
        : 'No disponible';

    document.getElementById('profileDate').textContent = formattedDate;

    // Los indicadores se conectarán con la base de datos
    document.getElementById('profilePostsCount').textContent = '—';
    document.getElementById('profileHuecosCreatedCount').textContent = '—';
    document.getElementById('profileHuecosJoinedCount').textContent = '—';

    showView('profile');
    loadProfileActivity();
}

/* =====================================================
   BUSCADOR DE ESTUDIANTES
===================================================== */

let studentSearchTimer = null;
let studentSearchController = null;

// Guardamos temporalmente al estudiante seleccionado.
// En la etapa 5 utilizaremos esta información para abrir el chat.
window.selectedStudentForChat = null;


// Buscar estudiantes en el backend
async function buscarEstudiantes(termino) {

    const results = document.getElementById('studentSearchResults');
    const status = document.getElementById('studentSearchStatus');

    if (!results || !status) return;

    // Cancelar la búsqueda anterior si todavía está ejecutándose
    if (studentSearchController) {
        studentSearchController.abort();
    }

    studentSearchController = new AbortController();

    results.replaceChildren();
    status.textContent = 'Buscando estudiantes...';

    try {

        const response = await fetch(
            `/api/usuarios/buscar?q=${encodeURIComponent(termino)}`,
            {
                credentials: 'same-origin',
                signal: studentSearchController.signal
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al buscar estudiantes.');
        }

        const usuarios = data.usuarios || [];

        if (usuarios.length === 0) {

            status.textContent = 'No encontramos estudiantes con ese nombre.';

            return;
        }

        status.textContent =
            `${usuarios.length} estudiante(s) encontrado(s).`;

        usuarios.forEach(usuario => {

            // Contenedor del resultado
            const card = document.createElement('div');

            card.className =
                'flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-unsa-gold hover:bg-slate-50 transition-colors';

            // Avatar
            const avatar = document.createElement('div');

            avatar.className =
                'w-10 h-10 shrink-0 rounded-full bg-red-100 text-unsa-maroon flex items-center justify-center font-bold';

            avatar.textContent =
                usuario.nombre.charAt(0).toUpperCase();

            // Información
            const info = document.createElement('div');

            info.className = 'flex-1 min-w-0';

            const name = document.createElement('p');

            name.className =
                'text-sm font-bold text-slate-800 truncate';

            name.textContent = usuario.nombre;

            const role = document.createElement('p');

            role.className = 'text-xs text-slate-400';

            const roles = {
                estudiante: 'Estudiante UNSA',
                docente: 'Docente UNSA'
            };

            role.textContent =
                roles[String(usuario.rol).toLowerCase()] || 'Miembro UNSA';

            info.appendChild(name);
            info.appendChild(role);

            // Botón de selección
            const button = document.createElement('button');

            button.type = 'button';

            button.className =
                'text-xs font-bold text-unsa-maroon hover:underline shrink-0';

            button.textContent = 'Seleccionar';

            button.addEventListener('click', () => {
                seleccionarEstudiante(usuario);
            });

            card.appendChild(avatar);
            card.appendChild(info);
            card.appendChild(button);

            results.appendChild(card);

        });

    } catch (error) {

        if (error.name === 'AbortError') return;

        console.error('Error en el buscador:', error);

        status.textContent =
            'No se pudo realizar la búsqueda. Inténtalo nuevamente.';

    }

}


// Seleccionar al estudiante encontrado
function seleccionarEstudiante(usuario) {

    window.selectedStudentForChat = {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
    };

    const notice = document.getElementById('selectedStudentNotice');
    const name = document.getElementById('selectedStudentName');

    name.textContent = usuario.nombre;

    notice.classList.remove('hidden');

    openNotificationToast(
        `${usuario.nombre} fue seleccionado correctamente.`
    );

}


// Activar el buscador
function inicializarBuscadorEstudiantes() {

    const input = document.getElementById('chatSearch');

    if (!input) return;

    input.disabled = false;

    input.addEventListener('input', () => {

        clearTimeout(studentSearchTimer);

        const termino = input.value.trim();

        const results = document.getElementById('studentSearchResults');
        const status = document.getElementById('studentSearchStatus');

        // Cancelar búsquedas anteriores
        if (studentSearchController) {
            studentSearchController.abort();
        }

        results.replaceChildren();

        if (termino.length < 2) {

            status.textContent =
                'Escribe al menos 2 caracteres para buscar.';

            return;
        }

        status.textContent = 'Preparando búsqueda...';

        // Esperar brevemente para no consultar por cada tecla
        studentSearchTimer = setTimeout(() => {
            buscarEstudiantes(termino);
        }, 350);

    });

}


async function handleRegister(e) {
    e.preventDefault();
    showAuthError('');
    const nombre = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (password !== password2) return showAuthError('Las contraseñas no coinciden.');

    try {
        await apiPost('/api/auth/register', { nombre, email, password });
        // Tras registrarse, iniciamos sesión automáticamente
        await apiPost('/api/auth/login', { email, password });
        await refreshHeaderUser();
        const res = await fetch('/api/perfil', { credentials: 'same-origin' });
        renderProfile((await res.json()).user);
        openNotificationToast('¡Cuenta creada! Bienvenido a UNSA Conecta.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (err) {
        showAuthError(err.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showAuthError('');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
        await apiPost('/api/auth/login', { email, password });
        await refreshHeaderUser();
        const res = await fetch('/api/perfil', { credentials: 'same-origin' });
        renderProfile((await res.json()).user);
        openNotificationToast('Sesión iniciada correctamente.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (err) {
        showAuthError(err.message);
    }
}

async function handleLogout() {
    try {
        await apiPost('/api/auth/logout');
    } catch (err) {
        return openNotificationToast(err.message);
    }
    await refreshHeaderUser();
    document.getElementById('loginForm').reset();
    showAuthTab('login');
    showView('forms');
    openNotificationToast('Sesión cerrada.');
}

// ==========================================
// PERFIL: CARGAR ACTIVIDAD REAL
// ==========================================

async function loadProfileActivity() {

    const timeline = document.getElementById('activityTimeline');
    const emptyState = document.getElementById('activityEmptyState');

    if (!timeline || !emptyState) return;

    const posts = document.getElementById('profilePostsCount');
    const created = document.getElementById('profileHuecosCreatedCount');
    const joined = document.getElementById('profileHuecosJoinedCount');

    timeline.replaceChildren();
    timeline.classList.add('hidden');

    emptyState.classList.remove('hidden');

    try {

        const response = await fetch('/api/perfil/actividad', {
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudo cargar la actividad.');
        }

        // Actualizar estadísticas
        posts.textContent = data.resumen.publicaciones;
        created.textContent = data.resumen.huecosCreados;
        joined.textContent = data.resumen.huecosUnidos;

        const actividades = data.actividades || [];

        if (actividades.length === 0) {
            return;
        }

        emptyState.classList.add('hidden');
        timeline.classList.remove('hidden');

        actividades.forEach(actividad => {

            const article = document.createElement('article');
            article.className = 'p-5 flex gap-4';

            const iconos = {
                objeto: 'fa-box-open',
                tutoria: 'fa-graduation-cap',
                hueco: 'fa-mug-hot',
                asesoria: 'fa-book-open',
                participacion: 'fa-people-group'
            };

            const colores = {
                objeto: 'bg-red-50 text-unsa-maroon',
                tutoria: 'bg-blue-50 text-blue-600',
                hueco: 'bg-amber-50 text-amber-600',
                asesoria: 'bg-indigo-50 text-indigo-600',
                participacion: 'bg-emerald-50 text-emerald-600'
            };

            const iconContainer = document.createElement('div');
            iconContainer.className =
                `w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${colores[actividad.tipo] || 'bg-slate-100 text-slate-500'}`;

            const icon = document.createElement('i');
            icon.className = `fa-solid ${iconos[actividad.tipo] || 'fa-circle-info'}`;

            iconContainer.appendChild(icon);

            const content = document.createElement('div');
            content.className = 'flex-1 min-w-0';

            const title = document.createElement('h3');
            title.className = 'text-sm font-bold text-slate-800';
            title.textContent = actividad.titulo;

            const description = document.createElement('p');
            description.className = 'text-xs text-slate-500 mt-1 break-words';
            description.textContent = actividad.descripcion;

            const footer = document.createElement('div');
            footer.className = 'flex flex-wrap items-center gap-2 mt-3';

            const statusLabels = {
                aprobado: 'Aprobado',
                pendiente: 'Pendiente de aprobación',
                rechazado: 'Rechazado',
                participando: 'Participando'
            };

            const estado = document.createElement('span');
            estado.className =
                'text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600';

            estado.textContent =
                statusLabels[actividad.estado] || 'Registrado';

            footer.appendChild(estado);

            const date = document.createElement('span');
            date.className = 'text-[10px] text-slate-400';

            if (actividad.fecha) {

                const parsedDate = new Date(actividad.fecha);

                date.textContent = Number.isNaN(parsedDate.getTime())
                    ? 'Fecha no disponible'
                    : parsedDate.toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    });

            } else {

                date.textContent = 'Sin fecha de unión registrada';

            }

            footer.appendChild(date);

            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(footer);

            article.appendChild(iconContainer);
            article.appendChild(content);

            timeline.appendChild(article);

        });

    } catch (error) {

        console.error('Error cargando actividad:', error);

        timeline.classList.add('hidden');
        emptyState.classList.remove('hidden');

        emptyState.textContent =
            'No se pudo cargar tu actividad. Comprueba tu conexión e inténtalo nuevamente.';

    }

}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await sessionReady;   // definido en layout.js
    if (user) {
        inicializarBuscadorEstudiantes();
        renderProfile(user);
    } else {
        showAuthTab('login');
        showView('forms');
    }
});
