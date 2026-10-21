// Módulo: Punto Hueco

let currentHuecoCat = 'ALL';

function renderHuecos(items = huecosData) {
    const grid = document.getElementById('huecosGrid');

    grid.innerHTML = items.map(hue => {
        const isFull = hue.joined >= hue.capacity;
        const progressPct = Math.min(100, Math.round((hue.joined / hue.capacity) * 100));

        return `
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                                    ${hue.category}
                                </span>
                                <span class="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sucediendo Hoy
                                </span>
                            </div>

                            <h3 class="font-extrabold text-slate-900 text-base mt-1">${hue.title}</h3>
                            
                            <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                                <p class="flex items-center gap-2">
                                    <i class="fa-solid fa-location-dot text-red-500 w-4"></i> 
                                    <span class="font-semibold text-slate-800">${hue.campus}:</span> ${hue.location}
                                </p>
                                <p class="flex items-center gap-2">
                                    <i class="fa-regular fa-clock text-unsa-gold w-4"></i> 
                                    <span class="font-semibold text-slate-800">Horario:</span> ${hue.time}
                                </p>
                                <p class="flex items-center gap-2">
                                    <i class="fa-solid fa-user-group text-slate-400 w-4"></i> 
                                    <span class="font-semibold text-slate-800">Organiza:</span> ${hue.organizer}
                                </p>
                            </div>

                            <p class="text-xs text-slate-600 mt-3 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                "${hue.desc}"
                            </p>

                            <!-- Capacity Progress Bar -->
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
                            <button onclick="joinHueco('${hue.id}')" ${isFull ? 'disabled' : ''} class="flex-1 ${isFull ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'} font-extrabold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1">
                                <i class="fa-solid fa-user-plus text-xs"></i> ${isFull ? 'Aforo Lleno' : '¡Unirme al Hueco!'}
                            </button>
                            <a href="https://wa.me/51${hue.phone}?text=Hola%20${encodeURIComponent(hue.organizer)},%20quiero%20unirme%20al%20Punto%20Hueco:%20${encodeURIComponent(hue.title)}" 
                               target="_blank" 
                               class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center justify-center" 
                               title="Chat WhatsApp">
                                <i class="fa-brands fa-whatsapp text-emerald-600 text-base"></i>
                            </a>
                        </div>
                    </div>
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

    if (cat === 'ALL') {
        renderHuecos(huecosData);
    } else {
        renderHuecos(huecosData.filter(h => h.category === cat));
    }
}

function joinHueco(id) {
    const item = huecosData.find(h => h.id === id);
    if (item && item.joined < item.capacity) {
        item.joined += 1;
        saveData();
        renderHuecos(currentHuecoCat === 'ALL' ? huecosData : huecosData.filter(h => h.category === currentHuecoCat));
        openNotificationToast(`Te has unido al grupo "${item.title}". Coordina por WhatsApp con ${item.organizer}.`);
    }
}

function handleSaveHueco(e) {
    e.preventDefault();
    const title = document.getElementById('huecoTitle').value;
    const category = document.getElementById('huecoCategory').value;
    const campus = document.getElementById('huecoCampus').value;
    const location = document.getElementById('huecoLocation').value;
    const time = document.getElementById('huecoTime').value;
    const capacity = parseInt(document.getElementById('huecoCapacity').value) || 6;
    const organizer = document.getElementById('huecoOrganizer').value;
    const phone = document.getElementById('huecoPhone').value;
    const desc = document.getElementById('huecoDesc').value;

    const newHueco = {
        id: 'hue-' + Date.now(),
        title,
        category,
        campus,
        location,
        time,
        capacity,
        joined: 1,
        organizer,
        phone,
        desc: desc || 'Reunión libre de hora libre en el campus.'
    };

    huecosData.unshift(newHueco);
    saveData();
    renderHuecos();
    closeModal('huecoCreateModal');
    document.getElementById('huecoCreateForm').reset();
    openNotificationToast('¡Punto Hueco publicado! Tus compañeros podrán unirse.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderHuecos();
});
