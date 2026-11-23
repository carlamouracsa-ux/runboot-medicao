/* =====================================================================
   ETAPA 0 — LEITURA DOS ARQUIVOS
   Lê o Excel (biblioteca SheetJS) e o PDF (biblioteca PDF.js)
   ===================================================================== */

/** Lê o Excel e devolve { ciclo, fornecedor, codFornecedor, objeto }. */
function lerExcel(bytes) {
  const wb = XLSX.read(bytes, { type: "array" });
  const aba = wb.Sheets[wb.SheetNames[0]];   // primeira aba
  const linhas = XLSX.utils.sheet_to_json(aba, { header: 1, raw: false, defval: "" });

  const excel = {};
  for (const [chave, rotulos] of Object.entries(CONFIG.rotulosExcel)) {
    excel[chave] = valorAoLado(linhas, rotulos);
  }
  log(`Excel: fornecedor="${excel.fornecedor}"  ciclo="${excel.ciclo}"`);
  return excel;
}

/** Acha a célula com o rótulo e devolve o 1º valor preenchido à direita. */
function valorAoLado(linhas, rotulos) {
  const alvos = rotulos.map(r => normalizar(r).replace(/\./g, ""));
  for (const linha of linhas) {
    for (let c = 0; c < linha.length; c++) {
      const txt = normalizar(linha[c]).replace(/[\s:]+$/, "").replace(/\./g, "");
      if (txt && alvos.includes(txt)) {
        for (let k = c + 1; k < Math.min(linha.length, c + 6); k++) {
          if (String(linha[k]).trim() !== "") return String(linha[k]).trim();
        }
      }
    }
  }
  return "";
}

/** Lê o PDF e devolve:
 *   paginas         -> texto de cada página (posição 0 = página 1)
 *   assinaturas     -> nº de assinaturas encontradas em cada página
 *   temCertificado  -> se o PDF tem assinatura digital (envelope)     */
async function lerPdf(bytes) {
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const paginas = [], assinaturas = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n);
    paginas.push(await textoDaPagina(pagina));
    assinaturas.push(await contarAssinaturas(pagina));
  }

  let temCertificado = false;
  try {
    const campos = (await pdf.getFieldObjects()) || {};
    temCertificado = Object.values(campos).flat().some(c => c.type === "signature");
  } catch (e) { /* PDF sem formulário */ }

  log(`PDF: ${pdf.numPages} páginas`);
  return { paginas, assinaturas, temCertificado };
}

/** Monta o texto da página linha a linha (de cima para baixo, da esquerda
 *  para a direita), juntando os pedaços que estão na mesma altura. */
async function textoDaPagina(pagina) {
  const { items } = await pagina.getTextContent();
  const pedacos = items
    .filter(i => i.str.trim() !== "")
    .map(i => ({ txt: i.str, x: i.transform[4], y: i.transform[5], larg: i.width }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const linhas = [];
  for (const p of pedacos) {
    const ultima = linhas[linhas.length - 1];
    if (ultima && Math.abs(ultima.y - p.y) <= 3) ultima.itens.push(p);
    else linhas.push({ y: p.y, itens: [p] });
  }
  return linhas.map(l => {
    l.itens.sort((a, b) => a.x - b.x);
    let txt = "", fimAnterior = null;
    for (const it of l.itens) {
      if (fimAnterior !== null && it.x - fimAnterior > 1) txt += " ";
      txt += it.txt;
      fimAnterior = it.x + it.larg;
    }
    return txt.replace(/\s+/g, " ").trim();
  }).join("\n");
}

/** Conta as assinaturas da página.
 *  Como funciona: o DocuSign "carimba" cada assinatura como uma IMAGEM dentro
 *  de um bloco próprio (Form XObject) por cima da página. Imagens soltas na
 *  página (logos, fotos) NÃO contam.
 *  -> Se os PDFs vierem de outra ferramenta de assinatura, ajuste aqui. */
async function contarAssinaturas(pagina) {
  const ops = await pagina.getOperatorList({ annotationMode: pdfjsLib.AnnotationMode.DISABLE });
  const O = pdfjsLib.OPS;
  const tiposImagem = [O.paintImageXObject, O.paintInlineImageXObject, O.paintImageMaskXObject];
  let dentroDeBloco = 0, total = 0;
  for (const op of ops.fnArray) {
    if (op === O.paintFormXObjectBegin) dentroDeBloco++;
    else if (op === O.paintFormXObjectEnd) dentroDeBloco--;
    else if (dentroDeBloco > 0 && tiposImagem.includes(op)) total++;
  }
  return total;
}

/** Lê o texto do CICLO ('01/09/2026 a 30/09/2026') em { ini, fim }. */
function cicloDoExcel(excel) {
  const datas = String(excel.ciclo || "").match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  if (datas.length < 2) return { ini: null, fim: null };
  return { ini: lerData(datas[0]), fim: lerData(datas[1]) };
}
