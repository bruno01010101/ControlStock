import {configureStore} from '@reduxjs/toolkit';
import organizacaoReducer from './slices/organizacaoSlice';

export const store = configureStore({
  reducer: {
    organizacao: organizacaoReducer
  },
});