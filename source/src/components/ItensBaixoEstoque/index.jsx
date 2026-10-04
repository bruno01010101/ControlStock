import styles from './itensBaixoEstoque.module.css';
import { MdOutlineDangerous } from "react-icons/md";

export default function ItensBaixoEstoque({quantidade}) {
    return(
        <div className={styles.itensBaixoEstoque}>
            <div className={styles.titulo}>
                <div className={styles.icone}>
                    <MdOutlineDangerous size={30} />
                    <p className={styles.text}>Itens com baixo estoque</p>
                </div>
                <p className={styles.paragrafo}>Precisam de reposição</p>
            </div>
            <h2 className={styles.quantidade}>
                <span className={styles.circle}></span>{quantidade}
            </h2>
        </div>
    )
}
