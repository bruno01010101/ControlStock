import PageHeader from '../../components/header';
import styles from './dashboard.module.css';
import Button from '@mui/material/Button';
import { CiExport } from "react-icons/ci";
import { PiNotebook } from "react-icons/pi";
import { useEffect, useMemo, useState } from 'react';
import DashboardFiltros from '../../components/dashboardFiltros/DashboardFiltros';
import { useDispatch, useSelector } from "react-redux";
import { selectOrganizacao, selectOrganizacaoCodigo, setOrganizacao } from '../../store/slices/organizacaoSlice';
import { useNavigate } from 'react-router';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';
import ItensBaixoEstoque from '../../components/ItensBaixoEstoque';
import UltimasMovimentacoes from "../../components/movimentacoes";
import GastosPorCategoria from './gastosCategoria';
import GraficoGastos from './GraficoGastos'; // ajuste o caminho
import Loading from '../../components/Loading/Loading'; // ajuste o caminho
import { selecionarUnidade, selectListaUnidades, selectUnidadeSelecionadaId } from '../../store/slices/unidadesSlice';
import {
  buscarGastosDashboard,
  selectDashboard,
  selectDashboardErro,
  selectDashboardStatus,
} from '../../store/slices/pedidosSlice'; // ajuste o caminho
import { selectQuantidadeBaixoEstoque } from '../../store/slices/itensSlice';

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, signDisplay: "exceptZero" });

const iso = (data) => data.toLocaleDateString("sv-SE"); // "2026-06-30"

/**
 * Converte a opção do filtro de período em datas para a função do banco.
 * O gasto é calculado por mês fechado: "30d" vira o mês atual, "90d" os últimos 3 meses,
 * "6m" os últimos 6, "12m" (ou "1a") os últimos 12. Valor desconhecido: 6 meses.
 * Ajuste aqui se as opções do seu DashboardFiltros forem outras.
 */
const periodoParaDatas = (periodo) => {
  const [, numero, unidade] = /^(\d+)([dma])$/.exec(periodo ?? "") ?? [];
  let meses = 6;
  if (numero) {
    const n = Number(numero);
    meses = unidade === "d" ? Math.max(1, Math.round(n / 30)) : unidade === "a" ? n * 12 : n;
  }

  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - (meses - 1), 1);
  return { inicio: iso(inicio), fim: iso(hoje) };
};

// "2026-06-01" -> "junho" (ou "junho de 2026")
const nomeMes = (data, comAno = false) =>
  new Date(`${data}T00:00:00`).toLocaleDateString(
    "pt-BR",
    comAno ? { month: "long", year: "numeric" } : { month: "long" }
  );

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "janeiro a junho de 2026"
const rotuloPeriodo = ({ inicio, fim }) => {
  if (inicio.slice(0, 7) === fim.slice(0, 7)) return nomeMes(inicio, true);
  const mesmoAno = inicio.slice(0, 4) === fim.slice(0, 4);
  return `${nomeMes(inicio, !mesmoAno)} a ${nomeMes(fim, true)}`;
};


