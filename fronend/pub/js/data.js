let lostFoundData = [];
let announcementsData = [];
let tutorsData = [];
let huecosData = [];
 
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