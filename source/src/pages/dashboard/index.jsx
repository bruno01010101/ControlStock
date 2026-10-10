import PageHeader from '../../components/header';
import styles from './dashboard.module.css';
import Button from '@mui/material/Button';
import { CiExport } from "react-icons/ci";
import { useState } from 'react';
import DashboardFiltros from '../../components/dashboardFiltros/DashboardFiltros';
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizacaoPadrao } from '../../store/slices/organizacaoSlice';
import { selectOrganizacao, setOrganizacao, selectOrganizacaoCodigo } from '../../store/slices/organizacaoSlice';
import { useNavigate } from 'react-router';
import { fetchUnidades } from '../../store/slices/unidadesSlice';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';

export default function Dashboard() {
  const { codigo, nome } = useSelector(selectOrganizacao);
  const codigoOrganizacao = useSelector(selectOrganizacaoCodigo);

  const unidades = useSelector((state) => state.unidades.lista);

  const [unidade, setUnidade] = useState("aaaaaaa");
  const [periodo, setPeriodo] = useState("30d");
  const organizacoes = codigo ? [{ value: codigo, label: nome }] : [];

  
  const navigate = useNavigate()

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchOrganizacaoPadrao());
  }, [dispatch]);

  useEffect(() => {
    if (codigoOrganizacao) dispatch(fetchUnidades());
  }, [dispatch, codigoOrganizacao]);

  return (
    <>
      <PageHeader title="DASHBOARD" subtitle="Acompanhe os gastos e tenha seu estoque sob controle.">
        <Button variant="outlined" color="primary" size="small" startIcon={<CiExport />} sx={{ textTransform: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderColor: 'var(--secondary-text-color)', color: 'var(--primary-text-color)' }} onClick={() => navigate('/form/unidade')}>
          Criar unidade
        </Button>
      </PageHeader>

      <div className={styles.main}>
        <DashboardFiltros
          organizacoes={organizacoes}
          organizacao={codigo ?? ""}
          onOrganizacaoChange={(value) => {
            const org = organizacoes.find((o) => o.value === value);
            if (org) dispatch(setOrganizacao({ codigo: org.value, nome: org.label }));
          }}
          unidades={unidades.map((u) => ({ value: u.id, label: u.nome }))}
          unidade={unidade}
          onUnidadeChange={setUnidade}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
        />

        {unidades.length === 0 ? (
          <EstadoVazio
            titulo="Você ainda não criou nenhuma unidade"
            textoBotao="Criar unidade"
          />
        ) : (
          <p>oi</p>
        )}
      </div>
    </>
  );
}