export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const codigoOrganizacao = useSelector(selectOrganizacaoCodigo);
  const unidades = useSelector(selectListaUnidades);
  const unidadeSelecionadaId = useSelector(selectUnidadeSelecionadaId);
  const itensDaOrganizacao = useSelector((state) => state.itens.lista);

  const dados = useSelector(selectDashboard);
  const statusDashboard = useSelector(selectDashboardStatus);
  const erroDashboard = useSelector(selectDashboardErro);

  const { codigo, nome } = useSelector(selectOrganizacao);

  const [periodo, setPeriodo] = useState("30d");
  const organizacoes = codigo ? [{ value: codigo, label: nome }] : [];

  const temUnidades = unidades.length > 0;
  const todasAsUnidades = unidadeSelecionadaId == null || unidadeSelecionadaId === "";
  const { inicio, fim } = useMemo(() => periodoParaDatas(periodo), [periodo]);
  const itensBaixoEstoque = useSelector((state) =>
    selectQuantidadeBaixoEstoque(state, unidadeSelecionadaId)
  );

  // busca os totais e refaz a busca quando muda a organização, a unidade ou o período
  useEffect(() => {
    if (codigoOrganizacao && temUnidades) {
      dispatch(buscarGastosDashboard({ inicio, fim }));
    }
  }, [dispatch, codigoOrganizacao, temUnidades, unidadeSelecionadaId, inicio, fim]);

  const carregando =
    statusDashboard === "loading" ||
    (statusDashboard === "idle" && Boolean(codigoOrganizacao));

  // itens da unidade escolhida (ou de todas)
  const itensDaVisao = useMemo(
    () =>
      todasAsUnidades
        ? itensDaOrganizacao
        : itensDaOrganizacao.filter((item) => item.unidade === Number(unidadeSelecionadaId)),
    [itensDaOrganizacao, todasAsUnidades, unidadeSelecionadaId]
  );

  // gasto por unidade: barras proporcionais ao gasto de todas as unidades
  const porUnidade = dados?.por_unidade ?? [];
  const somaUnidades = porUnidade.reduce((soma, u) => soma + u.total, 0);
  const gastos = porUnidade.map((u) => ({
    nome: u.nome,
    valor: u.total,
    porcentagem: somaUnidades > 0 ? Math.round((u.total / somaUnidades) * 100) : 0,
  }));

  // gráfico e rodapé: último mês comparado ao mês anterior
  const porMes = dados?.por_mes ?? [];
  const ultimoMes = porMes[porMes.length - 1];
  const mesAnterior = porMes[porMes.length - 2];
  const variacao =
    mesAnterior && Number(mesAnterior.total) > 0
      ? ((ultimoMes.total - mesAnterior.total) / mesAnterior.total) * 100
      : null;
  const anos = [...new Set(porMes.map((m) => m.mes.slice(0, 4)))].join(" / ");

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

        {!temUnidades ? (
          <EstadoVazio
            titulo="Você ainda não criou nenhuma unidade"
            textoBotao="Criar unidade"
          />
        ) : carregando ? (
          <Loading />
        ) : statusDashboard === "failed" ? (
          <div className={styles.erro} role="alert">
            <p>Não foi possível carregar o dashboard: {erroDashboard}</p>
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
              onClick={() => dispatch(buscarGastosDashboard({ inicio, fim }))}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <section className={styles.section}>
              <div className={styles.item}>
                <div className={styles.figure}>
                  <p className={styles.p}>Total gasto no período</p>
                  <PiNotebook color='blue' />
                </div>
                <p className={styles.emphasis}>{moeda.format(dados?.gasto_total ?? 0)}</p>
                <p className={styles.p}>
                  Compras recebidas · {dados ? rotuloPeriodo(dados.periodo) : ""}
                </p>
              </div>

              <div className={`${styles.item} ${styles.item2}`}>
                <div className={styles.figure}>
                  <p className={styles.p}>Itens cadastrados</p>
                  <PiNotebook color='blue' />
                </div>
                <p className={styles.emphasis}>{itensDaVisao.length}</p>
                <p className={styles.p}>
                  {todasAsUnidades ? "Em todas as unidades" : "Na unidade selecionada"}
                </p>
              </div>

              <div className={styles.baixo}>
                <ItensBaixoEstoque quantidade={itensBaixoEstoque} />
              </div>
            </section>

            <div className={styles.analise}>
              <div className={styles.item}>
                <div className={styles.cabecalhoCard}>
                  <div>
                    <h2 className={styles.tituloCard}>Evolução dos gastos</h2>
                    <p className={styles.p}>Compras recebidas por mês · valores em R$</p>
                  </div>
                  <span className={styles.legenda}>{anos}</span>
                </div>

                <div className={styles.grafico}>
                  <GraficoGastos meses={porMes} />
                </div>

                {ultimoMes && (
                  <div className={styles.rodape}>
                    <span>
                      {capitalizar(nomeMes(ultimoMes.mes))}: {moeda.format(ultimoMes.total)}
                    </span>
                    {mesAnterior && (
                      <strong>
                        {variacao == null ? "—" : `${percentual.format(variacao)}%`} em relação a{" "}
                        {nomeMes(mesAnterior.mes)}
                      </strong>
                    )}
                  </div>
                )}
              </div>

              <GastosPorCategoria categorias={gastos} />
            </div>
          </>
        )}

        {temUnidades && <UltimasMovimentacoes direction="row" />}
      </div>
    </>
  );
}
