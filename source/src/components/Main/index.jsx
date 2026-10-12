import Aside from '../Aside';
import styles from './main.module.css';
import { Outlet } from 'react-router';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectOrganizacaoCodigo } from '../../store/slices/organizacaoSlice';
import { fetchUnidades } from '../../store/slices/unidadesSlice';
import { fetchOrganizacaoPadrao } from '../../store/slices/organizacaoSlice';
import { selectCarregandoInicial } from '../../store/slices/organizacaoSlice';
import { fetchItens } from '../../store/slices/itensSlice';
import Loading from '../Loading/Loading';

export default function Main() {
  const dispatch = useDispatch();
  const codigoOrganizacao = useSelector(selectOrganizacaoCodigo);
  const carregando = useSelector(selectCarregandoInicial);

  useEffect(() => {
    dispatch(fetchOrganizacaoPadrao());
  }, [dispatch]);

  useEffect(() => {
    if (codigoOrganizacao) {
      dispatch(fetchUnidades());
      dispatch(fetchItens());
    }
  }, [dispatch, codigoOrganizacao]);

  if (carregando) {
    return (
      <main className={styles.carregando}>
        <Loading size='large' />
      </main>
    )
  } else {
    return (
      <main className={styles.main}>
        <Aside />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    )
  }
}
