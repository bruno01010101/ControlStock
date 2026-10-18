import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import { selectOrganizacaoCodigo } from "./organizacaoSlice";
import { selectUnidadeSelecionadaId } from "./unidadesSlice"; 

// Pedido + itens do pedido + nome de cada item, em uma consulta só
// (o Supabase faz o join pelas FKs id_pedido e id_item)
const SELECT_PEDIDO = `
  id,
  created_at,
  codigo,
  status,
  user,
  data_solicitacao,
  preco_total,
  itens_pedido (
    id,
    quantidade,
    id_item,
    item:id_item ( id, nome )
  )
`;

// Converte a linha do banco para o formato que a tela usa
const normalizarPedido = (p) => ({
  id: p.id,
  codigo: p.codigo ?? "",
  status: p.status ?? "pendente",
  solicitante: p.user ?? "",
  dataSolicitacao: p.data_solicitacao, // "2026-06-30" ou null
  total: p.preco_total ?? 0,
  itens: (p.itens_pedido ?? []).map((i) => ({
    itemId: i.id_item,
    nome: i.item?.nome ?? "—",
    quantidade: i.quantidade,
  })),
});

const montarItens = (itens) =>
  itens.map((i) => ({ id_item: i.itemId, quantidade: Number(i.quantidade) }));

/* --------------------- filtro e ordenação na query -------------------- */

// Valores do filtro (o mesmo valor que o <Selecao> da tela usa):
//   ""                                 -> todos, do mais novo para o mais antigo
//   "pendente" | "recebido" | "cancelado" -> só esse status
//   "maior" | "menor"                  -> todos, ordenados por preço total
const STATUS_FILTRAVEIS = ["pendente", "recebido", "cancelado"];

export const aplicarFiltro = (query, filtro) => {
  if (filtro === "maior" || filtro === "menor") {
    return query
      .order("preco_total", { ascending: filtro === "menor" })
      .order("created_at", { ascending: false }); // desempate
  }

  if (filtro === "pendente") {
    // pedidos antigos sem status contam como pendentes (é assim que aparecem na tela)
    query = query.or("status.eq.pendente,status.is.null");
  } else if (STATUS_FILTRAVEIS.includes(filtro)) {
    query = query.eq("status", filtro);
  }

  return query.order("created_at", { ascending: false });
};

/* ------------------------------ thunks ------------------------------ */

// Lista os pedidos da unidade selecionada.
//   buscarPedidos()                       -> usa o filtro que já está guardado
//   buscarPedidos({ filtro: "recebido" }) -> troca o filtro e busca de novo
//   { silencioso: true }                  -> recarrega sem trocar a tela por "carregando"
export const buscarPedidos = createAsyncThunk(
  "pedidos/buscar",
  async (opcoes, { getState, rejectWithValue }) => {
    const state = getState();
    const unidadeId = selectUnidadeSelecionadaId(state);
    if (!unidadeId) return rejectWithValue("Unidade não selecionada");

    const filtro = opcoes?.filtro ?? state.pedidos.filtro;

    const query = supabase
      .from("pedidos")
      .select(SELECT_PEDIDO)
      .eq("unidade", unidadeId);

    const { data, error } = await aplicarFiltro(query, filtro);

    if (error) return rejectWithValue(error.message);
    return data.map(normalizarPedido);
  }
);

export const criarPedido = createAsyncThunk(
  "pedidos/criar",
  async (
    { codigo, status, solicitante, dataSolicitacao, total, itens },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState();
    const codigo_organizacao = selectOrganizacaoCodigo(state);
    const unidadeId = selectUnidadeSelecionadaId(state);
    if (!codigo_organizacao) return rejectWithValue("Organização não carregada");
    if (!unidadeId) return rejectWithValue("Unidade não selecionada");

    const { data, error } = await supabase.rpc("criar_pedido", {
      p_codigo: codigo || null, // opcional
      p_status: status,
      p_solicitante: solicitante,
      p_data_solicitacao: dataSolicitacao || null, // opcional
      p_preco_total: Number(total),
      p_unidade: Number(unidadeId),
      p_codigo_organizacao: codigo_organizacao,
      p_itens: montarItens(itens),
    });

    if (error) return rejectWithValue(error.message);

    await dispatch(buscarPedidos({ silencioso: true }));
    return data; // id do pedido criado
  }
);

