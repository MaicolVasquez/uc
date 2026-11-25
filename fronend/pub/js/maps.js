// Módulo: UNSA Maps

let map;
let currentMarkers = [];

// Coordinates for UNSA Campuses in Arequipa
const CAMPUS_COORDS = {
    ingenierias: { lat: -16.404847519276583, lng: -71.52654518189568, zoom: 17, name: "Área de Ingenierías" },
    sociales: { lat: -16.40587738269871, lng: -71.52057711573453, zoom: 17, name: "Área de Sociales" },
    biomedicas: { lat: -16.413179842280762, lng: -71.53404182627942, zoom: 17, name: "Área de Biomédicas" }
};

const UNSA_LOCATIONS = [
    // Ingenierías
    {
        id: 'loc-1',
        campusKey: 'ingenierias',
        campusName: 'Área de Ingenierías',
        title: 'Pabellón Cs. de la Computación',
        lat: -16.404920,
        lng: -71.526480,
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
        lat: -16.405450,
        lng: -71.525620,
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
        lat: -16.405100,
        lng: -71.524950,
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
        lat: -16.405820,
        lng: -71.520450,
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
        lat: -16.406150,
        lng: -71.521100,
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
        lat: -16.412850,
        lng: -71.533800,
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
        lat: -16.413500,
        lng: -71.534400,
        hours: '11:30 - 14:30 hrs',
        services: 'Servicio de Nutrición, Menú Estudiantil, Ticketera Virtual',
        img: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500&auto=format&fit=crop&q=80',
        desc: 'Comedor universitario subsidiado para estudiantes agustinos acreditados.'
    }
];

let selectedLocation = null;
let currentCampus = 'ALL';

// Normalizar las búsquedas
function normalizeMapText(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// Inicializar Leaflet
function initMap() {

    map = L.map('unsaMap', {
        zoomControl: false,
        minZoom: 12,
        maxZoom: 19
    }).setView([-16.406, -71.529], 14);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    refreshMapLocations();

    // Adaptar el mapa al tamaño de su contenedor
    if (typeof ResizeObserver !== 'undefined') {

        const observer = new ResizeObserver(() => {
            map.invalidateSize();
        });

        observer.observe(
            document.getElementById('unsaMap')
        );
    }
}

// Crear marcador personalizado
function createMapIcon(selected = false) {

    return L.divIcon({

        className: selected
            ? 'unsa-map-pin selected'
            : 'unsa-map-pin',

        html: `
            <span>
                <i class="fa-solid fa-building-columns"></i>
            </span>
        `,

        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]

    });
}

// Obtener lugares según los filtros
function getFilteredLocations() {

    const query = normalizeMapText(
        document.getElementById('mapSearchInput').value
    );

    return UNSA_LOCATIONS.filter(loc => {

        const matchesCampus =
            currentCampus === 'ALL' ||
            loc.campusKey === currentCampus;

        const matchesQuery = [
            loc.title,
            loc.campusName,
            loc.services,
            loc.desc
        ].some(value =>
            normalizeMapText(value).includes(query)
        );

        return matchesCampus && matchesQuery;

    });
}

// Mostrar marcadores
function renderMapMarkers(locations = UNSA_LOCATIONS) {

    currentMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    currentMarkers = [];

    locations.forEach(loc => {

        const marker = L.marker(
            [loc.lat, loc.lng],
            {
                icon: createMapIcon(
                    selectedLocation?.id === loc.id
                ),
                title: loc.title
            }
        ).addTo(map);

        marker.locationId = loc.id;

        marker.bindPopup(`

            <div class="font-sans text-xs">

                <strong class="text-unsa-maroon text-sm font-bold">
                    ${escapeHtml(loc.title)}
                </strong>

                <p class="text-slate-500">
                    ${escapeHtml(loc.campusName)}
                </p>

            </div>

        `);

        marker.on('click', () => {
            updateLocationPanel(loc);
        });

        currentMarkers.push(marker);

    });
}

// Mostrar resultados en el panel lateral
function renderLocationList(locations) {

    const list = document.getElementById(
        'mapLocationsList'
    );

    const counter = document.getElementById(
        'mapResultsCount'
    );

    counter.textContent = locations.length === 1
        ? '1 ubicación encontrada'
        : `${locations.length} ubicaciones encontradas`;

    if (!locations.length) {

        list.innerHTML = `
            <div class="unsa-map-empty">

                <i class="fa-solid fa-map-location-dot text-2xl mb-3"></i>

                <p>No encontramos ubicaciones.</p>

                <p>Prueba con otro nombre o área.</p>

            </div>
        `;

        return;
    }

    list.replaceChildren();

    locations.forEach(loc => {

        const button = document.createElement('button');

        button.type = 'button';

        button.className = 'unsa-location-item';

        if (selectedLocation?.id === loc.id) {
            button.classList.add('active');
        }

        button.setAttribute(
            'aria-pressed',
            String(selectedLocation?.id === loc.id)
        );

        button.innerHTML = `

            <div class="unsa-location-icon">

                <i class="fa-solid fa-building-columns"></i>

            </div>

            <div class="min-w-0">

                <strong>
                    ${escapeHtml(loc.title)}
                </strong>

                <small>
                    ${escapeHtml(loc.campusName)}
                </small>

            </div>

        `;

        button.addEventListener('click', () => {
            selectLocationById(loc.id);
        });

        list.appendChild(button);

    });
}

