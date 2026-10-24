import styles from "./estadoVazio.module.css";
import { Link } from "react-router";

/**
 * Props:
 * - titulo:      mensagem principal (ex.: "Você ainda não criou nenhuma unidade")
 * - descricao:   texto menor opcional
 * - textoBotao:  texto do botão de ação (opcional)
 * - onClick:     função chamada ao clicar no botão
 */
export default function EstadoVazio({ titulo, descricao, textoBotao }) {
  return (
    <div className={styles.vazio}>
      <h3 className={styles.titulo}>{titulo}</h3>
      {descricao && <p className={styles.descricao}>{descricao}</p>}
      {textoBotao && (
        <Link to="/form/unidade" className={styles.botao}>
          {textoBotao}
        </Link>
      )}
    </div>
  );
}
