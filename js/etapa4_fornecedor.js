/* =====================================================================
   ETAPA 4 — FORNECEDOR (PDF) x FORNECEDOR (EXCEL)
     4.1  nome em EMPRESA / CONTRATADO / CONTRATADA = fornecedor do Excel
     4.2  CÓDIGO DO FORNECEDOR do PDF = código do Excel
   ===================================================================== */

function etapa4_fornecedor(excel, paginas) {
  const E = "4 - Fornecedor";
  log(`\nETAPA ${E}`);

  const fornExcel = normalizar(excel.fornecedor);
  if (!fornExcel) return registrar(E, "Ler FORNECEDOR no Excel", "ERRO", "não encontrado");

  // 4.1 - nomes do fornecedor no PDF  ->  { nome: [páginas] }
  const nomes = {};
  paginas.forEach((txt, i) => {
    for (const m of txt.matchAll(/(?:EMPRESA|CONTRATAD[OA])\s*:\s*(.+)/g)) {
      const nome = normalizar(m[1].split(/ADITIVO|PRAZO/)[0]);
      if (nome) (nomes[nome] ||= []).push(i + 1);
    }
  });
  if (!Object.keys(nomes).length) registrar(E, "Fornecedor no PDF", "ERRO", "nenhum campo EMPRESA/CONTRATADO encontrado");
  for (const [nome, pags] of Object.entries(nomes)) {
    const bate = nome.includes(fornExcel) || fornExcel.includes(nome);
    registrar(E, bate ? "Fornecedor PDF = Excel" : "Fornecedor PDF diferente do Excel",
      bate ? "OK" : "ERRO", `PDF: ${nome} | Excel: ${fornExcel}`, resumirPaginas(pags));
  }

  // 4.2 - código do fornecedor
  const codExcel = String(excel.codFornecedor || "").trim();
  const vazios = [], diferentes = [];
  paginas.forEach((txt, i) => {
    for (const linha of txt.split("\n")) {
      const m = linha.match(/^\s*C[OÓ]DIGO DO FORNECEDOR\s*:\s*(\d*)/);
      if (!m) continue;
      if (!m[1]) vazios.push(i + 1);
      else if (m[1] !== codExcel) diferentes.push(i + 1);
    }
  });
  if (vazios.length) registrar(E, "CÓDIGO DO FORNECEDOR em branco no PDF", "ALERTA", `Excel: ${codExcel}`, resumirPaginas(vazios));
  if (diferentes.length) registrar(E, "CÓDIGO DO FORNECEDOR diferente do Excel", "ERRO", `Excel: ${codExcel}`, resumirPaginas(diferentes));
}
