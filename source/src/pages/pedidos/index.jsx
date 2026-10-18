import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Tabela from "../../components/card/index"
import SearchInput from "../../components/searchInput"
import Pagination from "../../components/Paginacao";
import styles from "./pedidos.module.css";
import TextoSituacao from "../../components/textoSituacao"
import Selecao from "../../components/selecao"
import { PageHeader } from '../../components/header';
import Loading from "../../components/Loading/Loading"

import {
  atualizarPedido,
  buscarPedidos,
  criarPedido,
  selectPedidos,
  selectPedidosFiltro,
  selectPedidosErro,
  selectPedidosSalvando,
  selectPedidosStatus,
} from "../../store/slices/pedidosSlice"; // ajuste o caminho
import { selectItensDaUnidade } from "../../store/slices/itensSlice";// ajuste o caminho
import { selectUnidadeSelecionadaId } from "../../store/slices/unidadesSlice";

const POR_PAGINA = 6;

const STATUS = {
  pendente: { text: "Pendente", situacao: "mid" },
  recebido: { text: "Recebido", situacao: "bom" },
  cancelado: { text: "Cancelado", situacao: "ruim" },
};

// pedido antigo, sem status, aparece como pendente em vez de quebrar a tela
const infoStatus = (status) => STATUS[status] ?? STATUS.pendente;

// opções do <Selecao>: "Todos" já vem de dentro do componente.
// Os valores são os que o aplicarFiltro (pedidosSlice) entende.
const OPCOES_FILTRO = [
  { value: "pendente", label: "Pendente" },
  { value: "recebido", label: "Recebido" },
  { value: "cancelado", label: "Cancelado" },
  { value: "maior", label: "Maior valor" },
  { value: "menor", label: "Menor valor" },
];

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// "2026-06-30" -> "30/06/2026"
const formatarData = (iso) => iso.split("-").reverse().join("/");

// data de hoje no fuso local, no formato que o input type="date" usa
const hojeISO = () => new Date().toLocaleDateString("sv-SE");

// chave só para o React diferenciar as linhas de item do formulário
// (não uso crypto.randomUUID porque ele não existe em http fora do localhost,
// por exemplo ao testar no celular pelo IP da rede)
let contadorChave = 0;
const novaChave = () => `linha-${++contadorChave}`;

const criarItemVazio = () => ({
  chave: novaChave(),
  itemId: "",
  quantidade: "1",
});

