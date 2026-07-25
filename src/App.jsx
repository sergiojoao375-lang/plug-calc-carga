import { useState, useEffect } from "react";
import logoEnde from "./assets/ende-logo.png";

import { APPLIANCES, LIMITE_ALTO_CONSUMO, MANUAL_ID, UNIDADES_POTENCIA } from "./constants/appliances";
import { TARIFFS, POTENCIA_KVA_PADRAO, calcularTarifaAplicada } from "./constants/tariffs";
import { STORAGE_KEY_SIMULACAO, STORAGE_KEY_HISTORICO } from "./constants/storage";
import { LOGO_ENDE_BASE64 } from "./constants/logoBase64";
import { formatAOA, formatKWh } from "./utils/format";
import { calcularProtecao, formatarTextoTarifa, calcularCustoFinanceiro } from "./utils/calculo";

import AbaConsumo from "./components/AbaConsumo";
import AbaDimensionamento from "./components/AbaDimensionamento";
import AbaHistorico from "./components/AbaHistorico";
import AbaDiarioOficial from "./components/AbaDiarioOficial";
import RelatorioImpressao from "./components/RelatorioImpressao";

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState("consumo");

  // --- Estado da Aba 1: Consumo ---
  const [dias, setDias] = useState(15);
  const [tarifa, setTarifa] = useState("social");
  const [itens, setItens] = useState([]);

  const [aparelhoSelecionado, setAparelhoSelecionado] = useState(APPLIANCES[0].id);
  const [quantidade, setQuantidade] = useState(1);
  const [horasUso, setHorasUso] = useState(4);
  const [nomeManual, setNomeManual] = useState("");
  const [potenciaManual, setPotenciaManual] = useState("");
  const [unidadeManual, setUnidadeManual] = useState("W");

  const [valorRecarga, setValorRecarga] = useState("");

  const [salvarAberto, setSalvarAberto] = useState(false);
  const [nomeSimulacao, setNomeSimulacao] = useState("");

  // --- Estado da Aba 2: Dimensionamento ---
  const [cargaWatts, setCargaWatts] = useState("");
  const [fatorPotencia, setFatorPotencia] = useState(0.92);

  // Potência contratada (kVA), usada no cálculo da taxa de potência
  // (Art. 5.º, 6.º, 7.º e 8.º do Despacho n.º 3133/25).
  const [potenciaKva, setPotenciaKva] = useState(POTENCIA_KVA_PADRAO);

  // --- Estado da Aba 3: Histórico ---
  const [historico, setHistorico] = useState([]);

  // Carregar dados guardados ao iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_SIMULACAO);
      if (guardado) {
        const dados = JSON.parse(guardado);
        if (Array.isArray(dados.itens)) setItens(dados.itens);
        if (typeof dados.dias === "number") setDias(dados.dias);
        if (dados.tarifa === "social" || dados.tarifa === "geral") setTarifa(dados.tarifa);
      }
    } catch (erro) {
      console.error("Não foi possível carregar os dados guardados:", erro);
    }

    try {
      const historicoGuardado = localStorage.getItem(STORAGE_KEY_HISTORICO);
      if (historicoGuardado) {
        const dados = JSON.parse(historicoGuardado);
        if (Array.isArray(dados)) setHistorico(dados);
      }
    } catch (erro) {
      console.error("Não foi possível carregar o histórico:", erro);
    }
  }, []);

  // Guardar dados sempre que houver alterações relevantes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SIMULACAO,
        JSON.stringify({ itens, dias, tarifa })
      );
    } catch (erro) {
      console.error("Não foi possível guardar os dados:", erro);
    }
  }, [itens, dias, tarifa]);

  // Guardar histórico sempre que houver alterações
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(historico));
    } catch (erro) {
      console.error("Não foi possível guardar o histórico:", erro);
    }
  }, [historico]);

  // --- Cálculos derivados ---
  const itensCalculados = itens.map((item) => {
    const aparelho =
      item.aparelhoId === MANUAL_ID
        ? { id: MANUAL_ID, name: item.nomeCustom, watts: item.potenciaCustom, icon: "⚙️" }
        : APPLIANCES.find((a) => a.id === item.aparelhoId);
    const wattsTotal = (aparelho?.watts || 0) * item.quantidade;
    const kwhDiario = (wattsTotal * item.horas) / 1000;
    const kwhPeriodo = kwhDiario * dias;
    const altoConsumo = (aparelho?.watts || 0) >= LIMITE_ALTO_CONSUMO;
    return { ...item, aparelho, wattsTotal, kwhDiario, kwhPeriodo, altoConsumo };
  });

  const consumoTotalKWh = itensCalculados.reduce((soma, i) => soma + i.kwhPeriodo, 0);
  const consumoDiarioTotalKWh = itensCalculados.reduce((soma, i) => soma + i.kwhDiario, 0);

  // Média mensal de consumo, usada para determinar o escalão da tarifa Social
  const consumoMensalMedio = dias > 0 ? (consumoTotalKWh / dias) * 30 : 0;
  const { preco: precoKWh, escalao: escalaoAplicado, taxaPotencia } = calcularTarifaAplicada(
    tarifa,
    consumoMensalMedio
  );

  const { custoPotencia: taxaFixaAplicada, custoTotal } = calcularCustoFinanceiro({
    tipoTarifa: tarifa,
    consumoTotalKWh,
    precoKWh,
    taxaPotencia,
    potenciaKva,
    diasSimulacao: dias,
  });
  const textoTarifa = formatarTextoTarifa(tarifa, precoKWh, escalaoAplicado);

  const recargaNumerica = parseFloat(String(valorRecarga).replace(",", ".")) || 0;
  const kwhComprados = recargaNumerica > 0 ? recargaNumerica / precoKWh : 0;
  const diasDeAutonomia =
    consumoDiarioTotalKWh > 0 ? kwhComprados / consumoDiarioTotalKWh : 0;
  const diasInteiros = Math.floor(diasDeAutonomia);
  const horasRestantes = Math.round((diasDeAutonomia - diasInteiros) * 24);

  // --- Ações: Aba 1 ---
  const equipamentoManualValido =
    aparelhoSelecionado !== MANUAL_ID ||
    (nomeManual.trim() !== "" && Number(potenciaManual) > 0);

  function adicionarItem() {
    if (aparelhoSelecionado === MANUAL_ID) {
      const valorDigitado = Number(potenciaManual) || 0;
      const fatorConversao = UNIDADES_POTENCIA[unidadeManual]?.fator || 1;
      const potenciaEmWatts = valorDigitado * fatorConversao;
      if (!nomeManual.trim() || potenciaEmWatts <= 0) return;
      const novoItem = {
        id: `${Date.now()}`,
        aparelhoId: MANUAL_ID,
        nomeCustom: nomeManual.trim(),
        potenciaCustom: potenciaEmWatts,
        potenciaOriginalValor: valorDigitado,
        potenciaOriginalUnidade: unidadeManual,
        quantidade: Math.max(1, Number(quantidade) || 1),
        horas: Math.max(0, Number(horasUso) || 0),
      };
      setItens((atual) => [...atual, novoItem]);
      setNomeManual("");
      setPotenciaManual("");
      return;
    }

    const novoItem = {
      id: `${Date.now()}`,
      aparelhoId: aparelhoSelecionado,
      quantidade: Math.max(1, Number(quantidade) || 1),
      horas: Math.max(0, Number(horasUso) || 0),
    };
    setItens((atual) => [...atual, novoItem]);
  }

  function removerItem(id) {
    setItens((atual) => atual.filter((i) => i.id !== id));
  }

  function limparTudo() {
    setItens([]);
  }

  function partilharNoWhatsApp() {
    const linhas = itensCalculados.map((i) => {
      const tag = i.altoConsumo ? " 🔥" : "";
      return `${i.aparelho?.icon || "🔌"} ${i.aparelho?.name || "Aparelho"}${tag} — ${i.quantidade}x, ${i.horas}h/dia → ${formatKWh(i.kwhPeriodo)} kWh`;
    });

    const mensagem = [
      "⚡ *Relatório ENDE CALC* ⚡",
      "",
      `📋 Tarifa: ${TARIFFS[tarifa].label} — ${escalaoAplicado}`,
      `📅 Período: ${dias} dias`,
      "",
      "🏠 *Aparelhos da Casa:*",
      ...(linhas.length ? linhas : ["(nenhum aparelho adicionado)"]),
      "",
      `🔋 Consumo total: ${formatKWh(consumoTotalKWh)} kWh`,
      ...(taxaFixaAplicada > 0
        ? [`🔌 Taxa de potência contratada (kVA): ${formatAOA(taxaFixaAplicada)}`]
        : []),
      `💰 Custo estimado: ${formatAOA(custoTotal)}`,
      "",
      "_Simulação gerada pelo ENDE CALC — Angola_",
    ].join("\n");

    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }

  function gerarRelatorioPDF() {
    const dataAtual = new Date().toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const linhasTabela = itensCalculados
      .map(
        (i) => `
        <tr>
          <td>${i.aparelho?.icon || "🔌"} ${i.aparelho?.name || "Aparelho"}${i.altoConsumo ? " 🔥" : ""}</td>
          <td style="text-align:center;">${i.quantidade}</td>
          <td style="text-align:center;">${i.horas}h/dia</td>
          <td style="text-align:right;">${formatKWh(i.kwhPeriodo)} kWh</td>
        </tr>`
      )
      .join("");

    const htmlDocumento = `<!DOCTYPE html>
<html lang="pt-AO">
<head>
<meta charset="UTF-8" />
<title>Relatório ENDE CALC</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; padding: 32px; margin: 0; }
  .cabecalho { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid #f59e0b; padding-bottom:16px; margin-bottom:24px; }
  .logo { display:flex; align-items:center; gap:8px; font-size: 24px; font-weight:bold; }
  .logo img { height:36px; width:auto; }
  .logo span { color:#f59e0b; }
  .tag-regiao { font-size:12px; color:#475569; border:1px solid #cbd5e1; padding:4px 10px; border-radius:999px; }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:0.05em; color:#b45309; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-top:28px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th { text-align:left; font-size:11px; color:#64748b; padding:6px 4px; border-bottom:1px solid #e2e8f0; }
  td { font-size:13px; padding:6px 4px; border-bottom:1px solid #f1f5f9; }
  .resumo { display:flex; gap:16px; margin-top:12px; }
  .card { flex:1; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
  .card p.label { font-size:11px; color:#64748b; margin:0 0 4px; text-transform:uppercase; }
  .card p.valor { font-size:20px; font-weight:bold; margin:0; }
  .nota { font-size:12px; color:#64748b; margin-top:8px; }
  .aviso { margin-top:24px; padding:12px 14px; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; font-size:12px; color:#92400e; }
  .rodape { margin-top:32px; font-size:11px; color:#94a3b8; text-align:center; }
  @media print {
    body { padding: 12mm; }
    .aviso { display:none; }
    .cabecalho { break-inside: avoid; }
    table { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="cabecalho">
    <div class="logo"><img src="${LOGO_ENDE_BASE64}" alt="ENDE" /> ENDE <span>CALC</span></div>
    <div class="tag-regiao">Angola · ${dataAtual}</div>
  </div>

  <div class="aviso">
    📄 Para guardar como PDF: prima <strong>Ctrl+P</strong> (ou <strong>Cmd+P</strong> no Mac) e escolha
    "Guardar como PDF" no destino da impressão.
  </div>

  <h2>Dados da Simulação</h2>
  <table>
    <tr><td>Tarifa contratada</td><td style="text-align:right;">${TARIFFS[tarifa]?.label || tarifa}</td></tr>
    <tr><td>Escalão aplicado</td><td style="text-align:right;">${escalaoAplicado}</td></tr>
    <tr><td>Período simulado</td><td style="text-align:right;">${dias} dias</td></tr>
  </table>

  <h2>Inventário de Aparelhos</h2>
  <table>
    <thead>
      <tr>
        <th>Aparelho</th>
        <th style="text-align:center;">Qtd.</th>
        <th style="text-align:center;">Uso diário</th>
        <th style="text-align:right;">Consumo no período</th>
      </tr>
    </thead>
    <tbody>
      ${linhasTabela || '<tr><td colspan="4">Nenhum aparelho adicionado</td></tr>'}
    </tbody>
  </table>

  <h2>Resumo Financeiro</h2>
  <div class="resumo">
    <div class="card">
      <p class="label">Consumo Total</p>
      <p class="valor">${formatKWh(consumoTotalKWh)} kWh</p>
    </div>
    <div class="card">
      <p class="label">Custo Estimado</p>
      <p class="valor">${formatAOA(custoTotal)}</p>
    </div>
  </div>
  ${
    taxaFixaAplicada > 0
      ? `<p class="nota">Inclui taxa de potência contratada (kVA) de ${formatAOA(taxaFixaAplicada)}.</p>`
      : ""
  }

  <p class="rodape">Relatório gerado automaticamente pelo ENDE CALC — simulação informativa, valores da ENDE sujeitos a alteração.</p>
</body>
</html>`;

    const ficheiro = new Blob([htmlDocumento], { type: "text/html;charset=utf-8" });
    const urlTemporario = URL.createObjectURL(ficheiro);
    const nomeFicheiro = `ENDE-CALC-Relatorio-${new Date().toISOString().slice(0, 10)}.html`;

    const link = document.createElement("a");
    link.href = urlTemporario;
    link.download = nomeFicheiro;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(urlTemporario);
  }

  function salvarNoHistorico() {
    const nome = nomeSimulacao.trim() || "Simulação sem nome";
    const registo = {
      id: `${Date.now()}`,
      nome,
      data: Date.now(),
      dias,
      tarifa,
      escalaoAplicado,
      consumoTotalKWh,
      custoTotal,
    };
    setHistorico((atual) => [registo, ...atual]);
    setNomeSimulacao("");
    setSalvarAberto(false);
  }

  function removerDoHistorico(id) {
    setHistorico((atual) => atual.filter((h) => h.id !== id));
  }

  // --- Cálculos: Aba 2 ---
  const wattsNumerico = Number(cargaWatts) || 0;
  const resultadoProtecao = calcularProtecao(wattsNumerico, fatorPotencia);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Regras de impressão: escondem a app normal e mostram apenas o relatório */}
      <style>{`
        #relatorio-impressao { display: none; }
        @media print {
          #conteudo-app { display: none !important; }
          #relatorio-impressao { display: block !important; }
        }
      `}</style>

      <div id="conteudo-app">
        {/* NAVBAR */}
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-white px-1.5 py-1 shadow-sm">
                <img src={logoEnde} alt="ENDE" className="h-6 w-auto sm:h-7" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                ENDE <span className="text-amber-400">CALC</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Angola
            </div>
          </div>

          {/* TABS */}
          <nav className="mx-auto flex max-w-3xl gap-1 px-4">
            <button
              onClick={() => setAbaAtiva("consumo")}
              className={`flex-1 whitespace-nowrap border-b-2 px-1 py-2.5 text-xs font-semibold uppercase transition sm:px-2 sm:tracking-wide ${
                abaAtiva === "consumo"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="sm:hidden">Consumo</span>
              <span className="hidden sm:inline">Consumo ENDE</span>
            </button>
            <button
              onClick={() => setAbaAtiva("dimensionamento")}
              className={`flex-1 whitespace-nowrap border-b-2 px-1 py-2.5 text-xs font-semibold uppercase transition sm:px-2 sm:tracking-wide ${
                abaAtiva === "dimensionamento"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="sm:hidden">220V</span>
              <span className="hidden sm:inline">Dimensionamento</span>
            </button>
            <button
              onClick={() => setAbaAtiva("historico")}
              className={`flex-1 whitespace-nowrap border-b-2 px-1 py-2.5 text-xs font-semibold uppercase transition sm:px-2 sm:tracking-wide ${
                abaAtiva === "historico"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setAbaAtiva("diario")}
              className={`flex-1 whitespace-nowrap border-b-2 px-1 py-2.5 text-xs font-semibold uppercase transition sm:px-2 sm:tracking-wide ${
                abaAtiva === "diario"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="sm:hidden">Legal</span>
              <span className="hidden sm:inline">Diário Oficial</span>
            </button>
          </nav>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 pb-16">
          {abaAtiva === "consumo" && (
            <AbaConsumo
              dias={dias}
              setDias={setDias}
              tarifa={tarifa}
              setTarifa={setTarifa}
              aparelhoSelecionado={aparelhoSelecionado}
              setAparelhoSelecionado={setAparelhoSelecionado}
              quantidade={quantidade}
              setQuantidade={setQuantidade}
              horasUso={horasUso}
              setHorasUso={setHorasUso}
              nomeManual={nomeManual}
              setNomeManual={setNomeManual}
              potenciaManual={potenciaManual}
              setPotenciaManual={setPotenciaManual}
              unidadeManual={unidadeManual}
              setUnidadeManual={setUnidadeManual}
              equipamentoManualValido={equipamentoManualValido}
              adicionarItem={adicionarItem}
              itensCalculados={itensCalculados}
              removerItem={removerItem}
              limparTudo={limparTudo}
              consumoTotalKWh={consumoTotalKWh}
              custoTotal={custoTotal}
              precoKWh={precoKWh}
              escalaoAplicado={escalaoAplicado}
              textoTarifa={textoTarifa}
              taxaFixaAplicada={taxaFixaAplicada}
              consumoMensalMedio={consumoMensalMedio}
              valorRecarga={valorRecarga}
              setValorRecarga={setValorRecarga}
              diasInteiros={diasInteiros}
              horasRestantes={horasRestantes}
              kwhComprados={kwhComprados}
              partilharNoWhatsApp={partilharNoWhatsApp}
              gerarRelatorioPDF={gerarRelatorioPDF}
              salvarAberto={salvarAberto}
              setSalvarAberto={setSalvarAberto}
              nomeSimulacao={nomeSimulacao}
              setNomeSimulacao={setNomeSimulacao}
              salvarNoHistorico={salvarNoHistorico}
              potenciaKva={potenciaKva}
              setPotenciaKva={setPotenciaKva}
            />
          )}

          {abaAtiva === "dimensionamento" && (
            <AbaDimensionamento
              cargaWatts={cargaWatts}
              setCargaWatts={setCargaWatts}
              wattsNumerico={wattsNumerico}
              resultadoProtecao={resultadoProtecao}
              fatorPotencia={fatorPotencia}
              setFatorPotencia={setFatorPotencia}
            />
          )}

          {abaAtiva === "historico" && (
            <AbaHistorico historico={historico} removerDoHistorico={removerDoHistorico} />
          )}

          {abaAtiva === "diario" && <AbaDiarioOficial />}
        </main>

        {/* RODAPÉ */}
        <footer className="border-t border-slate-800 bg-slate-950/40 py-8">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-center text-xs text-slate-500">
              ENDE CALC © {new Date().getFullYear()} — Simulação informativa, valores da ENDE
              sujeitos a alteração.
            </p>

            {(abaAtiva === "dimensionamento" || abaAtiva === "historico" || abaAtiva === "diario") && (
              <div className="mx-auto mt-6 max-w-sm border-t border-slate-800 pt-6 text-center">
                <p className="text-sm font-semibold text-slate-200">
                  Desenvolvido por <span className="text-amber-400">Sérgio João</span>
                </p>

                <div className="mt-4 flex flex-col items-stretch gap-2.5">
                  <a
                    href="https://sergiojoao-portfolio.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-amber-400 hover:text-amber-400"
                  >
                    <span aria-hidden="true">🌐</span> sergiojoao-portfolio.netlify.app
                  </a>
                  <a
                    href="https://wa.me/244931728474"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
                  >
                    <span aria-hidden="true">💬</span> +244 931 728 474
                  </a>
                  <a
                    href="mailto:sergiojoao375@gmail.com"
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-sky-400 hover:text-sky-400"
                  >
                    <span aria-hidden="true">✉️</span> sergiojoao375@gmail.com
                  </a>
                </div>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* RELATÓRIO IMPRIMÍVEL — visível apenas ao imprimir / exportar para PDF */}
      <RelatorioImpressao
        tarifa={tarifa}
        escalaoAplicado={escalaoAplicado}
        dias={dias}
        itensCalculados={itensCalculados}
        consumoTotalKWh={consumoTotalKWh}
        custoTotal={custoTotal}
        taxaFixaAplicada={taxaFixaAplicada}
      />
    </div>
  );
}
