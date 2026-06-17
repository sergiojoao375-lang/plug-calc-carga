# Documentação técnica na modal "Sobre"

Transformar a modal "Sobre" (atualmente uma lista simples de parágrafos em `ABOUT_TOPICS`) numa documentação técnica completa e educativa, com fórmulas em blocos de destaque (fundo escuro, tipografia monoespaçada clara), tabelas de constantes e referências normativas (RTIEBT / IEC), mantendo o tema dark moderno da app.

## O que muda

Apenas apresentação/conteúdo. Nenhuma alteração à lógica de cálculo (`engine.ts`, `conduit.ts`) — só documentamos o que já existe.

Ficheiro alterado: `src/components/calcstudio/CalcStudio.tsx`
- Substituir a estrutura `ABOUT_TOPICS` (title + body de texto) por uma estrutura de blocos mais rica que suporte: parágrafos, fórmulas em destaque, tabelas de constantes e badges de referência normativa.
- Reescrever o `AboutDialog` para renderizar esses blocos com Tailwind, usando tokens semânticos do tema (sem cores hardcoded). Manter o cartão do Desenvolvedor no fim.

## Estrutura visual de cada tópico

```text
┌─ TÍTULO (verde da marca) ───────── [badge: RTIEBT 433] ─┐
│  Explicação em texto                                     │
│  ┌─ bloco fórmula (fundo escuro, mono) ──────────────┐  │
│  │  S = P / cos φ            [VA]                     │  │
│  └───────────────────────────────────────────────────┘  │
│  (opcional) tabela de constantes                         │
└──────────────────────────────────────────────────────────┘
```

- Blocos de fórmula: `bg-[color:var(--surface-2)]`/`bg-card` escuro, `font-mono`, borda subtil, espaçamento confortável.
- Badges normativos: pill pequena com `--brand-blue`.
- Tabelas de constantes: `<table>` simples com cabeçalho `muted`.

## Conteúdo dos tópicos

1. **Potência Aparente (S)** — `S = P / cos φ` (VA). Impacto total da carga reativa+ativa.
2. **Corrente de Projeto (Ib)** — Mono (230V): `Ib = P / (V · cos φ)`; Tri (400V): `Ib = P / (√3 · V · cos φ)` (A).
3. **Coordenação de Proteções** — regra de ouro `Ib ≤ In ≤ Iz`; badge RTIEBT 433 / IEC 60364.
4. **Queda de Tensão (ΔU%)** — Mono `ΔU = 2·ρ·L·Ib·cos φ / S`; Tri `ΔU = √3·ρ·L·Ib·cos φ / S`; `ΔU% = ΔU/V · 100`. Tabela de resistividades (ρ a 70°C): Cu 0,0225 · Al 0,036 Ω·mm²/m. Limites: 4% terminais, 1,5% interligação.
5. **Atenuação de Curto-Circuito (Icc)** — explicação + **Método das Impedâncias (IEC 60909)** com os 4 passos em blocos de fórmula:
   - `Z_rede = U0 / Icc_origem`
   - `R_cabo = ρ·L / S` · `X_cabo = x·L`
   - `Z_total = √[(Z_rede + R_cabo)² + (X_cabo)²]`
   - `Icc_final = U0 / Z_total` (→ kA)
   - Tabela de constantes: ρ a 20°C (Cu 0,018 · Al 0,028 Ω·mm²/m), reactância linear x = 0,00008 Ω/m (0,08 Ω/km), U0 = 230 V.
   - Nota: descreve o método normativo de referência; a app usa atualmente um modelo de impedância simplificado equivalente.
6. **Equilíbrio de Fases** — algoritmo de dispersão das cargas monofásicas por L1/L2/L3, alvo de dispersão < 10% para proteger o Neutro e evitar disparos intempestivos.
7. **Cálculo de Tubagem** — taxa de enchimento por nº de condutores (1→53%, 2→31%, ≥3→40%); área dos condutores `A = π·(Ø/2)²`; secção interior mínima `S_int = ΣA_cabos / taxa`; escolha do tubo normalizado cujo interior `≥ S_int`; enchimento real `% = ΣA / A_tubo · 100`. Referência RTIEBT / boas práticas.

## Notas técnicas

- Sem alterações de lógica nem de dados — documentação fiel às fórmulas já implementadas; o tópico Icc apresenta o método IEC 60909 pedido como referência educativa.
- Usar apenas tokens de design existentes (`--brand-green`, `--brand-blue`, `--surface-2`, `card`, `muted-foreground`) — sem cores hardcoded.
- A modal mantém scroll vertical (`max-h-[85vh] overflow-y-auto`).
