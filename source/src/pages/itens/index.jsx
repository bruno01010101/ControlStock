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
import Paginacao from '../../components/Paginacao';
import { LuClockArrowDown } from "react-icons/lu";
import { PiArrowSquareUpRightFill } from "react-icons/pi";

export default function Itens() {
  return (
    <>
      <header className={styles.header}>
        <div>
          <h1>Itens</h1>
          <p className={styles.subtitle}>Gerencie produtos, quantidades e movimentações do estoque</p>
        </div>
        <div className={styles.actions}>
          <Button variant="outlined" color="primary" size="small" startIcon={<CiExport />} sx={{ textTransform: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderColor: 'var(--secondary-text-color)', color: 'var(--primary-text-color)' }}>
            Exportar itens
          </Button>
          <Button variant="contained" color="primary" size="small" startIcon={<IoMdAdd />} sx={{ textTransform: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: 'var(--azul)', marginLeft: '1rem' }}>
            Adicionar Item
          </Button>
        </div>
      </header>

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
            <div className={styles.produto}>
              <div className={styles.greed}>
                <div className={styles.productName}>
                  <FaUpRightFromSquare />
                  <p>nome</p>
                </div>
              </div>
              <p>código</p>
              <p>Alimentos</p>
              <p>50</p>
              <TextoSitaucao text="Testando" situacao="bom" />
              <MoreButton options={["Entrada", "Saída"]} />
            </div>
            <div className={styles.produto}>
              <div className={styles.greed}>
                <div className={styles.productName}>
                  <FaUpRightFromSquare />
                  <p>nome</p>
                </div>
              </div>
              <p>código</p>
              <p>Alimentos</p>
              <p>50</p>
              <TextoSitaucao text="Testando" situacao="ruim" />
              <MoreButton options={["Entrada", "Saída"]} />
            </div>
            <Paginacao text="estamos na página 2-10" totalPáginas={10} />
          </div>
        
        </section>

        <section className={styles.lateral}>
          <div>
            <ItensBaixoEstoque quantidade={6} />
          </div>
          <div className={styles.movimentacoes}>
            <div className={styles.flex}>
              <div style={{paddingBottom: "1rem"}}>
                <h2 className={styles.h2}>Últimas movimentações</h2>
                <p className={styles.subtitle}>Atualizado Agora</p>
              </div>
              <LuClockArrowDown />
            </div>
            <div className={styles.movimentation}>
              <div className={styles.flex}>
                <div className={styles.flex} style={{gap: "5px"}}>
                  <PiArrowSquareUpRightFill color='green'/>
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
    </>
  );
}