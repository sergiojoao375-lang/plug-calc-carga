import { TARIFFS } from "../constants/tariffs";
import { formatAOA, formatData, formatKWh } from "../utils/format";

// ---------------------------------------------------------------------------
// ABA 3 — HISTÓRICO
// ---------------------------------------------------------------------------

export default function AbaHistorico({ historico, removerDoHistorico }) {
  if (historico.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 py-16 text-center">
        <p className="text-4xl">🗂️</p>
        <p className="mt-3 text-sm text-slate-400">
          Ainda não guardou nenhuma simulação.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Vá à aba "Consumo ENDE" e use "💾 Salvar no Histórico".
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {historico.map((registo) => (
        <div
          key={registo.id}
          className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{registo.nome}</p>
              <p className="text-xs text-slate-500">{formatData(registo.data)}</p>
            </div>
            <button
              onClick={() => removerDoHistorico(registo.id)}
              className="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-400 hover:text-red-400"
            >
              Eliminar
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-900/60 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Período
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">{registo.dias} dias</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Tarifa
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-white">
                {TARIFFS[registo.tarifa]?.label || registo.tarifa}
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Consumo
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {formatKWh(registo.consumoTotalKWh)} kWh
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/60 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                Valor
              </p>
              <p className="mt-0.5 text-sm font-semibold text-amber-400">
                {formatAOA(registo.custoTotal)}
              </p>
            </div>
          </div>

          {registo.escalaoAplicado && (
            <p className="mt-2.5 text-xs text-slate-500">Escalão: {registo.escalaoAplicado}</p>
          )}
        </div>
      ))}
    </div>
  );
}
