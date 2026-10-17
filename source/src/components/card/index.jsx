import { Children } from "react";
import styles from "./Tabela.module.css";

function Tabela({ colunas, children }) {
  return (
    <section
      className={styles.tabela}
      style={colunas ? { "--colunas": colunas } : undefined}
    >
      {children}
    </section>
  );
}

// acao: qualquer elemento no canto superior direito (ex.: ícone)
// filtrosAbaixo: coloca os filtros embaixo do título, ocupando a largura toda
function Cabecalho({ titulo, subtitulo, acao, filtrosAbaixo = false, children }) {
  return (
    <div className={`${styles.cabecalho} ${filtrosAbaixo ? styles.empilhado : ""}`}>
      <div className={styles.topo}>
        <div>
          <h2 className={styles.titulo}>{titulo}</h2>
          {subtitulo && <p className="menuTitle">{subtitulo}</p>}
        </div>
        {acao}
      </div>
      {children && <div className={styles.filtros}>{children}</div>}
    </div>
  );
}

function Colunas({ nomes, caixaAlta = false }) {
  return (
    <div
      className={`${styles.linha} ${styles.colunas} ${caixaAlta ? styles.caixaAlta : ""}`}
    >
      {nomes.map((nome) => (
        <p key={nome}>{nome}</p>
      ))}
    </div>
  );
}

function Corpo({ vazio = "Nenhum item encontrado", children }) {
  if (Children.toArray(children).length === 0) {
    return <p className={styles.vazio}>{vazio}</p>;
  }
  return <>{children}</>;
}

function Linha({ acao, children }) {
  return (
    <div className={styles.linha}>
      {children}
      {acao && <div className={styles.acao}>{acao}</div>}
    </div>
  );
}

// Botão da canetinha. Use dentro da prop `acao` de Tabela.Linha.
function Editar({ onClick, rotulo = "Editar" }) {
  return (
    <button
      type="button"
      className={styles.editar}
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    </button>
  );
}

// resumo: texto à esquerda (ex.: "Mostrando 1–6 de 24"); children: a paginação
function Paginacao({ resumo, children }) {
  return (
    <div className={`${styles.paginacao} ${resumo ? styles.comResumo : ""}`}>
      {resumo && <span className={styles.resumo}>{resumo}</span>}
      {children}
    </div>
  );
}

Tabela.Cabecalho = Cabecalho;
Tabela.Colunas = Colunas;
Tabela.Corpo = Corpo;
Tabela.Linha = Linha;
Tabela.Editar = Editar;
Tabela.Paginacao = Paginacao;

export default Tabela;
