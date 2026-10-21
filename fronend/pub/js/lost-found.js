// Módulo: Objetos Perdidos

function renderLostFound(items = lostFoundData) {
    const grid = document.getElementById('lostFoundGrid');
    if (items.length === 0) {
        grid.innerHTML = `
                    <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <i class="fa-solid fa-folder-open text-4xl mb-2"></i>
                        <p class="font-bold text-sm">No se encontraron objetos registrados.</p>
                    </div>
                `;
        return;
    }

    grid.innerHTML = items.map(item => {
        const isLost = item.status === 'PERDIDO';
        const statusBadge = isLost
            ? `<span class="bg-red-100 text-red-700 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> PERDIDO</span>`
            : `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> ENCONTRADO</span>`;

        const formattedDate = new Date(item.datetime).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });

        return `
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                        <div>
                            <div class="relative h-44 overflow-hidden bg-slate-100">
                                <img src="${item.img || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80'}" 
                                     alt="${item.title}" 
                                     class="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                     onerror="this.src='https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80'">
                                <div class="absolute top-3 left-3">
                                    ${statusBadge}
                                </div>
                                <div class="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    ${item.campus}
                                </div>
                            </div>

                            <div class="p-4">
                                <span class="text-[10px] font-bold uppercase text-unsa-maroon tracking-wider">${item.category}</span>
                                <h3 class="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">${item.title}</h3>
                                <p class="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <i class="fa-solid fa-location-dot text-red-500 w-4"></i> ${item.location}
                                </p>
                                <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <i class="fa-regular fa-clock text-unsa-gold w-4"></i> ${formattedDate}
                                </p>
                                <p class="text-xs text-slate-600 mt-3 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    "${item.desc || 'Sin descripción adicional.'}"
                                </p>
                            </div>
                        </div>

                        <div class="p-4 pt-0 border-t border-slate-100 mt-2">
                            <a href="https://wa.me/51${item.phone}?text=Hola,%20te%20contacto%20desde%20UNSA%20Conecta%20por%20el%20objeto:%20${encodeURIComponent(item.title)}" 
                               target="_blank" 
                               class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                                <i class="fa-brands fa-whatsapp text-sm"></i> Contactar al WhatsApp (${item.phone})
                            </a>
                        </div>
                    </div>
                `;
    }).join('');
}

function filterLostFound() {
    const query = normalizeText(document.getElementById('lfSearch').value.trim());
    const status = document.getElementById('lfStatusFilter').value;
    const campus = document.getElementById('lfCampusFilter').value;
    const category = document.getElementById('lfCategoryFilter').value;

    const filtered = lostFoundData.filter(item => {
        // Busca también en campus y categoría (el placeholder menciona "facultades").
        const matchesQuery = [item.title, item.location, item.desc, item.campus, item.category]
            .some(field => normalizeText(field).includes(query));
        const matchesStatus = status === 'ALL' || item.status === status;
        const matchesCampus = campus === 'ALL' || item.campus === campus;
        const matchesCategory = category === 'ALL' || item.category === category;

        return matchesQuery && matchesStatus && matchesCampus && matchesCategory;
    });

    renderLostFound(filtered);
}

function handleSaveLostFound(e) {
    e.preventDefault();
    const status = document.querySelector('input[name="status"]:checked').value;
    const title = document.getElementById('lfTitleInput').value;
    const category = document.getElementById('lfCategoryInput').value;
    const campus = document.getElementById('lfCampusInput').value;
    const location = document.getElementById('lfLocationInput').value;
    const datetime = document.getElementById('lfDateInput').value;
    const phone = document.getElementById('lfPhoneInput').value;
    const img = document.getElementById('lfImgInput').value;
    const desc = document.getElementById('lfDescInput').value;

    const newItem = {
        id: 'lf-' + Date.now(),
        title,
        category,
        campus,
        location,
        datetime,
        status,
        phone,
        img: img || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80',
        desc
    };

    lostFoundData.unshift(newItem);
    saveData();
    renderLostFound();
    closeModal('lostFoundModal');
    document.getElementById('lostFoundForm').reset();
    openNotificationToast(' Objeto publicado correctamente en la red de la UNSA.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderLostFound();
});
