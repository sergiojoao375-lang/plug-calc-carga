# Plano — CSS do badge, tubagem com cabos, dados da obra, guardar projeto e executável desktop

Cinco pedidos. Os quatro primeiros são alterações na app; o quinto gera o executável desktop via Electron.

## 1. Ocultar badge Lovable (CSS)

Adicionar o bloco CSS fornecido ao fim de `src/styles.css` (não existe `index.css` neste projeto — o ficheiro global é `styles.css`). As regras escondem qualquer link/iframe/badge "Edit with Lovable".

```text
a[href*="lovable.dev"], iframe[src*="lovable.dev"],
div[style*="Edit with Lovable"], .lovable-badge { display:none !important; ... }
```

## 2. Tubagem: suportar cabos além de fio (XV, RZ1-K, etc.)

Atualmente a calculadora usa só os diâmetros do fio H07V-K (`CABLE_OD` em `conduit.ts`). Vai passar a suportar vários **tipos de condutor**, cada um com a sua tabela de diâmetro exterior por secção:

- `H07V-K` / `H07V-R` — fio rígido/flexível (tabela atual).
- `XV (VV)` — cabo PVC.
- `RZ1-K` / `XZ1` — cabo isolamento XLPE livre de halogéneo.
- `FVV` — cabo multipolar PVC.

Alterações em `src/lib/calc/conduit.ts`:
- Substituir `CABLE_OD` único por um mapa `CABLE_OD_BY_TYPE: Record<tipo, Record<secção, Ø>>` com diâmetros aproximados por tipo.
- `ConduitCable` ganha campo `type`.
- `computeConduit` lê o Ø do tipo escolhido.

Alterações em `src/components/calcstudio/ConduitCalculator.tsx`:
- Cada linha de condutor passa a ter um seletor de **Tipo de cabo** (além de secção e nº de condutores).
- As secções disponíveis ajustam-se ao tipo selecionado.

## 3. Aba de dados da obra (cabeçalho do projeto)

Adicionar campos ao projeto:
- **Nome da obra**
- **Engenheiro responsável**
- **Nº de carteira** (cédula profissional)

Implementação:
- Em `src/lib/calc/storage.ts`: adicionar a `AppState` um objeto `project: { obra, engenheiro, carteira }` (com default vazio no `seed()`).
- Em `CalcStudio.tsx`: botão **"Obra"** no cabeçalho que abre um modal (`Dialog` shadcn) com os três campos, gravados no estado.
- Em `src/lib/calc/export.ts`: incluir estes dados no cabeçalho/primeira página dos PDF (relatório e cascata), para constarem nos documentos oficiais.

## 4. Guardar / abrir projeto

O estado já persiste em `localStorage`. Acrescentar guardar/abrir como ficheiro:
- Botão **"Guardar"** — exporta todo o `AppState` (quadros + dados da obra) para um ficheiro `.json` descarregável (nome derivado da obra).
- Botão **"Abrir"** — `input file` que lê um `.json` e restaura o estado.
- Funções utilitárias `saveProjectFile(state)` e `loadProjectFile(file)` em `storage.ts`.

## 5. Executável desktop (Electron)

Empacotar a app como aplicação desktop usando `@electron/packager` (o build do site corre em paralelo).

Passos:
- `base: './'` no build para os assets carregarem via `file://`.
- Criar `electron/main.cjs` (CommonJS) com `BrowserWindow` a carregar `dist/index.html`, `contextIsolation: true`, `nodeIntegration: false`.
- Definir `"main": "electron/main.cjs"` no `package.json`.
- Instalar `electron` + `@electron/packager` (dev), construir o frontend e empacotar para Linux/Windows.
- Arquivar o resultado em `/mnt/documents/` para download.

Nota técnica: este projeto é TanStack Start com SSR (Cloudflare). Para o Electron será usado um build estático do frontend (cliente) servido por `file://`; funcionalidades de servidor não são usadas (a app é cálculo 100% no cliente com `localStorage`), pelo que o empacotamento desktop funciona bem. Será entregue o `.tar.gz` (Linux) e, se possível, `.zip` (Windows).

### Ficheiros a alterar/criar
- `src/styles.css` — CSS do badge.
- `src/lib/calc/conduit.ts` — tabelas por tipo de cabo.
- `src/components/calcstudio/ConduitCalculator.tsx` — seletor de tipo.
- `src/lib/calc/storage.ts` — `project`, guardar/abrir ficheiro.
- `src/components/calcstudio/CalcStudio.tsx` — botões/modais Obra, Guardar, Abrir.
- `src/lib/calc/export.ts` — dados da obra nos PDF.
- `electron/main.cjs`, `package.json`, `vite.config`/build — empacotamento desktop.