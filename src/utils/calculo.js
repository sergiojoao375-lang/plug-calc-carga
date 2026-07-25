// ---------------------------------------------------------------------------
// FUNÇÕES DE CÁLCULO — dimensionamento elétrico (220V), texto de tarifa e
// custo financeiro (Despacho n.º 3133/25 do IRSEA, Arts. 3.º, 5.º, 6.º, 7.º e 8.º).
// ---------------------------------------------------------------------------

import { BREAKER_TABLE } from "../constants/breakers";
import { POTENCIA_KVA_PADRAO } from "../constants/tariffs";
import { formatKWh } from "./format";

// Calcula a corrente (A), o disjuntor sugerido e a bitola mínima do cabo,
// aplicando o Fator de Potência (Cos φ) e uma margem de segurança de 25%.
// NOTA: este Cos φ é um conceito de ENGENHARIA (dimensionamento de circuito),
// distinto do multiplicador de faturação do Art. 15.º do diploma, que só se
// aplica a clientes de Média/Alta Tensão — fora do âmbito desta calculadora,
// que opera inteiramente em Baixa Tensão (BT).
export function calcularProtecao(watts, cosPhi = 1) {
  const cosPhiSeguro = Number(cosPhi) > 0 ? Number(cosPhi) : 1;
  const corrente = watts / (220 * cosPhiSeguro);
  const correnteComMargem = corrente * 1.25;
  const entrada =
    BREAKER_TABLE.find((row) => correnteComMargem <= row.maxAmps) ||
    BREAKER_TABLE[BREAKER_TABLE.length - 1];
  return { corrente, ...entrada };
}

// Texto dinâmico exibido no card de resultados, com formato específico para
// os contratos com taxa de potência (Geral, Trifásica, Comércio e Indústria).
export function formatarTextoTarifa(tipoTarifa, precoKWh, escalao) {
  if (
    tipoTarifa === "comercio" ||
    tipoTarifa === "industrial" ||
    tipoTarifa === "geral" ||
    tipoTarifa === "geral_ii" ||
    tipoTarifa === "domestica_trifasica"
  ) {
    return `Tarifa: ${formatKWh(precoKWh)} Kz/kWh - ${escalao}`;
  }
  return `Escalão aplicado: ${escalao} · ${formatKWh(precoKWh)} Kz por kWh`;
}

// Custo da taxa de potência contratada (variável "pc" no diploma),
// proporcional ao período simulado: (Taxa_Fixa_kVA * potenciaKva / 30) * diasSimulacao.
export function calcularCustoPotencia(taxaFixaKva, potenciaKva, diasSimulacao) {
  const kva = Number(potenciaKva) > 0 ? Number(potenciaKva) : POTENCIA_KVA_PADRAO;
  const dias = Number(diasSimulacao) > 0 ? Number(diasSimulacao) : 30;
  return (Number(taxaFixaKva) * kva / 30) * dias;
}

// Custo financeiro total da simulação (F, na notação do diploma):
//   Social I           (Art. 3.º, n.º 1) -> 3,20 × W
//   Social II          (Art. 3.º, n.º 3) -> 8,33 × W
//   Geral              (Art. 5.º)        -> (117,00 × pc/30 × dias) + (14,16 × W)
//   Doméstica Trifásica(Art. 6.º)        -> (130,00 × pc/30 × dias) + (19,16 × W)
//   Comércio           (Art. 7.º)        -> (130,00 × pc/30 × dias) + (19,16 × W)
//   Indústria          (Art. 8.º)        -> (130,00 × pc/30 × dias) + (16,67 × W)
export function calcularCustoFinanceiro({
  tipoTarifa,
  consumoTotalKWh,
  precoKWh,
  taxaPotencia,
  potenciaKva,
  diasSimulacao,
}) {
  const temTaxaPotencia =
    tipoTarifa === "geral" ||
    tipoTarifa === "geral_ii" ||
    tipoTarifa === "domestica_trifasica" ||
    tipoTarifa === "comercio" ||
    tipoTarifa === "industrial";

  const custoPotencia = temTaxaPotencia
    ? calcularCustoPotencia(taxaPotencia, potenciaKva, diasSimulacao)
    : 0;

  const custoEnergia = Number(precoKWh) * Number(consumoTotalKWh || 0);

  return {
    custoPotencia,
    custoEnergia,
    custoTotal: custoPotencia + custoEnergia,
  };
}
