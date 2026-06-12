import type { Circuit, Material, Phase } from "./engine";

export interface Panel {
  id: string;
  name: string;            // ex: Q.G.B.T.
  origin: string;          // ex: PT/QGE ou id de outro quadro
  feederMaterial: Material;
  feederSection: number;
  feederLength: number;
  iccOriginKA: number;
  voltageMono: number;
  voltageTri: number;
  phase: Phase;            // alimentação do quadro
  cosphi: number;
  panelKind?: "QE" | "QGE"; // tipo de quadro (distribuição vs geral)
  circuits: Circuit[];
}

const KEY = "plugtech.calcstudio.v1";

export interface AppState {
  panels: Panel[];
  activePanelId: string | null;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return { panels: [], activePanelId: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const s = JSON.parse(raw) as AppState;
    if (!s.panels?.length) return seed();
    return s;
  } catch { return seed(); }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function seed(): AppState {
  const id = crypto.randomUUID();
  return {
    panels: [{
      id, name: "Q.G.B.T.", origin: "PT/QGE",
      feederMaterial: "Cu", feederSection: 16, feederLength: 10,
      iccOriginKA: 6, voltageMono: 230, voltageTri: 400,
      phase: "Tri", cosphi: 0.95, panelKind: "QGE", circuits: [],
    }],
    activePanelId: id,
  };
}
