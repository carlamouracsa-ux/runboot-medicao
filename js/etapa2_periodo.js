/* =====================================================================
   ETAPA 2 — PERÍODO (PDF) x CICLO (EXCEL)
     2.1  PERÍODO da medição = CICLO
     2.2  MÊS DE EXECUÇÃO DAS OBRAS/SERVIÇOS = mês do CICLO
     2.3  DATA DE APRESENTAÇÃO DA MEDIÇÃO depois do fim do CICLO (e no prazo)
     2.4  "PERÍODO" das demais páginas = CICLO
     2.5  "MÊS DE REFERÊNCIA" (relatório fotográfico) = mês do CICLO
     2.6  datas dos diários de obra dentro do CICLO
   ===================================================================== */

function etapa2_periodo(excel, paginas) {
  const E = "2 - Período x Ciclo";
  log(`\nETAPA ${E}`);

  const { ini, fim } = cicloDoExcel(excel);
  if (!ini || !fim) return registrar(E, "Ler CICLO no Excel", "ERRO", `não entendi o ciclo: "${excel.ciclo}"`);
  registrar(E, "Ciclo do Excel", "OK", `${fmt(ini)} a ${fmt(fim)}`);
  const textoTodo = paginas.join("\n");

  // 2.1 - PERÍODO (capa do BM) — formato "PERÍODO : 1-set-26 a 30-set-26"
  let m = textoTodo.match(/PER[IÍ]ODO\s*:\s*(\S+)\s+a\s+(\S+)/);
  if (!m) {
    registrar(E, "PERÍODO da medição", "ERRO", "campo PERÍODO não encontrado");
  } else {
    const pIni = lerData(m[1], ini.getFullYear()), pFim = lerData(m[2], fim.getFullYear());
    const ok = mesmaData(pIni, ini) && mesmaData(pFim, fim);
    registrar(E, "PERÍODO da medição = CICLO", ok ? "OK" : "ERRO", `PDF: ${fmt(pIni)} a ${fmt(pFim)}`);
  }

  // 2.2 - MÊS DE EXECUÇÃO DAS OBRAS/SERVIÇOS
  m = textoTodo.match(/M[EÊ]S DE EXECU[CÇ][AÃ]O[^:\n]*:\s*(.+)/);
  const mes = m ? lerMesAno(m[1]) : null;
  if (!mes) {
    registrar(E, "MÊS DE EXECUÇÃO", "ERRO", "campo não encontrado ou ilegível");
  } else {
    const ok = mes.mes === ini.getMonth() + 1 && mes.ano === ini.getFullYear();
    registrar(E, "MÊS DE EXECUÇÃO = mês do CICLO", ok ? "OK" : "ERRO",
      `PDF: ${String(mes.mes).padStart(2, "0")}/${mes.ano}`);
  }

  // 2.3 - DATA DE APRESENTAÇÃO DA MEDIÇÃO
  m = textoTodo.match(/DATA DE APRESENTA[CÇ][AÃ]O[^:\n]*:\s*(\S+)/);
  const dAp = m ? lerData(m[1]) : null;
  const limite = new Date(fim); limite.setDate(limite.getDate() + CONFIG.diasMaxApresentacao);
  if (!dAp) {
    registrar(E, "DATA DE APRESENTAÇÃO", "ERRO", "campo não encontrado ou ilegível");
  } else if (dAp <= fim) {
    registrar(E, "DATA DE APRESENTAÇÃO após o fim do ciclo", "ERRO", `${fmt(dAp)} não é posterior a ${fmt(fim)}`);
  } else if (dAp > limite) {
    registrar(E, "DATA DE APRESENTAÇÃO no prazo", "ALERTA",
      `${fmt(dAp)} — mais de ${CONFIG.diasMaxApresentacao} dias após o ciclo`);
  } else {
    registrar(E, "DATA DE APRESENTAÇÃO após o fim do ciclo", "OK", fmt(dAp));
  }

  // 2.4 - demais "PERÍODO: 01/09/2026 A 30/09/2026" / "À"
  let divergentes = 0;
  paginas.forEach((txt, i) => {
    for (const p of txt.matchAll(/PER[IÍ]ODO\s*:\s*(\S+)\s+(?:A|À)\s+(\S+)/g)) {
      const d1 = lerData(p[1], ini.getFullYear()), d2 = lerData(p[2], fim.getFullYear());
      if (!mesmaData(d1, ini) || !mesmaData(d2, fim)) {
        divergentes++;
        registrar(E, "PERÍODO da página diferente do CICLO", "ERRO", `${p[1]} a ${p[2]}`, i + 1);
      }
    }
  });
  if (!divergentes) registrar(E, "PERÍODO das demais páginas = CICLO", "OK");

  // 2.5 - MÊS DE REFERÊNCIA
  let refErradas = 0;
  paginas.forEach((txt, i) => {
    const r = txt.match(/M[EÊ]S DE REFER[EÊ]NCIA\s*:\s*(.+)/);
    if (!r) return;
    const mr = lerMesAno(r[1]);
    if (!mr || mr.mes !== ini.getMonth() + 1 || mr.ano !== ini.getFullYear()) {
      refErradas++;
      registrar(E, "MÊS DE REFERÊNCIA diferente do CICLO", "ERRO", r[1].trim(), i + 1);
    }
  });
  if (!refErradas) registrar(E, "MÊS DE REFERÊNCIA = mês do CICLO", "OK");

  // 2.6 - diários de obra dentro do ciclo ("15 DE SETEMBRO DE 2026")
  let fora = 0;
  const tituloDiario = normalizar(CONFIG.titulos.diario);
  paginas.forEach((txt, i) => {
    const t = normalizar(txt);
    if (!t.includes(tituloDiario)) return;
    const d = t.match(/(\d{1,2}) DE ([A-Z]+) DE (\d{4})/);
    if (!d || !MESES[d[2].slice(0, 3)]) return;
    const data = new Date(+d[3], MESES[d[2].slice(0, 3)] - 1, +d[1]);
    if (data < ini || data > fim) {
      fora++;
      registrar(E, "Diário de obra fora do ciclo", "ERRO", fmt(data), i + 1);
    }
  });
  if (!fora) registrar(E, "Diários de obra dentro do ciclo", "OK");
}
