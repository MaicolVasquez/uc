// Módulo: Objetos Perdidos
 
const LF_DEFAULT_IMG = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80';
 
async function loadLostFound() {
    try {
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
                <p class="font-bold text-sm">No se encontraron objetos registrados.</p>
            </div>`;
        return;
    }
 
    grid.innerHTML = items.map(item => {
        const isLost = item.status === 'PERDIDO';
        const statusBadge = isLost
            ? `<span class="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> PERDIDO</span>`
            : `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> ENCONTRADO</span>`;
 
        const formattedDate = item.datetime
            ? new Date(item.datetime).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
            : '';
        const img = escapeHtml(safeUrl(item.img) || LF_DEFAULT_IMG);
        const phone = onlyDigits(item.phone);
 
        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div>
                    <div class="relative h-44 overflow-hidden bg-slate-100">
                        <img src="${img}" alt="${escapeHtml(item.title)}"
                             class="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                             onerror="this.src='${LF_DEFAULT_IMG}'">
                        <div class="absolute top-3 left-3">${statusBadge}</div>
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
 
                <div class="p-4 pt-0 border-t border-slate-100 mt-2">
                    <a href="https://wa.me/51${phone}?text=Hola,%20te%20contacto%20desde%20UNSA%20Conecta%20por%20el%20objeto:%20${encodeURIComponent(item.title)}"
                       target="_blank" rel="noopener"
                       class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                        <i class="fa-brands fa-whatsapp text-sm"></i> Contactar al WhatsApp (${phone})
                    </a>
                </div>
            </div>`;
    }).join('');
}
 
function filterLostFound() {
    const query = document.getElementById('lfSearch').value.toLowerCase();
    const status = document.getElementById('lfStatusFilter').value;
    const campus = document.getElementById('lfCampusFilter').value;
    const category = document.getElementById('lfCategoryFilter').value;
 
    const filtered = lostFoundData.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query);
        const matchesStatus = status === 'ALL' || item.status === status;
        const matchesCampus = campus === 'ALL' || item.campus === campus;
        const matchesCategory = category === 'ALL' || item.category === category;
        return matchesQuery && matchesStatus && matchesCampus && matchesCategory;
    });
 
    renderLostFound(filtered);
}
 
async function handleSaveLostFound(e) {
    e.preventDefault();
    const payload = {
        status: document.querySelector('input[name="status"]:checked').value,
        title: document.getElementById('lfTitleInput').value,
        category: document.getElementById('lfCategoryInput').value,
        campus: document.getElementById('lfCampusInput').value,
        location: document.getElementById('lfLocationInput').value,
        datetime: document.getElementById('lfDateInput').value,
        phone: document.getElementById('lfPhoneInput').value,
        img: document.getElementById('lfImgInput').value,
        desc: document.getElementById('lfDescInput').value
    };
 
    try {
        await apiFetch('/api/lost-found', { method: 'POST', body: payload });
        await loadLostFound();
        closeModal('lostFoundModal');
        document.getElementById('lostFoundForm').reset();
        openNotificationToast('Objeto publicado correctamente en la red de la UNSA.');
    } catch (err) {
        handleApiError(err);
    }
}
 
document.addEventListener('DOMContentLoaded', loadLostFound);