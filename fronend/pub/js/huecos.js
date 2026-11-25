// Módulo: Punto Hueco

let currentHuecoCat = 'ALL';
let huecoEditingId = null;
const huecoCategoryStyles = {

    Estudiar: {
        icon: 'fa-book-open',
        background: '#e8eefc',
        color: '#3659a8'
    },

    Socializar: {
        icon: 'fa-mug-hot',
        background: '#f8eaf0',
        color: '#7b1e38'
    },

    Juegos: {
        icon: 'fa-chess-knight',
        background: '#f0e8fc',
        color: '#8052b5'
    },

    Deportes: {
        icon: 'fa-futbol',
        background: '#e8f4ee',
        color: '#27775e'
    },

    Creatividad: {
        icon: 'fa-palette',
        background: '#fff2df',
        color: '#b77924'
    }

};
async function loadHuecos() {
    try {
        await sessionReady;
        huecosData = await apiFetch('/api/huecos');
        applyHuecoFilter();
    } catch (err) {
        handleApiError(err);
    }
}

function normalizeHuecoText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function applyHuecoFilter() {

    const query = normalizeHuecoText(
        document.getElementById('huecoSearch').value
    );

    const participation = document.getElementById(
        'huecoParticipationFilter'
    ).value;

    const filtered = huecosData.filter(h => {

        const matchesCategory =
            currentHuecoCat === 'ALL' ||
            h.category === currentHuecoCat;

        const matchesQuery = [
            h.title,
            h.category,
            h.campus,
            h.location,
            h.organizer,
            h.desc,
            h.time
        ].some(value =>
            normalizeHuecoText(value).includes(query)
        );

        const isFull =
            Number(h.joined) >= Number(h.capacity);

        let matchesParticipation = true;

        switch (participation) {

            case 'AVAILABLE':
                matchesParticipation =
                    !isFull && !h.mine && !h.joinedByMe;
                break;

            case 'JOINED':
                matchesParticipation =
                    !!h.joinedByMe && !h.mine;
                break;

            case 'MINE':
                matchesParticipation = !!h.mine;
                break;

            case 'FULL':
                matchesParticipation = isFull;
                break;

        }

        return matchesCategory &&
            matchesQuery &&
            matchesParticipation;

    });

    renderHuecos(filtered);
}

function resetHuecoFilters() {

    document.getElementById('huecoSearch').value = '';

    document.getElementById(
        'huecoParticipationFilter'
    ).value = 'ALL';

    const firstButton = document.querySelector(
        '.hueco-cat-btn'
    );

    if (firstButton) {
        filterHuecos('ALL', firstButton);
    } else {
        currentHuecoCat = 'ALL';
        applyHuecoFilter();
    }
}

