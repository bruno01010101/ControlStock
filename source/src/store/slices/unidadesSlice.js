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
  erro: null,
};

const unidadesSlice = createSlice({
  name: "unidades",
  initialState,
  reducers: {
    limparErro(state) {
      state.erro = null;
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
      })
      .addCase(criarUnidade.rejected, (state, action) => {
        state.statusCriacao = "failed";
        state.erro = action.payload ?? action.error.message;
      });
  },
});

export const { limparErro } = unidadesSlice.actions;
export default unidadesSlice.reducer;
