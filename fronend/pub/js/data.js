let lostFoundData = [];
let announcementsData = [];
let tutorsData = [];
let huecosData = [];
const isAdmin = () => window.currentUser && window.currentUser.rol === 'admin';

// fetch con sesión + manejo de errores uniforme
async function apiFetch(url, { method = 'GET', body } = {}) {
    const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* sin cuerpo */ }
    if (!res.ok) {
        const err = new Error((data && data.error) || 'Error inesperado (' + res.status + ')');
        err.status = res.status;
        throw err;
    }
    return data;
}

// Ahora los datos los ven TODOS los usuarios, así que hay que escapar todo lo que se pinta con innerHTML.
function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
function onlyDigits(v) { return String(v ?? '').replace(/\D/g, ''); }

function handleApiError(err) {
    openNotificationToast(err.status === 401
        ? 'Inicia sesión en "Mi cuenta" para publicar o participar.'
        : err.message);
}
async function deleteItem(kind, id, reload) {
    if (!confirm('¿Eliminar esta publicación? No se puede deshacer.')) return;
    try {
        await apiFetch(`/api/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        await reload();
        openNotificationToast('Publicación eliminada.');
    } catch (err) {
        handleApiError(err);
    }
}

// Botón rojo que solo se dibuja si el usuario es admin
function adminDeleteBtn(kind, id, reloadFn) {
    if (!isAdmin()) return '';
    return `<button onclick="deleteItem('${kind}','${escapeHtml(id)}',${reloadFn})"
        class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs" title="Eliminar (admin)">
        <i class="fa-solid fa-trash"></i></button>`;
}
function deleteBtn(kind, item, reloadFn) {
    if (!(isAdmin() || item.mine)) return '';
    const title = item.mine ? 'Eliminar mi publicación' : 'Eliminar (admin)';
    return `<button onclick="deleteItem('${kind}','${escapeHtml(item.id)}',${reloadFn})"
        class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs" title="${title}">
        <i class="fa-solid fa-trash"></i></button>`;
}
function editBtn(fnName, item) {
    if (!item.mine) return '';
    return `<button onclick="${fnName}('${escapeHtml(item.id)}')"
        class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs" title="Editar mi publicación">
        <i class="fa-solid fa-pen"></i></button>`;
}
function setModalMode(titleId, btnId, editing, newTitle, newBtn) {
    document.getElementById(titleId).textContent = editing ? 'Editar publicación' : newTitle;
    document.getElementById(btnId).textContent = editing ? 'Guardar cambios' : newBtn;
}