function renderHuecos(items = huecosData) {

    const grid = document.getElementById('huecosGrid');
    const counter = document.getElementById('huecoResultsCount');

    if (counter) {
        counter.textContent = items.length === 1
            ? '1 actividad encontrada'
            : `${items.length} actividades encontradas`;
    }

    if (items.length === 0) {

        grid.innerHTML = `
            <div class="hueco-empty">

                <i class="fa-solid fa-mug-hot"></i>

                <h3>No encontramos actividades</h3>

                <p>
                    Prueba con otros filtros o crea
                    tu propio Punto Hueco.
                </p>

                <button type="button"
                    onclick="openModal('huecoCreateModal')"
                    class="uc-primary">

                    <i class="fa-solid fa-plus"></i>
                    Crear actividad

                </button>

            </div>`;

        return;
    }

    grid.innerHTML = items.map(hue => {

        const capacity = Math.max(
            0, Number(hue.capacity) || 0
        );

        const joined = Math.max(
            0, Number(hue.joined) || 0
        );

        const isFull = joined >= capacity;
        const alreadyJoined = !!hue.joinedByMe;

        const remaining = Math.max(
            0, capacity - joined
        );

        const progressPct = capacity > 0
            ? Math.min(100, Math.round(joined / capacity * 100))
            : 0;

        const categoryStyle =
            huecoCategoryStyles[hue.category] || {
                icon: 'fa-calendar-days',
                background: '#f8eaf0',
                color: '#7b1e38'
            };

        let status = 'Disponible';
        let statusClass = 'hueco-status-open';
        let cardClass = '';

        if (hue.mine) {

            status = 'Mi actividad';
            statusClass = 'hueco-status-mine';
            cardClass = 'hueco-card-mine';

        } else if (alreadyJoined) {

            status = 'Ya participas';
            statusClass = 'hueco-status-joined';
            cardClass = 'hueco-card-joined';

        } else if (isFull) {

            status = 'Aforo lleno';
            statusClass = 'hueco-status-full';

        }

        return `

            <article class="hueco-card ${cardClass}">

                <div>

                    <div class="hueco-card-top">

                        <div class="hueco-category-icon"
                            style="background:${categoryStyle.background};
                                   color:${categoryStyle.color}">

                            <i class="fa-solid ${categoryStyle.icon}"></i>

                        </div>

                        <span class="hueco-status ${statusClass}">
                            ${status}
                        </span>

                    </div>

                    <p class="hueco-category-label">
                        ${escapeHtml(hue.category)}
                    </p>

                    <h3 class="hueco-card-title">
                        ${escapeHtml(hue.title)}
                    </h3>

                    <div class="hueco-info">

                        <p>
                            <i class="fa-solid fa-location-dot"></i>

                            <span>
                                <strong>
                                    ${escapeHtml(hue.campus)}
                                </strong>

                                <br>

                                ${escapeHtml(hue.location)}
                            </span>
                        </p>

                        <p>
                            <i class="fa-regular fa-clock"></i>

                            <span>
                                ${escapeHtml(hue.time)}
                            </span>
                        </p>

                        <p>
                            <i class="fa-solid fa-user-group"></i>

                            <span>
                                Organiza:
                                ${escapeHtml(hue.organizer)}
                            </span>
                        </p>

                    </div>

                    ${hue.desc ? `
                        <p class="hueco-description">
                            ${escapeHtml(hue.desc)}
                        </p>
                    ` : ''}

                    <div class="hueco-capacity">

                        <div class="hueco-capacity-label">

                            <span class="text-slate-600">
                                Participantes
                            </span>

                            <span class="${isFull
                                ? 'text-red-600'
                                : 'text-emerald-600'}">

                                ${joined} / ${capacity}

                            </span>

                        </div>

                        <div class="hueco-progress
                            ${isFull ? 'hueco-progress-full' : ''}"
                            role="progressbar"
                            aria-label="Ocupación de cupos"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow="${progressPct}">

                            <span style="width:${progressPct}%">
                            </span>

                        </div>

                        <p class="text-xs text-slate-500 mt-2">

                            ${isFull
                                ? 'No quedan cupos disponibles'
                                : remaining === 1
                                    ? 'Queda 1 cupo disponible'
                                    : `Quedan ${remaining} cupos disponibles`
                            }

                        </p>

                    </div>

                </div>

                <div class="hueco-actions">

                    ${hue.mine ? `

                        <button type="button"
                            onclick="abrirModalGestion('${escapeHtml(hue.id)}')"
                            class="uc-secondary">

                            <i class="fa-solid fa-gear"></i>
                            Gestionar

                        </button>

                        <button type="button"
                            onclick="abrirChatPuntoHueco('${escapeHtml(hue.id)}')"
                            class="uc-primary">

                            <i class="fa-solid fa-comments"></i>
                            Chat grupal

                        </button>

                    ` : alreadyJoined ? `

                        <button type="button"
                            onclick="abrirChatPuntoHueco('${escapeHtml(hue.id)}')"
                            class="uc-primary">

                            <i class="fa-solid fa-comments"></i>
                            Abrir chat grupal

                        </button>

                    ` : `

                        <button type="button"
                            onclick="joinHueco('${escapeHtml(hue.id)}')"
                            ${isFull ? 'disabled' : ''}
                            class="uc-primary">

                            <i class="fa-solid ${isFull
                                ? 'fa-lock'
                                : 'fa-user-plus'}"></i>

                            ${isFull
                                ? 'Aforo lleno'
                                : 'Unirme a la actividad'}

                        </button>

                    `}

                </div>

            </article>

        `;

    }).join('');
}

function filterHuecos(cat, btn) {
    currentHuecoCat = cat;
    document.querySelectorAll('.hueco-cat-btn').forEach(b => {
        b.classList.remove('bg-unsa-maroon', 'text-white');
        b.classList.add('bg-white', 'text-slate-600');
    });
    btn.classList.remove('bg-white', 'text-slate-600');
    btn.classList.add('bg-unsa-maroon', 'text-white');
    applyHuecoFilter();
}


async function joinHueco(id) {

    try {

        const updated = await apiFetch(
            `/api/huecos/${encodeURIComponent(id)}/join`,
            {
                method: 'POST'
            }
        );

        const i = huecosData.findIndex(h => h.id === id);

        if (i !== -1) {

            huecosData[i] = {
                ...updated,
                mine: huecosData[i].mine,
                joinedByMe: true
            };

        }

        applyHuecoFilter();

        openNotificationToast(
            `Te has unido a "${updated.title}". Ya formas parte de su chat grupal.`
        );

    } catch (err) {

        handleApiError(err);

        if (err.status === 409) {
            loadHuecos();
        }

    }

}


