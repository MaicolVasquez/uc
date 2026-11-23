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
                        </div>
                        <p class="text-[11px] text-slate-300 hidden sm:block">Universidad Nacional de San Agustín de
                            Arequipa</p>
                    </div>
                </a>

                <!-- Desktop Navigation Tabs -->
                <nav class="hidden md:flex space-x-1 lg:space-x-2">${desktopNav}</nav>

                                <!-- Header Actions -->
                <div class="flex items-center gap-3">
                    <div id="bellWrap" class="relative">
                        <button id="bellBtn" onclick="toggleBellPanel(event)" title="Notificaciones"
                            class="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 relative w-10 h-10">
                            <i class="fa-regular fa-bell text-lg"></i>
                            <span id="bellBadge"
                                class="hidden absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold items-center justify-center border border-unsa-maroon">0</span>
                        </button>

                        <div id="bellPanel"
                            class="hidden absolute right-0 top-full mt-3 w-[22rem] max-w-[calc(100vw-1rem)] bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                            <div class="px-4 pt-4 pb-2 flex items-center justify-between">
                                <h3 class="text-xl font-extrabold text-slate-900">Notificaciones</h3>
                                <button onclick="bellMarkAllRead()"
                                    class="text-xs font-bold text-blue-600 hover:underline">Marcar todas como leídas</button>
                            </div>
                            <div class="px-4 pb-2 flex gap-2">
                                <button id="bellTabAll" onclick="bellSetTab('all')"
                                    class="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Todas</button>
                                <button id="bellTabUnread" onclick="bellSetTab('unread')"
                                    class="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100">No leídas</button>
                            </div>
                            <div id="bellList" class="max-h-[70vh] overflow-y-auto pb-2">
                                <p class="px-4 py-6 text-sm text-slate-400 text-center">Cargando...</p>
                            </div>
                        </div>
                    </div>

                    <a href="cuenta.html" id="headerUserLink" title="Mi cuenta"
                        class="hidden lg:flex items-center gap-2 pl-3 border-l border-white/20 hover:opacity-90 transition-opacity">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            alt="Avatar" class="w-9 h-9 rounded-full ring-2 ring-unsa-gold object-cover">
                        <div class="text-xs">
                            <p id="headerUserName" class="font-bold text-white leading-tight">Estudiante Agustino</p>
                            <p id="headerUserSub" class="text-slate-300 text-[10px]">Iniciar sesión / Crear cuenta</p>
                        </div>
                    </a>
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
`;
}

buildLayout();
// Convertir fecha de un formulario peruano a UTC.
function fechaInputPeruAUTC(valor) {
    if (!valor) return null;

    const fecha = new Date(`${valor}-05:00`);

    if (Number.isNaN(fecha.getTime())) return null;

    return fecha.toISOString();
}

// Convertir una fecha UTC al formato datetime-local de Perú.
function fechaUTCaInputPeru(valor) {
    if (!valor) return '';

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) return '';

    const partes = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Lima',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(fecha).map(p => [p.type, p.value])
    );

    return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}
// ---------- Sesión (backend Express) ----------
// Pregunta al servidor quién es el usuario autenticado y actualiza el botón del header.
// Devuelve el usuario o null (sin sesión / backend apagado / abierto con file://).
async function refreshHeaderUser() {
    let user = null;

    try {
        const res = await fetch('/api/perfil', {
            credentials: 'same-origin'
        });

        if (res.status === 401) {
            window.sessionStatus = 'unauthenticated';

        } else if (!res.ok) {
            window.sessionStatus = 'error';
            return window.currentUser || null;

        } else {
            user = (await res.json()).user;

            if (!user) {
                window.sessionStatus = 'error';
                return window.currentUser || null;
            }

            window.sessionStatus = 'authenticated';
        }

    } catch (e) {
        console.error('Error al verificar la sesión:', e);
        window.sessionStatus = 'error';
        return window.currentUser || null;
    }

    window.currentUser = user;

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
    document.dispatchEvent(new CustomEvent('modalclosed', { detail: id }));
}

// Promesa global: las páginas que necesiten el usuario (p. ej. cuenta.html) pueden hacer `await sessionReady`.
const sessionReady = refreshHeaderUser();

// Verificar la promesa y redirigir si es nula
sessionReady.then(user => {
    const currentPage = document.body.dataset.page;

    if (
    !user &&
    currentPage !== 'cuenta' &&
    window.sessionStatus === 'unauthenticated'
) {
    window.location.replace('cuenta.html');
}
});
// ---------- Campanita de notificaciones (estilo Facebook) ----------
let bellItems = [];
let bellTab = 'all';
let bellLastUnread = null;

const BELL_TYPES = {
    objeto_encontrado: { icon: 'fa-box-open', bg: 'bg-emerald-500' },
    mensaje: { icon: 'fa-comment-dots', bg: 'bg-blue-500' },
    anuncio_urgente: { icon: 'fa-triangle-exclamation', bg: 'bg-red-500' }
};

function bellEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function bellTimeAgo(iso) {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return 'hace ' + min + ' min';
    const h = Math.floor(min / 60);
    if (h < 24) return 'hace ' + h + ' h';
    const d = Math.floor(h / 24);
    if (d < 7) return 'hace ' + d + ' d';
    return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

async function bellFetch(url, method) {
    try {
        const res = await fetch(url, {
            method: method || 'GET',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: method === 'POST' ? '{}' : undefined
        });
        return res.ok ? await res.json() : null;
    } catch (e) {
        return null;
    }
}

function bellRenderBadge(n) {
    const badge = document.getElementById('bellBadge');
    if (!badge) return;
    badge.textContent = n > 9 ? '9+' : String(n);
    badge.classList.toggle('hidden', n === 0);
    badge.classList.add('flex');
}

function bellItemHtml(it) {
    const t = BELL_TYPES[it.tipo] || { icon: 'fa-bell', bg: 'bg-slate-500' };
    return `
        <button onclick="bellOpenItem('${bellEsc(it.id)}')"
            class="w-full text-left flex items-start gap-3 px-4 py-2.5 hover:bg-slate-100 transition-colors">
            <span class="w-12 h-12 rounded-full ${t.bg} text-white flex items-center justify-center shrink-0">
                <i class="fa-solid ${t.icon}"></i>
            </span>
            <span class="flex-1 min-w-0">
                <span class="block text-sm ${it.leida ? 'text-slate-600' : 'text-slate-900 font-bold'}">${bellEsc(it.titulo)}</span>
                ${it.detalle ? `<span class="block text-xs text-slate-500 line-clamp-2">${bellEsc(it.detalle)}</span>` : ''}
                <span class="block text-xs mt-0.5 ${it.leida ? 'text-slate-400' : 'text-blue-600 font-bold'}">${bellTimeAgo(it.creadoEn)}</span>
            </span>
            ${it.leida ? '' : '<span class="w-3 h-3 rounded-full bg-blue-600 shrink-0 mt-4"></span>'}
        </button>`;
}

function bellRenderList() {
    const list = document.getElementById('bellList');
    if (!list) return;

    const items = bellTab === 'unread' ? bellItems.filter(i => !i.leida) : bellItems;
    if (!items.length) {
        list.innerHTML = '<p class="px-4 py-8 text-sm text-slate-400 text-center">'
            + (bellTab === 'unread' ? 'No tienes notificaciones sin leer.' : 'Aún no tienes notificaciones.')
            + '</p>';
        return;
    }

    const hoy = new Date().toDateString();
    const deHoy = items.filter(i => new Date(i.creadoEn).toDateString() === hoy);
    const anteriores = items.filter(i => new Date(i.creadoEn).toDateString() !== hoy);

    let html = '';
    if (deHoy.length) {
        html += '<p class="px-4 pt-2 pb-1 text-sm font-extrabold text-slate-900">Hoy</p>' + deHoy.map(bellItemHtml).join('');
    }
    if (anteriores.length) {
        html += '<p class="px-4 pt-3 pb-1 text-sm font-extrabold text-slate-900">Anteriores</p>' + anteriores.map(bellItemHtml).join('');
    }
    list.innerHTML = html;
}

async function bellRefresh() {
    const data = await bellFetch('/api/mis-notificaciones');
    if (!data) {
        const list = document.getElementById('bellList');
        if (list) list.innerHTML = '<p class="px-4 py-8 text-sm text-red-500 text-center">No se pudieron cargar las notificaciones.</p>';
        return;
    }

    bellItems = data.items;
    bellRenderBadge(data.noLeidas);
    bellRenderList();

    // Aviso emergente cuando llega algo nuevo mientras navegas
    if (bellLastUnread !== null && data.noLeidas > bellLastUnread && bellItems[0]) {
        openNotificationToast(bellItems[0].titulo);
    }
    bellLastUnread = data.noLeidas;
}

function bellSetTab(tab) {
    bellTab = tab;
    const on = 'px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700';
    const off = 'px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100';
    document.getElementById('bellTabAll').className = tab === 'all' ? on : off;
    document.getElementById('bellTabUnread').className = tab === 'unread' ? on : off;
    bellRenderList();
}

function toggleBellPanel(e) {
    e.stopPropagation();
    const panel = document.getElementById('bellPanel');
    const abierto = !panel.classList.toggle('hidden');
    if (abierto) bellRefresh();
}

async function bellMarkAllRead() {
    await bellFetch('/api/mis-notificaciones/leer-todas', 'POST');
    bellItems.forEach(i => { i.leida = true; });
    bellLastUnread = 0;
    bellRenderBadge(0);
    bellRenderList();
}

async function bellOpenItem(id) {
    const it = bellItems.find(x => x.id === id);
    if (!it) return;
    if (!it.leida) {
        await bellFetch('/api/mis-notificaciones/' + encodeURIComponent(id) + '/leer', 'POST');
    }
    // Solo se navega a páginas internas (ej. cuenta.html?chat=...)
    if (it.enlace && /^[\w.\-]+\.html(\?[\w=&%\-]*)?$/.test(it.enlace)) {
        window.location.href = it.enlace;
    } else {
        bellRefresh();
    }
}

// Cerrar el panel al hacer clic fuera
document.addEventListener('click', e => {
    const panel = document.getElementById('bellPanel');
    if (panel && !e.target.closest('#bellWrap')) panel.classList.add('hidden');
});

// Cargar al iniciar sesión y revisar novedades cada 30 segundos
sessionReady.then(user => {
    if (!user) return;
    bellRefresh();
    setInterval(() => { if (!document.hidden) bellRefresh(); }, 30000);
});
