/* =====================================================================
   UTILIDADES — funções de apoio usadas por todas as etapas
   (normalmente não precisa mexer aqui)
   ===================================================================== */

const MESES = {
  JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
  JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12,
};

// Lista com o resultado de cada conferência (vira o relatório)
let resultados = [];

/** Guarda um resultado. status = "OK", "ERRO" ou "ALERTA". */
function registrar(etapa, verificacao, status, detalhe = "", pagina = "") {
  resultados.push({ etapa, verificacao, status, detalhe, pagina: String(pagina) });
  log(`[${status}] ${verificacao}${detalhe ? " — " + detalhe : ""}${pagina ? " (pág. " + pagina + ")" : ""}`);
}

/** Escreve uma linha no painel "Andamento" (ou no console, fora do navegador). */
function log(msg) {
  const el = typeof document !== "undefined" && document.getElementById("log");
  if (el) { el.textContent += msg + "\n"; el.scrollTop = el.scrollHeight; }
  else console.log(msg);
}

/** Maiúsculas, sem acentos e sem espaços duplicados. */
function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ").trim().toUpperCase();
}

/** Converte '01/09/2026', '01/09/26', '1-set-26' ou '01/09' em Date. */
function lerData(texto, anoPadrao = null) {
  const t = normalizar(texto).replace(/[.,;]+$/, "");
  let d, mes, ano, m;
  if ((m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/))) {
    d = +m[1]; mes = +m[2]; ano = m[3];
  } else if ((m = t.match(/^(\d{1,2})[-\/ ]([A-Z]{3})[A-Z]*[-\/ ](\d{2,4})$/)) && MESES[m[2]]) {
    d = +m[1]; mes = MESES[m[2]]; ano = m[3];
  } else {
    return null;
  }
  ano = ano === undefined ? anoPadrao : (+ano < 100 ? +ano + 2000 : +ano);
  if (!ano) return null;
  const data = new Date(ano, mes - 1, d);
  return data.getMonth() === mes - 1 ? data : null;   // descarta 31/09 etc.
}

/** Converte 'set/26', 'SETEMBRO 2026', '09/2026' em {mes, ano}. */
function lerMesAno(texto) {
  const t = normalizar(texto);
  let m = t.match(/\b([A-Z]{3})[A-Z]*\s*[\/ -]\s*(?:DE\s+)?(\d{2,4})\b/);
  if (m && MESES[m[1]]) return { mes: MESES[m[1]], ano: +m[2] < 100 ? +m[2] + 2000 : +m[2] };
  m = t.match(/\b(\d{1,2})\/(\d{4})\b/);
  if (m) return { mes: +m[1], ano: +m[2] };
  return null;
}

function mesmaData(a, b) { return a && b && a.getTime() === b.getTime(); }

function fmt(d) {
  if (!d) return "?";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/** [2,3,4,5,9] -> '2-5, 9' */
function resumirPaginas(pags) {
  const p = [...new Set(pags)].sort((a, b) => a - b);
  const faixas = [];
  let ini = p[0];
  for (let i = 0; i < p.length; i++) {
    if (p[i + 1] !== p[i] + 1) {
      faixas.push(ini === p[i] ? `${ini}` : `${ini}-${p[i]}`);
      ini = p[i + 1];
    }
  }
  return faixas.join(", ");
}

/** Semelhança entre dois textos, de 0 (nada a ver) a 1 (iguais). */
function semelhanca(a, b) {
  if (!a.length && !b.length) return 1;
  let ant = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      atual[j] = Math.min(ant[j] + 1, atual[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    ant = atual;
  }
  return 1 - ant[b.length] / Math.max(a.length, b.length);
}
