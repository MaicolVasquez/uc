const INITIAL_LOST_FOUND = [
    {
        id: 'lf-1',
        title: 'Carné Universitario a nombre de Diego Quispe',
        category: 'Documentos',
        campus: 'Ingenierías',
        location: 'Entrada del Pabellón de Ciencias de la Computación',
        datetime: '2026-10-06T10:30',
        status: 'ENCONTRADO',
        phone: '954321876',
        img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
        desc: 'Carné con mica protectora azul. Entregado temporalmente a la consejería del pabellón.'
    },
    {
        id: 'lf-2',
        title: 'Mochila negra marca HP con cuadernos de Física',
        category: 'Prendas',
        campus: 'Ingenierías',
        location: 'Cancha de básquet lateral',
        datetime: '2026-10-06T15:00',
        status: 'PERDIDO',
        phone: '988123456',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
        desc: 'Tiene un llavero en forma de Android y cuadernos rotulados con Ing. Mecánica.'
    },
    {
        id: 'lf-3',
        title: 'Audífonos inalámbricos Sony gris espacial',
        category: 'Electrónicos',
        campus: 'Sociales',
        location: 'Cafetería de la Escuela de Derecho',
        datetime: '2026-10-05T12:15',
        status: 'ENCONTRADO',
        phone: '977654321',
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
        desc: 'Encontrados sobre una mesa redonda cerca al pasto.'
    },
    {
        id: 'lf-4',
        title: 'Manojo de 3 llaves con llavero de UNSA Arequipa',
        category: 'Llaves',
        campus: 'Biomédicas',
        location: 'Bancas de entrada a la EP de Medicina',
        datetime: '2026-10-07T08:20',
        status: 'PERDIDO',
        phone: '912345678',
        img: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=80',
        desc: 'Tiene una llave dorada Yale y dos de candado pequeñas.'
    }
];

const INITIAL_ANNOUNCEMENTS = [
    {
        id: 'ann-1',
        title: '🚨 Suspensión de actividades en Campus Sociales por mantenimiento eléctrico',
        category: 'Huelgas',
        urgency: 'URGENTE',
        date: '07 de Octubre, 2026',
        campus: 'Sociales',
        content: 'Debido a trabajos programados en la subestación eléctrica del área de Sociales, las clases presenciales se suspenderán desde las 14:00 hrs hasta las 18:00 hrs. Coordinar clases virtuales con los docentes.'
    },
    {
        id: 'ann-2',
        title: '🌴 Feriado Académico Institucional por Aniversario Arequipeño / Interfacultades',
        category: 'Feriados',
        urgency: 'INFO',
        date: '12 de Octubre, 2026',
        campus: 'Todos los Campus',
        content: 'Se recuerda a la comunidad agustina que no habrá actividades académicas ni administrativas el día viernes por las jornadas de integración estudiantil interfacultades.'
    },
    {
        id: 'ann-3',
        title: '📚 Biblioteca Central UNSA: Ampliación de Horario Nocturno',
        category: 'Biblioteca',
        urgency: 'INFO',
        date: '05 de Octubre, 2026',
        campus: 'Ingenierías & Sociales',
        content: 'Atención por exámenes parciales: La sala de lectura de la Biblioteca Central extenderá su horario hasta las 22:00 hrs de lunes a viernes. Requisito presentar carné físico o virtual.'
    },
    {
        id: 'ann-4',
        title: '📝 Proceso de Regularización de Matrícula y Extemporáneos 2026-B',
        category: 'Tramites',
        urgency: 'EVENTO',
        date: '02 de Octubre, 2026',
        campus: 'DUA / Dirección Académica',
        content: 'El módulo de solicitudes extemporáneas en el portal SISUNSA estará habilitado hasta este viernes a las 23:59 hrs. Consultar requisitos en tu dirección de escuela.'
    }
];

