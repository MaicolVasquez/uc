// Módulo: Objetos Perdidos
let lfEditingId = null;
let lfImageData = null;
const LF_DEFAULT_IMG = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80';

const UNSA_MAP_SPOTS = [
    { id: 'loc-1', campus: 'Ingenierías', campusKey: 'ingenierias', title: 'Pabellón Cs. de la Computación' },
    { id: 'loc-2', campus: 'Ingenierías', campusKey: 'ingenierias', title: 'Biblioteca de Área de Ingenierías' },
    { id: 'loc-3', campus: 'Ingenierías', campusKey: 'ingenierias', title: 'Pabellón de Ing. Civil y Estructuras' },
    { id: 'loc-4', campus: 'Sociales', campusKey: 'sociales', title: 'Facultad de Derecho y Cs. Políticas' },
    { id: 'loc-5', campus: 'Sociales', campusKey: 'sociales', title: 'Escuela Profesional de FIPS / Psicología' },
    { id: 'loc-6', campus: 'Biomédicas', campusKey: 'biomedicas', title: 'Facultad de Medicina Humana' },
    { id: 'loc-7', campus: 'Biomédicas', campusKey: 'biomedicas', title: 'Comedor Universitario Biomédicas' }
];

const CAMPUS_NAME_TO_KEY = {
    'Ingenierías': 'ingenierias',
    'Sociales': 'sociales',
    'Biomédicas': 'biomedicas'
};

function onLfCampusChange(campus, selectedLocId = '') {
    const select = document.getElementById('lfMapLocationInput');
    if (!select) return;

    const spots = UNSA_MAP_SPOTS.filter(s => s.campus === campus);
    select.innerHTML = '<option value="">— Seleccionar pabellón o punto cercano —</option>' +
        spots.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.title)}</option>`).join('');

    if (selectedLocId && spots.some(s => s.id === selectedLocId)) {
        select.value = selectedLocId;
    }
}

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

        let custodyBadge = '';
        if (!isLost) {
            if (item.custodyType === 'PUNTO_SEGURO' && item.custodyPoint) {
                custodyBadge = `
                    <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                        <i class="fa-solid fa-building-shield text-blue-600"></i>
                        <span class="truncate">Dejado en: ${escapeHtml(item.custodyPoint)}</span>
                    </div>`;
            } else {
                custodyBadge = `
                    <div class="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                        <i class="fa-solid fa-hand-holding text-unsa-maroon"></i>
                        <span>En custodia del reportante</span>
                    </div>`;
            }
        }

        const mapSpot = UNSA_MAP_SPOTS.find(s => s.id === item.mapLocationId);
        const campusKey = CAMPUS_NAME_TO_KEY[item.campus] || 'ingenierias';
        const mapHref = mapSpot
            ? `mapa.html?loc=${encodeURIComponent(mapSpot.id)}`
            : `mapa.html?campus=${encodeURIComponent(campusKey)}`;
        const mapLabel = mapSpot
            ? `Ver en UNSA Maps: ${escapeHtml(mapSpot.title)}`
            : `Ver Área de ${escapeHtml(item.campus)} en UNSA Maps`;

        const mapLinkBlock = `
            <a href="${mapHref}"
               class="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-unsa-maroon hover:text-unsa-dark hover:underline">
                <i class="fa-solid fa-map-location-dot"></i>
                <span class="truncate">${mapLabel}</span>
            </a>`;

        const hasRealImg = !!safeUrl(item.img);
        const img = escapeHtml(safeUrl(item.img) || LF_DEFAULT_IMG);
        const shouldBlur = !!(item.hasSensitiveDoc && hasRealImg);

        const imageBlock = `
            <div class="relative h-44 overflow-hidden bg-slate-100">
                <img src="${img}" alt="${escapeHtml(item.title)}"
                     class="w-full h-full object-cover transition-transform duration-300 ${shouldBlur ? 'blur-md scale-110' : 'hover:scale-105'} ${isResolved ? 'grayscale-[40%]' : ''}"
                     onerror="this.src='${LF_DEFAULT_IMG}'">
                ${shouldBlur ? `
                <div class="absolute inset-0 bg-slate-900/35 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none">
                    <span class="w-9 h-9 rounded-full bg-slate-900/80 border border-white/20 flex items-center justify-center mb-1.5">
                        <i class="fa-solid fa-eye-slash text-unsa-gold text-sm"></i>
                    </span>
                    <span class="text-[11px] font-extrabold tracking-wide uppercase">Documento Protegido</span>
                    <span class="text-[10px] text-slate-200">Imagen difuminada por privacidad</span>
                </div>` : ''}
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
            </div>`;

        const phone = onlyDigits(item.phone);
        const hasWhatsapp = !!(item.showWhatsapp && phone);
        const resolveBtnLabel = isLost ? 'Marcar como recuperado' : 'Marcar como devuelto';

        const contactButtonsBlock = isResolved
            ? `<div class="w-full mt-3 bg-slate-100 text-slate-500 font-semibold py-2 px-3 rounded-xl text-xs text-center">
                   Caso cerrado · Contacto deshabilitado
               </div>`
            : item.mine
                ? `<div class="w-full mt-2 bg-amber-50 border border-amber-200 text-amber-900 font-semibold py-2 px-3 rounded-xl text-[11px] text-center">
                       <i class="fa-solid fa-user-check mr-1"></i> Esta es tu publicación${item.hasVerification ? ' · Con verificación' : ''}
                   </div>`
                : `<div class="space-y-2 mt-3">
                       ${!isLost ? `
                       <button type="button" onclick="openClaimModal('${escapeHtml(item.id)}')"
                           class="w-full bg-unsa-maroon hover:bg-unsa-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm">
                           <i class="fa-solid fa-hand-holding-heart text-unsa-gold text-sm"></i> Reclamar este objeto
                       </button>
                       <button type="button" onclick="contactarPorChat('${escapeHtml(item.id)}')"
                           class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                           <i class="fa-solid fa-comments text-unsa-maroon text-sm"></i> Consultar por Chat UNSA
                       </button>` : `
                       <button type="button" onclick="contactarPorChat('${escapeHtml(item.id)}')"
                           class="w-full bg-unsa-maroon hover:bg-unsa-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm">
                           <i class="fa-solid fa-comments text-unsa-gold text-sm"></i> ¡Lo vi! Contactar por Chat
                       </button>`}
                       ${hasWhatsapp ? `
                       <a href="https://wa.me/51${phone}?text=Hola,%20te%20contacto%20desde%20UNSA%20Conecta%20por%20el%20objeto:%20${encodeURIComponent(item.title)}"
                          target="_blank" rel="noopener"
                          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                           <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp (${phone})
                       </a>` : ''}
                   </div>`;

        return `
            <div class="bg-white rounded-2xl border ${isResolved ? 'border-slate-300 opacity-85' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div>
                    ${imageBlock}

                    <div class="p-4">
                        <span class="text-[10px] font-bold uppercase text-unsa-maroon tracking-wider">${escapeHtml(item.category)}</span>
                        <h3 class="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">${escapeHtml(item.title)}</h3>
                        <p class="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <i class="fa-solid fa-location-dot text-red-500 w-4"></i> ${escapeHtml(item.location)}
                        </p>
                        ${mapLinkBlock}
                        <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                            <i class="fa-regular fa-clock text-unsa-gold w-4"></i> ${escapeHtml(formattedDate)}
                        </p>
                        ${custodyBadge}
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

                    ${contactButtonsBlock}
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
        updateLfPreviewBlur();
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

