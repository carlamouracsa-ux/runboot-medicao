/* =====================================================================
   CONFIGURAÇÃO  —  altere aqui o que muda de um contrato para outro
   ===================================================================== */

const CONFIG = {

  // Liga (true) / desliga (false) cada etapa da conferência
  etapas: {
    fotos: true,        // ETAPA 1 - Relatório fotográfico x planilha
    periodo: true,      // ETAPA 2 - Período x ciclo
    assinaturas: true,  // ETAPA 3 - Assinaturas
    fornecedor: true,   // ETAPA 4 - Fornecedor
    objeto: true,       // ETAPA 5 - (extra) Objeto do contrato
  },

  // Rótulos procurados no EXCEL (o valor é a primeira célula preenchida à direita).
  // Pode ter mais de uma grafia — a planilha atual tem "FORNCEDOR" (sem E).
  rotulosExcel: {
    ciclo: ["CICLO"],
    fornecedor: ["FORNECEDOR", "FORNCEDOR"],
    codFornecedor: ["COD. FORNECEDOR", "CODIGO FORNECEDOR", "COD FORNECEDOR"],
    objeto: ["OBJETO DO CONTRATO"],
  },

  // Títulos que identificam cada parte do PDF
  titulos: {
    planilha: "PLANILHA DE MEDIÇÃO",
    relatorioFotos: "RELATÓRIO FOTOGRÁFICO",
    diario: "DIÁRIO DE OBRA",
  },

  // ETAPA 2: a data de apresentação deve ser DEPOIS do fim do ciclo
  // e no máximo X dias depois.
  diasMaxApresentacao: 15,

  // ETAPA 3: mínimo de assinaturas por tipo de página.
  // Vale a primeira regra cujo texto aparecer na página.
  assinaturasMinimas: [
    { texto: "APROVAÇÃO DE MEDIÇÃO", minimo: 3 },   // capa do BM
    { texto: "VALOR A SER PAGO", minimo: 2 },       // resumo do BM
    { texto: "PLANILHA DE MEDIÇÃO", minimo: 2 },
    { texto: "MEMÓRIA DE CÁLCULO", minimo: 1 },
    { texto: "RELATÓRIO FOTOGRÁFICO", minimo: 2 },
    { texto: "DIÁRIO DE OBRA", minimo: 2 },         // visto contratada + contratante
  ],
  assinaturasPadrao: 1,   // páginas que não casam com nenhuma regra acima

  // ETAPA 5: semelhança mínima (0 a 1) entre o objeto do PDF e o do Excel
  semelhancaMinObjeto: 0.80,
};
