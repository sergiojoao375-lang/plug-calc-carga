import {
  PRECO_SOCIAL_I,
  PRECO_SOCIAL_II,
  PRECO_GERAL,
  PRECO_COMERCIO,
  PRECO_INDUSTRIAL,
  TAXA_POTENCIA_GERAL,
  TAXA_POTENCIA_COMERCIO,
  TAXA_POTENCIA_INDUSTRIAL,
} from "../constants/tariffs";
import { formatKWh } from "../utils/format";

// ---------------------------------------------------------------------------
// ABA 4 — DIÁRIO OFICIAL
// Painel de certidão pública, com o resumo legal do Despacho n.º 3133/25
// do IRSEA (Diário da República, II Série, N.º 80, de 5/5/2025), para
// auditoria e transparência do cliente.
// ---------------------------------------------------------------------------

const ARTIGOS = [
  {
    artigo: "Artigo 3.º",
    titulo: "Tarifas Domésticas Sociais (BT)",
    linhas: [
      {
        escalao: "BTDSI — Social I (pc até 1,3 kVA; até 120 kWh/mês)",
        preco: `${formatKWh(PRECO_SOCIAL_I)} Kz/kWh`,
        formula: "F = 3,20 × W",
      },
      {
        escalao: "BTDSII — Social II (pc = 3,0 kVA; até 200 kWh/mês)",
        preco: `${formatKWh(PRECO_SOCIAL_II)} Kz/kWh`,
        formula: "F = 8,33 × W",
      },
    ],
    nota:
      "Nos termos do n.º 5, é obrigatória a instalação de um dispositivo de limitação de potência, fornecido pela empresa distribuidora, para beneficiar destas tarifas.",
  },
  {
    artigo: "Artigo 5.º",
    titulo: "Tarifa Doméstica Monofásica Geral — BTDM (pc > 3,0 e ≤ 9,9 kVA)",
    linhas: [
      {
        escalao: "Taxa de potência contratada (pc)",
        preco: `${formatKWh(TAXA_POTENCIA_GERAL)} Kz/kVA`,
        formula: "F = 117,00 × pc + 14,16 × W",
      },
      {
        escalao: "Preço de energia (W)",
        preco: `${formatKWh(PRECO_GERAL)} Kz/kWh`,
        formula: "—",
      },
    ],
  },
  {
    artigo: "Artigo 7.º",
    titulo: "Tarifa Comércio e Serviços — BTCS",
    linhas: [
      {
        escalao: "Taxa de potência contratada (pc)",
        preco: `${formatKWh(TAXA_POTENCIA_COMERCIO)} Kz/kVA`,
        formula: "F = 130,00 × pc + 19,16 × W",
      },
      {
        escalao: "Preço de energia (W)",
        preco: `${formatKWh(PRECO_COMERCIO)} Kz/kWh`,
        formula: "—",
      },
    ],
  },
  {
    artigo: "Artigo 8.º",
    titulo: "Tarifa Indústria — BTI",
    linhas: [
      {
        escalao: "Taxa de potência contratada (pc)",
        preco: `${formatKWh(TAXA_POTENCIA_INDUSTRIAL)} Kz/kVA`,
        formula: "F = 130,00 × pc + 16,67 × W",
      },
      {
        escalao: "Preço de energia (W)",
        preco: `${formatKWh(PRECO_INDUSTRIAL)} Kz/kWh`,
        formula: "—",
      },
    ],
  },
];

export default function AbaDiarioOficial() {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border-2 border-double border-amber-400/40 bg-white p-5 text-slate-900 shadow-lg sm:p-8">
        {/* CABEÇALHO OFICIAL */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
            República de Angola
          </p>
          <h2 className="mt-1 font-serif text-sm font-bold uppercase leading-snug text-slate-900 sm:text-base">
            Diário da República — Órgão Oficial da República de Angola
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-600 sm:text-sm">
            (II Série — N.º 80, de 5 de Maio de 2025)
          </p>
          <p className="mt-3 font-serif text-xs italic text-slate-700 sm:text-sm">
            Instituto Regulador dos Serviços de Electricidade e de Água —{" "}
            <span className="font-semibold not-italic">Despacho n.º 3133/25</span>
          </p>
        </div>

        {/* SELO / CARIMBO DECORATIVO */}
        <div className="mt-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500 text-center sm:h-20 sm:w-20">
            <span className="font-serif text-[9px] font-bold uppercase leading-tight text-amber-600 sm:text-[10px]">
              IRSEA
              <br />
              Certidão
              <br />
              Pública
            </span>
          </div>
        </div>

        {/* CORPO — TABELA DE ARTIGOS */}
        <div className="mt-6 flex flex-col gap-6">
          {ARTIGOS.map((bloco) => (
            <div key={bloco.artigo}>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wide text-slate-900 sm:text-base">
                {bloco.artigo} — {bloco.titulo}
              </h3>
              <div className="mt-2 overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-slate-600">
                      <th className="px-3 py-2 font-semibold">Discriminação</th>
                      <th className="px-3 py-2 font-semibold">Valor Oficial</th>
                      <th className="px-3 py-2 font-semibold">Fórmula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloco.linhas.map((linha, idx) => (
                      <tr
                        key={linha.escalao}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                      >
                        <td className="border-t border-slate-200 px-3 py-2 text-slate-800">
                          {linha.escalao}
                        </td>
                        <td className="border-t border-slate-200 px-3 py-2 font-semibold text-amber-600">
                          {linha.preco}
                        </td>
                        <td className="border-t border-slate-200 px-3 py-2 font-mono text-[11px] text-slate-600 sm:text-xs">
                          {linha.formula}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bloco.nota && (
                <p className="mt-1.5 text-[11px] italic text-slate-500 sm:text-xs">
                  ⓘ {bloco.nota}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* VARIÁVEIS OFICIAIS (Art. 14.º) */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 sm:text-xs">
          <p className="font-semibold text-slate-700">Legenda das variáveis (Art. 14.º):</p>
          <p className="mt-1">
            <span className="font-mono">F</span> — valor da factura em Kwanzas ·{" "}
            <span className="font-mono">pc</span> — potência contratada em kVA ·{" "}
            <span className="font-mono">W</span> — consumo em kWh facturado no período.
          </p>
        </div>

        {/* RODAPÉ OFICIAL */}
        <div className="mt-8 border-t-2 border-slate-900 pt-4 text-center">
          <p className="font-serif text-xs italic text-slate-700 sm:text-sm">
            Luanda — O Presidente do Conselho de Administração,
          </p>
          <p className="mt-1 font-serif text-sm font-bold text-slate-900 sm:text-base">
            Luís Mourão Garcês da Silva
          </p>
        </div>
      </section>

      <p className="text-center text-xs text-slate-500">
        Documento gerado pelo ENDE CALC para fins de consulta e auditoria dos valores
        tarifários aplicados nas simulações. Não substitui a publicação oficial do Diário
        da República.
      </p>
    </div>
  );
}
