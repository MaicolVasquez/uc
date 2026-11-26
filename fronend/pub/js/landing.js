const modules = [
    ['fa-box-open', 'Objetos perdidos', 'Reporta, encuentra y recupera pertenencias.', 'index.html'],
    ['fa-graduation-cap', 'Tutorías', 'Encuentra tutores y comparte conocimientos.', 'tutorias.html'],
    ['fa-mug-hot', 'Punto Hueco', 'Organiza actividades y aprovecha tus horas libres.', 'punto-hueco.html'],
    ['fa-map-location-dot', 'Mapa UNSA', 'Ubica escuelas y espacios de los campus.', 'mapa.html'],
    ['fa-comments', 'Mensajes', 'Conversa con otros estudiantes en la plataforma.', 'cuenta.html?mensajes=1'],
    ['fa-bullhorn', 'Avisos y comunidad', 'Consulta novedades y administra tu actividad.', 'notificaciones.html']
];

function loginHref(target) {
    return 'cuenta.html?next=' + encodeURIComponent(target);
}

document.querySelector('#features').innerHTML = modules.map(([icon, title, desc, href]) => `
    <a class="uc-panel"
       href="${loginHref(href)}"
       data-protected-link="${href}">
        <span class="uc-ico"><i class="fa-solid ${icon}"></i></span>
        <h3>${title}</h3>
        <p>${desc}</p>
        <span class="uc-link">Explorar módulo →</span>
    </a>
`).join('');

async function actualizarEnlacesProtegidos() {
    try {
        const res = await fetch('/api/perfil', {
            credentials: 'same-origin'
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!data.user) return;

        document.querySelectorAll('[data-protected-link]')
            .forEach(link => {
                link.href = link.dataset.protectedLink;
            });

    } catch (e) {
        // Si falla, se mantienen los href hacia cuenta.html?next=...
    }
}

actualizarEnlacesProtegidos();

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            e.target.querySelectorAll('[data-count]').forEach(n => {
                let start = performance.now(), end = +n.dataset.count;
                const tick = t => {
                    n.textContent = Math.round(end * Math.min(1, (t - start) / 750));
                    if (t - start < 750) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
            observer.unobserve(e.target);
        }
    }), { threshold: .12 });

    document.querySelectorAll('.land-features,.land-metrics,.land-charts,.land-cta')
        .forEach(el => {
            el.classList.add('reveal-ready');
            observer.observe(el);
        });
}