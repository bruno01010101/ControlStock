import PageHeader from '../../components/header';
import styles from './dashboard.module.css';
import Button from '@mui/material/Button';
import { CiExport } from "react-icons/ci";
import { useState } from 'react';
import DashboardFiltros from '../../components/dashboardFiltros/DashboardFiltros';
import { useDispatch, useSelector } from "react-redux";
import { selectOrganizacao, setOrganizacao } from '../../store/slices/organizacaoSlice';
import { useNavigate } from 'react-router';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';
import { PiNotebook } from "react-icons/pi";
import ItensBaixoEstoque from '../../components/ItensBaixoEstoque';
import { selecionarUnidade, fetchUnidades, selectListaUnidades, selectUnidadeSelecionadaId } from '../../store/slices/unidadesSlice';
import { selectOrganizacaoCodigo } from "../../store/slices/organizacaoSlice";

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const codigoOrganizacao = useSelector(selectOrganizacaoCodigo);
  const unidades = useSelector(selectListaUnidades);
  const unidadeSelecionadaId = useSelector(selectUnidadeSelecionadaId);

  const { codigo, nome } = useSelector(selectOrganizacao);

  const [periodo, setPeriodo] = useState("30d");
  const organizacoes = codigo ? [{ value: codigo, label: nome }] : [];

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

            if (org) {
              dispatch(setOrganizacao({
                codigo: org.value,
                nome: org.label,
              }));
            }
          }}
          unidades={unidades.map((u) => ({
            value: String(u.id),
            label: u.nome,
          }))}
          unidade={
            unidadeSelecionadaId == null
              ? ""
              : String(unidadeSelecionadaId)
          }
          onUnidadeChange={(value) => {
            dispatch(selecionarUnidade(value));
          }}
          periodo={periodo}
          onPeriodoChange={setPeriodo}
        />

        {unidades.length === 0 ? (
          <EstadoVazio
            titulo="Você ainda não criou nenhuma unidade"
            textoBotao="Criar unidade"
          />
        ) : (
          <section className={styles.section}>
            <div className={styles.item} style={{ width: '50%' }}>
              <div className={styles.figure}>
                <p className={styles.p}>Total gasto no período</p>
                <PiNotebook color='blue' />
              </div>
              <p className={styles.emphasis}>R$ 48.240,00</p>
              <p className={styles.p}>compras recebidas janeiro a julho de 2026</p>
            </div>
            <div className={styles.item} style={{ width: '25%' }}>
              <div className={styles.figure}>
                <p className={styles.p}>Itens cadastrados</p>
                <PiNotebook color='blue' />
              </div>
              <p className={styles.emphasis}>128</p>
              <p className={styles.p}>Em todas as unidades</p>
            </div>
            <div style={{ width: '25%' }}>
              <ItensBaixoEstoque quantidade={6} />
            </div>
          </section>
        )}
      </div>
    </>
  );
}