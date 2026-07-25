import logoEnde from "../assets/ende-logo.png";
import { TARIFFS } from "../constants/tariffs";
import { formatAOA, formatKWh } from "../utils/format";

// ---------------------------------------------------------------------------
// RELATÓRIO IMPRIMÍVEL — versão visível apenas via Ctrl+P / impressão direta
// da própria página (bónus; o botão "📄 Descarregar PDF" usa o download em
// HTML gerado em App.jsx, mais robusto em pré-visualizações sandboxed).
// ---------------------------------------------------------------------------

export default function RelatorioImpressao({
  tarifa,
  escalaoAplicado,
  dias,
  itensCalculados,
  consumoTotalKWh,
  custoTotal,
  taxaFixaAplicada,
}) {
  const dataAtual = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div id="relatorio-impressao" className="bg-white p-10 text-slate-900">
      <div className="flex items-center justify-between border-b-4 border-amber-500 pb-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <img src={logoEnde} alt="ENDE" className="h-9 w-auto" />
          ENDE <span className="text-amber-500">CALC</span>
        </div>
        <div className="text-xs text-slate-500">Angola · {dataAtual}</div>
      </div>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-amber-600">
        Dados da Simulação
      </h2>
      <table className="mt-2 w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1">Tarifa contratada</td>
            <td className="py-1 text-right">{TARIFFS[tarifa]?.label || tarifa}</td>
          </tr>
          <tr>
            <td className="py-1">Escalão aplicado</td>
            <td className="py-1 text-right">{escalaoAplicado}</td>
          </tr>
          <tr>
            <td className="py-1">Período simulado</td>
            <td className="py-1 text-right">{dias} dias</td>
          </tr>
        </tbody>
      </table>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-amber-600">
        Inventário de Aparelhos
      </h2>
      <table className="mt-2 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left text-xs text-slate-500">
            <th className="py-1">Aparelho</th>
            <th className="py-1 text-center">Qtd.</th>
            <th className="py-1 text-center">Uso diário</th>
            <th className="py-1 text-right">Consumo</th>
          </tr>
        </thead>
        <tbody>
          {itensCalculados.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-2 text-slate-400">
                Nenhum aparelho adicionado
              </td>
            </tr>
          ) : (
            itensCalculados.map((i) => (
              <tr key={i.id} className="border-b border-slate-100">
                <td className="py-1.5">
                  {i.aparelho?.icon} {i.aparelho?.name}
                  {i.altoConsumo ? " 🔥" : ""}
                </td>
                <td className="py-1.5 text-center">{i.quantidade}</td>
                <td className="py-1.5 text-center">{i.horas}h/dia</td>
                <td className="py-1.5 text-right">{formatKWh(i.kwhPeriodo)} kWh</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-amber-600">
        Resumo Financeiro
      </h2>
      <div className="mt-2 flex gap-4">
        <div className="flex-1 rounded-lg border border-slate-200 p-3">
          <p className="text-[10px] uppercase text-slate-500">Consumo Total</p>
          <p className="text-lg font-bold">{formatKWh(consumoTotalKWh)} kWh</p>
        </div>
        <div className="flex-1 rounded-lg border border-slate-200 p-3">
          <p className="text-[10px] uppercase text-slate-500">Custo Estimado</p>
          <p className="text-lg font-bold">{formatAOA(custoTotal)}</p>
        </div>
      </div>
      {taxaFixaAplicada > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Inclui taxa de potência contratada (kVA) de {formatAOA(taxaFixaAplicada)}.
        </p>
      )}

      <p className="mt-10 text-center text-[10px] text-slate-400">
        Relatório gerado automaticamente pelo ENDE CALC — simulação informativa, valores da ENDE
        sujeitos a alteração.
      </p>
    </div>
  );
}
