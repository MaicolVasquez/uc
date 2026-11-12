// Módulo: Notificaciones e Info

let currentAnnCategory = 'ALL';
let annImageData = null;   // imagen ya reducida, lista para enviar

// Admin o delegado pueden publicar.
// OJO: ajusta "currentUser" al nombre real que use layout.js para el usuario de la sesión.
function canPublish() {
    return isAdmin() || (window.currentUser && window.currentUser.rol === 'delegado');
}

async function loadAnnouncements() {
    try {
        await sessionReady;
        document.getElementById('annCreateBtn').classList.toggle('hidden', !canPublish());

        announcementsData = await apiFetch('/api/announcements');
        filterAnnouncements();
    } catch (err) {
        handleApiError(err);
    }
}

function formatEventAt(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d)) return '';
    const fecha = d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    const hora = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    return `${fecha} · ${hora}`;
}

function renderAnnouncements(items = announcementsData) {
    const grid = document.getElementById('announcementsGrid');

    if (!items.length) {
        grid.innerHTML = `<p class="col-span-full text-center text-sm text-slate-400 py-10">No hay avisos para mostrar.</p>`;
        return;
    }

    grid.innerHTML = items.map(ann => {
        const isUrgent = ann.urgency === 'URGENTE';
        const urgencyBadge = isUrgent
            ? `<span class="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse"><i class="fa-solid fa-triangle-exclamation"></i> Urgente</span>`
            : ann.urgency === 'EVENTO'
                ? `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">📅 Evento</span>`
                : `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">ℹ️ Información</span>`;

        const image = ann.image
            ? `<img src="${escapeHtml(ann.image)}" alt="" loading="lazy" class="w-full h-44 object-cover">`
            : '';
        const when = formatEventAt(ann.eventAt);

        return `
            <article class="bg-white rounded-2xl border ${isUrgent ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                ${image}
                <div class="p-5 flex flex-col flex-grow">
                    <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div class="flex items-center gap-2">
                            ${urgencyBadge}
                            <span class="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md">${escapeHtml(ann.category)}</span>
                        </div>
                        ${deleteBtn('announcements', ann, 'loadAnnouncements')}
                    </div>

                    <h3 class="text-lg font-extrabold text-slate-900 mt-1">${escapeHtml(ann.title)}</h3>

                    ${when ? `<p class="text-sm font-bold text-unsa-maroon mt-1"><i class="fa-regular fa-clock mr-1"></i> ${escapeHtml(when)}</p>` : ''}

                    <p class="text-xs text-slate-500 font-semibold mt-1"><i class="fa-solid fa-building-columns text-unsa-maroon mr-1"></i> ${escapeHtml(ann.campus)}</p>

                    <p class="text-xs text-slate-600 mt-3 leading-relaxed flex-grow">${escapeHtml(ann.content)}</p>

                    <p class="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                        Publicado el ${escapeHtml(ann.date)}${ann.authorName ? ' por ' + escapeHtml(ann.authorName) : ''}
                    </p>
                </div>
            </article>
        `;
    }).join('');
}

function filterAnnouncements() {
    const urgency = document.getElementById('urgencyFilter').value;
    let filtered = announcementsData;

    if (urgency !== 'ALL') filtered = filtered.filter(a => a.urgency === urgency);
    if (currentAnnCategory !== 'ALL') filtered = filtered.filter(a => a.category === currentAnnCategory);

    renderAnnouncements(filtered);
}

function filterAnnouncementCategory(cat, btn) {
    currentAnnCategory = cat;
    document.querySelectorAll('.ann-cat-btn').forEach(b => {
        b.classList.remove('bg-unsa-maroon', 'text-white');
        b.classList.add('bg-white', 'text-slate-600');
    });
    btn.classList.remove('bg-white', 'text-slate-600');
    btn.classList.add('bg-unsa-maroon', 'text-white');

    filterAnnouncements();
}

// ---- Imagen: se reduce a máx. 1000px y se convierte a JPG antes de enviarla ----
function resizeImage(file, maxW = 1000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('No se pudo leer la imagen'));
        img.src = url;
    });
}

async function previewAnnImage(input) {
    const preview = document.getElementById('annImagePreview');
    const file = input.files[0];
    if (!file) {
        annImageData = null;
        preview.classList.add('hidden');
        return;
    }
    try {
        annImageData = await resizeImage(file);
        preview.src = annImageData;
        preview.classList.remove('hidden');
    } catch (err) {
        annImageData = null;
        input.value = '';
        preview.classList.add('hidden');
        openNotificationToast('Esa imagen no se pudo procesar.');
    }
}

async function handleSaveAnnouncement(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('annTitle').value.trim(),
        category: document.getElementById('annCategory').value,
        urgency: document.getElementById('annUrgency').value,
        campus: document.getElementById('annCampus').value.trim() || 'Todos los campus',
        eventAt: document.getElementById('annEventAt').value
            ? new Date(document.getElementById('annEventAt').value).toISOString()
            : null,
        content: document.getElementById('annContent').value.trim(),
        image: annImageData   // data URL o null
    };
    try {
        await apiFetch('/api/announcements', { method: 'POST', body: payload });
        await loadAnnouncements();
        closeModal('annCreateModal');
        e.target.reset();
        annImageData = null;
        document.getElementById('annImagePreview').classList.add('hidden');
        openNotificationToast('Anuncio publicado.');
    } catch (err) {
        handleApiError(err);
    }
}

document.addEventListener('DOMContentLoaded', loadAnnouncements);