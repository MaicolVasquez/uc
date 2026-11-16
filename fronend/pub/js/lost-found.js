// Módulo: Objetos Perdidos
let lfEditingId = null;
const LF_DEFAULT_IMG = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80';

async function loadLostFound() {
    try {
        await sessionReady;
        lostFoundData = await apiFetch('/api/lost-found');
        filterLostFound();
    } catch (err) {
        handleApiError(err);
    }
}

function renderLostFound(items = lostFoundData) {
    const grid = document.getElementById('lostFoundGrid');
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-folder-open text-4xl mb-2"></i>
                <p class="font-bold text-sm">No se encontraron objetos con los filtros seleccionados.</p>
            </div>`;
        return;
    }

    const esAdminUser = !!(window.currentUser && window.currentUser.rol === 'admin');

    grid.innerHTML = items.map(item => {
        const isLost = item.status === 'PERDIDO';
        const isResolved = item.resolutionStatus === 'RESUELTO';
        const canManage = !!(item.mine || esAdminUser);

        const statusBadge = isLost
            ? `<span class="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> PERDIDO</span>`
            : `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> ENCONTRADO</span>`;

        const resolvedBadge = isResolved
            ? `<span class="bg-slate-900 text-unsa-gold text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-unsa-gold/40 flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> ${isLost ? 'RECUPERADO' : 'DEVUELTO'}</span>`
            : '';

        const formattedDate = item.datetime
            ? new Date(item.datetime).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
            : '';
        const img = escapeHtml(safeUrl(item.img) || LF_DEFAULT_IMG);
        const phone = onlyDigits(item.phone);

        const resolveBtnLabel = isLost ? 'Marcar como recuperado' : 'Marcar como devuelto';

        return `
            <div class="bg-white rounded-2xl border ${isResolved ? 'border-slate-300 opacity-85' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div>
                    <div class="relative h-44 overflow-hidden bg-slate-100">
                        <img src="${img}" alt="${escapeHtml(item.title)}"
                             class="w-full h-full object-cover transition-transform hover:scale-105 duration-300 ${isResolved ? 'grayscale-[40%]' : ''}"
                             onerror="this.src='${LF_DEFAULT_IMG}'">
                        <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            ${statusBadge}
                            ${resolvedBadge}
                        </div>
                        <div class="absolute top-3 right-3 flex gap-1">
                            ${!isResolved ? editBtn('editLostFound', item) : ''}
                            ${deleteBtn('lost-found', item, 'loadLostFound')}
                        </div>
                        <div class="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ${escapeHtml(item.campus)}
                        </div>
                    </div>

                    <div class="p-4">
                        <span class="text-[10px] font-bold uppercase text-unsa-maroon tracking-wider">${escapeHtml(item.category)}</span>
                        <h3 class="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">${escapeHtml(item.title)}</h3>
                        <p class="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <i class="fa-solid fa-location-dot text-red-500 w-4"></i> ${escapeHtml(item.location)}
                        </p>
                        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <i class="fa-regular fa-clock text-unsa-gold w-4"></i> ${escapeHtml(formattedDate)}
                        </p>
                        <p class="text-xs text-slate-600 mt-3 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "${escapeHtml(item.desc || 'Sin descripción adicional.')}"
                        </p>
                    </div>
                </div>

                <div class="p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                    ${canManage && !isResolved ? `
                    <button onclick="resolverCaso('${escapeHtml(item.id)}', ${isLost})"
                        class="w-full mt-3 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                        <i class="fa-solid fa-circle-check text-unsa-gold"></i> ${resolveBtnLabel}
                    </button>` : ''}

                    ${canManage && isResolved ? `
                    <button onclick="reabrirCaso('${escapeHtml(item.id)}')"
                        class="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                        <i class="fa-solid fa-rotate-left"></i> Reabrir caso
                    </button>` : ''}

                    ${!isResolved ? `
                    <a href="https://wa.me/51${phone}?text=Hola,%20te%20contacto%20desde%20UNSA%20Conecta%20por%20el%20objeto:%20${encodeURIComponent(item.title)}"
                       target="_blank" rel="noopener"
                       class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                        <i class="fa-brands fa-whatsapp text-sm"></i> Contactar al WhatsApp (${phone})
                    </a>` : `
                    <div class="w-full mt-3 bg-slate-100 text-slate-500 font-semibold py-2 px-3 rounded-xl text-xs text-center">
                        Caso cerrado · Contacto deshabilitado
                    </div>`}
                </div>
            </div>`;
    }).join('');
}

function filterLostFound() {
    const query = document.getElementById('lfSearch').value.toLowerCase();
    const status = document.getElementById('lfStatusFilter').value;
    const resolution = document.getElementById('lfResolutionFilter').value;
    const campus = document.getElementById('lfCampusFilter').value;
    const category = document.getElementById('lfCategoryFilter').value;

    const filtered = lostFoundData.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query);
        const matchesStatus = status === 'ALL' || item.status === status;
        const matchesResolution = resolution === 'ALL' || item.resolutionStatus === resolution;
        const matchesCampus = campus === 'ALL' || item.campus === campus;
        const matchesCategory = category === 'ALL' || item.category === category;
        return matchesQuery && matchesStatus && matchesResolution && matchesCampus && matchesCategory;
    });

    renderLostFound(filtered);
}