function onLfWhatsappToggle(checked) {
    const box = document.getElementById('lfWhatsappBox');
    const phoneInput = document.getElementById('lfPhoneInput');
    if (!box || !phoneInput) return;

    box.classList.toggle('hidden', !checked);
    phoneInput.required = checked;
    if (!checked) phoneInput.value = '';
}

async function contactarPorChat(id) {
    try {
        const data = await apiFetch(`/api/lost-found/${encodeURIComponent(id)}/contactar`, {
            method: 'POST'
        });
        window.location.href = `cuenta.html?chat=${encodeURIComponent(data.conversacionId)}`;
    } catch (err) {
        handleApiError(err);
    }
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
        showWhatsapp: document.getElementById('lfShowWhatsappInput').checked,
        phone: document.getElementById('lfPhoneInput').value,
        img: document.getElementById('lfImgInput').value,
        imageData: lfImageData,
        desc: document.getElementById('lfDescInput').value,
        hasSensitiveDoc: document.getElementById('lfSensitiveDocInput').checked,
        custodyType: document.querySelector('input[name="custodyType"]:checked')?.value || 'CONMIGO',
        custodyPoint: document.getElementById('lfCustodyPointInput').value,
        verificationQuestion: document.getElementById('lfVerificationQuestionInput').value,
        mapLocationId: document.getElementById('lfMapLocationInput').value
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

    onLfStatusChange(it.status);
    if (it.status === 'ENCONTRADO') {
        const cType = it.custodyType === 'PUNTO_SEGURO' ? 'PUNTO_SEGURO' : 'CONMIGO';
        const cRadio = document.querySelector(`input[name="custodyType"][value="${cType}"]`);
        if (cRadio) cRadio.checked = true;
        onLfCustodyChange(cType);
        document.getElementById('lfCustodyPointInput').value = it.custodyPoint || '';
        document.getElementById('lfVerificationQuestionInput').value = it.verificationQuestion || '';
    }

    document.getElementById('lfTitleInput').value = it.title;
    document.getElementById('lfCategoryInput').value = it.category;
    document.getElementById('lfCampusInput').value = it.campus;
    onLfCampusChange(it.campus, it.mapLocationId || '');
    document.getElementById('lfLocationInput').value = it.location;
    document.getElementById('lfDateInput').value = (it.datetime || '').slice(0, 16);

    const hasPhone = !!(it.showWhatsapp && it.phone);
    document.getElementById('lfShowWhatsappInput').checked = hasPhone;
    onLfWhatsappToggle(hasPhone);
    document.getElementById('lfPhoneInput').value = hasPhone ? it.phone : '';

    document.getElementById('lfImgInput').value = it.img || '';
    document.getElementById('lfDescInput').value = it.desc;
    document.getElementById('lfSensitiveDocInput').checked = !!it.hasSensitiveDoc;

    showLfPreview(safeUrl(it.img));
    setModalMode('lfModalTitle', 'lfSubmitBtn', true, 'Reportar Objeto', 'Publicar Reporte');
    openModal('lostFoundModal');
}

