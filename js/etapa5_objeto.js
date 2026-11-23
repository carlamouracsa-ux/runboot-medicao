/* =====================================================================
   ETAPA 5 — (EXTRA) OBJETO DO CONTRATO (PDF) x OBJETO (EXCEL)
   Serve para pegar cabeçalho copiado de outro contrato.
   ===================================================================== */

function etapa5_objeto(excel, paginas) {
  const E = "5 - Objeto (extra)";
  log(`\nETAPA ${E}`);

  const objExcel = normalizar(excel.objeto).replace(/\.$/, "");
  if (!objExcel) return registrar(E, "Ler OBJETO no Excel", "ALERTA", "não encontrado");

  const objetos = {};   // { objeto: [páginas] }
  paginas.forEach((txt, i) => {
    for (const m of txt.matchAll(/OBJETO\s*:\s*(.+)/g)) {
      const obj = normalizar(m[1]).replace(/\.$/, "");
      if (obj) (objetos[obj] ||= []).push(i + 1);
    }
  });
  for (const [obj, pags] of Object.entries(objetos)) {
    const bate = semelhanca(obj, objExcel) >= CONFIG.semelhancaMinObjeto;
    registrar(E, bate ? "Objeto PDF = Excel" : "Objeto do PDF diferente do Excel",
      bate ? "OK" : "ERRO", `PDF: ${obj}`, resumirPaginas(pags));
  }
}
