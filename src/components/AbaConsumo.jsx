import { APPLIANCES, MANUAL_ID, UNIDADES_POTENCIA } from "../constants/appliances";
import { formatAOA, formatKWh } from "../utils/format";

// ---------------------------------------------------------------------------
// ABA 1 — CONSUMO ENDE
// ---------------------------------------------------------------------------

export default function AbaConsumo(props) {
  const {
    dias,
    setDias,
    tarifa,
    setTarifa,
    aparelhoSelecionado,
    setAparelhoSelecionado,
    quantidade,
    setQuantidade,
    horasUso,
    setHorasUso,
    nomeManual,
    setNomeManual,
    potenciaManual,
    setPotenciaManual,
    unidadeManual,
    setUnidadeManual,
    equipamentoManualValido,
    adicionarItem,
    itensCalculados,
    removerItem,
    limparTudo,
    consumoTotalKWh,
    custoTotal,
    precoKWh,
    escalaoAplicado,
    textoTarifa,
    taxaFixaAplicada,
    consumoMensalMedio,
    valorRecarga,
    setValorRecarga,
    diasInteiros,
    horasRestantes,
    kwhComprados,
    partilharNoWhatsApp,
    gerarRelatorioPDF,
    salvarAberto,
    setSalvarAberto,
    nomeSimulacao,
    setNomeSimulacao,
    salvarNoHistorico,
    potenciaKva,
    setPotenciaKva,
  } = props;

  return (
    <div className="flex flex-col gap-6">
      {/* CONFIGURAÇÕES INICIAIS */}
      <section className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Configurações da Simulação
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Período de simulação (dias)
            </label>
            <input
              type="number"
              min={1}
              value={dias}
              onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Tarifa contratada ENDE
            </label>
            <select
              value={tarifa}
              onChange={(e) => setTarifa(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              <option value="social">Doméstica Social I (3.20 Kz/kwh)</option>
              <option value="social_ii">Doméstica Social II (8.33 Kz/kwh)</option>
              <option value="geral">Doméstica Monofásica Geral (117,00 Kz/kVA + 14,16 Kz/kWh)</option>
              <option value="domestica_trifasica">Doméstica Especial Trifásica (130,00 Kz/kVA + 19,16 Kz/kWh)</option>
              <option value="comercio">Comércio / Serviços (130,00 Kz/kVA + 19,16 Kz/kWh)</option>
              <option value="industrial">Indústria (130,00 Kz/kVA + 16,67 Kz/kWh)</option>
            </select>
          </div>
        </div>

        {(tarifa === "geral" ||
          tarifa === "domestica_trifasica" ||
          tarifa === "comercio" ||
          tarifa === "industrial") && (
          <div className="mt-4 max-w-xs">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Potência Contratada (kVA)
            </label>
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={potenciaKva}
              onChange={(e) => setPotenciaKva(Math.max(0.1, Number(e.target.value) || 0.1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Usada para calcular a taxa de potência (Art. 14.º: variável "pc"), proporcional
              ao período simulado.
            </p>
          </div>
        )}
      </section>

      {/* INVENTÁRIO DA CASA */}
      <section className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Adicionar Aparelho
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Aparelho</label>
            <select
              value={aparelhoSelecionado}
              onChange={(e) => setAparelhoSelecionado(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            >
              {APPLIANCES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name} ({a.watts}W)
                </option>
              ))}
              <option value={MANUAL_ID}>⚙️ Outro Equipamento / Máquina Industrial (Manual)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Quantidade</label>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Horas/dia</label>
            <input
              type="number"
              min={0}
              max={24}
              step="0.5"
              value={horasUso}
              onChange={(e) => setHorasUso(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {aparelhoSelecionado === MANUAL_ID && (
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Nome do Equipamento / Máquina
              </label>
              <input
                type="text"
                placeholder="Ex: Motor Trifásico, Prensa Hidráulica"
                value={nomeManual}
                onChange={(e) => setNomeManual(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Potência Customizada
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="Ex: 5"
                  value={potenciaManual}
                  onChange={(e) => setPotenciaManual(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Unidade</label>
                <select
                  value={unidadeManual}
                  onChange={(e) => setUnidadeManual(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                >
                  {Object.entries(UNIDADES_POTENCIA).map(([chave, config]) => (
                    <option key={chave} value={chave}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {Number(potenciaManual) > 0 && unidadeManual !== "W" && (
              <p className="text-xs text-slate-400">
                Equivalente a{" "}
                <span className="font-medium text-amber-300">
                  {formatKWh(Number(potenciaManual) * (UNIDADES_POTENCIA[unidadeManual]?.fator || 1))} W
                </span>{" "}
                (usado internamente nos cálculos).
              </p>
            )}
            {!equipamentoManualValido && (
              <p className="text-xs text-amber-300">
                Indique o nome e a potência (maior que 0) para poder adicionar este equipamento.
              </p>
            )}
          </div>
        )}

        <button
          onClick={adicionarItem}
          disabled={!equipamentoManualValido}
          className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] sm:w-auto ${
            equipamentoManualValido
              ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
              : "cursor-not-allowed bg-slate-700 text-slate-400"
          }`}
        >
          + Adicionar à Lista da Casa
        </button>
      </section>

      {/* LISTA DINÂMICA */}
      <section className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
            Lista da Casa
          </h2>
          {itensCalculados.length > 0 && (
            <button
              onClick={limparTudo}
              className="text-xs font-medium text-slate-400 underline decoration-dotted hover:text-red-400"
            >
              Limpar Tudo
            </button>
          )}
        </div>

        {itensCalculados.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-700 py-8 text-center text-sm text-slate-500">
            Ainda não adicionou nenhum aparelho.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {itensCalculados.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl">{item.aparelho?.icon}</span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 truncate text-sm font-medium text-white">
                      {item.quantidade}x {item.aparelho?.name}
                      {item.altoConsumo && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                          🔥 Alto Consumo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.horas}h/dia · {formatKWh(item.kwhPeriodo)} kWh no período
                    </p>
                    {item.aparelhoId === MANUAL_ID && item.potenciaOriginalUnidade !== "W" && (
                      <p className="text-xs text-slate-500">
                        Potência original: {item.potenciaOriginalValor}{" "}
                        {UNIDADES_POTENCIA[item.potenciaOriginalUnidade]?.label} → {formatKWh(item.aparelho?.watts)} W
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removerItem(item.id)}
                  className="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:border-red-400 hover:text-red-400"
                  aria-label="Excluir item"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RESULTADOS TOTAIS */}
      <section className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-lg shadow-amber-500/5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400">
          Resumo da Simulação
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">Consumo Total</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatKWh(consumoTotalKWh)} <span className="text-base font-medium text-slate-400">kWh</span>
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/60 p-4">
            <p className="text-xs font-medium text-slate-400">Custo Estimado</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{formatAOA(custoTotal)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">{textoTarifa}</p>
        {taxaFixaAplicada > 0 && (
          <p className="text-xs text-slate-500">
            + Taxa de potência contratada (kVA): {formatAOA(taxaFixaAplicada)}
          </p>
        )}
        <p className="text-xs text-slate-500">
          Média mensal estimada: {formatKWh(consumoMensalMedio)} kWh
        </p>

        {/* RECARGA PRÉ-PAGA */}
        <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
            Simular Recarga Pré-paga
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Valor da recarga (Kz)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Ex: 5000"
                value={valorRecarga}
                onChange={(e) => setValorRecarga(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>
          </div>
          {Number(valorRecarga) > 0 && (
            <div className="mt-3 rounded-lg bg-amber-400/10 px-3.5 py-3 text-sm text-amber-300">
              Com esta recarga obtém aproximadamente{" "}
              <span className="font-semibold">{formatKWh(kwhComprados)} kWh</span>, o que
              cobre cerca de{" "}
              <span className="font-semibold">
                {diasInteiros} dia{diasInteiros !== 1 ? "s" : ""} e {horasRestantes} hora
                {horasRestantes !== 1 ? "s" : ""}
              </span>{" "}
              de consumo, com base nos aparelhos da lista.
            </div>
          )}
        </div>

        {/* SALVAR NO HISTÓRICO */}
        <div className="mt-4">
          {!salvarAberto ? (
            <button
              onClick={() => setSalvarAberto(true)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-400"
            >
              💾 Salvar no Histórico
            </button>
          ) : (
            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Nome da simulação
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Minha Casa, Escritório"
                value={nomeSimulacao}
                onChange={(e) => setNomeSimulacao(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={salvarNoHistorico}
                  className="flex-1 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setSalvarAberto(false);
                    setNomeSimulacao("");
                  }}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={partilharNoWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 active:scale-[0.99]"
          >
            Partilhar Relatório no WhatsApp
          </button>
          <button
            onClick={gerarRelatorioPDF}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/60 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:border-amber-400 hover:bg-amber-400/10 active:scale-[0.99]"
          >
            📄 Descarregar PDF
          </button>
        </div>
      </section>
    </div>
  );
}
