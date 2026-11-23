/* =====================================================================
   APP — liga a tela às etapas (ordem de execução da conferência)
   ===================================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdf.worker.min.js";

let ultimaInfo = null;   // guarda os dados da última conferência (para o Excel)

async function conferir() {
  const arqExcel = document.getElementById("arqExcel").files[0];
  const arqPdf = document.getElementById("arqPdf").files[0];
  if (!arqExcel || !arqPdf) { alert("Escolha a planilha (Excel) e o boletim de medição (PDF)."); return; }

  const botao = document.getElementById("btnConferir");
  botao.disabled = true; botao.textContent = "Conferindo...";
  document.getElementById("log").textContent = "";
  document.getElementById("relatorio").hidden = true;
  document.getElementById("acoes").hidden = true;
  resultados = [];

  try {
    // ETAPA 0 - leitura
    log("ETAPA 0 - Lendo arquivos");
    const excel = lerExcel(new Uint8Array(await arqExcel.arrayBuffer()));
    const pdf = await lerPdf(new Uint8Array(await arqPdf.arrayBuffer()));

    // ETAPAS 1 a 5 - conferências (ligar/desligar em config.js)
    if (CONFIG.etapas.fotos) etapa1_fotos(pdf.paginas);
    if (CONFIG.etapas.periodo) etapa2_periodo(excel, pdf.paginas);
    if (CONFIG.etapas.assinaturas) etapa3_assinaturas(pdf);
    if (CONFIG.etapas.fornecedor) etapa4_fornecedor(excel, pdf.paginas);
    if (CONFIG.etapas.objeto) etapa5_objeto(excel, pdf.paginas);

    // ETAPA 6 - relatório
    ultimaInfo = {
      excel, nomeExcel: arqExcel.name, nomePdf: arqPdf.name,
      totalPaginas: pdf.paginas.length,
      dataHora: new Date().toLocaleString("pt-BR"),
    };
    montarRelatorio(ultimaInfo);
    log("\nConferência concluída.");
    document.getElementById("relatorio").scrollIntoView({ behavior: "smooth" });
  } catch (e) {
    log("\nFALHA: " + e.message);
    console.error(e);
    alert("Não consegui ler os arquivos: " + e.message);
  } finally {
    botao.disabled = false; botao.textContent = "Conferir medição";
  }
}

// Mostra o nome do arquivo escolhido em cada caixa
function mostrarNome(input) {
  const alvo = document.querySelector(`[data-nome="${input.id}"]`);
  alvo.textContent = input.files[0] ? input.files[0].name : "clique para escolher";
  input.closest(".caixa").classList.toggle("preenchida", !!input.files[0]);
}

document.getElementById("btnConferir").addEventListener("click", conferir);
document.getElementById("btnImprimir").addEventListener("click", imprimirRelatorio);
document.getElementById("btnExcel").addEventListener("click", () => baixarExcel(ultimaInfo));
document.querySelectorAll("input[type=file]").forEach(i => i.addEventListener("change", () => mostrarNome(i)));
