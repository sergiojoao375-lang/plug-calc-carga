import { useEffect, useMemo, useRef, useState } from "react";
import { LogoST } from "./Logo";
import {
  type Circuit, type Material, type Phase, type InstallScenario, type CircuitType,
  computeCircuit, feederDeltaU, phaseImbalance, balancePhases, pickMainDevice,
  FEEDER_SECTIONS, type FeederContext,
} from "@/lib/calc/engine";
import { loadState, saveState, emptyProject, saveProjectFile, loadProjectFile, type AppState, type Panel, type ProjectInfo } from "@/lib/calc/storage";
import { exportCSV, exportPDF, exportCascadePDF } from "@/lib/calc/export";
import { ConduitCalculator } from "./ConduitCalculator";
import { statusColors, type Status } from "./status";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CIRCUIT_TYPES: CircuitType[] = ["Iluminacao", "Tomadas", "AC", "Termoacumulador", "PlacaCozinha", "UAC"];
const SCENARIOS: { v: InstallScenario; label: string }[] = [
  { v: "Enterrado", label: "Enterrado no Solo (D)" },
  { v: "Embutido",  label: "Embutido em Parede (A)" },
  { v: "Calha",     label: "Calha/Caminho Perfurado (E)" },
  { v: "ArLivre",   label: "Ao Ar Livre (E/F)" },
];
const CABLE_TYPES = ["H07V-K", "H07V-R", "XV", "XZ1", "FVV"];

interface Draft {
  id?: string;
  name: string;
  power: string;
  powerUnit: "W" | "kW";
  length: string;
  cosphi: string;
  type: CircuitType;
  cable: string;
  scenario: InstallScenario;
  phase: Phase;
}
const emptyDraft = (): Draft => ({
  name: "", power: "", powerUnit: "W", length: "", cosphi: "0.95",
  type: "Tomadas", cable: "H07V-K", scenario: "Embutido", phase: "Mono",
});

