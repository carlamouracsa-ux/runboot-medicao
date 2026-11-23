/* =====================================================================
   ETAPA 3 — ASSINATURAS
     3.1  o PDF tem assinatura digital (envelope DocuSign)
     3.2  cada página tem o mínimo de assinaturas do seu tipo
          (os mínimos ficam em CONFIG.assinaturasMinimas)
   A contagem por página é feita na leitura do PDF — ver
   contarAssinaturas() em etapa0_leitura.js
   ===================================================================== */

function etapa3_assinaturas(pdf) {
  const E = "3 - Assinaturas";
  log(`\nETAPA ${E}`);

  // 3.1 - certificado digital
  registrar(E, "Assinatura digital (envelope) no PDF",
    pdf.temCertificado ? "OK" : "ALERTA",
    pdf.temCertificado ? "" : "sem certificado digital — conferir visualmente");

  // 3.2 - assinaturas por página
  let faltando = 0;
  pdf.paginas.forEach((txt, i) => {
    const t = normalizar(txt);
    const regra = CONFIG.assinaturasMinimas.find(r => t.includes(normalizar(r.texto)));
    const minimo = regra ? regra.minimo : CONFIG.assinaturasPadrao;
    const achadas = pdf.assinaturas[i];
    if (achadas < minimo) {
      faltando++;
      registrar(E, "Página sem todas as assinaturas", "ERRO",
        `encontradas ${achadas} de ${minimo}${regra ? " (" + regra.texto + ")" : ""}`, i + 1);
    }
  });
  if (!faltando) registrar(E, "Todas as páginas assinadas", "OK", `${pdf.paginas.length} páginas`);
}
