// ---------------------------------------------------------------------------
// FUNÇÕES DE FORMATAÇÃO — moeda (Kz), energia (kWh) e datas
// ---------------------------------------------------------------------------

export function formatAOA(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    safe.toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " Kz"
  );
}

export function formatKWh(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatData(timestamp) {
  try {
    return new Date(timestamp).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
