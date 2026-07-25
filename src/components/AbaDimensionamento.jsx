// ---------------------------------------------------------------------------
// ABA 2 — DIMENSIONAMENTO (220V)
// ---------------------------------------------------------------------------
// aprontar
export default function AbaDimensionamento({
  cargaWatts,
  setCargaWatts,
  wattsNumerico,
  resultadoProtecao,
  fatorPotencia,
  setFatorPotencia,
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Carga do Circuito
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Carga total do circuito (W)
            </label>
            <input
              type="number"
              min={0}
              placeholder="Ex: 3500"
              value={cargaWatts}
              onChange={(e) => setCargaWatts(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Fator de Potência (Cos φ) — opcional
            </label>
            <input
              type="number"
              min={0.1}
              max={1}
              step="0.01"
              value={fatorPotencia}
              onChange={(e) => setFatorPotencia(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Baseado na rede monofásica padrão angolana de 220V. Padrão de fábrica: 0.92 (referência
          ENDE para cargas industriais). Fórmula: Corrente = Potência / (220 × Cos φ).
        </p>
      </section>

      {wattsNumerico > 0 && (
        <section className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg shadow-amber-500/5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">
            Resultado do Dimensionamento
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400">Corrente Calculada</p>
              <p className="mt-1 text-xl font-bold text-white">
                {resultadoProtecao.corrente.toFixed(2)} <span className="text-sm font-medium text-slate-400">A</span>
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400">Disjuntor Sugerido</p>
              <p className="mt-1 text-xl font-bold text-amber-400">{resultadoProtecao.breaker}</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-4">
              <p className="text-xs font-medium text-slate-400">Bitola Mínima do Cabo</p>
              <p className="mt-1 text-xl font-bold text-amber-400">{resultadoProtecao.cable}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Cálculo com margem de segurança de 25% sobre a corrente para cargas contínuas, usando
            Cos φ = {Number(fatorPotencia) > 0 ? fatorPotencia : 0.92}.
          </p>
        </section>
      )}

      {/* NOTAS TÉCNICAS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <span className="text-lg">💡</span>
          <p className="text-sm text-slate-300">
            Circuitos de <span className="font-semibold text-amber-300">iluminação</span> exigem, no
            mínimo, cabo de <span className="font-semibold text-amber-300">1.5mm²</span> por
            segurança contra sobreaquecimento.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <span className="text-lg">🔌</span>
          <p className="text-sm text-slate-300">
            Circuitos de <span className="font-semibold text-amber-300">tomadas</span> exigem, no
            mínimo, cabo de <span className="font-semibold text-amber-300">2.5mm²</span>, dado o
            maior risco de sobrecarga e curto-circuito.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-slate-300">
            Estes valores são referências gerais. Para instalações de maior carga (ex: ar
            condicionado, arcas), consulte sempre um eletricista credenciado.
          </p>
        </div>
      </section>
    </div>
  );
}
