// ---------------------------------------------------------------------------
// TARIFAS ENDE — Baixa Tensão (BT), conforme o Despacho n.º 3133/25 do IRSEA
// (Diário da República, II Série, N.º 80, de 5 de Maio de 2025).
// ---------------------------------------------------------------------------

export const TARIFFS = {
  social: { label: "BT - Doméstica Social I" },
  social: { label: "BT - Doméstica Social II" },
  geral: { label: "BT - Doméstica Monofásica Geral" },
  domestica_trifasica: { label: "BT - Doméstica Especial Trifásica" },
  comercio: { label: "BT - Comércio e Serviços" },
  industrial: { label: "BT - Indústria" },
};

// Potência contratada (kVA) sugerida por defeito no formulário, para os
// contratos que cobram taxa fixa de potência (Geral, Trifásica, Comércio e Indústria).
export const POTENCIA_KVA_PADRAO = 6.6;

// --- Preços de energia (Kz por kWh) — variável "W" nas fórmulas legais ----
export const PRECO_SOCIAL_I = 3.2; // Art. 3.º, n.º 1
export const PRECO_SOCIAL_II = 8.33; // Art. 3.º, n.º 3 — F = 8,33 × W
export const PRECO_GERAL = 14.16; // Art. 5.º — F = 117,00 × pc + 14,16 × W
export const PRECO_DOMESTICA_TRIFASICA = 19.16; // Art. 6.º — F = 130 × pc + 19,16 × W
export const PRECO_COMERCIO = 19.16; // Art. 7.º — F = 130 × pc + 19,16 × W
export const PRECO_INDUSTRIAL = 16.67; // Art. 8.º — F = 130 × pc + 16,67 × W

// --- Taxas fixas de potência contratada (Kz por kVA/mês) — variável "pc" --
export const TAXA_POTENCIA_GERAL = 117.0; // Art. 5.º
export const TAXA_POTENCIA_DOMESTICA_TRIFASICA = 130.0; // Art. 6.º
export const TAXA_POTENCIA_COMERCIO = 130.0; // Art. 7.º
export const TAXA_POTENCIA_INDUSTRIAL = 130.0; // Art. 8.º

// Limites oficiais de consumo médio mensal e de potência contratada,
// conforme Art. 3.º, n.os 1 a 4.
export const LIMITE_KVA_SOCIAL_I = 1.3; // Art. 3.º, n.º 1
export const LIMITE_KWH_SOCIAL_I = 120; // Art. 3.º, n.º 2
export const POTENCIA_FIXA_SOCIAL_II = 3.0; // Art. 3.º, n.º 3
export const LIMITE_KWH_SOCIAL_II = 200; // Art. 3.º, n.º 4
export const LIMITE_KVA_GERAL_MIN = 3.0; // Art. 5.º — pc > 3,0 kVA
export const LIMITE_KVA_GERAL_MAX = 9.9; // Art. 5.º — pc ≤ 9,9 kVA
export const LIMITE_KVA_TRIFASICA_MIN = 9.9; // Art. 6.º — pc > 9,9 kVA

// Escalões/tarifas aplicáveis, com base na MÉDIA MENSAL de consumo
// (Consumo do período / Dias * 30) para o contrato "Doméstica Social".
// Os restantes contratos têm preço de energia fixo, mais uma taxa de
// potência proporcional ao período simulado (ver utils/calculo.js).
export function calcularTarifaAplicada(tipoTarifa, consumoMensalMedio) {
  if (tipoTarifa === "geral") {
    return {
      preco: PRECO_GERAL,
      escalao: "BT - Doméstica Monofásica Geral (BTDM)",
      taxaPotencia: TAXA_POTENCIA_GERAL,
    };
  }
  if (tipoTarifa === "domestica_trifasica") {
    return {
      preco: PRECO_DOMESTICA_TRIFASICA,
      escalao: "BT - Doméstica Especial Trifásica (BTET)",
      taxaPotencia: TAXA_POTENCIA_DOMESTICA_TRIFASICA,
    };
  }
  if (tipoTarifa === "comercio") {
    return {
      preco: PRECO_COMERCIO,
      escalao: "BT - Comércio e Serviços (BTCS)",
      taxaPotencia: TAXA_POTENCIA_COMERCIO,
    };
  }
  if (tipoTarifa === "industrial") {
    return {
      preco: PRECO_INDUSTRIAL,
      escalao: "BT - Indústria (BTI)",
      taxaPotencia: TAXA_POTENCIA_INDUSTRIAL,
    };
  }
    // Substitua o bloco antigo (linhas 76 a 89) por este:
  if (tipoTarifa === "social" || tipoTarifa === "social_ii") {
    if (tipoTarifa === "social_ii" || (consumoMensalMedio > LIMITE_KWH_SOCIAL_I && consumoMensalMedio <= LIMITE_KWH_SOCIAL_II)) {
      return {
        preco: PRECO_SOCIAL_II,
        escalao: "BT - Doméstica Social II (BTDSII, 121–200 kWh/mês)",
        taxaPotencia: 0,
      };
    } else if (consumoMensalMedio <= LIMITE_KWH_SOCIAL_I) {
      return {
        preco: PRECO_SOCIAL_I,
        escalao: "BT - Doméstica Social I (BTDSI, até 120 kWh/mês)",
        taxaPotencia: 0,
      };
    }
  }

  // O diploma não prevê escalão social acima de 200 kWh/mês; por defeito,
  // aplica-se a tarifa Doméstica Monofásica Geral (Art. 5.º).
  return {
    preco: PRECO_GERAL,
    escalao: "BT - Social Excedido → Doméstica Monofásica Geral (BTDM)",
    taxaPotencia: TAXA_POTENCIA_GERAL,
  };
}