const INITIAL_TUTORS = [
    {
        id: 'tut-1',
        name: 'Renato Vargas',
        career: 'Ing. de Sistemas',
        semester: '9no Semestre',
        faculty: 'Ingenierías',
        courses: ['Cálculo II', 'Algoritmos', 'Estructuras de Datos', 'Python'],
        modality: 'Presencial y Virtual',
        price: 'Voluntario / Colaborativo',
        phone: '954112233',
        rating: 4.9,
        reviews: 18,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        bio: 'Apasionado por la programación y las matemáticas aplicadas. Me gusta explicar con casos prácticos y ejercicios de exámenes pasados.'
    },
    {
        id: 'tut-2',
        name: 'Camila Mendoza',
        career: 'Medicina Humana',
        semester: '8vo Semestre',
        faculty: 'Biomédicas',
        courses: ['Anatomía Humana', 'Fisiología', 'Bioquímica'],
        modality: 'Presencial',
        price: 'S/ 12 x hora',
        phone: '988334455',
        rating: 5.0,
        reviews: 24,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        bio: 'Asesora en anfiteatro y laboratorios. Preparación intensiva para pasitos y parciales de la facultad de Medicina.'
    },
    {
        id: 'tut-3',
        name: 'Gonzalo Huamán',
        career: 'Derecho',
        semester: '10mo Semestre',
        faculty: 'Sociales',
        courses: ['Derecho Civil', 'Derecho Constitucional', 'Redacción Jurídica'],
        modality: 'Virtual',
        price: 'Gratuito',
        phone: '911223344',
        rating: 4.8,
        reviews: 12,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        bio: 'Miembro del Círculo de Estudios Constitucionales. Ayudo a estudiantes de primeros años a redactar ensayos y analizar doctrina.'
    }
];

const INITIAL_HUECOS = [
    {
        id: 'hue-1',
        title: '♟️ Retos de Ajedrez & Conversao',
        category: 'Juegos',
        campus: 'Ingenierías',
        location: 'Pasto frente a la Biblioteca de Ingenierías',
        time: '11:00 AM - 1:00 PM',
        capacity: 6,
        joined: 3,
        organizer: 'Mateo (Ing. Industrial)',
        phone: '955443322',
        desc: 'Traigo 2 tableros. Todos los niveles bienvenidos para pasar la hora libre relajados.'
    },
    {
        id: 'hue-2',
        title: '📚 Repaso de Parcial de Química General',
        category: 'Estudiar',
        campus: 'Biomédicas',
        location: 'Bancas de la Cafetería Central de Biomédicas',
        time: '02:00 PM - 04:00 PM',
        capacity: 5,
        joined: 4,
        organizer: 'Lucía (Enfermería)',
        phone: '966778899',
        desc: 'Resolvemos la guía de ejercicios del Prof. Paredes antes de la clase de las 4 PM.'
    },
    {
        id: 'hue-3',
        title: '☕ Charlar sobre música y bandas de Arequipa',
        category: 'Socializar',
        campus: 'Sociales',
        location: 'Cafetería de la Escuela de Comunicación',
        time: '12:00 PM - 01:30 PM',
        capacity: 8,
        joined: 5,
        organizer: 'Sofi (Arte & Literatura)',
        phone: '911998877',
        desc: 'Para matar el hueco entre clases, charlar de rock, indie y proyectos creativos.'
    }
];

// LocalStorage Initializers
let lostFoundData = JSON.parse(localStorage.getItem('unsa_lost_found')) || INITIAL_LOST_FOUND;
let announcementsData = JSON.parse(localStorage.getItem('unsa_announcements')) || INITIAL_ANNOUNCEMENTS;
let tutorsData = JSON.parse(localStorage.getItem('unsa_tutors')) || INITIAL_TUTORS;
let huecosData = JSON.parse(localStorage.getItem('unsa_huecos')) || INITIAL_HUECOS;

function saveData() {
    localStorage.setItem('unsa_lost_found', JSON.stringify(lostFoundData));
    localStorage.setItem('unsa_announcements', JSON.stringify(announcementsData));
    localStorage.setItem('unsa_tutors', JSON.stringify(tutorsData));
    localStorage.setItem('unsa_huecos', JSON.stringify(huecosData));
}

