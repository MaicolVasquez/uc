// Módulo: Estudiante a Estudiante (Tutorías)

function renderTutors(items = tutorsData) {
    const grid = document.getElementById('tutorsGrid');

    grid.innerHTML = items.map(tut => {
        const coursesBadges = tut.courses.map(c =>
            `<span class="bg-amber-50 text-unsa-maroon font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200">${c}</span>`
        ).join(' ');

        return `
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                        <div>
                            <div class="flex items-start gap-3">
                                <img src="${tut.avatar}" alt="${tut.name}" class="w-14 h-14 rounded-full object-cover ring-2 ring-unsa-gold">
                                <div>
                                    <h3 class="font-bold text-slate-900 text-base">${tut.name}</h3>
                                    <p class="text-xs font-semibold text-unsa-maroon">${tut.career} (${tut.semester})</p>
                                    <p class="text-[11px] text-slate-500"><i class="fa-solid fa-graduation-cap"></i> Área de ${tut.faculty}</p>
                                    <div class="flex items-center gap-1 mt-1 text-amber-500 text-xs font-bold">
                                        <i class="fa-solid fa-star"></i> ${tut.rating} <span class="text-slate-400 text-[10px]">(${tut.reviews} valoraciones)</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4">
                                <p class="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Cursos ofertados:</p>
                                <div class="flex flex-wrap gap-1">
                                    ${coursesBadges}
                                </div>
                            </div>

                            <p class="text-xs text-slate-600 mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                "${tut.bio}"
                            </p>

                            <div class="mt-3 text-xs space-y-1 text-slate-600">
                                <p><span class="font-bold">Modalidad:</span> ${tut.modality}</p>
                                <p><span class="font-bold">Precio/Condición:</span> <span class="text-emerald-700 font-extrabold">${tut.price}</span></p>
                            </div>
                        </div>

                        <a href="https://wa.me/51${tut.phone}?text=Hola%20${encodeURIComponent(tut.name)},%20te%20contacto%20desde%20UNSA%20Conecta%20para%20una%20tutoria" 
                           target="_blank" 
                           class="w-full mt-4 bg-unsa-maroon hover:bg-unsa-dark text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                            <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i> Solicitar Asesoría por WhatsApp
                        </a>
                    </div>
                `;
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

function handleSaveTutor(e) {
    e.preventDefault();
    const name = document.getElementById('tutorName').value;
    const career = document.getElementById('tutorCareer').value;
    const semester = document.getElementById('tutorSemester').value;
    const faculty = document.getElementById('tutorFaculty').value;
    const coursesStr = document.getElementById('tutorCourses').value;
    const modality = document.getElementById('tutorModality').value;
    const price = document.getElementById('tutorPrice').value;
    const phone = document.getElementById('tutorPhone').value;
    const bio = document.getElementById('tutorBio').value;

    const newTutor = {
        id: 'tut-' + Date.now(),
        name,
        career,
        semester,
        faculty,
        courses: coursesStr.split(',').map(s => s.trim()),
        modality,
        price,
        phone,
        rating: 5.0,
        reviews: 1,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: bio || 'Estudiante tutor dispuesto a ayudar en cursos clave.'
    };

    tutorsData.unshift(newTutor);
    saveData();
    renderTutors();
    closeModal('tutorRegisterModal');
    document.getElementById('tutorRegisterForm').reset();
    openNotificationToast('¡Te has registrado exitosamente como Tutor Agustino!');
}

function handleSaveTutorRequest(e) {
    e.preventDefault();
    closeModal('tutorRequestModal');
    openNotificationToast('Tu solicitud de asesoría fue enviada al tablón estudiantil.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderTutors();
});
