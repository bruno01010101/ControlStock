import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import { selectOrganizacaoCodigo } from "./organizacaoSlice"; // ajuste o caminho

const TABELA = "itens"; // ajuste se a sua tabela tiver outro nome
const COLUNAS =
  "id, created_at, codigo, nome, unidade, quantidade, estoque_minimo, categoria, unidade_de_medida, codigo_organizacao";

const TAMANHO_PAGINA = 1000; // limite máximo de linhas por requisição no Supabase

/**
 * Busca TODOS os itens da organização, pedindo de 1000 em 1000 até acabar.
 * Ordena por id durante a busca (ordem estável para paginar) e por nome no final.
 */
async function buscarTodos(codigoOrganizacao) {
  const todos = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const { data, error } = await supabase
      .from(TABELA)
      .select(COLUNAS)
      .eq("codigo_organizacao", codigoOrganizacao)
      .order("id", { ascending: true })
      .range(inicio, inicio + TAMANHO_PAGINA - 1);

    if (error) throw error;
    todos.push(...data);
    if (data.length < TAMANHO_PAGINA) break;
  }

  return todos.sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Busca os itens da organização carregada no slice de organização.
 * Não recebe argumentos: o código é lido do estado global pelo selector.
 */
export const fetchItens = createAsyncThunk(
  "itens/fetchItens",
  async (_, { getState, rejectWithValue }) => {
    const codigoOrganizacao = selectOrganizacaoCodigo(getState());
    if (!codigoOrganizacao) return rejectWithValue("Organização não carregada");

    try {
      return await buscarTodos(codigoOrganizacao);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Cadastra um item. id e created_at são gerados pelo banco.
 * A quantidade sempre começa em 0 (a entrada no estoque vem depois).
 * Recebe: { nome, unidade, estoque_minimo, unidade_de_medida, codigo?, categoria? }
 * - unidade: id da unidade (do slice de unidades)
 * - codigo_organizacao vem do estado global.
 */
export const criarItem = createAsyncThunk(
  "itens/criarItem",
  async (
    { nome, unidade, estoque_minimo, unidade_de_medida, codigo, categoria },
    { getState, rejectWithValue }
  ) => {
    const codigo_organizacao = selectOrganizacaoCodigo(getState());
    if (!codigo_organizacao) return rejectWithValue("Organização não carregada");

    const { data, error } = await supabase
      .from(TABELA)
      .insert({
        nome,
        unidade: Number(unidade), // o select/input devolve string
        quantidade: 0,
        estoque_minimo: Number(estoque_minimo) || 0,
        unidade_de_medida,
        codigo: codigo || null, // opcional
        categoria: categoria || null, // opcional
        codigo_organizacao,
      })
      .select(COLUNAS)
      .single();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const initialState = {
  lista: [],
  status: "idle", // idle | loading | succeeded | failed  (busca)
  statusCriacao: "idle", // idle | loading | succeeded | failed  (cadastro)
  erro: null,
};

const itensSlice = createSlice({
  name: "itens",
  initialState,
  reducers: {
    limparErro(state) {
      state.erro = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ----- buscar -----
      .addCase(fetchItens.pending, (state) => {
        state.status = "loading";
        state.erro = null;
      })
      .addCase(fetchItens.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lista = action.payload;
      })
      .addCase(fetchItens.rejected, (state, action) => {
        state.status = "failed";
        state.erro = action.payload ?? action.error.message;
      })

      // ----- cadastrar -----
      .addCase(criarItem.pending, (state) => {
        state.statusCriacao = "loading";
        state.erro = null;
      })
      .addCase(criarItem.fulfilled, (state, action) => {
        state.statusCriacao = "succeeded";
        state.lista.push(action.payload);
      })
      .addCase(criarItem.rejected, (state, action) => {
        state.statusCriacao = "failed";
        state.erro = action.payload ?? action.error.message;
      });
  },
});

export const { limparErro } = itensSlice.actions;
export default itensSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

const emAndamento = (status) => status === "idle" || status === "loading";

/** true enquanto os itens ainda não foram carregados (idle ou loading). */
export const selectItensCarregando = (state) =>
  emAndamento(state.itens.status);

/**
 * Itens com o nome da unidade, resolvido pelo id no slice de unidades.
 * Cada item ganha o campo `unidade_nome`.
 * Só recalcula quando a lista de itens ou de unidades muda.
 */
export const selectItensComUnidade = createSelector(
  [(state) => state.itens.lista, (state) => state.unidades.lista],
  (itens, unidades) => {
    const nomePorId = new Map(unidades.map((u) => [u.id, u.nome]));
    return itens.map((item) => ({
      ...item,
      unidade_nome: nomePorId.get(item.unidade) ?? "—",
    }));
  }
);

/**
 * Itens da unidade informada (id). Os itens no slice já são só da organização
 * atual, porque o fetchItens filtra por codigo_organizacao.
 * Uso: useSelector((state) => selectItensDaUnidade(state, unidadeId))
 */
export const selectItensDaUnidade = createSelector(
  [selectItensComUnidade, (_state, unidadeId) => Number(unidadeId)],
  (itens, unidadeId) => itens.filter((item) => item.unidade === unidadeId)
);