import {configureStore} from '@reduxjs/toolkit';
import organizacaoReducer from './slices/organizacaoSlice';
import unidadeReducer from './slices/unidadesSlice';

export const store = configureStore({
  reducer: {
    organizacao: organizacaoReducer,
    unidades: unidadeReducer
  },
});