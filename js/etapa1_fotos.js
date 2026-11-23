/* =====================================================================
   ETAPA 1 — RELATÓRIO FOTOGRÁFICO x PLANILHA DE MEDIÇÃO (dentro do PDF)
     1.1  todo item executado no mês (% ATUAL > 0) tem foto
     1.2  nenhuma foto de item sem medição ou que não existe
     1.3  nenhum item com foto repetida
     1.4  fotos na MESMA ORDEM da planilha
     1.5  numeração das fotos em sequência (1, 2, 3...)
   ===================================================================== */

function etapa1_fotos(paginas) {
  const E = "1 - Relatório fotográfico";
  log(`\nETAPA ${E}`);

  const { executados, todos } = itensDaPlanilha(paginas);
  const fotos = fotosDoRelatorio(paginas);

  if (!executados.length) return registrar(E, "Ler planilha de medição", "ERRO", "nenhum item executado encontrado no PDF");
  if (!fotos.length) return registrar(E, "Ler relatório fotográfico", "ERRO", "relatório fotográfico não encontrado no PDF");
  registrar(E, "Itens executados na planilha", "OK", `${executados.length} itens com % ATUAL > 0`);
  registrar(E, "Fotos encontradas", "OK", `${fotos.length} fotos`);

  const itensFotos = fotos.map(f => f.item);

  // 1.1 - item executado sem foto
  const semFoto = executados.filter(c => !itensFotos.includes(c));
  semFoto.forEach(c => registrar(E, "Item executado sem foto", "ERRO", `item ${c}`));
  if (!semFoto.length) registrar(E, "Todo item executado tem foto", "OK");

  // 1.2 - foto de item inexistente ou sem medição no mês
  for (const f of fotos) {
    if (!todos.includes(f.item))
      registrar(E, "Foto de item que não existe na planilha", "ERRO", `foto ${f.numero}, item ${f.item}`, f.pagina);
    else if (!executados.includes(f.item))
      registrar(E, "Foto de item sem medição no mês (% ATUAL = 0)", "ERRO", `foto ${f.numero}, item ${f.item}`, f.pagina);
  }

  // 1.3 - item com mais de uma foto
  [...new Set(itensFotos)].forEach(item => {
    const qtd = itensFotos.filter(i => i === item).length;
    if (qtd > 1) registrar(E, "Item com foto repetida", "ALERTA", `item ${item} aparece ${qtd} vezes`);
  });

  // 1.4 - ordem das fotos = ordem da planilha
  const ordemPlanilha = executados.filter(c => itensFotos.includes(c));
  const ordemFotos = [...new Set(itensFotos)].filter(i => executados.includes(i));
  const pos = ordemPlanilha.findIndex((c, i) => c !== ordemFotos[i]);
  if (pos === -1) {
    registrar(E, "Fotos na mesma ordem da planilha", "OK");
  } else {
    const pag = fotos.find(f => f.item === ordemFotos[pos])?.pagina ?? "";
    registrar(E, "Fotos fora da ordem da planilha", "ERRO",
      `posição ${pos + 1}: esperado item ${ordemPlanilha[pos]}, encontrado ${ordemFotos[pos]}`, pag);
  }

  // 1.5 - numeração das fotos 1, 2, 3...
  let errosNum = 0;
  fotos.forEach((f, i) => {
    if (f.numero !== i + 1) {
      errosNum++;
      registrar(E, "Numeração da foto fora de sequência", "ERRO",
        `item ${f.item}: está como FOTO Nº ${f.numero}, deveria ser ${i + 1}`, f.pagina);
    }
  });
  if (!errosNum) registrar(E, "Numeração das fotos em sequência", "OK");
}

/** Lê a PLANILHA DE MEDIÇÃO do PDF.
 *  Item = linha que começa com código tipo 1.1 / 3.2.6.
 *  O % ATUAL é o primeiro valor "xx,xx%" do bloco do item.
 *  Devolve { executados: [itens com % ATUAL > 0], todos: [todos os itens] } */
function itensDaPlanilha(paginas) {
  const titulo = normalizar(CONFIG.titulos.planilha);
  const linhas = paginas.filter(t => normalizar(t).includes(titulo)).flatMap(t => t.split("\n"));

  const blocos = [];   // { codigo, texto }
  for (const linha of linhas) {
    const m = linha.trim().match(/^(\d+(?:\.\d+)*)\s+[A-ZÀ-Ú]/);
    if (m) blocos.push({ codigo: m[1], texto: linha });
    else if (blocos.length) blocos[blocos.length - 1].texto += " " + linha;
  }

  const executados = [], todos = [];
  for (const b of blocos) {
    const perc = b.texto.match(/(\d+,\d{2})%/);
    if (!b.codigo.includes(".") || !perc) continue;   // título de grupo (1, 3.1...)
    if (todos.includes(b.codigo)) continue;            // repetido em outra página
    todos.push(b.codigo);
    if (parseFloat(perc[1].replace(",", ".")) > 0) executados.push(b.codigo);
  }
  return { executados, todos };
}

/** Lista as fotos na ordem em que aparecem: { pagina, numero, item } */
function fotosDoRelatorio(paginas) {
  const titulo = normalizar(CONFIG.titulos.relatorioFotos);
  const fotos = [];
  paginas.forEach((txt, i) => {
    if (!normalizar(txt).includes(titulo)) return;
    for (const m of txt.matchAll(/FOTO N\S*\s+(\d+)\s+ITEM PO\s+([\d.]+)/g)) {
      fotos.push({ pagina: i + 1, numero: +m[1], item: m[2].replace(/\.$/, "") });
    }
  });
  return fotos;
}
