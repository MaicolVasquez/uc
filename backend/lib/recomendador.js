// Recomendador de tutores. Funciones puras: no tocan la base de datos.
// Lee el catálogo de backend/data/sistemas.json (cursos, áreas y prerrequisitos).
const catalogo = require('../data/sistemas.json');

// ---- Valores ajustables ----
const VALOR = { 1: 100, 2: 65, 3: 30 };   // nivel del tutor -> puntos
const PESO = { prioritario: 3, secundario: 1 };
const DESCUENTO = 0.6;                    // por cada salto de prerrequisito
const MAX_SALTOS = 2;
const NIVEL_TXT = { 1: 'especialista', 2: 'conocimiento intermedio', 3: 'conocimiento básico' };

const porCodigo = new Map(catalogo.cursos.map(c => [c.codigo, c]));

// P -> cursos que lo tienen como requisito que "cuenta" (saber X sugiere saber P)
const siguientes = new Map();
for (const c of catalogo.cursos) {
    for (const r of c.requisitos) {
        if (!r.cuenta) continue;
        if (!siguientes.has(r.codigo)) siguientes.set(r.codigo, []);
        siguientes.get(r.codigo).push(c.codigo);
    }
}

// Cursos que, si el tutor los domina, sugieren que sabe `codigo`: Map(curso -> saltos)
function implicadores(codigo) {
    const res = new Map();
    let frente = [codigo];
    for (let saltos = 1; saltos <= MAX_SALTOS; saltos++) {
        const sig = [];
        for (const p of frente) {
            for (const x of siguientes.get(p) || []) {
                if (!res.has(x)) { res.set(x, saltos); sig.push(x); }
            }
        }
        frente = sig;
    }
    return res;
}

// Cuánto domina el tutor un curso: lo declarado gana; si no, se infiere por prerrequisitos
function dominio(niveles, codigo) {
    if (niveles[codigo]) return { valor: VALOR[niveles[codigo]], via: 'directo', nivel: niveles[codigo] };
    let mejor = { valor: 0, via: 'ninguno' };
    for (const [x, saltos] of implicadores(codigo)) {
        const n = niveles[x];
        if (n && n <= 2) {                       // solo nivel 1 o 2 permite inferir
            const valor = VALOR[n] * Math.pow(DESCUENTO, saltos);
            if (valor > mejor.valor) mejor = { valor, via: 'prerrequisito', desde: x };
        }
    }
    return mejor;
}

function explicar(detalle) {
    return detalle.map(d => {
        if (d.via === 'directo') return `${d.curso}: ${NIVEL_TXT[d.nivel]}`;
        if (d.via === 'prerrequisito') return `${d.curso}: sugerido por ${porCodigo.get(d.desde).nombre}`;
        return `${d.curso}: sin registro`;
    }).join(' · ');
}

// niveles: { codigoCurso: 1|2|3 } del tutor. Devuelve null si no cubre ningún prioritario.
function puntuar(niveles, prioritarios, secundarios) {
    let suma = 0, pesos = 0, cubiertos = 0;
    const detalle = [];
    const items = [...prioritarios.map(c => [c, PESO.prioritario]), ...secundarios.map(c => [c, PESO.secundario])];
    for (const [codigo, peso] of items) {
        const d = dominio(niveles, codigo);
        suma += peso * d.valor;
        pesos += peso;
        if (peso === PESO.prioritario && d.valor > 0) cubiertos++;
        detalle.push({ codigo, curso: porCodigo.get(codigo).nombre, ...d });
    }
    if (!cubiertos) return null;
    return { puntaje: Math.round((suma / pesos) * 100) / 100, cubiertos, explicacion: explicar(detalle) };
}

// ---- Validación de lo que llega del navegador ----
function limpiarNiveles(obj) {
    const res = {};
    if (!obj || typeof obj !== 'object') return res;
    for (const [codigo, n] of Object.entries(obj).slice(0, 20)) {
        const c = porCodigo.get(codigo);
        if (c && c.tutorable && [1, 2, 3].includes(Number(n))) res[codigo] = Number(n);
    }
    return res;
}

function codigosValidos(lista, max) {
    const out = [];
    for (const c of Array.isArray(lista) ? lista : []) {
        const cod = String(c);
        const curso = porCodigo.get(cod);
        if (curso && curso.tutorable && !out.includes(cod)) out.push(cod);
    }
    return out.slice(0, max);
}

const nombresDe = niveles => Object.keys(niveles).map(c => porCodigo.get(c).nombre).join(', ');

// Lo que ve el navegador: solo cursos tutorables y sin los prerrequisitos
const catalogoPublico = catalogo.cursos.filter(c => c.tutorable).map(
    ({ codigo, nombre, area, semestre, electivo, mencion, alias }) =>
        ({ codigo, nombre, area, semestre, electivo, mencion, alias })
);

module.exports = { puntuar, limpiarNiveles, codigosValidos, nombresDe, catalogoPublico, dominio };
