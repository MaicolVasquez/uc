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
        renderProfile(user);
    } else {
        showAuthTab('login');
        showView('forms');
    }
});
