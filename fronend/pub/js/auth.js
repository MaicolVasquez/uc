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

/* =====================================================
   ESTADO DEL SISTEMA DE MENSAJERIA
===================================================== */

let activeConversationId = null;

let activeConversationTitle = '';

let chatPollingTimer = null;

let lastMessagesSignature = '';

let lastConversationRefresh = 0;

async function chatRequest(url, options = {}) {

    const response = await fetch(url, {

        credentials: 'same-origin',

        ...options,

        headers: {
            ...(options.body ? {
                'Content-Type': 'application/json'
            } : {}),
            ...(options.headers || {})
        }

    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.error || 'No se pudo completar la operación.'
        );

    }

    return data;

}

/* =====================================================
   LISTAR CONVERSACIONES
===================================================== */

async function cargarConversaciones() {

    const container = document.getElementById('conversationList');

    if (!container) return;

    try {

        const data = await chatRequest('/api/conversaciones');

        const conversaciones = data.conversaciones || [];

        container.replaceChildren();

        if (conversaciones.length === 0) {

            const empty = document.createElement('div');

            empty.className = 'text-center py-10';

            empty.innerHTML = `
                <i class="fa-regular fa-message text-2xl text-slate-300"></i>
                <p class="text-sm font-bold text-slate-600 mt-3">
                    Todavía no tienes conversaciones
                </p>
                <p class="text-xs text-slate-400 mt-1">
                    Busca estudiantes para comenzar a conversar.
                </p>
            `;

            container.appendChild(empty);

            return;

        }

        conversaciones.forEach(conv => {

            const button = document.createElement('button');

            button.type = 'button';

            button.className =
                'w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-amber-300 transition-colors';

            if (conv.id === activeConversationId) {

                button.classList.add('bg-red-50', 'border-red-200');

            }

            const avatar = document.createElement('div');

            avatar.className =
                'w-10 h-10 shrink-0 rounded-full bg-red-100 text-unsa-maroon flex items-center justify-center font-bold';

            avatar.textContent =
                (conv.titulo || 'U').charAt(0).toUpperCase();

            const info = document.createElement('div');

            info.className = 'flex-1 min-w-0';

            const title = document.createElement('p');

            title.className =
                'text-sm font-bold text-slate-700 truncate';

            title.textContent = conv.titulo || 'Conversación';

            const subtitle = document.createElement('p');

            subtitle.className = 'text-xs text-slate-400 mt-1';

            subtitle.textContent =
                conv.tipo === 'grupo'
                    ? 'Grupo de Punto Hueco'
                    : 'Conversación privada';

            info.appendChild(title);
            info.appendChild(subtitle);

            button.appendChild(avatar);
            button.appendChild(info);

            button.addEventListener('click', () => {

                abrirChat(
                    conv.id,
                    conv.titulo,
                    conv.tipo
                );

            });

            container.appendChild(button);

        });

        lastConversationRefresh = Date.now();
        return conversaciones;

    } catch (error) {

        console.error('Error cargando conversaciones:', error);

        container.textContent =
            'No se pudieron cargar las conversaciones.';
            return [];

    }

}

/* =====================================================
   CREAR O ABRIR CHAT PRIVADO
===================================================== */

async function abrirConversacionDirecta(usuarioId, nombre) {

    try {

        const data = await chatRequest(
            '/api/conversaciones/directas',
            {
                method: 'POST',

                body: JSON.stringify({
                    destinatarioId: usuarioId
                })
            }
        );

        await cargarConversaciones();

        await abrirChat(
            data.conversacionId,
            nombre,
            'directa'
        );

    } catch (error) {

        console.error(error);

        const status = document.getElementById('studentSearchStatus');

        if (status) {
            status.textContent = error.message;
        }

    }

}

/* =====================================================
   CARGAR MENSAJES
===================================================== */

async function cargarMensajes(conversacionId, forceRender = false) {

    const container = document.getElementById('chatMessages');

    const status = document.getElementById('chatStatus');

    const data = await chatRequest(
        `/api/conversaciones/${conversacionId}/mensajes?limit=50`
    );

    // Evitar mostrar mensajes de otra conversación
    if (conversacionId !== activeConversationId) return;

    const mensajes = data.mensajes || [];

    const signature = JSON.stringify(
        mensajes.map(m => [m.id, m.contenido, m.editado, m.eliminado])
    );

    if (!forceRender && signature === lastMessagesSignature) {
        return;
    }

    const cercaDelFinal =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight < 120;

    lastMessagesSignature = signature;

    container.replaceChildren();

    if (mensajes.length === 0) {

        const empty = document.createElement('p');

        empty.className =
            'text-center text-xs text-slate-400 py-12';

        empty.textContent =
            'Todavía no hay mensajes. ¡Saluda y comienza a conversar!';

        container.appendChild(empty);

    }

    mensajes.forEach(mensaje => {

        const row = document.createElement('div');

        row.className = `flex ${
            mensaje.esMio
                ? 'justify-end'
                : 'justify-start'
        }`;

        const bubble = document.createElement('div');

        bubble.className = `
            max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3
            ${
                mensaje.esMio
                    ? 'bg-unsa-maroon text-white rounded-br-sm'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
            }
        `;

        const content = document.createElement('p');

        content.className = 'text-sm whitespace-pre-wrap break-words';

        content.textContent = mensaje.contenido;

        const time = document.createElement('p');

        time.className = `
            text-[10px] mt-2 text-right
            ${
                mensaje.esMio
                    ? 'text-white/70'
                    : 'text-slate-400'
            }
        `;

        const date = new Date(mensaje.creadoEn);

        time.textContent = Number.isNaN(date.getTime())
            ? ''
            : date.toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
            });

        if (mensaje.editado) {
            time.textContent += ' · editado';
        }

        bubble.appendChild(content);
        bubble.appendChild(time);

        row.appendChild(bubble);

        container.appendChild(row);

    });

    if (cercaDelFinal || forceRender) {

        container.scrollTop = container.scrollHeight;

    }

    status.textContent = 'Mensajes actualizados.';

}

