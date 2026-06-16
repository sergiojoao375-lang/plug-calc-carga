## Objetivo

No Quadro de Origem, substituir os campos livres por listas de valores normalizados (evita erros de introdução) e eliminar o botão duplicado de "Equilíbrio de Fases".

## Alterações

### 1. Icc origem (kA) → lista de seleção
Em `src/components/calcstudio/CalcStudio.tsx` (linhas ~261-265), trocar o `<input type="number">` por um `<select>` com apenas os valores disponíveis:

```
3, 6, 10, 15, 20, 25  (kA)
```

### 2. Tensões → listas de seleção
Os dois `<input type="number">` de tensão (linhas ~266-271) passam a `<select>` com os valores normalizados:

- **V mono:** 230 V
- **V tri:** 400 V

Assim não há margem de erro na introdução manual.

### 3. Remover botão duplicado de Equilíbrio de Fases
Existem dois botões que chamam `doBalance`:
- Linha 230 — na barra de ferramentas superior ("⚡ Equilíbrio Fases")
- Linha 398 — junto ao formulário de circuitos ("⚡ Equilíbrio de Fases Automático")

Remover o da **barra de ferramentas superior** (linha 230), mantendo o botão maior junto aos circuitos. (Se preferir manter o da barra superior, indique.)

## Notas técnicas
- Apenas alterações de UI no `CalcStudio.tsx`; sem mudanças na lógica de cálculo.
- Os valores selecionados continuam a alimentar `updatePanel({ iccOriginKA / voltageMono / voltageTri })` como números.
