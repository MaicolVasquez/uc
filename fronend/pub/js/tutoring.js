// Módulo: Estudiante a Estudiante (Tutorías)
 
const TUTOR_DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
 
async function loadTutors() {
    try {
        tutorsData = await apiFetch('/api/tutors');
        filterTutors();
    } catch (err) {
        handleApiError(err);
    }
}
 
function renderTutors(items = tutorsData) {
    const grid = document.getElementById('tutorsGrid');
 
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-graduation-cap text-4xl mb-2"></i>
                <p class="font-bold text-sm">Aún no hay tutores registrados.</p>
            </div>`;
        return;
    }
 
    grid.innerHTML = items.map(tut => {
        const coursesBadges = tut.courses.map(c =>
            `<span class="bg-amber-50 text-unsa-maroon font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200">${escapeHtml(c)}</span>`
        ).join(' ');
 
        return `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-start gap-3">
                        <img src="${TUTOR_DEFAULT_AVATAR}" alt="${escapeHtml(tut.name)}" class="w-14 h-14 rounded-full object-cover ring-2 ring-unsa-gold">
                        <div>
                            <h3 class="font-bold text-slate-900 text-base">${escapeHtml(tut.name)}</h3>
                            <p class="text-xs font-semibold text-unsa-maroon">${escapeHtml(tut.career)} (${escapeHtml(tut.semester)})</p>
                            <p class="text-[11px] text-slate-500"><i class="fa-solid fa-graduation-cap"></i> Área de ${escapeHtml(tut.faculty)}</p>
                        </div>
                    </div>
 
                    <div class="mt-4">
                        <p class="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Cursos ofertados:</p>
                        <div class="flex flex-wrap gap-1">${coursesBadges}</div>
                    </div>
 
                    <p class="text-xs text-slate-600 mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "${escapeHtml(tut.bio)}"
                    </p>
 
                    <div class="mt-3 text-xs space-y-1 text-slate-600">
                        <p><span class="font-bold">Modalidad:</span> ${escapeHtml(tut.modality)}</p>
                        <p><span class="font-bold">Precio/Condición:</span> <span class="text-emerald-700 font-extrabold">${escapeHtml(tut.price)}</span></p>
                    </div>
                </div>
 
                <a href="https://wa.me/51${onlyDigits(tut.phone)}?text=Hola%20${encodeURIComponent(tut.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria"
                   target="_blank" rel="noopener"
                   class="w-full mt-4 bg-unsa-maroon hover:bg-unsa-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> Solicitar Asesoría por WhatsApp
                </a>
            </div>`;
    }).join('');
}
 
function filterTutors() {
    const query = document.getElementById('tutorSearch').value.toLowerCase();
    const faculty = document.getElementById('tutorFacultyFilter').value;
    const modality = document.getElementById('tutorModalityFilter').value;
 
    const filtered = tutorsData.filter(tut => {
        const matchesQuery = tut.name.toLowerCase().includes(query) ||
            tut.courses.some(c => c.toLowerCase().includes(query)) ||
            tut.career.toLowerCase().includes(query);
        const matchesFaculty = faculty === 'ALL' || tut.faculty === faculty;
        const matchesModality = modality === 'ALL' || tut.modality.includes(modality);
        return matchesQuery && matchesFaculty && matchesModality;
    });
 
    renderTutors(filtered);
}
 
async function handleSaveTutor(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('tutorName').value,
        career: document.getElementById('tutorCareer').value,
        semester: document.getElementById('tutorSemester').value,
        faculty: document.getElementById('tutorFaculty').value,
        courses: document.getElementById('tutorCourses').value.split(',').map(s => s.trim()).filter(Boolean),
        modality: document.getElementById('tutorModality').value,
        price: document.getElementById('tutorPrice').value,
        phone: document.getElementById('tutorPhone').value,
        bio: document.getElementById('tutorBio').value
    };
 
    try {
        await apiFetch('/api/tutors', { method: 'POST', body: payload });
        await loadTutors();
        closeModal('tutorRegisterModal');
        document.getElementById('tutorRegisterForm').reset();
        openNotificationToast('¡Te has registrado exitosamente como Tutor Agustino!');
    } catch (err) {
        handleApiError(err);
    }
}
 
async function handleSaveTutorRequest(e) {
    e.preventDefault();
    const payload = {
        course: document.getElementById('reqCourse').value,
        studentInfo: document.getElementById('reqStudentInfo').value,
        phone: document.getElementById('reqPhone').value,
        details: document.getElementById('reqDetails').value
    };
 
    try {
        await apiFetch('/api/asesorias', { method: 'POST', body: payload });
        closeModal('tutorRequestModal');
        e.target.reset();
        openNotificationToast('Tu solicitud de asesoría fue enviada al tablón estudiantil.');
    } catch (err) {
        handleApiError(err);
    }
}
 
document.addEventListener('DOMContentLoaded', loadTutors);