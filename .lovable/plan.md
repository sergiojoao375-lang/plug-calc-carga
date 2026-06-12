# Plano — Correções no CalcStudio

Três pedidos do utilizador, todos resolvidos sem alterar o design existente.

## 1. In(A) só vai até 63A — permitir calibres maiores (caso QGE)

Hoje os disjuntores terminais estão limitados a `STD_BREAKERS = [...63]` (em `engine.ts`), por isso o In de um circuito grande (ex.: 80.000 W = 151 A) fica preso em 63 A e aparece a vermelho.

- Estender `STD_BREAKERS` para incluir calibres de quadro geral: `80, 100, 125, 160, 200, 250, 400, 630`.
- Adicionar uma marcação de **tipo de quadro** no quadro atual: um seletor "Tipo de Quadro" com opções **Distribuição (Q.E.)** e **Quadro Geral (QGE)**.
  - Em modo QGE, a escolha de calibre usa a lista completa (até 630 A) e o cálculo da secção usa as `FEEDER_SECTIONS` alargadas (até 400 mm²), evitando o erro de coordenação In > Iz em circuitos de grande potência.
  - Em modo distribuição, mantém o comportamento atual.
- O calibre passa a ser corretamente coordenado com a secção alargada, removendo o realce vermelho indevido.

## 2. Botões não encontrados — Equilíbrio de Fases e Calculadora de Tubagem

- O botão **"⚡ Equilíbrio de Fases Automático"** existe mas está no fim da linha do formulário (`ml-auto`), podendo ficar fora do ecrã em alguns tamanhos. Vai ser movido para uma barra de ações sempre visível junto aos botões do cabeçalho.
- A **calculadora de tubagem** só abre com duplo-clique no logótipo (não descoberto). Vai passar a ter um **botão visível "Tubagem"** no cabeçalho, ao lado de CSV/PDF (mantendo também o duplo-clique).

## 3. Modo trifásico deve dividir as fases igualmente

Atualmente um circuito trifásico não contribui para o equilíbrio de fases e os totais L1/L2/L3 só somam cargas mono.

- Ao calcular o desequilíbrio (`phaseImbalance`) e os totais por fase, as cargas **trifásicas passam a ser distribuídas igualmente** pelas três fases (P/3 em cada L1, L2, L3).
- O equilíbrio automático continua a distribuir os monofásicos, mas agora sobre uma base que já inclui a parte trifásica equilibrada — refletindo corretamente a carga real por fase no rodapé (L1/L2/L3) e na chip de desequilíbrio.

## Detalhes técnicos
- `src/lib/calc/engine.ts`: alargar `STD_BREAKERS`; ajustar `computeCircuit`/`pickBreaker` para usar a lista completa e `FEEDER_SECTIONS` quando o quadro for QGE; atualizar `phaseImbalance` para incluir terço da carga trifásica em cada fase.
- `src/lib/calc/storage.ts`: adicionar campo `panelKind: "QE" | "QGE"` ao tipo `Panel` (default "QE").
- `src/components/calcstudio/CalcStudio.tsx`: seletor de tipo de quadro; mover botão de equilíbrio para barra visível; adicionar botão "Tubagem" no cabeçalho.

Nenhuma alteração de backend é necessária; tudo é lógica e UI de frontend.