// Ajustar el mapa a los resultados
function fitMapLocations(locations) {

    if (!locations.length) return;

    if (locations.length === 1) {

        map.setView(
            [locations[0].lat, locations[0].lng],
            17
        );

        return;
    }

    const bounds = L.latLngBounds(
        locations.map(loc => [loc.lat, loc.lng])
    );

    map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 17
    });
}

// Actualizar búsqueda, lista y marcadores
function refreshMapLocations() {

    const locations = getFilteredLocations();

    if (
        selectedLocation &&
        !locations.some(loc => loc.id === selectedLocation.id)
    ) {

        selectedLocation = null;

        document.getElementById('locationDetailPanel')
            .classList.add('hidden');

    }

    renderMapMarkers(locations);
    renderLocationList(locations);
    fitMapLocations(locations);

}

// Cambiar campus activo
function setActiveCampusButton(key) {

    document.querySelectorAll('.campus-btn')
        .forEach(btn => {

            const active = btn.dataset.campus === key;

            btn.classList.toggle('active', active);

            btn.setAttribute(
                'aria-pressed',
                String(active)
            );

        });
}

// Filtrar por campus
function zoomToCampus(key) {

    if (!map) return;

    if (key !== 'ALL' && !CAMPUS_COORDS[key]) {
        return;
    }

    currentCampus = key;

    document.getElementById('mapSearchInput').value = '';

    selectedLocation = null;

    document.getElementById('locationDetailPanel')
        .classList.add('hidden');

    setActiveCampusButton(key);

    refreshMapLocations();

    if (
        key !== 'ALL' &&
        getFilteredLocations().length === 0
    ) {

        const coord = CAMPUS_COORDS[key];

        map.setView(
            [coord.lat, coord.lng],
            coord.zoom
        );

    }
}

// Seleccionar un lugar
function selectLocationById(id) {

    const loc = UNSA_LOCATIONS.find(
        location => location.id === id
    );

    if (!loc || !map) return;

    updateLocationPanel(loc);

    map.flyTo([loc.lat, loc.lng], 18, {
        duration: .8
    });

    const marker = currentMarkers.find(
        item => item.locationId === loc.id
    );

    if (marker) {
        marker.openPopup();
    }
}

// Actualizar detalles de una ubicación
function updateLocationPanel(loc) {

    selectedLocation = loc;

    document.getElementById('locationDetailPanel')
        .classList.remove('hidden');

    document.getElementById('locTitle').textContent =
        loc.title;

    document.getElementById('locCampus').textContent =
        loc.campusName;

    document.getElementById('locDesc').textContent =
        loc.desc;

    document.getElementById('locHours').textContent =
        loc.hours || 'No especificado';

    document.getElementById('locServices').textContent =
        loc.services || 'No especificado';

    currentMarkers.forEach(marker => {

        marker.setIcon(
            createMapIcon(marker.locationId === loc.id)
        );

    });

    renderLocationList(getFilteredLocations());

}

// Buscar lugares
function searchMapLocation() {

    if (!map) return;

    refreshMapLocations();

}

// Abrir indicaciones en Google Maps
function getDirectionsToCurrent() {

    if (!selectedLocation) return;

    const destination =
        `${selectedLocation.lat},${selectedLocation.lng}`;

    const url =
        'https://www.google.com/maps/dir/?api=1' +
        '&destination=' + encodeURIComponent(destination) +
        '&travelmode=walking';

    window.open(
        url,
        '_blank',
        'noopener,noreferrer'
    );

}

// Inicialización del módulo
document.addEventListener('DOMContentLoaded', () => {

    initMap();

    const params = new URLSearchParams(
        window.location.search
    );

    const locId = params.get('loc');
    const campusKey = params.get('campus');

    if (locId) {

        const loc = UNSA_LOCATIONS.find(
            item => item.id === locId
        );

        if (loc) {

            zoomToCampus(loc.campusKey);
            selectLocationById(loc.id);

        }

    } else if (
        campusKey && CAMPUS_COORDS[campusKey]
    ) {

        zoomToCampus(campusKey);

    }

    setTimeout(() => {

        if (map) {
            map.invalidateSize();
        }

    }, 200);

});