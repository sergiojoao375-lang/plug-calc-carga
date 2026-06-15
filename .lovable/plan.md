# Plano — Tubagem até 630 mm, Quadro Geral até 1600 A e cabos de alumínio

## 1. Tubagem eléctrica até Ø630 mm
Ficheiro: `src/lib/calc/conduit.ts`
- Alargar `STD_CONDUITS` para incluir os diâmetros normalizados acima de 110 mm: **125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630 mm**, cada um com o respetivo diâmetro interior útil aproximado.
- A `ConduitCalculator.tsx` já lista automaticamente os tubos a partir desta tabela, por isso não precisa de alterações estruturais (passa a propor tubos até Ø630).

## 2. Quadro Geral (QGE) até 1600 A — verificação dos cálculos
Ficheiro: `src/lib/calc/engine.ts`
- **Calibres**: alargar `STD_BREAKERS_QGE` e `MAIN_DEVICE_RATINGS` para incluir **800, 1000, 1250 e 1600 A**.
- **Secções e condutores em paralelo** (resposta "Ambos"): como um único cabo de cobre (≤400 mm²) ronda os ~415 A, para calibres elevados o motor passa a:
  1. Procurar primeiro a **secção única** que coordena (Iz ≥ In e ΔU ≤ 4%).
  2. Se nenhuma secção única chega, **aumentar o nº de condutores em paralelo por fase** (Iz efetivo = Iz_secção × nº_paralelos), escolhendo a combinação mínima que satisfaz In e ΔU. Quando se recorre a paralelos, sinaliza-se a sugestão de **barramento** como alternativa.
- O resultado (`CalcResult`) ganha o campo `parallel` (nº de condutores por fase) e a apresentação passa a mostrar, por ex., **"2 × 240 mm² (Cu)"** na tabela e no diagnóstico.
- Revisão da coordenação RTIEBT 433 (In ≤ Iz) e do ΔU para usar o Iz total com paralelos.

## 3. Cabos de alumínio no Quadro Geral
Como são alimentações para outros quadros, no QGE passa a poder escolher-se **cobre ou alumínio** e os tipos de cabo correspondentes (apenas no QGE, conforme indicado):
- **Cobre**: H07V-K, H07V-R, XV, XZ1, FVV (como hoje).
- **Alumínio**: **LSV / LV** e **LSVAV / LXAV**.

Ficheiros:
- `src/lib/calc/engine.ts`: adicionar campo `material: Material` ao `Circuit` (default `"Cu"`). O `computeCircuit` e o `deltaUPercent` passam a usar `c.material` em vez de `"Cu"` fixo (o fator `IZ_AL_FACTOR` já existe para o alumínio).
- `src/lib/calc/storage.ts`: migração suave — circuitos antigos sem `material` assumem `"Cu"` ao carregar.
- `src/components/calcstudio/CalcStudio.tsx`:
  - Adicionar `material` ao `Draft`.
  - Quando o quadro ativo for **QGE**, mostrar um seletor de **Material (Cobre/Alumínio)** e a lista de cabos correspondente (cobre vs. alumínio LSV/LV, LSVAV/LXAV). Em quadros de distribuição (Q.E.) mantém-se só cobre.
  - Guardar `material` no circuito criado/editado.

## 4. Relatórios
Ficheiro: `src/lib/calc/export.ts`
- Incluir nos PDFs/CSV o material do condutor e o nº de condutores em paralelo (ex.: "2 × 240 mm² Al") para coerência com o ecrã.

## Notas técnicas
- Tabelas `IZ_CU` mantêm-se até 400 mm²; correntes acima do limite de uma secção única são cobertas por condutores em paralelo, evitando valores irreais.
- Alterações são compatíveis com projetos já guardados (campos novos com valores por defeito).
