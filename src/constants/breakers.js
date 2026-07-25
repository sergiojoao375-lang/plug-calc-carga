// ---------------------------------------------------------------------------
// Tabela de disjuntores e bitolas mínimas para rede monofásica 220V.
// Aplica-se uma margem de segurança de 25% sobre a corrente calculada,
// conforme boas práticas para cargas contínuas.
// ---------------------------------------------------------------------------

export const BREAKER_TABLE = [
  { maxAmps: 10, breaker: "10A", cable: "1.5mm²" },
  { maxAmps: 16, breaker: "16A", cable: "2.5mm²" },
  { maxAmps: 20, breaker: "20A", cable: "2.5mm²" },
  { maxAmps: 25, breaker: "25A", cable: "4mm²" },
  { maxAmps: 32, breaker: "32A", cable: "6mm²" },
  { maxAmps: 40, breaker: "40A", cable: "10mm²" },
  { maxAmps: 63, breaker: "63A", cable: "16mm²" },
  { maxAmps: 100, breaker: "100A", cable: "25mm²" },
];
