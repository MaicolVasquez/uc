// Layout compartido: banner urgente, cabecera, toast y footer + utilidades de UI comunes.
// Cada página solo declara <body data-page="..."> y este script pinta el resto.

const NAV_ITEMS = [
    { id: 'lost-found', href: 'index.html', icon: 'fa-box-open', label: 'Objetos Perdidos', mobile: 'Objetos Perdidos', footer: 'Objetos Perdidos' },
    { id: 'maps', href: 'mapa.html', icon: 'fa-map-location-dot', label: 'UNSA Maps', mobile: 'UNSA Maps (Croquis)', footer: 'UNSA Maps' },
    { id: 'announcements', href: 'notificaciones.html', icon: 'fa-bullhorn', label: 'Notificaciones', mobile: 'Notificaciones e Info', footer: 'Avisos', badge: true },
    { id: 'tutoring', href: 'tutorias.html', icon: 'fa-graduation-cap', label: 'Estudiante a Estudiante', mobile: 'Estudiante a Estudiante', footer: 'Tutores' },
    { id: 'huecos', href: 'punto-hueco.html', icon: 'fa-mug-hot', label: 'Punto Hueco', mobile: 'Punto Hueco', footer: 'Punto Hueco' }
];

function buildLayout() {
    const current = document.body.dataset.page;

    const desktopNav = NAV_ITEMS.map(n => {
        const active = n.id === current ? 'bg-white/20 text-white font-bold' : 'text-slate-200';
        return `
                    <a id="nav-${n.id}" href="${n.href}"
                        class="nav-btn px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${active} hover:text-white hover:bg-white/10 relative">
                        <i class="fa-solid ${n.icon} text-unsa-gold"></i> ${n.label}
                        ${n.badge ? '<span class="w-2 h-2 rounded-full bg-red-400 absolute top-2 right-1 animate-ping"></span>' : ''}
                    </a>`;
    }).join('');

    const mobileNav = NAV_ITEMS.map(n => `
            <a href="${n.href}"
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${n.id === current ? 'bg-white/20 text-white font-bold' : 'text-slate-200'} hover:bg-white/10 flex items-center gap-3">
                <i class="fa-solid ${n.icon} text-unsa-gold w-5"></i> ${n.mobile}
            </a>`).join('');

    const accountMobile = `
            <a href="cuenta.html"
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${current === 'cuenta' ? 'bg-white/20 text-white font-bold' : 'text-slate-200'} hover:bg-white/10 flex items-center gap-3 border-t border-white/10 mt-2 pt-3">
                <i class="fa-solid fa-user text-unsa-gold w-5"></i> <span id="mobileUserLabel">Mi cuenta</span>
            </a>`;

    const footerLinks = NAV_ITEMS.map(n => `
                <a href="${n.href}" class="hover:text-white">${n.footer}</a>`).join('');

    document.getElementById('layout-top').innerHTML = `

    <header class="bg-unsa-maroon text-white sticky top-0 z-40 shadow-xl border-b border-unsa-gold/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <!-- Brand Logo & Title -->
                <a href="index.html" class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-xl bg-gradient-to-br from-unsa-gold to-amber-600 flex items-center justify-center text-unsa-maroon font-black text-2xl shadow-lg border border-yellow-200">
                        U
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-extrabold text-xl tracking-tight text-white">UNSA<span
                                    class="text-unsa-gold">Conecta</span></span>
                            <span
                                class="bg-unsa-bright text-xs px-2 py-0.5 rounded-md border border-white/20 font-medium text-yellow-100">v2.5</span>
                        </div>
                        <p class="text-[11px] text-slate-300 hidden sm:block">Universidad Nacional de San Agustín de
                            Arequipa</p>
                    </div>
                </a>

                <!-- Desktop Navigation Tabs -->
                <nav class="hidden md:flex space-x-1 lg:space-x-2">${desktopNav}</nav>

                <!-- Header Actions -->
                <div class="hidden lg:flex items-center gap-3">
                    <button
                        onclick="openNotificationToast('Bienvenido a UNSA Conecta. Todos tus datos están vigentes.')"
                        class="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 relative">
                        <i class="fa-regular fa-bell text-lg"></i>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-unsa-gold rounded-full"></span>
                    </button>
                    <a href="cuenta.html" id="headerUserLink" title="Mi cuenta"
                        class="flex items-center gap-2 pl-3 border-l border-white/20 hover:opacity-90 transition-opacity">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            alt="Avatar" class="w-9 h-9 rounded-full ring-2 ring-unsa-gold object-cover">
                        <div class="text-xs">
                            <p id="headerUserName" class="font-bold text-white leading-tight">Estudiante Agustino</p>
                            <p id="headerUserSub" class="text-slate-300 text-[10px]">Iniciar sesión / Crear cuenta</p>
                        </div>
                    </a>
                </div>
                    </div>
                </div>

                <!-- Mobile Menu Toggle Button -->
                <div class="flex md:hidden items-center">
                    <button id="mobileMenuBtn" onclick="toggleMobileMenu()"
                        class="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none">
                        <i class="fa-solid fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Dropdown Navigation Menu -->
        <div id="mobileMenu" class="hidden md:hidden bg-unsa-dark border-t border-white/10 px-4 pt-2 pb-4 space-y-1">${mobileNav}${accountMobile}
        </div>
    </header>
`;

    document.getElementById('layout-bottom').innerHTML = `
    <div id="toastNotification"
        class="fixed bottom-5 right-5 z-50 hidden bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-unsa-gold/40 flex items-center gap-3 transition-all duration-300 transform translate-y-2">
        <i class="fa-solid fa-circle-check text-unsa-gold text-lg"></i>
        <span id="toastText" class="text-xs font-semibold">Operación completada con éxito.</span>
    </div>

    <footer class="bg-unsa-slate text-slate-400 py-8 border-t border-slate-800 text-xs mt-12">
        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3">
                <div
                    class="w-8 h-8 rounded-lg bg-unsa-gold text-unsa-maroon font-black flex items-center justify-center text-lg">
                    U
                </div>
                <div>
                    <p class="text-white font-bold text-sm">UNSA Conecta - Portal de Vida Estudiantil</p>
                    <p class="text-slate-500">Desarrollado para la comunidad agustina de la Universidad Nacional de San
                        Agustín de Arequipa.</p>
                </div>
            </div>
            <div class="flex items-center gap-6 text-slate-400">${footerLinks}</div>
        </div>
    </footer>
`;
}

buildLayout();

// ---------- Sesión (backend Express) ----------
// Pregunta al servidor quién es el usuario autenticado y actualiza el botón del header.
// Devuelve el usuario o null (sin sesión / backend apagado / abierto con file://).
async function refreshHeaderUser() {
    let user = null;
    try {
        const res = await fetch('/api/perfil', { credentials: 'same-origin' });
        if (res.ok) user = (await res.json()).user;
    } catch (e) { /* backend no disponible */ }

    const name = document.getElementById('headerUserName');
    const sub = document.getElementById('headerUserSub');
    const mobile = document.getElementById('mobileUserLabel');
    if (user) {
        name.textContent = user.nombre || user.email.split('@')[0];
        sub.textContent = user.email;
        if (mobile) mobile.textContent = user.nombre || user.email;
    } else {
        name.textContent = 'Estudiante Agustino';
        sub.textContent = 'Iniciar sesión / Crear cuenta';
        if (mobile) mobile.textContent = 'Iniciar sesión / Crear cuenta';
    }
    return user;
}

// ---------- Utilidades de UI comunes ----------
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

// Promesa global: las páginas que necesiten el usuario (p. ej. cuenta.html) pueden hacer `await sessionReady`.
const sessionReady = refreshHeaderUser();
