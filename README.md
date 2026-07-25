# ⚡ ENDE CALC

Simulador de consumo elétrico, dimensionamento de circuitos (220V) e histórico
de simulações, feito para o mercado angolano (tarifas ENDE domésticas e
empresariais, moeda Kwanza).

## Como correr o projeto

```bash
npm install
npm run dev
```

Depois abre o endereço indicado no terminal (normalmente `http://localhost:5173`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
ende-calc/
├── index.html                    # HTML raiz (Vite)
├── package.json                  # Dependências e scripts
├── vite.config.js                # Configuração do Vite + React
├── tailwind.config.js            # Configuração do Tailwind CSS
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
└── src/
    ├── main.jsx                  # Ponto de entrada (monta o React na página)
    ├── App.jsx                   # Componente principal: estado, cálculos e layout
    ├── index.css                 # Diretivas do Tailwind
    │
    ├── assets/
    │   └── ende-logo.png         # Logótipo oficial da ENDE (fundo transparente)
    │
    ├── components/
    │   ├── AbaConsumo.jsx        # Aba 1 — Consumo ENDE (inventário, tarifa, PDF, WhatsApp)
    │   ├── AbaDimensionamento.jsx# Aba 2 — Dimensionamento de circuitos (220V)
    │   ├── AbaHistorico.jsx      # Aba 3 — Histórico de simulações guardadas
    │   └── RelatorioImpressao.jsx# Relatório usado ao imprimir a página (Ctrl+P)
    │
    ├── constants/
    │   ├── appliances.js         # Lista de eletrodomésticos, unidades de potência
    │   ├── tariffs.js            # Tarifas ENDE (Social, Geral, Comércio, Industrial)
    │   ├── breakers.js           # Tabela de disjuntores/bitolas de cabo
    │   └── storage.js            # Chaves usadas no localStorage
    │   └── logoBase64.js         # Logótipo em base64 (usado no relatório HTML autónomo)
    │
    └── utils/
        ├── format.js             # Formatação de Kz, kWh e datas (pt-PT)
        └── calculo.js            # Cálculo de proteção elétrica e texto de tarifa
```

## Funcionalidades

- **Consumo ENDE**: inventário de aparelhos (com opção de inserção manual em
  W/kW/HP para máquinas industriais), cálculo de kWh e custo com os escalões
  reais da ENDE (Social I/II/Excedido, Geral, Comércio, Industrial + taxa
  fixa kVA), simulação de recarga pré-paga, partilha no WhatsApp e download
  de relatório em HTML pronto para "Guardar como PDF".
- **Dimensionamento (220V)**: corrente, disjuntor e bitola de cabo sugeridos,
  com Fator de Potência (Cos φ) configurável.
- **Histórico**: simulações guardadas no navegador (localStorage), com opção
  de eliminar cada registo.

Dados persistidos localmente no navegador do utilizador (não há backend).
