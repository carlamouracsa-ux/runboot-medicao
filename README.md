# RUNBOOT · Medição Padrão

Site que confere o **boletim de medição (PDF)** contra o **formulário de medição (Excel)** e gera um relatório.
Roda inteiro no navegador: os arquivos **não são enviados** para lugar nenhum.

## O que é conferido

| Etapa | Arquivo | O que verifica |
|---|---|---|
| 1 | `js/etapa1_fotos.js` | Relatório fotográfico x planilha de medição do PDF: todo item com % ATUAL > 0 tem foto, nenhuma foto sobrando, mesma ordem, numeração 1, 2, 3... |
| 2 | `js/etapa2_periodo.js` | PERÍODO, MÊS DE EXECUÇÃO e DATA DE APRESENTAÇÃO (PDF) x CICLO (Excel); também os outros "PERÍODO", o "MÊS DE REFERÊNCIA" e as datas dos diários |
| 3 | `js/etapa3_assinaturas.js` | Todas as páginas assinadas (mínimo por tipo de página) |
| 4 | `js/etapa4_fornecedor.js` | Fornecedor e código do fornecedor (PDF) x Excel |
| 5 | `js/etapa5_objeto.js` | (extra) Objeto do contrato (PDF) x Excel |
| 6 | `js/etapa6_relatorio.js` | Relatório na tela, impressão/PDF e download em Excel |

## Estrutura

```
index.html              tela do site
css/estilo.css          visual (cores no topo do arquivo)
js/config.js            >>> CONFIGURAÇÃO: o que mais se altera fica aqui <<<
js/utilidades.js        funções de apoio (datas, textos)
js/etapa0_leitura.js    leitura do Excel e do PDF + contagem de assinaturas
js/etapa1..5_*.js       uma conferência por arquivo
js/etapa6_relatorio.js  relatório
js/app.js               ordem de execução das etapas
lib/                    bibliotecas PDF.js e SheetJS (locais, sem internet)
```

## Como modificar

- **Ligar/desligar uma etapa:** `js/config.js` → `etapas`.
- **Rótulos do Excel** (ex.: se mudar "CICLO" para "PERÍODO DO CICLO"): `js/config.js` → `rotulosExcel`.
- **Prazo da data de apresentação:** `js/config.js` → `diasMaxApresentacao`.
- **Quantas assinaturas cada página precisa:** `js/config.js` → `assinaturasMinimas`.
- **Nova conferência:** crie `js/etapa7_xxx.js` com uma função `etapa7_xxx(...)` que chama
  `registrar(etapa, verificacao, "OK" | "ERRO" | "ALERTA", detalhe, pagina)`,
  inclua o `<script>` no `index.html` e chame a função em `js/app.js`.
  Para o resumo do relatório mostrar a etapa, coloque o nome dela em `NOMES_ETAPAS` (`js/etapa6_relatorio.js`).

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `runboot-medicao`).
2. Envie **todos** os arquivos desta pasta (botão *Add file → Upload files*, arraste a pasta inteira, *Commit*).
3. Vá em **Settings → Pages**, em *Source* escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** → *Save*.
4. Em 1–2 minutos o site fica em `https://SEU-USUARIO.github.io/runboot-medicao/`.

> Repositório **público** deixa o código visível (os PDFs/Excel não ficam lá — são escolhidos na hora).
> Para testar no próprio PC sem GitHub: na pasta, rode `python -m http.server` e abra `http://localhost:8000`.
> Abrir o `index.html` com duplo clique pode não funcionar por bloqueio do navegador ao PDF.js.

## Limitações conhecidas

- **Assinaturas:** a contagem reconhece os carimbos do **DocuSign**. PDF escaneado ou assinado em outra
  ferramenta precisa de conferência visual (ajuste em `contarAssinaturas()` em `js/etapa0_leitura.js`).
- A leitura depende do **modelo atual** do boletim (títulos "PLANILHA DE MEDIÇÃO", "RELATÓRIO FOTOGRÁFICO",
  "FOTO Nº ... ITEM PO ..."). Se o modelo mudar, ajuste os títulos em `config.js` ou as expressões nas etapas.