function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

    // Show selected
    const activeContent = document.getElementById(`tab-${tabId}-content`);
    if (activeContent) activeContent.classList.remove('hidden');

    // Reset navigation button highlights
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-white/20', 'text-white', 'font-bold');
        btn.classList.add('text-slate-200');
    });

    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-white/20', 'text-white', 'font-bold');
    }

    // Map resize fix when switching to maps tab
    if (tabId === 'maps') {
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 200);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function dismissUrgentBanner() {
    document.getElementById('topUrgentBanner').style.display = 'none';
}

function openNotificationToast(text) {
    const toast = document.getElementById('toastNotification');
    const toastText = document.getElementById('toastText');
    toastText.innerText = text;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3500);
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}


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


let map;
let currentMarkers = [];

// Coordinates for UNSA Campuses in Arequipa
const CAMPUS_COORDS = {
    ingenierias: { lat: -16.4061, lng: -71.5245, zoom: 17, name: "Área de Ingenierías" },
    sociales: { lat: -16.4045, lng: -71.5278, zoom: 17, name: "Área de Sociales" },
    biomedicas: { lat: -16.4082, lng: -71.5175, zoom: 17, name: "Área de Biomédicas" }
};

const UNSA_LOCATIONS = [
    // Ingenierías
    {
        id: 'loc-1',
        campusKey: 'ingenierias',
        campusName: 'Área de Ingenierías',
        title: 'Pabellón Cs. de la Computación',
        lat: -16.4062,
        lng: -71.5248,
        hours: '07:00 - 20:00 hrs',
        services: 'Labs de Software, Servidores GPU, Aulas Climatizadas',
        img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&auto=format&fit=crop&q=80',
        desc: 'Edificio de la Escuela Profesional de Ciencia de la Computación, cuenta con laboratorios de alto rendimiento e investigación en IA.'
    },
    {
        id: 'loc-2',
        campusKey: 'ingenierias',
        campusName: 'Área de Ingenierías',
        title: 'Biblioteca de Área de Ingenierías',
        lat: -16.4058,
        lng: -71.5242,
        hours: '07:30 - 21:00 hrs',
        services: 'Salas de estudio grupal, Cubículos, Repositorio Tesis',
        img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&auto=format&fit=crop&q=80',
        desc: 'Biblioteca especializada en libros de física, matemáticas, estructuras, minas y sistemas.'
    },
    {
        id: 'loc-3',
        campusKey: 'ingenierias',
        campusName: 'Área de Ingenierías',
        title: 'Pabellón de Ing. Civil y Estructuras',
        lat: -16.4067,
        lng: -71.5240,
        hours: '07:00 - 19:30 hrs',
        services: 'Laboratorio de Ensayo de Materiales, Aulas Magna',
        img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=500&auto=format&fit=crop&q=80',
        desc: 'Pabellón emblemático con laboratorios para pruebas de resistencia sísmica y concreto.'
    },
    // Sociales
    {
        id: 'loc-4',
        campusKey: 'sociales',
        campusName: 'Área de Sociales',
        title: 'Facultad de Derecho y Cs. Políticas',
        lat: -16.4043,
        lng: -71.5281,
        hours: '07:30 - 20:00 hrs',
        services: 'Sala de Juicios Orales, Biblioteca Especializada, Consultorio Jurídico',
        img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
        desc: 'Sede de la carrera de Derecho, equipada con salas de simulación de audiencias y auditorio principal.'
    },
    {
        id: 'loc-5',
        campusKey: 'sociales',
        campusName: 'Área de Sociales',
        title: 'Escuela Profesional de FIPS / Psicología',
        lat: -16.4048,
        lng: -71.5273,
        hours: '08:00 - 19:00 hrs',
        services: 'Cámara Gesell, Laboratorio de Psicometría, Cafetería',
        img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80',
        desc: 'Facultad de Filosofía, Humanidades y Psicología. Punto de encuentro estudiantil por sus jardines.'
    },
    // Biomédicas
    {
        id: 'loc-6',
        campusKey: 'biomedicas',
        campusName: 'Área de Biomédicas',
        title: 'Facultad de Medicina Humana',
        lat: -16.4081,
        lng: -71.5173,
        hours: '06:30 - 21:00 hrs',
        services: 'Anfiteatro Anatómico, Lab de Histología, Biblioteca Médica',
        img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
        desc: 'Sede principal de Medicina, Enfermería y Nutrición en Av. Alcides Carrión.'
    },
    {
        id: 'loc-7',
        campusKey: 'biomedicas',
        campusName: 'Área de Biomédicas',
        title: 'Comedor Universitario Biomédicas',
        lat: -16.4085,
        lng: -71.5178,
        hours: '11:30 - 14:30 hrs',
        services: 'Servicio de Nutrición, Menú Estudiantil, Ticketera Virtual',
        img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&auto=format&fit=crop&q=80',
        desc: 'Comedor universitario subsidiado para estudiantes agustinos acreditados.'
    }
];