export default function CalcStudio() {
  const [state, setState] = useState<AppState>({ panels: [], activePanelId: null, project: emptyProject() });
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);
  const [showPanelMgr, setShowPanelMgr] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showObra, setShowObra] = useState(false);
  const [showConduit, setShowConduit] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();

  useEffect(() => { setState(loadState()); }, []);
  useEffect(() => { if (state.panels.length) saveState(state); }, [state]);

  // Tenta carregar logo.png
  useEffect(() => {
    fetch("/logo.png").then(r => r.ok ? r.blob() : null).then(b => {
      if (!b) return;
      const fr = new FileReader();
      fr.onload = () => setLogoDataUrl(fr.result as string);
      fr.readAsDataURL(b);
    }).catch(() => {});
  }, []);

  const panel = state.panels.find(p => p.id === state.activePanelId) ?? state.panels[0];

  function updatePanel(patch: Partial<Panel>) {
    if (!panel) return;
    setState(s => ({ ...s, panels: s.panels.map(p => p.id === panel.id ? { ...p, ...patch } : p) }));
  }

  function setCircuits(circuits: Circuit[]) { updatePanel({ circuits }); }

  function addOrUpdateCircuit() {
    if (!panel) return;
    const power = parseFloat(draft.power.replace(",", ".")) || 0;
    const length = parseFloat(draft.length.replace(",", ".")) || 0;
    const cosphi = parseFloat(draft.cosphi.replace(",", ".")) || 0.95;
    if (!draft.name || !power || !length) return;
    const c: Circuit = {
      id: draft.id ?? crypto.randomUUID(),
      name: draft.name,
      power: draft.powerUnit === "kW" ? power * 1000 : power,
      length, cosphi, type: draft.type, cable: draft.cable,
      scenario: draft.scenario, phase: draft.phase,
    };
    if (draft.id) {
      setCircuits(panel.circuits.map(x => x.id === draft.id ? { ...x, ...c } : x));
    } else {
      setCircuits([...panel.circuits, c]);
    }
    setDraft(emptyDraft());
    setSelectedCircuitId(null);
  }

  function editCircuit(c: Circuit) {
    setDraft({
      id: c.id, name: c.name,
      power: String(c.power >= 1000 ? c.power / 1000 : c.power),
      powerUnit: c.power >= 1000 ? "kW" : "W",
      length: String(c.length), cosphi: String(c.cosphi),
      type: c.type, cable: c.cable, scenario: c.scenario, phase: c.phase,
    });
    setSelectedCircuitId(c.id);
  }

  function deleteCircuit(id: string) {
    if (!panel) return;
    setCircuits(panel.circuits.filter(c => c.id !== id));
    if (selectedCircuitId === id) { setSelectedCircuitId(null); setDraft(emptyDraft()); }
  }

  function createNewPanel() {
    const id = crypto.randomUUID();
    const idx = state.panels.length + 1;
    const np: Panel = {
      id, name: `Q.E${idx}`, origin: panel?.name ?? "PT/QGE",
      feederMaterial: "Cu", feederSection: 10, feederLength: 15,
      iccOriginKA: panel?.iccOriginKA ?? 6, voltageMono: 230, voltageTri: 400,
      phase: "Tri", cosphi: 0.95, circuits: [],
    };
    setState(s => ({ ...s, panels: [...s.panels, np], activePanelId: id }));
  }

  function deletePanel() {
    if (!panel || state.panels.length <= 1) return;
    if (!confirm(`Eliminar o quadro ${panel.name}?`)) return;
    const rem = state.panels.filter(p => p.id !== panel.id);
    setState(s => ({ ...s, panels: rem, activePanelId: rem[0]?.id ?? null }));
  }

  function doBalance() {
    if (!panel) return;
    setCircuits(balancePhases(panel.circuits));
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateProject(patch: Partial<ProjectInfo>) {
    setState(s => ({ ...s, project: { ...s.project, ...patch } }));
  }

  function handleOpenFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    loadProjectFile(f)
      .then(s => { setState(s); setSelectedCircuitId(null); setDraft(emptyDraft()); })
      .catch(() => alert("Não foi possível abrir o ficheiro de projeto."));
    e.target.value = "";
  }

  // --- Cálculos derivados ---
  const ctx: FeederContext | null = useMemo(() => {
    if (!panel) return null;
    const totalIb = panel.circuits.reduce((acc, c) => {
      const s = c.power / Math.max(0.1, c.cosphi || 1);
      return acc + (c.phase === "Tri" ? s / (Math.sqrt(3) * panel.voltageTri) : s / panel.voltageMono);
    }, 0);
    const fdU = feederDeltaU({
      totalCurrentA: totalIb, cosphi: panel.cosphi, length: panel.feederLength,
      section: panel.feederSection, material: panel.feederMaterial, phase: panel.phase,
      voltageMono: panel.voltageMono, voltageTri: panel.voltageTri,
    });
    return {
      iccOriginKA: panel.iccOriginKA, feederMaterial: panel.feederMaterial,
      feederSection: panel.feederSection, feederLength: panel.feederLength,
      feederDeltaU: fdU, voltageMono: panel.voltageMono, voltageTri: panel.voltageTri,
      isQGE: panel.panelKind === "QGE",
    };
  }, [panel]);

  const computed = useMemo(() => {
    if (!panel || !ctx) return [];
    return panel.circuits.map(c => ({ c, r: computeCircuit(c, ctx) }));
  }, [panel, ctx]);

  const totals = useMemo(() => {
    if (!panel) return { p: 0, ib: 0, cutNeed: 0, modules: 0, cut: "—", mainRating: 0 };
    const p = panel.circuits.reduce((a, x) => a + x.power, 0);
    const ib = panel.phase === "Tri"
      ? p / (Math.sqrt(3) * panel.voltageTri * panel.cosphi)
      : p / (panel.voltageMono * panel.cosphi);
    const cutNeed = ib * 1.25;
    const modules = Math.ceil((panel.circuits.reduce((a, c) => a + (c.phase === "Tri" ? 3 : 2), 4)) * 1.2);
    const mainRating = pickMainDevice(cutNeed);
    const device = cutNeed > 100 ? "Fusíveis gG" : "Interruptor";
    const cut = `${device} ${mainRating}A`;
    return { p, ib, cutNeed, modules, cut, mainRating };
  }, [panel]);


  const imb = useMemo(() => panel ? phaseImbalance(panel.circuits) : null, [panel]);

  // Estados de alerta (OK / quase a exceder / crítico)
  const feederStatus: Status = ctx
    ? (ctx.feederDeltaU >= 4 ? "critical" : ctx.feederDeltaU >= 3 ? "warn" : "ok")
    : "ok";
  const imbStatus: Status = imb
    ? (imb.pct >= 15 ? "critical" : imb.pct >= 10 ? "warn" : "ok")
    : "ok";

  const selected = computed.find(x => x.c.id === selectedCircuitId);


  if (!panel) return <div className="p-8">A carregar…</div>;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* ===== HEADER FIXO ===== */}
      <header className="sticky top-0 z-30 border-b border-border bg-[color:var(--surface-1)]/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2">
          <div onDoubleClick={() => setShowConduit(true)} title="Estúdio PLUGTECH" className="cursor-pointer select-none">
            {logoDataUrl
              ? <img src={logoDataUrl} alt="SérgioTech" className="h-9 w-9 rounded" />
              : <LogoST size={36} />}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Quadro:</label>
            <select
              value={panel.id}
              onChange={e => setState(s => ({ ...s, activePanelId: e.target.value }))}
              className="rounded-md border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm"
            >
              {state.panels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={createNewPanel} className="rounded-md bg-[color:var(--brand-green)] px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:brightness-110">+ Novo Quadro</button>
            <button onClick={deletePanel} className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">Eliminar</button>
            <button onClick={() => setShowPanelMgr(s => !s)} title="Configuração do quadro" className="rounded-md border border-border px-2 py-1.5 text-sm hover:bg-[color:var(--surface-2)]">⚙</button>
            <button onClick={doBalance} title="Distribuir cargas igualmente pelas fases" className="rounded-md border border-[color:var(--brand-blue)]/60 px-3 py-1.5 text-sm text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/10">⚡ Equilíbrio Fases</button>
            <button onClick={() => setShowConduit(true)} title="Calculadora de secção de tubagem" className="rounded-md border border-[color:var(--brand-green)]/60 px-3 py-1.5 text-sm text-[color:var(--brand-green)] hover:bg-[color:var(--brand-green)]/10">Tubagem</button>
            <button onClick={() => exportCSV(panel)} className="rounded-md border border-[color:var(--brand-blue)]/50 px-3 py-1.5 text-sm hover:bg-[color:var(--brand-blue)]/10">CSV</button>
            <button onClick={() => exportPDF(state.panels, panel.id, { logoDataUrl })} className="rounded-md bg-[color:var(--brand-blue)] px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:brightness-110">PDF</button>
            <button onClick={() => exportCascadePDF(state.panels, { logoDataUrl })} title="Diagrama geral em cascata de todos os quadros" className="rounded-md bg-[color:var(--brand-green)] px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:brightness-110">PDF Cascata</button>
            <button onClick={() => setShowAbout(s => !s)} className="rounded-md border border-border px-2 py-1.5 text-sm">Sobre</button>
          </div>
        </div>

        {showPanelMgr && (
          <div className="border-t border-border bg-[color:var(--surface-2)]/60 px-4 py-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr]">
              {/* Topologia vertical: Origem -> Atual */}
              <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quadro de Origem (Montante)</div>
                <input
                  list="origins"
                  value={panel.origin}
                  onChange={e => updatePanel({ origin: e.target.value })}
                  className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm"
                  placeholder="PT/QGE ou outro quadro"
                />
                <datalist id="origins">
                  <option value="PT/QGE" />
                  {state.panels.filter(p => p.id !== panel.id).map(p => <option key={p.id} value={p.name} />)}
                </datalist>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label>Icc origem (kA)
                    <input type="number" step="0.1" value={panel.iccOriginKA}
                      onChange={e => updatePanel({ iccOriginKA: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1" />
                  </label>
                  <label>V mono / tri
                    <div className="mt-1 flex gap-1">
                      <input type="number" value={panel.voltageMono} onChange={e => updatePanel({ voltageMono: +e.target.value || 230 })} className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1" />
                      <input type="number" value={panel.voltageTri}  onChange={e => updatePanel({ voltageTri: +e.target.value || 400 })} className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1" />
                    </div>
                  </label>
                </div>
              </div>

              {/* Canalização de interligação */}
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[color:var(--brand-green)]/40 bg-[color:var(--surface-1)] p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Linha de Interligação</div>
                <div className="flex items-center gap-1 text-2xl text-[color:var(--brand-green)]">↓</div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <select value={panel.feederMaterial} onChange={e => updatePanel({ feederMaterial: e.target.value as Material })}
                    className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1">
                    <option value="Cu">Cobre</option><option value="Al">Alumínio</option>
                  </select>
                  <select value={panel.feederSection} onChange={e => updatePanel({ feederSection: +e.target.value })}
                    className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1">
                    {FEEDER_SECTIONS.map(s => <option key={s} value={s}>{s} mm²</option>)}
                  </select>
                  <input type="number" step="0.1" value={panel.feederLength} onChange={e => updatePanel({ feederLength: +e.target.value || 0 })}
                    className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1" placeholder="L (m)" />
                  <select value={panel.phase} onChange={e => updatePanel({ phase: e.target.value as Phase })}
                    className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1">
                    <option value="Mono">Mono</option><option value="Tri">Trifásico</option>
                  </select>
                </div>
                {ctx && (
                  <div className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusColors(feederStatus).chip}`}>
                    ΔU feeder: {ctx.feederDeltaU.toFixed(2)}%
                    {" · "}
                    {feederStatus === "ok" ? "OK" : feederStatus === "warn" ? "Quase a exceder" : "CRÍTICO"}
                  </div>
                )}
              </div>

              {/* Quadro atual */}
              <div className="flex flex-col gap-2 rounded-md border border-[color:var(--brand-blue)]/40 bg-card p-3 glow-blue">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quadro Atual</div>
                <input value={panel.name} onChange={e => updatePanel({ name: e.target.value })}
                  className="rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm font-semibold" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label>Cos φ global
                    <input type="number" step="0.01" min="0.1" max="1" value={panel.cosphi}
                      onChange={e => updatePanel({ cosphi: +e.target.value || 0.95 })}
                      className="mt-1 w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1" />
                  </label>
                  <label>Tipo de Quadro
                    <select value={panel.panelKind ?? "QE"} onChange={e => updatePanel({ panelKind: e.target.value as "QE" | "QGE" })}
                      className="mt-1 w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1">
                      <option value="QE">Distribuição (Q.E.)</option>
                      <option value="QGE">Quadro Geral (QGE)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário horizontal de circuito */}
        <div className="border-t border-border bg-[color:var(--surface-1)] px-3 py-2">
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Nome do Circuito" w="180px">
              <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm" placeholder="Ex: Iluminação Sala"/>
            </Field>
            <Field label="Potência" w="140px">
              <div className="flex">
                <input value={draft.power} onChange={e => setDraft(d => ({ ...d, power: e.target.value }))}
                  className="w-full rounded-l border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm" placeholder="0"/>
                <select value={draft.powerUnit} onChange={e => setDraft(d => ({ ...d, powerUnit: e.target.value as "W"|"kW" }))}
                  className="rounded-r border border-l-0 border-border bg-[color:var(--surface-2)] px-1 text-sm">
                  <option>W</option><option>kW</option>
                </select>
              </div>
            </Field>
            <Field label="L (m)" w="80px">
              <input value={draft.length} onChange={e => setDraft(d => ({ ...d, length: e.target.value }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm"/>
            </Field>
            <Field label="Cos φ" w="80px">
              <input value={draft.cosphi} onChange={e => setDraft(d => ({ ...d, cosphi: e.target.value }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm"/>
            </Field>
            <Field label="Tipo de Circuito" w="160px">
              <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as CircuitType }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm">
                {CIRCUIT_TYPES.map(t => <option key={t} value={t}>{labelType(t)}</option>)}
              </select>
            </Field>
            <Field label="Tipo de Cabo (Cobre)" w="130px">
              <select value={draft.cable} onChange={e => setDraft(d => ({ ...d, cable: e.target.value }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm">
                {CABLE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Cenário de Instalação" w="220px">
              <select value={draft.scenario} onChange={e => setDraft(d => ({ ...d, scenario: e.target.value as InstallScenario }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm">
                {SCENARIOS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Fase" w="100px">
              <select value={draft.phase} onChange={e => setDraft(d => ({ ...d, phase: e.target.value as Phase }))}
                className="w-full rounded border border-border bg-[color:var(--surface-2)] px-2 py-1.5 text-sm">
                <option value="Mono">Mono</option><option value="Tri">Trifásico</option>
              </select>
            </Field>
            <button onClick={addOrUpdateCircuit}
              className="rounded-md bg-[color:var(--brand-green)] px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110 glow-green">
              {draft.id ? "Atualizar Circuito" : "+ Adicionar Circuito"}
            </button>
            {draft.id && (
              <button onClick={() => { setDraft(emptyDraft()); setSelectedCircuitId(null); }}
                className="rounded-md border border-border px-3 py-2 text-sm">Cancelar</button>
            )}
            <button onClick={doBalance}
              className="ml-auto rounded-md border border-[color:var(--brand-blue)]/60 px-3 py-2 text-sm text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/10">
              ⚡ Equilíbrio de Fases Automático
            </button>
          </div>
        </div>

      </header>

      <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />


      {/* ===== TABELA CENTRAL (SCROLL VERTICAL) ===== */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full table-fixed text-xs">
            <thead className="sticky top-0 z-10 bg-[color:var(--surface-2)] text-foreground">
              <tr>
                {["#","Circuito","Tipo","Fase","P(W)","S(VA)","Ib(A)","In(A)","Curva","Secção","Iz(A)","ΔU%","Icc(kA)","Mód","Ações"].map(h =>
                  <th key={h} className="border-b border-border px-2 py-2 text-left font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {computed.length === 0 && (
                <tr><td colSpan={15} className="p-12 text-center text-muted-foreground">Sem circuitos. Adicione um circuito acima ↑</td></tr>
              )}
              {computed.map(({ c, r }, i) => {
                const hasErr = r.errors.length > 0;
                const hasWarn = r.warnings.length > 0;
                const sel = selectedCircuitId === c.id;
                return (
                  <tr key={c.id}
                      onClick={() => editCircuit(c)}
                      className={`cursor-pointer border-b border-border/60 hover:bg-[color:var(--surface-2)] ${sel ? "bg-[color:var(--brand-blue)]/10" : ""}`}>
                    <td className="px-2 py-1.5">{i + 1}</td>
                    <td className="px-2 py-1.5 font-medium">{c.name}</td>
                    <td className="px-2 py-1.5">{labelType(c.type)}</td>
                    <td className="px-2 py-1.5">{c.phase}{c.phaseAssign ? `/${c.phaseAssign}` : ""}</td>
                    <td className="px-2 py-1.5">{c.power.toFixed(0)}</td>
                    <td className="px-2 py-1.5">{r.s.toFixed(0)}</td>
                    <td className="px-2 py-1.5">{r.ib.toFixed(2)}</td>
                    <td className={`px-2 py-1.5 ${hasErr ? "bg-destructive/30 text-destructive-foreground" : ""}`}>{r.in}</td>
                    <td className="px-2 py-1.5">{r.curve}</td>
                    <td className="px-2 py-1.5">{r.section} mm²</td>
                    <td className="px-2 py-1.5">{r.iz}</td>
                    <td className={`px-2 py-1.5 ${(ctx!.feederDeltaU + r.deltaU) > 4 ? "bg-warning/30" : ""}`}>{(ctx!.feederDeltaU + r.deltaU).toFixed(2)}</td>
                    <td className="px-2 py-1.5">{r.iccTerm.toFixed(2)}</td>
                    <td className="px-2 py-1.5">{r.modules}</td>
                    <td className="px-2 py-1.5">
                      <button onClick={e => { e.stopPropagation(); deleteCircuit(c.id); }}
                        className="rounded border border-destructive/40 px-2 text-destructive hover:bg-destructive/10">×</button>
                      {(hasErr || hasWarn) && <span className="ml-1" title={[...r.errors, ...r.warnings].join("\n")}>⚠</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Painel de diagnóstico */}
        {selected && (
          <aside className="w-full shrink-0 border-l border-border bg-card p-4 text-sm lg:w-80 lg:overflow-y-auto">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Diagnóstico Assistido</div>
            <h3 className="mb-3 text-base font-bold text-[color:var(--brand-green)]">{selected.c.name}</h3>
            <KV k="S" v={`${selected.r.s.toFixed(0)} VA`} />
            <KV k="Ib" v={`${selected.r.ib.toFixed(2)} A`} />
            <KV k="In sugerido" v={`${selected.r.in} A — Curva ${selected.r.curve}`} />
            <KV k="Secção" v={`${selected.r.section} mm² (Cu)`} />
            <KV k="Iz" v={`${selected.r.iz} A`} />
            <KV k="ΔU total" v={`${(ctx!.feederDeltaU + selected.r.deltaU).toFixed(2)} %`} />
            <KV k="Icc terminal" v={`${selected.r.iccTerm.toFixed(2)} kA`} />
            <KV k="Módulos DIN" v={String(selected.r.modules)} />
            <div className="mt-3 space-y-2">
              {selected.r.errors.map((e, i) => (
                <div key={i} className="rounded border border-destructive/50 bg-destructive/10 p-2 text-destructive-foreground"><b>Erro:</b> {e}</div>
              ))}
              {selected.r.warnings.map((w, i) => (
                <div key={i} className="rounded border border-warning/50 bg-warning/10 p-2"><b>Aviso:</b> {w}</div>
              ))}
              {imb && imb.pct > 15 && selected.c.phase === "Mono" && (
                <div className="rounded border border-warning/50 bg-warning/10 p-2"><b>Desequilíbrio crítico:</b> {imb.pct.toFixed(1)}% entre fases. Considere reequilibrar.</div>
              )}
              {selected.r.errors.length === 0 && selected.r.warnings.length === 0 && (
                <div className="rounded border border-[color:var(--brand-green)]/40 bg-[color:var(--brand-green)]/10 p-2 text-[color:var(--brand-green)]">✓ Circuito conforme RTIEBT.</div>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* ===== RODAPÉ FIXO: APARELHAGEM + RESUMO ===== */}
      <footer className="sticky bottom-0 z-30 border-t border-border bg-[color:var(--surface-1)]/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="P total" value={`${totals.p.toFixed(0)} W`} />
          <Stat label="Ib total" value={`${totals.ib.toFixed(1)} A`} />
          <Stat label="I dimens. (×1.25)" value={`${totals.cutNeed.toFixed(1)} A`} />
          <Stat label="Corte Geral" value={totals.cut} accent />
          <Stat label="Módulos DIN (+20%)" value={String(totals.modules)} />
        </div>
        {imb && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted-foreground">Fases:</span>
            <span>L1 <b>{Math.round(imb.L1)}W</b></span>
            <span>L2 <b>{Math.round(imb.L2)}W</b></span>
            <span>L3 <b>{Math.round(imb.L3)}W</b></span>
            <span className={`rounded px-2 py-0.5 font-semibold ${statusColors(imbStatus).chip}`}>
              Desequilíbrio: {imb.pct.toFixed(1)}% · {imbStatus === "ok" ? "OK" : imbStatus === "warn" ? "Quase a exceder" : "CRÍTICO"}
            </span>
          </div>
        )}
      </footer>

      {showConduit && <ConduitCalculator onClose={() => setShowConduit(false)} />}
    </div>
  );
}

function Field({ label, children, w }: { label: string; children: React.ReactNode; w?: string }) {
  return (
    <div style={{ width: w, minWidth: w }}>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border/40 py-1"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>;
}
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-md border border-border p-2 ${accent ? "bg-[color:var(--brand-green)]/10 border-[color:var(--brand-green)]/40" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${accent ? "text-[color:var(--brand-green)]" : ""}`}>{value}</div>
    </div>
  );
}
function labelType(t: CircuitType) {
  return ({
    Iluminacao: "Iluminação", Tomadas: "Tomadas", AC: "Ar Condicionado",
    Termoacumulador: "Termoacumulador", PlacaCozinha: "Placa Cozinha", UAC: "UAC",
  } as Record<CircuitType, string>)[t];
}

const ABOUT_TOPICS: { title: string; body: string }[] = [
  {
    title: "Queda de Tensão (ΔU)",
    body: "Calculada pelo método das resistências (ρ·L·I/S), somando a queda da linha de interligação e a do circuito. O limite total é 4% (Portaria 850/2015). Os indicadores mudam de cor — verde (OK), amarelo (quase a exceder) e vermelho (crítico) — para avisar antes de ultrapassar.",
  },
  {
    title: "Escolha das Proteções — Coordenação In ≤ Iz (RTIEBT 433)",
    body: "O calibre do disjuntor (In) nunca pode ser superior à capacidade do cabo (Iz). A app escolhe automaticamente o calibre normalizado ≥ Ib e a menor secção que garante Iz ≥ In e ΔU ≤ 4%. Se forçar manualmente um calibre maior que o cabo suporta, aparece erro a vermelho.",
  },
  {
    title: "Curvas de Disparo (B / C / D)",
    body: "B — cargas resistivas sem pico de arranque. C — uso geral (tomadas, eletrodomésticos, pequenos motores). D — cargas com forte corrente de arranque (ar condicionado, UAC). A app sugere D para AC/UAC e C para os restantes.",
  },
  {
    title: "Equilíbrio de Fases",
    body: "As cargas trifásicas dividem-se igualmente pelas 3 fases (P/3 em cada). As monofásicas são distribuídas por um algoritmo que coloca cada carga na fase menos carregada, minimizando o desequilíbrio. O indicador fica crítico acima de 15%.",
  },
  {
    title: "Dimensionamento de Cabos",
    body: "Em Quadro de Distribuição (Q.E.): secções até 95 mm² e calibres até 63 A. Em Quadro Geral (QGE): secções até 400 mm² e calibres até 630 A. A secção é automaticamente aumentada quando a corrente, o Iz ou a queda de tensão o exigem.",
  },
  {
    title: "Corrente de Curto-Circuito (Icc)",
    body: "Estimada de forma simplificada a partir da impedância acumulada (origem + interligação + circuito). Diminui com o comprimento e aumenta com a secção, permitindo verificar se o poder de corte do disjuntor é suficiente.",
  },
  {
    title: "Corte Geral (Aparelhagem do Quadro)",
    body: "Dimensionado com fator de 1,25 × Ib total. Até 100 A sugere interruptor; acima sugere fusíveis gG. É apresentado o calibre normalizado e a respetiva capacidade.",
  },
  {
    title: "Tubagem Elétrica",
    body: "Calculadora acessível pelo botão \"Tubagem\" (ou duplo-clique no logótipo). Usa a taxa máxima de enchimento (53% para 1 condutor, 31% para 2, 40% para 3 ou mais) e sugere o diâmetro nominal do tubo normalizado.",
  },
  {
    title: "Exportação e Relatórios",
    body: "CSV — lista de circuitos com todos os dados calculados. PDF — relatório do quadro ativo. PDF Cascata — diagrama geral de todos os quadros em cascata, com especificação dos cabos e dados de cada quadro.",
  },
];

function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sobre a PLUGTECH CalcStudio Pro</DialogTitle>
          <DialogDescription>
            Software de cálculo de instalações elétricas BT segundo o RTIEBT. Resumo do que a app faz e como decide.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {ABOUT_TOPICS.map(t => (
            <div key={t.title} className="rounded-md border border-border bg-card p-3">
              <div className="mb-1 font-semibold text-[color:var(--brand-green)]">{t.title}</div>
              <p className="text-muted-foreground">{t.body}</p>
            </div>
          ))}
          <div className="rounded-md border border-[color:var(--brand-blue)]/40 bg-[color:var(--brand-blue)]/5 p-3">
            <div className="mb-1 font-semibold">Desenvolvedor</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <span><b>SérgioTech</b></span>
              <span>sergiojoa931@gmail.com</span>
              <span>WhatsApp: +244 931 728 474</span>
              <span className="italic text-[color:var(--brand-green)]">"TECNOLOGIA QUE LIGA SOLUÇÕES"</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
