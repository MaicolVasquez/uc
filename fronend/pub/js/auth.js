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

document.addEventListener('DOMContentLoaded', async () => {
    const user = await sessionReady;   // definido en layout.js
    if (user) {
        renderProfile(user);
    } else {
        showAuthTab('login');
        showView('forms');
    }
});
