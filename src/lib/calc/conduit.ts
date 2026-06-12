// PLUGTECH CalcStudio Pro - Cálculo da secção/diâmetro de tubagem eléctrica
// Método simplificado por taxa de enchimento (RTIEBT / boas práticas)

// Diâmetro exterior aproximado (mm) de condutor isolado tipo H07V-K por secção (mm²)
export const CABLE_OD: Record<number, number> = {
  1.5: 3.0, 2.5: 3.6, 4: 4.0, 6: 4.6, 10: 6.0, 16: 7.0,
  25: 8.8, 35: 9.6, 50: 11.2, 70: 13.0, 95: 14.8, 120: 16.4,
  150: 18.0, 185: 20.0, 240: 22.6, 300: 25.0,
};

// Tubos normalizados (diâmetro nominal exterior, mm) e diâmetro interior útil aprox.
export const STD_CONDUITS: { nominal: number; inner: number }[] = [
  { nominal: 16, inner: 12.2 },
  { nominal: 20, inner: 15.8 },
  { nominal: 25, inner: 20.4 },
  { nominal: 32, inner: 26.4 },
  { nominal: 40, inner: 33.0 },
  { nominal: 50, inner: 41.4 },
  { nominal: 63, inner: 52.6 },
  { nominal: 75, inner: 63.0 },
  { nominal: 90, inner: 75.8 },
  { nominal: 110, inner: 92.8 },
];

export interface ConduitCable {
  section: number; // mm²
  count: number;   // nº de condutores dessa secção
}

export interface ConduitResult {
  cableArea: number;     // mm² (soma das áreas exteriores dos condutores)
  fillRatio: number;     // taxa de enchimento admissível usada
  requiredInner: number; // mm² de secção interior mínima do tubo
  conduitNominal: number | null; // diâmetro nominal recomendado (mm)
  conduitInner: number | null;   // diâmetro interior do tubo escolhido (mm)
  actualFill: number;    // % de enchimento real com o tubo escolhido
  totalConductors: number;
  errors: string[];
}

// Taxa de enchimento máxima admissível em função do nº de condutores
export function fillRatioFor(nConductors: number): number {
  if (nConductors <= 1) return 0.53;
  if (nConductors === 2) return 0.31;
  return 0.40; // 3 ou mais
}

export function computeConduit(cables: ConduitCable[]): ConduitResult {
  const errors: string[] = [];
  let totalConductors = 0;
  let cableArea = 0;
  for (const c of cables) {
    if (c.count <= 0) continue;
    const od = CABLE_OD[c.section];
    if (!od) { errors.push(`Secção ${c.section}mm² sem diâmetro tabelado.`); continue; }
    const area = Math.PI * (od / 2) ** 2;
    cableArea += area * c.count;
    totalConductors += c.count;
  }
  const fillRatio = fillRatioFor(totalConductors);
  const requiredInner = cableArea / fillRatio;

  let chosen: { nominal: number; inner: number } | null = null;
  for (const t of STD_CONDUITS) {
    const innerArea = Math.PI * (t.inner / 2) ** 2;
    if (innerArea >= requiredInner) { chosen = t; break; }
  }
  if (!chosen && totalConductors > 0) {
    errors.push("Nenhum tubo normalizado suficiente — divida por mais que um tubo.");
  }

  const actualFill = chosen
    ? (cableArea / (Math.PI * (chosen.inner / 2) ** 2)) * 100
    : 0;

  return {
    cableArea,
    fillRatio,
    requiredInner,
    conduitNominal: chosen?.nominal ?? null,
    conduitInner: chosen?.inner ?? null,
    actualFill,
    totalConductors,
    errors,
  };
}
