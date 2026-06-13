# Plano — Modal "Sobre" Informativo

O botão "Sobre" já existe no cabeçalho (`showAbout`), mas apenas exibe contacto do desenvolvedor. Vai ser convertido num **modal de ajuda/documentação** com explicações resumidas de toda a lógica da app.

## Alterações

### 1. Converter `showAbout` de secção colapsável para modal
- Usar o componente `<Dialog>` do shadcn/ui (já disponível no projeto).
- O botão "Sobre" no header passa a abrir o modal em vez de expandir inline.
- Eliminar o bloco inline antigo (linhas 368–377 do `CalcStudio.tsx`).

### 2. Conteúdo do modal (em Português)
O modal terá uma lista de tópicos, cada um com título e breve descrição:

1. **Queda de Tensão (ΔU)**
   - Cálculo simplificado segundo método das resistências (ρ·L·I/S).
   - Limite de 4% total (feeder + circuito) imposto pela Portaria 850/2015.
   - Alertas visuais quando o valor se aproxima ou ultrapassa o limite.

2. **Coordenação In ≤ Iz (RTIEBT 433)**
   - O calibre do disjuntor (`In`) não pode ser superior à capacidade do cabo (`Iz`).
   - A app escolhe automaticamente a secção mínima que garante `Iz ≥ In`.
   - Se o utilizador forçar um `In` manual maior que `Iz`, aparece erro vermelho.

3. **Curvas de Proteção (B / C / D)**
   - **B**: cargas puramente resistivas (iluminação, tomadas).
   - **C**: cargas mistas (motores pequenos, eletrodomésticos).
   - **D**: cargas com alto pico de arranque (ar condicionado, UAC).
   - Sugestão automática: D para AC/UAC; C para os restantes.

4. **Equilíbrio de Fases**
   - Cargas trifásicas dividem-se igualmente (P/3 em cada fase).
   - Cargas monofásicas são distribuídas pelo algoritmo greedy para minimizar o desequilíbrio.
   - Alerta visual: verde (OK) / amarelo (quase a exceder) / vermelho (crítico >15%).

5. **Dimensionamento de Secções**
   - Em quadro de distribuição (QE): secções até 95 mm², calibres até 63 A.
   - Em quadro geral (QGE): secções até 400 mm², calibres até 630 A.
   - A secção é subida automaticamente se o ΔU ou In > Iz o exigirem.

6. **Corrente de Curto-Circuito (Icc)**
   - Cálculo simplificado: Icc terminal diminui com o comprimento e a secção da linha.
   - Permite verificar se o disjuntor tem capacidade de corte suficiente.

7. **Aparelhagem Geral (Corte Geral)**
   - Dimensionado com fator de 1.25 × Ib total.
   - Acima de 100 A sugere fusíveis gG; abaixo sugere interruptor.
   - Mostra a capacidade real do dispositivo escolhido.

8. **Tubagem Elétrica**
   - Calculadora oculta (botão "Tubagem" ou duplo-clique no logo).
   - Baseada na taxa de enchimento máxima (53% / 31% / 40%) segundo o nº de condutores.
   - Sugere diâmetro nominal do tubo normalizado.

9. **Exportação**
   - **CSV**: lista de circuitos com todos os dados calculados.
   - **PDF**: relatório do quadro ativo com especificações.
   - **PDF Cascata**: diagrama geral de todos os quadros em cascata com cabos e dados.

10. **Desenvolvedor**
    - SérgioTech, contacto e slogan (manter info existente).

### 3. Ficheiro a alterar
- `src/components/calcstudio/CalcStudio.tsx` — substituir o bloco `showAbout` inline pelo componente `<Dialog>` do shadcn, importando-o no topo do ficheiro.

Nenhuma alteração de backend ou motor de cálculo é necessária. Apenas UI e texto informativo.