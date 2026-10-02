import styles from './aside.module.css';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';
import { RiDashboardFill } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { BsBoxArrowDown,BsBoxArrowInUp  } from "react-icons/bs";
import { TiClipboard } from "react-icons/ti";

export default function Aside() {
  return (
    <aside className={styles.aside}>
      <section className={styles.menu}>
        <div className={styles.menuHeader}>
          <img src="/favicon.svg" alt="ControlStock Logo" className={styles.logo} />
          <div>
            <Typography variant="h5" component="h1">
              Control Stock
            </Typography>
            <Typography variant="subtitle1" component="p" color="textSecondary">
              Gestão de estoque
            </Typography>
          </div>
        </div>
        <div className={styles.menuItems}>
          <div>
              <p className={styles.menuTitle}>MENU</p>
            <Link to="/entrada" className={styles.menuItem}>
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

      </section>
    </aside>
  );
}