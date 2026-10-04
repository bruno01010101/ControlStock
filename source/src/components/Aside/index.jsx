import styles from './aside.module.css';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';
import { RiDashboardFill } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { BsBoxArrowDown,BsBoxArrowInUp  } from "react-icons/bs";
import { TiClipboard } from "react-icons/ti";
import Avatar from '@mui/material/Avatar';
import MoreButton from '../moreButton';
import { CiCircleQuestion } from "react-icons/ci";

export default function Aside() {
  return (
    <aside className={styles.aside}>
      <section className={styles.menu}>
        <div className={styles.menuHeader}>
          <img src="/favicon.svg" alt="ControlStock Logo" className={styles.logo} />
          <div className>
            <h2>
              Control Stock
            </h2>
            <Typography variant="subtitle1" component="p" color="textSecondary" className={styles.oi}>
              Gestão de estoque
            </Typography>
          </div>
        </div>
        <div className={styles.menuItems}>
          <div>
              <p className="menuTitle">MENU</p>
            <Link to="/dashboard" className={styles.menuItem}>
              <RiDashboardFill />
              Dashboard
            </Link>
          </div>
          <Link to="/itens" className={styles.menuItem}>  
            <div className={styles.menuItemIcon}>
              <FiBox />
              Itens
            </div>
          </Link>
          <Link to="/pedidos" className={styles.menuItem}>
            <div className={styles.menuItemIcon}>
              <TiClipboard />
              Pedidos de compra
            </div>
          </Link>
          <Link to="/saidas" className={styles.menuItem}>
            <div className={styles.menuItemIcon}>
              <BsBoxArrowDown />
              Saídas
            </div>
          </Link>
          <Link to="/entradas" className={styles.menuItem}>
            <div className={styles.menuItemIcon}>
              <BsBoxArrowInUp />
              Entradas
            </div>
          </Link>
        </div>
      </section>
      <section className={styles.footer}>
        <p className='menuTitle' style={{ fontWeight: 'bold' }}>Central de Ajuda</p>
        <hr />
        <div className={styles.menuHeader}>
          <Avatar sx={{ bgcolor: 'blue[500]' }}>B</Avatar>
          <div className={styles.footeText}>
            <p style={{fontSize: '0.900rem', margin: '0' }}>Nome do Usuário</p>
            <p style={{ fontSize: '0.750rem', color: 'var(--primary-text-color)' }}>função</p>
          </div>
          <span className={styles.moreButton}>
            <MoreButton options={["Configurações", "Sair"]} click={[]} />
          </span>
        </div>
      </section>
    </aside>
  );
}