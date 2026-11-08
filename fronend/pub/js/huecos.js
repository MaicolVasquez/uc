// Módulo: Punto Hueco

let currentHuecoCat = 'ALL';
let huecoEditingId = null;
async function loadHuecos() {
    try {
        await sessionReady;
        huecosData = await apiFetch('/api/huecos');
        applyHuecoFilter();
    } catch (err) {
        handleApiError(err);
    }
}

function applyHuecoFilter() {
    renderHuecos(currentHuecoCat === 'ALL' ? huecosData : huecosData.filter(h => h.category === currentHuecoCat));
}

function renderHuecos(items = huecosData) {
    const grid = document.getElementById('huecosGrid');

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-mug-hot text-4xl mb-2"></i>
                <p class="font-bold text-sm">No hay Puntos Hueco publicados todavía.</p>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(hue => {
        const isFull = hue.joined >= hue.capacity;
        const alreadyJoined = !!hue.joinedByMe;
        const disableJoin = isFull || alreadyJoined;
        const progressPct = hue.capacity ? Math.min(100, Math.round((hue.joined / hue.capacity) * 100)) : 0;

        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                            ${escapeHtml(hue.category)}
                        </span>
                        <span class="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sucediendo Hoy
                        </span>
                    </div>
 
                    <h3 class="font-extrabold text-slate-900 text-base mt-1">${escapeHtml(hue.title)}</h3>
 
                    <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                        <p class="flex items-center gap-2">
                            <i class="fa-solid fa-location-dot text-red-500 w-4"></i>
                            <span class="font-semibold text-slate-800">${escapeHtml(hue.campus)}:</span> ${escapeHtml(hue.location)}
                        </p>
                        <p class="flex items-center gap-2">
                            <i class="fa-regular fa-clock text-unsa-gold w-4"></i>
                            <span class="font-semibold text-slate-800">Horario:</span> ${escapeHtml(hue.time)}
                        </p>
                        <p class="flex items-center gap-2">
                            <i class="fa-solid fa-user-group text-slate-400 w-4"></i>
                            <span class="font-semibold text-slate-800">Organiza:</span> ${escapeHtml(hue.organizer)}
                        </p>
                    </div>
 
                    <p class="text-xs text-slate-600 mt-3 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "${escapeHtml(hue.desc)}"
                    </p>
 
                    <div class="mt-4">
                        <div class="flex justify-between text-[11px] font-bold mb-1">
                            <span class="text-slate-500">Participantes:</span>
                            <span class="${isFull ? 'text-red-600' : 'text-emerald-600'}">${hue.joined} / ${hue.capacity} personas</span>
                        </div>
                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div class="h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'} transition-all" style="width: ${progressPct}%"></div>
                        </div>
                    </div>
                </div>
 
                <div class="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    ${hue.mine ? `
                        <!-- Botón de gestionar para el creador -->
                        <button onclick="abrirModalGestion('${escapeHtml(hue.id)}')" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow transition-colors flex justify-center items-center gap-2">
                            <i class="fa-solid fa-gear"></i> Gestionar mi Hueco
                        </button>
                    ` : `
                        <!-- Botones normales para otros usuarios -->
                        <button onclick="joinHueco('${escapeHtml(hue.id)}')" ${disableJoin ? 'disabled' : ''} class="flex-1 ${disableJoin ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'} font-extrabold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                            <i class="fa-solid fa-user-plus text-xs"></i> ${alreadyJoined ? 'Ya estás unido' : (isFull ? 'Aforo Lleno' : '¡Unirme al Hueco!')}
                        </button>
                        <a href="https://wa.me/51${onlyDigits(hue.phone)}?text=Hola%20${encodeURIComponent(hue.organizer)},%20quiero%20unirme%20al%20Punto%20Hueco:%20${encodeURIComponent(hue.title)}"
                           target="_blank" rel="noopener"
                           class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center justify-center"
                           title="Chat WhatsApp">
                            <i class="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
                        </a>
                    `}
                </div>
            </div>`;
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
        const updated = await apiFetch(`/api/huecos/${encodeURIComponent(id)}/join`, { method: 'POST' });
        const i = huecosData.findIndex(h => h.id === id);
        if (i !== -1) huecosData[i] = { ...updated, mine: huecosData[i].mine };
        applyHuecoFilter();
        openNotificationToast(`Te has unido al grupo "${updated.title}". Coordina por WhatsApp con ${updated.organizer}.`);
    } catch (err) {
        handleApiError(err);
        if (err.status === 409) loadHuecos();   // aforo lleno: refresca los números
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
        openNotificationToast(fueEdicion ? 'Punto Hueco actualizado.' : '¡Punto Hueco publicado! Tus compañeros podrán unirse.');
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
let telefonosActuales = [];

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
        telefonosActuales = participantes.map(p => p.telefono || '');
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

function copiarNumerosWhatsApp() {
    // Filtramos por si hay usuarios que no registraron su número
    const numerosValidos = telefonosActuales.filter(n => n && n.trim() !== '');

    if (numerosValidos.length === 0) {
        alert("No hay números registrados para copiar.");
        return;
    }

    const textoCopiar = numerosValidos.join(', ');
    navigator.clipboard.writeText(textoCopiar).then(() => {
        openNotificationToast("¡Números copiados al portapapeles! Ya puedes crear tu grupo de WhatsApp.");
    }).catch(err => {
        alert("Tu navegador bloqueó el copiado automático. Selecciona y copia manualmente: " + textoCopiar);
    });
}