export const atualizarPedido = createAsyncThunk(
  "pedidos/atualizar",
  async (
    { id, codigo, status, solicitante, dataSolicitacao, total, itens },
    { dispatch, rejectWithValue }
  ) => {
    const { data, error } = await supabase.rpc("atualizar_pedido", {
      p_id: id,
      p_codigo: codigo || null,
      p_status: status,
      p_solicitante: solicitante,
      p_data_solicitacao: dataSolicitacao || null,
      p_preco_total: Number(total),
      p_itens: montarItens(itens),
    });

    if (error) return rejectWithValue(error.message);

    await dispatch(buscarPedidos({ silencioso: true }));
    return data; // id do pedido atualizado
  }
);

/* ------------------------------ slice ------------------------------- */

const pedidosSlice = createSlice({
  name: "pedidos",
  initialState: {
    lista: [],
    filtro: "", // ver aplicarFiltro
    status: "idle", // idle | loading | succeeded | failed (carga da lista)
    error: null,
    salvando: false, // criando ou atualizando um pedido
    requisicaoAtual: null, // para ignorar respostas antigas
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(buscarPedidos.pending, (state, action) => {
        if (!action.meta.arg?.silencioso) state.status = "loading";
        if (action.meta.arg?.filtro !== undefined) {
          state.filtro = action.meta.arg.filtro;
        }
        state.requisicaoAtual = action.meta.requestId;
        state.error = null;
      })
      .addCase(buscarPedidos.fulfilled, (state, action) => {
        // se o usuário mudou o filtro de novo, esta resposta já é antiga
        if (action.meta.requestId !== state.requisicaoAtual) return;
        state.status = "succeeded";
        state.lista = action.payload;
      })
      .addCase(buscarPedidos.rejected, (state, action) => {
        if (action.meta.requestId !== state.requisicaoAtual) return;
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })
      .addMatcher(
        isAnyOf(criarPedido.pending, atualizarPedido.pending),
        (state) => {
          state.salvando = true;
        }
      )
      .addMatcher(
        isAnyOf(
          criarPedido.fulfilled,
          criarPedido.rejected,
          atualizarPedido.fulfilled,
          atualizarPedido.rejected
        ),
        (state) => {
          state.salvando = false;
        }
      );
  },
});

export default pedidosSlice.reducer;

/* ----------------------------- selectors ---------------------------- */

export const selectPedidos = (state) => state.pedidos.lista;
export const selectPedidosFiltro = (state) => state.pedidos.filtro;
export const selectPedidosStatus = (state) => state.pedidos.status;
export const selectPedidosErro = (state) => state.pedidos.error;
export const selectPedidosSalvando = (state) => state.pedidos.salvando;

/* ---------------------------------------------------------------------
   DASHBOARD (a fazer)

   Os totais (gasto por unidade, por organização e por categoria) devem vir
   de uma view ou função SQL no Supabase, e não de joins no front: o banco
   soma tudo de uma vez e o navegador recebe só o resultado.

   Quando criar, siga este modelo (e adicione `dashboard` ao initialState):

   export const buscarGastosDashboard = createAsyncThunk(
     "pedidos/buscarGastosDashboard",
     async (_arg, { getState, rejectWithValue }) => {
       const { data, error } = await supabase.rpc("gastos_dashboard", {
         p_unidade: Number(selectUnidadeSelecionadaId(getState())),
         p_codigo_organizacao: selectOrganizacaoCodigo(getState()),
       });
       if (error) return rejectWithValue(error.message);
       return data;
     }
   );
--------------------------------------------------------------------- */