async function handleSaveHueco(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('huecoTitle').value,
        category: document.getElementById('huecoCategory').value,
        campus: document.getElementById('huecoCampus').value,
        location: document.getElementById('huecoLocation').value,
        time: document.getElementById('huecoTime').value,
        capacity: parseInt(document.getElementById('huecoCapacity').value) || 6,
        organizer: document.getElementById('huecoOrganizer').value,
        phone: document.getElementById('huecoPhone').value,
        desc: document.getElementById('huecoDesc').value
    };

    try {
        if (huecoEditingId) {
            await apiFetch(`/api/huecos/${encodeURIComponent(huecoEditingId)}`, { method: 'PUT', body: payload });
        } else {
            await apiFetch('/api/huecos', { method: 'POST', body: payload });
        }
        const fueEdicion = !!huecoEditingId;
        await loadHuecos();
        closeModal('huecoCreateModal');
        openNotificationToast(
    fueEdicion
        ? 'Punto Hueco actualizado correctamente.'
        : '¡Punto Hueco creado! Su chat grupal ya está disponible.'
);
    } catch (err) {
        handleApiError(err);
    }
}

function editHueco(id) {
    const h = huecosData.find(x => x.id === id);
    if (!h) return;
    huecoEditingId = id;
    document.getElementById('huecoTitle').value = h.title;
    document.getElementById('huecoCategory').value = h.category;
    document.getElementById('huecoCampus').value = h.campus;
    document.getElementById('huecoLocation').value = h.location;
    document.getElementById('huecoTime').value = h.time;
    document.getElementById('huecoCapacity').value = h.capacity;
    document.getElementById('huecoOrganizer').value = h.organizer;
    document.getElementById('huecoPhone').value = h.phone;
    document.getElementById('huecoDesc').value = h.desc;
    setModalMode('huecoModalTitle', 'huecoSubmitBtn', true, 'Crear Nuevo Punto Hueco', 'Publicar Punto Hueco');
    openModal('huecoCreateModal');
}

document.addEventListener('modalclosed', e => {
    setModalMode('huecoModalTitle', 'huecoSubmitBtn', false, 'Crear Nuevo Punto Hueco', 'Publicar Punto Hueco');
    if (e.detail === 'huecoCreateModal') {
        huecoEditingId = null;
        document.getElementById('huecoCreateForm').reset();
    }
});

document.addEventListener('DOMContentLoaded', loadHuecos);

// ==========================================
// LÓGICA DEL MODAL DE GESTIÓN (Para creadores)
// ==========================================

async function abrirModalGestion(id) {
    // 1. Buscar el hueco específico localmente para asegurarnos de que existe
    const h = huecosData.find(x => x.id === id);
    if (!h) return;

    // 2. Mostrar el modal quitando la clase 'hidden' de Tailwind
    const modal = document.getElementById('huecoManageModal');
    if (modal) modal.classList.remove('hidden');

    const lista = document.getElementById('listaParticipantesModal');
    lista.innerHTML = '<li class="text-sm text-slate-500 italic text-center py-4">Cargando participantes...</li>';

    // 3. Configurar botón de Editar (Reutiliza tu lógica existente)
    document.getElementById('btnEditarHueco').onclick = () => {
        closeModal('huecoManageModal'); // Cierra este modal
        editHueco(id); // Abre el modal de creación en modo edición
    };

    // 4. Configurar botón de Eliminar/Cancelar Evento
    document.getElementById('btnEliminarHueco').onclick = async () => {
        if (confirm("¿Estás seguro de cancelar este Punto Hueco? Esta acción no se puede deshacer.")) {
            try {
                await apiFetch(`/api/huecos/${encodeURIComponent(id)}`, { method: 'DELETE' });
                closeModal('huecoManageModal');
                await loadHuecos(); // Recarga la grilla de huecos
                openNotificationToast("Punto Hueco eliminado correctamente.");
            } catch (err) {
                handleApiError(err);
            }
        }
    };

    // 5. Cargar participantes reales desde el Backend
    try {
        const participantes = await apiFetch(`/api/huecos/${encodeURIComponent(id)}/participantes`);

        // Guardamos los teléfonos para el botón de copiar a WhatsApp
        lista.innerHTML = '';

        if (participantes.length === 0) {
            lista.innerHTML = '<li class="text-sm text-slate-500 italic text-center py-4">Nadie se ha unido todavía.</li>';
            return;
        }

        // Inyectamos el HTML de cada participante
        participantes.forEach(p => {
            lista.innerHTML += `
                <li class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                    <div>
                        <p class="text-sm font-bold text-slate-800">
                            <i class="fa-solid fa-user text-slate-400 mr-1"></i> ${escapeHtml(p.nombre)}
                        </p>
                        <p class="text-xs text-slate-500">${escapeHtml(p.carrera)}</p>
                    </div>
                </li>
            `;
        });
    } catch (err) {
        console.error(err);
        lista.innerHTML = '<li class="text-sm text-red-500 text-center py-4">Error al cargar participantes.</li>';
    }
}


/* =====================================================
   ABRIR CHAT GRUPAL DE PUNTO HUECO
===================================================== */

async function abrirChatPuntoHueco(id) {

    try {

        const data = await apiFetch(
            `/api/huecos/${encodeURIComponent(id)}/conversacion`
        );

        // Abrir Mi perfil directamente en el grupo correspondiente.
        window.location.href =
            `cuenta.html?chat=${encodeURIComponent(data.conversacionId)}`;

    } catch (err) {

        handleApiError(err);

    }

}