const criarFormVazio = () => ({
  codigo: "",
  status: "pendente",
  solicitante: "",
  dataSolicitacao: hojeISO(),
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

export default function Pedidos() {
  const dispatch = useDispatch();
  const pedidos = useSelector(selectPedidos);
  const statusLista = useSelector(selectPedidosStatus);
  const erroLista = useSelector(selectPedidosErro);
  const salvando = useSelector(selectPedidosSalvando);
  const filtro = useSelector(selectPedidosFiltro);
  const unidadeId = useSelector(selectUnidadeSelecionadaId);
  // itens da unidade selecionada, para o select "Item" do formulário
  const itensCadastrados = useSelector((state) =>
    selectItensDaUnidade(state, unidadeId)
  );

  // lista e filtros
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);

  // formulário
  const [form, setForm] = useState(criarFormVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [erroForm, setErroForm] = useState("");
  const formRef = useRef(null);

  // carrega os pedidos e recarrega quando o usuário troca de unidade
  useEffect(() => {
    if (unidadeId) dispatch(buscarPedidos());
  }, [unidadeId, dispatch]);

  const carregando = statusLista === "idle" || statusLista === "loading";

  const termo = busca.trim().toLowerCase();
  // status e valor já vêm filtrados/ordenados do banco; aqui só a busca por texto
  const filtrados = pedidos.filter(
    (p) =>
      !termo ||
      p.codigo.toLowerCase().includes(termo) ||
      p.solicitante.toLowerCase().includes(termo)
  );

  // com um status escolhido, o número da lista é o do filtro, não o total cadastrado
  const filtrandoStatus = filtro in STATUS;
  const subtitulo =
    pedidos.length === 1
      ? `1 pedido ${filtrandoStatus ? "encontrado" : "cadastrado"}`
      : `${pedidos.length} pedidos ${filtrandoStatus ? "encontrados" : "cadastrados"}`;

  const totalPages = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(page, totalPages);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const pedidosDaPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  // aceita evento ou string, dependendo de como seu SearchInput/Selecao chamam o onChange
  const handleBusca = (e) => {
    setBusca(typeof e === "string" ? e : e.target.value);
    setPage(1);
  };

  // muda o filtro/ordenação na query; silencioso para a tabela não piscar
  const handleFiltro = (valor) => {
    dispatch(buscarPedidos({ filtro: valor, silencioso: true }));
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
    setErroForm("");
  };

  const handleEditar = (pedido) => {
    setEditandoId(pedido.id);
    setErroForm("");
    setForm({
      codigo: pedido.codigo,
      status: pedido.status,
      solicitante: pedido.solicitante,
      dataSolicitacao: pedido.dataSolicitacao ?? "",
      total: pedido.total,
      itens: pedido.itens.length
        ? pedido.itens.map((i) => ({
            chave: novaChave(),
            itemId: i.itemId,
            quantidade: String(i.quantidade),
          }))
        : [criarItemVazio()],
    });
    // com a tela empilhada (celular/tablet) o formulário fica abaixo da tabela
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroForm("");

    const dados = {
      codigo: form.codigo.trim(),
      status: form.status,
      solicitante: form.solicitante.trim(),
      dataSolicitacao: form.dataSolicitacao || null,
      total: form.total,
      itens: form.itens.map(({ itemId, quantidade }) => ({ itemId, quantidade })),
    };

    try {
      if (editandoId) {
        await dispatch(atualizarPedido({ id: editandoId, ...dados })).unwrap();
      } else {
        await dispatch(criarPedido(dados)).unwrap();
        setPage(1);
      }
      limpar();
    } catch (erro) {
      setErroForm(
        typeof erro === "string" ? erro : "Não foi possível salvar o pedido."
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Pedido de compra"
        subtitle="Acompanhe os pedidos anteriores e registre novas compras para o estoque."
      />

      <div className={styles.pagina}>
        <div className={styles.pedidos}>
          {carregando ? (
            <Loading />
          ) : statusLista === "failed" ? (
            <div className={styles.erroLista} role="alert">
              <p>Não foi possível carregar os pedidos: {erroLista}</p>
              <button
                type="button"
                className={`${styles.botao} ${styles.botaoSecundario}`}
                onClick={() => dispatch(buscarPedidos())}
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <Tabela colunas="1.3fr 2.2fr 1.1fr 1.2fr 2.5rem">
              <Tabela.Cabecalho
                titulo="Pedidos anteriores"
                subtitulo={subtitulo}
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
                <div style={{width: "100px"}}>
                  <Selecao value={filtro} onChange={handleFiltro} opcoes={OPCOES_FILTRO} />
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
                      <strong className={styles.codigo}>{pedido.codigo || "—"}</strong>
                      <span className={styles.secundario}>
                        {pedido.dataSolicitacao
                          ? formatarData(pedido.dataSolicitacao)
                          : "—"}
                      </span>
                    </div>
                    <div className={styles.celula}>
                      <p className={styles.itemPrincipal}>
                        {pedido.itens[0]?.nome ?? "—"}
                      </p>
                      <span className={styles.secundario}>
                        {pedido.itens.length}{" "}
                        {pedido.itens.length === 1 ? "item" : "itens"} ·{" "}
                        {pedido.solicitante}
                      </span>
                    </div>
                    <p className={styles.total}>{moeda.format(pedido.total)}</p>
                    <TextoSituacao {...infoStatus(pedido.status)} />
                  </Tabela.Linha>
                ))}
              </Tabela.Corpo>

              <Tabela.Paginacao>
                <Pagination
                  page={paginaAtual}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </Tabela.Paginacao>
            </Tabela>
          )}
        </div>

        <form ref={formRef} className={styles.novoPedido} onSubmit={handleSubmit}>
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
                  <input
                    className={styles.input}
                    value={form.codigo}
                    onChange={(e) => setCampo("codigo", e.target.value)}
                    placeholder="Ex.: PC-2848"
                    autoComplete="off"
                  />
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

              <div className={styles.linhaDupla}>
                <label className={styles.campo}>
                  <span className={styles.rotulo}>Nome do solicitante</span>
                  <input
                    className={styles.input}
                    value={form.solicitante}
                    onChange={(e) => setCampo("solicitante", e.target.value)}
                    required
                  />
                </label>

                <div className={styles.campo}>
                  <span className={styles.rotulo}>Data do pedido</span>
                  <div className={styles.campoData}>
                    <input
                      type="date"
                      className={styles.input}
                      aria-label="Data do pedido"
                      value={form.dataSolicitacao}
                      onChange={(e) => setCampo("dataSolicitacao", e.target.value)}
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
                      {itensCadastrados.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nome}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.campo}>
                    <span className={styles.rotulo}>Quantidade</span>
                    <input
                      type="number"
                      className={styles.input}
                      min="0.01"
                      step="any"
                      inputMode="decimal"
                      value={linha.quantidade}
                      onChange={(e) =>
                        handleItem(linha.chave, "quantidade", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              ))}

              <button type="button" className={styles.adicionarItem} onClick={adicionarItem}>
                {ICONE_MAIS}
                Adicionar item
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

            {erroForm && (
              <p className={styles.erro} role="alert">
                {erroForm}
              </p>
            )}
          </div>

          <div className={styles.formRodape}>
            <button
              type="button"
              className={`${styles.botao} ${styles.botaoSecundario}`}
              onClick={limpar}
              disabled={salvando}
            >
              {editandoId ? "Cancelar" : "Limpar"}
            </button>
            <button
              type="submit"
              className={`${styles.botao} ${styles.botaoPrimario}`}
              disabled={salvando}
            >
              {!salvando && ICONE_MAIS}
              {salvando
                ? "Salvando..."
                : editandoId
                  ? "Salvar alterações"
                  : "Criar pedido"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
