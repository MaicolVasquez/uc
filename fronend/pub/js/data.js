
const INITIAL_LOST_FOUND = [];

const INITIAL_ANNOUNCEMENTS = [];

const INITIAL_TUTORS = [];

const INITIAL_HUECOS = [];

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
