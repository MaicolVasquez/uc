const quickLinks = [
    ['fa-box-open', 'Objetos perdidos', 'index.html'],
    ['fa-graduation-cap', 'Alumno a alumno', 'tutorias.html'],
    ['fa-mug-hot', 'Punto Hueco', 'punto-hueco.html'],
    ['fa-map-location-dot', 'Mapa UNSA', 'mapa.html'],
    ['fa-bullhorn', 'Avisos', 'notificaciones.html'],
    ['fa-comments', 'Mensajes', 'cuenta.html?mensajes=1'],
    ['fa-user', 'Mi perfil', 'cuenta.html']
];

// Normalizar texto para las búsquedas
function normalizeText(text) {
    return String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Mostrar accesos rápidos
function renderQuickLinks() {

    const query = normalizeText(
        new URLSearchParams(location.search).get('q')
    );

    const selected = quickLinks.filter(item =>
        normalizeText(item[1]).includes(query)
    );

    document.getElementById('quick-links').innerHTML =
        selected.map(([icon, title, href]) => `
            <a href="${href}">
                <span class="uc-ico">
                    <i class="fa-solid ${icon}"></i>
                </span>
                ${title} →
            </a>
        `).join('');

    document.getElementById('search-empty')
        .classList.toggle('hidden', selected.length > 0);

    if (query) {
        document.getElementById('publicar')
            .scrollIntoView();
    }
}

// Cargar información del dashboard
async function loadDashboard() {

    const user = await sessionReady;

    if (!user) {
        if (window.sessionStatus === 'error') {
            document.getElementById('dash-feed').textContent =
                'No se pudo comprobar tu sesión. Recarga la página.';

            document.getElementById('dash-plan').textContent =
                'No se pudo cargar la información.';
        }

        return;
    }

    if (user.nombre) {
        document.getElementById('greeting').textContent =
            `¡Hola, ${user.nombre.trim().split(/\s+/)[0]}!`;
    }

    const results = await Promise.allSettled([
        apiFetch('/api/perfil/actividad'),
        apiFetch('/api/conversaciones'),
        apiFetch('/api/huecos'),
        apiFetch('/api/lost-found'),
        apiFetch('/api/announcements')
    ]);

    const getResult = index => {
        if (results[index].status === 'fulfilled') {
            return results[index].value;
        }

        console.error('Error del dashboard:', results[index].reason);
        return null;
    };

    const activity = getResult(0);
    const messages = getResult(1);
    const events = getResult(2);
    const objects = getResult(3);
    const announcements = getResult(4);

    // Indicadores personales
    const summary = activity?.resumen;

    document.getElementById('dash-posts').textContent =
        summary
            ? (summary.publicaciones || 0) +
            (summary.huecosCreados || 0)
            : '—';

    document.getElementById('dash-chat').textContent =
        messages?.conversaciones?.length ?? '—';

    // Actividades con cupos disponibles
    const availableEvents = Array.isArray(events)
        ? events.filter(event =>
            Number(event.capacity) > Number(event.joined)
        )
        : [];

    document.getElementById('dash-events').textContent =
        Array.isArray(events) ? availableEvents.length : '—';

    // Publicaciones recientes
    const feed = [
        ...(Array.isArray(objects) ? objects : [])
            .slice(0, 3)
            .map(item => ({
                title: item.title,
                meta: 'Objetos perdidos · ' + item.location,
                href: 'index.html?item=' + encodeURIComponent(item.id),
                icon: 'fa-box-open'
            })),

        ...(Array.isArray(announcements) ? announcements : [])
            .slice(0, 2)
            .map(item => ({
                title: item.title,
                meta: 'Avisos · ' + item.campus,
                href: 'notificaciones.html',
                icon: 'fa-bullhorn'
            }))
    ];

    const feedContainer = document.getElementById('dash-feed');

    feedContainer.innerHTML = feed.map(item => `
        <a href="${item.href}">
            <span class="uc-ico">
                <i class="fa-solid ${item.icon}"></i>
            </span>

            <div>
                <b>${escapeHtml(item.title)}</b>
                <small>${escapeHtml(item.meta)}</small>
            </div>

            <span class="ml-auto text-slate-400">→</span>
        </a>
    `).join('');

    if (objects === null || announcements === null) {
        feedContainer.insertAdjacentHTML('beforeend',
            '<p class="uc-sub">No se pudieron cargar todas las publicaciones.</p>'
        );
    } else if (feed.length === 0) {
        feedContainer.textContent = 'No hay publicaciones disponibles.';
    }

    // Recomendar una actividad
    const plan = availableEvents.find(event =>
        !event.mine && !event.joinedByMe
    );

    const planContainer = document.getElementById('dash-plan');

    if (!plan) {
        planContainer.textContent = events === null
            ? 'No se pudieron cargar las actividades.'
            : 'No hay nuevas actividades con cupos disponibles.';

        return;
    }

    const capacity = Number(plan.capacity);
    const joined = Number(plan.joined);

    const percentage = Math.max(
        0,
        Math.min(100, (joined / capacity) * 100)
    );

    planContainer.innerHTML = `
        <p class="uc-kicker">
            ${escapeHtml(plan.category)}
        </p>

        <h3 class="uc-h2 text-slate-900 mt-2">
            ${escapeHtml(plan.title)}
        </h3>

        <p class="uc-sub mt-2">
            ${escapeHtml(plan.location)} ·
            ${escapeHtml(plan.time)}
        </p>

        <div class="uc-progress">
            <span style="width:${percentage}%"></span>
        </div>

        <p class="uc-sub">
            ${joined} de ${capacity} cupos ocupados
        </p>

        <a class="uc-primary mt-4" href="punto-hueco.html">
            Ver actividad →
        </a>
    `;
}

renderQuickLinks();
loadDashboard();