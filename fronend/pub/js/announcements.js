// Módulo: Notificaciones e Info

let currentAnnCategory = 'ALL';

function renderAnnouncements(items = announcementsData) {
    const grid = document.getElementById('announcementsGrid');

    grid.innerHTML = items.map(ann => {
        const isUrgent = ann.urgency === 'URGENTE';
        const urgencyBadge = isUrgent
            ? `<span class="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse"><i class="fa-solid fa-triangle-exclamation"></i> Urgente</span>`
            : ann.urgency === 'EVENTO'
                ? `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">📅 Evento</span>`
                : `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">ℹ️ Información</span>`;

        return `
                    <div class="bg-white p-5 rounded-2xl border ${isUrgent ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div class="flex items-center gap-2">
                                ${urgencyBadge}
                                <span class="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md">${ann.category}</span>
                            </div>
                            <span class="text-xs text-slate-400 font-medium"><i class="fa-regular fa-calendar mr-1"></i> ${ann.date}</span>
                        </div>
                        <h3 class="text-lg font-extrabold text-slate-900 mt-1">${ann.title}</h3>
                        <p class="text-xs text-slate-500 font-semibold mt-0.5"><i class="fa-solid fa-building-columns text-unsa-maroon mr-1"></i> Campus Afectado: ${ann.campus}</p>
                        <p class="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            ${ann.content}
                        </p>
                    </div>
                `;
    }).join('');
}

function filterAnnouncements() {
    const urgency = document.getElementById('urgencyFilter').value;
    let filtered = announcementsData;

    if (urgency !== 'ALL') {
        filtered = filtered.filter(a => a.urgency === urgency);
    }
    if (currentAnnCategory !== 'ALL') {
        filtered = filtered.filter(a => a.category === currentAnnCategory);
    }

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

document.addEventListener('DOMContentLoaded', () => {
    renderAnnouncements();
});
