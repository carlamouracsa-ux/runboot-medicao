/* =====================================================================
   ETAPA 6 — RELATÓRIO
   Monta o relatório na tela, imprime / salva em PDF e exporta para Excel
   ===================================================================== */

const NOMES_ETAPAS = [
  "1 - Relatório fotográfico", "2 - Período x Ciclo", "3 - Assinaturas",
  "4 - Fornecedor", "5 - Objeto (extra)",
];

/** Resumo por etapa: { etapa, ok, alerta, erro, situacao } */
function resumoPorEtapa() {
  const etapas = NOMES_ETAPAS.filter(e => resultados.some(r => r.etapa === e));
  return etapas.map(etapa => {
    const da = resultados.filter(r => r.etapa === etapa);
    const c = s => da.filter(r => r.status === s).length;
    const erro = c("ERRO"), alerta = c("ALERTA"), ok = c("OK");
    const situacao = erro ? "REPROVADO" : alerta ? "VERIFICAR" : "APROVADO";
    return { etapa, ok, alerta, erro, situacao };
  });
}

function situacaoGeral(resumo) {
  if (resumo.some(r => r.situacao === "REPROVADO")) return "REPROVADO";
  if (resumo.some(r => r.situacao === "VERIFICAR")) return "VERIFICAR";
  return "APROVADO";
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Desenha o relatório dentro de <section id="relatorio"> */
function montarRelatorio(info) {
  const resumo = resumoPorEtapa();
  const geral = situacaoGeral(resumo);
  const totErro = resultados.filter(r => r.status === "ERRO").length;
  const totAlerta = resultados.filter(r => r.status === "ALERTA").length;

  const linhasResumo = resumo.map(r => `
    <tr>
      <td>${esc(r.etapa)}</td>
      <td class="num">${r.ok}</td><td class="num">${r.alerta}</td><td class="num">${r.erro}</td>
      <td><span class="selo ${r.situacao}">${r.situacao}</span></td>
    </tr>`).join("");

  const pendencias = resultados.filter(r => r.status !== "OK");
  const linhasPend = pendencias.length
    ? pendencias.map(r => `
      <tr>
        <td><span class="selo ${r.status}">${r.status}</span></td>
        <td>${esc(r.etapa)}</td><td>${esc(r.verificacao)}</td>
        <td>${esc(r.detalhe)}</td><td class="num">${esc(r.pagina)}</td>
      </tr>`).join("")
    : `<tr><td colspan="5">Nenhuma pendência encontrada.</td></tr>`;

  const linhasTodas = resultados.map(r => `
      <tr>
        <td><span class="selo ${r.status}">${r.status}</span></td>
        <td>${esc(r.etapa)}</td><td>${esc(r.verificacao)}</td>
        <td>${esc(r.detalhe)}</td><td class="num">${esc(r.pagina)}</td>
      </tr>`).join("");

  document.getElementById("relatorio").innerHTML = `
    <div class="cab-relatorio">
      <div>
        <h2>Relatório de Conferência de Medição</h2>
        <p class="sub">RUNBOOT · Medição Padrão</p>
      </div>
      <span class="selo grande ${geral}">${geral}</span>
    </div>

    <dl class="dados">
      <div><dt>Fornecedor (Excel)</dt><dd>${esc(info.excel.fornecedor)} · cód. ${esc(info.excel.codFornecedor)}</dd></div>
      <div><dt>Ciclo (Excel)</dt><dd>${esc(info.excel.ciclo)}</dd></div>
      <div><dt>Planilha</dt><dd>${esc(info.nomeExcel)}</dd></div>
      <div><dt>Boletim de medição (PDF)</dt><dd>${esc(info.nomePdf)} · ${info.totalPaginas} páginas</dd></div>
      <div><dt>Conferido em</dt><dd>${esc(info.dataHora)}</dd></div>
      <div><dt>Resultado</dt><dd>${totErro} erro(s) · ${totAlerta} alerta(s)</dd></div>
    </dl>

    <h3>Resumo por etapa</h3>
    <table>
      <thead><tr><th>Etapa</th><th>OK</th><th>Alerta</th><th>Erro</th><th>Situação</th></tr></thead>
      <tbody>${linhasResumo}</tbody>
    </table>

    <h3>Pendências (erros e alertas)</h3>
    <table>
      <thead><tr><th>Status</th><th>Etapa</th><th>Verificação</th><th>Detalhe</th><th>Pág.</th></tr></thead>
      <tbody>${linhasPend}</tbody>
    </table>

    <details class="todas">
      <summary>Ver todas as verificações (${resultados.length})</summary>
      <table>
        <thead><tr><th>Status</th><th>Etapa</th><th>Verificação</th><th>Detalhe</th><th>Pág.</th></tr></thead>
        <tbody>${linhasTodas}</tbody>
      </table>
    </details>

    <div class="assinatura-analista">
      <div><span></span>Analista responsável</div>
      <div><span></span>Data</div>
    </div>`;

  document.getElementById("acoes").hidden = false;
  document.getElementById("relatorio").hidden = false;
}

/** Abre a janela de impressão (dá para "Salvar como PDF") */
function imprimirRelatorio() {
  document.querySelector("details.todas")?.setAttribute("open", "");
  window.print();
}

/** Baixa o relatório em Excel com as abas Resumo e Detalhes */
function baixarExcel(info) {
  const wb = XLSX.utils.book_new();

  const resumo = resumoPorEtapa();
  const abaResumo = XLSX.utils.aoa_to_sheet([
    ["RELATÓRIO DE CONFERÊNCIA DE MEDIÇÃO - RUNBOOT"],
    ["Fornecedor (Excel)", info.excel.fornecedor],
    ["Ciclo (Excel)", info.excel.ciclo],
    ["Planilha", info.nomeExcel],
    ["PDF", info.nomePdf],
    ["Conferido em", info.dataHora],
    ["Situação geral", situacaoGeral(resumo)],
    [],
    ["Etapa", "OK", "Alerta", "Erro", "Situação"],
    ...resumo.map(r => [r.etapa, r.ok, r.alerta, r.erro, r.situacao]),
  ]);
  abaResumo["!cols"] = [{ wch: 28 }, { wch: 40 }, { wch: 8 }, { wch: 8 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, abaResumo, "Resumo");

  const abaDet = XLSX.utils.aoa_to_sheet([
    ["Status", "Etapa", "Verificação", "Detalhe", "Página(s)"],
    ...resultados.map(r => [r.status, r.etapa, r.verificacao, r.detalhe, r.pagina]),
  ]);
  abaDet["!cols"] = [{ wch: 9 }, { wch: 24 }, { wch: 46 }, { wch: 80 }, { wch: 11 }];
  abaDet["!autofilter"] = { ref: `A1:E${resultados.length + 1}` };
  XLSX.utils.book_append_sheet(wb, abaDet, "Detalhes");

  const nome = "RESULTADO_" + info.nomePdf.replace(/\.pdf$/i, "") + ".xlsx";
  XLSX.writeFile(wb, nome);
}