let lfImageData = null;

function resizeLfImage(file, maxW = 1000) {
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
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo leer la imagen'));
        };
        img.src = url;
    });
}

function showLfPreview(src) {
    const wrap = document.getElementById('lfImgPreviewWrap');
    const preview = document.getElementById('lfImgPreview');
    if (src) {
        preview.src = src;
        wrap.classList.remove('hidden');
    } else {
        preview.src = '';
        wrap.classList.add('hidden');
    }
}

async function previewLfImage(input) {
    const file = input.files[0];
    if (!file) return;
    try {
        lfImageData = await resizeLfImage(file);
        document.getElementById('lfImgInput').value = '';
        showLfPreview(lfImageData);
    } catch (err) {
        lfImageData = null;
        input.value = '';
        showLfPreview('');
        openNotificationToast('No se pudo procesar la imagen seleccionada.');
    }
}

function previewLfUrl(url) {
    const clean = safeUrl(url.trim());
    if (clean) {
        lfImageData = null;
        document.getElementById('lfImgFileInput').value = '';
        showLfPreview(clean);
    } else if (!lfImageData) {
        showLfPreview('');
    }
}

function clearLfImage() {
    lfImageData = null;
    document.getElementById('lfImgFileInput').value = '';
    document.getElementById('lfImgInput').value = '';
    showLfPreview('');
}

function toggleLfUrlOption() {
    document.getElementById('lfUrlBox').classList.toggle('hidden');
}

async function handleSaveLostFound(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('lfSubmitBtn');
    const prevText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const payload = {
        status: document.querySelector('input[name="status"]:checked').value,
        title: document.getElementById('lfTitleInput').value,
        category: document.getElementById('lfCategoryInput').value,
        campus: document.getElementById('lfCampusInput').value,
        location: document.getElementById('lfLocationInput').value,
        datetime: document.getElementById('lfDateInput').value,
        phone: document.getElementById('lfPhoneInput').value,
        img: document.getElementById('lfImgInput').value,
        imageData: lfImageData,
        desc: document.getElementById('lfDescInput').value
    };

    try {
        if (lfEditingId) {
            await apiFetch(`/api/lost-found/${encodeURIComponent(lfEditingId)}`, { method: 'PUT', body: payload });
        } else {
            await apiFetch('/api/lost-found', { method: 'POST', body: payload });
        }
        const fueEdicion = !!lfEditingId;
        await loadLostFound();
        closeModal('lostFoundModal');
        openNotificationToast(fueEdicion ? 'Publicación actualizada.' : 'Objeto publicado correctamente en la red de la UNSA.');
    } catch (err) {
        handleApiError(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
    }
}

function editLostFound(id) {
    const it = lostFoundData.find(x => x.id === id);
    if (!it) return;
    lfEditingId = id;
    lfImageData = null;

    const radio = document.querySelector(`input[name="status"][value="${it.status}"]`);
    if (radio) radio.checked = true;
    document.getElementById('lfTitleInput').value = it.title;
    document.getElementById('lfCategoryInput').value = it.category;
    document.getElementById('lfCampusInput').value = it.campus;
    document.getElementById('lfLocationInput').value = it.location;
    document.getElementById('lfDateInput').value = (it.datetime || '').slice(0, 16);
    document.getElementById('lfPhoneInput').value = it.phone;
    document.getElementById('lfImgInput').value = it.img || '';
    document.getElementById('lfDescInput').value = it.desc;

    showLfPreview(safeUrl(it.img));
    setModalMode('lfModalTitle', 'lfSubmitBtn', true, 'Reportar Objeto', 'Publicar Reporte');
    openModal('lostFoundModal');
}

document.addEventListener('modalclosed', e => {
    setModalMode('lfModalTitle', 'lfSubmitBtn', false, 'Reportar Objeto', 'Publicar Reporte');
    if (e.detail === 'lostFoundModal') {
        lfEditingId = null;
        document.getElementById('lostFoundForm').reset();
        clearLfImage();
        document.getElementById('lfUrlBox').classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', loadLostFound);
async function resolverCaso(id, isLost) {
    const msg = isLost
        ? '¿Confirmas que ya recuperaste este objeto? El caso pasará a resuelto.'
        : '¿Confirmas que el objeto ya fue devuelto a su dueño?';
    if (!confirm(msg)) return;

    try {
        await apiFetch(`/api/lost-found/${encodeURIComponent(id)}/resolver`, { method: 'PATCH' });
        await loadLostFound();
        openNotificationToast(isLost ? '¡Excelente! Objeto marcado como recuperado.' : 'Objeto marcado como devuelto.');
    } catch (err) {
        handleApiError(err);
    }
}

async function reabrirCaso(id) {
    if (!confirm('¿Deseas volver a marcar este reporte como activo?')) return;
    try {
        await apiFetch(`/api/lost-found/${encodeURIComponent(id)}/reabrir`, { method: 'PATCH' });
        await loadLostFound();
        openNotificationToast('El caso vuelve a estar activo.');
    } catch (err) {
        handleApiError(err);
    }
}