// Datos compartidos por todos los módulos (datasets iniciales + persistencia en localStorage)

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
