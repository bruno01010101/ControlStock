import styles from './itens.module.css';
import Button from '@mui/material/Button';
import { IoMdAdd } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import SearchInput from '../../components/searchInput';
import Selecao from '../../components/selecao';
import ItensBaixoEstoque from '../../components/ItensBaixoEstoque';
import MoreButton from '../../components/moreButton';
import TextoSitaucao from '../../components/textoSituacao';
import Pagination from '../../components/Paginacao';
import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/header';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { selectItensDaUnidade, excluirItem } from '../../store/slices/itensSlice';
import ItemCard from '../../components/itemCard';
import { useDispatch } from 'react-redux';
import UltimasMovimentacoes from '../../components/movimentacoes';
import Tabela from '../../components/card';

function situacaoDoItem({ quantidade, estoque_minimo }) {
  if (quantidade <= estoque_minimo)
    return { text: "Estoque baixo", situacao: "ruim" };
  if (quantidade <= (estoque_minimo * 0.2) + estoque_minimo) {
    return { text: "Estoque medio", situacao: "mid" }
  }
  return { text: "Em estoque", situacao: "bom" };
}

const OPCOES_ESTOQUE = [
  { value: "ruim", label: "Estoque baixo" },
  { value: "mid", label: "Estoque médio" },
  { value: "bom", label: "Estoque alto" },
];

export default function Itens() {
  //const { lista } = useSelector((state) => state.itens);
  const unidadeSel = useSelector((state) => state.unidades.unidadeSelecionadaId);
  const [situacao, setSituacao] = useState("");
  const itens = useSelector((state) => selectItensDaUnidade(state, unidadeSel));
  const dispatch = useDispatch()

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

  const handleExcluir = async (item) => {
    if (!window.confirm(`Excluir "${item.nome}" e todo o histórico dele?`)) return;
    await dispatch(excluirItem(item.id)).unwrap();
  };

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
          <Tabela>
            <Tabela.Cabecalho titulo="Todos os itens" subtitulo={`x itens cadastrados`}>
              <SearchInput placeholder="Buscar itens..." text={busca} onChange={handleBusca} />
              <Selecao value={situacao} onChange={handleSituacao} opcoes={OPCOES_ESTOQUE} />
            </Tabela.Cabecalho>

            <Tabela.Colunas nomes={["Produtos", "Código", "Categoria", "Quantidade", "Situação"]} />

            <Tabela.Corpo vazio="Nenhum item encontrado">
              {itensDaPagina.map((item) => {
                const { text, situacao } = situacaoDoItem(item);
                return (
                  <Tabela.Linha
                    key={item.id}
                    acao={
                      <MoreButton
                        options={["Entrada", "Saída", "Excluir item"]}
                        click={[
                          () => navigate(`/form/entrada/${item.id}`),
                          () => navigate(`/form/saida/${item.id}`),
                          () => handleExcluir(item),
                        ]}
                      />
                    }
                  >
                    <ItemCard item={item} />
                    <p>{item.codigo ?? "—"}</p>
                    <p>{item.categoria ?? "—"}</p>
                    <p><strong>{item.quantidade}</strong> {item.unidade_de_medida}</p>
                    <TextoSitaucao text={text} situacao={situacao} />
                  </Tabela.Linha>
                );
              })}
            </Tabela.Corpo>

            <Tabela.Paginacao>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </Tabela.Paginacao>
          </Tabela>

          <section className={styles.lateral}>
            <div style={{ height: "150px" }}>
              <ItensBaixoEstoque quantidade={6} />
            </div>
            <UltimasMovimentacoes direction='column' />
          </section>
        </section>
      )}

    </>
  );
}