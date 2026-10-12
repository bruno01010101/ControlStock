import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";
import { selectOrganizacaoCodigo } from "./organizacaoSlice"; // ajuste o caminho

/**
 * Busca as unidades da organização que já está carregada no slice de organização.
 * Não recebe argumentos: o código é lido do estado global pelo selector.
 */
export const fetchUnidades = createAsyncThunk(
  "unidades/fetchUnidades",
  async (_, { getState, rejectWithValue }) => {
    const codigoOrganizacao = selectOrganizacaoCodigo(getState());
    if (!codigoOrganizacao) return rejectWithValue("Organização não carregada");

    const { data, error } = await supabase
      .from("unidades")
      .select("id, nome, codigo_organizacao")
      .eq("codigo_organizacao", codigoOrganizacao)
      .order("nome", { ascending: true });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

/**
 * Cadastra uma unidade. O id (int8) e o created_at são gerados pelo banco.
 * Recebe: { nome }. O codigo_organizacao vem do estado global.
 */
export const criarUnidade = createAsyncThunk(
  "unidades/criarUnidade",
  async ({ nome }, { getState, rejectWithValue }) => {
    const codigo_organizacao = selectOrganizacaoCodigo(getState());
    if (!codigo_organizacao) return rejectWithValue("Organização não carregada");

    const { data, error } = await supabase
      .from("unidades")
      .insert({ nome, codigo_organizacao })
      .select("id, nome, codigo_organizacao")
      .single();

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const initialState = {
  lista: [],
  status: "idle", // idle | loading | succeeded | failed  (busca)
  statusCriacao: "idle", // idle | loading | succeeded | failed  (cadastro)
  unidadeSelecionadaId: null, // id da unidade vigente (padrão: a primeira da lista)
  erro: null,
};

const unidadesSlice = createSlice({
  name: "unidades",
  initialState,
  reducers: {
    limparErro(state) {
      state.erro = null;
    },
    // recebe o id da unidade (aceita string, pois selects devolvem texto)
    selecionarUnidade(state, action) {
      if (action.payload === "" || action.payload == null) return;

      const id = Number(action.payload);

      if (
        Number.isFinite(id) &&
        state.lista.some((u) => u.id === id)
      ) {
        state.unidadeSelecionadaId = id;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ----- buscar -----
      .addCase(fetchUnidades.pending, (state) => {
        state.status = "loading";
        state.erro = null;
      })
      .addCase(fetchUnidades.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lista = action.payload;

        // mantém a selecionada se ela ainda existe; senão, usa a primeira
        const aindaExiste = state.lista.some(
          (u) => u.id === state.unidadeSelecionadaId
        );
        if (!aindaExiste) {
          state.unidadeSelecionadaId = state.lista[0]?.id ?? null;
        }
      })
      .addCase(fetchUnidades.rejected, (state, action) => {
        state.status = "failed";
        state.erro = action.payload ?? action.error.message;
      })

      // ----- cadastrar -----
      .addCase(criarUnidade.pending, (state) => {
        state.statusCriacao = "loading";
        state.erro = null;
      })
      .addCase(criarUnidade.fulfilled, (state, action) => {
        state.statusCriacao = "succeeded";
        state.lista.push(action.payload);

        // primeira unidade criada vira a selecionada
        if (state.unidadeSelecionadaId === null) {
          state.unidadeSelecionadaId = action.payload.id;
        }
      })
      .addCase(criarUnidade.rejected, (state, action) => {
        state.statusCriacao = "failed";
        state.erro = action.payload ?? action.error.message;
      });
  },
});

export const { limparErro, selecionarUnidade } = unidadesSlice.actions;
export default unidadesSlice.reducer;

/* ------------------------------ Selectors ------------------------------ */

/** id da unidade vigente (ou null se não houver unidades). */
export const selectUnidadeSelecionadaId = (state) =>
  state.unidades.unidadeSelecionadaId;

/** objeto completo da unidade vigente ({ id, nome, ... }) ou null. */
export const selectUnidadeSelecionada = (state) =>
  state.unidades.lista.find(
    (u) => u.id === state.unidades.unidadeSelecionadaId
  ) ?? null;

  export const selectListaUnidades = (state) =>
  state.unidades.lista;