/* =====================================================
   ABRIR VENTANA DE CHAT
===================================================== */

async function abrirChat(conversacionId, titulo, tipo = 'directa') {

    // Detener la actualización de la conversación anterior
    if (chatPollingTimer) {
        clearInterval(chatPollingTimer);
        chatPollingTimer = null;
    }

    activeConversationId = conversacionId;

    activeConversationTitle = titulo || 'Conversación';

    lastMessagesSignature = '';

    // Cambiar de perfil a chat
    document.getElementById('profileOverview')
        .classList.add('hidden');

    document.getElementById('chatPanel')
        .classList.remove('hidden');

    document.getElementById('chatTitle').textContent =
        activeConversationTitle;

    document.getElementById('chatAvatar').textContent =
        activeConversationTitle.charAt(0).toUpperCase();

    document.getElementById('chatSubtitle').textContent =
        tipo === 'grupo'
            ? 'Grupo de estudiantes'
            : 'Conversación privada';

    document.getElementById('chatStatus').textContent =
        'Cargando mensajes...';

    try {

        await cargarMensajes(conversacionId, true);

        // Actualización automática cada 4 segundos
        chatPollingTimer = setInterval(async () => {

            if (!activeConversationId) return;

            try {

                await cargarMensajes(activeConversationId);

                if (Date.now() - lastConversationRefresh > 15000) {

                    await cargarConversaciones();

                }

            } catch (error) {

                console.error('Error actualizando chat:', error);

            }

        }, 4000);

    } catch (error) {

        console.error(error);

        document.getElementById('chatStatus').textContent =
            'No se pudieron recuperar los mensajes.';

    }

}

/* =====================================================
   ENVIAR MENSAJES
===================================================== */

async function enviarMensaje(event) {

    event.preventDefault();

    if (!activeConversationId) return;

    const input = document.getElementById('chatMessageInput');

    const button = document.getElementById('chatSendButton');

    const contenido = input.value.trim();

    if (!contenido) return;

    if (contenido.length > 2000) return;

    button.disabled = true;

    button.textContent = 'Enviando...';

    try {

        const conversacionId = activeConversationId;

        const data = await chatRequest(
            `/api/conversaciones/${conversacionId}/mensajes`,
            {
                method: 'POST',

                body: JSON.stringify({
                    contenido
                })
            }
        );

        if (activeConversationId !== conversacionId) return;

        input.value = '';

        // Mostrar inmediatamente el mensaje guardado
        await cargarMensajes(conversacionId, true);

        await cargarConversaciones();

    } catch (error) {

        console.error(error);

        document.getElementById('chatStatus').textContent =
            error.message || 'No se pudo enviar el mensaje.';

    } finally {

        button.disabled = false;

        button.innerHTML =
            '<i class="fa-solid fa-paper-plane mr-1"></i> Enviar';

    }

}

/* =====================================================
   VOLVER AL PERFIL
===================================================== */

function cerrarChat() {

    if (chatPollingTimer) {

        clearInterval(chatPollingTimer);

        chatPollingTimer = null;

    }

    activeConversationId = null;

    lastMessagesSignature = '';

    document.getElementById('chatPanel')
        .classList.add('hidden');

    document.getElementById('profileOverview')
        .classList.remove('hidden');

    cargarConversaciones();
    const url = new URL(window.location.href);

url.searchParams.delete('chat');

window.history.replaceState({}, '', url);

}

/* =====================================================
   INICIALIZAR MENSAJERIA
===================================================== */


/* =====================================================
   INICIALIZAR MENSAJERIA Y ABRIR GRUPO DESDE PUNTO HUECO
===================================================== */

async function inicializarMensajeria() {

    const form = document.getElementById('chatForm');

    const backButton = document.getElementById('backToProfile');

    if (!form || !backButton) return;

    if (form.dataset.initialized === 'true') return;

    form.dataset.initialized = 'true';

    form.addEventListener('submit', enviarMensaje);

    backButton.addEventListener('click', cerrarChat);

    // Cargar todas las conversaciones del estudiante.
    const conversaciones = await cargarConversaciones();

    // Comprobar si venimos desde una tarjeta de Punto Hueco.
    const params = new URLSearchParams(window.location.search);

    const chatId = params.get('chat');

    if (!chatId) return;

    // Buscar el grupo entre las conversaciones autorizadas.
    const conversacion = conversaciones.find(
        c => c.id === chatId
    );

    if (!conversacion) {

        openNotificationToast(
            'No tienes acceso a esa conversación.'
        );

        return;

    }

    await abrirChat(
        conversacion.id,
        conversacion.titulo,
        conversacion.tipo
    );

}



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

async function seleccionarEstudiante(usuario) {

    window.selectedStudentForChat = {

        id: usuario.id,

        nombre: usuario.nombre,

        rol: usuario.rol

    };

    const notice = document.getElementById('selectedStudentNotice');

    const name = document.getElementById('selectedStudentName');

    name.textContent = usuario.nombre;

    notice.classList.remove('hidden');

    // Abrir el chat privado
    await abrirConversacionDirecta(
        usuario.id,
        usuario.nombre
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

    renderProfile(user);

    inicializarBuscadorEstudiantes();

    inicializarMensajeria();

    } else {
        showAuthTab('login');
        showView('forms');
    }
});
