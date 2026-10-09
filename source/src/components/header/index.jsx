import styles from "./header.module.css"

/**
 * Props:
 * - title: título da página (ex.: "Itens")
 * - subtitle: texto de apoio abaixo do título
 * - children: ações do lado direito (botões)
 */
export function PageHeader({ title, subtitle, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.h1}>
        <h1>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
}

export default PageHeader;