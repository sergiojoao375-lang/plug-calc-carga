# Alinhar a secção "Sobre" ao cálculo real

Verifiquei o motor de cálculo (`engine.ts`, `conduit.ts`) contra o texto da modal "Sobre". A maioria está correta; há 3 pontos onde a documentação descreve algo diferente do que o código realmente faz. Como a app é uma ferramenta de cálculo, a documentação deve ser factualmente fiel ao que corre. Este plano corrige **apenas o texto/tabelas do "Sobre"** — nenhum resultado de cálculo muda.

## O que está correto (mantém-se)

- Potência Aparente `S = P/cosφ`
- Corrente `Ib` mono/tri
- Coordenação `Ib ≤ In ≤ Iz`
- Queda de Tensão (fórmulas + ρ a 70 °C: Cu 0,0225 · Al 0,036)
- Tubagem (taxas 53/31/40 %, áreas, secção interior)
- Equilíbrio de Fases

## Correções a aplicar

Ficheiro: `src/components/calcstudio/CalcStudio.tsx` (constante `ABOUT_TOPICS`).

### 1. Tópico 5 — Curto-Circuito (Icc)

A tabela atual lista constantes que o código **não usa** (ρ a 20 °C 0,018/0,028 e reactância x = 0,08 Ω/km com soma vetorial). O motor real usa:
- as mesmas resistividades a 70 °C do resto da app (`RHO`: Cu 0,0225 · Al 0,036);
- soma **escalar** de impedâncias, **sem** componente reativa;
- impedância acumulada: `Z_total = Z_rede + Z_interligação + Z_circuito`.

Alterações:
- Substituir a tabela de constantes "20 °C + reactância" por uma tabela fiel: ρ a 70 °C (Cu 0,0225 · Al 0,036 Ω·mm²/m), U0 = 230 V (fase).
- Substituir a fórmula vetorial `Z_total = √[(Z_rede+R)²+X²]` por:
  - `Z_rede = U0 / Icc_origem`
  - `Z_cabo = ρ · L / S`
  - `Z_total = Z_rede + Z_interligação + Z_circuito`
  - `Icc_final = U0 / Z_total` (→ kA)
- Reescrever a nota: deixar claro que a app usa um modelo de impedância acumulada simplificado (resistivo, conservador) inspirado no IEC 60909, sem indução de reactância — em vez de afirmar constantes que não são usadas.

### 2. Tópico 1/2 — Fator de carga

O motor calcula `S = (P · fator) / cosφ`, com fator 1,25 para Ar Condicionado e UAC (sobredimensionamento de arranque). Adicionar:
- Uma linha/nota no tópico "Potência Aparente" a explicar o fator de majoração de arranque (AC/UAC = 1,25; restantes = 1,0), para que o utilizador perceba porque Ib de um AC é superior ao esperado.

### 3. Tópico 4 — Limite de 1,5 % na interligação

O código valida o teto global de 4 % nos circuitos terminais; o limite de 1,5 % do feeder é apresentado como referência de boas práticas mas não bloqueia. Ajustar o texto para indicar que 4 % é o limite validado automaticamente e 1,5 % é o valor recomendado para a linha de interligação (indicador de cor), evitando dar a entender uma validação que não existe.

## Notas técnicas

- Edição isolada à constante `ABOUT_TOPICS` e, se necessário, ao render `AboutBlockView` (sem mudanças de lógica).
- Sem alterações a `engine.ts` nem `conduit.ts` — os resultados permanecem idênticos.
- Apenas tokens de design existentes; sem cores hardcoded.

## Resultado

Depois desta correção, **confirmo que a app respeitará integralmente a secção "Sobre"**: cada fórmula e constante documentada corresponde exatamente ao que o motor calcula.
