import styles from "./Pagination.module.css";

const VISIBLE_BUTTONS = 3;

/**
 * Props:
 * - page: página atual (começa em 1)
 * - totalPages: total de páginas
 * - onPageChange: (page) => void, chamado com a nova página ao clicar
 */
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Janela de até 3 botões, centralizada na página atual
  const count = Math.min(VISIBLE_BUTTONS, totalPages);
  const start = Math.min(
    Math.max(page - Math.floor(count / 2), 1),
    totalPages - count + 1
  );
  const pages = Array.from({ length: count }, (_, i) => start + i);

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className={styles["pagination-wrapper"]}>
      <p className={styles["pagination__info"]}>
        Mostrando página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </p>

      <nav className={styles["pagination"]} aria-label="Paginação">
        {hasPrev && (
          <button
            type="button"
            className={`${styles["pagination__btn"]} ${styles["pagination__arrow"]}`}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            ‹
          </button>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`${styles["pagination__btn"]} ${
              p === page ? styles["pagination__btn--active"] : ""
            }`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        {hasNext && (
          <button
            type="button"
            className={`${styles["pagination__btn"]} ${styles["pagination__arrow"]}`}
            onClick={() => onPageChange(page + 1)}
            aria-label="Próxima página"
          >
            ›
          </button>
        )}
      </nav>
    </div>
  );
}

export default Pagination;
