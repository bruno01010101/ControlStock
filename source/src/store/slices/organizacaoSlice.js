import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../supabase";

const initialState = {
  codigo: null,
  nome: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

/**
 * Busca a organização mais recente criada pelo usuário
 * (maior organizacao_id em organizacao_usuarios) e devolve { codigo, nome }.
 * Se o usuário ainda não tem organização, devolve null.
 *
 * O próprio thunk descobre o usuário logado, então não precisa de argumento.
 *
 * Uso: dispatch(fetchOrganizacaoPadrao())
 */
export const fetchOrganizacaoPadrao = createAsyncThunk(
  "organizacao/fetchPadrao",
  async (_, { rejectWithValue }) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return rejectWithValue(authError?.message ?? "Usuário não autenticado");
    }

    const { data, error } = await supabase
      .from("organizacao_usuarios")
      .select("codigo, organizacoes(nome)")
      .eq("usuario_id", authData.user.id)
      .order("organizacao_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return rejectWithValue(error.message);
    if (!data) return null;

    return { codigo: data.codigo, nome: data.organizacoes?.nome ?? null };
  }
);

const organizacaoSlice = createSlice({
  name: "organizacao",
  initialState,
  reducers: {
    // Para trocar de organização manualmente ou setar após criar uma nova
    // Uso: dispatch(setOrganizacao({ codigo: "abc123", nome: "Minha Org" }))
    setOrganizacao(state, action) {
      state.codigo = action.payload.codigo;
      state.nome = action.payload.nome;
      state.status = "succeeded";
      state.error = null;
    },
    // Útil no logout
    clearOrganizacao() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizacaoPadrao.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrganizacaoPadrao.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.codigo = action.payload.codigo;
          state.nome = action.payload.nome;
        }
      })
      .addCase(fetchOrganizacaoPadrao.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { setOrganizacao, clearOrganizacao } = organizacaoSlice.actions;

// Selectors
export const selectOrganizacao = (state) => state.organizacao;
export const selectOrganizacaoCodigo = (state) => state.organizacao.codigo;
export const selectOrganizacaoNome = (state) => state.organizacao.nome;
export const selectOrganizacaoStatus = (state) => state.organizacao.status;

export default organizacaoSlice.reducer;
