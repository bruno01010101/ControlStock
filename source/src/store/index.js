import {configureStore} from '@reduxjs/toolkit';
import organizacaoReducer from './slices/organizacaoSlice';
import unidadeReducer from './slices/unidadesSlice';
import itensReducer from './slices/itensSlice'
import pedidosReducer from './slices/pedidosSlice'

export const store = configureStore({
  reducer: {
    organizacao: organizacaoReducer,
    unidades: unidadeReducer,
    itens: itensReducer,
    pedidos:  pedidosReducer
  },
});