import styles from './itens.module.css';
import Button from '@mui/material/Button';
import { IoMdAdd } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import SearchInput from '../../components/searchInput';
import Selecao from '../../components/selecao';
import ItensBaixoEstoque from '../../components/ItensBaixoEstoque';
import { FaUpRightFromSquare } from "react-icons/fa6";
import MoreButton from '../../components/moreButton';
import TextoSitaucao from '../../components/textoSituacao';
import Pagination from '../../components/Paginacao';
import { LuClockArrowDown } from "react-icons/lu";
import { PiArrowSquareUpRightFill } from "react-icons/pi";
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/header';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { selectItensDaUnidade } from '../../store/slices/itensSlice';
import ItemCard from '../../components/itemCard';

function situacaoDoItem({ quantidade, estoque_minimo }) {
  if (quantidade <= estoque_minimo)
    return { text: "Estoque baixo", situacao: "ruim" };
  if (quantidade <= (estoque_minimo * 0.2) + estoque_minimo) {
    return { text: "Estoque medio", situacao: "mid" }
  }
  return { text: "Em estoque", situacao: "bom" };
}

export default function Itens() {
  //const { lista } = useSelector((state) => state.itens);
  const unidadeSel = useSelector((state) => state.unidades.unidadeSelecionadaId);
  const [situacao, setSituacao] = useState("");
  const itens = useSelector((state) => selectItensDaUnidade(state, unidadeSel));

  const ITENS_POR_PAGINA = 10;
  const unidades = useSelector((state) => state.unidades.lista)
  const navigate = useNavigate()

  const [busca, setBusca] = useState("");
  const [paginaState, setPaginaState] = useState({ unidade: unidadeSel, page: 1 });

  // normaliza para ignorar maiúsculas e acentos ("açúcar" encontra "acucar")
  const normalizar = (texto) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  // 1) filtra pelo nome
  const itensFiltrados = useMemo(() => {
    const termo = normalizar(busca);

    return itens.filter((item) => {
      if (termo && !normalizar(item.nome).includes(termo)) return false;
      if (situacao && situacaoDoItem(item).situacao !== situacao) return false;
      return true;
    });
  }, [itens, busca, situacao]);


  // 2) pagina em cima da lista filtrada
  const paginaSolicitada = paginaState.unidade === unidadeSel ? paginaState.page : 1;
  const totalPages = Math.max(1, Math.ceil(itensFiltrados.length / ITENS_POR_PAGINA));
  const page = Math.min(paginaSolicitada, totalPages);

  const itensDaPagina = useMemo(() => {
    const inicio = (page - 1) * ITENS_POR_PAGINA;
    return itensFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [itensFiltrados, page]);

  const handlePageChange = (novaPagina) => {
    const p = Number(novaPagina);
    if (Number.isNaN(p) || p < 1 || p > totalPages) return;
    setPaginaState({ unidade: unidadeSel, page: p });
  };

  // ao digitar, atualiza a busca e volta para a página 1 (no handler, sem useEffect)
  const handleBusca = (e) => {
    setBusca(e);
    setPaginaState({ unidade: unidadeSel, page: 1 });
  };

  const handleSituacao = (valor) => {
    setSituacao(valor);
    setPaginaState({ unidade: unidadeSel, page: 1 }); // volta para a página 1
  }

  return (
    <>
      <PageHeader
        title="Itens"
        subtitle="Gerencie produtos, quantidades e movimentações do estoque">

        <Button variant="outlined" color="primary" size="small" startIcon={<CiExport />} sx={{ textTransform: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderColor: 'var(--secondary-text-color)', color: 'var(--primary-text-color)' }}>
          Exportar itens
        </Button>
        <Button variant="contained" color="primary" size="small" startIcon={<IoMdAdd />} sx={{ textTransform: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: 'var(--azul)', marginLeft: '1rem' }} onClick={() => navigate('/form/adicionarItem')}>
          Adicionar Item
        </Button>
      </PageHeader>
      {unidades.length === 0 ? (
        <EstadoVazio
          titulo="Você ainda não criou nenhuma unidade"
          textoBotao="Criar unidade"
        />
      ) : (
        <section className={styles.content}>
          <section className={styles.itens}>
            <div className={styles.filtrosContainer}>
              <div>
                <h2 className={styles.h2}>Todos os itens</h2>
                <p className="menuTitle">x itens cadastrados</p>
              </div>
              <div className={styles.filtros}>
                <SearchInput
                  placeholder="Buscar itens..."
                  text={busca}
                  onChange={handleBusca}
                />
                <Selecao value={situacao} onChange={handleSituacao} />
              </div>
            </div>
            <div className={styles.itensContainer}>
              <div className={styles.data}>
                <p className={styles.greed} >Produtos</p>
                <p>Código</p>
                <p>Categoria</p>
                <p>Quantidade</p>
                <p>Situação</p>
              </div>
              {itensDaPagina.length === 0 ? (
                <p>Nenhum item encontrado</p>
              ) : (itensDaPagina.map((item) => {
                const { text, situacao } = situacaoDoItem(item);
                return (
                  <div key={item.id} className={styles.produto}>
                    <div className={styles.greed}>

                        <ItemCard key={item.id} item={item} />

                    </div>
                    <p>{item.codigo ?? "—"}</p>
                    <p>{item.categoria ?? "—"}</p>
                    <p><strong>{item.quantidade}</strong> {item.unidade_de_medida}</p>
                    <TextoSitaucao text={text} situacao={situacao} />
                    <MoreButton options={["Entrada", "Saída"]} click={[() => { navigate(`/form/entrada/${item.id}`) }, () => { navigate(`/form/saida/${item.id}`) }]} />
                  </div>
                );
              }))}
            </div>
            <div className={styles.paginacao}>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </section>

          <section className={styles.lateral}>
            <div style={{ height: "150px" }}>
              <ItensBaixoEstoque quantidade={6} />
            </div>
            <div className={styles.movimentacoes}>
              <div className={styles.flex}>
                <div style={{ paddingBottom: "1rem" }}>
                  <h2 className={styles.h2}>Últimas movimentações</h2>
                  <p className={styles.subtitle}>Atualizado Agora</p>
                </div>
                <LuClockArrowDown />
              </div>
              <div className={styles.movimentation}>
                <div className={styles.flex}>
                  <div className={styles.flex} style={{ gap: "5px" }}>
                    <PiArrowSquareUpRightFill color='green' />
                    <p>Café Especial 500g</p>
                  </div>
                  <p className={styles.entry}>+24</p>
                </div>
                <div className={styles.flex}>
                  <p className='menuTitle'>Entrada . Pedido#284</p>
                  <p className='menuTitle'>Hoje, 9:18</p>
                </div>
              </div>

            </div>
          </section>
        </section>
      )}

    </>
  );
}