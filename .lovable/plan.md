## Objetivo

Três ajustes no CalcStudio (Quadro de Origem / Quadro Atual):

1. **Tensões → escolha Monofásico ou Trifásico** em vez de dois dropdowns de tensão.
2. **Icc de origem com mais valores** (vai mais além de 25 kA).
3. **Calcular automaticamente o Icc no barramento do Quadro Atual** e mostrá-lo no relatório.

## 1. Sistema Monofásico / Trifásico

Atualmente existem dois `<select>` separados ("V mono" = 230 e "V tri" = 400) que não acrescentam nada, e um `<select>` "Fase" na linha de interligação.

- Substituir os dois selects de tensão por **um único seletor "Sistema"** com as opções:
  - `Monofásico (230 V)`
  - `Trifásico (400 V)`
- Esse seletor passa a definir o `phase` do quadro (`Mono`/`Tri`); `voltageMono` fica fixo em 230 e `voltageTri` em 400 (mantidos para os cálculos).
- Remover o seletor "Fase" duplicado da Linha de Interligação (passa a derivar do Sistema).

## 2. Icc de origem alargado

No dropdown "Icc origem (kA)" estender a lista de `3, 6, 10, 15, 20, 25` para incluir valores mais altos usados em quadros gerais grandes:

```text
3, 6, 10, 15, 20, 25, 35, 36, 50, 65, 70, 100
```

(valores normalizados típicos de poder de corte).

## 3. Icc automático do Quadro Atual

Adicionar em `engine.ts` uma função `panelIccKA(panel)` que calcula a corrente de curto-circuito presumida **no barramento do quadro atual** (a jusante da linha de interligação):

```text
Zmontante = Vtri / (√3 · Icc_origem · 1000)
Zfeeder   = ρ_material · L_feeder / secção_feeder
Icc_quadro = Vtri / (√3 · (Zmontante + Zfeeder)) / 1000   (kA)
```

(para sistema monofásico usa-se a tensão simples; o resultado é arredondado).

- **No ecrã**: mostrar o valor calculado na caixa "Quadro Atual" (ex.: `Icc no barramento: 5.8 kA`), informativo.
- **No relatório PDF** (`export.ts`): incluir `Icc barramento do quadro: X kA` na linha de informação do quadro (`exportPDF`) e na caixa de cada quadro do diagrama em cascata (`exportCascadePDF`).
- **No CSV**: acrescentar uma linha `Icc barramento (kA);X`.

## Detalhes técnicos

- Ficheiros alterados:
  - `src/lib/calc/engine.ts` — nova função `panelIccKA`.
  - `src/components/calcstudio/CalcStudio.tsx` — seletor Sistema, remoção do seletor Fase duplicado e dos selects de tensão, lista Icc alargada, apresentação do Icc do quadro.
  - `src/lib/calc/export.ts` — Icc do quadro no PDF (normal e cascata) e no CSV.
- Sem alterações de esquema de dados: `Panel` mantém `voltageMono/voltageTri/phase`; apenas a UI muda a forma de os definir.
- Retrocompatível com projetos guardados.