let selectedLocation = UNSA_LOCATIONS[0];

function initMap() {
    // Center default on Ingenierías campus
    map = L.map('unsaMap').setView([CAMPUS_COORDS.ingenierias.lat, CAMPUS_COORDS.ingenierias.lng], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors | UNSA Conecta'
    }).addTo(map);

    renderMapMarkers();
    updateLocationPanel(UNSA_LOCATIONS[0]);
}

function renderMapMarkers(locations = UNSA_LOCATIONS) {
    // Clear old markers
    currentMarkers.forEach(m => map.removeLayer(m));
    currentMarkers = [];

    locations.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng]).addTo(map);
        marker.bindPopup(`
                    <div class="font-sans text-xs">
                        <strong class="text-unsa-maroon text-sm font-bold block">${loc.title}</strong>
                        <span class="text-slate-500">${loc.campusName}</span><br>
                        <button onclick="selectLocationById('${loc.id}')" class="mt-2 bg-unsa-maroon text-white font-bold px-2 py-1 rounded text-[10px]">
                            Ver Detalles
                        </button>
                    </div>
                `);

        marker.on('click', () => {
            updateLocationPanel(loc);
        });

        currentMarkers.push(marker);
    });
}

function zoomToCampus(key) {
    const coord = CAMPUS_COORDS[key];
    if (coord && map) {
        map.flyTo([coord.lat, coord.lng], coord.zoom, { duration: 1.5 });
    }
}

function selectLocationById(id) {
    const loc = UNSA_LOCATIONS.find(l => l.id === id);
    if (loc) {
        updateLocationPanel(loc);
        map.flyTo([loc.lat, loc.lng], 18);
    }
}

function updateLocationPanel(loc) {
    selectedLocation = loc;
    document.getElementById('locTitle').innerText = loc.title;
    document.getElementById('locCampus').innerHTML = `<i class="fa-solid fa-location-dot text-red-500"></i> ${loc.campusName}`;
    document.getElementById('locImg').src = loc.img;
    document.getElementById('locDesc').innerText = loc.desc;
    document.getElementById('locHours').innerText = loc.hours;
    document.getElementById('locServices').innerText = loc.services;
}

function searchMapLocation() {
    const query = document.getElementById('mapSearchInput').value.toLowerCase();
    const filtered = UNSA_LOCATIONS.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.campusName.toLowerCase().includes(query) ||
        l.services.toLowerCase().includes(query)
    );

    renderMapMarkers(filtered);
    if (filtered.length > 0) {
        selectLocationById(filtered[0].id);
    }
}

function getDirectionsToCurrent() {
    if (!selectedLocation) return;
    openNotificationToast(`Indicaciones para llegar a ${selectedLocation.title}: Ingresa por la garita principal de ${selectedLocation.campusName} y sigue las señalizaciones doradas.`);
}


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


window.onload = function () {
    // Render all components
    renderLostFound();
    renderAnnouncements();
    renderTutors();
    renderHuecos();

    // Initialize map after short delay for container dimensions
    setTimeout(() => {
        initMap();
    }, 300);
};