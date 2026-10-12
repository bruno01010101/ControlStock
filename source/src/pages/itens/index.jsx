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
import { useState } from 'react';
import { PageHeader } from '../../components/header';
import EstadoVazio from '../../components/EstadoVazio/EstadoVazio';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { selectItensDaUnidade } from '../../store/slices/itensSlice';
export default function Itens() {
  //const { lista } = useSelector((state) => state.itens);
  const unidadeSel = useSelector((state) => state.unidades.unidadeSelecionadaId);

  const itens = useSelector((state) => selectItensDaUnidade(state, unidadeSel));
  function situacaoDoItem({ quantidade, estoque_minimo }) {
    if (quantidade <= 0) return { text: "Sem estoque", situacao: "ruim" };
    if (quantidade <= estoque_minimo)
      return { text: "Estoque baixo", situacao: "medio" };
    return { text: "Em estoque", situacao: "bom" };
  }

  const [page, setPage] = useState(1);
  const unidades = useSelector((state) => state.unidades.lista)
  const navigate = useNavigate()
 
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
                <SearchInput placeholder="Buscar itens..." />
                <Selecao />
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
              {itens.map((item) => {
                const { text, situacao } = situacaoDoItem(item);
                return (
                  <div key={item.id} className={styles.produto}>
                    <div className={styles.greed}>
                      <div className={styles.productName}>
                        <FaUpRightFromSquare />
                        <p>{item.nome}</p>
                      </div>
                    </div>
                    <p>{item.codigo ?? "—"}</p>
                    <p>{item.categoria ?? "—"}</p>
                    <p>{item.quantidade}</p>
                    <TextoSitaucao text={text} situacao={situacao} />
                    <MoreButton options={["Entrada", "Saída"]} />
                  </div>
                );
              })}
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