// ---------------------------------------------------------------------------
// DADOS DE REFERÊNCIA — eletrodomésticos do mercado angolano
// ---------------------------------------------------------------------------

export const APPLIANCES = [
  { id: "lampada_led", name: "Lâmpada LED", watts: 10, icon: "💡" },
  { id: "lampada_convencional", name: "Lâmpada Convencional", watts: 60, icon: "💡" },
  { id: "lampada_incandescente", name: "Lâmpada Antiga / Incandescente", watts: 100, icon: "🪔" },
  { id: "tv", name: "Televisor LED", watts: 100, icon: "📺" },
  { id: "arca_moderna", name: "Arca / Congelador Moderno", watts: 200, icon: "❄️" },
  { id: "arca_antiga", name: "Arca Antiga / Comercial", watts: 350, icon: "📟" },
  { id: "frigorifico", name: "Frigorífico / Geleira", watts: 250, icon: "🧊" },
  { id: "ac_9000", name: "Ar Condicionado 9.000 BTU", watts: 1000, icon: "💨" },
  { id: "ac_12000", name: "Ar Condicionado 12.000 BTU", watts: 1400, icon: "❄️" },
  { id: "ac_18000", name: "Ar Condicionado 18.000 BTU", watts: 1800, icon: "❄️" },
  { id: "ac_24000", name: "Ar Condicionado 24.000 BTU", watts: 2500, icon: "🥶" },
  { id: "ferro", name: "Ferro de Engomar", watts: 1500, icon: "🔌" },
  { id: "termoacumulador", name: "Termoacumulador / Esquentador", watts: 2000, icon: "🚿" },
  { id: "ventoinha", name: "Ventoinha / Ventilador", watts: 60, icon: "🌀" },
  { id: "bomba_agua", name: "Bomba de Água / Eletrobomba", watts: 750, icon: "💧" },
  { id: "computador", name: "Computador / Laptop", watts: 100, icon: "💻" },
];

// Potência (W) a partir da qual um aparelho é marcado como "Alto Consumo".
export const LIMITE_ALTO_CONSUMO = 1000;

// Identificador especial usado quando o utilizador regista um equipamento
// manualmente (ex: máquinas industriais fora da lista padrão).
export const MANUAL_ID = "manual";

// Fatores de conversão para a potência customizada de máquinas industriais.
export const UNIDADES_POTENCIA = {
  W: { label: "Watts (W)", fator: 1 },
  kW: { label: "Quilowatts (kW)", fator: 1000 },
  HP: { label: "Cavalos (HP/CV)", fator: 746 },
};