document.addEventListener('modalclosed', e => {
    setModalMode('lfModalTitle', 'lfSubmitBtn', false, 'Reportar Objeto', 'Publicar Reporte');
    if (e.detail === 'lostFoundModal') {
        lfEditingId = null;
        document.getElementById('lostFoundForm').reset();
        document.getElementById('lfSensitiveDocInput').checked = true;
        onLfWhatsappToggle(false);
        onLfCampusChange(document.getElementById('lfCampusInput').value);
        onLfStatusChange('PERDIDO');
        onLfCustodyChange('CONMIGO');
        clearLfImage();
        document.getElementById('lfUrlBox').classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const campusSelect = document.getElementById('lfCampusInput');
    if (campusSelect) onLfCampusChange(campusSelect.value);
    loadLostFound();
});

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

function onLfCategoryChange(category) {
    const checkbox = document.getElementById('lfSensitiveDocInput');
    if (!checkbox) return;
    checkbox.checked = (category === 'Documentos');
    updateLfPreviewBlur();
}

function updateLfPreviewBlur() {
    const preview = document.getElementById('lfImgPreview');
    const checkbox = document.getElementById('lfSensitiveDocInput');
    if (!preview || !checkbox) return;
    preview.classList.toggle('blur-md', checkbox.checked);
    preview.classList.toggle('scale-105', checkbox.checked);
}

function onLfStatusChange(status) {
    const section = document.getElementById('lfCustodySection');
    const pointInput = document.getElementById('lfCustodyPointInput');
    if (!section) return;

    const isFound = status === 'ENCONTRADO';
    section.classList.toggle('hidden', !isFound);

    if (!isFound && pointInput) {
        pointInput.required = false;
    } else if (isFound) {
        const selected = document.querySelector('input[name="custodyType"]:checked')?.value || 'CONMIGO';
        onLfCustodyChange(selected);
    }
}

function onLfCustodyChange(custodyType) {
    const box = document.getElementById('lfCustodyPointBox');
    const input = document.getElementById('lfCustodyPointInput');
    if (!box || !input) return;

    const isSafePoint = custodyType === 'PUNTO_SEGURO';
    box.classList.toggle('hidden', !isSafePoint);
    input.required = isSafePoint;
    if (!isSafePoint) input.value = '';
}

function setCustodyPoint(label) {
    const input = document.getElementById('lfCustodyPointInput');
    if (!input) return;
    input.value = label;
    input.focus();
}

function openClaimModal(id) {
    const item = lostFoundData.find(x => x.id === id);
    if (!item) return;

    document.getElementById('claimObjectId').value = item.id;
    document.getElementById('claimObjectTitle').textContent = item.title;
    document.getElementById('claimAnswerInput').value = '';

    const qBox = document.getElementById('claimQuestionBox');
    const qText = document.getElementById('claimQuestionText');
    const aLabel = document.getElementById('claimAnswerLabel');

    if (item.hasVerification && item.verificationQuestion) {
        qBox.classList.remove('hidden');
        qText.textContent = item.verificationQuestion;
        aLabel.textContent = 'Tu respuesta a la pregunta *';
    } else {
        qBox.classList.add('hidden');
        qText.textContent = '';
        aLabel.textContent = 'Indica una seña o detalle que demuestre que es tuyo *';
    }

    openModal('claimObjectModal');
}

async function handleClaimObject(e) {
    e.preventDefault();
    const id = document.getElementById('claimObjectId').value;
    const answer = document.getElementById('claimAnswerInput').value.trim();
    const btn = document.getElementById('claimSubmitBtn');
    const prevText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const data = await apiFetch(`/api/lost-found/${encodeURIComponent(id)}/reclamar`, {
            method: 'POST',
            body: { answer }
        });
        closeModal('claimObjectModal');
        window.location.href = `cuenta.html?chat=${encodeURIComponent(data.conversacionId)}`;
    } catch (err) {
        handleApiError(err);
    } finally {
        btn.disabled = false;
        btn.textContent = prevText;
    }
}