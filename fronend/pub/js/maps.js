// Módulo: UNSA Maps

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

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    // Ajuste de tamaño una vez calculado el layout
    setTimeout(() => { if (map) map.invalidateSize(); }, 200);
});
