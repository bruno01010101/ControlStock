import { useState } from "react";
import Tabela from "../../components/card/index"
import SearchInput from "../../components/searchInput"
import Pagination from "../../components/Paginacao";
import styles from "./pedidos.module.css";
import TextoSituacao from "../../components/textoSituacao"
import Selecao from "../../components/selecao"
import { PageHeader } from '../../components/header';

const POR_PAGINA = 6;

const STATUS = {
  pendente: { text: "Pendente", situacao: "mid" },
  recebido: { text: "Recebido", situacao: "bom" },
  cancelado: { text: "Cancelado", situacao: "ruim" },
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// "2026-06-30" -> "30/06/2026"
const formatarData = (iso) => iso.split("-").reverse().join("/");

// data de hoje no fuso local, no formato que o input type="date" usa
const hojeISO = () => new Date().toLocaleDateString("sv-SE");

const criarItemVazio = () => ({
  chave: crypto.randomUUID(),
  itemId: "",
  data: hojeISO(),
});

const criarFormVazio = () => ({
  status: "pendente",
  solicitante: "",
  total: null,
  itens: [criarItemVazio()],
});

// abre o calendário do input que fica logo antes do botão
const abrirCalendario = (e) => {
  const campo = e.currentTarget.previousElementSibling;
  try {
    campo.showPicker();
  } catch {
    campo.focus();
  }
};

const ICONE_MAIS = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const ICONE_CALENDARIO = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

/* ---------- MOCK: apagar quando os slices existirem ---------- */
// trocar por: const itensCadastrados = useSelector(selectItens);
const ITENS_MOCK = [
  { id: "1", nome: "Café especial 500g" },
  { id: "2", nome: "Leite integral 1L" },
  { id: "3", nome: "Copo térmico 450ml" },
  { id: "4", nome: "Xarope de baunilha" },
  { id: "5", nome: "Filtro de papel nº 4" },
  { id: "6", nome: "Guardanapo kraft" },
];

const nomeDoItem = (id) =>
  ITENS_MOCK.find((item) => item.id === id)?.nome ?? "—";

const BASE = [
  {
    solicitante: "Marina Souza",
    total: 1248,
    status: "pendente",
    itens: [
      { itemId: "1", data: "2026-06-30" },
      { itemId: "5", data: "2026-06-30" },
    ],
  },
  {
    solicitante: "Lucas Santos",
    total: 864,
    status: "pendente",
    itens: [
      { itemId: "2", data: "2026-06-29" },
      { itemId: "3", data: "2026-06-29" },
      { itemId: "4", data: "2026-06-29" },
    ],
  },
  {
    solicitante: "Ana Costa",
    total: 720,
    status: "recebido",
    itens: [{ itemId: "3", data: "2026-06-28" }],
  },
  {
    solicitante: "Marina Souza",
    total: 486,
    status: "recebido",
    itens: [
      { itemId: "4", data: "2026-06-27" },
      { itemId: "1", data: "2026-06-27" },
    ],
  },
  {
    solicitante: "Pedro Lima",
    total: 312,
    status: "cancelado",
    itens: [
      { itemId: "5", data: "2026-06-26" },
      { itemId: "6", data: "2026-06-26" },
      { itemId: "2", data: "2026-06-26" },
    ],
  },
  {
    solicitante: "Lucas Santos",
    total: 540,
    status: "recebido",
    itens: [
      { itemId: "6", data: "2026-06-25" },
      { itemId: "3", data: "2026-06-25" },
      { itemId: "1", data: "2026-06-25" },
    ],
  },
];

const PEDIDOS_MOCK = Array.from({ length: 24 }, (_, i) => ({
  ...BASE[i % BASE.length],
  id: 2847 - i,
  codigo: `PC-${2847 - i}`,
}));
/* -------------------------------------------------------------------- */

export default function Pedidos() {
  // lista e filtros
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("todos");
  const [page, setPage] = useState(1);

  // trocar por: const pedidos = useSelector(selectPedidos);
  // (e criar/editar viram dispatch no handleSubmit)
  const [pedidos, setPedidos] = useState(PEDIDOS_MOCK);

  // formulário
  const [form, setForm] = useState(criarFormVazio);
  const [editandoId, setEditandoId] = useState(null);

  const termo = busca.trim().toLowerCase();
  const filtrados = pedidos.filter(
    (p) =>
      (situacao === "todos" || STATUS[p.status].situacao === situacao) &&
      (!termo ||
        p.codigo.toLowerCase().includes(termo) ||
        p.solicitante.toLowerCase().includes(termo))
  );

  const totalPages = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const inicio = (page - 1) * POR_PAGINA;
  const pedidosDaPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  const proximoId = pedidos.reduce((maior, p) => Math.max(maior, p.id), 0) + 1;
  const codigoDoForm = `PC-${editandoId ?? proximoId}`;

  // aceita evento ou string, dependendo de como seu SearchInput/Selecao chamam o onChange
  const handleBusca = (e) => {
    setBusca(typeof e === "string" ? e : e.target.value);
    setPage(1);
  };

  const handleSituacao = (e) => {
    setSituacao(typeof e === "string" ? e : e.target.value);
    setPage(1);
  };

  // formulário
  const setCampo = (campo, valor) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  const handleItem = (chave, campo, valor) =>
    setForm((atual) => ({
      ...atual,
      itens: atual.itens.map((linha) =>
        linha.chave === chave ? { ...linha, [campo]: valor } : linha
      ),
    }));

  const adicionarItem = () =>
    setForm((atual) => ({ ...atual, itens: [...atual.itens, criarItemVazio()] }));

  // digita só números e o valor vai sendo formatado como moeda (centavos)
  const handleTotal = (e) => {
    const digitos = e.target.value.replace(/\D/g, "");
    setCampo("total", Number(digitos) / 100 || null);
  };

  const limpar = () => {
    setForm(criarFormVazio());
    setEditandoId(null);
  };

  const handleEditar = (pedido) => {
    setEditandoId(pedido.id);
    setForm({
      status: pedido.status,
      solicitante: pedido.solicitante,
      total: pedido.total,
      itens: pedido.itens.map((linha) => ({ ...linha, chave: crypto.randomUUID() })),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dados = {
      status: form.status,
      solicitante: form.solicitante.trim(),
      total: form.total,
      itens: form.itens.map(({ itemId, data }) => ({ itemId, data })),
    };

    if (editandoId) {
      setPedidos((atual) =>
        atual.map((p) => (p.id === editandoId ? { ...p, ...dados } : p))
      );
    } else {
      setPedidos((atual) => [
        { id: proximoId, codigo: `PC-${proximoId}`, ...dados },
        ...atual,
      ]);
      setPage(1);
    }

    limpar();
  };

  return (
    <>
      <PageHeader
        title="Pedido de compra"
        subtitle="Acompanhe os pedidos anteriores e registre novas compras para o estoque."
      />
      <div className={styles.pagina}>
        <div className={styles.pedidos}>
          <Tabela colunas="1fr 2.2fr 1.1fr 1.2fr 2.5rem">
            <Tabela.Cabecalho
              titulo="Pedidos anteriores"
              subtitulo={`${pedidos.length} pedidos cadastrados`}
              acao={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.iconeHistorico}
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M12 7v5l4 2" />
                </svg>
              }
              filtrosAbaixo
            >
              <SearchInput
                placeholder="Buscar código ou solicitante..."
                text={busca}
                onChange={handleBusca}
              />
              <div style={{width: "150px"}}>
                <Selecao value={situacao} onChange={handleSituacao} />
              </div>
            </Tabela.Cabecalho>

            <Tabela.Colunas
              nomes={["Pedido", "Itens / Solicitante", "Total", "Status"]}
              caixaAlta
            />

            <Tabela.Corpo vazio="Nenhum pedido encontrado">
              {pedidosDaPagina.map((pedido) => (
                <Tabela.Linha
                  key={pedido.id}
                  acao={<Tabela.Editar onClick={() => handleEditar(pedido)} />}
                >
                  <div className={styles.celula}>
                    <strong className={styles.codigo}>{pedido.codigo}</strong>
                    <span className={styles.secundario}>
                      {formatarData(pedido.itens[0].data)}
                    </span>
                  </div>
                  <div className={styles.celula}>
                    <p className={styles.itemPrincipal}>
                      {nomeDoItem(pedido.itens[0].itemId)}
                    </p>
                    <span className={styles.secundario}>
                      {pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"} ·{" "}
                      {pedido.solicitante}
                    </span>
                  </div>
                  <p className={styles.total}>{moeda.format(pedido.total)}</p>
                  <TextoSituacao {...STATUS[pedido.status]} />
                </Tabela.Linha>
              ))}
            </Tabela.Corpo>

            <Tabela.Paginacao>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </Tabela.Paginacao>
          </Tabela>
        </div>

        <form className={styles.novoPedido} onSubmit={handleSubmit}>
          <div className={styles.formCabecalho}>
            <h2 className={styles.formTitulo}>
              {editandoId ? "Editar pedido" : "Novo pedido"}
            </h2>
            <p className="menuTitle">
              {editandoId
                ? "Altere os dados e salve o pedido."
                : "Preencha os dados para registrar a compra."}
            </p>
          </div>

          <div className={styles.formCorpo}>
            <div className={styles.secao}>
              <div className={styles.linhaDupla}>
                <label className={styles.campo}>
                  <span className={styles.rotulo}>Cód. pedido</span>
                  <input className={styles.input} value={codigoDoForm} readOnly />
                </label>
                <label className={styles.campo}>
                  <span className={styles.rotulo}>Status</span>
                  <select
                    className={`${styles.input} ${styles.selectCampo}`}
                    value={form.status}
                    onChange={(e) => setCampo("status", e.target.value)}
                  >
                    {Object.entries(STATUS).map(([valor, { text }]) => (
                      <option key={valor} value={valor}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.campo}>
                <span className={styles.rotulo}>Nome do solicitante</span>
                <input
                  className={styles.input}
                  value={form.solicitante}
                  onChange={(e) => setCampo("solicitante", e.target.value)}
                  required
                />
              </label>
            </div>

            <div className={styles.secao}>
              <div className={styles.itensCabecalho}>
                <strong className={styles.itensTitulo}>Itens do pedido</strong>
                <span className={styles.ajuda}>
                  {form.itens.length}{" "}
                  {form.itens.length === 1 ? "item adicionado" : "itens adicionados"}
                </span>
              </div>

              {form.itens.map((linha) => (
                <div key={linha.chave} className={styles.linhaItem}>
                  <label className={styles.campo}>
                    <span className={styles.rotulo}>Item</span>
                    <select
                      className={`${styles.input} ${styles.selectCampo}`}
                      value={linha.itemId}
                      onChange={(e) => handleItem(linha.chave, "itemId", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Selecione um item
                      </option>
                      {ITENS_MOCK.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className={styles.campo}>
                    <span className={styles.rotulo}>Data do pedido</span>
                    <div className={styles.campoData}>
                      <input
                        type="date"
                        className={styles.input}
                        aria-label="Data do pedido"
                        value={linha.data}
                        onChange={(e) => handleItem(linha.chave, "data", e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.botaoCalendario}
                        onClick={abrirCalendario}
                        aria-label="Abrir calendário"
                      >
                        {ICONE_CALENDARIO}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className={styles.adicionarItem} onClick={adicionarItem}>
                {ICONE_MAIS}
                Adicionar item e data
              </button>
            </div>

            <div className={styles.secao}>
              <label className={styles.campo}>
                <span className={styles.rotulo}>Preço total</span>
                <input
                  className={styles.input}
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={form.total == null ? "" : moeda.format(form.total)}
                  onChange={handleTotal}
                  required
                />
              </label>
              <p className={styles.ajuda}>Informe o valor total de todos os itens do pedido.</p>
            </div>
          </div>

          <div className={styles.formRodape}>
            <button
              type="button"
              className={`${styles.botao} ${styles.botaoSecundario}`}
              onClick={limpar}
            >
              {editandoId ? "Cancelar" : "Limpar"}
            </button>
            <button type="submit" className={`${styles.botao} ${styles.botaoPrimario}`}>
              {ICONE_MAIS}
              {editandoId ? "Salvar alterações" : "Criar pedido"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
