import Aside from '../Aside';
import styles from './main.module.css';
import {Outlet} from 'react-router';

export default function Main() {
  return (
    <div className={styles.main}>
      <div className={styles.aside}>
        <Aside />
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
